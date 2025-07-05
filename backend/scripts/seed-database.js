const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load environment variables
dotenv.config();

// Import Student model
const Student = require('../models/Student');

// Connect to database
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

// Seed database with sample data
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    console.log('🗑️  Clearing existing student data...');
    await Student.deleteMany({});

    // Create minimal sample data for testing
    const sampleData = [
      {
        name: "Test Student",
        rollNumber: "TEST001",
        class: "10th",
        section: "A",
        email: "test@example.com",
        subjects: [
          { name: "Mathematics", marks: 85, maxMarks: 100 },
          { name: "Physics", marks: 78, maxMarks: 100 },
          { name: "Chemistry", marks: 92, maxMarks: 100 }
        ]
      }
    ];

    console.log(`📊 Creating ${sampleData.length} test student for verification...`);

    // Insert sample data
    const insertedStudents = await Student.insertMany(sampleData);

    console.log(`✅ Successfully inserted ${insertedStudents.length} test student!`);
    
    // Display summary
    console.log('\n📈 Database Summary:');
    console.log('==================');
    
    const totalStudents = await Student.countDocuments();
    console.log(`Total Students: ${totalStudents}`);
    
    // Group by class
    const classSummary = await Student.aggregate([
      {
        $group: {
          _id: '$class',
          count: { $sum: 1 },
          avgPercentage: { $avg: '$percentage' }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    console.log('\nBy Class:');
    classSummary.forEach(cls => {
      console.log(`  ${cls._id}: ${cls.count} students (Avg: ${Math.round(cls.avgPercentage)}%)`);
    });
    
    // Group by section
    const sectionSummary = await Student.aggregate([
      {
        $group: {
          _id: '$section',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    console.log('\nBy Section:');
    sectionSummary.forEach(sec => {
      console.log(`  Section ${sec._id}: ${sec.count} students`);
    });
    
    // Top performers
    const topPerformers = await Student.find()
      .sort({ percentage: -1 })
      .limit(3)
      .select('name rollNumber class percentage grade');
    
    console.log('\nTop Performers:');
    topPerformers.forEach((student, index) => {
      console.log(`  ${index + 1}. ${student.name} (${student.rollNumber}) - ${student.percentage}% (${student.grade})`);
    });
    
    console.log('\n🎉 Database seeding completed successfully!');
    console.log('🌐 You can now start the server and test the application.');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Clear database
const clearDatabase = async () => {
  try {
    console.log('🗑️  Clearing all student data...');
    const result = await Student.deleteMany({});
    console.log(`✅ Deleted ${result.deletedCount} students`);
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    process.exit(1);
  }
};

// Main function
const main = async () => {
  await connectDB();
  
  const command = process.argv[2];
  
  switch (command) {
    case 'seed':
      await seedDatabase();
      break;
    case 'clear':
      await clearDatabase();
      break;
    case 'reset':
      await clearDatabase();
      await seedDatabase();
      break;
    default:
      console.log('📖 Usage:');
      console.log('  npm run seed:test   - Add test student for verification');
      console.log('  npm run seed:clear  - Clear all student data');
      console.log('  npm run seed:reset  - Clear and re-add test data');
      console.log('');
      console.log('Or run directly:');
      console.log('  node scripts/seed-database.js seed');
      console.log('  node scripts/seed-database.js clear');
      console.log('  node scripts/seed-database.js reset');
      console.log('');
      console.log('Note: This is a production-ready system. Use seed:test only for verification.');
  }
  
  mongoose.connection.close();
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log('Unhandled Rejection:', err);
  mongoose.connection.close();
  process.exit(1);
});

// Run the script
main();
