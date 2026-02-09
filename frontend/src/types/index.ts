export interface User {
  id: string;
  email: string;
  role: 'owner' | 'staff';
  phone?: string;
  push_token?: string;
  business_id: string;
}

export interface Business {
  id: string;
  name: string;
  phone_number: string;
  owner_id: string;
}

export interface CallMessage {
  id: string;
  role: 'customer' | 'ai' | 'staff';
  content: string;
  timestamp: string;
  sentiment?: number;
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
  caller_number: string;
  caller_name?: string;
  status: 'active' | 'completed' | 'escalated';
  duration: number;
  started_at: string;
  ended_at?: string;
  summary?: string;
  sentiment_avg?: number;
  audio_url?: string;
  messages: CallMessage[];
  events: CallEvent[];
  action_points: ActionPoint[];
  escalated_to?: string;
}

export interface EscalationRule {
  id: string;
  keywords: string[];
  priority: number;
  action_type: 'notify' | 'transfer' | 'escalate';
  notify_users: string[];
}

export interface KnowledgeCategory {
  id: string;
  name: string;
  content: string;
  updated_at: string;
}

export interface CustomerProfile {
  id: string;
  caller_number: string;
  name: string;
  last_call?: string;
  preferences: Record<string, unknown>;
  call_count: number;
}

export interface AnalyticsSummary {
  total_calls: number;
  avg_sentiment: number;
  escalation_rate: number;
  avg_handle_time: number;
  call_volume: { date: string; count: number }[];
  escalation_reasons: { reason: string; count: number }[];
  duration_by_day: { day: string; avg_duration: number }[];
}
