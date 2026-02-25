from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models
from pydantic import BaseModel
import os
import json
import google.generativeai as genai

router = APIRouter()

# Configuración Segura de Gemini AI en el Backend
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if GOOGLE_API_KEY:
    genai.configure(api_key=GOOGLE_API_KEY)

# --- 1. GENERACIÓN DE CLASES IA ---
class AIContentRequest(BaseModel):
    level: str
    module_index: int
    module_title: str

@router.post("/api/generate-class-content")
async def generate_class_content(request: AIContentRequest):
    if not GOOGLE_API_KEY:
        raise HTTPException(status_code=500, detail="API Key de Google no configurada en el backend")
    
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        prompt = f"""Genera contenido educativo para aprender inglés. Nivel {request.level}, Módulo {request.module_index + 1}: "{request.module_title}". 
        Devuelve SOLO un objeto JSON puro con dos arreglos:
        1. "exercises" (3 items): Objetos con "type" ("multiple_choice" o "fill_in_the_blank"), "question", "options", "correctAnswer".
        2. "exam" (3 items): Objetos con "text" (pregunta), "options" (arreglo), "answer" (respuesta correcta).
        Sin bloques markdown ni etiquetas."""
        
        response = model.generate_content(prompt)
        # Limpieza robusta del JSON por si Gemini devuelve markdown
        raw_text = response.text.replace('```json', '').replace('```', '').strip()
        data = json.loads(raw_text)
        
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generando contenido IA: {str(e)}")

# --- 2. PROGRESO DEL USUARIO ---
class ProgressUpdate(BaseModel):
    current_module_index: int

@router.put("/api/users/{user_id}/progress")
def update_progress(user_id: int, progress: ProgressUpdate, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    user.current_module_index = progress.current_module_index
    db.commit()
    db.refresh(user)
    return {"message": "Progreso guardado exitosamente", "current_module_index": user.current_module_index}

# --- 3. PASARELA DE PAGOS ---
class PaymentCreate(BaseModel):
    amount: float
    method: str
    reference_code: str

@router.post("/api/users/{user_id}/pay")
def process_payment(user_id: int, payment: PaymentCreate, db: Session = Depends(get_db)):
    valid_methods = ["Pago Móvil", "Mastercard", "PayPal", "Binance"]
    if payment.method not in valid_methods:
         raise HTTPException(status_code=400, detail="Método de pago no soportado")
         
    new_payment = models.Payment(
        user_id=user_id,
        amount=payment.amount,
        method=payment.method,
        reference_code=payment.reference_code,
        status="completed" # En producción, aquí verificarías el API del banco/binance primero
    )
    db.add(new_payment)
    db.commit()
    db.refresh(new_payment)
    return {"message": "Pago registrado con éxito", "payment_id": new_payment.id}