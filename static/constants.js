import { GitHub, LinkedIn, Email, Phone, LocationOn } from '@mui/icons-material';
import LeetCodeIcon from './components/LeetCodeIcon';

export const projects = [
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
    id: "reschat",
    title: "ResChat (Decentralized Chatting System)",
    description: "Built a robust blockchain-based chatting system on top of ResilientDB using IPFS for private and high-performance messaging with file distribution capabilities, ensuring data integrity and availability; part of the Apache Software Foundation Incubator Project..",
    technologies: ["Python", "Flask", "IPFS", "ResilientDB", "ReactJS", "GraphQL", "Distributed Systems", "C++", "Bazel"],
    highlights: [
      "Implemented end-to-end encryption and IPFS-based distributed storage",
      "Built a blockchain-based chat system using ResilientDB and IPFS to ensure data integrity and censorship resistance.",
      "Contributed to the Apache Software Foundation Incubator Project, promoting decentralized messaging innovation."
    ],
    demoUrl: "#",
    githubUrl: "https://github.com/ResilientApp/ResChat",
    isOpenSource: true,
    hasPublicRepo: true
  },
  {
    id: "ai-code-analyzer",
    title: "AI-Powered Code Analysis Tool (GitHub Action)",
    description: "Engineered a comprehensive code analysis system using a Python CLI and a GitHub Action. The tool leverages Google's Gemini AI to automatically analyze codebases, provide intelligent feedback on pull requests, and suggest architectural improvements.",
    technologies: ["Python", "Node.js", "GitHub Actions", "Gemini AI API", "Git", "CI/CD", "REST APIs"],
    highlights: [
      "Built an event-driven GitHub Action that analyzes code on pull requests, pushes, and issues.",
      "Integrated Google's Gemini AI to identify cross-file patterns, security vulnerabilities, and refactoring opportunities.",
      "Implemented intelligent change detection using multiple git diff strategies to focus analysis on relevant code changes.",
      "Designed a dual-system with a Python CLI for local analysis and a Node.js-based GitHub Action for CI/CD integration."
    ],
    demoUrl: "#",
    githubUrl: "#",
    isOpenSource: false,
    hasPublicRepo: false
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
    id: "daily-digest",
    title: "Daily Digest - Calendar Gmail Summary",
    description: "A full-stack application providing smart summaries of Google Calendar events and Gmail messages using Gemini AI, featuring text/audio summaries and smart replies.",
    technologies: ["Python", "Flask", "React", "Node.js", "MongoDB", "Google Calendar API", "Gmail API", "Gemini AI API", "OAuth2", "SSL/TLS", "Google Cloud"],
    highlights: [
      "Generated AI-powered daily summaries for Google Calendar events and Gmail messages.",
      "Implemented secure Google OAuth2 authentication for Calendar and Gmail access.",
      "Integrated Text-to-Speech functionality for accessible audio summaries.",
      "Provided AI-driven smart reply suggestions for emails to improve productivity."
    ],
    demoUrl: "https://calendar-gmail-summary-frontend.onrender.com/",
    githubUrl: "https://github.com/devangb3/Calendar-Gmail-Summary",
    isOpenSource: true,
    hasPublicRepo: true
  },
  {
    id: "llm-chatbot",
    title: "LLM Self-Chat",
    description: "A framework for LLMs to converse with themselves or other LLMs, where an auditor can assign custom system prompts to each agent. Useful for prompt engineering, behavior analysis, and multi-agent simulations.",
    technologies: ["Python", "Websockets", "Gemini API", "Deepseek API",  "Claude API", "OpenAI API", "LLMs", "ReactJS", "Flask", "MongoDB"],
    highlights: [
      "Implemented a multi-agent system for LLMs to converse with each other.",
      "Utilized websockets for real-time communication between the frontend and backend.",
      "Implemented a custom system prompt for each agent to enable behavior analysis and prompt engineering."
    ],
    demoUrl: "#",
    githubUrl: "https://github.com/devangb3/LLM-Self-Chat",
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
    id: "gitartha-engine",
    title: "Gitartha Engine: A Semantic Search API for the Bhagavad Gita",
    description: "A full-stack application that brings the ancient text of the Bhagavad Gita to life with modern technology. Features a powerful semantic search engine using vector embeddings and PostgreSQL with pgvector extension for lightning-fast similarity searches.",
    technologies: ["Go", "Gin", "PostgreSQL", "pgvector", "React", "TypeScript", "Material-UI", "Python", "FastAPI", "Sentence-Transformers", "Vite", "Makefile", "golang-migrate"],
    highlights: [
      "Built a high-performance backend in Go leveraging vector embeddings for semantic search",
      "Implemented PostgreSQL with pgvector extension for lightning-fast similarity searches",
      "Created a clean and modern React frontend with TypeScript and Material-UI",
      "Developed a Python FastAPI service for https://github.com/devangb3/Gitartha-Enginereal-time embedding generation",
      "Built a complete data ingestion and processing pipeline with interactive API documentation"
    ],
    demoUrl: "#",
    githubUrl: "https://github.com/devangb3/Gitartha-Engine",
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
  { name: "Java", category: "Languages", icon: "☕" },
  { name: "Python3", category: "Languages", icon: "🐍" },
  { name: "JavaScript", category: "Languages", icon: "⚡" },
  { name: "C#", category: "Languages", icon: "🎯" },
  { name: "C++", category: "Languages", icon: "⚔️" },
  { name: "React", category: "Frameworks", icon: "⚛️" },
  { name: "Node.js", category: "Frameworks", icon: "🟢" },
  { name: "Flask", category: "Frameworks", icon: "🌶️" },
  { name: "AWS", category: "Cloud", icon: "🌩️" },
  { name: "GCP", category: "Cloud", icon: "🌈" },
  { name: "Azure", category: "Cloud", icon: "💠" },
  { name: "Docker", category: "Tools", icon: "🐳" },
  { name: "Git", category: "Tools", icon: "🌿" },
  { name: "Kubernetes", category: "Tools", icon: "⚓" },
  { name: "Linux", category: "Tools", icon: "🐧" },
  { name: "Hugging Face", category: "Tools", icon: "🤗" },
  { name: "Machine Learning", category: "AI", icon: "🤖" },
  { name: "LLMs", category: "AI", icon: "🧠" },
  { name: "RAG", category: "AI", icon: "📚" },
  { name: "Prompt Engineering", category: "AI", icon: "⌨️" },
  { name: "Deep Learning", category: "AI", icon: "🔮" },
  { name: "Model Fine Tuning", category: "AI", icon: "🎯" },
  { name: "Reinforcement Learning", category: "AI", icon: "🎮" },
  { name: "SQL", category: "Database", icon: "📊" },
  { name: "MongoDB", category: "Database", icon: "🍃" },
  { name: "PostgreSQL", category: "Database", icon: "🐘" },
  { name: "MySQL", category: "Database", icon: "🐬" },
  { name: "Redis", category: "Database", icon: "⚡" },
  { name: "Kafka", category: "Database", icon: "📨" },
  
  
];

export const experiences = [
  {
    title: "Software Engineer",
    company: "Hexaview Technologies",
    period: "2022 - 2024",
    description: "Enhanced user experience by implementing new features and improving system performance",
    technologies: ["C#", "Angular", "Azure", "SQL", "Dot Net Core 6.0", "Git"]
  },
  {
    title: "Graduate Student",
    company: "UC Davis",
    period: "2024 - Present",
    description: "Pursuing Master's in Computer Science with focus on AI and Distributed Systems",
    technologies: ["Python", "Machine Learning", "Distributed Systems"]
  },
  {
    "title": "Lead Software Engineering Intern - AI",
    "company": "LearnHaus AI",
    "period": "June 2025 - August 2025",
    "description": [
      "Developed a complete data processing pipeline utilizing AI Services for advanced emotional analysis and created a user-facing coaching and data visualization system to deliver insights."
    ],
    "technologies": [
      "Python",
      "FastAPI",
      "React",
      "GCP",
      "REST APIs",
      "LLMs",
      "Emotional Analysis",
      "Multimodal AI",
      "LLM-as-a-Judge"
    ]
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
    icon: <Phone />, 
    label: 'Phone', 
    value: 'Available on request', 
    href: '#',
    isClickable: false 
  },
  { 
    icon: <LocationOn />, 
    label: 'Location', 
    value: 'San Francisco Bay Area', 
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
  { icon: <Email />, url: 'mailto:devangborkar3@gmail.com', label: 'Email' },
  { icon: <LeetCodeIcon />, url: 'https://leetcode.com/u/devangborkar3/', label: 'LeetCode' }
];
