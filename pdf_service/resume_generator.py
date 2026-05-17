import logging
import os
import re
import subprocess
import tempfile
import traceback
from datetime import datetime

logger = logging.getLogger("resume_generator")

EXPERIENCE_TITLES = ["Member of Technical Staff", "Software Engineer Intern", "Software Engineer"]
PROJECT_TITLES = ["Causal RL for LLM Agent Post-Training", "Explain and Verify", "ShareX"]


def escape_latex(text: str) -> str:
    replacements = {"\\": r"\textbackslash{}", "&": r"\&", "%": r"\%", "$": r"\$", "#": r"\#", "_": r"\_", "{": r"\{", "}": r"\}", "~": r"\textasciitilde{}", "^": r"\textasciicircum{}"}
    return "".join(replacements.get(ch, ch) for ch in text)


def _extract_section(lines, section_title):
    start = next(i for i, line in enumerate(lines) if f"\\textbf{{{section_title}}}" in line)
    end = len(lines)
    for i in range(start + 1, len(lines)):
        if "\\textbf{" in lines[i] and section_title not in lines[i]:
            end = i
            break
    return start, end


def _replace_bullets_for_titles(lines, section_start, section_end, title_to_bullets):
    i = section_start
    while i < section_end:
        role_match = re.search(r"\\textbf\{([^}]*)\}", lines[i])
        if not role_match:
            i += 1
            continue
        title = role_match.group(1).strip()
        if title not in title_to_bullets:
            i += 1
            continue
        begin = next(j for j in range(i, section_end) if "\\begin{itemize}" in lines[j])
        end = next(j for j in range(begin + 1, section_end) if "\\end{itemize}" in lines[j])
        new_items = [f"\\item {escape_latex(b.strip())}\n" for b in title_to_bullets[title]]
        lines[begin + 1:end] = new_items
        delta = len(new_items) - (end - (begin + 1))
        section_end += delta
        i = end + delta + 1
    return lines


def render_resume_tex(template_path, bullets_payload):
    with open(template_path, "r", encoding="utf-8") as f:
        lines = f.readlines()
    exp_map = {entry["title"]: entry["bullets"] for entry in bullets_payload.get("experience", [])}
    proj_map = {entry["title"]: entry["bullets"] for entry in bullets_payload.get("projects", [])}
    for t in EXPERIENCE_TITLES:
        if t not in exp_map or len(exp_map[t]) != 2:
            raise ValueError(f"Missing or invalid experience bullets for '{t}'")
    for t in PROJECT_TITLES:
        if t not in proj_map or len(proj_map[t]) != 2:
            raise ValueError(f"Missing or invalid project bullets for '{t}'")
    exp_start, exp_end = _extract_section(lines, "Experience")
    proj_start, proj_end = _extract_section(lines, "Projects")
    lines = _replace_bullets_for_titles(lines, exp_start, exp_end, exp_map)
    lines = _replace_bullets_for_titles(lines, proj_start, proj_end, proj_map)
    return "".join(lines)


def compile_tex_to_pdf(tex_content: str):
    try:
        with tempfile.TemporaryDirectory() as td:
            tex_path = os.path.join(td, "resume.tex")
            with open(tex_path, "w", encoding="utf-8") as f:
                f.write(tex_content)
            proc = subprocess.run(["pdflatex", "-interaction=nonstopmode", "resume.tex"], cwd=td, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, timeout=60)
            if proc.returncode != 0 or not os.path.exists(os.path.join(td, "resume.pdf")):
                return {"ok": False, "compilerError": proc.stdout[-3000:]}
            out_dir = os.path.join(os.path.dirname(__file__), "output")
            os.makedirs(out_dir, exist_ok=True)
            filename = f"resume_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
            out_path = os.path.join(out_dir, filename)
            with open(os.path.join(td, "resume.pdf"), "rb") as rf, open(out_path, "wb") as wf:
                wf.write(rf.read())
            return {"ok": True, "resumeFile": filename}
    except Exception as exc:
        logger.error("Resume compilation failed: %s", exc)
        logger.error(traceback.format_exc())
        return {"ok": False, "compilerError": str(exc)}
import copy
import logging
import os
import shutil
import subprocess
import tempfile
import traceback
from datetime import datetime

import yaml

logger = logging.getLogger("resume_generator")


def escape_latex(text: str) -> str:
    replacements = {
        "\\": r"\textbackslash{}",
        "&": r"\&",
        "%": r"\%",
        "$": r"\$",
        "#": r"\#",
        "_": r"\_",
        "{": r"\{",
        "}": r"\}",
        "~": r"\textasciitilde{}",
        "^": r"\textasciicircum{}",
    }
    return "".join(replacements.get(ch, ch) for ch in str(text))


def load_resume_yaml(resume_path: str):
    with open(resume_path, "r", encoding="utf-8") as file:
        resume_data = yaml.safe_load(file) or {}

    if not isinstance(resume_data, dict):
        raise ValueError("resume.yaml must contain a mapping at the top level")
    for section in ("profile", "skills", "education", "experience", "projects"):
        if section not in resume_data:
            raise ValueError(f"resume.yaml is missing required section '{section}'")
    return resume_data


def get_resume_tailoring_targets(resume_data):
    targets = []
    for section_name in ("experience", "projects"):
        for entry in resume_data.get(section_name, []):
            bullets = entry.get("bullets") or []
            entry_id = entry.get("id")
            title = entry.get("title")
            if not entry_id or not title:
                raise ValueError(f"Every {section_name} entry needs an id and title")
            targets.append(
                {
                    "id": entry_id,
                    "section": section_name,
                    "title": title,
                    "organization": entry.get("organization", ""),
                    "bullet_count": len(bullets),
                    "current_bullets": bullets,
                }
            )
    return targets


def apply_bullet_updates(resume_data, bullet_payload):
    updated_resume = copy.deepcopy(resume_data)
    known_ids = {target["id"] for target in get_resume_tailoring_targets(resume_data)}
    updates = bullet_payload.get("updates")
    if not isinstance(updates, list):
        raise ValueError("Resume bullet response did not include an 'updates' array")

    update_by_id = {}
    for update in updates:
        if not isinstance(update, dict):
            raise ValueError("Every resume bullet update must be an object")
        entry_id = update.get("id")
        bullets = update.get("bullets")
        if not entry_id or not isinstance(bullets, list):
            raise ValueError("Every resume bullet update needs an id and bullets array")
        if entry_id not in known_ids:
            raise ValueError(f"Resume bullet update referenced unknown id '{entry_id}'")
        if entry_id in update_by_id:
            raise ValueError(f"Resume bullet response included duplicate update for '{entry_id}'")
        update_by_id[entry_id] = [str(bullet).strip() for bullet in bullets if str(bullet).strip()]

    for section_name in ("experience", "projects"):
        for entry in updated_resume.get(section_name, []):
            entry_id = entry.get("id")
            if entry_id not in update_by_id:
                raise ValueError(f"Missing resume bullet update for '{entry_id}'")

            existing_bullets = entry.get("bullets") or []
            new_bullets = update_by_id[entry_id]
            if len(new_bullets) != len(existing_bullets):
                raise ValueError(
                    f"Resume bullet update for '{entry_id}' must contain "
                    f"{len(existing_bullets)} bullets"
                )
            entry["bullets"] = new_bullets

    return updated_resume


def _line(text=""):
    return f"{text}\n"


def _render_contact_link(label, url):
    if not url:
        return escape_latex(label)
    if url.startswith("mailto:"):
        href = url
    else:
        href = url
    return rf"\href{{{href}}}{{{escape_latex(label)}}}"


def _render_header(profile):
    links = profile.get("links", [])
    parts = [escape_latex(profile.get("phone", "")), _render_contact_link(profile.get("email", ""), f"mailto:{profile.get('email', '')}")]
    for link in links:
        parts.append(_render_contact_link(link.get("label", ""), link.get("url", "")))

    return [
        _line(r"\begin{center}"),
        _line(rf"{{\fontsize{{15}}{{17}}\selectfont \textbf{{{escape_latex(profile.get('name', ''))}}}}}\\"),
        _line(r"\vspace{2pt}"),
        _line((r" \quad\textbar\quad ").join(part for part in parts if part)),
        _line(r"\end{center}"),
        _line(),
    ]


def _render_section_header(title, vspace="-6pt"):
    return [
        _line(rf"\noindent\textbf{{{escape_latex(title)}}}"),
        _line(rf"\vspace{{{vspace}}}"),
    ]


def _render_itemize(items, itemsep="-5pt"):
    lines = [_line(rf"\begin{{itemize}}[leftmargin=0.45in, topsep=2pt, itemsep={itemsep}]")]
    for item in items:
        lines.append(_line(rf"\item {item}"))
    lines.append(_line(r"\end{itemize}"))
    return lines


def _render_skills(skills):
    items = [
        rf"\textbf{{{escape_latex(skill.get('category', ''))}:}} {escape_latex(skill.get('items', ''))}"
        for skill in skills
    ]
    return _render_section_header("Skills") + _render_itemize(items)


def _render_education(education):
    items = []
    for entry in education:
        degree = escape_latex(entry.get("degree", ""))
        institution = escape_latex(entry.get("institution", ""))
        detail = entry.get("detail", "")
        date = escape_latex(entry.get("date", ""))
        left = f"{degree}, {institution}"
        if detail:
            left = f"{left} ({escape_latex(detail)})"
        items.append(rf"{left} \hfill \textit{{{date}}}")
    return _render_section_header("Education") + _render_itemize(items)


def _render_entry_bullets(bullets):
    return _render_itemize([escape_latex(bullet) for bullet in bullets])


def _render_experience(experience):
    lines = _render_section_header("Experience", vspace="-3pt")
    for index, entry in enumerate(experience):
        if index:
            lines.append(_line(r"\vspace{-6pt}"))
        title = escape_latex(entry.get("title", ""))
        organization = escape_latex(entry.get("organization", ""))
        dates = escape_latex(entry.get("dates", ""))
        lines.extend(
            [
                _line(rf"\noindent\textbf{{{title}}} \textit{{{organization}}} \hfill {dates}"),
                _line(r"\vspace{-6pt}"),
            ]
        )
        lines.extend(_render_entry_bullets(entry.get("bullets", [])))
    return lines


def _render_project_suffix(entry):
    suffix_parts = []
    if entry.get("url"):
        suffix_parts.append(rf"\href{{{entry.get('url')}}}{{\textit{{{escape_latex(entry.get('url_label', 'GitHub'))}}}}}")
    if entry.get("context"):
        suffix_parts.append(rf"\textit{{{escape_latex(entry.get('context'))}}}")
    if not suffix_parts:
        return ""
    return r" \hfill " + r" \textbar{} ".join(suffix_parts)


def _render_projects(projects):
    lines = _render_section_header("Projects")
    for index, entry in enumerate(projects):
        if index:
            lines.append(_line(r"\vspace{-6pt}"))
        title = escape_latex(entry.get("title", ""))
        lines.extend(
            [
                _line(rf"\noindent\textbf{{{title}}}{_render_project_suffix(entry)}"),
                _line(r"\vspace{-6pt}"),
            ]
        )
        lines.extend(_render_entry_bullets(entry.get("bullets", [])))
    return lines


def render_resume_tex(resume_data):
    lines = [
        _line(r"\documentclass[11pt]{article}"),
        _line(r"\usepackage[left=0.5in, right=0.5in, top=0.3in, bottom=0.3in]{geometry}"),
        _line(r"\usepackage{helvet}"),
        _line(r"\renewcommand{\familydefault}{\sfdefault}"),
        _line(r"\usepackage{setspace}"),
        _line(r"\usepackage{parskip}"),
        _line(r"\usepackage{enumitem}"),
        _line(r"\usepackage{hyperref}"),
        _line(r"\hypersetup{colorlinks=true,urlcolor=blue}"),
        _line(),
        _line(r"\pagestyle{empty}"),
        _line(r"\newcommand{\customspacing}{\setstretch{1.05}}"),
        _line(),
        _line(r"\begin{document}"),
        _line(),
    ]
    lines.extend(_render_header(resume_data["profile"]))
    lines.extend(
        [
            _line(r"\fontsize{10.5}{12}\selectfont"),
            _line(r"\customspacing"),
            _line(),
        ]
    )
    lines.extend(_render_skills(resume_data["skills"]))
    lines.append(_line(r"\vspace{-6pt}"))
    lines.extend(_render_education(resume_data["education"]))
    lines.append(_line(r"\vspace{-6pt}"))
    lines.extend(_render_experience(resume_data["experience"]))
    lines.append(_line())
    lines.extend(_render_projects(resume_data["projects"]))
    lines.append(_line(r"\end{document}"))
    return "".join(lines)


def render_tailored_resume_tex(resume_data, bullet_payload):
    return render_resume_tex(apply_bullet_updates(resume_data, bullet_payload))


def compile_tex_to_pdf(tex_content: str):
    try:
        work_root = os.path.join(os.path.dirname(__file__), "build")
        os.makedirs(work_root, exist_ok=True)
        with tempfile.TemporaryDirectory(dir=work_root) as td:
            tex_path = os.path.join(td, "resume.tex")
            with open(tex_path, "w", encoding="utf-8") as f:
                f.write(tex_content)
            if shutil.which("pdflatex"):
                command = ["pdflatex", "-interaction=nonstopmode", "resume.tex"]
                env = None
            elif shutil.which("tectonic"):
                command = ["tectonic", "resume.tex"]
                cache_root = os.path.join(work_root, "tectonic-cache")
                os.makedirs(cache_root, exist_ok=True)
                env = {**os.environ, "XDG_CACHE_HOME": cache_root}
            else:
                return {"ok": False, "compilerError": "Neither pdflatex nor tectonic is installed"}

            proc = subprocess.run(
                command,
                cwd=td,
                env=env,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                timeout=60,
            )
            if proc.returncode != 0 or not os.path.exists(os.path.join(td, "resume.pdf")):
                return {"ok": False, "compilerError": proc.stdout[-3000:]}
            out_dir = os.path.join(os.path.dirname(__file__), "output")
            os.makedirs(out_dir, exist_ok=True)
            filename = f"resume_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
            out_path = os.path.join(out_dir, filename)
            with open(os.path.join(td, "resume.pdf"), "rb") as rf, open(out_path, "wb") as wf:
                wf.write(rf.read())
            return {"ok": True, "resumeFile": filename}
    except Exception as exc:
        logger.error("Resume compilation failed: %s", exc)
        logger.error(traceback.format_exc())
        return {"ok": False, "compilerError": str(exc)}
