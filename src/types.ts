export type Priority = 'high' | 'medium' | 'low';

export interface Task {
  id: string;
  title: string;
  subject: string;
  priority: Priority;
  dueDate: string;
  completed: boolean;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface PersonaConfig {
  id: 'copilot' | 'einstein' | 'newton';
  name: string;
  emoji: string;
  title: string;
  tagline: string;
}

export interface AIChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system' | 'action';
  text: string;
  timestamp: string;
  persona: 'copilot' | 'einstein' | 'newton';
  actionType?: 'navigate' | 'toast';
  actionTarget?: string;
}

export interface Riddle {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  avatar: 'einstein' | 'newton';
}

export interface ExplanationResponse {
  explanation: string;
  suggestedQuestions: string[];
}
