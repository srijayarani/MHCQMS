from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import PatientTest, Patient, Test, Department, Room
from schemas import QueueStatus, QueueUpdateRequest, PatientTest as PatientTestSchema
from typing import List
from datetime import datetime
from sqlalchemy import and_

router = APIRouter()

@router.get("/status", response_model=List[QueueStatus])
def get_queue_status(department_id: int = None, db: Session = Depends(get_db)):
    query = db.query(PatientTest).join(Patient).join(Test).join(Department)
    
    if department_id:
        query = query.filter(Department.id == department_id)
    
    patient_tests = query.filter(PatientTest.status != "completed").all()
    
    queue_status = []
    for pt in patient_tests:
        wait_time = None
        if pt.assigned_at:
            wait_time = int((datetime.utcnow() - pt.assigned_at).total_seconds() / 60)
        
        queue_status.append(QueueStatus(
            id=pt.id,
            patient_id=pt.patient.id,
            unique_id=pt.patient.unique_id,
            patient_name=f"{pt.patient.first_name} {pt.patient.last_name}",
            test_name=pt.test.name,
            department=pt.test.department.name,
            status=pt.status,
            room_number=pt.room.room_number if pt.room else None,
            wait_time=wait_time,
            created_at=pt.created_at
        ))
    
    return queue_status

@router.get("/departments")
def get_departments(db: Session = Depends(get_db)):
    departments = db.query(Department).all()
    return departments

@router.get("/rooms")
def get_rooms(department_id: int = None, db: Session = Depends(get_db)):
    query = db.query(Room)
    if department_id:
        query = query.filter(Room.department_id == department_id)
    
    rooms = query.all()
    return rooms

@router.put("/update-status")
def update_test_status(update_data: QueueUpdateRequest, db: Session = Depends(get_db)):
    patient_test = db.query(PatientTest).filter(PatientTest.id == update_data.patient_test_id).first()
    if not patient_test:
        raise HTTPException(status_code=404, detail="Patient test not found")
    
    patient_test.status = update_data.status
    patient_test.updated_at = datetime.utcnow()
    
    if update_data.status == "in_progress":
        patient_test.started_at = datetime.utcnow()
        if update_data.room_id:
            patient_test.assigned_room_id = update_data.room_id
            room = db.query(Room).filter(Room.id == update_data.room_id).first()
            if room:
                room.is_available = False
    elif update_data.status == "completed":
        patient_test.completed_at = datetime.utcnow()
        if patient_test.assigned_room_id:
            room = db.query(Room).filter(Room.id == patient_test.assigned_room_id).first()
            if room:
                room.is_available = True
    
    if update_data.notes:
        patient_test.notes = update_data.notes
    
    db.commit()
    db.refresh(patient_test)
    return {"message": "Status updated successfully", "patient_test": patient_test}

@router.get("/metrics")
def get_queue_metrics(db: Session = Depends(get_db)):
    total_pending = db.query(PatientTest).filter(PatientTest.status == "pending").count()
    total_in_progress = db.query(PatientTest).filter(PatientTest.status == "in_progress").count()
    total_completed = db.query(PatientTest).filter(PatientTest.status == "completed").count()
    
    departments = db.query(Department).all()
    dept_metrics = []
    
    for dept in departments:
        pending = db.query(PatientTest).join(Test).filter(
            and_(Test.department_id == dept.id, PatientTest.status == "pending")
        ).count()
        
        in_progress = db.query(PatientTest).join(Test).filter(
            and_(Test.department_id == dept.id, PatientTest.status == "in_progress")
        ).count()
        
        completed = db.query(PatientTest).join(Test).filter(
            and_(Test.department_id == dept.id, PatientTest.status == "completed")
        ).count()
        
        dept_metrics.append({
            "department": dept.name,
            "pending": pending,
            "in_progress": in_progress,
            "completed": completed
        })
    
    return {
        "total_pending": total_pending,
        "total_in_progress": total_in_progress,
        "total_completed": total_completed,
        "department_metrics": dept_metrics
    }

@router.get("/patient/{patient_id}/tests", response_model=List[PatientTestSchema])
def get_patient_queue_tests(patient_id: int, db: Session = Depends(get_db)):
    patient_tests = db.query(PatientTest).filter(PatientTest.patient_id == patient_id).all()
    return patient_tests

@router.post("/assign-room")
def assign_room_to_test(patient_test_id: int, room_id: int, db: Session = Depends(get_db)):
    patient_test = db.query(PatientTest).filter(PatientTest.id == patient_test_id).first()
    if not patient_test:
        raise HTTPException(status_code=404, detail="Patient test not found")
    
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    
    if not room.is_available:
        raise HTTPException(status_code=400, detail="Room is not available")
    
    patient_test.assigned_room_id = room_id
    patient_test.assigned_at = datetime.utcnow()
    room.is_available = False
    
    db.commit()
    db.refresh(patient_test)
    return {"message": "Room assigned successfully", "patient_test": patient_test}
