
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import axios from "axios";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // API Route to proxy media from URL
  app.get("/api/proxy-media", async (req, res) => {
    const { url } = req.query;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: "URL is required" });
    }

    try {
      const response = await axios.get(url, { responseType: 'arraybuffer' });
      const contentType = response.headers['content-type'] || '';
      
      if (!contentType.startsWith('image/') && !contentType.startsWith('video/')) {
        return res.status(400).json({ error: `Unsupported content type: ${contentType}. Please provide a direct link to an image or video file.` });
      }

      const base64 = Buffer.from(response.data, 'binary').toString('base64');
      res.json({ data: `data:${contentType};base64,${base64}`, mimeType: contentType });
    } catch (error: any) {
      console.error("Proxy error:", error.message);
      res.status(500).json({ error: "Failed to fetch media from URL" });
    }
  });

  // API Route to proxy text from URL
  app.get("/api/proxy-url", async (req, res) => {
    const { url } = req.query;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: "URL is required" });
    }

    try {
      const response = await axios.get(url);
      res.json({ content: response.data });
    } catch (error: any) {
      console.error("Proxy URL error:", error.message);
      res.status(500).json({ error: "Failed to fetch content from URL" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
