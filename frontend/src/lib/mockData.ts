import type { Call, EscalationRule, KnowledgeCategory, CustomerProfile, AnalyticsSummary } from '@/types';

export const mockCalls: Call[] = [
  {
    id: '1',
    caller_number: '+1 (555) 234-5678',
    caller_name: 'Sarah Johnson',
    status: 'completed',
    duration: 245,
    started_at: '2026-02-09T10:30:00Z',
    ended_at: '2026-02-09T10:34:05Z',
    summary: 'Customer inquired about premium plan pricing and feature comparison. Provided detailed breakdown.',
    sentiment_avg: 0.7,
    messages: [
      { id: '1', role: 'customer', content: "Hi, I'm interested in upgrading to the premium plan.", timestamp: '2026-02-09T10:30:05Z', sentiment: 0.6 },
      { id: '2', role: 'ai', content: "I'd be happy to help you with that! Our premium plan includes advanced analytics, priority support, and unlimited integrations. Would you like me to walk you through the pricing?", timestamp: '2026-02-09T10:30:15Z' },
      { id: '3', role: 'customer', content: "Yes please, and how does it compare to what I have now?", timestamp: '2026-02-09T10:30:30Z', sentiment: 0.7 },
      { id: '4', role: 'ai', content: "Your current plan is the Starter at $29/month. The Premium plan is $79/month and adds: real-time dashboards, custom reporting, API access, and dedicated support.", timestamp: '2026-02-09T10:30:45Z' },
      { id: '5', role: 'customer', content: "That sounds great, I'll think about it. Thanks!", timestamp: '2026-02-09T10:33:50Z', sentiment: 0.8 },
    ],
    events: [
      { id: '1', type: 'call_started', description: 'Inbound call received', timestamp: '2026-02-09T10:30:00Z' },
      { id: '2', type: 'call_ended', description: 'Call completed successfully', timestamp: '2026-02-09T10:34:05Z' },
    ],
    action_points: [
      { id: '1', description: 'Send premium plan comparison PDF', delivery_status: 'success', attempts: 1 },
      { id: '2', description: 'Schedule follow-up in 3 days', delivery_status: 'pending', attempts: 0 },
    ],
  },
  {
    id: '2',
    caller_number: '+1 (555) 876-5432',
    caller_name: 'Marcus Chen',
    status: 'escalated',
    duration: 180,
    started_at: '2026-02-09T11:15:00Z',
    ended_at: '2026-02-09T11:18:00Z',
    summary: 'Customer reported billing discrepancy. Escalated to billing team for manual review.',
    sentiment_avg: -0.3,
    escalated_to: 'billing@company.com',
    messages: [
      { id: '1', role: 'customer', content: "I was charged twice for my subscription this month!", timestamp: '2026-02-09T11:15:05Z', sentiment: -0.6 },
      { id: '2', role: 'ai', content: "I'm sorry to hear about that. Let me look into your account right away.", timestamp: '2026-02-09T11:15:15Z' },
      { id: '3', role: 'customer', content: "This is really frustrating, I need this resolved immediately.", timestamp: '2026-02-09T11:16:00Z', sentiment: -0.8 },
      { id: '4', role: 'ai', content: "I completely understand your frustration. I'm escalating this to our billing specialist who can process the refund immediately.", timestamp: '2026-02-09T11:16:15Z' },
    ],
    events: [
      { id: '1', type: 'call_started', description: 'Inbound call received', timestamp: '2026-02-09T11:15:00Z' },
      { id: '2', type: 'escalation_detected', description: 'Billing dispute detected — high priority', timestamp: '2026-02-09T11:16:10Z' },
      { id: '3', type: 'call_ended', description: 'Call transferred to billing', timestamp: '2026-02-09T11:18:00Z' },
    ],
    action_points: [
      { id: '1', description: 'Process duplicate charge refund', delivery_status: 'pending', attempts: 1, last_error: 'Awaiting supervisor approval' },
    ],
  },
  {
    id: '3',
    caller_number: '+1 (555) 111-2222',
    caller_name: 'Emily Watson',
    status: 'active',
    duration: 62,
    started_at: '2026-02-09T14:00:00Z',
    summary: 'Ongoing call about technical support for API integration.',
    sentiment_avg: 0.4,
    messages: [
      { id: '1', role: 'customer', content: "I'm having trouble with the API authentication.", timestamp: '2026-02-09T14:00:05Z', sentiment: 0.2 },
      { id: '2', role: 'ai', content: "I can help with that. Are you using OAuth 2.0 or API key authentication?", timestamp: '2026-02-09T14:00:15Z' },
    ],
    events: [
      { id: '1', type: 'call_started', description: 'Inbound call received', timestamp: '2026-02-09T14:00:00Z' },
    ],
    action_points: [],
  },
  {
    id: '4',
    caller_number: '+1 (555) 333-4444',
    caller_name: 'David Kim',
    status: 'completed',
    duration: 320,
    started_at: '2026-02-08T09:00:00Z',
    ended_at: '2026-02-08T09:05:20Z',
    summary: 'Customer requested account cancellation. Retention offer provided.',
    sentiment_avg: 0.1,
    messages: [],
    events: [],
    action_points: [],
  },
  {
    id: '5',
    caller_number: '+1 (555) 555-6666',
    caller_name: 'Lisa Park',
    status: 'completed',
    duration: 150,
    started_at: '2026-02-08T15:30:00Z',
    ended_at: '2026-02-08T15:32:30Z',
    summary: 'Quick inquiry about business hours and location.',
    sentiment_avg: 0.9,
    messages: [],
    events: [],
    action_points: [],
  },
];

export const mockEscalationRules: EscalationRule[] = [
  { id: '1', keywords: ['refund', 'charge', 'billing'], priority: 1, action_type: 'escalate', notify_users: ['admin@company.com'] },
  { id: '2', keywords: ['cancel', 'terminate'], priority: 2, action_type: 'transfer', notify_users: ['retention@company.com'] },
  { id: '3', keywords: ['angry', 'frustrated', 'lawsuit'], priority: 1, action_type: 'notify', notify_users: ['admin@company.com', 'manager@company.com'] },
  { id: '4', keywords: ['technical', 'bug', 'error', 'broken'], priority: 3, action_type: 'notify', notify_users: ['support@company.com'] },
];

export const mockKnowledgeBase: KnowledgeCategory[] = [
  { id: '1', name: 'Pricing', content: '## Pricing Plans\n\n- **Starter**: $29/month — Basic features, 100 calls/month\n- **Premium**: $79/month — Advanced analytics, unlimited calls\n- **Enterprise**: Custom pricing — Full customization, SLA', updated_at: '2026-02-01' },
  { id: '2', name: 'Business Hours', content: '## Operating Hours\n\n- Monday–Friday: 9:00 AM – 6:00 PM EST\n- Saturday: 10:00 AM – 2:00 PM EST\n- Sunday: Closed\n\nHoliday schedule available on our website.', updated_at: '2026-01-15' },
  { id: '3', name: 'Services', content: '## Our Services\n\n1. AI Call Handling\n2. Real-time Escalation\n3. Knowledge Base Management\n4. Analytics & Reporting\n5. Customer Profile Management', updated_at: '2026-02-05' },
  { id: '4', name: 'FAQs', content: '## Frequently Asked Questions\n\n**Q: How does the AI handle calls?**\nA: Our AI uses advanced NLP to understand and respond naturally.\n\n**Q: Can I customize responses?**\nA: Yes, through the Knowledge Base editor.', updated_at: '2026-02-08' },
];

export const mockCustomers: CustomerProfile[] = [
  { id: '1', caller_number: '+1 (555) 234-5678', name: 'Sarah Johnson', last_call: '2026-02-09', preferences: { plan: 'starter', language: 'en' }, call_count: 5 },
  { id: '2', caller_number: '+1 (555) 876-5432', name: 'Marcus Chen', last_call: '2026-02-09', preferences: { plan: 'premium', language: 'en' }, call_count: 12 },
  { id: '3', caller_number: '+1 (555) 111-2222', name: 'Emily Watson', last_call: '2026-02-09', preferences: { plan: 'enterprise', language: 'en' }, call_count: 3 },
  { id: '4', caller_number: '+1 (555) 333-4444', name: 'David Kim', last_call: '2026-02-08', preferences: { plan: 'premium', language: 'en' }, call_count: 8 },
];

export const mockAnalytics: AnalyticsSummary = {
  total_calls: 1247,
  avg_sentiment: 0.62,
  escalation_rate: 0.08,
  avg_handle_time: 195,
  call_volume: [
    { date: 'Feb 3', count: 45 },
    { date: 'Feb 4', count: 52 },
    { date: 'Feb 5', count: 38 },
    { date: 'Feb 6', count: 61 },
    { date: 'Feb 7', count: 48 },
    { date: 'Feb 8', count: 55 },
    { date: 'Feb 9', count: 42 },
  ],
  escalation_reasons: [
    { reason: 'Billing', count: 32 },
    { reason: 'Technical', count: 24 },
    { reason: 'Complaints', count: 18 },
    { reason: 'Cancellation', count: 12 },
    { reason: 'Other', count: 8 },
  ],
  duration_by_day: [
    { day: 'Mon', avg_duration: 210 },
    { day: 'Tue', avg_duration: 185 },
    { day: 'Wed', avg_duration: 195 },
    { day: 'Thu', avg_duration: 220 },
    { day: 'Fri', avg_duration: 175 },
    { day: 'Sat', avg_duration: 160 },
    { day: 'Sun', avg_duration: 0 },
  ],
};
