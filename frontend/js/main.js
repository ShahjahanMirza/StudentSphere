// Main JavaScript file for Student Record Management System
// Contains common utilities and API functions

// Configuration
const API_BASE_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:3000/api'
  : 'https://student-record-backend.onrender.com/api';

// Utility Functions
class Utils {
    // Show toast notification
    static showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        const toastBody = document.getElementById('toastBody');
        const toastHeader = toast.querySelector('.toast-header i');
        
        // Set message
        toastBody.textContent = message;
        
        // Set icon and color based on type
        toastHeader.className = `fas me-2`;
        switch (type) {
            case 'success':
                toastHeader.classList.add('fa-check-circle', 'text-success');
                break;
            case 'error':
                toastHeader.classList.add('fa-exclamation-circle', 'text-danger');
                break;
            case 'warning':
                toastHeader.classList.add('fa-exclamation-triangle', 'text-warning');
                break;
            default:
                toastHeader.classList.add('fa-info-circle', 'text-primary');
        }
        
        // Show toast
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();
    }
    
    // Format date
    static formatDate(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
    
    // Format date for input
    static formatDateForInput(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
    }
    
    // Get grade badge class (Karachi University Grading System)
    static getGradeBadgeClass(grade) {
        const gradeClasses = {
            'A+': 'grade-a-plus',
            'A': 'grade-a',
            'A-': 'grade-a-minus',
            'B+': 'grade-b-plus',
            'B': 'grade-b',
            'B-': 'grade-b-minus',
            'C+': 'grade-c-plus',
            'C': 'grade-c',
            'C-': 'grade-c-minus',
            'D+': 'grade-d-plus',
            'D': 'grade-d',
            'F': 'grade-f'
        };
        return gradeClasses[grade] || 'bg-secondary';
    }

    // Get grade point (Karachi University System)
    static getGradePoint(percentage) {
        if (percentage >= 90) return 4.0;
        if (percentage >= 85) return 4.0;
        if (percentage >= 80) return 3.8;
        if (percentage >= 75) return 3.4;
        if (percentage >= 71) return 3.0;
        if (percentage >= 68) return 2.8;
        if (percentage >= 64) return 2.4;
        if (percentage >= 61) return 2.0;
        if (percentage >= 57) return 1.8;
        if (percentage >= 53) return 1.4;
        if (percentage >= 45) return 1.0;
        return 0.0;
    }

    // Get letter grade from percentage (Karachi University System)
    static getLetterGrade(percentage) {
        if (percentage >= 90) return 'A+';
        if (percentage >= 85) return 'A';
        if (percentage >= 80) return 'A-';
        if (percentage >= 75) return 'B+';
        if (percentage >= 71) return 'B';
        if (percentage >= 68) return 'B-';
        if (percentage >= 64) return 'C+';
        if (percentage >= 61) return 'C';
        if (percentage >= 57) return 'C-';
        if (percentage >= 53) return 'D+';
        if (percentage >= 45) return 'D';
        return 'F';
    }
    
    // Validate email
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    // Validate phone
    static isValidPhone(phone) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        return phoneRegex.test(phone);
    }
    
    // Show loading state
    static showLoading(element, text = 'Loading...') {
        element.innerHTML = `
            <div class="text-center py-3">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-2 mb-0">${text}</p>
            </div>
        `;
    }
    
    // Hide element
    static hide(element) {
        element.style.display = 'none';
    }
    
    // Show element
    static show(element, display = 'block') {
        element.style.display = display;
    }
    
    // Get URL parameter
    static getUrlParameter(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    }
    
    // Debounce function
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// API Service
class ApiService {
    // Generic API request
    static async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };
        
        try {
            const response = await fetch(url, config);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || `HTTP error! status: ${response.status}`);
            }
            
            return data;
        } catch (error) {
            console.error('API Request Error:', error);
            throw error;
        }
    }
    
    // Get all students
    static async getStudents(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = queryString ? `/students?${queryString}` : '/students';
        return this.request(endpoint);
    }
    
    // Get single student
    static async getStudent(id) {
        return this.request(`/students/${id}`);
    }
    
    // Create student
    static async createStudent(studentData) {
        return this.request('/students', {
            method: 'POST',
            body: JSON.stringify(studentData)
        });
    }
    
    // Update student
    static async updateStudent(id, studentData) {
        return this.request(`/students/${id}`, {
            method: 'PUT',
            body: JSON.stringify(studentData)
        });
    }
    
    // Delete student
    static async deleteStudent(id) {
        return this.request(`/students/${id}`, {
            method: 'DELETE'
        });
    }
    
    // Get class statistics
    static async getClassStats(className, section) {
        return this.request(`/students/stats/${className}/${section}`);
    }
    
    // Health check
    static async healthCheck() {
        return this.request('/health');
    }
}

// Form Validation
class FormValidator {
    constructor(form) {
        this.form = form;
        this.errors = {};
    }
    
    // Validate required fields
    validateRequired(fieldName, value, message = 'This field is required') {
        if (!value || value.trim() === '') {
            this.errors[fieldName] = message;
            return false;
        }
        return true;
    }
    
    // Validate email
    validateEmail(fieldName, value) {
        if (value && !Utils.isValidEmail(value)) {
            this.errors[fieldName] = 'Please enter a valid email address';
            return false;
        }
        return true;
    }
    
    // Validate phone
    validatePhone(fieldName, value) {
        if (value && !Utils.isValidPhone(value)) {
            this.errors[fieldName] = 'Please enter a valid phone number';
            return false;
        }
        return true;
    }
    
    // Validate marks
    validateMarks(fieldName, value, min = 0, max = 100) {
        const marks = parseFloat(value);
        if (isNaN(marks) || marks < min || marks > max) {
            this.errors[fieldName] = `Marks must be between ${min} and ${max}`;
            return false;
        }
        return true;
    }
    
    // Show validation errors
    showErrors() {
        // Clear previous errors
        this.form.querySelectorAll('.is-invalid').forEach(field => {
            field.classList.remove('is-invalid');
        });
        
        // Show new errors
        Object.keys(this.errors).forEach(fieldName => {
            const field = this.form.querySelector(`[name="${fieldName}"]`);
            if (field) {
                field.classList.add('is-invalid');
                const feedback = field.parentNode.querySelector('.invalid-feedback');
                if (feedback) {
                    feedback.textContent = this.errors[fieldName];
                }
            }
        });
    }
    
    // Check if form is valid
    isValid() {
        return Object.keys(this.errors).length === 0;
    }
    
    // Reset validation
    reset() {
        this.errors = {};
        this.form.querySelectorAll('.is-invalid').forEach(field => {
            field.classList.remove('is-invalid');
        });
    }
}

// Subject Manager for Add/Edit forms
class SubjectManager {
    constructor(container, addButton) {
        this.container = container;
        this.addButton = addButton;
        this.subjectCount = 0;
        this.init();
    }
    
    init() {
        this.addButton.addEventListener('click', () => this.addSubject());
        this.addSubject(); // Add first subject by default
    }
    
    addSubject(name = '', marks = '', maxMarks = 100) {
        this.subjectCount++;
        const subjectHtml = `
            <div class="subject-entry" data-subject-id="${this.subjectCount}">
                <button type="button" class="remove-subject" onclick="subjectManager.removeSubject(${this.subjectCount})">
                    <i class="fas fa-times"></i>
                </button>
                <div class="row">
                    <div class="col-md-6 mb-3">
                        <label class="form-label">Subject Name <span class="text-danger">*</span></label>
                        <input type="text" class="form-control" name="subjects[${this.subjectCount}][name]" 
                               value="${name}" placeholder="e.g., Mathematics" required>
                        <div class="invalid-feedback">Please enter subject name</div>
                    </div>
                    <div class="col-md-3 mb-3">
                        <label class="form-label">Marks <span class="text-danger">*</span></label>
                        <input type="number" class="form-control" name="subjects[${this.subjectCount}][marks]" 
                               value="${marks}" min="0" max="100" placeholder="0" required>
                        <div class="invalid-feedback">Enter valid marks (0-100)</div>
                    </div>
                    <div class="col-md-3 mb-3">
                        <label class="form-label">Max Marks</label>
                        <input type="number" class="form-control" name="subjects[${this.subjectCount}][maxMarks]" 
                               value="${maxMarks}" min="1" placeholder="100">
                        <div class="invalid-feedback">Enter valid max marks</div>
                    </div>
                </div>
            </div>
        `;
        
        this.container.insertAdjacentHTML('beforeend', subjectHtml);
        
        // Add animation
        const newSubject = this.container.lastElementChild;
        newSubject.classList.add('fade-in');
    }
    
    removeSubject(subjectId) {
        const subject = this.container.querySelector(`[data-subject-id="${subjectId}"]`);
        if (subject && this.container.children.length > 1) {
            subject.remove();
        } else if (this.container.children.length === 1) {
            Utils.showToast('At least one subject is required', 'warning');
        }
    }
    
    getSubjects() {
        const subjects = [];
        const subjectEntries = this.container.querySelectorAll('.subject-entry');
        
        subjectEntries.forEach(entry => {
            const nameInput = entry.querySelector('input[name*="[name]"]');
            const marksInput = entry.querySelector('input[name*="[marks]"]');
            const maxMarksInput = entry.querySelector('input[name*="[maxMarks]"]');
            
            if (nameInput && marksInput) {
                subjects.push({
                    name: nameInput.value.trim(),
                    marks: parseFloat(marksInput.value) || 0,
                    maxMarks: parseFloat(maxMarksInput.value) || 100
                });
            }
        });
        
        return subjects;
    }
    
    loadSubjects(subjects) {
        this.container.innerHTML = '';
        this.subjectCount = 0;
        
        if (subjects && subjects.length > 0) {
            subjects.forEach(subject => {
                this.addSubject(subject.name, subject.marks, subject.maxMarks);
            });
        } else {
            this.addSubject();
        }
    }
    
    validateSubjects() {
        const subjects = this.getSubjects();
        const errors = [];
        
        if (subjects.length === 0) {
            errors.push('At least one subject is required');
        }
        
        subjects.forEach((subject, index) => {
            if (!subject.name) {
                errors.push(`Subject ${index + 1}: Name is required`);
            }
            if (subject.marks < 0 || subject.marks > subject.maxMarks) {
                errors.push(`Subject ${index + 1}: Invalid marks`);
            }
        });
        
        return {
            isValid: errors.length === 0,
            errors: errors,
            subjects: subjects
        };
    }
}

// Global variables
let subjectManager;

// Initialize common functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Add fade-in animation to main content
    const mainContent = document.querySelector('.container');
    if (mainContent) {
        mainContent.classList.add('fade-in');
    }

    // Initialize tooltips if Bootstrap is available
    if (typeof bootstrap !== 'undefined') {
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }

    // Check API health on page load
    checkApiHealth();
});

// Check API health
async function checkApiHealth() {
    try {
        await ApiService.healthCheck();
        console.log('API is healthy');
    } catch (error) {
        console.error('API health check failed:', error);
        Utils.showToast('Unable to connect to server. Please check if the backend is running.', 'error');
    }
}
