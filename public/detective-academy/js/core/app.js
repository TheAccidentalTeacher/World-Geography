/* ===== GEOGRAPHIC DETECTIVE ACADEMY - MAIN APPLICATION ===== */

class GeographicDetectiveAcademy {
    constructor() {
        this.initialized = false;
        this.navigationController = null;
        this.contentLoader = null;
        this.currentVersion = GDA_CONFIG.app.version;
        this.loadingScreen = null;
        this.errorHandler = null;
    }

    // Initialize the entire application
    async init() {
        ConfigUtils.log('info', `Initializing Geographic Detective Academy v${this.currentVersion}`);
        
        try {
            // Show loading screen
            this.showLoadingScreen();

            // Initialize error handling
            this.setupErrorHandling();

            // Initialize components in sequence
            await this.initializeComponents();

            // Set up event listeners
            this.setupEventListeners();

            // Load initial content
            await this.loadInitialContent();

            // Hide loading screen
            this.hideLoadingScreen();

            // Mark as initialized
            this.initialized = true;

            // Dispatch ready event
            this.dispatchReadyEvent();

            ConfigUtils.log('info', 'Geographic Detective Academy initialized successfully');
            
        } catch (error) {
            ConfigUtils.log('error', 'Failed to initialize application', error);
            this.showInitializationError(error);
        }
    }

    // Show loading screen
    showLoadingScreen() {
        this.loadingScreen = document.getElementById('loading-screen');
        if (this.loadingScreen) {
            this.loadingScreen.style.display = 'flex';
            
            // Update loading message over time
            this.updateLoadingMessages();
        }
    }

    // Update loading messages
    updateLoadingMessages() {
        const messages = [
            'Initializing Investigation System...',
            'Loading Detective Protocols...',
            'Preparing Evidence Database...',
            'Calibrating Geographic Tools...',
            'Activating Case Files...',
            'Ready for Investigation!'
        ];
        
        let messageIndex = 0;
        const loadingText = this.loadingScreen.querySelector('p');
        
        const messageInterval = setInterval(() => {
            if (messageIndex < messages.length && this.loadingScreen.style.display !== 'none') {
                loadingText.textContent = messages[messageIndex];
                messageIndex++;
            } else {
                clearInterval(messageInterval);
            }
        }, 500);
    }

    // Hide loading screen
    hideLoadingScreen() {
        if (this.loadingScreen) {
            this.loadingScreen.style.opacity = '0';
            setTimeout(() => {
                this.loadingScreen.style.display = 'none';
            }, 500);
        }
    }

    // Setup global error handling
    setupErrorHandling() {
        this.errorHandler = new ErrorHandler();
        
        // Global error handlers
        window.addEventListener('error', (event) => {
            this.errorHandler.handleError('JavaScript Error', event.error, {
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno
            });
        });

        window.addEventListener('unhandledrejection', (event) => {
            this.errorHandler.handleError('Unhandled Promise Rejection', event.reason);
            event.preventDefault(); // Prevent console spam
        });

        ConfigUtils.log('info', 'Error handling initialized');
    }

    // Initialize core components
    async initializeComponents() {
        ConfigUtils.log('info', 'Initializing core components');

        // Initialize content loader
        this.contentLoader = window.ContentLoader;
        if (!this.contentLoader.init()) {
            throw new Error('Failed to initialize content loader');
        }

        // Initialize navigation controller
        this.navigationController = new NavigationController();
        if (!this.navigationController.init()) {
            throw new Error('Failed to initialize navigation controller');
        }

        // Make controllers globally available
        window.navigationController = this.navigationController;
        window.contentLoader = this.contentLoader;

        ConfigUtils.log('info', 'Core components initialized');
    }

    // Setup application event listeners
    setupEventListeners() {
        // Navigation events
        document.addEventListener('gda:navigation', (event) => {
            ConfigUtils.log('debug', 'Navigation event received', event.detail);
            this.handleNavigationEvent(event.detail);
        });

        // Window resize handling
        window.addEventListener('resize', this.debounce(() => {
            this.handleWindowResize();
        }, 250));

        // Keyboard shortcuts
        document.addEventListener('keydown', (event) => {
            this.handleKeyboardShortcuts(event);
        });

        // Focus management
        document.addEventListener('focus', (event) => {
            this.handleFocusEvent(event);
        }, true);

        // Print handling
        window.addEventListener('beforeprint', () => {
            this.handleBeforePrint();
        });

        window.addEventListener('afterprint', () => {
            this.handleAfterPrint();
        });

        ConfigUtils.log('info', 'Event listeners setup complete');
    }

    // Load initial content
    async loadInitialContent() {
        ConfigUtils.log('info', 'Loading initial content');

        // Determine initial panel from URL or default
        const urlParams = new URLSearchParams(window.location.search);
        const initialPanel = urlParams.get('panel') || 'overview';
        
        // Find corresponding module
        const navItem = ConfigUtils.getNavigationItem(initialPanel);
        if (!navItem) {
            ConfigUtils.log('warn', `Invalid initial panel: ${initialPanel}, using overview`);
            await this.navigationController.navigateToPanel('overview', 'overview');
        } else {
            await this.navigationController.navigateToPanel(navItem.panel, navItem.module);
        }

        // Preload critical modules if enabled
        if (GDA_CONFIG.features.preload) {
            const criticalModules = GDA_CONFIG.navigation
                .filter(item => item.preload)
                .map(item => item.module);
            
            if (criticalModules.length > 0) {
                this.contentLoader.preloadModules(criticalModules);
            }
        }
    }

    // Handle navigation events
    handleNavigationEvent(detail) {
        // Update document title
        const moduleConfig = ConfigUtils.getModuleConfig(detail.module);
        if (moduleConfig) {
            document.title = `${moduleConfig.title} - ${GDA_CONFIG.app.name}`;
        }

        // Analytics tracking (if enabled)
        if (GDA_CONFIG.features.analytics) {
            this.trackPageView(detail.panel, detail.module);
        }

        // Update meta description
        const navItem = ConfigUtils.getNavigationItem(detail.module);
        if (navItem) {
            this.updateMetaDescription(navItem.description);
        }
    }

    // Handle window resize
    handleWindowResize() {
        // Trigger responsive layout updates
        const resizeEvent = new CustomEvent('gda:resize', {
            detail: {
                width: window.innerWidth,
                height: window.innerHeight,
                isMobile: window.innerWidth <= 768
            }
        });
        
        document.dispatchEvent(resizeEvent);
        ConfigUtils.log('debug', 'Resize event dispatched');
    }

    // Handle keyboard shortcuts
    handleKeyboardShortcuts(event) {
        // Help menu
        if (event.key === 'F1') {
            event.preventDefault();
            this.showHelpMenu();
        }

        // Quick search
        if (event.ctrlKey && event.key === 'k') {
            event.preventDefault();
            this.showQuickSearch();
        }

        // Print current page
        if (event.ctrlKey && event.key === 'p') {
            event.preventDefault();
            this.printCurrentPage();
        }
    }

    // Handle focus events for accessibility
    handleFocusEvent(event) {
        // Add focus outline for keyboard navigation
        if (event.target.matches('.nav-item, .btn, .card')) {
            event.target.setAttribute('data-keyboard-focus', 'true');
        }
    }

    // Handle before print
    handleBeforePrint() {
        document.body.classList.add('printing');
        ConfigUtils.log('debug', 'Preparing for print');
    }

    // Handle after print
    handleAfterPrint() {
        document.body.classList.remove('printing');
        ConfigUtils.log('debug', 'Print completed');
    }

    // Show help menu
    showHelpMenu() {
        const helpContent = `
            <div class="help-modal">
                <div class="help-content">
                    <h3>🎯 Geographic Detective Academy Help</h3>
                    <div class="help-sections">
                        <div class="help-section">
                            <h4>Keyboard Shortcuts</h4>
                            <ul>
                                <li><kbd>Ctrl/Cmd + 1-8</kbd> - Navigate to sections</li>
                                <li><kbd>Ctrl/Cmd + K</kbd> - Quick search</li>
                                <li><kbd>Ctrl/Cmd + P</kbd> - Print current page</li>
                                <li><kbd>F1</kbd> - Show this help</li>
                            </ul>
                        </div>
                        <div class="help-section">
                            <h4>Navigation</h4>
                            <ul>
                                <li>Click navigation items to switch sections</li>
                                <li>Use browser back/forward buttons</li>
                                <li>Bookmark specific sections with URLs</li>
                            </ul>
                        </div>
                    </div>
                    <button class="btn btn-primary" onclick="this.closest('.help-modal').remove()">
                        Close Help
                    </button>
                </div>
            </div>
        `;
        
        const helpModal = document.createElement('div');
        helpModal.innerHTML = helpContent;
        document.body.appendChild(helpModal);
    }

    // Show quick search
    showQuickSearch() {
        // Implementation for quick search functionality
        ConfigUtils.log('info', 'Quick search requested');
        // This would open a search modal
    }

    // Print current page
    printCurrentPage() {
        window.print();
    }

    // Track page view (analytics)
    trackPageView(panel, module) {
        if (typeof gtag !== 'undefined') {
            gtag('config', 'GA_MEASUREMENT_ID', {
                page_title: ConfigUtils.getModuleConfig(module)?.title,
                page_location: window.location.href
            });
        }
        
        ConfigUtils.log('debug', `Tracked page view: ${panel}/${module}`);
    }

    // Update meta description
    updateMetaDescription(description) {
        let metaDescription = document.querySelector('meta[name="description"]');
        if (!metaDescription) {
            metaDescription = document.createElement('meta');
            metaDescription.name = 'description';
            document.head.appendChild(metaDescription);
        }
        metaDescription.content = description;
    }

    // Show initialization error
    showInitializationError(error) {
        const errorHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, #d32f2f, #b71c1c);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-family: system-ui, sans-serif;
                z-index: 10000;
            ">
                <div style="text-align: center; padding: 2rem;">
                    <h1>⚠️ Initialization Error</h1>
                    <p>Geographic Detective Academy failed to initialize properly.</p>
                    <p style="font-size: 0.9rem; opacity: 0.8;">Error: ${error.message}</p>
                    <button onclick="location.reload()" style="
                        background: white;
                        color: #d32f2f;
                        border: none;
                        padding: 1rem 2rem;
                        border-radius: 8px;
                        font-weight: 600;
                        cursor: pointer;
                        margin-top: 1rem;
                    ">
                        Reload Application
                    </button>
                </div>
            </div>
        `;
        
        document.body.innerHTML = errorHTML;
    }

    // Dispatch application ready event
    dispatchReadyEvent() {
        const readyEvent = new CustomEvent('gda:ready', {
            detail: {
                version: this.currentVersion,
                timestamp: Date.now(),
                features: GDA_CONFIG.features
            }
        });
        
        document.dispatchEvent(readyEvent);
        ConfigUtils.log('info', 'Application ready event dispatched');
    }

    // Utility: Debounce function
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Get application info
    getInfo() {
        return {
            version: this.currentVersion,
            initialized: this.initialized,
            config: GDA_CONFIG,
            performance: this.getPerformanceMetrics()
        };
    }

    // Get performance metrics
    getPerformanceMetrics() {
        if (performance.getEntriesByType) {
            const navigation = performance.getEntriesByType('navigation')[0];
            return {
                loadTime: navigation ? navigation.loadEventEnd - navigation.fetchStart : null,
                domContentLoaded: navigation ? navigation.domContentLoadedEventEnd - navigation.fetchStart : null,
                memoryUsage: performance.memory ? {
                    used: performance.memory.usedJSHeapSize,
                    total: performance.memory.totalJSHeapSize,
                    limit: performance.memory.jsHeapSizeLimit
                } : null
            };
        }
        return null;
    }

    // Destroy application
    destroy() {
        if (this.navigationController) {
            this.navigationController.destroy();
        }
        
        if (this.contentLoader) {
            this.contentLoader.destroy();
        }
        
        this.initialized = false;
        ConfigUtils.log('info', 'Application destroyed');
    }
}

// Error Handler Class
class ErrorHandler {
    constructor() {
        this.errors = [];
        this.maxErrors = 50;
    }

    handleError(type, error, context = {}) {
        const errorInfo = {
            type,
            message: error?.message || error,
            stack: error?.stack,
            context,
            timestamp: Date.now(),
            url: window.location.href,
            userAgent: navigator.userAgent
        };

        this.errors.push(errorInfo);
        
        // Keep only recent errors
        if (this.errors.length > this.maxErrors) {
            this.errors = this.errors.slice(-this.maxErrors);
        }

        ConfigUtils.log('error', `${type}: ${errorInfo.message}`, errorInfo);

        // Show user-friendly error if configured
        if (GDA_CONFIG.errors.showUserFriendlyMessages) {
            this.showUserError(errorInfo);
        }
    }

    showUserError(errorInfo) {
        // Implementation for user-friendly error display
        console.warn('Error occurred:', errorInfo.message);
    }

    getErrors() {
        return [...this.errors];
    }

    clearErrors() {
        this.errors = [];
    }
}

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    ConfigUtils.log('info', 'DOM loaded, initializing application');
    
    window.gdaApp = new GeographicDetectiveAcademy();
    await window.gdaApp.init();
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        ConfigUtils.log('debug', 'Page became visible');
    } else {
        ConfigUtils.log('debug', 'Page became hidden');
    }
});

ConfigUtils.log('info', 'Application controller loaded');
