# Deployment Guide

This guide covers deploying the Student Record Management System to various platforms.

## Table of Contents
- [Local Development](#local-development)
- [Production Deployment](#production-deployment)
- [Platform-Specific Guides](#platform-specific-guides)
- [Environment Configuration](#environment-configuration)
- [Database Setup](#database-setup)

## Local Development

### Quick Start
```bash
# Clone the repository
git clone <repository-url>
cd student-record-management

# Setup Backend
cd backend
npm install
cp .env.example .env
# Configure MongoDB connection in .env
npm run dev

# Setup Frontend (in new terminal)
cd ../frontend
npm install
npm start
```

### Development URLs
- Frontend: http://localhost:3001
- Backend API: http://localhost:3000
- API Health: http://localhost:3000/api/health

## Production Deployment

### Backend Deployment Options

#### 1. Render (Recommended)
1. **Create Render Account:** Visit [render.com](https://render.com)
2. **Connect Repository:** Link your GitHub repository
3. **Create Web Service:**
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && npm start`
   - Environment: Node.js
4. **Environment Variables:**
   ```
   NODE_ENV=production
   MONGODB_URI=<your-mongodb-atlas-connection-string>
   PORT=3000
   CORS_ORIGIN=<your-frontend-url>
   JWT_SECRET=<your-jwt-secret>
   ```

#### 2. Railway
1. **Create Railway Account:** Visit [railway.app](https://railway.app)
2. **Deploy from GitHub:** Connect repository
3. **Configure Build:**
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
4. **Add Environment Variables** (same as above)

#### 3. Heroku
1. **Install Heroku CLI**
2. **Create Heroku App:**
   ```bash
   cd backend
   heroku create your-app-name
   ```
3. **Configure Environment:**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set MONGODB_URI=<connection-string>
   heroku config:set CORS_ORIGIN=<frontend-url>
   ```
4. **Deploy:**
   ```bash
   git subtree push --prefix backend heroku main
   ```

### Frontend Deployment Options

#### 1. Netlify (Recommended)
1. **Create Netlify Account:** Visit [netlify.com](https://netlify.com)
2. **Deploy from Git:** Connect GitHub repository
3. **Build Settings:**
   - Base Directory: `frontend`
   - Build Command: `npm run build` (if using build process)
   - Publish Directory: `frontend` (for static files)
4. **Environment Variables:**
   ```
   REACT_APP_API_URL=<your-backend-url>
   ```

#### 2. Vercel
1. **Install Vercel CLI:** `npm i -g vercel`
2. **Deploy:**
   ```bash
   cd frontend
   vercel
   ```
3. **Configure:**
   - Framework: Other
   - Root Directory: `frontend`

#### 3. GitHub Pages
1. **Enable GitHub Pages** in repository settings
2. **Build and Deploy Script:**
   ```bash
   cd frontend
   npm run build
   # Copy build files to docs/ folder or gh-pages branch
   ```

## Platform-Specific Guides

### MongoDB Atlas Setup
1. **Create Account:** Visit [mongodb.com/atlas](https://mongodb.com/atlas)
2. **Create Cluster:**
   - Choose free tier (M0)
   - Select region closest to your deployment
3. **Database Access:**
   - Create database user
   - Set username and password
4. **Network Access:**
   - Add IP addresses (0.0.0.0/0 for all IPs in production)
5. **Get Connection String:**
   - Click "Connect" → "Connect your application"
   - Copy connection string
   - Replace `<password>` with your database user password

### Domain Configuration
1. **Custom Domain Setup:**
   - Frontend: Configure DNS to point to your hosting provider
   - Backend: Set up subdomain (e.g., api.yourdomain.com)
2. **SSL Certificates:**
   - Most platforms provide automatic SSL
   - For custom setups, use Let's Encrypt

## Environment Configuration

### Backend Environment Variables
```env
# Required
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/student_records
PORT=3000

# Security
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
CORS_ORIGIN=https://your-frontend-domain.com

# Optional
LOG_LEVEL=info
MAX_REQUEST_SIZE=10mb
```

### Frontend Environment Variables
```env
# API Configuration
REACT_APP_API_URL=https://your-backend-domain.com/api
REACT_APP_ENVIRONMENT=production

# Optional Features
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_VERSION=1.0.0
```

## Database Setup

### Production Database Considerations
1. **Connection Pooling:** MongoDB Atlas handles this automatically
2. **Backup Strategy:** Atlas provides automated backups
3. **Monitoring:** Set up alerts for database performance
4. **Security:** Use strong passwords and IP whitelisting

### Test Data (Optional)
```bash
# Add a single test student for verification (optional)
cd backend
npm run seed:test

# Clear all data when ready for production
npm run seed:clear
```

## Performance Optimization

### Backend Optimizations
1. **Enable Compression:**
   ```javascript
   app.use(compression());
   ```
2. **Rate Limiting:**
   ```javascript
   const rateLimit = require('express-rate-limit');
   app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
   ```
3. **Caching Headers:**
   ```javascript
   app.use(express.static('public', { maxAge: '1d' }));
   ```

### Frontend Optimizations
1. **Minification:** Use build tools for production
2. **CDN:** Use CDN for static assets
3. **Lazy Loading:** Implement for large datasets
4. **Caching:** Configure browser caching

## Monitoring and Logging

### Backend Monitoring
1. **Health Checks:** Implement `/health` endpoint
2. **Error Logging:** Use services like Sentry or LogRocket
3. **Performance Monitoring:** Use APM tools
4. **Database Monitoring:** MongoDB Atlas provides built-in monitoring

### Frontend Monitoring
1. **Error Tracking:** Implement error boundaries
2. **Analytics:** Google Analytics or similar
3. **Performance:** Web Vitals monitoring
4. **User Feedback:** Error reporting system

## Security Checklist

### Backend Security
- [ ] Environment variables properly configured
- [ ] CORS properly configured
- [ ] Input validation implemented
- [ ] Rate limiting enabled
- [ ] HTTPS enforced
- [ ] Database connection secured
- [ ] Error messages don't expose sensitive data

### Frontend Security
- [ ] API endpoints use HTTPS
- [ ] No sensitive data in client-side code
- [ ] Content Security Policy implemented
- [ ] XSS protection enabled
- [ ] Input sanitization implemented

## Troubleshooting Deployment

### Common Issues
1. **Build Failures:**
   - Check Node.js version compatibility
   - Verify all dependencies are listed in package.json
   - Check for environment-specific code

2. **Database Connection Issues:**
   - Verify connection string format
   - Check IP whitelist settings
   - Ensure database user has proper permissions

3. **CORS Errors:**
   - Verify CORS_ORIGIN environment variable
   - Check frontend URL configuration
   - Ensure protocol (http/https) matches

4. **Performance Issues:**
   - Monitor database query performance
   - Check for memory leaks
   - Optimize API response sizes

### Getting Help
1. Check application logs
2. Review platform-specific documentation
3. Test API endpoints individually
4. Verify environment variable configuration
5. Check database connectivity

## Maintenance

### Regular Tasks
1. **Update Dependencies:** Monthly security updates
2. **Database Maintenance:** Monitor performance and storage
3. **Backup Verification:** Test restore procedures
4. **Security Audits:** Regular vulnerability scans
5. **Performance Reviews:** Monitor and optimize slow queries

### Scaling Considerations
1. **Horizontal Scaling:** Multiple server instances
2. **Database Scaling:** MongoDB sharding or read replicas
3. **CDN Implementation:** For static assets
4. **Load Balancing:** For high traffic scenarios
