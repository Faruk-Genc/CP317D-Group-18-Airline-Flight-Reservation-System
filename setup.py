import os
import platform
import subprocess
import sys
import getpass

def run(cmd, shell=True):
    print(f"> {cmd}")
    if subprocess.run(cmd, shell=shell).returncode != 0:
        sys.exit(1)

def ensure_env():
    if os.path.exists(".env"):
        return

    DB_NAME = "neondb"
    DB_USER = "neondb_owner"
    DB_HOST = "ep-shiny-sunset-ai6jfts2-pooler.c-4.us-east-1.aws.neon.tech"
    DB_PORT = "5432"

    db_password = getpass.getpass("Enter DB password: ")

    with open(".env", "w") as f:
        f.write(f"DB_NAME={DB_NAME}\n")
        f.write(f"DB_USER={DB_USER}\n")
        f.write(f"DB_PASSWORD={db_password}\n")
        f.write(f"DB_HOST={DB_HOST}\n")
        f.write(f"DB_PORT={DB_PORT}\n")

system = platform.system()

os.chdir("backend")

ensure_env()

if not os.path.exists("venv"):
    if system == "Windows":
        run("python -m venv venv")
    else:
        run("python3 -m venv venv")

if system == "Windows":
    venv_python = ".\\venv\\Scripts\\python"
else:
    venv_python = "venv/bin/python"

run(f"{venv_python} -m pip install --upgrade pip")
run(f"{venv_python} -m pip install -r requirements.txt")

backend_process = subprocess.Popen(
    f"{venv_python} -m flask --app app.main:create_app run",
    shell=True
)
os.chdir("../frontend")

run("npm install")
run("npm run dev")