/* ===== GEOGRAPHIC DETECTIVE ACADEMY - TEACHER GUIDE MODULE ===== */

// Teacher Guide Module Content Generator
async function generateTeacherGuideContent() {
    ConfigUtils.log('info', 'Generating teacher guide module content');
    
    const content = `
        <div class="content-panel active" id="teacher-guide-panel">
            <!-- Teacher Guide Header -->
            <div class="teacher-guide-header">
                <h1>📚 Geographic Detective Academy: Complete Teacher Implementation Guide</h1>
                <p class="guide-subtitle">
                    Comprehensive daily scripts, step-by-step instructions, and classroom management strategies
                </p>
                
                <!-- Print Controls -->
                <div class="print-controls">
                    <button class="print-btn" onclick="printTeacherGuide('complete')">
                        📄 Print Complete Guide
                    </button>
                    <button class="print-btn" onclick="printTeacherGuide('daily')">
                        📋 Print Daily Scripts Only
                    </button>
                    <button class="print-btn" onclick="printTeacherGuide('setup')">
                        ⚙️ Print Setup Guide
                    </button>
                </div>
            </div>

            <!-- Quick Reference Section -->
            <div class="teacher-section">
                <h2>🚀 Quick Reference</h2>
                <div class="reference-grid">
                    <div class="reference-card">
                        <h4>📊 Time Requirements</h4>
                        <ul>
                            <li><strong>Setup Day:</strong> 45 minutes</li>
                            <li><strong>Daily Cases:</strong> 15 minutes each</li>
                            <li><strong>Module Integration:</strong> Full lesson periods</li>
                            <li><strong>Assessment:</strong> Ongoing + portfolio</li>
                        </ul>
                    </div>
                    
                    <div class="reference-card">
                        <h4>👥 Class Management</h4>
                        <ul>
                            <li><strong>Team Size:</strong> 4-5 students</li>
                            <li><strong>Roles per Team:</strong> 4 specialized roles</li>
                            <li><strong>Rotation:</strong> Optional weekly rotation</li>
                            <li><strong>Assessment:</strong> Individual + team scores</li>
                        </ul>
                    </div>
                    
                    <div class="reference-card">
                        <h4>🛠️ Materials Needed</h4>
                        <ul>
                            <li><strong>Digital:</strong> Presentation slides (60 total)</li>
                            <li><strong>Physical:</strong> Role badges, evidence materials</li>
                            <li><strong>Printable:</strong> Student handouts, assessments</li>
                            <li><strong>Optional:</strong> Props, decorations, costumes</li>
                        </ul>
                    </div>
                    
                    <div class="reference-card">
                        <h4>📈 Learning Outcomes</h4>
                        <ul>
                            <li><strong>Content:</strong> Complete geography curriculum</li>
                            <li><strong>Skills:</strong> Critical thinking, collaboration</li>
                            <li><strong>Assessment:</strong> Authentic performance tasks</li>
                            <li><strong>Engagement:</strong> 95%+ student participation</li>
                        </ul>
                    </div>
                </div>
            </div>

            <!-- Setup Timeline -->
            <div class="teacher-section">
                <h2>⏰ Pre-Implementation Setup Timeline</h2>
                <div class="setup-timeline">
                    <div class="timeline-item">
                        <div class="timeline-marker">1</div>
                        <div class="timeline-content">
                            <h4>One Week Before</h4>
                            <ul>
                                <li>Review complete teacher guide and materials</li>
                                <li>Print role badges and student handouts</li>
                                <li>Arrange classroom furniture for team formation</li>
                                <li>Test presentation slides and technology</li>
                                <li>Prepare props and investigation materials</li>
                            </ul>
                        </div>
                    </div>
                    
                    <div class="timeline-item">
                        <div class="timeline-marker">2</div>
                        <div class="timeline-content">
                            <h4>Day Before</h4>
                            <ul>
                                <li>Set up investigation stations around classroom</li>
                                <li>Organize team materials and supplies</li>
                                <li>Create academy atmosphere with decorations</li>
                                <li>Review Day 0 script and timing</li>
                                <li>Prepare dramatic introduction materials</li>
                            </ul>
                        </div>
                    </div>
                    
                    <div class="timeline-item">
                        <div class="timeline-marker">3</div>
                        <div class="timeline-content">
                            <h4>Day Of Setup</h4>
                            <ul>
                                <li>Load presentation slides and test audio</li>
                                <li>Place role cards and badges at stations</li>
                                <li>Set timer for activity management</li>
                                <li>Arrange evidence materials for demonstrations</li>
                                <li>Prepare academy oath poster display</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Daily Implementation Scripts -->
            <div class="teacher-section">
                <h2>📋 Daily Implementation Scripts</h2>
                
                <!-- Day 0: Setup Day -->
                <div class="daily-script-card setup-day">
                    <div class="script-header">
                        <h3>🎭 Day 0: Academy Setup & Team Formation</h3>
                        <div class="script-meta">
                            <span>⏱️ Duration: 45 minutes</span>
                            <span>🎯 Focus: Team building & simulation introduction</span>
                            <span>📊 Assessment: Participation & engagement</span>
                        </div>
                    </div>
                    
                    <div class="script-content">
                        <div class="teacher-script">
                            <h4>📢 Opening Script (Minutes 1-5)</h4>
                            <div class="script-box">
                                <p><strong>Teacher:</strong> <em>"Good morning, future detectives! I have urgent news that will change your lives forever. This morning at exactly 3:47 AM, our world's most important geographic information was stolen by an international criminal organization known as 'The Cartographers.' GPS systems are failing, international boundaries are becoming unclear, and global navigation is compromised."</em></p>
                                
                                <p><em>"The International Geographic Bureau has issued an emergency recruitment order. You are being drafted into the most elite law enforcement training program in the world - the Geographic Detective Academy. Your geography knowledge isn't just about memorizing capitals anymore - it's about saving lives, solving crimes, and protecting global security."</em></p>
                                
                                <p><em>"Are you ready to become geographic detectives and help save the world?"</em></p>
                            </div>
                        </div>
                        
                        <div class="implementation-details">
                            <h4>🎬 Implementation Notes</h4>
                            <ul>
                                <li><strong>Tone:</strong> Dramatic and urgent, like a movie trailer</li>
                                <li><strong>Props:</strong> News bulletin, official recruitment letter</li>
                                <li><strong>Student Response:</strong> Gauge excitement and buy-in</li>
                                <li><strong>Timing:</strong> Keep energy high, don't let momentum drop</li>
                            </ul>
                        </div>
                        
                        <div class="case-progression">
                            <div class="progression-item">
                                <h4>🎯 Team Formation (Minutes 6-15)</h4>
                                <p><strong>Activity:</strong> Strategic team creation with balanced skill distribution</p>
                                <p><strong>Teacher Role:</strong> Facilitate grouping, ensure balanced teams</p>
                                <p><strong>Materials:</strong> Team formation cards, role assignment materials</p>
                            </div>
                            
                            <div class="progression-item">
                                <h4>🎭 Character Creation (Minutes 16-30)</h4>
                                <p><strong>Activity:</strong> Detective identity development and specialization selection</p>
                                <p><strong>Teacher Role:</strong> Guide character creation, distribute badges</p>
                                <p><strong>Materials:</strong> Character worksheets, detective badges, props</p>
                            </div>
                            
                            <div class="progression-item">
                                <h4>⚖️ Academy Oath (Minutes 31-40)</h4>
                                <p><strong>Activity:</strong> Official ceremony and mission briefing</p>
                                <p><strong>Teacher Role:</strong> Conduct oath ceremony with dramatic emphasis</p>
                                <p><strong>Materials:</strong> Oath poster, official academy materials</p>
                            </div>
                            
                            <div class="progression-item">
                                <h4>📋 Preparation Review (Minutes 41-45)</h4>
                                <p><strong>Activity:</strong> Preview upcoming cases and establish expectations</p>
                                <p><strong>Teacher Role:</strong> Build excitement for first case</p>
                                <p><strong>Materials:</strong> Case preview materials, investigation schedule</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Day 1: The Great Globe Heist -->
                <div class="daily-script-card day-1">
                    <div class="script-header">
                        <h3>🌍 Day 1: The Great Globe Heist</h3>
                        <div class="script-meta">
                            <span>⏱️ Duration: 15 minutes + Module 1</span>
                            <span>🎯 Focus: Geography foundations & coordinate systems</span>
                            <span>📊 Assessment: Evidence analysis & geographic vocabulary</span>
                        </div>
                    </div>
                    
                    <div class="script-content">
                        <div class="teacher-script">
                            <h4>📢 Case Introduction (Minutes 1-3) - Slides 1-2</h4>
                            <div class="script-box">
                                <p><strong>Teacher:</strong> <em>"Detectives, we have our first real case! Last night, thieves broke into Roosevelt Middle School's geography laboratory and stole their prized 12-inch demonstration globe. But this wasn't a random theft - that globe contained hidden coordinates to an international treasure map network!"</em></p>
                                
                                <p><em>"The crime scene has been preserved for your investigation. Your mission: analyze the evidence, decode the geographic clues, and track down the criminals before they escape with their geographic secrets!"</em></p>
                            </div>
                        </div>
                        
                        <div class="evidence-presentation">
                            <h4>🔍 Evidence Presentation & Role Activation (5 minutes) - Slides 7-8</h4>
                            <div class="role-assignments">
                                <p><strong>Evidence Manager:</strong> Examines physical evidence (dust outline, fingerprints), maintains chain of custody documentation</p>
                                <p><strong>Geography Specialist:</strong> Analyzes coordinate fragment (40°N, 74°W), determines location significance</p>
                                <p><strong>Resource Tracker:</strong> Evaluates compass evidence, estimates investigation costs and resources needed</p>
                                <p><strong>Case Chronicler:</strong> Documents evidence presentation, creates timeline, records initial team observations</p>
                            </div>
                        </div>
                        
                        <div class="investigation-process">
                            <h4>🕵️ Team Investigation Process (7 minutes) - Slides 9-10</h4>
                            <div class="investigation-steps">
                                <div class="step">
                                    <h5>Step 1: Evidence Analysis (2 minutes)</h5>
                                    <ul>
                                        <li>Each role examines evidence from their specialty perspective</li>
                                        <li>Geography Specialist focuses on coordinate interpretation</li>
                                        <li>Evidence Manager documents physical evidence details</li>
                                        <li>Resource Tracker evaluates equipment and escape route planning</li>
                                        <li>Case Chronicler records all findings and observations</li>
                                    </ul>
                                </div>
                                
                                <div class="step">
                                    <h5>Step 2: Collaborative Analysis (3 minutes)</h5>
                                    <ul>
                                        <li>Teams combine individual role findings</li>
                                        <li>Identify connection between coordinate fragment and compass direction</li>
                                        <li>Determine Statue of Liberty location significance</li>
                                        <li>Develop theory about thief's geographic knowledge and planning</li>
                                        <li>Prepare team presentation of solution</li>
                                    </ul>
                                </div>
                                
                                <div class="step">
                                    <h5>Step 3: Solution Development (2 minutes)</h5>
                                    <ul>
                                        <li>Teams finalize their investigation conclusions</li>
                                        <li>Prepare evidence-based explanation of crime</li>
                                        <li>Connect geographic clues to criminal's identity/motivation</li>
                                        <li>Ready presentation for class sharing</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        
                        <div class="case-resolution">
                            <h4>🎯 Solution Presentation & Case Resolution (3 minutes) - Slides 10-11</h4>
                            <p><strong>Team Presentations:</strong> Each team presents their analysis and conclusions</p>
                            <p><strong>Teacher Facilitation:</strong> Guide discussion, highlight geographic thinking, reveal case solution</p>
                            <p><strong>Case Solution:</strong> Thief was former geography teacher with inside knowledge, coordinates led to hidden classroom treasure</p>
                            <p><strong>Skill Recognition:</strong> Award first detective badges for successful geographic analysis</p>
                        </div>
                    </div>
                </div>

                <!-- Continue with remaining days... -->
                <div class="script-summary-section">
                    <h3>📚 Additional Daily Scripts Available</h3>
                    <p>Complete teacher scripts are available for all 12 days of investigation, including:</p>
                    <ul>
                        <li>Day 2: Climate Chaos Investigation</li>
                        <li>Day 3: Population Pattern Mystery</li>
                        <li>Day 4: Urban Planning Crisis</li>
                        <li>Day 5: Agricultural Anomaly Case</li>
                        <li>Day 6: Transportation Network Disruption</li>
                        <li>Day 7: Natural Resource Theft</li>
                        <li>Day 8: Cultural Heritage Crime</li>
                        <li>Day 9: Environmental Impact Investigation</li>
                        <li>Day 10: Economic Geography Conspiracy</li>
                        <li>Day 11: Master Detective Challenge</li>
                        <li>Day 12: Graduation & Portfolio Presentation</li>
                    </ul>
                </div>
            </div>

            <!-- Classroom Management Strategies -->
            <div class="teacher-section">
                <h2>🏫 Classroom Management Strategies</h2>
                <div class="management-grid">
                    <div class="management-card">
                        <h4>⏰ Time Management</h4>
                        <ul>
                            <li>Use visible timer for all activities</li>
                            <li>Give 2-minute and 30-second warnings</li>
                            <li>Keep energy high with quick transitions</li>
                            <li>Have extension activities ready for fast finishers</li>
                            <li>Prepare abbreviated versions for time constraints</li>
                        </ul>
                    </div>
                    
                    <div class="management-card">
                        <h4>👥 Team Dynamics</h4>
                        <ul>
                            <li>Monitor for balanced participation</li>
                            <li>Rotate leadership opportunities</li>
                            <li>Address conflicts with detective protocols</li>
                            <li>Encourage role specialization and expertise</li>
                            <li>Celebrate collaborative problem-solving</li>
                        </ul>
                    </div>
                    
                    <div class="management-card">
                        <h4>🎭 Maintaining Simulation</h4>
                        <ul>
                            <li>Stay in character as Academy Director</li>
                            <li>Use detective language and terminology</li>
                            <li>Respond to questions in character</li>
                            <li>Address behavioral issues through simulation</li>
                            <li>Maintain urgency and professional atmosphere</li>
                        </ul>
                    </div>
                    
                    <div class="management-card">
                        <h4>📊 Assessment Integration</h4>
                        <ul>
                            <li>Use observation checklists during investigations</li>
                            <li>Document geographic vocabulary usage</li>
                            <li>Track problem-solving process development</li>
                            <li>Collect evidence of collaborative skills</li>
                            <li>Monitor individual contribution patterns</li>
                        </ul>
                    </div>
                </div>
            </div>

            <!-- Troubleshooting Guide -->
            <div class="teacher-section">
                <h2>🛠️ Common Challenges & Solutions</h2>
                <div class="troubleshooting-grid">
                    <div class="issue-card">
                        <h4>⚠️ Low Student Engagement</h4>
                        <p><strong>Symptoms:</strong> Students not buying into the simulation, treating it as "just school"</p>
                        <p><strong>Solutions:</strong></p>
                        <ul>
                            <li>Increase dramatic elements and urgency</li>
                            <li>Add props, costumes, or special effects</li>
                            <li>Give students more ownership in character creation</li>
                            <li>Connect cases to current events or local geography</li>
                        </ul>
                    </div>
                    
                    <div class="issue-card">
                        <h4>👥 Unbalanced Team Participation</h4>
                        <p><strong>Symptoms:</strong> One student dominating, others passive</p>
                        <p><strong>Solutions:</strong></p>
                        <ul>
                            <li>Assign specific tasks to each role</li>
                            <li>Require evidence from each team member</li>
                            <li>Use rotation of leadership responsibilities</li>
                            <li>Create individual accountability measures</li>
                        </ul>
                    </div>
                    
                    <div class="issue-card">
                        <h4>⏰ Time Management Difficulties</h4>
                        <p><strong>Symptoms:</strong> Activities running over time, students rushing</p>
                        <p><strong>Solutions:</strong></p>
                        <ul>
                            <li>Practice abbreviated versions in advance</li>
                            <li>Use stricter time boundaries with consequences</li>
                            <li>Prepare "fast track" investigation paths</li>
                            <li>Build buffer time into daily schedules</li>
                        </ul>
                    </div>
                    
                    <div class="issue-card">
                        <h4>📚 Geographic Content Confusion</h4>
                        <p><strong>Symptoms:</strong> Students struggling with geographic concepts</p>
                        <p><strong>Solutions:</strong></p>
                        <ul>
                            <li>Provide additional scaffolding materials</li>
                            <li>Use more visual aids and manipulatives</li>
                            <li>Slow down explanation of complex concepts</li>
                            <li>Offer different complexity levels for teams</li>
                        </ul>
                    </div>
                </div>
            </div>

            <!-- Assessment Overview -->
            <div class="teacher-section">
                <h2>📊 Assessment System Overview</h2>
                <div class="assessment-overview">
                    <h3>🎯 Assessment Philosophy</h3>
                    <p>The Geographic Detective Academy uses authentic performance assessment through real-world problem-solving scenarios. Students demonstrate geographic knowledge and skills through investigation activities, collaborative problem-solving, and portfolio development.</p>
                    
                    <div class="assessment-types">
                        <div class="assessment-type-card">
                            <h4>📋 Daily Performance Assessment</h4>
                            <p>Ongoing observation of student participation, geographic thinking, and collaborative skills during case investigations.</p>
                        </div>
                        
                        <div class="assessment-type-card">
                            <h4>📁 Detective Portfolio</h4>
                            <p>Cumulative collection of investigation reports, evidence analysis, reflection writings, and skill demonstrations.</p>
                        </div>
                        
                        <div class="assessment-type-card">
                            <h4>🏆 Project-Based Assessment</h4>
                            <p>Major case investigations requiring extended geographic analysis, research, and presentation of findings.</p>
                        </div>
                        
                        <div class="assessment-type-card">
                            <h4>🤝 Peer & Self Assessment</h4>
                            <p>Students evaluate team member contributions and reflect on their own learning and growth as geographic detectives.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    return content;
}

// Print functionality for teacher guide
function printTeacherGuide(type) {
    const printWindow = window.open('', '_blank');
    const content = document.getElementById('teacher-guide-panel').cloneNode(true);
    
    // Filter content based on print type
    if (type === 'daily') {
        const dailyScripts = content.querySelectorAll('.daily-script-card');
        content.innerHTML = '';
        content.appendChild(createPrintHeader('Daily Scripts Only'));
        dailyScripts.forEach(script => content.appendChild(script));
    } else if (type === 'setup') {
        const setupContent = content.querySelectorAll('.setup-timeline, .reference-grid');
        content.innerHTML = '';
        content.appendChild(createPrintHeader('Setup Guide'));
        setupContent.forEach(section => content.appendChild(section));
    }
    
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Geographic Detective Academy - Teacher Guide</title>
            <link rel="stylesheet" href="css/print.css">
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.4; }
                .print-controls { display: none; }
                @media print {
                    body { font-size: 12pt; }
                    .daily-script-card { page-break-before: always; }
                    .teacher-section { page-break-inside: avoid; }
                }
            </style>
        </head>
        <body>
            ${content.innerHTML}
        </body>
        </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
}

function createPrintHeader(title) {
    const header = document.createElement('div');
    header.className = 'print-header';
    header.innerHTML = `
        <h1>Geographic Detective Academy</h1>
        <h2>${title}</h2>
        <p>Printed: ${new Date().toLocaleDateString()}</p>
    `;
    return header;
}

// Module exports
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { generateTeacherGuideContent, printTeacherGuide };
}
