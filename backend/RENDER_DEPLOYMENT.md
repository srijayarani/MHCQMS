# Render Deployment Guide for MHCQMS Backend

## Environment Variables Required

When deploying to Render, you need to set the following environment variables in your Render service settings:

### Required Environment Variables:
- `DATABASE_URL`: Your PostgreSQL connection string
- `SECRET_KEY`: A secure secret key for JWT tokens
- `JWT_SECRET`: JWT secret key (should be different from SECRET_KEY)
- `JWT_ALGORITHM`: JWT algorithm (default: HS256)
- `ACCESS_TOKEN_EXPIRE_MINUTES`: Token expiration time in minutes (default: 30)

### Optional Environment Variables:
- `ALGORITHM`: Algorithm for password hashing (default: HS256)
- `REFRESH_TOKEN_EXPIRE_DAYS`: Refresh token expiration in days (default: 7)

## Deployment Steps

1. **Connect your GitHub repository** to Render
2. **Create a new Web Service** on Render
3. **Configure the service:**
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Environment**: `Python 3`
   - **Region**: Choose your preferred region

4. **Set Environment Variables** in Render dashboard:
   ```
   DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require
   SECRET_KEY=your-super-secret-key-here
   JWT_SECRET=your-jwt-secret-key-here
   JWT_ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   ```

5. **Deploy** your service

## Database Setup

The application will automatically create all necessary tables when it starts up. No manual database migration is required.

## Health Check

Once deployed, you can check if your service is running by visiting:
- `https://your-service-name.onrender.com/health`
- `https://your-service-name.onrender.com/docs` (API documentation)

## Troubleshooting

### Common Issues:

1. **"Expected string or URL object, got None"**
   - Make sure `DATABASE_URL` is set in Render environment variables
   - Verify the connection string format is correct

2. **Database connection errors**
   - Check if your PostgreSQL database is accessible
   - Verify the connection string includes SSL mode if required

3. **Authentication errors**
   - Ensure `SECRET_KEY` and `JWT_SECRET` are set
   - Make sure they are different values and are secure

### Testing Environment Variables

You can use the included validation script to check your environment variables:
```bash
python validate_env.py
```

This script will show you which environment variables are set and which are missing.

## Security Notes

- Never commit sensitive environment variables to your repository
- Use strong, unique values for SECRET_KEY and JWT_SECRET
- Consider rotating secrets periodically
- Use HTTPS in production (Render provides this automatically)
