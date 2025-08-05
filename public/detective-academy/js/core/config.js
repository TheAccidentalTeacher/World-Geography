/* ===== GEOGRAPHIC DETECTIVE ACADEMY - CONFIGURATION ===== */

const GDA_CONFIG = {
    // Application Information
    app: {
        name: 'Geographic Detective Academy',
        version: '2.0.0',
        subtitle: 'Q1 Simulation - The Mystery of the Missing Maps',
        description: 'Comprehensive 12-day geography curriculum simulation'
    },

    // Navigation Configuration
    navigation: [
        {
            id: 'overview',
            label: 'Overview',
            icon: '🎯',
            panel: 'overview',
            module: 'overview',
            description: 'Academy overview and objectives'
        },
        {
            id: 'teacher-guide',
            label: 'Teacher Guide',
            icon: '📚',
            panel: 'teacher-guide',
            module: 'teacher-guide',
            description: 'Complete educator implementation guide'
        },
        {
            id: 'daily-structure',
            label: 'Daily Structure',
            icon: '📅',
            panel: 'daily-structure',
            module: 'daily-structure',
            description: 'Day-by-day curriculum breakdown'
        },
        {
            id: 'investigation-events',
            label: 'Investigation Events',
            icon: '🕵️',
            panel: 'investigation-events',
            module: 'investigation-events',
            description: 'Interactive case investigations'
        },
        {
            id: 'presentation',
            label: 'Presentation',
            icon: '🎬',
            panel: 'presentation',
            module: 'presentation',
            description: 'Interactive presentation slides'
        },
        {
            id: 'team-roles',
            label: 'Team Roles',
            icon: '👥',
            panel: 'team-roles',
            module: 'team-roles',
            description: 'Student role assignments and responsibilities'
        },
        {
            id: 'student-materials',
            label: 'Student Materials',
            icon: '📝',
            panel: 'student-materials',
            module: 'student-materials',
            description: 'Downloadable resources and worksheets'
        },
        {
            id: 'assessment-system',
            label: 'Assessment System',
            icon: '📊',
            panel: 'assessment-system',
            module: 'assessment-system',
            description: 'Comprehensive evaluation framework'
        },
        {
            id: 'complete-package',
            label: 'Complete Package',
            icon: '📦',
            panel: 'complete-package',
            module: 'complete-package',
            description: 'Download all materials and guides'
        }
    ],

    // Module Configuration
    modules: {
        overview: {
            title: 'Geographic Detective Academy Overview',
            loadOnInit: true,
            cacheable: true
        },
        'teacher-guide': {
            title: 'Comprehensive Teacher Implementation Guide',
            loadOnInit: false,
            cacheable: true
        },
        'daily-structure': {
            title: '12-Day Curriculum Structure',
            loadOnInit: false,
            cacheable: true
        },
        'investigation-events': {
            title: 'Investigation Cases and Events',
            loadOnInit: false,
            cacheable: true
        },
        'team-roles': {
            title: 'Student Team Roles and Responsibilities',
            loadOnInit: false,
            cacheable: false
        },
        'student-materials': {
            title: 'Student Resources and Materials',
            loadOnInit: false,
            cacheable: false
        },
        'assessment-system': {
            title: 'Comprehensive Assessment Framework',
            loadOnInit: false,
            cacheable: true
        },
        'complete-package': {
            title: 'Complete Curriculum Package',
            loadOnInit: false,
            cacheable: false
        }
    },

    // API Endpoints (for future server integration)
    api: {
        baseUrl: '/api/detective-academy',
        endpoints: {
            materials: '/materials',
            assessments: '/assessments',
            slides: '/slides',
            reports: '/reports'
        }
    },

    // Content Paths
    content: {
        templates: 'templates/',
        data: 'data/',
        assets: 'assets/',
        downloads: 'downloads/'
    },

    // Animation Settings
    animations: {
        transitionDuration: 500,
        fadeInDelay: 100,
        slideInDuration: 300
    },

    // PDF Generation Settings
    pdf: {
        format: 'A4',
        margin: {
            top: '1in',
            bottom: '1in',
            left: '0.75in',
            right: '0.75in'
        },
        filename: {
            prefix: 'GDA_',
            timestamp: true
        }
    },

    // Feature Flags
    features: {
        darkMode: true,
        printMode: true,
        offlineMode: false,
        analytics: false,
        autoSave: true
    },

    // Error Handling
    errors: {
        retryAttempts: 3,
        retryDelay: 1000,
        showUserFriendlyMessages: true
    },

    // Debug Settings
    debug: {
        enabled: false,
        logLevel: 'info', // 'debug', 'info', 'warn', 'error'
        showPerformanceMetrics: false
    }
};

// Make configuration globally available
window.GDA_CONFIG = GDA_CONFIG;

// Utility functions for configuration
const ConfigUtils = {
    getNavigationItem(id) {
        return GDA_CONFIG.navigation.find(item => item.id === id);
    },

    getModuleConfig(moduleId) {
        return GDA_CONFIG.modules[moduleId];
    },

    getFeatureFlag(feature) {
        return GDA_CONFIG.features[feature] || false;
    },

    getApiEndpoint(endpoint) {
        return GDA_CONFIG.api.baseUrl + GDA_CONFIG.api.endpoints[endpoint];
    },

    isDebugEnabled() {
        return GDA_CONFIG.debug.enabled;
    },

    log(level, message, data = null) {
        if (!this.isDebugEnabled()) return;
        
        const levels = ['debug', 'info', 'warn', 'error'];
        const configLevel = levels.indexOf(GDA_CONFIG.debug.logLevel);
        const messageLevel = levels.indexOf(level);
        
        if (messageLevel >= configLevel) {
            const timestamp = new Date().toISOString();
            const prefix = `[GDA ${level.toUpperCase()}] ${timestamp}:`;
            
            if (data) {
                console[level](prefix, message, data);
            } else {
                console[level](prefix, message);
            }
        }
    }
};

window.ConfigUtils = ConfigUtils;
