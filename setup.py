import os
import platform
import subprocess
import sys
import getpass
import time

def run(cmd, cwd=None):
    """Run a shell command and exit on failure"""
    print(f"> {cmd}")
    if subprocess.run(cmd, shell=True, check=False, cwd=cwd).returncode != 0:
        sys.exit(1)

def ensure_env():
    """Create .env if it doesn't exist"""
    if os.path.exists(".env"):
        return

    DB_NAME = "neondb"
    DB_USER = "neondb_owner"
    DB_HOST = "ep-shiny-sunset-ai6jfts2-pooler.c-4.us-east-1.aws.neon.tech"
    DB_PORT = "5432"

    db_password = getpass.getpass("Enter DB password: ")

    DATABASE_URL = f"postgresql://{DB_USER}:{db_password}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

    with open(".env", "w") as f:
        f.write(f"DB_NAME={DB_NAME}\n")
        f.write(f"DB_USER={DB_USER}\n")
        f.write(f"DB_PASSWORD={db_password}\n")
        f.write(f"DB_HOST={DB_HOST}\n")
        f.write(f"DB_PORT={DB_PORT}\n")
        f.write(f"DATABASE_URL={DATABASE_URL}\n")

def setup_backend():
    system = platform.system()
    os.chdir("backend")

    ensure_env()

    if not os.path.exists("venv"):
        if system == "Windows":
            run("python -m venv venv")
        else:
            run("python3 -m venv venv")

    venv_python = ".\\venv\\Scripts\\python" if system == "Windows" else "venv/bin/python"

    run(f"{venv_python} -m pip install --upgrade pip")

    run(f"{venv_python} -m pip install -r requirements.txt")

    backend_process = subprocess.Popen(
        f"{venv_python} -m flask --app app.main:create_app run",
        shell=True
    )

    os.chdir("../frontend")
    return backend_process

def setup_frontend():
    frontend_dir = os.getcwd()

    missing_deps = ["lottie-web"]
    for dep in missing_deps:
        run(f"npm install {dep}", cwd=frontend_dir)

    run("npm install", cwd=frontend_dir)

    frontend_process = subprocess.Popen(
        "npm run dev",
        shell=True,
        cwd=frontend_dir
    )

    return frontend_process

if __name__ == "__main__":
    backend_proc = setup_backend()
    time.sleep(3)  
    frontend_proc = setup_frontend()
    try:
        backend_proc.wait()
        frontend_proc.wait()
    except KeyboardInterrupt:
        print("\nShutting down...")
        backend_proc.terminate()
        frontend_proc.terminate()