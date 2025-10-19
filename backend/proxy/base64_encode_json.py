import json
import base64
import sys

if len(sys.argv) < 2:
    print("Usage: python base64_encode_json.py <filename>")
    sys.exit(1)

path = sys.argv[1]

with open(path, "r", encoding="utf-8") as f:
    data = json.load(f)

json_str = json.dumps(data, ensure_ascii=False)
encoded = base64.b64encode(json_str.encode("utf-8")).decode("utf-8")

print(encoded)
