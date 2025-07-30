# GitHub Copilot Instructions for World Geography Curriculum

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
This is a World Geography curriculum management application built with Node.js, Express, and MongoDB. The application features:

- **Calendar Integration**: School year planning with quarters and holidays
- **Lesson Management**: Structured curriculum with modules and lessons
- **Dashboard System**: Daily assignment tracking and overview
- **Simulation Projects**: Quarter-based geography simulations
- **Content Extraction**: PDF and DOCX processing for curriculum content
- **Railway Deployment**: Production-ready cloud deployment

## Code Style & Patterns
- Use ES6+ JavaScript features
- Follow Express.js best practices for route organization
- Use async/await for database operations with proper error handling
- Implement RESTful API patterns for endpoints
- Use descriptive variable and function names
- Add comprehensive error logging with emojis for visual clarity

## Database Patterns
- Use Mongoose ODM for MongoDB interactions
- Implement proper schema validation
- Use aggregation pipelines for complex queries
- Handle connection errors gracefully
- Include proper indexing for performance

## Frontend Guidelines
- Use vanilla JavaScript with modern DOM manipulation
- Implement responsive design principles
- Use semantic HTML structure
- Follow accessibility best practices
- Add loading states and error handling for API calls

## API Design
- Prefix all API routes with `/api/`
- Include proper HTTP status codes
- Implement consistent error response format
- Add request validation middleware
- Include comprehensive logging for debugging

## Calendar & School System
- Work with school calendar dates and quarters
- Handle simulation project scheduling
- Implement holiday and break detection
- Support relationship building activities
- Track school day numbering system

## Curriculum Content
- Process geography lesson content from multiple formats
- Support module-based curriculum organization
- Handle lesson sequencing and dependencies
- Implement content enhancement and mapping
- Support student reading extraction and organization
