/**
 * Geographic Detective Academy Simulation System
 * Based on            icon: '📋',the extracted framework from Oregon Trail simulation materials
 */

const express = require('express');
const path = require('path');
const fs = require('fs');
const puppeteer = require('puppeteer');
const { enhancedSimulationContent } = require('./simulation-content-enhanced');

// Import additional PDF sections
const { generateInvestigationsSection, generateAssessmentsSection, 
        generateStudentMaterialsSection, generateStandardsSection, 
        generateImplementationSection } = require('./pdf-sections-complete');

// Simulation data structure
const simulationFramework = {
    title: "Geographic Detective Academy",
    subtitle: "The Mystery of the Missing Maps",
    overview: "Students become rookie detectives at the International Geographic Bureau investigating the disappearance of the world's most important maps and geographic artifacts.",
    
    structure: {
        totalDays: 12,
        phases: [
            { id: 'setup', day: 0, title: 'Academy Orientation', description: 'Character creation, team formation, introduction to the Bureau' },
            { id: 'investigation', days: '1-10', title: 'Progressive Case Training', description: 'Daily cases building geographic skills and knowledge' },
            { id: 'graduation', day: 11, title: 'Final Graduation', description: 'Master criminal confrontation and summative assessment' }
        ]
    },
    
    teamRoles: [
        {
            id: 'evidence-manager',
            title: 'Evidence Manager',
            description: "You're the mastermind who spots patterns others miss! As the Evidence Manager, you collect every geographic clue—from satellite images to population data—and turn chaos into crystal-clear evidence.",
            mission: 'Pattern-spotting mastermind who organizes and analyzes all geographic evidence',
            activities: "Organize crime scene photos, analyze map coordinates, catalog witness statements, and create evidence timelines. You're like a geographic CSI investigator!",
            skills: ['Critical thinking', 'Pattern recognition', 'Data organization', 'Digital research techniques'],
            appeal: 'Every case gets solved because YOU found the missing piece of the puzzle!',
            icon: '🔍',
            imagePrompt: 'A confident 7th grade student wearing a detective badge and magnifying glass, surrounded by floating geographic maps, charts, and digital evidence screens. The character has a determined expression while organizing colorful geographic clues on a high-tech evidence board.'
        },
        {
            id: 'geography-specialist',
            title: 'Geography Specialist', 
            description: "You're the walking encyclopedia of world knowledge! When the team needs to know about ANY place on Earth, you're their go-to expert with instant answers.",
            mission: 'Walking encyclopedia of world knowledge and regional expertise',
            activities: 'Analyze terrain features, explain climate patterns, identify cultural landmarks, and decode geographic mysteries. You make every location come alive with stories!',
            skills: ['Map reading', 'Cultural awareness', 'Environmental analysis', 'Geographic reasoning'],
            appeal: 'You become the ultimate world explorer without leaving your seat—and everyone relies on YOUR expertise!',
            icon: '🌍',
            imagePrompt: "A young geographic expert student standing confidently in front of a massive interactive world globe, with holographic regional displays floating around them. They're pointing at different continents while geographic data streams flow in the background."
        },
        {
            id: 'resource-tracker',
            title: 'Resource Tracker',
            description: "You're the detective who follows the money, resources, and people! Nothing moves around the world without YOU tracking its path and uncovering the connections.",
            mission: 'Detective who follows money, resources, and people across the globe',
            activities: "Trace trade routes, monitor population movements, track natural resources, and spot economic patterns. You're like a geographic spy following secret trails!",
            skills: ['Economic analysis', 'Logistics thinking', 'Cause-and-effect reasoning', 'Global connections'],
            appeal: 'You discover how everything in the world is connected—and predict what happens next!',
            icon: '🎯',
            imagePrompt: 'A tech-savvy 7th grade student monitoring multiple digital screens showing trade routes, population movements, and resource flows across a dynamic world map. They are using advanced tracking tools with arrows and pathways lighting up across continents.'
        },
        {
            id: 'case-chronicler',
            title: 'Case Chronicler',
            description: "You're the storyteller who makes sure no discovery gets lost! As the Case Chronicler, you document every breakthrough and create the official case files that solve the mystery.",
            mission: 'Storyteller who ensures no discovery gets lost, creates official case files',
            activities: 'Write investigation reports, create case timelines, organize team findings, and present final conclusions. You turn detective work into compelling stories!',
            skills: ['Scientific writing', 'Communication skills', 'Report organization', 'Presentation techniques'],
            appeal: 'Your words become the official record that cracks the case and shares the victory with the world!',
            icon: '�',
            imagePrompt: "A detail-oriented student detective with a digital tablet and smart pen, surrounded by floating case files, investigation reports, and timeline displays. They're documenting discoveries with geographic evidence photos and notes appearing as holographic displays."
        }
    ],
    
    badgeProgression: [
        { level: 1, title: 'Rookie', icon: '🥉', description: 'Basic geographic skills and observation', color: '#cd7f32' },
        { level: 2, title: 'Detective', icon: '🥈', description: 'Advanced case-solving and analysis', color: '#c0c0c0' },
        { level: 3, title: 'Specialist', icon: '🥇', description: 'Expert geographic crime investigation', color: '#ffd700' }
    ],
    
    cases: [
        {
            id: 'case-001',
            title: 'The Great Globe Heist',
            level: 'rookie',
            difficulty: 'low',
            location: 'Roosevelt Middle School, Room 204',
            missingItem: '12-inch classroom globe',
            requiredSkills: ['Basic geography', 'Observation', 'Coordinate reading'],
            evidence: [
                'Empty globe stand with dust outline',
                'Fingerprints on metal base',
                'Torn paper with coordinates: 40°N, 74°W',
                'Compass left behind pointing northeast',
                'World map on wall with pin missing'
            ],
            witnesses: [
                {
                    name: "Robert 'Bob' Martinez",
                    role: 'Custodial Staff',
                    testimony: "Saw someone with a large bag near the social studies wing around 2:30 PM. They kept checking their phone like they were using GPS or something.",
                    clues: ['GPS usage suggests coordinate navigation', 'Timing coincides with class dismissal', 'Large bag indicates premeditated theft']
                },
                {
                    name: 'Ms. Rodriguez',
                    role: 'Geography Teacher',
                    testimony: "The globe was there during first period geography lesson. We were studying the Prime Meridian and international dateline. A student asked specifically about New York coordinates.",
                    clues: ['Prime Meridian lesson = longitude understanding', 'New York coordinates match evidence: 40°N, 74°W', 'Student showed unusual interest in coordinate systems']
                }
            ],
            solution: {
                coordinates: { lat: 40, lng: -74, location: 'New York Harbor' },
                method: 'Coordinate analysis and compass direction',
                geographicConcepts: ['Latitude/Longitude', 'Coordinate systems', 'Cardinal directions', 'Map reading']
            }
        }
    ],
    
    assessments: {
        formative: [
            { type: 'daily-debrief', title: 'Daily Case Debrief', description: 'Reflect on geographic skills used and evidence analyzed' },
            { type: 'role-performance', title: 'Team Role Performance', description: 'Assessment of individual role responsibilities' },
            { type: 'geographic-journal', title: 'Detective Geographic Journal', description: 'Ongoing documentation of geographic concepts learned' }
        ],
        summative: [
            { type: 'final-case', title: 'Master Criminal Case', description: 'Complex multi-day investigation requiring all learned skills' },
            { type: 'portfolio', title: 'Detective Portfolio', description: 'Collection of all case work and reflections' },
            { type: 'graduation-presentation', title: 'Academy Graduation Presentation', description: 'Present most challenging case solution to Bureau officials' }
        ]
    },
    
    geographicThemes: [
        { theme: 'Location', description: 'Absolute and relative position using coordinates and landmarks' },
        { theme: 'Place', description: 'Physical and human characteristics of specific locations' },
        { theme: 'Region', description: 'Areas with common characteristics and boundaries' },
        { theme: 'Movement', description: 'Migration patterns, trade routes, and transportation' },
        { theme: 'Human-Environment Interaction', description: 'How people affect and are affected by their environment' }
    ]
};

// API Routes for the simulation system
function createSimulationRoutes(app) {
    
    // Serve the main simulation interface
    app.get('/simulation/geographic-detective-academy', (req, res) => {
        res.sendFile(path.join(__dirname, 'public', 'geographic-detective-academy.html'));
    });
    
    // Get simulation framework overview
    app.get('/api/simulation/framework', (req, res) => {
        res.json({
            success: true,
            data: simulationFramework
        });
    });
    
    // Get team roles
    app.get('/api/simulation/team-roles', (req, res) => {
        res.json({
            success: true,
            data: simulationFramework.teamRoles
        });
    });
    
    // Get enhanced daily structure with full content
    app.get('/api/simulation/daily-structure', (req, res) => {
        res.json({
            success: true,
            data: enhancedSimulationContent.dailyStructure
        });
    });
    
    // Get enhanced investigation events
    app.get('/api/simulation/investigation-events', (req, res) => {
        res.json({
            success: true,
            data: enhancedSimulationContent.investigationEvents
        });
    });
    
    // Get enhanced student materials
    app.get('/api/simulation/student-materials', (req, res) => {
        res.json({
            success: true,
            data: enhancedSimulationContent.studentMaterials
        });
    });
    
    // Get enhanced assessment system
    app.get('/api/simulation/assessments', (req, res) => {
        res.json({
            success: true,
            data: enhancedSimulationContent.assessmentRubrics
        });
    });
    
    // Get enhanced teacher guide
    app.get('/api/simulation/teacher-guide', (req, res) => {
        res.json({
            success: true,
            data: enhancedSimulationContent.teacherGuide
        });
    });
    
    // Get specific case details
    app.get('/api/simulation/cases/:caseId', (req, res) => {
        const caseId = req.params.caseId;
        const caseData = simulationFramework.cases.find(c => c.id === caseId);
        
        if (!caseData) {
            return res.status(404).json({
                success: false,
                error: 'Case not found'
            });
        }
        
        res.json({
            success: true,
            data: caseData
        });
    });
    
    // Get all cases
    app.get('/api/simulation/cases', (req, res) => {
        res.json({
            success: true,
            data: simulationFramework.cases
        });
    });
    
    // Get badge progression
    app.get('/api/simulation/badges', (req, res) => {
        res.json({
            success: true,
            data: simulationFramework.badgeProgression
        });
    });
    
    // Get geographic themes
    app.get('/api/simulation/geographic-themes', (req, res) => {
        res.json({
            success: true,
            data: simulationFramework.geographicThemes
        });
    });
    
    // Create new case (for teachers to add custom cases)
    app.post('/api/simulation/cases', (req, res) => {
        try {
            const newCase = {
                id: `case-${Date.now()}`,
                ...req.body,
                createdAt: new Date(),
                custom: true
            };
            
            // In production, save to database
            // For now, just return the case structure
            res.json({
                success: true,
                data: newCase,
                message: 'Case created successfully'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Failed to create case'
            });
        }
    });

    // MEGA PDF GENERATION ENDPOINT - Generate complete simulation package
    app.post('/api/simulation/generate-complete-pdf', async (req, res) => {
        try {
            console.log('📄 PDF Generation Request:', req.body);
            
            const { sections, includeImages, format, timestamp } = req.body;
            
            // Generate comprehensive PDF package
            const pdfContent = await generateComprehensivePDF(sections, includeImages);
            
            // Set response headers for PDF download
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 
                `attachment; filename="Geographic-Detective-Academy-Complete-Package-${timestamp.split('T')[0]}.pdf"`);
            
            // Send the generated PDF
            res.send(pdfContent);
            
            console.log('✅ PDF Generation Complete!');
            
        } catch (error) {
            console.error('❌ PDF Generation Error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to generate PDF package'
            });
        }
    });
    
    console.log('🕵️ Geographic Detective Academy simulation routes loaded');
}

async function generateComprehensivePDF(sections, includeImages) {
    console.log('🔥 Generating REAL comprehensive PDF with actual content...');
    
    // Launch headless browser for PDF generation
    const browser = await puppeteer.launch({ 
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Generate comprehensive HTML content for PDF
    const htmlContent = await generateComprehensiveHTML(sections, includeImages);
    
    // Set the HTML content
    await page.setContent(htmlContent, { 
        waitUntil: 'networkidle0',
        timeout: 30000 
    });
    
    // Generate PDF with proper formatting
    const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
            top: '20mm',
            right: '15mm',
            bottom: '20mm',
            left: '15mm'
        },
        displayHeaderFooter: true,
        headerTemplate: `
            <div style="font-size: 10px; margin: auto; color: #666;">
                Geographic Detective Academy - Complete Implementation Package
            </div>
        `,
        footerTemplate: `
            <div style="font-size: 10px; margin: auto; color: #666;">
                Page <span class="pageNumber"></span> of <span class="totalPages"></span>
            </div>
        `
    });
    
    await browser.close();
    
    console.log('✅ MASSIVE PDF Generated Successfully!');
    return pdfBuffer;
}

async function generateComprehensiveHTML(sections, includeImages) {
    // Build comprehensive HTML with ALL content
    let html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Geographic Detective Academy - Complete Package</title>
        <style>
            body { 
                font-family: Arial, sans-serif; 
                line-height: 1.6; 
                color: #333; 
                max-width: 800px; 
                margin: 0 auto; 
                padding: 20px;
            }
            h1 { 
                color: #1a237e; 
                border-bottom: 3px solid #1a237e; 
                padding-bottom: 10px;
                page-break-before: always;
            }
            h2 { 
                color: #3949ab; 
                border-bottom: 2px solid #3949ab; 
                padding-bottom: 5px;
                margin-top: 30px;
            }
            h3 { 
                color: #5c6bc0; 
                margin-top: 25px;
            }
            .section { 
                margin-bottom: 40px; 
                page-break-inside: avoid;
            }
            .cover-page {
                text-align: center;
                page-break-after: always;
                padding: 100px 0;
            }
            .cover-title {
                font-size: 48px;
                color: #1a237e;
                margin-bottom: 20px;
                font-weight: bold;
            }
            .cover-subtitle {
                font-size: 24px;
                color: #666;
                margin-bottom: 40px;
            }
            .stats-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 20px;
                margin: 40px 0;
            }
            .stat-box {
                background: #f5f5f5;
                padding: 20px;
                border-radius: 8px;
                text-align: center;
                border-left: 5px solid #1a237e;
            }
            .day-card {
                background: #f8f9fa;
                border: 1px solid #dee2e6;
                border-radius: 8px;
                padding: 20px;
                margin: 15px 0;
                page-break-inside: avoid;
            }
            .role-card {
                background: #fff;
                border: 2px solid #e9ecef;
                border-radius: 12px;
                padding: 20px;
                margin: 20px 0;
                page-break-inside: avoid;
            }
            .investigation-case {
                background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                border-left: 5px solid #dc3545;
                padding: 25px;
                margin: 20px 0;
                border-radius: 0 8px 8px 0;
                page-break-inside: avoid;
            }
            .assessment-rubric {
                border: 1px solid #dee2e6;
                border-radius: 8px;
                margin: 20px 0;
                overflow: hidden;
            }
            .rubric-header {
                background: #1a237e;
                color: white;
                padding: 15px;
                font-weight: bold;
            }
            .rubric-level {
                padding: 15px;
                border-bottom: 1px solid #dee2e6;
            }
            .rubric-level:last-child {
                border-bottom: none;
            }
            .rubric-level h4 {
                color: #3949ab;
                margin: 0 0 8px 0;
                font-size: 16px;
            }
            .rubric-level p {
                margin: 0;
                line-height: 1.5;
            }
            .table-of-contents {
                page-break-after: always;
                padding: 20px 0;
            }
            .toc-item {
                padding: 8px 0;
                border-bottom: 1px dotted #ccc;
                display: flex;
                justify-content: space-between;
            }
        </style>
    </head>
    <body>
    
    <!-- COVER PAGE -->
    <div class="cover-page">
        <div class="cover-title">Geographic Detective Academy</div>
        <div class="cover-subtitle">Complete Implementation Package</div>
        <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
        
        <div class="stats-grid">
            <div class="stat-box">
                <h3>12</h3>
                <p>Days of Content</p>
            </div>
            <div class="stat-box">
                <h3>11</h3>
                <p>Investigation Cases</p>
            </div>
            <div class="stat-box">
                <h3>4</h3>
                <p>Detective Roles</p>
            </div>
            <div class="stat-box">
                <h3>50+</h3>
                <p>Pages of Materials</p>
            </div>
        </div>
        
        <p><em>Everything needed to implement the Geographic Detective Academy simulation in your classroom</em></p>
    </div>
    
    <!-- TABLE OF CONTENTS -->
    <div class="table-of-contents">
        <h1>Table of Contents</h1>
        ${generateTableOfContents(sections)}
    </div>
    `;

    // Add each section based on selections
    const {
        generateInvestigationsSection,
        generateAssessmentsSection,
        generateStudentMaterialsSection,
        generateStandardsSection,
        generateImplementationSection
    } = require('./pdf-sections-complete');
    
    if (sections.teacherGuide) {
        html += await generateTeacherGuideSection();
    }
    
    if (sections.dailyStructure) {
        html += await generateDailyStructureSection();
    }
    
    if (sections.teamRoles) {
        html += await generateTeamRolesSection();
    }
    
    if (sections.investigations) {
        html += await generateInvestigationsSection();
    }
    
    if (sections.assessments) {
        html += await generateAssessmentsSection();
    }
    
    if (sections.studentMaterials) {
        html += await generateStudentMaterialsSection();
    }
    
    if (sections.standards) {
        html += await generateStandardsSection();
    }
    
    if (sections.implementation) {
        html += await generateImplementationSection();
    }

    html += `
    </body>
    </html>
    `;
    
    return html;
}

function generateTableOfContents(sections) {
    let toc = '';
    let pageNum = 1;
    
    if (sections.teacherGuide) {
        toc += `<div class="toc-item"><span>Teacher Implementation Guide</span><span>Page ${pageNum}</span></div>`;
        pageNum += 8;
    }
    if (sections.dailyStructure) {
        toc += `<div class="toc-item"><span>Daily Structure & Timeline</span><span>Page ${pageNum}</span></div>`;
        pageNum += 6;
    }
    if (sections.teamRoles) {
        toc += `<div class="toc-item"><span>Team Roles & Character Cards</span><span>Page ${pageNum}</span></div>`;
        pageNum += 4;
    }
    if (sections.investigations) {
        toc += `<div class="toc-item"><span>Investigation Events (All 11 Cases)</span><span>Page ${pageNum}</span></div>`;
        pageNum += 22;
    }
    if (sections.assessments) {
        toc += `<div class="toc-item"><span>Assessment System & Rubrics</span><span>Page ${pageNum}</span></div>`;
        pageNum += 8;
    }
    if (sections.studentMaterials) {
        toc += `<div class="toc-item"><span>Student Materials & Resources</span><span>Page ${pageNum}</span></div>`;
        pageNum += 12;
    }
    if (sections.standards) {
        toc += `<div class="toc-item"><span>Learning Objectives & Standards</span><span>Page ${pageNum}</span></div>`;
        pageNum += 4;
    }
    if (sections.implementation) {
        toc += `<div class="toc-item"><span>Implementation Checklists</span><span>Page ${pageNum}</span></div>`;
    }
    
    return toc;
}

async function generateTeacherGuideSection() {
    return `
    <div class="section">
        <h1>📖 Teacher Implementation Guide</h1>
        
        <h2>🎯 Overview</h2>
        <p>The Geographic Detective Academy transforms your classroom into an immersive investigation bureau where students become rookie detectives solving geographic mysteries. This 12-day simulation develops geographic thinking skills while maintaining high student engagement through authentic detective work.</p>
        
        <h2>🏗️ Setup Requirements</h2>
        
        <h3>Technology Needs</h3>
        <ul>
            <li><strong>Computer/Tablet Access:</strong> 1 device per team (4 students) minimum</li>
            <li><strong>Internet Connection:</strong> For research and map access</li>
            <li><strong>Projector/Smart Board:</strong> For case presentations and briefings</li>
            <li><strong>Optional:</strong> Printing capabilities for evidence packets</li>
        </ul>
        
        <h3>Physical Classroom Setup</h3>
        <ul>
            <li><strong>Team Tables:</strong> Arrange desks for 4-person detective teams</li>
            <li><strong>Evidence Board:</strong> Wall space for displaying case information</li>
            <li><strong>Case Files Area:</strong> Designated space for investigation materials</li>
            <li><strong>Briefing Area:</strong> Central space for daily mission briefings</li>
        </ul>
        
        <h2>👥 Team Formation Strategy</h2>
        
        <h3>Optimal Team Composition</h3>
        <div class="day-card">
            <h4>4-Person Detective Units</h4>
            <p>Each team should include one student in each specialized role:</p>
            <ul>
                <li><strong>Evidence Manager:</strong> Detail-oriented, organized student</li>
                <li><strong>Geography Specialist:</strong> Student with strong map skills or world knowledge</li>
                <li><strong>Resource Tracker:</strong> Student good with research and data</li>
                <li><strong>Case Chronicler:</strong> Strong communicator and writer</li>
            </ul>
        </div>
        
        <h3>Assignment Strategies</h3>
        <ul>
            <li><strong>Interest Survey:</strong> Have students rank their role preferences</li>
            <li><strong>Skill Assessment:</strong> Consider individual student strengths</li>
            <li><strong>Diversity Goals:</strong> Balance teams by ability and learning styles</li>
            <li><strong>Student Choice:</strong> Allow some self-selection within parameters</li>
        </ul>
        
        <h2>📅 Daily Management</h2>
        
        <h3>Class Period Structure (50 minutes)</h3>
        <div class="day-card">
            <h4>Mission Briefing (5-8 minutes)</h4>
            <ul>
                <li>Present the daily case scenario</li>
                <li>Explain investigation objectives</li>
                <li>Review geographic focus areas</li>
                <li>Assign team roles and responsibilities</li>
            </ul>
        </div>
        
        <div class="day-card">
            <h4>Active Investigation (35-40 minutes)</h4>
            <ul>
                <li>Teams work through case materials</li>
                <li>Research and analyze evidence</li>
                <li>Apply geographic concepts and tools</li>
                <li>Collaborate on solutions</li>
            </ul>
        </div>
        
        <div class="day-card">
            <h4>Case Debrief (5-7 minutes)</h4>
            <ul>
                <li>Teams share key findings</li>
                <li>Discuss geographic connections</li>
                <li>Preview next investigation</li>
                <li>Reflect on learning</li>
            </ul>
        </div>
        
        <h2>🎓 Assessment Integration</h2>
        
        <h3>Formative Assessment Opportunities</h3>
        <ul>
            <li><strong>Daily Observations:</strong> Monitor team collaboration and geographic thinking</li>
            <li><strong>Case Logs:</strong> Review student documentation of investigation process</li>
            <li><strong>Quick Checks:</strong> Exit tickets with geographic concept questions</li>
            <li><strong>Peer Feedback:</strong> Team member evaluations of role performance</li>
        </ul>
        
        <h3>Summative Assessment Options</h3>
        <ul>
            <li><strong>Master Detective Case:</strong> Individual or team final investigation</li>
            <li><strong>Portfolio Review:</strong> Complete collection of case work</li>
            <li><strong>Geographic Skills Test:</strong> Authentic assessment of map and research skills</li>
            <li><strong>Presentation:</strong> Team presentation of major case findings</li>
        </ul>
        
        <h2>🚨 Troubleshooting Guide</h2>
        
        <h3>Common Challenges & Solutions</h3>
        
        <div class="day-card">
            <h4>Problem: Students struggle with geographic vocabulary</h4>
            <p><strong>Solution:</strong> Create a "Detective Dictionary" with key terms. Encourage teams to maintain their own glossary of geographic terms encountered during investigations.</p>
        </div>
        
        <div class="day-card">
            <h4>Problem: Uneven participation within teams</h4>
            <p><strong>Solution:</strong> Implement role rotation every 3-4 days. Use individual accountability measures like personal case logs alongside team work.</p>
        </div>
        
        <div class="day-card">
            <h4>Problem: Technology difficulties</h4>
            <p><strong>Solution:</strong> Prepare printed backup materials for each case. Train student "Tech Specialists" to help troubleshoot common issues.</p>
        </div>
        
        <div class="day-card">
            <h4>Problem: Students finish investigations too quickly</h4>
            <p><strong>Solution:</strong> Prepare extension questions and bonus investigations. Challenge fast teams to mentor struggling teams.</p>
        </div>
        
        <h2>🌟 Success Tips</h2>
        
        <ul>
            <li><strong>Embrace the Role:</strong> Refer to yourself as "Chief Detective" and students as "Rookie Detectives"</li>
            <li><strong>Create Atmosphere:</strong> Use detective music, dim lighting for "night investigations," and mystery sound effects</li>
            <li><strong>Celebrate Discoveries:</strong> Acknowledge teams when they make geographic connections or solve challenging cases</li>
            <li><strong>Connect to Current Events:</strong> Reference real geographic issues and current global situations</li>
            <li><strong>Document Success:</strong> Take photos of teams in action and showcase exemplary case work</li>
        </ul>
    </div>
    `;
}

async function generateDailyStructureSection() {
    return `
    <div class="section">
        <h1>📅 Daily Structure & Timeline</h1>
        
        <h2>🏗️ 12-Day Progression Overview</h2>
        <p>The Geographic Detective Academy follows a carefully structured progression that builds geographic skills and knowledge through increasingly complex investigations.</p>
        
        <div class="day-card">
            <h3>🎯 Day 1: Academy Orientation</h3>
            <p><strong>Focus:</strong> Introduction to Geographic Bureau and Detective Methods</p>
            <ul>
                <li>Character creation and team formation</li>
                <li>Introduction to basic map reading skills</li>
                <li>First simple investigation: "The Case of the Missing Classroom"</li>
                <li>Geographic concept: Scale and basic map elements</li>
            </ul>
            <p><strong>Skills Developed:</strong> Team collaboration, basic map interpretation</p>
        </div>
        
        <div class="day-card">
            <h3>🌍 Day 2: Mountains of Mystery</h3>
            <p><strong>Focus:</strong> Physical Geography and Elevation</p>
            <ul>
                <li>Investigation: Missing mountain research equipment</li>
                <li>Use topographic maps and elevation profiles</li>
                <li>Analyze climate patterns in mountain regions</li>
                <li>Geographic concept: Relief, elevation, and physical features</li>
            </ul>
            <p><strong>Skills Developed:</strong> Topographic map reading, elevation analysis</p>
        </div>
        
        <div class="day-card">
            <h3>🏛️ Day 3: International Heritage Heist</h3>
            <p><strong>Focus:</strong> Cultural Geography and World Heritage</p>
            <ul>
                <li>Investigation: Stolen cultural artifacts from multiple countries</li>
                <li>Research world heritage sites and cultural significance</li>
                <li>Analyze cultural diffusion and preservation</li>
                <li>Geographic concept: Cultural geography and human-environment interaction</li>
            </ul>
            <p><strong>Skills Developed:</strong> Cultural research, international awareness</p>
        </div>
        
        <div class="day-card">
            <h3>💧 Day 4: River System Sabotage</h3>
            <p><strong>Focus:</strong> Water Systems and Human Geography</p>
            <ul>
                <li>Investigation: Contamination of major river system</li>
                <li>Map watershed boundaries and water flow</li>
                <li>Analyze human impact on water resources</li>
                <li>Geographic concept: Watersheds, river systems, and water management</li>
            </ul>
            <p><strong>Skills Developed:</strong> Watershed mapping, environmental analysis</p>
        </div>
        
        <div class="day-card">
            <h3>🌦️ Day 5: Climate Data Disappearance</h3>
            <p><strong>Focus:</strong> Climate Patterns and Data Analysis</p>
            <ul>
                <li>Investigation: Missing climate research from weather stations</li>
                <li>Analyze climate graphs and weather patterns</li>
                <li>Compare climate zones and their characteristics</li>
                <li>Geographic concept: Climate vs. weather, climate zones</li>
            </ul>
            <p><strong>Skills Developed:</strong> Data interpretation, climate analysis</p>
        </div>
        
        <div class="day-card">
            <h3>🏙️ Day 6: Urban Planning Puzzle</h3>
            <p><strong>Focus:</strong> Urban Geography and City Planning</p>
            <ul>
                <li>Investigation: Mysterious changes to city development plans</li>
                <li>Analyze urban growth patterns and land use</li>
                <li>Study transportation networks and infrastructure</li>
                <li>Geographic concept: Urbanization, land use, city planning</li>
            </ul>
            <p><strong>Skills Developed:</strong> Urban analysis, land use interpretation</p>
        </div>
        
        <div class="day-card">
            <h3>🌾 Day 7: Agricultural Mystery</h3>
            <p><strong>Focus:</strong> Agricultural Geography and Food Systems</p>
            <ul>
                <li>Investigation: Disrupted global food supply chains</li>
                <li>Map agricultural regions and crop distributions</li>
                <li>Analyze factors affecting agricultural production</li>
                <li>Geographic concept: Agricultural geography, food security</li>
            </ul>
            <p><strong>Skills Developed:</strong> Agricultural mapping, systems thinking</p>
        </div>
        
        <div class="day-card">
            <h3>⚡ Day 8: Energy Resource Riddle</h3>
            <p><strong>Focus:</strong> Natural Resources and Energy Geography</p>
            <ul>
                <li>Investigation: Sabotaged renewable energy installations</li>
                <li>Map energy resources and production facilities</li>
                <li>Analyze renewable vs. non-renewable energy patterns</li>
                <li>Geographic concept: Resource distribution, energy geography</li>
            </ul>
            <p><strong>Skills Developed:</strong> Resource mapping, sustainability analysis</p>
        </div>
        
        <div class="day-card">
            <h3>🌊 Day 9: Coastal Crisis</h3>
            <p><strong>Focus:</strong> Coastal Geography and Sea Level Change</p>
            <ul>
                <li>Investigation: Unusual coastal changes and missing oceanographic data</li>
                <li>Study coastal processes and landforms</li>
                <li>Analyze sea level change and coastal management</li>
                <li>Geographic concept: Coastal processes, environmental change</li>
            </ul>
            <p><strong>Skills Developed:</strong> Coastal analysis, environmental monitoring</p>
        </div>
        
        <div class="day-card">
            <h3>👥 Day 10: Population Pattern Puzzle</h3>
            <p><strong>Focus:</strong> Population Geography and Demographics</p>
            <ul>
                <li>Investigation: Altered population census data</li>
                <li>Analyze population distribution and density patterns</li>
                <li>Study migration patterns and demographic trends</li>
                <li>Geographic concept: Population geography, demographic transition</li>
            </ul>
            <p><strong>Skills Developed:</strong> Demographic analysis, population mapping</p>
        </div>
        
        <div class="day-card">
            <h3>🌐 Day 11: Global Connections Crisis</h3>
            <p><strong>Focus:</strong> Globalization and Interconnectedness</p>
            <ul>
                <li>Investigation: Disrupted global communication and trade networks</li>
                <li>Map global trade routes and communication systems</li>
                <li>Analyze economic and cultural globalization</li>
                <li>Geographic concept: Globalization, interconnectedness</li>
            </ul>
            <p><strong>Skills Developed:</strong> Systems analysis, global perspective</p>
        </div>
        
        <div class="day-card">
            <h3>🏆 Day 12: Master Detective Graduation</h3>
            <p><strong>Focus:</strong> Culminating Investigation and Assessment</p>
            <ul>
                <li>Final complex case requiring all learned skills</li>
                <li>Teams present comprehensive investigation findings</li>
                <li>Reflection on geographic learning and skill development</li>
                <li>Celebration of detective achievements</li>
            </ul>
            <p><strong>Skills Developed:</strong> Synthesis, presentation, reflection</p>
        </div>
        
        <h2>⏰ Flexible Timing Options</h2>
        
        <h3>Standard Implementation (12 consecutive days)</h3>
        <ul>
            <li>Ideal for maintaining narrative continuity</li>
            <li>Builds momentum and engagement</li>
            <li>Best for intensive geographic skills development</li>
        </ul>
        
        <h3>Extended Implementation (2-3 weeks)</h3>
        <ul>
            <li>Allows for deeper exploration of each case</li>
            <li>Time for additional research and extension activities</li>
            <li>Can integrate with other curriculum areas</li>
        </ul>
        
        <h3>Modified Implementation (Selected cases)</h3>
        <ul>
            <li>Choose 6-8 cases that align with specific curriculum needs</li>
            <li>Focus on particular geographic themes or skills</li>
            <li>Adapt to available class time and resources</li>
        </ul>
    </div>
    `;
}

async function generateTeamRolesSection() {
    return `
    <div class="section">
        <h1>👥 Team Roles & Character Cards</h1>
        
        <h2>🎯 Detective Team Structure</h2>
        <p>Each 4-person detective team includes specialized roles that ensure comprehensive investigation capabilities while developing specific geographic skills.</p>
        
        <div class="role-card">
            <h3>🔍 Evidence Manager</h3>
            <h4>Mission Statement</h4>
            <p>You're the mastermind who spots patterns others miss! As the Evidence Manager, you collect every geographic clue—from satellite images to population data—and turn chaos into crystal-clear evidence.</p>
            
            <h4>Daily Responsibilities</h4>
            <ul>
                <li>Organize and catalog all case materials and evidence</li>
                <li>Create evidence timelines and connection maps</li>
                <li>Maintain team investigation logs and documentation</li>
                <li>Lead evidence analysis discussions</li>
                <li>Ensure no geographic clues are overlooked</li>
            </ul>
            
            <h4>Geographic Skills Developed</h4>
            <ul>
                <li>Critical thinking and pattern recognition</li>
                <li>Data organization and analysis</li>
                <li>Geographic information synthesis</li>
                <li>Digital research techniques</li>
                <li>Systematic investigation methods</li>
            </ul>
            
            <h4>Why This Role Is Awesome</h4>
            <p>Every case gets solved because YOU found the missing piece of the puzzle! You become the team's memory and organizational powerhouse, developing skills that are valuable in any career path.</p>
        </div>
        
        <div class="role-card">
            <h3>🌍 Geography Specialist</h3>
            <h4>Mission Statement</h4>
            <p>You're the walking encyclopedia of world knowledge! When the team needs to know about ANY place on Earth, you're their go-to expert with instant answers.</p>
            
            <h4>Daily Responsibilities</h4>
            <ul>
                <li>Research geographic locations relevant to investigations</li>
                <li>Analyze terrain, climate, and environmental factors</li>
                <li>Explain cultural and regional characteristics</li>
                <li>Interpret maps, satellite images, and geographic data</li>
                <li>Connect geographic knowledge to case evidence</li>
            </ul>
            
            <h4>Geographic Skills Developed</h4>
            <ul>
                <li>World geography knowledge and spatial awareness</li>
                <li>Map reading and interpretation</li>
                <li>Cultural and environmental analysis</li>
                <li>Geographic reasoning and connections</li>
                <li>Regional expertise and global perspective</li>
            </ul>
            
            <h4>Why This Role Is Awesome</h4>
            <p>You become the ultimate world explorer without leaving your seat—and everyone relies on YOUR expertise! You develop a global perspective that makes you a more informed citizen.</p>
        </div>
        
        <div class="role-card">
            <h3>📊 Resource Tracker</h3>
            <h4>Mission Statement</h4>
            <p>You're the data detective who follows the numbers to crack the case! Every population statistic, economic indicator, and resource flow becomes a crucial clue in your expert hands.</p>
            
            <h4>Daily Responsibilities</h4>
            <ul>
                <li>Research demographic and economic data</li>
                <li>Track resource flows and trade patterns</li>
                <li>Analyze statistical information and trends</li>
                <li>Create charts, graphs, and data visualizations</li>
                <li>Identify quantitative evidence and patterns</li>
            </ul>
            
            <h4>Geographic Skills Developed</h4>
            <ul>
                <li>Data analysis and statistical interpretation</li>
                <li>Economic and demographic geography</li>
                <li>Research methodology and source evaluation</li>
                <li>Quantitative reasoning and data visualization</li>
                <li>Resource and sustainability analysis</li>
            </ul>
            
            <h4>Why This Role Is Awesome</h4>
            <p>You develop powerful analytical skills that are essential in our data-driven world! You learn to find stories hidden in numbers and become a critical thinking powerhouse.</p>
        </div>
        
        <div class="role-card">
            <h3>📝 Case Chronicler</h3>
            <h4>Mission Statement</h4>
            <p>You're the storyteller who brings investigations to life! Your words capture the excitement of geographic discoveries and help everyone understand the bigger picture.</p>
            
            <h4>Daily Responsibilities</h4>
            <ul>
                <li>Document investigation process and team discussions</li>
                <li>Write case summaries and progress reports</li>
                <li>Prepare team presentations and findings</li>
                <li>Communicate geographic discoveries clearly</li>
                <li>Create compelling narratives from investigation data</li>
            </ul>
            
            <h4>Geographic Skills Developed</h4>
            <ul>
                <li>Geographic communication and writing</li>
                <li>Presentation and public speaking</li>
                <li>Information synthesis and summary</li>
                <li>Visual communication and storytelling</li>
                <li>Geographic vocabulary and terminology</li>
            </ul>
            
            <h4>Why This Role Is Awesome</h4>
            <p>You become the voice of your team and develop communication superpowers! Your ability to explain complex geographic concepts clearly makes you a valuable team member in any situation.</p>
        </div>
        
        <h2>🔄 Role Rotation Strategies</h2>
        
        <h3>Option 1: Full Simulation Roles</h3>
        <ul>
            <li>Students maintain the same role for all 12 days</li>
            <li>Allows deep development of specialized skills</li>
            <li>Students become true experts in their area</li>
            <li>Best for shorter implementations</li>
        </ul>
        
        <h3>Option 2: Mid-Point Rotation</h3>
        <ul>
            <li>Switch roles after Day 6</li>
            <li>Gives students experience with two different perspectives</li>
            <li>Maintains some specialization while adding variety</li>
            <li>Good balance of depth and breadth</li>
        </ul>
        
        <h3>Option 3: Frequent Rotation</h3>
        <ul>
            <li>Switch roles every 3 days</li>
            <li>All students experience all roles</li>
            <li>Develops well-rounded geographic skills</li>
            <li>Best for longer implementations</li>
        </ul>
        
        <h2>👥 Team Formation Best Practices</h2>
        
        <h3>Heterogeneous Grouping</h3>
        <ul>
            <li>Mix students with different skill levels and learning styles</li>
            <li>Ensure each team has strong readers, writers, and analytical thinkers</li>
            <li>Consider personality compatibility for effective collaboration</li>
            <li>Balance gender and cultural diversity when possible</li>
        </ul>
        
        <h3>Student Choice Considerations</h3>
        <ul>
            <li>Survey students about role preferences and interests</li>
            <li>Allow some input while maintaining balanced teams</li>
            <li>Consider students' academic strengths and growth areas</li>
            <li>Be prepared to make adjustments if teams aren't working effectively</li>
        </ul>
        
        <h3>Team Building Activities</h3>
        <ul>
            <li>Team name creation and detective unit identity</li>
            <li>Role-specific icebreakers and skill inventories</li>
            <li>Practice investigations to establish team dynamics</li>
            <li>Clear expectations and communication protocols</li>
        </ul>
    </div>
    `;
}

module.exports = { createSimulationRoutes, simulationFramework };
