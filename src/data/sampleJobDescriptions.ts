/**
 * Sample Job Descriptions for Testing
 * These will be added to Firestore for demo purposes
 */

import { IJobDescription } from '@/types';

export const sampleJobDescriptions: Omit<IJobDescription, 'id' | 'createdAt' | 'uploadedBy' | 'applicationCount'>[] = [
  {
    title: "Senior Software Engineer",
    company: "Tech Corp",
    description: "We are looking for a Senior Software Engineer to join our dynamic team. You will be responsible for developing scalable web applications using modern technologies, leading technical initiatives, and mentoring junior developers. The ideal candidate should have strong problem-solving skills and experience with full-stack development.",
    requirements: {
      mustHave: [
        "JavaScript",
        "TypeScript", 
        "React",
        "Node.js",
        "SQL",
        "Git"
      ],
      goodToHave: [
        "AWS",
        "Docker",
        "GraphQL",
        "MongoDB",
        "Kubernetes",
        "CI/CD"
      ],
      experience: "3+ years in software development",
      education: [
        "Bachelor's in Computer Science",
        "Bachelor's in Software Engineering",
        "Equivalent experience"
      ]
    },
    isActive: true
  },
  {
    title: "Frontend Developer",
    company: "Startup Inc",
    description: "Join our innovative startup as a Frontend Developer. You'll work on cutting-edge user interfaces, collaborate with our design team, and help build the next generation of web applications. We're looking for someone passionate about creating exceptional user experiences.",
    requirements: {
      mustHave: [
        "HTML",
        "CSS", 
        "JavaScript",
        "React",
        "Responsive Design"
      ],
      goodToHave: [
        "Vue.js",
        "Sass",
        "Webpack",
        "Figma",
        "TypeScript",
        "Testing Libraries"
      ],
      experience: "2+ years in frontend development",
      education: [
        "Bachelor's degree preferred",
        "Bootcamp certification",
        "Strong portfolio"
      ]
    },
    isActive: true
  },
  {
    title: "Full Stack Developer",
    company: "Digital Agency",
    description: "We're seeking a Full Stack Developer to work on diverse client projects. You'll be involved in both frontend and backend development, database design, and API integration. This role offers great variety and the opportunity to work with cutting-edge technologies.",
    requirements: {
      mustHave: [
        "JavaScript",
        "Python",
        "React",
        "Django",
        "PostgreSQL",
        "REST APIs"
      ],
      goodToHave: [
        "Next.js",
        "FastAPI",
        "Redis",
        "AWS",
        "Docker",
        "Microservices"
      ],
      experience: "2-4 years full stack development",
      education: [
        "Bachelor's in Computer Science",
        "Related technical degree"
      ]
    },
    isActive: true
  },
  {
    title: "Data Scientist",
    company: "AI Solutions Ltd",
    description: "Join our AI team as a Data Scientist. You'll work on machine learning projects, analyze large datasets, and develop predictive models. The role involves collaborating with cross-functional teams to deliver data-driven insights and solutions.",
    requirements: {
      mustHave: [
        "Python",
        "Machine Learning",
        "Pandas",
        "NumPy",
        "SQL",
        "Statistics"
      ],
      goodToHave: [
        "TensorFlow",
        "PyTorch",
        "R",
        "Spark",
        "AWS",
        "Deep Learning"
      ],
      experience: "2+ years in data science or analytics",
      education: [
        "Master's in Data Science",
        "Bachelor's in Mathematics/Statistics",
        "PhD in related field"
      ]
    },
    isActive: true
  },
  {
    title: "DevOps Engineer",
    company: "Cloud Systems Inc",
    description: "We're looking for a DevOps Engineer to help us scale our infrastructure and improve our deployment processes. You'll work with containerization, CI/CD pipelines, and cloud platforms to ensure reliable and efficient operations.",
    requirements: {
      mustHave: [
        "AWS",
        "Docker",
        "Kubernetes",
        "Linux",
        "CI/CD",
        "Infrastructure as Code"
      ],
      goodToHave: [
        "Terraform",
        "Ansible",
        "Monitoring Tools",
        "Python",
        "Bash Scripting",
        "Security"
      ],
      experience: "3+ years in DevOps or Infrastructure",
      education: [
        "Bachelor's in Computer Science",
        "System Administration background",
        "Cloud certifications preferred"
      ]
    },
    isActive: true
  }
];

export default sampleJobDescriptions;
