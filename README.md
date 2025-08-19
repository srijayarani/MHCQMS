# 🏥 Healthcare Queue Management System (MHCQMS)

A comprehensive, enterprise-grade healthcare queue management system built with FastAPI, PostgreSQL, React, MUI, and TailwindCSS. The system provides automated patient registration, intelligent test assignment, real-time queue monitoring, and comprehensive reporting capabilities.

## ✨ Features

### 🎯 Core Functionality
- **Patient Registration** with automatic risk assessment and test assignment
- **Real-time Queue Management** with status tracking and room assignment
- **Comprehensive Reporting** with analytics dashboard and export functionality
- **Department Management** (Radiology & Cardiology)
- **Performance Monitoring** with efficiency metrics and insights
- **Patient Appointment Portal** for self-service access

### 🔧 Technical Features
- **41 API Endpoints** covering all system functionality
- **JWT Authentication** with secure token management
- **Real-time Updates** with auto-refresh capabilities
- **Responsive Design** optimized for all devices
- **Export Functionality** (PDF, CSV, Excel)
- **Database Migrations** with Alembic

### 🏥 Healthcare Features
- **Automatic Test Assignment** based on risk factors, age, and gender
- **Risk Assessment Engine** with scoring algorithm
- **Room Management** with availability tracking
- **Wait Time Estimation** and performance metrics
- **Department Efficiency** comparison and analysis

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- PostgreSQL database
- Git

### Backend Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd MHCQMS
```

2. **Install Python dependencies**
```bash
cd backend
pip install -r requirements.txt
```

3. **Configure environment**
```bash
# Copy and edit the config file
cp config.env.example config.env
# Update DATABASE_URL and JWT_SECRET
```

4. **Initialize database**
```bash
python init_db.py
```

5. **Start the backend server**
```bash
python main.py
# Server will start at http://localhost:8000
```

### Frontend Setup

1. **Install Node.js dependencies**
```bash
cd frontend
npm install
```

2. **Start the development server**
```bash
npm start
# App will open at http://localhost:3000
```

## 🗄️ Database Schema

### Core Tables
- **patients** - Patient information and risk factors
- **departments** - Healthcare departments (Radiology, Cardiology)
- **tests** - Available medical tests
- **rooms** - Testing rooms with availability status
- **patient_tests** - Assigned tests with status tracking
- **appointments** - Patient appointments and scheduling
- **users** - System users and authentication
- **queue_metrics** - Performance and efficiency data

### Test Assignment Rules
- **Radiology Tests**: Mammogram, USG Abdomen, X-ray Chest
- **Cardiology Tests**: ECG, TMT, 2D Echo, PFT
- **Risk Factors**: Smoking, Diabetes, Hypertension, Obesity, Family History
- **Age-based Rules**: 40+ and 60+ thresholds with gender considerations

## 🔐 Authentication

### Default Credentials
- **Username**: admin
- **Password**: admin123

### JWT Configuration
- Access Token Expiry: 30 minutes
- Refresh Token Expiry: 7 days
- Algorithm: HS256

## 📱 User Interface

### Professional Pages
1. **Dashboard** - System overview with KPIs and quick actions
2. **Patient Registration** - Comprehensive patient intake with risk assessment
3. **Queue Management** - Real-time queue monitoring and status updates
4. **Reports** - Analytics, performance metrics, and export functionality
5. **Appointment Portal** - Patient self-service access
6. **Login** - Secure authentication interface

### Design Features
- **Material-UI Components** with professional healthcare styling
- **TailwindCSS** for responsive design and custom styling
- **Real-time Updates** with 30-second auto-refresh
- **Mobile-First** responsive design
- **Accessibility** compliant with WCAG guidelines

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User authentication
- `GET /api/auth/me` - Current user info

### Patients
- `POST /api/patients/register` - Patient registration
- `GET /api/patients/` - List all patients
- `GET /api/patients/{id}` - Get patient details
- `PUT /api/patients/{id}` - Update patient
- `DELETE /api/patients/{id}` - Delete patient

### Queue Management
- `GET /api/queue/status` - Get queue status
- `PUT /api/queue/update-status` - Update test status
- `GET /api/queue/metrics` - Queue performance metrics
- `POST /api/queue/assign-room` - Assign room to test

### Reports
- `GET /api/reports/patient-completion` - Patient completion report
- `GET /api/reports/department-efficiency` - Department efficiency
- `GET /api/reports/daily-summary` - Daily summary
- `POST /api/reports/export` - Export reports (PDF/CSV/Excel)

### Appointments
- `POST /api/appointments/access-portal` - Patient portal access
- `POST /api/appointments/create` - Create appointment
- `GET /api/appointments/` - List appointments
- `PUT /api/appointments/{id}` - Update appointment

## 📊 Performance Metrics

### System KPIs
- **Patient Registration Rate** - New patients per day
- **Test Completion Rate** - Percentage of completed tests
- **Average Wait Time** - Time from assignment to start
- **Test Duration** - Average time per test
- **Department Efficiency** - Performance comparison

### Real-time Monitoring
- **Queue Status** - Live patient count and status
- **Room Availability** - Available testing rooms
- **Department Load** - Current workload distribution
- **Performance Trends** - Historical data analysis

## 🛠️ Development

### Project Structure
```
MHCQMS/
├── backend/                 # FastAPI backend
│   ├── main.py            # Application entry point
│   ├── models.py          # Database models
│   ├── schemas.py         # Pydantic schemas
│   ├── services/          # Business logic services
│   ├── routers/           # API route handlers
│   └── database.py        # Database configuration
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Application pages
│   │   ├── store/         # Redux store and slices
│   │   └── App.js         # Main application
│   ├── package.json       # Node.js dependencies
│   └── tailwind.config.js # TailwindCSS configuration
├── requirements.txt        # Python dependencies
└── README.md              # This file
```

### Technology Stack
- **Backend**: FastAPI, SQLAlchemy, PostgreSQL, JWT
- **Frontend**: React, Redux Toolkit, Material-UI, TailwindCSS
- **Database**: PostgreSQL with Alembic migrations
- **Authentication**: JWT with secure token management
- **Export**: PDF (ReportLab), CSV (Pandas), Excel (OpenPyXL)

## 🚀 Deployment

### Production Setup
1. **Environment Variables**
   - Set production database URL
   - Configure JWT secrets
   - Set CORS origins

2. **Database Migration**
   - Run Alembic migrations
   - Seed initial data

3. **Backend Deployment**
   - Use production WSGI server (Gunicorn)
   - Configure reverse proxy (Nginx)
   - Set up SSL certificates

4. **Frontend Build**
   - Create production build: `npm run build`
   - Serve static files
   - Configure routing

### Docker Support
```bash
# Build and run with Docker Compose
docker-compose up --build
```

## 📈 Monitoring & Maintenance

### Health Checks
- **API Health**: `GET /health`
- **Database Connectivity**: Connection pool monitoring
- **Performance Metrics**: Response time tracking

### Logging
- **Application Logs**: FastAPI logging configuration
- **Database Logs**: PostgreSQL query performance
- **Error Tracking**: Exception handling and reporting

### Backup & Recovery
- **Database Backups**: Automated PostgreSQL backups
- **Configuration Backup**: Environment and config files
- **Disaster Recovery**: Backup restoration procedures

## 🤝 Contributing

### Development Guidelines
1. **Code Style**: Follow PEP 8 (Python) and ESLint (JavaScript)
2. **Testing**: Write unit tests for new features
3. **Documentation**: Update README and API docs
4. **Security**: Follow security best practices

### Pull Request Process
1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Submit pull request
5. Code review and approval

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

### Documentation
- **API Documentation**: Available at `/docs` when backend is running
- **User Guide**: Comprehensive system documentation
- **Developer Guide**: Technical implementation details

### Contact
- **Technical Issues**: Create GitHub issue
- **Feature Requests**: Submit enhancement proposal
- **General Questions**: Contact development team

## 🎯 Roadmap

### Future Enhancements
- **Mobile App**: Native iOS/Android applications
- **AI Integration**: Machine learning for test optimization
- **Telemedicine**: Video consultation integration
- **Analytics Dashboard**: Advanced business intelligence
- **Multi-language Support**: Internationalization
- **Cloud Deployment**: AWS/Azure cloud hosting

---

**Built with ❤️ for the healthcare community**

*Streamlining healthcare operations through intelligent technology*
