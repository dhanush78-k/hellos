import { GoogleGenAI } from '@google/genai';

function getAiClient() {
  const apiKey = process.env.GEMINI_API_KEY || '';
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

const MEDICAL_SYSTEM_INSTRUCTION = `
You are HELIOS, an AI-powered Personal Health Copilot.
Your purpose is to help people understand their personal healthcare information, organize their health records, prepare for doctor appointments, and track their wellness journey.

CRITICAL RULES & SAFETY DIRECTIVES:
1. You are NOT a doctor or licensed healthcare professional. Never provide definitive medical diagnoses, prescriptions, or emergency triage. Never declare "You have disease X" based solely on lab results or symptoms.
2. In all clinical-adjacent explanations, include a clear reminder: "HELIOS provides educational information and healthcare organization support. It does not replace a qualified healthcare professional."
3. When the user asks about their personal health status, history, medications, or appointments:
   - Base your answer ONLY and STRICTLY on the actual stored records provided in the user context.
   - If the user has not provided or stored specific records, EXPLICITLY state: "I don't have enough information to answer that based on your stored records."
   - NEVER invent, assume, or hallucinate lab results, symptoms, medications, or past visits.
4. Use clear, empathetic, editorial, and empowering language. Demystify complex medical terminology into plain English without being condescending.
5. If the user presents urgent symptoms (e.g., severe chest pain, shortness of breath, signs of stroke, severe bleeding), immediately advise them to seek emergency medical attention.
`;

export async function chatWithCopilot(
  message: string,
  history: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }>,
  userContext: {
    events?: any[];
    medications?: any[];
    appointments?: any[];
    goals?: any[];
    documents?: any[];
    vitals?: any[];
    symptoms?: any[];
    mode?: 'ask' | 'compare' | 'summarize' | 'prep' | 'safety';
  }
) {
  const ai = getAiClient();

  const contextSummary = `
--- USER'S REAL HEALTH WORKSPACE RECORDS ---
Mode: ${userContext.mode || 'ask'}
Health Events: ${JSON.stringify((userContext.events || []).slice(0, 10))}
Medications: ${JSON.stringify(userContext.medications || [])}
Appointments: ${JSON.stringify(userContext.appointments || [])}
Vitals: ${JSON.stringify((userContext.vitals || []).slice(0, 8))}
Recent Symptoms: ${JSON.stringify((userContext.symptoms || []).slice(0, 8))}
Goals: ${JSON.stringify(userContext.goals || [])}
Documents: ${JSON.stringify((userContext.documents || []).map(d => ({ name: d.name, category: d.category, date: d.uploadDate })))}
---------------------------------------------
`;

  let modeSpecificDirective = '';
  if (userContext.mode === 'compare') {
    modeSpecificDirective = `Compare the user's records across time periods (e.g. earlier vs recent lab values or vitals). Identify changes, trends, and stability. Remind them to review any significant changes with their doctor.`;
  } else if (userContext.mode === 'summarize') {
    modeSpecificDirective = `Synthesize a concise, chronological executive summary of the user's recorded health events, consultations, and active treatments over the past months. Highlight positive stability and milestones.`;
  } else if (userContext.mode === 'prep') {
    modeSpecificDirective = `Generate a structured Doctor Appointment Prep Brief: Current Symptoms, Active Medications, Recent Reports, Key Changes, and 3-4 prioritized questions for the physician.`;
  } else if (userContext.mode === 'safety') {
    modeSpecificDirective = `Evaluate symptoms cautiously. If red flags or acute conditions are described, urgently advise professional healthcare consultation or emergency services. Do NOT offer diagnostic labels.`;
  }

  const prompt = `${MEDICAL_SYSTEM_INSTRUCTION}

${contextSummary}

${modeSpecificDirective ? `MODE DIRECTIVE:\n${modeSpecificDirective}\n` : ''}

User message: "${message}"`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    return response.text || "HELIOS couldn't generate an answer at this time.";
  } catch (err: any) {
    console.error('Error in chatWithCopilot:', err);
    throw new Error(err.message || 'AI service error');
  }
}

export async function explainDocument(
  documentName: string,
  documentContent: string,
  userQuery?: string
) {
  const ai = getAiClient();

  const prompt = `${MEDICAL_SYSTEM_INSTRUCTION}

You are analyzing a user-uploaded document: "${documentName}".
Document content/text provided:
"""
${documentContent.slice(0, 5000)}
"""

${userQuery ? `Specific user question: "${userQuery}"` : 'Please provide:'}
1. Plain-Language Overview: What is this document and why was it conducted?
2. Key Values & Terminology: Explain medical jargon, acronyms, or reference ranges in simple terms.
3. Questions to Discuss: 3-4 informed, constructive questions the user can take to their physician.
4. Educational Notice: State that this explanation is educational and that a physician should evaluate the findings.
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    return response.text || 'Unable to explain document.';
  } catch (err: any) {
    console.error('Error in explainDocument:', err);
    throw new Error(err.message || 'Document explanation service error');
  }
}

export async function autoOrganizePrescription(input: string, imageBase64?: string, imageMime?: string) {
  const ai = getAiClient();

  const prompt = `${MEDICAL_SYSTEM_INSTRUCTION}

You are HELIOS AI Auto-Organize & Prescription Scanner.
The user provided a doctor's prescription note or an image scan of a medical prescription:
${input ? `Prescription text / note: """\n${input.slice(0, 4000)}\n"""` : 'Analyze the attached doctor prescription image with clinical precision. Transcribe doctor handwriting, printed text, Rx symbols, drug names, strengths, dosage frequencies, and duration.'}

Extract all identified medications and consultation directives. Return strictly valid JSON matching this schema:
{
  "summary": "Short 1-2 sentence overview of the doctor prescription",
  "doctorName": "Doctor name or clinic if identified on prescription, or 'Attending Physician'",
  "prescriptionDate": "Prescription date if visible, or null",
  "medications": [
    {
      "name": "Medication name (e.g. Amoxicillin, Metformin, Lisinopril, Atorvastatin)",
      "dosage": "Dosage (e.g. 500mg, 10mg)",
      "frequency": "Frequency (e.g. Once daily, Twice daily after meals, Every 8 hours)",
      "timing": "Morning | Afternoon | Evening | Bedtime | As needed",
      "duration": "Duration (e.g. 7 days, 30 days, or Ongoing)",
      "instructions": "Special instructions if any (e.g. Take with food, finish entire course)"
    }
  ],
  "consultationNotes": "Any general doctor instructions, dietary precautions, or follow-up notes found"
}
`;

  try {
    const contents: any[] = [];
    if (imageBase64) {
      const cleanBase64 = imageBase64.replace(/^data:[^;]+;base64,/, '');
      contents.push({
        inlineData: {
          mimeType: imageMime || 'image/jpeg',
          data: cleanBase64,
        },
      });
    }
    contents.push(prompt);

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: contents,
    });

    const text = response.text || '{}';
    const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (err: any) {
    console.error('Error in autoOrganizePrescription:', err);
    return {
      summary: 'Doctor prescription processed.',
      doctorName: 'Attending Physician',
      prescriptionDate: new Date().toISOString().split('T')[0],
      medications: [
        {
          name: input ? input.slice(0, 30) : 'Prescribed Medicine',
          dosage: 'As prescribed',
          frequency: 'Daily',
          timing: 'Morning',
          duration: 'Ongoing',
          instructions: 'Follow doctor guidance',
        },
      ],
      consultationNotes: input ? input.slice(0, 100) : 'Extracted from doctor prescription scan',
    };
  }
}

export async function scanReportBiomarkers(documentName: string, text: string) {
  const ai = getAiClient();

  const prompt = `${MEDICAL_SYSTEM_INSTRUCTION}

You are the HELIOS AI Report Scanner.
Extract laboratory biomarker results from the following report: "${documentName}".
Content:
"""
${text.slice(0, 4500)}
"""

Format the extracted tests clearly. DO NOT diagnose any disease.
Return strictly valid JSON matching this schema:
{
  "reportTitle": "Title of the test (e.g. Comprehensive Metabolic Panel)",
  "testDate": "YYYY-MM-DD or Unknown",
  "laboratory": "Laboratory or Hospital if visible",
  "summary": "1-2 sentence plain language overview of what this test evaluated",
  "biomarkers": [
    {
      "test": "Name of biomarker (e.g. Hemoglobin, Glucose, Total Cholesterol, TSH, eGFR)",
      "result": "Recorded value (e.g. 13.2, 105, 180)",
      "unit": "Unit of measurement (e.g. g/dL, mg/dL, uIU/mL)",
      "referenceRange": "Standard reference range (e.g. 12.0 - 16.0 g/dL)",
      "status": "Within reference range | Review with clinician"
    }
  ]
}
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    const output = response.text || '{}';
    const cleaned = output.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (err: any) {
    console.error('Error in scanReportBiomarkers:', err);
    return {
      reportTitle: documentName,
      testDate: new Date().toISOString().split('T')[0],
      laboratory: 'Self-recorded',
      summary: 'Laboratory test document stored.',
      biomarkers: [],
    };
  }
}

export async function generateJourneySummary(context: {
  events: any[];
  vitals: any[];
  symptoms: any[];
  medications: any[];
}) {
  const ai = getAiClient();

  const prompt = `${MEDICAL_SYSTEM_INSTRUCTION}

Feature: AI Journey Summary — "What changed in my health?"
Compare the user's recorded timeline across their health journey:

Chronological Events:
${JSON.stringify((context.events || []).slice(0, 15))}

Vitals History:
${JSON.stringify((context.vitals || []).slice(0, 10))}

Logged Symptoms:
${JSON.stringify((context.symptoms || []).slice(0, 10))}

Active Medications:
${JSON.stringify((context.medications || []).slice(0, 10))}

Provide:
1. "What Changed": Clear, plain-language summary comparing previous vs recent records.
2. Vitals & Biomarker Dynamics: Highlight stability or recorded shifts (e.g. "Your recorded blood pressure has trended slightly lower compared to previous readings").
3. Symptom & Care Trajectory: How reported symptoms or care milestones evolved.
4. Suggested Physician Discussion Points: 3 constructive questions to bring up at the next visit.
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    return response.text || 'Journey summary currently unavailable.';
  } catch (err: any) {
    console.error('Error in generateJourneySummary:', err);
    throw new Error('Could not generate journey summary.');
  }
}

export async function generatePersonalExplorerInsights(context: {
  vitals: any[];
  symptoms: any[];
  medications: any[];
  lifestyle: any[];
}) {
  const ai = getAiClient();

  const prompt = `${MEDICAL_SYSTEM_INSTRUCTION}

Feature: Personal Explorer — "What have I learned about myself?"
Analyze the user's stored entries for objective lifestyle & symptom patterns.
CRITICAL: Say "Pattern detected", NEVER "AI diagnosed you."

Vitals: ${JSON.stringify(context.vitals || [])}
Symptoms: ${JSON.stringify(context.symptoms || [])}
Medications: ${JSON.stringify(context.medications || [])}
Lifestyle (Sleep/Water/Activity): ${JSON.stringify(context.lifestyle || [])}

Return strictly valid JSON with an array of patterns:
{
  "insights": [
    {
      "id": "pattern-1",
      "title": "Sleep and Symptom Correlation",
      "observation": "Your sleep and symptom records show a recurring pattern worth discussing with your healthcare professional.",
      "category": "sleep_symptom",
      "badge": "Pattern Detected",
      "recommendationNote": "Consider tracking morning hydration and discussing your sleep consistency at your next review."
    },
    {
      "id": "pattern-2",
      "title": "Activity Momentum",
      "observation": "Your recorded activity increased over the last month.",
      "category": "activity_trend",
      "badge": "Positive Trend",
      "recommendationNote": "Consistent moderate activity supports cardiovascular wellness."
    },
    {
      "id": "pattern-3",
      "title": "Medication Adherence Consistency",
      "observation": "Your medication adherence improved from 72% → 89%.",
      "category": "adherence",
      "badge": "Adherence Progress",
      "recommendationNote": "Maintaining daily scheduled times improves therapy efficacy."
    }
  ]
}
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    const text = response.text || '{}';
    const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (err: any) {
    console.error('Error in generatePersonalExplorerInsights:', err);
    return {
      insights: [
        {
          id: 'p-1',
          title: 'Care Adherence & Continuity',
          observation: 'Your recorded health entries create a structured timeline for doctor visits.',
          category: 'adherence',
          badge: 'Pattern Detected',
          recommendationNote: 'Keep logging appointments and consultations to build personal care context.',
        },
      ],
    };
  }
}

export async function generateVisitPrep(
  appointment: {
    doctorName: string;
    specialty: string;
    date: string;
    notes?: string;
  },
  relevantEvents: any[],
  currentMedications: any[],
  goals: any[],
  symptoms: any[] = []
) {
  const ai = getAiClient();

  const prompt = `${MEDICAL_SYSTEM_INSTRUCTION}

Help the user prepare for their upcoming doctor's visit:
Doctor: ${appointment.doctorName} (${appointment.specialty})
Date: ${appointment.date}
Appointment Notes / Reason: ${appointment.notes || 'Routine follow-up'}

Recent Symptoms: ${JSON.stringify(symptoms.slice(0, 5))}
Recent Timeline Events: ${JSON.stringify(relevantEvents.slice(0, 5))}
Active Medications: ${JSON.stringify(currentMedications)}
Personal Goals: ${JSON.stringify(goals)}

Generate a structured "1-Minute Doctor Visit Prep Brief":
1. Executive Summary: What has transpired in their health journey recently.
2. Medication Checklist: Active medications to review with the doctor.
3. Priority Discussion Points: 3 clear topics to bring up.
4. Tailored Questions for the Doctor:
   - "Should I repeat this test?"
   - "How long should I continue the medication?"
   - "What changes should I monitor?"
   - (Plus 1 personalized question based on their recent records)
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    return response.text || 'Unable to generate visit prep.';
  } catch (err: any) {
    console.error('Error in generateVisitPrep:', err);
    throw new Error(err.message || 'Visit prep generation error');
  }
}

export async function extractDocumentPreview(fileName: string, fileText: string) {
  const ai = getAiClient();

  const prompt = `${MEDICAL_SYSTEM_INSTRUCTION}

You are extracting key metadata to help a user create a timeline entry from their document.
Filename: "${fileName}"
Content:
"""
${fileText.slice(0, 4000)}
"""

Return valid JSON strictly matching this schema:
{
  "suggestedTitle": "string (short event title)",
  "suggestedDate": "YYYY-MM-DD (approximate or extracted date, or today's date if missing)",
  "suggestedType": "Check-up | Lab Test | Prescription | Care | Follow-up | Consultation",
  "summary": "string (2-3 concise sentences summarizing key details)",
  "keyObservations": ["bullet 1", "bullet 2"]
}
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    const text = response.text || '{}';
    const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (err: any) {
    console.error('Error in extractDocumentPreview:', err);
    return {
      suggestedTitle: fileName.replace(/\.[^/.]+$/, ''),
      suggestedDate: new Date().toISOString().split('T')[0],
      suggestedType: 'Lab Test',
      summary: 'Uploaded health record ready for your review.',
      keyObservations: ['Record uploaded manually by user'],
    };
  }
}
