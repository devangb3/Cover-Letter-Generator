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
  github: ''
};

/** UI-only field; never sent to the API. */
function personalInfoForRequest(personalInfo) {
  const { github: _uiOnly, ...rest } = personalInfo;
  return rest;
}

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
  const [questionAnswers, setQuestionAnswers] = useState([]);
  const [error, setError] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [pdfError, setPdfError] = useState(null);
  const [questionError, setQuestionError] = useState(null);
  const [file, setFile] = useState(null);
  const [personalInfo, setPersonalInfo] = useState(INITIAL_PERSONAL_INFO);

  const isGeneratingCoverLetter = loadingAction === 'cover-letter';
  const isAnsweringQuestions = loadingAction === 'question-answers';
  const isBusy = Boolean(loadingAction);

  const handlePersonalInfoChange = (e) => {
    const { name, value } = e.target;
    setPersonalInfo((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  useEffect(() => {
    const loadModels = async () => {
      setModelsLoading(true);
      setModelLoadError(null);

      try {
        const response = await fetch(`${API_URL}/api/models`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to load model list');
        }

        const models = Array.isArray(data.models) ? data.models : [];
        if (!models.length) {
          throw new Error('No models configured on backend');
        }

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

  const renderTextContent = (text) => {
    if (!text) return <p>No data available</p>;

    if (typeof text === 'string') {
      return text.split('\n\n').map((paragraph, index) => (
        <p key={index}>{paragraph}</p>
      ));
    }

    if (typeof text === 'object') {
      return <p>{JSON.stringify(text)}</p>;
    }

    return <p>{String(text)}</p>;
  };

  const validateSharedFields = () => {
    if (!personalInfo.name || !personalInfo.email || !personalInfo.phone) {
      return 'Please provide at least your name, email, and phone number';
    }

    if (!companyName.trim()) {
      return 'Please provide the company name';
    }

    if (!jobDescription.trim()) {
      return 'Please provide the job description';
    }

    if (modelLoadError) {
      return 'Unable to load model configuration. Please refresh and try again.';
    }

    if (!selectedModel) {
      return 'Please select an AI model';
    }

    return null;
  };

  const buildRequestPayload = () => ({
    jobDescription,
    companyName,
    customInstructions,
    personalInfo: personalInfoForRequest(personalInfo),
    model: selectedModel
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateSharedFields();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoadingAction('cover-letter');
    setError(null);
    setApiError(null);
    setPdfError(null);
    setQuestionError(null);
    setCoverLetterResult(null);
    setFile(null);

    try {
      const analyzeResponse = await fetch(`${API_URL}/api/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(buildRequestPayload()),
      });

      const analyzeData = await analyzeResponse.json();

      if (!analyzeResponse.ok || analyzeData.error) {
        setApiError(analyzeData.error || 'Failed to generate cover letter');
        return;
      }

      const sanitizedData = {
        ...analyzeData,
        personalInfo: personalInfoForRequest(personalInfo),
        companyName,
        coverLetter: typeof analyzeData.coverLetter === 'string'
          ? analyzeData.coverLetter
          : JSON.stringify(analyzeData.coverLetter)
      };

      setCoverLetterResult(sanitizedData);

      const generateResponse = await fetch(`${API_URL}/api/generate-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sanitizedData),
      });

      const generateData = await generateResponse.json();

      if (!generateResponse.ok || generateData.error) {
        setPdfError(generateData.error || 'Failed to generate PDF');
        return;
      }

      setFile(generateData.coverLetterFile);
    } catch (err) {
      console.error('Error during cover letter generation:', err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleAnswerQuestions = async () => {
    const validationError = validateSharedFields();
    if (validationError) {
      setError(validationError);
      return;
    }

    if (!jobQuestions.trim()) {
      setError('Please provide at least one application question');
      return;
    }

    setLoadingAction('question-answers');
    setError(null);
    setApiError(null);
    setPdfError(null);
    setQuestionError(null);
    setQuestionAnswers([]);

    try {
      const response = await fetch(`${API_URL}/api/answer-questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...buildRequestPayload(),
          questions: jobQuestions
        }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        setQuestionError(data.error || 'Failed to answer application questions');
        return;
      }

      const answers = Array.isArray(data.answers) ? data.answers : [];
      if (!answers.length) {
        setQuestionError('No answers were returned.');
        return;
      }

      setQuestionAnswers(answers);
    } catch (err) {
      console.error('Error answering application questions:', err);
      setQuestionError(err.message || 'An unexpected error occurred');
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Cover Letter Generator</h1>
        <p>Generate a personalized cover letter and answer job application questions using the same candidate context.</p>
      </header>

      <main>
        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <h2>Personal Information</h2>
            <div className="personal-info-grid">
              <div className="form-group">
                <label htmlFor="name">Full Name*</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={personalInfo.name}
                  onChange={handlePersonalInfoChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address*</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={personalInfo.email}
                  onChange={handlePersonalInfoChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number*</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={personalInfo.phone}
                  onChange={handlePersonalInfoChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="address">Address</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={personalInfo.address}
                  onChange={handlePersonalInfoChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="linkedin">LinkedIn Profile</label>
                <input
                  type="text"
                  id="linkedin"
                  name="linkedin"
                  value={personalInfo.linkedin}
                  onChange={handlePersonalInfoChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="website">Personal Website</label>
                <input
                  type="text"
                  id="website"
                  name="website"
                  value={personalInfo.website}
                  onChange={handlePersonalInfoChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="github">GitHub</label>
                <input
                  type="text"
                  id="github"
                  name="github"
                  value={personalInfo.github}
                  onChange={handlePersonalInfoChange}
                  placeholder="https://github.com/devangb3"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2>Job Information</h2>
            <div className="form-group">
              <label htmlFor="companyName">Company Name*</label>
              <input
                type="text"
                id="companyName"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="modelSelector">AI Model*</label>
              <select
                id="modelSelector"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                disabled={modelsLoading || !!modelLoadError}
                required
              >
                {modelsLoading && <option value="">Loading models...</option>}
                {!modelsLoading && modelLoadError && <option value="">Model load failed</option>}
                {!modelsLoading && !modelLoadError && modelOptions.map((model) => (
                  <option key={model.slug} value={model.slug}>
                    {model.label}
                  </option>
                ))}
              </select>
              {modelLoadError && <p className="error-text">{modelLoadError}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="jobDescription">Job Description*</label>
              <textarea
                id="jobDescription"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows="10"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="customInstructions">Custom Instructions (Optional)</label>
              <textarea
                id="customInstructions"
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                rows="5"
                placeholder="Any specific focuses, career goals, or additional information you want highlighted."
              />
            </div>
          </div>

          <div className="form-section">
            <h2>Application Questions</h2>
            <p className="section-intro">
              Paste the job application or screening questions here. Use one question per line, or separate longer questions with a blank line.
            </p>
            <div className="form-group">
              <label htmlFor="jobQuestions">Questions</label>
              <textarea
                id="jobQuestions"
                value={jobQuestions}
                onChange={(e) => setJobQuestions(e.target.value)}
                rows="8"
                placeholder={'Why do you want to work at this company?\nDescribe your experience with Python and backend APIs.\nWhat makes you a fit for this role?'}
              />
            </div>
          </div>

          <div className="action-row">
            <button
              type="submit"
              disabled={isBusy || modelsLoading || !!modelLoadError || !selectedModel}
              className="submit-button"
            >
              {isGeneratingCoverLetter ? 'Generating Cover Letter...' : 'Generate Cover Letter'}
            </button>

            <button
              type="button"
              disabled={isBusy || modelsLoading || !!modelLoadError || !selectedModel}
              className="secondary-button"
              onClick={handleAnswerQuestions}
            >
              {isAnsweringQuestions ? 'Answering Questions...' : 'Answer Application Questions'}
            </button>
          </div>
        </form>

        {error && (
          <div className="error-message">
            <h3>Error</h3>
            <p>{error}</p>
          </div>
        )}

        {apiError && (
          <div className="error-message">
            <h3>API Service Error</h3>
            <p>{apiError}</p>
          </div>
        )}

        {pdfError && (
          <div className="error-message">
            <h3>PDF Generation Error</h3>
            <p>{pdfError}</p>
          </div>
        )}

        {questionError && (
          <div className="error-message">
            <h3>Question Answering Error</h3>
            <p>{questionError}</p>
          </div>
        )}

        {coverLetterResult && (
          <div className="results">
            <h2>Cover Letter Preview</h2>

            <div className="result-section">
              <div className="cover-letter">
                {renderTextContent(coverLetterResult.coverLetter)}
              </div>
            </div>
          </div>
        )}

        {file && (
          <div className="download-section">
            <h2>Download Cover Letter</h2>
            <div className="download-buttons">
              <a
                href={`${API_URL}/api/download/${file}`}
                className="download-button"
                download
              >
                Download Cover Letter PDF
              </a>
            </div>
          </div>
        )}

        {questionAnswers.length > 0 && (
          <div className="results">
            <h2>Application Question Answers</h2>
            <div className="qa-list">
              {questionAnswers.map((item, index) => (
                <div className="qa-card" key={`${item.question}-${index}`}>
                  <h3>Question {index + 1}</h3>
                  <p className="qa-question">{item.question}</p>
                  <div className="qa-answer">
                    {renderTextContent(item.answer)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
