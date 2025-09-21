"""
Simple script to populate only Job Descriptions first
"""

import requests
import json

def create_sample_jobs():
    """Create sample job descriptions directly"""
    base_url = "http://localhost:5000/api"
    
    # Simple, predefined job descriptions
    sample_jobs = [
        {
            "title": "Senior Software Engineer",
            "company": "TechCorp Solutions",
            "description": "We are seeking a Senior Software Engineer to join our dynamic development team. You will be responsible for designing, developing, and maintaining scalable web applications using modern technologies. The ideal candidate should have strong problem-solving skills and experience with full-stack development.",
            "must_have_skills": ["JavaScript", "React", "Node.js", "SQL", "Git"],
            "good_to_have_skills": ["TypeScript", "AWS", "Docker", "MongoDB"],
            "experience_required": "3+ years in software development",
            "education_required": ["Bachelor's in Computer Science", "Bachelor's in Engineering"]
        },
        {
            "title": "Frontend Developer",
            "company": "Digital Innovations Ltd",
            "description": "Join our creative team as a Frontend Developer. You will work on building responsive, user-friendly web interfaces and collaborate closely with our design and backend teams. We're looking for someone passionate about creating exceptional user experiences.",
            "must_have_skills": ["HTML", "CSS", "JavaScript", "React", "Responsive Design"],
            "good_to_have_skills": ["Vue.js", "Sass", "Webpack", "Figma", "TypeScript"],
            "experience_required": "2+ years in frontend development",
            "education_required": ["Bachelor's degree", "Relevant certification"]
        },
        {
            "title": "Data Scientist",
            "company": "AI Analytics Inc",
            "description": "We are looking for a Data Scientist to join our AI research team. You will work on machine learning projects, analyze large datasets, and develop predictive models to drive business insights. Experience with statistical analysis and programming is essential.",
            "must_have_skills": ["Python", "Machine Learning", "Statistics", "SQL", "Pandas"],
            "good_to_have_skills": ["TensorFlow", "PyTorch", "R", "Spark", "AWS"],
            "experience_required": "2+ years in data science",
            "education_required": ["Master's in Data Science", "Bachelor's in Statistics/Math"]
        }
    ]
    
    print("🚀 Starting Job Description Population...")
    
    try:
        # Test backend health with timeout
        print("Testing backend connection...")
        response = requests.get(f"{base_url}/health", timeout=5)
        
        if response.status_code == 200:
            print("✅ Backend is healthy")
            health_data = response.json()
            print(f"Response: {health_data}")
        else:
            print(f"❌ Backend health check failed: {response.status_code}")
            return
        
        print(f"\n📋 Creating {len(sample_jobs)} job descriptions...")
        
        created_jobs = []
        for i, job in enumerate(sample_jobs, 1):
            print(f"\n{i}. Creating: {job['title']} at {job['company']}")
            
            try:
                response = requests.post(
                    f"{base_url}/job-descriptions", 
                    json=job,
                    timeout=10
                )
                
                if response.status_code == 200:
                    result = response.json()
                    job_id = result.get('job_id')
                    created_jobs.append(job_id)
                    print(f"   ✅ Created successfully (ID: {job_id})")
                else:
                    print(f"   ❌ Failed: {response.status_code} - {response.text}")
                    
            except requests.exceptions.Timeout:
                print(f"   ⏰ Timeout creating job: {job['title']}")
            except Exception as e:
                print(f"   ❌ Error creating job: {e}")
        
        # Verify created jobs
        print(f"\n📊 Verification:")
        try:
            response = requests.get(f"{base_url}/job-descriptions", timeout=5)
            if response.status_code == 200:
                jobs_data = response.json()
                total_jobs = len(jobs_data.get('jobs', []))
                print(f"✅ Total jobs in database: {total_jobs}")
                
                for job in jobs_data.get('jobs', []):
                    print(f"   - {job['title']} at {job['company']} (ID: {job['id']})")
            else:
                print(f"❌ Failed to verify jobs: {response.status_code}")
                
        except Exception as e:
            print(f"❌ Verification error: {e}")
        
        print(f"\n🎉 Job Description population completed!")
        print(f"✅ Created {len(created_jobs)} jobs successfully")
        
        return created_jobs
        
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to Flask backend.")
        print("Make sure Flask server is running on http://localhost:5000")
        return []
    except requests.exceptions.Timeout:
        print("❌ Request timeout. Backend might be slow or stuck.")
        return []
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return []

if __name__ == "__main__":
    create_sample_jobs()
