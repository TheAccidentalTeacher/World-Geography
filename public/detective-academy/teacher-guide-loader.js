// Teacher Guide Content Loader
// This script loads and parses the actual markdown files from the Teacher_Guides directory

class TeacherGuideLoader {
    constructor() {
        this.guidePath = '/Curriculum/World Geography/Geographic_Detective_Academy_Curriculum/Teacher_Guides/';
        this.guides = new Map();
    }

    async loadAllGuides() {
        const dayIds = ['setup', 'day1', 'day2', 'day3', 'day4', 'day5', 'day6', 'day7', 'day8', 'day9', 'day10', 'day11', 'day12'];

        const loadPromises = dayIds.map(async (dayId) => {
            try {
                const content = await this.loadGuideFromAPI(dayId);
                this.guides.set(dayId, content);
                return { dayId, success: true };
            } catch (error) {
                console.warn(`Failed to load ${dayId}:`, error);
                this.guides.set(dayId, this.createFallbackGuide(dayId));
                return { dayId, success: false, error };
            }
        });

        const results = await Promise.all(loadPromises);
        console.log('Loaded teacher guides:', results);
        return this.guides;
    }

    async loadGuideFromAPI(dayId) {
        console.log(`🔄 Loading ${dayId} from API...`);
        const response = await fetch(`/api/teacher-guide/${dayId}`);
        const data = await response.json();
        
        if (data.success) {
            console.log(`✅ API returned content for ${dayId}:`, data.content.substring(0, 100) + '...');
            const parsed = this.parseMarkdownGuide(data.content, data.filename);
            console.log(`📊 Parsed guide for ${dayId}:`, {
                title: parsed.title,
                scenes: parsed.scenes.length,
                objectives: parsed.objectives.length,
                materials: parsed.materials.length
            });
            return parsed;
        } else {
            throw new Error(data.error || 'Failed to load guide');
        }
    }

    async loadGuideFile(filename) {
        const response = await fetch(this.guidePath + filename);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const markdown = await response.text();
        return this.parseMarkdownGuide(markdown, filename);
    }

    parseMarkdownGuide(markdown, filename) {
        const lines = markdown.split('\n');
        const guide = {
            filename: filename,
            title: '',
            subtitle: '',
            overview: '',
            objectives: [],
            materials: [],
            setup: [],
            scenes: [],
            rawContent: markdown
        };

        let currentSection = '';
        let currentScene = null;
        let currentSubsection = '';
        let collectingContent = false;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmed = line.trim();
            
            // Main title
            if (trimmed.startsWith('# ')) {
                guide.title = trimmed.substring(2).trim();
                continue;
            }

            // Subtitle
            if (trimmed.startsWith('## Teacher Guide')) {
                const parts = guide.title.split(' - ');
                if (parts.length > 1) {
                    guide.subtitle = parts[1];
                    guide.title = parts[0];
                }
                continue;
            }

            // Section headers
            if (trimmed.startsWith('### ')) {
                const sectionTitle = trimmed.substring(4).trim();
                currentScene = null;
                collectingContent = false;
                
                if (sectionTitle === 'Overview') {
                    currentSection = 'overview';
                    collectingContent = true;
                } else if (sectionTitle === 'Learning Objectives') {
                    currentSection = 'objectives';
                } else if (sectionTitle === 'Materials Needed') {
                    currentSection = 'materials';
                } else if (sectionTitle === 'Classroom Setup') {
                    currentSection = 'setup';
                } else if (sectionTitle === 'Lesson Plan') {
                    currentSection = 'lesson';
                }
                continue;
            }

            // Scene headers
            if (trimmed.startsWith('#### ')) {
                const sceneTitle = trimmed.substring(5).trim();
                currentScene = {
                    title: sceneTitle,
                    content: '',
                    script: '',
                    actions: [],
                    activities: [],
                    questions: [],
                    timing: this.extractTiming(sceneTitle)
                };
                guide.scenes.push(currentScene);
                currentSection = 'scene';
                currentSubsection = '';
                continue;
            }

            // Subsection headers within scenes
            if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
                const subsectionTitle = trimmed.substring(2, trimmed.length - 2);
                if (subsectionTitle === 'Teacher Script:') {
                    currentSubsection = 'script';
                } else if (subsectionTitle === 'Actions:') {
                    currentSubsection = 'actions';
                } else if (subsectionTitle === 'Activity:') {
                    currentSubsection = 'activities';
                } else if (subsectionTitle === 'Discussion Questions:') {
                    currentSubsection = 'questions';
                }
                continue;
            }

            // Teacher script (quoted text)
            if (trimmed.startsWith('> ') && currentScene && (currentSubsection === 'script' || currentSubsection === '')) {
                const scriptText = trimmed.substring(2).replace(/^"/, '').replace(/"$/, '');
                currentScene.script += scriptText + ' ';
                continue;
            }

            // List items
            if (trimmed.startsWith('- ')) {
                const item = trimmed.substring(2).trim();
                
                if (currentSection === 'objectives') {
                    guide.objectives.push(item);
                } else if (currentSection === 'materials') {
                    guide.materials.push(item);
                } else if (currentSection === 'setup') {
                    guide.setup.push(item);
                } else if (currentScene) {
                    if (currentSubsection === 'actions') {
                        currentScene.actions.push(item);
                    } else if (currentSubsection === 'activities') {
                        currentScene.activities.push(item);
                    } else if (currentSubsection === 'questions') {
                        currentScene.questions.push(item);
                    }
                }
                continue;
            }

            // Numbered list items
            if (/^\d+\./.test(trimmed)) {
                const item = trimmed.replace(/^\d+\.\s*/, '');
                
                if (currentSection === 'setup') {
                    guide.setup.push(item);
                } else if (currentScene && currentSubsection === 'actions') {
                    currentScene.actions.push(item);
                }
                continue;
            }

            // Content collection
            if (collectingContent && trimmed) {
                if (currentSection === 'overview') {
                    guide.overview += trimmed + ' ';
                } else if (currentScene && currentSubsection === '') {
                    currentScene.content += trimmed + ' ';
                }
            }
        }

        // Clean up collected content
        guide.overview = guide.overview.trim();
        guide.scenes.forEach(scene => {
            scene.script = scene.script.trim();
            scene.content = scene.content.trim();
        });

        return guide;
    }

    extractTiming(sceneTitle) {
        const match = sceneTitle.match(/\((\d+)\s*minutes?\)/i);
        return match ? parseInt(match[1]) : null;
    }

    createFallbackGuide(dayId) {
        const dayNumber = dayId === 'setup' ? 'Setup' : dayId.replace('day', 'Day ');
        
        return {
            filename: `${dayId}_Teacher_Guide.md`,
            title: `Geographic Detective Academy: ${dayNumber}`,
            subtitle: 'Teacher Guide',
            overview: `Teacher guide for ${dayNumber} of the Geographic Detective Academy simulation. This guide provides comprehensive lesson plans, activities, and resources for conducting an engaging geographic investigation.`,
            objectives: [
                'Engage students in geographic investigation and critical thinking',
                'Develop problem-solving skills through detective work',
                'Apply geographic knowledge to real-world scenarios',
                'Foster collaborative learning and communication skills'
            ],
            materials: [
                'World maps (wall map and individual desk maps)',
                'Magnifying glasses (1 per student)',
                'Detective notebooks for student notes',
                'Pencils and colored markers',
                'Case file folders and evidence materials',
                'Reference materials and fact sheets'
            ],
            setup: [
                'Arrange desks in investigation teams of 4-5 students',
                'Set up a detective headquarters area with maps and tools',
                'Prepare case materials and evidence stations',
                'Display relevant maps and geographic references',
                'Create an atmosphere of investigation and discovery'
            ],
            scenes: [
                {
                    title: 'Scene 1: Investigation Opening (15 minutes)',
                    content: 'Begin the day\'s investigation with an engaging introduction to the case.',
                    script: `Welcome, Geographic Detectives! Today we continue our important work as investigators. Each case we solve helps us understand our world better and develops our skills as geographic experts. Are you ready for today's challenge?`,
                    actions: [
                        'Distribute case materials to each team',
                        'Review the investigation timeline and objectives',
                        'Set up evidence stations around the classroom',
                        'Assign team roles and responsibilities'
                    ],
                    activities: [
                        'Team formation and role assignment',
                        'Case briefing and initial evidence review',
                        'Geographic context establishment'
                    ],
                    questions: [
                        'What geographic factors might be important in this investigation?',
                        'What types of evidence should we look for?',
                        'How can we apply our previous detective skills to this new case?'
                    ],
                    timing: 15
                }
            ],
            rawContent: `# Geographic Detective Academy: ${dayNumber}\n## Teacher Guide\n\n### Overview\nTeacher guide content for ${dayNumber}.\n\n### Learning Objectives\n- Engage students in geographic investigation\n\n### Materials Needed\n- Maps and investigation tools\n\n### Lesson Plan\n#### Scene 1: Investigation Opening\nBegin today's investigation...`
        };
    }

    getGuide(dayId) {
        return this.guides.get(dayId);
    }

    getAllGuides() {
        return Object.fromEntries(this.guides);
    }

    // Search functionality
    searchGuides(query) {
        const results = [];
        const searchTerm = query.toLowerCase();

        for (const [dayId, guide] of this.guides) {
            const matches = [];
            
            // Search in title
            if (guide.title.toLowerCase().includes(searchTerm)) {
                matches.push({ type: 'title', text: guide.title });
            }

            // Search in overview
            if (guide.overview.toLowerCase().includes(searchTerm)) {
                matches.push({ type: 'overview', text: this.getSearchSnippet(guide.overview, searchTerm) });
            }

            // Search in objectives
            guide.objectives.forEach((obj, index) => {
                if (obj.toLowerCase().includes(searchTerm)) {
                    matches.push({ type: 'objective', text: obj, index });
                }
            });

            // Search in scenes
            guide.scenes.forEach((scene, sceneIndex) => {
                if (scene.title.toLowerCase().includes(searchTerm)) {
                    matches.push({ type: 'scene_title', text: scene.title, sceneIndex });
                }
                if (scene.script.toLowerCase().includes(searchTerm)) {
                    matches.push({ type: 'script', text: this.getSearchSnippet(scene.script, searchTerm), sceneIndex });
                }
            });

            if (matches.length > 0) {
                results.push({ dayId, guide, matches });
            }
        }

        return results;
    }

    getSearchSnippet(text, searchTerm, maxLength = 100) {
        const index = text.toLowerCase().indexOf(searchTerm.toLowerCase());
        if (index === -1) return text.substring(0, maxLength) + '...';
        
        const start = Math.max(0, index - 30);
        const end = Math.min(text.length, index + searchTerm.length + 30);
        
        let snippet = text.substring(start, end);
        if (start > 0) snippet = '...' + snippet;
        if (end < text.length) snippet = snippet + '...';
        
        return snippet;
    }

    // Export functionality
    exportGuideAsMarkdown(dayId) {
        const guide = this.getGuide(dayId);
        if (!guide) return null;

        return guide.rawContent || this.generateMarkdownFromGuide(guide);
    }

    generateMarkdownFromGuide(guide) {
        let markdown = `# ${guide.title}\n`;
        if (guide.subtitle) {
            markdown += `## ${guide.subtitle}\n`;
        }
        
        markdown += `\n### Overview\n${guide.overview}\n`;
        
        if (guide.objectives.length > 0) {
            markdown += `\n### Learning Objectives\n`;
            guide.objectives.forEach(obj => {
                markdown += `- ${obj}\n`;
            });
        }

        if (guide.materials.length > 0) {
            markdown += `\n### Materials Needed\n`;
            guide.materials.forEach(material => {
                markdown += `- ${material}\n`;
            });
        }

        if (guide.setup.length > 0) {
            markdown += `\n### Classroom Setup\n`;
            guide.setup.forEach((setup, index) => {
                markdown += `${index + 1}. ${setup}\n`;
            });
        }

        if (guide.scenes.length > 0) {
            markdown += `\n### Lesson Plan\n`;
            guide.scenes.forEach(scene => {
                markdown += `\n#### ${scene.title}\n`;
                
                if (scene.script) {
                    markdown += `\n**Teacher Script:**\n> "${scene.script}"\n`;
                }

                if (scene.actions.length > 0) {
                    markdown += `\n**Actions:**\n`;
                    scene.actions.forEach((action, index) => {
                        markdown += `${index + 1}. ${action}\n`;
                    });
                }

                if (scene.activities.length > 0) {
                    markdown += `\n**Activity:**\n`;
                    scene.activities.forEach(activity => {
                        markdown += `- ${activity}\n`;
                    });
                }

                if (scene.questions.length > 0) {
                    markdown += `\n**Discussion Questions:**\n`;
                    scene.questions.forEach(question => {
                        markdown += `- ${question}\n`;
                    });
                }
            });
        }

        return markdown;
    }

    // Materials checklist functionality
    getAllMaterials() {
        const allMaterials = new Set();
        
        for (const [dayId, guide] of this.guides) {
            guide.materials.forEach(material => {
                allMaterials.add(material);
            });
        }

        return Array.from(allMaterials).sort();
    }

    getMaterialsByDay() {
        const materialsByDay = {};
        
        for (const [dayId, guide] of this.guides) {
            materialsByDay[dayId] = guide.materials;
        }

        return materialsByDay;
    }
}

// Export for use in the main teacher guide system
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TeacherGuideLoader;
} else {
    window.TeacherGuideLoader = TeacherGuideLoader;
}
