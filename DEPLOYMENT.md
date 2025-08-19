# MHCQMS Deployment Guide for Render

## Prerequisites
- Render account
- GitHub repository with your code
- PostgreSQL database (you can use Render's PostgreSQL service)

## Deployment Steps

### 1. Backend Deployment

1. **Connect Repository**: Link your GitHub repo to Render
2. **Create Web Service**: Choose "Web Service" for backend
3. **Configure Settings**:
   - **Name**: `mhcqms-backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Root Directory**: `backend`

4. **Environment Variables**:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `JWT_SECRET`: Strong secret key for JWT
   - `SECRET_KEY`: Strong secret key for encryption

### 2. Frontend Deployment

1. **Create Static Site**: Choose "Static Site" for frontend
2. **Configure Settings**:
   - **Name**: `mhcqms-frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `build`
   - **Root Directory**: `frontend`

3. **Environment Variables**:
   - `REACT_APP_API_URL`: Your backend URL (e.g., `https://mhcqms-backend.onrender.com`)

### 3. Database Setup

1. **Create PostgreSQL Service** on Render
2. **Update Backend Environment Variables** with new database URL
3. **Run Database Migrations** if needed

### 4. Custom Domain (Optional)

1. **Add Custom Domain** in Render dashboard
2. **Update DNS Records** with your domain provider
3. **Update Frontend Environment Variables** with new domain

## Important Notes

- **Free Tier Limitations**: Render free tier has limitations on build time and monthly usage
- **Environment Variables**: Never commit sensitive data to your repository
- **Database**: Ensure your database is accessible from Render's servers
- **CORS**: Backend is configured to allow all origins (`*`) - restrict in production

## Troubleshooting

- **Build Failures**: Check build logs for dependency issues
- **Runtime Errors**: Check application logs for Python/Node.js errors
- **Database Connection**: Verify DATABASE_URL and network access
- **CORS Issues**: Check frontend API calls and backend CORS configuration

## Security Considerations

- Change default JWT secrets
- Use strong passwords for database
- Consider implementing rate limiting
- Add proper authentication middleware
- Use HTTPS in production
