"""
Seed script to populate database with curriculum modules
Execute this file to populate the database with initial data
"""

from sqlalchemy.orm import Session
from database import SessionLocal, init_db
from models import Module, CEFRLevelEnum


def seed_curriculum():
    """Seed database with curriculum modules"""
    
    db: Session = SessionLocal()
    
    # Check if modules already exist
    existing_modules = db.query(Module).first()
    if existing_modules:
        print("✅ Database already has modules. Skipping seed.")
        return
    
    # A1 Modules
    a1_modules = [
        Module(id="1", level=CEFRLevelEnum.A1, week=1, title="Presentaciones y Saludos", description="Verbo To Be, pronombres y cortesía."),
        Module(id="2", level=CEFRLevelEnum.A1, week=2, title="Números, Tiempo y Fechas", description="Días de la semana, meses y contar."),
        Module(id="3", level=CEFRLevelEnum.A1, week=3, title="Familia y Amigos", description="Verbo To Be, pronombres y descripciones."),
        Module(id="4", level=CEFRLevelEnum.A1, week=4, title="Rutinas Diarias", description="Presente Simple."),
        Module(id="5", level=CEFRLevelEnum.A1, week=5, title="Comida y Restaurantes", description="Contables e incontables."),
        Module(id="6", level=CEFRLevelEnum.A1, week=6, title="Lugares en la Ciudad", description="Preposiciones de lugar."),
        Module(id="7", level=CEFRLevelEnum.A1, week=7, title="Compras y Precios", description="Money and shopping."),
        Module(id="8", level=CEFRLevelEnum.A1, week=8, title="Clase de Certificación", description="Final exam."),
    ]
    
    # A2 Modules
    a2_modules = [
        Module(id="9", level=CEFRLevelEnum.A2, week=1, title="Experiencias Pasadas", description="Pasado Simple: verbos regulares e irregulares."),
        Module(id="10", level=CEFRLevelEnum.A2, week=2, title="Historias de Viaje", description="Pasado Continuo y conectores temporales."),
        Module(id="11", level=CEFRLevelEnum.A2, week=3, title="Comparaciones", description="Más que, menos que y superlativos."),
        Module(id="12", level=CEFRLevelEnum.A2, week=4, title="Salud y Bienestar", description="Consejos y partes del cuerpo."),
        Module(id="13", level=CEFRLevelEnum.A2, week=5, title="El Clima y la Naturaleza", description="Vocabulario ambiental y predicciones."),
        Module(id="14", level=CEFRLevelEnum.A2, week=6, title="Planes Futuros", description="Going to vs Will."),
        Module(id="15", level=CEFRLevelEnum.A2, week=7, title="Habilidades y Logros", description="Can, Could y logros."),
        Module(id="16", level=CEFRLevelEnum.A2, week=8, title="Clase de Certificación", description="Examen final del nivel A2."),
    ]
    
    # B1 Modules (placeholder)
    b1_modules = [
        Module(id="17", level=CEFRLevelEnum.B1, week=1, title="Módulo B1-1", description="Contenido B1."),
        Module(id="18", level=CEFRLevelEnum.B1, week=2, title="Módulo B1-2", description="Contenido B1."),
    ]
    
    try:
        # Add all modules
        db.add_all(a1_modules + a2_modules + b1_modules)
        db.commit()
        
        print("✅ Curriculum seeded successfully!")
        print(f"   - A1: 8 modules")
        print(f"   - A2: 8 modules")
        print(f"   - B1: 2 modules (placeholder)")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error seeding database: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    print("🌱 Starting database seed...")
    init_db()
    print("✅ Database initialized")
    seed_curriculum()
