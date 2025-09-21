"""
Flask Backend for Resume Relevance Check System
Compliant with hackathon requirements
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import sqlite3
from werkzeug.utils import secure_filename
import PyPDF2
from docx import Document
from datetime import datetime
import json
from dotenv import load_dotenv
import google.generativeai as genai

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"], supports_credentials=True)

# Configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'pdf', 'docx'}
DATABASE = 'resume_analysis.db'

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Ensure upload directory exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Configure Gemini AI
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def init_database():
    """Initialize SQLite database with required schema"""
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    
    # Job Descriptions table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS job_descriptions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            company TEXT NOT NULL,
            description TEXT NOT NULL,
            must_have_skills TEXT NOT NULL,
            good_to_have_skills TEXT,
            experience_required TEXT,
            education_required TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Resumes table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS resumes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            filename TEXT NOT NULL,
            file_path TEXT NOT NULL,
            extracted_text TEXT,
            job_description_id INTEGER,
            relevance_score INTEGER,
            skills_match INTEGER DEFAULT 0,
            semantic_fit INTEGER DEFAULT 0,
            verdict TEXT,
            matched_skills TEXT,
            missing_skills TEXT,
            strengths TEXT,
            gaps TEXT,
            feedback TEXT,
            shortlisted BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (job_description_id) REFERENCES job_descriptions (id)
        )
    ''')
    
    # Add new columns to existing table if they don't exist
    try:
        cursor.execute('ALTER TABLE resumes ADD COLUMN skills_match INTEGER DEFAULT 0')
    except sqlite3.OperationalError:
        pass  # Column already exists
    
    try:
        cursor.execute('ALTER TABLE resumes ADD COLUMN semantic_fit INTEGER DEFAULT 0')
    except sqlite3.OperationalError:
        pass  # Column already exists
    
    try:
        cursor.execute('ALTER TABLE resumes ADD COLUMN shortlisted BOOLEAN DEFAULT FALSE')
    except sqlite3.OperationalError:
        pass  # Column already exists
    
    conn.commit()
    conn.close()

def extract_text_from_pdf(file_path):
    """Extract text from PDF using PyPDF2"""
    try:
        with open(file_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text()
        return text
    except Exception as e:
        print(f"Error extracting PDF text: {e}")
        return ""

def extract_text_from_docx(file_path):
    """Extract text from DOCX using python-docx"""
    try:
        doc = Document(file_path)
        text = ""
        for paragraph in doc.paragraphs:
            text += paragraph.text + "\n"
        return text
    except Exception as e:
        print(f"Error extracting DOCX text: {e}")
        return ""

def extract_text_from_file(file_path):
    """Extract text from uploaded file"""
    if file_path.lower().endswith('.pdf'):
        return extract_text_from_pdf(file_path)
    elif file_path.lower().endswith('.docx'):
        return extract_text_from_docx(file_path)
    else:
        return ""

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "message": "Flask backend is running"})

@app.route('/api/job-descriptions', methods=['POST'])
def create_job_description():
    """Create a new job description"""
    try:
        data = request.json
        
        conn = sqlite3.connect(DATABASE)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO job_descriptions 
            (title, company, description, must_have_skills, good_to_have_skills, experience_required, education_required)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            data['title'],
            data['company'],
            data['description'],
            json.dumps(data.get('must_have_skills', [])),
            json.dumps(data.get('good_to_have_skills', [])),
            data.get('experience_required', ''),
            json.dumps(data.get('education_required', []))
        ))
        
        job_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return jsonify({"success": True, "job_id": job_id})
    
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/job-descriptions', methods=['GET'])
def get_job_descriptions():
    """Get all job descriptions"""
    try:
        conn = sqlite3.connect(DATABASE)
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM job_descriptions ORDER BY created_at DESC')
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
                'education_required': json.loads(job[7]) if job[7] else [],
                'created_at': job[8]
            })
        
        conn.close()
        return jsonify({"success": True, "jobs": job_list})
    
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/upload-resume', methods=['POST'])
def upload_resume():
    """Upload and process resume"""
    try:
        if 'file' not in request.files:
            return jsonify({"success": False, "error": "No file provided"}), 400
        
        file = request.files['file']
        job_id = request.form.get('job_id')
        
        if file.filename == '':
            return jsonify({"success": False, "error": "No file selected"}), 400
        
        if not job_id:
            return jsonify({"success": False, "error": "Job ID required"}), 400
        
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_")
            filename = timestamp + filename
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(file_path)
            
            # Extract text from file
            extracted_text = extract_text_from_file(file_path)
            
            # Store in database (analysis will be done separately)
            conn = sqlite3.connect(DATABASE)
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT INTO resumes (filename, file_path, extracted_text, job_description_id)
                VALUES (?, ?, ?, ?)
            ''', (filename, file_path, extracted_text, job_id))
            
            resume_id = cursor.lastrowid
            conn.commit()
            
            # Get job description for analysis
            cursor.execute('''
                SELECT title, company, description, must_have_skills, good_to_have_skills, experience_required
                FROM job_descriptions WHERE id = ?
            ''', (job_id,))
            
            job_result = cursor.fetchone()
            conn.close()
            
            if job_result:
                # Perform Gemini analysis immediately
                job_data = {
                    'title': job_result[0],
                    'company': job_result[1],
                    'description': job_result[2],
                    'must_have_skills': json.loads(job_result[3]),
                    'good_to_have_skills': json.loads(job_result[4]) if job_result[4] else [],
                    'experience_required': job_result[5] if job_result[5] else '',
                }
                
                print(f"🤖 Starting Gemini AI analysis for resume {resume_id}...")
                analysis_result = perform_gemini_analysis(extracted_text, job_data)
                print(f"✅ Gemini analysis completed: {analysis_result['relevance_score']}% relevance")
                
                # Update resume with analysis results
                conn = sqlite3.connect(DATABASE)
                cursor = conn.cursor()
                cursor.execute('''
                    UPDATE resumes 
                    SET relevance_score = ?, skills_match = ?, semantic_fit = ?, verdict = ?, 
                        matched_skills = ?, missing_skills = ?, strengths = ?, gaps = ?, feedback = ?
                    WHERE id = ?
                ''', (
                    analysis_result['relevance_score'],
                    analysis_result.get('skills_match', 0),
                    analysis_result.get('semantic_fit', 0),
                    analysis_result['verdict'],
                    json.dumps(analysis_result['matched_skills']),
                    json.dumps(analysis_result['missing_skills']),
                    json.dumps(analysis_result['strengths']),
                    json.dumps(analysis_result['gaps']),
                    analysis_result['feedback'],
                    resume_id
                ))
                conn.commit()
                conn.close()
                
                return jsonify({
                    "success": True, 
                    "resume_id": resume_id,
                    "job_title": job_data['title'],
                    "company": job_data['company'],
                    "analysis": analysis_result,
                    "message": "Resume uploaded and analyzed with Gemini AI"
                })
            
            return jsonify({
                "success": True, 
                "resume_id": resume_id,
                "message": "Resume uploaded successfully (job not found for analysis)"
            })
        
        return jsonify({"success": False, "error": "Invalid file type"}), 400
    
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/analyze-resume/<int:resume_id>', methods=['POST'])
def analyze_resume(resume_id):
    """Analyze resume against job description"""
    try:
        # Get resume and job description from database
        conn = sqlite3.connect(DATABASE)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT r.*, j.title, j.description, j.must_have_skills, j.good_to_have_skills
            FROM resumes r
            JOIN job_descriptions j ON r.job_description_id = j.id
            WHERE r.id = ?
        ''', (resume_id,))
        
        result = cursor.fetchone()
        if not result:
            return jsonify({"success": False, "error": "Resume not found"}), 404
        
        # Extract data
        resume_text = result[3]  # extracted_text
        job_data = {
            'title': result[5],
            'company': result[6] if len(result) > 6 else '',
            'description': result[6],
            'must_have_skills': json.loads(result[7]),
            'good_to_have_skills': json.loads(result[8]) if result[8] else [],
            'experience_required': result[9] if len(result) > 9 else '',
        }
        
        # Simple analysis using Gemini API
        analysis_result = perform_gemini_analysis(resume_text, job_data)
        
        # Update resume with analysis results
        cursor.execute('''
            UPDATE resumes 
            SET relevance_score = ?, verdict = ?, matched_skills = ?, 
                missing_skills = ?, strengths = ?, gaps = ?, feedback = ?
            WHERE id = ?
        ''', (
            analysis_result['relevance_score'],
            analysis_result['verdict'],
            json.dumps(analysis_result['matched_skills']),
            json.dumps(analysis_result['missing_skills']),
            json.dumps(analysis_result['strengths']),
            json.dumps(analysis_result['gaps']),
            analysis_result['feedback'],
            resume_id
        ))
        
        conn.commit()
        conn.close()
        
        return jsonify({"success": True, "analysis": analysis_result})
    
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

def perform_gemini_analysis(resume_text, job_data):
    """Perform analysis using Gemini API"""
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        prompt = f"""
        You are an expert HR analyst. Analyze this resume against the job description and provide a detailed assessment.

        JOB DESCRIPTION:
        Title: {job_data.get('title', '')}
        Company: {job_data.get('company', '')}
        Description: {job_data.get('description', '')}
        Required Skills: {', '.join(job_data.get('must_have_skills', []))}
        Preferred Skills: {', '.join(job_data.get('good_to_have_skills', []))}

        RESUME CONTENT:
        {resume_text[:2000]}

        Please analyze and respond with a JSON object containing:
        {{
            "relevance_score": number (0-100),
            "skills_match": number (0-100, percentage of required skills found),
            "semantic_fit": number (0-100, semantic alignment with role),
            "verdict": "High" or "Medium" or "Low",
            "matched_skills": [list of matched skills],
            "missing_skills": [list of missing skills],
            "strengths": [list of 3-5 key strengths],
            "gaps": [list of 3-5 areas for improvement],
            "feedback": "2-3 sentences overall assessment"
        }}

        Focus on skill alignment, experience relevance, and provide constructive feedback.
        """
        
        response = model.generate_content(prompt)
        
        # Try to extract JSON from response
        response_text = response.text
        json_start = response_text.find('{')
        json_end = response_text.rfind('}') + 1
        
        if json_start != -1 and json_end != -1:
            json_text = response_text[json_start:json_end]
            result = json.loads(json_text)
            
            return {
                'relevance_score': min(100, max(0, result.get('relevance_score', 50))),
                'skills_match': min(100, max(0, result.get('skills_match', 50))),
                'semantic_fit': min(100, max(0, result.get('semantic_fit', 50))),
                'verdict': result.get('verdict', 'Medium'),
                'matched_skills': result.get('matched_skills', []),
                'missing_skills': result.get('missing_skills', []),
                'strengths': result.get('strengths', []),
                'gaps': result.get('gaps', []),
                'feedback': result.get('feedback', 'Analysis completed.')
            }
        
    except Exception as e:
        print(f"Gemini analysis error: {e}")
    
    # Fallback to simple analysis
    return perform_simple_analysis(resume_text, job_data.get('must_have_skills', []), job_data.get('good_to_have_skills', []))

def perform_simple_analysis(resume_text, must_have_skills, good_to_have_skills):
    """Perform basic resume analysis (to be enhanced with LangChain)"""
    resume_lower = resume_text.lower()
    all_skills = must_have_skills + good_to_have_skills
    
    matched_skills = []
    missing_skills = []
    
    for skill in all_skills:
        if skill.lower() in resume_lower:
            matched_skills.append(skill)
        else:
            missing_skills.append(skill)
    
    # Calculate basic relevance score
    if len(all_skills) > 0:
        relevance_score = int((len(matched_skills) / len(all_skills)) * 100)
    else:
        relevance_score = 50
    
    # Determine verdict
    if relevance_score >= 80:
        verdict = "High"
    elif relevance_score >= 50:
        verdict = "Medium"
    else:
        verdict = "Low"
    
    # Calculate skills match percentage
    skills_match = int((len(matched_skills) / len(all_skills)) * 100) if len(all_skills) > 0 else 0
    
    # Calculate semantic fit (simplified - in real implementation would use embeddings)
    semantic_fit = min(85, relevance_score + 10)  # Simulate semantic analysis
    
    return {
        "relevance_score": relevance_score,
        "skills_match": skills_match,
        "semantic_fit": semantic_fit,
        "verdict": verdict,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "strengths": ["Experience in relevant field", "Good technical background"],
        "gaps": ["Could improve skill alignment", "Add more specific achievements"],
        "feedback": f"Resume shows {verdict.lower()} relevance to the job requirements. Focus on developing missing skills: {', '.join(missing_skills[:3])}"
    }

@app.route('/api/resumes', methods=['GET'])
def get_resumes():
    """Get all resumes with analysis results"""
    try:
        conn = sqlite3.connect(DATABASE)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT r.*, j.title as job_title, j.company
            FROM resumes r
            LEFT JOIN job_descriptions j ON r.job_description_id = j.id
            ORDER BY r.created_at DESC
        ''')
        
        resumes = cursor.fetchall()
        resume_list = []
        
        for resume in resumes:
            resume_list.append({
                'id': resume[0],
                'filename': resume[1],
                'job_title': resume[16] if resume[16] else 'Unknown',  # Updated index
                'company': resume[17] if resume[17] else 'Unknown',    # Updated index
                'relevance_score': resume[5],
                'skills_match': resume[6] if resume[6] is not None else 0,  # New field
                'semantic_fit': resume[7] if resume[7] is not None else 0,  # New field
                'verdict': resume[8],                                       # Updated index
                'matched_skills': json.loads(resume[9]) if resume[9] else [],   # Updated index
                'missing_skills': json.loads(resume[10]) if resume[10] else [], # Updated index
                'strengths': json.loads(resume[11]) if resume[11] else [],      # Updated index
                'gaps': json.loads(resume[12]) if resume[12] else [],           # Updated index
                'feedback': resume[13],                                         # Updated index
                'shortlisted': bool(resume[14]) if resume[14] is not None else False,  # New field
                'created_at': resume[15],                                       # Updated index
                'analysis_timestamp': resume[15]                            # Same as created_at for compatibility
            })
        
        conn.close()
        return jsonify({"success": True, "resumes": resume_list})
    
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/shortlist-candidate/<int:resume_id>', methods=['POST'])
def shortlist_candidate(resume_id):
    """Shortlist a candidate by resume ID"""
    try:
        conn = sqlite3.connect(DATABASE)
        cursor = conn.cursor()
        
        # Update the shortlisted status
        cursor.execute('''
            UPDATE resumes 
            SET shortlisted = TRUE 
            WHERE id = ?
        ''', (resume_id,))
        
        if cursor.rowcount == 0:
            conn.close()
            return jsonify({"success": False, "error": "Resume not found"}), 404
        
        conn.commit()
        conn.close()
        
        return jsonify({"success": True, "message": "Candidate shortlisted successfully"})
    
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/shortlisted-candidates', methods=['GET'])
def get_shortlisted_candidates():
    """Get all shortlisted candidates"""
    try:
        conn = sqlite3.connect(DATABASE)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT r.id, r.filename, r.extracted_text, r.job_description_id, r.relevance_score,
                   r.skills_match, r.semantic_fit, r.verdict, r.matched_skills, r.missing_skills,
                   r.strengths, r.gaps, r.feedback, r.shortlisted, r.created_at,
                   j.title as job_title, j.company
            FROM resumes r
            LEFT JOIN job_descriptions j ON r.job_description_id = j.id
            WHERE r.shortlisted = TRUE
            ORDER BY r.created_at DESC
        ''')
        
        resumes = cursor.fetchall()
        resume_list = []
        
        for resume in resumes:
            resume_list.append({
                'id': resume[0],
                'filename': resume[1],
                'job_title': resume[15] if resume[15] else 'Unknown',
                'company': resume[16] if resume[16] else 'Unknown',
                'relevance_score': resume[4],
                'skills_match': resume[5] if resume[5] is not None else 0,
                'semantic_fit': resume[6] if resume[6] is not None else 0,
                'verdict': resume[7],
                'matched_skills': json.loads(resume[8]) if resume[8] else [],
                'missing_skills': json.loads(resume[9]) if resume[9] else [],
                'strengths': json.loads(resume[10]) if resume[10] else [],
                'gaps': json.loads(resume[11]) if resume[11] else [],
                'feedback': resume[12],
                'shortlisted': bool(resume[13]),
                'created_at': resume[14],
                'analysis_timestamp': resume[14]
            })
        
        conn.close()
        return jsonify({"success": True, "shortlisted": resume_list})
    
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/unshortlist-candidate/<int:resume_id>', methods=['POST'])
def unshortlist_candidate(resume_id):
    """Remove candidate from shortlist"""
    try:
        conn = sqlite3.connect(DATABASE)
        cursor = conn.cursor()
        
        cursor.execute('''
            UPDATE resumes 
            SET shortlisted = FALSE 
            WHERE id = ?
        ''', (resume_id,))
        
        if cursor.rowcount == 0:
            conn.close()
            return jsonify({"success": False, "error": "Resume not found"}), 404
        
        conn.commit()
        conn.close()
        
        return jsonify({"success": True, "message": "Candidate removed from shortlist"})
    
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/shortlist-candidate/<int:resume_id>', methods=['POST'])
def shortlist_candidate(resume_id):
    """Shortlist a candidate by resume ID"""
    try:
        conn = sqlite3.connect(DATABASE)
        cursor = conn.cursor()
        
        # Update the shortlisted status
        cursor.execute('''
            UPDATE resumes 
            SET shortlisted = TRUE 
            WHERE id = ?
        ''', (resume_id,))
        
        if cursor.rowcount == 0:
            conn.close()
            return jsonify({"success": False, "error": "Resume not found"}), 404
        
        conn.commit()
        conn.close()
        
        return jsonify({"success": True, "message": "Candidate shortlisted successfully"})
    
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/shortlisted-candidates', methods=['GET'])
def get_shortlisted_candidates():
    """Get all shortlisted candidates"""
    try:
        conn = sqlite3.connect(DATABASE)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT r.id, r.filename, r.extracted_text, r.job_description_id, r.relevance_score,
                   r.skills_match, r.semantic_fit, r.verdict, r.matched_skills, r.missing_skills,
                   r.strengths, r.gaps, r.feedback, r.shortlisted, r.created_at,
                   j.title as job_title, j.company
            FROM resumes r
            LEFT JOIN job_descriptions j ON r.job_description_id = j.id
            WHERE r.shortlisted = TRUE
            ORDER BY r.created_at DESC
        ''')
        
        resumes = cursor.fetchall()
        resume_list = []
        
        for resume in resumes:
            resume_list.append({
                'id': resume[0],
                'filename': resume[1],
                'job_title': resume[15] if resume[15] else 'Unknown',
                'company': resume[16] if resume[16] else 'Unknown',
                'relevance_score': resume[4],
                'skills_match': resume[5] if resume[5] is not None else 0,
                'semantic_fit': resume[6] if resume[6] is not None else 0,
                'verdict': resume[7],
                'matched_skills': json.loads(resume[8]) if resume[8] else [],
                'missing_skills': json.loads(resume[9]) if resume[9] else [],
                'strengths': json.loads(resume[10]) if resume[10] else [],
                'gaps': json.loads(resume[11]) if resume[11] else [],
                'feedback': resume[12],
                'shortlisted': bool(resume[13]),
                'created_at': resume[14],
                'analysis_timestamp': resume[14]
            })
        
        conn.close()
        return jsonify({"success": True, "shortlisted": resume_list})
    
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/unshortlist-candidate/<int:resume_id>', methods=['POST'])
def unshortlist_candidate(resume_id):
    """Remove candidate from shortlist"""
    try:
        conn = sqlite3.connect(DATABASE)
        cursor = conn.cursor()
        
        cursor.execute('''
            UPDATE resumes 
            SET shortlisted = FALSE 
            WHERE id = ?
        ''', (resume_id,))
        
        if cursor.rowcount == 0:
            conn.close()
            return jsonify({"success": False, "error": "Resume not found"}), 404
        
        conn.commit()
        conn.close()
        
        return jsonify({"success": True, "message": "Candidate removed from shortlist"})
    
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == '__main__':
    init_database()
    app.run(debug=True, port=5000)
