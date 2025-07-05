# Student Record Management System

A full-stack web application for managing student records with CRUD operations using the Karachi University grading system.

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript, Bootstrap
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Additional**: Chart.js for data visualization

## Features

- ✅ Add new student records
- ✅ View all students in a list
- ✅ Edit existing student information
- ✅ Delete student records
- ✅ View individual student reports
- ✅ Calculate grades and percentages using Karachi University system
- ✅ GPA calculation with 4.0 scale
- ✅ Subject-wise performance charts
- ✅ Responsive design
- ✅ Filter and search functionality

## Project Structure

```
student-record-app/
├── backend/
│   ├── models/
│   │   └── Student.js
│   ├── routes/
│   │   └── students.js
│   ├── config/
│   │   └── db.js
│   ├── server.js
│   ├── package.json
│   └── .env
├── frontend/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── main.js
│   ├── index.html
│   ├── add.html
│   ├── edit.html
│   ├── view.html
│   └── package.json
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)

### Database Setup (Choose one option)

#### Option 1: Local MongoDB Installation
1. **Download and Install MongoDB:**
   - Visit [MongoDB Download Center](https://www.mongodb.com/try/download/community)
   - Download MongoDB Community Server for your OS
   - Follow installation instructions for your platform

2. **Start MongoDB Service:**
   - **Windows:** MongoDB should start automatically as a service
   - **macOS:** `brew services start mongodb/brew/mongodb-community`
   - **Linux:** `sudo systemctl start mongod`

3. **Verify MongoDB is running:**
   - Open MongoDB Compass or use command: `mongosh`
   - Default connection: `mongodb://localhost:27017`

#### Option 2: MongoDB Atlas (Cloud)
1. **Create MongoDB Atlas Account:**
   - Visit [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Sign up for a free account

2. **Create a Cluster:**
   - Create a new cluster (free tier available)
   - Set up database user and password
   - Add your IP address to whitelist

3. **Get Connection String:**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string

### Backend Setup
1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   - Copy `.env.example` to `.env`
   - For local MongoDB: Keep default `MONGODB_URI=mongodb://localhost:27017/student_records`
   - For MongoDB Atlas: Replace with your Atlas connection string

4. Start the backend server:
   ```bash
   npm run dev
   ```
   Server will run on http://localhost:3000

### Frontend Setup
1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the frontend server:
   ```bash
   npm start
   ```
   Frontend will run on http://localhost:3001

### Verification
1. **Check Backend:** Visit http://localhost:3000/api/health
2. **Check Frontend:** Visit http://localhost:3001
3. **Test API:** The frontend should connect to backend automatically

### Optional: Add Test Data
If you want to add a test student for verification:
```bash
cd backend
npm run seed:test
```

To clear all data:
```bash
cd backend
npm run seed:clear
```

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/students` | Get all students |
| GET | `/api/students/:id` | Get a single student |
| POST | `/api/students` | Add a new student |
| PUT | `/api/students/:id` | Update student info |
| DELETE | `/api/students/:id` | Delete a student |

## Usage

1. **Access the Application:**
   - Open your browser and go to http://localhost:3001
   - You should see the Student Record Management System homepage

2. **Add Students:**
   - Click "Add Student" button
   - Fill in student information and subjects
   - Click "Save Student"

3. **View Students:**
   - All students are listed on the homepage
   - Use search and filters to find specific students
   - Click the eye icon to view detailed reports

4. **Edit Students:**
   - Click the edit icon next to any student
   - Modify information and save changes

5. **Delete Students:**
   - Click the delete icon and confirm deletion

6. **View Reports:**
   - Click on any student to see detailed performance reports
   - View charts and grade analysis

## Troubleshooting

### Common Issues

1. **"Unable to connect to server" error:**
   - Make sure the backend server is running on port 3000
   - Check if MongoDB is running and accessible
   - Verify the MongoDB connection string in `.env`

2. **Backend won't start:**
   - Check if MongoDB is running: `mongosh` or MongoDB Compass
   - Verify Node.js version: `node --version` (should be v14+)
   - Check for port conflicts (port 3000)

3. **Frontend shows blank page:**
   - Check browser console for errors
   - Verify frontend server is running on port 3001
   - Check if backend API is accessible

4. **CORS errors:**
   - Verify CORS_ORIGIN in backend `.env` matches frontend URL
   - Default should be `http://localhost:3001`

### MongoDB Connection Issues

1. **Local MongoDB not starting:**
   - **Windows:** Check Windows Services for MongoDB
   - **macOS:** `brew services restart mongodb/brew/mongodb-community`
   - **Linux:** `sudo systemctl status mongod`

2. **MongoDB Atlas connection:**
   - Verify connection string format
   - Check IP whitelist settings
   - Ensure database user has proper permissions

## Features Implemented

✅ **Core Features:**
- Complete CRUD operations for student records
- Responsive web design with Bootstrap
- Real-time form validation
- Search and filtering capabilities
- Grade calculation and percentage computation

✅ **Advanced Features:**
- Interactive charts using Chart.js
- Subject-wise performance visualization
- Grade distribution analysis
- Performance analytics and insights
- Print-friendly report pages
- Auto-save draft functionality
- Toast notifications for user feedback

✅ **Technical Features:**
- RESTful API with Express.js
- MongoDB with Mongoose ODM
- Input validation and sanitization
- Error handling and logging
- CORS configuration
- Environment-based configuration

## API Documentation

### Base URL
```
http://localhost:3000/api
```

### Endpoints

| Method | Endpoint | Description | Parameters |
|--------|----------|-------------|------------|
| GET | `/health` | API health check | None |
| GET | `/students` | Get all students | `?search=`, `?class=`, `?section=`, `?sortBy=` |
| GET | `/students/:id` | Get single student | Student ID |
| POST | `/students` | Create new student | Student data in body |
| PUT | `/students/:id` | Update student | Student ID + data in body |
| DELETE | `/students/:id` | Delete student | Student ID |

### Sample API Calls

```bash
# Get all students
curl http://localhost:3000/api/students

# Get single student
curl http://localhost:3000/api/students/[student_id]

# Create student
curl -X POST http://localhost:3000/api/students \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","rollNumber":"CS001","class":"10th","section":"A","subjects":[{"name":"Math","marks":85}]}'
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details

## Support

If you encounter any issues or have questions:
1. Check the troubleshooting section above
2. Review the console logs for error messages
3. Ensure all prerequisites are properly installed
4. Verify MongoDB connection and backend server status
