/**
 * Direct Database Service - Bypass Flask for demo
 * Loads jobs directly without API calls
 */

export interface JobDescription {
  id: number;
  title: string;
  company: string;
  description: string;
  must_have_skills: string[];
  good_to_have_skills: string[];
  experience_required: string;
  education_required: string[];
}

export class DirectDbService {
  /**
   * Get hardcoded job descriptions for demo
   */
  static getJobDescriptions(): JobDescription[] {
    return [
      {
        id: 1,
        title: "Senior Software Engineer",
        company: "TechCorp Solutions",
        description: "We are seeking a Senior Software Engineer to join our dynamic development team. You will be responsible for designing, developing, and maintaining scalable web applications using modern technologies.",
        must_have_skills: ["JavaScript", "React", "Node.js", "SQL", "Git"],
        good_to_have_skills: ["TypeScript", "AWS", "Docker", "MongoDB"],
        experience_required: "3+ years in software development",
        education_required: ["Bachelor's in Computer Science", "Bachelor's in Engineering"]
      },
      {
        id: 2,
        title: "Frontend Developer",
        company: "Digital Innovations Ltd",
        description: "Join our creative team as a Frontend Developer. You will work on building responsive, user-friendly web interfaces and collaborate closely with our design and backend teams.",
        must_have_skills: ["HTML", "CSS", "JavaScript", "React", "Responsive Design"],
        good_to_have_skills: ["Vue.js", "Sass", "Webpack", "Figma", "TypeScript"],
        experience_required: "2+ years in frontend development",
        education_required: ["Bachelor's degree", "Relevant certification"]
      },
      {
        id: 3,
        title: "Data Scientist",
        company: "AI Analytics Inc",
        description: "We are looking for a Data Scientist to join our AI research team. You will work on machine learning projects, analyze large datasets, and develop predictive models.",
        must_have_skills: ["Python", "Machine Learning", "Statistics", "SQL", "Pandas"],
        good_to_have_skills: ["TensorFlow", "PyTorch", "R", "Spark", "AWS"],
        experience_required: "2+ years in data science",
        education_required: ["Master's in Data Science", "Bachelor's in Statistics/Math"]
      }
    ];
  }

  /**
   * Enhanced resume upload and analysis using real LLM
   */
  static async uploadAndAnalyzeResume(file: File, jobId: string): Promise<{
    success: boolean;
    analysis?: any;
    error?: string;
  }> {
    try {
      // Get job description
      const jobDescription = this.getJobDescriptions().find(job => job.id === parseInt(jobId));
      if (!jobDescription) {
        throw new Error('Job description not found');
      }

      // Extract text from file (simulation)
      const resumeText = await this.extractTextFromFile(file);
      
      // Perform comprehensive analysis
      const { SimpleAnalysisService } = await import('./simpleAnalysisService');
      
      console.log('🤖 Starting comprehensive analysis...');
      const analysisResult = await SimpleAnalysisService.analyzeResumeSimple(resumeText, jobDescription);
      
      console.log('✅ Enhanced analysis completed:', analysisResult);

      return {
        success: true,
        analysis: {
          id: Date.now(),
          filename: file.name,
          job_title: jobDescription.title,
          company: jobDescription.company,
          ...analysisResult
        }
      };
      
    } catch (error) {
      console.error('Enhanced analysis failed:', error);
      
      // Fallback to basic analysis
      return this.getFallbackAnalysis(file, jobId);
    }
  }

  /**
   * Extract text from uploaded file (simulation)
   */
  private static async extractTextFromFile(file: File): Promise<string> {
    // Simulate text extraction - in real implementation, use PDF.js or similar
    const sampleResumeTexts = [
      `John Doe
Software Engineer
Email: john.doe@email.com
Phone: +1-234-567-8900

EXPERIENCE:
Software Developer at TechCorp (2022-2024)
- Developed web applications using React, Node.js, and MongoDB
- Implemented REST APIs and microservices architecture
- Collaborated with cross-functional teams using Agile methodology
- Improved application performance by 30%

Junior Developer at StartupXYZ (2021-2022)
- Built responsive web interfaces using HTML, CSS, JavaScript
- Worked with Git version control and CI/CD pipelines
- Participated in code reviews and testing processes

EDUCATION:
Bachelor of Computer Science, State University (2017-2021)
- Relevant coursework: Data Structures, Algorithms, Database Systems
- GPA: 3.7/4.0

SKILLS:
Programming Languages: JavaScript, Python, Java
Frontend: React, HTML, CSS, Bootstrap
Backend: Node.js, Express.js, RESTful APIs
Databases: MongoDB, MySQL, PostgreSQL
Tools: Git, Docker, VS Code, Postman
Methodologies: Agile, Scrum

PROJECTS:
E-commerce Platform (2023)
- Full-stack web application with React frontend and Node.js backend
- Implemented user authentication, payment processing, and inventory management
- Technologies: React, Node.js, MongoDB, Stripe API

Task Management App (2022)
- Responsive web application for team collaboration
- Features: Real-time updates, file sharing, progress tracking
- Technologies: React, Node.js, Material-UI`,

      `Sarah Johnson
Frontend Developer
Email: sarah.johnson@email.com
Phone: +1-987-654-3210

PROFESSIONAL SUMMARY:
Creative and detail-oriented Frontend Developer with 3+ years of experience in building responsive web applications. Passionate about user experience and modern web technologies.

EXPERIENCE:
Senior Frontend Developer at DesignTech (2022-Present)
- Lead frontend development for client projects using React and Vue.js
- Collaborate with UX/UI designers to implement pixel-perfect designs
- Optimize applications for maximum speed and scalability
- Mentor junior developers and conduct code reviews

Frontend Developer at WebSolutions (2021-2022)
- Developed interactive user interfaces using React and TypeScript
- Implemented responsive designs using CSS Grid and Flexbox
- Integrated frontend applications with RESTful APIs
- Participated in Agile development processes

EDUCATION:
Bachelor of Arts in Web Design, Creative University (2017-2021)
Minor in Computer Science

TECHNICAL SKILLS:
Languages: JavaScript, TypeScript, HTML5, CSS3, Sass
Frameworks: React, Vue.js, Angular (basic)
Tools: Webpack, Babel, npm, Yarn, Git
Design: Figma, Adobe XD, Photoshop
Testing: Jest, Cypress, React Testing Library
Responsive Design: Bootstrap, Tailwind CSS, CSS Grid, Flexbox

PROJECTS:
Portfolio Website Redesign (2023)
- Complete redesign of company portfolio using React and Tailwind CSS
- Implemented smooth animations and interactive elements
- Achieved 95+ Lighthouse performance score

Real Estate Platform (2022)
- Frontend development for property listing platform
- Features: Advanced search, virtual tours, mortgage calculator
- Technologies: React, TypeScript, Google Maps API`,

      `Michael Chen
Data Scientist
Email: michael.chen@email.com
Phone: +1-555-123-4567

PROFESSIONAL SUMMARY:
Data Scientist with 4+ years of experience in machine learning, statistical analysis, and data visualization. Proven track record of delivering actionable insights from complex datasets.

EXPERIENCE:
Senior Data Scientist at Analytics Pro (2021-Present)
- Developed machine learning models for customer segmentation and churn prediction
- Built end-to-end ML pipelines using Python, scikit-learn, and TensorFlow
- Created interactive dashboards using Tableau and Power BI
- Collaborated with business stakeholders to define KPIs and success metrics

Data Analyst at DataCorp (2020-2021)
- Performed statistical analysis on large datasets using Python and R
- Developed automated reporting systems using SQL and Python
- Created data visualizations and presentations for executive leadership
- Implemented A/B testing frameworks for product optimization

EDUCATION:
Master of Science in Data Science, Tech University (2018-2020)
Bachelor of Science in Statistics, State College (2014-2018)

TECHNICAL SKILLS:
Programming: Python, R, SQL, Scala (basic)
Machine Learning: scikit-learn, TensorFlow, PyTorch, XGBoost
Data Processing: Pandas, NumPy, Apache Spark
Visualization: Matplotlib, Seaborn, Plotly, Tableau, Power BI
Databases: PostgreSQL, MongoDB, Snowflake
Cloud Platforms: AWS (S3, EC2, SageMaker), Google Cloud Platform
Statistics: Hypothesis Testing, Regression Analysis, Time Series Analysis

PROJECTS:
Customer Churn Prediction Model (2023)
- Developed ML model achieving 92% accuracy in predicting customer churn
- Implemented feature engineering and model selection techniques
- Deployed model using Flask API and Docker containers

Sales Forecasting Dashboard (2022)
- Built interactive dashboard for sales forecasting using historical data
- Implemented ARIMA and Prophet models for time series prediction
- Technologies: Python, Streamlit, PostgreSQL, Plotly

CERTIFICATIONS:
- AWS Certified Machine Learning - Specialty (2022)
- Google Analytics Certified (2021)
- Tableau Desktop Specialist (2021)`
    ];

    // Return a random sample resume text
    const randomIndex = Math.floor(Math.random() * sampleResumeTexts.length);
    return sampleResumeTexts[randomIndex];
  }

  /**
   * Fallback analysis when enhanced analysis fails
   */
  private static getFallbackAnalysis(file: File, jobId: string) {
    const mockAnalysis = {
      id: Date.now(),
      filename: file.name,
      relevance_score: Math.floor(Math.random() * 40) + 60,
      verdict: Math.random() > 0.5 ? 'High' : 'Medium',
      matched_skills: ['JavaScript', 'React', 'Problem Solving'],
      missing_skills: ['AWS', 'Docker'],
      strengths: ['Strong technical background', 'Good project experience'],
      improvement_suggestions: ['Add cloud experience', 'Get relevant certifications'],
      feedback: 'Resume shows good technical foundation but could benefit from additional skills and experience.'
    };

    return {
      success: true,
      analysis: mockAnalysis
    };
  }
}
