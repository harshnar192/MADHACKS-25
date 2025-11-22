import { FishAudioClient } from "fish-audio";
import { writeFile } from "fs/promises";
import dotenv from "dotenv";
dotenv.config();

console.log(process.env.API_KEY);

const fishAudio = new FishAudioClient({ apiKey: process.env.FISH_API_KEY });

const audio = await fishAudio.textToSpeech.convert({
  text: "Hello, world!",
});

const buffer = Buffer.from(await new Response(audio).arrayBuffer());
await writeFile("welcome.mp3", buffer);

console.log("✓ Audio saved to welcome.mp3");