import { GitHub, LinkedIn, Email, LocationOn, Twitter } from '@mui/icons-material';
import LeetCodeIcon from './components/LeetCodeIcon';

export const projects = [
  {
    id: "lh-multimodal-svc",
    title: "Emotion-Aware Feedback System for Public Speaking",
    role: "AI backend engineer",
    problem: "Presentation coaching requires coordinated analysis of video, audio, transcript, and emotional signals before feedback can be useful.",
    built: "Built an async Python multimodal analysis service that orchestrates speech-to-text, Hume AI emotion analysis, multi-provider LLM calls, coaching feedback, and result visualization.",
    evidence: [
      "Benchmarked multiple LLM providers and reached 92% feedback accuracy for generated coaching feedback.",
      "Added an AI-as-a-judge evaluation layer to score and improve response quality before feedback reached users.",
      "Delivered the service as a deployed end-to-end coaching workflow rather than a standalone model demo."
    ],
    bestForRoles: ["Multimodal AI", "LLM evaluation", "AI product engineering", "Python backend"],
    description: "Built an async Python multimodal coaching service that combines video, audio, transcript, Hume AI emotion analysis, and multi-provider LLM feedback to evaluate public-speaking performance.",
    technologies: ["Python", "AsyncIO", "Hume AI", "Multimodal AI", "LLM Evaluation", "Data Visualization"],
    highlights: [
      "Orchestrated video, audio, and transcript processing in an async Python pipeline for automated presentation analysis.",
      "Integrated Hume AI emotion signals with LLM-generated coaching feedback to produce actionable speaker recommendations.",
      "Benchmarked multiple LLM providers and used AI-as-a-judge evaluation to improve feedback reliability to 92% accuracy."
    ],
    demoUrl: "https://multimodal-svc-frontend-277660335430.us-central1.run.app/",
    githubUrl: "#",
    isOpenSource: false,
    hasPublicRepo: false
  },
  {
    id: "causalflow",
    title: "CausalFlow: Autonomous Agent Debugging Framework",
    role: "Agentic systems researcher",
    problem: "Long-horizon agents fail through hidden reasoning errors that are hard to reproduce, inspect, and repair.",
    built: "Built an interpretable agent-debugging framework that grounds multi-step agent execution in deterministic synthetic environments and verifiable state transitions.",
    evidence: [
      "Achieved a 40% performance uplift over baseline on long-horizon reasoning-chain failure resolution.",
      "Reduced hallucination risk by replacing LLM-based world modeling with deterministic execution environments.",
      "Produced traceable failure analysis for multi-step agent workflows."
    ],
    bestForRoles: ["Agentic AI", "AI evaluation", "AI safety", "Python research engineering"],
    description: "Built an interpretable Python framework for debugging autonomous agents, resolving long-horizon reasoning failures through deterministic environments and verifiable state transitions.",
    technologies: ["Python", "LLMs", "Agentic Frameworks", "AI Evaluation", "Debugging"],
    highlights: [
      "Achieved a 40% performance uplift over baseline when resolving failures in multi-step reasoning chains.",
      "Engineered deterministic synthetic environments to ground agent execution in verifiable state transitions.",
      "Built debugging traces that expose where an agent's plan diverges from expected task state."
    ],
    demoUrl: "#",
    githubUrl: "https://github.com/devangb3/CausalFlow",
    isOpenSource: true,
    hasPublicRepo: true
  },
  {
    id: "reschat",
    title: "ResChat – Decentralized Platform with AI Assistant",
    role: "Distributed systems and RAG engineer",
    problem: "Users needed low-latency messaging, large-file sharing, and fast retrieval over distributed documents.",
    built: "Built a decentralized communication platform with C++ and Python services, distributed storage, and a LangChain/FAISS RAG assistant for document search.",
    evidence: [
      "Reduced information retrieval time by 85% with a RAG chatbot over distributed document collections.",
      "Implemented FAISS indexing and embedding generation for accurate semantic retrieval.",
      "Combined real-time communication, large-file transfer, and AI-assisted search in one platform."
    ],
    bestForRoles: ["RAG", "Distributed systems", "C++ backend", "Vector search"],
    description: "Built a low-latency decentralized communication platform with real-time messaging, large-file transfer, and a LangChain/FAISS RAG assistant for distributed document search.",
    technologies: ["C++", "Python", "Retrieval-Augmented Generation", "RAG", "LangChain", "Distributed Systems", "FAISS"],
    highlights: [
      "Implemented real-time messaging and large-file transfer across distributed storage services using C++ and Python.",
      "Built a LangChain RAG chatbot that reduced document information retrieval time by 85%.",
      "Generated embeddings and indexed documents in FAISS to support accurate vector-based retrieval."
    ],
    demoUrl: "https://res-share-deployable.vercel.app/",
    githubUrl: "https://github.com/devangb3/ResShareDeployable",
    isOpenSource: true,
    hasPublicRepo: true
  },
  {
    id: "llm-chatbot",
    title: "LLM Self-Chat - Agentic AI Simulation Framework",
    role: "Full-stack agent simulation engineer",
    problem: "Prompt and agent behavior experiments need repeatable multi-agent conversations with real-time observability.",
    built: "Built a Flask and React simulation framework where multiple LLM agents converse through custom prompts and WebSocket-backed real-time updates.",
    evidence: [
      "Enabled multi-agent behavior analysis and prompt iteration through controlled agent simulations.",
      "Used WebSockets for low-latency interaction between the React client and Flask backend.",
      "Integrated LangChain and Gemini API workflows for agent orchestration."
    ],
    bestForRoles: ["Multi-agent systems", "Prompt engineering", "Flask backend", "Realtime applications"],
    description: "Built a multi-agent LLM simulation framework with Flask, React, WebSockets, LangChain, and Gemini API for real-time behavior analysis and prompt engineering.",
    technologies: ["Python", "LangChain", "WebSockets", "Gemini API", "React", "Flask"],
    highlights: [
      "Designed custom agent prompts and orchestration logic for controlled multi-agent LLM conversations.",
      "Integrated WebSockets for real-time, low-latency communication between the React frontend and Flask backend.",
      "Used LangChain and Gemini API to support repeatable prompt-engineering and behavior-analysis experiments."
    ],
    demoUrl: "#",
    githubUrl: "https://github.com/devangb3/LLM-Self-Chat",
    isOpenSource: true,
    hasPublicRepo: true
  },
  {
    id: "gitartha-engine",
    title: "Gitartha Engine – Semantic Search for the Bhagavad Gita",
    role: "Backend and semantic-search engineer",
    problem: "Semantic search over a structured text corpus needed low latency, high concurrency, and clean separation between API and ML inference layers.",
    built: "Architected a Go Gin REST API, FastAPI inference service, PostgreSQL database, and pgvector search layer for low-latency semantic retrieval.",
    evidence: [
      "Achieved consistent P95 search latency under 15ms.",
      "Delivered average query response time of 12.7ms across a corpus of 700+ verses.",
      "Separated high-concurrency API serving from Python ML inference to keep the system maintainable."
    ],
    bestForRoles: ["Backend scalability", "Semantic search", "Go APIs", "Vector databases"],
    description: "Architected a full-stack semantic-search system with a Go Gin API, FastAPI inference service, PostgreSQL, and pgvector, achieving P95 search latency under 15ms.",
    technologies: ["Go", "Gin", "PostgreSQL", "pgvector", "React", "TypeScript", "Python", "FastAPI"],
    highlights: [
      "Built the high-concurrency REST API in Go Gin and isolated ML model inference behind a FastAPI service.",
      "Implemented PostgreSQL pgvector semantic search with average query response time of 12.7ms across 700+ verses.",
      "Maintained consistent P95 search latency under 15ms through a split API/inference architecture."
    ],
    demoUrl: "#",
    githubUrl: "https://github.com/devangb3/Gitartha-Engine",
    isOpenSource: true,
    hasPublicRepo: true
  },
  {
    id: "daily-digest",
    title: "Daily Digest – AI-Powered Gmail/Calendar Summarizer",
    role: "Full-stack AI assistant engineer",
    problem: "Users lose time scanning Gmail and Calendar separately before deciding daily priorities.",
    built: "Built a Flask/Python AI assistant that connects to Google Workspace through OAuth 2.0, summarizes Gmail and Calendar data with Gemini AI, and supports text-to-speech output.",
    evidence: [
      "Reduced daily planning overhead by 70% with priority-based summaries.",
      "Implemented secure OAuth 2.0 access to Gmail and Calendar APIs.",
      "Combined summarization, prioritization, and audio output in a deployed assistant workflow."
    ],
    bestForRoles: ["AI assistants", "Google Workspace APIs", "OAuth", "Python backend"],
    description: "Built a Flask and Python AI assistant that uses Gemini AI, OAuth 2.0, and Google Workspace APIs to summarize Gmail and Calendar priorities, reducing daily planning overhead by 70%.",
    technologies: ["Python", "Flask", "Gemini AI", "OAuth 2.0", "Google Workspace APIs"],
    highlights: [
      "Integrated Gmail and Calendar APIs through secure OAuth 2.0 to retrieve user-specific planning context.",
      "Generated Gemini-powered priority summaries that reduced daily planning overhead by 70%.",
      "Added text-to-speech support so users could consume daily summaries hands-free."
    ],
    demoUrl: "https://calendar-gmail-summary-frontend.onrender.com/",
    githubUrl: "https://github.com/devangb3/Calendar-Gmail-Summary",
    isOpenSource: true,
    hasPublicRepo: true
  },
  {
    id: "algotrade",
    title: "HammerTrade (Stock Prediction Platform for HFTs)",
    role: "Founding engineer",
    problem: "Trading simulation workflows need model comparison, retraining, and market-data processing that can adapt to changing asset behavior.",
    built: "Built a Flask, React, MongoDB, Docker, PyTorch, and Scikit-learn platform for comparing predictive models, retraining them continuously, and supporting high-frequency trading simulations.",
    evidence: [
      "Implemented continuous model retraining so model performance could improve as new market data arrived.",
      "Built model-comparison workflows that show which predictive model performs best for a selected asset and time.",
      "Integrated multiple ML frameworks into a single simulation and prediction platform."
    ],
    bestForRoles: ["ML platforms", "Financial technology", "Backend APIs", "Model retraining"],
    description: "Built a full-stack ML platform for stock-prediction workflows, model comparison, and continuous retraining in high-frequency trading simulations.",
    technologies: ["Flask", "MongoDB", "React", "Docker", "PyTorch", "Scikit-learn", "Pandas", "Deep Learning"],
    highlights: [
      "Implemented continuous retraining pipelines to update predictive models as market data changed.",
      "Built a model-comparison interface for selecting the strongest model by asset and time window.",
      "Integrated PyTorch, Scikit-learn, Pandas, Flask, MongoDB, React, and Docker into a deployable ML workflow."
    ],
    demoUrl: "http://hammertrade.tradnomic.com/",
    githubUrl: "https://github.com/devangb3",
    isOpenSource: false,
    hasPublicRepo: false
  },
  {
    id: "prm-on-device",
    title: "Process Reward Model (PRM) for On-Device LLMs",
    role: "LLM inference optimization researcher",
    problem: "Resource-constrained devices need reasoning quality improvements without always running a large model end to end.",
    built: "Architected a composite inference system that pairs a lightweight Qwen3-0.6B generator with a Qwen3-8B verifier to score reasoning chains.",
    evidence: [
      "Implemented weak-to-strong reasoning workflows for resource-constrained inference.",
      "Optimized Python search strategies to traverse and score reasoning chains in real time.",
      "Separated generation and verification responsibilities to improve inference efficiency."
    ],
    bestForRoles: ["LLM inference", "On-device AI", "Reasoning systems", "Python optimization"],
    description: "Architected a composite LLM inference system that couples a Qwen3-0.6B generator with a Qwen3-8B verifier for efficient weak-to-strong reasoning on constrained devices.",
    technologies: ["Python", "Qwen", "LLMs", "On-Device AI", "Inference Optimization", "Search Algorithms"],
    highlights: [
      "Paired Qwen3-0.6B generation with Qwen3-8B verification to support efficient weak-to-strong generalization.",
      "Optimized Python search strategies that dynamically traverse and score reasoning chains in real time.",
      "Designed the system around constrained inference where verifier calls must be used selectively."
    ],
    demoUrl: "#",
    githubUrl: "https://github.com/devangb3/Process-Reward-Models",
    isOpenSource: true,
    hasPublicRepo: true
  },
  {
    id: "github-issue-classifier",
    title: "Multi-Label GitHub Issue Classifier",
    role: "ML engineer",
    problem: "Open-source maintainers need automatic multi-label triage for noisy GitHub issues with imbalanced tag distributions.",
    built: "Built and benchmarked transformer-based multi-label classifiers using RoBERTa, PyTorch, Hugging Face Transformers, skmultilearn, Scikit-learn, and Pandas.",
    evidence: [
      "Improved test F1 Macro to 0.21, a 60% uplift over a DistilBERT baseline.",
      "Reduced the label space to the 28 most predictive classes to improve training focus.",
      "Published the model artifact to Hugging Face for reproducible inference."
    ],
    bestForRoles: ["NLP", "Transformer fine-tuning", "Hugging Face", "Model evaluation"],
    description: "Developed and benchmarked a RoBERTa-based multi-label classifier for noisy GitHub issues, improving F1 Macro by 60% over a DistilBERT baseline.",
    technologies: ["Python", "PyTorch", "Hugging Face Transformers", "RoBERTa", "skmultilearn", "Scikit-learn", "Pandas"],
    highlights: [
      "Engineered a robust data preprocessing pipeline to handle noisy, real-world GitHub issue data, using iterative stratification to ensure balanced label distribution for reliable model evaluation.",
      "Executed a systematic model selection process, fine-tuning RoBERTa-base to achieve a test F1 Macro score of 0.21, a 60% performance improvement over the DistilBERT baseline.",
      "Optimized the problem space by programmatically filtering low-frequency tags, reducing the label set to the 28 most predictive classes to improve training efficiency and model focus."
    ],
    demoUrl: "https://huggingface.co/devangb4/scikit-issues-multilabel-classification",
    githubUrl: "https://github.com/devangb3/HF-Transformers/blob/main/scikit-Issue-Classifier.ipynb",
    isOpenSource: true,
    hasPublicRepo: true
  },
  {
    id: "drug-condition-classifier",
    title: "Drug Condition Classifier (BERT Fine-Tuning)",
    role: "NLP model engineer",
    problem: "Drug-review text contains noisy patient language that must be cleaned and classified across hundreds of medical-condition labels.",
    built: "Fine-tuned a BERT classifier on a large drug-review dataset using PyTorch, Hugging Face Transformers, Scikit-learn, W&B, and the Hugging Face Hub.",
    evidence: [
      "Trained on over 126,000 samples and evaluated on over 52,000 test samples.",
      "Handled 821 medical-condition classes.",
      "Achieved 75.9% accuracy and 0.75 weighted F1."
    ],
    bestForRoles: ["NLP", "BERT fine-tuning", "Healthcare AI", "Hugging Face"],
    description: "Fine-tuned a BERT text-classification model on 126,000+ drug-review samples to predict 821 medical conditions, achieving 75.9% accuracy and 0.75 weighted F1.",
    technologies: ["Python", "PyTorch", "Hugging Face Transformers", "BERT", "Scikit-learn", "W&B", "Hugging Face Hub"],
    highlights: [
      "Built a data preprocessing pipeline to clean and prepare a large dataset of drug reviews for training, handling HTML artifacts and noisy entries.",
      "Fine-tuned a `bert-base-cased` model for a complex multi-class classification task with 821 unique medical conditions.",
      "Achieved 75.9% accuracy and a weighted F1-score of 0.75 on a test set containing over 52,000 samples.",
      "Published the final model and tokenizer to the Hugging Face Hub, making it accessible for inference via the `pipeline` API."
    ],
    demoUrl: "https://huggingface.co/devangb4/bert-drug-classification",
    githubUrl: "https://github.com/devangb3/HF-Transformers/blob/main/Drug_dataset_finetuning.ipynb",
    isOpenSource: true,
    hasPublicRepo: true
  },
  {
    id: "75Hard",
    title: "Tracker App for 75 Hard Challenge",
    role: "Full-stack cloud engineer",
    problem: "Users following the 75 Hard Challenge need persistent habit tracking, progress visualization, and reliable cloud access across frontend and backend services.",
    built: "Built a full-stack Flask, React, MongoDB, Docker, and Google Cloud Run application with modular services and CI/CD-oriented deployment.",
    evidence: [
      "Containerized frontend and backend services for consistent Google Cloud Run deployment.",
      "Implemented a modular service-oriented architecture for tracking challenge progress.",
      "Built responsive React/Tailwind screens with Recharts progress visualizations."
    ],
    bestForRoles: ["Full-stack engineering", "Cloud deployment", "Flask APIs", "React"],
    description: "Built a full-stack habit-tracking platform with Flask, React, MongoDB, Docker, and Google Cloud Run for 75 Hard Challenge progress tracking and visualization.",
    technologies: ["Flask", "MongoDB", "React", "Docker", "Google Cloud Platform", "Google Cloud Run", "Tailwind CSS", "Python", "CI/CD"],
    highlights: [
      "Developed a full-stack application with a modular, service-oriented Flask backend.",
      "Built an interactive and responsive UI with React and Tailwind CSS, featuring data visualizations with Recharts.",
      "Containerized both frontend and backend services with Docker for consistent deployment on Google Cloud Run."
    ],
    demoUrl: "https://hard-tracker-frontend-75-424176252593.us-west1.run.app/",
    githubUrl: "https://github.com/devangb3/75-Hard-Tracker",
    isOpenSource: true,
    hasPublicRepo: true
  },
  {
    id: "dc-menu-analyzer",
    title: "DC Menu Analyzer",
    role: "AI application engineer",
    problem: "UC Davis students with dietary restrictions need a faster way to interpret dining-hall menus against allergies, preferences, and nutrition goals.",
    built: "Built a FastAPI and React application that scrapes Tercero Dining Commons menus, parses menu items with BeautifulSoup, and uses Gemini AI for personalized recommendations.",
    evidence: [
      "Automated menu extraction with a Python/BeautifulSoup scraping pipeline.",
      "Combined dietary restriction checks, allergy filtering, caloric considerations, and LLM recommendations.",
      "Added caching and structured storage to speed up menu retrieval and analysis."
    ],
    bestForRoles: ["AI applications", "FastAPI", "Web scraping", "Personalization"],
    description: "Built a FastAPI and React dining-menu analyzer that scrapes UC Davis menus and uses Gemini AI to recommend meals based on dietary restrictions, allergies, and caloric goals.",
    technologies: ["Web Scraping", "Python", "FastAPI", "Gemini AI API", "BeautifulSoup4", "React", "LLMs"],
    highlights: [
      "Built a BeautifulSoup scraping pipeline to automatically extract and parse dining-commons menu data.",
      "Integrated Gemini AI API for personalized recommendations grounded in dietary restrictions and preferences.",
      "Implemented menu filtering, dietary validation, caching, and structured storage for faster retrieval."
    ],
    demoUrl: "#",
    githubUrl: "https://github.com/devangb3/DC-Menu-Analyzer",
    isOpenSource: true,
    hasPublicRepo: true
  },
  {
    id: "ai-code-analyzer",
    title: "AI CodeMentor – LLM-Powered Code Analysis",
    role: "Developer tooling engineer",
    problem: "Pull requests and issues need automated review that understands code changes, repository context, and CI/CD workflows.",
    built: "Built an LLM-powered GitHub Action with Node.js, Python, GitHub APIs, git diff parsing, and agentic tool calling for automated PR and issue analysis.",
    evidence: [
      "Parsed git diffs through GitHub APIs to generate context-aware code review feedback.",
      "Added tool-calling capabilities so the LLM could invoke external analysis functions during review.",
      "Implemented fallback mechanisms for reliable CI/CD operation."
    ],
    bestForRoles: ["Developer tools", "Agentic tool calling", "CI/CD", "Code review automation"],
    description: "Built an LLM-powered GitHub Action for automated PR and issue review, using git diff parsing, GitHub APIs, and agentic tool calling for context-aware code analysis.",
    technologies: ["Python", "Node.js", "GitHub Actions", "Gemini AI API", "Git", "CI/CD", "OpenAI API"],
    highlights: [
      "Developed an LLM-powered agent for automated CI/CD code reviews across pull requests and issues.",
      "Engineered the agent to parse git diffs via the GitHub API and produce context-aware feedback on code changes.",
      "Added agentic tool calling so the model could invoke external analysis functions during review."
    ],
    demoUrl: "#",
    githubUrl: "#",
    isOpenSource: false,
    hasPublicRepo: false
  },
  {
    id: "quiz",
    title: "LLM Quiz Generator",
    role: "Full-stack AI application engineer",
    problem: "Students need a way to convert raw study materials into interactive quizzes with immediate feedback.",
    built: "Built a FastAPI, Uvicorn, Vite, and DeepSeek API application that uploads study files, extracts content, generates multiple-choice questions, and evaluates answers interactively.",
    evidence: [
      "Supported TXT, PDF, DOC, and DOCX uploads with dynamic encoding detection and PDF extraction.",
      "Generated context-aware multiple-choice questions from user-provided study materials.",
      "Added progress tracking, immediate feedback, and final score reporting."
    ],
    bestForRoles: ["AI applications", "FastAPI", "File processing", "EdTech"],
    description: "Built a full-stack quiz-generation app that processes study files, calls DeepSeek API for context-aware multiple-choice questions, and delivers interactive scoring.",
    technologies: ["Python", "FastAPI", "Uvicorn", "APIs", "DeepSeek", "AI Development", "Cursor", "Vite", "DeepSeek API"],
    highlights: [
      "Implemented file upload and processing for TXT, PDF, DOC, and DOCX study materials.",
      "Integrated DeepSeek API to generate context-aware multiple-choice questions from uploaded content.",
      "Built an interactive quiz interface with progress indicators, immediate answer feedback, and final score reporting."
    ],
    demoUrl: "#",
    githubUrl: "https://github.com/devangb3/LLM-Quiz",
    isOpenSource: true,
    hasPublicRepo: true
  },
  {
    id: "mm-hilton-sprint",
    title: "Multi-Provider AI Integration for Presentation Analysis",
    role: "AI platform engineer",
    problem: "Presentation-analysis workflows needed provider flexibility, database migration safety, and observability as the system moved from prototype to scalable backend.",
    built: "Built a multi-provider AI integration layer with OpenAI, Anthropic, Google, and Perplexity, plus a Firebase-to-Node.js/PostgreSQL migration path.",
    evidence: [
      "Implemented a Service Factory Pattern to swap AI providers without rewriting analysis workflows.",
      "Designed a dual-database architecture that supported migration from Firebase to PostgreSQL.",
      "Added logging and monitoring patterns to make provider and database behavior observable."
    ],
    bestForRoles: ["AI platform engineering", "Provider abstraction", "PostgreSQL", "Backend architecture"],
    description: "Built a multi-provider AI integration layer for presentation analysis, abstracting OpenAI, Anthropic, Google, and Perplexity behind a scalable Node.js/PostgreSQL migration path.",
    technologies: ["Python", "Node.js", "PostgreSQL", "Firebase", "REST APIs", "AI Development"],
    highlights: [
      "Integrated four AI providers behind a Service Factory Pattern for provider-flexible analysis workflows.",
      "Designed a dual-database architecture with a migration path from Firebase to a Node.js backend with PostgreSQL.",
      "Added logging and monitoring using Composite and Observer patterns to improve system observability."
    ],
    demoUrl: "#",
    githubUrl: "#",
    isOpenSource: false,
    hasPublicRepo: false
  },
  {
    id: "synthetic-data-generator",
    title: "Synthetic Data Generator",
    role: "Full-stack data tooling engineer",
    problem: "Financial analysts, developers, and researchers need configurable synthetic market data for testing models against normal and extreme market conditions.",
    built: "Built a FastAPI, React, Vite, and AWS Amplify application that generates synthetic stock-market data with controls for volatility, time horizon, and black-swan events.",
    evidence: [
      "Exposed parameters for initial price, number of days, volatility, and black-swan event probability/intensity.",
      "Generated synthetic financial time series that mimic different market-condition scenarios.",
      "Deployed the frontend through AWS Amplify for accessible data generation and visualization."
    ],
    bestForRoles: ["Data tools", "Financial technology", "FastAPI", "Synthetic data"],
    description: "Built a FastAPI and React synthetic-data tool for financial time series, letting users configure volatility, time horizon, initial price, and black-swan event probability.",
    technologies: ["Python", "FastAPI", "Uvicorn", "APIs", "AI Development", "AWS Amplify", "React", "Vite"],
    highlights: [
      "Generated synthetic financial data that mimics different real-world market conditions.",
      "Added configurable controls for initial price, time horizon, volatility, and black-swan event probability/intensity.",
      "Deployed a React/Vite interface on AWS Amplify for generating and visualizing synthetic data."
    ],
    demoUrl: "https://main.d1jhxtwybbezfy.amplifyapp.com/",
    githubUrl: "#",
    isOpenSource: false,
    hasPublicRepo: false
  },
  {
    id: "cover-letter-generator",
    title: "Cover Letter Generator",
    role: "Full-stack LLM application engineer",
    problem: "Job applicants need fast, role-specific cover letters and application answers grounded in resume and project evidence.",
    built: "Built a Flask, React, OpenRouter, and Google Cloud Run application that generates cover letters, answers application questions, and renders downloadable PDFs.",
    evidence: [
      "Connected a React form, Flask API, OpenRouter model selection, resume/project context, and ReportLab PDF generation.",
      "Added model allowlisting through YAML configuration and backend validation.",
      "Deployed the application on Google Cloud Run."
    ],
    bestForRoles: ["LLM applications", "Flask APIs", "React", "Cloud Run"],
    description: "Built and deployed a Flask/React LLM application on Google Cloud Run that generates grounded cover letters and application-question answers from resume, project, and job-description context.",
    technologies: ["Python", "Flask", "APIs", "AI Development", "LLMs", "OpenRouter", "Google Cloud Run", "React", "Vite"],
    highlights: [
      "Implemented a Flask API and React UI for generating customized cover letters from company, job, resume, and project context.",
      "Added OpenRouter model selection with a YAML allowlist and backend model validation.",
      "Rendered generated cover letters into downloadable PDFs through the backend PDF service."
    ],
    demoUrl: "https://cover-letter-generator-424176252593.us-central1.run.app",
    githubUrl: "https://github.com/devangb3/Cover-Letter-Generator",
    isOpenSource: true,
    hasPublicRepo: true
  },
  {
    id: "rag-context",
    title: "RAG Client",
    role: "RAG engineer",
    problem: "Users need accurate answers from local PDFs, notes, and code files without manually searching each document.",
    built: "Built a Python, LangChain, FAISS, and Gemini API assistant that chunks documents, embeds content, stores vectors, and retrieves relevant context for grounded answers.",
    evidence: [
      "Implemented Retrieval-Augmented Generation over personal document collections and codebases.",
      "Used FAISS vector indexing and Gemini embeddings to support context-aware retrieval.",
      "Designed the model layer to allow alternative embedding or generation models."
    ],
    bestForRoles: ["RAG", "Vector databases", "LangChain", "Document AI"],
    description: "Built a Python RAG assistant over local PDFs, notes, and code files using LangChain, FAISS, Gemini embeddings, tokenization, and context-aware retrieval.",
    technologies: ["Python", "LangChain", "FAISS", "Gemini AI API", "Vector Databases", "Tokenization", "Retrieval-Augmented Generation", "RAG"],
    highlights: [
      "Implemented Retrieval-Augmented Generation (RAG) techniques to create a context-aware search engine for personal document collections and codebases.",
      "Used Python and LangChain to orchestrate document parsing, chunking, vector retrieval, and LLM response generation.",
      "Integrated Gemini API embeddings with FAISS vector storage while keeping the model layer replaceable."
    ],
    demoUrl: "#",
    githubUrl: "https://github.com/devangb3/RAG-Client",
    isOpenSource: true,
    hasPublicRepo: true
  },
  {
    id: "resshare",
    title: "ResShare (Decentralized File Sharing System)",
    role: "Distributed systems engineer",
    problem: "Decentralized file sharing needs tamper-resistant metadata, distributed file availability, and API access across frontend and backend services.",
    built: "Built a blockchain-backed file-sharing system on ResilientDB with IPFS distribution, Flask APIs, GraphQL access patterns, and a React frontend.",
    evidence: [
      "Used ResilientDB to preserve file metadata integrity.",
      "Integrated IPFS for decentralized file storage and distribution.",
      "Exposed the decentralized backend through Flask and GraphQL services."
    ],
    bestForRoles: ["Distributed systems", "Blockchain infrastructure", "Flask APIs", "IPFS"],
    description: "Built a decentralized file-sharing system on ResilientDB and IPFS, exposing blockchain-backed metadata and distributed storage through Flask, GraphQL, and React.",
    technologies: ["Python", "Flask", "IPFS", "ResilientDB", "React", "GraphQL", "Distributed Systems"],
    highlights: [
      "Implemented blockchain-backed file metadata using ResilientDB for integrity guarantees.",
      "Integrated IPFS for decentralized file distribution and availability.",
      "Built Flask and GraphQL service layers to connect the distributed backend with a React frontend."
    ],
    demoUrl: "#",
    githubUrl: "https://github.com/ResilientApp/ResShare-Backend",
    isOpenSource: true,
    hasPublicRepo: true
  },
  {
    id: "atom",
    title: "Atom (Portfolio Management Software)",
    role: "Software engineer",
    problem: "A high-traffic wealth-management platform needed faster data access, real-time trading capabilities, and maintainable backend services.",
    built: "Engineered scalable backend services with ASP.NET Core, C#, SQL, AWS, Azure, Angular, and TypeScript for a Fortune 500 wealth-management platform.",
    evidence: [
      "Reduced data retrieval times by 40%.",
      "Redesigned backend architecture for modularity and scalability.",
      "Contributed to real-time trading capabilities in a production wealth-management system."
    ],
    bestForRoles: ["Backend engineering", "Financial technology", "ASP.NET Core", "Cloud infrastructure"],
    description: "Engineered ASP.NET Core and cloud-backed services for a high-traffic wealth-management platform, reducing data retrieval time by 40% and supporting real-time trading workflows.",
    technologies: ["ASP.NET Core", "C#", "JavaScript", "Azure", "AWS", "Angular", "TypeScript", "SQL"],
    highlights: [
      "Reduced data retrieval times by 40% through backend and data-access optimization.",
      "Implemented real-time trading capabilities for a wealth-management platform.",
      "Optimized cloud infrastructure and modular backend services across AWS and Azure."
    ],
    demoUrl: "#",
    githubUrl: "https://github.com/devangb3",
    isOpenSource: true,
    hasPublicRepo: true
  },
  {
    id: "gemini-event-creator",
    title: "Gemini Event Creator: AI-Powered Chrome Extension",
    role: "Chrome extension and on-device AI engineer",
    problem: "Users often copy event details from webpages into Calendar manually, creating friction and privacy concerns.",
    built: "Built a Manifest V3 Chrome extension that turns highlighted webpage text into Google Calendar events using Gemini Nano Prompt API, chrome.identity OAuth, and Google Calendar API.",
    evidence: [
      "Used on-device Gemini Nano to parse event title, date, and time locally for privacy-preserving extraction.",
      "Implemented a Manifest V3 service worker for background tasks, API calls, and state management.",
      "Designed both quick-create and edit-before-create flows for one-click or user-reviewed calendar creation."
    ],
    bestForRoles: ["Chrome extensions", "On-device AI", "Google APIs", "OAuth"],
    description: "Built a Manifest V3 Chrome extension that converts highlighted webpage text into Google Calendar events using on-device Gemini Nano, OAuth 2.0, and Google Calendar API.",
    technologies: ["JavaScript", "Chrome Extension (Manifest V3)", "HTML5", "CSS3", "Google Calendar API", "Google Identity API (OAuth 2.0)", "Vite", "Gemini Nano (Prompt API)", "any-date-parser"],
    highlights: [
      "Built a content script that injects a floating UI to capture selected event text from any webpage.",
      "Implemented a Manifest V3 service worker for background tasks, API calls, and extension state management.",
      "Integrated on-device Gemini Nano Prompt API for privacy-preserving event-detail extraction.",
      "Engineered a secure chrome.identity OAuth flow for Google Calendar API access.",
      "Designed quick-create and edit-before-create flows for title, time, location, color, and reminders."
    ],
    demoUrl: "https://chrome.google.com/webstore/detail/gemini-event-creator/hbbphgbndgjenboombeclnpepoiicpno",
    githubUrl: "https://github.com/devangb3/Event-Creator",
    isOpenSource: true,
    hasPublicRepo: true
  }
];

export const skills = [
  { name: "Python", category: "Languages", icon: <img src="/skills/python-icon.svg" alt="Python" width="24" height="24" /> },
  { name: "C#", category: "Languages", icon: <img src="/skills/csharp_icon.png" alt="C#" width="24" height="24" /> },
  { name: "Java", category: "Languages", icon: <img src="/skills/java-icon.svg" alt="Java" width="24" height="24" /> },
  { name: "TypeScript", category: "Languages", icon: <img src="/skills/typescriptlang-icon.svg" alt="TypeScript" width="24" height="24" /> },
  { name: "JavaScript", category: "Languages", icon: <img src="/skills/javascript-icon.svg" alt="JavaScript" width="24" height="24" /> },
  { name: "Go", category: "Languages", icon: <img src="/skills/golang-icon.svg" alt="Go" width="24" height="24" /> },
  { name: "PyTorch", category: "Frameworks", icon: <img src="/skills/pytorch-icon.svg" alt="PyTorch" width="24" height="24" /> },
  { name: "Hugging Face", category: "Frameworks", icon: <img src="/hf-logo.png" alt="Hugging Face" width="24" height="24" /> },
  { name: "FastAPI", category: "Frameworks", icon: "⚡" },
  { name: "LangChain", category: "Frameworks", icon: "🧵" },
  { name: "React", category: "Frameworks", icon: <img src="/skills/reactjs-icon.svg" alt="React" width="24" height="24" /> },
  { name: "GCP", category: "Cloud", icon: <img src="/skills/google_cloud-icon.svg" alt="GCP" width="24" height="24" /> },
  { name: "AWS", category: "Cloud", icon: <img src="/skills/amazon_aws-icon.svg" alt="AWS" width="24" height="24" /> },
  { name: "OpenAI API", category: "Cloud", icon: "🧪" },
  { name: "Anthropic API", category: "Cloud", icon: "🧠" },
  { name: "Gemini API", category: "Cloud", icon: "✨" },
  { name: "OpenRouter", category: "Cloud", icon: "🛰️" },
  { name: "Docker", category: "Tools", icon: <img src="/skills/docker-icon.svg" alt="Docker" width="24" height="24" /> },
  { name: "CI/CD", category: "Tools", icon: "🔁" },
  { name: "LLM Evaluations", category: "AI", icon: "🧪" },
  { name: "Multi-Agent Systems", category: "AI", icon: "🧩" },
  { name: "LoRA Fine-Tuning", category: "AI", icon: "🎛️" },
  { name: "Prompt Engineering", category: "AI", icon: "⌨️" },
  { name: "ReAct Agents", category: "AI", icon: "🔄" },
  { name: "Tool Calling", category: "AI", icon: "🧰" },
  { name: "RAG", category: "AI", icon: "📚" },
  { name: "Embeddings", category: "AI", icon: "🧲" },
  { name: "Adversarial Testing", category: "AI", icon: "🛡️" },
  { name: "AI Red-Teaming", category: "AI", icon: "🕵️" },
  { name: "SQL", category: "Database", icon: "📊" },
  { name: "MongoDB", category: "Database", icon: "🍃" },
  { name: "Redis", category: "Database", icon: "⚡" },
];

export const experiences = [
  {
    title: "Senior AI Engineer",
    company: "PilotCrew AI",
    period: "October 2025 - Present",
    description: [
      "Architected an autonomous evaluation engine that recursively generates adversarial synthetic prompts to expose agentic failure modes and hallucination patterns.",
      "Built a self-correcting optimization loop that iteratively refines agent instructions based on error traces, boosting pass rates and ensuring deterministic behavior in production."
    ],
    technologies: ["Python", "LLMs", "Agentic Workflows", "Adversarial Testing", "Prompt Engineering"]
  },
  {
    title: "SWE Intern",
    company: "LearnHaus AI",
    period: "June 2025 - August 2025",
    description: [
      "Developed a multimodal analysis service from 0-to-1 using Python with async processing that orchestrated video/audio analysis speech-to-text transcription, and multi-provider integration to deliver automated coaching.",
      "Designed a distributed consensus protocol among LLM judges to automate ground-truth generation ensuring evaluation reliability without manual labeling and deployed the platform to GCP."
    ],
    technologies: ["Python", "AsyncIO", "Multimodal AI", "GCP", "LLMs", "Distributed Systems"]
  },
  {
    title: "Founding Engineer",
    company: "HammerTrade (Stealth Startup)",
    period: "October 2024 - June 2025",
    description: [
      "Developed a high-throughput, distributed data processing service in Python to manage ML workloads for high-frequency trading simulations, ensuring performance & scalability.",
      "Engineered a complex market simulation environment to train autonomous reinforcement learning (RL) agents, modeling extreme volatility with over 10 configurable parameters."
    ],
    technologies: ["Python", "Reinforcement Learning", "Distributed Systems", "ML", "Trading Systems"]
  },
  {
    title: "Graduate Student",
    company: "UC Davis",
    period: "2024 - Present",
    description: "Pursuing Master's in Computer Science with focus on AI and Distributed Systems",
    technologies: ["Python", "Machine Learning", "Distributed Systems"]
  },
  {
    title: "Software Engineer",
    company: "Hexaview Technologies",
    period: "August 2022 - September 2024",
    description: [
      "Shipped 20+ features for a Fortune 500 wealth management platform, developing a scalable backend using ASP.NET Core with AWS Lambda-based microservice architecture.",
      "Optimized a legacy C# backend servicing over 1 million monthly requests, applying key design patterns to reduce code complexity & successfully redesigning 50+ REST APIs."
    ],
    technologies: ["C#", "ASP.NET Core", "AWS Lambda", "Microservices", "REST APIs"]
  }
];

export const contactInfo = [
  { 
    icon: <Email />, 
    label: 'Email', 
    value: 'devangborkar3@gmail.com', 
    href: 'mailto:devangborkar3@gmail.com',
    isClickable: true 
  },
  { 
    icon: <LocationOn />, 
    label: 'Location', 
    value: 'Davis, CA', 
    href: '#',
    isClickable: false 
  }
];

export const socialLinks = [
  { 
    icon: <Email />, 
    label: 'Email Me', 
    href: 'mailto:devangborkar3@gmail.com', 
    primary: true 
  },
  { 
    icon: <img src="/hf-logo.png" alt="Hugging Face" width="24" height="24" />, 
    label: 'Hugging Face', 
    href: 'https://huggingface.co/devangb4', 
    primary: false 
  },
  { 
    icon: <LinkedIn />, 
    label: 'LinkedIn', 
    href: 'https://linkedin.com/in/devang-borkar-710b49201', 
    primary: false 
  },
  { 
    icon: <Twitter />, 
    label: 'X', 
    href: 'https://x.com/DevangBorkar', 
    primary: false 
  },
  { 
    icon: <GitHub />, 
    label: 'GitHub', 
    href: 'https://github.com/devangb3', 
    primary: false 
  }
];

export const heroSocialLinks = [
  { icon: <GitHub />, url: 'https://github.com/devangb3', label: 'GitHub' },
  { icon: <img src="/hf-logo.png" alt="Hugging Face" width="24" height="24" />, url: 'https://huggingface.co/devangb4', label: 'Hugging Face' },
  { icon: <LinkedIn />, url: 'https://linkedin.com/in/devang-borkar-710b49201', label: 'LinkedIn' },
  { icon: <Twitter />, url: 'https://x.com/DevangBorkar', label: 'X' },
  { icon: <Email />, url: 'mailto:devangborkar3@gmail.com', label: 'Email' },
  { icon: <LeetCodeIcon />, url: 'https://leetcode.com/u/devangborkar3/', label: 'LeetCode' }
];
