const mongoose = require('mongoose');

// Subject schema for embedded documents
const subjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Subject name is required'],
    trim: true
  },
  marks: {
    type: Number,
    required: [true, 'Marks are required'],
    min: [0, 'Marks cannot be negative'],
    max: [100, 'Marks cannot exceed 100']
  },
  maxMarks: {
    type: Number,
    default: 100,
    min: [1, 'Maximum marks must be at least 1']
  }
}, { _id: true });

// Main student schema
const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Student name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  rollNumber: {
    type: String,
    required: [true, 'Roll number is required'],
    unique: true,
    trim: true,
    uppercase: true,
    match: [/^[A-Z0-9]+$/, 'Roll number can only contain letters and numbers']
  },
  class: {
    type: String,
    required: [true, 'Class is required'],
    trim: true,
    maxlength: [20, 'Class cannot exceed 20 characters']
  },
  section: {
    type: String,
    required: [true, 'Section is required'],
    trim: true,
    uppercase: true,
    maxlength: [5, 'Section cannot exceed 5 characters']
  },
  subjects: {
    type: [subjectSchema],
    validate: {
      validator: function(subjects) {
        return subjects && subjects.length > 0;
      },
      message: 'At least one subject is required'
    }
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    trim: true,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
  },
  dateOfBirth: {
    type: Date
  },
  address: {
    type: String,
    trim: true,
    maxlength: [200, 'Address cannot exceed 200 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for calculating total marks
studentSchema.virtual('totalMarks').get(function() {
  if (!this.subjects || this.subjects.length === 0) return 0;
  return this.subjects.reduce((total, subject) => total + subject.marks, 0);
});

// Virtual for calculating maximum possible marks
studentSchema.virtual('maxTotalMarks').get(function() {
  if (!this.subjects || this.subjects.length === 0) return 0;
  return this.subjects.reduce((total, subject) => total + subject.maxMarks, 0);
});

// Virtual for calculating percentage
studentSchema.virtual('percentage').get(function() {
  const maxTotal = this.maxTotalMarks;
  if (maxTotal === 0) return 0;
  return Math.round((this.totalMarks / maxTotal) * 100 * 100) / 100; // Round to 2 decimal places
});

// Virtual for calculating grade (Karachi University Grading System)
studentSchema.virtual('grade').get(function() {
  const percentage = this.percentage;
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
});

// Virtual for calculating grade point (Karachi University System)
studentSchema.virtual('gradePoint').get(function() {
  const percentage = this.percentage;
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
});

// Virtual for full name display
studentSchema.virtual('displayName').get(function() {
  return `${this.name} (${this.rollNumber})`;
});

// Index for better query performance
studentSchema.index({ rollNumber: 1 });
studentSchema.index({ class: 1, section: 1 });
studentSchema.index({ name: 1 });

// Pre-save middleware to ensure roll number uniqueness
studentSchema.pre('save', async function(next) {
  if (this.isModified('rollNumber')) {
    const existingStudent = await this.constructor.findOne({ 
      rollNumber: this.rollNumber,
      _id: { $ne: this._id }
    });
    if (existingStudent) {
      const error = new Error('Roll number already exists');
      error.code = 11000;
      return next(error);
    }
  }
  next();
});

// Static method to find students by class and section
studentSchema.statics.findByClassSection = function(className, section) {
  return this.find({ class: className, section: section }).sort({ rollNumber: 1 });
};

// Static method to get class statistics
studentSchema.statics.getClassStats = async function(className, section) {
  const students = await this.findByClassSection(className, section);
  if (students.length === 0) return null;

  const totalStudents = students.length;
  const totalPercentage = students.reduce((sum, student) => sum + student.percentage, 0);
  const averagePercentage = totalPercentage / totalStudents;

  const gradeDistribution = students.reduce((acc, student) => {
    acc[student.grade] = (acc[student.grade] || 0) + 1;
    return acc;
  }, {});

  return {
    totalStudents,
    averagePercentage: Math.round(averagePercentage * 100) / 100,
    gradeDistribution,
    topPerformer: students.reduce((top, student) => 
      student.percentage > top.percentage ? student : top
    )
  };
};

// Instance method to add subject
studentSchema.methods.addSubject = function(subjectData) {
  this.subjects.push(subjectData);
  return this.save();
};

// Instance method to update subject marks
studentSchema.methods.updateSubjectMarks = function(subjectId, newMarks) {
  const subject = this.subjects.id(subjectId);
  if (subject) {
    subject.marks = newMarks;
    return this.save();
  }
  throw new Error('Subject not found');
};

module.exports = mongoose.model('Student', studentSchema);
