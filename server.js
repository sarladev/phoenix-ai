import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import fs from "fs";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

app.use(cors());
app.use(express.json({ limit: "20mb" }));
app.use(express.static("public"));

const USERS_FILE = "./users.json";

function readUsers() {
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, "[]");
  }

  const data = fs.readFileSync(USERS_FILE, "utf8");

  if (!data.trim()) {
    return [];
  }

  return JSON.parse(data);
}

function saveUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

function auth(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Login required" });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Invalid login" });
  }
}

app.post("/api/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const users = readUsers();

    if (users.find(user => user.email === email)) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    users.push({
      name,
      email,
      password: hashedPassword,
      createdAt: new Date().toISOString()
    });

    saveUsers(users);

    res.json({ message: "Account created successfully. Now login." });
  } catch {
    res.status(500).json({ error: "Registration failed" });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const users = readUsers();
    const user = users.find(user => user.email === email);

    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(400).json({ error: "Wrong password" });
    }

    const token = jwt.sign(
      {
        name: user.name,
        email: user.email
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      name: user.name,
      message: "Login successful"
    });
  } catch {
    res.status(500).json({ error: "Login failed" });
  }
});

app.post("/api/chat", auth, upload.single("photo"), async (req, res) => {
  try {
    const question = req.body.question || "";

    const promptText = `
You are Phoenix AI, a professional ChatGPT-like AI assistant.

Rules:
1. Answer clearly and helpfully.
2. If the user asks in Hindi/Hinglish, answer in Hindi/Hinglish.
3. If the user asks in English, answer in English.
4. Keep answers practical and simple.
5. If image is uploaded, analyze the image carefully.
6. Do not mention API, backend, Gemini, or internal system unless user asks.

User question:
${question}
`;

    const contents = [];

    if (req.file) {
      const base64Image = req.file.buffer.toString("base64");

      contents.push({
        inlineData: {
          mimeType: req.file.mimetype,
          data: base64Image
        }
      });
    }

    contents.push({
      text: promptText
    });

    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
      contents
    });

    res.json({
      answer: response.text || "No answer generated."
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "AI response failed. Check Gemini API key or Render logs."
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Phoenix AI Gemini running on port ${PORT}`);
});
