const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');
const mongoose = require('mongoose');
const { Curriculum, Module, Lesson } = require('./models');

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/geography-curriculum');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Helper function to extract lesson information from text
const extractLessonInfo = (text, lessonNumber) => {
  // More robust content extraction
  const teacherContent = {
    objectives: extractAdvancedSection(text, ['objective', 'main idea', 'big idea'], lessonNumber),
    materials: extractAdvancedSection(text, ['materials', 'supplies', 'resources'], lessonNumber),
    vocabulary: extractVocabularyTerms(text, lessonNumber),
    procedures: extractAdvancedSection(text, ['procedure', 'teaching', 'instruction', 'activity'], lessonNumber),
    assessments: extractAssessments(text, lessonNumber),
    extensions: extractAdvancedSection(text, ['extension', 'enrichment', 'additional'], lessonNumber),
    notes: extractAdvancedSection(text, ['note', 'tip', 'reminder'], lessonNumber)
  };
  
  const studentContent = {
    activities: extractStudentActivities(text, lessonNumber),
    assignments: extractAdvancedSection(text, ['assignment', 'homework', 'project'], lessonNumber),
    readings: extractAdvancedSection(text, ['reading', 'text', 'passage'], lessonNumber),
    projects: extractAdvancedSection(text, ['project', 'research', 'investigation'], lessonNumber),
    worksheets: extractAdvancedSection(text, ['worksheet', 'handout', 'exercise'], lessonNumber)
  };
  
  // Extract lesson title more accurately
  const title = extractLessonTitle(text, lessonNumber);
  
  return {
    title: title,
    teacherContent,
    studentContent,
    rawText: text.substring(0, 2000) // Keep first 2000 chars for debugging
  };
};

// Extract lesson title with better pattern matching
const extractLessonTitle = (text, lessonNumber) => {
  const patterns = [
    new RegExp(`lesson\\s+${lessonNumber}\\s+big\\s+idea[\\s\\n]+([^\\n]+)`, 'i'),
    new RegExp(`lesson\\s+${lessonNumber}[:\\s]+([^\\n]+)`, 'i'),
    new RegExp(`lesson\\s+${lessonNumber}\\s+([^\\n]{10,80})`, 'i')
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return `Lesson ${lessonNumber}: ${match[1].trim()}`;
    }
  }
  
  return `Lesson ${lessonNumber}`;
};

// Advanced section extraction with context awareness
const extractAdvancedSection = (text, keywords, lessonNumber) => {
  const content = [];
  const lines = text.split('\\n');
  
  // Look for section headers followed by content
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase().trim();
    
    // Check if this line contains any of our keywords
    const isHeader = keywords.some(keyword => {
      return line.includes(keyword) && (
        line.endsWith(':') || 
        line.endsWith(keyword) || 
        line.length < 50 // Short lines are likely headers
      );
    });
    
    if (isHeader) {
      // Extract content from following lines
      for (let j = i + 1; j < lines.length && j < i + 15; j++) {
        const contentLine = lines[j].trim();
        
        // Stop if we hit another section header or lesson boundary
        if (contentLine.length === 0) continue;
        if (contentLine.toLowerCase().match(/^(lesson|chapter|section|page|materials|objective|procedure|assessment|activity)/)) {
          break;
        }
        
        // Clean and add meaningful content
        if (contentLine.length > 15 && !contentLine.match(/^\\d+\\.?$/)) {
          // Remove bullet points and clean formatting
          const cleanedLine = contentLine
            .replace(/^[•\\-\\*]\\s*/, '')
            .replace(/^\\d+\\.\\s*/, '')
            .replace(/\\s+/g, ' ')
            .trim();
          
          if (cleanedLine.length > 10) {
            content.push(cleanedLine);
          }
        }
      }
    }
  }
  
  // Also look for bulleted lists related to our keywords
  const bulletPattern = new RegExp(`(${keywords.join('|')})[\\s\\S]{0,200}?([•\\-\\*]\\s*[^\\n]+)`, 'gi');
  const bulletMatches = text.match(bulletPattern);
  
  if (bulletMatches) {
    bulletMatches.forEach(match => {
      const bullets = match.match(/[•\\-\\*]\\s*([^\\n]+)/g);
      if (bullets) {
        bullets.forEach(bullet => {
          const cleaned = bullet.replace(/^[•\\-\\*]\\s*/, '').trim();
          if (cleaned.length > 10 && !content.includes(cleaned)) {
            content.push(cleaned);
          }
        });
      }
    });
  }
  
  return content.slice(0, 10); // Limit to 10 items per section
};

// Extract vocabulary terms and definitions
const extractVocabularyTerms = (text, lessonNumber) => {
  const vocabulary = [];
  
  // Look for vocabulary sections
  const vocabPattern = /vocabulary[\\s\\S]{0,500}/gi;
  const vocabMatches = text.match(vocabPattern);
  
  if (vocabMatches) {
    vocabMatches.forEach(section => {
      // Look for term definition patterns
      const termPatterns = [
        /([A-Za-z\\s]+)\\s+([A-Za-z][^\\n]{20,})/g, // term followed by definition
        /•\\s*([A-Za-z\\s]+)[:\\-]\\s*([^\\n]+)/g,   // bulleted term: definition
        /([A-Z][a-z]+)\\s*[\\n\\s]+([a-z][^\\n]{15,})/g // Title case term followed by definition
      ];
      
      termPatterns.forEach(pattern => {
        let match;
        while ((match = pattern.exec(section)) !== null) {
          const term = match[1].trim();
          const definition = match[2].trim();
          
          if (term.length > 2 && term.length < 30 && definition.length > 10) {
            vocabulary.push(`${term}: ${definition}`);
          }
        }
      });
    });
  }
  
  return vocabulary.slice(0, 8); // Limit vocabulary terms
};

// Extract student activities with better context
const extractStudentActivities = (text, lessonNumber) => {
  const activities = [];
  
  // Look for activity sections
  const activityPatterns = [
    /activity[\\s\\S]{0,400}/gi,
    /student[s]?\\s+(work|activity|assignment)[\\s\\S]{0,300}/gi,
    /have\\s+students?[\\s\\S]{0,200}/gi
  ];
  
  activityPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach(match => {
        // Extract meaningful sentences about what students do
        const sentences = match.split(/[.!?]+/);
        sentences.forEach(sentence => {
          const cleaned = sentence.trim().replace(/\\s+/g, ' ');
          if (cleaned.length > 20 && cleaned.length < 200) {
            // Look for action-oriented sentences
            if (cleaned.match(/(student|have|ask|tell|explain|create|write|draw|discuss)/i)) {
              activities.push(cleaned);
            }
          }
        });
      });
    }
  });
  
  return activities.slice(0, 8); // Limit activities
};

// Extract assessment information
const extractAssessments = (text, lessonNumber) => {
  const assessments = [];
  
  // Look for assessment sections and questions
  const assessmentPatterns = [
    /assessment[\\s\\S]{0,400}/gi,
    /online\\s+assessment[\\s\\S]{0,300}/gi,
    /question[s]?[:\\s][\\s\\S]{0,200}/gi,
    /which\\s+of\\s+the\\s+following[\\s\\S]{0,150}/gi
  ];
  
  assessmentPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach(match => {
        // Extract questions and assessment descriptions
        const lines = match.split('\\n');
        lines.forEach(line => {
          const cleaned = line.trim().replace(/\\s+/g, ' ');
          if (cleaned.length > 15 && cleaned.length < 200) {
            // Look for question-like content or assessment descriptions
            if (cleaned.match(/(\\?|how|what|why|which|describe|explain|assessment|quiz|test)/i)) {
              assessments.push(cleaned);
            }
          }
        });
      });
    }
  });
  
  return assessments.slice(0, 6); // Limit assessments
};

// Extract content sections based on keywords
const extractSection = (text, keywords) => {
  const lines = text.split('\n');
  const content = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    
    // Check if line contains any of our keywords
    if (keywords.some(keyword => line.includes(keyword))) {
      // Extract following lines until we hit another section or empty lines
      for (let j = i + 1; j < lines.length && j < i + 10; j++) {
        const nextLine = lines[j].trim();
        if (nextLine.length > 0 && !nextLine.match(/^(lesson|chapter|section|page)/i)) {
          content.push(nextLine);
        } else {
          break;
        }
      }
    }
  }
  
  return content.filter(item => item.length > 10); // Filter out very short items
};

// Split PDF text into lessons
const splitIntoLessons = (text) => {
  // Look for actual lesson start markers - more precise pattern
  // Match "Lesson X Big Idea" or "Lesson X:" at start of line
  const lessonPattern = /^lesson\s+(\d+)\s+(big\s+idea|:|\s*$)/gim;
  const lessons = [];
  const lessonMatches = [...text.matchAll(lessonPattern)];
  
  console.log(`🔍 Found ${lessonMatches.length} lesson markers`);
  
  if (lessonMatches.length === 0) {
    console.log(`⚠️  No lesson markers found, trying alternative patterns...`);
    
    // Try alternative patterns for lesson starts
    const altPattern = /^(lesson\s+\d+|chapter\s+\d+)[\s\n]/gim;
    const altMatches = [...text.matchAll(altPattern)];
    
    if (altMatches.length > 0 && altMatches.length <= 20) {
      console.log(`📚 Found ${altMatches.length} alternative lesson markers`);
      // Use alternative matches
      for (let i = 0; i < altMatches.length; i++) {
        const currentMatch = altMatches[i];
        const nextMatch = altMatches[i + 1];
        
        const startIndex = currentMatch.index;
        const endIndex = nextMatch ? nextMatch.index : text.length;
        
        const lessonText = text.substring(startIndex, endIndex).trim();
        const lessonNumber = parseInt(currentMatch[0].match(/\d+/)[0]);
        
        if (lessonText.length > 200) { // Require substantial content
          lessons.push({
            number: lessonNumber,
            text: lessonText
          });
        }
      }
    } else {
      // Last resort: split by major section breaks
      console.log(`📄 No clear lesson structure, creating sections from content`);
      const sections = text.split(/\n\s*\n\s*\n/).filter(section => section.trim().length > 500);
      const maxSections = Math.min(sections.length, 10); // Limit to reasonable number
      
      for (let i = 0; i < maxSections; i++) {
        lessons.push({
          number: i + 1,
          text: sections[i].trim()
        });
      }
    }
  } else {
    // Split by lesson markers - but only take reasonable number
    const maxLessons = Math.min(lessonMatches.length, 20); // Cap at 20 lessons max
    console.log(`📚 Processing ${maxLessons} lessons (out of ${lessonMatches.length} matches)`);
    
    for (let i = 0; i < maxLessons; i++) {
      const currentMatch = lessonMatches[i];
      const nextMatch = lessonMatches[i + 1];
      
      const startIndex = currentMatch.index;
      const endIndex = nextMatch ? nextMatch.index : text.length;
      
      const lessonText = text.substring(startIndex, endIndex).trim();
      const lessonNumber = parseInt(currentMatch[1]);
      
      if (lessonText.length > 200) { // Require substantial content
        lessons.push({
          number: lessonNumber,
          text: lessonText
        });
      }
    }
  }
  
  // Remove duplicate lesson numbers
  const uniqueLessons = [];
  const seenNumbers = new Set();
  
  for (const lesson of lessons) {
    if (!seenNumbers.has(lesson.number)) {
      seenNumbers.add(lesson.number);
      uniqueLessons.push(lesson);
    }
  }
  
  return uniqueLessons.slice(0, 15); // Final safety cap - max 15 lessons per module
};

// Process a single PDF file
const processPDF = async (filePath, moduleNumber) => {
  try {
    console.log(`\n📖 Processing: ${path.basename(filePath)}`);
    
    // Check file size first
    const stats = fs.statSync(filePath);
    console.log(`📏 File size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
    
    if (stats.size === 0) {
      console.log(`❌ File is empty`);
      return null;
    }
    
    // Read and parse PDF with better error handling
    console.log(`📄 Reading PDF file...`);
    const dataBuffer = fs.readFileSync(filePath);
    console.log(`📝 Buffer size: ${(dataBuffer.length / 1024 / 1024).toFixed(2)} MB`);
    
    console.log(`🔍 Parsing PDF content...`);
    const pdfData = await pdf(dataBuffer);
    const text = pdfData.text;
    
    console.log(`📊 Extracted text length: ${text.length} characters`);
    console.log(`📄 PDF pages: ${pdfData.numpages || 'unknown'}`);
    
    if (text.length < 100) {
      console.log(`⚠️  PDF appears to be empty or unreadable (${text.length} chars)`);
      console.log(`🔍 First 200 chars: "${text.substring(0, 200)}"`);
      return null;
    }
    
    // Extract module title from filename
    const fileName = path.basename(filePath, '.pdf');
    const moduleTitle = fileName.replace(/Teacher Guide PDF/i, '').trim();
    console.log(`📖 Module title: "${moduleTitle}"`);
    
    // Split text into lessons
    console.log(`🔪 Splitting text into lessons...`);
    const lessons = splitIntoLessons(text);
    console.log(`📚 Found ${lessons.length} lessons`);
    
    if (lessons.length === 0) {
      console.log(`⚠️  No lessons found in PDF`);
      console.log(`🔍 Sample text (first 500 chars): "${text.substring(0, 500)}"`);
    }
    
    return {
      moduleNumber,
      title: moduleTitle,
      fileName: fileName,
      lessons: lessons.map(lesson => extractLessonInfo(lesson.text, lesson.number)),
      totalLessons: lessons.length
    };
    
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`);
    console.error(`   Message: ${error.message}`);
    console.error(`   Stack: ${error.stack}`);
    return null;
  }
};

// Main extraction function
const extractAllPDFs = async () => {
  try {
    console.log('🚀 Starting PDF extraction process...\n');
    
    // Connect to database
    await connectDB();
    
    // Clear existing data
    console.log('🧹 Clearing existing curriculum data...');
    await Lesson.deleteMany({});
    await Module.deleteMany({});
    await Curriculum.deleteMany({});
    
    // Create main curriculum document
    const curriculum = new Curriculum({
      title: 'World Geography Year-Long Curriculum',
      description: 'Comprehensive world geography curriculum extracted from PDF teacher guides'
    });
    await curriculum.save();
    console.log('✅ Created curriculum container');
    
    // Get all PDF files
    const pdfDir = path.join(__dirname, 'pdf files');
    const pdfFiles = fs.readdirSync(pdfDir)
      .filter(file => file.toLowerCase().endsWith('.pdf'))
      .sort(); // Sort alphabetically for consistent ordering
    
    console.log(`📁 Found ${pdfFiles.length} PDF files\n`);
    
    let totalLessons = 0;
    
    // Process each PDF
    for (let i = 0; i < pdfFiles.length; i++) {
      const moduleNumber = i + 1;
      const filePath = path.join(pdfDir, pdfFiles[i]);
      
      console.log(`\n🔄 Processing PDF ${moduleNumber}/${pdfFiles.length}: ${pdfFiles[i]}`);
      
      try {
        const moduleData = await processPDF(filePath, moduleNumber);
        
        if (moduleData) {
          console.log(`✅ Successfully processed: ${moduleData.title}`);
          
          // Create module document
          const module = new Module({
            curriculum: curriculum._id,
            moduleNumber: moduleData.moduleNumber,
            title: moduleData.title,
            pdfFileName: moduleData.fileName,
            totalLessons: moduleData.totalLessons
          });
          await module.save();
          console.log(`💾 Saved module to database`);
          
          // Create lesson documents
          console.log(`📝 Creating ${moduleData.lessons.length} lesson documents...`);
          for (const lessonData of moduleData.lessons) {
            const lesson = new Lesson({
              module: module._id,
              curriculum: curriculum._id,
              lessonNumber: lessonData.title.match(/\d+/) ? parseInt(lessonData.title.match(/\d+/)[0]) : 1,
              title: lessonData.title,
              teacherContent: lessonData.teacherContent,
              studentContent: lessonData.studentContent,
              rawText: lessonData.rawText
            });
            await lesson.save();
          }
          
          totalLessons += moduleData.totalLessons;
          console.log(`✅ Module ${moduleNumber}: ${moduleData.title} - ${moduleData.totalLessons} lessons`);
        } else {
          console.log(`❌ Failed to process module ${moduleNumber}`);
        }
      } catch (moduleError) {
        console.error(`❌ Error processing module ${moduleNumber}:`, moduleError.message);
        console.error(`   Stack: ${moduleError.stack}`);
        // Continue with next PDF instead of stopping
        continue;
      }
    }
    
    // Update curriculum totals
    curriculum.totalModules = pdfFiles.length;
    curriculum.totalLessons = totalLessons;
    await curriculum.save();
    
    console.log(`\n🎉 Extraction complete!`);
    console.log(`📊 Total Modules: ${pdfFiles.length}`);
    console.log(`📊 Total Lessons: ${totalLessons}`);
    console.log(`📊 Average Lessons per Module: ${Math.round(totalLessons / pdfFiles.length)}`);
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Extraction failed:', error);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  extractAllPDFs();
}

module.exports = { extractAllPDFs };
