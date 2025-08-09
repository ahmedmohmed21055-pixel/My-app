import express from "express";
import cors from "cors";
import routes from "./routes.js";
import { serveStatic } from "./static.js";

const app = express();
const PORT = Number(process.env.PORT) || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// API routes
app.use(routes);

// Serve static files and handle client-side routing
serveStatic(app);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  console.log(`📱 Arabic Store Management System ready!`);
});