/* ===== GEOGRAPHIC DETECTIVE ACADEMY - OVERVIEW MODULE ===== */

// Overview Module Content Generator
async function generateOverviewContent() {
    ConfigUtils.log('info', 'Generating overview module content');
    
    const content = `
        <div class="content-panel active" id="overview-panel">
            <div class="section-header">
                <h1>🎯 Geographic Detective Academy Overview</h1>
                <p class="mission-statement">
                    Welcome to the Geographic Detective Academy - A comprehensive 12-day simulation 
                    that transforms students into geography experts through mystery-solving and investigation.
                </p>
            </div>

            <div class="academy-stats">
                <div class="stat">
                    <div class="stat-number">12</div>
                    <div class="stat-label">Days of Investigation</div>
                </div>
                <div class="stat">
                    <div class="stat-number">6</div>
                    <div class="stat-label">Major Cases</div>
                </div>
                <div class="stat">
                    <div class="stat-number">25+</div>
                    <div class="stat-label">Geographic Skills</div>
                </div>
                <div class="stat">
                    <div class="stat-number">100+</div>
                    <div class="stat-label">Student Materials</div>
                </div>
            </div>

            <div class="overview-content">
                <div class="grid-2">
                    <div class="card">
                        <div class="card-header">
                            <h3>🗺️ Academy Mission</h3>
                        </div>
                        <div class="card-body">
                            <p>
                                Students become geographic detectives investigating the mysterious disappearance 
                                of crucial geographic maps and data. Through this engaging simulation, they master 
                                essential geography concepts while developing critical thinking and problem-solving skills.
                            </p>
                            <ul>
                                <li>Physical Geography Investigation</li>
                                <li>Climate Pattern Analysis</li>
                                <li>Cultural Geography Mysteries</li>
                                <li>Environmental Impact Assessment</li>
                                <li>Urban Planning Challenges</li>
                                <li>Political Geography Cases</li>
                            </ul>
                        </div>
                    </div>

                    <div class="card">
                        <div class="card-header">
                            <h3>🎓 Learning Objectives</h3>
                        </div>
                        <div class="card-body">
                            <h4>Geographic Knowledge</h4>
                            <ul>
                                <li>Master physical and human geography concepts</li>
                                <li>Understand spatial relationships and patterns</li>
                                <li>Analyze geographic data and evidence</li>
                            </ul>
                            
                            <h4>Critical Skills</h4>
                            <ul>
                                <li>Problem-solving and deductive reasoning</li>
                                <li>Collaboration and communication</li>
                                <li>Research and analysis techniques</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div class="card">
                    <div class="card-header">
                        <h3>📅 12-Day Structure Overview</h3>
                    </div>
                    <div class="card-body">
                        <div class="timeline-overview">
                            <div class="timeline-section">
                                <h4>🏁 Setup & Introduction (Day 1)</h4>
                                <p>Academy orientation, team formation, and mystery introduction</p>
                            </div>
                            
                            <div class="timeline-section">
                                <h4>🏔️ Physical Geography Cases (Days 2-3)</h4>
                                <p>Landforms, geology, and physical processes investigations</p>
                            </div>
                            
                            <div class="timeline-section">
                                <h4>🌦️ Climate Investigation (Day 4)</h4>
                                <p>Weather patterns, climate zones, and atmospheric mysteries</p>
                            </div>
                            
                            <div class="timeline-section">
                                <h4>🌍 Environmental Cases (Days 5-6)</h4>
                                <p>Ecosystem analysis and environmental impact investigations</p>
                            </div>
                            
                            <div class="timeline-section">
                                <h4>🏛️ Cultural Geography (Days 7-8)</h4>
                                <p>Population, culture, and human settlement pattern analysis</p>
                            </div>
                            
                            <div class="timeline-section">
                                <h4>🏙️ Urban Geography (Days 9-10)</h4>
                                <p>City planning, urban development, and infrastructure mysteries</p>
                            </div>
                            
                            <div class="timeline-section">
                                <h4>🗳️ Political Geography (Day 11)</h4>
                                <p>Borders, governance, and political spatial relationships</p>
                            </div>
                            
                            <div class="timeline-section">
                                <h4>🎯 Final Investigation (Day 12)</h4>
                                <p>Culminating case synthesis and academy graduation</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="grid-3">
                    <div class="card">
                        <div class="card-header">
                            <h3>👥 Team Structure</h3>
                        </div>
                        <div class="card-body">
                            <div class="role-preview">
                                <div class="role-item">
                                    <span class="role-icon">🕵️</span>
                                    <span class="role-name">Lead Detective</span>
                                </div>
                                <div class="role-item">
                                    <span class="role-icon">🗺️</span>
                                    <span class="role-name">Cartographer</span>
                                </div>
                                <div class="role-item">
                                    <span class="role-icon">🌍</span>
                                    <span class="role-name">Field Researcher</span>
                                </div>
                                <div class="role-item">
                                    <span class="role-icon">📊</span>
                                    <span class="role-name">Data Analyst</span>
                                </div>
                            </div>
                            <button class="btn btn-secondary btn-block" onclick="window.navigationController.navigateToPanel('team-roles', 'team-roles')">
                                View All Roles
                            </button>
                        </div>
                    </div>

                    <div class="card">
                        <div class="card-header">
                            <h3>📚 Resources Included</h3>
                        </div>
                        <div class="card-body">
                            <ul class="resource-list">
                                <li>Complete Teacher Implementation Guide</li>
                                <li>Daily Lesson Plans & Scripts</li>
                                <li>Student Investigation Worksheets</li>
                                <li>Assessment Rubrics & Tools</li>
                                <li>Interactive Maps & Visual Aids</li>
                                <li>Extension Activities</li>
                            </ul>
                            <button class="btn btn-secondary btn-block" onclick="window.navigationController.navigateToPanel('student-materials', 'student-materials')">
                                Browse Materials
                            </button>
                        </div>
                    </div>

                    <div class="card">
                        <div class="card-header">
                            <h3>📊 Assessment System</h3>
                        </div>
                        <div class="card-body">
                            <div class="assessment-types">
                                <div class="assessment-type">
                                    <h5>Daily Investigations</h5>
                                    <p>Case-solving assessments</p>
                                </div>
                                <div class="assessment-type">
                                    <h5>Portfolio Development</h5>
                                    <p>Evidence collection & analysis</p>
                                </div>
                                <div class="assessment-type">
                                    <h5>Final Project</h5>
                                    <p>Comprehensive case presentation</p>
                                </div>
                            </div>
                            <button class="btn btn-secondary btn-block" onclick="window.navigationController.navigateToPanel('assessment-system', 'assessment-system')">
                                View Assessment Framework
                            </button>
                        </div>
                    </div>
                </div>

                <div class="card">
                    <div class="card-header">
                        <h3>🚀 Quick Start Guide</h3>
                    </div>
                    <div class="card-body">
                        <div class="quick-start-steps">
                            <div class="step-item">
                                <div class="step-number">1</div>
                                <div class="step-content">
                                    <h4>Review Teacher Guide</h4>
                                    <p>Start with the comprehensive implementation guide to understand the full curriculum structure and requirements.</p>
                                    <button class="btn btn-primary btn-sm" onclick="window.navigationController.navigateToPanel('teacher-guide', 'teacher-guide')">
                                        Open Teacher Guide
                                    </button>
                                </div>
                            </div>
                            
                            <div class="step-item">
                                <div class="step-number">2</div>
                                <div class="step-content">
                                    <h4>Explore Daily Structure</h4>
                                    <p>Examine the 12-day breakdown to plan your implementation timeline and prepare materials.</p>
                                    <button class="btn btn-primary btn-sm" onclick="window.navigationController.navigateToPanel('daily-structure', 'daily-structure')">
                                        View Daily Plans
                                    </button>
                                </div>
                            </div>
                            
                            <div class="step-item">
                                <div class="step-number">3</div>
                                <div class="step-content">
                                    <h4>Download Materials</h4>
                                    <p>Access all student worksheets, teacher resources, and assessment tools in one comprehensive package.</p>
                                    <button class="btn btn-primary btn-sm" onclick="window.navigationController.navigateToPanel('complete-package', 'complete-package')">
                                        Get Complete Package
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Initialize interactive elements
    setTimeout(() => {
        initializeOverviewInteractions();
    }, 100);

    return content;
}

// Initialize overview-specific interactions
function initializeOverviewInteractions() {
    // Animate stats on load
    animateStats();
    
    // Setup timeline hover effects
    setupTimelineEffects();
    
    // Initialize quick start guide
    setupQuickStartGuide();
    
    ConfigUtils.log('debug', 'Overview interactions initialized');
}

// Animate statistics counters
function animateStats() {
    const stats = document.querySelectorAll('.stat-number');
    
    stats.forEach(stat => {
        const finalValue = parseInt(stat.textContent);
        let currentValue = 0;
        const increment = finalValue / 30;
        
        const animation = setInterval(() => {
            currentValue += increment;
            if (currentValue >= finalValue) {
                stat.textContent = finalValue + (stat.textContent.includes('+') ? '+' : '');
                clearInterval(animation);
            } else {
                stat.textContent = Math.floor(currentValue);
            }
        }, 50);
    });
}

// Setup timeline section effects
function setupTimelineEffects() {
    const timelineSections = document.querySelectorAll('.timeline-section');
    
    timelineSections.forEach(section => {
        section.addEventListener('mouseenter', () => {
            section.style.transform = 'translateX(10px)';
            section.style.boxShadow = '0 4px 15px rgba(26, 35, 126, 0.2)';
        });
        
        section.addEventListener('mouseleave', () => {
            section.style.transform = '';
            section.style.boxShadow = '';
        });
    });
}

// Setup quick start guide interactions
function setupQuickStartGuide() {
    const stepItems = document.querySelectorAll('.step-item');
    
    stepItems.forEach((step, index) => {
        // Delayed animation
        setTimeout(() => {
            step.style.opacity = '1';
            step.style.transform = 'translateY(0)';
        }, index * 200);
        
        // Click to expand functionality could be added here
    });
}

// Add custom styles for overview module
const overviewStyles = `
    <style>
        .academy-stats {
            display: flex;
            justify-content: center;
            gap: 3rem;
            margin: 3rem 0;
            flex-wrap: wrap;
        }
        
        .stat {
            text-align: center;
            padding: 2rem;
            background: rgba(255, 255, 255, 0.9);
            border-radius: 15px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
            min-width: 150px;
            transition: transform 0.3s ease;
        }
        
        .stat:hover {
            transform: translateY(-5px);
        }
        
        .stat-number {
            font-size: 3rem;
            font-weight: 900;
            color: #1a237e;
            margin-bottom: 0.5rem;
        }
        
        .stat-label {
            font-size: 0.9rem;
            color: #666;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .timeline-overview {
            display: grid;
            gap: 1.5rem;
        }
        
        .timeline-section {
            padding: 1.5rem;
            border-left: 4px solid #1a237e;
            background: #f8f9fa;
            border-radius: 8px;
            transition: all 0.3s ease;
        }
        
        .timeline-section h4 {
            margin: 0 0 0.5rem 0;
            color: #1a237e;
        }
        
        .timeline-section p {
            margin: 0;
            color: #666;
        }
        
        .role-preview {
            display: grid;
            gap: 0.75rem;
            margin-bottom: 1.5rem;
        }
        
        .role-item {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.75rem;
            background: #f8f9fa;
            border-radius: 8px;
            transition: background 0.3s ease;
        }
        
        .role-item:hover {
            background: #e9ecef;
        }
        
        .role-icon {
            font-size: 1.5rem;
        }
        
        .role-name {
            font-weight: 600;
            color: #333;
        }
        
        .resource-list {
            margin: 0 0 1.5rem 0;
            padding-left: 1.5rem;
        }
        
        .resource-list li {
            margin: 0.5rem 0;
            color: #555;
        }
        
        .assessment-types {
            margin-bottom: 1.5rem;
        }
        
        .assessment-type {
            margin-bottom: 1rem;
        }
        
        .assessment-type h5 {
            margin: 0 0 0.25rem 0;
            color: #1a237e;
        }
        
        .assessment-type p {
            margin: 0;
            color: #666;
            font-size: 0.9rem;
        }
        
        .quick-start-steps {
            display: grid;
            gap: 2rem;
        }
        
        .step-item {
            display: flex;
            gap: 1.5rem;
            opacity: 0;
            transform: translateY(20px);
            transition: all 0.5s ease;
        }
        
        .step-number {
            flex-shrink: 0;
            width: 50px;
            height: 50px;
            background: #1a237e;
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 1.2rem;
        }
        
        .step-content h4 {
            margin: 0 0 0.5rem 0;
            color: #333;
        }
        
        .step-content p {
            margin: 0 0 1rem 0;
            color: #666;
            line-height: 1.5;
        }
        
        .btn-block {
            width: 100%;
            margin-top: 1rem;
        }
        
        .btn-sm {
            padding: 0.5rem 1rem;
            font-size: 0.9rem;
        }
        
        @media (max-width: 768px) {
            .academy-stats {
                flex-direction: column;
                align-items: center;
                gap: 1.5rem;
            }
            
            .grid-2, .grid-3 {
                grid-template-columns: 1fr;
            }
            
            .step-item {
                flex-direction: column;
                text-align: center;
            }
        }
    </style>
`;

// Inject styles when module loads
if (!document.getElementById('overview-styles')) {
    const styleElement = document.createElement('div');
    styleElement.id = 'overview-styles';
    styleElement.innerHTML = overviewStyles;
    document.head.appendChild(styleElement);
}

ConfigUtils.log('info', 'Overview module loaded');
