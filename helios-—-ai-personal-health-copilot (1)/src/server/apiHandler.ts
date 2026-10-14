import type { Request, Response } from 'express';
import {
  chatWithCopilot,
  explainDocument,
  generateVisitPrep,
  extractDocumentPreview,
  autoOrganizePrescription,
  scanReportBiomarkers,
  generateJourneySummary,
  generatePersonalExplorerInsights,
} from './geminiService';

export async function handleCopilotChat(req: Request, res: Response) {
  try {
    const { message, history = [], userContext = {} } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    const reply = await chatWithCopilot(message, history, userContext);
    return res.json({ reply });
  } catch (error: any) {
    console.error('API Error in /api/ai/copilot:', error);
    return res.status(500).json({
      error: 'HELIOS could not complete that explanation right now. Your saved information is still safe.',
      details: error.message,
    });
  }
}

export async function handleExplainDocument(req: Request, res: Response) {
  try {
    const { documentName, documentContent, userQuery } = req.body;
    if (!documentName || !documentContent) {
      return res.status(400).json({ error: 'Document name and content are required' });
    }
    const explanation = await explainDocument(documentName, documentContent, userQuery);
    return res.json({ explanation });
  } catch (error: any) {
    console.error('API Error in /api/ai/explain-document:', error);
    return res.status(500).json({
      error: 'HELIOS could not complete document analysis.',
      details: error.message,
    });
  }
}

export async function handleVisitPrep(req: Request, res: Response) {
  try {
    const { appointment, relevantEvents = [], currentMedications = [], goals = [], symptoms = [] } = req.body;
    if (!appointment || !appointment.doctorName) {
      return res.status(400).json({ error: 'Appointment details required' });
    }
    const prep = await generateVisitPrep(
      appointment,
      relevantEvents,
      currentMedications,
      goals,
      symptoms
    );
    return res.json({ prep });
  } catch (error: any) {
    console.error('API Error in /api/ai/visit-prep:', error);
    return res.status(500).json({
      error: 'HELIOS could not generate visit prep at this time.',
      details: error.message,
    });
  }
}

export async function handleExtractPreview(req: Request, res: Response) {
  try {
    const { fileName, fileText } = req.body;
    if (!fileName || !fileText) {
      return res.status(400).json({ error: 'fileName and fileText required' });
    }
    const extracted = await extractDocumentPreview(fileName, fileText);
    return res.json({ extracted });
  } catch (error: any) {
    console.error('API Error in /api/ai/extract-preview:', error);
    return res.status(500).json({
      error: 'Failed to extract preview.',
      details: error.message,
    });
  }
}

export async function handleAutoOrganizePrescription(req: Request, res: Response) {
  try {
    const { input = '', imageBase64, imageMime } = req.body;
    if (!input && !imageBase64) {
      return res.status(400).json({ error: 'Input text or prescription scan required' });
    }
    const organized = await autoOrganizePrescription(input, imageBase64, imageMime);
    return res.json({ organized });
  } catch (error: any) {
    console.error('API Error in /api/ai/auto-organize-prescription:', error);
    return res.status(500).json({
      error: 'Could not auto-organize prescription.',
      details: error.message,
    });
  }
}

export async function handleScanReportBiomarkers(req: Request, res: Response) {
  try {
    const { documentName, text } = req.body;
    if (!documentName || !text) {
      return res.status(400).json({ error: 'Document name and text required' });
    }
    const scanned = await scanReportBiomarkers(documentName, text);
    return res.json({ scanned });
  } catch (error: any) {
    console.error('API Error in /api/ai/scan-report-biomarkers:', error);
    return res.status(500).json({
      error: 'Could not scan report biomarkers.',
      details: error.message,
    });
  }
}

export async function handleJourneySummary(req: Request, res: Response) {
  try {
    const { context } = req.body;
    const summary = await generateJourneySummary(context || {});
    return res.json({ summary });
  } catch (error: any) {
    console.error('API Error in /api/ai/journey-summary:', error);
    return res.status(500).json({
      error: 'Could not generate journey summary.',
      details: error.message,
    });
  }
}

export async function handlePersonalInsights(req: Request, res: Response) {
  try {
    const { context } = req.body;
    const insights = await generatePersonalExplorerInsights(context || {});
    return res.json({ insights });
  } catch (error: any) {
    console.error('API Error in /api/ai/personal-insights:', error);
    return res.status(500).json({
      error: 'Could not generate personal insights.',
      details: error.message,
    });
  }
}
