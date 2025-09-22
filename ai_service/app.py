from flask import Flask, request, jsonify
from pydantic import BaseModel, ValidationError
from dotenv import load_dotenv
import os
from langchain_google_genai import ChatGoogleGenerativeAI
import json

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("GEMINI_API_KEY not found!")

app = Flask(__name__)
app.config["DEBUG"] = True

llm = ChatGoogleGenerativeAI(
    model="gemini-1.5-flash",
    google_api_key=api_key,
    temperature=0
)

class Report(BaseModel):
    text: str
COMMUNITIES = {
    1: "Public Works Department",
    2: "Sanitation Department",
    3: "Parks and Recreation Department",
    4: "Water and Sewer Department",
    5: "Code Enforcement / Building Department",
    6: "Forestry / Urban Forestry Division",
    7: "Electrical & Streetlight Department",
    8: "Traffic & Transport Department",
    9: "Public Health & Pest Control"
}


def get_priority(report_text):
    prompt = f"""
You are a civic issue assistant.
Your tasks:
1. Assign a PRIORITY SCORE from 1 (very low) to 10 (very high) based on urgency, impact, and keywords.

Scoring Guidelines:
- 9-10: Life-threatening emergencies
- 7-8: Major public safety issues
- 4-6: Medium-level issues
- 1-3: Low-level issues

Additional factors:
- Location impact (hospitals, schools, highways → +3; normal residential → +1)
- Public scale (large area/people affected → +3; few people → +1)
- Urgency keywords (fire, danger, collapsed, injured → +3; normal wording → +0)

2. Determine the COMMUNITY / DEPARTMENT responsible for handling this report.
Use the following mapping:

{json.dumps(COMMUNITIES, indent=2)}

Citizen Report: "{report_text}"

Return ONLY JSON like this:
{{
  "priority_score": X,
  "reasoning": "Short explanation of the score",
  "community_id": Y,
  "community_name": "Name of the community"
}}
"""
    response = llm.invoke(prompt)
    response_text = response.content

    if response_text.startswith("```"):
        response_text = "\n".join(response_text.split("\n")[1:])
        if response_text.endswith("```"):
            response_text = "\n".join(response_text.split("\n")[:-1])

    response_text = response_text.strip()

    try:
        parsed = json.loads(response_text)
    except json.JSONDecodeError:
        parsed = {
            "priority_score": None,
            "reasoning": response_text,
            "community_id": None,
            "community_name": None
        }

    print(parsed)
    return parsed


@app.route("/", methods=["GET"])
def root():
    return jsonify({"message": "Civic RAG AI Service is running."})

@app.route("/prioritize", methods=["POST"])
def prioritize():
    try:
        data = request.get_json()
        report = Report(**data)  
        result = get_priority(report.text)
        return jsonify({"result": result})
    except ValidationError as ve:
        return jsonify({"error": ve.errors()}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
