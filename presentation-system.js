/**
 * Geographic Detective Academy Presentation System
 * Integrates the 60-slide presentation directly into the simulation interface
 */

class SimulationPresentation {
    constructor() {
        this.currentSlide = 1;
        this.totalSlides = 60;
        this.slidesPath = '/slides/';
        this.fullscreenMode = false;
        this.autoPlay = false;
        this.slideNotes = {};
        this.initializePresentation();
    }

    initializePresentation() {
        this.createPresentationInterface();
        this.setupKeyboardNavigation();
        this.loadSlideNotes();
    }

    createPresentationInterface() {
        const presentationHTML = `
            <div id="presentation-container" class="presentation-container">
                <div class="presentation-header">
                    <div class="presentation-title">
                        <h2>🕵️ Geographic Detective Academy Presentation</h2>
                        <div class="slide-counter">Slide <span id="current-slide">1</span> of ${this.totalSlides}</div>
                    </div>
                    <div class="presentation-controls">
                        <button class="btn-control" onclick="presentation.toggleFullscreen()">
                            <span class="icon">⛶</span> Fullscreen
                        </button>
                        <button class="btn-control" onclick="presentation.toggleAutoPlay()">
                            <span class="icon">▶️</span> Auto Play
                        </button>
                        <button class="btn-control" onclick="presentation.downloadSlide()">
                            <span class="icon">📥</span> Download
                        </button>
                    </div>
                </div>

                <div class="presentation-viewer">
                    <div class="slide-container">
                        <img id="current-slide-image" 
                             src="${this.slidesPath}1_Geographic-Detective-Academy.png" 
                             alt="Slide 1"
                             class="slide-image">
                        
                        <div class="slide-overlay">
                            <button class="nav-btn prev-btn" onclick="presentation.previousSlide()">
                                <span class="icon">◀️</span>
                            </button>
                            <button class="nav-btn next-btn" onclick="presentation.nextSlide()">
                                <span class="icon">▶️</span>
                            </button>
                        </div>

                        <div class="slide-annotations" id="slide-annotations">
                            <!-- Dynamic annotations will be loaded here -->
                        </div>
                    </div>

                    <div class="slide-notes-panel" id="slide-notes-panel">
                        <h4>📝 Slide Notes & Key Points</h4>
                        <div id="slide-notes-content">
                            Loading slide notes...
                        </div>
                    </div>
                </div>

                <div class="presentation-footer">
                    <div class="slide-thumbnails" id="slide-thumbnails">
                        <!-- Thumbnail navigation will be generated here -->
                    </div>
                    
                    <div class="presentation-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${(1/this.totalSlides) * 100}%"></div>
                        </div>
                        <div class="slide-timer" id="slide-timer">00:00</div>
                    </div>
                </div>
            </div>
        `;

        return presentationHTML;
    }

    // Add presentation panel to existing simulation
    addToPresentationPanel() {
        const presentationPanel = document.getElementById('gamma-prompts');
        if (presentationPanel) {
            presentationPanel.innerHTML = `
                <h2>🎮 Interactive Presentation</h2>
                <p class="subtitle">Navigate through the complete Geographic Detective Academy presentation</p>
                ${this.createPresentationInterface()}
            `;
        }
    }

    nextSlide() {
        if (this.currentSlide < this.totalSlides) {
            this.currentSlide++;
            this.updateSlide();
        }
    }

    previousSlide() {
        if (this.currentSlide > 1) {
            this.currentSlide--;
            this.updateSlide();
        }
    }

    goToSlide(slideNumber) {
        if (slideNumber >= 1 && slideNumber <= this.totalSlides) {
            this.currentSlide = slideNumber;
            this.updateSlide();
        }
    }

    updateSlide() {
        const slideImage = document.getElementById('current-slide-image');
        const slideCounter = document.getElementById('current-slide');
        const progressFill = document.querySelector('.progress-fill');

        if (slideImage) {
            // Use the actual file names from the uploaded slides
            const slideFiles = [
                '1_Geographic-Detective-Academy.png',
                '2_URGENT-Global-Geographic-Crisis.png',
                '3_Your-Mission-Become-Geographic-Crime-Specialists.png',
                '4_Evidence-Manager.png',
                '5_Your-Path-to-Mastery.png',
                '6_CASE-FILE-001.png',
                '7_Day-1-The-Great-Globe-Heist.png',
                '8_Crime-Scene-Investigation.png',
                '9_Witness-Interview-Janitor-Bob.png',
                '10_Your-First-Geographic-Challenge.png',
                '11_CASE-SOLVED.png',
                '12_Skills-Earned-Day-1.png',
                '13_CASE-FILE-002.png',
                '14_Day-2-Mountains-of-Mystery.png',
                '15_Crime-Scene-Survey-Office-Break-In.png',
                '16_Witness-Interview-Dr-Sarah-Chen-Chief-Cartographer.png',
                '17_Physical-Geography-Challenge.png',
                '18_Elevation-Detective-Work.png',
                '19_CASE-SOLVED.png',
                '20_Skills-Earned-Day-2.png',
                '21_CASE-FILE-003.png',
                '22_Day-3-International-Heritage-Heist.png',
                '23_Stolen-Cultural-Treasures.png',
                '24_Witness-Interview-Museum-Director-Maria-Santos.png',
                '25_Geographic-Culture-Connection.png',
                '26_Cultural-Geography-Challenge.png',
                '27_CASE-SOLVED.png',
                '28_Skills-Earned-Day-3.png',
                '29_CASE-FILE-004-005.png',
                '30_Days-4-5-Economic-Espionage.png',
                '31_Multi-Day-Investigation-Economic-Intelligence-Theft.png',
                '32_Economic-Geography-Understanding-Trade.png',
                '33_Witness-Interview-Trade-Specialist-Dr-James-Morrison.png',
                '34_Resource-Geography-Challenge.png',
                '35_Government-Systems-Under-Attack.png',
                '36_Economic-Crime-Pattern-Analysis.png',
                '37_CASE-SOLVED.png',
                '38_Skills-Earned-Days-4-5.png',
                '39_CASE-FILE-006-008.png',
                '40_Days-6-8-Archaeological-Adventure.png',
                '41_Multi-Site-Archaeological-Crime-Scene.png',
                '42_River-Valley-Civilizations-Pattern.png',
                '43_Witness-Interview-Dr-Elena-Rodriguez-Lead-Archaeologist.png',
                '44_Ancient-Geographic-Technology.png',
                '45_Historical-Geography-Challenge.png',
                '46_Ancient-Civilization-Geographic-Comparison.png',
                '47_CASE-SOLVED.png',
                '48_Skills-Earned-Days-6-8.png',
                '49_CASE-FILE-009-011.png',
                '50_Days-9-11-The-Final-Confrontation.png',
                '51_The-Cartographers-Master-Plan-Revealed.png',
                '52_Global-Criminal-Network-Analysis.png',
                '53_Elite-Task-Force-Assembly.png',
                '54_Advanced-Geographic-Intelligence-Challenge.png',
                '55_The-Cartographers-Location-Discovered.png',
                '56_Epic-Geographic-Skills-Integration.png',
                '57_The-Final-Confrontation.png',
                '58_ULTIMATE-VICTORY.png',
                '59_Your-Geographic-Detective-Academy-Graduation.png',
                '60_Your-Geographic-Legacy.png'
            ];
            
            const currentFile = slideFiles[this.currentSlide - 1];
            slideImage.src = `${this.slidesPath}${currentFile}`;
            slideImage.alt = `Slide ${this.currentSlide}`;
        }

        if (slideCounter) {
            slideCounter.textContent = this.currentSlide;
        }

        if (progressFill) {
            progressFill.style.width = `${(this.currentSlide / this.totalSlides) * 100}%`;
        }

        this.updateSlideNotes();
        this.highlightCurrentThumbnail();
    }

    updateSlideNotes() {
        const notesContent = document.getElementById('slide-notes-content');
        if (notesContent) {
            const notes = this.slideNotes[this.currentSlide] || this.getDefaultSlideNotes();
            notesContent.innerHTML = `
                <div class="slide-note-item">
                    <h5>🎯 Key Learning Objectives:</h5>
                    <ul>
                        ${notes.objectives.map(obj => `<li>${obj}</li>`).join('')}
                    </ul>
                </div>
                <div class="slide-note-item">
                    <h5>🗣️ Discussion Points:</h5>
                    <ul>
                        ${notes.discussion.map(point => `<li>${point}</li>`).join('')}
                    </ul>
                </div>
                <div class="slide-note-item">
                    <h5>🔗 Geographic Connections:</h5>
                    <p>${notes.geographicConnection}</p>
                </div>
            `;
        }
    }

    getDefaultSlideNotes() {
        // Provide default notes structure based on slide ranges
        if (this.currentSlide <= 10) {
            return {
                objectives: ["Introduction to Geographic Detective Academy", "Understanding the simulation framework", "Setting up investigation mindset"],
                discussion: ["What makes a good detective?", "How do geographic skills help solve mysteries?", "What tools do geographers use?"],
                geographicConnection: "Foundation geographic concepts and spatial thinking skills."
            };
        } else if (this.currentSlide <= 30) {
            return {
                objectives: ["Team role assignments", "Investigation procedures", "Geographic tool usage"],
                discussion: ["How do different roles contribute to investigation?", "What evidence is most important?", "How do we analyze geographic clues?"],
                geographicConnection: "Practical application of geographic themes and spatial analysis."
            };
        } else if (this.currentSlide <= 50) {
            return {
                objectives: ["Case study analysis", "Advanced geographic concepts", "Problem-solving strategies"],
                discussion: ["What patterns do you notice?", "How does this connect to real-world geography?", "What would you do differently?"],
                geographicConnection: "Complex geographic relationships and systems thinking."
            };
        } else {
            return {
                objectives: ["Assessment and reflection", "Real-world applications", "Next steps and extensions"],
                discussion: ["What did you learn?", "How will you use these skills?", "What questions do you still have?"],
                geographicConnection: "Integration and application of all geographic concepts learned."
            };
        }
    }

    generateThumbnails() {
        const thumbnailContainer = document.getElementById('slide-thumbnails');
        if (!thumbnailContainer) return;

        const slideFiles = [
            '1_Geographic-Detective-Academy.png',
            '2_URGENT-Global-Geographic-Crisis.png',
            '3_Your-Mission-Become-Geographic-Crime-Specialists.png',
            '4_Evidence-Manager.png',
            '5_Your-Path-to-Mastery.png',
            '6_CASE-FILE-001.png',
            '7_Day-1-The-Great-Globe-Heist.png',
            '8_Crime-Scene-Investigation.png',
            '9_Witness-Interview-Janitor-Bob.png',
            '10_Your-First-Geographic-Challenge.png',
            '11_CASE-SOLVED.png',
            '12_Skills-Earned-Day-1.png',
            '13_CASE-FILE-002.png',
            '14_Day-2-Mountains-of-Mystery.png',
            '15_Crime-Scene-Survey-Office-Break-In.png',
            '16_Witness-Interview-Dr-Sarah-Chen-Chief-Cartographer.png',
            '17_Physical-Geography-Challenge.png',
            '18_Elevation-Detective-Work.png',
            '19_CASE-SOLVED.png',
            '20_Skills-Earned-Day-2.png',
            '21_CASE-FILE-003.png',
            '22_Day-3-International-Heritage-Heist.png',
            '23_Stolen-Cultural-Treasures.png',
            '24_Witness-Interview-Museum-Director-Maria-Santos.png',
            '25_Geographic-Culture-Connection.png',
            '26_Cultural-Geography-Challenge.png',
            '27_CASE-SOLVED.png',
            '28_Skills-Earned-Day-3.png',
            '29_CASE-FILE-004-005.png',
            '30_Days-4-5-Economic-Espionage.png',
            '31_Multi-Day-Investigation-Economic-Intelligence-Theft.png',
            '32_Economic-Geography-Understanding-Trade.png',
            '33_Witness-Interview-Trade-Specialist-Dr-James-Morrison.png',
            '34_Resource-Geography-Challenge.png',
            '35_Government-Systems-Under-Attack.png',
            '36_Economic-Crime-Pattern-Analysis.png',
            '37_CASE-SOLVED.png',
            '38_Skills-Earned-Days-4-5.png',
            '39_CASE-FILE-006-008.png',
            '40_Days-6-8-Archaeological-Adventure.png',
            '41_Multi-Site-Archaeological-Crime-Scene.png',
            '42_River-Valley-Civilizations-Pattern.png',
            '43_Witness-Interview-Dr-Elena-Rodriguez-Lead-Archaeologist.png',
            '44_Ancient-Geographic-Technology.png',
            '45_Historical-Geography-Challenge.png',
            '46_Ancient-Civilization-Geographic-Comparison.png',
            '47_CASE-SOLVED.png',
            '48_Skills-Earned-Days-6-8.png',
            '49_CASE-FILE-009-011.png',
            '50_Days-9-11-The-Final-Confrontation.png',
            '51_The-Cartographers-Master-Plan-Revealed.png',
            '52_Global-Criminal-Network-Analysis.png',
            '53_Elite-Task-Force-Assembly.png',
            '54_Advanced-Geographic-Intelligence-Challenge.png',
            '55_The-Cartographers-Location-Discovered.png',
            '56_Epic-Geographic-Skills-Integration.png',
            '57_The-Final-Confrontation.png',
            '58_ULTIMATE-VICTORY.png',
            '59_Your-Geographic-Detective-Academy-Graduation.png',
            '60_Your-Geographic-Legacy.png'
        ];

        let thumbnailHTML = '';
        for (let i = 1; i <= this.totalSlides; i++) {
            const currentFile = slideFiles[i - 1];
            thumbnailHTML += `
                <div class="thumbnail-item ${i === this.currentSlide ? 'active' : ''}" 
                     onclick="presentation.goToSlide(${i})" 
                     title="Slide ${i}">
                    <img src="${this.slidesPath}${currentFile}" 
                         alt="Slide ${i} thumbnail"
                         class="thumbnail-image">
                    <div class="thumbnail-number">${i}</div>
                </div>
            `;
        }
        thumbnailContainer.innerHTML = thumbnailHTML;
    }

    highlightCurrentThumbnail() {
        const thumbnails = document.querySelectorAll('.thumbnail-item');
        thumbnails.forEach((thumb, index) => {
            if (index + 1 === this.currentSlide) {
                thumb.classList.add('active');
            } else {
                thumb.classList.remove('active');
            }
        });
    }

    toggleFullscreen() {
        const container = document.getElementById('presentation-container');
        if (!this.fullscreenMode) {
            if (container.requestFullscreen) {
                container.requestFullscreen();
            }
            container.classList.add('fullscreen-mode');
            this.fullscreenMode = true;
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
            container.classList.remove('fullscreen-mode');
            this.fullscreenMode = false;
        }
    }

    toggleAutoPlay() {
        this.autoPlay = !this.autoPlay;
        if (this.autoPlay) {
            this.startAutoPlay();
        } else {
            this.stopAutoPlay();
        }
    }

    startAutoPlay() {
        this.autoPlayInterval = setInterval(() => {
            if (this.currentSlide < this.totalSlides) {
                this.nextSlide();
            } else {
                this.stopAutoPlay();
            }
        }, 5000); // 5 seconds per slide
    }

    stopAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
        this.autoPlay = false;
    }

    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            if (e.target.closest('.presentation-container')) {
                switch (e.key) {
                    case 'ArrowRight':
                    case ' ':
                        e.preventDefault();
                        this.nextSlide();
                        break;
                    case 'ArrowLeft':
                        e.preventDefault();
                        this.previousSlide();
                        break;
                    case 'Home':
                        e.preventDefault();
                        this.goToSlide(1);
                        break;
                    case 'End':
                        e.preventDefault();
                        this.goToSlide(this.totalSlides);
                        break;
                    case 'Escape':
                        if (this.fullscreenMode) {
                            this.toggleFullscreen();
                        }
                        break;
                }
            }
        });
    }

    downloadSlide() {
        const slideImage = document.getElementById('current-slide-image');
        if (slideImage) {
            const link = document.createElement('a');
            link.href = slideImage.src;
            link.download = `geographic-detective-academy-slide-${this.currentSlide}.png`;
            link.click();
        }
    }

    loadSlideNotes() {
        // This would typically load from a JSON file or API
        // For now, we'll use the default note generation
        console.log('📝 Slide notes loaded');
    }
}

// Enhanced CSS for presentation system
const presentationStyles = `
<style>
.presentation-container {
    background: #1a1a1a;
    color: white;
    border-radius: 15px;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
}

.presentation-header {
    background: linear-gradient(135deg, #2c3e50, #3498db);
    padding: 1rem 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.presentation-title h2 {
    margin: 0;
    color: #ecf0f1;
}

.slide-counter {
    color: #bdc3c7;
    font-size: 0.9rem;
    margin-top: 0.25rem;
}

.presentation-controls {
    display: flex;
    gap: 1rem;
}

.btn-control {
    background: rgba(255,255,255,0.2);
    border: none;
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 20px;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.btn-control:hover {
    background: rgba(255,255,255,0.3);
    transform: translateY(-2px);
}

.presentation-viewer {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 1rem;
    padding: 1rem;
    min-height: 500px;
}

.slide-container {
    position: relative;
    background: #2c3e50;
    border-radius: 10px;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
}

.slide-image {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    border-radius: 8px;
}

.slide-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
}

.slide-container:hover .slide-overlay {
    opacity: 1;
    pointer-events: auto;
}

.nav-btn {
    background: rgba(0,0,0,0.7);
    border: none;
    color: white;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    cursor: pointer;
    font-size: 1.2rem;
    transition: all 0.3s ease;
    margin: 0 1rem;
}

.nav-btn:hover {
    background: rgba(0,0,0,0.9);
    transform: scale(1.1);
}

.slide-notes-panel {
    background: #34495e;
    border-radius: 10px;
    padding: 1.5rem;
    overflow-y: auto;
}

.slide-notes-panel h4 {
    margin: 0 0 1rem 0;
    color: #ecf0f1;
}

.slide-note-item {
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #4a6741;
}

.slide-note-item h5 {
    color: #3498db;
    margin-bottom: 0.5rem;
}

.slide-note-item ul {
    margin: 0;
    padding-left: 1.5rem;
}

.slide-note-item li {
    margin-bottom: 0.25rem;
    color: #bdc3c7;
}

.presentation-footer {
    background: #2c3e50;
    padding: 1rem;
}

.slide-thumbnails {
    display: flex;
    gap: 0.5rem;
    overflow-x: auto;
    padding: 0.5rem 0;
    margin-bottom: 1rem;
}

.thumbnail-item {
    flex-shrink: 0;
    width: 80px;
    height: 60px;
    border-radius: 5px;
    overflow: hidden;
    cursor: pointer;
    position: relative;
    border: 2px solid transparent;
    transition: all 0.3s ease;
}

.thumbnail-item:hover,
.thumbnail-item.active {
    border-color: #3498db;
    transform: scale(1.05);
}

.thumbnail-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.thumbnail-number {
    position: absolute;
    bottom: 2px;
    right: 2px;
    background: rgba(0,0,0,0.8);
    color: white;
    font-size: 0.7rem;
    padding: 1px 4px;
    border-radius: 3px;
}

.presentation-progress {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.progress-bar {
    flex: 1;
    height: 8px;
    background: #4a6741;
    border-radius: 4px;
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #3498db, #2ecc71);
    transition: width 0.3s ease;
}

.slide-timer {
    color: #bdc3c7;
    font-family: monospace;
    font-size: 0.9rem;
}

.fullscreen-mode {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 9999;
    border-radius: 0;
}

.fullscreen-mode .presentation-viewer {
    grid-template-columns: 3fr 1fr;
    height: calc(100vh - 200px);
}

@media (max-width: 768px) {
    .presentation-viewer {
        grid-template-columns: 1fr;
    }
    
    .slide-notes-panel {
        max-height: 200px;
    }
    
    .presentation-header {
        flex-direction: column;
        gap: 1rem;
    }
    
    .presentation-controls {
        flex-wrap: wrap;
        justify-content: center;
    }
}
</style>
`;

// Initialize presentation system
let presentation = null;

// Function to integrate with existing simulation
function initializePresentationSystem() {
    // Inject styles
    document.head.insertAdjacentHTML('beforeend', presentationStyles);
    
    // Create presentation instance
    presentation = new SimulationPresentation();
    
    // Add to Gamma Prompts panel
    presentation.addToPresentationPanel();
    
    // Generate thumbnails
    setTimeout(() => {
        presentation.generateThumbnails();
    }, 500);
    
    console.log('🎮 Presentation system initialized');
}

module.exports = { SimulationPresentation, initializePresentationSystem };
