from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Text, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import enum

class DepartmentType(str, enum.Enum):
    RADIOLOGY = "radiology"
    CARDIOLOGY = "cardiology"

class TestStatus(str, enum.Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class RiskLevel(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

class Department(Base):
    __tablename__ = "departments"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    type = Column(String, nullable=False)
    description = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    tests = relationship("Test", back_populates="department")
    rooms = relationship("Room", back_populates="department")

class Room(Base):
    __tablename__ = "rooms"
    
    id = Column(Integer, primary_key=True, index=True)
    room_number = Column(String, unique=True, index=True)
    department_id = Column(Integer, ForeignKey("departments.id"))
    is_available = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    department = relationship("Department", back_populates="rooms")
    appointments = relationship("Appointment", back_populates="room")

class Test(Base):
    __tablename__ = "tests"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id"))
    description = Column(Text)
    estimated_duration = Column(Integer)  # in minutes
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    department = relationship("Department", back_populates="tests")
    patient_tests = relationship("PatientTest", back_populates="test")

class Patient(Base):
    __tablename__ = "patients"
    
    id = Column(Integer, primary_key=True, index=True)
    unique_id = Column(String, unique=True, index=True)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    date_of_birth = Column(DateTime, nullable=False)
    gender = Column(String, nullable=False)
    phone = Column(String)
    email = Column(String)
    address = Column(Text)
    
    # Risk factors
    smoking = Column(Boolean, default=False)
    diabetes = Column(Boolean, default=False)
    hypertension = Column(Boolean, default=False)
    obesity = Column(Boolean, default=False)
    family_history = Column(Boolean, default=False)
    
    risk_level = Column(String, default=RiskLevel.LOW)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    patient_tests = relationship("PatientTest", back_populates="patient")
    appointments = relationship("Appointment", back_populates="patient")

class PatientTest(Base):
    __tablename__ = "patient_tests"
    
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    test_id = Column(Integer, ForeignKey("tests.id"))
    status = Column(String, default=TestStatus.PENDING)
    assigned_room_id = Column(Integer, ForeignKey("rooms.id"), nullable=True)
    assigned_at = Column(DateTime(timezone=True))
    started_at = Column(DateTime(timezone=True))
    completed_at = Column(DateTime(timezone=True))
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    patient = relationship("Patient", back_populates="patient_tests")
    test = relationship("Test", back_populates="patient_tests")
    room = relationship("Room")

class Appointment(Base):
    __tablename__ = "appointments"
    
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    room_id = Column(Integer, ForeignKey("rooms.id"))
    appointment_date = Column(DateTime, nullable=False)
    estimated_wait_time = Column(Integer)  # in minutes
    status = Column(String, default="scheduled")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    patient = relationship("Patient", back_populates="appointments")
    room = relationship("Room", back_populates="appointments")

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
class QueueMetrics(Base):
    __tablename__ = "queue_metrics"
    
    id = Column(Integer, primary_key=True, index=True)
    department_id = Column(Integer, ForeignKey("departments.id"))
    total_patients = Column(Integer, default=0)
    pending_tests = Column(Integer, default=0)
    completed_tests = Column(Integer, default=0)
    average_wait_time = Column(Float, default=0.0)
    date = Column(DateTime, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
