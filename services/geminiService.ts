
/**
 * @file geminiService.ts
 * This service module handles all interactions with the Google Gemini API.
 */

import { SchemaType } from '@google/generative-ai';
import { supabase } from '../lib/supabaseClient';
import type { ResumeData, SearchResult, GroundingSource, OutreachKit, ABTestResult, FitAnalysisResult, IntelligenceBriefing, MetricOpportunity, WorkExperience } from '../types';

declare const mammoth: any;

// --- Model Constants ---
const MODEL_PRO = 'gemini-3-pro-preview';       // Primary "heavy lifting" model
const MODEL_FLASH = 'gemini-3-flash-preview';   // Faster, concise tasks
const MODEL_AUDIO = 'gemini-2.5-flash-native-audio-preview-09-2025'; // Interview Simulator

const RESUME_OPTIMIZATION_RULES = `
CRITICAL OPTIMIZATION RULES:
1. PAGE LIMIT: If the content exceeds 3 pages, you MUST condense it to exactly 2–3 pages maximum.
2. LANGUAGE: Use simple, plain, human-readable language. STRICLY AVOID buzzwords, fancy jargon, or unnecessarily complex vocabulary.
3. IMPACT: Replace verbose or vague statements with clear, optimized wording.
4. CONTENT: Prioritize high-value achievements and measurable outcomes.
5. FORMATTING: STRICLY FORBIDDEN to use markdown symbols like asterisks (*) for bolding or bullet points. Use plain text only.
6. 30-SECOND SCANNABILITY: Use strong headings and concise bullets (1–2 lines max).
`;

export const sanitizeAIContent = (text: string): string => {
    return text
        .replace(/\*/g, '')
        .replace(/^(Choice|Option)\s*\d*[:\s]*/i, '')
        .trim();
};

const callGeminiAPI = async (modelName: string, contents: any, config?: any) => {
    try {
        console.log(`[GeminiService] Calling Proxy with model: ${modelName}`);

        // Construct the payload for the Edge Function
        // contents should be the array or object expected by generateContent
        // The proxy expects: { modelName, contents, config }

        // FIX: Ensure contents is in the format expected by the SDK
        // If it was passed as { parts: [...] }, extract parts
        let finalContents = contents;
        if (typeof contents === 'object' && contents !== null && 'parts' in contents && Array.isArray(contents.parts)) {
            finalContents = contents.parts;
        }

        const { data, error } = await supabase.functions.invoke('gemini-proxy', {
            body: {
                modelName,
                contents: finalContents,
                config
            }
        });

        if (error) {
            console.error("[GeminiService] Proxy Error:", error);
            throw new Error(error.message || "Failed to communicate with AI service.");
        }

        if (data.error) {
            throw new Error(data.error);
        }

        // The proxy returns { text, candidates, usageMetadata }
        return data;

    } catch (error: any) {
        console.error("[GeminiService] API Error:", error.message);
        throw new Error(error.message || "Failed to connect to AI service.");
    }
};

const fileToGenerativePart = async (file: File) => {
    const base64EncodedData = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(file);
    });
    return {
        inlineData: {
            data: base64EncodedData,
            mimeType: file.type,
        },
    };
};

const validateGeminiResponse = (response: any, context: string) => {
    if (!response || !response.text) {
        const finishReason = response?.candidates?.[0]?.finishReason;
        let errorMessage = `The AI returned an empty response while ${context}.`;
        if (finishReason === 'SAFETY') {
            errorMessage = `The request was blocked for safety reasons while ${context}.`;
        }
        throw new Error(errorMessage);
    }
};

export const parseResumeFromFile = async (file: File): Promise<Partial<ResumeData>> => {
    try {
        // Parsing is complex -> Use PRO
        const model = MODEL_PRO;
        let part: any;

        // Detection for Word documents (docx/doc)
        const isDoc = file.type.includes('word') ||
            file.type.includes('officedocument') ||
            file.name.toLowerCase().endsWith('.docx') ||
            file.name.toLowerCase().endsWith('.doc');

        if (isDoc) {
            console.log("[GeminiService] Word document detected. Extracting text via Mammoth...");
            try {
                const arrayBuffer = await file.arrayBuffer();
                const result = await mammoth.extractRawText({ arrayBuffer });
                part = { text: `EXTRACTED RESUME TEXT FOR ANALYSIS:\n\n${result.value}` };
                console.log("[GeminiService] Text extraction successful.");
            } catch (mammothError) {
                console.error("[GeminiService] Mammoth extraction failed, falling back to binary:", mammothError);
                part = await fileToGenerativePart(file);
            }
        } else {
            part = await fileToGenerativePart(file);
        }

        // Simplified schema - focus on speed, not perfection
        const responseSchema = {
            type: SchemaType.OBJECT,
            properties: {
                personalInfo: {
                    type: SchemaType.OBJECT,
                    properties: {
                        name: { type: SchemaType.STRING },
                        email: { type: SchemaType.STRING },
                        phone: { type: SchemaType.STRING },
                        linkedin: { type: SchemaType.STRING },
                        portfolio: { type: SchemaType.STRING },
                    },
                },
                summary: { type: SchemaType.STRING },
                workHistory: {
                    type: SchemaType.ARRAY,
                    items: {
                        type: SchemaType.OBJECT,
                        properties: {
                            title: { type: SchemaType.STRING },
                            company: { type: SchemaType.STRING },
                            startDate: { type: SchemaType.STRING },
                            endDate: { type: SchemaType.STRING },
                            responsibilities: { type: SchemaType.STRING },
                        },
                    },
                },
                education: {
                    type: SchemaType.ARRAY,
                    items: {
                        type: SchemaType.OBJECT,
                        properties: {
                            institution: { type: SchemaType.STRING },
                            degree: { type: SchemaType.STRING },
                            startDate: { type: SchemaType.STRING },
                            endDate: { type: SchemaType.STRING },
                        },
                    },
                },
                softSkills: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                hardSkills: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
            },
        };

        const response = await callGeminiAPI(
            model,
            {
                parts: [
                    { text: "INSTANT SCANNED EXTRACTION: Rapidly scan this document and extract only the most OBVIOUS fields. If any section is missing, unclear, or requires analysis, LEAVE IT AS AN EMPTY STRING OR EMPTY ARRAY. Do not deliberate. Return whatever you find immediately. Schema structure: personalInfo, summary, workHistory, education, softSkills, hardSkills." },
                    part,
                ],
            },
            {
                responseMimeType: 'application/json',
                responseSchema: responseSchema,
            }
        );

        validateGeminiResponse(response, "parsing the resume file");

        // Try to parse the response, with fallback handling
        let parsedData: Partial<ResumeData>;
        try {
            parsedData = JSON.parse(response.text) as Partial<ResumeData>;
        } catch (parseError) {
            console.error("[GeminiService] JSON parse error:", parseError);
            console.error("[GeminiService] Raw response:", response.text);

            // Check if it's a refusal message (often plain text)
            const lowerText = response.text.toLowerCase();
            if (lowerText.includes("cannot fulfill") || lowerText.includes("safety guidelines") || lowerText.includes("harmful")) {
                throw new Error(`AI Request Refused: ${response.text}`);
            }

            throw new Error("Failed to parse resume data. The AI response was not valid JSON.");
        }

        // Ensure arrays exist for all expected fields - use empty defaults
        return {
            personalInfo: parsedData.personalInfo || {},
            summary: parsedData.summary || '',
            workHistory: Array.isArray(parsedData.workHistory) ? parsedData.workHistory : [],
            education: Array.isArray(parsedData.education) ? parsedData.education : [],
            volunteering: [],
            extracurriculars: [],
            softSkills: Array.isArray(parsedData.softSkills) ? parsedData.softSkills : [],
            hardSkills: Array.isArray(parsedData.hardSkills) ? parsedData.hardSkills : [],
            references: [],
        };
    } catch (error: any) {
        console.error("[GeminiService] Resume parsing error (Proceeding with blank data):", error);
        // Return empty defaults so the user can still proceed
        return {
            personalInfo: {},
            summary: '',
            workHistory: [],
            education: [],
            volunteering: [],
            extracurriculars: [],
            softSkills: [],
            hardSkills: [],
            references: [],
        };
    }
};

export const generateResumeLayouts = async (resumeData: ResumeData, feedbackSummary?: string): Promise<string[]> => {
    try {
        const model = MODEL_PRO;
        const prompt = `Generate 3 professional HTML resume layouts.
        
        ${RESUME_OPTIMIZATION_RULES}
        
        Current Settings: Font: ${resumeData.font}, Theme: ${resumeData.colorTheme}
        Include [data-editable] attributes on every content section.
        Sections: Profile Summary, Work Experience, Volunteering, Extracurriculars, Technical Skills, Soft Skills, Education, References.
        ${feedbackSummary ? `User Feedback to incorporate: ${feedbackSummary}` : ''}
        Resume Data: ${JSON.stringify(resumeData)}`;

        const response = await callGeminiAPI(model, prompt, {
            responseMimeType: 'application/json',
            responseSchema: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }
        });

        validateGeminiResponse(response, "generating layouts");
        const layouts = JSON.parse(response.text) as string[];
        return layouts.map(sanitizeAIContent);
    } catch (error: any) {
        throw new Error(error.message || "An error occurred while generating layouts.");
    }
};

export const generatePortfolioWebsite = async (resumeData: ResumeData, feedbackSummary?: string): Promise<string> => {
    try {
        const model = MODEL_PRO;
        const prompt = `Generate a modern single-file HTML portfolio website based on this data: ${JSON.stringify(resumeData)}. 
        Include all sections. Use professional, human-readable language and ensure a visually clean mobile-responsive design.`;
        const response = await callGeminiAPI(model, prompt);
        validateGeminiResponse(response, "generating portfolio website");
        return sanitizeAIContent(response.text);
    } catch (error: any) {
        throw new Error(error.message || "An unknown error occurred.");
    }
};

export const generateCoverLetter = async (resumeData: ResumeData): Promise<string> => {
    try {
        const model = MODEL_PRO;
        const prompt = `Generate a tailored, high-impact cover letter for this job description: ${resumeData.jobDescription}.
        Use simple, human-readable language. Focus on measurable achievements from the resume that align with the JD.
        Resume: ${JSON.stringify(resumeData)}`;
        const response = await callGeminiAPI(model, prompt);
        validateGeminiResponse(response, "generating cover letter");
        return sanitizeAIContent(response.text);
    } catch (error: any) {
        throw new Error(error.message || "An unknown error occurred.");
    }
};

export const generateOutreachKit = async (resumeData: ResumeData): Promise<OutreachKit> => {
    try {
        const model = MODEL_PRO;
        const prompt = `Generate a tailored cover letter and 3 LinkedIn outreach messages (Formal, Casual, Direct).
        Use plain, human-readable language.
        Data: ${JSON.stringify(resumeData)}`;

        const responseSchema = {
            type: SchemaType.OBJECT,
            properties: {
                coverLetter: { type: SchemaType.STRING },
                outreachMessages: {
                    type: SchemaType.ARRAY,
                    items: {
                        type: SchemaType.OBJECT,
                        properties: {
                            tone: { type: SchemaType.STRING },
                            message: { type: SchemaType.STRING },
                        },
                        required: ['tone', 'message'],
                    }
                }
            },
            required: ['coverLetter', 'outreachMessages'],
        };

        const response = await callGeminiAPI(model, prompt, { responseMimeType: 'application/json', responseSchema });
        validateGeminiResponse(response, "generating outreach kit");
        const kit = JSON.parse(response.text) as OutreachKit;
        return {
            coverLetter: sanitizeAIContent(kit.coverLetter),
            outreachMessages: kit.outreachMessages.map(m => ({ ...m, message: sanitizeAIContent(m.message) }))
        };
    } catch (error: any) {
        throw new Error(error.message || "An error occurred.");
    }
};

export const enhanceResponsibilities = async (text: string): Promise<string> => {
    try {
        const model = MODEL_FLASH;
        const prompt = `Rewrite these work responsibilities to be EXCEPTIONAL and HIGH-IMPACT.
        REQUIREMENTS:
        1. Use an EXECUTIVE, PROFESSIONAL tone.
        2. Focus on measurable outcomes and high-value achievements. 
        3. Each bullet point MUST be 1-2 lines max.
        4. DO NOT provide multiple options or introductory text. Return ONLY the polished text.
        Original Text: ${text}`;
        const response = await callGeminiAPI(model, prompt);
        validateGeminiResponse(response, "enhancing responsibilities");
        return sanitizeAIContent(response.text);
    } catch (error: any) {
        throw new Error(error.message || "An error occurred.");
    }
};

export const optimizeTextWithKeywords = async (currentText: string, keywords: string[], fieldName: string): Promise<string> => {
    try {
        const model = MODEL_FLASH;
        const prompt = `Rewrite this ${fieldName} to naturally include these keywords: ${keywords.join(', ')}.
        REQUIREMENTS:
        1. Use an EXECUTIVE, PROFESSIONAL, and AUTHORITATIVE tone.
        2. STRICTLY AVOID layman or casual language.
        3. Return ONLY the final rewritten text.
        4. DO NOT provide multiple options, explanations, or introductory text.
        5. Maintain clarity and extreme brevity.
        Text to optimize: ${currentText}`;
        const response = await callGeminiAPI(model, prompt);
        validateGeminiResponse(response, "optimizing text");
        return sanitizeAIContent(response.text);
    } catch (error: any) {
        throw new Error(error.message || "An error occurred.");
    }
};

export const refineResumeLayout = async (html: string, request: string): Promise<string> => {
    try {
        const model = MODEL_PRO;
        const prompt = `Modify this HTML resume based on the following request: "${request}".
        ${RESUME_OPTIMIZATION_RULES}
        HTML Content: ${html}`;
        const response = await callGeminiAPI(model, prompt);
        validateGeminiResponse(response, "refining layout");
        return response.text.trim().replace(/^```html/, '').replace(/```$/, '').trim(); // HTML might need some markdown for code blocks, but we want clean HTML
    } catch (error: any) {
        throw new Error(error.message || "An error occurred.");
    }
};

export const performWebSearch = async (query: string): Promise<SearchResult> => {
    try {
        const model = MODEL_FLASH;
        const response = await callGeminiAPI(model, query, { tools: [{ googleSearch: {} }] });
        validateGeminiResponse(response, "performing web search");
        const sources: GroundingSource[] = [];
        if (response.groundingMetadata?.groundingChunks) {
            for (const chunk of response.groundingMetadata.groundingChunks) {
                if (chunk.web) {
                    sources.push({ uri: chunk.web.uri || '', title: chunk.web.title || 'Untitled' });
                }
            }
        }
        return { summary: response.text, sources };
    } catch (error: any) {
        throw new Error(error.message || "An error occurred.");
    }
};

/**
 * Generates an elite high-impact alternative for a given piece of text.
 * Returns exactly 1 option in an array for compatibility with the comparison UI.
 */
export const generateAlternativeText = async (originalText: string, fieldName: string): Promise<string[]> => {
    try {
        const model = MODEL_FLASH;
        const prompt = `Rewrite this ${fieldName} into a single, ELITE-level, PROFESSIONAL version. 
        REQUIREMENTS:
        1. Use an EXECUTIVE and HIGH-IMPACT tone. 
        2. Avoid casual or layman language.
        3. Return ONLY the polished text block.
        4. DO NOT provide multiple options or introductory text.
        Return as a JSON array containing exactly ONE string.
        Text: ${originalText}`;
        const response = await callGeminiAPI(model, prompt, {
            responseMimeType: 'application/json',
            responseSchema: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, minItems: 1, maxItems: 1 }
        });
        validateGeminiResponse(response, "generating alternatives");
        const alts = JSON.parse(response.text) as string[];
        return alts.map(sanitizeAIContent);
    } catch (error: any) {
        throw new Error(error.message || "An error occurred.");
    }
};

export const analyzeABTest = async (versionA: string, versionB: string, jobDescription: string, fieldName: string): Promise<ABTestResult> => {
    try {
        const model = MODEL_PRO;
        const prompt = `Analyze these two ${fieldName} versions against the job description.
        JD: ${jobDescription}
        Version A: ${versionA}
        Version B: ${versionB}
        
        Evaluate based on ATS readability, human impact, and keyword alignment.`;
        const analysisSchema = {
            type: SchemaType.OBJECT,
            properties: {
                atsScore: { type: SchemaType.INTEGER },
                humanImpact: { type: SchemaType.STRING },
                feedback: { type: SchemaType.STRING },
                missingKeywords: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
            },
            required: ['atsScore', 'humanImpact', 'feedback', 'missingKeywords'],
        };
        const response = await callGeminiAPI(model, prompt, { responseMimeType: 'application/json', responseSchema: { type: SchemaType.OBJECT, properties: { versionA: analysisSchema, versionB: analysisSchema }, required: ['versionA', 'versionB'] } });
        validateGeminiResponse(response, "analyzing A/B test");
        const res = JSON.parse(response.text) as ABTestResult;
        return {
            versionA: { ...res.versionA, feedback: sanitizeAIContent(res.versionA.feedback), humanImpact: sanitizeAIContent(res.versionA.humanImpact) },
            versionB: { ...res.versionB, feedback: sanitizeAIContent(res.versionB.feedback), humanImpact: sanitizeAIContent(res.versionB.humanImpact) }
        };
    } catch (error: any) {
        throw new Error(error.message || "An error occurred.");
    }
};

export const analyzeResumeFit = async (resumeData: ResumeData): Promise<FitAnalysisResult> => {
    try {
        const model = MODEL_PRO;
        const prompt = `Analyze how well this resume fits the job description.
        JD: ${resumeData.jobDescription}
        Resume: ${JSON.stringify(resumeData)}`;
        const responseSchema = {
            type: SchemaType.OBJECT,
            properties: {
                fitScore: { type: SchemaType.INTEGER },
                overallSummary: { type: SchemaType.STRING },
                keywordAnalysis: { type: SchemaType.OBJECT, properties: { matchingKeywords: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }, missingKeywords: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } } }, required: ['matchingKeywords', 'missingKeywords'] },
                experienceGapAnalysis: { type: SchemaType.ARRAY, items: { type: SchemaType.OBJECT, properties: { area: { type: SchemaType.STRING }, suggestion: { type: SchemaType.STRING } }, required: ['area', 'suggestion'] } },
                skillPrioritization: { type: SchemaType.ARRAY, items: { type: SchemaType.OBJECT, properties: { recommendation: { type: SchemaType.STRING } }, required: ['recommendation'] } },
            },
            required: ['fitScore', 'overallSummary', 'keywordAnalysis', 'experienceGapAnalysis', 'skillPrioritization'],
        };
        const response = await callGeminiAPI(model, prompt, { responseMimeType: 'application/json', responseSchema });
        validateGeminiResponse(response, "analyzing fit");
        return JSON.parse(response.text) as FitAnalysisResult;
    } catch (error: any) {
        throw new Error(error.message || "An error occurred.");
    }
};

export const generateIntelligenceBriefing = async (jobDescription: string): Promise<IntelligenceBriefing> => {
    try {
        const model = MODEL_PRO;
        const prompt = `Research the company and role described in this JD and provide a briefing. 
        Focus on company culture, talking points, and potential interview questions.
        JD: ${jobDescription}
        
        YOU MUST RETURN ONLY A JSON OBJECT matching the schema. NO EXTRA TEXT.`;

        const responseSchema = {
            type: SchemaType.OBJECT,
            properties: {
                companyOverview: { type: SchemaType.STRING },
                keyTalkingPoints: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                cultureAnalysis: { type: SchemaType.STRING },
                potentialInterviewQuestions: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
            },
            required: ['companyOverview', 'keyTalkingPoints', 'cultureAnalysis', 'potentialInterviewQuestions']
        };

        const response = await callGeminiAPI(model, prompt, {
            tools: [{ googleSearch: {} }],
            responseMimeType: 'application/json',
            responseSchema
        });

        validateGeminiResponse(response, "generating briefing");

        const sources: GroundingSource[] = [];
        if (response.groundingMetadata?.groundingChunks) {
            for (const chunk of response.groundingMetadata.groundingChunks) {
                if (chunk.web) sources.push({ uri: chunk.web.uri || '', title: chunk.web.title || 'Untitled' });
            }
        }

        const briefingData = JSON.parse(response.text);
        return {
            ...briefingData,
            companyOverview: sanitizeAIContent(briefingData.companyOverview),
            cultureAnalysis: sanitizeAIContent(briefingData.cultureAnalysis),
            keyTalkingPoints: briefingData.keyTalkingPoints.map(sanitizeAIContent),
            potentialInterviewQuestions: briefingData.potentialInterviewQuestions.map(sanitizeAIContent),
            sources
        } as IntelligenceBriefing;
    } catch (error: any) {
        console.error("Intelligence Briefing Generation Error:", error);
        throw new Error(error.message || "An error occurred while generating the intelligence briefing.");
    }
};

export const fetchJobDescriptionFromUrl = async (url: string): Promise<string> => {
    try {
        const model = MODEL_PRO; // Use Pro for better extraction quality
        const prompt = `Extract the core job description text from this URL: ${url}. 
        Format the output using professional Markdown with clear headings and subheadings. 
        CRITICAL: Do NOT use asterisks (*) for any reason (no bolding, no bullet points). 
        - For headings, use #, ##, or ###.
        - For list items, use a simple dash (-).
        - For emphasis, use plain text or headers; NEVER use double asterisks.
        Ensure the output is clean, organized, and easy to read.`;
        const response = await callGeminiAPI(model, prompt, { tools: [{ googleSearch: {} }] });
        validateGeminiResponse(response, "fetching JD");

        // Final safety strip for any asterisks the AI might have still included
        return sanitizeAIContent(response.text);
    } catch (error: any) {
        throw new Error(error.message || "An error occurred.");
    }
};

export const findMetricOpportunities = async (workHistory: WorkExperience[]): Promise<MetricOpportunity[]> => {
    try {
        const model = MODEL_FLASH;
        const prompt = `Review this work history and identify bullet points that lack quantitative metrics.
        History: ${JSON.stringify(workHistory)}`;
        const responseSchema = {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.OBJECT, properties: { index: { type: SchemaType.INTEGER }, originalText: { type: SchemaType.STRING }, reasoning: { type: SchemaType.STRING }, question: { type: SchemaType.STRING } }, required: ['index', 'originalText', 'reasoning', 'question'] }
        };
        const response = await callGeminiAPI(model, prompt, { responseMimeType: 'application/json', responseSchema });
        validateGeminiResponse(response, "finding metrics");
        return JSON.parse(response.text) as MetricOpportunity[];
    } catch (error: any) {
        throw new Error(error.message || "An error occurred.");
    }
};

export const applyMetricToText = async (originalText: string, userMetric: string): Promise<string> => {
    try {
        const model = MODEL_FLASH;
        const prompt = `Incorporate this metric: "${userMetric}" into the following sentence: "${originalText}".
        Keep the result concise, impactful, and human-readable.`;
        const response = await callGeminiAPI(model, prompt);
        validateGeminiResponse(response, "applying metric");
        return sanitizeAIContent(response.text);
    } catch (error: any) {
        throw new Error(error.message || "An error occurred.");
    }
};

export const generateInterviewQuestions = async (resumeData: ResumeData): Promise<string[]> => {
    try {
        const model = MODEL_FLASH; // Flash is sufficient for question generation
        const prompt = `Based on this resume and job description, generate 5 high-impact interview questions.
        JD: ${resumeData.jobDescription}
        Resume: ${JSON.stringify(resumeData)}`;
        const responseSchema = { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } };
        const response = await callGeminiAPI(model, prompt, { responseMimeType: 'application/json', responseSchema });
        validateGeminiResponse(response, "generating questions");
        const questions = JSON.parse(response.text) as string[];
        return questions.map(sanitizeAIContent);
    } catch (error: any) {
        throw new Error(error.message || "Failed to generate interview questions.");
    }
};

export const analyzeInterview = async (transcript: any[]): Promise<any> => {
    try {
        const model = MODEL_PRO;
        const prompt = `Analyze this interview transcript and provide feedback on strengths and areas for improvement.
        Transcript: ${JSON.stringify(transcript)}`;
        const responseSchema = {
            type: SchemaType.OBJECT,
            properties: {
                overallSummary: { type: SchemaType.STRING },
                strengths: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                areasForImprovement: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                detailedAnalysis: {
                    type: SchemaType.ARRAY,
                    items: {
                        type: SchemaType.OBJECT,
                        properties: { question: { type: SchemaType.STRING }, answer: { type: SchemaType.STRING }, feedback: { type: SchemaType.STRING } },
                        required: ['question', 'answer', 'feedback']
                    }
                }
            },
            required: ['overallSummary', 'strengths', 'areasForImprovement', 'detailedAnalysis']
        };

        const response = await callGeminiAPI(model, prompt, { responseMimeType: 'application/json', responseSchema });
        validateGeminiResponse(response, "analyzing interview");
        const analysis = JSON.parse(response.text);
        return {
            ...analysis,
            overallSummary: sanitizeAIContent(analysis.overallSummary),
            strengths: analysis.strengths.map(sanitizeAIContent),
            areasForImprovement: analysis.areasForImprovement.map(sanitizeAIContent),
            detailedAnalysis: analysis.detailedAnalysis.map((d: any) => ({ ...d, feedback: sanitizeAIContent(d.feedback) }))
        };
    } catch (error: any) {
        throw new Error(error.message || "Failed to analyze interview.");
    }
};
