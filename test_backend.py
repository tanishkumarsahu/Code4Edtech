"""
Quick test script for Flask backend
"""

import requests
import json

def test_backend():
    base_url = "http://localhost:5000"
    
    try:
        # Test health endpoint
        print("Testing health endpoint...")
        response = requests.get(f"{base_url}/api/health")
        print(f"Health check: {response.status_code} - {response.json()}")
        
        # Test job creation
        print("\nTesting job creation...")
        job_data = {
            "title": "Software Engineer",
            "company": "Tech Corp",
            "description": "We need a skilled developer with experience in web technologies",
            "must_have_skills": ["JavaScript", "React", "Node.js"],
            "good_to_have_skills": ["TypeScript", "AWS", "Docker"],
            "experience_required": "2+ years",
            "education_required": ["Bachelor's in Computer Science"]
        }
        
        response = requests.post(f"{base_url}/api/job-descriptions", json=job_data)
        print(f"Job creation: {response.status_code} - {response.json()}")
        
        # Test job listing
        print("\nTesting job listing...")
        response = requests.get(f"{base_url}/api/job-descriptions")
        print(f"Job listing: {response.status_code} - {len(response.json().get('jobs', []))} jobs found")
        
        print("\n✅ Backend is working correctly!")
        
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to backend. Make sure Flask server is running on port 5000")
    except Exception as e:
        print(f"❌ Test failed: {e}")

if __name__ == "__main__":
    test_backend()
