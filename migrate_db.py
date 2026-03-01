import sqlite3
import os

DB_PATH = "./lawbot.db"

def migrate():
    if not os.path.exists(DB_PATH):
        print(f"Database not found at {DB_PATH}")
        return

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    try:
        # SQLite doesn't support ALTER COLUMN to remove NOT NULL directly.
        # We need to recreate the table.
        
        # 1. Rename existing table
        cursor.execute("ALTER TABLE documents RENAME TO documents_old")
        
        # 2. Create new table without NOT NULL on case_id
        cursor.execute("""
            CREATE TABLE documents (
                id VARCHAR NOT NULL, 
                case_id VARCHAR, 
                filename VARCHAR(255) NOT NULL, 
                original_filename VARCHAR(255) NOT NULL, 
                file_path VARCHAR(500) NOT NULL, 
                file_type VARCHAR(50), 
                file_size INTEGER, 
                uploaded_at DATETIME, 
                PRIMARY KEY (id), 
                FOREIGN KEY(case_id) REFERENCES cases (id) ON DELETE CASCADE
            )
        """)
        
        # 3. Copy data
        cursor.execute("""
            INSERT INTO documents (id, case_id, filename, original_filename, file_path, file_type, file_size, uploaded_at)
            SELECT id, case_id, filename, original_filename, file_path, file_type, file_size, uploaded_at
            FROM documents_old
        """)
        
        # 4. Drop old table
        cursor.execute("DROP TABLE documents_old")
        
        conn.commit()
        print("Migration successful: documents.case_id is now nullable.")
        
    except Exception as e:
        conn.rollback()
        print(f"Migration failed: {e}")
        # Try to rollback rename if it failed mid-way
        try:
            cursor.execute("ALTER TABLE documents_old RENAME TO documents")
            conn.commit()
            print("Rolled back table rename.")
        except:
            pass
    finally:
        conn.close()

if __name__ == "__main__":
    migrate()
