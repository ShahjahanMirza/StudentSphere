// JavaScript for edit.html - Edit Student Page

// DOM Elements
const loadingSpinner = document.getElementById('loadingSpinner');
const editFormContainer = document.getElementById('editFormContainer');
const errorMessage = document.getElementById('errorMessage');
const editStudentForm = document.getElementById('editStudentForm');
const submitBtn = document.getElementById('submitBtn');
const subjectsContainer = document.getElementById('subjectsContainer');
const addSubjectBtn = document.getElementById('addSubjectBtn');

// Global variables
let studentId = null;
let originalStudent = null;

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
    // Form submission
    editStudentForm.addEventListener('submit', handleFormSubmit);
    
    // Real-time validation
    const inputs = editStudentForm.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', clearFieldError);
    });
    
    // Roll number formatting
    const rollNumberInput = document.getElementById('rollNumber');
    rollNumberInput.addEventListener('input', function() {
        this.value = this.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    });
    
    // Section formatting
    const sectionInput = document.getElementById('section');
    sectionInput.addEventListener('input', function() {
        this.value = this.value.toUpperCase().replace(/[^A-Z]/g, '');
    });
}

// Load student data
async function loadStudent() {
    try {
        showLoading();
        
        const response = await ApiService.getStudent(studentId);
        originalStudent = response.data;
        
        populateForm(originalStudent);
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
    Utils.hide(editFormContainer);
    Utils.hide(errorMessage);
}

// Hide loading state
function hideLoading() {
    Utils.hide(loadingSpinner);
    Utils.show(editFormContainer);
}

// Show error message
function showError(message) {
    Utils.hide(loadingSpinner);
    Utils.hide(editFormContainer);
    Utils.show(errorMessage);
    
    const errorText = document.getElementById('errorText');
    errorText.textContent = message;
}

// Populate form with student data
function populateForm(student) {
    // Initialize subject manager
    subjectManager = new SubjectManager(subjectsContainer, addSubjectBtn);
    
    // Populate basic fields
    document.getElementById('name').value = student.name || '';
    document.getElementById('rollNumber').value = student.rollNumber || '';
    document.getElementById('class').value = student.class || '';
    document.getElementById('section').value = student.section || '';
    
    // Populate optional fields
    document.getElementById('email').value = student.email || '';
    document.getElementById('phone').value = student.phone || '';
    document.getElementById('address').value = student.address || '';
    
    // Handle date of birth
    if (student.dateOfBirth) {
        document.getElementById('dateOfBirth').value = Utils.formatDateForInput(student.dateOfBirth);
    }
    
    // Load subjects
    subjectManager.loadSubjects(student.subjects || []);
    
    // Add fade-in animation
    editFormContainer.classList.add('fade-in');
}

// Validate individual field (same as add.js)
function validateField(event) {
    const field = event.target;
    const value = field.value.trim();
    const fieldName = field.name;
    
    // Clear previous error
    field.classList.remove('is-invalid');
    
    // Validate based on field type
    switch (fieldName) {
        case 'name':
            if (!value) {
                showFieldError(field, 'Name is required');
            } else if (value.length < 2) {
                showFieldError(field, 'Name must be at least 2 characters');
            }
            break;
            
        case 'rollNumber':
            if (!value) {
                showFieldError(field, 'Roll number is required');
            } else if (!/^[A-Z0-9]+$/.test(value)) {
                showFieldError(field, 'Roll number can only contain letters and numbers');
            }
            break;
            
        case 'class':
            if (!value) {
                showFieldError(field, 'Class is required');
            }
            break;
            
        case 'section':
            if (!value) {
                showFieldError(field, 'Section is required');
            }
            break;
            
        case 'email':
            if (value && !Utils.isValidEmail(value)) {
                showFieldError(field, 'Please enter a valid email address');
            }
            break;
            
        case 'phone':
            if (value && !Utils.isValidPhone(value)) {
                showFieldError(field, 'Please enter a valid phone number');
            }
            break;
    }
}

// Show field error
function showFieldError(field, message) {
    field.classList.add('is-invalid');
    const feedback = field.parentNode.querySelector('.invalid-feedback');
    if (feedback) {
        feedback.textContent = message;
    }
}

// Clear field error
function clearFieldError(event) {
    const field = event.target;
    field.classList.remove('is-invalid');
}

// Handle form submission
async function handleFormSubmit(event) {
    event.preventDefault();
    
    // Validate form
    const validation = validateForm();
    if (!validation.isValid) {
        Utils.showToast('Please fix the errors in the form', 'error');
        return;
    }
    
    try {
        // Show loading state
        setSubmitButtonLoading(true);
        
        // Prepare student data
        const studentData = collectFormData();
        
        // Check if data has changed
        if (!hasDataChanged(studentData)) {
            Utils.showToast('No changes detected', 'info');
            setSubmitButtonLoading(false);
            return;
        }
        
        // Submit to API
        const response = await ApiService.updateStudent(studentId, studentData);
        
        // Show success message
        Utils.showToast('Student updated successfully!', 'success');
        
        // Redirect to view page
        setTimeout(() => {
            window.location.href = `view.html?id=${studentId}`;
        }, 1500);
        
    } catch (error) {
        console.error('Error updating student:', error);
        
        // Handle specific errors
        if (error.message.includes('Roll number already exists')) {
            showFieldError(document.getElementById('rollNumber'), 'This roll number already exists');
        } else {
            Utils.showToast('Failed to update student: ' + error.message, 'error');
        }
        
        setSubmitButtonLoading(false);
    }
}

// Validate entire form (same as add.js)
function validateForm() {
    const validator = new FormValidator(editStudentForm);
    
    // Get form data
    const formData = new FormData(editStudentForm);
    
    // Validate basic fields
    validator.validateRequired('name', formData.get('name'));
    validator.validateRequired('rollNumber', formData.get('rollNumber'));
    validator.validateRequired('class', formData.get('class'));
    validator.validateRequired('section', formData.get('section'));
    
    // Validate optional fields
    const email = formData.get('email');
    if (email) {
        validator.validateEmail('email', email);
    }
    
    const phone = formData.get('phone');
    if (phone) {
        validator.validatePhone('phone', phone);
    }
    
    // Validate subjects
    const subjectValidation = subjectManager.validateSubjects();
    if (!subjectValidation.isValid) {
        const subjectsError = document.getElementById('subjectsError');
        subjectsError.style.display = 'block';
        subjectsError.textContent = subjectValidation.errors.join(', ');
        validator.errors.subjects = subjectValidation.errors.join(', ');
    } else {
        const subjectsError = document.getElementById('subjectsError');
        subjectsError.style.display = 'none';
    }
    
    // Show validation errors
    validator.showErrors();
    
    return {
        isValid: validator.isValid() && subjectValidation.isValid,
        subjects: subjectValidation.subjects
    };
}

// Collect form data (same as add.js)
function collectFormData() {
    const formData = new FormData(editStudentForm);
    const subjectValidation = subjectManager.validateSubjects();
    
    const studentData = {
        name: formData.get('name').trim(),
        rollNumber: formData.get('rollNumber').trim().toUpperCase(),
        class: formData.get('class').trim(),
        section: formData.get('section').trim().toUpperCase(),
        subjects: subjectValidation.subjects
    };
    
    // Add optional fields if provided
    const email = formData.get('email');
    if (email && email.trim()) {
        studentData.email = email.trim().toLowerCase();
    }
    
    const phone = formData.get('phone');
    if (phone && phone.trim()) {
        studentData.phone = phone.trim();
    }
    
    const dateOfBirth = formData.get('dateOfBirth');
    if (dateOfBirth) {
        studentData.dateOfBirth = dateOfBirth;
    }
    
    const address = formData.get('address');
    if (address && address.trim()) {
        studentData.address = address.trim();
    }
    
    return studentData;
}

// Check if data has changed
function hasDataChanged(newData) {
    if (!originalStudent) return true;
    
    // Compare basic fields
    const fieldsToCompare = ['name', 'rollNumber', 'class', 'section', 'email', 'phone', 'address', 'dateOfBirth'];
    
    for (const field of fieldsToCompare) {
        const originalValue = originalStudent[field] || '';
        const newValue = newData[field] || '';
        
        if (originalValue !== newValue) {
            return true;
        }
    }
    
    // Compare subjects
    const originalSubjects = originalStudent.subjects || [];
    const newSubjects = newData.subjects || [];
    
    if (originalSubjects.length !== newSubjects.length) {
        return true;
    }
    
    for (let i = 0; i < originalSubjects.length; i++) {
        const original = originalSubjects[i];
        const updated = newSubjects[i];
        
        if (original.name !== updated.name || 
            original.marks !== updated.marks || 
            original.maxMarks !== updated.maxMarks) {
            return true;
        }
    }
    
    return false;
}

// Set submit button loading state
function setSubmitButtonLoading(loading) {
    if (loading) {
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Updating...';
        submitBtn.disabled = true;
    } else {
        submitBtn.innerHTML = '<i class="fas fa-save me-2"></i>Update Student';
        submitBtn.disabled = false;
    }
}
