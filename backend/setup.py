"""
Setup script for Flask backend
Installs dependencies and initializes the system
"""

import subprocess
import sys
import os

def install_requirements():
    """Install Python requirements"""
    print("Installing Python requirements...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])

def check_python_version():
    """Check Python version"""
    print("Checking Python version...")
    if sys.version_info < (3, 8):
        print("Warning: Python 3.8+ recommended")
    else:
        print(f"✅ Python {sys.version_info.major}.{sys.version_info.minor} detected")

def create_directories():
    """Create necessary directories"""
    os.makedirs("uploads", exist_ok=True)
    print("Created uploads directory")

def main():
    """Main setup function"""
    print("Setting up Flask backend for Resume Relevance Check System...")
    
    try:
        check_python_version()
        install_requirements()
        create_directories()
        
        print("\n✅ Setup completed successfully!")
        print("\nTo run the backend:")
        print("python app.py")
        
    except Exception as e:
        print(f"\n❌ Setup failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
