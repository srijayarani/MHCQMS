# Step-by-Step Render Deployment Guide for MHCQMS

## Prerequisites
- [ ] GitHub account with your MHCQMS repository
- [ ] Render account (sign up at https://render.com)
- [ ] PostgreSQL database (you can use Render's PostgreSQL service)

---

## Step 1: Prepare Your Repository

### 1.1 Push All Changes to GitHub
```bash
git add .
git commit -m "Add Render deployment configuration"
git push origin main
```

### 1.2 Verify Repository Structure
Ensure these files are in your repository:
- `render.yaml` (in root)
- `backend/requirements.txt`
- `backend/Dockerfile`
- `frontend/Dockerfile`
- `frontend/nginx.conf`

---

## Step 2: Create Render Account & Connect Repository

### 2.1 Sign Up/Login to Render
1. Go to [https://render.com](https://render.com)
2. Sign up with GitHub or create account
3. Verify your email

### 2.2 Connect GitHub Repository
1. Click **"New +"** button
2. Select **"Blueprint"** (for automatic deployment)
3. Connect your GitHub account if not already connected
4. Select your **MHCQMS repository**
5. Click **"Connect"**

---

## Step 3: Deploy Using Blueprint

### 3.1 Configure Blueprint Deployment
1. Render will detect your `render.yaml` file
2. Click **"Apply"** to start deployment
3. Render will create both services automatically

### 3.2 What Happens Next
- Backend service: `mhcqms-backend`
- Frontend service: `mhcqms-frontend`
- Both services will start building

---

## Step 4: Configure Environment Variables

### 4.1 Backend Environment Variables
1. Go to your **Backend Service** dashboard
2. Click **"Environment"** tab
3. Add these variables:

| Key | Value | Description |
|-----|-------|-------------|
| `DATABASE_URL` | `your_postgresql_connection_string` | Database connection |
| `JWT_SECRET` | `your_super_secret_jwt_key` | JWT encryption key |
| `SECRET_KEY` | `your_super_secret_key` | App encryption key |
| `JWT_ALGORITHM` | `HS256` | JWT algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `30` | Token expiry time |
| `REFRESH_TOKEN_EXPIRE_DAYS` | `7` | Refresh token expiry |

### 4.2 Frontend Environment Variables
1. Go to your **Frontend Service** dashboard
2. Click **"Environment"** tab
3. Add this variable:

| Key | Value | Description |
|-----|-------|-------------|
| `REACT_APP_API_URL` | `https://your-backend-service.onrender.com` | Backend API URL |

---

## Step 5: Set Up Database

### 5.1 Create PostgreSQL Service (Optional)
1. Click **"New +"** → **"PostgreSQL"**
2. Choose **"Free"** plan
3. Name: `mhcqms-database`
4. Click **"Create Database"**

### 5.2 Get Database Connection String
1. Go to your database dashboard
2. Copy the **"External Database URL"**
3. Update `DATABASE_URL` in backend environment variables

### 5.3 Alternative: Use Existing Database
If you have an existing database:
1. Ensure it's accessible from Render's servers
2. Update `DATABASE_URL` with your connection string

---

## Step 6: Monitor Deployment

### 6.1 Check Build Status
1. **Backend Service**:
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - Health Check: `/health`

2. **Frontend Service**:
   - Build Command: `npm install && npm run build`
   - Publish Directory: `build`

### 6.2 Common Issues & Solutions

#### Build Failures
- **Python dependencies**: Check `requirements.txt` syntax
- **Node.js issues**: Verify `package.json` and dependencies
- **Memory limits**: Free tier has 512MB RAM limit

#### Runtime Errors
- **Database connection**: Verify `DATABASE_URL` format
- **Port binding**: Ensure using `$PORT` environment variable
- **CORS issues**: Backend allows all origins (`*`)

---

## Step 7: Test Your Deployment

### 7.1 Backend Testing
1. Visit: `https://your-backend-service.onrender.com/health`
2. Expected response: `{"status": "healthy", "message": "System is running"}`

### 7.2 Frontend Testing
1. Visit your frontend service URL
2. Check browser console for API connection errors
3. Test login/registration functionality

### 7.3 API Testing
1. Test authentication: `POST /api/auth/login`
2. Test patient registration: `POST /api/patients/`
3. Check CORS headers in browser dev tools

---

## Step 8: Custom Domain (Optional)

### 8.1 Add Custom Domain
1. Go to service dashboard
2. Click **"Settings"** → **"Custom Domains"**
3. Add your domain (e.g., `app.yourdomain.com`)

### 8.2 Update DNS Records
1. Add CNAME record pointing to your Render service
2. Wait for DNS propagation (up to 48 hours)

### 8.3 Update Environment Variables
1. Update `REACT_APP_API_URL` with new domain
2. Redeploy frontend service

---

## Step 9: Production Considerations

### 9.1 Security
- [ ] Change default JWT secrets
- [ ] Use strong database passwords
- [ ] Consider rate limiting
- [ ] Restrict CORS origins in production

### 9.2 Monitoring
- [ ] Set up logging
- [ ] Monitor service health
- [ ] Set up alerts for downtime

### 9.3 Scaling
- [ ] Upgrade from free tier when needed
- [ ] Consider auto-scaling for production loads

---

## Troubleshooting

### Service Won't Start
1. Check build logs for errors
2. Verify environment variables
3. Check service logs for runtime errors

### Database Connection Issues
1. Verify `DATABASE_URL` format
2. Check database accessibility
3. Ensure SSL mode is correct

### Frontend Not Loading
1. Check build process
2. Verify `REACT_APP_API_URL` is correct
3. Check browser console for errors

---

## Support Resources

- **Render Documentation**: [https://render.com/docs](https://render.com/docs)
- **Render Community**: [https://community.render.com](https://community.render.com)
- **Service Status**: [https://status.render.com](https://status.render.com)

---

## Next Steps After Deployment

1. **Test all functionality** thoroughly
2. **Set up monitoring** and alerts
3. **Configure backups** for database
4. **Set up CI/CD** for automatic deployments
5. **Document your deployment** process

Your MHCQMS system should now be accessible via Render's URLs!
