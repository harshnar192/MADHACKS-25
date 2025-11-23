import express from "express";
import cors from "cors";
import multer from "multer";
import { FishAudioClient } from "fish-audio";
import { writeFile } from "fs/promises";
import { spawn } from "child_process";
import dotenv from "dotenv";
dotenv.config();


const app = express(); 
const PORT = 3000; 

const fishAudio = new FishAudioClient({ apiKey: process.env.FISH_API_KEY });

app.use(express.json()); 

app.use(cors({
    origin: "http://localhost:5173"
}));

const upload = multer({
  storage: multer.memoryStorage()
});

app.get("/", (req, res) => {
    res.send("Server is running!"); 
}); 

function webmToMp3(buffer) {
  const ffmpeg = spawn("ffmpeg", [
    "-i", "pipe:0",
    "-f", "mp3",
    "-acodec", "libmp3lame",
    "-b:a", "128k",
    "pipe:1"
  ]);

  ffmpeg.stdin.write(buffer);
  ffmpeg.stdin.end();

  return ffmpeg.stdout; // this is a readable stream of MP3 data
}

app.post("/api/message", upload.single("audio") , async (req, res) => {
  console.log("🎧 Received audio in memory");
  const mp3Stream = webmToMp3(req.file.buffer);

    // req.file.buffer is a Node Buffer with the entire file in RAM
    // console.log("Size:", req.file.buffer.length, "bytes");
    // console.log("MIME:", req.file.mimetype);
    // console.log("Original name:", req.file.originalname);

    // file processing

    console.log(req.file); 

    const resp_fishAudio = await fishAudio.speechToText.convert({ 
      audio: mp3Stream
    });
    console.log(resp_fishAudio.text);


    res.json({
        status: "OK", 
        received: resp_fishAudio, 
        text: resp_fishAudio.text
    });
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});