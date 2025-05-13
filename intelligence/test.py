import requests
import json
import time

# Endpoint
url = "http://127.0.0.1:8003/intelligence/inference"

# Optional token (set to None if not used)
token = "your_optional_token_here"

# Test medical queries
test_queries = [
    "What are the early symptoms of cancer?",
    "How to manage high blood pressure naturally?",
    "What does yellowing of the eyes indicate?",
    "How is asthma diagnosed in children?",
    "What causes sudden chest pain without exertion?",
    "What are symptoms of kidney failure?",
    "What is the treatment for PCOS?",
    "How can I increase good cholesterol (HDL)?",
    "Is frequent headache a sign of brain tumor?",
    "How to recover from dengue quickly?",
]

# Send each query to the API
for i, query in enumerate(test_queries, 1):
    payload = {
        "data": {
            "query": query,
            "token": token
        }
    }
    try:
        response = requests.post(url, json=payload)
        response.raise_for_status()
        result = response.json()
        print(f"\n--- Query {i}: {query} ---")
        print(json.dumps(result, indent=2))
    except Exception as e:
        print(f"\n[Error] Query {i}: {query}")
        print(str(e))

    # Optional: wait between requests
    time.sleep(1)
