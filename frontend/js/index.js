// JavaScript for index.html - Student List Page

let students = [];
let filteredStudents = [];
let currentDeleteId = null;

// DOM Elements
const loadingSpinner = document.getElementById('loadingSpinner');
const studentsCard = document.getElementById('studentsCard');
const noStudentsMessage = document.getElementById('noStudentsMessage');
const studentsTableBody = document.getElementById('studentsTableBody');
const studentCount = document.getElementById('studentCount');
const searchInput = document.getElementById('searchInput');
const classFilter = document.getElementById('classFilter');
const sectionFilter = document.getElementById('sectionFilter');
const sortBy = document.getElementById('sortBy');
const refreshBtn = document.getElementById('refreshBtn');
const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    loadStudents();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // Search functionality with debounce
    searchInput.addEventListener('input', Utils.debounce(filterStudents, 300));
    
    // Filter functionality
    classFilter.addEventListener('change', filterStudents);
    sectionFilter.addEventListener('change', filterStudents);
    sortBy.addEventListener('change', filterStudents);
    
    // Refresh button
    refreshBtn.addEventListener('click', loadStudents);
    
    // Delete confirmation
    confirmDeleteBtn.addEventListener('click', handleDeleteConfirm);
}

// Load students from API
async function loadStudents() {
    try {
        showLoading();
        const response = await ApiService.getStudents();
        students = response.data || [];
        filteredStudents = [...students];
        
        populateFilters();
        renderStudents();
        hideLoading();
        
        Utils.showToast(`Loaded ${students.length} students successfully`, 'success');
    } catch (error) {
        console.error('Error loading students:', error);
        hideLoading();
        showNoStudents();
        Utils.showToast('Failed to load students: ' + error.message, 'error');
    }
}

// Show loading state
function showLoading() {
    Utils.show(loadingSpinner);
    Utils.hide(studentsCard);
    Utils.hide(noStudentsMessage);
}

// Hide loading state
function hideLoading() {
    Utils.hide(loadingSpinner);
}

// Show no students message
function showNoStudents() {
    Utils.hide(studentsCard);
    Utils.show(noStudentsMessage);
}

// Populate filter dropdowns
function populateFilters() {
    // Get unique classes and sections
    const classes = [...new Set(students.map(s => s.class))].sort();
    const sections = [...new Set(students.map(s => s.section))].sort();
    
    // Populate class filter
    classFilter.innerHTML = '<option value="">All Classes</option>';
    classes.forEach(className => {
        classFilter.innerHTML += `<option value="${className}">${className}</option>`;
    });
    
    // Populate section filter
    sectionFilter.innerHTML = '<option value="">All Sections</option>';
    sections.forEach(section => {
        sectionFilter.innerHTML += `<option value="${section}">${section}</option>`;
    });
}

// Filter students based on search and filters
function filterStudents() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const selectedClass = classFilter.value;
    const selectedSection = sectionFilter.value;
    const sortField = sortBy.value;
    
    // Filter students
    filteredStudents = students.filter(student => {
        const matchesSearch = !searchTerm || 
            student.name.toLowerCase().includes(searchTerm) ||
            student.rollNumber.toLowerCase().includes(searchTerm);
        
        const matchesClass = !selectedClass || student.class === selectedClass;
        const matchesSection = !selectedSection || student.section === selectedSection;
        
        return matchesSearch && matchesClass && matchesSection;
    });
    
    // Sort students
    filteredStudents.sort((a, b) => {
        switch (sortField) {
            case 'name':
                return a.name.localeCompare(b.name);
            case 'percentage':
                return b.percentage - a.percentage;
            case 'createdAt':
                return new Date(b.createdAt) - new Date(a.createdAt);
            case 'rollNumber':
            default:
                return a.rollNumber.localeCompare(b.rollNumber);
        }
    });
    
    renderStudents();
}

// Render students table
function renderStudents() {
    if (filteredStudents.length === 0) {
        showNoStudents();
        return;
    }
    
    Utils.show(studentsCard);
    Utils.hide(noStudentsMessage);
    
    // Update student count
    studentCount.textContent = filteredStudents.length;
    
    // Generate table rows
    studentsTableBody.innerHTML = filteredStudents.map(student => `
        <tr>
            <td>
                <strong>${student.rollNumber}</strong>
            </td>
            <td>
                <div class="d-flex align-items-center">
                    <div>
                        <div class="fw-bold">${student.name}</div>
                        ${student.email ? `<small class="text-muted">${student.email}</small>` : ''}
                    </div>
                </div>
            </td>
            <td>
                <span class="badge bg-primary">${student.class}</span>
            </td>
            <td>
                <span class="badge bg-info">${student.section}</span>
            </td>
            <td>
                <span class="badge bg-secondary">${student.subjects ? student.subjects.length : 0}</span>
            </td>
            <td>
                <strong>${student.totalMarks || 0}/${student.maxTotalMarks || 0}</strong>
            </td>
            <td>
                <div class="d-flex align-items-center">
                    <div class="progress me-2" style="width: 60px; height: 8px;">
                        <div class="progress-bar" role="progressbar" 
                             style="width: ${student.percentage || 0}%"
                             aria-valuenow="${student.percentage || 0}" 
                             aria-valuemin="0" aria-valuemax="100">
                        </div>
                    </div>
                    <span class="fw-bold">${student.percentage || 0}%</span>
                </div>
            </td>
            <td>
                <span class="badge ${Utils.getGradeBadgeClass(student.grade)}">
                    ${student.grade || 'N/A'}
                    ${student.gradePoint ? `(${student.gradePoint.toFixed(1)})` : ''}
                </span>
            </td>
            <td>
                <div class="btn-group btn-group-sm" role="group">
                    <a href="view.html?id=${student._id}" class="btn btn-outline-primary" title="View Details">
                        <i class="fas fa-eye"></i>
                    </a>
                    <a href="edit.html?id=${student._id}" class="btn btn-outline-secondary" title="Edit">
                        <i class="fas fa-edit"></i>
                    </a>
                    <button class="btn btn-outline-danger" onclick="showDeleteModal('${student._id}', '${student.name}', '${student.rollNumber}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
    
    // Add animation to table rows
    const rows = studentsTableBody.querySelectorAll('tr');
    rows.forEach((row, index) => {
        setTimeout(() => {
            row.classList.add('fade-in');
        }, index * 50);
    });
}

// Show delete confirmation modal
function showDeleteModal(studentId, studentName, rollNumber) {
    currentDeleteId = studentId;
    
    const deleteStudentInfo = document.getElementById('deleteStudentInfo');
    deleteStudentInfo.innerHTML = `
        <div class="card">
            <div class="card-body">
                <h6 class="card-title">${studentName}</h6>
                <p class="card-text">
                    <strong>Roll Number:</strong> ${rollNumber}
                </p>
            </div>
        </div>
    `;
    
    deleteModal.show();
}

// Handle delete confirmation
async function handleDeleteConfirm() {
    if (!currentDeleteId) return;
    
    try {
        // Show loading state on button
        confirmDeleteBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Deleting...';
        confirmDeleteBtn.disabled = true;
        
        await ApiService.deleteStudent(currentDeleteId);
        
        // Remove student from local array
        students = students.filter(s => s._id !== currentDeleteId);
        filteredStudents = filteredStudents.filter(s => s._id !== currentDeleteId);
        
        // Re-render table
        renderStudents();
        populateFilters();
        
        // Hide modal
        deleteModal.hide();
        
        Utils.showToast('Student deleted successfully', 'success');
    } catch (error) {
        console.error('Error deleting student:', error);
        Utils.showToast('Failed to delete student: ' + error.message, 'error');
    } finally {
        // Reset button
        confirmDeleteBtn.innerHTML = '<i class="fas fa-trash me-2"></i>Delete Student';
        confirmDeleteBtn.disabled = false;
        currentDeleteId = null;
    }
}

// Export functions for global access
window.showDeleteModal = showDeleteModal;
