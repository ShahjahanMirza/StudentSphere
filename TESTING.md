# Testing Guide

This document provides comprehensive testing instructions for the Student Record Management System.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Backend API Testing](#backend-api-testing)
- [Frontend Testing](#frontend-testing)
- [Integration Testing](#integration-testing)
- [Performance Testing](#performance-testing)
- [Security Testing](#security-testing)

## Prerequisites

### Setup Requirements
1. **MongoDB Atlas configured** (see setup-mongodb-atlas.md)
2. **Backend server running** on http://localhost:3000
3. **Frontend server running** on http://localhost:3001
4. **Sample data loaded** (run `npm run seed` in backend)

### Testing Tools
- **Browser**: Chrome/Firefox with Developer Tools
- **API Testing**: Postman, curl, or browser
- **Network Tab**: For monitoring API calls

## Backend API Testing

### 1. Health Check
**Test the API is running:**
```bash
# Method 1: Browser
Open: http://localhost:3000/api/health

# Method 2: Command line (if curl available)
curl http://localhost:3000/api/health
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Student Record Management API is running",
  "timestamp": "2024-01-XX...",
  "environment": "development"
}
```

### 2. Get All Students
**URL:** `GET http://localhost:3000/api/students`

**Test Cases:**
1. **Basic Request:**
   ```
   GET /api/students
   Expected: List of all students with 200 status
   ```

2. **With Search:**
   ```
   GET /api/students?search=alice
   Expected: Students matching "alice" in name or roll number
   ```

3. **With Filters:**
   ```
   GET /api/students?class=10th&section=A
   Expected: Students from class 10th, section A
   ```

4. **With Sorting:**
   ```
   GET /api/students?sortBy=percentage&order=desc
   Expected: Students sorted by percentage (highest first)
   ```

### 3. Get Single Student
**URL:** `GET http://localhost:3000/api/students/:id`

**Test Cases:**
1. **Valid ID:**
   - Use an ID from the students list
   - Expected: Single student object with 200 status

2. **Invalid ID:**
   ```
   GET /api/students/invalid-id
   Expected: 400 error with "Invalid student ID format"
   ```

3. **Non-existent ID:**
   ```
   GET /api/students/507f1f77bcf86cd799439011
   Expected: 404 error with "Student not found"
   ```

### 4. Create Student
**URL:** `POST http://localhost:3000/api/students`

**Test Cases:**
1. **Valid Student Data:**
   ```json
   {
     "name": "Test Student",
     "rollNumber": "TEST001",
     "class": "10th",
     "section": "A",
     "subjects": [
       {
         "name": "Mathematics",
         "marks": 85,
         "maxMarks": 100
       }
     ]
   }
   ```
   Expected: 201 status with created student data

2. **Missing Required Fields:**
   ```json
   {
     "name": "Test Student"
   }
   ```
   Expected: 400 error listing missing fields

3. **Duplicate Roll Number:**
   - Use existing roll number (e.g., "CS001")
   Expected: 400 error "Roll number already exists"

4. **Invalid Email:**
   ```json
   {
     "name": "Test Student",
     "rollNumber": "TEST002",
     "class": "10th",
     "section": "A",
     "email": "invalid-email",
     "subjects": [{"name": "Math", "marks": 85}]
   }
   ```
   Expected: 400 validation error

### 5. Update Student
**URL:** `PUT http://localhost:3000/api/students/:id`

**Test Cases:**
1. **Valid Update:**
   - Update existing student's name or marks
   Expected: 200 status with updated data

2. **Invalid ID:**
   Expected: 400 or 404 error

3. **Duplicate Roll Number:**
   - Try to change roll number to existing one
   Expected: 400 error

### 6. Delete Student
**URL:** `DELETE http://localhost:3000/api/students/:id`

**Test Cases:**
1. **Valid Deletion:**
   Expected: 200 status with deleted student data

2. **Invalid ID:**
   Expected: 400 or 404 error

3. **Already Deleted:**
   - Try to delete same student twice
   Expected: 404 error

## Frontend Testing

### 1. Homepage (index.html)
**URL:** http://localhost:3001

**Test Cases:**
1. **Page Load:**
   - [ ] Page loads without errors
   - [ ] Navigation bar displays correctly
   - [ ] Student list loads (if sample data exists)
   - [ ] Loading spinner shows briefly

2. **Student List Display:**
   - [ ] Students display in table format
   - [ ] All columns show correct data
   - [ ] Grade badges have correct colors
   - [ ] Action buttons (view, edit, delete) are present

3. **Search Functionality:**
   - [ ] Search by student name works
   - [ ] Search by roll number works
   - [ ] Search results update in real-time
   - [ ] Clear search shows all students

4. **Filter Functionality:**
   - [ ] Class filter works
   - [ ] Section filter works
   - [ ] Combined filters work
   - [ ] Filter dropdowns populate correctly

5. **Sorting:**
   - [ ] Sort by roll number works
   - [ ] Sort by name works
   - [ ] Sort by percentage works
   - [ ] Sort order (asc/desc) works

### 2. Add Student Page (add.html)
**URL:** http://localhost:3001/add.html

**Test Cases:**
1. **Form Display:**
   - [ ] All form fields display correctly
   - [ ] Required field indicators (*) show
   - [ ] Subject section has one default subject
   - [ ] Add Subject button works

2. **Form Validation:**
   - [ ] Required field validation works
   - [ ] Email validation works
   - [ ] Phone validation works
   - [ ] Subject validation works
   - [ ] Roll number formatting (uppercase) works

3. **Subject Management:**
   - [ ] Add subject button adds new subject row
   - [ ] Remove subject button works (when >1 subject)
   - [ ] Cannot remove last subject
   - [ ] Subject marks validation (0-100)

4. **Form Submission:**
   - [ ] Valid form submits successfully
   - [ ] Success message displays
   - [ ] Redirects to view page after success
   - [ ] Error handling for duplicate roll number
   - [ ] Loading state shows during submission

### 3. Edit Student Page (edit.html)
**URL:** http://localhost:3001/edit.html?id=STUDENT_ID

**Test Cases:**
1. **Page Load:**
   - [ ] Student data loads correctly
   - [ ] All fields populate with existing data
   - [ ] Subjects load correctly
   - [ ] Loading spinner shows during data fetch

2. **Form Functionality:**
   - [ ] All validation works (same as add page)
   - [ ] Changes are detected
   - [ ] "No changes detected" message works
   - [ ] Update button works

3. **Error Handling:**
   - [ ] Invalid student ID shows error
   - [ ] Network errors handled gracefully
   - [ ] Loading states work correctly

### 4. View Student Page (view.html)
**URL:** http://localhost:3001/view.html?id=STUDENT_ID

**Test Cases:**
1. **Student Information:**
   - [ ] All student details display correctly
   - [ ] Performance summary cards show correct data
   - [ ] Subjects table displays all subjects
   - [ ] Grades and percentages calculate correctly

2. **Charts:**
   - [ ] Performance chart loads and displays correctly
   - [ ] Grade distribution chart works
   - [ ] Charts are responsive
   - [ ] Chart data matches student subjects

3. **Performance Analysis:**
   - [ ] Average performance calculates correctly
   - [ ] Best subject identified correctly
   - [ ] Improvement areas identified
   - [ ] Overall grade displays correctly

4. **Actions:**
   - [ ] Edit button redirects to edit page
   - [ ] Delete button shows confirmation modal
   - [ ] Delete confirmation works
   - [ ] Print functionality works

## Integration Testing

### 1. Complete Student Lifecycle
**Test the full CRUD cycle:**

1. **Create Student:**
   - Go to Add Student page
   - Fill all required fields
   - Add multiple subjects
   - Submit form
   - Verify success message
   - Verify redirect to view page

2. **View Student:**
   - Verify all data displays correctly
   - Check calculations are accurate
   - Verify charts display

3. **Edit Student:**
   - Click edit button
   - Modify some data
   - Save changes
   - Verify updates appear

4. **Delete Student:**
   - Click delete button
   - Confirm deletion
   - Verify student removed from list

### 2. Navigation Testing
- [ ] All navigation links work
- [ ] Back buttons work correctly
- [ ] URL parameters work correctly
- [ ] Browser back/forward buttons work

### 3. Data Consistency
- [ ] Data changes reflect across all pages
- [ ] Calculations update correctly
- [ ] Filters and search work with new data

## Performance Testing

### 1. Load Testing
**Test with multiple students:**
1. Add 50+ students using the seed script
2. Test page load times
3. Test search performance
4. Test filter performance

### 2. Network Testing
**Test with slow network:**
1. Use browser dev tools to simulate slow 3G
2. Verify loading states work
3. Verify error handling for timeouts

### 3. Browser Testing
**Test in different browsers:**
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (if available)
- [ ] Edge (if available)

## Security Testing

### 1. Input Validation
- [ ] XSS prevention (try entering `<script>alert('test')</script>`)
- [ ] SQL injection prevention (not applicable with MongoDB)
- [ ] Input length limits work
- [ ] Special character handling

### 2. API Security
- [ ] CORS headers work correctly
- [ ] Error messages don't expose sensitive data
- [ ] Input sanitization works

## Mobile Testing

### 1. Responsive Design
**Test on different screen sizes:**
- [ ] Mobile phones (320px-480px)
- [ ] Tablets (768px-1024px)
- [ ] Desktop (1200px+)

### 2. Touch Interface
- [ ] Buttons are touch-friendly
- [ ] Forms work on mobile
- [ ] Navigation works on mobile

## Automated Testing Checklist

### Before Each Release:
- [ ] All API endpoints return expected responses
- [ ] All frontend pages load without errors
- [ ] CRUD operations work correctly
- [ ] Calculations are accurate
- [ ] Charts display correctly
- [ ] Mobile responsiveness works
- [ ] Error handling works
- [ ] Performance is acceptable

### Test Data Scenarios:
- [ ] Empty database (no students)
- [ ] Single student
- [ ] Multiple students (10+)
- [ ] Students with different grade ranges
- [ ] Students with special characters in names
- [ ] Students with maximum field lengths

## Reporting Issues

When reporting bugs, include:
1. **Steps to reproduce**
2. **Expected behavior**
3. **Actual behavior**
4. **Browser and version**
5. **Console errors (if any)**
6. **Screenshots (if helpful)**

## Test Results Template

```
Test Date: ___________
Tester: ___________
Environment: Development/Production

Backend API Tests:
- Health Check: ✅/❌
- Get Students: ✅/❌
- Create Student: ✅/❌
- Update Student: ✅/❌
- Delete Student: ✅/❌

Frontend Tests:
- Homepage: ✅/❌
- Add Student: ✅/❌
- Edit Student: ✅/❌
- View Student: ✅/❌

Integration Tests:
- Full CRUD Cycle: ✅/❌
- Navigation: ✅/❌
- Data Consistency: ✅/❌

Performance:
- Load Time: _____ seconds
- Search Performance: ✅/❌
- Chart Loading: ✅/❌

Issues Found:
1. ___________
2. ___________
3. ___________
```
