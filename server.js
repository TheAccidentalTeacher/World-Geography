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

// Content Security Policy for Mapbox with comprehensive font support
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://api.mapbox.com https://cdn.jsdelivr.net https://unpkg.com; " +
    "style-src 'self' 'unsafe-inline' https://api.mapbox.com https://fonts.googleapis.com https://cdn.jsdelivr.net; " +
    "font-src 'self' data: https://api.mapbox.com https://*.mapbox.com https://fonts.gstatic.com https://fonts.googleapis.com; " +
    "img-src 'self' data: blob: https://api.mapbox.com https://*.tiles.mapbox.com https://*.mapbox.com; " +
    "connect-src 'self' https://api.mapbox.com https://events.mapbox.com https://*.tiles.mapbox.com; " +
    "worker-src 'self' blob:; " +
    "child-src 'self' blob:;"
  );
  next();
});

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
const Replicate = require('replicate');

let openai = null;
let azureAI = null;
let replicate = null;

// Initialize OpenAI only if API key is available
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  console.log('🤖 OpenAI API initialized');
} else {
  console.log('⚠️ OpenAI API key not found - AI features will return fallback responses');
}

// Initialize Replicate only if API key is available
if (process.env.REPLICATE_API_TOKEN) {
  replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
  });
  console.log('🔄 Replicate API initialized');
} else {
  console.log('⚠️ Replicate API key not found - Replicate features will be unavailable');
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

// AI Map Illustration Generator - DISABLED: Professional Maps Only
app.post('/api/ai/generate-map', async (req, res) => {
  try {
    const { description } = req.body;
    
    if (!description) {
      return res.status(400).json({ error: 'Map description is required' });
    }

    // AI-generated maps are too low quality for educational use
    // Redirect to professional mapping alternatives
    res.json({
      description: description,
      imageUrl: null,
      status: 'ai_maps_disabled',
      message: 'AI-generated maps disabled - poor quality for educational use',
      alternatives: {
        mapbox: {
          available: true,
          description: 'Professional interactive maps with educational features',
          url: 'Use Mapbox GL JS for interactive educational maps'
        },
        staticMaps: {
          available: true,
          description: 'High-quality static map images from professional sources',
          suggestions: [
            'Use Mapbox Static Images API for specific regions',
            'Integrate with Natural Earth data for educational accuracy',
            'Use USGS educational map resources',
            'Link to National Geographic education maps'
          ]
        },
        educationalResources: {
          available: true,
          suggestions: [
            'National Geographic Education maps',
            'USGS educational materials',
            'World Bank data visualization',
            'UN geographic information systems'
          ]
        }
      },
      recommendation: 'Use professional mapping tools instead of AI generation for educational quality',
      tips: [
        "🏆 Professional maps ensure geographic accuracy",
        "📏 Proper scale and projection for educational use", 
        "🗺️ Consistent cartographic standards",
        "⚡ Interactive features enhance learning"
      ]
    });

  } catch (error) {
    console.error('Map Service Error:', error);
    res.status(500).json({ 
      error: 'Map service unavailable',
      fallback: `Professional mapping tools recommended for "${req.body.description}".`
    });
  }
});

// Professional Educational Map Resources
app.get('/api/maps/educational/:region', async (req, res) => {
  try {
    const { region } = req.params;
    const { type = 'overview' } = req.query;
    
    // Professional map resources for education
    const educationalMaps = {
      alaska: {
        overview: {
          title: "Alaska Regional Overview",
          description: "Professional educational map of Alaska showing major geographic features",
          mapboxStyle: "mapbox://styles/mapbox/outdoors-v12",
          center: [-153.0, 64.0],
          zoom: 4,
          features: ["rivers", "mountains", "cities", "borders"],
          educationalFocus: "Physical geography and regional overview",
          resources: {
            nationalGeographic: "https://education.nationalgeographic.org/resource/alaska/",
            usgs: "https://www.usgs.gov/centers/alaska-science-center",
            data: "Natural Earth, USGS, Alaska Department of Natural Resources"
          }
        },
        physical: {
          title: "Alaska Physical Features",
          description: "Detailed physical geography of Alaska",
          mapboxStyle: "mapbox://styles/mapbox/satellite-v9",
          center: [-153.0, 64.0],
          zoom: 5,
          features: ["topography", "rivers", "glaciers", "mountain ranges"],
          educationalFocus: "Physical geography and landforms"
        },
        rivers: {
          title: "Alaska River Systems",
          description: "Major rivers and watersheds of Alaska including the Cooper River",
          mapboxStyle: "mapbox://styles/mapbox/outdoors-v12",
          center: [-145.0, 61.5],
          zoom: 6,
          features: ["cooper_river", "yukon_river", "watersheds", "drainage_basins"],
          educationalFocus: "Hydrology and river systems",
          highlights: {
            cooper_river: {
              description: "Major river system in south-central Alaska",
              length: "300 miles",
              source: "Copper Glacier",
              mouth: "Gulf of Alaska"
            }
          }
        }
      },
      world: {
        overview: {
          title: "World Political Map",
          description: "Professional world map for educational use",
          mapboxStyle: "mapbox://styles/mapbox/light-v11",
          center: [0, 20],
          zoom: 2,
          features: ["countries", "capitals", "major_cities", "borders"],
          educationalFocus: "Political geography and world overview"
        }
      }
    };

    const mapData = educationalMaps[region.toLowerCase()];
    if (!mapData) {
      return res.status(404).json({ 
        error: 'Region not found',
        availableRegions: Object.keys(educationalMaps),
        suggestion: 'Try: alaska, world'
      });
    }

    const mapType = mapData[type];
    if (!mapType) {
      return res.status(404).json({
        error: 'Map type not found',
        availableTypes: Object.keys(mapData),
        suggestion: 'Try: overview, physical, rivers'
      });
    }

    res.json({
      region: region,
      type: type,
      map: mapType,
      implementation: {
        mapbox: {
          required: "Mapbox GL JS library",
          apiKey: "Requires MAPBOX_ACCESS_TOKEN environment variable",
          example: `
// Initialize map
mapboxgl.accessToken = 'your-mapbox-token';
const map = new mapboxgl.Map({
  container: 'map',
  style: '${mapType.mapboxStyle}',
  center: [${mapType.center[0]}, ${mapType.center[1]}],
  zoom: ${mapType.zoom}
});`
        },
        static: {
          url: `https://api.mapbox.com/styles/v1/mapbox/terrain-v12/static/${mapType.center[0]},${mapType.center[1]},${mapType.zoom}/800x600@2x?access_token=YOUR_TOKEN`,
          description: "High-quality static image for printable materials"
        }
      },
      educationalValue: {
        gradeLevel: "6-12",
        subjects: ["Geography", "Earth Science", "Social Studies"],
        standards: ["National Geography Standards", "Next Generation Science Standards"],
        activities: [
          "Location identification exercises",
          "Scale and distance calculations", 
          "Feature classification and analysis",
          "Cross-curricular connections"
        ]
      },
      tips: [
        "🎯 Professional cartographic accuracy guaranteed",
        "📏 Proper scale and projection for educational use",
        "🗺️ Interactive features enhance student engagement",
        "📚 Aligns with educational standards and curricula"
      ]
    });

  } catch (error) {
    console.error('Educational Map Service Error:', error);
    res.status(500).json({ 
      error: 'Educational map service unavailable',
      fallback: 'Please try again or use alternative mapping resources'
    });
  }
});

// Mapbox Integration Endpoint
app.get('/api/maps/mapbox/token', (req, res) => {
  if (!process.env.MAPBOX_ACCESS_TOKEN) {
    return res.status(503).json({
      error: 'Mapbox not configured',
      message: 'MAPBOX_ACCESS_TOKEN environment variable required',
      setup: 'Add your Mapbox access token to environment variables'
    });
  }

  res.json({
    token: process.env.MAPBOX_ACCESS_TOKEN,
    styles: {
      terrain: 'mapbox://styles/mapbox/terrain-v12',
      satellite: 'mapbox://styles/mapbox/satellite-v9',
      outdoors: 'mapbox://styles/mapbox/outdoors-v12',
      light: 'mapbox://styles/mapbox/light-v11'
    },
    educational: true
  });
});

// Stability AI integration
async function generateWithStabilityAI(prompt) {
  console.log('🎨 Attempting Stability AI generation...');
  console.log('🔑 API Key available:', !!process.env.STABILITY_AI_API_KEY);
  
  const requestBody = {
    prompt: prompt,
    output_format: 'png'
  };
  
  console.log('📤 Stability AI request body:', requestBody);
  
  const response = await fetch('https://api.stability.ai/v2beta/stable-image/generate/core', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.STABILITY_AI_API_KEY}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(requestBody)
  });

  console.log('📡 Stability AI response status:', response.status);
  console.log('📡 Stability AI response headers:', Object.fromEntries(response.headers.entries()));
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Stability AI full error response:', errorText);
    throw new Error(`Stability AI API error: ${response.status} ${response.statusText}. Response: ${errorText}`);
  }

  const data = await response.json();
  console.log('✅ Stability AI response received. Keys:', Object.keys(data));
  console.log('📄 Full response data:', data);
  
  // Stability AI v2beta returns base64 image data in 'image' field
  if (data.image) {
    console.log('✅ Stability AI image data found, length:', data.image.length);
    return `data:image/png;base64,${data.image}`;
  } else {
    console.error('❌ Stability AI response structure unexpected:', data);
    throw new Error('Stability AI: No image data in response');
  }
}

// Replicate integration using proper SDK
async function generateWithReplicate(prompt) {
  console.log('🔄 Attempting Replicate generation...');
  
  if (!replicate) {
    throw new Error('Replicate not initialized - API key missing');
  }
  
  try {
    const input = {
      prompt: prompt,
      output_format: "png",
      aspect_ratio: "1:1"
    };

    console.log('📤 Replicate input:', input);
    
    const output = await replicate.run(
      "black-forest-labs/flux-schnell",
      { input }
    );

    console.log('📥 Replicate output type:', typeof output);
    console.log('📥 Replicate output:', output);
    
    if (Array.isArray(output) && output.length > 0) {
      return output[0];
    } else if (typeof output === 'string') {
      return output;
    } else {
      throw new Error('Replicate: Unexpected output format');
    }
  } catch (error) {
    console.error('❌ Replicate error:', error.message);
    throw error;
  }
}// Daily Dashboard Route
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
