import type { Call, EscalationRule, KnowledgeCategory, CustomerProfile, AnalyticsSummary } from '@/types';

export const mockCalls: Call[] = [];
export const mockEscalationRules: EscalationRule[] = [];
export const mockKnowledgeBase: KnowledgeCategory[] = [];
export const mockCustomers: CustomerProfile[] = [];
export const mockAnalytics: AnalyticsSummary = {
  total_calls: 0,
  avg_duration: 0,
  escalation_rate: 0,
  sentiment_avg: null,
};
