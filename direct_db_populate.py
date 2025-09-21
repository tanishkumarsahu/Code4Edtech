"""
Direct SQLite database population - bypass Flask API
"""

import sqlite3
import json
import os

def populate_jobs_directly():
    """Populate jobs directly in SQLite database"""
    
    # Sample job descriptions
    jobs = [
        {
            "title": "Senior Software Engineer",
            "company": "TechCorp Solutions",
            "description": "We are seeking a Senior Software Engineer to join our dynamic development team. You will be responsible for designing, developing, and maintaining scalable web applications using modern technologies.",
            "must_have_skills": ["JavaScript", "React", "Node.js", "SQL", "Git"],
            "good_to_have_skills": ["TypeScript", "AWS", "Docker", "MongoDB"],
            "experience_required": "3+ years in software development",
            "education_required": ["Bachelor's in Computer Science", "Bachelor's in Engineering"]
        },
        {
            "title": "Frontend Developer", 
            "company": "Digital Innovations Ltd",
            "description": "Join our creative team as a Frontend Developer. You will work on building responsive, user-friendly web interfaces and collaborate closely with our design and backend teams.",
            "must_have_skills": ["HTML", "CSS", "JavaScript", "React", "Responsive Design"],
            "good_to_have_skills": ["Vue.js", "Sass", "Webpack", "Figma", "TypeScript"],
            "experience_required": "2+ years in frontend development",
            "education_required": ["Bachelor's degree", "Relevant certification"]
        },
        {
            "title": "Data Scientist",
            "company": "AI Analytics Inc", 
            "description": "We are looking for a Data Scientist to join our AI research team. You will work on machine learning projects, analyze large datasets, and develop predictive models.",
            "must_have_skills": ["Python", "Machine Learning", "Statistics", "SQL", "Pandas"],
            "good_to_have_skills": ["TensorFlow", "PyTorch", "R", "Spark", "AWS"],
            "experience_required": "2+ years in data science",
            "education_required": ["Master's in Data Science", "Bachelor's in Statistics/Math"]
        }
    ]
    
    try:
        # Database path
        db_path = os.path.join("backend", "resume_analysis.db")
        
        if not os.path.exists(db_path):
            print(f"❌ Database not found at: {db_path}")
            print("Make sure Flask server has been started at least once to create the database.")
            return
        
        print(f"📁 Found database at: {db_path}")
        
        # Connect to database
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        print("🗄️ Connected to SQLite database")
        
        # Check if table exists
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='job_descriptions'")
        table_exists = cursor.fetchone()
        
        if not table_exists:
            print("❌ job_descriptions table doesn't exist.")
            print("Start Flask server first to create tables, then run this script.")
            return
        
        print("✅ job_descriptions table found")
        
        # Check existing jobs
        cursor.execute("SELECT COUNT(*) FROM job_descriptions")
        existing_count = cursor.fetchone()[0]
        print(f"📊 Existing jobs in database: {existing_count}")
        
        # Insert new jobs
        created_jobs = []
        for i, job in enumerate(jobs, 1):
            print(f"\n{i}. Creating: {job['title']} at {job['company']}")
            
            cursor.execute('''
                INSERT INTO job_descriptions 
                (title, company, description, must_have_skills, good_to_have_skills, experience_required, education_required)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (
                job['title'],
                job['company'], 
                job['description'],
                json.dumps(job['must_have_skills']),
                json.dumps(job['good_to_have_skills']),
                job['experience_required'],
                json.dumps(job['education_required'])
            ))
            
            job_id = cursor.lastrowid
            created_jobs.append(job_id)
            print(f"   ✅ Created with ID: {job_id}")
        
        # Commit changes
        conn.commit()
        print(f"\n💾 Committed {len(created_jobs)} jobs to database")
        
        # Verify insertion
        cursor.execute("SELECT id, title, company FROM job_descriptions")
        all_jobs = cursor.fetchall()
        
        print(f"\n📊 Final verification - Total jobs in database: {len(all_jobs)}")
        for job_id, title, company in all_jobs:
            print(f"   - ID {job_id}: {title} at {company}")
        
        conn.close()
        print(f"\n🎉 Job population completed successfully!")
        print(f"✅ You can now refresh your frontend to see {len(all_jobs)} jobs in the dropdown")
        
        return True
        
    except sqlite3.Error as e:
        print(f"❌ SQLite error: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Direct Database Job Population")
    print("=" * 50)
    populate_jobs_directly()
