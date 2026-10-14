import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import dotenv from 'dotenv';
import express from 'express';
import {
  handleCopilotChat,
  handleExplainDocument,
  handleVisitPrep,
  handleExtractPreview,
  handleAutoOrganizePrescription,
  handleScanReportBiomarkers,
  handleJourneySummary,
  handlePersonalInsights,
} from './src/server/apiHandler';

dotenv.config();

function heliosApiPlugin() {
  return {
    name: 'helios-api-plugin',
    configureServer(server: any) {
      server.middlewares.use(express.json({ limit: '20mb' }));
      server.middlewares.use(async (req: any, res: any, next: any) => {
        if (!req.url?.startsWith('/api/')) {
          return next();
        }

        // Mock express-like res helpers
        res.json = (data: any) => {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(data));
        };
        res.status = (code: number) => {
          res.statusCode = code;
          return res;
        };

        if (req.url === '/api/health' && req.method === 'GET') {
          return res.json({ status: 'ok', service: 'HELIOS Dev API' });
        }

        if (req.method === 'POST') {
          if (req.url === '/api/ai/copilot') {
            return handleCopilotChat(req, res);
          }
          if (req.url === '/api/ai/explain-document') {
            return handleExplainDocument(req, res);
          }
          if (req.url === '/api/ai/visit-prep') {
            return handleVisitPrep(req, res);
          }
          if (req.url === '/api/ai/extract-preview') {
            return handleExtractPreview(req, res);
          }
          if (req.url === '/api/ai/auto-organize-prescription') {
            return handleAutoOrganizePrescription(req, res);
          }
          if (req.url === '/api/ai/scan-report-biomarkers') {
            return handleScanReportBiomarkers(req, res);
          }
          if (req.url === '/api/ai/journey-summary') {
            return handleJourneySummary(req, res);
          }
          if (req.url === '/api/ai/personal-insights') {
            return handlePersonalInsights(req, res);
          }
        }

        return next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), heliosApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
