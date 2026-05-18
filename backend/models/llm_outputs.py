from typing import List

from pydantic import BaseModel, Field


class JobQuestionAnswer(BaseModel):
    question: str = Field(
        ...,
        description="The original application question, preserved exactly as provided.",
    )
    answer: str = Field(
        ...,
        description=(
            "A concise first-person answer grounded only in the provided context "
            "that shows Devang's relevant experience and skills."
        ),
    )


class JobQuestionAnswerResponse(BaseModel):
    answers: List[JobQuestionAnswer] = Field(
        ...,
        description="Answers in the same order as the original application questions.",
    )


class ResumeBulletUpdate(BaseModel):
    id: str = Field(
        ...,
        description="Stable resume.yaml entry id for the experience or project being updated.",
    )
    bullets: List[str] = Field(
        ...,
        description="Replacement bullets for that entry. Preserve the required bullet count.",
    )


class ResumeBulletPatch(BaseModel):
    updates: List[ResumeBulletUpdate] = Field(
        ...,
        description="Bullet replacements for every provided resume tailoring target.",
    )
