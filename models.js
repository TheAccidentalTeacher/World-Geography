const mongoose = require('mongoose');

// Curriculum Schema - Main container
const CurriculumSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  totalModules: { type: Number, default: 0 },
  totalLessons: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Module Schema - Geographic regions/topics
const ModuleSchema = new mongoose.Schema({
  curriculum: { type: mongoose.Schema.Types.ObjectId, ref: 'Curriculum', required: true },
  moduleNumber: { type: Number, required: true },
  title: { type: String, required: true },
  description: String,
  region: String, // e.g., "North America", "Europe", etc.
  pdfFileName: String,
  totalLessons: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

// Lesson Schema - Individual lessons within modules
const LessonSchema = new mongoose.Schema({
  module: { type: mongoose.Schema.Types.ObjectId, ref: 'Module', required: true },
  curriculum: { type: mongoose.Schema.Types.ObjectId, ref: 'Curriculum', required: true },
  lessonNumber: { type: Number, required: true },
  title: { type: String, required: true },
  
  // Teacher Information
  teacherContent: {
    objectives: [String],
    materials: [String],
    vocabulary: [String],
    procedures: [String],
    assessments: [String],
    extensions: [String],
    notes: [String]  // Changed from String to [String] to match extractSection output
  },
  
  // Student Information  
  studentContent: {
    activities: [String],
    assignments: [String],
    readings: [String],
    projects: [String],
    worksheets: [String]
  },
  
  // Metadata
  estimatedTime: String,
  gradeLevel: String,
  standards: [String],
  rawText: String, // Full extracted text for reference
  createdAt: { type: Date, default: Date.now }
});

// Create indexes for better performance
ModuleSchema.index({ curriculum: 1, moduleNumber: 1 });
LessonSchema.index({ module: 1, lessonNumber: 1 });
LessonSchema.index({ curriculum: 1 });

module.exports = {
  Curriculum: mongoose.model('Curriculum', CurriculumSchema),
  Module: mongoose.model('Module', ModuleSchema),
  Lesson: mongoose.model('Lesson', LessonSchema)
};
