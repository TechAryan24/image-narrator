import os
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

# --- MODIFIED PROMPTS FOR SIMPLICITY ---
PROMPTS = {
    # Scene: Simple, direct, and basic vocabulary.
    "scene": (
        "Describe this image in exactly one simple sentence. "
        "Use basic English words that a Person could understand. "
        "Focus only on the main action."
    ),
    
    # Detail: Detailed but using easy language (Max 5 sentences).
    "detail": (
        "Describe the image in detail, mentioning colors, lighting, and mood. "
        "Use simple, everyday English and short sentences. "
        "Do not use complex or fancy words. "
        "Keep it concise (maximum 5 sentences) and easy to understand."
    )
}

def describe_image_scene(image_bytes, mode="scene"):
    # 1. Prepare image
    image_part = types.Part.from_bytes(
        data=image_bytes,
        mime_type="image/png"  # Ensure this matches your actual image type if possible
    )

    # 2. Select the correct prompt
    selected_prompt = PROMPTS.get(mode, PROMPTS["scene"])

    # 3. Generate Content
    response = client.models.generate_content(
        model="gemini-2.5-flash", # Keeping your selected model
        contents=[selected_prompt, image_part]
    )

    return response.text