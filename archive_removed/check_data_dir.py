import os
import json

backend_path = r"c:\Users\HP\Desktop\Local Disk\D Drive\Downloads\Project Based Learning\green-campus-dashboard\green-campus-backend"
data_path = os.path.join(backend_path, 'data')

if os.path.exists(data_path):
    print(f"✓ Data directory exists: {data_path}")
    files = os.listdir(data_path)
    print(f"Files: {files}")
    
    for file in files:
        filepath = os.path.join(data_path, file)
        with open(filepath, 'r') as f:
            content = json.load(f)
            print(f"\n{file}: {len(content)} records")
else:
    print(f"✗ Data directory NOT found: {data_path}")
