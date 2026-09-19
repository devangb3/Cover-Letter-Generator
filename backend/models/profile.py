"""Candidate schemas and validation, independent of storage and HTTP."""
from uuid import uuid4

from pydantic import BaseModel, ConfigDict, Field, StrictStr


class Record(BaseModel):
    model_config = ConfigDict(extra="forbid")


class Contact(Record):
    name: StrictStr = ""
    email: StrictStr = ""
    phone: StrictStr = ""
    location: StrictStr = ""
    linkedin: StrictStr = ""
    website: StrictStr = ""
    github: StrictStr = ""


class Skill(Record):
    category: StrictStr = ""
    items: StrictStr = ""


class Education(Record):
    institution: StrictStr = ""
    degree: StrictStr = ""
    date: StrictStr = ""
    gpa: StrictStr = ""
    coursework: StrictStr = ""


class Experience(Record):
    id: StrictStr = ""
    title: StrictStr = ""
    organization: StrictStr = ""
    dates: StrictStr = ""
    location: StrictStr = ""
    bullets: list[StrictStr] = Field(default_factory=list)


class Project(Record):
    id: StrictStr = ""
    title: StrictStr = ""
    url: StrictStr = ""
    context: StrictStr = ""
    bullets: list[StrictStr] = Field(default_factory=list)


class Candidate(Record):
    profile: Contact = Field(default_factory=Contact)
    skills: list[Skill] = Field(default_factory=list)
    education: list[Education] = Field(default_factory=list)
    experience: list[Experience] = Field(default_factory=list)
    projects: list[Project] = Field(default_factory=list)


class Preferences(Record):
    defaultModel: StrictStr = ""
    instructions: StrictStr = ""


def normalize_candidate(payload, require_name=True):
    candidate = Candidate.model_validate(payload).model_dump()
    if require_name and not candidate["profile"]["name"].strip():
        raise ValueError("Please enter your name before saving the profile.")
    for section in ("experience", "projects"):
        seen = set()
        for entry in candidate[section]:
            entry["id"] = entry["id"] or uuid4().hex
            if entry["id"] in seen:
                raise ValueError(f"Duplicate {section} id")
            seen.add(entry["id"])
    return candidate


