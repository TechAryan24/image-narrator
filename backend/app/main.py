import urllib.parse
import json
import io
import zipfile
import base64

from fastapi import Response # type: ignore
from fastapi import FastAPI, UploadFile, File, Form, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware # type: ignore
from fastapi.responses import StreamingResponse # type: ignore
from fastapi.security import OAuth2PasswordRequestForm

# 2. DATABASE & AUTH IMPORTS
from sqlalchemy.orm import Session
from app.database import engine, get_db
from app import models, auth

# Import your services
from app.services.vision import detect_objects
from app.services.text import describe_image_scene
from app.services.audio import text_to_speech
from app.services.translation import translate_text # <--- IMPORT NEW SERVICE
from app.services.vision import get_annotated_image # <--- Import this
from app.services.report import create_pdf_report   # <--- Import this


app = FastAPI()

# 1. Create Tables automatically
models.Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["x-ai-description", "x-ai-detected-objects"]
)

@app.post("/analyze")
async def analyze_image(
    file: UploadFile = File(...),
    # Default to English (US) if frontend sends nothing
    lang: str = Form("en"),
    voice: str = Form("en-US-AriaNeural"),
    mode: str = Form("scene")
):
    image_bytes = await file.read()
    
    # 1. AI Tasks (Gemini Description - Always in English first)
    description_text = describe_image_scene(image_bytes, mode=mode)
    
    # 2. Object Detection
    detection_result = detect_objects(image_bytes)
    detected_objects_list = detection_result.get("objects", []) 

    # --- NEW: TRANSLATION LOGIC ---
    # Translate the description if the requested language is not English
    final_text_to_speak = translate_text(description_text, lang)

    # 3. Audio Generation (Now using the chosen Voice)
    # Note the 'await' keyword because edge-tts is async
    audio_stream = await text_to_speech(final_text_to_speak, voice)
    
    # 4. Encode Data for Headers
    # We send the TRANSLATED text back so the user can read what they hear
    safe_description = urllib.parse.quote(final_text_to_speak)
    
    objects_json = json.dumps(detected_objects_list)
    safe_objects = urllib.parse.quote(objects_json)
    
    return StreamingResponse(
        audio_stream, 
        media_type="audio/mpeg",
        headers={
            "x-ai-description": safe_description,
            "x-ai-detected-objects": safe_objects
        }
    )

@app.post("/export")
async def export_results(
    file: UploadFile = File(...),
    description: str = Form(...),
    objects: str = Form(...), # Received as JSON string
    lang: str = Form("en"),
    voice: str = Form("en-US-AriaNeural")
):
    image_bytes = await file.read()
    
    # 1. Generate Annotated Image
    annotated_img_bytes = get_annotated_image(image_bytes)
    
    # 2. Generate Audio (Re-generate for download)
    # Use your existing translation service if lang != 'en'
    final_text = translate_text(description, lang)
    audio_buffer = await text_to_speech(final_text, voice)
    
    # 3. Generate PDF
    # Parse objects string back to list
    import json
    try:
        objects_list = json.loads(objects)
    except:
        objects_list = []
        
    pdf_bytes = create_pdf_report(final_text, objects_list)

    # 4. Create ZIP in Memory
    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
        # Add files to zip
        zip_file.writestr("analyzed_image.jpg", annotated_img_bytes)
        zip_file.writestr("narration.mp3", audio_buffer.getvalue())
        zip_file.writestr("report.pdf", pdf_bytes)

    # 5. Return Zip
    zip_buffer.seek(0)
    return Response(
        content=zip_buffer.getvalue(),
        media_type="application/zip",
        headers={"Content-Disposition": "attachment; filename=visionvoice_result.zip"}
    )

# --- AUTH ROUTES ---

@app.post("/signup")
def signup(email: str = Form(...), password: str = Form(...), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == email).first()
    if user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = auth.get_password_hash(password)
    new_user = models.User(email=email, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    return {"msg": "User created successfully"}

@app.post("/token")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    access_token = auth.create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

# --- SAVE HISTORY ROUTE ---
# We will call this from Frontend after a successful analysis
@app.post("/save-history")
async def save_history(
    description: str = Form(...),
    file: UploadFile = File(...), # <--- Changed to accept the actual File
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    # 1. Read the image bytes
    image_bytes = await file.read()
    
    # 2. Convert to Base64 String so we can store it in DB
    base64_str = base64.b64encode(image_bytes).decode('utf-8')
    
    new_entry = models.History(
        user_id=current_user.id,
        description=description,
        image_name=file.filename,
        image_data=base64_str # <--- Saving the image data
    )
    db.add(new_entry)
    db.commit()
    return {"msg": "Saved to history"}

@app.get("/history")
def get_history(
    current_user: models.User = Depends(auth.get_current_user), 
    db: Session = Depends(get_db)
):
    return current_user.history