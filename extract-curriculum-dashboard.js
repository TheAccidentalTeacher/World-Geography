const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');
const { Curriculum, Module, Lesson } = require('./models');
const { schoolCalendar, calendarUtils } = require('./calendar-config');

// Comprehensive curriculum extraction for daily dashboard
class CurriculumExtractor {
  constructor() {
    this.pdfDir = path.join(__dirname, 'pdf files');
    this.studentPdfDir = path.join(__dirname, 'student readings');
    this.moduleMap = new Map();
    this.lessonSequence = [];
  }

  // Main extraction method
  async extractAllCurriculumData() {
    console.log('🚀 Starting comprehensive curriculum extraction...');
    
    try {
      // Step 1: Extract teacher guide content
      await this.extractTeacherGuides();
      
      // Step 2: Extract student reading content
      await this.extractStudentReadings();
      
      // Step 3: Create lesson sequence for daily dashboard
      await this.createLessonSequence();
      
      // Step 4: Map lessons to school calendar
      await this.mapLessonsToCalendar();
      
      console.log('✅ Comprehensive extraction complete!');
      return this.generateExtractionReport();
      
    } catch (error) {
      console.error('❌ Extraction failed:', error);
      throw error;
    }
  }

  // Extract content from teacher guide PDFs
  async extractTeacherGuides() {
    console.log('📚 Extracting teacher guide content...');
    
    if (!fs.existsSync(this.pdfDir)) {
      throw new Error(`Teacher guides directory not found: ${this.pdfDir}`);
    }

    const pdfFiles = fs.readdirSync(this.pdfDir).filter(file => file.endsWith('.pdf'));
    console.log(`📄 Found ${pdfFiles.length} teacher guide PDFs`);

    for (const pdfFile of pdfFiles) {
      const filePath = path.join(this.pdfDir, pdfFile);
      console.log(`\n🔍 Processing: ${pdfFile}`);
      
      try {
        const moduleData = await this.extractModuleFromPDF(filePath, pdfFile);
        this.moduleMap.set(moduleData.moduleNumber, moduleData);
        
        console.log(`✅ Extracted module: ${moduleData.title} (${moduleData.lessons.length} lessons)`);
        
      } catch (error) {
        console.error(`❌ Failed to process ${pdfFile}:`, error.message);
      }
    }
    
    console.log(`📊 Total modules extracted: ${this.moduleMap.size}`);
  }

  // Extract individual module data from PDF
  async extractModuleFromPDF(filePath, fileName) {
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdf(dataBuffer);
    const text = pdfData.text;

    // Determine module info from filename
    const moduleInfo = this.parseModuleFromFilename(fileName);
    
    // Extract lessons from PDF content
    const lessons = this.extractLessonsFromText(text, moduleInfo);
    
    return {
      ...moduleInfo,
      lessons,
      originalText: text,
      pageCount: pdfData.numpages,
      extractedAt: new Date()
    };
  }

  // Parse module information from filename
  parseModuleFromFilename(fileName) {
    // Map filenames to module numbers based on our lesson mapping
    const moduleMapping = {
      "A Geographer_s World Teacher Guide PDF.pdf": { number: 1, title: "A Geographer's World" },
      "The Physical World Teacher Guide PDF.pdf": { number: 2, title: "The Physical World" },
      "The Human World Teacher Guide PDF.pdf": { number: 3, title: "The Human World" },
      "The United States Teacher Guide PDF.pdf": { number: 4, title: "The United States" },
      "Canada Teacher Guide PDF.pdf": { number: 5, title: "Canada" },
      "Mexico Teacher Guide PDF.pdf": { number: 6, title: "Mexico" },
      "Central America and the Caribbean Teacher Guide PDF.pdf": { number: 7, title: "Central America and the Caribbean" },
      "South America Teacher Guide PDF.pdf": { number: 8, title: "South America" },
      "Western Europe Teacher Guide PDF.pdf": { number: 9, title: "Western Europe" },
      "Southern Europe Teacher Guide PDF.pdf": { number: 10, title: "Southern Europe" },
      "Eastern Europe Teacher Guide PDF.pdf": { number: 11, title: "Eastern Europe" },
      "Russia and the Caucasus Teacher Guide PDF.pdf": { number: 12, title: "Russia and the Caucasus" },
      "North Africa Teacher Guide PDF.pdf": { number: 13, title: "North Africa" },
      "West and Central Africa Teacher Guide PDF.pdf": { number: 14, title: "West and Central Africa" },
      "East and Southern Africa Teacher Guide PDF.pdf": { number: 15, title: "East and Southern Africa" },
      "The Eastern Mediterranean Teacher Guide PDF.pdf": { number: 16, title: "The Eastern Mediterranean" },
      "The Arabian Peninsula to Central Asia Teacher Guide PDF.pdf": { number: 17, title: "The Arabian Peninsula to Central Asia" },
      "The Indian Subcontinent Teacher Guide PDF.pdf": { number: 18, title: "The Indian Subcontinent" },
      "China, Mongolia, and Taiwan Teacher Guide PDF.pdf": { number: 19, title: "China, Mongolia, and Taiwan" },
      "Japan and the Koreas Teacher Guide PDF.pdf": { number: 20, title: "Japan and the Koreas" },
      "Southeast Asia Teacher Guide PDF.pdf": { number: 21, title: "Southeast Asia" },
      "Oceania and Antarctica Teacher Guide PDF.pdf": { number: 22, title: "Oceania and Antarctica" },
      "Early Civilizations of the Fertile Crescent and the Nile Valley Teacher Guide PDF.pdf": { number: 23, title: "Early Civilizations of the Fertile Crescent and the Nile Valley" },
      "Indian Early Civilizations, Empires, and World Religions Teacher Guide PDF.pdf": { number: 24, title: "Indian Early Civilizations, Empires, and World Religions" },
      "Early Civilizations of China Teacher Guide PDF.pdf": { number: 25, title: "Early Civilizations of China" },
      "Early Civilizations of Latin America Teacher Guide PDF.pdf": { number: 26, title: "Early Civilizations of Latin America" },
      "World Religions of Southwest Asia Teacher Guide PDF.pdf": { number: 27, title: "World Religions of Southwest Asia" },
      "Europe before the 1700s Teacher Guide PDF.pdf": { number: 28, title: "Europe before the 1700s" },
      "History of Modern Europe Teacher Guide PDF.pdf": { number: 29, title: "History of Modern Europe" },
      "History of Sub-Saharan Africa Teacher Guide PDF.pdf": { number: 30, title: "History of Sub-Saharan Africa" },
      "Government and Citizenship Teacher Guide PDF.pdf": { number: 31, title: "Government and Citizenship" },
      "Economics Teacher Guide PDF.pdf": { number: 32, title: "Economics" }
    };

    return moduleMapping[fileName] || { 
      number: 99, 
      title: fileName.replace(/_/g, ' ').replace(' Teacher Guide PDF.pdf', ''),
      moduleNumber: 99
    };
  }

  // Extract individual lessons from PDF text
  extractLessonsFromText(text, moduleInfo) {
    const lessons = [];
    
    // Split text into sections that might represent lessons
    const sections = this.splitIntoLessonSections(text);
    
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      const lesson = this.parseLessonFromSection(section, i + 1, moduleInfo);
      
      if (lesson) {
        lessons.push(lesson);
      }
    }

    // If no clear lessons found, create default lessons
    if (lessons.length === 0) {
      lessons.push(...this.createDefaultLessons(moduleInfo));
    }

    return lessons;
  }

  // Split PDF text into potential lesson sections
  splitIntoLessonSections(text) {
    // Look for common lesson indicators
    const lessonIndicators = [
      /lesson\s+\d+/gi,
      /section\s+\d+/gi,
      /chapter\s+\d+/gi,
      /activity\s+\d+/gi,
      /part\s+\d+/gi
    ];

    let sections = [text]; // Start with full text

    for (const indicator of lessonIndicators) {
      const matches = text.match(indicator);
      if (matches && matches.length > 1) {
        // Split by this indicator
        sections = text.split(indicator).filter(section => section.trim().length > 100);
        break;
      }
    }

    // If still just one section, try to split by common patterns
    if (sections.length === 1) {
      // Try splitting by objectives sections
      if (text.includes('Objectives') || text.includes('OBJECTIVES')) {
        sections = text.split(/objectives?/gi).filter(section => section.trim().length > 100);
      }
    }

    // Limit to reasonable number of sections
    return sections.slice(0, 8);
  }

  // Parse lesson information from a text section
  parseLessonFromSection(sectionText, lessonNumber, moduleInfo) {
    const lesson = {
      lessonNumber,
      title: this.extractLessonTitle(sectionText, lessonNumber, moduleInfo),
      objectives: this.extractObjectives(sectionText),
      vocabulary: this.extractVocabulary(sectionText),
      materials: this.extractMaterials(sectionText),
      procedures: this.extractProcedures(sectionText),
      assessments: this.extractAssessments(sectionText),
      activities: this.extractActivities(sectionText),
      timeEstimate: this.extractTimeEstimate(sectionText),
      difficulty: this.estimateDifficulty(sectionText),
      topics: this.extractTopics(sectionText)
    };

    return lesson;
  }

  // Extract lesson title from section
  extractLessonTitle(text, lessonNumber, moduleInfo) {
    // Look for title patterns
    const titlePatterns = [
      /lesson\s+\d+[:\-]\s*([^\n]+)/gi,
      /section\s+\d+[:\-]\s*([^\n]+)/gi,
      /chapter\s+\d+[:\-]\s*([^\n]+)/gi
    ];

    for (const pattern of titlePatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    // Generate title based on module and lesson number
    return `${moduleInfo.title} - Lesson ${lessonNumber}`;
  }

  // Extract learning objectives
  extractObjectives(text) {
    const objectives = [];
    const objectivePatterns = [
      /objectives?[:\-\s]*([^\.]+)/gi,
      /students will[:\-\s]*([^\.]+)/gi,
      /learning goals?[:\-\s]*([^\.]+)/gi
    ];

    for (const pattern of objectivePatterns) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        if (match[1]) {
          const objectiveText = match[1].trim();
          if (objectiveText.length > 10 && objectiveText.length < 200) {
            objectives.push(objectiveText);
          }
        }
      }
    }

    return objectives.slice(0, 5); // Limit to 5 objectives
  }

  // Extract vocabulary terms
  extractVocabulary(text) {
    const vocabulary = [];
    const vocabPatterns = [
      /vocabulary[:\-\s]*([^\.]+)/gi,
      /key terms?[:\-\s]*([^\.]+)/gi,
      /definitions?[:\-\s]*([^\.]+)/gi
    ];

    for (const pattern of vocabPatterns) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        if (match[1]) {
          const terms = match[1].split(/[,;\n]/).map(term => term.trim()).filter(term => term.length > 2);
          vocabulary.push(...terms);
        }
      }
    }

    return vocabulary.slice(0, 10); // Limit to 10 terms
  }

  // Extract materials needed
  extractMaterials(text) {
    const materials = [];
    const materialPatterns = [
      /materials?[:\-\s]*([^\.]+)/gi,
      /supplies?[:\-\s]*([^\.]+)/gi,
      /resources?[:\-\s]*([^\.]+)/gi
    ];

    for (const pattern of materialPatterns) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        if (match[1]) {
          const items = match[1].split(/[,;\n]/).map(item => item.trim()).filter(item => item.length > 2);
          materials.push(...items);
        }
      }
    }

    return materials.slice(0, 8); // Limit to 8 materials
  }

  // Extract teaching procedures
  extractProcedures(text) {
    const procedures = [];
    const procedurePatterns = [
      /procedures?[:\-\s]*([^\.]+)/gi,
      /instructions?[:\-\s]*([^\.]+)/gi,
      /steps?[:\-\s]*([^\.]+)/gi
    ];

    for (const pattern of procedurePatterns) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        if (match[1]) {
          const steps = match[1].split(/[\.;\n]/).map(step => step.trim()).filter(step => step.length > 10);
          procedures.push(...steps);
        }
      }
    }

    return procedures.slice(0, 6); // Limit to 6 procedures
  }

  // Extract assessment information
  extractAssessments(text) {
    const assessments = [];
    const assessmentPatterns = [
      /assessment[:\-\s]*([^\.]+)/gi,
      /evaluation[:\-\s]*([^\.]+)/gi,
      /quiz[:\-\s]*([^\.]+)/gi,
      /test[:\-\s]*([^\.]+)/gi
    ];

    for (const pattern of assessmentPatterns) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        if (match[1]) {
          const assessmentText = match[1].trim();
          if (assessmentText.length > 10) {
            assessments.push(assessmentText);
          }
        }
      }
    }

    return assessments.slice(0, 4); // Limit to 4 assessments
  }

  // Extract student activities
  extractActivities(text) {
    const activities = [];
    const activityPatterns = [
      /activit(y|ies)[:\-\s]*([^\.]+)/gi,
      /exercise[:\-\s]*([^\.]+)/gi,
      /task[:\-\s]*([^\.]+)/gi
    ];

    for (const pattern of activityPatterns) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        if (match[2]) {
          const activityText = match[2].trim();
          if (activityText.length > 10) {
            activities.push(activityText);
          }
        }
      }
    }

    return activities.slice(0, 5); // Limit to 5 activities
  }

  // Extract time estimate for lesson
  extractTimeEstimate(text) {
    const timePatterns = [
      /(\d+)\s*minutes?/gi,
      /(\d+)\s*hours?/gi,
      /(\d+)\s*days?/gi
    ];

    for (const pattern of timePatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[0];
      }
    }

    return '45 minutes'; // Default class period
  }

  // Estimate lesson difficulty
  estimateDifficulty(text) {
    const difficultyIndicators = {
      easy: /introduct|basic|simple|begin/gi,
      medium: /analyz|compar|evaluat|understand/gi,
      hard: /synthesiz|creat|design|complex/gi
    };

    let easyCount = (text.match(difficultyIndicators.easy) || []).length;
    let mediumCount = (text.match(difficultyIndicators.medium) || []).length;
    let hardCount = (text.match(difficultyIndicators.hard) || []).length;

    if (hardCount > easyCount && hardCount > mediumCount) return 'hard';
    if (mediumCount > easyCount) return 'medium';
    return 'easy';
  }

  // Extract main topics covered
  extractTopics(text) {
    const commonGeographyTopics = [
      'climate', 'weather', 'geography', 'culture', 'economy', 'government',
      'population', 'resources', 'trade', 'history', 'religion', 'language',
      'agriculture', 'industry', 'urbanization', 'migration', 'environment'
    ];

    const topics = [];
    for (const topic of commonGeographyTopics) {
      const regex = new RegExp(topic, 'gi');
      if (text.match(regex)) {
        topics.push(topic);
      }
    }

    return topics.slice(0, 6); // Limit to 6 topics
  }

  // Create default lessons when extraction fails
  createDefaultLessons(moduleInfo) {
    const defaultLessons = [
      {
        lessonNumber: 1,
        title: `Introduction to ${moduleInfo.title}`,
        objectives: [`Understand the geography of ${moduleInfo.title}`, 'Identify key features and characteristics'],
        vocabulary: ['geography', 'region', 'culture'],
        materials: ['textbook', 'maps', 'worksheets'],
        procedures: ['Introduction and overview', 'Map activity', 'Discussion'],
        assessments: ['participation', 'map quiz'],
        activities: ['map labeling', 'research project'],
        timeEstimate: '45 minutes',
        difficulty: 'medium',
        topics: ['geography', 'culture']
      },
      {
        lessonNumber: 2,
        title: `Physical Features of ${moduleInfo.title}`,
        objectives: ['Identify major physical features', 'Understand climate patterns'],
        vocabulary: ['landforms', 'climate', 'physical geography'],
        materials: ['physical maps', 'climate charts'],
        procedures: ['Review physical features', 'Climate analysis', 'Comparison activity'],
        assessments: ['quiz', 'worksheet'],
        activities: ['mapping exercise', 'climate comparison'],
        timeEstimate: '45 minutes',
        difficulty: 'medium',
        topics: ['climate', 'geography']
      }
    ];

    return defaultLessons;
  }

  // Extract student reading content
  async extractStudentReadings() {
    console.log('📖 Extracting student reading content...');
    
    if (!fs.existsSync(this.studentPdfDir)) {
      console.log('⚠️ Student readings directory not found, skipping...');
      return;
    }

    const studentFiles = fs.readdirSync(this.studentPdfDir).filter(file => file.endsWith('.pdf'));
    console.log(`📄 Found ${studentFiles.length} student reading PDFs`);

    for (let i = 0; i < studentFiles.length; i++) {
      const moduleNumber = i + 1;
      const moduleData = this.moduleMap.get(moduleNumber);
      
      if (moduleData) {
        const filePath = path.join(this.studentPdfDir, studentFiles[i]);
        
        try {
          const dataBuffer = fs.readFileSync(filePath);
          const pdfData = await pdf(dataBuffer);
          
          moduleData.studentContent = {
            text: pdfData.text,
            pageCount: pdfData.numpages,
            summary: this.generateStudentContentSummary(pdfData.text)
          };
          
          console.log(`✅ Added student content to module ${moduleNumber}`);
          
        } catch (error) {
          console.error(`❌ Failed to process student reading ${studentFiles[i]}:`, error.message);
        }
      }
    }
  }

  // Generate summary of student content
  generateStudentContentSummary(text) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
    return sentences.slice(0, 3).join('. ').trim() + '.';
  }

  // Create lesson sequence for the school year
  async createLessonSequence() {
    console.log('📅 Creating lesson sequence for school year...');
    
    const modules = Array.from(this.moduleMap.values()).sort((a, b) => a.moduleNumber - b.moduleNumber);
    let currentLessonDay = 1;

    for (const moduleData of modules) {
      console.log(`📚 Adding ${moduleData.lessons.length} lessons from ${moduleData.title}`);
      for (const lesson of moduleData.lessons) {
        this.lessonSequence.push({
          schoolDay: currentLessonDay,
          moduleNumber: moduleData.moduleNumber,
          moduleTitle: moduleData.title,
          lessonNumber: lesson.lessonNumber,
          lessonTitle: lesson.title,
          lesson: lesson
        });
        currentLessonDay++;
      }
    }

    console.log(`📊 Created sequence of ${this.lessonSequence.length} lessons across ${modules.length} modules`);
  }

  // Map lessons to school calendar
  async mapLessonsToCalendar() {
    console.log('🗓️ Mapping lessons to school calendar...');
    
    // This will create a mapping between school days and lesson content
    // For now, we'll create a simple sequential mapping
    
    const lessonCalendar = {};
    for (const lessonInfo of this.lessonSequence) {
      lessonCalendar[lessonInfo.schoolDay] = lessonInfo;
    }

    // Save to a JSON file for the dashboard to use
    const calendarMapPath = path.join(__dirname, 'lesson-calendar-map.json');
    fs.writeFileSync(calendarMapPath, JSON.stringify(lessonCalendar, null, 2));
    
    console.log(`💾 Saved lesson calendar mapping to ${calendarMapPath}`);
  }

  // Generate extraction report
  generateExtractionReport() {
    const modules = Array.from(this.moduleMap.values());
    const totalLessons = modules.reduce((sum, module) => sum + module.lessons.length, 0);
    
    return {
      extractedAt: new Date(),
      totalModules: modules.length,
      totalLessons: totalLessons,
      averageLessonsPerModule: Math.round(totalLessons / modules.length * 10) / 10,
      modulesWithStudentContent: modules.filter(m => m.studentContent).length,
      lessonSequenceLength: this.lessonSequence.length,
      modules: modules.map(m => ({
        number: m.moduleNumber,
        title: m.title,
        lessons: m.lessons.length,
        hasStudentContent: !!m.studentContent
      }))
    };
  }
}

// Main extraction function
async function extractCurriculumForDashboard() {
  const extractor = new CurriculumExtractor();
  return await extractor.extractAllCurriculumData();
}

module.exports = {
  CurriculumExtractor,
  extractCurriculumForDashboard
};
