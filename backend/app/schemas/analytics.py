from pydantic import BaseModel


class AnalyticsSummaryResponse(BaseModel):
    total_calls: int
    avg_duration: float
    escalation_rate: float
    sentiment_avg: float | None


class CallVolumePoint(BaseModel):
    date: str
    count: int


class EscalationReasonPoint(BaseModel):
    reason: str
    count: int


class DurationByDayPoint(BaseModel):
    day: str
    avg_duration: float


class AnalyticsSeriesResponse(BaseModel):
    call_volume: list[CallVolumePoint]
    escalation_reasons: list[EscalationReasonPoint]
    duration_by_day: list[DurationByDayPoint]
