import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import { createServer as createViteServer } from "vite";
import cors from "cors";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env.local") });
dotenv.config({ path: path.join(__dirname, ".env") });

import taskRoutes from "./routes/taskRoutes.js";
import subjectRoutes from "./routes/subjectRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import suggestionRoutes from "./routes/suggestionRoutes.js";
import pomodoroRoutes from "./routes/pomodoroRoutes.js";
import { getDB } from "./config/db.js";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(cors());
  app.use(express.json());

  // Auth Middleware
  app.use(async (req, res, next) => {
    if (req.path === '/api/users/sync' || req.path === '/api/health') return next();
    if (req.path.startsWith('/api/')) {
      const email = req.headers['x-user-email'];
      if (!email) {
        return res.status(401).json({ message: 'Unauthorized: Missing x-user-email header' });
      }
      try {
        const db = await getDB();
        if (!db) return res.status(500).json({ message: 'DB Error' });
        const [rows]: any = await db.execute('SELECT user_id FROM users WHERE email = ?', [email]);
        if (rows.length === 0) {
          return res.status(401).json({ message: 'Unauthorized: User not found' });
        }
        res.locals.userId = rows[0].user_id;
      } catch (err) {
        console.error('Auth error', err);
        return res.status(500).json({ message: 'Auth error' });
      }
    }
    next();
  });

  // API Routes
  app.use("/api/tasks", taskRoutes);
  app.use("/api/subjects", subjectRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/suggestions", suggestionRoutes);
  app.use("/api/pomodoro", pomodoroRoutes);

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Basic static serving for production
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\n🚀 StudySync Server Running!`);
    console.log(`🔗 Local Interface: http://localhost:${PORT}`);
    console.log(`📂 Backend Architecture: MVC`);
  });
}

startServer();
