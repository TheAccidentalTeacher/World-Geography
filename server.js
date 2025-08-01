const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const { GridFSBucket } = require('mongodb');
const { Curriculum, Module, Lesson } = require('./models');
const { extractAllPDFs } = require('./extract-pdfs');
const { schoolCalendar, calendarUtils } = require('./calendar-config');
const { extractCurriculumForDashboard } = require('./extract-curriculum-dashboard');
const { createSimulationRoutes } = require('./simulation-system');

const app = express();
const PORT = process.env.PORT || 3000;

// GridFS bucket for slides
let slidesBucket;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Serve PDF files statically
app.use('/pdf files', express.static('pdf files'));
app.use('/student readings', express.static('student readings'));
app.use('/local-simulations', express.static('local-simulations'));

// Database connection
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://scosom:nonPhubic4@brainstorm-cluster.bg60my0.mongodb.net/geography-curriculum';
    
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
    console.log('📊 Database:', mongoose.connection.name);
    
    // Initialize GridFS bucket for slides
    slidesBucket = new GridFSBucket(mongoose.connection.db, {
      bucketName: 'slides'
    });
    console.log('🗂️ GridFS bucket initialized for slides');
    
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    return false;
  }
};

// Debug endpoint for Railway
app.get('/debug', async (req, res) => {
  const debugInfo = {
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      PORT: process.env.PORT,
      MONGODB_URI: process.env.MONGODB_URI ? 'Set ✅' : 'Missing ❌'
    },
    mongoose: {
      connection: mongoose.connection.readyState,
      database: mongoose.connection.name || 'Not connected'
    },
    server: 'Running ✅'
  };
  
  try {
    const modules = await Module.find().limit(1);
    debugInfo.data = {
      moduleCount: modules.length > 0 ? 'Found modules ✅' : 'No modules ❌',
      sampleModule: modules[0] ? modules[0].title : 'None'
    };
  } catch (error) {
    debugInfo.error = error.message;
  }
  
  res.json(debugInfo);
});

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'World Geography Curriculum API is running',
    timestamp: new Date().toISOString()
  });
});

// Serve slides from MongoDB GridFS
app.get('/slides/:filename', async (req, res) => {
  try {
    const filename = req.params.filename;
    
    // Check if slides bucket is initialized
    if (!slidesBucket) {
      return res.status(503).json({ error: 'Slides service not available' });
    }
    
    // Find the file in GridFS
    const files = await slidesBucket.find({ filename: filename }).toArray();
    
    if (files.length === 0) {
      return res.status(404).json({ error: 'Slide not found' });
    }
    
    const file = files[0];
    
    // Set appropriate headers
    res.set({
      'Content-Type': 'image/png',
      'Content-Length': file.length,
      'Cache-Control': 'public, max-age=86400' // Cache for 24 hours
    });
    
    // Stream the file from GridFS
    const downloadStream = slidesBucket.openDownloadStreamByName(filename);
    
    downloadStream.on('error', (error) => {
      console.error('❌ Error streaming slide:', error);
      res.status(500).json({ error: 'Error streaming slide' });
    });
    
    downloadStream.pipe(res);
    
  } catch (error) {
    console.error('❌ Error serving slide:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// List all available slides
app.get('/api/slides', async (req, res) => {
  try {
    if (!slidesBucket) {
      return res.status(503).json({ error: 'Slides service not available' });
    }
    
    const files = await slidesBucket.find({}).toArray();
    const slideList = files.map(file => ({
      filename: file.filename,
      uploadDate: file.uploadDate,
      length: file.length
    }));
    
    res.json({ 
      totalSlides: slideList.length,
      slides: slideList.sort((a, b) => a.filename.localeCompare(b.filename))
    });
    
  } catch (error) {
    console.error('❌ Error listing slides:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Initialize Geographic Detective Academy Simulation System
createSimulationRoutes(app);

// Serve lessons directory
app.get('/lessons', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'lessons', 'index.html'));
});

app.get('/lessons/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'lessons', 'index.html'));
});

// Get curriculum overview
app.get('/api/curriculum', async (req, res) => {
  try {
    const curriculum = await Curriculum.findOne();
    const modules = await Module.find({ curriculum: curriculum?._id }).sort({ moduleNumber: 1 });
    
    res.json({
      curriculum,
      modules,
      stats: {
        totalModules: modules.length,
        totalLessons: curriculum?.totalLessons || 0
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all modules
app.get('/api/modules', async (req, res) => {
  try {
    const modules = await Module.find().sort({ moduleNumber: 1 }).populate('curriculum');
    res.json(modules);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get specific module with lessons
app.get('/api/modules/:id', async (req, res) => {
  try {
    const module = await Module.findById(req.params.id).populate('curriculum');
    const lessons = await Lesson.find({ module: req.params.id }).sort({ lessonNumber: 1 });
    
    res.json({
      module,
      lessons
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all lessons
app.get('/api/lessons', async (req, res) => {
  try {
    const { module, search } = req.query;
    let query = {};
    
    if (module) query.module = module;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { 'teacherContent.objectives': { $regex: search, $options: 'i' } },
        { 'teacherContent.vocabulary': { $regex: search, $options: 'i' } }
      ];
    }
    
    const lessons = await Lesson.find(query)
      .populate('module')
      .populate('curriculum')
      .sort({ 'module.moduleNumber': 1, lessonNumber: 1 });
    
    res.json(lessons);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get specific lesson
app.get('/api/lessons/:id', async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id)
      .populate('module')
      .populate('curriculum');
    
    res.json(lesson);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get lesson calendar map for browse page
app.get('/api/lesson-calendar', async (req, res) => {
  try {
    const fs = require('fs');
    const path = require('path');
    
    // Try enhanced lesson map first, then fallback to regular map
    const enhancedMapPath = path.join(__dirname, 'lesson-calendar-map-enhanced.json');
    const regularMapPath = path.join(__dirname, 'lesson-calendar-map.json');
    
    let mapPath = enhancedMapPath;
    if (!fs.existsSync(enhancedMapPath)) {
      mapPath = regularMapPath;
    }
    
    if (!fs.existsSync(mapPath)) {
      // If no lesson map exists, create one
      console.log('⚠️ No lesson calendar found, creating...');
      const { enhanceLessonContent } = require('./enhance-lesson-content');
      enhanceLessonContent();
      
      // Check again for the enhanced map
      if (fs.existsSync(enhancedMapPath)) {
        mapPath = enhancedMapPath;
      }
    }
    
    if (fs.existsSync(mapPath)) {
      const lessonMap = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
      res.json(lessonMap);
    } else {
      res.status(404).json({ error: 'Lesson calendar not found. Please run curriculum extraction first.' });
    }
  } catch (error) {
    console.error('Error loading lesson calendar:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get individual lesson by day number (simpler endpoint for lesson companion)
app.get('/api/lesson/:dayNumber', async (req, res) => {
  try {
    const dayNumber = parseInt(req.params.dayNumber);
    
    // Convert day number to module number (assuming 1 lesson per module for now)
    const moduleNumber = dayNumber;
    
    // Get module and lesson from database
    const module = await Module.findOne({ moduleNumber }).populate('curriculum');
    if (!module) {
      return res.status(404).json({ error: `No module found for day ${dayNumber}` });
    }
    
    const lesson = await Lesson.findOne({ module: module._id });
    if (!lesson) {
      return res.status(404).json({ error: `No lesson found for module ${moduleNumber}` });
    }
    
    // Format the response to match the frontend expectations
    const formattedResponse = {
      schoolDay: dayNumber,
      moduleNumber: module.moduleNumber,
      moduleTitle: module.title,
      lessonNumber: lesson.lessonNumber,
      lessonTitle: lesson.title,
      pdfFile: module.pdfFileName,
      lesson: {
        lessonNumber: lesson.lessonNumber,
        title: lesson.title,
        objectives: lesson.teacherContent.objectives || [],
        vocabulary: lesson.teacherContent.vocabulary?.map(term => ({
          term: typeof term === 'string' ? term : term.term || term,
          definition: typeof term === 'object' ? term.definition || `Geographic term related to ${module.title}` : `Geographic term related to ${module.title}`
        })) || [],
        materials: lesson.teacherContent.materials || [],
        procedures: lesson.teacherContent.procedures || [],
        assessments: lesson.teacherContent.assessments || [],
        activities: lesson.studentContent.activities || [],
        extensions: lesson.teacherContent.extensions || [],
        timeEstimate: "45 minutes",
        difficulty: "medium",
        topics: ["geography"],
        studentReading: {
          title: `${module.title} Reading`,
          content: lesson.studentContent.readings?.[0] || `Study materials for ${module.title}`,
          fullContent: lesson.studentContent.readings?.join('\n\n') || `Complete study materials for ${module.title} module.`,
          status: "available"
        }
      }
    };
    
    res.json(formattedResponse);
    
  } catch (error) {
    console.error('Error loading lesson:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get extraction status
app.get('/api/status', async (req, res) => {
  try {
    const curriculum = await Curriculum.findOne();
    const moduleCount = await Module.countDocuments();
    const lessonCount = await Lesson.countDocuments();
    
    // Get module details for debugging
    const modules = await Module.find().select('title pdfFileName totalLessons').limit(5);
    
    res.json({
      hasData: curriculum !== null,
      curriculum,
      stats: {
        modules: moduleCount,
        lessons: lessonCount,
        avgLessonsPerModule: moduleCount > 0 ? Math.round(lessonCount / moduleCount) : 0
      },
      recentModules: modules,
      extractionComplete: curriculum && curriculum.totalModules > 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Debug endpoint to check PDF files
app.get('/api/debug/files', async (req, res) => {
  try {
    const fs = require('fs');
    const path = require('path');
    const pdfDir = path.join(__dirname, 'pdf files');
    
    const debug = {
      currentDir: __dirname,
      pdfDir: pdfDir,
      dirExists: fs.existsSync(pdfDir),
      allFiles: [],
      pdfFiles: []
    };
    
    if (fs.existsSync(pdfDir)) {
      debug.allFiles = fs.readdirSync(pdfDir);
      debug.pdfFiles = debug.allFiles.filter(file => file.toLowerCase().endsWith('.pdf'));
    }
    
    // Also check if the directory exists with different names
    const possibleDirs = ['pdf files', 'pdfs', 'PDF files', 'PDF Files'];
    debug.possibleDirs = {};
    
    for (const dirName of possibleDirs) {
      const testPath = path.join(__dirname, dirName);
      debug.possibleDirs[dirName] = {
        path: testPath,
        exists: fs.existsSync(testPath)
      };
    }
    
    res.json(debug);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test endpoint to try processing one PDF
app.post('/api/test-pdf', async (req, res) => {
  try {
    const fs = require('fs');
    const path = require('path');
    const pdf = require('pdf-parse');
    
    const pdfDir = path.join(__dirname, 'pdf files');
    const testFile = 'A Geographer_s World Teacher Guide PDF.pdf';
    const filePath = path.join(pdfDir, testFile);
    
    console.log(`🧪 Testing PDF processing: ${testFile}`);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Test PDF file not found', path: filePath });
    }
    
    // Get file info
    const stats = fs.statSync(filePath);
    const result = {
      fileName: testFile,
      filePath: filePath,
      fileSize: `${(stats.size / 1024 / 1024).toFixed(2)} MB`,
      success: false,
      error: null,
      textLength: 0,
      pages: 0,
      firstChars: ''
    };
    
    try {
      console.log(`📄 Reading file...`);
      const dataBuffer = fs.readFileSync(filePath);
      console.log(`📝 Parsing PDF...`);
      const pdfData = await pdf(dataBuffer);
      
      result.success = true;
      result.textLength = pdfData.text.length;
      result.pages = pdfData.numpages || 0;
      result.firstChars = pdfData.text.substring(0, 500);
      
      console.log(`✅ Test successful: ${result.textLength} chars, ${result.pages} pages`);
      
    } catch (pdfError) {
      result.error = pdfError.message;
      console.error(`❌ PDF processing failed:`, pdfError.message);
    }
    
    res.json(result);
    
  } catch (error) {
    console.error(`❌ Test endpoint error:`, error);
    res.status(500).json({ error: error.message });
  }
});

// Daily Dashboard API endpoints
app.get('/api/dashboard/today', (req, res) => {
  try {
    const today = new Date();
    const isSchoolDay = calendarUtils.isSchoolDay(today);
    const schoolDayNumber = calendarUtils.getSchoolDayNumber(today);
    const currentQuarter = calendarUtils.getCurrentQuarter(today);
    const weekOverview = calendarUtils.getWeekOverview(today);
    
    let status = 'school-day';
    let message = '';
    
    if (!isSchoolDay) {
      const dayOfWeek = today.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        status = 'weekend';
        message = 'Weekend - No School';
      } else {
        status = 'holiday';
        message = 'Holiday - No School';
      }
    } else if (calendarUtils.isRelationshipBuilding(today)) {
      status = 'relationship-building';
      message = 'Relationship Building Activities';
    } else if (calendarUtils.isSimulationProject(today)) {
      const simulation = calendarUtils.isSimulationProject(today);
      status = 'simulation';
      message = `Quarter ${simulation.quarter} Simulation Project`;
    }
    
    res.json({
      date: calendarUtils.formatDate(today),
      isSchoolDay,
      status,
      message,
      schoolDayNumber,
      currentQuarter,
      weekOverview
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get lesson for specific school day
app.get('/api/dashboard/lesson/:dayNumber', async (req, res) => {
  try {
    const dayNumber = parseInt(req.params.dayNumber);
    
    // Try to load from lesson calendar mapping file (enhanced first)
    const fs = require('fs');
    const enhancedMapPath = path.join(__dirname, 'lesson-calendar-map-enhanced.json');
    const regularMapPath = path.join(__dirname, 'lesson-calendar-map.json');
    
    let mapPath = enhancedMapPath;
    if (!fs.existsSync(enhancedMapPath)) {
      mapPath = regularMapPath;
    }
    
    // If lesson map doesn't exist, create basic structure
    if (!fs.existsSync(mapPath)) {
      console.log('⚠️ Lesson calendar map not found, creating basic structure...');
      const { enhanceLessonContent } = require('./enhance-lesson-content');
      enhanceLessonContent();
      
      // Check again for enhanced map
      if (fs.existsSync(enhancedMapPath)) {
        mapPath = enhancedMapPath;
      }
    }
    
    if (fs.existsSync(mapPath)) {
      const lessonMap = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
      const lessonInfo = lessonMap[dayNumber];
      
      if (lessonInfo && lessonInfo.lesson) {
        const lesson = lessonInfo.lesson;
        return res.json({
          schoolDay: dayNumber,
          moduleTitle: lessonInfo.moduleTitle,
          lessonNumber: lessonInfo.lessonNumber,
          lessonTitle: lessonInfo.lessonTitle,
          lesson: {
            title: lesson.title,
            objectives: lesson.objectives && lesson.objectives.length > 0 ? lesson.objectives : [`Understand key concepts about ${lessonInfo.moduleTitle}`],
            vocabulary: lesson.vocabulary || [],
            materials: lesson.materials && lesson.materials.length > 0 ? lesson.materials : ['Textbook', 'Notebook', 'Maps', 'Writing materials'],
            procedures: lesson.procedures || [`Study ${lessonInfo.moduleTitle} content`, 'Review key concepts', 'Complete guided practice'],
            assessments: lesson.assessments || ['Class participation', 'Exit ticket'],
            activities: lesson.activities || ['Reading comprehension', 'Discussion'],
            timeEstimate: lesson.timeEstimate || '45 minutes',
            difficulty: lesson.difficulty || 'medium',
            topics: lesson.topics || ['geography'],
            description: `Learn about ${lessonInfo.moduleTitle} through this comprehensive lesson.`,
            studentReading: `${lessonInfo.moduleTitle} Reading`,
            teacherNotes: lesson.topics ? `Focus on ${lesson.topics.join(', ')}` : `Study ${lessonInfo.moduleTitle}`
          }
        });
      }
    }
    
    // Fallback to sample lesson data if extraction hasn't been run
    const sampleLessons = {
      1: {
        schoolDay: 1,
        moduleTitle: "A Geographer's World",
        lessonNumber: 1,
        lessonTitle: "What is Geography?",
        lesson: {
          title: "What is Geography?",
          objectives: [
            "Define geography and its branches",
            "Understand the importance of location",
            "Identify the five themes of geography"
          ],
          vocabulary: [
            { term: "Geography", definition: "The study of Earth's surface and the processes that shape it" },
            { term: "Physical Geography", definition: "The study of Earth's natural features" },
            { term: "Human Geography", definition: "The study of human activities and their relationship to Earth" }
          ],
          materials: [
            "World map",
            "Geography textbook", 
            "Notebook and pencils",
            "Geography wheel activity"
          ],
          procedures: [
            "Begin with a discussion about places students have traveled",
            "Introduce the definition of geography",
            "Explain the five themes of geography",
            "Complete the geography wheel activity",
            "Assign reading for homework"
          ],
          activities: ["Geography wheel activity", "Class discussion", "Map identification"],
          assessments: ["Exit ticket", "Geography wheel completion"],
          timeEstimate: "45 minutes",
          difficulty: "easy",
          topics: ["geography", "maps", "location"],
          description: "Introduction to the study of geography and its importance in understanding our world.",
          studentReading: "Introduction to Geography",
          teacherNotes: "Start with a discussion about places students have been"
        }
      },
      2: {
        schoolDay: 2,
        moduleTitle: "A Geographer's World",
        lessonNumber: 2,
        lessonTitle: "Using Geographic Tools",
        lesson: {
          title: "Using Geographic Tools",
          objectives: [
            "Use latitude and longitude to locate places",
            "Read different types of maps",
            "Use geographic tools effectively"
          ],
          vocabulary: [
            { term: "Latitude", definition: "Lines that run east-west and measure distance north or south of the equator" },
            { term: "Longitude", definition: "Lines that run north-south and measure distance east or west of the prime meridian" },
            { term: "Compass Rose", definition: "A symbol showing the cardinal directions on a map" }
          ],
          materials: [
            "World atlas",
            "Latitude/longitude worksheets",
            "Compass",
            "Map symbols chart"
          ],
          procedures: [
            "Review previous lesson concepts",
            "Introduce latitude and longitude",
            "Practice finding coordinates using worksheets",
            "Explore different types of maps",
            "Complete map symbol identification activity"
          ],
          activities: ["Coordinate practice", "Map symbol identification", "Atlas exploration"],
          assessments: ["Worksheet completion", "Map reading quiz"],
          timeEstimate: "45 minutes",
          difficulty: "medium",
          topics: ["maps", "coordinates", "geographic tools"],
          description: "Learn to use maps, globes, and other geographic tools to gather information.",
          studentReading: "Geographic Tools and Maps",
          teacherNotes: "Practice with local examples before moving to global"
        }
      }
      // More lessons will be added as we extract from curriculum
    };
    
    const lesson = sampleLessons[dayNumber];
    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found for this day' });
    }
    
    res.json(lesson);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Extract curriculum for dashboard
app.post('/api/extract-dashboard', async (req, res) => {
  try {
    console.log('🚀 Dashboard curriculum extraction triggered via API');
    
    // Run extraction in background
    extractCurriculumForDashboard()
      .then(report => {
        console.log('✅ Dashboard extraction completed:', report);
      })
      .catch(error => {
        console.error('❌ Dashboard extraction failed:', error);
      });
    
    res.json({ 
      message: 'Dashboard curriculum extraction started',
      status: 'processing'
    });
  } catch (error) {
    console.error('❌ Dashboard extraction API error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get calendar overview
app.get('/api/dashboard/calendar', (req, res) => {
  try {
    const { year, month } = req.query;
    const targetDate = year && month ? new Date(year, month - 1, 1) : new Date();
    
    res.json({
      schoolYear: schoolCalendar.schoolYear,
      district: schoolCalendar.district,
      quarters: schoolCalendar.quarters.map(q => ({
        number: q.number,
        start: q.start.toISOString().split('T')[0],
        end: q.end.toISOString().split('T')[0],
        simulationStart: q.simulationStart.toISOString().split('T')[0],
        simulationEnd: q.simulationEnd.toISOString().split('T')[0]
      })),
      holidays: schoolCalendar.holidays.map(h => ({
        name: h.name,
        date: h.date ? h.date.toISOString().split('T')[0] : null,
        start: h.start ? h.start.toISOString().split('T')[0] : null,
        end: h.end ? h.end.toISOString().split('T')[0] : null
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// AI API Integration
const OpenAI = require('openai');

let openai = null;
let azureAI = null;

// Initialize OpenAI only if API key is available
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  console.log('🤖 OpenAI API initialized');
} else {
  console.log('⚠️ OpenAI API key not found - AI features will return fallback responses');
}

// Initialize Azure AI Foundry only if API key is available
if (process.env.AZURE_AI_FOUNDRY_KEY && process.env.AZURE_AI_FOUNDRY_ENDPOINT) {
  azureAI = new OpenAI({
    apiKey: process.env.AZURE_AI_FOUNDRY_KEY,
    baseURL: process.env.AZURE_AI_FOUNDRY_ENDPOINT,
  });
  console.log('🚀 Azure AI Foundry initialized (GPT-4, Claude, Gemini, Llama)');
} else {
  console.log('⚠️ Azure AI Foundry keys not found - Multi-model features will return fallback responses');
}

// AI Definition Lookup
app.post('/api/ai/define', async (req, res) => {
  try {
    const { term } = req.body;
    
    if (!term) {
      return res.status(400).json({ error: 'Term is required' });
    }

    if (!openai) {
      return res.status(200).json({ 
        term: term,
        definition: `${term} - OpenAI service not available. This would normally provide a detailed geographic definition.`,
        source: 'Fallback Response',
        note: 'AI service unavailable - this is normal for local development'
      });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a geography expert helping students understand geographic terms. Provide clear, concise definitions focused on geographic concepts. If the term is not geographic, politely explain it's not a geography term and suggest a related geographic concept."
        },
        {
          role: "user",
          content: `Define the geographic term: ${term}`
        }
      ],
      max_tokens: 150,
      temperature: 0.7,
    });

    const definition = completion.choices[0].message.content.trim();

    res.json({
      term: term,
      definition: definition,
      source: 'OpenAI GPT-3.5'
    });

  } catch (error) {
    console.error('AI Definition Error:', error);
    res.status(500).json({ 
      error: 'Failed to get AI definition',
      fallback: `${req.body.term} - Unable to get definition at this time. Please try again later.`
    });
  }
});

// AI Concept Explanation
app.post('/api/ai/explain', async (req, res) => {
  try {
    const { concept } = req.body;
    
    if (!concept) {
      return res.status(400).json({ error: 'Concept is required' });
    }

    if (!openai) {
      return res.status(200).json({ 
        concept: concept,
        explanation: `${concept} - OpenAI service not available. This would normally provide a detailed explanation suitable for middle school students.`,
        source: 'Fallback Response',
        note: 'AI service unavailable - this is normal for local development'
      });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a geography teacher explaining concepts to middle school students. Make explanations clear, engaging, and include real-world examples."
        },
        {
          role: "user",
          content: `Explain this geographic concept for middle school students: ${concept}`
        }
      ],
      max_tokens: 200,
      temperature: 0.7,
    });

    const explanation = completion.choices[0].message.content.trim();

    res.json({
      concept: concept,
      explanation: explanation,
      source: 'OpenAI GPT-3.5'
    });

  } catch (error) {
    console.error('AI Explanation Error:', error);
    res.status(500).json({ 
      error: 'Failed to get AI explanation',
      fallback: `Unable to explain ${req.body.concept} at this time. Please try again later.`
    });
  }
});

// AI Cross-Curricular Connections
app.post('/api/ai/connections', async (req, res) => {
  try {
    const { topic } = req.body;
    
    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    if (!openai) {
      return res.status(200).json({ 
        topic: topic,
        connections: `${topic} - OpenAI service not available. This would normally provide cross-curricular connections to science, math, history, language arts, and other subjects.`,
        source: 'Fallback Response',
        note: 'AI service unavailable - this is normal for local development'
      });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an educational consultant helping teachers find cross-curricular connections. Provide specific, practical connections between geography topics and other subjects like science, math, history, language arts, and arts."
        },
        {
          role: "user",
          content: `Find cross-curricular connections for this geography topic: ${topic}`
        }
      ],
      max_tokens: 250,
      temperature: 0.7,
    });

    const connections = completion.choices[0].message.content.trim();

    res.json({
      topic: topic,
      connections: connections,
      source: 'OpenAI GPT-3.5'
    });

  } catch (error) {
    console.error('AI Connections Error:', error);
    res.status(500).json({ 
      error: 'Failed to get AI connections',
      fallback: `Unable to find connections for ${req.body.topic} at this time. Please try again later.`
    });
  }
});

// AI Multi-Model Comparison Tool
app.post('/api/ai/compare-models', async (req, res) => {
  try {
    const { question } = req.body;
    
    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    const results = {};
    const systemPrompt = "You are a geography education expert. Provide clear, accurate, and engaging answers suitable for middle school students. Be specific and include real-world examples.";

    // Try GPT-4 via OpenAI
    if (openai) {
      try {
        const gptResponse = await openai.chat.completions.create({
          model: "gpt-4",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: question }
          ],
          max_tokens: 300,
          temperature: 0.7,
        });
        results.gpt4 = {
          response: gptResponse.choices[0].message.content.trim(),
          source: "GPT-4 (OpenAI)",
          status: "success"
        };
      } catch (error) {
        results.gpt4 = {
          response: "GPT-4 temporarily unavailable",
          source: "GPT-4 (OpenAI)", 
          status: "error"
        };
      }
    } else {
      results.gpt4 = {
        response: "GPT-4 not configured - would provide detailed geography explanation",
        source: "GPT-4 (OpenAI)",
        status: "fallback"
      };
    }

    // Try Claude via Azure AI Foundry
    if (azureAI) {
      try {
        const claudeResponse = await azureAI.chat.completions.create({
          model: "claude-3-5-sonnet",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: question }
          ],
          max_tokens: 300,
          temperature: 0.7,
        });
        results.claude = {
          response: claudeResponse.choices[0].message.content.trim(),
          source: "Claude 3.5 Sonnet (Azure AI)",
          status: "success"
        };
      } catch (error) {
        console.error('Claude API Error:', error.message);
        results.claude = {
          response: `Claude temporarily unavailable: ${error.message}`,
          source: "Claude 3.5 Sonnet (Azure AI)",
          status: "error"
        };
      }
    } else {
      results.claude = {
        response: "Claude not configured - would provide analytical geography perspective",
        source: "Claude 3.5 Sonnet (Azure AI)",
        status: "fallback"
      };
    }

    // Try Gemini via Azure AI Foundry
    if (azureAI) {
      try {
        const geminiResponse = await azureAI.chat.completions.create({
          model: "gemini-pro",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: question }
          ],
          max_tokens: 300,
          temperature: 0.7,
        });
        results.gemini = {
          response: geminiResponse.choices[0].message.content.trim(),
          source: "Gemini 1.5 Pro (Azure AI)",
          status: "success"
        };
      } catch (error) {
        console.error('Gemini API Error:', error.message);
        results.gemini = {
          response: `Gemini temporarily unavailable: ${error.message}`,
          source: "Gemini Pro (Azure AI)",
          status: "error"
        };
      }
    } else {
      results.gemini = {
        response: "Gemini not configured - would provide comprehensive geography insights",
        source: "Gemini Pro (Azure AI)",
        status: "fallback"
      };
    }

    res.json({
      question: question,
      results: results,
      timestamp: new Date().toISOString(),
      note: "Compare different AI perspectives on the same geography topic"
    });

  } catch (error) {
    console.error('AI Model Comparison Error:', error);
    res.status(500).json({ 
      error: 'Failed to compare AI models',
      fallback: `Unable to compare models for "${req.body.question}" at this time. Please try again later.`
    });
  }
});

// Azure AI Model Testing Endpoint
app.get('/api/ai/test-azure-models', async (req, res) => {
  if (!azureAI) {
    return res.json({
      error: "Azure AI Foundry not configured",
      available: false,
      models: []
    });
  }

  const testModels = [
    "gpt-4",
    "gpt-4o", 
    "claude-3-5-sonnet",
    "claude-3-sonnet",
    "gemini-pro",
    "gemini-1.5-pro",
    "llama-3-70b"
  ];

  const results = {};

  for (const model of testModels) {
    try {
      const testResponse = await azureAI.chat.completions.create({
        model: model,
        messages: [{ role: "user", content: "Hello" }],
        max_tokens: 10,
      });
      results[model] = "✅ Available";
    } catch (error) {
      results[model] = `❌ Error: ${error.message}`;
    }
  }

  res.json({
    azureEndpoint: process.env.AZURE_AI_FOUNDRY_ENDPOINT,
    testResults: results,
    timestamp: new Date().toISOString()
  });
});

// AI Map Illustration Generator - Educational Maps Only (No DALL-E)
app.post('/api/ai/generate-map', async (req, res) => {
  try {
    const { description } = req.body;
    
    if (!description) {
      return res.status(400).json({ error: 'Map description is required' });
    }

    // Step 1: Create super-detailed educational map prompt
    console.log('🎯 Creating detailed educational map prompt...');
    
    let optimizedPrompt = "";
    let promptAnalysis = "";

    if (openai) {
      try {
        const promptOptimization = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `You are a master cartographer creating prompts for educational maps that MUST be readable in classrooms.

CRITICAL REQUIREMENTS:
- Text labels MUST be large, bold, and contrast sharply with background
- Use simple, clean cartographic style (like National Geographic educational maps)
- Specify exact colors for clarity: "bright blue oceans, forest green lowlands, brown mountains, white ice"
- Include scale, compass rose, and legend
- NO artistic flourishes or decorative elements
- Geographic accuracy is essential

PROMPT TEMPLATE:
"Educational cartographic map of [LOCATION], style: clean scientific cartography, large bold black text labels on contrasting backgrounds, [SPECIFIC FEATURES], color scheme: [EXACT COLORS], include compass rose and scale bar, text must be classroom-readable from 10 feet away, avoid decorative elements, National Geographic educational style"

Analyze the request and create the PERFECT educational map prompt:`
            },
            {
              role: "user",
              content: `Create detailed educational map prompt for: ${description}`
            }
          ],
          max_tokens: 250,
          temperature: 0.3,
        });

        optimizedPrompt = promptOptimization.choices[0].message.content.trim();
        promptAnalysis = "✅ AI-optimized for educational clarity";
      } catch (error) {
        console.error('Prompt optimization failed:', error);
        // Fallback to manual optimization
        optimizedPrompt = createFallbackPrompt(description);
        promptAnalysis = "⚠️ Using fallback prompt optimization";
      }
    } else {
      optimizedPrompt = createFallbackPrompt(description);
      promptAnalysis = "🔧 Manual prompt optimization (OpenAI unavailable)";
    }

    console.log('📝 Generated prompt:', optimizedPrompt);

    // Step 2: Try image generation APIs - SKIP DALL-E for educational maps (terrible quality)
    let imageResult = null;
    let usedGenerator = null;
    let failureReasons = [];

    // Try Stability AI FIRST (best for educational maps)
    if (process.env.STABILITY_AI_API_KEY) {
      console.log('🎨 Trying Stability AI (Primary - Best for educational maps)...');
      try {
        imageResult = await generateWithStabilityAI(optimizedPrompt);
        usedGenerator = 'Stability AI (Primary - Best educational quality)';
        console.log('✅ Stability AI succeeded!');
      } catch (error) {
        console.error('❌ Stability AI failed:', error.message);
        failureReasons.push(`Stability AI: ${error.message}`);
      }
    } else {
      failureReasons.push('Stability AI: API key not configured');
    }

    // Skip DALL-E completely for educational maps - it produces unreadable text
    // DALL-E creates beautiful artistic maps but text is illegible in classrooms
    // Save DALL-E for other projects where readability isn't critical

    // Try Replicate as backup (much better than DALL-E for maps)
    if (!imageResult && process.env.REPLICATE_API_TOKEN) {
      console.log('🎨 Trying Replicate (Secondary - Better than DALL-E for maps)...');
      try {
        imageResult = await generateWithReplicate(optimizedPrompt);
        usedGenerator = 'Replicate (Secondary - Educational backup)';
        console.log('✅ Replicate succeeded!');
      } catch (error) {
        console.error('❌ Replicate failed:', error.message);
        failureReasons.push(`Replicate: ${error.message}`);
      }
    } else if (!imageResult) {
      failureReasons.push('Replicate: API key not configured');
    }

    if (imageResult) {
      res.json({
        description: description,
        imageUrl: imageResult,
        optimizedPrompt: optimizedPrompt,
        promptAnalysis: promptAnalysis,
        generator: usedGenerator,
        status: 'success',
        message: 'Educational map generated! (DALL-E skipped - terrible for classroom use)',
        tips: [
          "🎯 Stability AI prioritized for best educational quality",
          "📏 Text optimized for classroom readability", 
          "🚫 DALL-E skipped (produces unreadable maps)",
          "🗺️ Educational cartography standards applied"
        ],
        failureReasons: failureReasons.length > 0 ? failureReasons : undefined
      });
    } else {
      // All educational APIs failed - provide helpful fallback
      res.json({
        description: description,
        imageUrl: null,
        optimizedPrompt: optimizedPrompt,
        promptAnalysis: promptAnalysis,
        mapDescription: `Educational map of ${description} - Educational image services temporarily unavailable.`,
        status: 'all_services_failed',
        message: 'Educational map services unavailable (DALL-E intentionally skipped)',
        generator: 'None (educational services unavailable)',
        failureReasons: failureReasons,
        tips: [
          "✅ Detailed educational prompt created",
          "🎯 Stability AI + Replicate configured for classroom quality",
          "🚫 DALL-E disabled for maps (unreadable text)",
          "⚡ Will work when educational APIs are available"
        ]
      });
    }

  } catch (error) {
    console.error('Map Generation Error:', error);
    res.status(500).json({ 
      error: 'Failed to generate educational map',
      fallback: `Unable to generate map for "${req.body.description}" at this time. Please try again later.`
    });
  }
});

// Helper function for fallback prompt creation
function createFallbackPrompt(description) {
  return `Educational cartographic map of ${description}, style: clean scientific cartography with large bold black text labels on high-contrast backgrounds, detailed geographic features clearly labeled, color scheme: bright blue oceans, forest green lowlands, brown mountains, white ice and snow, include compass rose and scale bar, text must be classroom-readable from 10 feet away, National Geographic educational atlas style, avoid decorative elements, focus on educational clarity and geographic accuracy`;
}

// Stability AI integration
async function generateWithStabilityAI(prompt) {
  const response = await fetch('https://api.stability.ai/v2beta/stable-image/generate/core', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.STABILITY_AI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: prompt,
      output_format: 'jpeg',
      aspect_ratio: '1:1',
      style_preset: 'photographic'
    })
  });

  if (!response.ok) {
    throw new Error(`Stability AI error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.image; // Returns base64 or URL depending on API response
}

// Replicate integration  
async function generateWithReplicate(prompt) {
  const response = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      version: "stability-ai/stable-diffusion:27b93a2413e7f36cd83da926f3656280b2931564ff050bf9575f1fdf9bcd7478",
      input: {
        prompt: prompt,
        width: 1024,
        height: 1024,
        num_inference_steps: 30
      }
    })
  });

  if (!response.ok) {
    throw new Error(`Replicate error: ${response.statusText}`);
  }

  const prediction = await response.json();
  
  // Wait for completion (simplified - in production you'd use webhooks)
  let completed = false;
  let attempts = 0;
  
  while (!completed && attempts < 10) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
      headers: {
        'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
      }
    });
    
    const status = await statusResponse.json();
    
    if (status.status === 'succeeded') {
      completed = true;
      return status.output[0];
    } else if (status.status === 'failed') {
      throw new Error('Replicate generation failed');
    }
    
    attempts++;
  }
  
  throw new Error('Replicate generation timeout');
}

// Daily Dashboard Route
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// AI Geography Hub Route
app.get('/ai-geography-hub', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'ai-geography-hub.html'));
});

// Lesson Companion Route
app.get('/lesson-companion', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'lesson-companion.html'));
});

// Q1 Geographic Detectives Simulation Route - Redirect to new system
app.get('/simulation', (req, res) => {
  res.redirect('/simulation/geographic-detective-academy');
});

// Redirect browse to PDF lessons
app.get('/browse-pdf', (req, res) => {
  res.redirect('/lessons/');
});

// Browse lessons page
app.get('/browse', async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      return res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Browse Geography Lessons</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            .nav { margin-bottom: 20px; padding-bottom: 10px; border-bottom: 2px solid #007cba; }
            .nav a { margin-right: 15px; text-decoration: none; color: #007cba; font-weight: bold; }
            .nav a:hover { text-decoration: underline; }
            .error { background: #ffe6e6; border: 1px solid #ff9999; padding: 20px; border-radius: 8px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="nav">
            <a href="/">🏠 Home</a>
            <a href="/dashboard">📅 Daily Dashboard</a>
            <a href="/browse">📚 Browse Lessons</a>
            <a href="/search">🔍 Search</a>
          </div>
          
          <h1>📚 Browse Geography Lessons</h1>
          
          <div class="error">
            <h3>🔌 Database Connection Issue</h3>
            <p>Unable to connect to the database right now. Please try again in a moment.</p>
            <p><a href="/browse">🔄 Retry</a> | <a href="/">← Back to Home</a></p>
          </div>
        </body>
        </html>
      `);
    }

    const modules = await Module.find().sort({ moduleNumber: 1 });
    const moduleId = req.query.module;
    let selectedModule = null;
    let lessons = [];
    
    if (moduleId) {
      selectedModule = await Module.findById(moduleId);
      lessons = await Lesson.find({ module: moduleId }).sort({ lessonNumber: 1 });
    }
    
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Browse Geography Lessons</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; }
          .nav { margin-bottom: 20px; padding-bottom: 10px; border-bottom: 2px solid #007cba; }
          .nav a { margin-right: 15px; text-decoration: none; color: #007cba; font-weight: bold; }
          .nav a:hover { text-decoration: underline; }
          .container { display: flex; gap: 20px; }
          .sidebar { width: 300px; }
          .content { flex: 1; }
          .module-list { border: 1px solid #ddd; border-radius: 8px; overflow: hidden; }
          .module-item { padding: 12px; border-bottom: 1px solid #eee; cursor: pointer; }
          .module-item:hover { background: #f5f5f5; }
          .module-item.active { background: #007cba; color: white; }
          .lesson-card { border: 1px solid #ddd; margin: 10px 0; border-radius: 8px; padding: 15px; }
          .lesson-title { font-size: 18px; font-weight: bold; color: #333; margin-bottom: 10px; }
          .lesson-section { margin: 10px 0; }
          .lesson-section h4 { margin: 5px 0; color: #007cba; }
          .lesson-section ul { margin: 5px 0 10px 20px; }
          .lesson-section li { margin: 3px 0; }
          .no-content { color: #888; font-style: italic; }
          .search-box { width: 100%; padding: 10px; margin-bottom: 15px; border: 1px solid #ddd; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="nav">
          <a href="/">🏠 Home</a>
          <a href="/dashboard">📅 Daily Dashboard</a>
          <a href="/browse">📚 Browse Lessons</a>
          <a href="/search">🔍 Search</a>
        </div>
        
        <h1>📚 Browse Geography Lessons</h1>
        
        <div class="container">
          <div class="sidebar">
            <h3>📖 Modules (${modules.length})</h3>
            <div class="module-list">
              ${modules.map(module => `
                <div class="module-item ${moduleId === module._id.toString() ? 'active' : ''}" 
                     onclick="window.location.href='/browse?module=${module._id}'">
                  <strong>${module.title}</strong>
                  <br><small>${module.totalLessons} lessons</small>
                </div>
              `).join('')}
            </div>
          </div>
          
          <div class="content">
            ${selectedModule ? `
              <h2>📍 ${selectedModule.title}</h2>
              <p><strong>Lessons:</strong> ${lessons.length}</p>
              
              ${lessons.map(lesson => `
                <div class="lesson-card">
                  <div class="lesson-title">${lesson.title}</div>
                  
                  <div class="lesson-section">
                    <h4>🎯 Learning Objectives</h4>
                    ${lesson.teacherContent.objectives.length > 0 ? 
                      `<ul>${lesson.teacherContent.objectives.map(obj => `<li>${obj}</li>`).join('')}</ul>` : 
                      '<div class="no-content">No objectives listed</div>'
                    }
                  </div>
                  
                  <div class="lesson-section">
                    <h4>📋 Materials Needed</h4>
                    ${lesson.teacherContent.materials.length > 0 ? 
                      `<ul>${lesson.teacherContent.materials.map(mat => `<li>${mat}</li>`).join('')}</ul>` : 
                      '<div class="no-content">No materials listed</div>'
                    }
                  </div>
                  
                  <div class="lesson-section">
                    <h4>📚 Key Vocabulary</h4>
                    ${lesson.teacherContent.vocabulary.length > 0 ? 
                      `<ul>${lesson.teacherContent.vocabulary.map(vocab => `<li>${vocab}</li>`).join('')}</ul>` : 
                      '<div class="no-content">No vocabulary listed</div>'
                    }
                  </div>
                  
                  <div class="lesson-section">
                    <h4>👨‍🏫 Teaching Procedures</h4>
                    ${lesson.teacherContent.procedures.length > 0 ? 
                      `<ul>${lesson.teacherContent.procedures.map(proc => `<li>${proc}</li>`).join('')}</ul>` : 
                      '<div class="no-content">No procedures listed</div>'
                    }
                  </div>
                  
                  <div class="lesson-section">
                    <h4>👩‍🎓 Student Activities</h4>
                    ${lesson.studentContent.activities.length > 0 ? 
                      `<ul>${lesson.studentContent.activities.map(act => `<li>${act}</li>`).join('')}</ul>` : 
                      '<div class="no-content">No activities listed</div>'
                    }
                  </div>
                  
                  <div class="lesson-section">
                    <h4>📝 Assessments</h4>
                    ${lesson.teacherContent.assessments.length > 0 ? 
                      `<ul>${lesson.teacherContent.assessments.map(assess => `<li>${assess}</li>`).join('')}</ul>` : 
                      '<div class="no-content">No assessments listed</div>'
                    }
                  </div>
                </div>
              `).join('')}
            ` : `
              <div style="text-align: center; padding: 50px; color: #666;">
                <h3>👈 Select a module from the left to view lessons</h3>
                <p>Choose any of the ${modules.length} geography modules to see detailed lesson plans.</p>
              </div>
            `}
          </div>
        </div>
      </body>
      </html>
    `);
  } catch (error) {
    res.status(500).send(`
      <h1>Error Loading Lessons</h1>
      <p>Sorry, there was an error: ${error.message}</p>
      <a href="/">← Back to Home</a>
    `);
  }
});

// Search page
app.get('/search', async (req, res) => {
  const searchTerm = req.query.q || '';
  let lessons = [];
  
  if (searchTerm) {
    try {
      lessons = await Lesson.find({
        $or: [
          { title: { $regex: searchTerm, $options: 'i' } },
          { 'teacherContent.objectives': { $regex: searchTerm, $options: 'i' } },
          { 'teacherContent.vocabulary': { $regex: searchTerm, $options: 'i' } },
          { 'teacherContent.procedures': { $regex: searchTerm, $options: 'i' } },
          { 'studentContent.activities': { $regex: searchTerm, $options: 'i' } }
        ]
      }).populate('module').limit(20);
    } catch (error) {
      console.error('Search error:', error);
    }
  }
  
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Search Geography Lessons</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 1000px; margin: 0 auto; padding: 20px; }
        .nav { margin-bottom: 20px; padding-bottom: 10px; border-bottom: 2px solid #007cba; }
        .nav a { margin-right: 15px; text-decoration: none; color: #007cba; font-weight: bold; }
        .nav a:hover { text-decoration: underline; }
        .search-box { width: 100%; padding: 15px; font-size: 16px; border: 2px solid #007cba; border-radius: 8px; margin-bottom: 20px; }
        .search-btn { background: #007cba; color: white; border: none; padding: 15px 30px; border-radius: 8px; font-size: 16px; cursor: pointer; margin-left: 10px; }
        .search-btn:hover { background: #005a87; }
        .result { border: 1px solid #ddd; margin: 15px 0; padding: 15px; border-radius: 8px; }
        .result-title { font-size: 18px; font-weight: bold; color: #007cba; margin-bottom: 5px; }
        .result-module { color: #666; margin-bottom: 10px; }
        .result-content { margin: 10px 0; }
        .highlight { background: yellow; }
        .no-results { text-align: center; padding: 50px; color: #666; }
      </style>
    </head>
    <body>
      <div class="nav">
        <a href="/">🏠 Home</a>
        <a href="/dashboard">📅 Daily Dashboard</a>
        <a href="/browse">📚 Browse Lessons</a>
        <a href="/search">🔍 Search</a>
      </div>
      
      <h1>🔍 Search Geography Lessons</h1>
      
      <form method="GET" style="display: flex; margin-bottom: 30px;">
        <input type="text" name="q" class="search-box" placeholder="Search for topics, vocabulary, activities..." value="${searchTerm}">
        <button type="submit" class="search-btn">Search</button>
      </form>
      
      ${searchTerm ? `
        <h3>Results for "${searchTerm}" (${lessons.length} found)</h3>
        
        ${lessons.length > 0 ? lessons.map(lesson => `
          <div class="result">
            <div class="result-title">${lesson.title}</div>
            <div class="result-module">📖 Module: ${lesson.module ? lesson.module.title : 'Unknown'}</div>
            <div class="result-content">
              ${lesson.teacherContent.objectives.length > 0 ? `<strong>Objectives:</strong> ${lesson.teacherContent.objectives.slice(0, 2).join(', ')}` : ''}
            </div>
          </div>
        `).join('') : `
          <div class="no-results">
            <h3>No lessons found for "${searchTerm}"</h3>
            <p>Try searching for terms like: climate, culture, geography, government, economy</p>
          </div>
        `}
      ` : `
        <div class="no-results">
          <h3>Enter a search term above</h3>
          <p>Search through all geography lessons for specific topics, vocabulary, or activities.</p>
        </div>
      `}
    </body>
    </html>
  `);
});

// Trigger PDF extraction
app.post('/api/extract', async (req, res) => {
  try {
    console.log('🚀 Manual extraction triggered via API');
    
    // Check if PDF files exist first
    const fs = require('fs');
    const path = require('path');
    const pdfDir = path.join(__dirname, 'pdf files');
    
    console.log('📁 Checking PDF directory:', pdfDir);
    
    if (!fs.existsSync(pdfDir)) {
      console.error('❌ PDF directory not found:', pdfDir);
      return res.status(404).json({ 
        error: 'PDF files directory not found',
        path: pdfDir,
        status: 'error'
      });
    }
    
    const pdfFiles = fs.readdirSync(pdfDir).filter(file => file.toLowerCase().endsWith('.pdf'));
    console.log(`📚 Found ${pdfFiles.length} PDF files:`, pdfFiles.slice(0, 3).map(f => f.substring(0, 30) + '...'));
    
    if (pdfFiles.length === 0) {
      return res.status(404).json({ 
        error: 'No PDF files found in directory',
        path: pdfDir,
        status: 'error'
      });
    }
    
    // Run extraction in background
    extractAllPDFs().catch(console.error);
    
    res.json({ 
      message: 'PDF extraction started',
      pdfCount: pdfFiles.length,
      status: 'processing'
    });
  } catch (error) {
    console.error('❌ Extraction API error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Trigger DOCX extraction
app.post('/api/extract-docx', async (req, res) => {
  try {
    const { processDocxFile } = require('./extract-docx');
    const fs = require('fs');
    const path = require('path');
    
    console.log('🚀 DOCX extraction triggered via API');
    
    const docxDir = path.join(__dirname, 'docx files');
    
    if (!fs.existsSync(docxDir)) {
      return res.status(404).json({ 
        error: 'DOCX files directory not found',
        message: 'Please create a "docx files" folder and upload DOCX files to it',
        path: docxDir
      });
    }
    
    const files = fs.readdirSync(docxDir).filter(file => file.toLowerCase().endsWith('.docx'));
    
    if (files.length === 0) {
      return res.status(404).json({ 
        error: 'No DOCX files found',
        message: 'Please upload DOCX files to the "docx files" folder',
        path: docxDir
      });
    }
    
    console.log(`🔍 Found ${files.length} DOCX file(s) to process`);
    
    let results = [];
    let totalLessons = 0;
    
    for (const file of files) {
      const filePath = path.join(docxDir, file);
      try {
        console.log(`📄 Processing: ${file}`);
        const result = await processDocxFile(filePath);
        results.push({
          file: file,
          success: true,
          moduleTitle: result.module.title,
          lessonCount: result.lessonCount
        });
        totalLessons += result.lessonCount;
      } catch (error) {
        console.error(`❌ Failed to process ${file}:`, error.message);
        results.push({
          file: file,
          success: false,
          error: error.message
        });
      }
    }
    
    res.json({
      message: 'DOCX extraction completed',
      filesProcessed: files.length,
      totalLessons: totalLessons,
      results: results
    });
    
  } catch (error) {
    console.error('❌ DOCX extraction error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Serve the main lesson companion interface
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'new-lesson-companion.html'));
});

// Admin route for system management (keep the old interface for admin tasks)
app.get('/admin', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>World Geography Curriculum - Admin</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .card { border: 1px solid #ddd; padding: 20px; margin: 10px 0; border-radius: 8px; }
        button { background: #007cba; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; margin: 5px; }
        button:hover { background: #005a87; }
        .status { padding: 10px; border-radius: 4px; margin: 10px 0; }
        .success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .info { background: #d1ecf1; color: #0c5460; border: 1px solid #bee5eb; }
        .nav { margin-bottom: 20px; }
        .nav a { margin-right: 15px; text-decoration: none; color: #007cba; font-weight: bold; }
        .nav a:hover { text-decoration: underline; }
      </style>
    </head>
    <body>
      <div class="nav">
        <a href="/">🏠 Home</a>
        <a href="/admin">⚙️ Admin</a>
        <a href="/dashboard">� Daily Dashboard</a>
      </div>
      
      <h1>🌍 World Geography Curriculum - Admin Panel</h1>
      
      <div class="card">
        <h2>PDF Extraction Status</h2>
        <div id="status" class="status info">Loading...</div>
        <button onclick="checkStatus()">Refresh Status</button>
        <button onclick="startExtraction()">Start PDF Extraction</button>
        <button onclick="startDocxExtraction()">Start DOCX Extraction</button>
        <button onclick="startDashboardExtraction()">Extract for Dashboard</button>
      </div>
      
      <div class="card">
        <h2>API Endpoints</h2>
        <ul>
          <li><a href="/api/health">Health Check</a></li>
          <li><a href="/api/status">Extraction Status</a></li>
          <li><a href="/api/curriculum">Curriculum Overview</a></li>
          <li><a href="/api/modules">All Modules</a></li>
          <li><a href="/api/lessons">All Lessons</a></li>
        </ul>
      </div>
      
      <script>
        async function checkStatus() {
          try {
            const response = await fetch('/api/status');
            const data = await response.json();
            
            const statusDiv = document.getElementById('status');
            if (data.hasData) {
              statusDiv.className = 'status success';
              statusDiv.innerHTML = \`
                ✅ Curriculum data loaded!<br>
                📚 Modules: \${data.stats.modules}<br>
                📖 Lessons: \${data.stats.lessons}<br>
                📊 Avg Lessons/Module: \${data.stats.avgLessonsPerModule}
              \`;
            } else {
              statusDiv.className = 'status info';
              statusDiv.innerHTML = '⏳ No curriculum data found. Start extraction to process PDF files.';
            }
          } catch (error) {
            document.getElementById('status').innerHTML = '❌ Error: ' + error.message;
          }
        }
        
        async function startExtraction() {
          try {
            const response = await fetch('/api/extract', { method: 'POST' });
            const data = await response.json();
            
            document.getElementById('status').innerHTML = '🚀 ' + data.message + ' - This may take several minutes...';
            
            // Check status every 30 seconds
            setTimeout(checkStatus, 30000);
          } catch (error) {
            document.getElementById('status').innerHTML = '❌ Error: ' + error.message;
          }
        }
        
        async function startDocxExtraction() {
          try {
            document.getElementById('status').innerHTML = 'Starting DOCX extraction...';
            
            const response = await fetch('/api/extract-docx', { method: 'POST' });
            const data = await response.json();
            
            if (data.results) {
              const successCount = data.results.filter(r => r.success).length;
              const failCount = data.results.filter(r => !r.success).length;
              
              document.getElementById('status').innerHTML = 
                'DOCX Extraction Complete!<br>' +
                'Files processed: ' + data.filesProcessed + '<br>' +
                'Total lessons extracted: ' + data.totalLessons + '<br>' +
                'Success: ' + successCount + ', Failed: ' + failCount;
            } else {
              document.getElementById('status').innerHTML = data.message;
            }
            
            // Refresh status to show new data
            setTimeout(checkStatus, 2000);
          } catch (error) {
            document.getElementById('status').innerHTML = 'DOCX Error: ' + error.message;
          }
        }
        
        // Load status on page load
        async function startDashboardExtraction() {
          try {
            const response = await fetch('/api/extract-dashboard', { method: 'POST' });
            const data = await response.json();
            
            document.getElementById('status').innerHTML = '🚀 ' + data.message + ' - Processing curriculum for daily dashboard...';
            
            // Check status every 30 seconds
            setTimeout(checkStatus, 30000);
          } catch (error) {
            document.getElementById('status').innerHTML = '❌ Error: ' + error.message;
          }
        }
        
        checkStatus();
      </script>
    </body>
    </html>
  `);
});

// Start server
const startServer = async () => {
  const dbConnected = await connectDB();
  
  if (!dbConnected) {
    console.log('⚠️  Starting server without database connection');
  }
  
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📱 Visit: http://localhost:${PORT}`);
    console.log(`🔗 API Health: http://localhost:${PORT}/api/health`);
    if (dbConnected) {
      console.log(`📚 Browse lessons: http://localhost:${PORT}/browse`);
    }
  });
};

startServer();
