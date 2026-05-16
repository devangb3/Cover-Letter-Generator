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
