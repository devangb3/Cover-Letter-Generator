import { GitHub, LinkedIn, Email, LocationOn, Twitter } from '@mui/icons-material';
import LeetCodeIcon from './components/LeetCodeIcon';

export const projects = [
  {
    "id": "lh-multimodal-svc",
    "title": "Emotion-Aware Feedback System for Public Speaking",
    "description": "This project involved creating a service to process and analyze multimodal data (video, audio, text) to provide feedback on presentation skills. It uses Hume AI for emotional analysis and includes a coaching and visualization system.",
    "technologies": ["Python", "Hume AI", "Multimodal Data Processing", "AI Development", "Data Visualization"],
    "highlights": [
      "Engineered a pipeline for processing video, audio, and text data.",
      "Integrated Hume AI for emotional analysis of presentations.",
      "Developed a coaching and visualization system to provide actionable feedback.",
      "Created a system for one AI to judge the responses of another, ensuring high-quality feedback."
    ],
    "demoUrl": "https://multimodal-svc-frontend-277660335430.us-central1.run.app/",
    "githubUrl": "#",
    "isOpenSource": false,
    "hasPublicRepo": false
  },
  {
    id: "causalflow",
    title: "CausalFlow: Autonomous Agent Debugging Framework",
    description: "Built an interpretable agentic framework achieving 40% performance uplift over baseline to resolve failures in multi-step reasoning chains for long horizon complex tasks.",
    technologies: ["Python", "LLMs", "Agentic Frameworks", "Debugging"],
    highlights: [
        "Built an interpretable agentic framework achieving 40% performance uplift over baseline to resolve failures in multi-step reasoning chains for long horizon complex tasks",
        "Engineered deterministic synthetic environments to ground agent execution in verifiable state transitions, eliminating hallucination risks associated with LLM-based world modeling"
    ],
    demoUrl: "#",
    githubUrl: "https://github.com/devangb3/CausalFlow",
    isOpenSource: true,
    hasPublicRepo: true
  },
  {
    id: "reschat",
    title: "ResChat – Decentralized Platform with AI Assistant",
    description: "Built a low latency communication platform using C++ and Python leveraging distributed storage systems for real-time messaging and large file transfers.",
    technologies: ["C++", "Python", "RAG", "LangChain", "Distributed Systems", "FAISS"],
    highlights: [
      "Built a low latency communication platform using C++ and Python leveraging distributed storage systems for real-time messaging and large file transfers",
      "Implemented a RAG-based AI chatbot using LangChain for document parsing across distributed databases and reducing information retrieval time by 85%.",
      "Developed a pipeline to generate high-quality embeddings and index documents in a FAISS vector database, optimizing for accurate embedding-based retrieval."
    ],
    demoUrl: "https://res-share-deployable.vercel.app/",
    githubUrl: "https://github.com/devangb3/ResShareDeployable",
    isOpenSource: true,
    hasPublicRepo: true
  },
  {
    id: "llm-chatbot",
    title: "LLM Self-Chat - Agentic AI Simulation Framework",
    description: "Built an agentic framework using Python and LangChain, enabling multi-agent LLM simulations for behavior analysis and prompt engineering.",
    technologies: ["Python", "LangChain", "Websockets", "Gemini API", "ReactJS", "Flask"],
    highlights: [
      "Built an agentic framework using Python and LangChain, enabling multi-agent LLM simulations for behavior analysis and prompt engineering.",
      "Integrated WebSockets to establish a real-time, low-latency communication channel between the React front-end and Flask backend for interactive agent simulation."
    ],
    demoUrl: "#",
    githubUrl: "https://github.com/devangb3/LLM-Self-Chat",
    isOpenSource: true,
    hasPublicRepo: true
  },
  {
    id: "gitartha-engine",
    title: "Gitartha Engine – Semantic Search for the Bhagavad Gita",
    description: "Architected a full-stack application using Go (Gin) for the high-concurrency REST API and FastAPI for ML model inference, achieving consistent P95 search latency of under 15ms.",
    technologies: ["Go", "Gin", "PostgreSQL", "pgvector", "React", "TypeScript", "Python", "FastAPI"],
    highlights: [
      "Architected a full-stack application using Go (Gin) for the high-concurrency REST API and FastAPI for ML model inference, achieving consistent P95 search latency of under 15ms.",
      "Developed low latency semantic search using PostgreSQL with the pgvector extension, resulting in an average query response time of 12.7ms across a corpus of 700+ verses."
    ],
    demoUrl: "#",
    githubUrl: "https://github.com/devangb3/Gitartha-Engine",
    isOpenSource: true,
    hasPublicRepo: true
  },
  {
    id: "daily-digest",
    title: "Daily Digest – AI-Powered Gmail/Calendar Summarizer",
    description: "Built an AI assistant reducing the daily planning overhead by 70% using Flask and Python powered by Gemini AI via secure OAuth 2.0, providing personalized priority-based summaries and Text-To-Speech capabilities.",
    technologies: ["Python", "Flask", "Gemini AI", "OAuth 2.0", "Google Workspace APIs"],
    highlights: [
      "Built an AI assistant reducing the daily planning overhead by 70% using Flask and Python powered by Gemini AI via secure OAuth 2.0, providing personalized priority-based summaries and Text-To-Speech capabilities.",
      "Generated AI-powered daily summaries for Google Calendar events and Gmail messages."
    ],
    demoUrl: "https://calendar-gmail-summary-frontend.onrender.com/",
    githubUrl: "https://github.com/devangb3/Calendar-Gmail-Summary",
    isOpenSource: true,
    hasPublicRepo: true
  },
  {
    id: "algotrade",
    title: "HammerTrade (Stock Prediction Platform for HFTs)",
    description: "Developed a platform allowing end-users to view which predictive model performs best on a given asset at a specific time and implemented continuous model retraining and updating to improve prediction accuracy over time.",
    technologies: ["Flask", "MongoDB", "ReactJS", "Docker", "Pytorch", "Scikit-learn", "Pandas", "Deep Learning"],
    highlights: [
      "Implemented continuous model retraining",
      "Built predictive model comparison system",
      "Improved prediction accuracy over time",
      "Integrated multiple ML frameworks"
    ],
    demoUrl: "http://hammertrade.tradnomic.com/",
    githubUrl: "https://github.com/devangb3",
    isOpenSource: false,
    hasPublicRepo: false
  },
  {
    id: "prm-on-device",
    title: "Process Reward Model (PRM) for On-Device LLMs",
    description: "Architected a composite inference system coupling a lightweight generator (Qwen3-0.6B) with a heavy verifier (Qwen3-8B), enabling efficient 'weak-to-strong' generalization for resource-constrained environments.",
    technologies: ["Python", "Qwen", "LLMs", "On-Device AI", "Inference Optimization"],
    highlights: [
        "Architected a composite inference system coupling a lightweight generator (Qwen3-0.6B) with a heavy verifier (Qwen3-8B), enabling efficient 'weak-to-strong' generalization for resource-constrained environments",
        "Optimized Python implementations of Search strategies to dynamically traverse and score reasoning chains in real-time"
    ],
    demoUrl: "#",
    githubUrl: "https://github.com/devangb3/Process-Reward-Models",
    isOpenSource: true,
    hasPublicRepo: true
  },
  {
    "id": "github-issue-classifier",
    "title": "Multi-Label GitHub Issue Classifier",
    "description": "Developed and benchmarked a transformer-based model to automatically classify GitHub issues with multiple labels, achieving a 60% performance uplift over a baseline model.",
    "technologies": ["Python", "PyTorch", "Hugging Face Transformers", "RoBERTa", "skmultilearn", "Scikit-learn", "Pandas"],
    "highlights": [
      "Engineered a robust data preprocessing pipeline to handle noisy, real-world GitHub issue data, using iterative stratification to ensure balanced label distribution for reliable model evaluation.",
      "Executed a systematic model selection process, fine-tuning RoBERTa-base to achieve a test F1 Macro score of 0.21—a 60% performance improvement over the DistilBERT baseline.",
      "Optimized the problem space by programmatically filtering low-frequency tags, reducing the label set to the 28 most predictive classes to improve training efficiency and model focus."
    ],
    "demoUrl": "https://huggingface.co/devangb4/scikit-issues-multilabel-classification",
    "githubUrl": "https://github.com/devangb3/HF-Transformers/blob/main/scikit-Issue-Classifier.ipynb",
    "isOpenSource": true,
    "hasPublicRepo": true
  },
  {
    id: "drug-condition-classifier",
    title: "Drug Condition Classifier (BERT Fine-Tuning)",
    description: "Developed and fine-tuned a BERT-based model for multi-class text classification to predict a patient's medical condition from drug review text. The project involved data cleaning, preprocessing, and training on over 126,000 samples.",
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
    description: "Developed a platform allowing end-users to track their progress for the 75 Hard Challenge.",
    technologies: ["Flask", "MongoDB", "ReactJS", "Docker", "Google Cloud Platform", "Tailwind CSS", "Python", "CI/CD"],
    highlights: [
      "Developed a full-stack application with a modular, service-oriented architecture.",
      "Built an interactive and responsive UI with React and Tailwind CSS, featuring data visualizations with Recharts.",
      "Integrated Google Cloud Platform for scalable and reliable cloud services",
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
    description: "Developed a web application that helps UC Davis students analyze Tercero Dining Commons menu items based on their dietary restrictions and preferences. The application uses AI to provide personalized menu recommendations while considering dietary restrictions, allergies, and caloric requirements.",
    technologies: ["Web Scraping", "Python", "FastAPI", "Gemini AI API", "BeautifulSoup4", "ReactJS", "LLMs"],
    highlights: [
      "Built a web scraping pipeline using BeautifulSoup4 to automatically extract and parse dining commons menu data",
      "Integrated Google's Gemini AI API for intelligent menu analysis and personalized recommendations",
      "Implemented real-time dietary restriction validation and menu filtering system",
      "Developed responsive React frontend with Material-UI for seamless user interaction",
      "Created efficient data storage and caching system for quick menu retrieval and analysis"
    ],
    demoUrl: "#",
    githubUrl: "https://github.com/devangb3/DC-Menu-Analyzer",
    isOpenSource: true,
    hasPublicRepo: true
  },
  {
    id: "ai-code-analyzer",
    title: "AI CodeMentor – LLM-Powered Code Analysis",
    description: "Developed an LLM-powered agent for automated CI/CD code reviews, using agentic tool calling (OpenAI APIs) and Node.js to analyze PRs and issues.",
    technologies: ["Python", "Node.js", "GitHub Actions", "Gemini AI API", "Git", "CI/CD", "OpenAI API"],
    highlights: [
      "Developed an LLM-powered agent for automated CI/CD code reviews, using agentic tool calling (OpenAI APIs) and Node.js to analyze PRs and issues.",
      "Engineered the agent to parse git diffs via the GitHub API and invoke external analysis functions, providing intelligent, context-aware feedback on code changes."
    ],
    demoUrl: "#",
    githubUrl: "#",
    isOpenSource: false,
    hasPublicRepo: false
  },
  {
    id: "quiz",
    title: "LLM Quiz Generator",
    description: "Developed a full-stack web application that converts study materials into interactive quizzes.",
    technologies: ["Python", "FastAPI", "Uvicorn", "APIs", "Deepseek", "AI Development", "Vibe Coding", "Cursor", "Vite", "Deepseek-API"],
    highlights: [
      "File Upload & Processing: Supports various file formats (TXT, PDF, DOC, DOCX) with dynamic encoding detection and PDF content extraction.",
      "Quiz Generation: Generates multiple choice questions based on user-provided study materials. Integrates with Deepseek API to create context-aware quiz questions.",
      "Interactive Quiz Interface: Provides a dynamic quiz experience with real-time evaluation. Uses a progress indicator, immediate feedback on answers, and final score reporting."
    ],
    demoUrl: "#",
    githubUrl: "https://github.com/devangb3/LLM-Quiz",
    isOpenSource: true,
    hasPublicRepo: true
  },
  {
    "id": "mm-hilton-sprint",
    "title": "Multi-Provider AI Integration for Presentation Analysis",
    "description": "A project focused on developing a sophisticated multimodal system for presentation skills analysis. It integrates various AI providers (OpenAI, Anthropic, Google, Perplexity) and features a dual-database architecture with a seamless migration path from Firebase to a scalable Node.js backend with PostgreSQL.",
    "technologies": ["Python", "Node.js", "PostgreSQL", "Firebase", "REST APIs", "AI Development"],
    "highlights": [
      "Integrated four different AI providers for comprehensive analysis.",
      "Implemented a Service Factory Pattern for efficient AI provider management.",
      "Designed a dual-database system with a migration path to a more scalable solution.",
      "Developed a robust logging and monitoring system using the Composite and Observer patterns."
    ],
    "demoUrl": "#",
    "githubUrl": "#",
    "isOpenSource": false,
    "hasPublicRepo": false
  },
  {
    id: "synthetic-data-generator",
    title: "Synthetic Data Generator",
    description: "Developed a full-stack web application designed for financial analysts, developers, and researchers to generate high-quality, realistic synthetic stock market data.",
    technologies: ["Python", "FastAPI", "Uvicorn", "APIs", "AI Development","AWS Amplify", "React", "Vite"],
    highlights: [
      "Generate synthetic financial data mimicking real-world market conditions",
      "Fine-tune the data generation by controlling parameters like initial price, number of days, volatility, and the intensity and probability of 'black swan' events to simulate various market conditions.",
      "Provide a user-friendly interface for visualizing and generating synthetic data"
      ],
    demoUrl: "https://main.d1jhxtwybbezfy.amplifyapp.com/",
    githubUrl: "#",
    isOpenSource: false,
    hasPublicRepo: false
  },
  {
    id : "cover-letter-generator",
    title : "Cover Letter Generator",
    description : "Developed a full-stack web application that generates cover letters for job applications.",
    technologies : ["Python", "Flask", "APIs", "AI Development", "LLMs", "Cloud Run", "React", "Vite"],
    highlights : [
      "Generate customized cover letters for job applications",
      "Fine-tune the cover letter generation by controlling parameters like job title, company name, and job description",
      "Provide a user-friendly interface for visualizing and generating cover letters"
    ],
    demoUrl : "https://cover-letter-generator-424176252593.us-central1.run.app",
    githubUrl : "https://github.com/devangb3/Cover-Letter-Generator",
    isOpenSource : true,
    hasPublicRepo : true
  },
  {
    id : "rag-context",
    title: "RAG Client",
    description: "AI assistant designed to enable users to quickly find answers within their local documents (including PDFs, notes, and code files)",
    technologies: ["Python", "LangChain", "FAISS", "Gemini AI API", "Vector Databases", "Tokenization", "Retrieval Augmented Generation(RAG)"],
    highlights: [
      "Implemented Retrieval-Augmented Generation (RAG) techniques to create a context-aware search engine for personal document collections and codebases.",
      "Leveraged Python and LangChain to orchestrate interactions between large language models and vector databases, enhancing document retrieval and response generation.​",
      "Integrated the Gemini 2.5 Pro model via the Gemini AI API to generate embeddings, with flexibility to substitute alternative models as needed"
    ],
    demoUrl: "#",
    githubUrl: "https://github.com/devangb3/RAG-Client",
    isOpenSource: true,
    hasPublicRepo: true
  },
  {
    id: "resshare",
    title: "ResShare (Decentralized File Sharing System)",
    description: "Built a robust blockchain based file sharing system on top of the ResilientDB using IPFS for secure and efficient file distribution that ensures data integrity and availability.",
    technologies: ["Python", "Flask", "IPFS", "ResilientDB", "ReactJS", "GraphQL", "Distributed Systems"],
    highlights: [
      "Implemented blockchain-based security",
      "Integrated IPFS for file distribution",
      "Ensured data integrity and availability",
      "Built distributed system architecture"
    ],
    demoUrl: "#",
    githubUrl: "https://github.com/ResilientApp/ResShare-Backend",
    isOpenSource: true,
    hasPublicRepo: true
  },
  {
    id: "atom",
    title: "Atom (Portfolio Management Software)",
    description: "Engineered scalable backend architectures for a high-traffic wealth management platform, enabling real-time trading capabilities and enhancing performance through cloud infrastructure optimization and modular system upgrades.",
    technologies: ["Dot Net Core 6.0", "C#", "JavaScript", "Azure", "AWS", "Angular", "TypeScript", "SQL"],
    highlights: [
      "Reduced data retrieval times by 40%",
      "Implemented real-time trading capabilities",
      "Optimized cloud infrastructure",
      "Built scalable backend architecture"
    ],
    demoUrl: "#",
    githubUrl: "https://github.com/devangb3",
    isOpenSource: true,
    hasPublicRepo: true
  },
  {
    "id": "gemini-event-creator",
    "title": "Gemini Event Creator: AI-Powered Chrome Extension",
    "description": "A Chrome extension that turns any highlighted text on the web into a Google Calendar event. Uses on-device AI to parse event details, authenticates with Google, and creates events in one click.",
    "technologies": ["JavaScript", "Chrome Extension (Manifest V3)", "HTML5", "CSS3", "Google Calendar API", "Google Identity API (OAuth 2.0)", "Vite", "Gemini Nano (Prompt API)", "any-date-parser"],
    "highlights": [
      "Built a content script that injects a floating UI to capture selected text on any webpage",
      "Implemented a robust Manifest V3 service worker to handle background tasks, API calls, and state management",
      "Integrated Google's on-device Gemini Nano (Prompt API) for local, privacy-preserving extraction of event details (title, date, time)",
      "Engineered a secure authentication flow using `chrome.identity` to obtain OAuth 2.0 tokens for the Google Calendar API",
      "Designed a two-step UI: an instant 'Quick Create' and an 'Edit & Create' form with inputs for title, time, location, color, and reminders"
    ],
    "demoUrl": "https://chrome.google.com/webstore/detail/gemini-event-creator/hbbphgbndgjenboombeclnpepoiicpno",
    "githubUrl": "https://github.com/devangb3/Event-Creator",
    "isOpenSource": true,
    "hasPublicRepo": true
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
