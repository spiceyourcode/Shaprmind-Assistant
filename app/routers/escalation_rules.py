from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.deps import get_current_user, require_owner, require_same_business
from app.db.models import EscalationRule, User
from app.db.session import get_session
from app.schemas.escalation_rules import (
    EscalationRuleCreate,
    EscalationRuleResponse,
    EscalationRuleUpdate,
)


router = APIRouter()


@router.post("/businesses/{business_id}/escalation-rules", response_model=EscalationRuleResponse)
async def create_rule(
    business_id: str,
    payload: EscalationRuleCreate,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> EscalationRuleResponse:
    require_owner(current_user)
    require_same_business(current_user, business_id)
    rule = EscalationRule(
        business_id=business_id,
        keyword_or_phrase=payload.keywords,
        priority=payload.priority,
        action=payload.action,
        notify_user_ids=payload.notify_user_ids,
    )
    session.add(rule)
    await session.commit()
    await session.refresh(rule)
    return EscalationRuleResponse.model_validate(rule)


@router.get("/businesses/{business_id}/escalation-rules", response_model=list[EscalationRuleResponse])
async def list_rules(
    business_id: str,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> list[EscalationRuleResponse]:
    require_same_business(current_user, business_id)
    result = await session.execute(select(EscalationRule).where(EscalationRule.business_id == business_id))
    return [EscalationRuleResponse.model_validate(rule) for rule in result.scalars().all()]


@router.put("/businesses/{business_id}/escalation-rules/{rule_id}", response_model=EscalationRuleResponse)
async def update_rule(
    business_id: str,
    rule_id: str,
    payload: EscalationRuleUpdate,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> EscalationRuleResponse:
    require_owner(current_user)
    require_same_business(current_user, business_id)
    result = await session.execute(select(EscalationRule).where(EscalationRule.id == rule_id))
    rule = result.scalar_one_or_none()
    if not rule:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Rule not found")
    if payload.keywords is not None:
        rule.keyword_or_phrase = payload.keywords
    if payload.priority is not None:
        rule.priority = payload.priority
    if payload.action is not None:
        rule.action = payload.action
    if payload.notify_user_ids is not None:
        rule.notify_user_ids = payload.notify_user_ids
    await session.commit()
    await session.refresh(rule)
    return EscalationRuleResponse.model_validate(rule)


@router.delete("/businesses/{business_id}/escalation-rules/{rule_id}", response_model=dict)
async def delete_rule(
    business_id: str,
    rule_id: str,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> dict:
    require_owner(current_user)
    require_same_business(current_user, business_id)
    result = await session.execute(select(EscalationRule).where(EscalationRule.id == rule_id))
    rule = result.scalar_one_or_none()
    if not rule:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Rule not found")
    await session.delete(rule)
    await session.commit()
    return {"status": "deleted"}
