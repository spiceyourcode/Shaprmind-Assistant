from pydantic import BaseModel


class AnalyticsSummaryResponse(BaseModel):
    total_calls: int
    avg_duration: float
    escalation_rate: float
    sentiment_avg: float | None
