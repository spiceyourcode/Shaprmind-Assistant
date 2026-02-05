from pydantic import BaseModel


class ActionPointWebhook(BaseModel):
    type: str
    details: dict
