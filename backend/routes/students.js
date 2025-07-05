const express = require('express');
const router = express.Router();
const Student = require('../models/Student');

// @desc    Get all students
// @route   GET /api/students
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { class: className, section, search, sortBy = 'rollNumber', order = 'asc' } = req.query;
    
    // Build query object
    let query = {};
    
    if (className) {
      query.class = className;
    }
    
    if (section) {
      query.section = section.toUpperCase();
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { rollNumber: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Build sort object
    const sortOrder = order === 'desc' ? -1 : 1;
    const sortObj = {};
    sortObj[sortBy] = sortOrder;
    
    const students = await Student.find(query).sort(sortObj);
    
    res.json({
      success: true,
      count: students.length,
      data: students
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
});

// @desc    Get single student
// @route   GET /api/students/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    
    res.json({
      success: true,
      data: student
    });
  } catch (error) {
    console.error('Error fetching student:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid student ID format'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
});

// @desc    Create new student
// @route   POST /api/students
// @access  Public
router.post('/', async (req, res) => {
  try {
    const studentData = req.body;
    
    // Validate required fields
    const requiredFields = ['name', 'rollNumber', 'class', 'section', 'subjects'];
    const missingFields = requiredFields.filter(field => !studentData[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }
    
    // Validate subjects array
    if (!Array.isArray(studentData.subjects) || studentData.subjects.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one subject is required'
      });
    }
    
    // Validate each subject
    for (let i = 0; i < studentData.subjects.length; i++) {
      const subject = studentData.subjects[i];
      if (!subject.name || typeof subject.marks !== 'number') {
        return res.status(400).json({
          success: false,
          message: `Subject ${i + 1}: name and marks are required`
        });
      }
    }
    
    const student = await Student.create(studentData);
    
    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      data: student
    });
  } catch (error) {
    console.error('Error creating student:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Roll number already exists'
      });
    }
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: messages
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
});

// @desc    Update student
// @route   PUT /api/students/:id
// @access  Public
router.put('/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    
    // Update student with new data
    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    
    res.json({
      success: true,
      message: 'Student updated successfully',
      data: updatedStudent
    });
  } catch (error) {
    console.error('Error updating student:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid student ID format'
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Roll number already exists'
      });
    }
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: messages
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
});

// @desc    Delete student
// @route   DELETE /api/students/:id
// @access  Public
router.delete('/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    
    await Student.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: 'Student deleted successfully',
      data: student
    });
  } catch (error) {
    console.error('Error deleting student:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid student ID format'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
});

// @desc    Get class statistics
// @route   GET /api/students/stats/:class/:section
// @access  Public
router.get('/stats/:class/:section', async (req, res) => {
  try {
    const { class: className, section } = req.params;
    const stats = await Student.getClassStats(className, section.toUpperCase());
    
    if (!stats) {
      return res.status(404).json({
        success: false,
        message: 'No students found for this class and section'
      });
    }
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching class stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
});

module.exports = router;
