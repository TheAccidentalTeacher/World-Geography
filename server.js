const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const { GridFSBucket } = require('mongodb');
const { Curriculum, Module, Lesson } = require('./models');
const { extractAllPDFs } = require('./extract-pdfs');
const { schoolCalendar, calendarUtils } = require('./calendar-config');
const { extractCurriculumForDashboard } = require('./extract-curriculum-dashboard');

// Try to load Replicate - it's optional
let replicate = null;
try {
  replicate = require('replicate');
} catch (error) {
  console.log('⚠️ Replicate not installed - AI map generation disabled');
}

const app = express();
const PORT = process.env.PORT || 3000;

// GridFS bucket for slides
let slidesBucket;

// Middleware
app.use(cors());
app.use(express.json());

// Add Content Security Policy headers - Enhanced for font loading and Leaflet maps
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.gstatic.com https://unpkg.com https://cdn.jsdelivr.net; " +
    "font-src 'self' https://fonts.gstatic.com https://fonts.googleapis.com data: blob:; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://unpkg.com https://cdn.jsdelivr.net; " +
    "img-src 'self' data: https: blob:; " +
    "connect-src 'self' https: wss:; " +
    "frame-src 'self'; " +
    "object-src 'none'; " +
    "base-uri 'self';"
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
    
    // Add timeout and retry options for Railway
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000, // 10 second timeout
      socketTimeoutMS: 45000, // 45 second socket timeout
      maxPoolSize: 10, // Maintain up to 10 socket connections
      bufferCommands: false // Disable mongoose buffering
    });
    
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
    console.error('🔄 Server will continue without database features');
    return false;
  }
};

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'World Geography Curriculum API is running with Student Materials',
    timestamp: new Date().toISOString(),
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    uptime: Math.floor(process.uptime()),
    memory: process.memoryUsage(),
    version: '2.1.0-student-materials-complete'
  });
});

// Simple ping endpoint for Railway monitoring
app.get('/ping', (req, res) => {
  res.status(200).send('pong');
});

// Railway health check - simple text response
app.get('/healthz', (req, res) => {
  res.status(200).send('OK');
});

// Railway-specific health check
app.get('/railway-health', (req, res) => {
  res.status(200).json({
    service: 'world-geography-curriculum',
    status: 'healthy',
    timestamp: Date.now()
  });
});

// Serve the main lesson companion as the homepage
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'new-lesson-companion.html'));
});

// Explicit routes for Detective Academy files - Railway static file fix
app.get('/detective-academy', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'detective-academy', 'index.html'));
});

app.get('/detective-academy/teacher-guide-enhanced.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'detective-academy', 'teacher-guide-enhanced.html'));
});

app.get('/detective-academy/student-materials.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'detective-academy', 'student-materials.html'));
});

app.get('/detective-academy/presentation.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'detective-academy', 'presentation.html'));
});

// Handle presentation.html with slide parameters
app.get('/presentation.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'detective-academy', 'presentation.html'));
});

// Handle student-materials.html with direct access
app.get('/student-materials.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'detective-academy', 'student-materials.html'));
});

app.get('/detective-academy/overview.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'detective-academy', 'overview.html'));
});

// Serve handouts with explicit routes
app.get('/detective-academy/handouts/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'public', 'detective-academy', 'handouts', filename);
  
  // Check if file exists
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).send('Handout not found');
  }
});

// Explicit routes for all detective academy maps
app.get('/detective-academy/maps/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'public', 'detective-academy', 'maps', filename);
  
  // Check if file exists
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).send('Map not found');
  }
});

// Route for CSS and JS files
app.get('/detective-academy/css/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'public', 'detective-academy', 'css', filename);
  
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).send('CSS file not found');
  }
});

app.get('/detective-academy/js/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'public', 'detective-academy', 'js', filename);
  
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).send('JS file not found');
  }
});

// FALLBACK ROUTES for shorter URLs - handle /handouts/filename and /maps/filename
app.get('/handouts/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'public', 'detective-academy', 'handouts', filename);
  
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).send('Handout not found');
  }
});

app.get('/maps/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'public', 'detective-academy', 'maps', filename);
  
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).send('Map not found');
  }
});

// EXPLICIT ROUTES for individual handouts for direct access
app.get('/day-1-amazon-investigation.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'detective-academy', 'handouts', 'day-1-amazon-investigation.html'));
});

app.get('/day-2-amazon-climate.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'detective-academy', 'handouts', 'day-2-amazon-climate.html'));
});

app.get('/day-3-sahara-investigation.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'detective-academy', 'handouts', 'day-3-sahara-investigation.html'));
});

app.get('/day-4-sahara-navigation.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'detective-academy', 'handouts', 'day-4-sahara-navigation.html'));
});

app.get('/day-5-himalayan-investigation.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'detective-academy', 'handouts', 'day-5-himalayan-investigation.html'));
});

app.get('/day-6-himalayan-rescue.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'detective-academy', 'handouts', 'day-6-himalayan-rescue.html'));
});

app.get('/day-7-watershed-investigation.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'detective-academy', 'handouts', 'day-7-watershed-investigation.html'));
});

app.get('/day-8-water-cleanup.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'detective-academy', 'handouts', 'day-8-water-cleanup.html'));
});

app.get('/day-9-metropolitan-crisis.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'detective-academy', 'handouts', 'day-9-metropolitan-crisis.html'));
});

app.get('/day-10-infrastructure-recovery.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'detective-academy', 'handouts', 'day-10-infrastructure-recovery.html'));
});

app.get('/day-11-jurisdictional-crisis.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'detective-academy', 'handouts', 'day-11-jurisdictional-crisis.html'));
});

app.get('/day-12-treaty-resolution.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'detective-academy', 'handouts', 'day-12-treaty-resolution.html'));
});

// SUPER SIMPLE health check for Railway
app.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    database: dbStatus
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
    
    res.json(slideList.sort((a, b) => a.filename.localeCompare(b.filename)));
    
  } catch (error) {
    console.error('❌ Error listing slides:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get slide count
app.get('/api/slides/count', async (req, res) => {
  try {
    if (!slidesBucket) {
      return res.status(503).json({ error: 'Slides service not available' });
    }
    
    const files = await slidesBucket.find({}).toArray();
    res.json({ count: files.length });
    
  } catch (error) {
    console.error('❌ Error counting slides:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get individual slide by number
app.get('/api/slides/:number', async (req, res) => {
  try {
    const slideNumber = parseInt(req.params.number);
    
    if (!slidesBucket) {
      return res.status(503).json({ error: 'Slides service not available' });
    }
    
    if (isNaN(slideNumber) || slideNumber < 1) {
      return res.status(400).json({ error: 'Invalid slide number' });
    }
    
    // Find slide by number (looking for filenames that start with the padded number)
    const paddedNumber = slideNumber.toString().padStart(2, '0');
    const files = await slidesBucket.find({ 
      filename: { $regex: `^${paddedNumber}_`, $options: 'i' }
    }).toArray();
    
    if (files.length === 0) {
      return res.status(404).json({ error: `Slide ${slideNumber} not found` });
    }
    
    const file = files[0];
    
    // Set appropriate headers
    res.set({
      'Content-Type': 'image/png',
      'Content-Length': file.length,
      'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
    });
    
    // Stream the file from GridFS
    const downloadStream = slidesBucket.openDownloadStreamByName(file.filename);
    downloadStream.pipe(res);
    
    downloadStream.on('error', (error) => {
      console.error(`❌ Error streaming slide ${slideNumber}:`, error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Error streaming slide' });
      }
    });
    
  } catch (error) {
    console.error(`❌ Error getting slide ${req.params.number}:`, error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// AI Lesson Planner Route
app.get('/ai-lesson-planner.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'ai-lesson-planner.html'));
});

// Q1 Geographic Detectives Simulation Routes - Professional Pages
app.get('/simulation', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'geographic-detective-academy-main.html'));
});

app.get('/simulation/overview', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'detective-academy', 'overview.html'));
});

app.get('/simulation/teacher-guide', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'detective-academy', 'teacher-guide-enhanced.html'));
});

// API endpoint to serve teacher guide markdown content
app.get('/api/teacher-guide/:dayId', (req, res) => {
  const { dayId } = req.params;
  
  try {
    // Construct the file path
    let fileName = '';
    if (dayId === 'setup') {
      fileName = 'Setup_Day_Teacher_Guide.md';
    } else if (dayId.startsWith('day')) {
      const dayNum = dayId.replace('day', '');
      fileName = `Day_${dayNum}_Teacher_Guide.md`;
    }
    
    const filePath = path.join(__dirname, 'public', 'Curriculum', 'World Geography', 'Geographic_Detective_Academy_Curriculum', 'Teacher_Guides', fileName);
    
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      res.json({ success: true, content: content, filename: fileName });
    } else {
      res.json({ success: false, error: 'File not found', filename: fileName });
    }
  } catch (error) {
    console.error('Error reading teacher guide:', error);
    res.json({ success: false, error: error.message });
  }
});

app.get('/simulation/presentation', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'detective-academy', 'presentation.html'));
});

app.get('/simulation/student-dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'detective-academy', 'student-dashboard.html'));
});

app.get('/simulation/student-materials', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'detective-academy', 'student-materials.html'));
});

// Interactive Detective Maps Routes
app.get('/detective-academy/maps/amazon-investigation-map.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'detective-academy', 'maps', 'amazon-investigation-map.html'));
});

app.get('/detective-academy/maps/sahara-investigation-map.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'detective-academy', 'maps', 'sahara-investigation-map.html'));
});

app.get('/detective-academy/maps/himalayas-investigation-map.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'detective-academy', 'maps', 'himalayas-investigation-map.html'));
});

app.get('/detective-academy/maps/amazon-watershed-map.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'detective-academy', 'maps', 'amazon-watershed-map.html'));
});

app.get('/detective-academy/maps/metropolitan-urban-map.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'detective-academy', 'maps', 'metropolitan-urban-map.html'));
});

app.get('/detective-academy/maps/political-boundaries-map.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'detective-academy', 'maps', 'political-boundaries-map.html'));
});

// Maps Central Route
app.get('/detective-academy/maps-central', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'detective-academy', 'maps-central.html'));
});

// Student Materials Routes - Serve individual handouts and worksheets
app.get('/student-materials/:materialId', (req, res) => {
  const { materialId } = req.params;
  const { print } = req.query;
  
  try {
    let filePath = '';
    let fileName = '';
    
    // Map material IDs to actual files
    switch (materialId) {
      case 'setup-day-handout':
        fileName = 'Setup_Day_Student_Handout.md';
        break;
      case 'day-1-handout':
        fileName = 'Day_1_Student_Handout.md';
        break;
      case 'day-2-handout':
        fileName = 'Day_2_Student_Handout.md';
        break;
      case 'day-3-handout':
        fileName = 'Day_3_Student_Handout.md';
        break;
      case 'day-5-handout':
        fileName = 'Day_5_Student_Handout.md';
        break;
      case 'amazon-evidence-analysis':
        fileName = 'Amazon_Evidence_Analysis_Advanced.md';
        break;
      case 'investigation-journal':
        fileName = 'Investigation_Journal_Complete.md';
        break;
      case 'geographic-skills-rubrics':
        fileName = 'Assessment_Rubrics_DOK_3_4.md';
        break;
      // Add placeholder responses for materials that need to be created
      case 'detective-skills-assessment':
      case 'amazon-river-mapping':
      case 'day-4-handout':
      case 'desert-landforms-guide':
      case 'desert-survival-assessment':
      case 'day-6-handout':
      case 'elevation-impact-analysis':
      case 'cultural-artifact-investigation':
      case 'day-7-handout':
      case 'day-8-handout':
      case 'watershed-analysis-project':
      case 'river-pollution-investigation':
      case 'day-9-handout':
      case 'day-10-handout':
      case 'urban-planning-challenge':
      case 'metropolitan-mystery-mapping':
      case 'day-11-handout':
      case 'day-12-handout':
      case 'boundary-dispute-simulation':
      case 'political-geography-case-study':
      case 'case-portfolio-template':
      case 'final-detective-certification':
      case 'geographic-reference-guide':
        return res.send(`
          <!DOCTYPE html>
          <html lang="en">
          <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>🕵️ ${materialId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} - Coming Soon!</title>
              <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
              <style>
                  * { box-sizing: border-box; margin: 0; padding: 0; }
                  
                  body { 
                      font-family: 'Roboto', sans-serif; 
                      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                      min-height: 100vh;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      overflow: hidden;
                  }
                  
                  .container { 
                      max-width: 800px; 
                      background: rgba(255,255,255,0.95);
                      backdrop-filter: blur(20px);
                      border-radius: 25px;
                      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                      padding: 50px;
                      text-align: center;
                      border: 3px solid #ffd700;
                      position: relative;
                      animation: float 3s ease-in-out infinite;
                  }
                  
                  @keyframes float {
                      0%, 100% { transform: translateY(0px); }
                      50% { transform: translateY(-10px); }
                  }
                  
                  .header { 
                      margin-bottom: 40px; 
                  }
                  
                  .main-title {
                      font-family: 'Orbitron', monospace;
                      font-size: 2.5rem;
                      font-weight: 900;
                      background: linear-gradient(45deg, #ff6b35, #f7931e);
                      -webkit-background-clip: text;
                      background-clip: text;
                      -webkit-text-fill-color: transparent;
                      margin-bottom: 20px;
                      text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
                  }
                  
                  .subtitle {
                      font-size: 1.3rem;
                      color: #2c3e50;
                      font-weight: 600;
                      margin-bottom: 10px;
                  }
                  
                  .coming-soon-badge {
                      display: inline-block;
                      background: linear-gradient(45deg, #ff6b35, #f7931e);
                      color: white;
                      padding: 10px 25px;
                      border-radius: 50px;
                      font-family: 'Orbitron', monospace;
                      font-weight: 700;
                      font-size: 1.1rem;
                      margin: 20px 0;
                      box-shadow: 0 8px 25px rgba(255,107,53,0.3);
                      animation: pulse 2s infinite;
                  }
                  
                  @keyframes pulse {
                      0%, 100% { transform: scale(1); }
                      50% { transform: scale(1.05); }
                  }
                  
                  .placeholder { 
                      background: linear-gradient(135deg, #fff3cd, #ffeaa7);
                      border: 3px solid #f39c12;
                      padding: 30px; 
                      border-radius: 20px; 
                      margin: 30px 0;
                      box-shadow: 0 10px 30px rgba(243,156,18,0.2);
                  }
                  
                  .placeholder h3 {
                      color: #e67e22;
                      font-family: 'Orbitron', monospace;
                      font-size: 1.4rem;
                      margin-bottom: 20px;
                  }
                  
                  .placeholder p {
                      color: #2c3e50;
                      font-size: 1rem;
                      line-height: 1.6;
                      margin-bottom: 15px;
                  }
                  
                  .feature-list {
                      text-align: left;
                      margin: 20px 0;
                  }
                  
                  .feature-list li {
                      background: rgba(255,255,255,0.7);
                      margin: 10px 0;
                      padding: 15px;
                      border-radius: 10px;
                      border-left: 5px solid #3498db;
                      font-weight: 500;
                      transition: all 0.3s ease;
                  }
                  
                  .feature-list li:hover {
                      transform: translateX(10px);
                      background: rgba(255,255,255,0.9);
                      box-shadow: 0 8px 25px rgba(52,152,219,0.2);
                  }
                  
                  .back-link { 
                      display: inline-flex;
                      align-items: center;
                      gap: 10px;
                      margin-top: 30px; 
                      padding: 15px 30px; 
                      background: linear-gradient(45deg, #ffd700, #ffed4e);
                      color: #2c3e50; 
                      text-decoration: none; 
                      border-radius: 50px;
                      font-family: 'Orbitron', monospace;
                      font-weight: 700;
                      transition: all 0.4s ease;
                      box-shadow: 0 8px 25px rgba(255,215,0,0.3);
                      text-transform: uppercase;
                      letter-spacing: 1px;
                  }
                  
                  .back-link:hover {
                      transform: translateY(-5px) scale(1.05);
                      background: linear-gradient(45deg, #fff, #f0f0f0);
                      box-shadow: 0 15px 40px rgba(0,0,0,0.2);
                  }
                  
                  .progress-indicator {
                      margin: 25px 0;
                      background: #ecf0f1;
                      border-radius: 25px;
                      height: 10px;
                      overflow: hidden;
                  }
                  
                  .progress-bar {
                      height: 100%;
                      background: linear-gradient(90deg, #4ecdc4, #44a08d);
                      width: 60%;
                      border-radius: 25px;
                      animation: progress 3s ease-in-out infinite;
                  }
                  
                  @keyframes progress {
                      0%, 100% { width: 60%; }
                      50% { width: 75%; }
                  }
                  
                  .floating-icons {
                      position: absolute;
                      top: 0;
                      left: 0;
                      width: 100%;
                      height: 100%;
                      pointer-events: none;
                      overflow: hidden;
                  }
                  
                  .floating-icon {
                      position: absolute;
                      font-size: 2rem;
                      opacity: 0.1;
                      animation: float-icon 8s linear infinite;
                  }
                  
                  @keyframes float-icon {
                      0% { transform: translateY(100vh) rotate(0deg); }
                      100% { transform: translateY(-100px) rotate(360deg); }
                  }
                  
                  @media print { .back-link { display: none; } }
              </style>
          </head>
          <body>
              <div class="floating-icons">
                  <div class="floating-icon" style="left: 10%; animation-delay: 0s;">🗺️</div>
                  <div class="floating-icon" style="left: 20%; animation-delay: 1s;">🧭</div>
                  <div class="floating-icon" style="left: 30%; animation-delay: 2s;">📍</div>
                  <div class="floating-icon" style="left: 40%; animation-delay: 3s;">🌍</div>
                  <div class="floating-icon" style="left: 50%; animation-delay: 4s;">🔍</div>
                  <div class="floating-icon" style="left: 60%; animation-delay: 5s;">📚</div>
                  <div class="floating-icon" style="left: 70%; animation-delay: 6s;">🎯</div>
                  <div class="floating-icon" style="left: 80%; animation-delay: 7s;">⭐</div>
                  <div class="floating-icon" style="left: 90%; animation-delay: 8s;">🚀</div>
              </div>
              
              <div class="container">
                  <div class="header">
                      <h1 class="main-title">🕵️ Geographic Detective Academy</h1>
                      <h2 class="subtitle">${materialId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</h2>
                      <div class="coming-soon-badge">🚧 COMING SOON 🚧</div>
                  </div>
                  
                  <div class="placeholder">
                      <h3>🎮 Epic Worksheet Under Development!</h3>
                      <p><strong>Material Type:</strong> ${materialId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                      <p><strong>Status:</strong> Our team of expert geographic detectives is crafting this awesome interactive worksheet just for you!</p>
                      <p><strong>What to Expect:</strong> This won't be your typical boring worksheet. We're building something that's going to blow your mind with cool geographic challenges and interactive elements!</p>
                      
                      <div class="progress-indicator">
                          <div class="progress-bar"></div>
                      </div>
                      <p style="font-size: 0.9rem; color: #7f8c8d;">Development Progress: 60% Complete</p>
                      
                      <h4 style="color: #e67e22; margin: 20px 0 15px 0;">🎯 What's Coming:</h4>
                      <ul class="feature-list">
                          <li><strong>🎮 Gamified Learning:</strong> Interactive challenges that make geography feel like a video game</li>
                          <li><strong>🔍 Detective Missions:</strong> Real-world case studies with evidence analysis</li>
                          <li><strong>📱 Tech Integration:</strong> QR codes, augmented reality elements, and digital tools</li>
                          <li><strong>🏆 Achievement System:</strong> Unlock badges and level up your geographic skills</li>
                          <li><strong>🌐 Global Connections:</strong> Connect with students worldwide working on similar cases</li>
                      </ul>
                      
                      <p style="font-style: italic; color: #34495e;">📍 <strong>Sneak Peek:</strong> This worksheet will include interactive maps, 3D geographic models, and even some AR elements that you can access with your phone!</p>
                  </div>
                  
                  <a href="/simulation/student-materials" class="back-link">
                      <span>🏠</span>
                      <span>Back to Detective Hub</span>
                  </a>
              </div>
          </body>
          </html>
        `);
      default:
        return res.status(404).json({ error: 'Material not found' });
    }
    
    filePath = path.join(__dirname, 'public', 'Curriculum', 'World Geography', 'Geographic_Detective_Academy_Curriculum', 'Student_Handouts', fileName);
    
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      
      if (print === 'true') {
        // Return awesome print-friendly HTML version
        const processedContent = content
          .replace(/^# (.+)$/gm, '<h1 class="main-title">🕵️ $1</h1>')
          .replace(/^## (.+)$/gm, '<h2 class="section-title">📋 $1</h2>')
          .replace(/^### (.+)$/gm, '<h3 class="subsection-title">🔍 $1</h3>')
          .replace(/^#### (.+)$/gm, '<h4 class="mini-title">▶️ $1</h4>')
          .replace(/\*\*(.+?)\*\*/g, '<strong class="highlight">$1</strong>')
          .replace(/\*(.+?)\*/g, '<em class="emphasis">$1</em>')
          .replace(/`(.+?)`/g, '<code class="inline-code">$1</code>')
          .replace(/^\| (.+) \|$/gm, (match, content) => {
            const cells = content.split(' | ').map(cell => `<td>${cell.trim()}</td>`).join('');
            return `<tr>${cells}</tr>`;
          })
          .replace(/\[LARGE (.+?) SPACE\]/g, '<div class="drawing-space large">📍 $1 - Draw or write your response here</div>')
          .replace(/\[(.+?) SPACE\]/g, '<div class="drawing-space">📝 $1</div>')
          .replace(/_{10,}/g, '<div class="fill-line"></div>')
          .replace(/^- (.+)$/gm, '<li class="bullet-point">• $1</li>')
          .replace(/^\d+\. (.+)$/gm, '<li class="numbered-point">$1</li>')
          .replace(/\n\n/g, '</p><p>')
          .replace(/^\s*$/gm, '');

        const htmlContent = `
          <!DOCTYPE html>
          <html lang="en">
          <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>🕵️ ${materialId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} - Detective Worksheet</title>
              <style>
                  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Roboto:wght@300;400;500;700&display=swap');
                  
                  * { box-sizing: border-box; }
                  
                  body { 
                      font-family: 'Roboto', sans-serif; 
                      font-size: 11pt; 
                      line-height: 1.4; 
                      margin: 0.4in; 
                      background: white;
                      color: #1a1a2e;
                  }
                  
                  .main-title { 
                      font-family: 'Orbitron', monospace; 
                      font-size: 20pt; 
                      font-weight: 900;
                      text-align: center; 
                      background: linear-gradient(45deg, #ff6b35, #f7931e);
                      -webkit-background-clip: text;
                      background-clip: text;
                      -webkit-text-fill-color: transparent;
                      text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
                      border: 3px solid #ff6b35;
                      padding: 15pt;
                      border-radius: 15px;
                      margin: 0 0 20pt 0;
                      position: relative;
                  }
                  
                  .main-title::before {
                      content: "🌟";
                      position: absolute;
                      top: -10pt;
                      left: 15pt;
                      font-size: 16pt;
                  }
                  
                  .main-title::after {
                      content: "🌟";
                      position: absolute;
                      top: -10pt;
                      right: 15pt;
                      font-size: 16pt;
                  }
                  
                  .section-title { 
                      font-family: 'Orbitron', monospace;
                      font-size: 16pt; 
                      font-weight: 700;
                      color: #1a1a2e;
                      background: linear-gradient(90deg, #4ecdc4, #44a08d);
                      color: white;
                      padding: 10pt 15pt;
                      border-radius: 8px;
                      margin: 20pt 0 10pt 0;
                      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                  }
                  
                  .subsection-title { 
                      font-family: 'Orbitron', monospace;
                      font-size: 14pt; 
                      font-weight: 500;
                      color: #2c3e50;
                      background: #ecf0f1;
                      padding: 8pt 12pt;
                      border-left: 5px solid #3498db;
                      margin: 15pt 0 8pt 0;
                      border-radius: 0 8px 8px 0;
                  }
                  
                  .mini-title {
                      font-family: 'Roboto', sans-serif;
                      font-size: 12pt;
                      font-weight: 700;
                      color: #8e44ad;
                      margin: 12pt 0 6pt 0;
                      padding: 4pt 0;
                      border-bottom: 2px dotted #8e44ad;
                  }
                  
                  .highlight { 
                      background: linear-gradient(120deg, #ffecd2 0%, #fcb69f 100%);
                      padding: 2pt 4pt;
                      border-radius: 4px;
                      font-weight: 700;
                      color: #2c3e50;
                  }
                  
                  .emphasis {
                      color: #e74c3c;
                      font-weight: 500;
                  }
                  
                  .inline-code {
                      background: #2c3e50;
                      color: #ecf0f1;
                      padding: 2pt 6pt;
                      border-radius: 4px;
                      font-family: 'Orbitron', monospace;
                      font-size: 10pt;
                  }
                  
                  table { 
                      width: 100%; 
                      border-collapse: collapse; 
                      margin: 15pt 0;
                      background: white;
                      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                      border-radius: 8px;
                      overflow: hidden;
                  }
                  
                  table, th, td { 
                      border: 2px solid #34495e;
                  }
                  
                  th { 
                      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                      color: white;
                      font-weight: 700;
                      padding: 12pt;
                      text-align: center;
                      font-family: 'Orbitron', monospace;
                  }
                  
                  td { 
                      padding: 10pt;
                      background: #f8f9fa;
                      min-height: 30pt;
                      vertical-align: top;
                  }
                  
                  tr:nth-child(even) td {
                      background: #e9ecef;
                  }
                  
                  .drawing-space { 
                      border: 3px dashed #e74c3c;
                      background: linear-gradient(45deg, #fff5f5 25%, transparent 25%), 
                                  linear-gradient(-45deg, #fff5f5 25%, transparent 25%), 
                                  linear-gradient(45deg, transparent 75%, #fff5f5 75%), 
                                  linear-gradient(-45deg, transparent 75%, #fff5f5 75%);
                      background-size: 20px 20px;
                      background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
                      height: 120pt;
                      margin: 15pt 0;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      font-weight: 700;
                      color: #e74c3c;
                      font-size: 11pt;
                      border-radius: 12px;
                      text-align: center;
                      padding: 15pt;
                  }
                  
                  .drawing-space.large {
                      height: 200pt;
                      font-size: 13pt;
                  }
                  
                  .fill-line { 
                      border-bottom: 2px solid #3498db;
                      min-height: 20pt;
                      margin: 8pt 0;
                      background: linear-gradient(to right, transparent 0%, #ecf0f1 50%, transparent 100%);
                  }
                  
                  .bullet-point, .numbered-point {
                      margin: 6pt 0;
                      padding-left: 8pt;
                      color: #2c3e50;
                  }
                  
                  .bullet-point {
                      list-style: none;
                      position: relative;
                  }
                  
                  .bullet-point::before {
                      content: "🔸";
                      position: absolute;
                      left: -15pt;
                  }
                  
                  p {
                      margin: 8pt 0;
                      text-align: justify;
                  }
                  
                  .detective-badge {
                      position: absolute;
                      top: 20pt;
                      right: 20pt;
                      width: 60pt;
                      height: 60pt;
                      background: radial-gradient(circle, #ffd700, #ffed4e);
                      border-radius: 50%;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      font-size: 24pt;
                      border: 3px solid #ff6b35;
                      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                  }
                  
                  @page { 
                      margin: 0.4in;
                      @top-right {
                          content: "🕵️ Geographic Detective Academy";
                          font-family: 'Orbitron', monospace;
                          font-size: 8pt;
                          color: #7f8c8d;
                      }
                  }
                  
                  @media print { 
                      body { 
                          -webkit-print-color-adjust: exact;
                          print-color-adjust: exact;
                      }
                      .no-print { display: none; }
                      .main-title {
                          color: #ff6b35 !important;
                          -webkit-text-fill-color: #ff6b35 !important;
                      }
                  }
              </style>
          </head>
          <body>
              <div class="detective-badge">🕵️</div>
              <div class="content">
                  <p>${processedContent}</p>
              </div>
          </body>
          </html>
        `;
        res.send(htmlContent);
      } else {
        // Return AWESOME gaming-style HTML version for viewing
        const processedContent = content
          .replace(/^# (.+)$/gm, '<h1 class="main-title">🕵️ $1</h1>')
          .replace(/^## (.+)$/gm, '<h2 class="section-title">📋 $1</h2>')
          .replace(/^### (.+)$/gm, '<h3 class="subsection-title">🔍 $1</h3>')
          .replace(/^#### (.+)$/gm, '<h4 class="mini-title">▶️ $1</h4>')
          .replace(/\*\*(.+?)\*\*/g, '<strong class="highlight">$1</strong>')
          .replace(/\*(.+?)\*/g, '<em class="emphasis">$1</em>')
          .replace(/`(.+?)`/g, '<code class="inline-code">$1</code>')
          .replace(/^\| (.+) \|$/gm, (match, content) => {
            const cells = content.split(' | ').map(cell => `<td>${cell.trim()}</td>`).join('');
            return `<tr>${cells}</tr>`;
          })
          .replace(/\[LARGE (.+?) SPACE\]/g, '<div class="drawing-space large interactive" onclick="this.classList.toggle(\'active\')">📍 $1 - Click to activate drawing mode!</div>')
          .replace(/\[(.+?) SPACE\]/g, '<div class="drawing-space interactive" onclick="this.classList.toggle(\'active\')">📝 $1 - Click here!</div>')
          .replace(/_{10,}/g, '<input type="text" class="fill-input" placeholder="Type your answer here...">')
          .replace(/^- (.+)$/gm, '<li class="bullet-point">🔸 $1</li>')
          .replace(/^\d+\. (.+)$/gm, '<li class="numbered-point">$1</li>')
          .replace(/\n\n/g, '</p><p>')
          .replace(/^\s*$/gm, '');

        const htmlContent = `
          <!DOCTYPE html>
          <html lang="en">
          <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>🕵️ ${materialId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} - Geographic Detective Academy</title>
              <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Roboto:wght@300;400;500;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
              <style>
                  :root {
                      --primary-color: #ff6b35;
                      --secondary-color: #4ecdc4;
                      --accent-color: #ffd700;
                      --dark-color: #1a1a2e;
                      --light-color: #f7f9fc;
                      --success-color: #2ecc71;
                      --danger-color: #e74c3c;
                      --info-color: #3498db;
                  }
                  
                  * { 
                      box-sizing: border-box; 
                      margin: 0; 
                      padding: 0; 
                  }
                  
                  body { 
                      font-family: 'Roboto', sans-serif; 
                      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                      min-height: 100vh;
                      color: #333;
                      overflow-x: hidden;
                  }
                  
                  .floating-particles {
                      position: fixed;
                      top: 0;
                      left: 0;
                      width: 100%;
                      height: 100%;
                      pointer-events: none;
                      z-index: 1;
                  }
                  
                  .particle {
                      position: absolute;
                      background: var(--accent-color);
                      border-radius: 50%;
                      opacity: 0.6;
                      animation: float 6s ease-in-out infinite;
                  }
                  
                  @keyframes float {
                      0%, 100% { transform: translateY(0px) rotate(0deg); }
                      50% { transform: translateY(-20px) rotate(180deg); }
                  }
                  
                  .container { 
                      max-width: 1200px; 
                      margin: 0 auto; 
                      background: rgba(255,255,255,0.95);
                      backdrop-filter: blur(20px);
                      border-radius: 25px;
                      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                      padding: 40px;
                      margin-top: 20px;
                      margin-bottom: 20px;
                      position: relative;
                      z-index: 10;
                      border: 3px solid var(--accent-color);
                  }
                  
                  .header { 
                      text-align: center; 
                      margin-bottom: 40px; 
                      position: relative;
                      padding: 30px;
                      background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
                      border-radius: 20px;
                      color: white;
                      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                  }
                  
                  .header::before {
                      content: "🌟";
                      position: absolute;
                      top: -15px;
                      left: 30px;
                      font-size: 2rem;
                      animation: pulse 2s infinite;
                  }
                  
                  .header::after {
                      content: "🌟";
                      position: absolute;
                      top: -15px;
                      right: 30px;
                      font-size: 2rem;
                      animation: pulse 2s infinite 1s;
                  }
                  
                  @keyframes pulse {
                      0%, 100% { transform: scale(1); }
                      50% { transform: scale(1.2); }
                  }
                  
                  .main-title { 
                      font-family: 'Orbitron', monospace; 
                      font-size: 3rem; 
                      font-weight: 900;
                      margin-bottom: 15px;
                      text-shadow: 2px 2px 8px rgba(0,0,0,0.3);
                      background: linear-gradient(45deg, #fff, #f0f0f0);
                      -webkit-background-clip: text;
                      background-clip: text;
                      -webkit-text-fill-color: transparent;
                  }
                  
                  .subtitle {
                      font-family: 'Space Mono', monospace;
                      font-size: 1.2rem;
                      opacity: 0.9;
                      font-weight: 400;
                  }
                  
                  .section-title { 
                      font-family: 'Orbitron', monospace;
                      font-size: 1.8rem; 
                      font-weight: 700;
                      background: linear-gradient(90deg, var(--secondary-color), var(--info-color));
                      color: white;
                      padding: 20px 25px;
                      border-radius: 15px;
                      margin: 30px 0 20px 0;
                      box-shadow: 0 8px 25px rgba(0,0,0,0.15);
                      transform: translateX(-10px);
                      transition: all 0.3s ease;
                      cursor: pointer;
                  }
                  
                  .section-title:hover {
                      transform: translateX(0px) scale(1.02);
                      box-shadow: 0 12px 35px rgba(0,0,0,0.25);
                  }
                  
                  .subsection-title { 
                      font-family: 'Orbitron', monospace;
                      font-size: 1.4rem; 
                      font-weight: 500;
                      color: var(--dark-color);
                      background: linear-gradient(135deg, #ecf0f1, #bdc3c7);
                      padding: 15px 20px;
                      border-left: 8px solid var(--info-color);
                      margin: 25px 0 15px 0;
                      border-radius: 0 15px 15px 0;
                      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                      transition: all 0.3s ease;
                  }
                  
                  .subsection-title:hover {
                      transform: translateX(10px);
                      border-left-width: 12px;
                  }
                  
                  .mini-title {
                      font-family: 'Roboto', sans-serif;
                      font-size: 1.1rem;
                      font-weight: 700;
                      color: var(--primary-color);
                      margin: 20px 0 10px 0;
                      padding: 8px 0;
                      border-bottom: 3px dotted var(--primary-color);
                      position: relative;
                  }
                  
                  .mini-title::before {
                      content: "⚡";
                      margin-right: 8px;
                  }
                  
                  .highlight { 
                      background: linear-gradient(120deg, var(--accent-color), #ffed4e);
                      padding: 4px 8px;
                      border-radius: 8px;
                      font-weight: 700;
                      color: var(--dark-color);
                      box-shadow: 0 2px 8px rgba(255,215,0,0.3);
                      transition: all 0.3s ease;
                  }
                  
                  .highlight:hover {
                      transform: scale(1.05);
                      box-shadow: 0 4px 15px rgba(255,215,0,0.5);
                  }
                  
                  .emphasis {
                      color: var(--danger-color);
                      font-weight: 600;
                      font-style: italic;
                  }
                  
                  .inline-code {
                      background: var(--dark-color);
                      color: var(--accent-color);
                      padding: 4px 8px;
                      border-radius: 6px;
                      font-family: 'Space Mono', monospace;
                      font-size: 0.9rem;
                      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                  }
                  
                  table { 
                      width: 100%; 
                      border-collapse: collapse; 
                      margin: 25px 0;
                      background: white;
                      box-shadow: 0 8px 25px rgba(0,0,0,0.15);
                      border-radius: 15px;
                      overflow: hidden;
                      border: 3px solid var(--secondary-color);
                  }
                  
                  th { 
                      background: linear-gradient(135deg, var(--primary-color), var(--danger-color));
                      color: white;
                      font-weight: 700;
                      padding: 18px;
                      text-align: center;
                      font-family: 'Orbitron', monospace;
                      font-size: 1rem;
                      text-transform: uppercase;
                      letter-spacing: 1px;
                  }
                  
                  td { 
                      padding: 15px;
                      background: #f8f9fa;
                      min-height: 50px;
                      vertical-align: top;
                      border-bottom: 2px solid #e9ecef;
                      transition: all 0.3s ease;
                  }
                  
                  tr:nth-child(even) td {
                      background: #e3f2fd;
                  }
                  
                  tr:hover td {
                      background: var(--accent-color) !important;
                      transform: scale(1.01);
                      color: var(--dark-color);
                      font-weight: 600;
                  }
                  
                  .drawing-space { 
                      border: 4px dashed var(--danger-color);
                      background: radial-gradient(circle, #fff5f5, #ffeaa7);
                      min-height: 150px;
                      margin: 25px 0;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      font-weight: 700;
                      color: var(--danger-color);
                      font-size: 1.1rem;
                      border-radius: 20px;
                      text-align: center;
                      padding: 25px;
                      cursor: pointer;
                      transition: all 0.4s ease;
                      position: relative;
                      overflow: hidden;
                  }
                  
                  .drawing-space::before {
                      content: "";
                      position: absolute;
                      top: -50%;
                      left: -50%;
                      width: 200%;
                      height: 200%;
                      background: linear-gradient(45deg, transparent, rgba(255,255,255,0.3), transparent);
                      transform: rotate(45deg);
                      transition: all 0.6s ease;
                      opacity: 0;
                  }
                  
                  .drawing-space:hover::before {
                      opacity: 1;
                      transform: rotate(45deg) translate(50%, 50%);
                  }
                  
                  .drawing-space.large {
                      min-height: 250px;
                      font-size: 1.3rem;
                  }
                  
                  .drawing-space.interactive:hover {
                      transform: scale(1.02);
                      box-shadow: 0 15px 40px rgba(231,76,60,0.3);
                      background: radial-gradient(circle, #fff, var(--accent-color));
                      color: var(--dark-color);
                  }
                  
                  .drawing-space.active {
                      background: linear-gradient(45deg, var(--success-color), var(--secondary-color));
                      color: white;
                      border-color: var(--success-color);
                      animation: success-pulse 1s ease;
                  }
                  
                  @keyframes success-pulse {
                      0% { transform: scale(1); }
                      50% { transform: scale(1.05); }
                      100% { transform: scale(1); }
                  }
                  
                  .fill-input {
                      width: 100%;
                      padding: 12px 15px;
                      border: 3px solid var(--info-color);
                      border-radius: 10px;
                      font-size: 1rem;
                      margin: 10px 0;
                      background: linear-gradient(135deg, #f8f9fa, #e9ecef);
                      transition: all 0.3s ease;
                      font-family: 'Roboto', sans-serif;
                  }
                  
                  .fill-input:focus {
                      outline: none;
                      border-color: var(--success-color);
                      background: white;
                      box-shadow: 0 8px 25px rgba(46,204,113,0.2);
                      transform: scale(1.02);
                  }
                  
                  .bullet-point, .numbered-point {
                      margin: 12px 0;
                      padding: 10px 15px;
                      background: linear-gradient(135deg, #f8f9fa, #e3f2fd);
                      border-radius: 10px;
                      border-left: 4px solid var(--secondary-color);
                      list-style: none;
                      transition: all 0.3s ease;
                      cursor: pointer;
                  }
                  
                  .bullet-point:hover, .numbered-point:hover {
                      transform: translateX(10px);
                      background: linear-gradient(135deg, var(--accent-color), #ffed4e);
                      border-left-color: var(--primary-color);
                      box-shadow: 0 8px 25px rgba(255,215,0,0.3);
                  }
                  
                  p {
                      margin: 15px 0;
                      text-align: justify;
                      line-height: 1.6;
                      font-size: 1rem;
                  }
                  
                  .navigation {
                      display: flex;
                      justify-content: center;
                      gap: 20px;
                      margin-top: 40px;
                      padding: 30px;
                      background: linear-gradient(135deg, #667eea, #764ba2);
                      border-radius: 20px;
                      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                  }
                  
                  .back-link, .print-link { 
                      display: inline-flex;
                      align-items: center;
                      gap: 10px;
                      padding: 15px 30px; 
                      background: linear-gradient(45deg, var(--accent-color), #ffed4e);
                      color: var(--dark-color);
                      text-decoration: none; 
                      border-radius: 50px; 
                      border: 3px solid var(--dark-color);
                      font-family: 'Orbitron', monospace; 
                      font-weight: 700; 
                      transition: all 0.4s ease;
                      text-transform: uppercase;
                      letter-spacing: 1px;
                      box-shadow: 0 8px 25px rgba(0,0,0,0.2);
                  }
                  
                  .back-link:hover, .print-link:hover { 
                      transform: translateY(-5px) scale(1.05);
                      background: linear-gradient(45deg, #fff, var(--light-color));
                      box-shadow: 0 15px 40px rgba(0,0,0,0.3);
                      border-color: var(--primary-color);
                  }
                  
                  .print-link {
                      background: linear-gradient(45deg, var(--info-color), var(--secondary-color));
                      color: white;
                      border-color: white;
                  }
                  
                  .print-link:hover {
                      background: linear-gradient(45deg, var(--success-color), var(--secondary-color));
                  }
                  
                  .detective-badge {
                      position: fixed;
                      top: 30px;
                      right: 30px;
                      width: 80px;
                      height: 80px;
                      background: radial-gradient(circle, var(--accent-color), #ffed4e);
                      border-radius: 50%;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      font-size: 2rem;
                      border: 4px solid var(--primary-color);
                      box-shadow: 0 8px 25px rgba(0,0,0,0.3);
                      z-index: 1000;
                      animation: badge-float 3s ease-in-out infinite;
                      cursor: pointer;
                  }
                  
                  .detective-badge:hover {
                      animation-play-state: paused;
                      transform: scale(1.1) rotate(10deg);
                  }
                  
                  @keyframes badge-float {
                      0%, 100% { transform: translateY(0px); }
                      50% { transform: translateY(-10px); }
                  }
                  
                  .progress-bar {
                      position: fixed;
                      top: 0;
                      left: 0;
                      width: 100%;
                      height: 4px;
                      background: var(--dark-color);
                      z-index: 1001;
                  }
                  
                  .progress-fill {
                      height: 100%;
                      background: linear-gradient(90deg, var(--primary-color), var(--secondary-color), var(--accent-color));
                      width: 0%;
                      transition: width 0.3s ease;
                  }
                  
                  @media (max-width: 768px) {
                      .container { 
                          margin: 10px; 
                          padding: 20px; 
                      }
                      
                      .main-title { 
                          font-size: 2rem; 
                      }
                      
                      .navigation {
                          flex-direction: column;
                          align-items: center;
                      }
                      
                      .detective-badge {
                          width: 60px;
                          height: 60px;
                          font-size: 1.5rem;
                          top: 20px;
                          right: 20px;
                      }
                  }
              </style>
          </head>
          <body>
              <div class="floating-particles">
                  <div class="particle" style="left: 10%; width: 6px; height: 6px; animation-delay: 0s;"></div>
                  <div class="particle" style="left: 20%; width: 8px; height: 8px; animation-delay: 1s;"></div>
                  <div class="particle" style="left: 30%; width: 4px; height: 4px; animation-delay: 2s;"></div>
                  <div class="particle" style="left: 40%; width: 10px; height: 10px; animation-delay: 3s;"></div>
                  <div class="particle" style="left: 50%; width: 6px; height: 6px; animation-delay: 4s;"></div>
                  <div class="particle" style="left: 60%; width: 8px; height: 8px; animation-delay: 5s;"></div>
                  <div class="particle" style="left: 70%; width: 4px; height: 4px; animation-delay: 0.5s;"></div>
                  <div class="particle" style="left: 80%; width: 6px; height: 6px; animation-delay: 1.5s;"></div>
                  <div class="particle" style="left: 90%; width: 8px; height: 8px; animation-delay: 2.5s;"></div>
              </div>
              
              <div class="progress-bar">
                  <div class="progress-fill" id="progressFill"></div>
              </div>
              
              <div class="detective-badge" onclick="this.style.transform='scale(1.2) rotate(360deg)'">🕵️</div>
              
              <div class="container">
                  <div class="header">
                      <h1 class="main-title">Geographic Detective Academy</h1>
                      <div class="subtitle">${materialId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</div>
                  </div>
                  <div class="content">
                      <p>${processedContent}</p>
                  </div>
                  <div class="navigation">
                      <a href="/simulation/student-materials" class="back-link">
                          <span>🏠</span>
                          <span>Back to Hub</span>
                      </a>
                      <a href="/student-materials/${materialId}?print=true" class="print-link" target="_blank">
                          <span>🖨️</span>
                          <span>Print Version</span>
                      </a>
                  </div>
              </div>
              
              <script>
                  // Scroll progress indicator
                  window.addEventListener('scroll', () => {
                      const scrolled = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
                      document.getElementById('progressFill').style.width = scrolled + '%';
                  });
                  
                  // Interactive elements
                  document.querySelectorAll('.section-title').forEach(title => {
                      title.addEventListener('click', () => {
                          title.style.transform = 'translateX(0px) scale(1.1)';
                          setTimeout(() => {
                              title.style.transform = 'translateX(-10px) scale(1)';
                          }, 200);
                      });
                  });
                  
                  // Fill inputs auto-save (simulated)
                  document.querySelectorAll('.fill-input').forEach(input => {
                      input.addEventListener('input', () => {
                          localStorage.setItem('detective_' + input.placeholder, input.value);
                      });
                      
                      // Load saved values
                      const saved = localStorage.getItem('detective_' + input.placeholder);
                      if (saved) input.value = saved;
                  });
                  
                  // Add some random particles
                  function createParticle() {
                      const particle = document.createElement('div');
                      particle.className = 'particle';
                      particle.style.left = Math.random() * 100 + '%';
                      particle.style.width = particle.style.height = (Math.random() * 8 + 4) + 'px';
                      particle.style.animationDelay = Math.random() * 6 + 's';
                      document.querySelector('.floating-particles').appendChild(particle);
                      
                      setTimeout(() => particle.remove(), 6000);
                  }
                  
                  setInterval(createParticle, 3000);
              </script>
          </body>
          </html>
        `;
        res.send(htmlContent);
      }
    } else {
      res.status(404).json({ error: 'Material file not found', filename: fileName });
    }
  } catch (error) {
    console.error('Error serving student material:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/simulation/maps', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'detective-academy', 'maps-central.html'));
});

// Individual map routes for printing
app.get('/maps/amazon-rainforest', (req, res) => {
    const isPrint = req.query.print === 'true';
    res.send(generateMapHTML('Amazon Rainforest Investigation Map', 'amazon', '🌳', [
        'Complete topographic relief showing elevation changes',
        'Major rivers: Amazon, Orinoco, and tributary systems',
        'Vegetation zones: dense canopy, secondary growth, clearings',
        'Evidence markers at key investigation sites',
        'Coordinate grid for precise location tracking',
        'Scale: 1:2,500,000 with detailed insets at 1:100,000'
    ], isPrint));
});

app.get('/maps/sahara-desert', (req, res) => {
    const isPrint = req.query.print === 'true';
    res.send(generateMapHTML('Sahara Desert Investigation Map', 'sahara', '🏜️', [
        'Climate zones: hyperarid, arid, and semi-arid regions',
        'Major oases and water sources with seasonal availability',
        'Historical caravan routes and modern transportation',
        'Sand dune systems and rocky plateau regions',
        'Astronomical navigation points and compass references',
        'Scale: 1:5,000,000 covering 9 million km² desert area'
    ], isPrint));
});

app.get('/maps/himalayas-mountains', (req, res) => {
    const isPrint = req.query.print === 'true';
    res.send(generateMapHTML('Himalayas Cultural Geography Map', 'himalayas', '🏔️', [
        'Elevation contours from 500m to 8,848m (Mt. Everest)',
        'Buddhist and Hindu monasteries with cultural significance',
        'Mountain passes: Thorong La, Cho La, Renjo La',
        'Vertical climate zones from subtropical to alpine',
        'Cultural regions: Tibet, Nepal, Bhutan, Northern India',
        'Scale: 1:1,000,000 with monastery detail insets'
    ], isPrint));
});

app.get('/maps/amazon-river-basin', (req, res) => {
    const isPrint = req.query.print === 'true';
    res.send(generateMapHTML('Amazon River Basin Watershed Map', 'river', '🌊', [
        'Complete watershed covering 7 million km²',
        'Pollution sources: mining, agriculture, urban runoff',
        'Water quality monitoring stations and data points',
        'Flow direction arrows and seasonal variation zones',
        'Human settlements and population impact areas',
        'Scale: 1:7,500,000 with detailed pollution site insets'
    ], isPrint));
});

app.get('/maps/metropolitan-urban', (req, res) => {
    const isPrint = req.query.print === 'true';
    res.send(generateMapHTML('Metropolitan Urban Planning Map', 'urban', '🏙️', [
        'Land use zones: residential, commercial, industrial',
        'Transportation networks: metro, bus, highways',
        'Green spaces: parks, forests, urban agriculture',
        'Development timeline from 1950-2024',
        'Population density per square kilometer',
        'Scale: 1:50,000 with neighborhood detail at 1:10,000'
    ], isPrint));
});

app.get('/maps/political-boundaries', (req, res) => {
    const isPrint = req.query.print === 'true';
    res.send(generateMapHTML('Political Boundaries & Jurisdictions Map', 'political', '🌐', [
        'International boundary lines and border checkpoints',
        'Territorial waters and Exclusive Economic Zones',
        'Federal, state, and local jurisdictional boundaries',
        'Treaty zones and international agreements',
        'Disputed territories and conflict zones',
        'Scale: 1:10,000,000 with border detail insets'
    ], isPrint));
});

app.get('/maps/world-physical', (req, res) => {
    const isPrint = req.query.print === 'true';
    res.send(generateMapHTML('World Physical Geography Reference', 'world', '🌍', [
        'Major mountain ranges: Himalayas, Andes, Rocky Mountains',
        'Desert regions: Sahara, Gobi, Australian Outback',
        'Ocean currents: Gulf Stream, Kuroshio, Antarctic Circumpolar',
        'Latitude/longitude grid with major coordinate lines',
        'Physical features legend and elevation key',
        'Scale: 1:50,000,000 (Robinson Projection)'
    ], isPrint));
});

app.get('/maps/navigation-tools', (req, res) => {
    const isPrint = req.query.print === 'true';
    res.send(generateMapHTML('Detective Navigation Tools', 'tools', '🧭', [
        'Compass rose with 16-point directional system',
        'Scale conversion charts for different map projections',
        'Coordinate system templates (lat/long, UTM, MGRS)',
        'Distance measurement tools and calculations',
        'Map symbol legend for geographic features',
        'Print size: A4 landscape for easy field use'
    ], isPrint));
});

app.get('/maps/blank-investigation', (req, res) => {
    const isPrint = req.query.print === 'true';
    res.send(generateMapHTML('Blank Investigation Workspace', 'workspace', '📝', [
        'Evidence tracking grid with numbered sections',
        'Blank regional outline maps for annotation',
        'Data collection tables and measurement grids',
        'Investigation timeline chart template',
        'Hypothesis testing and conclusion workspace',
        'Multiple copies for team investigation work'
    ], isPrint));
});

app.get('/maps/detective-atlas', (req, res) => {
    const isPrint = req.query.print === 'true';
    const isDownload = req.query.download === 'true';
    
    if (isDownload) {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="Geographic-Detective-Atlas.pdf"');
    }
    
    res.send(generateAtlasHTML(isPrint, isDownload));
});

app.get('/simulation/progress', (req, res) => {
  res.send('<h1>Progress</h1><p>Under construction</p><a href="/simulation">Back to Hub</a>');
});

app.get('/simulation/settings', (req, res) => {
  res.send('<h1>Settings</h1><p>Under construction</p><a href="/simulation">Back to Hub</a>');
});

// Legacy redirect for old broken panel system
app.get('/simulation/geographic-detective-academy', (req, res) => {
  res.redirect('/simulation');
});

// Block access to the old broken file
app.get('/geographic-detective-academy.html', (req, res) => {
  res.redirect(301, '/simulation');
});

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
    // First try to get from database
    const modules = await Module.find().sort({ moduleNumber: 1 }).populate('curriculum');
    
    if (modules.length > 0) {
      res.json(modules);
      return;
    }
    
    // Fallback: get from lesson map file
    const enhancedMapPath = path.join(__dirname, 'lesson-calendar-map-enhanced.json');
    const regularMapPath = path.join(__dirname, 'lesson-calendar-map.json');
    
    let mapPath = enhancedMapPath;
    if (!fs.existsSync(enhancedMapPath)) {
      mapPath = regularMapPath;
    }
    
    if (fs.existsSync(mapPath)) {
      const lessonMap = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
      
      // Convert lesson map to modules array
      const moduleArray = Object.values(lessonMap).map(moduleData => ({
        _id: `module-${moduleData.moduleNumber}`,
        moduleNumber: moduleData.moduleNumber,
        title: moduleData.title,
        lessons: moduleData.lessons || []
      }));
      
      res.json(moduleArray);
      return;
    }
    
    // If no data available, return empty array
    res.json([]);
  } catch (error) {
    console.error('Error in /api/modules:', error);
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

// Get specific lesson by module and lesson number (for AI planner)
app.get('/api/modules/:moduleNumber/lessons/:lessonNumber', async (req, res) => {
  try {
    const { moduleNumber, lessonNumber } = req.params;
    
    // Validate parameters
    const moduleNum = parseInt(moduleNumber);
    let lessonNum = parseInt(lessonNumber);
    
    if (isNaN(moduleNum) || moduleNum <= 0) {
      return res.status(400).json({ 
        error: `Invalid module number: ${moduleNumber}`,
        message: 'Module number must be a positive integer'
      });
    }
    
    // Handle cases where lessonNumber might be an ObjectId or invalid
    if (isNaN(lessonNum) || lessonNum <= 0) {
      console.log(`⚠️ Invalid lesson number: ${lessonNumber}, defaulting to lesson 1`);
      lessonNum = 1;
    }
    
    console.log(`🔍 Looking for Module ${moduleNum}, Lesson ${lessonNum}`);
    
    // First try to find from database
    const module = await Module.findOne({ moduleNumber: moduleNum });
    if (module) {
      const lesson = await Lesson.findOne({ 
        module: module._id, 
        lessonNumber: lessonNum 
      }).populate('module').populate('curriculum');
      
      if (lesson) {
        console.log(`✅ Found lesson in database: ${lesson.title}`);
        res.json(lesson);
        return;
      }
    }
    
    // Fallback: try to find from lesson map files
    const enhancedMapPath = path.join(__dirname, 'lesson-calendar-map-enhanced.json');
    const regularMapPath = path.join(__dirname, 'lesson-calendar-map.json');
    
    let mapPath = enhancedMapPath;
    if (!fs.existsSync(enhancedMapPath)) {
      mapPath = regularMapPath;
    }
    
    if (fs.existsSync(mapPath)) {
      console.log(`📁 Checking lesson map file: ${mapPath}`);
      const lessonMap = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
      
      // Find the lesson in the map
      for (const [moduleKey, moduleData] of Object.entries(lessonMap)) {
        if (moduleData.moduleNumber === moduleNum) {
          const lesson = moduleData.lessons.find(l => l.lessonNumber === lessonNum);
          if (lesson) {
            console.log(`✅ Found lesson in map file: ${lesson.title}`);
            // Format lesson data for AI planner
            const formattedLesson = {
              moduleNumber: moduleNum,
              moduleName: moduleData.title || `Module ${moduleNum}`,
              lessonNumber: lessonNum,
              title: lesson.title || `Lesson ${lessonNum}`,
              content: lesson.content || '',
              objectives: lesson.teacherContent?.objectives || [],
              materials: lesson.teacherContent?.materials || [],
              procedures: lesson.teacherContent?.procedures || [],
              assessments: lesson.teacherContent?.assessments || [],
              vocabulary: lesson.teacherContent?.vocabulary || [],
              duration: lesson.duration || '45 minutes'
            };
            
            res.json(formattedLesson);
            return;
          }
        }
      }
      
      console.log(`⚠️ Lesson not found in map file for Module ${moduleNum}, Lesson ${lessonNum}`);
    }
    
    // If not found anywhere, return a structured error with helpful information
    res.status(404).json({ 
      error: `Lesson not found: Module ${moduleNum}, Lesson ${lessonNum}`,
      message: `Could not find lesson ${lessonNum} in module ${moduleNum}`,
      suggestion: 'Try using Module 1 or 2 with Lesson 1 or 2, which have sample data available'
    });
  } catch (error) {
    console.error('Error fetching lesson:', error);
    res.status(500).json({ error: error.message });
  }
});

// OpenAI API integration for AI Lesson Planner
app.get('/api/openai-key-status', (req, res) => {
  const hasKey = !!process.env.OPENAI_API_KEY;
  res.json({ hasKey });
});

app.post('/api/generate-lesson-plan', async (req, res) => {
  try {
    const { prompt, model = 'gpt-5', temperature = 0.7, max_tokens = 4000 } = req.body;
    
    if (!process.env.OPENAI_API_KEY) {
      return res.status(503).json({ error: 'OpenAI API key not configured on server' });
    }

    // Helper function to determine correct token parameter based on model
    function getTokenParameter(model, maxTokens) {
      // GPT-5 and GPT-4.1 series use max_completion_tokens
      if (model.startsWith('gpt-5') || model.startsWith('gpt-4.1')) {
        return { max_completion_tokens: maxTokens };
      }
      // Older models use max_tokens
      return { max_tokens: maxTokens };
    }

    const tokenParams = getTokenParameter(model, max_tokens);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert geography teacher with 20+ years of experience creating engaging, standards-aligned lesson plans. You specialize in 7th-grade geography and understand how to make complex geographic concepts accessible and interesting for middle school students.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: temperature,
        ...tokenParams
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json({ error: errorData.error?.message || 'OpenAI API request failed' });
    }

    const data = await response.json();
    res.json({ content: data.choices[0].message.content });
    
  } catch (error) {
    console.error('Error generating lesson plan:', error);
    res.status(500).json({ error: 'Internal server error while generating lesson plan' });
  }
});

// Get lesson calendar map for browse page
app.get('/api/lesson-calendar', async (req, res) => {
  try {
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

// AI API Integration - Basic OpenAI only (optional for local dev)
let openai = null;

try {
  if (process.env.OPENAI_API_KEY) {
    const OpenAI = require('openai');
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    console.log('✅ OpenAI client initialized');
  } else {
    console.log('⚠️ OpenAI API key not found - AI features disabled for local development');
  }
} catch (error) {
  console.warn('⚠️ OpenAI initialization failed:', error.message);
}

// AI Definition Lookup
app.post('/api/ai/define', async (req, res) => {
  try {
    const { term } = req.body;
    
    if (!term) {
      return res.status(400).json({ error: 'Term is required' });
    }

    if (!openai) {
      return res.status(503).json({ 
        error: 'AI services not available', 
        fallback: `Geographic term: ${term}. Please refer to your textbook or ask your teacher for the definition.`
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

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OpenAI API key not configured' });
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

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OpenAI API key not configured' });
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

// Helper function to generate individual map HTML
function generateMapHTML(title, mapType, icon, features, isPrint = false) {
    const printStyles = isPrint ? `
        <style>
            @media print {
                body { background: white !important; }
                .no-print { display: none !important; }
                .print-break { page-break-after: always; }
                .map-container { 
                    width: 100%; 
                    height: 100vh; 
                    border: 2px solid #333;
                    margin: 0;
                    padding: 20px;
                }
            }
        </style>
    ` : '';
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - Geographic Detective Academy</title>
    <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
    ${printStyles}
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { 
            font-family: 'Roboto', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        .map-container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            padding: 30px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            border: 3px solid #ffd700;
        }
        .map-header {
            text-align: center;
            margin-bottom: 30px;
            padding: 20px;
            background: linear-gradient(45deg, #ff6b35, #4ecdc4);
            border-radius: 10px;
            color: white;
        }
        .map-title {
            font-family: 'Orbitron', monospace;
            font-size: 2.5rem;
            font-weight: 900;
            margin-bottom: 10px;
        }
        .map-icon {
            font-size: 4rem;
            margin: 20px 0;
        }
        .map-features {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin: 30px 0;
        }
        .feature-item {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 10px;
            border-left: 4px solid #3498db;
            font-size: 1rem;
            line-height: 1.6;
        }
        .map-placeholder {
            width: 100%;
            height: 500px;
            background: linear-gradient(45deg, #f0f0f0, #e0e0e0);
            border: 3px dashed #ccc;
            border-radius: 15px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'Orbitron', monospace;
            font-size: 1.5rem;
            color: #666;
            margin: 30px 0;
            position: relative;
        }
        .map-placeholder::before {
            content: "${title}\\AACTUAL MAP CONTENT\\AWOULD BE GENERATED HERE\\AWITH DETAILED GEOGRAPHIC FEATURES";
            white-space: pre-line;
            text-align: center;
            line-height: 1.8;
        }
        .controls {
            text-align: center;
            margin: 30px 0;
        }
        .btn {
            padding: 12px 25px;
            margin: 10px;
            border: none;
            border-radius: 25px;
            font-family: 'Orbitron', monospace;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
            display: inline-block;
        }
        .btn-print {
            background: linear-gradient(45deg, #2ecc71, #4ecdc4);
            color: white;
        }
        .btn-back {
            background: linear-gradient(45deg, #ffd700, #ffed4e);
            color: #333;
        }
        .btn:hover {
            transform: translateY(-3px);
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        }
    </style>
</head>
<body>
    <div class="map-container">
        <div class="map-header">
            <div class="map-icon">${icon}</div>
            <h1 class="map-title">${title}</h1>
        </div>
        
        <div class="map-features">
            ${features.map(feature => `<div class="feature-item">📍 ${feature}</div>`).join('')}
        </div>
        
        <div class="map-placeholder"></div>
        
        <div class="controls ${isPrint ? 'no-print' : ''}">
            <button class="btn btn-print" onclick="window.print()">🖨️ Print This Map</button>
            <a href="/simulation/maps" class="btn btn-back">🔙 Back to Maps Central</a>
        </div>
    </div>
</body>
</html>`;
}

// Helper function to generate complete atlas HTML
function generateAtlasHTML(isPrint = false, isDownload = false) {
    const atlasContent = [
        { title: 'Amazon Rainforest Investigation Map', type: 'amazon', icon: '🌳' },
        { title: 'Sahara Desert Investigation Map', type: 'sahara', icon: '🏜️' },
        { title: 'Himalayas Cultural Geography Map', type: 'himalayas', icon: '🏔️' },
        { title: 'Amazon River Basin Watershed Map', type: 'river', icon: '🌊' },
        { title: 'Metropolitan Urban Planning Map', type: 'urban', icon: '🏙️' },
        { title: 'Political Boundaries & Jurisdictions Map', type: 'political', icon: '🌐' },
        { title: 'World Physical Geography Reference', type: 'world', icon: '🌍' },
        { title: 'Detective Navigation Tools', type: 'tools', icon: '🧭' },
        { title: 'Blank Investigation Workspace', type: 'workspace', icon: '📝' }
    ];
    
    const printStyles = isPrint || isDownload ? `
        <style>
            @media print {
                body { background: white !important; }
                .no-print { display: none !important; }
                .atlas-page { page-break-after: always; min-height: 100vh; }
                .atlas-page:last-child { page-break-after: avoid; }
            }
        </style>
    ` : '';
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Geographic Detective Atlas - Complete Collection</title>
    <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
    ${printStyles}
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { 
            font-family: 'Roboto', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #333;
        }
        .atlas-container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            min-height: 100vh;
        }
        .atlas-cover {
            text-align: center;
            padding: 80px 40px;
            background: linear-gradient(135deg, #ff6b35, #4ecdc4);
            color: white;
        }
        .atlas-title {
            font-family: 'Orbitron', monospace;
            font-size: 4rem;
            font-weight: 900;
            margin-bottom: 20px;
        }
        .atlas-subtitle {
            font-size: 1.5rem;
            margin-bottom: 40px;
        }
        .atlas-page {
            padding: 40px;
            border-bottom: 3px solid #eee;
        }
        .page-title {
            font-family: 'Orbitron', monospace;
            font-size: 2.5rem;
            color: #2c3e50;
            margin-bottom: 30px;
            text-align: center;
        }
        .map-preview {
            width: 100%;
            height: 400px;
            background: linear-gradient(45deg, #f0f0f0, #e0e0e0);
            border: 2px dashed #ccc;
            border-radius: 15px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            color: #666;
            margin: 20px 0;
        }
        .controls {
            text-align: center;
            margin: 40px 0;
            padding: 30px;
            background: #f8f9fa;
        }
        .btn {
            padding: 15px 30px;
            margin: 10px;
            border: none;
            border-radius: 25px;
            font-family: 'Orbitron', monospace;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
            display: inline-block;
            background: linear-gradient(45deg, #3498db, #2ecc71);
            color: white;
        }
        .btn:hover {
            transform: translateY(-3px);
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        }
    </style>
</head>
<body>
    <div class="atlas-container">
        <div class="atlas-cover atlas-page">
            <h1 class="atlas-title">🗺️ GEOGRAPHIC DETECTIVE ATLAS</h1>
            <p class="atlas-subtitle">Complete Investigation Maps Collection</p>
            <p>🕵️ Essential maps for all Geographic Detective Academy cases</p>
            <p style="margin-top: 40px; font-size: 1.2rem;">📅 Generated: ${new Date().toLocaleDateString()}</p>
        </div>
        
        ${atlasContent.map(map => `
            <div class="atlas-page">
                <h2 class="page-title">${map.icon} ${map.title}</h2>
                <div class="map-preview">
                    <div style="text-align: center;">
                        <div style="font-size: 4rem; margin-bottom: 20px;">${map.icon}</div>
                        <div>${map.title}</div>
                        <div style="margin-top: 20px; font-size: 1rem; color: #888;">
                            [Detailed ${map.type} map would be rendered here]
                        </div>
                    </div>
                </div>
            </div>
        `).join('')}
        
        <div class="controls ${isPrint || isDownload ? 'no-print' : ''}">
            <button class="btn" onclick="window.print()">🖨️ Print Complete Atlas</button>
            <a href="/simulation/maps" class="btn">🔙 Back to Maps Central</a>
        </div>
    </div>
</body>
</html>`;
}

// ==============================================
// IMAGE GENERATION ENDPOINTS
// ==============================================

// Generate image using Stability AI
app.post('/api/generate-image', async (req, res) => {
  try {
    const { prompt, provider = 'stability', width = 800, height = 600 } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    console.log(`🎨 Generating ${provider} image: ${prompt}`);

    if (provider === 'stability') {
      // Use Stability AI API
      const stabilityKey = process.env.STABILITY_API_KEY;
      
      if (!stabilityKey) {
        console.warn('⚠️ STABILITY_API_KEY not configured');
        return res.status(503).json({ error: 'Image generation service not available' });
      }

      const response = await axios.post(
        'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image',
        {
          text_prompts: [{ text: prompt, weight: 1 }],
          cfg_scale: 7,
          height: height,
          width: width,
          steps: 20,
          samples: 1,
          style_preset: 'photographic'
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${stabilityKey}`,
            'Accept': 'application/json'
          }
        }
      );

      if (response.data.artifacts && response.data.artifacts.length > 0) {
        const imageData = response.data.artifacts[0].base64;
        const imageUrl = `data:image/png;base64,${imageData}`;
        
        console.log('✅ Stability AI image generated successfully');
        return res.json({ imageUrl, prompt, provider: 'stability-ai' });
      }
    }

    res.status(500).json({ error: 'Failed to generate image' });
    
  } catch (error) {
    console.error('Image generation error:', error.message);
    res.status(500).json({ error: 'Image generation failed' });
  }
});

// Search for stock photos
app.post('/api/search-images', async (req, res) => {
  try {
    const { query, providers = ['unsplash'], count = 3, width = 800, height = 600 } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    console.log(`📷 Searching images: ${query} via ${providers.join(', ')}`);
    
    let images = [];

    // Try Unsplash first
    if (providers.includes('unsplash')) {
      const unsplashKey = process.env.UNSPLASH_ACCESS_KEY;
      
      if (unsplashKey) {
        try {
          const response = await axios.get('https://api.unsplash.com/search/photos', {
            params: {
              query: query,
              per_page: count,
              orientation: 'landscape',
              client_id: unsplashKey
            }
          });

          if (response.data.results) {
            images = images.concat(response.data.results.map(photo => ({
              url: photo.urls.regular,
              provider: 'unsplash',
              description: photo.description || photo.alt_description || query,
              photographer: photo.user.name
            })));
          }
        } catch (error) {
          console.warn('Unsplash search failed:', error.message);
        }
      } else {
        console.warn('⚠️ UNSPLASH_ACCESS_KEY not configured');
      }
    }

    // Try Pexels if needed
    if (providers.includes('pexels') && images.length < count) {
      const pexelsKey = process.env.PEXELS_API_KEY;
      
      if (pexelsKey) {
        try {
          const response = await axios.get('https://api.pexels.com/v1/search', {
            params: {
              query: query,
              per_page: count - images.length,
              orientation: 'landscape'
            },
            headers: {
              'Authorization': pexelsKey
            }
          });

          if (response.data.photos) {
            images = images.concat(response.data.photos.map(photo => ({
              url: photo.src.large,
              provider: 'pexels',
              description: photo.alt || query,
              photographer: photo.photographer
            })));
          }
        } catch (error) {
          console.warn('Pexels search failed:', error.message);
        }
      } else {
        console.warn('⚠️ PEXELS_API_KEY not configured');
      }
    }

    console.log(`✅ Found ${images.length} stock photos`);
    res.json({ images: images.slice(0, count) });
    
  } catch (error) {
    console.error('Stock photo search error:', error.message);
    res.status(500).json({ error: 'Stock photo search failed' });
  }
});

// Start the server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://0.0.0.0:${PORT}/health`);
  
  // Connect to database after server starts - don't block server startup
  connectDB().catch(error => {
    console.error('🔄 Database connection failed, continuing without database features');
  });
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully');
  server.close(() => {
    console.log('HTTP server closed');
    mongoose.connection.close().finally(() => {
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully');
  server.close(() => {
    console.log('HTTP server closed');
    mongoose.connection.close().finally(() => {
      process.exit(0);
    });
  });
});

// Add comprehensive error handling to catch what's causing the crash
process.on('uncaughtException', (error) => {
  console.error('🚨 UNCAUGHT EXCEPTION:', error);
  console.error('Stack:', error.stack);
  // Don't exit immediately, let's see what happens
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('🚨 UNHANDLED PROMISE REJECTION:', reason);
  console.error('Promise:', promise);
  // Don't exit immediately, let's see what happens
});

// =================================
// TOOL 1: ADVANCED MAP GENERATOR
// =================================

// Generate custom maps using multiple AI models
app.post('/api/ai/generate-map', async (req, res) => {
  try {
    const { prompt, difficulty = 'basic', features = [] } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Map prompt is required' });
    }

    // Create enhanced prompt based on difficulty level
    let enhancedPrompt = '';
    switch (difficulty) {
      case 'basic':
        enhancedPrompt = `Simple, clear educational map: ${prompt}. Clean lines, basic labels, suitable for middle school students.`;
        break;
      case 'intermediate':
        enhancedPrompt = `Educational map with moderate detail: ${prompt}. Include coordinate grid, scale bar, and clear geographic features.`;
        break;
      case 'advanced':
        enhancedPrompt = `Detailed cartographic map: ${prompt}. Include topographical lines, isopleth patterns, latitude/longitude grid, multiple scales, and advanced geographic features.`;
        break;
      default:
        enhancedPrompt = prompt;
    }

    // Add requested features
    if (features.includes('coordinates')) {
      enhancedPrompt += ' Include latitude and longitude coordinates.';
    }
    if (features.includes('scale')) {
      enhancedPrompt += ' Include multiple distance scales.';
    }
    if (features.includes('topographic')) {
      enhancedPrompt += ' Include topographical elevation lines.';
    }
    if (features.includes('isopleth')) {
      enhancedPrompt += ' Include isopleth lines showing data patterns.';
    }

    // Try Replicate SDXL first for high-quality maps
    let mapResult;
    try {
      console.log('🗺️ Generating map with Replicate SDXL...');
      const output = await replicate.run(
        "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
        {
          input: {
            prompt: enhancedPrompt,
            negative_prompt: "blurry, low quality, distorted, illegible text, cartoon",
            width: 1024,
            height: 768,
            guidance_scale: 7.5,
            num_inference_steps: 25,
            scheduler: "K_EULER"
          }
        }
      );

      mapResult = {
        imageUrl: Array.isArray(output) ? output[0] : output,
        generator: 'Replicate SDXL',
        difficulty: difficulty,
        features: features,
        prompt: enhancedPrompt
      };

    } catch (replicateError) {
      console.log('⚠️ Replicate failed, trying OpenAI DALL-E...');
      
      // Fallback to OpenAI DALL-E 3
      if (process.env.OPENAI_API_KEY) {
        try {
          const dalleResponse = await openai.images.generate({
            model: "dall-e-3",
            prompt: enhancedPrompt,
            n: 1,
            size: "1024x1024",
            quality: "standard",
            style: "natural"
          });

          mapResult = {
            imageUrl: dalleResponse.data[0].url,
            generator: 'OpenAI DALL-E 3',
            difficulty: difficulty,
            features: features,
            prompt: enhancedPrompt
          };

        } catch (dalleError) {
          throw new Error('All map generation services failed');
        }
      } else {
        throw replicateError;
      }
    }

    res.json({
      success: true,
      map: mapResult,
      metadata: {
        originalPrompt: prompt,
        enhancedPrompt: enhancedPrompt,
        difficulty: difficulty,
        features: features,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Map Generation Error:', error);
    res.status(500).json({ 
      error: 'Failed to generate map',
      details: error.message
    });
  }
});

// =================================
// TOOL 2: MULTI-SOURCE PHOTO LIBRARY
// =================================

// Search photos from multiple sources
app.post('/api/ai/search-photos', async (req, res) => {
  try {
    const { query, source = 'all', limit = 12 } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const results = {
      query: query,
      photos: [],
      sources: []
    };

    // Unsplash API
    if (source === 'all' || source === 'unsplash') {
      try {
        const unsplashResponse = await axios.get(`https://api.unsplash.com/search/photos`, {
          params: {
            query: query,
            per_page: Math.ceil(limit / 3),
            orientation: 'landscape'
          },
          headers: {
            'Authorization': `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`
          }
        });

        const unsplashPhotos = unsplashResponse.data.results.map(photo => ({
          id: photo.id,
          url: photo.urls.regular,
          thumbnail: photo.urls.thumb,
          description: photo.description || photo.alt_description,
          photographer: photo.user.name,
          source: 'Unsplash',
          downloadUrl: photo.links.download,
          width: photo.width,
          height: photo.height
        }));

        results.photos.push(...unsplashPhotos);
        results.sources.push('Unsplash');
      } catch (error) {
        console.error('Unsplash API Error:', error.message);
      }
    }

    // Pexels API
    if (source === 'all' || source === 'pexels') {
      try {
        const pexelsResponse = await axios.get(`https://api.pexels.com/v1/search`, {
          params: {
            query: query,
            per_page: Math.ceil(limit / 3),
            orientation: 'landscape'
          },
          headers: {
            'Authorization': process.env.PEXELS_API_KEY
          }
        });

        const pexelsPhotos = pexelsResponse.data.photos.map(photo => ({
          id: photo.id,
          url: photo.src.large,
          thumbnail: photo.src.medium,
          description: photo.alt,
          photographer: photo.photographer,
          source: 'Pexels',
          downloadUrl: photo.src.original,
          width: photo.width,
          height: photo.height
        }));

        results.photos.push(...pexelsPhotos);
        results.sources.push('Pexels');
      } catch (error) {
        console.error('Pexels API Error:', error.message);
      }
    }

    // Pixabay API
    if (source === 'all' || source === 'pixabay') {
      try {
        const pixabayResponse = await axios.get(`https://pixabay.com/api/`, {
          params: {
            key: process.env.PIXABAY_API_KEY,
            q: query,
            per_page: Math.ceil(limit / 3),
            image_type: 'photo',
            orientation: 'horizontal',
            safesearch: 'true'
          }
        });

        const pixabayPhotos = pixabayResponse.data.hits.map(photo => ({
          id: photo.id,
          url: photo.webformatURL,
          thumbnail: photo.previewURL,
          description: photo.tags,
          photographer: photo.user,
          source: 'Pixabay',
          downloadUrl: photo.largeImageURL,
          width: photo.imageWidth,
          height: photo.imageHeight
        }));

        results.photos.push(...pixabayPhotos);
        results.sources.push('Pixabay');
      } catch (error) {
        console.error('Pixabay API Error:', error.message);
      }
    }

    // Shuffle and limit results
    results.photos = results.photos
      .sort(() => Math.random() - 0.5)
      .slice(0, limit);

    res.json({
      success: true,
      ...results,
      total: results.photos.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Photo Search Error:', error);
    res.status(500).json({ 
      error: 'Failed to search photos',
      details: error.message
    });
  }
});

// =================================
// TOOL 3: INTELLIGENT CURRENT EVENTS TRACKER
// =================================

// Get geography-related news and current events
app.post('/api/ai/current-events', async (req, res) => {
  try {
    const { topic, sources = 'all', timeframe = 'week' } = req.body;
    
    const results = {
      topic: topic || 'geography news',
      events: [],
      sources: []
    };

    // News API
    if (sources === 'all' || sources === 'news') {
      try {
        let newsQuery = topic || 'geography OR climate OR environment OR natural disaster';
        
        const newsResponse = await axios.get(`https://newsapi.org/v2/everything`, {
          params: {
            q: newsQuery,
            sortBy: 'publishedAt',
            pageSize: 20,
            language: 'en',
            from: new Date(Date.now() - (timeframe === 'week' ? 7 : 30) * 24 * 60 * 60 * 1000).toISOString()
          },
          headers: {
            'X-API-Key': process.env.NEWS_API_KEY
          }
        });

        const newsEvents = newsResponse.data.articles.map(article => ({
          id: `news-${article.publishedAt}-${article.title.slice(0, 20)}`,
          title: article.title,
          description: article.description,
          url: article.url,
          imageUrl: article.urlToImage,
          publishedAt: article.publishedAt,
          source: article.source.name,
          type: 'news',
          relevance: 'high'
        }));

        results.events.push(...newsEvents);
        results.sources.push('News API');
      } catch (error) {
        console.error('News API Error:', error.message);
      }
    }

    // Reddit API for geographic content
    if (sources === 'all' || sources === 'reddit') {
      try {
        // Get Reddit OAuth token
        const authResponse = await axios.post('https://www.reddit.com/api/v1/access_token', 
          'grant_type=client_credentials',
          {
            headers: {
              'Authorization': `Basic ${Buffer.from(`${process.env.REDDIT_CLIENT_ID}:${process.env.REDDIT_CLIENT_SECRET}`).toString('base64')}`,
              'Content-Type': 'application/x-www-form-urlencoded',
              'User-Agent': 'GeographyEducationApp/1.0'
            }
          }
        );

        const accessToken = authResponse.data.access_token;

        // Search relevant geographic subreddits
        const subreddits = ['geography', 'earthporn', 'MapPorn', 'environment', 'climate'];
        
        for (const subreddit of subreddits.slice(0, 2)) { // Limit to 2 subreddits to avoid rate limits
          try {
            const redditResponse = await axios.get(`https://oauth.reddit.com/r/${subreddit}/hot`, {
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'User-Agent': 'GeographyEducationApp/1.0'
              },
              params: {
                limit: 5
              }
            });

            const redditPosts = redditResponse.data.data.children
              .filter(post => post.data.score > 50) // Only high-quality posts
              .map(post => ({
                id: `reddit-${post.data.id}`,
                title: post.data.title,
                description: post.data.selftext ? post.data.selftext.slice(0, 200) + '...' : '',
                url: `https://reddit.com${post.data.permalink}`,
                imageUrl: post.data.thumbnail !== 'self' ? post.data.thumbnail : null,
                publishedAt: new Date(post.data.created_utc * 1000).toISOString(),
                source: `r/${subreddit}`,
                type: 'social',
                score: post.data.score,
                relevance: 'medium'
              }));

            results.events.push(...redditPosts);
          } catch (subredditError) {
            console.error(`Reddit ${subreddit} Error:`, subredditError.message);
          }
        }

        results.sources.push('Reddit');
      } catch (error) {
        console.error('Reddit API Error:', error.message);
      }
    }

    // Sort by relevance and recency
    results.events.sort((a, b) => {
      const relevanceScore = { 'high': 3, 'medium': 2, 'low': 1 };
      const aScore = relevanceScore[a.relevance] || 1;
      const bScore = relevanceScore[b.relevance] || 1;
      
      if (aScore !== bScore) return bScore - aScore;
      return new Date(b.publishedAt) - new Date(a.publishedAt);
    });

    // Limit results
    results.events = results.events.slice(0, 20);

    res.json({
      success: true,
      ...results,
      total: results.events.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Current Events Error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch current events',
      details: error.message
    });
  }
});

// =================================
// REPLICATE MODELS SHOWCASE
// =================================

// Get available Replicate models for geographic content
app.get('/api/ai/replicate-models', async (req, res) => {
  try {
    const models = [
      {
        name: 'SDXL',
        id: 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
        description: 'High-quality map and diagram generation',
        category: 'image-generation',
        features: ['custom maps', 'educational diagrams', 'geographic illustrations']
      },
      {
        name: 'LLaMA 2 70B Chat',
        id: 'meta/llama-2-70b-chat:02e509c789964a7ea8736978a43525956ef40397be9033abf9fd2badfe68c9e3',
        description: 'Advanced geographic analysis and explanations',
        category: 'text-generation',
        features: ['detailed explanations', 'comparative analysis', 'educational content']
      },
      {
        name: 'Real-ESRGAN',
        id: 'nightmareai/real-esrgan:42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b',
        description: 'Enhance and upscale geographic images',
        category: 'image-enhancement',
        features: ['photo enhancement', 'historical map restoration', 'image upscaling']
      },
      {
        name: 'ControlNet',
        id: 'jagilley/controlnet-hough:854e8727697a057c525cdb45ab037f64ecca770a1769cc52287c2e56472a247b',
        description: 'Precise control over map generation',
        category: 'controlled-generation',
        features: ['precise geographic features', 'coordinate-based generation', 'technical maps']
      }
    ];

    res.json({
      success: true,
      models: models,
      total: models.length,
      categories: [...new Set(models.map(m => m.category))]
    });

  } catch (error) {
    console.error('Replicate Models Error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch Replicate models',
      details: error.message
    });
  }
});

// Advanced Replicate model execution
app.post('/api/ai/replicate-run', async (req, res) => {
  try {
    const { modelId, input, category } = req.body;
    
    if (!modelId || !input) {
      return res.status(400).json({ error: 'Model ID and input are required' });
    }

    console.log(`🚀 Running Replicate model: ${modelId}`);
    
    const output = await replicate.run(modelId, { input });

    res.json({
      success: true,
      modelId: modelId,
      category: category,
      input: input,
      output: output,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Replicate Run Error:', error);
    res.status(500).json({ 
      error: 'Failed to run Replicate model',
      details: error.message
    });
  }
});

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

// Legacy redirect for old broken panel system
app.get('/simulation/geographic-detective-academy', (req, res) => {
  res.redirect('/simulation');
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
            
            // Check status once after extraction starts
            setTimeout(checkStatus, 5000);
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
            
            // Check status once after dashboard extraction starts
            setTimeout(checkStatus, 5000);
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

// ========================================
// SMART PRESENTATION VISUAL API ENDPOINTS
// ========================================

// Unsplash Image API endpoint
app.get('/api/unsplash-image', async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Query parameter required' });
    }

    console.log('📸 Fetching Unsplash image for:', query);
    
    // Use Unsplash API if key available, otherwise return placeholder
    if (process.env.UNSPLASH_ACCESS_KEY) {
      const response = await axios.get('https://api.unsplash.com/search/photos', {
        params: {
          query: query,
          per_page: 1,
          orientation: 'landscape'
        },
        headers: {
          'Authorization': `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`
        }
      });

      if (response.data.results && response.data.results.length > 0) {
        const photo = response.data.results[0];
        res.json({
          url: photo.urls.regular,
          thumbnail: photo.urls.small,
          alt: photo.alt_description || query,
          credit: `Photo by ${photo.user.name} on Unsplash`
        });
        return;
      }
    }

    // Fallback to Picsum placeholder
    res.json({
      url: `https://picsum.photos/800/450?random=${Date.now()}`,
      thumbnail: `https://picsum.photos/400/225?random=${Date.now()}`,
      alt: query,
      credit: 'Placeholder image'
    });

  } catch (error) {
    console.error('❌ Unsplash API error:', error.message);
    
    // Return placeholder on error
    res.json({
      url: `https://picsum.photos/800/450?random=${Date.now()}`,
      thumbnail: `https://picsum.photos/400/225?random=${Date.now()}`,
      alt: req.query.query || 'Geography image',
      credit: 'Placeholder image'
    });
  }
});

// Mapbox Map API endpoint
app.get('/api/mapbox-map', async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Query parameter required' });
    }

    console.log('🗺️ Generating Mapbox map for:', query);
    
    // Use Mapbox API if key available
    if (process.env.MAPBOX_ACCESS_TOKEN) {
      // Geocode the location first
      const geocodeResponse = await axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`, {
        params: {
          access_token: process.env.MAPBOX_ACCESS_TOKEN,
          limit: 1
        }
      });

      if (geocodeResponse.data.features && geocodeResponse.data.features.length > 0) {
        const location = geocodeResponse.data.features[0];
        const [lng, lat] = location.center;
        const zoom = 8;

        // Generate static map URL
        const staticUrl = `https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12/static/${lng},${lat},${zoom}/800x450@2x?access_token=${process.env.MAPBOX_ACCESS_TOKEN}`;
        
        res.json({
          staticUrl: staticUrl,
          interactiveUrl: `https://api.mapbox.com/styles/v1/mapbox/streets-v12.html?access_token=${process.env.MAPBOX_ACCESS_TOKEN}#${zoom}/${lat}/${lng}`,
          coordinates: { lat, lng },
          zoom: zoom,
          location: location.place_name
        });
        return;
      }
    }

    // Fallback to placeholder map
    res.json({
      staticUrl: 'https://via.placeholder.com/800x450/2ecc71/ffffff?text=Geographic+Map',
      interactiveUrl: null,
      coordinates: { lat: 0, lng: 0 },
      zoom: 2,
      location: query
    });

  } catch (error) {
    console.error('❌ Mapbox API error:', error.message);
    
    // Return placeholder on error
    res.json({
      staticUrl: 'https://via.placeholder.com/800x450/2ecc71/ffffff?text=Geographic+Map',
      interactiveUrl: null,
      coordinates: { lat: 0, lng: 0 },
      zoom: 2,
      location: req.query.query || 'Unknown location'
    });
  }
});

// Stability AI Graphics generation endpoint
app.post('/api/generate-graphic', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt required' });
    }

    console.log('🎨 Generating custom graphic for:', prompt);
    
    // Use Stability AI if key available
    if (process.env.STABILITY_API_KEY) {
      const response = await axios.post(
        'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image',
        {
          text_prompts: [
            {
              text: `Educational geography diagram: ${prompt}, clean design, professional style, educational illustration`,
              weight: 1
            }
          ],
          cfg_scale: 7,
          height: 450,
          width: 800,
          samples: 1,
          steps: 20
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.STABILITY_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.artifacts && response.data.artifacts.length > 0) {
        const artifact = response.data.artifacts[0];
        const imageData = `data:image/png;base64,${artifact.base64}`;
        
        res.json({
          imageUrl: imageData,
          prompt: prompt,
          style: 'educational'
        });
        return;
      }
    }

    // Fallback to placeholder
    res.json({
      imageUrl: 'https://via.placeholder.com/800x450/e74c3c/ffffff?text=Educational+Diagram',
      prompt: prompt,
      style: 'placeholder'
    });

  } catch (error) {
    console.error('❌ Stability AI error:', error.message);
    
    // Return placeholder on error
    res.json({
      imageUrl: 'https://via.placeholder.com/800x450/e74c3c/ffffff?text=Educational+Diagram',
      prompt: req.body.prompt || 'Diagram',
      style: 'placeholder'
    });
  }
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully');
  process.exit(0);
});
