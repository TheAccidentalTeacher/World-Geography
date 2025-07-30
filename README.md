# World Geography Curriculum Management System

A comprehensive Node.js/Express application for managing world geography curriculum with integrated calendar system, lesson planning, and simulation projects.

## 🎯 Features

- **📅 Calendar Integration**: School year planning with quarters, holidays, and scheduling
- **📚 Lesson Management**: Structured curriculum with 32 modules and comprehensive lesson content
- **📊 Dashboard System**: Daily assignment tracking and teaching overview
- **🎮 Simulation Projects**: Quarter-based geography simulations and activities
- **📄 Content Extraction**: PDF and DOCX processing for curriculum content
- **🗄️ MongoDB Integration**: Robust data storage and retrieval
- **☁️ Railway Deployment**: Production-ready cloud deployment
- **🎨 Interactive UI**: Modern web interface with calendar views and lesson browsers

## Quick Start

1. **Deploy to Railway**:
   - Connect your GitHub repository to Railway
   - Add environment variable: `MONGODB_URI=your-connection-string`
   - Railway will automatically detect and deploy the Node.js app

2. **Extract PDF Data**:
   - Visit your deployed app URL
   - Click "Start Extraction" to process all PDF files
   - This will take several minutes to complete

3. **Access Data**:
   - Use the API endpoints to access structured curriculum data
   - Build your teaching application on top of this foundation

## 🚀 API Endpoints

### Core Endpoints
- `GET /api/health` - Health check and system status
- `GET /debug` - Detailed system diagnostics for Railway deployment
- `GET /api/curriculum` - Full curriculum overview with statistics

### Calendar & Dashboard
- `GET /api/dashboard/today` - Today's school day information and assignments
- `GET /api/dashboard/calendar` - Calendar overview with quarters and holidays
- `GET /api/dashboard/day/:dayNumber` - Specific school day lesson assignment

### Lesson Management
- `GET /api/lesson-calendar` - Enhanced lesson calendar mapping
- `GET /api/modules` - All geographic modules
- `GET /api/modules/:id` - Specific module with lessons
- `GET /api/lessons` - All lessons with search and filtering
- `GET /api/lessons/:id` - Detailed lesson content

### Content Processing
- `POST /api/extract` - Trigger PDF/DOCX content extraction
- `GET /api/status` - Extraction progress and statistics

## Data Structure

- **Curriculum**: Main container
- **Modules**: Geographic regions (32 total)
- **Lessons**: Individual lessons within modules
  - Teacher Content: objectives, materials, procedures, assessments
  - Student Content: activities, assignments, projects

## Environment Variables

- `MONGODB_URI`: MongoDB connection string (required)
- `PORT`: Server port (Railway sets automatically)

## Next Steps

Once PDF extraction is complete, you can build a full teaching application with:
- Lesson planning interface
- Search and filter capabilities
- Progress tracking
- Curriculum customization
- Export features
