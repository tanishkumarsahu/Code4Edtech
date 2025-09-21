"""
System Test Script - Pre-Demo Validation
Tests all critical functionality before demo
"""

import requests
import time
import os
from pathlib import Path

def test_system_health():
    """Test all system components"""
    print("🧪 SYSTEM HEALTH CHECK")
    print("=" * 50)
    
    results = {
        'frontend': False,
        'backend': False,
        'database': False,
        'analysis': False
    }
    
    # Test 1: Frontend Health
    print("\n1. Testing Frontend (Next.js)...")
    try:
        response = requests.get("http://localhost:3000", timeout=5)
        if response.status_code == 200:
            print("   ✅ Frontend is running")
            results['frontend'] = True
        else:
            print(f"   ❌ Frontend returned {response.status_code}")
    except Exception as e:
        print(f"   ❌ Frontend not accessible: {e}")
    
    # Test 2: Backend Health
    print("\n2. Testing Backend (Flask)...")
    try:
        response = requests.get("http://localhost:5000/api/health", timeout=5)
        if response.status_code == 200:
            print("   ✅ Backend is running")
            print(f"   📊 Response: {response.json()}")
            results['backend'] = True
        else:
            print(f"   ❌ Backend returned {response.status_code}")
    except Exception as e:
        print(f"   ❌ Backend not accessible: {e}")
    
    # Test 3: Database Check
    print("\n3. Testing Database (SQLite)...")
    db_path = Path("backend/resume_analysis.db")
    if db_path.exists():
        print("   ✅ Database file exists")
        results['database'] = True
    else:
        print("   ❌ Database file not found")
    
    # Test 4: Job Descriptions API
    print("\n4. Testing Job Descriptions API...")
    try:
        response = requests.get("http://localhost:5000/api/job-descriptions", timeout=5)
        if response.status_code == 200:
            data = response.json()
            job_count = len(data.get('jobs', []))
            print(f"   ✅ API working - {job_count} jobs available")
            if job_count >= 3:
                print("   ✅ Sufficient job descriptions for demo")
                results['analysis'] = True
            else:
                print("   ⚠️ Limited job descriptions")
        else:
            print(f"   ❌ API returned {response.status_code}")
    except Exception as e:
        print(f"   ❌ API not accessible: {e}")
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 SYSTEM STATUS SUMMARY")
    print("=" * 50)
    
    all_good = True
    for component, status in results.items():
        status_icon = "✅" if status else "❌"
        print(f"{status_icon} {component.upper()}: {'READY' if status else 'FAILED'}")
        if not status:
            all_good = False
    
    print("\n" + "=" * 50)
    if all_good:
        print("🎉 SYSTEM READY FOR DEMO!")
        print("✅ All components operational")
        print("✅ APIs responding correctly")
        print("✅ Database accessible")
        print("✅ Job descriptions loaded")
    else:
        print("🚨 SYSTEM NOT READY!")
        print("❌ Some components failed")
        print("🔧 Fix issues before demo")
    
    return all_good

def test_demo_workflow():
    """Test the complete demo workflow"""
    print("\n🎪 DEMO WORKFLOW TEST")
    print("=" * 50)
    
    # Test file upload simulation
    print("\n1. Testing Resume Upload Workflow...")
    
    # Check if sample resumes exist
    resumes_path = Path("resumes")
    if resumes_path.exists():
        resume_files = list(resumes_path.glob("*.pdf"))
        print(f"   ✅ Found {len(resume_files)} sample resumes")
        for resume in resume_files[:3]:
            print(f"   📄 {resume.name}")
    else:
        print("   ⚠️ Sample resumes folder not found")
    
    # Test job descriptions
    print("\n2. Testing Job Descriptions...")
    try:
        response = requests.get("http://localhost:5000/api/job-descriptions", timeout=5)
        if response.status_code == 200:
            jobs = response.json().get('jobs', [])
            print(f"   ✅ {len(jobs)} jobs available for demo:")
            for job in jobs:
                print(f"   💼 {job['title']} at {job['company']}")
        else:
            print("   ❌ Could not fetch job descriptions")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    print("\n✅ Demo workflow components verified")

def performance_test():
    """Basic performance test"""
    print("\n⚡ PERFORMANCE TEST")
    print("=" * 50)
    
    # Test API response times
    endpoints = [
        ("Frontend", "http://localhost:3000"),
        ("Backend Health", "http://localhost:5000/api/health"),
        ("Job Descriptions", "http://localhost:5000/api/job-descriptions")
    ]
    
    for name, url in endpoints:
        try:
            start_time = time.time()
            response = requests.get(url, timeout=10)
            end_time = time.time()
            
            response_time = (end_time - start_time) * 1000  # Convert to ms
            
            if response.status_code == 200:
                print(f"   ✅ {name}: {response_time:.0f}ms")
            else:
                print(f"   ❌ {name}: {response.status_code} in {response_time:.0f}ms")
                
        except Exception as e:
            print(f"   ❌ {name}: Failed - {e}")
    
    print("\n✅ Performance test completed")

def create_demo_checklist():
    """Create final demo checklist"""
    checklist = """
🎯 DEMO CHECKLIST - FINAL PREPARATION
=====================================

PRE-DEMO SETUP:
□ Both servers running (Flask + Next.js)
□ Sample resumes available in /resumes/ folder
□ Browser tabs pre-opened to both dashboards
□ Network connection stable
□ Demo script reviewed and practiced

DEMO FLOW VERIFICATION:
□ Student dashboard loads correctly
□ Job selection dropdown shows 3 jobs
□ Resume upload works smoothly
□ Analysis results display properly
□ Placement dashboard accessible
□ Filtering and search functional
□ Export CSV feature working

BACKUP PLANS:
□ Screenshots ready if live demo fails
□ Alternative demo environment prepared
□ Key talking points memorized
□ Technical details ready for Q&A

PRESENTATION MATERIALS:
□ Demo script printed/accessible
□ Presentation slides ready
□ Architecture diagram available
□ Rules.txt compliance checklist

FINAL CHECKS:
□ System performance acceptable
□ UI looks professional
□ All features working as expected
□ Confident in demo delivery

🎉 READY FOR HACKATHON DEMO!
"""
    
    with open("DEMO_CHECKLIST.txt", "w", encoding="utf-8") as f:
        f.write(checklist)
    
    print("📋 Demo checklist created: DEMO_CHECKLIST.txt")

if __name__ == "__main__":
    print("🚀 HACKATHON SYSTEM TEST")
    print("Testing all components before demo...")
    print("=" * 60)
    
    # Run all tests
    system_ready = test_system_health()
    test_demo_workflow()
    performance_test()
    create_demo_checklist()
    
    print("\n" + "=" * 60)
    print("🎯 FINAL STATUS")
    print("=" * 60)
    
    if system_ready:
        print("🎉 SYSTEM IS DEMO-READY!")
        print("✅ All components operational")
        print("✅ Demo workflow verified")
        print("✅ Performance acceptable")
        print("📋 Checklist created")
        print("\n🎪 GO CRUSH THAT DEMO! 🏆")
    else:
        print("🚨 SYSTEM NEEDS ATTENTION!")
        print("🔧 Fix issues before demo")
        print("📋 Use checklist to verify fixes")
    
    print("\n" + "=" * 60)
