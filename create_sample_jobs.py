"""
Create sample job descriptions via Flask API
"""

import requests
import json

def create_sample_jobs():
    base_url = "http://localhost:5000/api"
    
    sample_jobs = [
        {
            "title": "Senior Software Engineer",
            "company": "Tech Corp",
            "description": "We are looking for a Senior Software Engineer to join our dynamic team. You will be responsible for developing scalable web applications using modern technologies, leading technical initiatives, and mentoring junior developers.",
            "must_have_skills": ["JavaScript", "TypeScript", "React", "Node.js", "SQL", "Git"],
            "good_to_have_skills": ["AWS", "Docker", "GraphQL", "MongoDB", "Kubernetes", "CI/CD"],
            "experience_required": "3+ years in software development",
            "education_required": ["Bachelor's in Computer Science", "Bachelor's in Software Engineering"]
        },
        {
            "title": "Frontend Developer",
            "company": "Startup Inc",
            "description": "Join our innovative startup as a Frontend Developer. You'll work on cutting-edge user interfaces, collaborate with our design team, and help build the next generation of web applications.",
            "must_have_skills": ["HTML", "CSS", "JavaScript", "React", "Responsive Design"],
            "good_to_have_skills": ["Vue.js", "Sass", "Webpack", "Figma", "TypeScript", "Testing Libraries"],
            "experience_required": "2+ years in frontend development",
            "education_required": ["Bachelor's degree preferred", "Bootcamp certification"]
        },
        {
            "title": "Data Scientist",
            "company": "AI Solutions Ltd",
            "description": "Join our AI team as a Data Scientist. You'll work on machine learning projects, analyze large datasets, and develop predictive models.",
            "must_have_skills": ["Python", "Machine Learning", "Pandas", "NumPy", "SQL", "Statistics"],
            "good_to_have_skills": ["TensorFlow", "PyTorch", "R", "Spark", "AWS", "Deep Learning"],
            "experience_required": "2+ years in data science or analytics",
            "education_required": ["Master's in Data Science", "Bachelor's in Mathematics/Statistics"]
        }
    ]
    
    try:
        # Test health first
        health_response = requests.get(f"{base_url}/health")
        print(f"Backend health: {health_response.json()}")
        
        # Create jobs
        for job in sample_jobs:
            response = requests.post(f"{base_url}/job-descriptions", json=job)
            if response.status_code == 200:
                result = response.json()
                print(f"✅ Created job: {job['title']} (ID: {result.get('job_id')})")
            else:
                print(f"❌ Failed to create job: {job['title']} - {response.text}")
        
        # List all jobs
        jobs_response = requests.get(f"{base_url}/job-descriptions")
        if jobs_response.status_code == 200:
            jobs_data = jobs_response.json()
            print(f"\n📋 Total jobs in database: {len(jobs_data.get('jobs', []))}")
            for job in jobs_data.get('jobs', []):
                print(f"  - {job['title']} at {job['company']}")
        
        print("\n🎉 Sample jobs created successfully!")
        
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to Flask backend. Make sure it's running on port 5000")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    create_sample_jobs()
