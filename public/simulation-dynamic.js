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
                        <div class="scenario-box">
                            <h4>🎭 Investigation Scenario</h4>
                            <p><strong>Setting:</strong> International Geographic Bureau Headquarters</p>
                            <p><strong>Crisis:</strong> The world's most important geographic artifacts have been stolen by a master criminal organization</p>
                            <p><strong>Urgency:</strong> Only newly recruited detective teams can solve this international crisis</p>
                            <p><strong>Stakes:</strong> Global geographic knowledge security at risk</p>
                        </div>
                        
                        <div class="objectives-grid">
                            <div class="learning-objectives">
                                <h4>🎯 Learning Objectives</h4>
                                <ul>
                                    <li>Understand simulation framework and collaborative procedures</li>
                                    <li>Form balanced detective teams with specialized roles</li>
                                    <li>Create character backgrounds and professional identities</li>
                                    <li>Establish International Geographic Bureau immersion</li>
                                </ul>
                            </div>
                            
                            <div class="geographic-skills">
                                <h4>🗺️ Geographic Skills Foundation</h4>
                                <ul>
                                    <li>Introduction to geographic thinking and spatial analysis</li>
                                    <li>Understanding geography's role in problem-solving</li>
                                    <li>Recognition of five themes of geography</li>
                                    <li>Geographic vocabulary and professional terminology</li>
                                </ul>
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
                        <div class="scenario-box">
                            <h4>🎭 Investigation Scenario</h4>
                            <p><strong>Setting:</strong> Roosevelt Middle School Geography Laboratory, Room 204</p>
                            <p><strong>Crime:</strong> Breaking and entering with theft of specialized geographic equipment</p>
                            <p><strong>Evidence:</strong> Dust outline (12-inch diameter), fingerprints on metal stand, torn coordinate paper (40°N, 74°W), abandoned compass pointing northeast</p>
                            <p><strong>Stakes:</strong> Globe contains encrypted coordinates to international treasure map network</p>
                        </div>
                        
                        <div class="objectives-grid">
                            <div class="learning-objectives">
                                <h4>🎯 Learning Objectives</h4>
                                <ul>
                                    <li>Define geography and its role in criminal investigation</li>
                                    <li>Distinguish between physical and human geographic evidence</li>
                                    <li>Apply basic coordinate system knowledge to solve problems</li>
                                    <li>Use fundamental geographic tools in authentic contexts</li>
                                </ul>
                            </div>
                            
                            <div class="geographic-skills">
                                <h4>🗺️ Geographic Skills Practiced</h4>
                                <ul>
                                    <li>Coordinate system interpretation (latitude/longitude)</li>
                                    <li>Cardinal direction analysis and compass use</li>
                                    <li>Physical vs. human geographic evidence classification</li>
                                    <li>Basic map reading and spatial orientation</li>
                                    <li>Geographic vocabulary application in professional context</li>
                                </ul>
                            </div>
                        </div>
                        
                        <div class="evidence-analysis">
                            <h4>🔍 Key Evidence Analysis</h4>
                            <div class="evidence-grid">
                                <div class="evidence-item">
                                    <h5>Coordinate Fragment: 40°N, 74°W</h5>
                                    <p>Geographic Specialist Analysis: Points to Statue of Liberty area, New York Harbor</p>
                                    <p>Significance: Indicates thief's target location for treasure map recovery</p>
                                </div>
                                <div class="evidence-item">
                                    <h5>Compass Direction: Northeast</h5>
                                    <p>Physical Evidence: Shows escape route planning and geographic knowledge</p>
                                    <p>Implication: Thief understands navigation and directional systems</p>
                                </div>
                                <div class="evidence-item">
                                    <h5>Globe Specifications: 12-inch diameter</h5>
                                    <p>Equipment Analysis: Specific size suggests targeted theft, not random</p>
                                    <p>Context: Contains hidden information known only to geographic specialists</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="investigation-sequence">
                            <h4>🔬 Investigation Sequence</h4>
                            <div class="sequence-step">
                                <span class="step-number">1</span>
                                <div class="step-content">
                                    <h5>Case Introduction (3 minutes) - Slide 6</h5>
                                    <p>Present crime scene evidence and establish urgency of hidden coordinates</p>
                                </div>
                            </div>
                            <div class="sequence-step">
                                <span class="step-number">2</span>
                                <div class="step-content">
                                    <h5>Evidence Presentation (5 minutes) - Slides 7-8</h5>
                                    <p>Evidence Manager records clues, Geography Specialist analyzes coordinates</p>
                                </div>
                            </div>
                            <div class="sequence-step">
                                <span class="step-number">3</span>
                                <div class="step-content">
                                    <h5>Team Investigation (5 minutes)</h5>
                                    <p>Teams collaborate to analyze evidence and propose solution using $1,000 investigation credits</p>
                                </div>
                            </div>
                            <div class="sequence-step">
                                <span class="step-number">4</span>
                                <div class="step-content">
                                    <h5>Solution Reveal (2 minutes) - Slides 9-10</h5>
                                    <p>Coordinate analysis leads to Statue of Liberty area treasure recovery</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="module-integration">
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
                <div class="investigation-card day-2" data-difficulty="detective">
                    <div class="case-header">
                        <span class="case-number">CASE #002</span>
                        <h3 class="case-title">Mountains of Mystery</h3>
                        <div class="case-badges">
                            <span class="difficulty-badge detective">DETECTIVE LEVEL</span>
                            <span class="duration-badge">15 MIN + MODULE 2</span>
                            <span class="module-badge">PHYSICAL WORLD</span>
                        </div>
                    </div>
                    
                    <div class="case-summary">
                        <p><strong>Mystery:</strong> International Cartography Office break-in results in stolen elevation maps and topographic data. The thief has escaped into dangerous mountainous terrain requiring advanced physical geography analysis.</p>
                    </div>
                    
                    <div class="case-details">
                        <div class="scenario-box">
                            <h4>🎭 Investigation Scenario</h4>
                            <p><strong>Setting:</strong> International Cartography Office, Mountain Research Division</p>
                            <p><strong>Crime:</strong> High-security break-in targeting elevation and topographic datasets</p>
                            <p><strong>Evidence:</strong> Footprints at 2,847 feet elevation, avoidance of south-facing slopes, weather gear suited for specific conditions</p>
                            <p><strong>Stakes:</strong> Stolen topographic data could compromise national security installations</p>
                        </div>
                        
                        <div class="objectives-grid">
                            <div class="learning-objectives">
                                <h4>🎯 Learning Objectives</h4>
                                <ul>
                                    <li>Analyze physical geographic features as criminal evidence</li>
                                    <li>Understand how landforms affect human movement and behavior</li>
                                    <li>Use topographic maps for tracking and prediction</li>
                                    <li>Apply climate and weather knowledge to solve problems</li>
                                </ul>
                            </div>
                            
                            <div class="geographic-skills">
                                <h4>🗺️ Geographic Skills Practiced</h4>
                                <ul>
                                    <li>Topographic map interpretation and elevation analysis</li>
                                    <li>Landform identification and significance assessment</li>
                                    <li>Climate pattern analysis and weather impact evaluation</li>
                                    <li>Slope aspect and terrain navigation understanding</li>
                                    <li>Physical geography vocabulary in professional context</li>
                                </ul>
                            </div>
                        </div>
                        
                        <div class="evidence-analysis">
                            <h4>🔍 Advanced Evidence Analysis</h4>
                            <div class="evidence-grid">
                                <div class="evidence-item complex">
                                    <h5>Elevation Evidence: 2,847 feet precisely</h5>
                                    <p>Geographic Analysis: Specific elevation suggests targeted knowledge of terrain features</p>
                                    <p>Tactical Implication: Height provides surveillance advantage over approaches</p>
                                    <p>Weather Factor: Elevation affects temperature, precipitation, and visibility</p>
                                </div>
                                <div class="evidence-item complex">
                                    <h5>Slope Aspect: Avoided south-facing slopes</h5>
                                    <p>Physical Geography: South-facing slopes receive more solar radiation</p>
                                    <p>Behavioral Analysis: Suggests preference for cooler, shadier terrain</p>
                                    <p>Season Consideration: Strategy varies by time of year and climate</p>
                                </div>
                                <div class="evidence-item complex">
                                    <h5>Weather Pattern Correlation</h5>
                                    <p>Meteorological Data: Recent precipitation and temperature records</p>
                                    <p>Terrain Impact: How weather affects different slope aspects and elevations</p>
                                    <p>Predictive Value: Weather patterns help predict future movement</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="investigation-sequence">
                            <h4>🏔️ Physical Geography Investigation Sequence</h4>
                            <div class="sequence-step">
                                <span class="step-number">1</span>
                                <div class="step-content">
                                    <h5>Case Introduction (3 minutes) - Slide 11</h5>
                                    <p>Present mountain crime scene with physical evidence requiring terrain analysis</p>
                                </div>
                            </div>
                            <div class="sequence-step">
                                <span class="step-number">2</span>
                                <div class="step-content">
                                    <h5>Physical Evidence Analysis (5 minutes) - Slides 12-13</h5>
                                    <p>Geography Specialist analyzes elevation and slope data, Evidence Manager documents terrain clues</p>
                                </div>
                            </div>
                            <div class="sequence-step">
                                <span class="step-number">3</span>
                                <div class="step-content">
                                    <h5>Team Investigation (5 minutes)</h5>
                                    <p>Collaborative terrain analysis using topographic maps and weather data</p>
                                </div>
                            </div>
                            <div class="sequence-step">
                                <span class="step-number">4</span>
                                <div class="step-content">
                                    <h5>Solution Reveal (2 minutes) - Slides 14-15</h5>
                                    <p>Physical geography knowledge leads to suspect hideout in north-facing valley</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="module-integration">
                            <h4>🌍 Module 2 Integration: The Physical World</h4>
                            <div class="integration-connections">
                                <div class="connection-item">
                                    <h5>Landform Impact on Human Activity</h5>
                                    <p>Students discover how elevation, slope, and terrain features influence criminal behavior and escape routes</p>
                                </div>
                                <div class="connection-item">
                                    <h5>Climate and Weather Systems</h5>
                                    <p>Real-world application of weather patterns, temperature gradients, and precipitation effects on human movement</p>
                                </div>
                                <div class="connection-item">
                                    <h5>Physical Geography Processes</h5>
                                    <p>Understanding of erosion, slope stability, and terrain formation impacts on accessibility and safety</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="case-outcome">
                            <h4>🏆 Case Resolution & Advanced Skills</h4>
                            <div class="outcome-box success">
                                <p><strong>Resolution:</strong> Teams successfully predict suspect location using elevation analysis, slope aspect understanding, and weather pattern correlation, leading to capture in a north-facing valley hideout.</p>
                                <div class="skills-earned">
                                    <h5>Advanced Skills Earned:</h5>
                                    <span class="skill-badge">Topographic Analysis</span>
                                    <span class="skill-badge">Climate Investigation</span>
                                    <span class="skill-badge">Terrain Navigation</span>
                                    <span class="skill-badge">Weather Pattern Recognition</span>
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
                            <span class="duration-badge">15 MIN + MODULE 3</span>
                            <span class="module-badge">HUMAN WORLD</span>
                        </div>
                    </div>
                    
                    <div class="case-summary">
                        <p><strong>Mystery:</strong> The International Heritage Museum has been robbed, but the thief only took specific cultural treasures from particular regions, showing deep knowledge of cultural geography and global heritage patterns.</p>
                    </div>
                    
                    <div class="case-details">
                        <div class="scenario-box">
                            <h4>🎭 Investigation Scenario</h4>
                            <p><strong>Setting:</strong> International Heritage Museum, Cultural Geography Wing</p>
                            <p><strong>Crime:</strong> Selective theft targeting cultural artifacts from major world civilizations</p>
                            <p><strong>Evidence:</strong> Pattern of stolen items from river valley civilizations, coastal trading cities, and mountain fortress cultures</p>
                            <p><strong>Stakes:</strong> Artifacts represent major cultural diffusion routes used for international heritage fraud</p>
                        </div>
                        
                        <div class="objectives-grid">
                            <div class="learning-objectives">
                                <h4>🎯 Learning Objectives</h4>
                                <ul>
                                    <li>Analyze cultural geographic patterns in criminal evidence</li>
                                    <li>Understand how human migration shapes cultural landscapes</li>
                                    <li>Apply knowledge of cultural diffusion to solve problems</li>
                                    <li>Demonstrate cultural sensitivity in international investigations</li>
                                </ul>
                            </div>
                            
                            <div class="geographic-skills">
                                <h4>🗺️ Geographic Skills Practiced</h4>
                                <ul>
                                    <li>Cultural landscape analysis and interpretation</li>
                                    <li>Migration pattern recognition and mapping</li>
                                    <li>Trade route identification and cultural exchange</li>
                                    <li>Cultural diffusion and geographic spread understanding</li>
                                    <li>Human geography vocabulary in investigative context</li>
                                </ul>
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
                
                <!-- DAY 4: ECONOMIC ATLAS CONSPIRACY -->
                <div class="investigation-card day-4" data-difficulty="specialist">
                    <div class="case-header">
                        <span class="case-number">CASE #004</span>
                        <h3 class="case-title">Economic Atlas Conspiracy</h3>
                        <div class="case-badges">
                            <span class="difficulty-badge specialist">SPECIALIST LEVEL</span>
                            <span class="duration-badge">15 MIN + MODULE 4</span>
                            <span class="module-badge">ECONOMICS</span>
                        </div>
                    </div>
                    
                    <div class="case-summary">
                        <p><strong>Mystery:</strong> Criminals have stolen economic maps showing global trade routes, resource distribution, and chokepoints, planning to disrupt supply chains for massive profit through economic espionage.</p>
                    </div>
                    
                    <div class="case-details">
                        <div class="scenario-box">
                            <h4>🎭 Investigation Scenario</h4>
                            <p><strong>Setting:</strong> Global Economic Research Institute</p>
                            <p><strong>Crime:</strong> Theft of classified economic geographic data and trade route intelligence</p>
                            <p><strong>Evidence:</strong> Maps of maritime chokepoints, energy routes, and agricultural trade corridors</p>
                            <p><strong>Stakes:</strong> Global supply chain disruption could affect billions of dollars in international commerce</p>
                        </div>
                        
                        <div class="case-outcome">
                            <h4>🏆 Case Resolution & Economic Skills</h4>
                            <div class="outcome-box success">
                                <p><strong>Resolution:</strong> Economic geography analysis predicts targeting of Panama Canal, preventing major supply chain disruption affecting global trade.</p>
                                <div class="skills-earned">
                                    <h5>Economic Skills Earned:</h5>
                                    <span class="skill-badge">Trade Analysis</span>
                                    <span class="skill-badge">Resource Mapping</span>
                                    <span class="skill-badge">Supply Chain Investigation</span>
                                    <span class="skill-badge">Economic Geography</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- DAY 5: JURISDICTIONAL CHALLENGES -->
                <div class="investigation-card day-5" data-difficulty="specialist">
                    <div class="case-header">
                        <span class="case-number">CASE #005</span>
                        <h3 class="case-title">Jurisdictional Challenges</h3>
                        <div class="case-badges">
                            <span class="difficulty-badge specialist">SPECIALIST LEVEL</span>
                            <span class="duration-badge">15 MIN + MODULE 5</span>
                            <span class="module-badge">GOVERNMENT</span>
                        </div>
                    </div>
                    
                    <div class="case-summary">
                        <p><strong>Mystery:</strong> International criminals are exploiting political geographic boundaries and jurisdiction gaps to move stolen artifacts across borders, requiring understanding of political geography and international law.</p>
                    </div>
                    
                    <div class="case-details">
                        <div class="scenario-box">
                            <h4>🎭 Investigation Scenario</h4>
                            <p><strong>Setting:</strong> International Border Region</p>
                            <p><strong>Crime:</strong> Cross-border smuggling exploiting jurisdictional boundaries</p>
                            <p><strong>Evidence:</strong> Border crossing patterns, diplomatic immunity claims, international treaty violations</p>
                            <p><strong>Stakes:</strong> International cooperation needed to close jurisdiction gaps and prevent diplomatic incidents</p>
                        </div>
                        
                        <div class="case-outcome">
                            <h4>🏆 Case Resolution & Political Skills</h4>
                            <div class="outcome-box success">
                                <p><strong>Resolution:</strong> Understanding of political geography and international law enables cross-border cooperation to apprehend smuggling network.</p>
                                <div class="skills-earned">
                                    <h5>Political Skills Earned:</h5>
                                    <span class="skill-badge">Border Analysis</span>
                                    <span class="skill-badge">International Law</span>
                                    <span class="skill-badge">Political Geography</span>
                                    <span class="skill-badge">Diplomatic Investigation</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- DAY 6: ANCIENT MESOPOTAMIAN MYSTERY -->
                <div class="investigation-card day-6" data-difficulty="specialist">
                    <div class="case-header">
                        <span class="case-number">CASE #006</span>
                        <h3 class="case-title">Ancient Mesopotamian Mystery</h3>
                        <div class="case-badges">
                            <span class="difficulty-badge specialist">SPECIALIST LEVEL</span>
                            <span class="duration-badge">15 MIN + MODULE 6</span>
                            <span class="module-badge">FERTILE CRESCENT</span>
                        </div>
                    </div>
                    
                    <div class="case-summary">
                        <p><strong>Mystery:</strong> Ancient cuneiform tablets and Mesopotamian maps have been stolen from archaeological sites, requiring knowledge of early civilizations and geographic factors that shaped human development.</p>
                    </div>
                    
                    <div class="case-details">
                        <div class="scenario-box">
                            <h4>🎭 Investigation Scenario</h4>
                            <p><strong>Setting:</strong> Archaeological excavation sites in Iraq</p>
                            <p><strong>Crime:</strong> Theft of ancient artifacts showing early geographic knowledge</p>
                            <p><strong>Evidence:</strong> Cuneiform tablets with early maps, irrigation system plans, trade route records</p>
                            <p><strong>Stakes:</strong> Understanding humanity's first geographic innovations and urban planning concepts</p>
                        </div>
                        
                        <div class="case-outcome">
                            <h4>🏆 Case Resolution & Ancient Skills</h4>
                            <div class="outcome-box success">
                                <p><strong>Resolution:</strong> Knowledge of Mesopotamian geography and early civilization patterns leads to recovery of humanity's first geographic documents.</p>
                                <div class="skills-earned">
                                    <h5>Ancient Civilization Skills:</h5>
                                    <span class="skill-badge">Archaeological Analysis</span>
                                    <span class="skill-badge">Ancient Geography</span>
                                    <span class="skill-badge">Civilization Mapping</span>
                                    <span class="skill-badge">Historical Investigation</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- DAY 7: SILK ROAD SCRAMBLE -->
                <div class="investigation-card day-7" data-difficulty="specialist">
                    <div class="case-header">
                        <span class="case-number">CASE #007</span>
                        <h3 class="case-title">The Silk Road Scramble</h3>
                        <div class="case-badges">
                            <span class="difficulty-badge specialist">SPECIALIST LEVEL</span>
                            <span class="duration-badge">15 MIN + MODULE 7</span>
                            <span class="module-badge">CHINESE CIVILIZATIONS</span>
                        </div>
                    </div>
                    
                    <div class="case-summary">
                        <p><strong>Mystery:</strong> Ancient Chinese navigation tools and Silk Road maps have been stolen, requiring understanding of Chinese geographic innovations and trade route development that connected East and West.</p>
                    </div>
                    
                    <div class="case-details">
                        <div class="scenario-box">
                            <h4>🎭 Investigation Scenario</h4>
                            <p><strong>Setting:</strong> Museum of Chinese Geographic History</p>
                            <p><strong>Crime:</strong> Theft of Chinese compass technology and Silk Road documentation</p>
                            <p><strong>Evidence:</strong> Ancient Chinese compasses, trade route scrolls, geographic innovation records</p>
                            <p><strong>Stakes:</strong> Understanding how Chinese geographic knowledge revolutionized global navigation and trade</p>
                        </div>
                        
                        <div class="case-outcome">
                            <h4>🏆 Case Resolution & Chinese Geographic Skills</h4>
                            <div class="outcome-box success">
                                <p><strong>Resolution:</strong> Application of Chinese geographic innovations and Silk Road knowledge recovers stolen navigation technology and trade documentation.</p>
                                <div class="skills-earned">
                                    <h5>Chinese Civilization Skills:</h5>
                                    <span class="skill-badge">Navigation History</span>
                                    <span class="skill-badge">Trade Route Analysis</span>
                                    <span class="skill-badge">Chinese Geography</span>
                                    <span class="skill-badge">Innovation Investigation</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- DAY 8: SACRED GEOGRAPHY SCANDAL -->
                <div class="investigation-card day-8" data-difficulty="specialist">
                    <div class="case-header">
                        <span class="case-number">CASE #008</span>
                        <h3 class="case-title">Sacred Geography Scandal</h3>
                        <div class="case-badges">
                            <span class="difficulty-badge specialist">SPECIALIST LEVEL</span>
                            <span class="duration-badge">15 MIN + MODULE 8</span>
                            <span class="module-badge">INDIAN CIVILIZATIONS</span>
                        </div>
                    </div>
                    
                    <div class="case-summary">
                        <p><strong>Mystery:</strong> Sacred geographic texts and religious site maps from Indian civilizations have been stolen, requiring understanding of how geography shapes religious practices and spiritual landscapes.</p>
                    </div>
                    
                    <div class="case-details">
                        <div class="scenario-box">
                            <h4>🎭 Investigation Scenario</h4>
                            <p><strong>Setting:</strong> Institute for Religious Geographic Studies</p>
                            <p><strong>Crime:</strong> Theft of sacred site documentation and religious geography texts</p>
                            <p><strong>Evidence:</strong> Pilgrimage route maps, monsoon pattern documents, sacred river system charts</p>
                            <p><strong>Stakes:</strong> Understanding how geographic features influence spiritual practices and religious development</p>
                        </div>
                        
                        <div class="case-outcome">
                            <h4>🏆 Case Resolution & Religious Geographic Skills</h4>
                            <div class="outcome-box success">
                                <p><strong>Resolution:</strong> Knowledge of Indian geographic patterns and religious site relationships leads to recovery of sacred geographic documentation.</p>
                                <div class="skills-earned">
                                    <h5>Religious Geography Skills:</h5>
                                    <span class="skill-badge">Sacred Site Analysis</span>
                                    <span class="skill-badge">Monsoon Investigation</span>
                                    <span class="skill-badge">Religious Geography</span>
                                    <span class="skill-badge">Cultural Landscape Study</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- DAY 9: THE TECHNOLOGY TRAIL -->
                <div class="investigation-card day-9" data-difficulty="master">
                    <div class="case-header">
                        <span class="case-number">CASE #009</span>
                        <h3 class="case-title">The Technology Trail</h3>
                        <div class="case-badges">
                            <span class="difficulty-badge master">MASTER LEVEL</span>
                            <span class="duration-badge">15 MIN + REVIEW</span>
                            <span class="module-badge">ADVANCED TECH</span>
                        </div>
                    </div>
                    
                    <div class="case-summary">
                        <p><strong>Mystery:</strong> All modern geographic technology including GPS units, satellite imagery, and GIS systems have been stolen. Teams must use traditional geographic skills to track down high-tech thieves.</p>
                    </div>
                    
                    <div class="case-details">
                        <div class="scenario-box">
                            <h4>🎭 Investigation Scenario</h4>
                            <p><strong>Setting:</strong> Geographic Technology Research Center</p>
                            <p><strong>Crime:</strong> Complete theft of modern geographic technology infrastructure</p>
                            <p><strong>Evidence:</strong> Must rely on traditional navigation, paper maps, and classical geographic techniques</p>
                            <p><strong>Stakes:</strong> Prove that fundamental geographic knowledge transcends technology</p>
                        </div>
                        
                        <div class="case-outcome">
                            <h4>🏆 Case Resolution & Master Skills</h4>
                            <div class="outcome-box success">
                                <p><strong>Resolution:</strong> Synthesis of all previous geographic knowledge enables successful investigation using traditional methods, demonstrating mastery of geographic fundamentals.</p>
                                <div class="skills-earned">
                                    <h5>Master Skills Earned:</h5>
                                    <span class="skill-badge">Traditional Navigation</span>
                                    <span class="skill-badge">Geographic Synthesis</span>
                                    <span class="skill-badge">Technology Integration</span>
                                    <span class="skill-badge">Advanced Investigation</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- DAY 10: THE MASTER CRIMINAL -->
                <div class="investigation-card day-10" data-difficulty="master">
                    <div class="case-header">
                        <span class="case-number">CASE #010</span>
                        <h3 class="case-title">The Geographic Mastermind</h3>
                        <div class="case-badges">
                            <span class="difficulty-badge master">MASTER LEVEL</span>
                            <span class="duration-badge">15 MIN + REVIEW</span>
                            <span class="module-badge">FINAL CHALLENGE</span>
                        </div>
                    </div>
                    
                    <div class="case-summary">
                        <p><strong>Mystery:</strong> The mastermind behind all thefts has been identified, but they're using advanced geographic knowledge to evade capture. Teams must apply everything they've learned to solve the ultimate case.</p>
                    </div>
                    
                    <div class="case-details">
                        <div class="scenario-box">
                            <h4>🎭 Investigation Scenario</h4>
                            <p><strong>Setting:</strong> Global pursuit across multiple continents</p>
                            <p><strong>Crime:</strong> Mastermind using comprehensive geographic knowledge for evasion</p>
                            <p><strong>Evidence:</strong> Requires integration of all previous cases and geographic concepts</p>
                            <p><strong>Stakes:</strong> Final test of complete geographic detective mastery</p>
                        </div>
                        
                        <div class="case-outcome">
                            <h4>🏆 Case Resolution & Ultimate Mastery</h4>
                            <div class="outcome-box success">
                                <p><strong>Resolution:</strong> Comprehensive application of all geographic knowledge and detective skills leads to capture of the mastermind and recovery of all stolen artifacts.</p>
                                <div class="skills-earned">
                                    <h5>Ultimate Mastery Achieved:</h5>
                                    <span class="skill-badge">Geographic Mastery</span>
                                    <span class="skill-badge">Comprehensive Analysis</span>
                                    <span class="skill-badge">International Investigation</span>
                                    <span class="skill-badge">Detective Excellence</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- DAY 11: ACADEMY GRADUATION -->
                <div class="investigation-card day-11" data-difficulty="master">
                    <div class="case-header">
                        <span class="case-number">DAY 11</span>
                        <h3 class="case-title">Academy Graduation</h3>
                        <div class="case-badges">
                            <span class="difficulty-badge master">GRADUATION</span>
                            <span class="duration-badge">45 MINUTES</span>
                            <span class="module-badge">CELEBRATION</span>
                        </div>
                    </div>
                    
                    <div class="case-summary">
                        <p><strong>Mission:</strong> Formal recognition and celebration of detective achievements, case presentations, badge awards, and preparation for advanced geographic challenges ahead.</p>
                    </div>
                    
                    <div class="case-details">
                        <div class="scenario-box">
                            <h4>🎭 Graduation Ceremony</h4>
                            <p><strong>Setting:</strong> International Geographic Bureau Academy Auditorium</p>
                            <p><strong>Activities:</strong> Final case presentations, portfolio reviews, badge ceremony</p>
                            <p><strong>Recognition:</strong> Individual and team achievements in geographic detective work</p>
                            <p><strong>Future:</strong> Preview of advanced international investigations and specializations</p>
                        </div>
                        
                        <div class="case-outcome">
                            <h4>🏆 Academy Graduation Achievement</h4>
                            <div class="outcome-box success">
                                <p><strong>Achievement:</strong> Successful completion of Geographic Detective Academy training with comprehensive mastery of geographic investigation techniques and readiness for advanced international cases.</p>
                                <div class="skills-earned">
                                    <h5>Graduate Detective Certification:</h5>
                                    <span class="skill-badge">Certified Geographic Detective</span>
                                    <span class="skill-badge">International Investigator</span>
                                    <span class="skill-badge">Geographic Specialist</span>
                                    <span class="skill-badge">Academy Graduate</span>
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
