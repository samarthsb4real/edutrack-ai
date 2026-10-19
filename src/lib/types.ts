export interface EquationData {
  label: string;
  formula: string;
  explanation: string;
}

export interface DiagramData {
  type: 'flowchart' | 'graph' | 'architecture' | 'comparison';
  title: string;
  summary: string;
  nodes?: { id: string; label: string; desc?: string; highlight?: boolean }[];
  connections?: { from: string; to: string; label?: string }[];
  chartData?: { xLabel: string; yLabel: string; curves: { name: string; color: string; path: string }[] };
}

export interface Slide {
  id: string;
  slideNumber: number;
  title: string;
  section: string;
  startTime: number; // in seconds
  endTime: number;   // in seconds
  bullets: string[];
  equation?: EquationData;
  diagram?: DiagramData;
  example?: string;
  speakerTakeaway: string;
}

export interface TranscriptItem {
  id: string;
  startTime: number;
  endTime: number;
  speaker?: string;
  text: string;
}

export interface LectureSummary {
  overview: string;
  keyInsights: string[];
  coreTheoremsOrPrinciples: string[];
  recommendedReview: string;
}

export interface Lecture {
  id: string;
  title: string;
  speaker: string;
  category: 'philosophy' | 'math' | 'economics' | 'cs' | 'custom';
  duration: number; // seconds
  videoUrl: string;
  description: string;
  slides: Slide[];
  transcript?: TranscriptItem[];
  summary?: LectureSummary;
}
