/**
 * Dynamic content loader for Geographic Detective Academy simulation interface
 * Fetches and renders content for each navigation panel
 */

console.log('🚀 simulation-dynamic.js loaded at:', new Date().toISOString());

class SimulationInterface {
    constructor() {
        console.log('🏗️ SimulationInterface constructor called');
        
        // Prevent duplicate initialization
        if (window.simulationInterfaceInitialized) {
            console.warn('⚠️ SimulationInterface already initialized, skipping...');
            return;
        }
        
        this.currentPanel = 'overview';
        this.apiBase = '/api/simulation';
        console.log('📡 API Base set to:', this.apiBase);
        this.initializeNavigation();
        
        // Mark as initialized
        window.simulationInterfaceInitialized = true;
        console.log('✅ SimulationInterface constructor complete');
    }

    initializeNavigation() {
        console.log('🔗 Starting navigation initialization...');
        const navItems = document.querySelectorAll('.nav-item');
        console.log('📋 Found nav items:', navItems.length);
        
        navItems.forEach((item, index) => {
            const targetPanel = item.getAttribute('data-panel');
            console.log(`🎯 Nav item ${index}: ${targetPanel}`);
            
            // Remove any existing event listeners to prevent duplicates
            const newItem = item.cloneNode(true);
            item.parentNode.replaceChild(newItem, item);
            
            newItem.addEventListener('click', (e) => {
                console.log(`🖱️ Clicked nav item: ${targetPanel}`);
                this.switchPanel(targetPanel);
            });
        });

        // Initialize the CLASSIFIED and ACTIVE CASE buttons
        console.log('🚨 Initializing status buttons...');
        this.initializeStatusButtons();
        console.log('✅ Navigation initialization complete');
    }

    initializeStatusButtons() {
        console.log('🔧 Initializing status buttons...');
        const classifiedBtn = document.querySelector('.badge.classified');
        const activeCaseBtn = document.querySelector('.badge.active-case');
        
        console.log('🔍 Found classified button:', classifiedBtn);
        console.log('🔍 Found active case button:', activeCaseBtn);
        
        if (classifiedBtn) {
            classifiedBtn.style.cursor = 'pointer';
            classifiedBtn.addEventListener('click', () => {
                console.log('🔒 CLASSIFIED button clicked!');
                this.toggleClassifiedMode();
            });
            console.log('✅ CLASSIFIED button initialized');
        } else {
            console.warn('⚠️ CLASSIFIED button not found');
        }
        
        if (activeCaseBtn) {
            activeCaseBtn.style.cursor = 'pointer';
            activeCaseBtn.addEventListener('click', () => {
                console.log('🚨 ACTIVE CASE button clicked!');
                this.toggleActiveCaseStatus();
            });
            console.log('✅ ACTIVE CASE button initialized');
        } else {
            console.warn('⚠️ ACTIVE CASE button not found');
        }
    }

    toggleClassifiedMode() {
        const isClassified = document.body.classList.toggle('classified-mode');
        
        if (isClassified) {
            this.showClassifiedAlert();
            // Add special styling for classified mode
            document.body.style.filter = 'sepia(0.2) contrast(1.1)';
            localStorage.setItem('classifiedMode', 'true');
        } else {
            document.body.style.filter = '';
            localStorage.removeItem('classifiedMode');
            this.hideSpecialElements('.classified-content');
        }
    }

    toggleActiveCaseStatus() {
        const caseStatuses = ['ACTIVE CASE', 'CASE CLOSED', 'UNDER INVESTIGATION', 'CODE RED', 'PRIORITY ALERT'];
        const activeCaseBtn = document.querySelector('.badge.active-case');
        
        let currentIndex = caseStatuses.indexOf(activeCaseBtn.textContent);
        currentIndex = (currentIndex + 1) % caseStatuses.length;
        
        const newStatus = caseStatuses[currentIndex];
        activeCaseBtn.textContent = newStatus;
        
        // Update styling based on status
        activeCaseBtn.className = `badge active-case ${newStatus.toLowerCase().replace(/\s+/g, '-')}`;
        
        this.showCaseStatusAlert(newStatus);
        localStorage.setItem('currentCaseStatus', newStatus);
    }

    showClassifiedAlert() {
        const alert = document.createElement('div');
        alert.className = 'classified-alert';
        alert.innerHTML = `
            <div class="alert-content">
                <div class="alert-icon">🔒</div>
                <div class="alert-text">
                    <h3>CLASSIFIED MODE ACTIVATED</h3>
                    <p>🕵️ Detective-level access granted. Sensitive investigation materials now visible.</p>
                    <p><strong>Teacher Note:</strong> This mode reveals additional implementation details and advanced case materials.</p>
                </div>
                <button class="alert-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        document.body.appendChild(alert);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (alert.parentElement) {
                alert.remove();
            }
        }, 5000);
        
        // Show classified content
        this.revealClassifiedContent();
    }

    showCaseStatusAlert(status) {
        const statusMessages = {
            'ACTIVE CASE': '🔍 Investigation in progress. All units stand by.',
            'CASE CLOSED': '✅ Mission accomplished. Case successfully resolved.',
            'UNDER INVESTIGATION': '🕵️ Deep investigation mode. Gathering evidence.',
            'CODE RED': '🚨 URGENT: High priority case. Immediate action required.',
            'PRIORITY ALERT': '⚠️ Priority status activated. All resources deployed.'
        };
        
        const alert = document.createElement('div');
        alert.className = 'case-status-alert';
        alert.innerHTML = `
            <div class="alert-content status-${status.toLowerCase().replace(/\s+/g, '-')}">
                <div class="alert-text">
                    <h3>CASE STATUS UPDATE</h3>
                    <p>${statusMessages[status]}</p>
                </div>
                <button class="alert-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        document.body.appendChild(alert);
        
        // Auto-remove after 4 seconds
        setTimeout(() => {
            if (alert.parentElement) {
                alert.remove();
            }
        }, 4000);
    }

    revealClassifiedContent() {
        // Add classified badges to sensitive content
        const teacherSections = document.querySelectorAll('.learning-objective, .assessment-note, .implementation-checklist');
        teacherSections.forEach(section => {
            if (!section.querySelector('.classified-badge')) {
                const badge = document.createElement('span');
                badge.className = 'classified-badge';
                badge.innerHTML = '🔒 CLASSIFIED';
                badge.style.cssText = `
                    background: #dc3545;
                    color: white;
                    padding: 0.2rem 0.5rem;
                    border-radius: 3px;
                    font-size: 0.7rem;
                    font-weight: bold;
                    margin-left: 0.5rem;
                    animation: pulse 2s infinite;
                `;
                section.appendChild(badge);
            }
        });
        
        // Show additional teacher tips
        this.addClassifiedTeacherTips();
    }

    addClassifiedTeacherTips() {
        const classifiedTips = `
            <div class="classified-content" style="background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%); color: white; padding: 1.5rem; border-radius: 10px; margin: 2rem 0; border-left: 5px solid #e74c3c;">
                <h4 style="color: #e74c3c; margin: 0 0 1rem 0;">🔒 CLASSIFIED TEACHER INTELLIGENCE</h4>
                <div style="display: grid; gap: 1rem;">
                    <div class="tip-item">
                        <strong>🎯 Advanced Engagement:</strong> Use the status buttons during class to create authentic "mission updates" and maintain student immersion.
                    </div>
                    <div class="tip-item">
                        <strong>🕵️ Role-Play Enhancement:</strong> Toggle case status when students complete major milestones to simulate real detective work progression.
                    </div>
                    <div class="tip-item">
                        <strong>📊 Assessment Strategy:</strong> Classified mode reveals detailed rubrics and advanced assessment techniques for deeper evaluation.
                    </div>
                    <div class="tip-item">
                        <strong>⚡ Emergency Protocols:</strong> Use "CODE RED" status for time-sensitive activities or when you need immediate student attention.
                    </div>
                </div>
            </div>
        `;
        
        const teacherGuide = document.getElementById('teacher-guide');
        if (teacherGuide && !teacherGuide.querySelector('.classified-content')) {
            const guideContent = teacherGuide.querySelector('.guide-content');
            if (guideContent) {
                guideContent.insertAdjacentHTML('afterbegin', classifiedTips);
            }
        }
    }

    hideSpecialElements(selector) {
        document.querySelectorAll(selector).forEach(el => el.remove());
        document.querySelectorAll('.classified-badge').forEach(badge => badge.remove());
    }

    // Add alias method for HTML compatibility
    async loadPanel(panelId) {
        return await this.loadPanelContent(panelId);
    }

    async switchPanel(panelId) {
        console.log(`🔄 Switching to panel: ${panelId}`);
        
        // Update navigation state
        document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
        const navElement = document.querySelector(`[data-panel="${panelId}"]`);
        if (navElement) {
            navElement.classList.add('active');
            console.log(`✅ Navigation updated for: ${panelId}`);
        }
        
        // Hide all panels
        document.querySelectorAll('.content-panel').forEach(panel => panel.classList.add('hidden'));
        
        // Show loading state
        this.showLoading();
        
        try {
            // Load content for the panel
            console.log(`📥 Loading content for: ${panelId}`);
            await this.loadPanelContent(panelId);
            console.log(`✅ Content loaded for: ${panelId}`);
            
            // Show the target panel
            const targetElement = document.getElementById(panelId);
            if (targetElement) {
                targetElement.classList.remove('hidden');
                console.log(`👁️ Panel visible: ${panelId}`);
            }
        } catch (error) {
            console.error(`❌ Error loading panel ${panelId}:`, error);
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
                // Let HTML SimulationPresentation handle this panel
                console.log('🎬 Gamma-prompts panel handled by SimulationPresentation class');
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
            console.log('📚 Loading Teacher Guide from markdown file...');
            const response = await fetch('/simulation-files/TEACHER-GUIDE-EXPANDED.md');
            if (!response.ok) {
                throw new Error(`Failed to load: ${response.status} ${response.statusText}`);
            }
            
            const text = await response.text();
            const htmlContent = this.convertComprehensiveMarkdownToHTML(text);
            
            document.getElementById('teacher-guide').innerHTML = `
                <div class="comprehensive-teacher-guide">
                    <div class="guide-header" style="background: linear-gradient(135deg, #8B4513 0%, #D2691E 100%); color: white; padding: 2rem; border-radius: 12px; margin-bottom: 2rem; text-align: center;">
                        <h1 style="margin: 0; font-size: 2.5rem; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">📚 Geographic Detective Academy - Teacher's Guide</h1>
                        <p style="margin: 0.5rem 0 0 0; font-size: 1.2rem; opacity: 0.9;">Complete Implementation Guide</p>
                    </div>
                    
                    <div class="guide-content" style="display: grid; gap: 2rem;">
                        ${htmlContent}
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('❌ Error loading teacher guide:', error);
            document.getElementById('teacher-guide').innerHTML = `
                <div class="error-message" style="text-align: center; padding: 2rem; color: #dc3545; background: #f8d7da; border-radius: 8px; margin: 2rem;">
                    <h3>⚠️ Unable to Load Teacher Guide</h3>
                    <p>There was an error loading the teacher implementation guide. Please try refreshing the page.</p>
                    <details style="margin-top: 1rem;">
                        <summary style="cursor: pointer; font-weight: bold;">Technical Details</summary>
                        <code style="display: block; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 4px;">${error.message}</code>
                    </details>
                </div>
            `;
        }
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

    convertComprehensiveMarkdownToHTML(markdown) {
        console.log('🔄 Converting comprehensive markdown to HTML...');
        
        let html = markdown
            .replace(/^# (.*$)/gm, '<h1>$1</h1>')
            .replace(/^## (.*$)/gm, '<h2>$1</h2>')
            .replace(/^### (.*$)/gm, '<h3>$1</h3>')
            .replace(/^#### (.*$)/gm, '<h4>$1</h4>')
            .replace(/^## (Day \d+: .*$)/gm, '<div class="day-header">$1</div>')
            .replace(/\*\*(CASE FILE \d+.*?)\*\*/g, '<div class="case-file">$1</div>')
            .replace(/\[(Slide \d+[^\]]*)\]/g, '<span class="slide-reference">$1</span>')
            .replace(/\*\*Timing:\*\* (.*$)/gm, '<div class="timing-note">⏰ Timing: $1</div>')
            .replace(/\*\*Learning Objective:\*\* (.*$)/gm, '<div class="learning-objective">🎯 <strong>Learning Objective:</strong> $1</div>')
            .replace(/\*\*Assessment:\*\* (.*$)/gm, '<div class="assessment-note">📊 <strong>Assessment:</strong> $1</div>')
            .replace(/\*\*Implementation Checklist:\*\*/g, '<div class="implementation-checklist"><strong>📋 Implementation Checklist:</strong>')
            .replace(/\*\*Materials Needed:\*\*/g, '<div class="implementation-checklist"><strong>📦 Materials Needed:</strong>')
            .replace(/\*\*Preparation Steps:\*\*/g, '<div class="implementation-checklist"><strong>🔧 Preparation Steps:</strong>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/```[\s\S]*?```/g, function(match) {
                return '<pre><code>' + match.replace(/```/g, '').trim() + '</code></pre>';
            })
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            .replace(/^- (.*$)/gm, '<li>$1</li>')
            .replace(/^\* (.*$)/gm, '<li>$1</li>')
            .replace(/^\d+\. (.*$)/gm, '<li>$1</li>')
            .replace(/(<li>.*<\/li>)/gs, function(match) {
                return '<ul>' + match + '</ul>';
            })
            .replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>')
            .replace(/^---$/gm, '<hr class="section-divider">')
            .split('\n\n')
            .map(paragraph => {
                if (paragraph.trim().length === 0) return '';
                if (paragraph.includes('<h') || paragraph.includes('<div') || paragraph.includes('<ul') || paragraph.includes('<hr') || paragraph.includes('<blockquote')) {
                    return paragraph;
                }
                return `<p>${paragraph}</p>`;
            })
            .join('\n')
            .replace(/(<div class="implementation-checklist">[\s\S]*?)(<h|<div class="day-header"|<div class="case-file"|$)/g, '$1</div>$2')
            .replace(/\n{3,}/g, '\n\n')
            .trim();
            
        console.log('✅ Comprehensive markdown conversion complete');
        return html;
    }
}

// Add enhanced styling for the dynamic content
const dynamicStyles = `
<style>
    .comprehensive-teacher-guide {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        line-height: 1.6;
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem;
    }
    
    .day-header {
        background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
        color: white;
        padding: 1.5rem 2rem;
        border-radius: 10px;
        margin: 2rem 0 1.5rem 0;
        font-size: 1.4rem;
        font-weight: 600;
        box-shadow: 0 4px 15px rgba(0, 123, 255, 0.3);
    }
    
    .case-file {
        background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        margin: 1.5rem 0;
        font-weight: 600;
        box-shadow: 0 3px 12px rgba(220, 53, 69, 0.3);
    }
    
    .slide-reference {
        background: linear-gradient(135deg, #ffc107 0%, #e0a800 100%);
        color: #212529;
        padding: 0.4rem 0.8rem;
        border-radius: 15px;
        font-size: 0.85rem;
        font-weight: 600;
        margin: 0 0.3rem;
        box-shadow: 0 2px 8px rgba(255, 193, 7, 0.4);
        display: inline-block;
    }
    
    .timing-note {
        background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);
        color: white;
        padding: 0.8rem 1.2rem;
        border-radius: 8px;
        margin: 1rem 0;
        font-weight: 500;
        box-shadow: 0 3px 10px rgba(23, 162, 184, 0.3);
    }
    
    .learning-objective {
        background: linear-gradient(135deg, #28a745 0%, #1e7e34 100%);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        margin: 1.5rem 0;
        box-shadow: 0 3px 12px rgba(40, 167, 69, 0.3);
    }
    
    .assessment-note {
        background: linear-gradient(135deg, #6f42c1 0%, #59359a 100%);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        margin: 1.5rem 0;
        box-shadow: 0 3px 12px rgba(111, 66, 193, 0.3);
    }
    
    .implementation-checklist {
        background: #f8f9fa;
        border-left: 4px solid #007bff;
        padding: 1.5rem;
        margin: 1.5rem 0;
        border-radius: 0 8px 8px 0;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    
    .implementation-checklist strong {
        color: #007bff;
        font-size: 1.1rem;
    }
    
    .section-divider {
        border: none;
        height: 3px;
        background: linear-gradient(to right, #007bff, #28a745, #ffc107, #dc3545);
        margin: 3rem 0;
        border-radius: 2px;
    }

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

    /* Status Button Enhancements */
    .badge.classified:hover, .badge.active-case:hover {
        transform: scale(1.05);
        transition: all 0.3s ease;
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
    }

    .badge.code-red {
        background: #dc3545 !important;
        animation: urgent-pulse 1s infinite;
    }

    .badge.priority-alert {
        background: #fd7e14 !important;
        animation: priority-glow 2s infinite;
    }

    .badge.case-closed {
        background: #28a745 !important;
    }

    .badge.under-investigation {
        background: #6f42c1 !important;
        animation: investigate-pulse 3s infinite;
    }

    @keyframes urgent-pulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.7; transform: scale(1.1); }
    }

    @keyframes priority-glow {
        0%, 100% { box-shadow: 0 0 5px #fd7e14; }
        50% { box-shadow: 0 0 15px #fd7e14, 0 0 25px #fd7e14; }
    }

    @keyframes investigate-pulse {
        0%, 100% { opacity: 1; }
        33% { opacity: 0.8; }
        66% { opacity: 0.6; }
    }

    /* Alert Styles */
    .classified-alert, .case-status-alert {
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(0, 0, 0, 0.95);
        color: white;
        border-radius: 10px;
        padding: 0;
        min-width: 400px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        z-index: 10000;
        animation: slideInRight 0.5s ease;
        border: 2px solid #ffd700;
    }

    .alert-content {
        display: flex;
        align-items: flex-start;
        gap: 1rem;
        padding: 1.5rem;
        position: relative;
    }

    .alert-content.status-code-red {
        border-left: 5px solid #dc3545;
        background: linear-gradient(135deg, rgba(220, 53, 69, 0.2), rgba(0, 0, 0, 0.95));
    }

    .alert-content.status-priority-alert {
        border-left: 5px solid #fd7e14;
        background: linear-gradient(135deg, rgba(253, 126, 20, 0.2), rgba(0, 0, 0, 0.95));
    }

    .alert-content.status-case-closed {
        border-left: 5px solid #28a745;
        background: linear-gradient(135deg, rgba(40, 167, 69, 0.2), rgba(0, 0, 0, 0.95));
    }

    .alert-icon {
        font-size: 2rem;
        line-height: 1;
    }

    .alert-text h3 {
        margin: 0 0 0.5rem 0;
        color: #ffd700;
        font-size: 1.1rem;
    }

    .alert-text p {
        margin: 0.3rem 0;
        line-height: 1.4;
    }

    .alert-close {
        position: absolute;
        top: 10px;
        right: 15px;
        background: none;
        border: none;
        color: #ffd700;
        font-size: 1.5rem;
        cursor: pointer;
        padding: 0;
        width: 25px;
        height: 25px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .alert-close:hover {
        color: white;
        background: rgba(255, 215, 0, 0.2);
        border-radius: 50%;
    }

    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    /* Classified Mode Effects */
    body.classified-mode {
        background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%) !important;
    }

    body.classified-mode .header {
        background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%) !important;
        border-bottom: 3px solid #e74c3c;
    }

    body.classified-mode .nav-container {
        background: rgba(44, 62, 80, 0.9) !important;
    }

    @keyframes classifiedPulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
    }
</style>
`;

// Inject the styles
document.head.insertAdjacentHTML('beforeend', dynamicStyles);
