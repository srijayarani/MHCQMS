from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import Appointment, Patient, Room, Department, PatientTest, Test
from schemas import AppointmentCreate, Appointment as AppointmentSchema, AppointmentAccessRequest, AppointmentAccessResponse, PatientPortalResponse, PatientTestHistory
from rchemas import PatientScheduleRequest
from typing import List
from datetime import datetime, timedelta
from sqlalchemy import and_

router = APIRouter()

@router.get("/health")
def health_check():
    return {"status": "healthy", "message": "Appointments router is working"}

@router.get("/test-patient-portal")
def test_patient_portal():
    return {"message": "Patient portal test endpoint is working"}

@router.post("/access-portal", response_model=AppointmentAccessResponse)
def access_appointment_portal(access_request: AppointmentAccessRequest, db: Session = Depends(get_db)):
    patient = db.query(Patient).filter(Patient.unique_id == access_request.unique_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    # Verify date of birth
    dob_str = patient.date_of_birth.strftime("%Y-%m-%d")
    if dob_str != access_request.date_of_birth:
        raise HTTPException(status_code=401, detail="Invalid date of birth")
    
    # Get next appointment
    next_appointment = db.query(Appointment).filter(
        and_(Appointment.patient_id == patient.id, Appointment.status == "scheduled")
    ).order_by(Appointment.appointment_date).first()
    
    room_number = None
    estimated_wait_time = None
    
    if next_appointment:
        room_number = next_appointment.room.room_number
        estimated_wait_time = next_appointment.estimated_wait_time
    
    return AppointmentAccessResponse(
        patient_name=f"{patient.first_name} {patient.last_name}",
        next_appointment=next_appointment,
        room_number=room_number,
        estimated_wait_time=estimated_wait_time,
        message="Access granted successfully"
    )

@router.post("/patient-portal", response_model=PatientPortalResponse)
def access_patient_portal(access_request: AppointmentAccessRequest, db: Session = Depends(get_db)):
    try:
        print(f"Processing patient portal request for UHID: {access_request.unique_id}")
        
        # Verify patient exists
        patient = db.query(Patient).filter(Patient.unique_id == access_request.unique_id).first()
        if not patient:
            print(f"Patient not found for UHID: {access_request.unique_id}")
            raise HTTPException(status_code=404, detail="Patient not found")
        
        print(f"Patient found: {patient.first_name} {patient.last_name}")
        
        # Verify date of birth
        dob_str = patient.date_of_birth.strftime("%Y-%m-%d")
        if dob_str != access_request.date_of_birth:
            print(f"Date of birth mismatch for patient {patient.id}")
            raise HTTPException(status_code=401, detail="Invalid date of birth")
        
        print(f"Date of birth verified for patient {patient.id}")
        
        # Get all patient tests - use simpler query first
        print(f"Fetching patient tests for patient {patient.id}")
        patient_tests = db.query(PatientTest).filter(PatientTest.patient_id == patient.id).all()
        print(f"Found {len(patient_tests)} patient tests")
        
        upcoming_tests = []
        completed_tests = []
        
        for pt in patient_tests:
            try:
                # Get test and department info separately to avoid complex joins
                test = db.query(Test).filter(Test.id == pt.test_id).first()
                department = db.query(Department).filter(Department.id == test.department_id).first() if test else None
                room = db.query(Room).filter(Room.id == pt.assigned_room_id).first() if pt.assigned_room_id else None
                
                test_history = PatientTestHistory(
                    id=pt.id,
                    test_name=test.name if test else "Unknown Test",
                    department=department.name if department else "Unknown Department",
                    status=pt.status,
                    appointment_date=pt.assigned_at,
                    room_number=room.room_number if room else None,
                    assigned_at=pt.assigned_at,
                    started_at=pt.started_at,
                    completed_at=pt.completed_at,
                    notes=pt.notes
                )
                
                if pt.status in ["pending", "in_progress"]:
                    upcoming_tests.append(test_history)
                elif pt.status == "completed":
                    completed_tests.append(test_history)
                    
                print(f"Processed test {pt.id}: {test.name if test else 'Unknown'} - Status: {pt.status}")
                
            except Exception as e:
                print(f"Error processing patient test {pt.id}: {str(e)}")
                continue
        
        print(f"Successfully processed {len(upcoming_tests)} upcoming tests and {len(completed_tests)} completed tests")
        
        return PatientPortalResponse(
            patient_name=f"{patient.first_name} {patient.last_name}",
            unique_id=patient.unique_id,
            upcoming_tests=upcoming_tests,
            completed_tests=completed_tests,
            message="Access granted successfully"
        )
        
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        # Log unexpected errors and return a generic error
        print(f"Unexpected error in patient-portal endpoint: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/create", response_model=AppointmentSchema)
def create_appointment(appointment_data: AppointmentCreate, db: Session = Depends(get_db)):
    # Check if room is available
    room = db.query(Room).filter(Room.id == appointment_data.room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    
    if not room.is_available:
        raise HTTPException(status_code=400, detail="Room is not available")
    
    # Check if patient exists
    patient = db.query(Patient).filter(Patient.id == appointment_data.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    # Create appointment
    appointment = Appointment(**appointment_data.dict())
    db.add(appointment)
    db.commit()
    db.refresh(appointment)
    
    return appointment

@router.get("/", response_model=List[AppointmentSchema])
def get_appointments(
    patient_id: int = None,
    room_id: int = None,
    status: str = None,
    db: Session = Depends(get_db)
):
    query = db.query(Appointment)
    
    if patient_id:
        query = query.filter(Appointment.patient_id == patient_id)
    
    if room_id:
        query = query.filter(Appointment.room_id == room_id)
    
    if status:
        query = query.filter(Appointment.status == status)
    
    appointments = query.all()
    return appointments

@router.get("/available-rooms")
def get_available_rooms(department_id: int = None, db: Session = Depends(get_db)):
    query = db.query(Room).filter(Room.is_available == True)
    
    if department_id:
        query = query.filter(Room.department_id == department_id)
    
    rooms = query.all()
    return rooms

@router.get("/patient/available-rooms")
def get_patient_available_rooms(department_id: int = None, db: Session = Depends(get_db)):
    query = db.query(Room).filter(Room.is_available == True)
    
    if department_id:
        query = query.filter(Room.department_id == department_id)
    
    rooms = query.all()
    return rooms

@router.post("/patient/schedule", response_model=AppointmentSchema)
def patient_schedule_appointment(
    schedule_request: PatientScheduleRequest,
    db: Session = Depends(get_db)
):
    # Verify patient identity
    patient = db.query(Patient).filter(Patient.unique_id == schedule_request.unique_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    # Verify date of birth
    dob_str = patient.date_of_birth.strftime("%Y-%m-%d")
    if dob_str != schedule_request.date_of_birth:
        raise HTTPException(status_code=401, detail="Invalid date of birth")
    
    # Check if room is available
    room = db.query(Room).filter(Room.id == schedule_request.room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    
    if not room.is_available:
        raise HTTPException(status_code=400, detail="Room is not available")
    
    # Create appointment
    appointment_data = {
        "patient_id": patient.id,
        "room_id": schedule_request.room_id,
        "appointment_date": schedule_request.appointment_date,
        "estimated_wait_time": schedule_request.estimated_wait_time,
        "status": "scheduled"
    }
    
    appointment = Appointment(**appointment_data)
    db.add(appointment)
    db.commit()
    db.refresh(appointment)
    
    return appointment

@router.get("/patient/{patient_id}/schedule")
def get_patient_schedule(patient_id: int, db: Session = Depends(get_db)):
    appointments = db.query(Appointment).filter(Appointment.patient_id == patient_id).all()
    
    schedule = []
    for apt in appointments:
        schedule.append({
            "appointment_id": apt.id,
            "date": apt.appointment_date.strftime("%Y-%m-%d %H:%M"),
            "room": apt.room.room_number,
            "department": apt.room.department.name,
            "status": apt.status,
            "estimated_wait_time": apt.estimated_wait_time
        })
    
    return schedule

@router.post("/{appointment_id}/update-status")
def update_appointment_status(
    appointment_id: int,
    status: str,
    db: Session = Depends(get_db)
):
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    appointment.status = status
    appointment.updated_at = datetime.utcnow()
    
    if status == "completed":
        room = appointment.room
        room.is_available = True
    
    db.commit()
    db.refresh(appointment)
    return {"message": "Appointment status updated successfully", "appointment": appointment}

@router.post("/{appointment_id}/assign-room")
def assign_room_to_appointment(
    appointment_id: int,
    room_id: int,
    db: Session = Depends(get_db)
):
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    
    if not room.is_available:
        raise HTTPException(status_code=400, detail="Room is not available")
    
    # Free up previous room if any
    if appointment.room_id:
        old_room = db.query(Room).filter(Room.id == appointment.room_id).first()
        if old_room:
            old_room.is_available = True
    
    appointment.room_id = room_id
    room.is_available = False
    appointment.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(appointment)
    return {"message": "Room assigned successfully", "appointment": appointment}

@router.get("/{appointment_id}", response_model=AppointmentSchema)
def get_appointment(appointment_id: int, db: Session = Depends(get_db)):
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return appointment

@router.put("/{appointment_id}", response_model=AppointmentSchema)
def update_appointment(
    appointment_id: int,
    appointment_data: AppointmentCreate,
    db: Session = Depends(get_db)
):
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    for field, value in appointment_data.dict().items():
        setattr(appointment, field, value)
    
    appointment.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(appointment)
    return appointment

@router.delete("/{appointment_id}")
def delete_appointment(appointment_id: int, db: Session = Depends(get_db)):
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    db.delete(appointment)
    db.commit()
    return {"message": "Appointment deleted successfully"}
