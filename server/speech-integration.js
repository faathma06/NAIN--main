import "dotenv/config";
import express from "express";
import cors from "cors";
import multer from "multer";
import fs from "node:fs";
import { SarvamAIClient } from "sarvamai";

const app = express();
const PORT = 8788;

app.use(cors());
app.use(express.json({ limit: "1mb" }));

const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 15 * 1024 * 1024 }
});

const client = new SarvamAIClient({
  apiSubscriptionKey: process.env.SARVAM_API_KEY
});

// Sarvam Speech-to-Text
app.post("/api/speech/transcribe", upload.single("audio"), async (req, res) => {
  try {
    if (!process.env.SARVAM_API_KEY) {
      return res.status(500).json({ error: "SARVAM_API_KEY is missing." });
    }

    if (!req.file) {
      return res.status(400).json({ error: "Please upload an audio file." });
    }

    const result = await client.speechToText.transcribe({
      file: fs.createReadStream(req.file.path),
      model: "saaras:v3",
      mode: "transcribe"
    });

    res.json({ transcript: result.transcript });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (req.file) {
      fs.promises.unlink(req.file.path).catch(() => {});
    }
  }
});

// Sarvam Text-to-Speech
app.post("/api/speech/speak", async (req, res) => {
  try {
    if (!process.env.SARVAM_API_KEY) {
      return res.status(500).json({ error: "SARVAM_API_KEY is missing." });
    }

    const { text } = req.body || {};

    if (!text || typeof text !== "string" || !text.trim()) {
      return res.status(400).json({ error: "Please provide text." });
    }

    const result = await client.textToSpeech.convert({
      text: text.trim(),
      model: "bulbul:v3",
      language_code: "en-IN",
      speaker: "shubh"
    });

    res.json({ audioBase64: result.audios[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Speech API running at http://localhost:${PORT}`);
});