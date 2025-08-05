/* ===== GEOGRAPHIC DETECTIVE ACADEMY - CONTENT LOADER ===== */

class ContentLoader {
    constructor() {
        this.loadedModules = new Map();
        this.loadingPromises = new Map();
        this.contentContainer = null;
        this.templateCache = new Map();
        this.initialized = false;
    }

    // Initialize content loader
    init() {
        ConfigUtils.log('info', 'Initializing content loader');
        
        this.contentContainer = document.getElementById('content-container');
        if (!this.contentContainer) {
            ConfigUtils.log('error', 'Content container not found');
            return false;
        }

        this.initialized = true;
        ConfigUtils.log('info', 'Content loader initialized successfully');
        return true;
    }

    // Load module content
    async loadModule(moduleId) {
        if (!this.initialized) {
            ConfigUtils.log('error', 'Content loader not initialized');
            return false;
        }

        ConfigUtils.log('info', `Loading module: ${moduleId}`);

        try {
            // Check if module is already loading
            if (this.loadingPromises.has(moduleId)) {
                ConfigUtils.log('debug', `Module ${moduleId} already loading, waiting...`);
                return await this.loadingPromises.get(moduleId);
            }

            // Check if module is cached
            const moduleConfig = ConfigUtils.getModuleConfig(moduleId);
            if (moduleConfig?.cacheable && this.loadedModules.has(moduleId)) {
                ConfigUtils.log('debug', `Using cached module: ${moduleId}`);
                this.displayCachedModule(moduleId);
                return true;
            }

            // Create loading promise
            const loadingPromise = this.performModuleLoad(moduleId);
            this.loadingPromises.set(moduleId, loadingPromise);

            const result = await loadingPromise;
            this.loadingPromises.delete(moduleId);

            return result;
        } catch (error) {
            this.loadingPromises.delete(moduleId);
            ConfigUtils.log('error', `Failed to load module ${moduleId}`, error);
            this.showErrorContent(moduleId, error.message);
            return false;
        }
    }

    // Perform the actual module loading
    async performModuleLoad(moduleId) {
        const startTime = performance.now();

        try {
            // Load module-specific JavaScript if it exists
            await this.loadModuleScript(moduleId);

            // Generate module content
            const content = await this.generateModuleContent(moduleId);
            
            // Display content
            this.displayContent(content);

            // Cache if configured
            const moduleConfig = ConfigUtils.getModuleConfig(moduleId);
            if (moduleConfig?.cacheable) {
                this.loadedModules.set(moduleId, {
                    content,
                    timestamp: Date.now(),
                    moduleId
                });
                ConfigUtils.log('debug', `Cached module: ${moduleId}`);
            }

            // Log performance metrics
            const loadTime = performance.now() - startTime;
            ConfigUtils.log('debug', `Module ${moduleId} loaded in ${loadTime.toFixed(2)}ms`);

            return true;
        } catch (error) {
            ConfigUtils.log('error', `Error loading module ${moduleId}`, error);
            throw error;
        }
    }

    // Load module-specific JavaScript
    async loadModuleScript(moduleId) {
        const scriptId = `module-${moduleId}`;
        
        // Check if script already loaded
        if (document.getElementById(scriptId)) {
            ConfigUtils.log('debug', `Module script already loaded: ${moduleId}`);
            return;
        }

        const scriptPath = `js/modules/${moduleId}.js`;
        
        try {
            await this.loadScript(scriptPath, scriptId);
            ConfigUtils.log('debug', `Loaded module script: ${scriptPath}`);
        } catch (error) {
            // Script loading is optional - module might be inline
            ConfigUtils.log('debug', `No external script for module: ${moduleId}`);
        }
    }

    // Load external script
    loadScript(src, id) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.id = id;
            script.async = true;
            
            script.onload = () => resolve();
            script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
            
            document.head.appendChild(script);
        });
    }

    // Generate module content
    async generateModuleContent(moduleId) {
        ConfigUtils.log('debug', `Generating content for module: ${moduleId}`);

        // Check if module has a custom generator
        const generatorFunction = window[`generate${this.toPascalCase(moduleId)}Content`];
        if (typeof generatorFunction === 'function') {
            ConfigUtils.log('debug', `Using custom generator for: ${moduleId}`);
            return await generatorFunction();
        }

        // Use default content generation
        return this.getDefaultModuleContent(moduleId);
    }

    // Get default module content
    getDefaultModuleContent(moduleId) {
        const moduleConfig = ConfigUtils.getModuleConfig(moduleId);
        const navItem = ConfigUtils.getNavigationItem(moduleId);
        
        return `
            <div class="content-panel active" id="${moduleId}-panel">
                <div class="section-header">
                    <h1>${navItem?.icon || '📋'} ${moduleConfig?.title || 'Module Content'}</h1>
                    <p class="mission-statement">${navItem?.description || 'Loading module content...'}</p>
                </div>
                
                <div class="module-content">
                    <div class="card">
                        <div class="card-body">
                            <h3>Module: ${moduleId}</h3>
                            <p>This module is under development. Content will be loaded dynamically.</p>
                            <div class="btn-group">
                                <button class="btn btn-primary" onclick="location.reload()">Refresh</button>
                                <button class="btn btn-secondary" onclick="window.navigationController.navigateToPanel('overview', 'overview')">Return to Overview</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Display content in container
    displayContent(content) {
        if (!this.contentContainer) {
            ConfigUtils.log('error', 'Content container not available');
            return;
        }

        // Add fade-out animation to current content
        this.contentContainer.style.opacity = '0';
        
        setTimeout(() => {
            this.contentContainer.innerHTML = content;
            
            // Add fade-in animation to new content
            this.contentContainer.style.opacity = '1';
            
            // Initialize any interactive elements
            this.initializeContentInteractions();
            
            // Scroll to top
            this.contentContainer.scrollTop = 0;
            
            ConfigUtils.log('debug', 'Content displayed successfully');
        }, GDA_CONFIG.animations.fadeInDelay);
    }

    // Display cached module
    displayCachedModule(moduleId) {
        const cached = this.loadedModules.get(moduleId);
        if (cached) {
            this.displayContent(cached.content);
            ConfigUtils.log('debug', `Displayed cached module: ${moduleId}`);
        }
    }

    // Show error content
    showErrorContent(moduleId, errorMessage) {
        const errorContent = `
            <div class="content-panel active" id="error-panel">
                <div class="section-header">
                    <h1>⚠️ Error Loading Module</h1>
                    <p class="mission-statement">Unable to load the requested content</p>
                </div>
                
                <div class="card">
                    <div class="card-body">
                        <h3>Module: ${moduleId}</h3>
                        <p class="text-danger">Error: ${errorMessage}</p>
                        <div class="btn-group">
                            <button class="btn btn-primary" onclick="window.navigationController.navigateToPanel('${moduleId}', '${moduleId}')">
                                Retry Loading
                            </button>
                            <button class="btn btn-secondary" onclick="window.navigationController.navigateToPanel('overview', 'overview')">
                                Return to Overview
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.displayContent(errorContent);
    }

    // Initialize content interactions
    initializeContentInteractions() {
        // Add smooth scrolling to internal links
        const internalLinks = this.contentContainer.querySelectorAll('a[href^="#"]');
        internalLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const target = document.getElementById(targetId);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });

        // Initialize any collapsible elements
        const collapsibles = this.contentContainer.querySelectorAll('[data-toggle="collapse"]');
        collapsibles.forEach(element => {
            element.addEventListener('click', this.handleCollapsibleToggle);
        });

        // Initialize any tooltip elements
        this.initializeTooltips();

        ConfigUtils.log('debug', 'Content interactions initialized');
    }

    // Handle collapsible element toggle
    handleCollapsibleToggle(event) {
        const target = event.currentTarget;
        const targetSelector = target.getAttribute('data-target');
        const targetElement = document.querySelector(targetSelector);
        
        if (targetElement) {
            targetElement.classList.toggle('show');
            target.classList.toggle('collapsed');
        }
    }

    // Initialize tooltips
    initializeTooltips() {
        const tooltipElements = this.contentContainer.querySelectorAll('[data-tooltip]');
        tooltipElements.forEach(element => {
            element.addEventListener('mouseenter', this.showTooltip);
            element.addEventListener('mouseleave', this.hideTooltip);
        });
    }

    // Show tooltip
    showTooltip(event) {
        const element = event.currentTarget;
        const text = element.getAttribute('data-tooltip');
        
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = text;
        tooltip.style.position = 'absolute';
        tooltip.style.background = '#333';
        tooltip.style.color = 'white';
        tooltip.style.padding = '0.5rem';
        tooltip.style.borderRadius = '4px';
        tooltip.style.fontSize = '0.8rem';
        tooltip.style.pointerEvents = 'none';
        tooltip.style.zIndex = '1000';
        
        document.body.appendChild(tooltip);
        
        const rect = element.getBoundingClientRect();
        tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
        tooltip.style.top = rect.top - tooltip.offsetHeight - 5 + 'px';
        
        element.tooltipElement = tooltip;
    }

    // Hide tooltip
    hideTooltip(event) {
        const element = event.currentTarget;
        if (element.tooltipElement) {
            document.body.removeChild(element.tooltipElement);
            delete element.tooltipElement;
        }
    }

    // Utility: Convert to PascalCase
    toPascalCase(str) {
        return str.replace(/(^\w|-\w)/g, (match) => 
            match.replace('-', '').toUpperCase()
        );
    }

    // Clear module cache
    clearCache(moduleId = null) {
        if (moduleId) {
            this.loadedModules.delete(moduleId);
            ConfigUtils.log('debug', `Cleared cache for module: ${moduleId}`);
        } else {
            this.loadedModules.clear();
            ConfigUtils.log('debug', 'Cleared all module cache');
        }
    }

    // Get cache info
    getCacheInfo() {
        return {
            size: this.loadedModules.size,
            modules: Array.from(this.loadedModules.keys())
        };
    }

    // Preload modules
    async preloadModules(moduleIds) {
        ConfigUtils.log('info', `Preloading modules: ${moduleIds.join(', ')}`);
        
        const promises = moduleIds.map(moduleId => this.loadModule(moduleId));
        const results = await Promise.allSettled(promises);
        
        const successful = results.filter(r => r.status === 'fulfilled').length;
        ConfigUtils.log('info', `Preloaded ${successful}/${moduleIds.length} modules`);
        
        return results;
    }

    // Destroy content loader
    destroy() {
        this.clearCache();
        this.loadingPromises.clear();
        this.templateCache.clear();
        
        if (this.contentContainer) {
            this.contentContainer.innerHTML = '';
        }
        
        this.initialized = false;
        ConfigUtils.log('info', 'Content loader destroyed');
    }
}

// Initialize and make globally available
window.ContentLoader = new ContentLoader();

ConfigUtils.log('info', 'Content loader class loaded');
