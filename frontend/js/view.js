// JavaScript for view.html - Student Report Page

// DOM Elements
const loadingSpinner = document.getElementById('loadingSpinner');
const reportContainer = document.getElementById('reportContainer');
const errorMessage = document.getElementById('errorMessage');
const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
const editStudentBtn = document.getElementById('editStudentBtn');
const deleteStudentBtn = document.getElementById('deleteStudentBtn');

// Global variables
let studentId = null;
let student = null;
let performanceChart = null;
let gradeChart = null;

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    studentId = Utils.getUrlParameter('id');
    
    if (!studentId) {
        showError('No student ID provided');
        return;
    }
    
    loadStudent();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // Edit button
    editStudentBtn.addEventListener('click', () => {
        window.location.href = `edit.html?id=${studentId}`;
    });
    
    // Delete button
    deleteStudentBtn.addEventListener('click', showDeleteModal);
    
    // Delete confirmation
    confirmDeleteBtn.addEventListener('click', handleDeleteConfirm);
}

// Load student data
async function loadStudent() {
    try {
        showLoading();
        
        const response = await ApiService.getStudent(studentId);
        student = response.data;
        
        populateReport(student);
        hideLoading();
        
    } catch (error) {
        console.error('Error loading student:', error);
        hideLoading();
        showError('Failed to load student data: ' + error.message);
    }
}

// Show loading state
function showLoading() {
    Utils.show(loadingSpinner);
    Utils.hide(reportContainer);
    Utils.hide(errorMessage);
}

// Hide loading state
function hideLoading() {
    Utils.hide(loadingSpinner);
    Utils.show(reportContainer);
}

// Show error message
function showError(message) {
    Utils.hide(loadingSpinner);
    Utils.hide(reportContainer);
    Utils.show(errorMessage);
    
    const errorText = document.getElementById('errorText');
    errorText.textContent = message;
}

// Populate report with student data
function populateReport(student) {
    // Populate student information
    populateStudentInfo(student);
    
    // Populate performance summary
    populatePerformanceSummary(student);
    
    // Populate subjects table
    populateSubjectsTable(student);
    
    // Create charts
    createPerformanceChart(student);
    createGradeChart(student);
    
    // Generate performance analysis
    generatePerformanceAnalysis(student);
    
    // Set edit button link
    editStudentBtn.href = `edit.html?id=${student._id}`;
    
    // Add fade-in animation
    reportContainer.classList.add('fade-in');
}

// Populate student information section
function populateStudentInfo(student) {
    const studentInfo = document.getElementById('studentInfo');
    
    studentInfo.innerHTML = `
        <div class="col-md-6">
            <p><strong>Name:</strong> ${student.name}</p>
            <p><strong>Roll Number:</strong> ${student.rollNumber}</p>
            <p><strong>Class:</strong> ${student.class}</p>
            <p><strong>Section:</strong> ${student.section}</p>
        </div>
        <div class="col-md-6">
            <p><strong>Email:</strong> ${student.email || 'N/A'}</p>
            <p><strong>Phone:</strong> ${student.phone || 'N/A'}</p>
            <p><strong>Date of Birth:</strong> ${Utils.formatDate(student.dateOfBirth)}</p>
            <p><strong>Address:</strong> ${student.address || 'N/A'}</p>
        </div>
    `;
}

// Populate performance summary cards
function populatePerformanceSummary(student) {
    document.getElementById('totalSubjects').textContent = student.subjects ? student.subjects.length : 0;
    document.getElementById('totalMarks').textContent = `${student.totalMarks || 0}/${student.maxTotalMarks || 0}`;
    document.getElementById('percentage').textContent = `${student.percentage || 0}%`;

    // Display grade with grade point
    const gradeText = student.grade || 'N/A';
    const gradePoint = student.gradePoint || Utils.getGradePoint(student.percentage || 0);
    document.getElementById('grade').textContent = `${gradeText} (${gradePoint.toFixed(1)})`;

    // Add grade badge class
    const gradeElement = document.getElementById('grade');
    gradeElement.className = `card-title badge ${Utils.getGradeBadgeClass(student.grade)}`;
}

// Populate subjects table
function populateSubjectsTable(student) {
    const subjectsTable = document.getElementById('subjectsTable');
    
    if (!student.subjects || student.subjects.length === 0) {
        subjectsTable.innerHTML = '<tr><td colspan="3" class="text-center">No subjects found</td></tr>';
        return;
    }
    
    subjectsTable.innerHTML = student.subjects.map(subject => {
        const percentage = subject.maxMarks > 0 ? Math.round((subject.marks / subject.maxMarks) * 100) : 0;
        return `
            <tr>
                <td>${subject.name}</td>
                <td>${subject.marks}/${subject.maxMarks}</td>
                <td>${percentage}%</td>
            </tr>
        `;
    }).join('');
}

// Create performance chart
function createPerformanceChart(student) {
    const ctx = document.getElementById('performanceChart').getContext('2d');
    
    if (performanceChart) {
        performanceChart.destroy();
    }
    
    const subjects = student.subjects || [];
    const labels = subjects.map(s => s.name);
    const data = subjects.map(s => s.marks);
    const maxData = subjects.map(s => s.maxMarks);
    
    performanceChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Marks Obtained',
                    data: data,
                    backgroundColor: 'rgba(13, 110, 253, 0.8)',
                    borderColor: 'rgba(13, 110, 253, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Maximum Marks',
                    data: maxData,
                    backgroundColor: 'rgba(108, 117, 125, 0.3)',
                    borderColor: 'rgba(108, 117, 125, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: Math.max(...maxData) + 10
                }
            },
            plugins: {
                legend: {
                    position: 'top'
                },
                title: {
                    display: true,
                    text: 'Subject-wise Performance'
                }
            }
        }
    });
}

// Create grade distribution chart
function createGradeChart(student) {
    const ctx = document.getElementById('gradeChart').getContext('2d');
    
    if (gradeChart) {
        gradeChart.destroy();
    }
    
    const subjects = student.subjects || [];
    const gradeDistribution = {};
    
    // Calculate grade for each subject (Karachi University System)
    subjects.forEach(subject => {
        const percentage = subject.maxMarks > 0 ? (subject.marks / subject.maxMarks) * 100 : 0;
        const grade = Utils.getLetterGrade(percentage);
        gradeDistribution[grade] = (gradeDistribution[grade] || 0) + 1;
    });
    
    const labels = Object.keys(gradeDistribution);
    const data = Object.values(gradeDistribution);
    const colors = labels.map(grade => {
        const colorMap = {
            'A+': '#28a745', 'A': '#20c997', 'A-': '#17a2b8',
            'B+': '#007bff', 'B': '#6f42c1', 'B-': '#e83e8c',
            'C+': '#ffc107', 'C': '#fd7e14', 'C-': '#f8765a',
            'D+': '#ff6b6b', 'D': '#dc3545', 'F': '#6c757d'
        };
        return colorMap[grade] || '#6c757d';
    });
    
    gradeChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors,
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                title: {
                    display: true,
                    text: 'Grade Distribution by Subject'
                }
            }
        }
    });
}

// Generate performance analysis
function generatePerformanceAnalysis(student) {
    const analysisContainer = document.getElementById('performanceAnalysis');
    const subjects = student.subjects || [];
    
    if (subjects.length === 0) {
        analysisContainer.innerHTML = '<p class="text-muted">No subjects to analyze</p>';
        return;
    }
    
    // Calculate statistics
    const percentages = subjects.map(s => s.maxMarks > 0 ? (s.marks / s.maxMarks) * 100 : 0);
    const avgPercentage = percentages.reduce((a, b) => a + b, 0) / percentages.length;
    const highestSubject = subjects.reduce((prev, current) => {
        const prevPerc = prev.maxMarks > 0 ? (prev.marks / prev.maxMarks) * 100 : 0;
        const currPerc = current.maxMarks > 0 ? (current.marks / current.maxMarks) * 100 : 0;
        return currPerc > prevPerc ? current : prev;
    });
    const lowestSubject = subjects.reduce((prev, current) => {
        const prevPerc = prev.maxMarks > 0 ? (prev.marks / prev.maxMarks) * 100 : 0;
        const currPerc = current.maxMarks > 0 ? (current.marks / current.maxMarks) * 100 : 0;
        return currPerc < prevPerc ? current : prev;
    });
    
    const highestPerc = highestSubject.maxMarks > 0 ? Math.round((highestSubject.marks / highestSubject.maxMarks) * 100) : 0;
    const lowestPerc = lowestSubject.maxMarks > 0 ? Math.round((lowestSubject.marks / lowestSubject.maxMarks) * 100) : 0;
    
    analysisContainer.innerHTML = `
        <div class="performance-item">
            <i class="fas fa-chart-line text-primary"></i>
            <div>
                <strong>Average Performance:</strong> ${Math.round(avgPercentage)}%
            </div>
        </div>
        <div class="performance-item">
            <i class="fas fa-trophy text-success"></i>
            <div>
                <strong>Best Subject:</strong> ${highestSubject.name} (${highestPerc}%)
            </div>
        </div>
        <div class="performance-item">
            <i class="fas fa-exclamation-triangle text-warning"></i>
            <div>
                <strong>Needs Improvement:</strong> ${lowestSubject.name} (${lowestPerc}%)
            </div>
        </div>
        <div class="performance-item">
            <i class="fas fa-graduation-cap text-info"></i>
            <div>
                <strong>Overall Grade:</strong> ${student.grade || 'N/A'}
            </div>
        </div>
    `;
}

// Show delete confirmation modal
function showDeleteModal() {
    const deleteStudentInfo = document.getElementById('deleteStudentInfo');
    deleteStudentInfo.innerHTML = `
        <div class="card">
            <div class="card-body">
                <h6 class="card-title">${student.name}</h6>
                <p class="card-text">
                    <strong>Roll Number:</strong> ${student.rollNumber}<br>
                    <strong>Class:</strong> ${student.class} - ${student.section}
                </p>
            </div>
        </div>
    `;
    
    deleteModal.show();
}

// Handle delete confirmation
async function handleDeleteConfirm() {
    try {
        // Show loading state on button
        confirmDeleteBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Deleting...';
        confirmDeleteBtn.disabled = true;
        
        await ApiService.deleteStudent(studentId);
        
        // Hide modal
        deleteModal.hide();
        
        Utils.showToast('Student deleted successfully', 'success');
        
        // Redirect to student list
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
        
    } catch (error) {
        console.error('Error deleting student:', error);
        Utils.showToast('Failed to delete student: ' + error.message, 'error');
    } finally {
        // Reset button
        confirmDeleteBtn.innerHTML = '<i class="fas fa-trash me-2"></i>Delete Student';
        confirmDeleteBtn.disabled = false;
    }
}
