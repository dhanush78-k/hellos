import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'HELIOS API' });
});

// AI endpoints
app.post('/api/ai/copilot', handleCopilotChat);
app.post('/api/ai/explain-document', handleExplainDocument);
app.post('/api/ai/visit-prep', handleVisitPrep);
app.post('/api/ai/extract-preview', handleExtractPreview);
app.post('/api/ai/auto-organize-prescription', handleAutoOrganizePrescription);
app.post('/api/ai/scan-report-biomarkers', handleScanReportBiomarkers);
app.post('/api/ai/journey-summary', handleJourneySummary);
app.post('/api/ai/personal-insights', handlePersonalInsights);

// Serve static frontend in production
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`HELIOS production server listening on port ${PORT}`);
});
