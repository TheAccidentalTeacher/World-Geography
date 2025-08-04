/**
 * Geographic Detective Academy Presentation System
 * Now supports dynamic slide loading - 133 slides with database integration
 */

class SimulationPresentation {
    constructor() {
        this.currentSlide = 1;
        this.totalSlides = 133; // Updated to 133 slides
        this.slidesPath = '/slides/';
        this.fullscreenMode = false;
        this.autoPlay = false;
        this.slideNotes = {};
        this.slidesLoaded = false;
        this.slidesList = [];
        this.initializePresentation();
    }

    async initializePresentation() {
        this.createPresentationInterface();
        this.setupKeyboardNavigation();
        await this.loadSlidesFromDatabase();
        this.loadSlideNotes();
    }

    // Load slides dynamically from database
    async loadSlidesFromDatabase() {
        try {
            console.log('📡 Loading slides from database...');
            
            const response = await fetch('/api/slides');
            if (!response.ok) {
                throw new Error(`Failed to load slides: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Sort slides by filename (01_, 02_, etc.)
            this.slidesList = data.slides.sort((a, b) => {
                const aNum = parseInt(a.filename.match(/^(\d+)/)?.[1] || '0');
                const bNum = parseInt(b.filename.match(/^(\d+)/)?.[1] || '0');
                return aNum - bNum;
            });
            
            this.totalSlides = this.slidesList.length;
            this.slidesLoaded = true;
            
            console.log(`✅ Loaded ${this.totalSlides} slides dynamically`);
            
            // Update UI with correct slide count
            this.updateSlideCounters();
            
            // Generate thumbnails now that slides are loaded
            this.generateThumbnails();
            
        } catch (error) {
            console.error('❌ Failed to load slides from database:', error);
            
            // Fallback to legacy behavior
            console.log('🔄 Using fallback slide loading...');
            this.slidesLoaded = false;
            this.generateFallbackSlidesList();
        }
    }

    // Generate fallback slides list if database fails
    generateFallbackSlidesList() {
        this.slidesList = [];
        for (let i = 1; i <= this.totalSlides; i++) {
            this.slidesList.push({
                filename: `${i.toString().padStart(2, '0')}_Geographic-Detective-Academy.png`,
                uploadDate: new Date(),
                length: 0
            });
        }
    }

    // Get slide filename by index (1-based)
    getSlideFilename(slideNumber) {
        if (!this.slidesLoaded || slideNumber < 1 || slideNumber > this.totalSlides) {
            return `${slideNumber.toString().padStart(2, '0')}_Geographic-Detective-Academy.png`;
        }
        
        const slide = this.slidesList[slideNumber - 1];
        return slide ? slide.filename : `slide-${slideNumber}.png`;
    }

    createPresentationInterface() {
        const presentationHTML = `
            <div id="presentation-container" class="presentation-container">
                <div class="presentation-header">
                    <div class="presentation-title">
                        <h2>🕵️ Geographic Detective Academy Presentation</h2>
                        <div class="slide-counter">Slide <span id="current-slide">1</span> of <span id="total-slides">${this.totalSlides}</span></div>
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
                        <div id="slide-loading" class="slide-loading">
                            <div class="loading-spinner"></div>
                            <p>Loading slides...</p>
                        </div>
                        <img id="current-slide-image" 
                             src="${this.slidesPath}${this.getSlideFilename(1)}" 
                             alt="Slide 1"
                             class="slide-image"
                             style="display: none;">
                        
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

    // Update slide counters throughout the UI
    updateSlideCounters() {
        const totalSlidesElements = document.querySelectorAll('#total-slides');
        totalSlidesElements.forEach(element => {
            element.textContent = this.totalSlides;
        });

        const progressFill = document.querySelector('.progress-fill');
        if (progressFill) {
            progressFill.style.width = `${(this.currentSlide / this.totalSlides) * 100}%`;
        }
    }

    // Add presentation panel to existing simulation
    addToPresentationPanel() {
        const presentationPanel = document.getElementById('gamma-prompts');
        if (presentationPanel) {
            presentationPanel.innerHTML = `
                <h2>🎮 Interactive Presentation</h2>
                <p class="subtitle">Navigate through the complete Geographic Detective Academy presentation (${this.totalSlides} slides)</p>
                ${this.createPresentationInterface()}
            `;
            
            // Hide loading indicator and show slide once slides are loaded
            setTimeout(() => {
                const loadingElement = document.getElementById('slide-loading');
                const slideImage = document.getElementById('current-slide-image');
                
                if (loadingElement) loadingElement.style.display = 'none';
                if (slideImage) slideImage.style.display = 'block';
            }, 1000);
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
            const filename = this.getSlideFilename(this.currentSlide);
            slideImage.src = `${this.slidesPath}${filename}`;
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
        // Enhanced notes for the expanded 133-slide structure
        if (this.currentSlide <= 11) {
            return {
                objectives: ["Academy orientation and setup", "Understanding detective methodology", "Team formation and roles"],
                discussion: ["What makes an effective geographic detective?", "How do we approach geographic mysteries?", "What tools and skills do we need?"],
                geographicConnection: "Foundation spatial thinking and geographic inquiry methods."
            };
        } else if (this.currentSlide <= 23) {
            return {
                objectives: ["Amazon rainforest investigation", "Physical geography analysis", "Climate and ecosystem understanding"],
                discussion: ["How does geography affect exploration?", "What environmental challenges exist?", "How do we track movement through terrain?"],
                geographicConnection: "Tropical rainforest ecosystems and South American geography."
            };
        } else if (this.currentSlide <= 35) {
            return {
                objectives: ["Desert environment investigation", "Saharan geography mastery", "Navigation and survival skills"],
                discussion: ["How do people adapt to extreme environments?", "What makes desert navigation challenging?", "How do trade routes work in deserts?"],
                geographicConnection: "Arid climate zones and North African cultural geography."
            };
        } else if (this.currentSlide <= 47) {
            return {
                objectives: ["Mountain geography investigation", "Himalayan systems understanding", "Cultural and sacred geography"],
                discussion: ["How do mountains affect human settlement?", "What role do mountains play in culture?", "How does elevation create climate zones?"],
                geographicConnection: "Mountain formation, vertical climate zones, and South Asian geography."
            };
        } else if (this.currentSlide <= 60) {
            return {
                objectives: ["River system investigation", "Water quality analysis", "Human-environment interaction"],
                discussion: ["How do rivers shape landscapes?", "What threatens water systems?", "How do communities depend on rivers?"],
                geographicConnection: "Hydrological cycles and watershed management."
            };
        } else if (this.currentSlide <= 72) {
            return {
                objectives: ["Urban geography investigation", "City planning analysis", "Environmental justice issues"],
                discussion: ["How do cities grow and change?", "What makes green spaces important?", "Who benefits from urban development?"],
                geographicConnection: "Urbanization patterns and sustainable city planning."
            };
        } else if (this.currentSlide <= 82) {
            return {
                objectives: ["Political geography mastery", "Boundary analysis", "Sovereignty understanding"],
                discussion: ["How are political boundaries created?", "What causes territorial disputes?", "How do governments organize space?"],
                geographicConnection: "Geopolitics and territorial organization systems."
            };
        } else if (this.currentSlide <= 92) {
            return {
                objectives: ["Ancient civilizations geography", "Historical spatial analysis", "Cultural landscape evolution"],
                discussion: ["How did geography shape ancient societies?", "What advantages did location provide?", "How do we see ancient geography today?"],
                geographicConnection: "Historical geography and civilization development patterns."
            };
        } else if (this.currentSlide <= 102) {
            return {
                objectives: ["Geographic pattern recognition", "Spatial relationship analysis", "Systems thinking development"],
                discussion: ["What patterns emerge across different scales?", "How are geographic phenomena connected?", "What predicts spatial distribution?"],
                geographicConnection: "Geographic principles and spatial analysis methods."
            };
        } else if (this.currentSlide <= 112) {
            return {
                objectives: ["Regional geography mastery", "Comparative analysis skills", "Global perspective development"],
                discussion: ["How do regions compare and contrast?", "What makes each region unique?", "How are regions interconnected globally?"],
                geographicConnection: "Regional geography and global systems integration."
            };
        } else {
            return {
                objectives: ["Capstone investigation skills", "Advanced geographic tools", "Career connections and next steps"],
                discussion: ["How will you use these skills?", "What geographic careers interest you?", "How does geography connect to your future?"],
                geographicConnection: "Applied geography and professional geographic practice."
            };
        }
    }

    generateThumbnails() {
        const thumbnailContainer = document.getElementById('slide-thumbnails');
        if (!thumbnailContainer) return;

        let thumbnailHTML = '';
        for (let i = 1; i <= this.totalSlides; i++) {
            const filename = this.getSlideFilename(i);
            thumbnailHTML += `
                <div class="thumbnail-item ${i === this.currentSlide ? 'active' : ''}"
                     onclick="presentation.goToSlide(${i})"
                     title="Slide ${i}">
                    <img src="${this.slidesPath}${filename}"
                         alt="Slide ${i} thumbnail"
                         class="thumbnail-image"
                         onerror="this.style.backgroundColor='#ff6b6b'; this.style.color='white'; this.innerHTML='${i}';"
                         loading="lazy">
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

.slide-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #bdc3c7;
}

.loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #34495e;
    border-top: 4px solid #3498db;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
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
    max-height: 80px;
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

    console.log('🎮 Presentation system initialized with 133 slides');
}

module.exports = { SimulationPresentation, initializePresentationSystem };
