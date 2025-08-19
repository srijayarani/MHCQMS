# MHCQMS Render Deployment Checklist

## ✅ Pre-Deployment
- [ ] All code committed and pushed to GitHub
- [ ] `render.yaml` file created in root directory
- [ ] Backend requirements.txt updated
- [ ] Frontend environment variables configured

## ✅ Render Setup
- [ ] Render account created
- [ ] GitHub repository connected
- [ ] Blueprint deployment initiated

## ✅ Environment Variables
- [ ] `DATABASE_URL` set in backend
- [ ] `JWT_SECRET` set in backend
- [ ] `SECRET_KEY` set in backend
- [ ] `REACT_APP_API_URL` set in frontend

## ✅ Database
- [ ] PostgreSQL service created (or existing DB configured)
- [ ] Connection string verified
- [ ] Database accessible from Render

## ✅ Services
- [ ] Backend service building successfully
- [ ] Frontend service building successfully
- [ ] Health checks passing (`/health` endpoint)

## ✅ Testing
- [ ] Backend API accessible
- [ ] Frontend loading correctly
- [ ] API calls working
- [ ] Authentication functional

## ✅ Production
- [ ] Custom domain configured (optional)
- [ ] SSL certificates active
- [ ] Monitoring set up
- [ ] Backup strategy implemented

---

## 🚀 Quick Deploy Commands

```bash
# 1. Push to GitHub
git add .
git commit -m "Ready for Render deployment"
git push origin main

# 2. Deploy on Render
# - Go to render.com
# - Connect GitHub repo
# - Use Blueprint deployment
# - Configure environment variables
# - Wait for build completion
```

## 🔗 Important URLs
- **Backend Health Check**: `https://your-backend.onrender.com/health`
- **Frontend**: `https://your-frontend.onrender.com`
- **Render Dashboard**: `https://dashboard.render.com`

## ⚠️ Common Issues
- **Build fails**: Check requirements.txt and package.json
- **Service won't start**: Verify environment variables
- **Database connection**: Check DATABASE_URL format
- **CORS errors**: Backend allows all origins by default
