from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
import routes

# Inicializar las tablas en SQLite
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Vene-English Academy Backend (James AI)")

# Configuración de CORS vital para que React se comunique sin bloqueos
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"], # Añade aquí la URL de tu frontend en producción
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Integrar las rutas que definimos en routes.py
app.include_router(routes.router)

@app.get("/")
def read_root():
    return {"status": "Online", "message": "Backend de Vene-English operando correctamente"}