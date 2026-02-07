import enum
import uuid
from datetime import datetime

from pgvector.sqlalchemy import Vector
from sqlalchemy import DateTime, Enum, Float, ForeignKey, Index, Integer, String, Text
from sqlalchemy.dialects.postgresql import ARRAY, JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class UserRole(str, enum.Enum):
    owner = "owner"
    staff = "staff"


class EscalationAction(str, enum.Enum):
    notify_owner = "notify_owner"
    notify_staff = "notify_staff"
    takeover_prompt = "takeover_prompt"


class CallStatus(str, enum.Enum):
    completed = "completed"
    escalated = "escalated"
    missed = "missed"
    transferred = "transferred"


class MessageSender(str, enum.Enum):
    customer = "customer"
    ai = "ai"
    human = "human"


class Business(Base):
    __tablename__ = "businesses"
    __table_args__ = (Index("ix_businesses_owner_user_id", "owner_user_id"),)

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    phone_number: Mapped[str] = mapped_column(String(32), unique=True, nullable=False)
    owner_user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

    users: Mapped[list["User"]] = relationship(back_populates="business")


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    role: Mapped[UserRole] = mapped_column(Enum(UserRole, native_enum=False), nullable=False)
    business_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("businesses.id"))
    phone: Mapped[str | None] = mapped_column(String(32))
    push_token: Mapped[str | None] = mapped_column(String(512))
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)

    business: Mapped["Business"] = relationship(back_populates="users")


class KnowledgeBase(Base):
    __tablename__ = "knowledge_bases"
    __table_args__ = (
        Index("ix_kb_business_id", "business_id"),
        Index("ix_kb_business_category", "business_id", "category"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    business_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("businesses.id"))
    category: Mapped[str] = mapped_column(String(255), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    chunk_index: Mapped[int] = mapped_column(Integer, default=0)
    embedding: Mapped[list[float]] = mapped_column(Vector(1536))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)


class EscalationRule(Base):
    __tablename__ = "escalation_rules"
    __table_args__ = (Index("ix_escalation_business_id", "business_id"),)

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    business_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("businesses.id"))
    keyword_or_phrase: Mapped[list[str]] = mapped_column(ARRAY(String), nullable=False)
    priority: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    action: Mapped[EscalationAction] = mapped_column(Enum(EscalationAction, native_enum=False), nullable=False)
    notify_user_ids: Mapped[list[uuid.UUID] | None] = mapped_column(ARRAY(UUID(as_uuid=True)))


class Call(Base):
    __tablename__ = "calls"
    __table_args__ = (
        Index("ix_calls_business_id", "business_id"),
        Index("ix_calls_caller_number", "caller_number"),
        Index("ix_calls_started_at", "started_at"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    business_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("businesses.id"))
    caller_number: Mapped[str] = mapped_column(String(32), nullable=False)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    ended_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    duration_seconds: Mapped[int | None] = mapped_column(Integer)
    status: Mapped[CallStatus] = mapped_column(
        Enum(CallStatus, native_enum=False), default=CallStatus.completed
    )
    transcript: Mapped[str | None] = mapped_column(Text)
    summary: Mapped[str | None] = mapped_column(Text)
    action_points: Mapped[dict | None] = mapped_column(JSONB)
    audio_url: Mapped[str | None] = mapped_column(String(1024))
    escalated_to_user_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True))

    messages: Mapped[list["CallMessage"]] = relationship(back_populates="call")
    events: Mapped[list["CallEvent"]] = relationship(back_populates="call")


class CallEvent(Base):
    __tablename__ = "call_events"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    call_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("calls.id"))
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    event_type: Mapped[str] = mapped_column(String(255), nullable=False)
    details: Mapped[dict | None] = mapped_column(JSONB)

    call: Mapped["Call"] = relationship(back_populates="events")


class CallMessage(Base):
    __tablename__ = "call_messages"
    __table_args__ = (Index("ix_call_messages_call_id", "call_id"),)

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    call_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("calls.id"))
    sender: Mapped[MessageSender] = mapped_column(Enum(MessageSender, native_enum=False), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    sentiment_score: Mapped[float | None] = mapped_column(Float)

    call: Mapped["Call"] = relationship(back_populates="messages")


class ActionDeliveryStatus(str, enum.Enum):
    pending = "pending"
    success = "success"
    failed = "failed"


class ActionDelivery(Base):
    __tablename__ = "action_deliveries"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    call_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("calls.id"))
    action_type: Mapped[str] = mapped_column(String(50), nullable=False)
    target: Mapped[str | None] = mapped_column(String(255))
    status: Mapped[ActionDeliveryStatus] = mapped_column(Enum(ActionDeliveryStatus), default=ActionDeliveryStatus.pending)
    attempts: Mapped[int] = mapped_column(Integer, default=0)
    last_error: Mapped[str | None] = mapped_column(String(512))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)


class CustomerProfile(Base):
    __tablename__ = "customer_profiles"
    __table_args__ = (
        Index("ix_customer_profiles_business_id", "business_id"),
        Index("ix_customer_profiles_caller_number", "caller_number"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    business_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("businesses.id"))
    caller_number: Mapped[str] = mapped_column(String(32), nullable=False)
    name: Mapped[str | None] = mapped_column(String(255))
    preferences: Mapped[dict | None] = mapped_column(JSONB)
    history: Mapped[dict | None] = mapped_column(JSONB)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
