"""
Populate Flask backend with sample JDs and resumes
"""

import requests
import os
import PyPDF2
from pathlib import Path

def extract_text_from_pdf(file_path):
    """Extract text from PDF file"""
    try:
        with open(file_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text()
        return text
    except Exception as e:
        print(f"Error extracting text from {file_path}: {e}")
        return ""

def create_job_from_jd_text(jd_text, filename):
    """Create job description from extracted text"""
    # Basic parsing - in production, use proper NLP
    title = "Software Engineer"  # Default
    company = "Tech Company"     # Default
    
    # Try to extract title and company from text
    lines = jd_text.split('\n')
    for line in lines[:10]:  # Check first 10 lines
        line = line.strip()
        if any(word in line.lower() for word in ['engineer', 'developer', 'analyst', 'manager']):
            title = line
            break
    
    # Extract skills (basic approach)
    skills_keywords = [
        'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'SQL', 'HTML', 'CSS',
        'TypeScript', 'Angular', 'Vue.js', 'Docker', 'AWS', 'Git', 'MongoDB',
        'PostgreSQL', 'Machine Learning', 'Data Science', 'AI', 'Kubernetes'
    ]
    
    must_have_skills = []
    good_to_have_skills = []
    
    text_lower = jd_text.lower()
    for skill in skills_keywords:
        if skill.lower() in text_lower:
            if any(word in text_lower for word in ['required', 'must', 'essential']):
                must_have_skills.append(skill)
            else:
                good_to_have_skills.append(skill)
    
    # Ensure we have some skills
    if not must_have_skills:
        must_have_skills = ['Programming', 'Problem Solving']
    if not good_to_have_skills:
        good_to_have_skills = ['Communication', 'Teamwork']
    
    return {
        "title": title,
        "company": company,
        "description": jd_text[:500] + "..." if len(jd_text) > 500 else jd_text,
        "must_have_skills": must_have_skills[:6],  # Limit to 6
        "good_to_have_skills": good_to_have_skills[:6],  # Limit to 6
        "experience_required": "2+ years",
        "education_required": ["Bachelor's degree"]
    }

def populate_sample_data():
    """Populate Flask backend with sample data"""
    base_url = "http://localhost:5000/api"
    
    try:
        # Test backend health
        print("Testing backend connection...")
        health_response = requests.get(f"{base_url}/health")
        if health_response.status_code != 200:
            print("❌ Backend not responding")
            return
        print("✅ Backend is healthy")
        
        # Process JD files
        jd_folder = Path("jd")
        job_ids = []
        
        print("\n📋 Processing Job Descriptions...")
        for jd_file in jd_folder.glob("*.pdf"):
            print(f"Processing {jd_file.name}...")
            
            # Extract text from JD
            jd_text = extract_text_from_pdf(jd_file)
            if not jd_text:
                print(f"⚠️ Could not extract text from {jd_file.name}")
                continue
            
            # Create job description
            job_data = create_job_from_jd_text(jd_text, jd_file.name)
            
            # Post to Flask API
            response = requests.post(f"{base_url}/job-descriptions", json=job_data)
            if response.status_code == 200:
                result = response.json()
                job_id = result.get('job_id')
                job_ids.append(job_id)
                print(f"✅ Created job: {job_data['title']} (ID: {job_id})")
            else:
                print(f"❌ Failed to create job from {jd_file.name}: {response.text}")
        
        if not job_ids:
            print("❌ No jobs created, cannot upload resumes")
            return
        
        # Process Resume files
        resumes_folder = Path("resumes")
        print(f"\n📄 Processing Resumes...")
        
        resume_count = 0
        for resume_file in resumes_folder.glob("*.pdf"):
            if resume_count >= 5:  # Limit to 5 resumes for demo
                break
                
            print(f"Processing {resume_file.name}...")
            
            # Select a job ID (rotate through available jobs)
            job_id = job_ids[resume_count % len(job_ids)]
            
            try:
                # Upload resume
                with open(resume_file, 'rb') as f:
                    files = {'file': f}
                    data = {'job_id': str(job_id)}
                    
                    upload_response = requests.post(
                        f"{base_url}/upload-resume", 
                        files=files, 
                        data=data
                    )
                
                if upload_response.status_code == 200:
                    upload_result = upload_response.json()
                    resume_id = upload_result.get('resume_id')
                    print(f"✅ Uploaded {resume_file.name} (Resume ID: {resume_id})")
                    
                    # Analyze resume
                    analyze_response = requests.post(f"{base_url}/analyze-resume/{resume_id}")
                    if analyze_response.status_code == 200:
                        print(f"✅ Analyzed {resume_file.name}")
                        resume_count += 1
                    else:
                        print(f"⚠️ Analysis failed for {resume_file.name}")
                else:
                    print(f"❌ Upload failed for {resume_file.name}: {upload_response.text}")
                    
            except Exception as e:
                print(f"❌ Error processing {resume_file.name}: {e}")
        
        # Get final summary
        print(f"\n📊 Summary:")
        
        # List jobs
        jobs_response = requests.get(f"{base_url}/job-descriptions")
        if jobs_response.status_code == 200:
            jobs_data = jobs_response.json()
            print(f"✅ Jobs created: {len(jobs_data.get('jobs', []))}")
        
        # List resumes
        resumes_response = requests.get(f"{base_url}/resumes")
        if resumes_response.status_code == 200:
            resumes_data = resumes_response.json()
            analyzed_resumes = [r for r in resumes_data.get('resumes', []) if r.get('relevance_score')]
            print(f"✅ Resumes processed: {len(analyzed_resumes)}")
            
            # Show sample results
            if analyzed_resumes:
                print(f"\n🎯 Sample Analysis Results:")
                for resume in analyzed_resumes[:3]:  # Show first 3
                    print(f"  - {resume['filename']}: {resume['relevance_score']}% ({resume['verdict']})")
        
        print(f"\n🎉 Sample data populated successfully!")
        print(f"🌐 Frontend should now show real jobs and you can test resume upload!")
        
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to Flask backend. Make sure it's running on port 5000")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    populate_sample_data()
