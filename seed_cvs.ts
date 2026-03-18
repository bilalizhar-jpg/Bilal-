import db from './server/database/db';

const candidates = [
  {
    name: "Ankush Arora",
    email: "nkusharoraa@gmail.com",
    phone: "+91 945 691 6921",
    current_job_title: "Assistant Manager, AI & Vehicle Dynamics Integration",
    last_job_title: "QA Automation Engineer",
    skills: ["Python", "C++", "Java", "SQL", "MATLAB", "scikit-learn", "TensorFlow", "PyTorch", "Keras", "XGBoost", "MLflow", "Pandas", "NumPy", "OpenCV", "spaCy", "FastAPI", "GCP", "Docker", "Kubernetes", "AWS", "RAG", "LangChain"],
    education: "Bachelor of Technology (B.Tech.) in Mechanical Engineering, Indian Institute of Technology Delhi",
    certifications: "MITx MicroMasters",
    category: "AI/ML Engineer",
    keywords: "AI, ML, Python, PyTorch, TensorFlow, RAG, LLM, Data Engineering"
  },
  {
    name: "Richman Loveday",
    email: "lovedayrichman@yahoo.com",
    phone: "+2347055553109",
    current_job_title: "Software Developer, PHP",
    last_job_title: "Backend Developer, Laravel",
    skills: ["PHP", "JavaScript", "SQL", "MySQL", "Laravel", "Slim", "Langchain.js", "Bootstrap", "Tailwind CSS", "Git", "Linux"],
    education: "B.Eng Computer Engineering, University of Uyo",
    certifications: "",
    category: "Backend Developer",
    keywords: "PHP, Laravel, Backend, API, MySQL, Slim"
  },
  {
    name: "Pranjal Radadiya",
    email: "radadiyapranjal@gmail.com",
    phone: "+91 7043918708",
    current_job_title: "Web Developer",
    last_job_title: "Web Development Intern",
    skills: ["Laravel", "PHP", "Node.js", "Python", "MySQL", "PostgreSQL", "MongoDB", "Vue.js", "Tailwind CSS", "JavaScript", "GitHub", "GitLab", "WordPress"],
    education: "Master of Computer Applications (MCA), IGNOU; Bachelor of Computer Applications (BCA), Hirpara Girls School & College",
    certifications: "",
    category: "Full Stack Developer",
    keywords: "Laravel, Vue.js, Full Stack, PHP, Tailwind, WordPress"
  },
  {
    name: "Dhruvisha Jagani",
    email: "dhruvishajagani71@gmail.com",
    phone: "+91-97127 60064",
    current_job_title: "Full-stack Developer",
    last_job_title: "Senior PHP Developer",
    skills: ["Laravel", "PHP", "API Development", "Shell Scripting", "MySQL", "AWS", "JavaScript", "AJAX", "CSS", "Bootstrap", "jQuery", "Vue.js", "React.js", "Node.js"],
    education: "Master of Computer Application, Suresh Gyan Vihar University; Bachelor of Computer Application, Veer Narmad South Gujarat University",
    certifications: "",
    category: "Full Stack Developer",
    keywords: "PHP, Laravel, Vue.js, React.js, AWS, Full Stack"
  },
  {
    name: "Ogunwa Anthonia Chinasa",
    email: "Ogunwaanthonia@gmail.com",
    phone: "+2348132094661",
    current_job_title: "Software Developer (Contract)",
    last_job_title: "Fullstack Developer",
    skills: ["Laravel", "PHP", "Eloquent ORM", "Vue.js", "Nuxtjs", "React", "Tailwind css", "MySql", "Javascript", "Typescript"],
    education: "Higher National Diploma (HND) in Chemical Engineering, Federal Polytechnic Nekede Owerri",
    certifications: "",
    category: "Software Developer",
    keywords: "Laravel, PHP, Vue.js, Nuxtjs, React, Frontend, Backend"
  },
  {
    name: "Rajan Desai",
    email: "desai.rajan.307@gmail.com",
    phone: "",
    current_job_title: "Full-Time Freelancer",
    last_job_title: "Software Engineer",
    skills: ["Laravel", "CodeIgniter", "Core PHP", "MySQL", "jQuery", "JavaScript", "HTML", "CSS", "Bootstrap", "Vue.js", "Node.js", "MongoDB"],
    education: "MCA, Gujarat Technological University; BCA, Saurashtra University",
    certifications: "",
    category: "PHP Developer",
    keywords: "Laravel, CodeIgniter, PHP, Vue.js, Node.js"
  },
  {
    name: "Iqra Nasir",
    email: "iqranasir251@gmail.com",
    phone: "+92 3176895251",
    current_job_title: "Senior Backend Engineer",
    last_job_title: "Laravel Developer",
    skills: ["PHP", "Laravel", "Bootstrap", "Css", "Tailwind", "Javascript", "Jquery", "NextJs", "Typescript", "NodeJs", "NestJs", "MySql", "MongoDB", "ReactJs", "VueJs"],
    education: "BS Software Engineering, Khwaja Fareed university of engineering and IT",
    certifications: "Certified as a laravel developer",
    category: "Backend Developer",
    keywords: "Laravel, PHP, Node.js, Backend, NestJs"
  },
  {
    name: "Mohammed Ali",
    email: "alimoh22062000@gmail.com",
    phone: "+2348135756270",
    current_job_title: "Software Engineer",
    last_job_title: "Youth Corper",
    skills: ["PHP", "Laravel", "JavaScript", "HTML", "CSS", "Vue.js", "React", "Next.js", "Tailwind CSS", "MySQL", "REST APIs"],
    education: "Master of Science (M.Sc.) in Computer Science, University of Ilorin; Bachelor of Science (B.Sc.) in Computer Science, University of Ilorin",
    certifications: "",
    category: "Software Engineer",
    keywords: "Laravel, PHP, Vue.js, React, Full Stack"
  },
  {
    name: "Muhammad Arslan",
    email: "ma0305422@gmail.com",
    phone: "+92 340 030 5422",
    current_job_title: "Full Stack Developer",
    last_job_title: "Php / Laravel Jr.",
    skills: ["PHP", "Laravel", "Blade", "HTML", "CSS", "Bootstrap", "Tailwind", "JavaScript", "JQuery", "MySQL", "React.js", "Vue.js"],
    education: "BS Computer Science, The Islamia University of Bahawalpur",
    certifications: "Programming with C++",
    category: "Full Stack Developer",
    keywords: "PHP, Laravel, React.js, Vue.js, Full Stack"
  },
  {
    name: "K. Nabeela Fatima",
    email: "nabeelafatima4ll@gmail.com",
    phone: "9700912007",
    current_job_title: "Software Developer",
    last_job_title: "Full Stack PHP Developer [Intern]",
    skills: ["HTML5", "CSS3", "JavaScript", "PHP", "Laravel", "Core Java", "Bootstrap 5", "React.js", "Node.js", "MySQL", "PostgreSQL", "MongoDB"],
    education: "B.Sc. (MPCs), KV Ranga Reddy Degree College for Women",
    certifications: "Web and Mobile Application at Nirmaan.org",
    category: "Full Stack Developer",
    keywords: "PHP, Laravel, React.js, Node.js, Full Stack"
  }
];

const stmt = db.prepare(`
  INSERT INTO candidates (
    company_id, name, email, phone, cv_file_url, source, 
    current_job_title, last_job_title, skills, education, 
    certifications, category, keywords
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

let count = 0;
for (const c of candidates) {
  stmt.run(
    'default_company',
    c.name,
    c.email,
    c.phone,
    '',
    'Manual Upload',
    c.current_job_title,
    c.last_job_title,
    JSON.stringify(c.skills),
    c.education,
    c.certifications,
    c.category,
    c.keywords
  );
  count++;
}

console.log(`Successfully seeded ${count} candidates.`);
