/* ===== GEOGRAPHIC DETECTIVE ACADEMY - PRESENTATION MODULE ===== */

// Presentation Module Content Generator
async function generatePresentationContent() {
    ConfigUtils.log('info', 'Generating presentation module content');
    
    const content = `
        <div class="content-panel active" id="presentation-panel">
            <!-- Presentation Header -->
            <div class="section-header">
                <h1>🎬 Geographic Detective Academy Presentations</h1>
                <p class="mission-statement">
                    Complete slide deck for all 12 days of investigation - over 60 professionally designed slides
                </p>
            </div>

            <!-- Presentation Stats -->
            <div class="academy-stats">
                <div class="stat">
                    <div class="stat-number">60+</div>
                    <div class="stat-label">Presentation Slides</div>
                </div>
                <div class="stat">
                    <div class="stat-number">12</div>
                    <div class="stat-label">Complete Days</div>
                </div>
                <div class="stat">
                    <div class="stat-number">24</div>
                    <div class="stat-label">Geographic Modules</div>
                </div>
                <div class="stat">
                    <div class="stat-number">100%</div>
                    <div class="stat-label">Curriculum Aligned</div>
                </div>
            </div>

            <!-- Slide Navigation -->
            <div class="presentation-controls">
                <div class="slide-selector">
                    <label for="day-select">Select Investigation Day:</label>
                    <select id="day-select" onchange="loadDaySlides(this.value)">
                        <option value="">Choose a day...</option>
                        <option value="setup">Setup Day - Academy Introduction</option>
                        <option value="day1">Day 1 - The Great Globe Heist</option>
                        <option value="day2">Day 2 - Climate Chaos Investigation</option>
                        <option value="day3">Day 3 - Population Pattern Mystery</option>
                        <option value="day4">Day 4 - Urban Planning Crisis</option>
                        <option value="day5">Day 5 - Agricultural Anomaly Case</option>
                        <option value="day6">Day 6 - Transportation Network Disruption</option>
                        <option value="day7">Day 7 - Natural Resource Theft</option>
                        <option value="day8">Day 8 - Cultural Heritage Crime</option>
                        <option value="day9">Day 9 - Environmental Impact Investigation</option>
                        <option value="day10">Day 10 - Economic Geography Conspiracy</option>
                        <option value="day11">Day 11 - Master Detective Challenge</option>
                        <option value="day12">Day 12 - Graduation & Portfolio Presentation</option>
                    </select>
                </div>
                
                <div class="presentation-actions">
                    <button class="action-btn" onclick="startSlideshow()">▶️ Start Slideshow</button>
                    <button class="action-btn" onclick="downloadSlides()">📥 Download All Slides</button>
                    <button class="action-btn" onclick="printSlides()">🖨️ Print Slides</button>
                </div>
            </div>

            <!-- Slide Display Area -->
            <div class="slide-display-container">
                <div id="slide-viewer" class="slide-viewer">
                    <!-- Default state - no slides loaded -->
                    <div class="slide-placeholder">
                        <div class="placeholder-content">
                            <div class="placeholder-icon">🎯</div>
                            <h3>Select a Day to View Slides</h3>
                            <p>Choose an investigation day from the dropdown above to load the corresponding presentation slides.</p>
                            <div class="placeholder-note">
                                <strong>Note:</strong> All slides are professionally designed and include:
                                <ul>
                                    <li>Case introduction and background</li>
                                    <li>Evidence presentation visuals</li>
                                    <li>Geographic concept explanations</li>
                                    <li>Investigation guidance and timing</li>
                                    <li>Solution reveals and skill recognition</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Slide Navigation Controls -->
                <div class="slide-controls" style="display: none;">
                    <button class="nav-btn" onclick="previousSlide()">⬅️ Previous</button>
                    <span class="slide-counter">
                        Slide <span id="current-slide">1</span> of <span id="total-slides">1</span>
                    </span>
                    <button class="nav-btn" onclick="nextSlide()">Next ➡️</button>
                </div>
            </div>

            <!-- Slide Overview Grid -->
            <div class="slide-overview-section">
                <h3>📋 Complete Slide Overview</h3>
                <div class="day-sections">
                    
                    <!-- Setup Day Slides -->
                    <div class="day-section">
                        <h4>🎭 Setup Day - Academy Introduction (5 slides)</h4>
                        <div class="slide-grid">
                            <div class="slide-card" data-slide="setup-1">
                                <div class="slide-thumbnail">
                                    <div class="slide-loading">
                                        <div class="loading-content">
                                            <div class="loading-spinner">🕵️</div>
                                            <h4>Loading slide...</h4>
                                        </div>
                                    </div>
                                </div>
                                <div class="slide-info">
                                    <h5>Slide 1: Crisis Briefing</h5>
                                    <p>International Geographic Bureau emergency announcement</p>
                                </div>
                            </div>
                            
                            <div class="slide-card" data-slide="setup-2">
                                <div class="slide-thumbnail">
                                    <div class="slide-loading">
                                        <div class="loading-content">
                                            <div class="loading-spinner">🕵️</div>
                                            <h4>Loading slide...</h4>
                                        </div>
                                    </div>
                                </div>
                                <div class="slide-info">
                                    <h5>Slide 2: Academy Recruitment</h5>
                                    <p>Emergency detective recruitment and training overview</p>
                                </div>
                            </div>
                            
                            <div class="slide-card" data-slide="setup-3">
                                <div class="slide-thumbnail">
                                    <div class="slide-loading">
                                        <div class="loading-content">
                                            <div class="loading-spinner">🕵️</div>
                                            <h4>Loading slide...</h4>
                                        </div>
                                    </div>
                                </div>
                                <div class="slide-info">
                                    <h5>Slide 3: Team Formation</h5>
                                    <p>Detective team roles and responsibilities</p>
                                </div>
                            </div>
                            
                            <div class="slide-card" data-slide="setup-4">
                                <div class="slide-thumbnail">
                                    <div class="slide-loading">
                                        <div class="loading-content">
                                            <div class="loading-spinner">🕵️</div>
                                            <h4>Loading slide...</h4>
                                        </div>
                                    </div>
                                </div>
                                <div class="slide-info">
                                    <h5>Slide 4: Character Creation</h5>
                                    <p>Detective identity development and specialization</p>
                                </div>
                            </div>
                            
                            <div class="slide-card" data-slide="setup-5">
                                <div class="slide-thumbnail">
                                    <div class="slide-loading">
                                        <div class="loading-content">
                                            <div class="loading-spinner">🕵️</div>
                                            <h4>Loading slide...</h4>
                                        </div>
                                    </div>
                                </div>
                                <div class="slide-info">
                                    <h5>Slide 5: Academy Oath</h5>
                                    <p>Official ceremony and mission commitment</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Day 1 Slides -->
                    <div class="day-section">
                        <h4>🌍 Day 1 - The Great Globe Heist (6 slides)</h4>
                        <div class="slide-grid">
                            <div class="slide-card" data-slide="day1-1">
                                <div class="slide-thumbnail">
                                    <div class="slide-loading">
                                        <div class="loading-content">
                                            <div class="loading-spinner">🕵️</div>
                                            <h4>Loading slide...</h4>
                                        </div>
                                    </div>
                                </div>
                                <div class="slide-info">
                                    <h5>Slide 1: Case Briefing</h5>
                                    <p>Globe theft crime scene introduction</p>
                                </div>
                            </div>
                            
                            <div class="slide-card" data-slide="day1-2">
                                <div class="slide-thumbnail">
                                    <div class="slide-loading">
                                        <div class="loading-content">
                                            <div class="loading-spinner">🕵️</div>
                                            <h4>Loading slide...</h4>
                                        </div>
                                    </div>
                                </div>
                                <div class="slide-info">
                                    <h5>Slide 2: Crime Scene Photos</h5>
                                    <p>Evidence photography and initial observations</p>
                                </div>
                            </div>
                            
                            <div class="slide-card" data-slide="day1-3">
                                <div class="slide-thumbnail">
                                    <div class="slide-loading">
                                        <div class="loading-content">
                                            <div class="loading-spinner">🕵️</div>
                                            <h4>Loading slide...</h4>
                                        </div>
                                    </div>
                                </div>
                                <div class="slide-info">
                                    <h5>Slide 3: Evidence Analysis</h5>
                                    <p>Coordinate fragment and compass examination</p>
                                </div>
                            </div>
                            
                            <div class="slide-card" data-slide="day1-4">
                                <div class="slide-thumbnail">
                                    <div class="slide-loading">
                                        <div class="loading-content">
                                            <div class="loading-spinner">🕵️</div>
                                            <h4>Loading slide...</h4>
                                        </div>
                                    </div>
                                </div>
                                <div class="slide-info">
                                    <h5>Slide 4: Geographic Analysis</h5>
                                    <p>Coordinate system explanation and location identification</p>
                                </div>
                            </div>
                            
                            <div class="slide-card" data-slide="day1-5">
                                <div class="slide-thumbnail">
                                    <div class="slide-loading">
                                        <div class="loading-content">
                                            <div class="loading-spinner">🕵️</div>
                                            <h4>Loading slide...</h4>
                                        </div>
                                    </div>
                                </div>
                                <div class="slide-info">
                                    <h5>Slide 5: Investigation Process</h5>
                                    <p>Team collaboration and evidence compilation</p>
                                </div>
                            </div>
                            
                            <div class="slide-card" data-slide="day1-6">
                                <div class="slide-thumbnail">
                                    <div class="slide-loading">
                                        <div class="loading-content">
                                            <div class="loading-spinner">🕵️</div>
                                            <h4>Loading slide...</h4>
                                        </div>
                                    </div>
                                </div>
                                <div class="slide-info">
                                    <h5>Slide 6: Case Resolution</h5>
                                    <p>Solution reveal and skill badge awards</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Additional Day Sections -->
                    <div class="day-section collapsed">
                        <h4>🌡️ Day 2 - Climate Chaos Investigation (5 slides) <span class="expand-btn" onclick="toggleDaySection(this)">+</span></h4>
                        <div class="slide-grid" style="display: none;">
                            <p>Climate patterns, weather analysis, and atmospheric investigations</p>
                        </div>
                    </div>

                    <div class="day-section collapsed">
                        <h4>👥 Day 3 - Population Pattern Mystery (5 slides) <span class="expand-btn" onclick="toggleDaySection(this)">+</span></h4>
                        <div class="slide-grid" style="display: none;">
                            <p>Demographic analysis, migration patterns, and population distribution</p>
                        </div>
                    </div>

                    <div class="day-section collapsed">
                        <h4>🏙️ Day 4 - Urban Planning Crisis (5 slides) <span class="expand-btn" onclick="toggleDaySection(this)">+</span></h4>
                        <div class="slide-grid" style="display: none;">
                            <p>City development, infrastructure planning, and urban geography</p>
                        </div>
                    </div>

                    <div class="day-section collapsed">
                        <h4>🌾 Day 5 - Agricultural Anomaly Case (5 slides) <span class="expand-btn" onclick="toggleDaySection(this)">+</span></h4>
                        <div class="slide-grid" style="display: none;">
                            <p>Agricultural systems, food production, and land use analysis</p>
                        </div>
                    </div>

                    <div class="day-section collapsed">
                        <h4>🚗 Day 6 - Transportation Network Disruption (5 slides) <span class="expand-btn" onclick="toggleDaySection(this)">+</span></h4>
                        <div class="slide-grid" style="display: none;">
                            <p>Transportation systems, logistics, and movement patterns</p>
                        </div>
                    </div>

                    <div class="day-section collapsed">
                        <h4>💎 Day 7 - Natural Resource Theft (5 slides) <span class="expand-btn" onclick="toggleDaySection(this)">+</span></h4>
                        <div class="slide-grid" style="display: none;">
                            <p>Resource distribution, extraction, and economic geography</p>
                        </div>
                    </div>

                    <div class="day-section collapsed">
                        <h4>🏛️ Day 8 - Cultural Heritage Crime (5 slides) <span class="expand-btn" onclick="toggleDaySection(this)">+</span></h4>
                        <div class="slide-grid" style="display: none;">
                            <p>Cultural landscapes, heritage preservation, and human geography</p>
                        </div>
                    </div>

                    <div class="day-section collapsed">
                        <h4>🌍 Day 9 - Environmental Impact Investigation (5 slides) <span class="expand-btn" onclick="toggleDaySection(this)">+</span></h4>
                        <div class="slide-grid" style="display: none;">
                            <p>Environmental geography, conservation, and sustainability analysis</p>
                        </div>
                    </div>

                    <div class="day-section collapsed">
                        <h4>💰 Day 10 - Economic Geography Conspiracy (5 slides) <span class="expand-btn" onclick="toggleDaySection(this)">+</span></h4>
                        <div class="slide-grid" style="display: none;">
                            <p>Economic systems, trade patterns, and financial geography</p>
                        </div>
                    </div>

                    <div class="day-section collapsed">
                        <h4>🏆 Day 11 - Master Detective Challenge (6 slides) <span class="expand-btn" onclick="toggleDaySection(this)">+</span></h4>
                        <div class="slide-grid" style="display: none;">
                            <p>Comprehensive case requiring all geographic skills and teamwork</p>
                        </div>
                    </div>

                    <div class="day-section collapsed">
                        <h4>🎓 Day 12 - Graduation & Portfolio Presentation (4 slides) <span class="expand-btn" onclick="toggleDaySection(this)">+</span></h4>
                        <div class="slide-grid" style="display: none;">
                            <p>Portfolio presentations, skill demonstrations, and academy graduation</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Technical Information -->
            <div class="technical-info">
                <h3>💻 Technical Information</h3>
                <div class="info-grid">
                    <div class="info-card">
                        <h4>📁 File Formats</h4>
                        <ul>
                            <li>PowerPoint (.pptx) - Editable presentations</li>
                            <li>PDF (.pdf) - Print-ready versions</li>
                            <li>PNG Images - Individual slide graphics</li>
                            <li>Google Slides - Cloud collaboration</li>
                        </ul>
                    </div>
                    
                    <div class="info-card">
                        <h4>🎨 Design Features</h4>
                        <ul>
                            <li>Consistent detective academy branding</li>
                            <li>High-resolution crime scene imagery</li>
                            <li>Interactive elements and animations</li>
                            <li>Professional color scheme and typography</li>
                        </ul>
                    </div>
                    
                    <div class="info-card">
                        <h4>🛠️ Customization Options</h4>
                        <ul>
                            <li>Editable text and images</li>
                            <li>Customizable school/teacher branding</li>
                            <li>Modifiable timing and pacing</li>
                            <li>Additional slide templates included</li>
                        </ul>
                    </div>
                    
                    <div class="info-card">
                        <h4>📱 Compatibility</h4>
                        <ul>
                            <li>Microsoft PowerPoint 2016+</li>
                            <li>Google Slides (full functionality)</li>
                            <li>Apple Keynote (basic features)</li>
                            <li>Web browsers (PNG/PDF viewing)</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    `;

    return content;
}

// Slide management functions
let currentSlideIndex = 0;
let currentDaySlides = [];

async function loadDaySlides(day) {
    if (!day) return;
    
    const slideViewer = document.getElementById('slide-viewer');
    const slideControls = document.querySelector('.slide-controls');
    
    // Show loading state
    slideViewer.innerHTML = `
        <div class="slide-loading">
            <div class="loading-content">
                <div class="loading-spinner">🕵️</div>
                <h3>Loading ${day} slides...</h3>
                <p>Preparing presentation materials</p>
            </div>
        </div>
    `;
    
    try {
        // Simulate loading slides from database/API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock slide data - in production this would come from the database
        currentDaySlides = generateMockSlides(day);
        currentSlideIndex = 0;
        
        displayCurrentSlide();
        slideControls.style.display = 'flex';
        
    } catch (error) {
        slideViewer.innerHTML = `
            <div class="slide-error">
                <h3>Error Loading Slides</h3>
                <p>Could not load slides for ${day}. Please try again.</p>
                <button onclick="loadDaySlides('${day}')">Retry</button>
            </div>
        `;
    }
}

function generateMockSlides(day) {
    // This would normally fetch from the database
    const slideCounts = {
        'setup': 5,
        'day1': 6,
        'day2': 5,
        'day3': 5,
        'day4': 5,
        'day5': 5,
        'day6': 5,
        'day7': 5,
        'day8': 5,
        'day9': 5,
        'day10': 5,
        'day11': 6,
        'day12': 4
    };
    
    const count = slideCounts[day] || 5;
    const slides = [];
    
    for (let i = 1; i <= count; i++) {
        slides.push({
            id: `${day}-${i}`,
            title: `${day.toUpperCase()} - Slide ${i}`,
            imageUrl: `/images/slides/${day}_slide_${i.toString().padStart(2, '0')}.png`,
            notes: `Slide ${i} presenter notes and timing guidance`
        });
    }
    
    return slides;
}

function displayCurrentSlide() {
    if (currentDaySlides.length === 0) return;
    
    const slide = currentDaySlides[currentSlideIndex];
    const slideViewer = document.getElementById('slide-viewer');
    
    slideViewer.innerHTML = `
        <div class="slide-display">
            <img src="${slide.imageUrl}" 
                 alt="${slide.title}" 
                 class="slide-image"
                 onerror="this.src='/images/slide-placeholder.png'">
            <div class="slide-info-overlay">
                <h4>${slide.title}</h4>
                <p>${slide.notes}</p>
            </div>
        </div>
    `;
    
    // Update counter
    document.getElementById('current-slide').textContent = currentSlideIndex + 1;
    document.getElementById('total-slides').textContent = currentDaySlides.length;
}

function previousSlide() {
    if (currentSlideIndex > 0) {
        currentSlideIndex--;
        displayCurrentSlide();
    }
}

function nextSlide() {
    if (currentSlideIndex < currentDaySlides.length - 1) {
        currentSlideIndex++;
        displayCurrentSlide();
    }
}

function startSlideshow() {
    if (currentDaySlides.length === 0) {
        alert('Please select a day first to load slides.');
        return;
    }
    
    // Open slideshow in new window
    const slideshowWindow = window.open('', '_blank', 'fullscreen=yes');
    slideshowWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Geographic Detective Academy - Slideshow</title>
            <style>
                body { 
                    margin: 0; 
                    padding: 0; 
                    background: #000; 
                    display: flex; 
                    justify-content: center; 
                    align-items: center;
                    height: 100vh;
                    font-family: Arial, sans-serif;
                }
                .slide { 
                    max-width: 100%; 
                    max-height: 100%; 
                    object-fit: contain;
                }
                .controls {
                    position: fixed;
                    bottom: 20px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: rgba(255,255,255,0.9);
                    padding: 10px;
                    border-radius: 10px;
                }
                button {
                    padding: 10px 20px;
                    margin: 0 5px;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                }
            </style>
        </head>
        <body>
            <img id="slideImage" src="${currentDaySlides[0].imageUrl}" class="slide" alt="Slide">
            <div class="controls">
                <button onclick="prevSlide()">Previous</button>
                <span id="slideCounter">1 / ${currentDaySlides.length}</span>
                <button onclick="nextSlide()">Next</button>
                <button onclick="window.close()">Exit</button>
            </div>
            <script>
                let currentIndex = 0;
                const slides = ${JSON.stringify(currentDaySlides)};
                
                function updateSlide() {
                    document.getElementById('slideImage').src = slides[currentIndex].imageUrl;
                    document.getElementById('slideCounter').textContent = (currentIndex + 1) + ' / ' + slides.length;
                }
                
                function prevSlide() {
                    if (currentIndex > 0) {
                        currentIndex--;
                        updateSlide();
                    }
                }
                
                function nextSlide() {
                    if (currentIndex < slides.length - 1) {
                        currentIndex++;
                        updateSlide();
                    }
                }
                
                // Keyboard navigation
                document.addEventListener('keydown', function(e) {
                    if (e.key === 'ArrowLeft') prevSlide();
                    if (e.key === 'ArrowRight') nextSlide();
                    if (e.key === 'Escape') window.close();
                });
            </script>
        </body>
        </html>
    `);
}

function downloadSlides() {
    // This would trigger a download of all slides
    alert('Slide download functionality will be implemented with the backend API.');
}

function printSlides() {
    if (currentDaySlides.length === 0) {
        alert('Please select a day first to load slides.');
        return;
    }
    
    const printWindow = window.open('', '_blank');
    let slideHTML = '';
    
    currentDaySlides.forEach((slide, index) => {
        slideHTML += `
            <div style="page-break-before: ${index > 0 ? 'always' : 'auto'}; text-align: center;">
                <h3>${slide.title}</h3>
                <img src="${slide.imageUrl}" style="max-width: 100%; height: auto;" alt="${slide.title}">
                <p style="margin-top: 20px; font-size: 12px;">${slide.notes}</p>
            </div>
        `;
    });
    
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Geographic Detective Academy - Slide Printout</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                @media print { body { margin: 0; } }
            </style>
        </head>
        <body>
            <h1>Geographic Detective Academy - Slide Printout</h1>
            ${slideHTML}
        </body>
        </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
}

function toggleDaySection(btn) {
    const daySection = btn.closest('.day-section');
    const slideGrid = daySection.querySelector('.slide-grid');
    
    if (daySection.classList.contains('collapsed')) {
        daySection.classList.remove('collapsed');
        slideGrid.style.display = 'grid';
        btn.textContent = '-';
    } else {
        daySection.classList.add('collapsed');
        slideGrid.style.display = 'none';
        btn.textContent = '+';
    }
}

// Module exports
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        generatePresentationContent, 
        loadDaySlides, 
        startSlideshow, 
        downloadSlides, 
        printSlides 
    };
}
