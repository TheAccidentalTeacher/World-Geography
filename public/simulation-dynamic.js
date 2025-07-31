/**
 * Dynamic content loader for Geographic Detective Academy simulation interface
 * Fetches and renders content for each navigation panel
 */

class SimulationInterface {
    constructor() {
        this.currentPanel = 'overview';
        this.apiBase = '/api/simulation';
        this.initializeNavigation();
    }

    initializeNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const targetPanel = item.getAttribute('data-panel');
                this.switchPanel(targetPanel);
            });
        });
    }

    async switchPanel(panelId) {
        // Update navigation state
        document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
        document.querySelector(`[data-panel="${panelId}"]`).classList.add('active');
        
        // Hide all panels
        document.querySelectorAll('.content-panel').forEach(panel => panel.classList.add('hidden'));
        
        // Show loading state
        this.showLoading();
        
        try {
            // Load content for the panel
            await this.loadPanelContent(panelId);
            
            // Show the target panel
            const targetElement = document.getElementById(panelId);
            if (targetElement) {
                targetElement.classList.remove('hidden');
            }
        } catch (error) {
            console.error(`Error loading panel ${panelId}:`, error);
            this.showError(panelId, error);
        }
    }

    showLoading() {
        const loader = document.getElementById('loading-indicator') || this.createLoader();
        loader.classList.remove('hidden');
    }

    hideLoading() {
        const loader = document.getElementById('loading-indicator');
        if (loader) loader.classList.add('hidden');
    }

    createLoader() {
        const loader = document.createElement('div');
        loader.id = 'loading-indicator';
        loader.className = 'content-panel';
        loader.innerHTML = `
            <div style="text-align: center; padding: 3rem;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">🔍</div>
                <h2>Loading Investigation Materials...</h2>
                <p>Accessing the Bureau database...</p>
            </div>
        `;
        document.querySelector('.main-content').appendChild(loader);
        return loader;
    }

    async loadPanelContent(panelId) {
        this.hideLoading();
        
        switch (panelId) {
            case 'daily-structure':
                await this.loadDailyStructure();
                break;
            case 'team-roles':
                await this.loadTeamRoles();
                break;
            case 'investigation-events':
                await this.loadInvestigationEvents();
                break;
            case 'assessments':
                await this.loadAssessments();
                break;
            case 'teacher-guide':
                await this.loadTeacherGuide();
                break;
            case 'student-materials':
                await this.loadStudentMaterials();
                break;
            case 'gamma-prompts':
                // Skip loading - embedded presentation system handles this panel
                console.log('📽️ Presentation panel handled by embedded system');
                break;
            case 'complete-package':
                await this.loadCompletePackage();
                break;
            // 'overview' is already loaded in HTML
        }
    }

    async loadDailyStructure() {
        const response = await fetch(`${this.apiBase}/daily-structure`);
        const data = await response.json();
        
        const panel = document.getElementById('daily-structure');
        panel.innerHTML = `
            <h2>📅 ${data.data.title}</h2>
            <p class="subtitle">${data.data.overview}</p>
            
            <div class="daily-format">
                <h3>🕐 Class Period Format (${data.data.classFormat.duration})</h3>
                <div class="timeline">
                    ${data.data.classFormat.structure.map(phase => `
                        <div class="timeline-item">
                            <div class="time-range">${phase.timeRange}</div>
                            <div class="phase-content">
                                <h4>${phase.phase}</h4>
                                <ul>
                                    ${phase.activities.map(activity => `<li>${activity}</li>`).join('')}
                                </ul>
                                <div class="geographic-focus">
                                    <strong>Geographic Focus:</strong> ${phase.geographicFocus}
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="weekly-progression">
                <h3>📊 12-Day Progression Overview</h3>
                <div class="weeks-grid">
                    ${data.data.weeklyProgression.map(week => `
                        <div class="week-card">
                            <h4>Week ${week.week}: ${week.focus}</h4>
                            <div class="days-list">
                                ${week.days.map(day => `
                                    <div class="day-item">
                                        <strong>Day ${day.day}:</strong> ${day.title}
                                        <br><em>${day.focus}</em>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    async loadTeamRoles() {
        const response = await fetch(`${this.apiBase}/team-roles`);
        const data = await response.json();
        
        const panel = document.getElementById('team-roles');
        panel.innerHTML = `
            <h2>👥 Detective Team Roles</h2>
            <p class="subtitle">Each student takes on a specialized role within their detective unit</p>
            
            <div class="roles-grid">
                ${data.data.map(role => `
                    <div class="role-card enhanced">
                        <div class="role-image-placeholder">
                            <strong>${role.icon} AI IMAGE: ${role.title}</strong><br>
                            <em>${role.imagePrompt}</em>
                        </div>
                        <div class="role-header">
                            <span class="role-icon">${role.icon}</span>
                            <h3>${role.title}</h3>
                        </div>
                        <div class="role-content">
                            <div class="mission-section">
                                <h4>🎯 Your Mission:</h4>
                                <p class="role-mission">${role.description}</p>
                            </div>
                            <div class="activities-section">
                                <h4>⚡ What You'll Do:</h4>
                                <p class="role-activities">${role.activities}</p>
                            </div>
                            <div class="skills-section">
                                <h4>🎓 Skills You'll Master:</h4>
                                <ul>
                                    ${role.skills.map(skill => `<li>${skill}</li>`).join('')}
                                </ul>
                            </div>
                            <div class="appeal-section">
                                <h4>✨ Why It's Awesome:</h4>
                                <p class="role-appeal">${role.appeal}</p>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <div class="team-formation-guide">
                <h3>🎯 Team Formation Strategy</h3>
                <div class="formation-tips">
                    <div class="tip-card">
                        <h4>Balanced Teams</h4>
                        <p>Each 4-person team should have one member in each role to ensure comprehensive investigation capabilities.</p>
                    </div>
                    <div class="tip-card">
                        <h4>Interest-Based Assignment</h4>
                        <p>Use student interest surveys to guide role assignments, ensuring engagement and natural skill development.</p>
                    </div>
                    <div class="tip-card">
                        <h4>Role Rotation Option</h4>
                        <p>Consider rotating roles mid-simulation to give students experience with different perspectives and skills.</p>
                    </div>
                </div>
            </div>
        `;
    }

    async loadInvestigationEvents() {
        const response = await fetch(`${this.apiBase}/investigation-events`);
        const data = await response.json();
        
        const panel = document.getElementById('investigation-events');
        panel.innerHTML = `
            <h2>⚠️ ${data.data.title}</h2>
            <p class="subtitle">${data.data.description}</p>
            
            <div class="cases-container">
                ${data.data.cases.map(caseItem => `
                    <div class="case-card ${caseItem.level.toLowerCase()}">
                        <div class="case-header">
                            <div class="case-title">
                                <h3>${caseItem.title}</h3>
                                <div class="case-badges">
                                    <span class="badge level-${caseItem.level.toLowerCase()}">${caseItem.level}</span>
                                    <span class="badge difficulty-${caseItem.difficulty.toLowerCase()}">${caseItem.difficulty}</span>
                                </div>
                            </div>
                            <div class="time-required">${caseItem.timeRequired}</div>
                        </div>
                        
                        <div class="case-content">
                            <div class="scenario-section">
                                <h4>📍 Investigation Scenario</h4>
                                <div class="scenario-details">
                                    <p><strong>Setting:</strong> ${caseItem.scenario.setting}</p>
                                    <p><strong>Mystery:</strong> ${caseItem.scenario.mystery}</p>
                                    <p><strong>Urgency:</strong> ${caseItem.scenario.urgency}</p>
                                </div>
                            </div>
                            
                            <div class="skills-section">
                                <h4>🧠 Geographic Skills</h4>
                                <div class="skills-list">
                                    ${caseItem.geographicSkills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                                </div>
                            </div>
                            
                            <div class="evidence-section">
                                <h4>🔍 Key Evidence</h4>
                                <div class="evidence-grid">
                                    ${caseItem.evidence.map(evidence => `
                                        <div class="evidence-item">
                                            <div class="evidence-description">${evidence.item}</div>
                                            <div class="evidence-significance">${evidence.significance}</div>
                                            <div class="geographic-clue"><strong>Geographic Clue:</strong> ${evidence.geographicClue}</div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                            
                            <div class="solution-preview">
                                <h4>🎯 Investigation Approach</h4>
                                <p><strong>Method:</strong> ${caseItem.solution.method}</p>
                                <p><strong>Geographic Concepts:</strong> ${caseItem.solution.geographicConcepts}</p>
                                <p><strong>Real-World Connection:</strong> ${caseItem.solution.realWorldConnection}</p>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    async loadStudentMaterials() {
        const response = await fetch(`${this.apiBase}/student-materials`);
        const data = await response.json();
        
        const panel = document.getElementById('student-materials');
        panel.innerHTML = `
            <h2>📋 ${data.data.title}</h2>
            <p class="subtitle">${data.data.description}</p>
            
            <div class="materials-section">
                <h3>📄 Student Handouts</h3>
                <div class="materials-grid">
                    ${data.data.handouts.map(handout => `
                        <div class="material-card">
                            <div class="material-header">
                                <h4>${handout.title}</h4>
                                <div class="material-meta">
                                    <span class="page-count">${handout.pageCount} pages</span>
                                    <span class="format">${handout.format}</span>
                                </div>
                            </div>
                            <p class="material-description">${handout.description}</p>
                            <div class="material-contents">
                                <h5>Contents:</h5>
                                <ul>
                                    ${handout.contents ? handout.contents.map(item => `<li>${item}</li>`).join('') : 
                                      handout.sections ? handout.sections.map(item => `<li>${item}</li>`).join('') :
                                      handout.worksheets ? handout.worksheets.map(item => `<li>${item}</li>`).join('') :
                                      handout.components ? handout.components.map(item => `<li>${item}</li>`).join('') : ''}
                                </ul>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="materials-section">
                <h3>💻 Digital Tools</h3>
                <div class="tools-grid">
                    ${data.data.digitalTools.map(tool => `
                        <div class="tool-card">
                            <h4>${tool.name}</h4>
                            <p class="tool-description">${tool.description}</p>
                            <div class="tool-features">
                                <h5>Features:</h5>
                                <ul>
                                    ${tool.features.map(feature => `<li>${feature}</li>`).join('')}
                                </ul>
                            </div>
                            <div class="access-level">
                                <strong>Access:</strong> ${tool.accessLevel}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    async loadAssessments() {
        const response = await fetch(`${this.apiBase}/assessments`);
        const data = await response.json();
        
        const panel = document.getElementById('assessments');
        panel.innerHTML = `
            <h2>📊 ${data.data.title}</h2>
            <p class="subtitle">${data.data.description}</p>
            
            <div class="assessment-section">
                <h3>📝 Formative Assessments</h3>
                <div class="assessment-grid">
                    ${data.data.formativeAssessments.map(assessment => `
                        <div class="assessment-card">
                            <h4>${assessment.type}</h4>
                            <div class="frequency">Frequency: ${assessment.frequency}</div>
                            <div class="components">
                                ${assessment.components.map(component => `
                                    <div class="component-item">
                                        <h5>${component.skill}</h5>
                                        <div class="rubric-levels">
                                            <div class="level developing">
                                                <strong>Developing:</strong> ${component.levels.developing}
                                            </div>
                                            <div class="level proficient">
                                                <strong>Proficient:</strong> ${component.levels.proficient}
                                            </div>
                                            <div class="level advanced">
                                                <strong>Advanced:</strong> ${component.levels.advanced}
                                            </div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="assessment-section">
                <h3>🎯 Summative Assessments</h3>
                <div class="summative-grid">
                    ${data.data.summativeAssessments.map(assessment => `
                        <div class="summative-card">
                            <h4>${assessment.type}</h4>
                            <p class="assessment-description">${assessment.description}</p>
                            <div class="assessment-components">
                                <h5>Assessment Components:</h5>
                                <ul>
                                    ${assessment.components.map(component => `<li>${component}</li>`).join('')}
                                </ul>
                            </div>
                            <div class="rubric-criteria">
                                <h5>Evaluation Criteria:</h5>
                                <div class="criteria-grid">
                                    ${Object.entries(assessment.rubric).map(([criterion, description]) => `
                                        <div class="criterion-item">
                                            <strong>${criterion.replace(/_/g, ' ').toUpperCase()}:</strong>
                                            <p>${description}</p>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    async loadTeacherGuide() {
        try {
            // Load structured teacher guide data from API
            const response = await fetch(`${this.apiBase}/teacher-guide`);
            const data = await response.json();
            
            const panel = document.getElementById('teacher-guide');
            panel.innerHTML = `
                <div class="teacher-guide-professional">
                    <style>
                        .teacher-guide-professional {
                            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                            background: #ffffff;
                            color: #2c3e50;
                            line-height: 1.7;
                            max-width: none;
                            margin: 0;
                        }
                        
                        .guide-header {
                            background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
                            color: white;
                            padding: 2rem;
                            border-radius: 12px;
                            margin-bottom: 2rem;
                            box-shadow: 0 8px 25px rgba(30, 60, 114, 0.2);
                        }
                        
                        .guide-header h1 {
                            margin: 0;
                            font-size: 2.5rem;
                            font-weight: 700;
                            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
                        }
                        
                        .guide-header .subtitle {
                            margin: 1rem 0 0 0;
                            font-size: 1.2rem;
                            opacity: 0.95;
                            font-weight: 300;
                        }
                        
                        .guide-overview {
                            display: grid;
                            grid-template-columns: 2fr 1fr;
                            gap: 2rem;
                            margin-bottom: 2rem;
                        }
                        
                        .overview-content {
                            background: #f8f9fa;
                            padding: 2rem;
                            border-radius: 12px;
                            border-left: 6px solid #ffd700;
                        }
                        
                        .quick-stats {
                            display: grid;
                            gap: 1rem;
                        }
                        
                        .stat-card {
                            background: white;
                            padding: 1.5rem;
                            border-radius: 8px;
                            text-align: center;
                            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                            border-top: 4px solid #1e3c72;
                        }
                        
                        .stat-number {
                            font-size: 2rem;
                            font-weight: 700;
                            color: #1e3c72;
                            display: block;
                        }
                        
                        .stat-label {
                            font-size: 0.9rem;
                            color: #6c757d;
                            text-transform: uppercase;
                            font-weight: 600;
                            letter-spacing: 0.5px;
                        }
                        
                        .guide-section {
                            background: white;
                            border-radius: 12px;
                            padding: 2rem;
                            margin-bottom: 2rem;
                            box-shadow: 0 4px 16px rgba(0,0,0,0.08);
                            border: 1px solid #e9ecef;
                        }
                        
                        .section-header {
                            display: flex;
                            align-items: center;
                            margin-bottom: 1.5rem;
                            padding-bottom: 1rem;
                            border-bottom: 2px solid #e9ecef;
                        }
                        
                        .section-icon {
                            font-size: 2rem;
                            margin-right: 1rem;
                        }
                        
                        .section-title {
                            font-size: 1.8rem;
                            font-weight: 600;
                            color: #1e3c72;
                            margin: 0;
                        }
                        
                        .prep-grid {
                            display: grid;
                            grid-template-columns: 1fr 1fr;
                            gap: 2rem;
                        }
                        
                        .prep-card {
                            background: #f8f9fa;
                            padding: 2rem;
                            border-radius: 8px;
                            border-left: 5px solid #28a745;
                        }
                        
                        .prep-card h4 {
                            color: #1e3c72;
                            margin: 0 0 1rem 0;
                            font-size: 1.3rem;
                            font-weight: 600;
                        }
                        
                        .checklist {
                            list-style: none;
                            padding: 0;
                            margin: 0;
                        }
                        
                        .checklist li {
                            display: flex;
                            align-items: center;
                            margin: 0.75rem 0;
                            padding: 0.5rem;
                            background: white;
                            border-radius: 6px;
                            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                        }
                        
                        .checklist input[type="checkbox"] {
                            width: 18px;
                            height: 18px;
                            margin-right: 0.75rem;
                            accent-color: #1e3c72;
                        }
                        
                        .facilitation-cards {
                            display: grid;
                            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                            gap: 1.5rem;
                        }
                        
                        .facilitation-card {
                            background: linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%);
                            padding: 2rem;
                            border-radius: 12px;
                            border: 1px solid #e9ecef;
                            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                            transition: transform 0.2s ease, box-shadow 0.2s ease;
                        }
                        
                        .facilitation-card:hover {
                            transform: translateY(-4px);
                            box-shadow: 0 8px 25px rgba(0,0,0,0.15);
                        }
                        
                        .card-icon {
                            font-size: 3rem;
                            margin-bottom: 1rem;
                            display: block;
                        }
                        
                        .card-title {
                            font-size: 1.4rem;
                            font-weight: 600;
                            color: #1e3c72;
                            margin: 0 0 1rem 0;
                        }
                        
                        .timing-grid {
                            display: grid;
                            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                            gap: 1rem;
                        }
                        
                        .timing-block {
                            background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
                            color: white;
                            padding: 1.5rem;
                            border-radius: 8px;
                            text-align: center;
                        }
                        
                        .timing-duration {
                            font-size: 2rem;
                            font-weight: 700;
                            display: block;
                            margin-bottom: 0.5rem;
                        }
                        
                        .timing-activity {
                            font-size: 1.1rem;
                            opacity: 0.9;
                        }
                        
                        .assessment-rubric {
                            background: #f8f9fa;
                            border-radius: 8px;
                            overflow: hidden;
                            margin: 1rem 0;
                        }
                        
                        .rubric-header {
                            background: #1e3c72;
                            color: white;
                            padding: 1rem;
                            font-weight: 600;
                            text-align: center;
                        }
                        
                        .rubric-grid {
                            display: grid;
                            grid-template-columns: 1fr 1fr 1fr 1fr;
                            gap: 0;
                        }
                        
                        .rubric-cell {
                            padding: 1rem;
                            border-right: 1px solid #dee2e6;
                            border-bottom: 1px solid #dee2e6;
                            min-height: 120px;
                        }
                        
                        .rubric-level {
                            font-weight: 600;
                            color: #1e3c72;
                            margin-bottom: 0.5rem;
                        }
                        
                        .tips-container {
                            background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
                            border-radius: 12px;
                            padding: 2rem;
                            border-left: 6px solid #2196f3;
                        }
                        
                        .tip-item {
                            background: white;
                            margin: 1rem 0;
                            padding: 1.5rem;
                            border-radius: 8px;
                            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                            border-left: 4px solid #ffd700;
                        }
                        
                        .tip-title {
                            font-weight: 600;
                            color: #1e3c72;
                            margin-bottom: 0.5rem;
                            font-size: 1.1rem;
                        }
                        
                        @media (max-width: 768px) {
                            .guide-overview {
                                grid-template-columns: 1fr;
                            }
                            
                            .prep-grid {
                                grid-template-columns: 1fr;
                            }
                            
                            .rubric-grid {
                                grid-template-columns: 1fr 1fr;
                            }
                        }
                    </style>
                    
                    <!-- Header Section -->
                    <div class="guide-header">
                        <h1>🎓 ${data.data.title}</h1>
                        <p class="subtitle">${data.data.description}</p>
                    </div>
                    
                    <!-- Overview Section -->
                    <div class="guide-overview">
                        <div class="overview-content">
                            <h3 style="color: #1e3c72; margin-top: 0;">📋 Simulation Overview</h3>
                            <p>The Geographic Detective Academy transforms traditional geography lessons into an immersive, role-based investigation experience. Students become geographic crime specialists, solving mysteries that require deep understanding of physical, cultural, and economic geography.</p>
                            
                            <p><strong>Learning Approach:</strong> Problem-based learning through geographic mysteries</p>
                            <p><strong>Student Engagement:</strong> Role-playing as professional geographic detectives</p>
                            <p><strong>Assessment Method:</strong> Performance-based evaluation through case solutions</p>
                        </div>
                        
                        <div class="quick-stats">
                            <div class="stat-card">
                                <span class="stat-number">5</span>
                                <span class="stat-label">Days</span>
                            </div>
                            <div class="stat-card">
                                <span class="stat-number">45</span>
                                <span class="stat-label">Min/Day</span>
                            </div>
                            <div class="stat-card">
                                <span class="stat-number">6</span>
                                <span class="stat-label">Team Roles</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Preparation Section -->
                    <div class="guide-section">
                        <div class="section-header">
                            <span class="section-icon">🚀</span>
                            <h2 class="section-title">Implementation Preparation</h2>
                        </div>
                        
                        <div class="prep-grid">
                            <div class="prep-card">
                                <h4>📋 Before Implementation</h4>
                                <ul class="checklist">
                                    ${data.data.preparation.beforeImplementation.map(item => `
                                        <li><input type="checkbox"> ${item}</li>
                                    `).join('')}
                                </ul>
                            </div>
                            
                            <div class="prep-card">
                                <h4>🏫 Classroom Setup</h4>
                                <ul class="checklist">
                                    ${data.data.preparation.classroomSetup.map(item => `
                                        <li><input type="checkbox"> ${item}</li>
                                    `).join('')}
                                </ul>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Facilitation Strategies -->
                    <div class="guide-section">
                        <div class="section-header">
                            <span class="section-icon">🎭</span>
                            <h2 class="section-title">Facilitation Strategies</h2>
                        </div>
                        
                        <div class="facilitation-cards">
                            ${Object.entries(data.data.facilitation).map(([key, strategy]) => `
                                <div class="facilitation-card">
                                    <span class="card-icon">${strategy.icon}</span>
                                    <h4 class="card-title">${strategy.title}</h4>
                                    <p>${strategy.description}</p>
                                    <ul style="margin-top: 1rem;">
                                        ${strategy.techniques.map(technique => `<li>${technique}</li>`).join('')}
                                    </ul>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <!-- Daily Timing Guide -->
                    <div class="guide-section">
                        <div class="section-header">
                            <span class="section-icon">⏰</span>
                            <h2 class="section-title">Daily Timing Guide</h2>
                        </div>
                        
                        <div class="timing-grid">
                            ${data.data.timing.dailyBreakdown.map(activity => `
                                <div class="timing-block">
                                    <span class="timing-duration">${activity.duration}</span>
                                    <span class="timing-activity">${activity.activity}</span>
                                </div>
                            `).join('')}
                        </div>
                        
                        <div style="margin-top: 2rem; padding: 1.5rem; background: #fff3cd; border-radius: 8px; border-left: 4px solid #ffc107;">
                            <h4 style="color: #856404; margin: 0 0 1rem 0;">⚡ Pacing Tips</h4>
                            <ul style="margin: 0; color: #856404;">
                                ${data.data.timing.pacingTips.map(tip => `<li>${tip}</li>`).join('')}
                            </ul>
                        </div>
                    </div>
                    
                    <!-- Assessment Rubric -->
                    <div class="guide-section">
                        <div class="section-header">
                            <span class="section-icon">📊</span>
                            <h2 class="section-title">Assessment Framework</h2>
                        </div>
                        
                        <div class="assessment-rubric">
                            <div class="rubric-header">Geographic Detective Skills Assessment</div>
                            <div class="rubric-grid">
                                ${Object.entries(data.data.assessment.rubric).map(([level, criteria]) => `
                                    <div class="rubric-cell">
                                        <div class="rubric-level">${level}</div>
                                        <ul style="margin: 0; padding-left: 1rem; font-size: 0.9rem;">
                                            ${criteria.map(criterion => `<li>${criterion}</li>`).join('')}
                                        </ul>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                    
                    <!-- Professional Teaching Tips -->
                    <div class="guide-section">
                        <div class="section-header">
                            <span class="section-icon">💡</span>
                            <h2 class="section-title">Professional Teaching Tips</h2>
                        </div>
                        
                        <div class="tips-container">
                            ${data.data.tips.map(tip => `
                                <div class="tip-item">
                                    <div class="tip-title">${tip.title}</div>
                                    <p style="margin: 0;">${tip.description}</p>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('❌ Error loading teacher guide:', error);
            document.getElementById('teacher-guide').innerHTML = `
                <div style="text-align: center; padding: 2rem; color: #dc3545;">
                    <h3>📋 Teacher Guide Temporarily Unavailable</h3>
                    <p>We're working to restore the teacher guide. Please try again in a moment.</p>
                </div>
            `;
                        ${data.data.facilitation.map(phase => `
                            <div class="facilitation-card">
                                <h4>${phase.phase}</h4>
                                <ul>
                                    ${phase.techniques.map(technique => `<li>${technique}</li>`).join('')}
                                </ul>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="guide-section">
                    <h3>🔧 Extension Opportunities</h3>
                    <div class="extensions-grid">
                        ${data.data.extensions.map(extension => `
                            <div class="extension-card">
                                <p>${extension}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
    }

    async loadGammaPrompts() {
        const panel = document.getElementById('gamma-prompts');
        panel.innerHTML = `
            <h2>🎮 Interactive Presentation & Engagement</h2>
            <p class="subtitle">Full 60-slide presentation system with interactive elements and engagement techniques</p>
            
            <div class="presentation-section">
                <h3>📊 Complete Presentation System</h3>
                <div class="presentation-info">
                    <div class="info-card">
                        <h4>🎯 Ready for Upload</h4>
                        <p>Upload your 60 PNG slides to activate the full presentation system with navigation, notes, and interactive features.</p>
                        <div class="upload-status">
                            <strong>Upload Location:</strong> <code>local-simulations/oregon-trail/presentation/</code>
                        </div>
                    </div>
                    
                    <div class="info-card">
                        <h4>🛠️ Features Available</h4>
                        <ul>
                            <li>Full slide navigation with thumbnails</li>
                            <li>Keyboard controls and auto-play</li>
                            <li>Fullscreen presentation mode</li>
                            <li>Contextual teaching notes for each slide</li>
                            <li>Progress tracking and timing</li>
                            <li>Download individual slides</li>
                        </ul>
                    </div>
                </div>
                
                <div class="presentation-demo">
                    <h4>🎬 Presentation Preview</h4>
                    <div class="demo-container">
                        <div class="demo-slide">
                            <div class="demo-header">
                                <h3>🕵️ Geographic Detective Academy</h3>
                                <div class="slide-counter">Slide 1 of 60</div>
                            </div>
                            <div class="demo-content">
                                <div class="demo-image-placeholder">
                                    <span class="demo-icon">🗺️</span>
                                    <p>Your presentation slides will appear here</p>
                                </div>
                                <div class="demo-controls">
                                    <button class="demo-btn">◀️ Previous</button>
                                    <button class="demo-btn">⛶ Fullscreen</button>
                                    <button class="demo-btn">▶️ Next</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="prompts-section">
                <h3>💬 Interactive Engagement Techniques</h3>
                <div class="technique-grid">
                    <div class="technique-card">
                        <h4>🚨 Urgent Communications</h4>
                        <p>Use "emergency" Bureau communications to maintain engagement and urgency throughout investigations.</p>
                        <div class="example">
                            <strong>Example:</strong> "PRIORITY ALERT: New evidence has been discovered at the crime scene. All detective units report immediately for briefing."
                        </div>
                    </div>
                    
                    <div class="technique-card">
                        <h4>🎭 Role-Playing Elements</h4>
                        <p>Encourage students to fully embody their detective roles with specialized vocabulary and professional presentation.</p>
                        <div class="example">
                            <strong>Example:</strong> Students address each other by role titles and present findings as formal case reports.
                        </div>
                    </div>
                    
                    <div class="technique-card">
                        <h4>🏆 Badge Progression System</h4>
                        <p>Visual progression tracking to maintain motivation and recognize skill development milestones.</p>
                        <div class="example">
                            <strong>Example:</strong> Display badge charts showing each student's progression from Rookie to Specialist level.
                        </div>
                    </div>
                    
                    <div class="technique-card">
                        <h4>📱 Technology Integration</h4>
                        <p>Use digital tools to simulate real detective work and enhance authentic investigation experience.</p>
                        <div class="example">
                            <strong>Example:</strong> QR codes for "evidence scanning" or online databases for "background research."
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="prompts-section">
                <h3>🎯 Interactive Prompts Library</h3>
                <div class="prompts-grid">
                    <div class="prompt-card">
                        <div class="prompt-type">Daily Opener</div>
                        <div class="prompt-text">"Detective units, new intelligence has arrived overnight. Check your case files for updated evidence and prepare for immediate deployment."</div>
                    </div>
                    
                    <div class="prompt-card">
                        <div class="prompt-type">Evidence Analysis</div>
                        <div class="prompt-text">"This coordinate appears to be encoded. Use your geographic knowledge to decode the location and identify the significance."</div>
                    </div>
                    
                    <div class="prompt-card">
                        <div class="prompt-type">Team Challenge</div>
                        <div class="prompt-text">"Multiple units are investigating the same case. Share your findings and coordinate your investigation strategy."</div>
                    </div>
                    
                    <div class="prompt-card">
                        <div class="prompt-type">Reflection Prompt</div>
                        <div class="prompt-text">"Document in your detective journal: What geographic skills were essential for solving today's case?"</div>
                    </div>
                    
                    <div class="prompt-card">
                        <div class="prompt-type">Investigation Briefing</div>
                        <div class="prompt-text">"Bureau Alert: We've received reports of suspicious geographic activity. Your team has been assigned to investigate. What's your first move?"</div>
                    </div>
                    
                    <div class="prompt-card">
                        <div class="prompt-type">Critical Thinking</div>
                        <div class="prompt-text">"The evidence points to three possible locations. Use your geographic analysis skills to determine which is most likely and justify your reasoning."</div>
                    </div>
                </div>
            </div>
        `;
    }

    async loadCompletePackage() {
        const panel = document.getElementById('complete-package');
        panel.innerHTML = `
            <h2>📦 Complete Simulation Package</h2>
            <p class="subtitle">Everything needed to implement the Geographic Detective Academy simulation</p>
            
            <div class="package-overview">
                <div class="package-stats">
                    <div class="stat-item">
                        <div class="stat-number">12</div>
                        <div class="stat-label">Days of Content</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-number">25+</div>
                        <div class="stat-label">Student Materials</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-number">3</div>
                        <div class="stat-label">Progressive Cases</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-number">4</div>
                        <div class="stat-label">Team Roles</div>
                    </div>
                </div>
            </div>
            
            <div class="package-components">
                <h3>📋 Package Components</h3>
                <div class="components-grid">
                    <div class="component-section">
                        <h4>📚 Curriculum Materials</h4>
                        <ul>
                            <li>Complete 12-day lesson plan sequence</li>
                            <li>Daily objective and activity guides</li>
                            <li>Geographic skill progression framework</li>
                            <li>Standards alignment documentation</li>
                        </ul>
                    </div>
                    
                    <div class="component-section">
                        <h4>👥 Student Resources</h4>
                        <ul>
                            <li>Detective handbook and reference guides</li>
                            <li>Evidence collection and analysis worksheets</li>
                            <li>Case report templates and rubrics</li>
                            <li>Team role responsibility guides</li>
                        </ul>
                    </div>
                    
                    <div class="component-section">
                        <h4>📖 Teacher Support</h4>
                        <ul>
                            <li>Implementation guide and timeline</li>
                            <li>Facilitation strategies and tips</li>
                            <li>Assessment rubrics and tools</li>
                            <li>Extension activities and modifications</li>
                        </ul>
                    </div>
                    
                    <div class="component-section">
                        <h4>💻 Digital Assets</h4>
                        <ul>
                            <li>Interactive mapping tools and databases</li>
                            <li>Digital evidence files and resources</li>
                            <li>Online collaboration platforms</li>
                            <li>Progress tracking and badge systems</li>
                        </ul>
                    </div>
                </div>
            </div>
            
            <div class="implementation-guide">
                <h3>🚀 Quick Start Implementation</h3>
                <div class="steps-timeline">
                    <div class="step-item">
                        <div class="step-number">1</div>
                        <div class="step-content">
                            <h4>Week Before: Preparation</h4>
                            <p>Review materials, set up classroom, prepare evidence packets</p>
                        </div>
                    </div>
                    <div class="step-item">
                        <div class="step-number">2</div>
                        <div class="step-content">
                            <h4>Day 0: Launch</h4>
                            <p>Academy orientation, team formation, role assignments</p>
                        </div>
                    </div>
                    <div class="step-item">
                        <div class="step-number">3</div>
                        <div class="step-content">
                            <h4>Days 1-10: Investigation</h4>
                            <p>Daily cases with progressive skill building and assessment</p>
                        </div>
                    </div>
                    <div class="step-item">
                        <div class="step-number">4</div>
                        <div class="step-content">
                            <h4>Day 11: Graduation</h4>
                            <p>Final case presentation and academy graduation ceremony</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    showError(panelId, error) {
        const panel = document.getElementById(panelId);
        panel.innerHTML = `
            <div class="error-message">
                <h2>⚠️ Investigation Error</h2>
                <p>Unable to access Bureau database for ${panelId}.</p>
                <p>Error: ${error.message}</p>
                <button onclick="location.reload()">Retry Connection</button>
            </div>
        `;
    }
}

// Initialize the simulation interface when the page loads
document.addEventListener('DOMContentLoaded', function() {
    new SimulationInterface();
});

// Add enhanced styling for the dynamic content
const dynamicStyles = `
<style>
    .subtitle {
        color: #666;
        font-size: 1.1rem;
        margin-bottom: 2rem;
        font-style: italic;
    }
    
    .timeline {
        border-left: 3px solid #ffd700;
        padding-left: 2rem;
        margin: 2rem 0;
    }
    
    .timeline-item {
        margin-bottom: 2rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid #eee;
    }
    
    .time-range {
        background: #ffd700;
        color: #333;
        padding: 0.3rem 0.8rem;
        border-radius: 15px;
        display: inline-block;
        font-weight: bold;
        font-size: 0.9rem;
        margin-bottom: 0.5rem;
    }
    
    .geographic-focus {
        background: #f8f9fa;
        padding: 0.8rem;
        border-radius: 5px;
        margin-top: 1rem;
        border-left: 3px solid #28a745;
        color: #155724;
    }
    
    .weeks-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 1.5rem;
        margin-top: 2rem;
    }
    
    .week-card {
        background: linear-gradient(145deg, #f8f9fa, #e9ecef);
        padding: 1.5rem;
        border-radius: 10px;
        border: 1px solid #dee2e6;
    }
    
    .day-item {
        background: white;
        padding: 0.8rem;
        margin: 0.5rem 0;
        border-radius: 5px;
        border-left: 3px solid #007bff;
    }
    
    .roles-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
        gap: 2rem;
        margin: 2rem 0;
    }
    
    .role-card {
        background: linear-gradient(145deg, #ffffff, #f8f9fa);
        border-radius: 15px;
        padding: 2rem;
        box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        border: 1px solid #dee2e6;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    
    .role-card.enhanced {
        border: 2px solid #007bff;
    }
    
    .role-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 25px rgba(0,123,255,0.2);
    }
    
    .role-image-placeholder {
        background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
        border: 2px dashed #2196f3;
        border-radius: 8px;
        padding: 1rem;
        margin-bottom: 1.5rem;
        text-align: center;
        color: #1565c0;
        font-size: 0.85rem;
        line-height: 1.4;
        min-height: 100px;
        display: flex;
        flex-direction: column;
        justify-content: center;
    }
    
    .role-header {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 1rem;
    }
    
    .role-icon {
        font-size: 2.5rem;
        background: #ffd700;
        width: 60px;
        height: 60px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .mission-section, .activities-section, .skills-section, .appeal-section {
        margin-bottom: 1.5rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid #e9ecef;
    }
    
    .appeal-section {
        border-bottom: none;
        background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
        padding: 1rem;
        border-radius: 8px;
        margin-top: 1rem;
    }
    
    .mission-section h4, .activities-section h4, .skills-section h4, .appeal-section h4 {
        color: #1e3c72;
        margin-bottom: 0.5rem;
        font-size: 1rem;
        font-weight: 600;
    }
    
    .role-mission, .role-activities, .role-appeal {
        margin: 0;
        line-height: 1.6;
        color: #2d3748;
    }
    
    .role-appeal {
        font-weight: 600;
        color: #1a202c;
    }
    
    .cases-container {
        display: flex;
        flex-direction: column;
        gap: 2rem;
    }
    
    .case-card {
        background: white;
        border-radius: 15px;
        padding: 2rem;
        box-shadow: 0 6px 20px rgba(0,0,0,0.1);
        border-left: 5px solid #007bff;
    }
    
    .case-card.rookie {
        border-left-color: #28a745;
    }
    
    .case-card.detective {
        border-left-color: #ffc107;
    }
    
    .case-card.specialist {
        border-left-color: #dc3545;
    }
    
    .case-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 1.5rem;
    }
    
    .case-badges {
        display: flex;
        gap: 0.5rem;
        margin-top: 0.5rem;
    }
    
    .badge {
        padding: 0.3rem 0.8rem;
        border-radius: 12px;
        font-size: 0.8rem;
        font-weight: bold;
        text-transform: uppercase;
    }
    
    .level-rookie {
        background: #d4edda;
        color: #155724;
    }
    
    .level-detective {
        background: #fff3cd;
        color: #856404;
    }
    
    .level-specialist {
        background: #f8d7da;
        color: #721c24;
    }
    
    .skills-list {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-top: 0.5rem;
    }
    
    .skill-tag {
        background: #e9ecef;
        color: #495057;
        padding: 0.4rem 0.8rem;
        border-radius: 15px;
        font-size: 0.9rem;
    }
    
    .evidence-grid {
        display: grid;
        gap: 1rem;
        margin-top: 1rem;
    }
    
    .evidence-item {
        background: #f8f9fa;
        padding: 1rem;
        border-radius: 8px;
        border-left: 3px solid #007bff;
    }
    
    .materials-grid, .tools-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
        gap: 1.5rem;
        margin: 1.5rem 0;
    }
    
    .material-card, .tool-card {
        background: white;
        padding: 1.5rem;
        border-radius: 10px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        border: 1px solid #dee2e6;
    }
    
    .error-message {
        text-align: center;
        padding: 3rem;
        color: #721c24;
        background: #f8d7da;
        border-radius: 10px;
        border: 1px solid #f5c6cb;
    }
    
    .loading-indicator {
        animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
        0% { opacity: 1; }
        50% { opacity: 0.5; }
        100% { opacity: 1; }
    }
    
    .checklist {
        list-style: none;
        padding-left: 0;
    }
    
    .checklist li {
        margin: 0.5rem 0;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .package-stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 2rem;
        margin: 2rem 0;
        text-align: center;
    }
    
    .stat-item {
        background: linear-gradient(145deg, #007bff, #0056b3);
        color: white;
        padding: 2rem;
        border-radius: 15px;
    }
    
    .stat-number {
        font-size: 3rem;
        font-weight: bold;
        margin-bottom: 0.5rem;
    }
    
    .steps-timeline {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 2rem;
        margin: 2rem 0;
    }
    
    .step-item {
        display: flex;
        align-items: flex-start;
        gap: 1rem;
    }
    
    .step-number {
        background: #007bff;
        color: white;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        flex-shrink: 0;
    }
    
    .presentation-section {
        background: linear-gradient(145deg, #f8f9fa, #e9ecef);
        border-radius: 15px;
        padding: 2rem;
        margin: 2rem 0;
        border: 1px solid #dee2e6;
    }
    
    .presentation-info {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 1.5rem;
        margin: 1.5rem 0;
    }
    
    .info-card {
        background: white;
        padding: 1.5rem;
        border-radius: 10px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        border-left: 4px solid #007bff;
    }
    
    .upload-status {
        background: #e8f4f8;
        padding: 0.8rem;
        border-radius: 5px;
        margin-top: 1rem;
        font-family: monospace;
        font-size: 0.9rem;
        border: 1px solid #b8daff;
    }
    
    .presentation-demo {
        margin-top: 2rem;
    }
    
    .demo-container {
        background: #2c3e50;
        border-radius: 10px;
        padding: 1rem;
        margin-top: 1rem;
    }
    
    .demo-slide {
        background: #34495e;
        border-radius: 8px;
        overflow: hidden;
    }
    
    .demo-header {
        background: linear-gradient(135deg, #3498db, #2980b9);
        color: white;
        padding: 1rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .demo-content {
        padding: 2rem;
        text-align: center;
    }
    
    .demo-image-placeholder {
        background: #4a6741;
        border-radius: 8px;
        padding: 3rem;
        margin-bottom: 1rem;
        border: 2px dashed #7f8c8d;
        color: #bdc3c7;
    }
    
    .demo-icon {
        font-size: 4rem;
        display: block;
        margin-bottom: 1rem;
    }
    
    .demo-controls {
        display: flex;
        justify-content: center;
        gap: 1rem;
    }
    
    .demo-btn {
        background: #3498db;
        color: white;
        border: none;
        padding: 0.8rem 1.5rem;
        border-radius: 20px;
        cursor: pointer;
        transition: all 0.3s ease;
        font-weight: bold;
    }
    
    .demo-btn:hover {
        background: #2980b9;
        transform: translateY(-2px);
    }
</style>
`;

// Inject the styles
document.head.insertAdjacentHTML('beforeend', dynamicStyles);
