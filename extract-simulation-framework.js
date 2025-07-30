const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

/**
 * Extract Geographic Detective Academy Framework from PDF
 * This will analyze the simulation structure and create templates
 */

async function extractSimulationFramework() {
    console.log('🕵️ Extracting Geographic Detective Academy Framework...\n');
    
    const pdfPath = path.join(__dirname, 'local-simulations', 'simulation pdf', 'WELCOME-TO-THE-GEOGRAPHIC-DETECTIVE-ACADEMY (1).pdf');
    
    try {
        // Read and parse the PDF
        const dataBuffer = fs.readFileSync(pdfPath);
        const pdfData = await pdf(dataBuffer);
        
        console.log(`📄 PDF Pages: ${pdfData.numpages}`);
        console.log(`📝 Text Length: ${pdfData.text.length} characters\n`);
        
        // Extract the framework structure
        const framework = analyzeSimulationStructure(pdfData.text);
        
        // Save the extracted content
        await saveFrameworkData(framework, pdfData.text);
        
        console.log('✅ Framework extraction complete!');
        return framework;
        
    } catch (error) {
        console.error('❌ Error extracting PDF:', error.message);
        return null;
    }
}

function analyzeSimulationStructure(text) {
    console.log('🔍 Analyzing simulation structure...\n');
    
    const framework = {
        title: extractTitle(text),
        overview: extractOverview(text),
        schedule: extractSchedule(text),
        story: extractStory(text),
        components: extractComponents(text),
        navigation: extractNavigationStructure(),
        themes: extractThemes(text),
        assessments: extractAssessments(text)
    };
    
    return framework;
}

function extractTitle(text) {
    const titleMatch = text.match(/Geographic Detective Academy|Q1[:\s]*(.+)|The Mystery of[^\\n]+/i);
    return titleMatch ? titleMatch[0].trim() : 'Geographic Detective Academy';
}

function extractOverview(text) {
    const overviewSection = text.match(/SIMULATION OVERVIEW[\\s\\S]*?(?=SCHEDULE|THE STORY|$)/i);
    if (overviewSection) {
        return overviewSection[0].replace(/SIMULATION OVERVIEW/i, '').trim();
    }
    
    // Look for description patterns
    const descMatch = text.match(/Students become[^.]*\.[^.]*\.[^.]*\./i);
    return descMatch ? descMatch[0] : 'Students engage in geographic investigation simulation.';
}

function extractSchedule(text) {
    const schedule = [];
    
    // Look for day-by-day structure
    const setupMatch = text.match(/Setup Day[^\\n]*:[^\\n]*/i);
    if (setupMatch) schedule.push({ day: 0, phase: 'Setup', description: setupMatch[0] });
    
    const investigationMatch = text.match(/Investigation Days[^\\n]*:[^\\n]*/i);
    if (investigationMatch) schedule.push({ days: '1-10', phase: 'Investigation', description: investigationMatch[0] });
    
    const wrapMatch = text.match(/Wrap-up Day[^\\n]*:[^\\n]*/i);
    if (wrapMatch) schedule.push({ day: 11, phase: 'Wrap-up', description: wrapMatch[0] });
    
    return schedule;
}

function extractStory(text) {
    const storySection = text.match(/THE STORY[\\s\\S]*?(?=SCHEDULE|OVERVIEW|$)/i);
    if (storySection) {
        return storySection[0].replace(/THE STORY/i, '').trim();
    }
    
    // Look for narrative elements
    const narrativeMatch = text.match(/The year is 2025[^.]*\.[^.]*\.[^.]*\./i);
    return narrativeMatch ? narrativeMatch[0] : 'Engaging narrative backdrop for the simulation.';
}

function extractComponents(text) {
    return {
        teamRoles: extractTeamRoles(text),
        investigationEvents: extractInvestigationEvents(text),
        materials: extractMaterials(text),
        assessments: extractAssessmentTypes(text)
    };
}

function extractTeamRoles(text) {
    const roles = [];
    
    // Common simulation roles
    const rolePatterns = [
        /Detective|Investigator/gi,
        /Analyst|Research/gi,
        /Coordinator|Leader/gi,
        /Specialist|Expert/gi
    ];
    
    rolePatterns.forEach(pattern => {
        const matches = text.match(pattern);
        if (matches) {
            roles.push(...matches.map(role => role.toLowerCase()));
        }
    });
    
    return [...new Set(roles)]; // Remove duplicates
}

function extractInvestigationEvents(text) {
    const events = [];
    
    // Look for event-like structures
    const eventPatterns = [
        /Case \d+/gi,
        /Investigation \d+/gi,
        /Challenge \d+/gi,
        /Day \d+ Event/gi
    ];
    
    eventPatterns.forEach(pattern => {
        const matches = text.match(pattern);
        if (matches) {
            events.push(...matches);
        }
    });
    
    return events;
}

function extractMaterials(text) {
    const materials = [];
    
    // Look for material references
    const materialPatterns = [
        /handout/gi,
        /worksheet/gi,
        /map/gi,
        /guide/gi,
        /template/gi,
        /resource/gi
    ];
    
    materialPatterns.forEach(pattern => {
        const matches = text.match(new RegExp(`\\b\\w*${pattern.source}\\w*\\b`, 'gi'));
        if (matches) {
            materials.push(...matches.map(m => m.toLowerCase()));
        }
    });
    
    return [...new Set(materials)];
}

function extractAssessmentTypes(text) {
    const assessments = [];
    
    const assessmentPatterns = [
        /assessment/gi,
        /evaluation/gi,
        /rubric/gi,
        /checklist/gi,
        /portfolio/gi,
        /presentation/gi
    ];
    
    assessmentPatterns.forEach(pattern => {
        const matches = text.match(pattern);
        if (matches) {
            assessments.push(...matches.map(a => a.toLowerCase()));
        }
    });
    
    return [...new Set(assessments)];
}

function extractNavigationStructure() {
    // Based on the interface image provided
    return {
        primary: [
            { id: 'overview', label: 'Overview', icon: '📋', description: 'Simulation introduction and context' },
            { id: 'daily-structure', label: 'Daily Structure', icon: '📅', description: 'Day-by-day progression' },
            { id: 'team-roles', label: 'Team Roles', icon: '👥', description: 'Student role assignments' },
            { id: 'investigation-events', label: 'Investigation Events', icon: '⚠️', description: 'Interactive challenges' },
            { id: 'assessments', label: 'Assessments', icon: '📊', description: 'Progress tracking' },
            { id: 'teacher-guide', label: 'Teacher Guide', icon: '📖', description: 'Instructor resources' },
            { id: 'student-materials', label: 'Student Materials', icon: '📋', description: 'Handouts and resources' },
            { id: 'gamma-prompts', label: 'Gamma Prompts', icon: '🎮', description: 'Interactive elements' },
            { id: 'complete-package', label: 'Complete Package', icon: '📦', description: 'Full simulation bundle' }
        ],
        status: [
            { id: 'classified', label: 'CLASSIFIED', type: 'security', color: 'red' },
            { id: 'active-case', label: 'ACTIVE CASE', type: 'status', color: 'green' }
        ]
    };
}

function extractThemes(text) {
    const themes = [];
    
    // Geographic themes
    const themePatterns = [
        /location/gi,
        /place/gi,
        /region/gi,
        /movement/gi,
        /interaction/gi,
        /environment/gi,
        /culture/gi,
        /economic/gi,
        /political/gi,
        /physical/gi
    ];
    
    themePatterns.forEach(pattern => {
        if (text.match(pattern)) {
            themes.push(pattern.source);
        }
    });
    
    return themes;
}

function extractAssessments(text) {
    return {
        formative: [],
        summative: [],
        authentic: [],
        rubrics: []
    };
}

async function saveFrameworkData(framework, fullText) {
    const outputDir = path.join(__dirname, 'local-simulations', 'oregon-trail', 'extracted');
    
    // Ensure directory exists
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Save framework analysis
    const frameworkPath = path.join(outputDir, 'simulation-framework.json');
    fs.writeFileSync(frameworkPath, JSON.stringify(framework, null, 2));
    
    // Save full text
    const textPath = path.join(outputDir, 'simulation-full-text.txt');
    fs.writeFileSync(textPath, fullText);
    
    // Save markdown summary
    const markdownPath = path.join(outputDir, 'simulation-analysis.md');
    const markdown = generateMarkdownSummary(framework);
    fs.writeFileSync(markdownPath, markdown);
    
    console.log(`💾 Saved framework data to: ${outputDir}`);
}

function generateMarkdownSummary(framework) {
    return `# Geographic Detective Academy Framework Analysis

## Title
${framework.title}

## Overview
${framework.overview}

## Schedule
${framework.schedule.map(item => `- **${item.phase || 'Day ' + item.day}**: ${item.description}`).join('\\n')}

## Story/Narrative
${framework.story}

## Navigation Structure

### Primary Navigation
${framework.navigation.primary.map(nav => `- **${nav.label}** ${nav.icon}: ${nav.description}`).join('\\n')}

### Status Indicators
${framework.navigation.status.map(status => `- **${status.label}** (${status.color}): ${status.type}`).join('\\n')}

## Components

### Team Roles
${framework.components.teamRoles.join(', ')}

### Investigation Events
${framework.components.investigationEvents.join(', ')}

### Materials Referenced
${framework.components.materials.join(', ')}

### Assessment Types
${framework.components.assessments.join(', ')}

## Geographic Themes
${framework.themes.join(', ')}

---
*Generated by Geographic Detective Academy Framework Extractor*
`;
}

// Run the extraction
if (require.main === module) {
    extractSimulationFramework()
        .then(framework => {
            if (framework) {
                console.log('\\n🎯 Framework extraction successful!');
                console.log('📁 Check local-simulations/oregon-trail/extracted/ for results');
            }
        })
        .catch(error => {
            console.error('💥 Extraction failed:', error);
        });
}

module.exports = { extractSimulationFramework };
