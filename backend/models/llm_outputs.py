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


class RecruitingEmailDraft(BaseModel):
    subject: str = Field(
        ...,
        description="A concise email subject tailored to the target company and role.",
    )
    body: str = Field(
        ...,
        description=(
            "A concise outreach email to the recruiting team, recruiter, or founder, "
            "grounded only in the provided candidate and job context."
        ),
    )


class ResumeSkillGroup(BaseModel):
    category: str = Field(
        ...,
        description="Resume skill category, such as Languages, AI/ML, Frameworks, or Cloud/APIs.",
    )
    items: str = Field(
        ...,
        description="Comma-separated skills for this category.",
    )


class FullResumeEntry(BaseModel):
    id: str = Field(
        ...,
        description="Stable id from the provided experience or project catalog.",
    )
    bullets: List[str] = Field(
        ...,
        description="Fresh plain-text bullets for this selected resume entry.",
    )


class FullResumeDraft(BaseModel):
    skills: List[ResumeSkillGroup] = Field(
        ...,
        description="Tailored skills section for the target job.",
    )
    experience: List[FullResumeEntry] = Field(
        ...,
        description="Bullets for every mandatory experience entry.",
    )
    projects: List[FullResumeEntry] = Field(
        ...,
        description="Selected projects and fresh bullets for the target job.",
    )
