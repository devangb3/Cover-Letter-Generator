import React, { useState } from 'react';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || "https://cover-letter-generator-424176252593.us-central1.run.app";

function App() {
  const [jobDescription, setJobDescription] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [customInstructions, setCustomInstructions] = useState('');
  const [selectedModel, setSelectedModel] = useState('gemini-2.5-flash');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [file, setFile] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [pdfError, setPdfError] = useState(null);
  
  // Personal information state
  const [personalInfo, setPersonalInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    linkedin: '',
    website: ''
  });

  // Handle personal info changes
  const handlePersonalInfoChange = (e) => {
    const { name, value } = e.target;
    setPersonalInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Helper to split text that could be a string or an object
  const renderTextContent = (text) => {
    if (!text) return <p>No data available</p>;
    
    if (typeof text === 'string') {
      return text.split('\n\n').map((paragraph, index) => (
        <p key={index}>{paragraph}</p>
      ));
    } else if (typeof text === 'object') {
      return <p>{JSON.stringify(text)}</p>;
    } else {
      return <p>{String(text)}</p>;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate personal information
    if (!personalInfo.name || !personalInfo.email || !personalInfo.phone) {
      setError("Please provide at least your name, email, and phone number");
      return;
    }
    
    // Validate company name
    if (!companyName) {
      setError("Please provide the company name");
      return;
    }
    
    setLoading(true);
    setError(null);
    setApiError(null);
    setPdfError(null);
    setResult(null);
    setFile(null);

    try {
      console.log("Submitting form data...");
      console.log("Job description length:", jobDescription.length);
      console.log("Company name:", companyName);
      console.log("Custom instructions length:", customInstructions.length);
      console.log("Personal information:", personalInfo);

      // Step 1: Call API to generate cover letter content
      console.log("Calling analyze endpoint...");
      const analyzeResponse = await fetch(`${API_URL}/api/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobDescription,
          companyName,
          customInstructions,
          personalInfo,
          model: selectedModel
        }),
      });

      console.log("Analyze response status:", analyzeResponse.status);
      const analyzeData = await analyzeResponse.json();
      console.log("Analyze response data keys:", Object.keys(analyzeData));

      if (!analyzeResponse.ok) {
        setApiError(analyzeData.error || 'Failed to generate cover letter');
        if (analyzeData.details) {
          console.error("API Error details:", analyzeData.details);
        }
        setLoading(false);
        return;
      }

      // Check if there's an error field in the response
      if (analyzeData.error) {
        setApiError(analyzeData.error);
        console.error("API Error:", analyzeData.error);
        setLoading(false);
        return;
      }

      // Ensure all required fields are present
      const sanitizedData = {
        ...analyzeData,
        personalInfo, // Add personal info to the data
        companyName,  // Add company name
        coverLetter: typeof analyzeData.coverLetter === 'string' 
          ? analyzeData.coverLetter 
          : JSON.stringify(analyzeData.coverLetter)
      };

      setResult(sanitizedData);
      console.log("Cover letter content generated successfully", sanitizedData);

      // Step 2: Generate PDF
      console.log("Calling generate-pdf endpoint...");
      const generateResponse = await fetch(`${API_URL}/api/generate-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sanitizedData),
      });

      console.log("Generate PDF response status:", generateResponse.status);
      const generateData = await generateResponse.json();
      console.log("Generate PDF response data:", generateData);

      if (!generateResponse.ok) {
        setPdfError(generateData.error || 'Failed to generate PDF');
        if (generateData.details) {
          console.error("PDF Error details:", generateData.details);
        }
        setLoading(false);
        return;
      }

      // Check if there's an error field in the response
      if (generateData.error) {
        setPdfError(generateData.error);
        console.error("PDF Error:", generateData.error);
        setLoading(false);
        return;
      }

      setFile(generateData.coverLetterFile);
      console.log("PDF file generated successfully:", generateData);
    } catch (err) {
      console.error("Error during process:", err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Cover Letter Generator</h1>
        <p>Generate a personalized cover letter based on a job description</p>
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
                required
              >
                <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
                <option value="gemini-2.5-flash">Gemini 2.5 Flash (Default)</option>
                <option value="gemini-2.5-flash-lite">Gemini 2.5 Flash Lite</option>
                <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
              </select>
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
                placeholder="Any specific focuses, career goals, or additional information you want to highlight in your cover letter"
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="submit-button">
            {loading ? 'Generating...' : 'Generate Cover Letter'}
          </button>
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

        {result && (
          <div className="results">
            <h2>Cover Letter Preview</h2>
            
            <div className="result-section">
              <div className="cover-letter">
                {renderTextContent(result.coverLetter)}
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
      </main>
    </div>
  );
}

export default App;