# MongoDB Atlas Setup Instructions

Follow these steps to set up your cloud MongoDB database for the Student Record Management System.

## Step-by-Step Setup

### 1. Create MongoDB Atlas Account
1. Go to [https://www.mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Click "Try Free"
3. Sign up with your email address
4. Verify your email address

### 2. Create Organization and Project
1. **Organization Name**: "Student Records" (or your preference)
2. **Project Name**: "Student Record Management"
3. Click "Create Project"

### 3. Create Database Cluster
1. Click "Build a Database"
2. Choose **"M0 Sandbox"** (Free tier - perfect for development)
3. **Cloud Provider**: AWS (recommended)
4. **Region**: Choose closest to your location
5. **Cluster Name**: "student-records-cluster"
6. Click "Create"

### 4. Create Database User
1. In the "Security Quickstart" dialog:
2. **Authentication Method**: Username and Password
3. **Username**: `student_admin`
4. **Password**: Click "Autogenerate Secure Password" 
   - **IMPORTANT**: Copy and save this password securely!
   - Or create your own strong password (min 8 characters)
5. Click "Create User"

### 5. Configure Network Access
1. **IP Access List**: 
   - For development: Click "Add My Current IP Address"
   - For production deployment: Add "0.0.0.0/0" (allows all IPs)
2. Click "Finish and Close"

### 6. Get Connection String
1. Click "Go to Databases"
2. Click "Connect" button on your cluster
3. Choose "Connect your application"
4. **Driver**: Node.js
5. **Version**: 4.1 or later
6. **Copy the connection string** - it will look like:
   ```
   mongodb+srv://student_admin:<password>@student-records-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### 7. Configure Your Application

1. **Open your project's backend/.env file**
2. **Replace the MONGODB_URI line** with your connection string:
   ```env
   MONGODB_URI=mongodb+srv://student_admin:YOUR_ACTUAL_PASSWORD@student-records-cluster.xxxxx.mongodb.net/student_records?retryWrites=true&w=majority
   ```
3. **Replace `<password>` with your actual database password**
4. **Add `/student_records` before the `?` to specify the database name**

### Example Configuration

If your connection string from Atlas is:
```
mongodb+srv://student_admin:<password>@student-records-cluster.abc123.mongodb.net/?retryWrites=true&w=majority
```

Your .env file should look like:
```env
MONGODB_URI=mongodb+srv://student_admin:MySecurePassword123@student-records-cluster.abc123.mongodb.net/student_records?retryWrites=true&w=majority
```

## Testing Your Connection

1. **Start the backend server**:
   ```bash
   cd backend
   npm run dev
   ```

2. **Look for success message**:
   ```
   🚀 Student Record Management API Server Started
   📍 Environment: development
   🌐 Server running on port 3000
   MongoDB Connected: student-records-cluster.abc123.mongodb.net
   ```

3. **If you see connection errors**:
   - Double-check your password in the connection string
   - Verify your IP address is whitelisted
   - Ensure the connection string format is correct

## Adding Sample Data

Once connected, you can add sample data:

```bash
cd backend
npm run seed
```

This will:
- Clear any existing data
- Add 7 sample students with different grades and classes
- Show a summary of the data added

## Troubleshooting

### Common Issues:

1. **"Authentication failed"**
   - Check your username and password in the connection string
   - Ensure the database user was created correctly

2. **"Connection timeout"**
   - Verify your IP address is in the IP Access List
   - Check your internet connection

3. **"Database not found"**
   - Make sure you added `/student_records` to your connection string

4. **"Invalid connection string"**
   - Ensure no spaces in the connection string
   - Check that special characters in password are URL-encoded

### Getting Help:

1. **MongoDB Atlas Documentation**: [docs.atlas.mongodb.com](https://docs.atlas.mongodb.com)
2. **Connection Troubleshooting**: Check the Atlas UI for connection examples
3. **Support**: MongoDB Atlas has excellent documentation and community support

## Security Best Practices

1. **Strong Passwords**: Use complex passwords for database users
2. **IP Whitelisting**: Only allow necessary IP addresses in production
3. **Environment Variables**: Never commit passwords to version control
4. **Regular Updates**: Keep your MongoDB driver updated
5. **Monitoring**: Use Atlas monitoring to track database performance

## Next Steps

After successful connection:
1. Start the frontend server: `cd frontend && npm start`
2. Open http://localhost:3001 in your browser
3. Test adding, viewing, editing, and deleting students
4. Check the MongoDB Atlas dashboard to see your data

## Atlas Dashboard Features

In your MongoDB Atlas dashboard, you can:
- **Browse Collections**: View your student data
- **Monitor Performance**: See query performance and usage
- **Set Alerts**: Get notified of issues
- **Backup Data**: Automatic backups are included
- **Scale Resources**: Upgrade when needed

Your free M0 cluster includes:
- 512 MB storage
- Shared RAM and vCPU
- No time limit
- Perfect for development and small applications
