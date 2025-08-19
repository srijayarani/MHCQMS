from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from models import TestStatus, RiskLevel, DepartmentType

class UserBase(BaseModel):
    username: str
    email: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class DepartmentBase(BaseModel):
    name: str
    type: str
    description: Optional[str] = None

class DepartmentCreate(DepartmentBase):
    pass

class Department(DepartmentBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class RoomBase(BaseModel):
    room_number: str
    department_id: int

class RoomCreate(RoomBase):
    pass

class Room(RoomBase):
    id: int
    is_available: bool
    created_at: datetime
    department: Department
    
    class Config:
        from_attributes = True

class TestBase(BaseModel):
    name: str
    department_id: int
    description: Optional[str] = None
    estimated_duration: Optional[int] = None

class TestCreate(TestBase):
    pass

class Test(TestBase):
    id: int
    created_at: datetime
    department: Department
    
    class Config:
        from_attributes = True

class PatientBase(BaseModel):
    first_name: str
    last_name: str
    date_of_birth: datetime
    gender: str
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    smoking: bool = False
    diabetes: bool = False
    hypertension: bool = False
    obesity: bool = False
    family_history: bool = False

class PatientCreate(PatientBase):
    pass

class Patient(PatientBase):
    id: int
    unique_id: str
    risk_level: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class PatientTestBase(BaseModel):
    patient_id: int
    test_id: int
    status: str = TestStatus.PENDING
    assigned_room_id: Optional[int] = None
    notes: Optional[str] = None

class PatientTestCreate(PatientTestBase):
    pass

class PatientTest(PatientTestBase):
    id: int
    assigned_at: Optional[datetime] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    patient: Patient
    test: Test
    room: Optional[Room] = None
    
    class Config:
        from_attributes = True

class AppointmentBase(BaseModel):
    patient_id: int
    room_id: int
    appointment_date: datetime
    estimated_wait_time: Optional[int] = None

class AppointmentCreate(AppointmentBase):
    pass

class Appointment(AppointmentBase):
    id: int
    status: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    patient: Patient
    room: Room
    
    class Config:
        from_attributes = True

class QueueStatus(BaseModel):
    id: int
    patient_id: int
    unique_id: str
    patient_name: str
    test_name: str
    department: str
    status: str
    room_number: Optional[str] = None
    wait_time: Optional[int] = None
    created_at: datetime

class PatientRegistrationResponse(BaseModel):
    patient: Patient
    assigned_tests: List[PatientTest]
    risk_level: str
    message: str

class TestAssignmentRequest(BaseModel):
    patient_id: int
    test_ids: List[int]

class QueueUpdateRequest(BaseModel):
    patient_test_id: int
    status: TestStatus
    room_id: Optional[int] = None
    notes: Optional[str] = None

class ReportRequest(BaseModel):
    start_date: datetime
    end_date: datetime
    department_id: Optional[int] = None
    format: str = "json"

class AppointmentAccessRequest(BaseModel):
    unique_id: str
    date_of_birth: str

class AppointmentAccessResponse(BaseModel):
    patient_name: str
    next_appointment: Optional[Appointment] = None
    room_number: Optional[str] = None
    estimated_wait_time: Optional[int] = None
    message: str

class PatientTestHistory(BaseModel):
    id: int
    test_name: str
    department: str
    status: str
    appointment_date: Optional[datetime] = None
    room_number: Optional[str] = None
    assigned_at: Optional[datetime] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    notes: Optional[str] = None
    
    class Config:
        from_attributes = True

class PatientPortalResponse(BaseModel):
    patient_name: str
    unique_id: str
    upcoming_tests: List[PatientTestHistory]
    completed_tests: List[PatientTestHistory]
    message: str
