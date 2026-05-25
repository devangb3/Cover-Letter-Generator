import React, { useEffect, useState } from 'react';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'https://cover-letter-generator-424176252593.us-central1.run.app';

const INITIAL_PERSONAL_INFO = {
  name: '',
  email: '',
  phone: '',
  address: '',
  linkedin: '',
  website: '',
  github: '',
};

const DEFAULT_PANEL_WIDTH = 480;
const MIN_PANEL_WIDTH = 300;
const MAX_PANEL_WIDTH = 900;

function clampPanelWidth(width, containerWidth = MAX_PANEL_WIDTH + MIN_PANEL_WIDTH) {
  const maxWidth = Math.max(
    MIN_PANEL_WIDTH,
    Math.min(MAX_PANEL_WIDTH, containerWidth - MIN_PANEL_WIDTH)
  );
  return Math.max(MIN_PANEL_WIDTH, Math.min(maxWidth, width));
}

function personalInfoForRequest(personalInfo) {
  const { github: _uiOnly, ...rest } = personalInfo;
  return rest;
}

async function copyTextToClipboard(text) {
  if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    await navigator.clipboard.writeText(text);
    return;
  }
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.left = '-9999px';
  document.body.appendChild(textarea);
  textarea.select();
  const ok = document.execCommand('copy');
  document.body.removeChild(textarea);
  if (!ok) throw new Error('Unable to copy to clipboard');
}

/* ─── SVG Icons ───────────────────────────────────── */

function DocIcon({ className }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

function UserIcon({ className }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function BriefcaseIcon({ className }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}

function ListIcon({ className }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  );
}

function MailIcon({ className }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

function MessageIcon({ className }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function DownloadIcon({ className }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

/* ─── Small components ────────────────────────────── */

function Spinner() {
  return <span className="spinner" aria-hidden />;
}

function CopyUrlWidgetButton({ label, textToCopy }) {
  const trimmed = typeof textToCopy === 'string' ? textToCopy.trim() : '';
  const handleCopy = async () => {
    if (!trimmed) return;
    try { await copyTextToClipboard(trimmed); }
    catch (err) { console.error('Copy failed:', err); }
  };
  return (
    <button type="button" className="copy-url-widget" onClick={handleCopy} disabled={!trimmed} title="Copy URL" aria-label={`Copy ${label}`}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
      </svg>
    </button>
  );
}

function PersonalUrlFieldRow({ id, name, label, value, onChange, placeholder }) {
  return (
    <div className="form-group">
      <div className="label-row-with-copy">
        <label htmlFor={id}>{label}</label>
        <CopyUrlWidgetButton label={label} textToCopy={value} />
      </div>
      <input type="text" id={id} name={name} value={value} onChange={onChange} placeholder={placeholder} />
    </div>
  );
}

function SectionHeader({ icon: Icon, label }) {
  return (
    <div className="section-header">
      <Icon className="section-header-icon" />
      <span className="section-header-label">{label}</span>
      <span className="section-header-line" />
    </div>
  );
}

/* ─── Main App ────────────────────────────────────── */

function App() {
  const [jobDescription, setJobDescription] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [customInstructions, setCustomInstructions] = useState('');
  const [jobQuestions, setJobQuestions] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [modelOptions, setModelOptions] = useState([]);
  const [modelLoadError, setModelLoadError] = useState(null);
  const [modelsLoading, setModelsLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState(null);
  const [coverLetterResult, setCoverLetterResult] = useState(null);
  const [editableCoverLetter, setEditableCoverLetter] = useState('');
  const [questionAnswers, setQuestionAnswers] = useState([]);
  const [generatedResumeFile, setGeneratedResumeFile] = useState(null);
  const [activeOutputTab, setActiveOutputTab] = useState(null);
  const [error, setError] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [pdfError, setPdfError] = useState(null);
  const [resumeWarning, setResumeWarning] = useState(null);
  const [questionError, setQuestionError] = useState(null);
  const [personalInfo, setPersonalInfo] = useState(INITIAL_PERSONAL_INFO);

  /* Resize state */
  const [panelWidth, setPanelWidth] = useState(DEFAULT_PANEL_WIDTH);
  const [isDragging, setIsDragging] = useState(false);

  const isGeneratingCoverLetter = loadingAction === 'cover-letter';
  const isAnsweringQuestions = loadingAction === 'question-answers';
  const isDownloadingPdf = loadingAction === 'pdf-download';
  const isGeneratingResume = loadingAction === 'resume-generate';
  const isGeneratingFullResume = loadingAction === 'full-resume-generate';
  const isBusy = Boolean(loadingAction);
  const hasOutput = coverLetterResult || questionAnswers.length > 0 || generatedResumeFile;
  const hasError = error || apiError || pdfError || questionError;

  /* ─── Resize drag logic ─────────────────────────── */

  const resizePanelFromPointer = (e) => {
    const container = e.currentTarget.parentElement;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    setPanelWidth(clampPanelWidth(e.clientX - rect.left, rect.width));
  };

  const handleResizePointerDown = (e) => {
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    resizePanelFromPointer(e);
    e.preventDefault();
  };

  const handleResizePointerMove = (e) => {
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
    resizePanelFromPointer(e);
  };

  const stopResizeDrag = (e) => {
    if (e.currentTarget.hasPointerCapture?.(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    setIsDragging(false);
  };

  /* ─── Personal info ─────────────────────────────── */

  const handlePersonalInfoChange = (e) => {
    const { name, value } = e.target;
    setPersonalInfo((prev) => ({ ...prev, [name]: value }));
  };

  /* ─── Model loading ─────────────────────────────── */

  useEffect(() => {
    const loadModels = async () => {
      setModelsLoading(true);
      setModelLoadError(null);
      try {
        const response = await fetch(`${API_URL}/api/models`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to load model list');
        const models = Array.isArray(data.models) ? data.models : [];
        if (!models.length) throw new Error('No models configured on backend');
        setModelOptions(models);
        setSelectedModel(data.defaultModel || models[0].slug);
      } catch (err) {
        console.error('Error loading models:', err);
        setModelLoadError(err.message || 'Failed to load model list');
      } finally {
        setModelsLoading(false);
      }
    };
    loadModels();
  }, []);

  /* ─── Helpers ───────────────────────────────────── */

  const renderTextContent = (text) => {
    if (!text) return <p>No data available</p>;
    if (typeof text === 'string') {
      return text.split('\n\n').map((paragraph, index) => <p key={index}>{paragraph}</p>);
    }
    if (typeof text === 'object') return <p>{JSON.stringify(text)}</p>;
    return <p>{String(text)}</p>;
  };

  const formatResumeWarning = (warning) => {
    if (!warning) return '';
    return String(warning).split('Latest PDF result:')[0].trim();
  };

  const validateSharedFields = () => {
    if (!personalInfo.name || !personalInfo.email || !personalInfo.phone) {
      return 'Please provide your name, email, and phone in Personal Info';
    }
    if (!companyName.trim()) return 'Please provide the company name';
    if (!jobDescription.trim()) return 'Please provide the job description';
    if (modelLoadError) return 'Unable to load model configuration. Please refresh and try again.';
    if (!selectedModel) return 'Please select an AI model';
    return null;
  };

  const buildRequestPayload = () => ({
    jobDescription,
    companyName,
    customInstructions,
    personalInfo: personalInfoForRequest(personalInfo),
    model: selectedModel,
  });

  const clearErrors = () => {
    setError(null);
    setApiError(null);
    setPdfError(null);
    setResumeWarning(null);
    setQuestionError(null);
  };

  /* ─── Action handlers ───────────────────────────── */

  const handleGenerateCoverLetter = async () => {
    const validationError = validateSharedFields();
    if (validationError) { setError(validationError); return; }
    setLoadingAction('cover-letter');
    clearErrors();
    setCoverLetterResult(null);
    setEditableCoverLetter('');
    try {
      const res = await fetch(`${API_URL}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildRequestPayload()),
      });
      const data = await res.json();
      if (!res.ok || data.error) { setApiError(data.error || 'Failed to generate cover letter'); return; }
      const sanitized = {
        ...data,
        personalInfo: personalInfoForRequest(personalInfo),
        companyName,
        coverLetter: typeof data.coverLetter === 'string' ? data.coverLetter : JSON.stringify(data.coverLetter),
      };
      setCoverLetterResult(sanitized);
      setEditableCoverLetter(sanitized.coverLetter);
      setActiveOutputTab('cover-letter');
    } catch (err) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleDownloadCoverLetter = async () => {
    if (!coverLetterResult) return;
    if (!editableCoverLetter.trim()) { setPdfError('Please add cover letter text before downloading.'); return; }
    setLoadingAction('pdf-download');
    setError(null);
    setPdfError(null);
    try {
      const res = await fetch(`${API_URL}/api/generate-pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...coverLetterResult, personalInfo: personalInfoForRequest(personalInfo), companyName, coverLetter: editableCoverLetter }),
      });
      const data = await res.json();
      if (!res.ok || data.error) { setPdfError(data.error || 'Failed to generate PDF'); return; }
      const file = data.coverLetterFile;
      if (!file) { setPdfError('PDF generation completed without a downloadable file.'); return; }
      const link = document.createElement('a');
      link.href = `${API_URL}/api/download/${file}`;
      link.download = file;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      setPdfError(err.message || 'An unexpected error occurred while preparing the PDF');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleGenerateResume = async () => {
    const validationError = validateSharedFields();
    if (validationError) { setError(validationError); return; }
    setLoadingAction('resume-generate');
    clearErrors();
    setGeneratedResumeFile(null);
    try {
      const res = await fetch(`${API_URL}/api/generate-resume`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildRequestPayload()),
      });
      const data = await res.json();
      if (!res.ok || data.error) { setPdfError(data.error || data.compilerError || 'Failed to generate resume PDF'); return; }
      if (data.resumeFile) {
        setGeneratedResumeFile(data.resumeFile);
        setActiveOutputTab('resume');
      }
    } catch (err) {
      setPdfError(err.message || 'An unexpected error occurred while generating resume');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleGenerateFullResume = async () => {
    const validationError = validateSharedFields();
    if (validationError) { setError(validationError); return; }
    setLoadingAction('full-resume-generate');
    clearErrors();
    setGeneratedResumeFile(null);
    try {
      const res = await fetch(`${API_URL}/api/generate-full-resume`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildRequestPayload()),
      });
      const data = await res.json();
      if (!res.ok || data.error) { setPdfError(data.error || data.compilerError || 'Failed to generate full resume PDF'); return; }
      if (data.resumeFile) {
        setGeneratedResumeFile(data.resumeFile);
        setResumeWarning(data.warning || null);
        setActiveOutputTab('resume');
      }
    } catch (err) {
      setPdfError(err.message || 'An unexpected error occurred while generating the full resume');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleDownloadResume = () => {
    if (!generatedResumeFile) return;
    const link = document.createElement('a');
    link.href = `${API_URL}/api/download/${generatedResumeFile}`;
    link.download = generatedResumeFile;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAnswerQuestions = async () => {
    const validationError = validateSharedFields();
    if (validationError) { setError(validationError); return; }
    if (!jobQuestions.trim()) { setError('Please paste your application questions in the Questions section'); return; }
    setLoadingAction('question-answers');
    clearErrors();
    setQuestionAnswers([]);
    try {
      const res = await fetch(`${API_URL}/api/answer-questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...buildRequestPayload(), questions: jobQuestions }),
      });
      const data = await res.json();
      if (!res.ok || data.error) { setQuestionError(data.error || 'Failed to answer application questions'); return; }
      const answers = Array.isArray(data.answers) ? data.answers : [];
      if (!answers.length) { setQuestionError('No answers were returned.'); return; }
      setQuestionAnswers(answers);
      setActiveOutputTab('answers');
    } catch (err) {
      setQuestionError(err.message || 'An unexpected error occurred');
    } finally {
      setLoadingAction(null);
    }
  };

  /* ─── Render ────────────────────────────────────── */

  return (
    <div className="app-shell" style={{ cursor: isDragging ? 'col-resize' : undefined, userSelect: isDragging ? 'none' : undefined }}>
      {resumeWarning && (
        <div className="top-warning" role="status" aria-live="polite">
          <div>
            <strong>Resume warning</strong>
            <span>{formatResumeWarning(resumeWarning)}</span>
          </div>
          <button type="button" onClick={() => setResumeWarning(null)}>Dismiss</button>
        </div>
      )}

      {/* ── Header ────────────────────────────────── */}
      <header className="app-header">
        <div className="header-brand">
          <DocIcon className="header-brand-icon" />
          Cover Letter Generator
        </div>

        {/* Action buttons */}
        <div className="header-actions">
          <button
            type="button"
            className="header-btn header-btn-cover"
            onClick={handleGenerateCoverLetter}
            disabled={isBusy || modelsLoading || !!modelLoadError || !selectedModel}
            title="Generate a tailored cover letter"
          >
            {isGeneratingCoverLetter ? <><Spinner /> Generating…</> : <><MailIcon /> Cover Letter</>}
          </button>
          <button
            type="button"
            className="header-btn header-btn-questions"
            onClick={handleAnswerQuestions}
            disabled={isBusy || modelsLoading || !!modelLoadError || !selectedModel}
            title="Answer application questions"
          >
            {isAnsweringQuestions ? <><Spinner /> Answering…</> : <><MessageIcon /> Answer Questions</>}
          </button>
          <button
            type="button"
            className="header-btn header-btn-resume"
            onClick={handleGenerateResume}
            disabled={isBusy || modelsLoading || !!modelLoadError || !selectedModel}
            title="Generate a tailored resume PDF"
          >
            {isGeneratingResume ? <><Spinner /> Generating…</> : <><DocIcon /> Resume PDF</>}
          </button>
          <button
            type="button"
            className="header-btn header-btn-full-resume"
            onClick={handleGenerateFullResume}
            disabled={isBusy || modelsLoading || !!modelLoadError || !selectedModel}
            title="Generate a new one-page resume PDF"
          >
            {isGeneratingFullResume ? <><Spinner /> Generating…</> : <><DocIcon /> Full Resume</>}
          </button>
        </div>

        {/* Model selector */}
        <div className="header-meta">
          {modelsLoading ? (
            <span className="model-status-text">Loading…</span>
          ) : modelLoadError ? (
            <span className="model-error-text">{modelLoadError}</span>
          ) : (
            <>
              <span className="header-label">Model</span>
              <select
                className="model-select-inline"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                disabled={isBusy}
                aria-label="AI Model"
              >
                {modelOptions.map((m) => (
                  <option key={m.slug} value={m.slug}>{m.label}</option>
                ))}
              </select>
            </>
          )}
        </div>
      </header>

      {/* ── Body ──────────────────────────────────── */}
      <div className="app-body">

        {/* Left: Input Panel */}
        <div
          className="input-panel"
          style={{ width: panelWidth, minWidth: panelWidth, maxWidth: panelWidth }}
        >
          <div className="panel-scroll">

            {/* Personal Info */}
            <div className="input-section">
              <SectionHeader icon={UserIcon} label="Personal Info" />
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Full Name *</label>
                  <input type="text" id="name" name="name" value={personalInfo.name} onChange={handlePersonalInfoChange} placeholder="Devang Borkar" required />
                </div>
                <div className="form-group">
                  <label htmlFor="phone">Phone *</label>
                  <input type="tel" id="phone" name="phone" value={personalInfo.phone} onChange={handlePersonalInfoChange} placeholder="+1 (555) 000-0000" required />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input type="email" id="email" name="email" value={personalInfo.email} onChange={handlePersonalInfoChange} placeholder="you@example.com" required />
              </div>
              <div className="form-group">
                <label htmlFor="address">Address</label>
                <input type="text" id="address" name="address" value={personalInfo.address} onChange={handlePersonalInfoChange} placeholder="City, State" />
              </div>
              <div className="form-row">
                <PersonalUrlFieldRow id="linkedin" name="linkedin" label="LinkedIn" value={personalInfo.linkedin} onChange={handlePersonalInfoChange} placeholder="https://linkedin.com/in/…" />
                <PersonalUrlFieldRow id="website" name="website" label="Portfolio" value={personalInfo.website} onChange={handlePersonalInfoChange} placeholder="https://yoursite.com" />
              </div>
              <PersonalUrlFieldRow id="github" name="github" label="GitHub" value={personalInfo.github} onChange={handlePersonalInfoChange} placeholder="https://github.com/devangb3" />
            </div>

            <div className="section-sep" />

            {/* Job Details */}
            <div className="input-section">
              <SectionHeader icon={BriefcaseIcon} label="Job Details" />
              <div className="form-group">
                <label htmlFor="companyName">Company Name *</label>
                <input type="text" id="companyName" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Acme Corp" required />
              </div>
              <div className="form-group">
                <div className="field-meta">
                  <label htmlFor="jobDescription">Job Description *</label>
                  {jobDescription.length > 0 && (
                    <span className="char-count">{jobDescription.length.toLocaleString()} chars</span>
                  )}
                </div>
                <textarea id="jobDescription" value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} rows="9" placeholder="Paste the full job description here…" required />
              </div>
              <div className="form-group">
                <label htmlFor="customInstructions">Custom Instructions</label>
                <textarea id="customInstructions" value={customInstructions} onChange={(e) => setCustomInstructions(e.target.value)} rows="3" placeholder="Specific focuses, career goals, or extra context to highlight." />
              </div>
            </div>

            <div className="section-sep" />

            {/* Application Questions */}
            <div className="input-section">
              <SectionHeader icon={ListIcon} label="Application Questions" />
              <div className="form-group">
                <div className="field-meta">
                  <label htmlFor="jobQuestions">Screening Questions</label>
                  {jobQuestions.trim() && (
                    <span className="char-count">
                      {jobQuestions.trim().split('\n').filter(Boolean).length} lines
                    </span>
                  )}
                </div>
                <textarea
                  id="jobQuestions"
                  value={jobQuestions}
                  onChange={(e) => setJobQuestions(e.target.value)}
                  rows="8"
                  placeholder={'Why do you want to work at this company?\nDescribe your experience with Python and backend APIs.\nWhat makes you a fit for this role?'}
                />
              </div>
            </div>

          </div>
        </div>

        {/* Drag handle */}
        <div
          className={`resize-handle${isDragging ? ' is-dragging' : ''}`}
          onPointerDown={handleResizePointerDown}
          onPointerMove={handleResizePointerMove}
          onPointerUp={stopResizeDrag}
          onPointerCancel={stopResizeDrag}
          onLostPointerCapture={() => setIsDragging(false)}
          onDoubleClick={() => setPanelWidth(DEFAULT_PANEL_WIDTH)}
          title="Drag to resize. Double-click to reset."
          aria-label="Resize sidebar"
          role="separator"
          aria-orientation="vertical"
          aria-valuemin={MIN_PANEL_WIDTH}
          aria-valuemax={MAX_PANEL_WIDTH}
          aria-valuenow={panelWidth}
        />

        {/* Right: Output Panel */}
        <div className={`output-panel${activeOutputTab === 'resume' && hasOutput ? ' output-panel--pdf-only' : ''}`}>

          {/* Output tabs */}
          {hasOutput && (
            <div className="output-tabs">
              {coverLetterResult && (
                <button
                  className={`output-tab output-tab--blue${activeOutputTab === 'cover-letter' ? ' active' : ''}`}
                  onClick={() => setActiveOutputTab('cover-letter')}
                >
                  Cover Letter
                </button>
              )}
              {questionAnswers.length > 0 && (
                <button
                  className={`output-tab output-tab--violet${activeOutputTab === 'answers' ? ' active' : ''}`}
                  onClick={() => setActiveOutputTab('answers')}
                >
                  Answers
                </button>
              )}
              {generatedResumeFile && (
                <button
                  className={`output-tab output-tab--amber${activeOutputTab === 'resume' ? ' active' : ''}`}
                  onClick={() => setActiveOutputTab('resume')}
                >
                  Resume PDF
                </button>
              )}
            </div>
          )}

          {/* Errors (always visible regardless of tab) */}
          {error && (
            <div className="error-message"><h3>Validation Error</h3><p>{error}</p></div>
          )}
          {apiError && activeOutputTab === 'cover-letter' && (
            <div className="error-message"><h3>API Error</h3><p>{apiError}</p></div>
          )}
          {pdfError && activeOutputTab === 'resume' && (
            <div className="error-message"><h3>PDF Error</h3><p>{pdfError}</p></div>
          )}
          {questionError && activeOutputTab === 'answers' && (
            <div className="error-message"><h3>Question Error</h3><p>{questionError}</p></div>
          )}

          {/* Cover letter tab */}
          {activeOutputTab === 'cover-letter' && coverLetterResult && (
            <div className="result-section">
              <div className="result-section-header">
                <h2 className="result-section-title">Generated Cover Letter</h2>
                <button
                  type="button"
                  className="icon-download-btn"
                  onClick={handleDownloadCoverLetter}
                  disabled={isBusy || !editableCoverLetter.trim()}
                  title="Download as PDF"
                >
                  {isDownloadingPdf ? <Spinner /> : <DownloadIcon />}
                </button>
              </div>
              <div className="form-group">
                <textarea
                  id="coverLetterEditor"
                  className="cover-letter-editor"
                  value={editableCoverLetter}
                  onChange={(e) => setEditableCoverLetter(e.target.value)}
                  rows="18"
                />
              </div>
            </div>
          )}

          {/* Answers tab */}
          {activeOutputTab === 'answers' && questionAnswers.length > 0 && (
            <div className="result-section">
              <h2 className="result-section-title violet">Application Answers</h2>
              <div className="qa-list">
                {questionAnswers.map((item, index) => (
                  <div className="qa-card" key={`${item.question}-${index}`}>
                    <div className="qa-card-num">Question {index + 1}</div>
                    <p className="qa-question">{item.question}</p>
                    <div className="qa-answer">{renderTextContent(item.answer)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Resume PDF tab — fills the panel */}
          {activeOutputTab === 'resume' && generatedResumeFile && (
            <div className="resume-pdf-section resume-pdf-full">
              <object
                data={`${API_URL}/api/view/${generatedResumeFile}`}
                type="application/pdf"
                className="resume-pdf-object"
                aria-label="Tailored Resume PDF"
              >
                <p style={{ padding: '1rem', color: 'var(--text-muted)' }}>
                  PDF cannot be displayed.{' '}
                  <a href={`${API_URL}/api/download/${generatedResumeFile}`} download style={{ color: 'var(--accent)' }}>
                    Download it instead.
                  </a>
                </p>
              </object>
            </div>
          )}

          {/* Empty state */}
          {!hasOutput && !hasError && (
            <div className="output-empty">
              <DocIcon className="output-empty-icon" />
              <h3>Output will appear here</h3>
              <p>Fill in the sidebar, then hit one of the buttons in the toolbar to generate.</p>
              <div className="output-empty-chips">
                <span className="output-chip blue">Cover Letter</span>
                <span className="output-chip violet">Answer Questions</span>
                <span className="output-chip amber">Resume PDF</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default App;
