"""Saved candidate views for generation and rendering."""
from backend.storage.local import get_profile


def personal_info():
    candidate = get_profile()
    if not candidate:
        raise ValueError("Save your profile before generating application materials.")
    contact = candidate["profile"]
    return {**contact, "address": contact["location"]}


def resume_data():
    candidate = get_profile()
    if not candidate:
        raise ValueError("Save your profile before generating application materials.")
    contact = candidate["profile"]
    contact["links"] = [{"label": label, "url": contact[key]} for key, label in
                        (("linkedin", "LinkedIn"), ("website", "Portfolio"), ("github", "GitHub")) if contact[key]]
    return candidate
