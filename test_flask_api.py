"""
Test Flask API endpoints
"""

import requests
import json

def test_flask_endpoints():
    base_url = "http://localhost:5000/api"
    
    print("🧪 Testing Flask API Endpoints")
    print("=" * 40)
    
    # Test 1: Health Check
    print("\n1. Testing Health Endpoint...")
    try:
        response = requests.get(f"{base_url}/health", timeout=5)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            print(f"   Response: {response.json()}")
        else:
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"   ❌ Failed: {e}")
    
    # Test 2: Get Job Descriptions
    print("\n2. Testing Job Descriptions Endpoint...")
    try:
        response = requests.get(f"{base_url}/job-descriptions", timeout=5)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            jobs = data.get('jobs', [])
            print(f"   Found {len(jobs)} jobs:")
            for job in jobs:
                print(f"     - {job['title']} at {job['company']}")
        else:
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"   ❌ Failed: {e}")
    
    # Test 3: CORS Headers
    print("\n3. Testing CORS Headers...")
    try:
        response = requests.options(f"{base_url}/job-descriptions", 
                                  headers={'Origin': 'http://localhost:3000'})
        print(f"   Status: {response.status_code}")
        print(f"   CORS Headers: {dict(response.headers)}")
    except Exception as e:
        print(f"   ❌ Failed: {e}")

if __name__ == "__main__":
    test_flask_endpoints()
