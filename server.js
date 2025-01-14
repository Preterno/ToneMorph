import express from "express";
import multer from "multer";
import sharp from "sharp";
import ffmpeg from "fluent-ffmpeg";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { WebSocketServer } from "ws";
import { createServer } from "http";
import cors from "cors";
import dotenv from "dotenv";
import { createRequire } from "module";

dotenv.config();

const require = createRequire(import.meta.url);
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
ffmpeg.setFfmpegPath(ffmpegPath);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

const users = [
  {
    id: 1,
    email: process.env.EMAIL,
    password: process.env.PASSWORD,
  },
];

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

await fs.mkdir("uploads", { recursive: true });
await fs.mkdir("processed", { recursive: true });

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "video/mp4",
      "video/quicktime",
    ];
    if (allowedTypes.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Invalid file type"));
  },
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

app.post("/api/register", async (req, res) => {
  const userCheck = users.find((u) => u.email === req.body.email);
  if (userCheck) return res.status(400).json({ error: "User already exists" });
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = {
      id: users.length + 1,
      email: req.body.email,
      password: hashedPassword,
    };
    users.push(user);
    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/verifyToken", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(400).json({ isValid: false });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(400).json({ isValid: false });
    }
    return res.status(200).json({ isValid: true });
  });
});

app.post("/api/login", async (req, res) => {
  const user = users.find((u) => u.email === req.body.email);
  if (!user) return res.status(400).json({ error: "User not found" });

  try {
    const isValid = await bcrypt.compare(req.body.password, user.password);
    if (isValid) {
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
      res.json({ accessToken: token });
    } else {
      res.status(400).json({ error: "Invalid password" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post(
  "/api/process-image",
  authenticateToken,
  upload.single("file"),
  async (req, res) => {
    try {
      const { brightness = 1, sharpness = 1, contrast = 1.5 } = req.query;

      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      let processedImageBuffer;
      try {
        const brightnessValue = parseFloat(brightness);
        const sharpnessValue = parseFloat(sharpness);
        const contrastValue = parseFloat(contrast);

        const image = sharp(req.file.path)
          .grayscale()
          .modulate({ brightness: brightnessValue })
          .sharpen(sharpnessValue)
          .gamma(contrastValue);

        processedImageBuffer = await image.toBuffer();
      } catch (processError) {
        console.error("Error during image processing:", processError);
        throw processError;
      }

      res.set("Content-Type", "image/jpeg");
      res.send(processedImageBuffer);

      if (req.file?.path) {
        try {
          await fs.unlink(req.file.path);
          console.log("File deleted successfully");
        } catch (deleteError) {
          console.error("Error deleting file:", deleteError);
        }
      }
    } catch (error) {
      console.error("Error processing image:", error);
      if (req.file?.path) {
        try {
          await fs.unlink(req.file.path);
        } catch (deleteError) {
          console.error(
            "Error deleting file during error handling:",
            deleteError
          );
        }
      }
      res.status(500).json({ error: error.message });
    }
  }
);

app.post(
  "/api/process-video",
  authenticateToken,
  upload.single("file"),
  async (req, res) => {
    const outputPath = path.join("processed", `${Date.now()}.mp4`);

    try {
      await fs.mkdir("processed", { recursive: true });

      ffmpeg(req.file.path)
        .videoFilter("colorchannelmixer=.3:.4:.3:0:.3:.4:.3:0:.3:.4:.3")
        .outputOptions([
          "-c:v libx264",
          "-preset fast",
          "-pix_fmt yuv420p",
          "-movflags +faststart",
        ])
        .on("end", async () => {
          res.download(outputPath, async () => {
            await fs.unlink(req.file.path);
            await fs.unlink(outputPath);
          });
        })
        .on("error", async (err) => {
          await fs.unlink(req.file.path).catch(() => {});
          res.status(500).json({ error: err.message });
        })
        .save(outputPath);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

wss.on("connection", (ws) => {
  let ffmpegProcess = null;

  ws.on("message", (data) => {
    if (!ffmpegProcess) {
      ffmpegProcess = ffmpeg()
        .input("pipe:0")
        .videoFilter("colorchannelmixer=.3:.4:.3:0:.3:.4:.3:0:.3:.4:.3")
        .format("mp4")
        .pipe(ws);
    }

    ffmpegProcess.stdin.write(data);
  });

  ws.on("close", () => {
    ffmpegProcess?.stdin.end();
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
