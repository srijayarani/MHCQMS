from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import Patient, PatientTest, Test, Department
from schemas import PatientCreate, Patient as PatientSchema, PatientTest as PatientTestSchema, PatientRegistrationResponse
from services.test_assignment_service import TestAssignmentService
from typing import List
from datetime import datetime

router = APIRouter()

@router.post("/register", response_model=PatientRegistrationResponse)
def register_patient(patient_data: PatientCreate, db: Session = Depends(get_db)):
    unique_id = TestAssignmentService.generate_unique_id()
    
    db_patient = Patient(
        **patient_data.dict(),
        unique_id=unique_id
    )
    
    db.add(db_patient)
    db.commit()
    db.refresh(db_patient)
    
    risk_level = TestAssignmentService.calculate_risk_level(db_patient)
    db_patient.risk_level = risk_level
    
    assigned_tests = TestAssignmentService.assign_tests(db, db_patient)
    
    for test in assigned_tests:
        db.add(test)
    
    db.commit()
    
    for test in assigned_tests:
        db.refresh(test)
    
    return PatientRegistrationResponse(
        patient=db_patient,
        assigned_tests=assigned_tests,
        risk_level=risk_level,
        message=f"Patient registered successfully with {len(assigned_tests)} tests assigned"
    )

@router.get("/", response_model=List[PatientSchema])
def get_patients(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    patients = db.query(Patient).offset(skip).limit(limit).all()
    return patients

@router.get("/{patient_id}", response_model=PatientSchema)
def get_patient(patient_id: int, db: Session = Depends(get_db)):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient

@router.get("/{patient_id}/tests", response_model=List[PatientTestSchema])
def get_patient_tests(patient_id: int, db: Session = Depends(get_db)):
    patient_tests = db.query(PatientTest).filter(PatientTest.patient_id == patient_id).all()
    return patient_tests

@router.put("/{patient_id}", response_model=PatientSchema)
def update_patient(patient_id: int, patient_data: PatientCreate, db: Session = Depends(get_db)):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    for field, value in patient_data.dict().items():
        setattr(patient, field, value)
    
    patient.risk_level = TestAssignmentService.calculate_risk_level(patient)
    patient.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(patient)
    return patient

@router.delete("/{patient_id}")
def delete_patient(patient_id: int, db: Session = Depends(get_db)):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    db.delete(patient)
    db.commit()
    return {"message": "Patient deleted successfully"}

@router.get("/search/{unique_id}", response_model=PatientSchema)
def get_patient_by_unique_id(unique_id: str, db: Session = Depends(get_db)):
    patient = db.query(Patient).filter(Patient.unique_id == unique_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient
