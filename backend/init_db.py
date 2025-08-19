from database import engine, SessionLocal
from models import Base, Department, Test, Room, User
from services.auth_service import get_password_hash
from datetime import datetime

def init_database():
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # Check if departments already exist
        if db.query(Department).count() == 0:
            # Create departments
            radiology = Department(
                name="Radiology",
                type="radiology",
                description="Medical imaging and diagnostic services"
            )
            
            cardiology = Department(
                name="Cardiology",
                type="cardiology",
                description="Heart and cardiovascular services"
            )
            
            db.add(radiology)
            db.add(cardiology)
            db.commit()
            db.refresh(radiology)
            db.refresh(cardiology)
            
            # Create tests for Radiology
            radiology_tests = [
                Test(name="Mammogram", department_id=radiology.id, description="Breast cancer screening", estimated_duration=30),
                Test(name="USG Abdomen", department_id=radiology.id, description="Ultrasound of abdomen", estimated_duration=45),
                Test(name="X-ray Chest", department_id=radiology.id, description="Chest X-ray examination", estimated_duration=15)
            ]
            
            # Create tests for Cardiology
            cardiology_tests = [
                Test(name="ECG", department_id=cardiology.id, description="Electrocardiogram", estimated_duration=20),
                Test(name="TMT", department_id=cardiology.id, description="Treadmill test", estimated_duration=60),
                Test(name="2D Echo", department_id=cardiology.id, description="2D Echocardiogram", estimated_duration=45),
                Test(name="PFT", department_id=cardiology.id, description="Pulmonary function test", estimated_duration=30)
            ]
            
            for test in radiology_tests + cardiology_tests:
                db.add(test)
            
            db.commit()
            
            # Create rooms
            radiology_rooms = [
                Room(room_number="R101", department_id=radiology.id),
                Room(room_number="R102", department_id=radiology.id),
                Room(room_number="R103", department_id=radiology.id)
            ]
            
            cardiology_rooms = [
                Room(room_number="C101", department_id=cardiology.id),
                Room(room_number="C102", department_id=cardiology.id),
                Room(room_number="C103", department_id=cardiology.id)
            ]
            
            for room in radiology_rooms + cardiology_rooms:
                db.add(room)
            
            db.commit()
            
            print("Database initialized with departments, tests, and rooms")
        else:
            print("Database already contains data")
        
        # Create default admin user if not exists
        if db.query(User).count() == 0:
            admin_user = User(
                username="admin",
                email="admin@mhcqms.com",
                hashed_password=get_password_hash("admin123")
            )
            db.add(admin_user)
            db.commit()
            print("Default admin user created (username: admin, password: admin123)")
        else:
            print("Admin user already exists")
            
    except Exception as e:
        print(f"Error initializing database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    init_database()
