// JavaScript for add.html - Add Student Page

// DOM Elements
const addStudentForm = document.getElementById('addStudentForm');
const submitBtn = document.getElementById('submitBtn');
const subjectsContainer = document.getElementById('subjectsContainer');
const addSubjectBtn = document.getElementById('addSubjectBtn');

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    initializeForm();
    setupEventListeners();
});

// Initialize form
function initializeForm() {
    // Initialize subject manager
    subjectManager = new SubjectManager(subjectsContainer, addSubjectBtn);
    
    // Set focus on first input
    const nameInput = document.getElementById('name');
    if (nameInput) {
        nameInput.focus();
    }
}

// Setup event listeners
function setupEventListeners() {
    // Form submission
    addStudentForm.addEventListener('submit', handleFormSubmit);
    
    // Real-time validation
    const inputs = addStudentForm.querySelectorAll('input, textarea');
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

// Validate individual field
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
        
        // Submit to API
        const response = await ApiService.createStudent(studentData);
        
        // Show success message
        Utils.showToast('Student added successfully!', 'success');
        
        // Redirect to student list or view page
        setTimeout(() => {
            window.location.href = `view.html?id=${response.data._id}`;
        }, 1500);
        
    } catch (error) {
        console.error('Error adding student:', error);
        
        // Handle specific errors
        if (error.message.includes('Roll number already exists')) {
            showFieldError(document.getElementById('rollNumber'), 'This roll number already exists');
        } else {
            Utils.showToast('Failed to add student: ' + error.message, 'error');
        }
        
        setSubmitButtonLoading(false);
    }
}

// Validate entire form
function validateForm() {
    const validator = new FormValidator(addStudentForm);
    
    // Get form data
    const formData = new FormData(addStudentForm);
    
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

// Collect form data
function collectFormData() {
    const formData = new FormData(addStudentForm);
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

// Set submit button loading state
function setSubmitButtonLoading(loading) {
    if (loading) {
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Saving...';
        submitBtn.disabled = true;
    } else {
        submitBtn.innerHTML = '<i class="fas fa-save me-2"></i>Save Student';
        submitBtn.disabled = false;
    }
}

// Auto-save draft functionality (optional)
function saveDraft() {
    try {
        const formData = collectFormData();
        localStorage.setItem('studentDraft', JSON.stringify(formData));
    } catch (error) {
        console.log('Could not save draft:', error);
    }
}

// Load draft functionality (optional)
function loadDraft() {
    try {
        const draft = localStorage.getItem('studentDraft');
        if (draft) {
            const data = JSON.parse(draft);
            
            // Fill basic fields
            document.getElementById('name').value = data.name || '';
            document.getElementById('rollNumber').value = data.rollNumber || '';
            document.getElementById('class').value = data.class || '';
            document.getElementById('section').value = data.section || '';
            document.getElementById('email').value = data.email || '';
            document.getElementById('phone').value = data.phone || '';
            document.getElementById('dateOfBirth').value = data.dateOfBirth || '';
            document.getElementById('address').value = data.address || '';
            
            // Load subjects
            if (data.subjects && data.subjects.length > 0) {
                subjectManager.loadSubjects(data.subjects);
            }
            
            Utils.showToast('Draft loaded', 'info');
        }
    } catch (error) {
        console.log('Could not load draft:', error);
    }
}

// Clear draft
function clearDraft() {
    localStorage.removeItem('studentDraft');
}

// Save draft periodically
setInterval(saveDraft, 30000); // Save every 30 seconds

// Load draft on page load
window.addEventListener('load', () => {
    const urlParams = new URLSearchParams(window.location.search);
    if (!urlParams.get('loadDraft') === 'false') {
        loadDraft();
    }
});

// Clear draft on successful submission
window.addEventListener('beforeunload', () => {
    // Only clear if form was successfully submitted
    if (submitBtn.disabled && submitBtn.innerHTML.includes('Saving')) {
        clearDraft();
    }
});
