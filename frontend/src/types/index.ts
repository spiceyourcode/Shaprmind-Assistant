export interface User {
  id: string;
  email: string;
  role: 'owner' | 'staff';
  phone?: string;
  push_token?: string;
  business_id?: string | null;
}

export interface Business {
  id: string;
  name: string;
  phone_number: string;
  owner_user_id: string;
}

export interface CallMessage {
  id: string;
  sender: 'customer' | 'ai' | 'human';
  content: string;
  timestamp: string;
  sentiment_score?: number | null;
}

export interface CallEvent {
  id: string;
  type: 'call_started' | 'escalation_detected' | 'action_triggered' | 'takeover' | 'call_ended';
  description: string;
  timestamp: string;
}

export interface ActionPoint {
  id: string;
  description: string;
  delivery_status: 'pending' | 'success' | 'failed';
  attempts: number;
  last_error?: string;
}

export interface Call {
  id: string;
  business_id: string;
  caller_number: string;
  status: 'completed' | 'escalated' | 'missed' | 'transferred';
  duration_seconds?: number | null;
  started_at: string;
  ended_at?: string;
  summary?: string;
  audio_url?: string;
  action_points?: Record<string, unknown> | null;
  escalated_to_user_id?: string | null;
  messages?: CallMessage[];
  events?: CallEvent[];
}

export interface EscalationRule {
  id: string;
  keyword_or_phrase: string[];
  priority: number;
  action: 'notify_owner' | 'notify_staff' | 'takeover_prompt';
  notify_user_ids: string[] | null;
}

export interface KnowledgeCategory {
  id?: string;
  name?: string;
  category?: string;
  content: string;
  updated_at: string;
}

export interface CustomerProfile {
  id: string;
  business_id?: string;
  caller_number: string;
  name?: string | null;
  preferences: Record<string, unknown> | null;
  history?: Record<string, unknown> | null;
  updated_at?: string;
}

export interface AnalyticsSummary {
  total_calls: number;
  avg_duration: number;
  escalation_rate: number;
  sentiment_avg: number | null;
}
