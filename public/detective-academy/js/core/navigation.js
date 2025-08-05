/* ===== GEOGRAPHIC DETECTIVE ACADEMY - NAVIGATION CONTROLLER ===== */

class NavigationController {
    constructor() {
        this.currentPanel = 'overview';
        this.navigationContainer = null;
        this.navItems = [];
        this.initialized = false;
    }

    // Initialize navigation system
    init() {
        ConfigUtils.log('info', 'Initializing navigation controller');
        
        this.navigationContainer = document.getElementById('main-navigation');
        if (!this.navigationContainer) {
            ConfigUtils.log('error', 'Navigation container not found');
            return false;
        }

        this.renderNavigationItems();
        this.bindEvents();
        this.setActivePanel(this.currentPanel);
        this.initialized = true;

        ConfigUtils.log('info', 'Navigation controller initialized successfully');
        return true;
    }

    // Render navigation items from configuration
    renderNavigationItems() {
        const navHTML = GDA_CONFIG.navigation.map(item => `
            <div class="nav-item" 
                 data-panel="${item.panel}" 
                 data-module="${item.module}"
                 title="${item.description}">
                <span class="icon">${item.icon}</span>
                <span class="label">${item.label}</span>
            </div>
        `).join('');

        this.navigationContainer.innerHTML = navHTML;
        this.navItems = this.navigationContainer.querySelectorAll('.nav-item');
        
        ConfigUtils.log('info', `Rendered ${this.navItems.length} navigation items`);
    }

    // Bind navigation event handlers
    bindEvents() {
        this.navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const panel = e.currentTarget.dataset.panel;
                const module = e.currentTarget.dataset.module;
                
                if (panel && panel !== this.currentPanel) {
                    this.navigateToPanel(panel, module);
                }
            });

            // Add hover effects for better UX
            item.addEventListener('mouseenter', (e) => {
                if (!e.currentTarget.classList.contains('active')) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                }
            });

            item.addEventListener('mouseleave', (e) => {
                if (!e.currentTarget.classList.contains('active')) {
                    e.currentTarget.style.transform = '';
                }
            });
        });

        // Keyboard navigation support
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                const keyMap = {
                    '1': 'overview',
                    '2': 'teacher-guide',
                    '3': 'daily-structure',
                    '4': 'investigation-events',
                    '5': 'team-roles',
                    '6': 'student-materials',
                    '7': 'assessment-system',
                    '8': 'complete-package'
                };

                if (keyMap[e.key]) {
                    e.preventDefault();
                    const navItem = GDA_CONFIG.navigation.find(item => item.panel === keyMap[e.key]);
                    if (navItem) {
                        this.navigateToPanel(navItem.panel, navItem.module);
                    }
                }
            }
        });

        ConfigUtils.log('info', 'Navigation event handlers bound');
    }

    // Navigate to specific panel
    async navigateToPanel(panelId, moduleId) {
        if (panelId === this.currentPanel) {
            ConfigUtils.log('debug', `Already on panel: ${panelId}`);
            return;
        }

        ConfigUtils.log('info', `Navigating to panel: ${panelId}`);

        try {
            // Show loading state
            this.showLoadingState(panelId);

            // Load module content
            const success = await window.ContentLoader.loadModule(moduleId);
            
            if (success) {
                // Update active states
                this.setActivePanel(panelId);
                this.currentPanel = panelId;

                // Update browser history
                this.updateHistory(panelId);

                // Dispatch navigation event
                this.dispatchNavigationEvent(panelId, moduleId);

                ConfigUtils.log('info', `Successfully navigated to: ${panelId}`);
            } else {
                throw new Error(`Failed to load module: ${moduleId}`);
            }
        } catch (error) {
            ConfigUtils.log('error', 'Navigation failed', error);
            this.showErrorState(panelId, error.message);
        } finally {
            this.hideLoadingState();
        }
    }

    // Set active navigation item
    setActivePanel(panelId) {
        // Remove active class from all items
        this.navItems.forEach(item => {
            item.classList.remove('active');
            item.style.transform = '';
        });

        // Add active class to current item
        const activeItem = Array.from(this.navItems).find(item => 
            item.dataset.panel === panelId
        );

        if (activeItem) {
            activeItem.classList.add('active');
            ConfigUtils.log('debug', `Set active panel: ${panelId}`);
        }
    }

    // Show loading state for navigation
    showLoadingState(panelId) {
        const item = Array.from(this.navItems).find(item => 
            item.dataset.panel === panelId
        );

        if (item) {
            item.style.opacity = '0.6';
            item.style.pointerEvents = 'none';
            
            // Add loading spinner to icon
            const icon = item.querySelector('.icon');
            if (icon) {
                icon.dataset.originalIcon = icon.textContent;
                icon.textContent = '⏳';
                icon.style.animation = 'rotate 1s linear infinite';
            }
        }
    }

    // Hide loading state
    hideLoadingState() {
        this.navItems.forEach(item => {
            item.style.opacity = '';
            item.style.pointerEvents = '';
            
            const icon = item.querySelector('.icon');
            if (icon && icon.dataset.originalIcon) {
                icon.textContent = icon.dataset.originalIcon;
                icon.style.animation = '';
                delete icon.dataset.originalIcon;
            }
        });
    }

    // Show error state
    showErrorState(panelId, errorMessage) {
        const item = Array.from(this.navItems).find(item => 
            item.dataset.panel === panelId
        );

        if (item) {
            item.style.borderColor = '#dc3545';
            item.title = `Error loading: ${errorMessage}`;
            
            setTimeout(() => {
                item.style.borderColor = '';
                item.title = item.dataset.description;
            }, 3000);
        }
    }

    // Update browser history
    updateHistory(panelId) {
        if (GDA_CONFIG.features.history) {
            const url = new URL(window.location);
            url.searchParams.set('panel', panelId);
            window.history.pushState({ panel: panelId }, '', url);
        }
    }

    // Dispatch custom navigation event
    dispatchNavigationEvent(panelId, moduleId) {
        const event = new CustomEvent('gda:navigation', {
            detail: {
                panel: panelId,
                module: moduleId,
                timestamp: Date.now()
            }
        });
        
        document.dispatchEvent(event);
        ConfigUtils.log('debug', 'Navigation event dispatched', event.detail);
    }

    // Get current panel
    getCurrentPanel() {
        return this.currentPanel;
    }

    // Get navigation item by ID
    getNavigationItem(itemId) {
        return GDA_CONFIG.navigation.find(item => item.id === itemId);
    }

    // Check if navigation is initialized
    isInitialized() {
        return this.initialized;
    }

    // Handle browser back/forward buttons
    handlePopState(event) {
        if (event.state && event.state.panel) {
            const navItem = this.getNavigationItem(event.state.panel);
            if (navItem) {
                this.navigateToPanel(navItem.panel, navItem.module);
            }
        }
    }

    // Destroy navigation controller
    destroy() {
        if (this.navigationContainer) {
            this.navigationContainer.innerHTML = '';
        }
        
        this.navItems = [];
        this.currentPanel = null;
        this.initialized = false;
        
        ConfigUtils.log('info', 'Navigation controller destroyed');
    }
}

// Initialize and make globally available
window.NavigationController = NavigationController;

// Handle browser navigation
window.addEventListener('popstate', (event) => {
    if (window.navigationController) {
        window.navigationController.handlePopState(event);
    }
});

ConfigUtils.log('info', 'Navigation controller class loaded');
