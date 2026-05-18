import { GitHub, LinkedIn, Email, LocationOn, Twitter } from '@mui/icons-material';
import LeetCodeIcon from './components/LeetCodeIcon';

export const projects = [
  {
    id: "pilotcrew-gen-eval",
    title: "Agentic Eval Platform",
    description:
      "Built an evaluation platform for testing and improving LLM and agent reliability across structured tasks, coding agents, RAG workflows, tool use, and iterative prompt-optimization loops.",
    technologies: ["Python", "MongoDB", "LLM Evaluations", "Prompt Optimization", "OpenRouter", "Observability"],
    highlights: [
      "Built repeatable evaluation infrastructure with structured run tracking, artifact export, failure-mode reporting, and observability views for comparing prompt and system changes.",
      "Added runner support across coding, RAG, interactive tool-use, BrowseComp, MultiChallenge, tau2, and SWE-bench style experiments.",
      "Implemented OpenRouter usage and cost tracking plus regression guards such as client-prompt acceptance gates, oracle gates, and gate-skip diagnostics."
    ],
    demoUrl: "https://pilotcrew.ai/autoeval/agentic-eval/about",
    githubUrl: "#",
    isOpenSource: false
  },
  {
    id: "causalflow",
    title: "CausalFlow - Autonomous Agent Debugging Framework",
    description:
      "Built an interpretable agentic debugging framework that improved long-horizon reasoning performance by 40% over baseline and grounded agent behavior in deterministic, verifiable environments.",
    technologies: ["Python", "LLMs", "Agentic Frameworks", "Debugging", "Synthetic Environments", "Ablation Studies"],
    highlights: [
      "Built an interpretable framework to localize and repair failure modes in multi-step reasoning chains for long-horizon tasks.",
      "Engineered deterministic synthetic environments that replaced fuzzy world modeling with verifiable state transitions and measurable outcomes.",
      "Added baseline comparisons plus judge, minimality, and no-gold repair-prompt ablations to stress-test which parts of the debugging loop actually mattered."
    ],
    demoUrl: "#",
    githubUrl: "https://github.com/devangb3/CF-Implementation",
    isOpenSource: true
  },
  {
    id: "lh-multimodal-svc",
    title: "Emotion-Aware Feedback System for Public Speaking",
    description:
      "Built a multimodal service that processes video, audio, and transcripts to deliver presentation coaching, emotional analysis, and structured feedback for public speaking improvement.",
    technologies: ["Python", "Hume AI", "Multimodal AI", "Async Processing", "Data Visualization"],
    highlights: [
      "Engineered a pipeline for processing video, audio, and text signals into coaching-oriented feedback.",
      "Integrated Hume AI for emotional analysis and built a visualization layer for actionable presentation insights.",
      "Designed LLM-judge style quality control so one model could evaluate another model's responses."
    ],
    demoUrl: "https://multimodal-svc-frontend-277660335430.us-central1.run.app/",
    githubUrl: "#",
    isOpenSource: false
  },
  {
    id: "gitartha-engine",
    title: "Gitartha Engine - Semantic Search for the Bhagavad Gita",
    description:
      "Architected a full-stack semantic search system using Go for the high-concurrency API and Python for embedding inference, with PostgreSQL + pgvector powering low-latency retrieval across scripture content.",
    technologies: ["Go", "Gin", "PostgreSQL", "pgvector", "React", "TypeScript", "Python", "FastAPI"],
    highlights: [
      "Built a Go monolith for chapter, verse, and semantic-search APIs while keeping P95 search latency under 15ms.",
      "Implemented vector search over 700+ verses with pgvector and a dedicated Python ML service for real-time embedding generation."
    ],
    demoUrl: "#",
    githubUrl: "https://github.com/devangb3/Gitartha-Engine",
    isOpenSource: true
  },
  {
    id: "gemini-hardwarebench",
    title: "Gemini HardwareBench - Harbor EDA Benchmark",
    description:
      "Built a Harbor-compatible hardware benchmark for agent evaluation across digital design and EDA workflows, using deterministic verifiers, real toolchains, and pass@k style trials to measure model capability.",
    technologies: ["Python", "Benchmarking", "Harbor", "Docker", "EDA", "Agent Evaluation"],
    highlights: [
      "Packaged a 34-task benchmark spanning synthesis, STA, RTL debugging, verification, optimization, cryptographic IP analysis, and Hack@CHES security-patch tasks.",
      "Used deterministic script-based verifiers rather than LLM autoraters, with real tool execution via Yosys, OpenSTA, OpenROAD, and Icarus Verilog.",
      "Calibrated the benchmark with pass@k trials, task-level artifacts, and prompt-level feasibility analysis to expose genuine model headroom."
    ],
    demoUrl: "https://pilotcrew.ai/hardwarebench/harbor-dashboard",
    githubUrl: "#",
    isOpenSource: false
  },
  {
    id: "cyber-bench",
    title: "Cyber-Bench - Web CTF and Memory Vulnerability Benchmark",
    description:
      "Built a cybersecurity benchmark suite for evaluating agents on multi-service web CTF environments and memory-vulnerability patch resilience with deterministic scoring and inspectable run artifacts.",
    technologies: ["Python", "Docker", "OpenRouter", "OpenCode", "Cybersecurity", "Benchmarking"],
    highlights: [
      "Implemented a CyberExplorer-style runner with fixed curated bundles, isolated Docker target networks, shell execution inside attacker containers, and structured flag submission.",
      "Added OpenCode backend support with isolated workspaces, guarded helper commands, transcript export, and a browser-based transcript viewer for run inspection.",
      "Built a memory-vuln-bench pipeline over ARVO/CyberGym-style tasks that records SQLite runs, verifies ground-truth PoCs, and scores whether patched binaries resist generated exploits."
    ],
    demoUrl: "#",
    githubUrl: "https://github.com/PilotcrewAI/Cyber-Bench",
    isOpenSource: false
  },
  {
    id: "data-science-bench",
    title: "Data Science Bench - Harbor Agent Harness",
    description:
      "Built a Harbor-compatible terminal benchmark for data-science agents, packaging self-contained analysis tasks with Docker environments, deterministic verification, OpenRouter model runs, and traceable artifacts.",
    technologies: ["Python", "Harbor", "Docker", "OpenRouter", "Data Science", "Benchmarking"],
    highlights: [
      "Packaged runnable data-analysis tasks with task-local Dockerfiles, instructions, datasets, tests, solutions, and Harbor metadata.",
      "Added OpenRouter-backed Terminus runs, concurrent execution controls, job artifacts, and structured result files for model comparison.",
      "Built trace-viewing and task-hardening workflows to inspect failures, retire weak tasks, and make benchmark results reproducible."
    ],
    demoUrl: "#",
    githubUrl: "https://github.com/devangb3/DataScience-Bench",
    isOpenSource: true
  },
  {
    id: "notebook-agent-eval",
    title: "Notebook Agent Eval",
    description:
      "Built a notebook benchmark runner for data-analysis tasks, executing each task in a fresh Jupyter kernel with structured artifacts for reproducible evaluation.",
    technologies: ["Python", "Jupyter", "OpenRouter", "LLM Agents", "Benchmarking", "pytest"],
    highlights: [
      "Implemented task loading for mixed inputs including tables, CSVs, images, and text, then recorded step-by-step trajectories for each run.",
      "Added configurable parallel execution and consistent job outputs including notebooks, transcripts, configs, and structured result files.",
      "Packaged the harness with uv and pytest for reproducible local runs and regression testing."
    ],
    demoUrl: "#",
    githubUrl: "https://github.com/devangb3/NotebookAgent_Eval",
    isOpenSource: true
  },
  {
    id: "llm-linter",
    title: "LLm-Linter - AI Code Review GitHub Action",
    description:
      "Built a GitHub Action and CLI assistant that analyzes repositories and pull requests with Gemini, parses diffs, and posts automated review summaries directly on PRs and issues.",
    technologies: ["JavaScript", "Node.js", "GitHub Actions", "Gemini API", "GitHub API", "CI/CD"],
    highlights: [
      "Implemented PR-aware diff analysis with merge-base fallbacks so the action can reliably review changed code in real repositories.",
      "Built automated comment posting for pull requests, issues, and push-triggered issue creation using the GitHub API.",
      "Supported multi-language code analysis across Python, JavaScript, TypeScript, Go, Java, C#, C++, Rust, Ruby, and PHP."
    ],
    demoUrl: "#",
    githubUrl: "https://github.com/devangb3/LLm-Linter",
    isOpenSource: true
  },
  {
    id: "prm-on-device",
    title: "Process Reward Model (PRM) for On-Device LLMs",
    description:
      "Architected a composite inference system coupling a lightweight generator with a heavier verifier, enabling efficient weak-to-strong reasoning for resource-constrained environments.",
    technologies: ["Python", "Qwen", "LLMs", "On-Device AI", "Inference Optimization"],
    highlights: [
      "Benchmarked process supervision for constrained-compute mathematical reasoning and showed strong gains over self-consistency baselines.",
      "Optimized search strategies to dynamically traverse and score reasoning chains during inference."
    ],
    demoUrl: "#",
    githubUrl: "https://github.com/devangb3/Process-Reward-Models",
    isOpenSource: true
  },
  {
    id: "gemini-event-creator",
    title: "Gemini Event Creator - AI-Powered Chrome Extension",
    description:
      "Built a Chrome extension that converts highlighted webpage text into Google Calendar events using on-device Gemini Nano parsing and OAuth-backed event creation.",
    technologies: ["JavaScript", "Chrome Extension", "Google Calendar API", "OAuth 2.0", "Vite", "Gemini Nano"],
    highlights: [
      "Built an injected content UI that captures selected text and offers quick-create and edit-and-create flows.",
      "Implemented a Manifest V3 service worker for state management, background tasks, and Calendar API orchestration.",
      "Used Gemini Nano locally for privacy-preserving extraction of event metadata from natural language."
    ],
    demoUrl: "https://chrome.google.com/webstore/detail/gemini-event-creator/hbbphgbndgjenboombeclnpepoiicpno",
    githubUrl: "https://github.com/devangb3/Event-Creator",
    isOpenSource: true
  },
  {
    id: "cover-letter-generator",
    title: "Cover Letter Generator",
    description:
      "Built a full-stack application that generates tailored cover letters, answers application questions, performs company-aware research, and renders editable PDF/resume outputs from a resume plus job description workflow.",
    technologies: ["Python", "Flask", "React", "Vite", "OpenRouter", "Web Search", "PDF Generation", "Docker"],
    highlights: [
      "Implemented OpenRouter-based generation with a YAML-driven model allowlist enforced in both backend validation and frontend selection.",
      "Added company-context web search, application-question answering, and prompt rules that ground responses in resume and project evidence.",
      "Built editable cover-letter text before PDF download plus tailored resume PDF generation from structured resume YAML, including company-specific filenames."
    ],
    demoUrl: "https://cover-letter-generator-424176252593.us-central1.run.app",
    githubUrl: "https://github.com/devangb3/Cover-Letter-Generator",
    isOpenSource: true
  },
  {
    id: "synthetic-data-generator",
    title: "Synthetic Data Generator",
    description:
      "Built a full-stack application for generating realistic synthetic stock-market data with tunable volatility, event intensity, and black-swan scenarios for analysis and experimentation.",
    technologies: ["Python", "FastAPI", "React", "Vite", "AWS Amplify", "Financial Modeling"],
    highlights: [
      "Generated configurable financial time-series data that mimics real-world market behavior under varying volatility profiles.",
      "Exposed controls for initial price, number of days, volatility, and extreme-event frequency to support different scenario analyses.",
      "Built a browser-based interface for interactive generation and visualization."
    ],
    demoUrl: "https://main.d1jhxtwybbezfy.amplifyapp.com/",
    githubUrl: "#",
    isOpenSource: false
  },
  {
    id: "recipe-agent",
    title: "Recipe Agent",
    description:
      "Built an agent-backed recipe API that combines large-scale recipe ingestion, MongoDB-backed retrieval, and external nutrition APIs to answer cooking and meal-planning queries.",
    technologies: ["Python", "FastAPI", "MongoDB", "OpenRouter", "USDA API", "Agentic Workflows"],
    highlights: [
      "Designed the service to ingest large recipe datasets and expose them through an API-oriented agent interface.",
      "Integrated external nutrition data and MongoDB persistence to support structured recipe and meal-query workflows.",
      "Packaged the project as both an API service and a data-ingestion pipeline."
    ],
    demoUrl: "#",
    githubUrl: "https://github.com/devangb3/Recipe-Agent",
    isOpenSource: true
  },
  {
    id: "resshare",
    title: "ResShare - Decentralized File Sharing System",
    description:
      "Built a decentralized file-sharing platform on top of ResilientDB and IPFS, with secure document storage, sharing workflows, and a RAG-powered assistant for uploaded files.",
    technologies: ["Python", "Flask", "IPFS", "ResilientDB", "React", "Distributed Systems", "RAG"],
    highlights: [
      "Integrated IPFS-backed storage and sharing workflows for secure distributed file management.",
      "Built a document assistant that answers questions over uploaded files using RAG and source-aware retrieval.",
      "Designed the system to preserve user-level data isolation while supporting semantic search across documents."
    ],
    demoUrl: "https://res-share-deployable.vercel.app/",
    githubUrl: "https://github.com/devangb3/ResShareDeployable",
    isOpenSource: true
  },
  {
    id: "reschat",
    title: "ResChat - Low-Latency Communication Platform with AI Assistant",
    description:
      "Built a low-latency communication system using C++ and Python for real-time messaging, large-file transfer, and retrieval-augmented document assistance over distributed data stores.",
    technologies: ["C++", "Python", "Bazel", "LangChain", "FAISS", "Distributed Systems", "RAG"],
    highlights: [
      "Built the core communication platform for real-time messaging and large file transfers on top of distributed infrastructure.",
      "Implemented a RAG assistant that parses documents, generates embeddings, and retrieves context from FAISS-backed indices.",
      "Combined systems-level performance work in C++ with AI application logic in Python."
    ],
    demoUrl: "#",
    githubUrl: "https://github.com/ResilientApp/ResChat",
    isOpenSource: true
  },
  {
    id: "loan-portal",
    title: "Commercial Loan Referral Platform",
    description:
      "Built a full-stack commercial lending platform with partner, borrower, and admin portals, combining a modular FastAPI backend with a polished React/Vite frontend for pipeline management and commission workflows.",
    technologies: ["Python", "FastAPI", "SQLModel", "Alembic", "PostgreSQL", "React", "Vite", "Tailwind CSS"],
    highlights: [
      "Implemented multi-role authentication and end-to-end workflows for partner onboarding, borrower account creation, admin approvals, and secure password reset flows.",
      "Built an admin Kanban pipeline with stage and substage management, lender assignment, rejection flows, and forward-only commission lifecycle updates.",
      "Added exports, notifications, and modular backend/frontend architecture that cleanly separated modules by domain responsibility."
    ],
    demoUrl: "https://loan-lender-portal.vercel.app/",
    githubUrl: "https://github.com/devangb3/Loan-Lender-portal",
    isOpenSource: true
  },
  {
    id: "llm-chatbot",
    title: "LLM Self-Chat - Agentic AI Simulation Framework",
    description:
      "Built a multi-agent simulation framework that lets users orchestrate conversations among multiple LLMs with bring-your-own-key support across providers.",
    technologies: ["Python", "LangChain", "WebSockets", "Gemini API", "React", "Flask", "MongoDB"],
    highlights: [
      "Built a multi-LLM chat system with secure BYOK support and interactive agent simulation.",
      "Integrated WebSockets to keep the React frontend and Flask backend synchronized with low latency during live conversations."
    ],
    demoUrl: "#",
    githubUrl: "https://github.com/devangb3/LLM-Self-Chat",
    isOpenSource: true
  },
  {
    id: "nanogpt-rigveda",
    title: "NanoGPT-RigVeda",
    description:
      "Implemented character-level language modeling experiments on Rig Veda text, progressing from a bigram baseline to a GPT-style decoder with masked self-attention in PyTorch.",
    technologies: ["Python", "PyTorch", "Transformers", "Language Modeling", "Attention"],
    highlights: [
      "Implemented both a baseline bigram model and a decoder-only self-attention model from scratch.",
      "Built data-preparation tooling to construct the training corpus from Sanskrit source files.",
      "Used the project to directly work through transformer internals rather than treating them as a black-box API."
    ],
    demoUrl: "#",
    githubUrl: "https://github.com/devangb3/NanoGPT-RigVeda",
    isOpenSource: true
  },
  {
    id: "http-server",
    title: "HTTP Server from Scratch",
    description:
      "Built an HTTP server from scratch with custom request and response handling, chunked encoding support, binary payload handling, and JUnit-backed validation.",
    technologies: ["Java", "Go", "HTTP", "JUnit", "Maven"],
    highlights: [
      "Implemented low-level HTTP request parsing and response handling rather than relying on a web framework.",
      "Added chunked-transfer support, binary-data handling, and explicit error-response paths.",
      "Backed the project with JUnit tests and a companion Go implementation module."
    ],
    demoUrl: "#",
    githubUrl: "https://github.com/devangb3/http-server",
    isOpenSource: true
  },
  {
    id: "github-issue-classifier",
    title: "Multi-Label GitHub Issue Classifier",
    description:
      "Developed and benchmarked a transformer-based model to automatically classify GitHub issues with multiple labels, achieving a 60% performance uplift over baseline.",
    technologies: ["Python", "PyTorch", "Hugging Face Transformers", "RoBERTa", "Scikit-learn", "Pandas"],
    highlights: [
      "Built a robust preprocessing pipeline for noisy real-world GitHub issue data and balanced label distributions with iterative stratification.",
      "Fine-tuned RoBERTa-base to outperform the DistilBERT baseline by 60% on F1 Macro.",
      "Reduced the label space to the most predictive 28 classes to improve signal quality and training efficiency."
    ],
    demoUrl: "https://huggingface.co/devangb4/scikit-issues-multilabel-classification",
    githubUrl: "https://github.com/devangb3/HF-Transformers/blob/main/scikit-Issue-Classifier.ipynb",
    isOpenSource: true
  },
  {
    id: "drug-condition-classifier",
    title: "Drug Condition Classifier (BERT Fine-Tuning)",
    description:
      "Fine-tuned BERT for multi-class medical text classification over 126,000+ drug reviews to predict patient conditions across 821 labels.",
    technologies: ["Python", "PyTorch", "Hugging Face Transformers", "BERT", "Scikit-learn", "W&B"],
    highlights: [
      "Built data-cleaning and preprocessing pipelines for noisy drug-review corpora.",
      "Achieved 75.9% accuracy and a weighted F1-score of 0.75 on a 52,000+ sample test split.",
      "Published the trained model and tokenizer to the Hugging Face Hub for downstream inference."
    ],
    demoUrl: "https://huggingface.co/devangb4/bert-drug-classification",
    githubUrl: "https://github.com/devangb3/HF-Transformers/blob/main/Drug_dataset_finetuning.ipynb",
    isOpenSource: true
  },
  {
    id: "daily-digest",
    title: "Daily Digest - AI-Powered Gmail/Calendar Summarizer",
    description:
      "Built an AI assistant that summarizes Gmail and Google Calendar activity, prioritizes daily context, and reduces planning overhead through Gemini-powered summarization.",
    technologies: ["Python", "Flask", "Gemini API", "OAuth 2.0", "Google Workspace APIs"],
    highlights: [
      "Built secure OAuth-backed integrations for Gmail and Calendar data access.",
      "Generated priority-aware daily summaries and added text-to-speech support for quick consumption."
    ],
    demoUrl: "https://calendar-gmail-summary-frontend.onrender.com/",
    githubUrl: "https://github.com/devangb3/Calendar-Gmail-Summary",
    isOpenSource: true
  },
  {
    id: "algotrade",
    title: "HammerTrade (Stock Prediction Platform for HFTs)",
    description:
      "Built a model-comparison platform for trading workflows that continuously retrains predictive models and surfaces the best-performing model for a given asset and time horizon.",
    technologies: ["Python", "Flask", "MongoDB", "React", "Docker", "PyTorch", "Scikit-learn", "Pandas"],
    highlights: [
      "Implemented continuous model retraining and model selection over evolving market data.",
      "Built a user-facing comparison layer for evaluating predictive models on trading assets.",
      "Integrated multiple ML frameworks into one end-to-end forecasting platform."
    ],
    demoUrl: "http://hammertrade.tradnomic.com/",
    githubUrl: "https://github.com/devangb3",
    isOpenSource: false
  },
  {
    id: "75Hard",
    title: "Tracker App for 75 Hard Challenge",
    description:
      "Built a full-stack habit-tracking platform with cloud deployment, responsive dashboards, and data visualization for the 75 Hard challenge.",
    technologies: ["Python", "Flask", "MongoDB", "React", "Docker", "GCP", "Tailwind CSS", "CI/CD"],
    highlights: [
      "Designed a modular full-stack architecture with separate frontend and backend services.",
      "Built responsive dashboards with interactive visualizations and progress tracking.",
      "Containerized and deployed the stack to Google Cloud Run."
    ],
    demoUrl: "https://hard-tracker-frontend-75-424176252593.us-west1.run.app/",
    githubUrl: "https://github.com/devangb3/75-Hard-Tracker",
    isOpenSource: true
  },
  {
    id: "dc-menu-analyzer",
    title: "DC Menu Analyzer",
    description:
      "Built an AI-backed dining commons assistant that scrapes menu data and recommends meals based on dietary restrictions, allergies, and caloric goals.",
    technologies: ["Python", "FastAPI", "Gemini API", "BeautifulSoup4", "React", "Web Scraping"],
    highlights: [
      "Automated menu ingestion with a BeautifulSoup-based scraping pipeline.",
      "Integrated Gemini for personalized menu analysis and recommendation generation.",
      "Built real-time filtering for dietary restrictions and nutritional constraints."
    ],
    demoUrl: "#",
    githubUrl: "https://github.com/devangb3/DC-Menu-Analyzer",
    isOpenSource: true
  },
  {
    id: "mm-hilton-sprint",
    title: "Multi-Provider AI Integration for Presentation Analysis",
    description:
      "Built a multi-provider AI platform for presentation analysis that combined OpenAI, Anthropic, Google, and Perplexity with a staged migration from Firebase to a scalable PostgreSQL-backed Node.js architecture.",
    technologies: ["Python", "Node.js", "PostgreSQL", "Firebase", "REST APIs", "AI Platforms"],
    highlights: [
      "Integrated four AI providers behind a service-factory pattern for flexible orchestration.",
      "Designed a dual-database architecture that supported migration to a more scalable backend.",
      "Implemented composite and observer patterns for logging and monitoring."
    ],
    demoUrl: "#",
    githubUrl: "#",
    isOpenSource: false
  },
  {
    id: "rag-context",
    title: "RAG Client",
    description:
      "Built a retrieval-augmented assistant that answers questions over local documents, PDFs, notes, and source code using embeddings and vector search.",
    technologies: ["Python", "LangChain", "FAISS", "Gemini API", "Vector Databases", "RAG"],
    highlights: [
      "Implemented a context-aware retrieval engine for personal document collections and codebases.",
      "Orchestrated LLM, embedding, and vector-store interactions through LangChain pipelines.",
      "Integrated Gemini 2.5 Pro for embeddings while keeping the model layer swappable."
    ],
    demoUrl: "#",
    githubUrl: "https://github.com/devangb3/RAG-Client",
    isOpenSource: true
  },
  {
    id: "quiz",
    title: "LLM Quiz Generator",
    description:
      "Built a full-stack application that converts study materials into interactive quizzes with file ingestion, question generation, and real-time scoring.",
    technologies: ["Python", "FastAPI", "DeepSeek API", "Vite", "File Processing", "LLMs"],
    highlights: [
      "Handled TXT, PDF, DOC, and DOCX ingestion with dynamic encoding detection and PDF extraction.",
      "Generated context-aware multiple-choice questions from uploaded study materials.",
      "Built an interactive quiz interface with progress tracking, feedback, and score reporting."
    ],
    demoUrl: "#",
    githubUrl: "https://github.com/devangb3/LLM-Quiz",
    isOpenSource: true
  },
  {
    id: "atom",
    title: "Atom (Portfolio Management Software)",
    description:
      "Engineered backend systems for a high-traffic wealth management platform, improving performance, trading workflows, and cloud-backed scalability for enterprise finance users.",
    technologies: ["ASP.NET Core", "C#", "JavaScript", "Azure", "AWS", "Angular", "TypeScript", "SQL"],
    highlights: [
      "Reduced data retrieval times by 40% through backend and query-path optimization.",
      "Implemented real-time trading capabilities and modular backend improvements.",
      "Built scalable cloud-oriented architecture for a high-traffic financial platform."
    ],
    demoUrl: "#",
    githubUrl: "https://github.com/devangb3",
    isOpenSource: false
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
