from sqlalchemy.orm import Session
from models import Patient, Test, PatientTest, Department
from datetime import datetime
import uuid

class TestAssignmentService:
    
    @staticmethod
    def calculate_risk_level(patient: Patient) -> str:
        risk_score = 0
        
        if patient.smoking:
            risk_score += 2
        if patient.diabetes:
            risk_score += 2
        if patient.hypertension:
            risk_score += 2
        if patient.obesity:
            risk_score += 1
        if patient.family_history:
            risk_score += 1
            
        age = datetime.now().year - patient.date_of_birth.year
        if age > 60:
            risk_score += 2
        elif age > 40:
            risk_score += 1
            
        if risk_score >= 5:
            return "high"
        elif risk_score >= 3:
            return "medium"
        else:
            return "low"
    
    @staticmethod
    def assign_tests(db: Session, patient: Patient) -> list[PatientTest]:
        assigned_tests = []
        
        # Get available tests by department
        radiology_tests = db.query(Test).join(Department).filter(
            Department.type == "radiology"
        ).all()
        
        cardiology_tests = db.query(Test).join(Department).filter(
            Department.type == "cardiology"
        ).all()
        
        # Assign tests based on risk level and age
        age = datetime.now().year - patient.date_of_birth.year
        risk_level = TestAssignmentService.calculate_risk_level(patient)
        
        # Radiology tests
        if patient.gender.lower() == "female" and age >= 40:
            mammogram = next((t for t in radiology_tests if "mammogram" in t.name.lower()), None)
            if mammogram:
                assigned_tests.append(PatientTest(
                    patient_id=patient.id,
                    test_id=mammogram.id
                ))
        
        if age >= 18:
            usg_abdomen = next((t for t in radiology_tests if "usg" in t.name.lower() and "abdomen" in t.name.lower()), None)
            if usg_abdomen:
                assigned_tests.append(PatientTest(
                    patient_id=patient.id,
                    test_id=usg_abdomen.id
                ))
        
        xray_chest = next((t for t in radiology_tests if "x-ray" in t.name.lower() and "chest" in t.name.lower()), None)
        if xray_chest:
            assigned_tests.append(PatientTest(
                patient_id=patient.id,
                test_id=xray_chest.id
            ))
        
        # Cardiology tests
        if risk_level in ["medium", "high"] or age >= 50:
            ecg = next((t for t in cardiology_tests if "ecg" in t.name.lower()), None)
            if ecg:
                assigned_tests.append(PatientTest(
                    patient_id=patient.id,
                    test_id=ecg.id
                ))
        
        if risk_level == "high" or age >= 60:
            tmt = next((t for t in cardiology_tests if "tmt" in t.name.lower()), None)
            if tmt:
                assigned_tests.append(PatientTest(
                    patient_id=patient.id,
                    test_id=tmt.id
                ))
        
        if risk_level == "high":
            echo_2d = next((t for t in cardiology_tests if "2d echo" in t.name.lower() or "echo" in t.name.lower()), None)
            if echo_2d:
                assigned_tests.append(PatientTest(
                    patient_id=patient.id,
                    test_id=echo_2d.id
                ))
        
        # PFT for all adults
        if age >= 18:
            pft = next((t for t in cardiology_tests if "pft" in t.name.lower()), None)
            if pft:
                assigned_tests.append(PatientTest(
                    patient_id=patient.id,
                    test_id=pft.id
                ))
        
        return assigned_tests
    
    @staticmethod
    def generate_unique_id() -> str:
        return f"P{datetime.now().strftime('%Y%m%d')}{str(uuid.uuid4())[:8].upper()}"
