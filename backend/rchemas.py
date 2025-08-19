from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from models import TestStatus, RiskLevel, DepartmentType

class PatientScheduleRequest(BaseModel):
    unique_id: str
    date_of_birth: str
    room_id: int
    appointment_date: datetime
    estimated_wait_time: int = 30
