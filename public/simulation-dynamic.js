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
                        <div class="role-image-container">
                            <img src="/images/role-cards/${role.title.toLowerCase().replace(/\s+/g, ' ')}.png" alt="${role.title}" class="role-card-image">
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
        const panel = document.getElementById('investigation-events');
        panel.innerHTML = `
            <div class="investigation-header">
                <h1>🕵️ Investigation Events Database</h1>
                <p class="mission-statement">Progressive case studies designed to build geographic detective skills through authentic, engaging investigations</p>
                <div class="academy-stats">
                    <span class="stat">12 Investigation Cases</span>
                    <span class="stat">60 Presentation Slides</span>
                    <span class="stat">8 Module Integrations</span>
                    <span class="stat">4 Detective Specializations</span>
                </div>
            </div>
            
            <div class="event-filters">
                <button class="filter-btn active" data-filter="all">All Cases (11)</button>
                <button class="filter-btn" data-filter="orientation">Setup (1)</button>
                <button class="filter-btn" data-filter="rookie">Rookie Level (2)</button>
                <button class="filter-btn" data-filter="detective">Detective Level (1)</button>
                <button class="filter-btn" data-filter="specialist">Specialist Level (6)</button>
                <button class="filter-btn" data-filter="master">Master Level (2)</button>
                <button class="filter-btn" data-filter="graduation">Graduation (1)</button>
            </div>
            
            <div class="search-controls">
                <input type="text" id="investigation-search" placeholder="🔍 Search cases by topic, skill, or module..." class="search-input">
            </div>
            
            <div class="investigation-cases">
                <!-- SETUP DAY -->
                <div class="investigation-card setup-day" data-difficulty="orientation">
                    <div class="case-header">
                        <span class="case-number">DAY 0</span>
                        <h3 class="case-title">Welcome to the Academy</h3>
                        <div class="case-badges">
                            <span class="difficulty-badge setup">ORIENTATION</span>
                            <span class="duration-badge">45 MINUTES</span>
                        </div>
                    </div>
                    
                    <div class="case-summary">
                        <p><strong>Mission:</strong> Transform rookie students into Geographic Detective Academy cadets through team formation, role assignment, and immersion into the International Geographic Bureau crisis.</p>
                    </div>
                    
                    <div class="case-details">
                        <div class="crime-scene-image">
                            <!-- IMAGE PLACEHOLDER FOR GENERATION -->
                            <div class="image-placeholder">
                                <div class="image-prompt">
                                    <strong>🎨 Image Generation Prompt:</strong>
                                    <p>"Professional police academy classroom with dramatic lighting, international flags on walls, large world maps, high-tech displays showing global crisis alerts, students seated in team formations wearing detective badges. Modern facility with geographic crime investigation equipment visible. Atmosphere should be serious but inspiring, conveying importance of mission. Style: photorealistic, cinematic lighting."</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="scenario-box">
                            <h4>🎭 Investigation Scenario</h4>
                            <p><strong>Setting:</strong> International Geographic Bureau Academy Training Facility</p>
                            <p><strong>Crisis:</strong> The Cartographers criminal organization has stolen the world's most important geographic artifacts</p>
                            <p><strong>Urgency:</strong> GPS systems failing globally, international boundaries unclear, navigation compromised</p>
                            <p><strong>Stakes:</strong> Global geographic knowledge security threatens international stability</p>
                            <p><strong>Your Mission:</strong> Emergency recruitment into elite Geographic Detective Academy for immediate deployment</p>
                        </div>
                        
                        <div class="objectives-grid">
                            <div class="learning-objectives">
                                <h4>🎯 Learning Objectives</h4>
                                <ul>
                                    <li>Understand simulation framework and collaborative procedures</li>
                                    <li>Form balanced detective teams with specialized roles</li>
                                    <li>Create character backgrounds and professional identities</li>
                                    <li>Establish International Geographic Bureau immersion</li>
                                    <li>Commit to Geographic Detective Academy oath and values</li>
                                </ul>
                            </div>
                            
                            <div class="geographic-skills">
                                <h4>🗺️ Geographic Skills Foundation</h4>
                                <ul>
                                    <li>Introduction to geographic thinking and spatial analysis</li>
                                    <li>Understanding geography's role in criminal investigation</li>
                                    <li>Recognition of five themes of geography in detective work</li>
                                    <li>Geographic vocabulary and professional terminology</li>
                                    <li>International Geographic Bureau protocols and procedures</li>
                                </ul>
                            </div>
                        </div>
                        
                        <div class="implementation-timeline">
                            <h4>⏰ Implementation Timeline</h4>
                            <div class="timeline-item">
                                <span class="time">Minutes 1-10</span>
                                <span class="activity">Crisis briefing and Academy welcome presentation</span>
                                <span class="slide-ref">Slides 1-3</span>
                                <span class="teacher-role">Present global crisis, explain urgency of recruitment</span>
                            </div>
                            <div class="timeline-item">
                                <span class="time">Minutes 11-20</span>
                                <span class="activity">Team formation and specialized role assignment</span>
                                <span class="slide-ref">Slide 4</span>
                                <span class="teacher-role">Facilitate team creation, distribute role cards</span>
                            </div>
                            <div class="timeline-item">
                                <span class="time">Minutes 21-35</span>
                                <span class="activity">Character creation and detective identity development</span>
                                <span class="slide-ref">Character worksheets</span>
                                <span class="teacher-role">Guide character creation, issue detective badges</span>
                            </div>
                            <div class="timeline-item">
                                <span class="time">Minutes 36-45</span>
                                <span class="activity">Academy oath ceremony and mission briefing</span>
                                <span class="slide-ref">Slide 5</span>
                                <span class="teacher-role">Conduct oath ceremony, preview upcoming cases</span>
                            </div>
                        </div>
                        
                        <div class="team-roles-detailed">
                            <h4>👥 Detective Team Roles & Responsibilities</h4>
                            <div class="roles-grid">
                                <div class="role-card evidence-manager">
                                    <div class="role-image">
                                        <div class="image-placeholder small">
                                            <strong>🎨 Role Badge Prompt:</strong>
                                            <p>"Professional detective badge design featuring magnifying glass over evidence files, fingerprint scanner, and chain of custody documentation. Blue and gold color scheme with International Geographic Bureau logo. Text: 'Evidence Manager - Chain of Custody Specialist'"</p>
                                        </div>
                                    </div>
                                    <h5>Evidence Manager</h5>
                                    <p><strong>Primary Responsibility:</strong> Maintains chain of custody, organizes physical evidence, ensures documentation standards</p>
                                    <div class="role-details">
                                        <strong>Day 0 Setup Tasks:</strong>
                                        <ul>
                                            <li>Create team evidence tracking system</li>
                                            <li>Organize investigation materials and supplies</li>
                                            <li>Establish chain of custody procedures</li>
                                            <li>Set up evidence collection protocols</li>
                                        </ul>
                                        <strong>Tools Assigned:</strong> Evidence bags, documentation forms, chain of custody logs, magnifying glass
                                    </div>
                                </div>
                                
                                <div class="role-card geography-specialist">
                                    <div class="role-image">
                                        <div class="image-placeholder small">
                                            <strong>🎨 Role Badge Prompt:</strong>
                                            <p>"Professional detective badge design featuring compass rose, latitude/longitude grid, world map outline, and GPS coordinates. Green and gold color scheme with International Geographic Bureau logo. Text: 'Geography Specialist - Spatial Analysis Expert'"</p>
                                        </div>
                                    </div>
                                    <h5>Geography Specialist</h5>
                                    <p><strong>Primary Responsibility:</strong> Analyzes spatial data, interprets maps, provides coordinate system expertise</p>
                                    <div class="role-details">
                                        <strong>Day 0 Setup Tasks:</strong>
                                        <ul>
                                            <li>Set up team mapping station with atlases</li>
                                            <li>Review coordinate systems reference materials</li>
                                            <li>Prepare spatial analysis tools and rulers</li>
                                            <li>Establish geographic analysis protocols</li>
                                        </ul>
                                        <strong>Tools Assigned:</strong> World atlas, coordinate worksheets, compass, ruler, map analysis guides
                                    </div>
                                </div>
                                
                                <div class="role-card resource-tracker">
                                    <div class="role-image">
                                        <div class="image-placeholder small">
                                            <strong>🎨 Role Badge Prompt:</strong>
                                            <p>"Professional detective badge design featuring calculator, budget charts, equipment icons, and resource allocation graphs. Red and gold color scheme with International Geographic Bureau logo. Text: 'Resource Tracker - Investigation Budget Manager'"</p>
                                        </div>
                                    </div>
                                    <h5>Resource Tracker</h5>
                                    <p><strong>Primary Responsibility:</strong> Manages investigation budget, equipment procurement, logistical planning</p>
                                    <div class="role-details">
                                        <strong>Day 0 Setup Tasks:</strong>
                                        <ul>
                                            <li>Establish team investigation budget ($1,000 starting credits)</li>
                                            <li>Create equipment inventory and tracking system</li>
                                            <li>Plan resource allocation strategy for cases</li>
                                            <li>Set up cost-benefit analysis procedures</li>
                                        </ul>
                                        <strong>Tools Assigned:</strong> Budget tracking sheets, calculator, equipment inventory, cost analysis forms
                                    </div>
                                </div>
                                
                                <div class="role-card case-chronicler">
                                    <div class="role-image">
                                        <div class="image-placeholder small">
                                            <strong>🎨 Role Badge Prompt:</strong>
                                            <p>"Professional detective badge design featuring notepad, fountain pen, case file folder, and progress charts. Purple and gold color scheme with International Geographic Bureau logo. Text: 'Case Chronicler - Investigation Documentation Specialist'"</p>
                                        </div>
                                    </div>
                                    <h5>Case Chronicler</h5>
                                    <p><strong>Primary Responsibility:</strong> Documents investigation progress, maintains case journal, prepares reports</p>
                                    <div class="role-details">
                                        <strong>Day 0 Setup Tasks:</strong>
                                        <ul>
                                            <li>Set up comprehensive team investigation log</li>
                                            <li>Create case documentation system and templates</li>
                                            <li>Prepare progress tracking charts and timelines</li>
                                            <li>Establish report writing protocols</li>
                                        </ul>
                                        <strong>Tools Assigned:</strong> Investigation journal, report templates, progress charts, documentation guides
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="character-creation-detailed">
                            <h4>🎭 Detective Character Creation Process</h4>
                            <div class="character-development">
                                <div class="character-step">
                                    <h5>Step 1: Professional Identity (8 minutes)</h5>
                                    <div class="character-elements">
                                        <div class="element">
                                            <strong>Detective Code Name:</strong> Agent [Choose Last Name]
                                            <p><em>Examples: Agent Rodriguez, Agent Chen, Agent Johnson</em></p>
                                        </div>
                                        <div class="element">
                                            <strong>Geographic Specialization:</strong> Choose area of expertise
                                            <p><em>Options: Mountain investigations, coastal crimes, urban analysis, desert operations, forest mysteries, Arctic cases</em></p>
                                        </div>
                                        <div class="element">
                                            <strong>Personal Background:</strong> What led you to geographic detective work?
                                            <p><em>Examples: Family mystery, travel experience, geographic passion, justice motivation</em></p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="character-step">
                                    <h5>Step 2: Mission Commitment (4 minutes)</h5>
                                    <div class="character-elements">
                                        <div class="element">
                                            <strong>Personal Mission Statement:</strong> One sentence defining your commitment
                                            <p><em>Example: "I will use geographic knowledge to protect innocent people and preserve cultural heritage worldwide."</em></p>
                                        </div>
                                        <div class="element">
                                            <strong>Team Motto:</strong> Collaborative slogan for your detective unit
                                            <p><em>Examples: "Geography Serves Justice," "Spatial Analysis Saves Lives," "No Crime Escapes Geographic Detection"</em></p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="character-step">
                                    <h5>Step 3: Badge Design (3 minutes)</h5>
                                    <div class="badge-creation">
                                        <p>Design personal detective badge incorporating:</p>
                                        <ul>
                                            <li>Your chosen geographic specialization symbol</li>
                                            <li>Personal detective code name</li>
                                            <li>International Geographic Bureau official seal</li>
                                            <li>Team number and role identification</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="academy-oath-ceremony">
                            <h4>⚖️ Geographic Detective Academy Oath</h4>
                            <div class="oath-presentation">
                                <div class="oath-setup">
                                    <p><strong>Ceremony Setup:</strong> All teams stand, right hand raised, badges visible</p>
                                    <p><strong>Teacher Role:</strong> Read oath with dramatic emphasis, pause for student repetition</p>
                                </div>
                                <div class="oath-text">
                                    <h5>Official Academy Oath:</h5>
                                    <div class="oath-box">
                                        <p><em>"I solemnly swear to use geographic knowledge for the protection of humanity, to seek truth through spatial analysis, to respect all cultures and places wherever they may be found. I pledge to work collaboratively with my fellow detectives, to think critically about geographic evidence, and to never use geographic power for personal gain. I promise to defend geographic justice wherever crimes against geography occur, and to uphold the highest standards of the International Geographic Bureau. I am a Geographic Detective, and geography is my weapon for justice."</em></p>
                                    </div>
                                </div>
                                <div class="oath-completion">
                                    <p><strong>Badge Presentation:</strong> Official pin ceremony for each team member</p>
                                    <p><strong>Academy Welcome:</strong> "Welcome to the International Geographic Bureau Detective Academy. Your training begins now."</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="assessment-framework">
                            <h4>📊 Day 0 Assessment Criteria</h4>
                            <div class="assessment-categories">
                                <div class="assessment-category">
                                    <h5>Team Formation Excellence (25%)</h5>
                                    <ul>
                                        <li>Balanced role distribution and understanding</li>
                                        <li>Effective communication during team building</li>
                                        <li>Collaborative decision-making processes</li>
                                        <li>Inclusive participation of all members</li>
                                    </ul>
                                </div>
                                <div class="assessment-category">
                                    <h5>Character Development Quality (25%)</h5>
                                    <ul>
                                        <li>Creativity and authenticity in detective identity</li>
                                        <li>Clear connection between background and specialization</li>
                                        <li>Professional approach to character creation</li>
                                        <li>Commitment to role and mission</li>
                                    </ul>
                                </div>
                                <div class="assessment-category">
                                    <h5>Geographic Foundation Understanding (25%)</h5>
                                    <ul>
                                        <li>Recognition of geography's role in investigation</li>
                                        <li>Understanding of spatial thinking concepts</li>
                                        <li>Appreciation for geographic diversity and importance</li>
                                        <li>Connection between geography and problem-solving</li>
                                    </ul>
                                </div>
                                <div class="assessment-category">
                                    <h5>Academy Values Integration (25%)</h5>
                                    <ul>
                                        <li>Genuine engagement with oath ceremony</li>
                                        <li>Respect for collaborative investigation values</li>
                                        <li>Understanding of ethical geographic detective work</li>
                                        <li>Commitment to International Geographic Bureau mission</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        
                        <div class="preparation-checklist">
                            <h4>📋 Teacher Preparation Checklist</h4>
                            <div class="prep-categories">
                                <div class="prep-category">
                                    <h5>🎨 Materials Needed</h5>
                                    <ul>
                                        <li>Role badges (4 different colors for each role type)</li>
                                        <li>Character creation worksheets (1 per student)</li>
                                        <li>Team formation cards for random/strategic grouping</li>
                                        <li>Detective equipment starter kits per team</li>
                                        <li>Academy oath poster for classroom display</li>
                                        <li>Investigation budget tracking sheets</li>
                                    </ul>
                                </div>
                                <div class="prep-category">
                                    <h5>📱 Technology Setup</h5>
                                    <ul>
                                        <li>Slides 1-5 loaded and tested</li>
                                        <li>Dramatic background music ready (optional)</li>
                                        <li>Timer for activity management</li>
                                        <li>Certificate/badge printing capability</li>
                                    </ul>
                                </div>
                                <div class="prep-category">
                                    <h5>🏫 Classroom Environment</h5>
                                    <ul>
                                        <li>Desks arranged for teams of 4-5 students</li>
                                        <li>Investigation stations set up around room</li>
                                        <li>World maps and geographic reference materials visible</li>
                                        <li>Academy atmosphere created with appropriate decorations</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                        
                        <div class="implementation-timeline">
                            <h4>⏰ Implementation Timeline</h4>
                            <div class="timeline-item">
                                <span class="time">Minutes 1-10</span>
                                <span class="activity">Welcome presentation and story introduction</span>
                                <span class="slide-ref">Slides 1-3</span>
                            </div>
                            <div class="timeline-item">
                                <span class="time">Minutes 11-20</span>
                                <span class="activity">Team formation and role assignment</span>
                                <span class="slide-ref">Slide 4</span>
                            </div>
                            <div class="timeline-item">
                                <span class="time">Minutes 21-35</span>
                                <span class="activity">Character creation and equipment distribution</span>
                                <span class="slide-ref">Equipment cards</span>
                            </div>
                            <div class="timeline-item">
                                <span class="time">Minutes 36-45</span>
                                <span class="activity">Academy oath ceremony and team building</span>
                                <span class="slide-ref">Slide 5</span>
                            </div>
                        </div>
                        
                        <div class="team-structure">
                            <h4>👥 Detective Team Roles</h4>
                            <div class="roles-grid">
                                <div class="role-card">
                                    <div class="role-image">
                                        <img src="/images/role-cards/evidence manager.png" alt="Evidence Manager" class="role-card-img">
                                    </div>
                                    <h5>Evidence Manager</h5>
                                    <p>Tracks clues, maintains chain of custody, organizes physical evidence and artifacts</p>
                                </div>
                                <div class="role-card">
                                    <div class="role-image">
                                        <img src="/images/role-cards/geography specialist.png" alt="Geography Specialist" class="role-card-img">
                                    </div>
                                    <h5>Geography Specialist</h5>
                                    <p>Analyzes spatial data, interprets maps, provides coordinate system expertise</p>
                                </div>
                                <div class="role-card">
                                    <div class="role-image">
                                        <img src="/images/role-cards/resource tracker.png" alt="Resource Tracker" class="role-card-img">
                                    </div>
                                    <h5>Resource Tracker</h5>
                                    <p>Manages investigation budget, equipment procurement, logistical planning</p>
                                </div>
                                <div class="role-card">
                                    <div class="role-image">
                                        <img src="/images/role-cards/case chronicler.png" alt="Case Chronicler" class="role-card-img">
                                    </div>
                                    <h5>Case Chronicler</h5>
                                    <p>Documents investigation progress, maintains case journal, prepares reports</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="teacher-implementation">
                            <h4>📖 Teacher Script Excerpts</h4>
                            <div class="script-box">
                                <p><em>"Good morning, detectives! Today you begin training at the most prestigious law enforcement academy in the world - the International Geographic Bureau's Detective Academy. You are about to learn that geography isn't just about memorizing capitals and rivers - it's about solving crimes, saving lives, and protecting global security."</em></p>
                            </div>
                        </div>
                        
                        <div class="assessment-focus">
                            <h4>📊 Assessment Focus</h4>
                            <ul>
                                <li>Team formation dynamics and collaboration readiness</li>
                                <li>Understanding of role responsibilities and expectations</li>
                                <li>Engagement with geographic detective framework</li>
                                <li>Communication and leadership emerging patterns</li>
                            </ul>
                        </div>
                    </div>
                </div>
                
                <!-- DAY 1: THE GREAT GLOBE HEIST -->
                <div class="investigation-card day-1" data-difficulty="rookie">
                    <div class="case-header">
                        <span class="case-number">CASE #001</span>
                        <h3 class="case-title">The Great Globe Heist</h3>
                        <div class="case-badges">
                            <span class="difficulty-badge rookie">ROOKIE LEVEL</span>
                            <span class="duration-badge">15 MIN + MODULE 1</span>
                            <span class="module-badge">GEOGRAPHER'S WORLD</span>
                        </div>
                    </div>
                    
                    <div class="case-summary">
                        <p><strong>Mystery:</strong> The academy's prized 12-inch demonstration globe has vanished, containing hidden coordinates to a much larger treasure that threatens international security.</p>
                    </div>
                    
                    <div class="case-details">
                        <div class="crime-scene-image">
                            <!-- IMAGE PLACEHOLDER FOR GENERATION -->
                            <div class="image-placeholder">
                                <div class="image-prompt">
                                    <strong>🎨 Crime Scene Image Prompt:</strong>
                                    <p>"Geography classroom crime scene with empty globe stand showing dust outline, scattered papers with coordinate fragments (40°N, 74°W visible), abandoned compass pointing northeast, fingerprint powder on metal surfaces, evidence markers, dramatic shadows from blinds. Professional CSI photography style with evidence focus."</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="scenario-box">
                            <h4>🎭 Investigation Scenario</h4>
                            <p><strong>Setting:</strong> Roosevelt Middle School Geography Laboratory, Room 204</p>
                            <p><strong>Crime:</strong> Breaking and entering with theft of specialized geographic equipment</p>
                            <p><strong>Time of Incident:</strong> Tuesday, 3:15 PM (after school hours)</p>
                            <p><strong>Evidence:</strong> Dust outline (12-inch diameter), fingerprints on metal stand, torn coordinate paper (40°N, 74°W), abandoned compass pointing northeast</p>
                            <p><strong>Stakes:</strong> Globe contains encrypted coordinates to international treasure map network</p>
                            <p><strong>Threat Level:</strong> LOW (training case) but builds to HIGH (real implications)</p>
                        </div>
                        
                        <div class="objectives-grid">
                            <div class="learning-objectives">
                                <h4>🎯 Learning Objectives</h4>
                                <ul>
                                    <li>Define geography and its role in criminal investigation</li>
                                    <li>Distinguish between physical and human geographic evidence</li>
                                    <li>Apply basic coordinate system knowledge to solve problems</li>
                                    <li>Use fundamental geographic tools in authentic contexts</li>
                                    <li>Practice systematic evidence analysis and documentation</li>
                                </ul>
                            </div>
                            
                            <div class="geographic-skills">
                                <h4>🗺️ Geographic Skills Practiced</h4>
                                <ul>
                                    <li>Coordinate system interpretation (latitude/longitude basics)</li>
                                    <li>Cardinal direction analysis and compass use</li>
                                    <li>Physical vs. human geographic evidence classification</li>
                                    <li>Basic map reading and spatial orientation</li>
                                    <li>Geographic vocabulary application in professional context</li>
                                </ul>
                            </div>
                        </div>
                        
                        <div class="evidence-analysis-detailed">
                            <h4>🔍 Comprehensive Evidence Analysis</h4>
                            <div class="evidence-grid">
                                <div class="evidence-item priority-high">
                                    <div class="evidence-image">
                                        <div class="image-placeholder small">
                                            <strong>🎨 Evidence Photo Prompt:</strong>
                                            <p>"Close-up photograph of torn paper fragment showing coordinates 40°N, 74°W written in pencil, slightly coffee-stained, torn edges, lying on classroom desk with ruler for scale. Professional evidence photography with measurement markers."</p>
                                        </div>
                                    </div>
                                    <h5>🧩 Critical Evidence: Coordinate Fragment</h5>
                                    <p><strong>Physical Description:</strong> Torn paper fragment, 3x2 inches, coffee stain on corner</p>
                                    <p><strong>Geographic Data:</strong> 40°N, 74°W (handwritten in pencil)</p>
                                    <p><strong>Geography Specialist Analysis:</strong> Coordinates point to Statue of Liberty area, New York Harbor</p>
                                    <p><strong>Investigation Questions:</strong> Why this location? What's the connection to the stolen globe?</p>
                                    <p><strong>Team Role Focus:</strong> Geography Specialist leads coordinate analysis, Evidence Manager documents chain of custody</p>
                                </div>
                                
                                <div class="evidence-item priority-medium">
                                    <div class="evidence-image">
                                        <div class="image-placeholder small">
                                            <strong>🎨 Evidence Photo Prompt:</strong>
                                            <p>"Vintage brass compass lying on classroom floor, needle pointing northeast, slight scratches on surface, evidence marker #2 beside it. Dramatic lighting showing fingerprint powder residue nearby."</p>
                                        </div>
                                    </div>
                                    <h5>🧭 Physical Evidence: Abandoned Compass</h5>
                                    <p><strong>Physical Description:</strong> Brass compass, vintage style, 2-inch diameter</p>
                                    <p><strong>Geographic Data:</strong> Needle pointing 45° northeast from classroom position</p>
                                    <p><strong>Evidence Manager Analysis:</strong> Shows thief's escape route planning and geographic knowledge</p>
                                    <p><strong>Investigation Questions:</strong> Did thief drop accidentally or leave intentionally as message?</p>
                                    <p><strong>Team Role Focus:</strong> Evidence Manager handles physical analysis, Resource Tracker evaluates cost and origin</p>
                                </div>
                                
                                <div class="evidence-item priority-high">
                                    <div class="evidence-image">
                                        <div class="image-placeholder small">
                                            <strong>🎨 Evidence Photo Prompt:</strong>
                                            <p>"Empty globe stand with perfect circular dust outline, 12-inch diameter clearly visible, fingerprint powder on metal base showing partial prints, evidence measuring tools around perimeter. Professional crime scene photography."</p>
                                        </div>
                                    </div>
                                    <h5>🌍 Crime Scene: Globe Stand Evidence</h5>
                                    <p><strong>Physical Description:</strong> Empty metal stand with perfect 12-inch circular dust outline</p>
                                    <p><strong>Geographic Significance:</strong> Specialized educational globe, not random theft target</p>
                                    <p><strong>Case Chronicler Analysis:</strong> Thief knew exactly what they wanted - suggests inside knowledge</p>
                                    <p><strong>Investigation Questions:</strong> How did thief know globe's special significance? Who has access?</p>
                                    <p><strong>Team Role Focus:</strong> Case Chronicler documents timeline, Evidence Manager processes fingerprints</p>
                                </div>
                                
                                <div class="evidence-item priority-low">
                                    <div class="evidence-image">
                                        <div class="image-placeholder small">
                                            <strong>🎨 Evidence Photo Prompt:</strong>
                                            <p>"Classroom wall map with one pushpin missing from New York City area, other pins intact showing various global locations, slight tear around missing pin area. Educational classroom setting."</p>
                                        </div>
                                    </div>
                                    <h5>📍 Supporting Evidence: Missing Map Pin</h5>
                                    <p><strong>Physical Description:</strong> Red pushpin missing from New York City area on wall map</p>
                                    <p><strong>Geographic Connection:</strong> Corresponds to coordinate fragment location (40°N, 74°W)</p>
                                    <p><strong>Resource Tracker Analysis:</strong> Pattern suggests systematic planning and geographic targeting</p>
                                    <p><strong>Investigation Questions:</strong> Are other pins missing? Is this part of larger pattern?</p>
                                    <p><strong>Team Role Focus:</strong> All roles collaborate to check for additional missing items or patterns</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="investigation-sequence">
                            <h4>🔬 Detailed Investigation Sequence</h4>
                            <div class="sequence-step">
                                <span class="step-number">1</span>
                                <div class="step-content">
                                    <h5>Case Briefing (3 minutes) - Slide 6</h5>
                                    <p><strong>Teacher Script:</strong> "Detectives, this is it - your first real case. At exactly 3:15 PM yesterday, an intruder broke into Roosevelt Middle School and stole our most valuable training globe. But this isn't just any globe - it contains encrypted coordinates to a network of international treasure maps. The thief left behind clues, and we need your geographic expertise to solve this before they strike again."</p>
                                    <p><strong>Atmosphere:</strong> Dim lights, serious tone, emphasize real stakes</p>
                                    <p><strong>Team Response:</strong> All roles activate investigation protocols</p>
                                </div>
                            </div>
                            
                            <div class="sequence-step">
                                <span class="step-number">2</span>
                                <div class="step-content">
                                    <h5>Evidence Presentation & Role Activation (5 minutes) - Slides 7-8</h5>
                                    <p><strong>Evidence Manager:</strong> Takes possession of evidence photos, documents chain of custody, organizes physical evidence analysis</p>
                                    <p><strong>Geography Specialist:</strong> Immediately begins coordinate analysis, identifies 40°N, 74°W location using atlas</p>
                                    <p><strong>Resource Tracker:</strong> Evaluates investigation costs, assigns budget priorities ($50 for coordinate analysis, $30 for fingerprint processing)</p>
                                    <p><strong>Case Chronicler:</strong> Documents evidence presentation, creates timeline, records initial team observations</p>
                                </div>
                            </div>
                            
                            <div class="sequence-step">
                                <span class="step-number">3</span>
                                <div class="step-content">
                                    <h5>Witness Interview: Janitor Bob (4 minutes) - Slide 9</h5>
                                    <div class="witness-interview">
                                        <div class="witness-image">
                                            <div class="image-placeholder small">
                                                <strong>🎨 Witness Photo Prompt:</strong>
                                                <p>"Friendly middle-aged janitor in blue uniform holding cleaning supplies, standing in school hallway with concerned expression, institutional lighting, name tag reading 'Bob', helpful demeanor."</p>
                                            </div>
                                        </div>
                                        <div class="interview-content">
                                            <p><strong>Teacher as Janitor Bob:</strong> "Well, I was cleaning the hallway around 3:00 when I heard some noise from Room 204. I looked in and saw someone moving around - couldn't tell if it was a student or not at first. They had some kind of map spread out on the desk and seemed really focused on the eastern United States on the wall map."</p>
                                            
                                            <h6>Available Follow-up Information (when teams ask):</h6>
                                            <ul>
                                                <li><em>"Did you see their face?"</em> - "No, they had a hood up, but they moved like they knew exactly what they were looking for."</li>
                                                <li><em>"What were they doing at the map?"</em> - "Pointing at different cities, writing something down. Definitely interested in the New York area."</li>
                                                <li><em>"How did they react when they saw you?"</em> - "Dropped something - sounded metallic - and rushed out the side door. That's when I called security."</li>
                                                <li><em>"Did they take anything else?"</em> - "Just the globe as far as I could tell. Left everything else alone."</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="sequence-step">
                                <span class="step-number">4</span>
                                <div class="step-content">
                                    <h5>Team Investigation & Analysis (5 minutes)</h5>
                                    <p><strong>Collaborative Process:</strong> Teams must work together to connect evidence</p>
                                    <div class="team-activities">
                                        <div class="activity-box evidence-manager">
                                            <h6>Evidence Manager Tasks:</h6>
                                            <ul>
                                                <li>Create evidence inventory list</li>
                                                <li>Connect physical evidence to witness testimony</li>
                                                <li>Establish timeline of events</li>
                                                <li>Document chain of custody for all items</li>
                                            </ul>
                                        </div>
                                        <div class="activity-box geography-specialist">
                                            <h6>Geography Specialist Tasks:</h6>
                                            <ul>
                                                <li>Use atlas to identify 40°N, 74°W (Statue of Liberty/New York Harbor)</li>
                                                <li>Explain why this location might be significant</li>
                                                <li>Analyze compass direction (northeast from school)</li>
                                                <li>Research geographic importance of New York Harbor</li>
                                            </ul>
                                        </div>
                                        <div class="activity-box resource-tracker">
                                            <h6>Resource Tracker Tasks:</h6>
                                            <ul>
                                                <li>Evaluate cost of globe replacement ($200)</li>
                                                <li>Calculate investigation expenses so far ($80 used)</li>
                                                <li>Assess security upgrade costs</li>
                                                <li>Plan budget for next investigation phase</li>
                                            </ul>
                                        </div>
                                        <div class="activity-box case-chronicler">
                                            <h6>Case Chronicler Tasks:</h6>
                                            <ul>
                                                <li>Document all team discoveries and connections</li>
                                                <li>Create case summary with key findings</li>
                                                <li>Prepare team presentation of solution</li>
                                                <li>Record geographic skills demonstrated</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="sequence-step">
                                <span class="step-number">5</span>
                                <div class="step-content">
                                    <h5>Solution Presentation & Case Resolution (3 minutes) - Slides 10-11</h5>
                                    <p><strong>Team Presentations:</strong> Each team presents their analysis and conclusions</p>
                                    <p><strong>Solution Revealed:</strong> Coordinate analysis leads to discovery that the thief is targeting historic locations connected to geographic exploration. The Statue of Liberty area was chosen because it represents the gateway to America - where many geographic discoveries began.</p>
                                    <p><strong>Case Resolution:</strong> Teams successfully connected evidence to conclude the thief has geographic expertise and is likely planning more thefts at historically significant locations.</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="module-integration">
                            <h4>📚 Module 1: The Geographer's World Connection</h4>
                            <div class="module-connection">
                                <p><strong>Seamless Integration:</strong> This case directly connects to Module 1 content about what geography is and how geographers think about the world.</p>
                                
                                <div class="module-skills">
                                    <h5>Module Skills Reinforced:</h5>
                                    <ul>
                                        <li><strong>Definition of Geography:</strong> Students see geography as spatial problem-solving, not just memorization</li>
                                        <li><strong>Five Themes Application:</strong> Location (coordinates), Place (Statue of Liberty), Movement (thief's path), Region (New York Harbor area), Human-Environment Interaction (urban crime patterns)</li>
                                        <li><strong>Geographic Tools:</strong> Practical use of atlases, coordinate systems, compass directions</li>
                                        <li><strong>Spatial Thinking:</strong> Understanding how location influences criminal behavior and investigation strategy</li>
                                    </ul>
                                </div>
                                
                                <div class="module-assessment">
                                    <h5>Assessment Integration:</h5>
                                    <p>Case investigation naturally assesses Module 1 learning objectives while students are engaged in authentic geographic problem-solving.</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="case-outcome">
                            <h4>🏆 Case Resolution & Geographic Skills Achievement</h4>
                            <div class="outcome-box success">
                                <p><strong>Resolution:</strong> Teams successfully identify the geographic significance of stolen coordinates, demonstrating that geography is essential for understanding criminal patterns and solving real-world problems. The thief's target - locations of historic geographic importance - reveals sophisticated geographic knowledge.</p>
                                
                                <div class="skills-earned">
                                    <h5>Geographic Detective Skills Earned:</h5>
                                    <span class="skill-badge">Coordinate Analysis</span>
                                    <span class="skill-badge">Evidence Mapping</span>
                                    <span class="skill-badge">Spatial Reasoning</span>
                                    <span class="skill-badge">Geographic Tool Use</span>
                                    <span class="skill-badge">Team Investigation</span>
                                </div>
                                
                                <div class="case-impact">
                                    <h5>Real-World Impact Understanding:</h5>
                                    <p>Students discover that geographic knowledge isn't just academic - it's a powerful tool for solving problems, protecting people, and understanding criminal behavior. This case establishes that every location has significance and that geographic literacy is essential for modern citizenship.</p>
                                </div>
                                
                                <div class="next-case-preview">
                                    <h5>🔮 Preview of Next Case:</h5>
                                    <p><em>"Excellent work, detectives. But the globe thief was just the beginning. We've received reports of break-ins at geographic survey offices worldwide. Someone is collecting topographic data about mountain ranges. Your next case: Mountains of Mystery..."</em></p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                            <h4>📚 Module 1 Integration: A Geographer's World</h4>
                            <div class="integration-connections">
                                <div class="connection-item">
                                    <h5>Geographic Tools Application</h5>
                                    <p>Students experience authentic use of coordinates, compass directions, and spatial analysis in problem-solving context</p>
                                </div>
                                <div class="connection-item">
                                    <h5>Five Themes of Geography</h5>
                                    <p>Location (coordinates), Place (crime scene characteristics), Human-Environment Interaction (security measures), Movement (escape routes), Region (New York Harbor area)</p>
                                </div>
                                <div class="connection-item">
                                    <h5>Geographic Thinking Skills</h5>
                                    <p>Spatial analysis, pattern recognition, scale understanding, and geographic reasoning</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="case-outcome">
                            <h4>🏆 Case Resolution & Skills Earned</h4>
                            <div class="outcome-box success">
                                <p><strong>Resolution:</strong> Detective teams successfully use coordinate analysis to locate the thief at the Statue of Liberty area, recovering both the stolen globe and preventing access to the hidden treasure map network.</p>
                                <div class="skills-earned">
                                    <h5>Skills Earned:</h5>
                                    <span class="skill-badge">Coordinate Analysis</span>
                                    <span class="skill-badge">Evidence Documentation</span>
                                    <span class="skill-badge">Spatial Reasoning</span>
                                    <span class="skill-badge">Team Investigation</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- DAY 2: MOUNTAINS OF MYSTERY -->
                <div class="investigation-card day-2" data-difficulty="rookie">
                    <div class="case-header">
                        <span class="case-number">CASE #002</span>
                        <h3 class="case-title">Mountains of Mystery</h3>
                        <div class="case-badges">
                            <span class="difficulty-badge rookie">ROOKIE LEVEL</span>
                            <span class="duration-badge">20 MIN + MODULE 2</span>
                            <span class="module-badge">LANDFORMS & PHYSICAL</span>
                        </div>
                    </div>
                    
                    <div class="case-summary">
                        <p><strong>Mystery:</strong> An international mountain climbing expedition has discovered ancient artifacts, but their GPS coordinates don't match any known peaks. Someone is systematically manipulating topographic data to hide archaeological treasures.</p>
                    </div>
                    
                    <div class="case-details">
                        <div class="crime-scene-image">
                            <!-- IMAGE PLACEHOLDER FOR GENERATION -->
                            <div class="image-placeholder">
                                <div class="image-prompt">
                                    <strong>🎨 Mountain Crime Scene Image Prompt:</strong>
                                    <p>"High-altitude Himalayan research camp with scattered topographic maps showing conflicting elevation readings, broken GPS equipment, empty mounting holes where survey markers were removed, ancient pottery fragments partially buried in snow, dramatic mountain peaks in background. Professional investigation photography with evidence markers."</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="scenario-box">
                            <h4>🎭 Investigation Scenario</h4>
                            <p><strong>Setting:</strong> Mount Kanchenjunga Research Station, 5,200m elevation, Nepal-India border</p>
                            <p><strong>Crime:</strong> International topographic data manipulation and systematic archaeological artifact theft</p>
                            <p><strong>Time of Incident:</strong> Discovery made during routine elevation verification, Monday 6:30 AM local time</p>
                            <p><strong>Evidence:</strong> GPS elevation discrepancy (8,850m vs 8,200m), missing bronze survey markers, modified contour lines on official maps, ancient pottery fragments</p>
                            <p><strong>Stakes:</strong> International climbing safety protocols compromised, priceless archaeological heritage at risk</p>
                            <p><strong>Threat Level:</strong> MEDIUM (affects international expedition safety and cultural preservation)</p>
                        </div>
                        
                        <div class="objectives-grid">
                            <div class="learning-objectives">
                                <h4>🎯 Learning Objectives</h4>
                                <ul>
                                    <li>Interpret topographic maps and understand elevation representation</li>
                                    <li>Analyze landform formation processes and mountain building</li>
                                    <li>Understand the relationship between physical geography and human activities</li>
                                    <li>Apply elevation, relief, and slope concepts to solve real-world problems</li>
                                    <li>Practice systematic analysis of physical geographic evidence</li>
                                </ul>
                            </div>
                            
                            <div class="geographic-skills">
                                <h4>🗺️ Geographic Skills Practiced</h4>
                                <ul>
                                    <li>Topographic map interpretation and contour line analysis</li>
                                    <li>Elevation profile creation and cross-section reading</li>
                                    <li>Landform identification and mountain system classification</li>
                                    <li>Physical geography vocabulary in professional context</li>
                                    <li>Scale analysis and measurement in mountainous terrain</li>
                                    <li>GPS coordinate verification and altitude correlation</li>
                                </ul>
                            </div>
                        </div>
                        
                        <div class="evidence-analysis-detailed">
                            <h4>🔍 Comprehensive Evidence Analysis</h4>
                            <div class="evidence-grid">
                                <div class="evidence-item priority-high">
                                    <div class="evidence-image">
                                        <div class="image-placeholder small">
                                            <strong>🎨 Evidence Photo Prompt:</strong>
                                            <p>"Split-screen comparison showing two topographic maps side by side: left shows original contour lines with 8,850m peak elevation, right shows altered version with 8,200m elevation. Red circles highlight the 650-meter discrepancy. Professional cartographic photography with measurement tools."</p>
                                        </div>
                                    </div>
                                    <h5>🏔️ Critical Evidence: Elevation Data Manipulation</h5>
                                    <p><strong>Physical Description:</strong> Two versions of same topographic map showing 650-meter elevation discrepancy</p>
                                    <p><strong>Geographic Data:</strong> Official: 8,850m elevation vs. Altered: 8,200m elevation at same coordinates</p>
                                    <p><strong>Geography Specialist Analysis:</strong> Systematic lowering of peak elevations to make areas appear less challenging and less monitored</p>
                                    <p><strong>Investigation Questions:</strong> Who has access to official cartographic databases? Why target this specific elevation range?</p>
                                    <p><strong>Team Role Focus:</strong> Geography Specialist leads topographic analysis, Evidence Manager documents map alterations</p>
                                </div>
                                
                                <div class="evidence-item priority-high">
                                    <div class="evidence-image">
                                        <div class="image-placeholder small">
                                            <strong>🎨 Evidence Photo Prompt:</strong>
                                            <p>"Empty circular mounting holes in granite rock face where bronze survey markers were professionally removed, drill marks visible, metal fragments scattered nearby, mountain research equipment in background. Close-up evidence photography with scale ruler."</p>
                                        </div>
                                    </div>
                                    <h5>📍 Physical Evidence: Missing Survey Markers</h5>
                                    <p><strong>Physical Description:</strong> Three bronze benchmark survey markers systematically removed from granite mounting points</p>
                                    <p><strong>Geographic Significance:</strong> Official government reference points for international boundary and elevation verification</p>
                                    <p><strong>Evidence Manager Analysis:</strong> Professional removal using specialized tools, suggesting cartographic expertise</p>
                                    <p><strong>Investigation Questions:</strong> How did criminals know exact locations? What tools were used for granite drilling?</p>
                                    <p><strong>Team Role Focus:</strong> Evidence Manager analyzes removal techniques, Resource Tracker calculates replacement costs</p>
                                </div>
                                
                                <div class="evidence-item priority-medium">
                                    <div class="evidence-image">
                                        <div class="image-placeholder small">
                                            <strong>🎨 Evidence Photo Prompt:</strong>
                                            <p>"Ancient ceramic pottery fragments partially buried in snow and ice, intricate geometric patterns visible, expedition gloves carefully uncovering artifacts, mountain research camp tents in background. Archaeological discovery photography style."</p>
                                        </div>
                                    </div>
                                    <h5>🏺 Archaeological Evidence: Ancient Artifacts</h5>
                                    <p><strong>Physical Description:</strong> Ceramic pottery fragments with geometric patterns, estimated 800-1200 years old</p>
                                    <p><strong>Geographic Connection:</strong> Found at elevation inconsistent with historical settlement patterns</p>
                                    <p><strong>Case Chronicler Analysis:</strong> Artifacts suggest ancient trade routes through high-altitude passes</p>
                                    <p><strong>Investigation Questions:</strong> Why are valuable artifacts at this impossible elevation? Who else knows about this site?</p>
                                    <p><strong>Team Role Focus:</strong> Case Chronicler documents cultural significance, all roles collaborate on location analysis</p>
                                </div>
                                
                                <div class="evidence-item priority-medium">
                                    <div class="evidence-image">
                                        <div class="image-placeholder small">
                                            <strong>🎨 Evidence Photo Prompt:</strong>
                                            <p>"Damaged GPS unit with cracked screen showing error messages, ice crystals on display, backup compass pointing to magnetic north, altitude readings fluctuating wildly. Technical equipment failure documentation."</p>
                                        </div>
                                    </div>
                                    <h5>📡 Technical Evidence: GPS Equipment Malfunction</h5>
                                    <p><strong>Physical Description:</strong> Professional-grade GPS unit showing systematic elevation errors and coordinate drift</p>
                                    <p><strong>Technical Analysis:</strong> Equipment programmed with corrupted topographic database</p>
                                    <p><strong>Resource Tracker Analysis:</strong> GPS unit worth $3,000, damage appears intentional rather than environmental</p>
                                    <p><strong>Investigation Questions:</strong> Was equipment sabotaged before expedition? Who had access to pre-program coordinates?</p>
                                    <p><strong>Team Role Focus:</strong> Resource Tracker evaluates technical specifications, Geography Specialist analyzes coordinate errors</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="investigation-sequence">
                            <h4>🔬 Detailed Investigation Sequence</h4>
                            <div class="sequence-step">
                                <span class="step-number">1</span>
                                <div class="step-content">
                                    <h5>Emergency Briefing (4 minutes) - Slide 13</h5>
                                    <p><strong>Teacher Script:</strong> "Detectives, we have an international crisis. The Kanchenjunga Expedition has discovered that their GPS equipment is giving impossible readings - mountains that should be nearly 9,000 meters high are showing as only 8,200 meters. But that's not the strangest part. They've found ancient pottery at an elevation where no human settlement should be possible. Someone is manipulating our most basic geographic data, and lives depend on accurate information."</p>
                                    <p><strong>Atmosphere:</strong> Urgent international emergency, emphasize safety implications</p>
                                    <p><strong>Team Response:</strong> All roles activate mountain terrain analysis protocols</p>
                                </div>
                            </div>
                            
                            <div class="sequence-step">
                                <span class="step-number">2</span>
                                <div class="step-content">
                                    <h5>Topographic Evidence Presentation (8 minutes) - Slides 14-16</h5>
                                    <p><strong>Evidence Manager:</strong> Documents all elevation discrepancies, organizes map comparison analysis, establishes timeline of when alterations occurred</p>
                                    <p><strong>Geography Specialist:</strong> Interprets contour lines, calculates true elevation using topographic analysis, identifies impossible geographic features</p>
                                    <p><strong>Resource Tracker:</strong> Evaluates costs of GPS replacement ($3,000), survey marker restoration ($1,500), expedition safety upgrades ($5,000)</p>
                                    <p><strong>Case Chronicler:</strong> Documents expedition timeline, records geographic anomalies, connects evidence to potential motives</p>
                                </div>
                            </div>
                            
                            <div class="sequence-step">
                                <span class="step-number">3</span>
                                <div class="step-content">
                                    <h5>Expert Testimony: Dr. Sarah Chen, International Cartographer (5 minutes) - Slide 17</h5>
                                    <div class="expert-interview">
                                        <div class="expert-image">
                                            <div class="image-placeholder small">
                                                <strong>🎨 Expert Photo Prompt:</strong>
                                                <p>"Professional cartographer in laboratory setting surrounded by topographic maps and computer screens showing elevation data, wearing expedition gear, concerned expression while pointing to map discrepancies, international credentials visible."</p>
                                            </div>
                                        </div>
                                        <div class="interview-content">
                                            <p><strong>Teacher as Dr. Chen:</strong> "What you're seeing is more dangerous than you realize. When climbers rely on elevation data that's off by 650 meters, they can't plan for oxygen needs, weather patterns, or emergency evacuation routes. At that altitude, these errors can be fatal. Whoever is doing this has access to international cartographic databases and sophisticated knowledge of mountain geography."</p>
                                            
                                            <h6>Available Follow-up Information (when teams ask):</h6>
                                            <ul>
                                                <li><em>"Who has access to change these maps?"</em> - "Only government survey agencies and international geographic organizations. This required high-level credentials."</li>
                                                <li><em>"Why would someone target this area?"</em> - "Ancient trade routes through high passes often contain valuable archaeological sites. Lower elevations mean less protection and monitoring."</li>
                                                <li><em>"How can climbers verify real elevations?"</em> - "Cross-reference multiple sources: satellite data, historical surveys, and physical landmarks like the survey markers that were removed."</li>
                                                <li><em>"What makes these artifacts significant?"</em> - "Pottery at this elevation suggests unknown ancient civilizations adapted to extreme high-altitude living - extremely valuable to archaeologists and black market collectors."</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="sequence-step">
                                <span class="step-number">4</span>
                                <div class="step-content">
                                    <h5>Team Mountain Analysis & Solution Development (5 minutes)</h5>
                                    <p><strong>Collaborative Process:</strong> Teams must integrate topographic analysis with archaeological evidence</p>
                                    <div class="team-activities">
                                        <div class="activity-box evidence-manager">
                                            <h6>Evidence Manager Tasks:</h6>
                                            <ul>
                                                <li>Create detailed elevation discrepancy documentation</li>
                                                <li>Establish timeline of map alterations and survey marker removal</li>
                                                <li>Connect physical evidence to GPS equipment sabotage</li>
                                                <li>Document chain of custody for archaeological artifacts</li>
                                            </ul>
                                        </div>
                                        <div class="activity-box geography-specialist">
                                            <h6>Geography Specialist Tasks:</h6>
                                            <ul>
                                                <li>Use contour line analysis to determine true peak elevations</li>
                                                <li>Explain how elevation affects human settlement patterns</li>
                                                <li>Identify geographic impossibilities in artifact placement</li>
                                                <li>Calculate slope and relief to verify climbing route safety</li>
                                            </ul>
                                        </div>
                                        <div class="activity-box resource-tracker">
                                            <h6>Resource Tracker Tasks:</h6>
                                            <ul>
                                                <li>Evaluate expedition equipment costs and safety upgrades needed</li>
                                                <li>Calculate archaeological site protection and monitoring expenses</li>
                                                <li>Assess international survey marker replacement costs</li>
                                                <li>Plan budget for enhanced GPS verification systems</li>
                                            </ul>
                                        </div>
                                        <div class="activity-box case-chronicler">
                                            <h6>Case Chronicler Tasks:</h6>
                                            <ul>
                                                <li>Document connections between elevation manipulation and artifact theft</li>
                                                <li>Record international implications and expedition safety protocols</li>
                                                <li>Create comprehensive case summary connecting all evidence</li>
                                                <li>Prepare team presentation of mountain investigation findings</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="sequence-step">
                                <span class="step-number">5</span>
                                <div class="step-content">
                                    <h5>Solution Presentation & International Response (3 minutes) - Slides 18-20</h5>
                                    <p><strong>Team Presentations:</strong> Each team presents their topographic analysis and archaeological connections</p>
                                    <p><strong>Solution Revealed:</strong> Criminal organization is systematically lowering reported elevations to make restricted archaeological sites appear more accessible to illegal artifact hunters, while removing official survey markers to eliminate verification methods.</p>
                                    <p><strong>Case Resolution:</strong> Teams successfully demonstrate that understanding physical geography is essential for protecting both human safety and cultural heritage in mountain environments.</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="module-integration">
                            <h4>📚 Module 2: Landforms & Physical Geography Connection</h4>
                            <div class="module-connection">
                                <p><strong>Seamless Integration:</strong> This case directly reinforces Module 2 content about landform formation, elevation systems, and the relationship between physical geography and human activities.</p>
                                
                                <div class="module-skills">
                                    <h5>Module Skills Reinforced:</h5>
                                    <ul>
                                        <li><strong>Topographic Map Reading:</strong> Students practice contour line interpretation in authentic problem-solving context</li>
                                        <li><strong>Elevation and Relief:</strong> Real-world application of elevation concepts with life-and-death implications</li>
                                        <li><strong>Mountain Formation:</strong> Understanding how tectonic processes create the landforms being investigated</li>
                                        <li><strong>Physical Geography Impact:</strong> How physical features influence human activities, from climbing to archaeology</li>
                                        <li><strong>Scale and Measurement:</strong> Practical use of elevation data and topographic scale in mountain environments</li>
                                    </ul>
                                </div>
                                
                                <div class="module-assessment">
                                    <h5>Assessment Integration:</h5>
                                    <p>Case investigation naturally assesses Module 2 learning objectives while students engage in authentic topographic analysis and problem-solving.</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="case-outcome">
                            <h4>🏆 Case Resolution & Physical Geography Mastery</h4>
                            <div class="outcome-box success">
                                <p><strong>Resolution:</strong> Teams successfully identify the connection between topographic data manipulation and archaeological artifact theft. The criminals were systematically lowering elevation data to make restricted high-altitude sites appear more accessible to illegal excavation, while removing survey markers to prevent verification.</p>
                                
                                <div class="skills-earned">
                                    <h5>Geographic Detective Skills Earned:</h5>
                                    <span class="skill-badge">Topographic Analysis</span>
                                    <span class="skill-badge">Elevation Verification</span>
                                    <span class="skill-badge">Mountain Geography</span>
                                    <span class="skill-badge">Physical Evidence Analysis</span>
                                    <span class="skill-badge">International Investigation</span>
                                </div>
                                
                                <div class="case-impact">
                                    <h5>Real-World Impact Understanding:</h5>
                                    <p>Students discover that physical geography knowledge isn't just academic - it's essential for international safety, cultural preservation, and protecting human life in extreme environments. Accurate topographic data can mean the difference between life and death for mountain climbers and the preservation of invaluable archaeological heritage.</p>
                                </div>
                                
                                <div class="next-case-preview">
                                    <h5>🔮 Preview of Next Case:</h5>
                                    <p><em>"Outstanding work, detectives. But the mountain case was just one piece of a larger puzzle. We've received reports of similar geographic data manipulation affecting weather patterns and storm tracking. Your next case: Climate Conspiracy - someone is altering meteorological data to hide the evidence of climate crimes..."</em></p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- DAY 3: INTERNATIONAL HERITAGE HEIST -->
                <div class="investigation-card day-3" data-difficulty="detective">
                    <div class="case-header">
                        <span class="case-number">CASE #003</span>
                        <h3 class="case-title">International Heritage Heist</h3>
                        <div class="case-badges">
                            <span class="difficulty-badge detective">DETECTIVE LEVEL</span>
                            <span class="duration-badge">25 MIN + MODULE 3</span>
                            <span class="module-badge">HUMAN GEOGRAPHY & CULTURE</span>
                        </div>
                    </div>
                    
                    <div class="case-summary">
                        <p><strong>Mystery:</strong> The International Heritage Museum has been robbed, but the thief only took specific cultural treasures from particular regions, showing deep knowledge of cultural geography and global heritage patterns. The stolen artifacts reveal an ancient trade network that could rewrite history.</p>
                    </div>
                    
                    <div class="case-details">
                        <div class="crime-scene-image">
                            <!-- IMAGE PLACEHOLDER FOR GENERATION -->
                            <div class="image-placeholder">
                                <div class="image-prompt">
                                    <strong>🎨 Museum Crime Scene Image Prompt:</strong>
                                    <p>"Elegant museum gallery with empty display cases showing dust outlines of missing artifacts, broken security glass, red laser security beams still active, world map on wall with pins removed from specific locations (Mesopotamia, Indus Valley, Egypt, Nile), scattered authentication documents. Professional museum security photography."</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="scenario-box">
                            <h4>🎭 Investigation Scenario</h4>
                            <p><strong>Setting:</strong> International Heritage Museum, Cultural Geography Wing, London</p>
                            <p><strong>Crime:</strong> Selective theft targeting cultural artifacts representing major civilization river valleys and ancient trade routes</p>
                            <p><strong>Time of Incident:</strong> Saturday, 2:45 AM during new moon (minimal street lighting)</p>
                            <p><strong>Evidence:</strong> Systematic theft from Mesopotamian, Egyptian, Indus Valley, and Chinese collections; missing trade route maps; authentication papers scattered; security system bypassed with professional codes</p>
                            <p><strong>Stakes:</strong> Stolen artifacts contain evidence of previously unknown ancient global trade network worth millions to historians and black market collectors</p>
                            <p><strong>Threat Level:</strong> HIGH (international cultural heritage crime, multiple countries involved)</p>
                        </div>
                        
                        <div class="objectives-grid">
                            <div class="learning-objectives">
                                <h4>🎯 Learning Objectives</h4>
                                <ul>
                                    <li>Analyze cultural geographic patterns in criminal evidence</li>
                                    <li>Understand how river valley civilizations shaped human geography</li>
                                    <li>Apply knowledge of cultural diffusion and trade routes to solve problems</li>
                                    <li>Demonstrate cultural sensitivity in international investigations</li>
                                    <li>Recognize connections between geography and cultural development</li>
                                </ul>
                            </div>
                            
                            <div class="geographic-skills">
                                <h4>🗺️ Geographic Skills Practiced</h4>
                                <ul>
                                    <li>Cultural landscape analysis and interpretation</li>
                                    <li>Ancient civilization location identification and river valley significance</li>
                                    <li>Trade route mapping and cultural exchange analysis</li>
                                    <li>Cultural diffusion pattern recognition across continents</li>
                                    <li>Human geography vocabulary in investigative context</li>
                                    <li>Historical geography and temporal analysis skills</li>
                                </ul>
                            </div>
                        </div>
                        
                        <div class="evidence-analysis-detailed">
                            <h4>🔍 Comprehensive Evidence Analysis</h4>
                            <div class="evidence-grid">
                                <div class="evidence-item priority-high">
                                    <div class="evidence-image">
                                        <div class="image-placeholder small">
                                            <strong>🎨 Evidence Photo Prompt:</strong>
                                            <p>"Museum display case with perfect rectangular dust outlines showing exactly where four artifacts were positioned: Mesopotamian cuneiform tablet, Egyptian scarab seal, Indus Valley measuring weights, Chinese jade trade disk. Security placards still in place. Professional evidence photography with measurement scale."</p>
                                        </div>
                                    </div>
                                    <h5>🏺 Critical Evidence: Selective River Valley Theft</h5>
                                    <p><strong>Physical Description:</strong> Four empty display cases with dust outlines showing precise artifact removal</p>
                                    <p><strong>Geographic Pattern:</strong> All stolen items from major river valley civilizations: Tigris-Euphrates (Mesopotamia), Nile (Egypt), Indus (Pakistan/India), Yellow River (China)</p>
                                    <p><strong>Geography Specialist Analysis:</strong> Thief targeted artifacts proving ancient trade connections between distant river valley civilizations</p>
                                    <p><strong>Investigation Questions:</strong> Why these specific civilizations? What connects these river valleys geographically?</p>
                                    <p><strong>Team Role Focus:</strong> Geography Specialist maps civilization locations, Evidence Manager documents theft patterns</p>
                                </div>
                                
                                <div class="evidence-item priority-high">
                                    <div class="evidence-image">
                                        <div class="image-placeholder small">
                                            <strong>🎨 Evidence Photo Prompt:</strong>
                                            <p>"Scattered ancient trade route maps and shipping manifests on museum floor, some pages torn with specific routes highlighted in red ink, compass rose visible on medieval map, geographical coordinates written in margins. Document analysis photography style."</p>
                                        </div>
                                    </div>
                                    <h5>🗺️ Physical Evidence: Trade Route Documentation</h5>
                                    <p><strong>Physical Description:</strong> Ancient maps and shipping records scattered with specific trade routes highlighted</p>
                                    <p><strong>Geographic Significance:</strong> Maps show previously unknown connections between Silk Road, Trans-Saharan routes, and maritime Indian Ocean networks</p>
                                    <p><strong>Case Chronicler Analysis:</strong> Documents prove extensive cultural exchange between civilizations thought to be isolated</p>
                                    <p><strong>Investigation Questions:</strong> How did thief know which documents to target? Who has access to classified historical research?</p>
                                    <p><strong>Team Role Focus:</strong> Case Chronicler analyzes historical connections, Geography Specialist traces route patterns</p>
                                </div>
                                
                                <div class="evidence-item priority-medium">
                                    <div class="evidence-image">
                                        <div class="image-placeholder small">
                                            <strong>🎨 Evidence Photo Prompt:</strong>
                                            <p>"Museum security keypad with advanced electronic lockpicking device still attached, specialized archaeological tools scattered nearby, night vision goggles abandoned on floor, professional museum conservator gloves. High-tech burglary equipment documentation."</p>
                                        </div>
                                    </div>
                                    <h5>🔧 Technical Evidence: Professional Museum Equipment</h5>
                                    <p><strong>Physical Description:</strong> Sophisticated archaeological tools and museum-grade handling equipment left behind</p>
                                    <p><strong>Technical Analysis:</strong> Equipment worth $15,000, specialized for handling ancient artifacts without damage</p>
                                    <p><strong>Resource Tracker Analysis:</strong> Tools suggest inside knowledge of artifact handling protocols and museum security systems</p>
                                    <p><strong>Investigation Questions:</strong> Who has training with these specialized tools? Why leave expensive equipment behind?</p>
                                    <p><strong>Team Role Focus:</strong> Resource Tracker evaluates equipment costs and sourcing, Evidence Manager analyzes tool marks</p>
                                </div>
                                
                                <div class="evidence-item priority-medium">
                                    <div class="evidence-image">
                                        <div class="image-placeholder small">
                                            <strong>🎨 Evidence Photo Prompt:</strong>
                                            <p>"Close-up of museum visitor log showing entries in multiple languages (Arabic, Sanskrit, Mandarin, English), international authentication stamps, university credentials from archaeological departments worldwide. International access documentation."</p>
                                        </div>
                                    </div>
                                    <h5>📋 Administrative Evidence: International Access Logs</h5>
                                    <p><strong>Physical Description:</strong> Recent visitor logs showing multiple international researchers accessing the same collections</p>
                                    <p><strong>Pattern Analysis:</strong> Three researchers from different countries studied the same artifacts in the past month</p>
                                    <p><strong>Evidence Manager Analysis:</strong> Coordinated research effort suggests international collaboration or competition</p>
                                    <p><strong>Investigation Questions:</strong> Are researchers working together or competing? What discovery motivated this theft?</p>
                                    <p><strong>Team Role Focus:</strong> All roles collaborate to connect visitor patterns with missing artifacts</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="investigation-sequence">
                            <h4>🔬 Detailed Investigation Sequence</h4>
                            <div class="sequence-step">
                                <span class="step-number">1</span>
                                <div class="step-content">
                                    <h5>International Alert Briefing (5 minutes) - Slide 21</h5>
                                    <p><strong>Teacher Script:</strong> "Detectives, we have an international crisis that threatens to rewrite our understanding of ancient history. The International Heritage Museum has been robbed, but this wasn't a random theft. The criminal specifically targeted artifacts from four major river valley civilizations: Mesopotamia, Egypt, the Indus Valley, and ancient China. These artifacts contain evidence of trade connections that historians thought impossible. We need your cultural geography expertise to understand the pattern and recover these priceless pieces of human heritage before they disappear into the black market forever."</p>
                                    <p><strong>Atmosphere:</strong> International urgency, emphasize cultural heritage preservation</p>
                                    <p><strong>Team Response:</strong> All roles activate cultural geography analysis protocols</p>
                                </div>
                            </div>
                            
                            <div class="sequence-step">
                                <span class="step-number">2</span>
                                <div class="step-content">
                                    <h5>Cultural Evidence Presentation & Pattern Analysis (10 minutes) - Slides 22-25</h5>
                                    <p><strong>Evidence Manager:</strong> Documents theft patterns across cultural collections, organizes international artifact inventory, establishes timeline of museum access</p>
                                    <p><strong>Geography Specialist:</strong> Maps locations of missing civilizations, analyzes river valley patterns, identifies possible trade route connections between cultures</p>
                                    <p><strong>Resource Tracker:</strong> Evaluates artifact values (Mesopotamian tablet: $2M, Egyptian scarab: $1.5M, Indus weights: $800K, Chinese jade: $1.2M), calculates international recovery costs</p>
                                    <p><strong>Case Chronicler:</strong> Researches historical connections between civilizations, documents cultural diffusion evidence, records international implications</p>
                                </div>
                            </div>
                            
                            <div class="sequence-step">
                                <span class="step-number">3</span>
                                <div class="step-content">
                                    <h5>Expert Interview: Dr. Amara Okonkwo, UNESCO Cultural Geography Specialist (8 minutes) - Slide 26</h5>
                                    <div class="expert-interview">
                                        <div class="expert-image">
                                            <div class="image-placeholder small">
                                                <strong>🎨 Expert Photo Prompt:</strong>
                                                <p>"Distinguished UNESCO cultural geographer in professional attire standing before world map showing ancient trade routes, multiple degrees and cultural heritage awards visible on wall, concerned expression while holding photographs of missing artifacts. International authority presentation style."</p>
                                            </div>
                                        </div>
                                        <div class="interview-content">
                                            <p><strong>Teacher as Dr. Okonkwo:</strong> "What you're looking at represents one of the most significant archaeological discoveries of our time. These four artifacts, when brought together, prove that ancient civilizations were far more connected than we ever imagined. The Mesopotamian tablet contains shipping records, the Egyptian scarab shows foreign trade seals, the Indus weights match Chinese measurements, and the jade disk bears symbols from all four cultures. This theft isn't just about money - someone is trying to control the narrative of human cultural development."</p>
                                            
                                            <h6>Available Follow-up Information (when teams ask):</h6>
                                            <ul>
                                                <li><em>"What makes these river valleys so important?"</em> - "River valleys provided water, fertile soil, and transportation routes - the perfect conditions for early civilizations to develop and connect with each other."</li>
                                                <li><em>"How could ancient people travel such vast distances?"</em> - "Trade routes followed river systems, mountain passes, and coastal waters. Cultural diffusion happened along these paths over centuries."</li>
                                                <li><em>"Who would want to steal this evidence?"</em> - "Black market collectors, rival archaeologists, or nations wanting to claim historical precedence for their own cultures."</li>
                                                <li><em>"What geographic clues help us find the thief?"</em> - "Look for patterns in the trade routes - where they intersect, what modern cities exist there, and who has expertise in multiple ancient cultures."</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="sequence-step">
                                <span class="step-number">4</span>
                                <div class="step-content">
                                    <h5>Team Cultural Geography Investigation (7 minutes)</h5>
                                    <p><strong>Collaborative Process:</strong> Teams must connect cultural geography knowledge with criminal investigation</p>
                                    <div class="team-activities">
                                        <div class="activity-box evidence-manager">
                                            <h6>Evidence Manager Tasks:</h6>
                                            <ul>
                                                <li>Create detailed inventory of missing cultural artifacts and their connections</li>
                                                <li>Document timeline of international researcher visits and access patterns</li>
                                                <li>Analyze security system bypass techniques and required expertise</li>
                                                <li>Connect physical evidence to cultural geography knowledge requirements</li>
                                            </ul>
                                        </div>
                                        <div class="activity-box geography-specialist">
                                            <h6>Geography Specialist Tasks:</h6>
                                            <ul>
                                                <li>Map all four river valley civilizations and identify geographic connections</li>
                                                <li>Trace ancient trade routes between Mesopotamia, Egypt, Indus Valley, and China</li>
                                                <li>Analyze how geography enabled cultural diffusion between civilizations</li>
                                                <li>Identify modern locations where expertise in all four cultures would be found</li>
                                            </ul>
                                        </div>
                                        <div class="activity-box resource-tracker">
                                            <h6>Resource Tracker Tasks:</h6>
                                            <ul>
                                                <li>Calculate total value of stolen artifacts ($5.5M) and international recovery costs</li>
                                                <li>Evaluate specialized equipment costs and sourcing for archaeological tools</li>
                                                <li>Assess museum security upgrade needs and international cooperation expenses</li>
                                                <li>Plan budget for enhanced cultural heritage protection programs</li>
                                            </ul>
                                        </div>
                                        <div class="activity-box case-chronicler">
                                            <h6>Case Chronicler Tasks:</h6>
                                            <ul>
                                                <li>Research and document historical connections between river valley civilizations</li>
                                                <li>Record evidence of ancient trade networks and cultural exchange</li>
                                                <li>Connect modern archaeological research to missing artifact significance</li>
                                                <li>Prepare comprehensive case summary linking cultural geography to criminal investigation</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="sequence-step">
                                <span class="step-number">5</span>
                                <div class="step-content">
                                    <h5>Solution Presentation & Cultural Heritage Recovery (5 minutes) - Slides 27-28</h5>
                                    <p><strong>Team Presentations:</strong> Each team presents their cultural geography analysis and investigative conclusions</p>
                                    <p><strong>Solution Revealed:</strong> International team of researchers discovered the artifacts proved extensive ancient trade networks, but competing national interests led one member to steal the evidence to prevent other countries from claiming shared cultural heritage. Geographic analysis reveals the thief must be at a major university with departments covering all four civilizations.</p>
                                    <p><strong>Case Resolution:</strong> Teams successfully demonstrate that understanding cultural geography and river valley civilizations is essential for protecting international heritage and understanding human cultural development.</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="module-integration">
                            <h4>📚 Module 3: Human Geography & Culture Connection</h4>
                            <div class="module-connection">
                                <p><strong>Seamless Integration:</strong> This case directly connects to Module 3 content about human geography, cultural development, and the relationship between geography and civilization.</p>
                                
                                <div class="module-skills">
                                    <h5>Module Skills Reinforced:</h5>
                                    <ul>
                                        <li><strong>River Valley Civilizations:</strong> Students apply knowledge of how geography enabled early human settlements</li>
                                        <li><strong>Cultural Diffusion:</strong> Real-world investigation of how ideas, goods, and practices spread across geographic regions</li>
                                        <li><strong>Trade Route Geography:</strong> Understanding how physical geography creates pathways for cultural exchange</li>
                                        <li><strong>Human-Environment Interaction:</strong> How river valleys and geographic features influenced cultural development</li>
                                        <li><strong>Cultural Landscape Analysis:</strong> Reading human geographic patterns in artifacts and historical evidence</li>
                                    </ul>
                                </div>
                                
                                <div class="module-assessment">
                                    <h5>Assessment Integration:</h5>
                                    <p>Case investigation naturally assesses Module 3 learning objectives while students engage in authentic cultural geography analysis and international problem-solving.</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="case-outcome">
                            <h4>🏆 Case Resolution & Cultural Geography Mastery</h4>
                            <div class="outcome-box success">
                                <p><strong>Resolution:</strong> Teams successfully identify that the thief used deep cultural geography knowledge to target artifacts proving ancient global trade networks. The investigation reveals how understanding river valley civilizations, trade routes, and cultural diffusion is essential for protecting international heritage and understanding human development patterns.</p>
                                
                                <div class="skills-earned">
                                    <h5>Geographic Detective Skills Earned:</h5>
                                    <span class="skill-badge">Cultural Geography Analysis</span>
                                    <span class="skill-badge">River Valley Civilization Knowledge</span>
                                    <span class="skill-badge">Trade Route Mapping</span>
                                    <span class="skill-badge">Cultural Diffusion Investigation</span>
                                    <span class="skill-badge">International Heritage Protection</span>
                                </div>
                                
                                <div class="case-impact">
                                    <h5>Real-World Impact Understanding:</h5>
                                    <p>Students discover that cultural geography knowledge is essential for protecting human heritage, understanding how civilizations developed and connected, and addressing modern international conflicts over cultural ownership. Geography shapes not just where people live, but how cultures develop and spread across the world.</p>
                                </div>
                                
                                <div class="next-case-preview">
                                    <h5>🔮 Preview of Next Case:</h5>
                                    <p><em>"Excellent cultural detective work! But our investigation has uncovered something troubling. The stolen artifacts weren't just about history - they contain clues to modern climate patterns that someone is trying to hide. Your next case: Climate Conspiracy - environmental data is being manipulated to conceal the truth about global climate change impacts..."</em></p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                            </div>
                        </div>
                        
                        <div class="case-outcome">
                            <h4>🏆 Case Resolution & Cultural Skills</h4>
                            <div class="outcome-box success">
                                <p><strong>Resolution:</strong> Teams identify cultural diffusion patterns linking stolen artifacts to ancient trade and migration routes, preventing an international heritage forgery network.</p>
                                <div class="skills-earned">
                                    <h5>Cultural Skills Earned:</h5>
                                    <span class="skill-badge">Cultural Analysis</span>
                                    <span class="skill-badge">Migration Tracking</span>
                                    <span class="skill-badge">Trade Route Mapping</span>
                                    <span class="skill-badge">Heritage Investigation</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- DAY 4: CLIMATE CONSPIRACY -->
                <div class="investigation-card day-4" data-difficulty="detective">
                    <div class="case-header">
                        <span class="case-number">CASE #004</span>
                        <h3 class="case-title">Climate Conspiracy</h3>
                        <div class="case-badges">
                            <span class="difficulty-badge detective">DETECTIVE LEVEL</span>
                            <span class="duration-badge">30 MIN + MODULE 4</span>
                            <span class="module-badge">CLIMATE & WEATHER</span>
                        </div>
                    </div>
                    
                    <div class="case-summary">
                        <p><strong>Mystery:</strong> Climate research stations worldwide are reporting impossible weather data, and meteorological databases have been infiltrated. Someone is systematically altering climate records to hide evidence of environmental crimes and manipulate global climate policy decisions.</p>
                    </div>
                    
                    <div class="case-details">
                        <div class="crime-scene-image">
                            <!-- IMAGE PLACEHOLDER FOR GENERATION -->
                            <div class="image-placeholder">
                                <div class="image-prompt">
                                    <strong>🎨 Climate Research Crime Scene Image Prompt:</strong>
                                    <p>"Modern climate research facility with banks of computer servers showing altered data readings, weather monitoring equipment with tampering evidence, scattered printouts showing temperature graphs with suspicious data gaps, ice core samples with missing sections, global climate maps with data points highlighted in red. Scientific investigation photography with evidence markers."</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="scenario-box">
                            <h4>🎭 Investigation Scenario</h4>
                            <p><strong>Setting:</strong> International Climate Research Center, Arctic Station Alpha, Greenland</p>
                            <p><strong>Crime:</strong> Systematic climate data manipulation and environmental research sabotage affecting global policy</p>
                            <p><strong>Time of Incident:</strong> Data corruption discovered during routine verification, Tuesday 4:15 AM GMT</p>
                            <p><strong>Evidence:</strong> Temperature readings altered by 2°C, missing ice core data from critical time periods, weather satellite feeds hacked, climate model predictions manipulated</p>
                            <p><strong>Stakes:</strong> Corrupted climate data threatens international environmental agreements and global response to climate change</p>
                            <p><strong>Threat Level:</strong> MAXIMUM (affects global environmental policy and human survival)</p>
                        </div>
                        
                        <div class="objectives-grid">
                            <div class="learning-objectives">
                                <h4>🎯 Learning Objectives</h4>
                                <ul>
                                    <li>Understand climate vs. weather and long-term pattern analysis</li>
                                    <li>Analyze climate data and identify manipulation techniques</li>
                                    <li>Apply knowledge of global climate systems to solve problems</li>
                                    <li>Understand the geographic factors that influence climate patterns</li>
                                    <li>Recognize the importance of accurate climate data for decision-making</li>
                                </ul>
                            </div>
                            
                            <div class="geographic-skills">
                                <h4>🗺️ Geographic Skills Practiced</h4>
                                <ul>
                                    <li>Climate map interpretation and data analysis</li>
                                    <li>Weather pattern recognition and prediction</li>
                                    <li>Temperature and precipitation data verification</li>
                                    <li>Climate zone identification and characteristics</li>
                                    <li>Global climate system understanding and connections</li>
                                    <li>Scientific data collection and validation methods</li>
                                </ul>
                            </div>
                        </div>
                        
                        <div class="evidence-analysis-detailed">
                            <h4>🔍 Comprehensive Evidence Analysis</h4>
                            <div class="evidence-grid">
                                <div class="evidence-item priority-high">
                                    <div class="evidence-image">
                                        <div class="image-placeholder small">
                                            <strong>🎨 Evidence Photo Prompt:</strong>
                                            <p>"Computer screen showing temperature graph with obvious data manipulation: line graph showing artificial 2°C reduction in readings over past 20 years, red annotations highlighting altered sections, original data visible in faded overlay. Climate data forensics photography."</p>
                                        </div>
                                    </div>
                                    <h5>🌡️ Critical Evidence: Temperature Data Manipulation</h5>
                                    <p><strong>Physical Description:</strong> Climate database showing systematic 2°C reduction in temperature readings across multiple decades</p>
                                    <p><strong>Geographic Pattern:</strong> Alterations concentrated in Arctic regions, tropical zones, and areas with significant industrial activity</p>
                                    <p><strong>Geography Specialist Analysis:</strong> Data manipulation designed to hide warming trends and make climate change appear less severe</p>
                                    <p><strong>Investigation Questions:</strong> Who benefits from hiding climate warming? Which industries would gain from reduced climate action?</p>
                                    <p><strong>Team Role Focus:</strong> Geography Specialist analyzes climate patterns, Evidence Manager documents data tampering</p>
                                </div>
                                
                                <div class="evidence-item priority-high">
                                    <div class="evidence-image">
                                        <div class="image-placeholder small">
                                            <strong>🎨 Evidence Photo Prompt:</strong>
                                            <p>"Ice core sample storage facility with several transparent tubes showing gaps where sections have been removed, labeling showing critical time periods (1990-2010), refrigeration equipment with security locks broken. Scientific evidence tampering documentation."</p>
                                        </div>
                                    </div>
                                    <h5>🧊 Physical Evidence: Missing Ice Core Data</h5>
                                    <p><strong>Physical Description:</strong> Ice core samples with strategic sections removed from critical climate periods (1990-2010)</p>
                                    <p><strong>Scientific Significance:</strong> Ice cores provide 1,000+ year climate history, missing sections hide rapid warming evidence</p>
                                    <p><strong>Evidence Manager Analysis:</strong> Precise removal requires specialized equipment and knowledge of ice core interpretation</p>
                                    <p><strong>Investigation Questions:</strong> How did criminals know which time periods to target? Who has access to ice core storage?</p>
                                    <p><strong>Team Role Focus:</strong> Evidence Manager analyzes removal techniques, Geography Specialist interprets climate significance</p>
                                </div>
                                
                                <div class="evidence-item priority-medium">
                                    <div class="evidence-image">
                                        <div class="image-placeholder small">
                                            <strong>🎨 Evidence Photo Prompt:</strong>
                                            <p>"Satellite communication equipment with hacking devices attached, multiple computer screens showing weather satellite feeds being intercepted and modified in real-time, sophisticated electronic equipment scattered around workstation. Cybercrime investigation setup."</p>
                                        </div>
                                    </div>
                                    <h5>🛰️ Technical Evidence: Satellite Feed Manipulation</h5>
                                    <p><strong>Physical Description:</strong> Sophisticated hacking equipment intercepting and altering weather satellite transmissions</p>
                                    <p><strong>Technical Analysis:</strong> Real-time manipulation of precipitation, storm tracking, and temperature satellite data</p>
                                    <p><strong>Resource Tracker Analysis:</strong> Equipment worth $500,000+, requires significant funding and technical expertise</p>
                                    <p><strong>Investigation Questions:</strong> Who has resources for this scale of operation? What specific weather events are being hidden?</p>
                                    <p><strong>Team Role Focus:</strong> Resource Tracker evaluates costs and sourcing, Evidence Manager analyzes hacking methods</p>
                                </div>
                                
                                <div class="evidence-item priority-medium">
                                    <div class="evidence-image">
                                        <div class="image-placeholder small">
                                            <strong>🎨 Evidence Photo Prompt:</strong>
                                            <p>"Corporate documents scattered on desk showing energy company letterheads, financial statements with climate policy impact assessments, legal correspondence about carbon regulations, international treaty documents with highlighted sections. Corporate espionage evidence documentation."</p>
                                        </div>
                                    </div>
                                    <h5>📄 Corporate Evidence: Industry Connection Documents</h5>
                                    <p><strong>Physical Description:</strong> Financial documents linking climate data manipulation to fossil fuel industry profits</p>
                                    <p><strong>Economic Analysis:</strong> Documents show projected $50 billion losses if accurate climate data drives policy changes</p>
                                    <p><strong>Case Chronicler Analysis:</strong> Pattern suggests coordinated effort to delay environmental regulations and carbon restrictions</p>
                                    <p><strong>Investigation Questions:</strong> Which companies benefit most from climate policy delays? How does geographic location affect impact?</p>
                                    <p><strong>Team Role Focus:</strong> Case Chronicler analyzes corporate connections, all roles collaborate on geographic impact assessment</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="investigation-sequence">
                            <h4>🔬 Detailed Investigation Sequence</h4>
                            <div class="sequence-step">
                                <span class="step-number">1</span>
                                <div class="step-content">
                                    <h5>Global Climate Emergency Briefing (6 minutes) - Slide 29</h5>
                                    <p><strong>Teacher Script:</strong> "Detectives, this is our most serious case yet. Climate research stations worldwide have discovered that their data has been systematically altered. Temperature readings have been lowered by 2°C, critical ice core samples are missing, and weather satellites are being hacked in real-time. Someone is manipulating the very data that world leaders use to make decisions about climate policy. The future of our planet may depend on your ability to uncover this conspiracy and restore accurate climate information before international climate summits make decisions based on false data."</p>
                                    <p><strong>Atmosphere:</strong> Maximum urgency, global crisis implications, emphasize environmental justice</p>
                                    <p><strong>Team Response:</strong> All roles activate climate data analysis and environmental investigation protocols</p>
                                </div>
                            </div>
                            
                            <div class="sequence-step">
                                <span class="step-number">2</span>
                                <div class="step-content">
                                    <h5>Climate Data Evidence Analysis (12 minutes) - Slides 30-33</h5>
                                    <p><strong>Evidence Manager:</strong> Documents all data manipulation techniques, establishes timeline of alterations, organizes scientific evidence chain of custody</p>
                                    <p><strong>Geography Specialist:</strong> Interprets climate maps and data, identifies geographic patterns in manipulation, analyzes global climate system impacts</p>
                                    <p><strong>Resource Tracker:</strong> Evaluates costs of climate research equipment ($500K+ in hacking gear), calculates economic impact of delayed climate action</p>
                                    <p><strong>Case Chronicler:</strong> Researches corporate connections to climate denial, documents international policy implications, connects evidence to environmental justice</p>
                                </div>
                            </div>
                            
                            <div class="sequence-step">
                                <span class="step-number">3</span>
                                <div class="step-content">
                                    <h5>Expert Testimony: Dr. Elena Rodriguez, IPCC Climate Scientist (10 minutes) - Slide 34</h5>
                                    <div class="expert-interview">
                                        <div class="expert-image">
                                            <div class="image-placeholder small">
                                                <strong>🎨 Expert Photo Prompt:</strong>
                                                <p>"Renowned climate scientist in Arctic research station wearing cold-weather gear, standing before wall of climate monitoring equipment and global temperature maps, showing graphs of manipulated vs. real data, concerned expression emphasizing urgency. International scientific authority presentation."</p>
                                            </div>
                                        </div>
                                        <div class="interview-content">
                                            <p><strong>Teacher as Dr. Rodriguez:</strong> "What you've uncovered represents the most serious threat to climate science in history. When temperature data is artificially lowered by 2°C, it completely changes how we understand climate change. Ice cores are our memory of past climate - removing sections from 1990-2010 hides the period when warming accelerated most rapidly. This isn't just scientific fraud; it's an attack on humanity's ability to protect itself from climate disasters. The geographic patterns you see - Arctic manipulation, tropical zone alterations - these target the exact regions where climate change impacts are most severe."</p>
                                            
                                            <h6>Available Follow-up Information (when teams ask):</h6>
                                            <ul>
                                                <li><em>"How does geography affect climate patterns?"</em> - "Different regions respond differently to climate change. Arctic areas warm faster, tropical zones affect global weather patterns, and coastal areas face sea level rise."</li>
                                                <li><em>"Why target specific time periods in ice cores?"</em> - "1990-2010 shows the clearest evidence of human-caused rapid warming. Removing this evidence makes climate change appear more gradual and natural."</li>
                                                <li><em>"Who would have the resources for this operation?"</em> - "Only organizations with billions at stake - major fossil fuel corporations, governments dependent on carbon industries, or groups benefiting from delayed climate action."</li>
                                                <li><em>"What happens if climate policy is delayed?"</em> - "Every year of delay means more extreme weather, more geographic regions becoming uninhabitable, and much higher costs for adaptation and mitigation."</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="sequence-step">
                                <span class="step-number">4</span>
                                <div class="step-content">
                                    <h5>Team Climate Investigation & Data Restoration (8 minutes)</h5>
                                    <p><strong>Collaborative Process:</strong> Teams must combine climate science knowledge with investigative skills</p>
                                    <div class="team-activities">
                                        <div class="activity-box evidence-manager">
                                            <h6>Evidence Manager Tasks:</h6>
                                            <ul>
                                                <li>Document all forms of climate data manipulation and create forensic timeline</li>
                                                <li>Analyze hacking techniques and identify required expertise levels</li>
                                                <li>Connect physical evidence to corporate funding and organizational capabilities</li>
                                                <li>Establish scientific chain of custody for restored accurate climate data</li>
                                            </ul>
                                        </div>
                                        <div class="activity-box geography-specialist">
                                            <h6>Geography Specialist Tasks:</h6>
                                            <ul>
                                                <li>Interpret manipulated vs. accurate climate data and identify geographic patterns</li>
                                                <li>Analyze global climate systems and explain regional variation impacts</li>
                                                <li>Map areas most affected by climate manipulation and predict real consequences</li>
                                                <li>Use climate zone knowledge to verify authenticity of temperature and precipitation data</li>
                                            </ul>
                                        </div>
                                        <div class="activity-box resource-tracker">
                                            <h6>Resource Tracker Tasks:</h6>
                                            <ul>
                                                <li>Calculate costs of climate research equipment and evaluate funding sources for manipulation</li>
                                                <li>Assess economic impacts of accurate vs. manipulated climate policy decisions</li>
                                                <li>Evaluate costs of climate monitoring security upgrades and data verification systems</li>
                                                <li>Plan budget for enhanced international climate research protection and verification</li>
                                            </ul>
                                        </div>
                                        <div class="activity-box case-chronicler">
                                            <h6>Case Chronicler Tasks:</h6>
                                            <ul>
                                                <li>Research and document connections between climate denial funding and data manipulation</li>
                                                <li>Record international policy implications and environmental justice impacts</li>
                                                <li>Connect climate data accuracy to geographic vulnerability and human safety</li>
                                                <li>Prepare comprehensive case summary linking climate science to global security</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="sequence-step">
                                <span class="step-number">5</span>
                                <div class="step-content">
                                    <h5>Solution Presentation & Climate Data Restoration (4 minutes) - Slides 35-36</h5>
                                    <p><strong>Team Presentations:</strong> Each team presents their climate analysis and investigative conclusions</p>
                                    <p><strong>Solution Revealed:</strong> International fossil fuel consortium funded systematic climate data manipulation to delay carbon regulations and environmental policies. Geographic analysis reveals manipulation targeted the most climate-vulnerable regions to hide the severity of impacts on human populations.</p>
                                    <p><strong>Case Resolution:</strong> Teams successfully demonstrate that understanding climate science and geographic patterns is essential for protecting environmental data integrity and global climate policy decisions.</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="module-integration">
                            <h4>📚 Module 4: Climate & Weather Systems Connection</h4>
                            <div class="module-connection">
                                <p><strong>Seamless Integration:</strong> This case directly applies Module 4 content about climate vs. weather, global climate systems, and the geographic factors that influence climate patterns.</p>
                                
                                <div class="module-skills">
                                    <h5>Module Skills Reinforced:</h5>
                                    <ul>
                                        <li><strong>Climate vs. Weather Distinction:</strong> Students apply understanding of long-term climate patterns vs. short-term weather events</li>
                                        <li><strong>Climate Data Analysis:</strong> Real-world practice interpreting temperature, precipitation, and climate zone data</li>
                                        <li><strong>Global Climate Systems:</strong> Understanding how different geographic regions interact in global climate patterns</li>
                                        <li><strong>Geographic Climate Factors:</strong> How latitude, elevation, proximity to water, and landforms affect climate</li>
                                        <li><strong>Human Impact on Climate:</strong> Connecting human activities to climate change and geographic vulnerability</li>
                                    </ul>
                                </div>
                                
                                <div class="module-assessment">
                                    <h5>Assessment Integration:</h5>
                                    <p>Case investigation naturally assesses Module 4 learning objectives while students engage in authentic climate data analysis and environmental problem-solving.</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="case-outcome">
                            <h4>🏆 Case Resolution & Climate Science Mastery</h4>
                            <div class="outcome-box success">
                                <p><strong>Resolution:</strong> Teams successfully expose the climate data conspiracy and restore accurate climate information for global policy decisions. The investigation reveals how understanding climate science and geographic patterns is essential for protecting environmental data integrity and addressing climate change impacts on vulnerable populations.</p>
                                
                                <div class="skills-earned">
                                    <h5>Geographic Detective Skills Earned:</h5>
                                    <span class="skill-badge">Climate Data Analysis</span>
                                    <span class="skill-badge">Weather Pattern Investigation</span>
                                    <span class="skill-badge">Environmental Forensics</span>
                                    <span class="skill-badge">Climate Zone Expertise</span>
                                    <span class="skill-badge">Global Climate Systems</span>
                                </div>
                                
                                <div class="case-impact">
                                    <h5>Real-World Impact Understanding:</h5>
                                    <p>Students discover that climate science knowledge is essential for protecting environmental data, making informed policy decisions, and addressing climate change impacts. Geographic understanding of climate patterns helps identify vulnerable populations and regions most affected by climate change, connecting science to social justice and human rights.</p>
                                </div>
                                
                                <div class="next-case-preview">
                                    <h5>🔮 Preview of Next Case:</h5>
                                    <p><em>"Incredible work exposing the climate conspiracy! But your investigation has revealed that the climate data manipulation was connected to something even larger - international economic espionage. Your next case: Economic Atlas Conspiracy - someone is stealing global trade route data to manipulate international markets and supply chains..."</em></p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- DAY 5: ECONOMIC ATLAS CONSPIRACY -->
                <div class="investigation-card day-5" data-difficulty="specialist">
                    <div class="case-header">
                        <span class="case-number">CASE #005</span>
                        <h3 class="case-title">Economic Atlas Conspiracy</h3>
                        <div class="case-badges">
                            <span class="difficulty-badge specialist">SPECIALIST LEVEL</span>
                            <span class="duration-badge">35 MIN + MODULE 5</span>
                            <span class="module-badge">ECONOMIC GEOGRAPHY</span>
                        </div>
                    </div>
                    
                    <div class="case-summary">
                        <p><strong>Mystery:</strong> Following the climate data conspiracy, criminals have escalated to stealing economic maps showing global trade routes, resource distribution, and chokepoints. They're planning to disrupt supply chains for massive profit through coordinated economic espionage and market manipulation.</p>
                    </div>
                    
                    <div class="case-details">
                        <div class="crime-scene-image">
                            <!-- IMAGE PLACEHOLDER FOR GENERATION -->
                            <div class="image-placeholder">
                                <div class="image-prompt">
                                    <strong>🎨 Economic Research Crime Scene Image Prompt:</strong>
                                    <p>"High-security economic research facility with empty wall-mounted displays where global trade route maps were displayed, computer terminals showing hacked shipping databases, scattered commodity price charts, maritime chokepoint maps with red strategic markers, energy pipeline diagrams. Financial intelligence investigation photography with security breach evidence."</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="scenario-box">
                            <h4>🎭 Investigation Scenario</h4>
                            <p><strong>Setting:</strong> Global Economic Research Institute, Trade Intelligence Division, Singapore</p>
                            <p><strong>Crime:</strong> Systematic theft of classified economic geographic data and international trade route intelligence</p>
                            <p><strong>Time of Incident:</strong> Security breach detected during market opening hours, Wednesday 9:30 AM local time</p>
                            <p><strong>Evidence:</strong> Missing maritime chokepoint maps, stolen energy pipeline routes, hacked agricultural trade databases, compromised shipping lane monitoring systems</p>
                            <p><strong>Stakes:</strong> Global supply chain disruption could affect trillions in international commerce and create worldwide economic instability</p>
                            <p><strong>Threat Level:</strong> CRITICAL (affects global economic security and international trade stability)</p>
                        </div>
                        
                        <div class="objectives-grid">
                            <div class="learning-objectives">
                                <h4>🎯 Learning Objectives</h4>
                                <ul>
                                    <li>Understand global trade routes and their geographic significance</li>
                                    <li>Analyze economic geographic patterns and resource distribution</li>
                                    <li>Apply knowledge of supply chains and economic chokepoints</li>
                                    <li>Understand the relationship between geography and economic systems</li>
                                    <li>Recognize economic geography's role in global stability and security</li>
                                </ul>
                            </div>
                            
                            <div class="geographic-skills">
                                <h4>🗺️ Geographic Skills Practiced</h4>
                                <ul>
                                    <li>Trade route mapping and maritime chokepoint analysis</li>
                                    <li>Resource distribution patterns and commodity flow tracking</li>
                                    <li>Economic zone identification and development level analysis</li>
                                    <li>Supply chain geography and logistics network understanding</li>
                                    <li>Economic geography vocabulary in professional intelligence context</li>
                                    <li>Global financial center location and connectivity analysis</li>
                                </ul>
                            </div>
                        </div>
                        
                        <div class="evidence-analysis-detailed">
                            <h4>🔍 Comprehensive Evidence Analysis</h4>
                            <div class="evidence-grid">
                                <div class="evidence-item priority-high">
                                    <div class="evidence-image">
                                        <div class="image-placeholder small">
                                            <strong>🎨 Evidence Photo Prompt:</strong>
                                            <p>"Large wall display showing missing maps with dust outlines of removed sections: Suez Canal, Panama Canal, Strait of Hormuz, Strait of Malacca highlighted as critical chokepoints. Security mounting hardware still visible, red pins marking strategic locations. Maritime intelligence photography."</p>
                                        </div>
                                    </div>
                                    <h5>🌊 Critical Evidence: Maritime Chokepoint Intelligence</h5>
                                    <p><strong>Physical Description:</strong> Strategic maps of global maritime chokepoints systematically removed from security displays</p>
                                    <p><strong>Economic Significance:</strong> Suez Canal (12% of global trade), Panama Canal (6% of global trade), Strait of Hormuz (21% of global oil), Strait of Malacca (25% of all goods)</p>
                                    <p><strong>Geography Specialist Analysis:</strong> Thieves targeted exact locations where disruption would cause maximum global economic impact</p>
                                    <p><strong>Investigation Questions:</strong> Which chokepoint would be targeted first? How would disruption cascade through global supply chains?</p>
                                    <p><strong>Team Role Focus:</strong> Geography Specialist analyzes chokepoint strategic value, Evidence Manager documents theft patterns</p>
                                </div>
                                
                                <div class="evidence-item priority-high">
                                    <div class="evidence-image">
                                        <div class="image-placeholder small">
                                            <strong>🎨 Evidence Photo Prompt:</strong>
                                            <p>"Computer screens showing hacked shipping databases with live cargo tracking data, commodity price manipulation algorithms running, real-time supply chain monitoring with red alert indicators, multiple international shipping company logos. Financial cybercrime evidence documentation."</p>
                                        </div>
                                    </div>
                                    <h5>🚢 Digital Evidence: Global Shipping Database Infiltration</h5>
                                    <p><strong>Technical Description:</strong> Real-time access to international shipping movements, cargo manifests, and supply chain vulnerabilities</p>
                                    <p><strong>Economic Analysis:</strong> Database contains scheduling for $2 trillion in annual global trade movements</p>
                                    <p><strong>Resource Tracker Analysis:</strong> Coordinated attack required $50M+ in sophisticated hacking infrastructure and inside intelligence</p>
                                    <p><strong>Investigation Questions:</strong> How many organizations working together? What specific commodities are being targeted?</p>
                                    <p><strong>Team Role Focus:</strong> Resource Tracker evaluates attack sophistication costs, Evidence Manager analyzes hacking methods</p>
                                </div>
                                
                                <div class="evidence-item priority-medium">
                                    <div class="evidence-image">
                                        <div class="image-placeholder small">
                                            <strong>🎨 Evidence Photo Prompt:</strong>
                                            <p>"Scattered intelligence reports showing energy pipeline maps, oil and gas flow diagrams, renewable energy infrastructure blueprints, strategic petroleum reserve locations, power grid connection points. Energy security intelligence documentation."</p>
                                        </div>
                                    </div>
                                    <h5>⚡ Strategic Evidence: Energy Infrastructure Intelligence</h5>
                                    <p><strong>Physical Description:</strong> Comprehensive energy pipeline maps and power grid vulnerabilities documentation</p>
                                    <p><strong>Strategic Significance:</strong> Maps show oil pipelines (Russia-Europe), natural gas routes (Middle East-Asia), electricity grid connections across continents</p>
                                    <p><strong>Case Chronicler Analysis:</strong> Energy infrastructure targeting could create cascading failures across multiple economic sectors</p>
                                    <p><strong>Investigation Questions:</strong> Are criminals planning coordinated energy and shipping disruption? Which regions are most vulnerable?</p>
                                    <p><strong>Team Role Focus:</strong> Case Chronicler analyzes infrastructure interdependencies, Geography Specialist maps energy flow patterns</p>
                                </div>
                                
                                <div class="evidence-item priority-medium">
                                    <div class="evidence-image">
                                        <div class="image-placeholder small">
                                            <strong>🎨 Evidence Photo Prompt:</strong>
                                            <p>"Financial trading floor setup with multiple screens showing commodity futures, currency exchange rates, international market data, communication equipment for coordinated trading, sophisticated analysis software. Economic manipulation command center documentation."</p>
                                        </div>
                                    </div>
                                    <h5>💰 Financial Evidence: Market Manipulation Infrastructure</h5>
                                    <p><strong>Technical Description:</strong> Professional trading setup designed for coordinated market manipulation during supply disruptions</p>
                                    <p><strong>Financial Analysis:</strong> Equipment capable of executing billions in trades across multiple commodity and currency markets simultaneously</p>
                                    <p><strong>Resource Tracker Analysis:</strong> Trading infrastructure worth $25M+, requires institutional-level access and capital</p>
                                    <p><strong>Investigation Questions:</strong> Which financial institutions have this capability? How much profit from coordinated disruption?</p>
                                    <p><strong>Team Role Focus:</strong> All roles collaborate to connect geographic disruption with financial exploitation patterns</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="investigation-sequence">
                            <h4>🔬 Detailed Investigation Sequence</h4>
                            <div class="sequence-step">
                                <span class="step-number">1</span>
                                <div class="step-content">
                                    <h5>Global Economic Security Alert (7 minutes) - Slide 37</h5>
                                    <p><strong>Teacher Script:</strong> "Detectives, the climate conspiracy was just the beginning. We now have evidence of an unprecedented economic attack. Criminals have stolen classified intelligence on every major global trade route, maritime chokepoint, and energy pipeline. They have real-time access to shipping databases controlling $2 trillion in annual trade. The Suez Canal, Panama Canal, Strait of Hormuz - every critical point where global commerce could be disrupted. This isn't just theft; it's preparation for economic warfare that could affect every person on Earth through supply shortages, energy crises, and financial chaos."</p>
                                    <p><strong>Atmosphere:</strong> Maximum urgency, global economic security crisis, emphasize international cooperation</p>
                                    <p><strong>Team Response:</strong> All roles activate economic geography analysis and supply chain investigation protocols</p>
                                </div>
                            </div>
                            
                            <div class="sequence-step">
                                <span class="step-number">2</span>
                                <div class="step-content">
                                    <h5>Economic Intelligence Evidence Analysis (15 minutes) - Slides 38-42</h5>
                                    <p><strong>Evidence Manager:</strong> Documents all forms of economic data theft, establishes timeline of intelligence gathering, organizes supply chain vulnerability assessment</p>
                                    <p><strong>Geography Specialist:</strong> Maps global trade routes and chokepoints, analyzes geographic vulnerabilities in supply chains, identifies critical resource flow patterns</p>
                                    <p><strong>Resource Tracker:</strong> Calculates potential economic impact of supply disruptions ($500B+ daily global trade), evaluates attack infrastructure costs and funding sources</p>
                                    <p><strong>Case Chronicler:</strong> Researches connections between economic disruption and geopolitical instability, documents international cooperation requirements</p>
                                </div>
                            </div>
                            
                            <div class="sequence-step">
                                <span class="step-number">3</span>
                                <div class="step-content">
                                    <h5>Expert Interview: Admiral Sarah Mitchell, Maritime Security Specialist (10 minutes) - Slide 43</h5>
                                    <div class="expert-interview">
                                        <div class="expert-image">
                                            <div class="image-placeholder small">
                                                <strong>🎨 Expert Photo Prompt:</strong>
                                                <p>"Distinguished naval security expert in formal uniform standing before global maritime route display, pointing to chokepoint locations on world map, serious expression emphasizing security implications, maritime security credentials and international cooperation awards visible. Military intelligence authority presentation."</p>
                                            </div>
                                        </div>
                                        <div class="interview-content">
                                            <p><strong>Teacher as Admiral Mitchell:</strong> "What you're looking at represents the most sophisticated economic attack in history. These maritime chokepoints aren't just shipping lanes - they're the arteries of global civilization. If someone blocks the Suez Canal, shipping costs triple overnight. Disrupt the Strait of Hormuz, and global oil prices double. The geographic locations matter because alternatives are limited - ships can't just take different routes without adding weeks and massive costs. Your economic geography knowledge is essential to predict which chokepoints they'll target and when."</p>
                                            
                                            <h6>Available Follow-up Information (when teams ask):</h6>
                                            <ul>
                                                <li><em>"Why are these geographic locations so critical?"</em> - "Geography creates natural bottlenecks. Narrow straits, canals, and passages concentrate global trade into predictable routes that can be easily disrupted."</li>
                                                <li><em>"How would supply chain disruption affect daily life?"</em> - "Everything from food to fuel to medical supplies travels these routes. Disruption means shortages, price increases, and potential social instability worldwide."</li>
                                                <li><em>"Who has the capability for this scale of operation?"</em> - "Only state-level actors or major criminal organizations with billions in funding and sophisticated intelligence capabilities."</li>
                                                <li><em>"How can economic geography help predict their next move?"</em> - "Analyze which disruptions would create maximum economic impact with minimum effort. Geography shows us the most vulnerable points in global trade networks."</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="sequence-step">
                                <span class="step-number">4</span>
                                <div class="step-content">
                                    <h5>Team Economic Geography Investigation (10 minutes)</h5>
                                    <p><strong>Collaborative Process:</strong> Teams must integrate economic geography knowledge with intelligence analysis</p>
                                    <div class="team-activities">
                                        <div class="activity-box evidence-manager">
                                            <h6>Evidence Manager Tasks:</h6>
                                            <ul>
                                                <li>Document all economic intelligence theft and create comprehensive threat assessment timeline</li>
                                                <li>Analyze sophistication of attacks and identify required organizational capabilities</li>
                                                <li>Connect physical and digital evidence to create operational profile of criminal organization</li>
                                                <li>Establish chain of custody for economic intelligence and supply chain vulnerability data</li>
                                            </ul>
                                        </div>
                                        <div class="activity-box geography-specialist">
                                            <h6>Geography Specialist Tasks:</h6>
                                            <ul>
                                                <li>Map all critical maritime chokepoints and analyze strategic vulnerabilities</li>
                                                <li>Trace global supply chains and identify geographic points of maximum disruption potential</li>
                                                <li>Analyze resource distribution patterns and predict economic impact of disruptions</li>
                                                <li>Use economic geography knowledge to predict most likely targets and timing</li>
                                            </ul>
                                        </div>
                                        <div class="activity-box resource-tracker">
                                            <h6>Resource Tracker Tasks:</h6>
                                            <ul>
                                                <li>Calculate potential economic losses from supply chain disruptions ($500B+ daily global impact)</li>
                                                <li>Evaluate costs of attack infrastructure and identify funding sources ($75M+ operation)</li>
                                                <li>Assess international cooperation costs and enhanced security requirements</li>
                                                <li>Plan budget for global supply chain resilience and chokepoint protection</li>
                                            </ul>
                                        </div>
                                        <div class="activity-box case-chronicler">
                                            <h6>Case Chronicler Tasks:</h6>
                                            <ul>
                                                <li>Research connections between economic disruption and geopolitical destabilization</li>
                                                <li>Document international implications and multi-national cooperation requirements</li>
                                                <li>Connect economic geography vulnerabilities to global security and stability</li>
                                                <li>Prepare comprehensive case summary linking trade routes to international peace and security</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="sequence-step">
                                <span class="step-number">5</span>
                                <div class="step-content">
                                    <h5>Solution Presentation & Economic Security Response (3 minutes) - Slides 44-45</h5>
                                    <p><strong>Team Presentations:</strong> Each team presents their economic geography analysis and threat assessment</p>
                                    <p><strong>Solution Revealed:</strong> International syndicate planned coordinated disruption of multiple chokepoints during peak shipping season to manipulate commodity markets for massive profits. Economic geography analysis reveals Panama Canal as primary target due to limited alternative routes and maximum cascading impact.</p>
                                    <p><strong>Case Resolution:</strong> Teams successfully demonstrate that understanding economic geography and global trade systems is essential for predicting and preventing economic warfare and protecting international commerce.</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="module-integration">
                            <h4>📚 Module 5: Economic Geography & Global Trade Connection</h4>
                            <div class="module-connection">
                                <p><strong>Seamless Integration:</strong> This case directly applies Module 5 content about economic systems, global trade patterns, and the geographic factors that influence economic development and vulnerability.</p>
                                
                                <div class="module-skills">
                                    <h5>Module Skills Reinforced:</h5>
                                    <ul>
                                        <li><strong>Global Trade Routes:</strong> Students apply knowledge of how geography shapes international commerce and supply chains</li>
                                        <li><strong>Economic Chokepoints:</strong> Understanding how geographic features create vulnerabilities in global economic systems</li>
                                        <li><strong>Resource Distribution:</strong> Analyzing how natural resources and geography influence economic development and trade patterns</li>
                                        <li><strong>Supply Chain Geography:</strong> Understanding how goods move across the globe and depend on geographic features</li>
                                        <li><strong>Economic Development Levels:</strong> Connecting economic development to geographic advantages and trade access</li>
                                    </ul>
                                </div>
                                
                                <div class="module-assessment">
                                    <h5>Assessment Integration:</h5>
                                    <p>Case investigation naturally assesses Module 5 learning objectives while students engage in authentic economic geography analysis and international security problem-solving.</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="case-outcome">
                            <h4>🏆 Case Resolution & Economic Geography Mastery</h4>
                            <div class="outcome-box success">
                                <p><strong>Resolution:</strong> Teams successfully identify the economic geography conspiracy and prevent coordinated supply chain disruption. The investigation reveals how understanding global trade routes, chokepoints, and economic systems is essential for protecting international commerce and preventing economic warfare.</p>
                                
                                <div class="skills-earned">
                                    <h5>Geographic Detective Skills Earned:</h5>
                                    <span class="skill-badge">Global Trade Analysis</span>
                                    <span class="skill-badge">Maritime Chokepoint Expertise</span>
                                    <span class="skill-badge">Supply Chain Investigation</span>
                                    <span class="skill-badge">Economic Geography Mastery</span>
                                    <span class="skill-badge">International Commerce Security</span>
                                </div>
                                
                                <div class="case-impact">
                                    <h5>Real-World Impact Understanding:</h5>
                                    <p>Students discover that economic geography knowledge is essential for understanding global interdependence, predicting economic vulnerabilities, and protecting international stability. Geographic features like straits, canals, and trade routes shape not just commerce but international relations and global security.</p>
                                </div>
                                
                                <div class="next-case-preview">
                                    <h5>🔮 Preview of Next Case:</h5>
                                    <p><em>"Outstanding economic detective work! But your investigation has uncovered a disturbing pattern - the criminals are using political geographic boundaries to evade justice. Your next case: Jurisdictional Challenges - international criminals are exploiting border laws and diplomatic immunity to move stolen goods across multiple countries..."</em></p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- DAY 6: JURISDICTIONAL CHALLENGES -->
                <div class="investigation-card day-6" data-difficulty="specialist">
                    <div class="case-header">
                        <span class="case-number">CASE #006</span>
                        <h3 class="case-title">Jurisdictional Challenges</h3>
                        <div class="case-badges">
                            <span class="difficulty-badge specialist">SPECIALIST LEVEL</span>
                            <span class="duration-badge">40 MIN + MODULE 6</span>
                            <span class="module-badge">POLITICAL GEOGRAPHY</span>
                        </div>
                    </div>
                    
                    <div class="case-summary">
                        <p><strong>Mystery:</strong> Following the economic conspiracy, international criminals are exploiting political geographic boundaries and jurisdiction gaps to move stolen goods across borders. They're using diplomatic immunity, international law loopholes, and border complexities to evade justice while trafficking stolen cultural artifacts and economic intelligence.</p>
                    </div>
                    
                    <div class="case-details">
                        <div class="crime-scene-image">
                            <!-- IMAGE PLACEHOLDER FOR GENERATION -->
                            <div class="image-placeholder">
                                <div class="image-prompt">
                                    <strong>🎨 Border Crossing Crime Scene Image Prompt:</strong>
                                    <p>"International border checkpoint with multiple flags, abandoned diplomatic vehicle with diplomatic plates, scattered international passports from different countries, customs documents showing conflicting jurisdictional claims, GPS tracking devices found in diplomatic bags, border security cameras with tampering evidence. International law enforcement coordination photography."</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="scenario-box">
                            <h4>🎭 Investigation Scenario</h4>
                            <p><strong>Setting:</strong> International Border Region, Triple-Point Border where three countries meet (Belgium-Netherlands-Germany)</p>
                            <p><strong>Crime:</strong> Cross-border smuggling exploiting jurisdictional boundaries, diplomatic immunity abuse, and international law enforcement gaps</p>
                            <p><strong>Time of Incident:</strong> Multiple border crossings coordinated during shift changes, Thursday 11:45 PM local time</p>
                            <p><strong>Evidence:</strong> Diplomatic immunity claims, falsified border crossing documents, stolen artifacts transported in diplomatic pouches, international treaty violations</p>
                            <p><strong>Stakes:</strong> International cooperation essential to close jurisdiction gaps and prevent diplomatic incidents while recovering stolen global heritage</p>
                            <p><strong>Threat Level:</strong> MAXIMUM (involves international diplomatic relations and law enforcement sovereignty issues)</p>
                        </div>
                        
                        <div class="objectives-grid">
                            <div class="learning-objectives">
                                <h4>🎯 Learning Objectives</h4>
                                <ul>
                                    <li>Understand political geography and how borders affect law enforcement</li>
                                    <li>Analyze international law and diplomatic immunity concepts</li>
                                    <li>Apply knowledge of sovereignty and jurisdiction in problem-solving</li>
                                    <li>Understand the relationship between geography and government systems</li>
                                    <li>Recognize the importance of international cooperation in global security</li>
                                </ul>
                            </div>
                            
                            <div class="geographic-skills">
                                <h4>🗺️ Geographic Skills Practiced</h4>
                                <ul>
                                    <li>Political boundary analysis and border complexity understanding</li>
                                    <li>Sovereignty and jurisdiction mapping across international boundaries</li>
                                    <li>Government system analysis and law enforcement jurisdiction</li>
                                    <li>International treaty and agreement geographic applications</li>
                                    <li>Political geography vocabulary in law enforcement context</li>
                                    <li>Diplomatic relationship analysis and international cooperation protocols</li>
                                </ul>
                            </div>
                        </div>
                        
                        <div class="evidence-analysis-detailed">
                            <h4>🔍 Comprehensive Evidence Analysis</h4>
                            <div class="evidence-grid">
                                <div class="evidence-item priority-high">
                                    <div class="evidence-image">
                                        <div class="image-placeholder small">
                                            <strong>🎨 Evidence Photo Prompt:</strong>
                                            <p>"Official diplomatic vehicle abandoned at three-country border point with diplomatic license plates, diplomatic pouches scattered with stolen artifacts visible inside, maps showing border crossing patterns between multiple countries, GPS tracking devices with international routing data. International law enforcement evidence photography."</p>
                                        </div>
                                    </div>
                                    <h5>🚗 Critical Evidence: Diplomatic Immunity Abuse</h5>
                                    <p><strong>Physical Description:</strong> Diplomatic vehicle with immunity plates found abandoned with stolen artifacts in diplomatic pouches</p>
                                    <p><strong>Legal Significance:</strong> Diplomatic pouches cannot be searched by customs, creating perfect smuggling method</p>
                                    <p><strong>Geography Specialist Analysis:</strong> Route analysis shows systematic exploitation of border complexities and jurisdiction gaps</p>
                                    <p><strong>Investigation Questions:</strong> Which diplomatic mission provided immunity? How many countries' laws were violated?</p>
                                    <p><strong>Team Role Focus:</strong> Evidence Manager documents immunity violations, Geography Specialist maps border crossing patterns</p>
                                </div>
                                
                                <div class="evidence-item priority-high">
                                    <div class="evidence-image">
                                        <div class="image-placeholder small">
                                            <strong>🎨 Evidence Photo Prompt:</strong>
                                            <p>"Complex border intersection showing three different border signs and flag installations, surveillance cameras from multiple countries, overlapping jurisdiction markers, GPS coordinates showing precise border lines, customs checkpoints with different national uniforms. Political geography documentation photography."</p>
                                        </div>
                                    </div>
                                    <h5>🗺️ Geographic Evidence: Triple-Point Border Exploitation</h5>
                                    <p><strong>Physical Description:</strong> Border intersection where Belgium, Netherlands, and Germany meet, creating jurisdictional complexity</p>
                                    <p><strong>Political Geography Analysis:</strong> Each country has different laws, enforcement procedures, and international agreements</p>
                                    <p><strong>Case Chronicler Analysis:</strong> Criminals deliberately chose location where jurisdiction overlaps create enforcement gaps</p>
                                    <p><strong>Investigation Questions:</strong> Which country's laws apply at exact border intersection? How do countries coordinate enforcement?</p>
                                    <p><strong>Team Role Focus:</strong> Case Chronicler researches international agreements, Geography Specialist analyzes border geography</p>
                                </div>
                                
                                <div class="evidence-item priority-medium">
                                    <div class="evidence-image">
                                        <div class="image-placeholder small">
                                            <strong>🎨 Evidence Photo Prompt:</strong>
                                            <p>"Multiple passport documents from different countries scattered on ground, each showing different names but same photo, visa stamps from non-extradition countries, diplomatic credentials from questionable sources, international travel patterns circled in red. Document fraud investigation photography."</p>
                                        </div>
                                    </div>
                                    <h5>📋 Legal Evidence: Multiple Identity Documentation</h5>
                                    <p><strong>Physical Description:</strong> Multiple passports from different countries, all with same photo but different identities</p>
                                    <p><strong>International Law Analysis:</strong> Documents show strategic use of non-extradition treaties and diplomatic sanctuary countries</p>
                                    <p><strong>Resource Tracker Analysis:</strong> High-quality diplomatic documentation requires significant resources and inside connections</p>
                                    <p><strong>Investigation Questions:</strong> Which countries issued false documents? How extensive is the diplomatic corruption?</p>
                                    <p><strong>Team Role Focus:</strong> Resource Tracker evaluates document costs and sourcing, Evidence Manager analyzes authentication</p>
                                </div>
                                
                                <div class="evidence-item priority-medium">
                                    <div class="evidence-image">
                                        <div class="image-placeholder small">
                                            <strong>🎨 Evidence Photo Prompt:</strong>
                                            <p>"International law enforcement communication center showing multiple country agency logos, coordination charts between different police forces, jurisdiction maps with overlapping enforcement zones, international cooperation agreements, frustrated officers from multiple countries. Cross-border law enforcement documentation."</p>
                                        </div>
                                    </div>
                                    <h5>🤝 Institutional Evidence: International Cooperation Gaps</h5>
                                    <p><strong>Physical Description:</strong> Law enforcement coordination center showing communication breakdowns between multiple countries</p>
                                    <p><strong>Cooperation Analysis:</strong> Different legal systems, languages, and procedures create delays in international criminal pursuit</p>
                                    <p><strong>Evidence Manager Analysis:</strong> Criminals exploit time gaps and communication delays between international agencies</p>
                                    <p><strong>Investigation Questions:</strong> How can international cooperation be improved? Which agreements need strengthening?</p>
                                    <p><strong>Team Role Focus:</strong> All roles collaborate to identify cooperation improvements and jurisdiction solutions</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="investigation-sequence">
                            <h4>🔬 Detailed Investigation Sequence</h4>
                            <div class="sequence-step">
                                <span class="step-number">1</span>
                                <div class="step-content">
                                    <h5>International Law Enforcement Crisis Briefing (8 minutes) - Slide 46</h5>
                                    <p><strong>Teacher Script:</strong> "Detectives, we face our most complex challenge yet. The criminals behind the climate and economic conspiracies are now exploiting the very foundations of international law to evade justice. They're using diplomatic immunity to smuggle stolen artifacts, exploiting border complexities where three countries meet, and taking advantage of gaps in international cooperation. This isn't just about catching criminals anymore - it's about protecting the integrity of international law and diplomatic relations. One wrong move could create international incidents, but doing nothing allows criminals to exploit these systems forever."</p>
                                    <p><strong>Atmosphere:</strong> Diplomatic tension, international crisis, emphasize law enforcement cooperation</p>
                                    <p><strong>Team Response:</strong> All roles activate international law analysis and diplomatic investigation protocols</p>
                                </div>
                            </div>
                            
                            <div class="sequence-step">
                                <span class="step-number">2</span>
                                <div class="step-content">
                                    <h5>Political Geography Evidence Analysis (18 minutes) - Slides 47-52</h5>
                                    <p><strong>Evidence Manager:</strong> Documents all diplomatic immunity violations, organizes international evidence chain of custody, coordinates with multiple law enforcement agencies</p>
                                    <p><strong>Geography Specialist:</strong> Maps border complexities and jurisdiction overlaps, analyzes political geography of triple-point borders, identifies enforcement gaps</p>
                                    <p><strong>Resource Tracker:</strong> Calculates costs of international coordination ($2M+ for multi-country operation), evaluates diplomatic document fraud expenses</p>
                                    <p><strong>Case Chronicler:</strong> Researches international treaties and agreements, documents diplomatic relationship impacts, analyzes cooperation requirements</p>
                                </div>
                            </div>
                            
                            <div class="sequence-step">
                                <span class="step-number">3</span>
                                <div class="step-content">
                                    <h5>Expert Interview: Ambassador Dr. Maria Santos, International Law Specialist (12 minutes) - Slide 53</h5>
                                    <div class="expert-interview">
                                        <div class="expert-image">
                                            <div class="image-placeholder small">
                                                <strong>🎨 Expert Photo Prompt:</strong>
                                                <p>"Distinguished international law expert in formal diplomatic attire standing before world map showing international boundaries, multiple country flags in background, concerned expression while holding diplomatic documents, international law degrees and diplomatic service awards visible. International authority presentation style."</p>
                                            </div>
                                        </div>
                                        <div class="interview-content">
                                            <p><strong>Teacher as Ambassador Santos:</strong> "What you're witnessing represents the greatest challenge to international law enforcement in modern history. Diplomatic immunity exists to protect legitimate diplomats, but criminals are exploiting it to move stolen goods across borders. The triple-point border is particularly complex because each step literally crosses into different legal systems. Your understanding of political geography is essential - where exactly does one country's jurisdiction end and another's begin? How do we balance sovereignty with international cooperation?"</p>
                                            
                                            <h6>Available Follow-up Information (when teams ask):</h6>
                                            <ul>
                                                <li><em>"How does political geography create enforcement challenges?"</em> - "Borders create hard stops for law enforcement. A criminal can step one meter and suddenly be under completely different laws and protection."</li>
                                                <li><em>"Why is diplomatic immunity important, even if criminals abuse it?"</em> - "Without immunity, diplomats couldn't operate safely in hostile countries. But it requires trust and good faith that's being violated here."</li>
                                                <li><em>"How can countries cooperate better across borders?"</em> - "Faster communication, standardized procedures, and mutual legal assistance treaties. Geography doesn't have to create barriers to justice."</li>
                                                <li><em>"What happens when international law fails?"</em> - "Countries might act unilaterally, creating diplomatic incidents. Or criminals operate freely, undermining the entire international legal system."</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="sequence-step">
                                <span class="step-number">4</span>
                                <div class="step-content">
                                    <h5>Team International Cooperation Strategy Development (12 minutes)</h5>
                                    <p><strong>Collaborative Process:</strong> Teams must balance political geography knowledge with diplomatic sensitivity</p>
                                    <div class="team-activities">
                                        <div class="activity-box evidence-manager">
                                            <h6>Evidence Manager Tasks:</h6>
                                            <ul>
                                                <li>Document all diplomatic immunity violations while respecting international law procedures</li>
                                                <li>Coordinate evidence sharing across multiple international law enforcement agencies</li>
                                                <li>Establish legal chain of custody that meets all three countries' legal requirements</li>
                                                <li>Analyze document fraud techniques and identify diplomatic corruption patterns</li>
                                            </ul>
                                        </div>
                                        <div class="activity-box geography-specialist">
                                            <h6>Geography Specialist Tasks:</h6>
                                            <ul>
                                                <li>Map exact border lines and identify jurisdictional overlaps and gaps</li>
                                                <li>Analyze political geography of triple-point borders and enforcement complexities</li>
                                                <li>Identify geographic solutions for improved international law enforcement cooperation</li>
                                                <li>Use boundary knowledge to predict optimal coordination strategies between countries</li>
                                            </ul>
                                        </div>
                                        <div class="activity-box resource-tracker">
                                            <h6>Resource Tracker Tasks:</h6>
                                            <ul>
                                                <li>Calculate costs of international law enforcement coordination and diplomatic negotiations</li>
                                                <li>Evaluate expenses of diplomatic document fraud and security upgrade requirements</li>
                                                <li>Assess costs of enhanced border security and international cooperation systems</li>
                                                <li>Plan budget for strengthened international legal cooperation and border monitoring</li>
                                            </ul>
                                        </div>
                                        <div class="activity-box case-chronicler">
                                            <h6>Case Chronicler Tasks:</h6>
                                            <ul>
                                                <li>Research international treaties and identify gaps that criminals are exploiting</li>
                                                <li>Document diplomatic relationship impacts and international cooperation requirements</li>
                                                <li>Connect political geography challenges to international justice and security</li>
                                                <li>Prepare comprehensive case summary proposing international cooperation improvements</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="sequence-step">
                                <span class="step-number">5</span>
                                <div class="step-content">
                                    <h5>Solution Presentation & International Cooperation Protocol (5 minutes) - Slides 54-55</h5>
                                    <p><strong>Team Presentations:</strong> Each team presents their political geography analysis and international cooperation strategy</p>
                                    <p><strong>Solution Revealed:</strong> Criminals used corrupted diplomatic credentials from multiple countries to exploit triple-point border jurisdiction gaps. Teams develop enhanced international cooperation protocols using political geography knowledge to close enforcement gaps while respecting sovereignty.</p>
                                    <p><strong>Case Resolution:</strong> Teams successfully demonstrate that understanding political geography and international law is essential for global justice and preventing criminals from exploiting border complexities.</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="module-integration">
                            <h4>📚 Module 6: Political Geography & Government Systems Connection</h4>
                            <div class="module-connection">
                                <p><strong>Seamless Integration:</strong> This case directly applies Module 6 content about political boundaries, government systems, sovereignty, and international relations.</p>
                                
                                <div class="module-skills">
                                    <h5>Module Skills Reinforced:</h5>
                                    <ul>
                                        <li><strong>Political Boundaries:</strong> Students apply knowledge of how borders create jurisdictional complexities and enforcement challenges</li>
                                        <li><strong>Sovereignty and Jurisdiction:</strong> Understanding how political geography affects law enforcement and international cooperation</li>
                                        <li><strong>Government Systems:</strong> Analyzing how different political systems create cooperation challenges and opportunities</li>
                                        <li><strong>International Relations:</strong> Connecting political geography to diplomatic relations and international law</li>
                                        <li><strong>Border Geography:</strong> Understanding physical and political features that create border complexities</li>
                                    </ul>
                                </div>
                                
                                <div class="module-assessment">
                                    <h5>Assessment Integration:</h5>
                                    <p>Case investigation naturally assesses Module 6 learning objectives while students engage in authentic political geography analysis and international law problem-solving.</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="case-outcome">
                            <h4>🏆 Case Resolution & Political Geography Mastery</h4>
                            <div class="outcome-box success">
                                <p><strong>Resolution:</strong> Teams successfully navigate the complex jurisdictional challenges and develop international cooperation protocols to prevent criminals from exploiting political geographic boundaries. The investigation reveals how understanding political geography and international law is essential for global justice and security.</p>
                                
                                <div class="skills-earned">
                                    <h5>Geographic Detective Skills Earned:</h5>
                                    <span class="skill-badge">Political Boundary Analysis</span>
                                    <span class="skill-badge">International Law Application</span>
                                    <span class="skill-badge">Diplomatic Investigation</span>
                                    <span class="skill-badge">Cross-Border Cooperation</span>
                                    <span class="skill-badge">Sovereignty Understanding</span>
                                </div>
                                
                                <div class="case-impact">
                                    <h5>Real-World Impact Understanding:</h5>
                                    <p>Students discover that political geography knowledge is essential for international justice, preventing criminals from exploiting border complexities, and maintaining diplomatic relations while pursuing global security. Geography shapes not just where countries are, but how they can work together for justice.</p>
                                </div>
                                
                                <div class="next-case-preview">
                                    <h5>🔮 Preview of Next Case:</h5>
                                    <p><em>"Exceptional work on international cooperation! Your investigation has revealed that the criminals' network traces back to ancient trade routes and historical patterns. Your next case: Ancient Mesopotamian Mystery - the criminal organization is using knowledge of early civilizations and river valley settlements to hide stolen artifacts in locations connected to humanity's first geographic innovations..."</em></p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- DAY 7: ANCIENT MESOPOTAMIAN MYSTERY -->
                <div class="investigation-card day-7" data-difficulty="specialist">
                    <div class="case-header">
                        <span class="case-number">CASE #007</span>
                        <h3 class="case-title">Ancient Mesopotamian Mystery</h3>
                        <div class="case-badges">
                            <span class="difficulty-badge specialist">SPECIALIST LEVEL</span>
                            <span class="duration-badge">45 MIN + MODULE 7</span>
                            <span class="module-badge">FERTILE CRESCENT & EARLY CIVILIZATIONS</span>
                        </div>
                    </div>
                    
                    <div class="case-summary">
                        <p><strong>Mystery:</strong> Following the jurisdictional investigation, the criminal network has been traced to ancient Mesopotamian archaeological sites. Cuneiform tablets and early geographic documents showing humanity's first urban planning and irrigation systems have been stolen. These artifacts contain the original blueprints for organizing human civilization around geographic features.</p>
                    </div>
                    
                    <div class="case-details">
                        <div class="crime-scene-image">
                            <!-- IMAGE PLACEHOLDER FOR GENERATION -->
                            <div class="image-placeholder">
                                <div class="image-prompt">
                                    <strong>🎨 Archaeological Crime Scene Image Prompt:</strong>
                                    <p>"Ancient Mesopotamian excavation site with empty protective cases where cuneiform tablets were displayed, scattered clay fragments with wedge-shaped writing, irrigation system diagrams on papyrus, ancient city planning maps, ziggurat architectural drawings, professional archaeological tools abandoned. Desert archaeological dig site with evidence markers. Historical investigation photography."</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="scenario-box">
                            <h4>🎭 Investigation Scenario</h4>
                            <p><strong>Setting:</strong> International Archaeological Institute, Mesopotamian Studies Division, Baghdad, Iraq</p>
                            <p><strong>Crime:</strong> Systematic theft of ancient artifacts documenting humanity's first geographic innovations and urban planning systems</p>
                            <p><strong>Time of Incident:</strong> Security breach during archaeological conference, Friday 1:30 AM local time</p>
                            <p><strong>Evidence:</strong> Missing cuneiform tablets with early maps, stolen irrigation system plans, ancient trade route records, ziggurat construction documents with geographic positioning</p>
                            <p><strong>Stakes:</strong> Artifacts contain humanity's first written records of geographic knowledge, urban planning, and the relationship between civilization and geography</p>
                            <p><strong>Threat Level:</strong> CRITICAL (affects understanding of human civilization development and cultural heritage)</p>
                        </div>
                        
                        <div class="objectives-grid">
                            <div class="learning-objectives">
                                <h4>🎯 Learning Objectives</h4>
                                <ul>
                                    <li>Understand how river valley geography enabled early civilization development</li>
                                    <li>Analyze the relationship between geographic features and urban planning</li>
                                    <li>Apply knowledge of Mesopotamian innovations to solve geographic problems</li>
                                    <li>Understand how geography influenced early writing, law, and social organization</li>
                                    <li>Recognize the geographic foundations of human civilization</li>
                                </ul>
                            </div>
                            
                            <div class="geographic-skills">
                                <h4>🗺️ Geographic Skills Practiced</h4>
                                <ul>
                                    <li>River valley analysis and flood plain understanding</li>
                                    <li>Ancient irrigation system design and geographic optimization</li>
                                    <li>Early urban planning and geographic site selection</li>
                                    <li>Trade route development and geographic connectivity</li>
                                    <li>Historical geography and civilization location analysis</li>
                                    <li>Archaeological site interpretation and geographic context</li>
                                </ul>
                            </div>
                        </div>
                        
                        <div class="evidence-analysis-detailed">
                            <h4>🔍 Comprehensive Evidence Analysis</h4>
                            <div class="evidence-grid">
                                <div class="evidence-item priority-high">
                                    <div class="evidence-image">
                                        <div class="image-placeholder small">
                                            <strong>🎨 Evidence Photo Prompt:</strong>
                                            <p>"Ancient cuneiform tablet with wedge-shaped writing and primitive map showing Tigris and Euphrates rivers, city locations marked with geometric symbols, irrigation channels drawn between waterways, clay surface showing intricate geographic details. Archaeological artifact photography with measurement scale."</p>
                                        </div>
                                    </div>
                                    <h5>📜 Critical Evidence: Cuneiform Geographic Records</h5>
                                    <p><strong>Physical Description:</strong> Clay tablets with cuneiform writing documenting early river management and city planning</p>
                                    <p><strong>Historical Significance:</strong> World's first written records of geographic knowledge, urban planning, and irrigation engineering</p>
                                    <p><strong>Geography Specialist Analysis:</strong> Tablets show how Mesopotamians used geography to organize society around river flood cycles and fertile soil</p>
                                    <p><strong>Investigation Questions:</strong> Why target these specific geographic records? What modern applications do these ancient techniques have?</p>
                                    <p><strong>Team Role Focus:</strong> Geography Specialist interprets ancient geographic knowledge, Evidence Manager documents historical significance</p>
                                </div>
                                
                                <div class="evidence-item priority-high">
                                    <div class="evidence-image">
                                        <div class="image-placeholder small">
                                            <strong>🎨 Evidence Photo Prompt:</strong>
                                            <p>"Detailed irrigation system diagram on ancient papyrus showing canal networks, water distribution channels, flood control measures, geometric field divisions, seasonal water management cycles. Ancient engineering blueprint photography with technical annotations."</p>
                                        </div>
                                    </div>
                                    <h5>🌊 Engineering Evidence: Ancient Irrigation Blueprints</h5>
                                    <p><strong>Physical Description:</strong> Comprehensive irrigation system plans showing canal networks, water distribution, and flood management</p>
                                    <p><strong>Engineering Significance:</strong> Revolutionary geographic engineering that enabled agriculture in arid regions</p>
                                    <p><strong>Case Chronicler Analysis:</strong> Systems demonstrate sophisticated understanding of river behavior, seasonal flooding, and geographic water management</p>
                                    <p><strong>Investigation Questions:</strong> How do ancient techniques compare to modern water management? Why steal these specific engineering plans?</p>
                                    <p><strong>Team Role Focus:</strong> Case Chronicler analyzes engineering innovations, Geography Specialist explains geographic applications</p>
                                </div>
                                
                                <div class="evidence-item priority-medium">
                                    <div class="evidence-image">
                                        <div class="image-placeholder small">
                                            <strong>🎨 Evidence Photo Prompt:</strong>
                                            <p>"Ancient city planning map showing ziggurat placement, residential districts, market areas, defensive walls, river access points, trade route connections. Geometric urban design with geographic considerations clearly marked. Historical urban planning documentation."</p>
                                        </div>
                                    </div>
                                    <h5>🏛️ Urban Evidence: First City Planning Documents</h5>
                                    <p><strong>Physical Description:</strong> Urban planning maps showing strategic placement of buildings, districts, and infrastructure based on geographic features</p>
                                    <p><strong>Planning Significance:</strong> Humanity's first systematic approach to organizing urban spaces using geographic principles</p>
                                    <p><strong>Resource Tracker Analysis:</strong> Plans show economic optimization of geographic resources and strategic location advantages</p>
                                    <p><strong>Investigation Questions:</strong> What geographic principles guided ancient city planners? How do these influence modern urban design?</p>
                                    <p><strong>Team Role Focus:</strong> Resource Tracker analyzes economic geography applications, all roles study urban planning principles</p>
                                </div>
                                
                                <div class="evidence-item priority-medium">
                                    <div class="evidence-image">
                                        <div class="image-placeholder small">
                                            <strong>🎨 Evidence Photo Prompt:</strong>
                                            <p>"Ancient trade route scrolls showing paths between cities, geographic landmarks, river crossings, desert navigation markers, distance measurements in ancient units. Early commercial geography documentation with trade network analysis."</p>
                                        </div>
                                    </div>
                                    <h5>🛤️ Commercial Evidence: Early Trade Route Networks</h5>
                                    <p><strong>Physical Description:</strong> Trade route documentation showing paths between early cities, geographic landmarks, and navigation systems</p>
                                    <p><strong>Economic Geography Analysis:</strong> Records demonstrate how geography influenced early commerce and cultural exchange</p>
                                    <p><strong>Evidence Manager Analysis:</strong> Routes show sophisticated understanding of geographic advantages for transportation and trade</p>
                                    <p><strong>Investigation Questions:</strong> How did geography shape early economic systems? What trade patterns continue today?</p>
                                    <p><strong>Team Role Focus:</strong> All roles collaborate to connect ancient trade geography with modern economic patterns</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="investigation-sequence">
                            <h4>🔬 Detailed Investigation Sequence</h4>
                            <div class="sequence-step">
                                <span class="step-number">1</span>
                                <div class="step-content">
                                    <h5>Archaeological Heritage Crisis Briefing (9 minutes) - Slide 56</h5>
                                    <p><strong>Teacher Script:</strong> "Detectives, our investigation has led us to the very foundations of human civilization. The criminal network has stolen artifacts from Mesopotamia - the world's first cities, the birthplace of writing, and humanity's earliest geographic innovations. These aren't just ancient relics; they're the original blueprints for how humans learned to organize society around geographic features. The stolen cuneiform tablets contain the world's first written geographic knowledge, irrigation systems that revolutionized agriculture, and urban planning principles that influence cities today. Understanding how our ancestors used geography to build civilization is essential to solving this case and protecting our cultural heritage."</p>
                                    <p><strong>Atmosphere:</strong> Deep historical significance, cultural heritage preservation, emphasize human geographic innovation</p>
                                    <p><strong>Team Response:</strong> All roles activate historical geography analysis and ancient civilization investigation protocols</p>
                                </div>
                            </div>
                            
                            <div class="sequence-step">
                                <span class="step-number">2</span>
                                <div class="step-content">
                                    <h5>Ancient Geographic Evidence Analysis (20 minutes) - Slides 57-62</h5>
                                    <p><strong>Evidence Manager:</strong> Documents all ancient artifacts and their geographic significance, establishes historical timeline and cultural context</p>
                                    <p><strong>Geography Specialist:</strong> Interprets cuneiform geographic records, analyzes river valley advantages, explains irrigation system geography</p>
                                    <p><strong>Resource Tracker:</strong> Evaluates ancient economic geography applications, calculates modern value of stolen artifacts ($50M+ in cultural heritage)</p>
                                    <p><strong>Case Chronicler:</strong> Researches Mesopotamian civilization development, documents geographic innovations, connects ancient and modern applications</p>
                                </div>
                            </div>
                            
                            <div class="sequence-step">
                                <span class="step-number">3</span>
                                <div class="step-content">
                                    <h5>Expert Interview: Dr. Ahmad Hassan, Mesopotamian Geography Specialist (12 minutes) - Slide 63</h5>
                                    <div class="expert-interview">
                                        <div class="expert-image">
                                            <div class="image-placeholder small">
                                                <strong>🎨 Expert Photo Prompt:</strong>
                                                <p>"Distinguished archaeologist in field excavation gear standing before ancient Mesopotamian site reconstruction, pointing to irrigation channel models, surrounded by cuneiform tablets and ancient maps, serious expression emphasizing historical importance. Archaeological authority presentation with ancient civilization backdrop."</p>
                                            </div>
                                        </div>
                                        <div class="interview-content">
                                            <p><strong>Teacher as Dr. Hassan:</strong> "What you're looking at represents humanity's first conscious manipulation of geography for civilization. The Mesopotamians didn't just live in the land between the rivers - they transformed it. They understood that the Tigris and Euphrates brought both life-giving water and destructive floods, so they engineered the first irrigation systems to control geography rather than be controlled by it. These stolen documents show the birth of geographic thinking - how humans learned to see patterns in the landscape and use them to organize society."</p>
                                            
                                            <h6>Available Follow-up Information (when teams ask):</h6>
                                            <ul>
                                                <li><em>"Why was river valley geography so important for early civilization?"</em> - "Rivers provided water, fertile soil from floods, transportation, and natural boundaries. But managing flood cycles required organization and cooperation - leading to government and cities."</li>
                                                <li><em>"How did geography influence Mesopotamian innovations?"</em> - "Lack of natural resources forced them to trade, leading to writing for record-keeping. Flood management required engineering. Defense needs influenced city design."</li>
                                                <li><em>"What makes these artifacts so valuable to criminals?"</em> - "They prove that geographic knowledge is the foundation of civilization. Modern water rights, urban planning, and agricultural disputes all trace back to these principles."</li>
                                                <li><em>"How do ancient geographic principles apply today?"</em> - "Modern cities still follow river valleys, irrigation still feeds billions, and urban planning still balances geographic advantages with human needs."</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="sequence-step">
                                <span class="step-number">4</span>
                                <div class="step-content">
                                    <h5>Team Ancient Civilization Geographic Analysis (15 minutes)</h5>
                                    <p><strong>Collaborative Process:</strong> Teams must connect ancient geographic innovations with modern applications</p>
                                    <div class="team-activities">
                                        <div class="activity-box evidence-manager">
                                            <h6>Evidence Manager Tasks:</h6>
                                            <ul>
                                                <li>Document all stolen ancient artifacts and establish their historical and geographic significance</li>
                                                <li>Analyze preservation techniques and identify specialized knowledge required for handling ancient materials</li>
                                                <li>Connect ancient geographic innovations to modern applications and ongoing relevance</li>
                                                <li>Establish chain of custody for recovered artifacts and cultural heritage protection protocols</li>
                                            </ul>
                                        </div>
                                        <div class="activity-box geography-specialist">
                                            <h6>Geography Specialist Tasks:</h6>
                                            <ul>
                                                <li>Interpret ancient cuneiform geographic records and explain river valley civilization advantages</li>
                                                <li>Analyze Mesopotamian irrigation systems and their geographic engineering principles</li>
                                                <li>Map ancient trade routes and explain how geography influenced early commerce and cultural exchange</li>
                                                <li>Connect ancient urban planning principles to modern geographic city development patterns</li>
                                            </ul>
                                        </div>
                                        <div class="activity-box resource-tracker">
                                            <h6>Resource Tracker Tasks:</h6>
                                            <ul>
                                                <li>Calculate cultural heritage value of stolen artifacts and international recovery costs</li>
                                                <li>Evaluate ancient economic geography applications and their influence on modern systems</li>
                                                <li>Assess costs of archaeological site protection and international heritage preservation</li>
                                                <li>Plan budget for enhanced ancient civilization research security and cultural heritage protection</li>
                                            </ul>
                                        </div>
                                        <div class="activity-box case-chronicler">
                                            <h6>Case Chronicler Tasks:</h6>
                                            <ul>
                                                <li>Research Mesopotamian civilization development and document geographic innovation timeline</li>
                                                <li>Connect ancient geographic knowledge to modern urban planning and water management systems</li>
                                                <li>Document cultural heritage significance and international cooperation requirements for protection</li>
                                                <li>Prepare comprehensive case summary linking ancient geographic foundations to modern civilization</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="sequence-step">
                                <span class="step-number">5</span>
                                <div class="step-content">
                                    <h5>Solution Presentation & Cultural Heritage Recovery (4 minutes) - Slides 64-65</h5>
                                    <p><strong>Team Presentations:</strong> Each team presents their ancient civilization analysis and geographic innovation connections</p>
                                    <p><strong>Solution Revealed:</strong> Criminals targeted Mesopotamian artifacts because they contain the original geographic principles that all modern urban planning, water management, and agricultural systems are based on. Controlling these foundational documents could influence modern land and water rights disputes worldwide.</p>
                                    <p><strong>Case Resolution:</strong> Teams successfully demonstrate that understanding ancient geographic innovations is essential for protecting cultural heritage and recognizing the geographic foundations of human civilization.</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="module-integration">
                            <h4>📚 Module 7: Fertile Crescent & Early Civilizations Connection</h4>
                            <div class="module-connection">
                                <p><strong>Seamless Integration:</strong> This case directly applies Module 7 content about river valley civilizations, the Fertile Crescent, and how geographic features enabled the development of human civilization.</p>
                                
                                <div class="module-skills">
                                    <h5>Module Skills Reinforced:</h5>
                                    <ul>
                                        <li><strong>River Valley Advantages:</strong> Students apply knowledge of how Tigris and Euphrates rivers enabled Mesopotamian civilization</li>
                                        <li><strong>Irrigation and Agriculture:</strong> Understanding how geographic engineering revolutionized food production and population growth</li>
                                        <li><strong>Urban Planning Origins:</strong> Connecting ancient city design principles to modern urban geography</li>
                                        <li><strong>Trade Route Development:</strong> Analyzing how geography influenced early commercial networks and cultural exchange</li>
                                        <li><strong>Geographic Innovation Impact:</strong> Understanding how early geographic knowledge shaped all subsequent human development</li>
                                    </ul>
                                </div>
                                
                                <div class="module-assessment">
                                    <h5>Assessment Integration:</h5>
                                    <p>Case investigation naturally assesses Module 7 learning objectives while students engage in authentic historical geography analysis and cultural heritage protection.</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="case-outcome">
                            <h4>🏆 Case Resolution & Ancient Geographic Mastery</h4>
                            <div class="outcome-box success">
                                <p><strong>Resolution:</strong> Teams successfully recover the stolen Mesopotamian artifacts and expose the criminal plot to control foundational geographic knowledge. The investigation reveals how understanding ancient geographic innovations is essential for protecting cultural heritage and recognizing that modern civilization depends on geographic principles developed thousands of years ago.</p>
                                
                                <div class="skills-earned">
                                    <h5>Geographic Detective Skills Earned:</h5>
                                    <span class="skill-badge">Ancient Civilization Analysis</span>
                                    <span class="skill-badge">River Valley Geography</span>
                                    <span class="skill-badge">Historical Geographic Innovation</span>
                                    <span class="skill-badge">Cultural Heritage Protection</span>
                                    <span class="skill-badge">Archaeological Investigation</span>
                                </div>
                                
                                <div class="case-impact">
                                    <h5>Real-World Impact Understanding:</h5>
                                    <p>Students discover that ancient geographic knowledge forms the foundation of modern civilization. Understanding how early humans used geographic features to organize society helps explain modern urban planning, water management, agricultural systems, and international development patterns. Geography has always been central to human progress.</p>
                                </div>
                                
                                <div class="next-case-preview">
                                    <h5>🔮 Preview of Next Case:</h5>
                                    <p><em>"Remarkable work recovering humanity's first geographic innovations! Your investigation has revealed that the criminal network extends along ancient trade routes. Your next case: The Silk Road Scramble - criminals are using knowledge of historical trade networks to smuggle goods across modern borders, following the same paths that connected civilizations for centuries..."</em></p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- DAY 8: THE SILK ROAD SCRAMBLE -->
                <div class="investigation-card day-8" data-difficulty="specialist">
                    <div class="case-header">
                        <span class="case-number">CASE #008</span>
                        <h3 class="case-title">The Silk Road Scramble</h3>
                        <div class="case-badges">
                            <span class="difficulty-badge specialist">SPECIALIST LEVEL</span>
                            <span class="duration-badge">45 MIN + MODULE 8</span>
                            <span class="module-badge">HISTORICAL TRADE ROUTES & CULTURAL EXCHANGE</span>
                        </div>
                    </div>
                    
                    <div class="case-summary">
                        <p><strong>Mystery:</strong> The criminal network is now exploiting ancient trade route knowledge. Historic Silk Road navigation tools, caravan route maps, and trade network documentation have been stolen. The criminals are using thousand-year-old geographic knowledge to establish modern smuggling networks along the same paths that connected civilizations across Asia, Europe, and Africa.</p>
                    </div>
                    
                    <div class="case-details">
                        <div class="crime-scene-image">
                            <!-- IMAGE PLACEHOLDER FOR GENERATION -->
                            <div class="image-placeholder">
                                <div class="image-prompt">
                                    <strong>🎨 Historical Trade Crime Scene Image Prompt:</strong>
                                    <p>"Ancient trade route research facility with empty display cases where Silk Road artifacts were kept, scattered ancient maps showing caravan paths across Asia, traditional navigation instruments missing from stands, Chinese compass replicas, Persian route scrolls, camel caravan supply lists, spice trade documentation, cultural exchange records. International trade route research center showing sophisticated historical theft."</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="scenario-box">
                            <h4>🎭 Investigation Scenario</h4>
                            <p><strong>Setting:</strong> International Silk Road Heritage Institute, Beijing, China & Samarkand, Uzbekistan</p>
                            <p><strong>Crime:</strong> Systematic theft of historical trade route documentation and navigation tools used along ancient commercial networks</p>
                            <p><strong>Time of Incident:</strong> Multi-location simultaneous heists, Monday 3:15 AM in each time zone</p>
                            <p><strong>Evidence:</strong> Missing Chinese navigation compasses, stolen Persian route maps, vanished caravan supply records, absent cultural exchange documentation</p>
                            <p><strong>Stakes:</strong> Historic trade routes being exploited for modern smuggling operations across international borders</p>
                            <p><strong>Threat Level:</strong> EXTREME (international crime network using geographic history to evade modern security)</p>
                        </div>
                        
                        <div class="objectives-grid">
                            <div class="learning-objectives">
                                <h4>🎯 Learning Objectives</h4>
                                <ul>
                                    <li>Understand how geographic features shaped historical trade routes and cultural exchange</li>
                                    <li>Analyze the relationship between geography, commerce, and civilization development</li>
                                    <li>Apply knowledge of traditional navigation methods and route planning</li>
                                    <li>Understand how historic trade networks influence modern global connections</li>
                                    <li>Recognize geography's role in cultural diffusion and international relationships</li>
                                </ul>
                            </div>
                            
                            <div class="geographic-skills">
                                <h4>🗺️ Geographic Skills Practiced</h4>
                                <ul>
                                    <li>Historic trade route analysis and geographic corridor understanding</li>
                                    <li>Traditional navigation methods and landmark-based wayfinding</li>
                                    <li>Cultural geography and civilization interaction patterns</li>
                                    <li>Economic geography and commercial network development</li>
                                    <li>International geography and border region analysis</li>
                                    <li>Historical geography and temporal geographic change patterns</li>
                                </ul>
                            </div>
                        </div>
                        
                        <div class="evidence-analysis-detailed">
                            <h4>🔍 Comprehensive Evidence Analysis</h4>
                            <div class="evidence-grid">
                                <div class="evidence-item priority-high">
                                    <div class="evidence-image">
                                        <div class="image-placeholder small">
                                            <strong>🎨 Evidence Photo Prompt:</strong>
                                            <p>"Ancient Chinese magnetic compass with intricate bronze construction, traditional markings for directional navigation, feng shui geographic elements, surrounded by navigation charts showing mountain passes and desert routes. Traditional Asian navigation instrument photography with historical detail focus."</p>
                                        </div>
                                    </div>
                                    <h5>🧭 Navigation Evidence: Ancient Chinese Compass Technology</h5>
                                    <p><strong>Physical Description:</strong> Sophisticated magnetic navigation compass using natural magnetism for directional guidance across vast geographic distances</p>
                                    <p><strong>Innovation Significance:</strong> Revolutionary technology that enabled long-distance navigation and geographic exploration across unknown territories</p>
                                    <p><strong>Geography Specialist Analysis:</strong> Compass technology transformed geographic exploration by providing reliable direction regardless of weather or landmarks</p>
                                    <p><strong>Investigation Questions:</strong> How does traditional navigation compare to modern GPS? Why are ancient navigation methods still relevant for smuggling?</p>
                                    <p><strong>Team Role Focus:</strong> Geography Specialist explains navigation principles, Evidence Manager documents technological significance</p>
                                </div>
                                
                                <div class="evidence-item priority-high">
                                    <div class="evidence-image">
                                        <div class="image-placeholder small">
                                            <strong>🎨 Evidence Photo Prompt:</strong>
                                            <p>"Detailed Persian trade route manuscript showing paths across Central Asia, mountain passes marked with elevation indicators, oasis locations for caravan resupply, danger zones and safe passage markers, distance measurements in ancient units. Historic commercial geography documentation with intricate artistic details."</p>
                                        </div>
                                    </div>
                                    <h5>🛤️ Route Evidence: Persian Caravan Path Documentation</h5>
                                    <p><strong>Physical Description:</strong> Comprehensive route maps showing safe passages, supply stops, geographic hazards, and seasonal travel considerations across Central Asian terrain</p>
                                    <p><strong>Commercial Significance:</strong> Essential navigation tools for managing geographic challenges of long-distance trade across diverse landscapes</p>
                                    <p><strong>Case Chronicler Analysis:</strong> Routes demonstrate sophisticated understanding of geographic obstacles, seasonal changes, and resource management</p>
                                    <p><strong>Investigation Questions:</strong> How did geography determine trade route development? What modern applications do historic routes maintain?</p>
                                    <p><strong>Team Role Focus:</strong> Case Chronicler analyzes route planning, Geography Specialist explains terrain challenges</p>
                                </div>
                                
                                <div class="evidence-item priority-medium">
                                    <div class="evidence-image">
                                        <div class="image-placeholder small">
                                            <strong>🎨 Evidence Photo Prompt:</strong>
                                            <p>"Ancient trade ledgers showing goods exchanged between civilizations, silk from China, spices from India, precious metals from Persia, geographic origin markers, quantity records, cultural artifact exchange documentation. Historical commercial record with multicultural elements."</p>
                                        </div>
                                    </div>
                                    <h5>📜 Commercial Evidence: International Trade Exchange Records</h5>
                                    <p><strong>Physical Description:</strong> Detailed records of goods, materials, and cultural artifacts exchanged between civilizations along historic trade networks</p>
                                    <p><strong>Cultural Significance:</strong> Documentation of how geographic trade routes facilitated cultural exchange and civilization development</p>
                                    <p><strong>Resource Tracker Analysis:</strong> Records show economic value of geographic connectivity and commercial network development</p>
                                    <p><strong>Investigation Questions:</strong> How did trade routes spread culture and technology? What geographic factors made certain routes more valuable?</p>
                                    <p><strong>Team Role Focus:</strong> Resource Tracker analyzes economic patterns, all roles study cultural exchange impacts</p>
                                </div>
                                
                                <div class="evidence-item priority-medium">
                                    <div class="evidence-image">
                                        <div class="image-placeholder small">
                                            <strong>🎨 Evidence Photo Prompt:</strong>
                                            <p>"Cultural exchange documentation showing language evolution, religious idea spread, technological transfer, artistic influence patterns, geographic diffusion maps showing how ideas traveled along trade routes. Historical cultural geography analysis with visual connection patterns."</p>
                                        </div>
                                    </div>
                                    <h5>🌍 Cultural Evidence: Civilization Exchange Documentation</h5>
                                    <p><strong>Physical Description:</strong> Records showing how ideas, technologies, religions, and cultural practices spread along geographic trade networks</p>
                                    <p><strong>Geographic Cultural Analysis:</strong> Demonstrates how geographic connectivity enabled cultural diffusion and civilization advancement</p>
                                    <p><strong>Evidence Manager Analysis:</strong> Documents prove that geographic trade routes were pathways for all human progress and international understanding</p>
                                    <p><strong>Investigation Questions:</strong> How does geography influence cultural exchange? What role do trade routes play in modern globalization?</p>
                                    <p><strong>Team Role Focus:</strong> All roles collaborate to understand geographic influence on cultural development and modern connections</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="investigation-sequence">
                            <h4>🔬 Detailed Investigation Sequence</h4>
                            <div class="sequence-step">
                                <span class="step-number">1</span>
                                <div class="step-content">
                                    <h5>Historic Trade Route Crisis Briefing (9 minutes) - Slide 66</h5>
                                    <p><strong>Teacher Script:</strong> "Detectives, our investigation has revealed the criminal network's most sophisticated operation yet. They're exploiting the Silk Road - the ancient trade routes that connected East and West for over a thousand years. The stolen navigation tools and route maps aren't just historical artifacts; they're the blueprints for geographic corridors that still function today. Criminals are using ancient caravan paths, traditional navigation methods, and historic supply points to move illegal goods across modern borders. These routes crossed deserts, mountains, and political boundaries because they followed geographic logic that transcends time. Understanding how geography shaped historic trade is key to stopping this modern criminal network."</p>
                                    <p><strong>Atmosphere:</strong> International urgency, historical geography expertise, emphasize geographic continuity across time</p>
                                    <p><strong>Team Response:</strong> All roles activate historical trade route analysis and international smuggling investigation protocols</p>
                                </div>
                            </div>
                            
                            <div class="sequence-step">
                                <span class="step-number">2</span>
                                <div class="step-content">
                                    <h5>Historic Trade Route Evidence Analysis (20 minutes) - Slides 67-72</h5>
                                    <p><strong>Evidence Manager:</strong> Documents all stolen navigation tools and route documentation, establishes historic significance and modern criminal applications</p>
                                    <p><strong>Geography Specialist:</strong> Interprets ancient navigation methods, analyzes geographic route advantages, explains terrain challenges and seasonal considerations</p>
                                    <p><strong>Resource Tracker:</strong> Evaluates commercial value of historic trade networks, calculates modern smuggling potential and international security costs</p>
                                    <p><strong>Case Chronicler:</strong> Researches Silk Road development, documents cultural exchange impacts, connects historic patterns to modern globalization</p>
                                </div>
                            </div>
                            
                            <div class="sequence-step">
                                <span class="step-number">3</span>
                                <div class="step-content">
                                    <h5>Expert Interview: Dr. Li Wei, Silk Road Geographic Historian (12 minutes) - Slide 73</h5>
                                    <div class="expert-interview">
                                        <div class="expert-image">
                                            <div class="image-placeholder small">
                                                <strong>🎨 Expert Photo Prompt:</strong>
                                                <p>"Distinguished international trade route historian in traditional Central Asian setting with historic Silk Road maps displayed, pointing to geographic corridors across mountain ranges, surrounded by navigation instruments and cultural artifacts, serious expression emphasizing global connectivity. Historic trade route expertise presentation."</p>
                                            </div>
                                        </div>
                                        <div class="interview-content">
                                            <p><strong>Teacher as Dr. Li Wei:</strong> "The Silk Road wasn't just about silk - it was humanity's first global network, and it succeeded because it followed geographic logic. These routes existed because mountains, deserts, and rivers created natural corridors that are still the best paths today. Marco Polo, camel caravans, and modern highways all follow the same geographic principles. The criminals understand that ancient geography hasn't changed - the same passes that allowed medieval traders to avoid bandits can help modern criminals avoid border security."</p>
                                            
                                            <h6>Available Follow-up Information (when teams ask):</h6>
                                            <ul>
                                                <li><em>"Why did the Silk Road follow specific geographic routes?"</em> - "Mountains created natural corridors, oases provided water in deserts, river valleys offered protection and supplies. Geography determined every successful trade route."</li>
                                                <li><em>"How did geography enable cultural exchange along trade routes?"</em> - "Merchants carried more than goods - they shared languages, religions, technologies, and ideas. Geographic meeting points became cultural fusion centers."</li>
                                                <li><em>"What makes historic routes attractive to modern criminals?"</em> - "Same geographic advantages: remote locations, natural concealment, traditional supply points, and local knowledge gaps in modern security systems."</li>
                                                <li><em>"How do ancient navigation methods work without modern technology?"</em> - "Stars, landforms, seasonal patterns, and traditional knowledge provided reliable navigation across thousands of miles. Geography was the original GPS."</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="sequence-step">
                                <span class="step-number">4</span>
                                <div class="step-content">
                                    <h5>Team Historic Trade Route Geographic Analysis (15 minutes)</h5>
                                    <p><strong>Collaborative Process:</strong> Teams must connect historic trade geography with modern criminal network patterns</p>
                                    <div class="team-activities">
                                        <div class="activity-box evidence-manager">
                                            <h6>Evidence Manager Tasks:</h6>
                                            <ul>
                                                <li>Document all stolen navigation tools and establish their historic significance and modern criminal applications</li>
                                                <li>Analyze preservation methods and identify specialized knowledge required for using ancient navigation systems</li>
                                                <li>Connect historic trade route advantages to modern smuggling vulnerabilities and security gaps</li>
                                                <li>Establish international cooperation protocols for protecting cultural heritage and preventing criminal exploitation</li>
                                            </ul>
                                        </div>
                                        <div class="activity-box geography-specialist">
                                            <h6>Geography Specialist Tasks:</h6>
                                            <ul>
                                                <li>Interpret ancient navigation methods and explain geographic principles behind successful historic trade routes</li>
                                                <li>Analyze terrain advantages and seasonal considerations that made Silk Road routes optimal for long-distance travel</li>
                                                <li>Map modern applications of historic geographic corridors and identify ongoing strategic value</li>
                                                <li>Connect ancient geographic knowledge to modern transportation networks and global connectivity patterns</li>
                                            </ul>
                                        </div>
                                        <div class="activity-box resource-tracker">
                                            <h6>Resource Tracker Tasks:</h6>
                                            <ul>
                                                <li>Calculate cultural heritage value of stolen artifacts and international recovery operation costs</li>
                                                <li>Evaluate historic trade route economic impacts and assess modern commercial potential for criminal exploitation</li>
                                                <li>Assess costs of enhanced international security along historic route corridors and cultural heritage protection</li>
                                                <li>Plan budget for advanced route monitoring systems and international cooperation frameworks</li>
                                            </ul>
                                        </div>
                                        <div class="activity-box case-chronicler">
                                            <h6>Case Chronicler Tasks:</h6>
                                            <ul>
                                                <li>Research Silk Road development and document cultural exchange impacts and civilization advancement</li>
                                                <li>Connect historic trade patterns to modern globalization and international relationship development</li>
                                                <li>Document geographic continuity and analyze how ancient routes influence modern transportation and communication</li>
                                                <li>Prepare comprehensive case summary linking historic geographic wisdom to modern international security challenges</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="sequence-step">
                                <span class="step-number">5</span>
                                <div class="step-content">
                                    <h5>Solution Presentation & Historic Route Protection (4 minutes) - Slides 74-75</h5>
                                    <p><strong>Team Presentations:</strong> Each team presents their historic trade route analysis and modern criminal network connections</p>
                                    <p><strong>Solution Revealed:</strong> Criminals targeted Silk Road documentation because ancient geographic trade routes remain the most efficient paths for moving goods across international borders. Modern security systems focus on official crossing points, but historic routes follow geographic logic that provides natural concealment and traditional supply networks.</p>
                                    <p><strong>Case Resolution:</strong> Teams successfully demonstrate that understanding historic geography is essential for modern international security and recognizing how geographic trade patterns continue to influence global connectivity.</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="module-integration">
                            <h4>📚 Module 8: Historical Trade Routes & Cultural Exchange Connection</h4>
                            <div class="module-connection">
                                <p><strong>Seamless Integration:</strong> This case directly applies Module 8 content about historic trade networks, cultural diffusion, and how geographic routes enabled civilization advancement and global connectivity.</p>
                                
                                <div class="module-skills">
                                    <h5>Module Skills Reinforced:</h5>
                                    <ul>
                                        <li><strong>Trade Route Geography:</strong> Students apply knowledge of how geographic features determined successful commercial networks</li>
                                        <li><strong>Cultural Diffusion Patterns:</strong> Understanding how geographic connectivity enabled cultural exchange and civilization advancement</li>
                                        <li><strong>Navigation and Exploration:</strong> Connecting traditional wayfinding methods to modern navigation and transportation systems</li>
                                        <li><strong>International Geography:</strong> Analyzing how historic routes influence modern borders, relationships, and global connectivity</li>
                                        <li><strong>Economic Geography Evolution:</strong> Understanding how geographic trade advantages shape commercial development across time periods</li>
                                    </ul>
                                </div>
                                
                                <div class="module-assessment">
                                    <h5>Assessment Integration:</h5>
                                    <p>Case investigation naturally assesses Module 8 learning objectives while students engage in authentic historical geography analysis and modern international security problem-solving.</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="case-outcome">
                            <h4>🏆 Case Resolution & Historic Trade Route Mastery</h4>
                            <div class="outcome-box success">
                                <p><strong>Resolution:</strong> Teams successfully recover the stolen Silk Road navigation tools and expose how criminals exploit historic geographic knowledge for modern illegal operations. The investigation reveals how understanding historic trade geography is essential for international security and recognizing that ancient geographic wisdom remains relevant for modern global connectivity.</p>
                                
                                <div class="skills-earned">
                                    <h5>Geographic Detective Skills Earned:</h5>
                                    <span class="skill-badge">Historic Navigation Analysis</span>
                                    <span class="skill-badge">Trade Route Geography</span>
                                    <span class="skill-badge">Cultural Exchange Investigation</span>
                                    <span class="skill-badge">International Security Analysis</span>
                                    <span class="skill-badge">Historic Route Protection</span>
                                </div>
                                
                                <div class="case-impact">
                                    <h5>Real-World Impact Understanding:</h5>
                                    <p>Students discover that historic geography continues to influence modern global systems. Understanding how ancient trade routes followed geographic logic helps explain modern transportation networks, international relationships, and global connectivity patterns. Geography connects past and present through timeless spatial relationships.</p>
                                </div>
                                
                                <div class="next-case-preview">
                                    <h5>🔮 Preview of Next Case:</h5>
                                    <p><em>"Outstanding work protecting historic trade route heritage! Your investigation has revealed that the criminal network is now targeting sacred sites and religious geographic knowledge. Your next case: Sacred Geography Scandal - criminals are exploiting the geographic knowledge embedded in religious pilgrimage routes and sacred landscape patterns to establish hidden communication networks..."</em></p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- DAY 9: SACRED GEOGRAPHY SCANDAL -->
                <div class="investigation-card day-9" data-difficulty="master">
                    <div class="case-header">
                        <span class="case-number">CASE #009</span>
                        <h3 class="case-title">Sacred Geography Scandal</h3>
                        <div class="case-badges">
                            <span class="difficulty-badge master">MASTER LEVEL</span>
                            <span class="duration-badge">45 MIN + MODULE 9</span>
                            <span class="module-badge">RELIGIOUS GEOGRAPHY & SACRED LANDSCAPES</span>
                        </div>
                    </div>
                    
                    <div class="case-summary">
                        <p><strong>Mystery:</strong> Following the trade route investigation, the criminal network has targeted sacred sites and religious geographic knowledge. Ancient pilgrimage route maps, sacred landscape documentation, and religious navigation systems have been stolen. The criminals are exploiting the geographic patterns embedded in religious sites to establish hidden communication networks across multiple continents.</p>
                    </div>
                    
                    <div class="case-details">
                        <div class="crime-scene-image">
                            <!-- IMAGE PLACEHOLDER FOR GENERATION -->
                            <div class="image-placeholder">
                                <div class="image-prompt">
                                    <strong>🎨 Sacred Site Crime Scene Image Prompt:</strong>
                                    <p>"Religious studies institute with empty display cases where sacred geography artifacts were kept, scattered pilgrimage route scrolls, traditional religious navigation instruments missing, sacred mountain maps removed from walls, monastery layout plans disturbed, spiritual landscape documentation displaced, religious architectural plans showing sacred geometric patterns. International religious heritage research facility showing sophisticated spiritual geography theft."</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="scenario-box">
                            <h4>🎭 Investigation Scenario</h4>
                            <p><strong>Setting:</strong> World Religious Geography Institute, multiple sacred sites globally</p>
                            <p><strong>Crime:</strong> Systematic theft of sacred landscape documentation and religious navigation systems from major world religions</p>
                            <p><strong>Time of Incident:</strong> Coordinated strikes during religious observances, various times across global sacred sites</p>
                            <p><strong>Evidence:</strong> Missing pilgrimage route maps, stolen sacred mountain navigation guides, vanished monastery layout plans, absent religious architectural patterns</p>
                            <p><strong>Stakes:</strong> Religious geographic knowledge being exploited for criminal communication networks hidden within spiritual landscape patterns</p>
                            <p><strong>Threat Level:</strong> MAXIMUM (global network exploiting sacred geography for criminal coordination)</p>
                        </div>
                        
                        <div class="objectives-grid">
                            <div class="learning-objectives">
                                <h4>🎯 Learning Objectives</h4>
                                <ul>
                                    <li>Understand how geography influences religious practices and sacred site selection</li>
                                    <li>Analyze the relationship between natural landscapes and spiritual beliefs</li>
                                    <li>Apply knowledge of religious geography to solve complex international problems</li>
                                    <li>Understand how sacred landscape patterns reflect geographic principles</li>
                                    <li>Recognize geography's role in religious development and cultural expression</li>
                                </ul>
                            </div>
                            
                            <div class="geographic-skills">
                                <h4>🗺️ Geographic Skills Practiced</h4>
                                <ul>
                                    <li>Sacred landscape analysis and religious site geographic interpretation</li>
                                    <li>Pilgrimage route planning and religious navigation understanding</li>
                                    <li>Cultural geography and religious practice spatial patterns</li>
                                    <li>Spiritual landscape design and sacred geometric principles</li>
                                    <li>Religious architectural geography and sacred space organization</li>
                                    <li>International religious geography and global spiritual network analysis</li>
                                </ul>
                            </div>
                        </div>
                        
                        <div class="evidence-analysis-detailed">
                            <h4>🔍 Comprehensive Evidence Analysis</h4>
                            <div class="evidence-grid">
                                <div class="evidence-item priority-high">
                                    <div class="evidence-image">
                                        <div class="image-placeholder small">
                                            <strong>🎨 Evidence Photo Prompt:</strong>
                                            <p>"Ancient pilgrimage route scroll showing sacred paths across mountain ranges, holy sites marked with religious symbols, distance measurements for spiritual journeys, seasonal timing notations for religious observances, elevation markers for sacred mountains. Religious navigation documentation with intricate spiritual geographic details."</p>
                                        </div>
                                    </div>
                                    <h5>🛤️ Spiritual Evidence: Ancient Pilgrimage Route Documentation</h5>
                                    <p><strong>Physical Description:</strong> Comprehensive religious journey maps showing sacred paths, holy sites, spiritual landmarks, and geographic considerations for religious travel</p>
                                    <p><strong>Religious Significance:</strong> Essential navigation tools for spiritual journeys that connect geographic features with religious meaning and cultural practice</p>
                                    <p><strong>Geography Specialist Analysis:</strong> Routes demonstrate sophisticated understanding of geographic challenges, seasonal patterns, and sacred landscape organization</p>
                                    <p><strong>Investigation Questions:</strong> How does geography influence religious practice? Why are pilgrimage routes significant for spiritual development?</p>
                                    <p><strong>Team Role Focus:</strong> Geography Specialist explains religious landscape principles, Evidence Manager documents spiritual significance</p>
                                </div>
                                
                                <div class="evidence-item priority-high">
                                    <div class="evidence-image">
                                        <div class="image-placeholder small">
                                            <strong>🎨 Evidence Photo Prompt:</strong>
                                            <p>"Sacred mountain navigation charts showing elevation profiles, spiritual significance markers, meditation site locations, seasonal access patterns, traditional climbing routes with religious meaning, natural landmark identification for spiritual wayfinding. Mountain pilgrimage geography documentation with sacred elements."</p>
                                        </div>
                                    </div>
                                    <h5>⛰️ Sacred Evidence: Religious Mountain Navigation Systems</h5>
                                    <p><strong>Physical Description:</strong> Detailed mountain navigation guides showing sacred peaks, spiritual climbing routes, meditation sites, and religious geographic features</p>
                                    <p><strong>Spiritual Geography Analysis:</strong> Documents how elevation, natural features, and geographic isolation contribute to religious experience and spiritual practice</p>
                                    <p><strong>Case Chronicler Analysis:</strong> Systems reveal how geography creates conditions for spiritual reflection and religious community development</p>
                                    <p><strong>Investigation Questions:</strong> How do mountain environments enhance religious experience? What geographic features make locations sacred?</p>
                                    <p><strong>Team Role Focus:</strong> Case Chronicler analyzes spiritual landscape relationships, Geography Specialist explains elevation impacts</p>
                                </div>
                                
                                <div class="evidence-item priority-medium">
                                    <div class="evidence-image">
                                        <div class="image-placeholder small">
                                            <strong>🎨 Evidence Photo Prompt:</strong>
                                            <p>"Monastery architectural plans showing sacred geometric patterns, garden layouts with spiritual landscaping, meditation space orientation, religious building placement considering cardinal directions, sacred water features, contemplative pathways. Religious architectural geography with spiritual design elements."</p>
                                        </div>
                                    </div>
                                    <h5>🏛️ Architectural Evidence: Sacred Space Geographic Design</h5>
                                    <p><strong>Physical Description:</strong> Religious architectural plans showing sacred geometric layouts, spiritual landscape design, and geographic orientation for religious buildings</p>
                                    <p><strong>Sacred Design Significance:</strong> Demonstrates how religious architecture integrates geographic principles with spiritual beliefs and cultural practices</p>
                                    <p><strong>Resource Tracker Analysis:</strong> Plans show economic and cultural investment in creating geographic spaces that support religious practice and community development</p>
                                    <p><strong>Investigation Questions:</strong> How does religious architecture use geography? What makes certain spaces conducive to spiritual practice?</p>
                                    <p><strong>Team Role Focus:</strong> Resource Tracker analyzes sacred space economics, all roles study religious geographic design</p>
                                </div>
                                
                                <div class="evidence-item priority-medium">
                                    <div class="evidence-image">
                                        <div class="image-placeholder small">
                                            <strong>🎨 Evidence Photo Prompt:</strong>
                                            <p>"Global religious site communication network diagram showing connections between sacred locations, traditional message relay systems, religious festival coordination patterns, spiritual network communication methods, geographic connectivity between religious communities. International sacred geography networking documentation."</p>
                                        </div>
                                    </div>
                                    <h5>🌍 Network Evidence: Global Religious Geographic Connections</h5>
                                    <p><strong>Physical Description:</strong> Documentation showing communication networks between sacred sites, religious community connections, and spiritual geographic coordination systems</p>
                                    <p><strong>Global Religious Network Analysis:</strong> Reveals how geography enables religious communities to maintain connections across vast distances and coordinate spiritual practices</p>
                                    <p><strong>Evidence Manager Analysis:</strong> Networks demonstrate that religious geography creates global connections that transcend political boundaries and cultural differences</p>
                                    <p><strong>Investigation Questions:</strong> How do religious networks use geography for coordination? What geographic advantages do sacred sites provide for communication?</p>
                                    <p><strong>Team Role Focus:</strong> All roles collaborate to understand how criminals exploit religious geographic networks for illegal coordination</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="investigation-sequence">
                            <h4>🔬 Detailed Investigation Sequence</h4>
                            <div class="sequence-step">
                                <span class="step-number">1</span>
                                <div class="step-content">
                                    <h5>Sacred Geography Crisis Briefing (9 minutes) - Slide 76</h5>
                                    <p><strong>Teacher Script:</strong> "Detectives, we face our most complex case yet. The criminal network has now violated the sacred - they've stolen religious geographic knowledge from multiple world religions. These aren't just maps; they're spiritual landscapes that billions of people consider holy. The criminals are exploiting pilgrimage routes, sacred mountain paths, and religious architectural patterns to create hidden communication networks. They understand that religious sites have geographic advantages: remote locations, international respect, and traditional sanctuary principles that provide protection from scrutiny. Our investigation must respect religious diversity while protecting sacred geographic heritage from criminal exploitation."</p>
                                    <p><strong>Atmosphere:</strong> Respectful urgency, religious sensitivity, emphasize sacred landscape protection and cultural respect</p>
                                    <p><strong>Team Response:</strong> All roles activate religious geography analysis and sacred heritage protection protocols</p>
                                </div>
                            </div>
                            
                            <div class="sequence-step">
                                <span class="step-number">2</span>
                                <div class="step-content">
                                    <h5>Sacred Geography Evidence Analysis (20 minutes) - Slides 77-82</h5>
                                    <p><strong>Evidence Manager:</strong> Documents all stolen religious geographic materials, establishes sacred significance and criminal exploitation potential</p>
                                    <p><strong>Geography Specialist:</strong> Interprets sacred landscape patterns, analyzes religious site geographic advantages, explains spiritual-geographic connections</p>
                                    <p><strong>Resource Tracker:</strong> Evaluates cultural heritage value of religious sites, calculates international protection costs and sacred tourism impacts</p>
                                    <p><strong>Case Chronicler:</strong> Researches religious geography development, documents spiritual landscape significance, connects religious practices to geographic features</p>
                                </div>
                            </div>
                            
                            <div class="sequence-step">
                                <span class="step-number">3</span>
                                <div class="step-content">
                                    <h5>Expert Interview: Dr. Sarah Chen, Religious Geography & Sacred Landscapes Specialist (12 minutes) - Slide 83</h5>
                                    <div class="expert-interview">
                                        <div class="expert-image">
                                            <div class="image-placeholder small">
                                                <strong>🎨 Expert Photo Prompt:</strong>
                                                <p>"Distinguished religious geography scholar in interfaith setting with sacred site images from multiple religions displayed, pointing to geographic features that make locations spiritually significant, surrounded by religious architectural models and sacred landscape maps, compassionate expression emphasizing spiritual heritage protection. Religious geography expertise presentation."</p>
                                            </div>
                                        </div>
                                        <div class="interview-content">
                                            <p><strong>Teacher as Dr. Chen:</strong> "Sacred geography reveals that humans have always found the divine in landscape. Mountains bring us closer to heaven, rivers provide life and purification, caves offer isolation for reflection, and islands create natural sanctuaries. Every major religion developed around geographic features that enhanced spiritual experience. The criminals understand that sacred sites have unique geographic advantages: they're protected by religious tradition, respected across cultures, and often located in strategic but remote locations that provide natural concealment."</p>
                                            
                                            <h6>Available Follow-up Information (when teams ask):</h6>
                                            <ul>
                                                <li><em>"How does geography influence religious experience?"</em> - "Elevation creates perspective, water represents renewal, remoteness enables reflection, and natural beauty inspires awe. Geography provides the conditions that make spiritual experience possible."</li>
                                                <li><em>"Why are sacred sites located in specific geographic areas?"</em> - "Religious communities choose locations based on geographic advantages: natural protection, water access, agricultural potential, and landscape features that enhance spiritual practice."</li>
                                                <li><em>"What makes religious sites attractive to criminals?"</em> - "International respect provides protection, remote locations offer concealment, traditional sanctuary principles limit investigation, and global religious networks enable international coordination."</li>
                                                <li><em>"How can we protect sacred geography while respecting religious diversity?"</em> - "Cooperation between law enforcement and religious communities, cultural sensitivity training, and international heritage protection protocols that honor spiritual significance."</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="sequence-step">
                                <span class="step-number">4</span>
                                <div class="step-content">
                                    <h5>Team Sacred Geography Master Analysis (15 minutes)</h5>
                                    <p><strong>Collaborative Process:</strong> Teams must understand religious geography while maintaining cultural sensitivity and exposing criminal exploitation</p>
                                    <div class="team-activities">
                                        <div class="activity-box evidence-manager">
                                            <h6>Evidence Manager Tasks:</h6>
                                            <ul>
                                                <li>Document all stolen religious geographic materials with appropriate cultural sensitivity and heritage protection protocols</li>
                                                <li>Analyze preservation methods and identify specialized knowledge required for handling sacred materials respectfully</li>
                                                <li>Connect religious geographic advantages to criminal exploitation vulnerabilities while respecting spiritual significance</li>
                                                <li>Establish international religious cooperation protocols for protecting sacred heritage and preventing criminal misuse</li>
                                            </ul>
                                        </div>
                                        <div class="activity-box geography-specialist">
                                            <h6>Geography Specialist Tasks:</h6>
                                            <ul>
                                                <li>Interpret sacred landscape patterns and explain geographic features that enhance religious experience and spiritual practice</li>
                                                <li>Analyze religious site geographic advantages and understand why spiritual communities chose specific locations</li>
                                                <li>Map sacred geography networks and identify how religious sites connect across global spiritual communities</li>
                                                <li>Connect religious geographic principles to natural landscape features and spiritual architectural design</li>
                                            </ul>
                                        </div>
                                        <div class="activity-box resource-tracker">
                                            <h6>Resource Tracker Tasks:</h6>
                                            <ul>
                                                <li>Calculate cultural heritage value of sacred sites and assess international religious tourism economic impacts</li>
                                                <li>Evaluate costs of enhanced sacred site protection and international religious heritage security systems</li>
                                                <li>Assess economic significance of religious geographic networks and their vulnerability to criminal exploitation</li>
                                                <li>Plan budget for respectful law enforcement cooperation with religious communities and sacred heritage protection</li>
                                            </ul>
                                        </div>
                                        <div class="activity-box case-chronicler">
                                            <h6>Case Chronicler Tasks:</h6>
                                            <ul>
                                                <li>Research religious geography development and document how spiritual communities use landscape for religious practice</li>
                                                <li>Connect sacred landscape principles to geographic features and understand spiritual-geographic relationships</li>
                                                <li>Document cultural heritage significance and analyze international cooperation requirements for sacred site protection</li>
                                                <li>Prepare comprehensive case summary linking religious geography to criminal network exploitation and heritage protection needs</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="sequence-step">
                                <span class="step-number">5</span>
                                <div class="step-content">
                                    <h5>Solution Presentation & Sacred Heritage Protection (4 minutes) - Slides 84-85</h5>
                                    <p><strong>Team Presentations:</strong> Each team presents their sacred geography analysis and criminal exploitation prevention strategies</p>
                                    <p><strong>Solution Revealed:</strong> Criminals targeted religious geographic knowledge because sacred sites provide unique advantages for criminal networks: international respect, remote locations, traditional sanctuary protection, and global religious communication systems that transcend political boundaries.</p>
                                    <p><strong>Case Resolution:</strong> Teams successfully demonstrate that understanding religious geography is essential for protecting sacred heritage while recognizing how spiritual landscape patterns can be exploited by criminal networks.</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="module-integration">
                            <h4>📚 Module 9: Religious Geography & Sacred Landscapes Connection</h4>
                            <div class="module-connection">
                                <p><strong>Seamless Integration:</strong> This case directly applies Module 9 content about religious geography, sacred site selection, and how geographic features influence spiritual practices and religious community development.</p>
                                
                                <div class="module-skills">
                                    <h5>Module Skills Reinforced:</h5>
                                    <ul>
                                        <li><strong>Sacred Landscape Analysis:</strong> Students apply knowledge of how geographic features create conditions for religious experience and spiritual practice</li>
                                        <li><strong>Religious Site Geography:</strong> Understanding why spiritual communities choose specific locations and how geography supports religious development</li>
                                        <li><strong>Cultural Geography Integration:</strong> Connecting religious practices to landscape features and understanding spiritual-geographic relationships</li>
                                        <li><strong>Global Religious Networks:</strong> Analyzing how religious communities use geography for international coordination and cultural exchange</li>
                                        <li><strong>Sacred Heritage Protection:</strong> Understanding the importance of protecting religious geographic knowledge while respecting cultural diversity</li>
                                    </ul>
                                </div>
                                
                                <div class="module-assessment">
                                    <h5>Assessment Integration:</h5>
                                    <p>Case investigation naturally assesses Module 9 learning objectives while students engage in authentic religious geography analysis and cultural heritage protection problem-solving.</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="case-outcome">
                            <h4>🏆 Case Resolution & Sacred Geography Mastery</h4>
                            <div class="outcome-box success">
                                <p><strong>Resolution:</strong> Teams successfully recover the stolen religious geographic knowledge and expose how criminals exploit sacred landscapes for illegal coordination. The investigation reveals how understanding religious geography is essential for protecting cultural heritage while recognizing that sacred landscapes reflect universal human geographic relationships with the natural world.</p>
                                
                                <div class="skills-earned">
                                    <h5>Geographic Detective Skills Earned:</h5>
                                    <span class="skill-badge">Sacred Landscape Analysis</span>
                                    <span class="skill-badge">Religious Geography Investigation</span>
                                    <span class="skill-badge">Cultural Heritage Protection</span>
                                    <span class="skill-badge">International Religious Cooperation</span>
                                    <span class="skill-badge">Spiritual-Geographic Understanding</span>
                                </div>
                                
                                <div class="case-impact">
                                    <h5>Real-World Impact Understanding:</h5>
                                    <p>Students discover that religious geography reveals universal human relationships with landscape. Understanding how sacred sites use geographic features helps explain religious diversity, cultural heritage significance, and the importance of protecting spiritual landscapes while respecting different faith traditions. Geography provides common ground for interfaith understanding.</p>
                                </div>
                                
                                <div class="next-case-preview">
                                    <h5>🔮 Preview of Next Case:</h5>
                                    <p><em>"Brilliant work protecting sacred geography! Your investigation has revealed that the criminal network is now targeting modern technology systems. Your next case: The Technology Trail - all GPS satellites, mapping systems, and geographic technology have gone offline. You must use traditional geographic skills and everything you've learned to track down the high-tech criminals without modern tools..."</em></p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- DAY 10: THE TECHNOLOGY TRAIL -->
                <div class="investigation-card day-10" data-difficulty="master">
                    <div class="case-header">
                        <span class="case-number">CASE #010</span>
                        <h3 class="case-title">The Technology Trail</h3>
                        <div class="case-badges">
                            <span class="difficulty-badge master">MASTER LEVEL</span>
                            <span class="duration-badge">45 MIN + MODULE 10</span>
                            <span class="module-badge">TRADITIONAL VS. MODERN GEOGRAPHY</span>
                        </div>
                    </div>
                    
                    <div class="case-summary">
                        <p><strong>Mystery:</strong> In their final gambit, the criminal network has disabled all modern geographic technology. GPS satellites are offline, digital maps are corrupted, and geographic information systems have been destroyed. Teams must use only traditional geographic skills, historical knowledge, and fundamental principles to track down the high-tech criminals and prove that geographic expertise transcends technology.</p>
                    </div>
                    
                    <div class="case-details">
                        <div class="crime-scene-image">
                            <!-- IMAGE PLACEHOLDER FOR GENERATION -->
                            <div class="image-placeholder">
                                <div class="image-prompt">
                                    <strong>🎨 Technology Blackout Crime Scene Image Prompt:</strong>
                                    <p>"Modern geographic technology center with darkened computer screens, offline satellite monitoring systems, disabled GPS equipment, blank digital displays, scattered traditional paper maps pulled from storage, compass and sextant navigation instruments, analog weather tracking devices, manual calculation tools. High-tech facility forced to use traditional geographic methods, dramatic lighting showing technology shutdown."</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="scenario-box">
                            <h4>🎭 Investigation Scenario</h4>
                            <p><strong>Setting:</strong> Global Geographic Technology Command Center, worldwide technology blackout</p>
                            <p><strong>Crime:</strong> Complete shutdown of all modern geographic technology systems and digital navigation infrastructure</p>
                            <p><strong>Time of Incident:</strong> Simultaneous global technology attack, Friday 2:47 AM GMT (coordinated worldwide)</p>
                            <p><strong>Evidence:</strong> Must rely exclusively on traditional navigation methods, paper maps, compass navigation, and fundamental geographic principles</p>
                            <p><strong>Stakes:</strong> Final test of geographic detective mastery without technological assistance</p>
                            <p><strong>Threat Level:</strong> ULTIMATE (complete reliance on traditional geographic skills for global security)</p>
                        </div>
                        
                        <div class="objectives-grid">
                            <div class="learning-objectives">
                                <h4>🎯 Learning Objectives</h4>
                                <ul>
                                    <li>Demonstrate mastery of traditional navigation and fundamental geographic principles</li>
                                    <li>Synthesize all previous geographic knowledge without technological assistance</li>
                                    <li>Apply comprehensive understanding of physical and human geography for problem-solving</li>
                                    <li>Understand the relationship between traditional geographic skills and modern technology</li>
                                    <li>Prove that geographic literacy transcends technological tools and remains essential for understanding our world</li>
                                </ul>
                            </div>
                            
                            <div class="geographic-skills">
                                <h4>🗺️ Geographic Skills Practiced</h4>
                                <ul>
                                    <li>Traditional navigation using compass, maps, and natural landmarks</li>
                                    <li>Manual distance calculation and scale interpretation</li>
                                    <li>Traditional weather prediction using geographic indicators</li>
                                    <li>Paper map analysis and topographic interpretation</li>
                                    <li>Synthesis of physical and human geography knowledge</li>
                                    <li>Integration of all previous investigation skills and geographic concepts</li>
                                </ul>
                            </div>
                        </div>
                        
                        <div class="evidence-analysis-detailed">
                            <h4>🔍 Comprehensive Evidence Analysis</h4>
                            <div class="evidence-grid">
                                <div class="evidence-item priority-high">
                                    <div class="evidence-image">
                                        <div class="image-placeholder small">
                                            <strong>🎨 Evidence Photo Prompt:</strong>
                                            <p>"Traditional magnetic compass with brass construction, detailed paper topographic maps spread across table, manual navigation instruments including sextant and theodolite, traditional weather tracking tools, analog measurement devices, handwritten geographic calculations. Classic navigation equipment emphasizing return to fundamental geographic tools."</p>
                                        </div>
                                    </div>
                                    <h5>🧭 Traditional Evidence: Fundamental Navigation Tools</h5>
                                    <p><strong>Physical Description:</strong> Classic navigation instruments including magnetic compass, paper maps, and manual calculation tools representing traditional geographic methodology</p>
                                    <p><strong>Geographic Significance:</strong> Tools that enabled geographic exploration and navigation for centuries before digital technology, requiring deep understanding of geographic principles</p>
                                    <p><strong>Geography Specialist Analysis:</strong> Traditional tools require comprehensive geographic knowledge and prove that understanding spatial relationships transcends technology</p>
                                    <p><strong>Investigation Questions:</strong> How does traditional navigation compare to GPS? What fundamental principles remain constant regardless of technology?</p>
                                    <p><strong>Team Role Focus:</strong> Geography Specialist leads traditional navigation, Evidence Manager documents fundamental principles</p>
                                </div>
                                
                                <div class="evidence-item priority-high">
                                    <div class="evidence-image">
                                        <div class="image-placeholder small">
                                            <strong>🎨 Evidence Photo Prompt:</strong>
                                            <p>"Hand-drawn geographic analysis combining physical features (mountains, rivers, climate zones), human elements (cities, transportation, political boundaries), historical patterns (trade routes, cultural regions), traditional calculation methods with rulers and protractors. Comprehensive manual geographic investigation methodology."</p>
                                        </div>
                                    </div>
                                    <h5>📊 Synthesis Evidence: Integrated Geographic Analysis</h5>
                                    <p><strong>Physical Description:</strong> Manual geographic analysis combining all physical and human geography concepts using traditional analytical methods</p>
                                    <p><strong>Comprehensive Analysis:</strong> Integration of topography, climate, culture, politics, economics, and history using fundamental geographic reasoning</p>
                                    <p><strong>Case Chronicler Analysis:</strong> Demonstrates that comprehensive geographic understanding enables problem-solving regardless of available technology</p>
                                    <p><strong>Investigation Questions:</strong> How do all geographic concepts work together? What patterns remain consistent across different analytical methods?</p>
                                    <p><strong>Team Role Focus:</strong> Case Chronicler leads comprehensive analysis, all roles contribute specialized knowledge</p>
                                </div>
                                
                                <div class="evidence-item priority-medium">
                                    <div class="evidence-image">
                                        <div class="image-placeholder small">
                                            <strong>🎨 Evidence Photo Prompt:</strong>
                                            <p>"Traditional weather prediction setup using barometer, wind direction indicators, cloud identification charts, temperature tracking methods, natural weather signs observation, manual meteorological calculations. Classic weather analysis emphasizing geographic climate understanding without digital assistance."</p>
                                        </div>
                                    </div>
                                    <h5>🌤️ Climate Evidence: Traditional Weather Analysis</h5>
                                    <p><strong>Physical Description:</strong> Traditional weather prediction and climate analysis tools requiring understanding of atmospheric patterns and geographic climate principles</p>
                                    <p><strong>Meteorological Significance:</strong> Demonstrates how geographic knowledge enables weather prediction and climate understanding using traditional observation methods</p>
                                    <p><strong>Resource Tracker Analysis:</strong> Traditional methods prove that understanding geographic climate patterns provides essential environmental information regardless of technology</p>
                                    <p><strong>Investigation Questions:</strong> How do traditional weather prediction methods work? What geographic principles guide climate analysis?</p>
                                    <p><strong>Team Role Focus:</strong> Resource Tracker analyzes traditional climate methods, Geography Specialist explains atmospheric geography</p>
                                </div>
                                
                                <div class="evidence-item priority-medium">
                                    <div class="evidence-image">
                                        <div class="image-placeholder small">
                                            <strong>🎨 Evidence Photo Prompt:</strong>
                                            <p>"Master detective evidence board showing connections between all previous cases, geographic patterns spanning continents, traditional investigation methods, physical evidence from multiple countries, criminal network analysis using geographic principles. Ultimate geographic detective synthesis without technology."</p>
                                        </div>
                                    </div>
                                    <h5>🔗 Master Evidence: Complete Case Integration</h5>
                                    <p><strong>Physical Description:</strong> Comprehensive analysis connecting all previous investigations and demonstrating how geographic knowledge enables complex international problem-solving</p>
                                    <p><strong>Master Detective Analysis:</strong> Integration of all geographic concepts, investigation skills, and cultural knowledge to solve complex international criminal network</p>
                                    <p><strong>Evidence Manager Analysis:</strong> Demonstrates that mastering geographic principles enables understanding of global patterns and international connections</p>
                                    <p><strong>Investigation Questions:</strong> How do all investigations connect? What geographic patterns explain criminal network operations?</p>
                                    <p><strong>Team Role Focus:</strong> All roles collaborate to demonstrate complete mastery of geographic investigation and international problem-solving</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="investigation-sequence">
                            <h4>🔬 Detailed Investigation Sequence</h4>
                            <div class="sequence-step">
                                <span class="step-number">1</span>
                                <div class="step-content">
                                    <h5>Technology Blackout Crisis Briefing (9 minutes) - Slide 86</h5>
                                    <p><strong>Teacher Script:</strong> "Master Detectives, this is the ultimate test. The criminal network has disabled all modern geographic technology. No GPS, no digital maps, no satellite imagery, no computer analysis systems. Every screen is black, every GPS satellite is offline, every digital system has been destroyed. But you are not helpless - you are Geographic Detective Academy graduates. You have mastered the fundamental principles that guided explorers, navigators, and scientists for centuries before computers existed. Traditional navigation, map reading, weather prediction, distance calculation, and spatial analysis. Your geographic knowledge transcends technology. Now prove it."</p>
                                    <p><strong>Atmosphere:</strong> Ultimate challenge intensity, emphasize fundamental geographic mastery, highlight transition from technology dependence to geographic expertise</p>
                                    <p><strong>Team Response:</strong> All roles activate traditional navigation and fundamental geographic analysis protocols without technological assistance</p>
                                </div>
                            </div>
                            
                            <div class="sequence-step">
                                <span class="step-number">2</span>
                                <div class="step-content">
                                    <h5>Traditional Geographic Investigation Challenge (25 minutes) - Slides 87-92</h5>
                                    <p><strong>Evidence Manager:</strong> Coordinates traditional evidence analysis using fundamental geographic principles and manual documentation methods</p>
                                    <p><strong>Geography Specialist:</strong> Leads traditional navigation using compass, paper maps, and geographic reasoning without technological assistance</p>
                                    <p><strong>Resource Tracker:</strong> Calculates costs and logistics using manual methods and traditional economic geography analysis</p>
                                    <p><strong>Case Chronicler:</strong> Synthesizes all previous geographic knowledge and integrates traditional analytical methods for comprehensive investigation</p>
                                </div>
                            </div>
                            
                            <div class="sequence-step">
                                <span class="step-number">3</span>
                                <div class="step-content">
                                    <h5>Expert Interview: Professor Elena Rodriguez, Traditional Geographic Methods Specialist (12 minutes) - Slide 93</h5>
                                    <div class="expert-interview">
                                        <div class="expert-image">
                                            <div class="image-placeholder small">
                                                <strong>🎨 Expert Photo Prompt:</strong>
                                                <p>"Distinguished geography professor in traditional navigation setting with historic exploration equipment, pointing to paper world maps and traditional instruments, surrounded by compass, sextant, theodolite, and manual calculation tools, confident expression emphasizing geographic expertise over technology. Traditional geographic mastery presentation."</p>
                                            </div>
                                        </div>
                                        <div class="interview-content">
                                            <p><strong>Teacher as Professor Rodriguez:</strong> "Technology is a tool, but geography is knowledge. Before satellites, explorers crossed oceans using stars, compass, and understanding of wind patterns. Before digital maps, cartographers created accurate charts using mathematical principles and systematic observation. Before weather forecasting websites, farmers predicted seasons using geographic indicators and climate patterns. The criminals thought disabling technology would stop you, but they underestimated what you've learned. Geography isn't about gadgets - it's about understanding spatial relationships, patterns, and the fundamental principles that govern our world."</p>
                                            
                                            <h6>Available Follow-up Information (when teams ask):</h6>
                                            <ul>
                                                <li><em>"How can we navigate without GPS technology?"</em> - "Compass provides direction, paper maps show geographic relationships, scale calculation determines distance, and understanding terrain features enables route planning using fundamental geographic principles."</li>
                                                <li><em>"What traditional methods can replace digital analysis?"</em> - "Manual measurement, mathematical calculation, pattern recognition, and systematic observation provide the same geographic analysis that computers automate - but with deeper understanding."</li>
                                                <li><em>"How do traditional geographic skills compare to modern technology?"</em> - "Technology provides speed and convenience, but traditional methods require understanding principles. When technology fails, geographic knowledge remains essential for navigation and spatial analysis."</li>
                                                <li><em>"What makes geographic knowledge more important than technological tools?"</em> - "Tools break, but knowledge endures. Understanding geographic principles enables adaptation to any situation and provides problem-solving capability regardless of available technology."</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="sequence-step">
                                <span class="step-number">4</span>
                                <div class="step-content">
                                    <h5>Team Master Geographic Challenge Resolution (10 minutes)</h5>
                                    <p><strong>Collaborative Process:</strong> Teams must demonstrate mastery by integrating all geographic knowledge without technological assistance</p>
                                    <div class="team-activities">
                                        <div class="activity-box evidence-manager">
                                            <h6>Evidence Manager Tasks:</h6>
                                            <ul>
                                                <li>Coordinate comprehensive evidence analysis using traditional documentation methods and fundamental geographic principles</li>
                                                <li>Demonstrate mastery of evidence preservation, chain of custody, and investigation documentation without digital assistance</li>
                                                <li>Integrate all previous case knowledge to establish complete criminal network understanding using manual analysis methods</li>
                                                <li>Lead international cooperation protocols using traditional communication and geographic coordination techniques</li>
                                            </ul>
                                        </div>
                                        <div class="activity-box geography-specialist">
                                            <h6>Geography Specialist Tasks:</h6>
                                            <ul>
                                                <li>Demonstrate traditional navigation mastery using compass, paper maps, and geographic reasoning without technological assistance</li>
                                                <li>Apply comprehensive understanding of physical geography, climate patterns, and topographic analysis using manual methods</li>
                                                <li>Integrate all geographic concepts from physical features to human patterns for complete spatial analysis</li>
                                                <li>Lead team geographic reasoning and spatial problem-solving using fundamental geographic principles</li>
                                            </ul>
                                        </div>
                                        <div class="activity-box resource-tracker">
                                            <h6>Resource Tracker Tasks:</h6>
                                            <ul>
                                                <li>Calculate all costs, logistics, and resource management using traditional mathematical methods and economic geography principles</li>
                                                <li>Demonstrate understanding of global economic patterns and resource distribution without digital economic analysis tools</li>
                                                <li>Apply traditional supply chain analysis and international trade understanding for criminal network resource tracking</li>
                                                <li>Lead budget planning and resource allocation using fundamental economic geography and manual calculation methods</li>
                                            </ul>
                                        </div>
                                        <div class="activity-box case-chronicler">
                                            <h6>Case Chronicler Tasks:</h6>
                                            <ul>
                                                <li>Synthesize all geographic knowledge and investigation experience to provide comprehensive case analysis without digital research tools</li>
                                                <li>Demonstrate mastery of cultural geography, historical patterns, and international relationships using traditional analytical methods</li>
                                                <li>Integrate all previous investigations and geographic concepts to explain complete criminal network operation and geographic patterns</li>
                                                <li>Lead comprehensive case documentation and prepare final presentation using fundamental research and communication skills</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="sequence-step">
                                <span class="step-number">5</span>
                                <div class="step-content">
                                    <h5>Master Solution Presentation & Ultimate Resolution (6 minutes) - Slides 94-95</h5>
                                    <p><strong>Team Presentations:</strong> Each team demonstrates complete geographic mastery by solving the technology crisis using traditional methods</p>
                                    <p><strong>Solution Revealed:</strong> Criminals disabled technology to test whether modern society has become too dependent on digital tools. Teams prove that fundamental geographic knowledge enables navigation, analysis, and problem-solving regardless of technological availability.</p>
                                    <p><strong>Ultimate Resolution:</strong> Teams successfully track down all criminals using traditional geographic skills, recover all stolen artifacts, and demonstrate that geographic literacy transcends technology.</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="module-integration">
                            <h4>📚 Module 10: Traditional vs. Modern Geography Connection</h4>
                            <div class="module-connection">
                                <p><strong>Seamless Integration:</strong> This case directly applies Module 10 content about the relationship between traditional geographic methods and modern technology, emphasizing fundamental geographic principles that remain constant across different technological periods.</p>
                                
                                <div class="module-skills">
                                    <h5>Module Skills Reinforced:</h5>
                                    <ul>
                                        <li><strong>Traditional Navigation Mastery:</strong> Students demonstrate expertise with compass, paper maps, and fundamental navigation principles</li>
                                        <li><strong>Geographic Synthesis:</strong> Integration of all physical and human geography concepts for comprehensive spatial analysis</li>
                                        <li><strong>Technology Independence:</strong> Understanding that geographic knowledge transcends technological tools and remains essential for spatial literacy</li>
                                        <li><strong>Fundamental Principles Application:</strong> Demonstrating mastery of core geographic concepts that enable problem-solving regardless of available technology</li>
                                        <li><strong>Complete Geographic Literacy:</strong> Proving comprehensive understanding of geographic relationships, patterns, and analytical methods</li>
                                    </ul>
                                </div>
                                
                                <div class="module-assessment">
                                    <h5>Assessment Integration:</h5>
                                    <p>Case investigation provides comprehensive assessment of all geographic learning objectives while students demonstrate complete mastery through traditional methods and fundamental principle application.</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="case-outcome">
                            <h4>🏆 Case Resolution & Ultimate Geographic Mastery</h4>
                            <div class="outcome-box success">
                                <p><strong>Resolution:</strong> Teams successfully solve the technology crisis and capture all criminals using traditional geographic skills and fundamental principles. The investigation proves that mastering geographic knowledge enables spatial analysis, navigation, and problem-solving regardless of technological availability, demonstrating complete geographic literacy and detective expertise.</p>
                                
                                <div class="skills-earned">
                                    <h5>Geographic Detective Skills Earned:</h5>
                                    <span class="skill-badge">Traditional Navigation Mastery</span>
                                    <span class="skill-badge">Geographic Synthesis Excellence</span>
                                    <span class="skill-badge">Technology Independence</span>
                                    <span class="skill-badge">Complete Spatial Literacy</span>
                                    <span class="skill-badge">Ultimate Geographic Detective</span>
                                </div>
                                
                                <div class="case-impact">
                                    <h5>Real-World Impact Understanding:</h5>
                                    <p>Students discover that geographic knowledge is more powerful than technological tools. Understanding fundamental geographic principles enables navigation, analysis, and problem-solving in any situation. Geography provides the spatial literacy essential for understanding our world, whether using traditional methods or modern technology. Geographic education creates adaptable, resourceful, and knowledgeable global citizens.</p>
                                </div>
                                
                                <div class="next-case-preview">
                                    <h5>🔮 Preview of Final Day:</h5>
                                    <p><em>"Extraordinary work demonstrating ultimate geographic mastery! You have proven that geographic knowledge transcends technology and enables complex international problem-solving. Tomorrow: Academy Graduation - celebrate your achievements, receive your Master Geographic Detective badges, and prepare for future advanced international investigations..."</em></p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- DAY 11: ACADEMY GRADUATION -->
                <div class="investigation-card day-11" data-difficulty="master">
                    <div class="case-header">
                        <span class="case-number">DAY 11</span>
                        <h3 class="case-title">Academy Graduation Ceremony</h3>
                        <div class="case-badges">
                            <span class="difficulty-badge master">GRADUATION CEREMONY</span>
                            <span class="duration-badge">45 MIN</span>
                            <span class="module-badge">CELEBRATION & RECOGNITION</span>
                        </div>
                    </div>
                    
                    <div class="case-summary">
                        <p><strong>Mission:</strong> Celebrate the successful completion of Geographic Detective Academy training. Teams present their master portfolios, receive official recognition for their achievements, earn specialized badges, and prepare for future advanced international investigations. This ceremony marks the transformation from students to certified Geographic Detectives ready for real-world applications.</p>
                    </div>
                    
                    <div class="case-details">
                        <div class="crime-scene-image">
                            <!-- IMAGE PLACEHOLDER FOR GENERATION -->
                            <div class="image-placeholder">
                                <div class="image-prompt">
                                    <strong>🎨 Graduation Ceremony Image Prompt:</strong>
                                    <p>"Elegant academy auditorium with formal graduation setup, podium displaying Geographic Detective Academy emblem, large world map backdrop, graduation banners, detective badge display case, student achievement portfolios arranged for presentation, international flags representing global investigations, academic ceremony atmosphere with proud celebration tone."</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="scenario-box">
                            <h4>🎭 Graduation Ceremony</h4>
                            <p><strong>Setting:</strong> International Geographic Detective Academy Grand Auditorium</p>
                            <p><strong>Purpose:</strong> Official recognition of Geographic Detective certification and academic achievement celebration</p>
                            <p><strong>Attendees:</strong> Academy faculty, international geographic experts, distinguished investigators, and proud families</p>
                            <p><strong>Activities:</strong> Portfolio presentations, badge ceremony, academic recognition, specialization announcements, future career guidance</p>
                            <p><strong>Achievement Level:</strong> MASTER GEOGRAPHIC DETECTIVE CERTIFICATION</p>
                        </div>
                        
                        <div class="objectives-grid">
                            <div class="learning-objectives">
                                <h4>🎯 Graduation Objectives</h4>
                                <ul>
                                    <li>Demonstrate comprehensive mastery of all geographic investigation concepts and techniques</li>
                                    <li>Present portfolio showcasing growth from novice to expert geographic detective</li>
                                    <li>Receive official recognition for specialized geographic skills and international investigation capabilities</li>
                                    <li>Understand career pathways and advanced applications of geographic knowledge</li>
                                    <li>Celebrate achievement while preparing for continued geographic learning and professional development</li>
                                </ul>
                            </div>
                            
                            <div class="geographic-skills">
                                <h4>🗺️ Certified Skills Portfolio</h4>
                                <ul>
                                    <li>Comprehensive geographic analysis and spatial reasoning mastery</li>
                                    <li>International investigation coordination and cultural sensitivity</li>
                                    <li>Traditional and modern navigation proficiency</li>
                                    <li>Evidence analysis and investigative documentation excellence</li>
                                    <li>Team leadership and collaborative problem-solving expertise</li>
                                    <li>Professional presentation and communication skills for geographic findings</li>
                                </ul>
                            </div>
                        </div>
                        
                        <div class="graduation-portfolio-review">
                            <h4>📊 Master Portfolio Presentation</h4>
                            <div class="portfolio-sections">
                                <div class="portfolio-section evidence-manager">
                                    <div class="portfolio-image">
                                        <div class="image-placeholder small">
                                            <strong>🎨 Portfolio Display Prompt:</strong>
                                            <p>"Professional evidence management portfolio with organized case documentation, investigation reports, evidence preservation examples, international cooperation protocols, chain of custody procedures, forensic geography techniques. Evidence Manager specialization achievement showcase with academic presentation format."</p>
                                        </div>
                                    </div>
                                    <h5>🔍 Evidence Manager Specialization Portfolio</h5>
                                    <p><strong>Master Achievement:</strong> Comprehensive evidence documentation, preservation techniques, and international investigation coordination expertise</p>
                                    <p><strong>Case Contributions:</strong> Led evidence analysis for all 10 major investigations, establishing protocols for physical evidence, digital documentation, and cultural artifact preservation</p>
                                    <p><strong>Specialized Skills:</strong> Forensic geography, evidence preservation, international legal coordination, and investigative documentation excellence</p>
                                    <p><strong>Professional Recognition:</strong> Qualified for International Evidence Analysis Specialist certification and advanced forensic geography training</p>
                                    <p><strong>Career Pathway:</strong> International law enforcement, forensic geography specialist, cultural heritage protection investigator</p>
                                </div>
                                
                                <div class="portfolio-section geography-specialist">
                                    <div class="portfolio-image">
                                        <div class="image-placeholder small">
                                            <strong>🎨 Portfolio Display Prompt:</strong>
                                            <p>"Advanced geography specialist portfolio with physical and human geography mastery examples, navigation technique demonstrations, climate analysis projects, spatial reasoning challenges, traditional and modern geographic tools usage. Geography Specialist achievement showcase with comprehensive geographic knowledge display."</p>
                                        </div>
                                    </div>
                                    <h5>🌍 Geography Specialist Mastery Portfolio</h5>
                                    <p><strong>Master Achievement:</strong> Complete mastery of physical and human geography with specialized expertise in spatial analysis and navigation techniques</p>
                                    <p><strong>Case Contributions:</strong> Provided geographic analysis for all investigations, led navigation challenges, and demonstrated expertise across multiple geographic specializations</p>
                                    <p><strong>Specialized Skills:</strong> Advanced spatial reasoning, traditional navigation mastery, climate analysis, topographic interpretation, and cultural geography expertise</p>
                                    <p><strong>Professional Recognition:</strong> Qualified for Advanced Geographic Analysis certification and specialized navigation instructor training</p>
                                    <p><strong>Career Pathway:</strong> Professional geographer, expedition guide, geographic consultant, environmental analysis specialist</p>
                                </div>
                                
                                <div class="portfolio-section resource-tracker">
                                    <div class="portfolio-image">
                                        <div class="image-placeholder small">
                                            <strong>🎨 Portfolio Display Prompt:</strong>
                                            <p>"Resource management specialist portfolio with budget analysis examples, economic geography projects, logistics coordination demonstrations, cost-benefit analysis reports, international resource allocation planning. Resource Tracker specialization achievement with professional economic analysis presentation."</p>
                                        </div>
                                    </div>
                                    <h5>💰 Resource Tracker Excellence Portfolio</h5>
                                    <p><strong>Master Achievement:</strong> Expert-level resource management, economic analysis, and international logistics coordination for complex geographic investigations</p>
                                    <p><strong>Case Contributions:</strong> Managed all investigation budgets, coordinated international resources, and provided economic geography analysis for criminal network operations</p>
                                    <p><strong>Specialized Skills:</strong> Economic geography expertise, budget management, international logistics, cost analysis, and resource optimization strategies</p>
                                    <p><strong>Professional Recognition:</strong> Qualified for International Economic Geography certification and advanced resource management training</p>
                                    <p><strong>Career Pathway:</strong> Economic development analyst, international business consultant, logistics coordinator, geographic resource specialist</p>
                                </div>
                                
                                <div class="portfolio-section case-chronicler">
                                    <div class="portfolio-image">
                                        <div class="image-placeholder small">
                                            <strong>🎨 Portfolio Display Prompt:</strong>
                                            <p>"Case documentation specialist portfolio with comprehensive investigation reports, historical analysis projects, cultural geography research, communication excellence examples, narrative synthesis demonstrations. Case Chronicler achievement showcase with professional research and writing presentation."</p>
                                        </div>
                                    </div>
                                    <h5>📚 Case Chronicler Mastery Portfolio</h5>
                                    <p><strong>Master Achievement:</strong> Outstanding research capabilities, comprehensive case documentation, and exceptional communication of complex geographic investigations</p>
                                    <p><strong>Case Contributions:</strong> Documented all investigations, provided historical context, conducted cultural research, and created comprehensive case reports for international coordination</p>
                                    <p><strong>Specialized Skills:</strong> Historical geography research, cultural analysis, comprehensive documentation, narrative synthesis, and professional communication excellence</p>
                                    <p><strong>Professional Recognition:</strong> Qualified for Advanced Geographic Research certification and specialized investigative journalism training</p>
                                    <p><strong>Career Pathway:</strong> Geographic researcher, investigative journalist, cultural heritage specialist, international documentation coordinator</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="graduation-ceremony-sequence">
                            <h4>🎓 Graduation Ceremony Sequence</h4>
                            <div class="ceremony-step">
                                <span class="step-number">1</span>
                                <div class="step-content">
                                    <h5>Academy Welcome & Achievement Recognition (8 minutes) - Slide 96</h5>
                                    <p><strong>Teacher Script:</strong> "Distinguished graduates, faculty, and honored guests, welcome to the Geographic Detective Academy Graduation Ceremony. Today we celebrate an extraordinary achievement. These students began as curious learners and have become certified Geographic Detectives, capable of solving complex international investigations using the power of geographic knowledge. They have mastered physical geography, human geography, cultural understanding, economic analysis, and traditional navigation. They have demonstrated that geographic literacy is essential for understanding our interconnected world and solving real-world challenges. They are ready to use their skills as global citizens, professionals, and leaders."</p>
                                    <p><strong>Atmosphere:</strong> Celebratory pride, academic achievement, emphasize transformation and professional readiness</p>
                                    <p><strong>Recognition:</strong> Individual team achievements and specialized skill development acknowledgment</p>
                                </div>
                            </div>
                            
                            <div class="ceremony-step">
                                <span class="step-number">2</span>
                                <div class="step-content">
                                    <h5>Master Portfolio Presentations (20 minutes) - Slides 97-100</h5>
                                    <p><strong>Evidence Manager Teams:</strong> Present evidence analysis mastery and international investigation coordination achievements</p>
                                    <p><strong>Geography Specialist Teams:</strong> Demonstrate comprehensive geographic knowledge and spatial analysis expertise</p>
                                    <p><strong>Resource Tracker Teams:</strong> Showcase economic geography understanding and resource management excellence</p>
                                    <p><strong>Case Chronicler Teams:</strong> Display research capabilities and comprehensive investigation documentation skills</p>
                                    <p><strong>Presentation Focus:</strong> Growth from novice to expert, specialized skills development, and professional preparation demonstration</p>
                                </div>
                            </div>
                            
                            <div class="ceremony-step">
                                <span class="step-number">3</span>
                                <div class="step-content">
                                    <h5>Badge Ceremony & Specialization Recognition (12 minutes) - Slides 101-102</h5>
                                    <div class="badge-ceremony">
                                        <div class="ceremony-image">
                                            <div class="image-placeholder small">
                                                <strong>🎨 Badge Ceremony Photo Prompt:</strong>
                                                <p>"Formal badge presentation ceremony with distinguished academy officials presenting specialized detective badges to graduating students, individual recognition moment, official credentials being awarded, proud achievement atmosphere, academic ceremony with international geographic professional recognition."</p>
                                            </div>
                                        </div>
                                        <div class="badge-awards">
                                            <h6>🏅 Master Geographic Detective Badges Awarded:</h6>
                                            <div class="badge-categories">
                                                <div class="badge-group">
                                                    <h6>Universal Certification Badges (All Graduates):</h6>
                                                    <span class="graduation-badge">Certified Geographic Detective</span>
                                                    <span class="graduation-badge">International Investigator</span>
                                                    <span class="graduation-badge">Spatial Analysis Expert</span>
                                                    <span class="graduation-badge">Cultural Geography Specialist</span>
                                                    <span class="graduation-badge">Navigation Master</span>
                                                </div>
                                                
                                                <div class="badge-group">
                                                    <h6>Specialized Role Badges (Based on Team Specialization):</h6>
                                                    <span class="graduation-badge evidence">Evidence Analysis Specialist</span>
                                                    <span class="graduation-badge geography">Geographic Knowledge Master</span>
                                                    <span class="graduation-badge resource">Resource Management Expert</span>
                                                    <span class="graduation-badge chronicler">Investigation Documentation Specialist</span>
                                                </div>
                                                
                                                <div class="badge-group">
                                                    <h6>Achievement Badges (Based on Investigation Excellence):</h6>
                                                    <span class="graduation-badge">Physical Geography Expert</span>
                                                    <span class="graduation-badge">Human Geography Specialist</span>
                                                    <span class="graduation-badge">Traditional Navigation Master</span>
                                                    <span class="graduation-badge">International Cooperation Leader</span>
                                                    <span class="graduation-badge">Heritage Protection Advocate</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="ceremony-step">
                                <span class="step-number">4</span>
                                <div class="step-content">
                                    <h5>Future Pathways & Advanced Career Guidance (5 minutes) - Slide 103</h5>
                                    <div class="career-pathways">
                                        <h6>🚀 Advanced Geographic Career Opportunities:</h6>
                                        <div class="pathway-options">
                                            <div class="pathway-card">
                                                <h6>🌍 Professional Geography</h6>
                                                <p>Geographic consultants, environmental analysts, urban planners, geographic information systems specialists</p>
                                            </div>
                                            <div class="pathway-card">
                                                <h6>🔍 Investigation & Security</h6>
                                                <p>International law enforcement, forensic geography, security analysis, intelligence coordination</p>
                                            </div>
                                            <div class="pathway-card">
                                                <h6>📚 Education & Research</h6>
                                                <p>Geography educators, academic researchers, curriculum developers, educational technology specialists</p>
                                            </div>
                                            <div class="pathway-card">
                                                <h6>🌐 International Relations</h6>
                                                <p>Diplomatic services, international development, cultural exchange coordination, global policy analysis</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="graduation-celebration">
                            <h4>🎉 Graduation Celebration & Recognition</h4>
                            <div class="celebration-highlights">
                                <div class="achievement-summary">
                                    <h5>🏆 Academy Achievement Summary:</h5>
                                    <ul>
                                        <li><strong>10 Major International Investigations Solved:</strong> From basic geography to complex international criminal networks</li>
                                        <li><strong>4 Specialized Role Masteries:</strong> Evidence Management, Geography Specialization, Resource Tracking, Case Documentation</li>
                                        <li><strong>Traditional & Modern Navigation Excellence:</strong> Compass navigation to GPS technology understanding</li>
                                        <li><strong>Cultural Geography Expertise:</strong> International sensitivity and cross-cultural investigation capabilities</li>
                                        <li><strong>Professional Investigation Skills:</strong> Evidence analysis, documentation, coordination, and presentation excellence</li>
                                    </ul>
                                </div>
                                
                                <div class="real-world-applications">
                                    <h5>🌟 Real-World Impact & Applications:</h5>
                                    <p>Graduates understand that geographic knowledge enables:</p>
                                    <ul>
                                        <li><strong>Global Citizenship:</strong> Understanding international connections and cultural relationships</li>
                                        <li><strong>Environmental Awareness:</strong> Recognizing human-environment interactions and sustainability needs</li>
                                        <li><strong>Economic Understanding:</strong> Comprehending global trade, resource distribution, and economic development</li>
                                        <li><strong>Cultural Appreciation:</strong> Respecting diversity while understanding universal geographic principles</li>
                                        <li><strong>Problem-Solving Excellence:</strong> Using spatial thinking and geographic analysis for complex challenges</li>
                                        <li><strong>Professional Preparation:</strong> Geographic skills applicable across multiple career pathways</li>
                                    </ul>
                                </div>
                                
                                <div class="continuing-education">
                                    <h5>📈 Continuing Geographic Education Opportunities:</h5>
                                    <div class="education-options">
                                        <div class="education-track">
                                            <h6>Advanced Academy Courses:</h6>
                                            <p>Specialized certifications in Environmental Geography, Economic Development, International Relations, and Geographic Technology</p>
                                        </div>
                                        <div class="education-track">
                                            <h6>Professional Development:</h6>
                                            <p>Industry partnerships, internship opportunities, mentor programs, and real-world application projects</p>
                                        </div>
                                        <div class="education-track">
                                            <h6>Leadership Opportunities:</h6>
                                            <p>Peer tutoring, academy assistant instructor roles, and community geographic education outreach programs</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="final-recognition">
                            <h4>🌟 Final Academy Recognition</h4>
                            <div class="recognition-box graduation-success">
                                <p><strong>Graduation Achievement:</strong> All teams have successfully completed Geographic Detective Academy training with distinction. They have demonstrated mastery of geographic investigation techniques, international cooperation capabilities, cultural sensitivity, and professional excellence. They are certified Geographic Detectives ready to apply their skills as global citizens and future leaders.</p>
                                
                                <div class="graduation-certification">
                                    <h5>🎓 Official Certification Earned:</h5>
                                    <div class="certification-badges">
                                        <span class="cert-badge primary">Certified Geographic Detective</span>
                                        <span class="cert-badge international">International Investigation Specialist</span>
                                        <span class="cert-badge expert">Geographic Analysis Expert</span>
                                        <span class="cert-badge master">Academy Graduate with Distinction</span>
                                    </div>
                                </div>
                                
                                <div class="graduation-impact">
                                    <h5>🌍 Academy Impact & Legacy:</h5>
                                    <p>Geographic Detective Academy graduates join a global network of professionals who understand that geography is essential for understanding our world. They carry forward the knowledge that spatial thinking, cultural awareness, and geographic analysis provide the foundation for solving complex global challenges, promoting international understanding, and building a more connected and sustainable world.</p>
                                </div>
                                
                                <div class="farewell-message">
                                    <h5>✨ Academy Farewell Message:</h5>
                                    <p><em>"Congratulations, Geographic Detectives! You have proven that curious minds, geographic knowledge, and collaborative teamwork can solve any mystery our world presents. Use your skills wisely, continue learning throughout your lives, and remember that geography connects us all. The world needs your expertise, your understanding, and your commitment to making our planet a better place for everyone. Go forth and make a difference!"</em></p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add filter functionality
        this.setupInvestigationFilters();
    }

    async loadStudentMaterials() {
        const panel = document.getElementById('student-materials');
        panel.innerHTML = `
            <h2>📋 Student Materials</h2>
            <p class="subtitle">Comprehensive resources for geographic detective work</p>
            
            <div class="materials-section">
                <h3>📄 Student Handouts</h3>
                <div class="materials-grid">
                    <div class="material-card">
                        <div class="material-header">
                            <h4>�️‍♂️ Geographic Detective Handbook</h4>
                            <div class="material-meta">
                                <span class="page-count">12 pages</span>
                                <span class="format">Spiral-bound reference booklet</span>
                            </div>
                        </div>
                        <p class="material-description">Essential reference guide for geographic investigation techniques</p>
                        <div class="material-contents">
                            <h5>Contents:</h5>
                            <ul>
                                <li>Coordinate system quick reference (latitude/longitude, UTM)</li>
                                <li>Map reading techniques and scale interpretation</li>
                                <li>Evidence collection and documentation standards</li>
                                <li>Geographic vocabulary and terminology</li>
                                <li>Investigation process flowchart and methodologies</li>
                            </ul>
                        </div>
                        <div class="material-actions">
                            <button onclick="simulationInterface.downloadMaterial('handbooks', 'detective-handbook.html')" class="download-btn">
                                📥 Download Handbook
                            </button>
                            <button onclick="simulationInterface.previewMaterial('handbooks', 'detective-handbook.html')" class="preview-btn">
                                👁️ Preview
                            </button>
                        </div>
                    </div>
                    
                    <div class="material-card">
                        <div class="material-header">
                            <h4>📋 Evidence Collection Log Template</h4>
                            <div class="material-meta">
                                <span class="page-count">4 pages</span>
                                <span class="format">Double-sided worksheet packet</span>
                            </div>
                        </div>
                        <p class="material-description">Structured format for documenting case evidence and analysis</p>
                        <div class="material-contents">
                            <h5>Contents:</h5>
                            <ul>
                                <li>Case identification and basic information</li>
                                <li>Evidence inventory with geographic significance notes</li>
                                <li>Witness testimony and geographic clue analysis</li>
                                <li>Coordinate and location data recording</li>
                                <li>Team collaboration and role responsibility tracking</li>
                            </ul>
                        </div>
                        <div class="material-actions">
                            <button onclick="simulationInterface.downloadMaterial('worksheets', 'evidence-log.html')" class="download-btn">
                                📥 Download Log
                            </button>
                            <button onclick="simulationInterface.previewMaterial('worksheets', 'evidence-log.html')" class="preview-btn">
                                👁️ Preview
                            </button>
                        </div>
                    </div>
                    
                    <div class="material-card">
                        <div class="material-header">
                            <h4>📊 Coordinate Analysis Worksheet Collection</h4>
                            <div class="material-meta">
                                <span class="page-count">8 pages</span>
                                <span class="format">Consumable practice worksheets</span>
                            </div>
                        </div>
                        <p class="material-description">Practice exercises for latitude/longitude and coordinate system mastery</p>
                        <div class="material-contents">
                            <h5>Contents:</h5>
                            <ul>
                                <li>Basic coordinate identification and plotting</li>
                                <li>Distance calculation between coordinates</li>
                                <li>Coordinate system conversion practice</li>
                                <li>Real-world location identification challenges</li>
                                <li>GPS navigation and waypoint exercises</li>
                            </ul>
                        </div>
                        <div class="material-actions">
                            <button onclick="alert('Coordinate worksheets coming in Phase 2!')" class="coming-soon-btn">
                                🚧 Coming Soon
                            </button>
                        </div>
                    </div>
                    
                    <div class="material-card">
                        <div class="material-header">
                            <h4>📝 Case Report Presentation Template</h4>
                            <div class="material-meta">
                                <span class="page-count">6 pages</span>
                                <span class="format">Presentation template with graphic organizers</span>
                            </div>
                        </div>
                        <p class="material-description">Structured format for presenting investigation findings and solutions</p>
                        <div class="material-contents">
                            <h5>Contents:</h5>
                            <ul>
                                <li>Executive summary of case and findings</li>
                                <li>Evidence analysis and geographic interpretation</li>
                                <li>Investigation methodology and team roles</li>
                                <li>Geographic concepts applied and learned</li>
                                <li>Real-world connections and applications</li>
                                <li>Recommendations and next steps</li>
                            </ul>
                        </div>
                        <div class="material-actions">
                            <button onclick="alert('Case report templates coming in Phase 2!')" class="coming-soon-btn">
                                🚧 Coming Soon
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="materials-section">
                <h3>💻 Digital Tools</h3>
                <div class="tools-grid">
                    <div class="tool-card">
                        <h4>🌍 Interactive World Map Portal</h4>
                        <p class="tool-description">Web-based mapping tool with coordinate overlay and measurement features</p>
                        <div class="tool-features">
                            <h5>Features:</h5>
                            <ul>
                                <li>Coordinate plotting and identification</li>
                                <li>Distance and area measurement</li>
                                <li>Layer overlays for climate, population, physical features</li>
                                <li>Access: Browser-based, no installation required</li>
                            </ul>
                        </div>
                        <div class="tool-actions">
                            <button onclick="alert('Digital tools coming in Phase 3!')" class="coming-soon-btn">
                                🚧 Phase 3
                            </button>
                        </div>
                    </div>
                    
                    <div class="tool-card">
                        <h4>🔍 Geographic Investigation Database</h4>
                        <p class="tool-description">Searchable database of geographic facts, statistics, and reference information</p>
                        <div class="tool-features">
                            <h5>Features:</h5>
                            <ul>
                                <li>Country and region fact sheets</li>
                                <li>Climate and physical geography data</li>
                                <li>Cultural and economic indicators</li>
                                <li>Access: Password-protected student portal</li>
                            </ul>
                        </div>
                        <div class="tool-actions">
                            <button onclick="alert('Digital tools coming in Phase 3!')" class="coming-soon-btn">
                                🚧 Phase 3
                            </button>
                        </div>
                    </div>
                    
                    <div class="tool-card">
                        <h4>🗃️ Virtual Evidence Locker</h4>
                        <p class="tool-description">Digital repository for storing and organizing case evidence and findings</p>
                        <div class="tool-features">
                            <h5>Features:</h5>
                            <ul>
                                <li>Team collaboration workspace</li>
                                <li>Evidence photo and document storage</li>
                                <li>Investigation timeline tracking</li>
                                <li>Access: Team-based shared workspace</li>
                            </ul>
                        </div>
                        <div class="tool-actions">
                            <button onclick="alert('Digital tools coming in Phase 3!')" class="coming-soon-btn">
                                🚧 Phase 3
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Add download and preview methods
    downloadMaterial(category, filename) {
        const downloadUrl = `/student-materials/${category}/${filename}`;
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = filename;
        link.click();
        console.log(`📥 Downloading ${filename} from ${category}`);
    }

    previewMaterial(category, filename) {
        const previewUrl = `/student-materials/${category}/${filename}`;
        window.open(previewUrl, '_blank');
        console.log(`👁️ Previewing ${filename} from ${category}`);
    }

    async loadAssessments() {
        const panel = document.getElementById('assessments');
        panel.innerHTML = `
            <div class="assessment-header">
                <h1>📊 Geographic Detective Academy Assessment System</h1>
                <p class="mission-statement">Comprehensive evaluation framework designed to measure geographic detective skills through authentic, performance-based assessments</p>
                <div class="assessment-stats">
                    <span class="stat">3 Assessment Types</span>
                    <span class="stat">4-Point Rubric Scale</span>
                    <span class="stat">12 Daily Evaluations</span>
                    <span class="stat">Portfolio-Based Evidence</span>
                </div>
            </div>
            
            <div class="assessment-filters">
                <button class="assessment-filter-btn active" data-filter="all">All Assessments</button>
                <button class="assessment-filter-btn" data-filter="daily">Daily Formative</button>
                <button class="assessment-filter-btn" data-filter="project">Project-Based</button>
                <button class="assessment-filter-btn" data-filter="portfolio">Portfolio Assessment</button>
                <button class="assessment-filter-btn" data-filter="rubrics">Rubrics & Criteria</button>
            </div>
            
            <div class="assessment-content">
                <!-- DAILY FORMATIVE ASSESSMENTS -->
                <div class="assessment-section" data-type="daily">
                    <div class="section-header">
                        <h2>📝 Daily Formative Assessments</h2>
                        <p class="section-subtitle">Continuous evaluation during each investigation case</p>
                    </div>
                    
                    <div class="daily-assessment-grid">
                        <div class="assessment-card formative">
                            <div class="assessment-card-header">
                                <h3>🗺️ Geographic Tool Usage</h3>
                                <span class="frequency-badge">Every Investigation</span>
                            </div>
                            <div class="assessment-details">
                                <div class="skill-progression">
                                    <h4>Skill Progression Rubric</h4>
                                    <div class="rubric-levels">
                                        <div class="rubric-level developing">
                                            <h5>1 - Developing</h5>
                                            <p>Uses basic geographic tools with significant guidance and support. Requires step-by-step instruction for coordinate reading, map orientation, and tool selection.</p>
                                        </div>
                                        <div class="rubric-level approaching">
                                            <h5>2 - Approaching Proficiency</h5>
                                            <p>Uses geographic tools with minimal guidance. Demonstrates understanding of basic functions but may need assistance with complex applications.</p>
                                        </div>
                                        <div class="rubric-level proficient">
                                            <h5>3 - Proficient</h5>
                                            <p>Uses geographic tools accurately and independently. Makes appropriate tool selections and applies them effectively to solve investigation problems.</p>
                                        </div>
                                        <div class="rubric-level advanced">
                                            <h5>4 - Advanced</h5>
                                            <p>Uses geographic tools creatively and innovatively. Combines multiple tools strategically and explains their applications to complex geographic challenges.</p>
                                        </div>
                                    </div>
                                </div>
                                <div class="evidence-indicators">
                                    <h4>Observable Evidence</h4>
                                    <ul>
                                        <li>Accurate coordinate system interpretation</li>
                                        <li>Appropriate map scale selection and use</li>
                                        <li>Effective compass and directional analysis</li>
                                        <li>Strategic tool combination for problem-solving</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        
                        <div class="assessment-card formative">
                            <div class="assessment-card-header">
                                <h3>🔍 Evidence Analysis Skills</h3>
                                <span class="frequency-badge">Every Investigation</span>
                            </div>
                            <div class="assessment-details">
                                <div class="skill-progression">
                                    <h4>Analytical Thinking Rubric</h4>
                                    <div class="rubric-levels">
                                        <div class="rubric-level developing">
                                            <h5>1 - Developing</h5>
                                            <p>Identifies basic evidence with support. Requires guidance to make geographic connections and analyze spatial relationships.</p>
                                        </div>
                                        <div class="rubric-level approaching">
                                            <h5>2 - Approaching Proficiency</h5>
                                            <p>Analyzes evidence and makes geographic connections with minimal guidance. Shows understanding of spatial relationships.</p>
                                        </div>
                                        <div class="rubric-level proficient">
                                            <h5>3 - Proficient</h5>
                                            <p>Synthesizes multiple evidence sources to reach logical geographic conclusions. Demonstrates clear analytical reasoning.</p>
                                        </div>
                                        <div class="rubric-level advanced">
                                            <h5>4 - Advanced</h5>
                                            <p>Evaluates evidence critically and draws sophisticated geographic inferences. Identifies patterns and makes predictive analyses.</p>
                                        </div>
                                    </div>
                                </div>
                                <div class="evidence-indicators">
                                    <h4>Observable Evidence</h4>
                                    <ul>
                                        <li>Systematic evidence organization and documentation</li>
                                        <li>Geographic pattern recognition and analysis</li>
                                        <li>Logical reasoning progression from evidence to conclusion</li>
                                        <li>Integration of multiple geographic concepts</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        
                        <div class="assessment-card formative">
                            <div class="assessment-card-header">
                                <h3>👥 Team Collaboration</h3>
                                <span class="frequency-badge">Every Investigation</span>
                            </div>
                            <div class="assessment-details">
                                <div class="skill-progression">
                                    <h4>Collaboration Excellence Rubric</h4>
                                    <div class="rubric-levels">
                                        <div class="rubric-level developing">
                                            <h5>1 - Developing</h5>
                                            <p>Participates in team activities with encouragement. Beginning to understand role responsibilities and team dynamics.</p>
                                        </div>
                                        <div class="rubric-level approaching">
                                            <h5>2 - Approaching Proficiency</h5>
                                            <p>Actively contributes to team success. Demonstrates understanding of role specialization and collaborative problem-solving.</p>
                                        </div>
                                        <div class="rubric-level proficient">
                                            <h5>3 - Proficient</h5>
                                            <p>Leads team problem-solving and supports others' learning. Effectively balances individual expertise with team goals.</p>
                                        </div>
                                        <div class="rubric-level advanced">
                                            <h5>4 - Advanced</h5>
                                            <p>Facilitates exceptional team performance and mentors peers. Demonstrates leadership and elevates entire team capability.</p>
                                        </div>
                                    </div>
                                </div>
                                <div class="evidence-indicators">
                                    <h4>Observable Evidence</h4>
                                    <ul>
                                        <li>Effective role-based contribution and expertise sharing</li>
                                        <li>Constructive communication and active listening</li>
                                        <li>Conflict resolution and consensus building</li>
                                        <li>Peer support and collaborative problem-solving</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- PROJECT-BASED ASSESSMENTS -->
                <div class="assessment-section" data-type="project">
                    <div class="section-header">
                        <h2>🎯 Project-Based Assessments</h2>
                        <p class="section-subtitle">Comprehensive evaluation through multi-day investigation projects</p>
                    </div>
                    
                    <div class="project-assessment-grid">
                        <div class="assessment-card project-based">
                            <div class="assessment-card-header">
                                <h3>🕵️ Master Detective Case</h3>
                                <span class="duration-badge">Days 9-10</span>
                            </div>
                            <div class="assessment-details">
                                <div class="project-overview">
                                    <p><strong>Comprehensive Final Investigation:</strong> Students integrate all learned geographic detective skills to solve a complex, multi-faceted case requiring synthesis of physical geography, human geography, and advanced analytical techniques.</p>
                                </div>
                                <div class="assessment-components">
                                    <h4>Assessment Components</h4>
                                    <div class="components-grid">
                                        <div class="component-item">
                                            <h5>🔍 Independent Evidence Analysis</h5>
                                            <p>Students demonstrate mastery of evidence collection, organization, and geographic interpretation without guidance.</p>
                                            <span class="weight">Weight: 25%</span>
                                        </div>
                                        <div class="component-item">
                                            <h5>🧠 Geographic Concept Application</h5>
                                            <p>Integration and explanation of geographic concepts learned throughout the academy training program.</p>
                                            <span class="weight">Weight: 25%</span>
                                        </div>
                                        <div class="component-item">
                                            <h5>👥 Team Leadership & Collaboration</h5>
                                            <p>Demonstration of advanced teamwork skills, leadership capabilities, and peer mentoring during complex investigations.</p>
                                            <span class="weight">Weight: 25%</span>
                                        </div>
                                        <div class="component-item">
                                            <h5>📊 Professional Presentation</h5>
                                            <p>Clear, organized presentation of findings using appropriate geographic vocabulary and visual evidence.</p>
                                            <span class="weight">Weight: 25%</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="evaluation-criteria">
                                    <h4>Evaluation Criteria</h4>
                                    <div class="criteria-breakdown">
                                        <div class="criterion">
                                            <h5>GEOGRAPHIC KNOWLEDGE (4 points)</h5>
                                            <p>Demonstrates mastery of coordinate systems, map reading, physical and human geography concepts, and their practical applications in problem-solving contexts.</p>
                                        </div>
                                        <div class="criterion">
                                            <h5>PROBLEM SOLVING (4 points)</h5>
                                            <p>Uses systematic investigation methods, logical reasoning progression, and creative thinking to reach well-supported conclusions.</p>
                                        </div>
                                        <div class="criterion">
                                            <h5>COMMUNICATION (4 points)</h5>
                                            <p>Presents findings clearly with appropriate geographic vocabulary, visual aids, and professional presentation skills.</p>
                                        </div>
                                        <div class="criterion">
                                            <h5>REAL WORLD APPLICATION (4 points)</h5>
                                            <p>Connects case solutions to authentic geographic challenges and demonstrates understanding of geography's role in addressing global issues.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- PORTFOLIO ASSESSMENT -->
                <div class="assessment-section" data-type="portfolio">
                    <div class="section-header">
                        <h2>📁 Portfolio Assessment</h2>
                        <p class="section-subtitle">Cumulative evidence collection demonstrating growth and mastery</p>
                    </div>
                    
                    <div class="portfolio-structure">
                        <div class="portfolio-section">
                            <div class="portfolio-header">
                                <h3>📋 Detective Academy Portfolio Components</h3>
                                <p>Students maintain a comprehensive portfolio demonstrating their journey from rookie to master detective</p>
                            </div>
                            
                            <div class="portfolio-requirements">
                                <div class="portfolio-item">
                                    <div class="item-header">
                                        <h4>🗂️ Case Investigation Logs</h4>
                                        <span class="required-badge">Required: All 11 Cases</span>
                                    </div>
                                    <div class="item-details">
                                        <p><strong>Purpose:</strong> Document investigation process, evidence analysis, and learning progression throughout the academy</p>
                                        <div class="requirements-list">
                                            <h5>Must Include:</h5>
                                            <ul>
                                                <li>Initial evidence documentation and organization</li>
                                                <li>Geographic analysis and reasoning process</li>
                                                <li>Team collaboration notes and role contributions</li>
                                                <li>Solution development and final conclusions</li>
                                                <li>Reflection on geographic skills learned and applied</li>
                                            </ul>
                                        </div>
                                        <div class="quality-indicators">
                                            <h5>Quality Indicators:</h5>
                                            <ul>
                                                <li>Detailed, organized evidence documentation</li>
                                                <li>Clear geographic reasoning and analysis</li>
                                                <li>Evidence of skill progression over time</li>
                                                <li>Thoughtful reflection and self-assessment</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="portfolio-item">
                                    <div class="item-header">
                                        <h4>🗺️ Geographic Skills Artifacts</h4>
                                        <span class="required-badge">Required: 8 Artifacts</span>
                                    </div>
                                    <div class="item-details">
                                        <p><strong>Purpose:</strong> Demonstrate mastery of specific geographic tools, concepts, and applications</p>
                                        <div class="artifact-types">
                                            <h5>Artifact Categories:</h5>
                                            <div class="artifact-grid">
                                                <div class="artifact-type">
                                                    <h6>📍 Coordinate Mastery</h6>
                                                    <p>Evidence of advanced coordinate system use and spatial analysis</p>
                                                </div>
                                                <div class="artifact-type">
                                                    <h6>🏔️ Physical Geography Analysis</h6>
                                                    <p>Topographic interpretation and landform impact assessment</p>
                                                </div>
                                                <div class="artifact-type">
                                                    <h6>🏛️ Human Geography Connections</h6>
                                                    <p>Cultural, economic, and political geography applications</p>
                                                </div>
                                                <div class="artifact-type">
                                                    <h6>🔗 Geographic Relationships</h6>
                                                    <p>Demonstration of complex geographic pattern recognition</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="portfolio-item">
                                    <div class="item-header">
                                        <h4>🎓 Detective Academy Reflection</h4>
                                        <span class="required-badge">Required: Final Reflection</span>
                                    </div>
                                    <div class="item-details">
                                        <p><strong>Purpose:</strong> Synthesize learning experience and demonstrate metacognitive understanding of geographic skill development</p>
                                        <div class="reflection-components">
                                            <h5>Reflection Components:</h5>
                                            <ul>
                                                <li>Personal growth analysis from rookie to master detective</li>
                                                <li>Most challenging investigations and problem-solving strategies</li>
                                                <li>Geographic concepts that changed their worldview</li>
                                                <li>Real-world applications and career connections</li>
                                                <li>Future learning goals and geographic interests</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- RUBRICS AND CRITERIA -->
                <div class="assessment-section" data-type="rubrics">
                    <div class="section-header">
                        <h2>📏 Assessment Rubrics & Criteria</h2>
                        <p class="section-subtitle">Detailed evaluation standards and performance expectations</p>
                    </div>
                    
                    <div class="rubrics-container">
                        <div class="master-rubric">
                            <div class="rubric-header">
                                <h3>🏆 Master Detective Academy Rubric</h3>
                                <p>Comprehensive 4-point scale for evaluating all geographic detective skills</p>
                            </div>
                            
                            <div class="rubric-table">
                                <div class="rubric-row header-row">
                                    <div class="rubric-cell skill-category">Skill Category</div>
                                    <div class="rubric-cell level-1">1 - Developing</div>
                                    <div class="rubric-cell level-2">2 - Approaching</div>
                                    <div class="rubric-cell level-3">3 - Proficient</div>
                                    <div class="rubric-cell level-4">4 - Advanced</div>
                                </div>
                                
                                <div class="rubric-row">
                                    <div class="rubric-cell skill-category">
                                        <h4>🗺️ Geographic Tool Mastery</h4>
                                        <p>Use of maps, coordinates, and spatial analysis tools</p>
                                    </div>
                                    <div class="rubric-cell level-1">
                                        Uses basic tools with significant guidance. Requires step-by-step instruction for most geographic applications.
                                    </div>
                                    <div class="rubric-cell level-2">
                                        Uses tools with minimal guidance. Shows understanding but needs support for complex applications.
                                    </div>
                                    <div class="rubric-cell level-3">
                                        Uses tools accurately and independently. Makes appropriate selections and applies effectively.
                                    </div>
                                    <div class="rubric-cell level-4">
                                        Uses tools creatively and strategically. Combines multiple tools innovatively and explains applications.
                                    </div>
                                </div>
                                
                                <div class="rubric-row">
                                    <div class="rubric-cell skill-category">
                                        <h4>🧠 Geographic Thinking</h4>
                                        <p>Spatial reasoning and geographic concept application</p>
                                    </div>
                                    <div class="rubric-cell level-1">
                                        Identifies basic geographic features. Limited understanding of spatial relationships and patterns.
                                    </div>
                                    <div class="rubric-cell level-2">
                                        Recognizes geographic patterns with guidance. Beginning to make spatial connections and relationships.
                                    </div>
                                    <div class="rubric-cell level-3">
                                        Analyzes geographic patterns independently. Demonstrates clear understanding of spatial relationships.
                                    </div>
                                    <div class="rubric-cell level-4">
                                        Synthesizes complex geographic relationships. Makes sophisticated spatial analyses and predictions.
                                    </div>
                                </div>
                                
                                <div class="rubric-row">
                                    <div class="rubric-cell skill-category">
                                        <h4>🔍 Investigation Process</h4>
                                        <p>Evidence analysis and problem-solving methodology</p>
                                    </div>
                                    <div class="rubric-cell level-1">
                                        Follows basic investigation steps with support. Limited evidence analysis and simple conclusions.
                                    </div>
                                    <div class="rubric-cell level-2">
                                        Conducts investigations with minimal guidance. Analyzes evidence and draws logical conclusions.
                                    </div>
                                    <div class="rubric-cell level-3">
                                        Uses systematic investigation methods independently. Synthesizes multiple evidence sources effectively.
                                    </div>
                                    <div class="rubric-cell level-4">
                                        Demonstrates sophisticated investigation techniques. Evaluates evidence critically and makes predictive analyses.
                                    </div>
                                </div>
                                
                                <div class="rubric-row">
                                    <div class="rubric-cell skill-category">
                                        <h4>💬 Communication</h4>
                                        <p>Geographic vocabulary and presentation of findings</p>
                                    </div>
                                    <div class="rubric-cell level-1">
                                        Uses basic geographic vocabulary. Simple presentation of findings with limited organization.
                                    </div>
                                    <div class="rubric-cell level-2">
                                        Uses appropriate geographic terms. Organized presentation with clear main ideas.
                                    </div>
                                    <div class="rubric-cell level-3">
                                        Uses precise geographic vocabulary. Professional presentation with logical organization and supporting evidence.
                                    </div>
                                    <div class="rubric-cell level-4">
                                        Uses sophisticated geographic language. Compelling presentation with expert organization and persuasive evidence.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add assessment filtering functionality
        this.setupAssessmentFilters();
    }

    async loadTeacherGuide() {
        // Skip external loading since we have embedded content
        console.log('📚 Teacher Guide content is already embedded in HTML');
        
        // The teacher guide content is already in the HTML, so we don't need to load anything
        // Just ensure it's visible and properly formatted
        const teacherGuidePanel = document.getElementById('teacher-guide');
        if (teacherGuidePanel && teacherGuidePanel.innerHTML.includes('placeholder')) {
            // Only load external if content is still placeholder
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
        } else {
            console.log('✅ Teacher Guide content already embedded and ready');
        }
    }

    async loadCompletePackage() {
        const panel = document.getElementById('complete-package');
        panel.innerHTML = `
            <div class="complete-package-header">
                <h1>📦 Complete Geographic Detective Academy Package</h1>
                <p class="mega-subtitle">
                    Everything needed to implement the Geographic Detective Academy simulation - 
                    <strong>Generate a comprehensive PDF containing ALL materials in one massive document!</strong>
                </p>
                <div class="package-stats">
                    <div class="stat-item">
                        <div class="stat-number">12</div>
                        <div class="stat-label">Days of Content</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-number">11</div>
                        <div class="stat-label">Investigation Cases</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-number">50+</div>
                        <div class="stat-label">Pages of Materials</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-number">4</div>
                        <div class="stat-label">Detective Roles</div>
                    </div>
                </div>
            </div>

            <div class="pdf-generation-section">
                <div class="generation-controls">
                    <button id="generate-complete-pdf" class="mega-pdf-button">
                        🎯 GENERATE COMPLETE PDF PACKAGE
                        <span class="button-subtitle">Everything in one massive document (50+ pages)</span>
                    </button>
                    
                    <div class="generation-options">
                        <h3>📋 Customize Your Package:</h3>
                        <div class="options-grid">
                            <label class="option-item">
                                <input type="checkbox" id="include-teacher-guide" checked>
                                <span class="checkmark"></span>
                                📖 Teacher Implementation Guide
                            </label>
                            <label class="option-item">
                                <input type="checkbox" id="include-daily-structure" checked>
                                <span class="checkmark"></span>
                                📅 Daily Structure & Timeline
                            </label>
                            <label class="option-item">
                                <input type="checkbox" id="include-team-roles" checked>
                                <span class="checkmark"></span>
                                👥 Team Roles & Character Cards
                            </label>
                            <label class="option-item">
                                <input type="checkbox" id="include-investigations" checked>
                                <span class="checkmark"></span>
                                🔍 All Investigation Events (11 Cases)
                            </label>
                            <label class="option-item">
                                <input type="checkbox" id="include-assessments" checked>
                                <span class="checkmark"></span>
                                📊 Assessment System & Rubrics
                            </label>
                            <label class="option-item">
                                <input type="checkbox" id="include-student-materials" checked>
                                <span class="checkmark"></span>
                                📚 Student Handouts & Resources
                            </label>
                            <label class="option-item">
                                <input type="checkbox" id="include-standards" checked>
                                <span class="checkmark"></span>
                                🎯 Learning Objectives & Standards
                            </label>
                            <label class="option-item">
                                <input type="checkbox" id="include-implementation" checked>
                                <span class="checkmark"></span>
                                ✅ Implementation Checklists
                            </label>
                        </div>
                    </div>
                </div>

                <div class="package-preview">
                    <h3>📄 Your PDF Will Include:</h3>
                    <div class="content-outline">
                        <div class="section-preview">
                            <h4>🏁 Section 1: Implementation Guide (8-10 pages)</h4>
                            <ul>
                                <li>Complete setup instructions</li>
                                <li>Classroom management strategies</li>
                                <li>Technology requirements</li>
                                <li>Troubleshooting guide</li>
                            </ul>
                        </div>
                        <div class="section-preview">
                            <h4>📅 Section 2: Daily Structure (6-8 pages)</h4>
                            <ul>
                                <li>12-day progression overview</li>
                                <li>Daily lesson plans</li>
                                <li>Time management guides</li>
                                <li>Pacing strategies</li>
                            </ul>
                        </div>
                        <div class="section-preview">
                            <h4>👥 Section 3: Team Roles (4-5 pages)</h4>
                            <ul>
                                <li>Character role descriptions</li>
                                <li>AI-generated role card images</li>
                                <li>Team formation strategies</li>
                                <li>Role rotation guidelines</li>
                            </ul>
                        </div>
                        <div class="section-preview">
                            <h4>🔍 Section 4: Investigation Events (20-25 pages)</h4>
                            <ul>
                                <li>All 11 detailed investigation cases</li>
                                <li>Evidence analysis frameworks</li>
                                <li>Geographic skill challenges</li>
                                <li>Case progression logic</li>
                            </ul>
                        </div>
                        <div class="section-preview">
                            <h4>📊 Section 5: Assessment System (8-10 pages)</h4>
                            <ul>
                                <li>Complete 4-point rubric system</li>
                                <li>Daily formative assessments</li>
                                <li>Project-based evaluations</li>
                                <li>Portfolio requirements</li>
                            </ul>
                        </div>
                        <div class="section-preview">
                            <h4>📚 Section 6: Student Materials (10-15 pages)</h4>
                            <ul>
                                <li>All student handouts</li>
                                <li>Investigation worksheets</li>
                                <li>Reference materials</li>
                                <li>Printable resources</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <div class="quick-actions">
                <h3>⚡ Quick Access:</h3>
                <div class="action-buttons">
                    <button class="action-btn preview-btn">
                        👁️ Preview Package Contents
                    </button>
                    <button class="action-btn download-individual">
                        📁 Download Individual Sections
                    </button>
                    <button class="action-btn print-friendly">
                        🖨️ Print-Friendly Version
                    </button>
                </div>
            </div>

            <div id="generation-status" class="generation-status hidden">
                <div class="status-content">
                    <div class="spinner"></div>
                    <h4>Generating Your Complete Package...</h4>
                    <p id="status-message">Initializing PDF generation system...</p>
                    <div class="progress-bar">
                        <div class="progress-fill" id="progress-fill"></div>
                    </div>
                </div>
            </div>
        `;

        // Initialize the mega PDF generation system
        this.setupCompletePackageGeneration();
    }

    setupCompletePackageGeneration() {
        const generateBtn = document.getElementById('generate-complete-pdf');
        const statusDiv = document.getElementById('generation-status');
        const statusMessage = document.getElementById('status-message');
        const progressFill = document.getElementById('progress-fill');

        generateBtn.addEventListener('click', async () => {
            // Show generation status
            statusDiv.classList.remove('hidden');
            generateBtn.disabled = true;
            generateBtn.innerHTML = '⏳ Generating...';

            try {
                await this.generateMegaPDF();
            } catch (error) {
                console.error('❌ PDF Generation Error:', error);
                statusMessage.textContent = 'Error generating PDF. Please try again.';
            }
        });

        // Setup other action buttons
        this.setupQuickActions();
    }

    async generateMegaPDF() {
        const statusMessage = document.getElementById('status-message');
        const progressFill = document.getElementById('progress-fill');
        const generateBtn = document.getElementById('generate-complete-pdf');

        // Get selected options
        const options = this.getSelectedOptions();
        
        const steps = [
            { step: 'Initializing PDF system...', progress: 5 },
            { step: 'Fetching Teacher Implementation Guide...', progress: 15 },
            { step: 'Compiling Daily Structure content...', progress: 25 },
            { step: 'Processing Team Roles & AI images...', progress: 35 },
            { step: 'Gathering all Investigation Events...', progress: 50 },
            { step: 'Formatting Assessment System...', progress: 65 },
            { step: 'Collecting Student Materials...', progress: 75 },
            { step: 'Organizing Learning Objectives...', progress: 85 },
            { step: 'Finalizing PDF compilation...', progress: 95 },
            { step: 'PDF Generation Complete!', progress: 100 }
        ];

        // Simulate realistic PDF generation process
        for (let i = 0; i < steps.length; i++) {
            statusMessage.textContent = steps[i].step;
            progressFill.style.width = steps[i].progress + '%';
            
            // Simulate processing time
            await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));
        }

        // Generate the actual PDF
        try {
            await this.compileMegaPDF(options);
        } catch (error) {
            console.error('💥 Mega PDF generation failed:', error);
            
            // Reset UI to allow retry
            statusMessage.textContent = 'PDF generation failed. Please try again.';
            progressFill.style.width = '0%';
            progressFill.style.background = '#dc3545';
        }

        // Reset UI
        setTimeout(() => {
            document.getElementById('generation-status').classList.add('hidden');
            generateBtn.disabled = false;
            generateBtn.innerHTML = `
                🎯 GENERATE COMPLETE PDF PACKAGE
                <span class="button-subtitle">Everything in one massive document (50+ pages)</span>
            `;
            
            // Reset progress bar color
            progressFill.style.background = '';
        }, 2000);
    }

    async compileMegaPDF(options) {
        try {
            // Create comprehensive PDF compilation request
            const response = await fetch('/api/simulation/generate-complete-pdf', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    sections: options,
                    includeImages: true,
                    format: 'comprehensive',
                    timestamp: new Date().toISOString()
                })
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.status} ${response.statusText}`);
            }

            // Get the PDF blob
            const blob = await response.blob();
            
            // Ensure we have a valid PDF blob
            if (blob.size === 0) {
                throw new Error('Received empty PDF file');
            }
            
            console.log(`📄 PDF blob received: ${(blob.size / 1024 / 1024).toFixed(2)}MB`);
            
            // Create download link and trigger download
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Geographic-Detective-Academy-Complete-Package-${new Date().toISOString().split('T')[0]}.pdf`;
            
            // Append to body, click, and remove
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            // Clean up the blob URL
            setTimeout(() => {
                window.URL.revokeObjectURL(url);
            }, 1000);
            
            // Show success message
            this.showSuccessMessage();
            
            console.log('✅ PDF download initiated successfully!');
            
        } catch (error) {
            console.error('❌ PDF compilation failed:', error);
            
            // Show error message to user
            const errorAlert = document.createElement('div');
            errorAlert.className = 'error-alert';
            errorAlert.innerHTML = `
                <div class="alert-content">
                    <div class="error-icon">❌</div>
                    <div class="error-text">
                        <h3>PDF Generation Failed</h3>
                        <p>Error: ${error.message}</p>
                        <p>Please try again or contact support if the issue persists.</p>
                    </div>
                    <button class="alert-close" onclick="this.parentElement.parentElement.remove()">×</button>
                </div>
            `;
            
            document.body.appendChild(errorAlert);
            
            // Auto-remove error after 8 seconds
            setTimeout(() => {
                if (errorAlert.parentElement) {
                    errorAlert.remove();
                }
            }, 8000);
            
            throw error; // Re-throw to be handled by the calling function
        }
    }

    getSelectedOptions() {
        return {
            teacherGuide: document.getElementById('include-teacher-guide').checked,
            dailyStructure: document.getElementById('include-daily-structure').checked,
            teamRoles: document.getElementById('include-team-roles').checked,
            investigations: document.getElementById('include-investigations').checked,
            assessments: document.getElementById('include-assessments').checked,
            studentMaterials: document.getElementById('include-student-materials').checked,
            standards: document.getElementById('include-standards').checked,
            implementation: document.getElementById('include-implementation').checked
        };
    }

    setupQuickActions() {
        const previewBtn = document.querySelector('.preview-btn');
        const downloadIndividualBtn = document.querySelector('.download-individual');
        const printFriendlyBtn = document.querySelector('.print-friendly');

        previewBtn.addEventListener('click', () => this.showPackagePreview());
        downloadIndividualBtn.addEventListener('click', () => this.showIndividualDownloads());
        printFriendlyBtn.addEventListener('click', () => this.generatePrintVersion());
    }

    showSuccessMessage() {
        const successAlert = document.createElement('div');
        successAlert.className = 'success-alert';
        successAlert.innerHTML = `
            <div class="alert-content">
                <div class="success-icon">🎉</div>
                <div class="success-text">
                    <h3>PDF Generation Complete!</h3>
                    <p>🔍 Your complete Geographic Detective Academy package has been downloaded!</p>
                    <p><strong>Contains:</strong> All selected sections with professional formatting and images.</p>
                </div>
                <button class="alert-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        document.body.appendChild(successAlert);
        
        // Auto-remove after 6 seconds
        setTimeout(() => {
            if (successAlert.parentElement) {
                successAlert.remove();
            }
        }, 6000);
    }

    showPackagePreview() {
        // Show a modal with package contents preview
        const modal = document.createElement('div');
        modal.className = 'preview-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>📋 Complete Package Contents Preview</h2>
                    <button class="modal-close" onclick="this.parentElement.parentElement.parentElement.remove()">×</button>
                </div>
                <div class="modal-body">
                    <div class="preview-sections">
                        <div class="preview-item">
                            <h3>📖 Teacher Implementation Guide</h3>
                            <p>8-10 pages of comprehensive setup instructions, classroom management strategies, and implementation tips.</p>
                        </div>
                        <div class="preview-item">
                            <h3>📅 12-Day Simulation Structure</h3>
                            <p>6-8 pages detailing each day's activities, timing, and learning objectives with flexible pacing options.</p>
                        </div>
                        <div class="preview-item">
                            <h3>👥 Detective Team Roles</h3>
                            <p>4-5 pages of detailed role descriptions, team formation strategies, and collaboration frameworks.</p>
                        </div>
                        <div class="preview-item">
                            <h3>🔍 Investigation Cases</h3>
                            <p>20-25 pages containing all 11 investigation cases with evidence, objectives, and geographic challenges.</p>
                        </div>
                        <div class="preview-item">
                            <h3>📊 Assessment System</h3>
                            <p>8-10 pages of rubrics, evaluation tools, and portfolio requirements for comprehensive student assessment.</p>
                        </div>
                        <div class="preview-item">
                            <h3>📚 Student Materials</h3>
                            <p>12-15 pages of handouts, worksheets, reference guides, and digital resources for student use.</p>
                        </div>
                        <div class="preview-item">
                            <h3>🎯 Learning Standards</h3>
                            <p>6-8 pages aligning content with national geography standards and 21st-century skills.</p>
                        </div>
                        <div class="preview-item">
                            <h3>✅ Implementation Checklists</h3>
                            <p>8-10 pages of pre-implementation, daily, and post-implementation checklists and troubleshooting guides.</p>
                        </div>
                    </div>
                    <div class="preview-footer">
                        <p><strong>Total:</strong> 50+ pages of comprehensive educational content</p>
                        <button class="generate-btn" onclick="document.querySelector('.generate-complete-package').click(); this.parentElement.parentElement.parentElement.parentElement.remove();">
                            🚀 Generate Complete Package
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        console.log('📄 Package preview displayed');
    }

    showIndividualDownloads() {
        // Show modal for downloading individual sections
        const modal = document.createElement('div');
        modal.className = 'download-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>📁 Download Individual Sections</h2>
                    <button class="modal-close" onclick="this.parentElement.parentElement.parentElement.remove()">×</button>
                </div>
                <div class="modal-body">
                    <p>Select specific sections to download individually:</p>
                    <div class="individual-downloads">
                        <button class="download-section-btn" onclick="this.parentElement.parentElement.parentElement.parentElement.classList.add('downloading'); setTimeout(() => alert('Teacher Guide downloaded!'), 1000);">
                            📖 Teacher Implementation Guide
                        </button>
                        <button class="download-section-btn" onclick="this.parentElement.parentElement.parentElement.parentElement.classList.add('downloading'); setTimeout(() => alert('Daily Structure downloaded!'), 1000);">
                            📅 12-Day Simulation Structure  
                        </button>
                        <button class="download-section-btn" onclick="this.parentElement.parentElement.parentElement.parentElement.classList.add('downloading'); setTimeout(() => alert('Team Roles downloaded!'), 1000);">
                            👥 Detective Team Roles
                        </button>
                        <button class="download-section-btn" onclick="this.parentElement.parentElement.parentElement.parentElement.classList.add('downloading'); setTimeout(() => alert('Investigation Cases downloaded!'), 1000);">
                            🔍 Investigation Cases (All 11)
                        </button>
                        <button class="download-section-btn" onclick="this.parentElement.parentElement.parentElement.parentElement.classList.add('downloading'); setTimeout(() => alert('Assessment System downloaded!'), 1000);">
                            📊 Assessment System & Rubrics
                        </button>
                        <button class="download-section-btn" onclick="this.parentElement.parentElement.parentElement.parentElement.classList.add('downloading'); setTimeout(() => alert('Student Materials downloaded!'), 1000);">
                            � Student Materials & Resources
                        </button>
                        <button class="download-section-btn" onclick="this.parentElement.parentElement.parentElement.parentElement.classList.add('downloading'); setTimeout(() => alert('Learning Standards downloaded!'), 1000);">
                            🎯 Learning Standards & Objectives
                        </button>
                        <button class="download-section-btn" onclick="this.parentElement.parentElement.parentElement.parentElement.classList.add('downloading'); setTimeout(() => alert('Implementation Checklists downloaded!'), 1000);">
                            ✅ Implementation Checklists
                        </button>
                    </div>
                    <div class="download-footer">
                        <p><em>Note: Individual section downloads coming soon! For now, use the Complete Package option.</em></p>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        console.log('📁 Individual downloads modal displayed');
    }

    generatePrintVersion() {
        // Generate a print-optimized version
        const sections = this.getSelectedSections();
        
        // Enable all sections for print version
        const printSections = {
            teacherGuide: true,
            dailyStructure: true,
            teamRoles: true,
            investigations: true,
            assessments: true,
            studentMaterials: true,
            standards: true,
            implementation: true
        };
        
        // Set loading state
        const printBtn = document.querySelector('.print-friendly');
        const originalText = printBtn.innerHTML;
        printBtn.innerHTML = '🖨️ Preparing Print Version...';
        printBtn.disabled = true;
        
        // Generate PDF with print-friendly formatting
        fetch('/api/simulation/generate-complete-pdf', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                sections: printSections,
                includeImages: false, // Reduce file size for printing
                format: 'print-friendly',
                timestamp: new Date().toISOString()
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.blob();
        })
        .then(blob => {
            // Create download link for print version
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Geographic-Detective-Academy-Print-Version-${new Date().toISOString().split('T')[0]}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            
            // Reset button
            printBtn.innerHTML = originalText;
            printBtn.disabled = false;
            
            // Show success message
            this.showPrintSuccessMessage();
        })
        .catch(error => {
            console.error('Print version generation failed:', error);
            printBtn.innerHTML = originalText;
            printBtn.disabled = false;
            alert('Failed to generate print version. Please try again.');
        });
        
        console.log('🖨️ Print-friendly version generation started');
    }

    showPrintSuccessMessage() {
        const successAlert = document.createElement('div');
        successAlert.className = 'success-alert print-success';
        successAlert.innerHTML = `
            <div class="alert-content">
                <div class="success-icon">🖨️</div>
                <div class="success-text">
                    <h3>Print Version Ready!</h3>
                    <p>📄 Your print-optimized PDF has been downloaded!</p>
                    <p><strong>Features:</strong> High contrast, optimized for black & white printing, reduced file size.</p>
                </div>
                <button class="alert-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        document.body.appendChild(successAlert);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (successAlert.parentElement) {
                successAlert.remove();
            }
        }, 5000);
    }

    setupInvestigationFilters() {
        // Enhanced filter functionality for all 11 investigation cases
        const filterBtns = document.querySelectorAll('.filter-btn');
        const investigationCards = document.querySelectorAll('.investigation-card');
        const searchInput = document.getElementById('investigation-search');
        
        // Filter by difficulty level
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active class from all buttons
                filterBtns.forEach(b => b.classList.remove('active'));
                // Add active class to clicked button
                btn.classList.add('active');
                
                const filter = btn.dataset.filter;
                
                investigationCards.forEach(card => {
                    if (filter === 'all') {
                        card.style.display = 'block';
                    } else {
                        const difficulty = card.dataset.difficulty;
                        const isGraduation = filter === 'graduation' && card.classList.contains('day-11');
                        const isMatch = difficulty === filter || isGraduation;
                        card.style.display = isMatch ? 'block' : 'none';
                    }
                });
            });
        });
        
        // Search functionality
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase();
                
                investigationCards.forEach(card => {
                    const cardText = card.textContent.toLowerCase();
                    const isVisible = cardText.includes(searchTerm);
                    card.style.display = isVisible ? 'block' : 'none';
                });
                
                // Reset filter buttons when searching
                if (searchTerm) {
                    filterBtns.forEach(b => b.classList.remove('active'));
                }
            });
        }
        
        // Add toggle functionality for case details
        investigationCards.forEach(card => {
            const header = card.querySelector('.case-header');
            const details = card.querySelector('.case-details');
            
            if (header && details) {
                header.addEventListener('click', () => {
                    const isExpanded = details.style.display === 'block';
                    details.style.display = isExpanded ? 'none' : 'block';
                    header.style.cursor = 'pointer';
                    
                    // Add visual feedback
                    card.classList.toggle('expanded', !isExpanded);
                });
                
                // Initially hide details for cleaner view
                details.style.display = 'none';
            }
        });
    }

    setupAssessmentFilters() {
        // Enhanced filter functionality for assessment sections
        const filterBtns = document.querySelectorAll('.assessment-filter-btn');
        const assessmentSections = document.querySelectorAll('.assessment-section');
        
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active class from all buttons
                filterBtns.forEach(b => b.classList.remove('active'));
                // Add active class to clicked button
                btn.classList.add('active');
                
                const filter = btn.dataset.filter;
                
                assessmentSections.forEach(section => {
                    if (filter === 'all') {
                        section.style.display = 'block';
                    } else {
                        const sectionType = section.dataset.type;
                        section.style.display = sectionType === filter ? 'block' : 'none';
                    }
                });
            });
        });
        
        // Add expandable functionality for assessment cards
        const assessmentCards = document.querySelectorAll('.assessment-card, .summative-card, .portfolio-item');
        assessmentCards.forEach(card => {
            const header = card.querySelector('.assessment-card-header, .item-header');
            const details = card.querySelector('.assessment-details, .item-details');
            
            if (header && details) {
                header.addEventListener('click', () => {
                    const isExpanded = details.style.display === 'block';
                    details.style.display = isExpanded ? 'none' : 'block';
                    header.style.cursor = 'pointer';
                    
                    // Add visual feedback
                    card.classList.toggle('expanded', !isExpanded);
                });
                
                // Initially hide details for cleaner view
                details.style.display = 'none';
            }
        });
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
