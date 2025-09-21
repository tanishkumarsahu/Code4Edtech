"""
Simple job creation without health check
"""

import requests
import json

# Simple job data
job_data = {
    "title": "Software Engineer",
    "company": "Tech Corp",
    "description": "Looking for a software engineer with experience in web development",
    "must_have_skills": ["JavaScript", "React", "Node.js"],
    "good_to_have_skills": ["TypeScript", "AWS"],
    "experience_required": "2+ years",
    "education_required": ["Bachelor's degree"]
}

print("Creating job directly...")

try:
    response = requests.post(
        "http://localhost:5000/api/job-descriptions",
        json=job_data,
        timeout=10
    )
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
    
    if response.status_code == 200:
        result = response.json()
        print(f"✅ Job created with ID: {result.get('job_id')}")
    else:
        print("❌ Job creation failed")
        
except Exception as e:
    print(f"❌ Error: {e}")
