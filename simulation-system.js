/**
 * Geographic Detective Academy Simulation System
 * Based on the extracted framework from Oregon Trail simulation materials
 */

const express = require('express');
const path = require('path');
const fs = require('fs');
const { enhancedSimulationContent } = require('./simulation-content-enhanced');

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
            description: 'Collects, analyzes, and preserves all case evidence with meticulous attention to detail.',
            skills: ['Evidence preservation', 'Forensic analysis', 'Documentation'],
            icon: '🔍'
        },
        {
            id: 'geography-specialist',
            title: 'Geography Specialist', 
            description: 'Interprets maps, coordinates, and terrain to solve location-based mysteries.',
            skills: ['Map reading', 'Coordinate systems', 'Terrain analysis'],
            icon: '🗺️'
        },
        {
            id: 'resource-tracker',
            title: 'Resource Tracker',
            description: 'Manages team equipment, budget, and logistical planning for investigations.',
            skills: ['Resource management', 'Logistics', 'Budget analysis'],
            icon: '📊'
        },
        {
            id: 'case-chronicler',
            title: 'Case Chronicler',
            description: 'Documents findings, maintains case files, and tracks investigation progress.',
            skills: ['Documentation', 'Report writing', 'Case tracking'],
            icon: '📝'
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
    
    console.log('🕵️ Geographic Detective Academy simulation routes loaded');
}

module.exports = { createSimulationRoutes, simulationFramework };
