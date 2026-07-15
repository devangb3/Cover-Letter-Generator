import copy
import logging
import os
import re
import shutil
import subprocess
import tempfile
import traceback
from datetime import datetime

from pypdf import PdfReader, PdfWriter
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


def sanitize_filename_part(value: str) -> str:
    filename = re.sub(r"\s+", "_", str(value or "").strip())
    filename = re.sub(r"[^A-Za-z0-9_-]+", "_", filename)
    filename = re.sub(r"_+", "_", filename)
    return filename.strip("_")


def _resume_filename(company_name: str = "") -> str:
    sanitized_company = sanitize_filename_part(company_name)
    if sanitized_company:
        return f"resume_{sanitized_company}.pdf"
    return f"resume_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"


def write_first_page_pdf(source_path: str, out_path: str):
    reader = PdfReader(source_path)
    if not reader.pages:
        raise ValueError("Compiled resume PDF did not contain any pages")

    writer = PdfWriter()
    writer.add_page(reader.pages[0])
    with open(out_path, "wb") as output_file:
        writer.write(output_file)


def load_resume_yaml(resume_path: str):
    with open(resume_path, "r", encoding="utf-8") as file:
        resume_data = yaml.safe_load(file) or {}

    if not isinstance(resume_data, dict):
        raise ValueError("resume.yaml must contain a mapping at the top level")
    for section in ("profile", "skills", "education", "experience", "projects"):
        if section not in resume_data:
            raise ValueError(f"resume.yaml is missing required section '{section}'")
    return resume_data


def apply_full_resume_draft(resume_data, draft_payload, project_catalog=None):
    updated_resume = copy.deepcopy(resume_data)
    mandatory_experience_ids = [entry.get("id") for entry in resume_data.get("experience", []) if entry.get("id")]
    project_by_id = {}
    for project in resume_data.get("projects", []):
        if project.get("id"):
            project_by_id[project["id"]] = project
    for project in project_catalog or []:
        if project.get("id") and project["id"] not in project_by_id:
            project_by_id[project["id"]] = project

    skills = draft_payload.get("skills")
    if isinstance(skills, list) and skills:
        updated_resume["skills"] = [
            {
                "category": str(skill.get("category", "")).strip(),
                "items": str(skill.get("items", "")).strip(),
            }
            for skill in skills
            if isinstance(skill, dict) and str(skill.get("category", "")).strip() and str(skill.get("items", "")).strip()
        ]

    experience_updates = draft_payload.get("experience") or []
    experience_by_id = {}
    for update in experience_updates:
        if isinstance(update, dict) and update.get("id"):
            experience_by_id[update["id"]] = [
                str(bullet).strip()
                for bullet in update.get("bullets", [])
                if str(bullet).strip()
            ]

    missing_experience = [entry_id for entry_id in mandatory_experience_ids if entry_id not in experience_by_id]
    if missing_experience:
        raise ValueError(f"Full resume draft missed mandatory experience ids: {', '.join(missing_experience)}")

    for entry in updated_resume.get("experience", []):
        entry_id = entry.get("id")
        if entry_id in experience_by_id:
            entry["bullets"] = experience_by_id[entry_id]

    selected_projects = []
    seen_project_ids = set()
    for update in draft_payload.get("projects") or []:
        if not isinstance(update, dict):
            continue
        project_id = update.get("id")
        if not project_id or project_id in seen_project_ids:
            continue
        source_project = project_by_id.get(project_id)
        if not source_project:
            raise ValueError(f"Full resume draft referenced unknown project id '{project_id}'")
        project = copy.deepcopy(source_project)
        project["bullets"] = [
            str(bullet).strip()
            for bullet in update.get("bullets", [])
            if str(bullet).strip()
        ]
        selected_projects.append(project)
        seen_project_ids.add(project_id)

    if not selected_projects:
        raise ValueError("Full resume draft did not select any projects")
    updated_resume["projects"] = selected_projects

    return updated_resume


def _line(text=""):
    return f"{text}\n"


def _href(label, url):
    if not url:
        return escape_latex(label)
    return rf"\href{{{url}}}{{{escape_latex(label)}}}"


def _italic(text):
    return rf"\textit{{{escape_latex(text)}}}"


def _render_header(profile):
    links = profile.get("links", [])
    parts = [escape_latex(profile.get("location", ""))]
    parts.extend(
        [
            escape_latex(profile.get("phone", "")),
            _href(profile.get("email", ""), f"mailto:{profile.get('email', '')}"),
        ]
    )
    for link in links:
        parts.append(_href(link.get("label", ""), link.get("url", "")))

    return [
        _line(r"\begin{center}"),
        _line(rf"{{\fontsize{{15}}{{17}}\selectfont \textbf{{{escape_latex(profile.get('name', ''))}}}}}\\"),
        _line(r"\vspace{3pt}"),
        _line(r"{\fontsize{9.8}{11}\selectfont"),
        _line((r" \quad\textbar\quad ").join(part for part in parts if part)),
        _line(r"}"),
        _line(r"\end{center}"),
        _line(),
        _line(r"\vspace{-2pt}"),
        _line(),
    ]


def _render_itemize(items, itemsep="2pt"):
    lines = [
        _line(
            rf"\begin{{itemize}}[leftmargin=0.28in, topsep=2pt, "
            rf"itemsep={itemsep}, parsep=0pt, partopsep=0pt]"
        )
    ]
    for item in items:
        lines.append(_line(rf"\item {item}"))
    lines.append(_line(r"\end{itemize}"))
    return lines


def _render_skills(skills):
    items = [
        rf"\textbf{{{escape_latex(skill.get('category', ''))}:}} {escape_latex(skill.get('items', ''))}"
        for skill in skills
    ]
    return [
        _line(r"\textbf{Skills}"),
        _line(r"\vspace{-2pt}"),
        *_render_itemize(items, itemsep="1.5pt"),
        _line(),
    ]


def _education_gpa(entry):
    gpa = entry.get("gpa")
    if gpa:
        return gpa
    detail = str(entry.get("detail", ""))
    if detail.lower().startswith("gpa"):
        return detail
    return ""


def _render_education(education):
    lines = [_line(r"\sectionheading{Education}")]
    for index, entry in enumerate(education):
        if index:
            lines.append(_line(r"\vspace{4pt}"))
            lines.append(_line())

        institution = escape_latex(entry.get("institution", ""))
        date = _italic(entry.get("date", ""))
        degree = _italic(entry.get("degree", ""))
        gpa = _education_gpa(entry)
        coursework = entry.get("coursework")

        lines.append(_line(rf"\textbf{{{institution}}} \hfill {date}\\"))
        if gpa:
            line_end = r"\\" if coursework else r"\par"
            lines.append(_line(rf"{degree} \hfill {_italic(gpa)}{line_end}"))
        else:
            line_end = r"\\" if coursework else r"\par"
            lines.append(_line(rf"{degree}{line_end}"))
        if coursework:
            lines.append(_line(rf"Relevant Coursework: {_italic(coursework)}"))
            lines.append(_line())
    return lines


def _render_entry_bullets(bullets):
    return _render_itemize([escape_latex(bullet) for bullet in bullets])


def _render_experience(experience):
    lines = [_line(r"\sectionheading{Experience}")]
    for index, entry in enumerate(experience):
        if index:
            lines.append(_line(r"\vspace{3pt}"))
            lines.append(_line())
        title = escape_latex(entry.get("title", ""))
        dates = escape_latex(entry.get("dates", ""))
        organization = escape_latex(entry.get("organization", ""))
        location = escape_latex(entry.get("location", ""))
        lines.extend(
            [
                _line(rf"\subheading{{{title}}}{{{dates}}}{{{organization}}}{{{location}}}"),
                _line(r"\vspace{-1pt}"),
            ]
        )
        lines.extend(_render_entry_bullets(entry.get("bullets", [])))
    return lines


def _project_meta(entry):
    link = ""
    if entry.get("url"):
        link = rf"\href{{{entry.get('url')}}}{{\textit{{{escape_latex(entry.get('url_label', 'GitHub'))}}}}}"
    return link, _italic(entry.get("context", "")) if entry.get("context") else ""


def _render_projects(projects):
    lines = [_line(r"\sectionheading{Projects}")]
    for index, entry in enumerate(projects):
        if index:
            lines.append(_line(r"\vspace{3pt}"))
            lines.append(_line())
        title = escape_latex(entry.get("title", ""))
        link, context = _project_meta(entry)
        lines.extend(
            [
                _line(rf"\projectheading{{{title}}}{{{link}}}{{{context}}}"),
                _line(r"\vspace{-1pt}"),
            ]
        )
        lines.extend(_render_entry_bullets(entry.get("bullets", [])))
    return lines


def render_resume_tex(resume_data):
    lines = [
        _line(r"\documentclass[10pt]{article}"),
        _line(),
        _line(r"\usepackage[left=0.45in, right=0.45in, top=0.32in, bottom=0.32in]{geometry}"),
        _line(r"\usepackage{iftex}"),
        _line(r"\ifPDFTeX"),
        _line(r"  \usepackage[T1]{fontenc}"),
        _line(r"  \usepackage{helvet}"),
        _line(r"  \renewcommand{\familydefault}{\sfdefault}"),
        _line(r"\else"),
        _line(r"  \usepackage{fontspec}"),
        _line(r"  \setmainfont{Nimbus Sans}"),
        _line(r"\fi"),
        _line(r"\usepackage{enumitem}"),
        _line(r"\usepackage{hyperref}"),
        _line(r"\hypersetup{colorlinks=true,urlcolor=blue}"),
        _line(r"\usepackage{microtype}"),
        _line(),
        _line(r"\pagestyle{empty}"),
        _line(r"\setlength{\parindent}{0pt}"),
        _line(r"\setlength{\parskip}{0pt}"),
        _line(r"\setlength{\tabcolsep}{0pt}"),
        _line(r"\renewcommand{\baselinestretch}{1.04}"),
        _line(),
        _line(r"\newcommand{\sectionheading}[1]{%"),
        _line(r"  \vspace{7pt}"),
        _line(r"  {\large\textbf{#1}}\\[3pt]"),
        _line(r"}"),
        _line(r"\newcommand{\subheading}[4]{%"),
        _line(r"  \textbf{#1} \hfill #2\\"),
        _line(r"  \textit{#3} \hfill #4"),
        _line(r"}"),
        _line(),
        _line(r"\newcommand{\projectheading}[3]{%"),
        _line(r"  \textbf{#1} \hfill #2 \textbar{} #3"),
        _line(r"}"),
        _line(),
        _line(r"\begin{document}"),
        _line(),
    ]
    lines.extend(_render_header(resume_data["profile"]))
    lines.extend(
        [
            _line(r"\fontsize{10}{12}\selectfont"),
            _line(),
        ]
    )
    lines.extend(_render_skills(resume_data["skills"]))
    lines.extend(_render_education(resume_data["education"]))
    lines.extend(_render_experience(resume_data["experience"]))
    lines.append(_line())
    lines.extend(_render_projects(resume_data["projects"]))
    lines.append(_line(r"\end{document}"))
    return "".join(lines)


def render_full_resume_tex(resume_data, draft_payload, project_catalog=None):
    return render_resume_tex(apply_full_resume_draft(resume_data, draft_payload, project_catalog))


def compile_tex_to_pdf(
    tex_content: str,
    company_name: str = "",
    require_single_page: bool = False,
    min_text_chars: int = 0,
):
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
            compiled_pdf_path = os.path.join(td, "resume.pdf")
            reader = PdfReader(compiled_pdf_path)
            page_count = len(reader.pages)
            if require_single_page and page_count > 1:
                return {
                    "ok": False,
                    "pageCount": page_count,
                    "compilerError": (
                        f"Compiled resume was {page_count} pages. Shorten the previous JSON draft "
                        "so the resume fits on exactly one page."
                    ),
                }
            extracted_text = "\n".join(page.extract_text() or "" for page in reader.pages)
            text_chars = len(extracted_text)
            if min_text_chars and text_chars < min_text_chars:
                return {
                    "ok": False,
                    "pageCount": page_count,
                    "textChars": text_chars,
                    "compilerError": (
                        f"Compiled resume fit on one page but only used about {text_chars} extracted text characters. "
                        f"Expand the previous JSON draft toward at least {min_text_chars} extracted text characters while staying on one page."
                    ),
                }
            out_dir = os.path.join(os.path.dirname(__file__), "output")
            os.makedirs(out_dir, exist_ok=True)
            filename = _resume_filename(company_name)
            out_path = os.path.join(out_dir, filename)
            write_first_page_pdf(compiled_pdf_path, out_path)
            return {"ok": True, "resumeFile": filename, "pageCount": page_count, "textChars": text_chars}
    except Exception as exc:
        logger.error("Resume compilation failed: %s", exc)
        logger.error(traceback.format_exc())
        return {"ok": False, "compilerError": str(exc)}
