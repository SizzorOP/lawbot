import os

replacements_made = 0
for root, dirs, files in os.walk('.'):
    if any(ignore in root for ignore in ['.git', 'node_modules', '.next', '.venv', '__pycache__']):
        continue
    for file in files:
        if file.endswith(('.md', '.py', '.ts', '.tsx', '.json', '.txt')):
            path = os.path.join(root, file)
            try:
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                if 'YuktiAI' in content or 'YuktiAI' in content:
                    content = content.replace('YuktiAI', 'YuktiAI').replace('YuktiAI', 'YuktiAI')
                    with open(path, 'w', encoding='utf-8') as f:
                        f.write(content)
                    print(f"Updated: {path}")
                    replacements_made += 1
            except Exception as e:
                print(f"Failed to read/write {path}: {e}")

print(f"Total files updated: {replacements_made}")
