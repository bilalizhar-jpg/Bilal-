import { db } from './server/database/firebaseAdmin';

const candidates = [
  {
    name: "Muhammad Asim Arif",
    email: "asim_arif123@hotmail.com",
    phone: "+92345-2385857",
    currentJobTitle: "Staff Software Engineer",
    lastJobTitle: "Senior Full Stack Developer",
    skills: ["PHP", "AWS", "CI/CD", "Full Stack", "JavaScript", "SQL"],
    education: "Bachelor of Science in Software Engineering, University Of Karachi",
    certifications: "",
    category: "Full Stack Developer",
    keywords: "PHP, AWS, CI/CD, Full Stack, Software Engineer"
  },
  {
    name: "Fahad Javed",
    email: "fahadjavedpkptw_keb@indeedemail.com",
    phone: "+923214058242",
    currentJobTitle: "Software Engineer",
    lastJobTitle: "Software Engineer",
    skills: ["PHP", "Laravel", "CodeIgniter", "JavaScript", "Angular", "MySQL"],
    education: "CS (BS CS), Beaconhouse National University-Lahore",
    certifications: "",
    category: "Backend Developer",
    keywords: "PHP, Laravel, Backend, JavaScript, MySQL"
  },
  {
    name: "Abdul Aziz",
    email: "azizhanan786@gmail.com",
    phone: "03017328498",
    currentJobTitle: "Full Stack Software Engineer",
    lastJobTitle: "Full stack developer",
    skills: ["Vue.js", "PHP", "Laravel", "AWS", "Stripe", "JavaScript", "Jquery", "Nuxt.js"],
    education: "BSSE, University Of Okara",
    certifications: "",
    category: "Full Stack Developer",
    keywords: "Full Stack, Laravel, Vue.js, PHP, AWS"
  },
  {
    name: "Shahbaz Ahmad",
    email: "ahmadshahbazk@gmail.com",
    phone: "03434048478",
    currentJobTitle: "Senior Software Engineer",
    lastJobTitle: "Software Engineer",
    skills: ["PHP", "Laravel", "Vue.js", "SQL Server", "MySQL", "PostgreSQL", "OAuth", "Stripe"],
    education: "BS Software Engineering, Superior University",
    certifications: "",
    category: "Backend Developer",
    keywords: "PHP, Laravel, ERP, SQL, Backend"
  },
  {
    name: "Imtiaz Musheer",
    email: "imtiazmusheer@gmail.com",
    phone: "+923486090502",
    currentJobTitle: "Remote Software Engineer",
    lastJobTitle: "Php Team Lead Remote",
    skills: ["PHP", "Laravel", "Vue.js", "C#", "SQL Server", "Angularjs", "MySQL"],
    education: "Master’s Computer Science, UMT, LAHORE",
    certifications: "",
    category: "Full Stack Developer",
    keywords: "PHP, Laravel, Vue.js, Full Stack, Team Lead"
  },
  {
    name: "Arslan Javed",
    email: "arslanjaved57_484@indeedemail.com",
    phone: "+92 306 4761380",
    currentJobTitle: "Senior FullStack Developer",
    lastJobTitle: "Full stack Developer",
    skills: ["Laravel", "Node.js", "React", "MySQL", "ExpressJs", "Flutter"],
    education: "Not specified",
    certifications: "",
    category: "Full Stack Developer",
    keywords: "Laravel, Node.js, React, Full Stack, MySQL"
  },
  {
    name: "Muhammad Waqas Javaid",
    email: "mwaqasjavaid07@gmail.com",
    phone: "+92 316 5627 264",
    currentJobTitle: "SOFTWARE DEVELOPER",
    lastJobTitle: "SOFTWARE DEVELOPER",
    skills: ["Vue.js", "Laravel", "Next.js", "NestJS", "Django", "React.js", "GraphQL", "Docker", "PostgreSQL"],
    education: "Bachelor of Computer Science (BSCS), Abbottabad University of Science and Technology",
    certifications: "",
    category: "Full Stack Developer",
    keywords: "Vue.js, Laravel, Next.js, Django, Full Stack"
  }
];

async function seed() {
  let count = 0;
  for (const c of candidates) {
    await db.collection('candidates').add({
      companyId: 'default_company',
      ...c,
      cvFileUrl: '',
      source: 'Manual Upload',
      createdAt: new Date().toISOString(),
      stage: 'New Candidates',
      matchPercentage: Math.floor(Math.random() * 60) + 40,
    });
    count++;
  }
  console.log(`Successfully seeded ${count} new candidates.`);
}

seed().catch(console.error);
