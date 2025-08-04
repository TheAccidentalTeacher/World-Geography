/**
 * 🎯 DYNAMIC SLIDE LOADER
 * 
 * This replaces ALL hardcoded slide arrays with database-driven loading.
 * No more maintaining multiple slide lists!
 */

class DynamicSlideLoader {
    constructor() {
        this.slides = [];
        this.totalSlides = 0;
        this.slidesLoaded = false;
        this.loadingPromise = null;
    }

    // Load slides from database API
    async loadSlides() {
        if (this.loadingPromise) {
            return this.loadingPromise;
        }

        this.loadingPromise = this._fetchSlides();
        return this.loadingPromise;
    }

    async _fetchSlides() {
        try {
            console.log('📡 Loading slides from database...');
            
            const response = await fetch('/api/slides');
            if (!response.ok) {
                throw new Error(`Failed to load slides: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Sort slides by filename (01_, 02_, etc.)
            this.slides = data.slides.sort((a, b) => {
                const aNum = parseInt(a.filename.match(/^(\d+)/)?.[1] || '0');
                const bNum = parseInt(b.filename.match(/^(\d+)/)?.[1] || '0');
                return aNum - bNum;
            });
            
            this.totalSlides = this.slides.length;
            this.slidesLoaded = true;
            
            console.log(`✅ Loaded ${this.totalSlides} slides dynamically`);
            
            return this.slides;
            
        } catch (error) {
            console.error('❌ Failed to load slides:', error);
            
            // Fallback: Use old hardcoded behavior if API fails
            console.log('🔄 Falling back to legacy slide loading...');
            this.totalSlides = 60; // Will be updated by swap-slides.js
            this.slides = this._generateLegacySlideList();
            this.slidesLoaded = true;
            
            return this.slides;
        }
    }

    // Generate slide URL by index (1-based)
    getSlideUrl(slideNumber) {
        if (!this.slidesLoaded) {
            console.warn('⚠️ Slides not loaded yet, using fallback URL');
            return `/slides/slide-${slideNumber}.png`;
        }
        
        if (slideNumber < 1 || slideNumber > this.totalSlides) {
            console.warn(`⚠️ Invalid slide number: ${slideNumber}`);
            return `/slides/slide-1.png`;
        }
        
        const slide = this.slides[slideNumber - 1];
        return `/slides/${slide.filename}`;
    }

    // Get slide filename by index (1-based)
    getSlideFilename(slideNumber) {
        if (!this.slidesLoaded) {
            return `slide-${slideNumber}.png`;
        }
        
        if (slideNumber < 1 || slideNumber > this.totalSlides) {
            return 'slide-1.png';
        }
        
        const slide = this.slides[slideNumber - 1];
        return slide.filename;
    }

    // Get total slide count
    getTotalSlides() {
        return this.totalSlides;
    }

    // Check if slides are loaded
    isLoaded() {
        return this.slidesLoaded;
    }

    // Wait for slides to load
    async waitForLoad() {
        if (this.slidesLoaded) {
            return true;
        }
        
        await this.loadSlides();
        return this.slidesLoaded;
    }

    // Legacy fallback slide list (will be replaced by database)
    _generateLegacySlideList() {
        const slides = [];
        for (let i = 1; i <= this.totalSlides; i++) {
            slides.push({
                filename: `${i.toString().padStart(2, '0')}_Geographic-Detective-Academy.png`,
                uploadDate: new Date(),
                length: 0
            });
        }
        return slides;
    }

    // Get slides by day (for navigation)
    async getSlidesByDay() {
        await this.waitForLoad();
        
        // This will be enhanced based on your day structure
        // For now, return basic day groupings
        const slidesByDay = {};
        
        // Parse slide filenames to determine day structure
        for (let i = 0; i < this.slides.length; i++) {
            const slide = this.slides[i];
            const slideNumber = i + 1;
            
            // Basic day estimation (you can enhance this)
            const day = Math.floor((slideNumber - 1) / 11) + 1; // ~11 slides per day
            
            if (!slidesByDay[day]) {
                slidesByDay[day] = [];
            }
            
            slidesByDay[day].push({
                slideNumber: slideNumber,
                filename: slide.filename,
                url: this.getSlideUrl(slideNumber)
            });
        }
        
        return slidesByDay;
    }
}

// Create global instance
window.dynamicSlideLoader = new DynamicSlideLoader();

// Auto-load slides when script loads
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await window.dynamicSlideLoader.loadSlides();
        console.log('🎯 Dynamic slide loading initialized');
        
        // Trigger any slide-dependent initialization
        if (typeof window.onSlidesLoaded === 'function') {
            window.onSlidesLoaded();
        }
        
        // Dispatch custom event
        window.dispatchEvent(new CustomEvent('slidesLoaded', {
            detail: {
                totalSlides: window.dynamicSlideLoader.getTotalSlides(),
                slides: window.dynamicSlideLoader.slides
            }
        }));
        
    } catch (error) {
        console.error('💥 Failed to initialize dynamic slide loading:', error);
    }
});

// Export for Node.js if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DynamicSlideLoader;
}
