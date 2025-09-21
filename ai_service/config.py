import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv
import os

load_dotenv()  # loads .env
api_key = os.getenv("GEMINI_API_KEY")

llm = ChatGoogleGenerativeAI(
    model="gemini-1.5-flash",
    google_api_key=api_key,
    temperature=0
)

load_dotenv()

CHROMA_DB_DIR = os.getenv("CHROMA_DB_DIR", "./db")