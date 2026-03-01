import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "lawbot.db")

def migrate():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        # Add transcript column
        cursor.execute("ALTER TABLE documents ADD COLUMN transcript TEXT")
        print("Added transcript column successfully.")
    except sqlite3.OperationalError as e:
        print(f"Transcript column might already exist: {e}")
        
    try:
        # Add summary column
        cursor.execute("ALTER TABLE documents ADD COLUMN summary TEXT")
        print("Added summary column successfully.")
    except sqlite3.OperationalError as e:
        print(f"Summary column might already exist: {e}")

    conn.commit()
    conn.close()

if __name__ == "__main__":
    migrate()
