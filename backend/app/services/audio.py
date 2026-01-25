import edge_tts
from io import BytesIO

async def text_to_speech(text: str, voice: str = "en-US-AriaNeural") -> BytesIO:
    """
    Generates high-quality audio using MS Edge TTS (Free).
    Returns a BytesIO object containing the MP3 audio.
    """
    # Safety: Default text if empty
    if not text or text.strip() == "":
        text = "I could not generate a description."

    # Create the communication object with the specific voice
    communicate = edge_tts.Communicate(text, voice)
    
    # Create a memory buffer to hold the audio
    audio_buffer = BytesIO()

    # Stream the audio chunks into the buffer
    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            audio_buffer.write(chunk["data"])

    # REWIND the buffer so it can be read from the beginning
    audio_buffer.seek(0)
    
    return audio_buffer