import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { apiRouter } from './routes/apiRoutes.js';

import os from 'os';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API Endpoints
app.use('/api/v1', apiRouter);

// Health probe
app.get('/api/health', (req, res) => {
  res.json({ status: 'HEALTHY', timestamp: new Date().toISOString(), system: 'Ekikrit Interoperability Hub' });
});

// Serve frontend static assets if built
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

app.use((req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      res.send(`
        <html>
          <body style="font-family: sans-serif; padding: 2rem; background: #f8fafc; color: #0f172a;">
            <h2>Ekikrit (एकीकृत) Middleware Hub Backend Running</h2>
            <p>API is active at <code>http://localhost:${PORT}/api/v1</code></p>
            <p>Start Vite dev frontend: <code>npm run dev</code> or build frontend with <code>npm run build</code>.</p>
          </body>
        </html>
      `);
    }
  });
});

app.listen(PORT, '0.0.0.0', () => {
  const nets = os.networkInterfaces();
  const networkIps = [];
  for (const n in nets) {
    for (const net of nets[n]) {
      if (net.family === 'IPv4' && !net.internal) {
        networkIps.push({ name: n, address: net.address });
      }
    }
  }

  console.log(`=======================================================`);
  console.log(`  EKIKRIT INTEROPERABILITY MIDDLEWARE HUB RUNNING`);
  console.log(`  Local:     http://localhost:${PORT}`);
  networkIps.forEach(net => {
    console.log(`  Mobile/LAN: http://${net.address}:${PORT} (${net.name})`);
  });
  console.log(`  API Base:  http://localhost:${PORT}/api/v1`);
  console.log(`=======================================================`);
});