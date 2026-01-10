
/**
 * @file types.ts
 * This file contains all the TypeScript type definitions and interfaces used across the application.
 */

export interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
  linkedin: string;
  portfolio: string;
  profilePicture: string;
}

export interface UploadedFileInfo {
  name: string;
  size: number;
  type: string;
  previewUrl: string;
}

export interface WorkExperience {
  id: string;
  title: string;
  company: string;
  startDate: string;
  endDate: string;
  responsibilities: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  startDate: string;
  endDate: string;
}

export interface Activity {
  id: string;
  title: string;
  organization: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface Reference {
  id: string;
  name: string;
  title: string;
  company: string;
  contactInfo: string;
}

export interface GroundingSource {
  uri: string;
  title: string;
}

export interface SearchResult {
  summary: string;
  sources: GroundingSource[];
}

export interface OutreachMessage {
  tone: string;
  message: string;
}

export interface OutreachKit {
  coverLetter: string;
  outreachMessages: OutreachMessage[];
}

export interface ResumeData {
  personalInfo: PersonalInfo;
  summary: string;
  aboutMe: string;
  jobDescription: string;
  workHistory: WorkExperience[];
  education: Education[];
  volunteering: Activity[];
  extracurriculars: Activity[];
  softSkills: string[];
  hardSkills: string[];
  references: Reference[];
  projects: Activity[]; // Kept for backward compatibility
  font: string;
  colorTheme: string;
}

export interface ResumeVersion {
  id: string;
  name: string;
  timestamp: number;
  data: ResumeData;
}

export interface ABTestAnalysis {
  atsScore: number;
  humanImpact: string;
  feedback: string;
  missingKeywords: string[];
}

export interface ABTestResult {
  versionA: ABTestAnalysis;
  versionB: ABTestAnalysis;
}

export interface FitAnalysisResult {
  fitScore: number;
  keywordAnalysis: {
    matchingKeywords: string[];
    missingKeywords: string[];
  };
  experienceGapAnalysis: {
    area: string;
    suggestion: string;
  }[];
  skillPrioritization: {
    recommendation: string;
  }[];
  overallSummary: string;
}

export interface Feedback {
  rating: number;
  comment: string;
}

export interface AllFeedback {
  layouts: { [index: number]: Feedback };
  portfolio: Feedback | null;
}

export interface IntelligenceBriefing {
  companyOverview: string;
  keyTalkingPoints: string[];
  cultureAnalysis: string;
  potentialInterviewQuestions: string[];
  sources: GroundingSource[];
}

export interface MetricOpportunity {
  index: number;
  originalText: string;
  reasoning: string;
  question: string;
}

export interface AccessibilityViolationNode {
  html: string;
  target: string[];
  any: any[];
  all: any[];
  none: any[];
}

export interface AccessibilityViolation {
  id: string;
  impact: 'minor' | 'moderate' | 'serious' | 'critical';
  description: string;
  help: string;
  helpUrl: string;
  nodes: AccessibilityViolationNode[];
  tags: string[];
}

export interface AccessibilityReport {
  violations: AccessibilityViolation[];
  passes: any[];
  incomplete: any[];
}

export type SubscriptionTier = 'free' | 'pro';

export interface User {
  id: string;
  name: string;
  email: string;
  tier: SubscriptionTier;
  avatar?: string;
}

export type InterviewState = 'idle' | 'ready' | 'starting_session' | 'active' | 'ending' | 'analyzing' | 'complete' | 'error';

export interface InterviewTranscriptItem {
  speaker: 'user' | 'ai';
  text: string;
  isFinal: boolean;
}

export interface InterviewAnalysisItem {
  question: string;
  answer: string;
  feedback: string;
}

export interface InterviewFeedback {
  overallSummary: string;
  strengths: string[];
  areasForImprovement: string[];
  detailedAnalysis: InterviewAnalysisItem[];
}

// Database types
export interface FeedbackRecord {
  id: string;
  user_id: string;
  resume_version_id?: string;
  rating: number;
  comment?: string;
  type: 'layout' | 'portfolio' | 'general';
  created_at: string;
}

export interface InterviewSession {
  id: string;
  user_id: string;
  resume_version_id?: string;
  transcript: InterviewTranscriptItem[];
  analysis_report?: InterviewFeedback;
  created_at: string;
}
