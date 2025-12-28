
export type ModelId = 'fast' | 'context' | 'code' | 'smart' | 'phi5' | 'search';

export interface Model {
  id: ModelId;
  name: string;
  badge?: string;
}

export interface Attachment {
  name:string;
  type: string; // MIME type
  data: string; // base64 encoded data with data URI scheme
}

export interface GroundingWebChunk {
  uri: string;
  title: string;
}

export interface GroundingChunk {
  web?: GroundingWebChunk;
}

export interface Message {
  role: 'user' | 'model';
  content: string;
  imageUrl?: string;
  attachments?: Attachment[];
  isPartial?: boolean;
  groundingChunks?: GroundingChunk[];
  plan?: {
    steps: string[];
    isExecuted: boolean;
  };
  toolCalls?: {
      name: string;
      args: any;
      id: string;
  }[];
  isToolResponse?: boolean;
  isPrintable?: boolean;
  reasoning?: string; // New field to store the thinking process
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  modelId?: ModelId;
  agentId?: string; // Track which agent was used
}

export interface UserProfile {
  name:string;
  picture: string | null;
}

// Types for Rick's Labs
export interface AgentKnowledgeFile {
  name: string;
  content: string;
}

export type AgentTool = 'web_search' | 'calendar_scheduling' | 'document_analysis' | 'email_drafter' | 'data_extractor' | 'printable_worksheet_creator';

export interface CustomAgent {
  id: string;
  name: string;
  personalityTraits: string;
  communicationStyle: 'formal' | 'coloquial' | 'humorístico';
  responseSpeed: 'rápido' | 'equilibrado' | 'profundo';
  knowledgeFiles: AgentKnowledgeFile[];
  tools: AgentTool[];
}

export enum EmotionalState {
  IDLE = 'idle',
  HAPPY = 'happy',
  SAD = 'sad',
  ANGRY = 'angry',
  CONFUSED = 'confused',
  INSPIRED = 'inspired',
}

export interface AppSettings {
  saveHistory: boolean;
  showAvatar: boolean;
  currentEmotionalState: EmotionalState;
  enableMemory: boolean; // NEW: Added to control memory feature
}

export interface Reminder {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  notified: boolean;
}

export type AspectRatio = '1:1' | '2:3' | '3:2' | '3:4' | '4:3' | '9:16' | '16:9' | '21:9';
