import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "lawbot.db")

def migrate():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        # Add category column
        cursor.execute("ALTER TABLE calendar_events ADD COLUMN category TEXT DEFAULT 'court'")
        print("Added category column successfully.")
    except sqlite3.OperationalError as e:
        print(f"Category column might already exist: {e}")
        
    try:
        # Add meeting_link column
        cursor.execute("ALTER TABLE calendar_events ADD COLUMN meeting_link TEXT")
        print("Added meeting_link column successfully.")
    except sqlite3.OperationalError as e:
        print(f"Meeting_link column might already exist: {e}")

    conn.commit()
    conn.close()

if __name__ == "__main__":
    migrate()
