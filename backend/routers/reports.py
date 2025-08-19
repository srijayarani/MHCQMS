from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from database import get_db
from models import PatientTest, Patient, Test, Department, Room
from schemas import ReportRequest
from services.export_service import ExportService
from typing import List, Dict, Any
from datetime import datetime, timedelta
from sqlalchemy import and_, func
import io

router = APIRouter()

@router.get("/patient-completion")
def get_patient_completion_report(
    start_date: str = None,
    end_date: str = None,
    department_id: int = None,
    db: Session = Depends(get_db)
):
    query = db.query(PatientTest).join(Patient).join(Test).join(Department)
    
    if start_date:
        start_dt = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
        query = query.filter(PatientTest.created_at >= start_dt)
    
    if end_date:
        end_dt = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
        query = query.filter(PatientTest.created_at <= end_dt)
    
    if department_id:
        query = query.filter(Department.id == department_id)
    
    patient_tests = query.all()
    
    report_data = []
    for pt in patient_tests:
        wait_time = None
        if pt.assigned_at and pt.started_at:
            wait_time = int((pt.started_at - pt.assigned_at).total_seconds() / 60)
        
        test_duration = None
        if pt.started_at and pt.completed_at:
            test_duration = int((pt.completed_at - pt.started_at).total_seconds() / 60)
        
        report_data.append({
            "Patient ID": pt.patient.unique_id,
            "Patient Name": f"{pt.patient.first_name} {pt.patient.last_name}",
            "Test": pt.test.name,
            "Department": pt.test.department.name,
            "Status": pt.status,
            "Room": pt.room.room_number if pt.room else "Not Assigned",
            "Wait Time (min)": wait_time or "N/A",
            "Test Duration (min)": test_duration or "N/A",
            "Created": pt.created_at.strftime("%Y-%m-%d %H:%M"),
            "Completed": pt.completed_at.strftime("%Y-%m-%d %H:%M") if pt.completed_at else "N/A"
        })
    
    return report_data

@router.get("/department-efficiency")
def get_department_efficiency_report(db: Session = Depends(get_db)):
    departments = db.query(Department).all()
    efficiency_data = []
    
    for dept in departments:
        total_tests = db.query(PatientTest).join(Test).filter(Test.department_id == dept.id).count()
        completed_tests = db.query(PatientTest).join(Test).filter(
            and_(Test.department_id == dept.id, PatientTest.status == "completed")
        ).count()
        
        avg_wait_time = db.query(
            func.avg(func.extract('epoch', PatientTest.started_at - PatientTest.assigned_at) / 60)
        ).join(Test).filter(
            and_(Test.department_id == dept.id, PatientTest.status == "completed")
        ).scalar() or 0
        
        avg_test_duration = db.query(
            func.avg(func.extract('epoch', PatientTest.completed_at - PatientTest.started_at) / 60)
        ).join(Test).filter(
            and_(Test.department_id == dept.id, PatientTest.status == "completed")
        ).scalar() or 0
        
        efficiency_data.append({
            "Department": dept.name,
            "Total Tests": total_tests,
            "Completed Tests": completed_tests,
            "Completion Rate": f"{(completed_tests/total_tests*100):.1f}%" if total_tests > 0 else "0%",
            "Avg Wait Time (min)": f"{avg_wait_time:.1f}",
            "Avg Test Duration (min)": f"{avg_test_duration:.1f}"
        })
    
    return efficiency_data

@router.get("/daily-summary")
def get_daily_summary_report(date: str = None, db: Session = Depends(get_db)):
    if date:
        target_date = datetime.fromisoformat(date).date()
    else:
        target_date = datetime.utcnow().date()
    
    start_of_day = datetime.combine(target_date, datetime.min.time())
    end_of_day = datetime.combine(target_date, datetime.max.time())
    
    total_registrations = db.query(Patient).filter(
        and_(Patient.created_at >= start_of_day, Patient.created_at <= end_of_day)
    ).count()
    
    total_tests = db.query(PatientTest).filter(
        and_(PatientTest.created_at >= start_of_day, PatientTest.created_at <= end_of_day)
    ).count()
    
    completed_tests = db.query(PatientTest).filter(
        and_(PatientTest.created_at >= start_of_day, PatientTest.created_at <= end_of_day, PatientTest.status == "completed")
    ).count()
    
    pending_tests = db.query(PatientTest).filter(
        and_(PatientTest.created_at >= start_of_day, PatientTest.created_at <= end_of_day, PatientTest.status == "pending")
    ).count()
    
    in_progress_tests = db.query(PatientTest).filter(
        and_(PatientTest.created_at >= start_of_day, PatientTest.created_at <= end_of_day, PatientTest.status == "in_progress")
    ).count()
    
    return {
        "date": target_date.strftime("%Y-%m-%d"),
        "total_registrations": total_registrations,
        "total_tests": total_tests,
        "completed_tests": completed_tests,
        "pending_tests": pending_tests,
        "in_progress_tests": in_progress_tests,
        "completion_rate": f"{(completed_tests/total_tests*100):.1f}%" if total_tests > 0 else "0%"
    }

@router.post("/export")
def export_report(report_request: ReportRequest, db: Session = Depends(get_db)):
    if report_request.format.lower() == "pdf":
        report_data = get_patient_completion_report(
            start_date=report_request.start_date.isoformat(),
            end_date=report_request.end_date.isoformat(),
            department_id=report_request.department_id,
            db=db
        )
        
        buffer, content_type, filename = ExportService.export_data(
            report_data, "pdf", "Patient Completion Report"
        )
        
        return StreamingResponse(
            io.BytesIO(buffer.getvalue()),
            media_type=content_type,
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    
    elif report_request.format.lower() == "csv":
        report_data = get_patient_completion_report(
            start_date=report_request.start_date.isoformat(),
            end_date=report_request.end_date.isoformat(),
            department_id=report_request.department_id,
            db=db
        )
        
        buffer, content_type, filename = ExportService.export_data(
            report_data, "csv", "Patient Completion Report"
        )
        
        return StreamingResponse(
            io.BytesIO(buffer.getvalue()),
            media_type=content_type,
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    
    elif report_request.format.lower() == "excel":
        report_data = get_patient_completion_report(
            start_date=report_request.start_date.isoformat(),
            end_date=report_request.end_date.isoformat(),
            department_id=report_request.department_id,
            db=db
        )
        
        buffer, content_type, filename = ExportService.export_data(
            report_data, "excel", "Patient Completion Report"
        )
        
        return StreamingResponse(
            io.BytesIO(buffer.getvalue()),
            media_type=content_type,
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    
    else:
        raise HTTPException(status_code=400, detail="Unsupported export format")

@router.get("/performance-metrics")
def get_performance_metrics(db: Session = Depends(get_db)):
    total_patients = db.query(Patient).count()
    total_tests = db.query(PatientTest).count()
    completed_tests = db.query(PatientTest).filter(PatientTest.status == "completed").count()
    
    avg_wait_time = db.query(
        func.avg(func.extract('epoch', PatientTest.started_at - PatientTest.assigned_at) / 60)
    ).filter(PatientTest.status == "completed").scalar() or 0
    
    avg_test_duration = db.query(
        func.avg(func.extract('epoch', PatientTest.completed_at - PatientTest.started_at) / 60)
    ).filter(PatientTest.status == "completed").scalar() or 0
    
    return {
        "total_patients": total_patients,
        "total_tests": total_tests,
        "completed_tests": completed_tests,
        "completion_rate": f"{(completed_tests/total_tests*100):.1f}%" if total_tests > 0 else "0%",
        "avg_wait_time_minutes": round(avg_wait_time, 1),
        "avg_test_duration_minutes": round(avg_test_duration, 1)
    }
