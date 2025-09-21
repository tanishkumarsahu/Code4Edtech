"""
Simple Flask app to test basic functionality
"""

from flask import Flask, jsonify
from flask_cors import CORS
import sqlite3
import json

app = Flask(__name__)
CORS(app)

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy", "message": "Simple Flask is running"})

@app.route('/api/job-descriptions', methods=['GET'])
def get_jobs():
    try:
        conn = sqlite3.connect('resume_analysis.db')
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM job_descriptions')
        jobs = cursor.fetchall()
        
        job_list = []
        for job in jobs:
            job_list.append({
                'id': job[0],
                'title': job[1],
                'company': job[2],
                'description': job[3],
                'must_have_skills': json.loads(job[4]),
                'good_to_have_skills': json.loads(job[5]) if job[5] else [],
                'experience_required': job[6],
                'education_required': json.loads(job[7]) if job[7] else []
            })
        
        conn.close()
        return jsonify({"success": True, "jobs": job_list})
    
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == '__main__':
    print("🚀 Starting Simple Flask Server...")
    app.run(debug=True, port=5000, host='127.0.0.1')
