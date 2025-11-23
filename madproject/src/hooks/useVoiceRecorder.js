import { useState, useRef, useEffect } from 'react';

export function useVoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerIntervalRef = useRef(null);
  const streamRef = useRef(null);
  const isRecordingRef = useRef(false); // Use ref to track recording state without closure issues

  // Request microphone permission and start recording
  const startRecording = async () => {
    try {
      setError(null);
      setAudioBlob(null);
      
      console.log('🎤 Starting recording...');
      
      // Clear any existing timer interval first
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      
      // Reset timer to 0 BEFORE starting
      setRecordingTime(0);
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      streamRef.current = stream;
      console.log('✅ Microphone access granted');
      
      // Detect supported MIME type
      let mimeType = 'audio/webm';
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus';
        console.log('✅ Using audio/webm;codecs=opus');
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4';
        console.log('✅ Using audio/mp4');
      } else if (MediaRecorder.isTypeSupported('audio/webm')) {
        mimeType = 'audio/webm';
        console.log('✅ Using audio/webm');
      } else {
        console.log('⚠️ Using default format');
      }

      // Reset chunks array
      audioChunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: mimeType
      });

      // Handle data availability - collect audio chunks
      mediaRecorder.ondataavailable = (event) => {
        console.log('📦 Data available event:', event.data.size, 'bytes');
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
          console.log('✅ Audio chunk added. Total chunks:', audioChunksRef.current.length);
        } else {
          console.warn('⚠️ Empty audio chunk received');
        }
      };

      // Handle when recording stops
      mediaRecorder.onstop = () => {
        console.log('🛑 MediaRecorder onstop called. Total chunks:', audioChunksRef.current.length);
        
        if (audioChunksRef.current.length > 0) {
          // Assume this mean successful 
          const finalBlob = new Blob(audioChunksRef.current, { type: mimeType });
          setAudioBlob(finalBlob);
          console.log('✅ Audio blob created:', finalBlob.size, 'bytes');
          console.log(finalBlob); 
          const formData = new FormData(); 
          formData.append("audio", finalBlob, "recording.webm"); 
          formData.append("duration", recordingTime.toString()); 
          for (const pair of formData.entries()) {
            console.log(pair[0], pair[1]);
          }
          fetch("http://localhost:3000/api/message", {
            method: "POST", 
            body: formData
          })
          .then((json) => {
            console.log(json.text); 
          })
        } else {
          console.error('❌ No audio chunks collected!');
          setError('No audio data was recorded. Please try again.');
        }
        
        // Stop all tracks to release microphone
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
      };

      mediaRecorder.onerror = (event) => {
        console.error('❌ MediaRecorder error:', event);
        setError('Recording error occurred. Please try again.');
        stopRecording();
      };

      // Store recorder reference
      mediaRecorderRef.current = mediaRecorder;
      
      // Start recording with timeslice to ensure data collection
      // timeslice of 100ms means we get data chunks every 100ms
      mediaRecorder.start(100);
      console.log('▶️ MediaRecorder started');
      
      // Set recording state
      isRecordingRef.current = true;
      setIsRecording(true);

      // Start timer - update every second
      timerIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => {
          const nextTime = prev + 1;
          console.log('⏱️ Timer tick:', nextTime, 'seconds');
          return nextTime;
        });
      }, 1000);
      
      console.log('✅ Recording started successfully');
      console.log('⏱️ Timer interval started');

    } catch (err) {
      console.error('❌ Error starting recording:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('Microphone access denied. Please allow microphone permissions and try again.');
      } else if (err.name === 'NotFoundError') {
        setError('No microphone found. Please connect a microphone and try again.');
      } else {
        setError(`Failed to access microphone: ${err.message}`);
      }
      
      isRecordingRef.current = false;
      setIsRecording(false);
      
      // Clear timer if it was started
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
  };

  // Stop recording
  const stopRecording = () => {
    console.log('🛑 stopRecording called. isRecordingRef:', isRecordingRef.current);
    
    // Use ref instead of state to avoid closure issues
    if (mediaRecorderRef.current && isRecordingRef.current) {
      console.log('🛑 Stopping recording...');
      
      // Stop the MediaRecorder first - this will trigger onstop
      if (mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
        console.log('✅ MediaRecorder.stop() called');
      }
      
      // Stop timer interval
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
        console.log('⏱️ Timer stopped. Final time:', recordingTime, 'seconds');
      }
      
      // Update state
      isRecordingRef.current = false;
      setIsRecording(false);
    } else {
      console.warn('⚠️ stopRecording called but not recording');
    }
  };

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Clear everything
  const clearRecording = () => {
    setAudioBlob(null);
    setError(null);
    setRecordingTime(0);
    console.log('🧹 Recording cleared');
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return {
    isRecording,
    audioBlob,
    recordingTime: formatTime(recordingTime),
    recordingTimeSeconds: recordingTime, // Raw seconds for display
    error,
    startRecording,
    stopRecording,
    clearRecording,
  };
}
