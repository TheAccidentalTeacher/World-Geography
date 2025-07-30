/**
 * Enhanced Geographic Detective Academy with full content panels
 * This builds upon the framework extracted from Oregon Trail simulation materials
 */

// Enhanced content for all navigation panels
const enhancedSimulationContent = {
    
    dailyStructure: {
        title: "Daily Structure",
        overview: "Each day follows a structured investigation format designed to build geographic skills progressively",
        classFormat: {
            duration: "50 minutes",
            structure: [
                {
                    timeRange: "0-5 minutes",
                    phase: "Detective Team Assembly",
                    activities: [
                        "Team roles review and responsibilities check",
                        "Case briefing and evidence distribution", 
                        "Mission objectives and success criteria review",
                        "Equipment and resource preparation"
                    ],
                    geographicFocus: "Spatial awareness and team coordination"
                },
                {
                    timeRange: "5-35 minutes", 
                    phase: "Case Investigation",
                    activities: [
                        "Evidence analysis using geographic tools",
                        "Collaborative problem-solving with team roles",
                        "Map reading and coordinate analysis",
                        "Application of geographic concepts to solve mysteries"
                    ],
                    geographicFocus: "Core geographic skill development and application"
                },
                {
                    timeRange: "35-45 minutes",
                    phase: "Team Debrief",
                    activities: [
                        "Share findings and coordinate team conclusions",
                        "Discuss geographic concepts discovered",
                        "Plan next investigation steps",
                        "Peer teaching and knowledge sharing"
                    ],
                    geographicFocus: "Synthesis and communication of geographic understanding"
                },
                {
                    timeRange: "45-50 minutes",
                    phase: "Case Log Documentation", 
                    activities: [
                        "Document investigation progress and evidence",
                        "Record geographic concepts learned",
                        "Prepare materials for next case",
                        "Individual reflection on role performance"
                    ],
                    geographicFocus: "Metacognition and geographic vocabulary development"
                }
            ]
        },
        weeklyProgression: [
            {
                week: 1,
                focus: "Foundation Building",
                days: [
                    { day: 0, title: "Academy Orientation", focus: "Team formation and role assignment" },
                    { day: 1, title: "First Case: Local Mystery", focus: "Basic map reading and coordinates" },
                    { day: 2, title: "Evidence Analysis", focus: "Geographic tools and measurement" }
                ]
            },
            {
                week: 2,
                focus: "Skill Development", 
                days: [
                    { day: 3, title: "Regional Investigation", focus: "Understanding place and region" },
                    { day: 4, title: "Movement Patterns", focus: "Migration and transportation analysis" },
                    { day: 5, title: "Environmental Clues", focus: "Human-environment interaction" }
                ]
            },
            {
                week: 3,
                focus: "Advanced Cases",
                days: [
                    { day: 6, title: "International Case", focus: "Global geographic patterns" },
                    { day: 7, title: "Historical Geography", focus: "Change over time analysis" },
                    { day: 8, title: "Complex Investigation", focus: "Multi-layered geographic analysis" }
                ]
            },
            {
                week: 4,
                focus: "Mastery & Graduation",
                days: [
                    { day: 9, title: "Team Challenge", focus: "Collaborative complex problem-solving" },
                    { day: 10, title: "Final Preparation", focus: "Case presentation preparation" },
                    { day: 11, title: "Academy Graduation", focus: "Master case presentation and assessment" }
                ]
            }
        ]
    },

    investigationEvents: {
        title: "Investigation Events",
        description: "Progressive case studies designed to build geographic detective skills",
        cases: [
            {
                id: "case-001",
                title: "The Great Globe Heist",
                level: "Rookie",
                difficulty: "Beginner",
                timeRequired: "1 class period",
                geographicSkills: ["Coordinate systems", "Map reading", "Cardinal directions"],
                scenario: {
                    setting: "Roosevelt Middle School, Room 204",
                    mystery: "A 12-inch classroom globe has mysteriously disappeared",
                    urgency: "The globe contains important geographic reference points needed for upcoming lessons"
                },
                evidence: [
                    {
                        item: "Empty globe stand with dust outline",
                        significance: "Shows exact size and mounting of missing globe",
                        geographicClue: "Indicates familiarity with classroom geography resources"
                    },
                    {
                        item: "Torn paper with coordinates: 40°N, 74°W", 
                        significance: "Specific location reference found at crime scene",
                        geographicClue: "New York Harbor area - requires coordinate system knowledge"
                    },
                    {
                        item: "Compass pointing northeast",
                        significance: "Direction indicator left behind by suspect",
                        geographicClue: "Cardinal direction awareness and navigation planning"
                    }
                ],
                solution: {
                    method: "Coordinate analysis reveals New York Harbor location",
                    geographicConcepts: "Latitude/longitude systems, cardinal directions, map reading",
                    realWorldConnection: "GPS navigation and coordinate-based location services"
                }
            },
            {
                id: "case-002",
                title: "The Vanishing Village Maps",
                level: "Detective", 
                difficulty: "Intermediate",
                timeRequired: "2 class periods",
                geographicSkills: ["Regional analysis", "Cultural geography", "Settlement patterns"],
                scenario: {
                    setting: "International Geographic Bureau - Regional Studies Division",
                    mystery: "Historic village maps from three different continents have vanished",
                    urgency: "Cultural preservation project deadline approaching"
                },
                evidence: [
                    {
                        item: "Security footage showing suspect studying population density maps",
                        significance: "Interest in demographic patterns and settlement geography",
                        geographicClue: "Understanding of population distribution and urbanization"
                    },
                    {
                        item: "Research notes mentioning 'river confluence patterns'",
                        significance: "Knowledge of how waterways influence settlement locations",
                        geographicClue: "Physical geography impact on human settlement decisions"
                    }
                ],
                solution: {
                    method: "Analysis of settlement patterns and physical geography relationships",
                    geographicConcepts: "Human-environment interaction, cultural regions, site and situation",
                    realWorldConnection: "Urban planning and sustainable development"
                }
            },
            {
                id: "case-003",
                title: "The Climate Data Conspiracy", 
                level: "Specialist",
                difficulty: "Advanced",
                timeRequired: "3 class periods",
                geographicSkills: ["Climate analysis", "Data interpretation", "Environmental geography"],
                scenario: {
                    setting: "Global Climate Research Institute",
                    mystery: "Critical climate data maps spanning 50 years have been systematically altered",
                    urgency: "International climate summit requires accurate historical data"
                },
                evidence: [
                    {
                        item: "Modified temperature gradient maps",
                        significance: "Patterns of data manipulation show geographic knowledge",
                        geographicClue: "Understanding of climate systems and temperature variation patterns"
                    },
                    {
                        item: "Deleted precipitation records from specific regions",
                        significance: "Targeted removal suggests knowledge of climate impact areas",
                        geographicClue: "Awareness of regional climate patterns and environmental consequences"
                    }
                ],
                solution: {
                    method: "Climate pattern analysis and environmental impact assessment",
                    geographicConcepts: "Climate systems, environmental change, data analysis and interpretation",
                    realWorldConnection: "Climate science, environmental policy, and global sustainability"
                }
            }
        ]
    },

    studentMaterials: {
        title: "Student Materials",
        description: "Comprehensive resources for geographic detective work",
        handouts: [
            {
                id: "detective-handbook",
                title: "Geographic Detective Handbook",
                description: "Essential reference guide for geographic investigation techniques",
                contents: [
                    "Coordinate system quick reference (latitude/longitude, UTM)",
                    "Map reading techniques and scale interpretation", 
                    "Evidence collection and documentation standards",
                    "Geographic vocabulary and terminology",
                    "Investigation process flowchart and methodologies"
                ],
                pageCount: 12,
                format: "Spiral-bound reference booklet"
            },
            {
                id: "evidence-collection-log",
                title: "Evidence Collection Log Template",
                description: "Structured format for documenting case evidence and analysis",
                sections: [
                    "Case identification and basic information",
                    "Evidence inventory with geographic significance notes",
                    "Witness testimony and geographic clue analysis",
                    "Coordinate and location data recording",
                    "Team collaboration and role responsibility tracking"
                ],
                pageCount: 4,
                format: "Double-sided worksheet packet"
            },
            {
                id: "coordinate-analysis-worksheet",
                title: "Coordinate Analysis Worksheet Collection",
                description: "Practice exercises for latitude/longitude and coordinate system mastery",
                worksheets: [
                    "Basic coordinate identification and plotting",
                    "Distance calculation between coordinates",
                    "Coordinate system conversion practice",
                    "Real-world location identification challenges",
                    "GPS navigation and waypoint exercises"
                ],
                pageCount: 8,
                format: "Consumable practice worksheets"
            },
            {
                id: "case-report-template",
                title: "Case Report Presentation Template",
                description: "Structured format for presenting investigation findings and solutions",
                components: [
                    "Executive summary of case and findings",
                    "Evidence analysis and geographic interpretation", 
                    "Investigation methodology and team roles",
                    "Geographic concepts applied and learned",
                    "Real-world connections and applications",
                    "Recommendations and next steps"
                ],
                pageCount: 6,
                format: "Presentation template with graphic organizers"
            }
        ],
        digitalTools: [
            {
                name: "Interactive World Map Portal",
                description: "Web-based mapping tool with coordinate overlay and measurement features",
                features: ["Coordinate plotting and identification", "Distance and area measurement", "Layer overlays for climate, population, physical features"],
                accessLevel: "Browser-based, no installation required"
            },
            {
                name: "Geographic Investigation Database",
                description: "Searchable database of geographic facts, statistics, and reference information",
                features: ["Country and region fact sheets", "Climate and physical geography data", "Cultural and economic indicators"],
                accessLevel: "Password-protected student portal"
            },
            {
                name: "Virtual Evidence Locker",
                description: "Digital repository for storing and organizing case evidence and findings",
                features: ["Team collaboration workspace", "Evidence photo and document storage", "Investigation timeline tracking"],
                accessLevel: "Team-based shared workspace"
            }
        ]
    },

    assessmentRubrics: {
        title: "Assessment System",
        description: "Comprehensive evaluation framework for geographic detective skills",
        formativeAssessments: [
            {
                type: "Daily Investigation Performance",
                frequency: "Every class period",
                components: [
                    {
                        skill: "Geographic Tool Usage",
                        levels: {
                            developing: "Uses basic tools with guidance",
                            proficient: "Uses tools accurately and independently", 
                            advanced: "Uses tools creatively to solve complex problems"
                        }
                    },
                    {
                        skill: "Evidence Analysis",
                        levels: {
                            developing: "Identifies basic evidence with support",
                            proficient: "Analyzes evidence and makes geographic connections",
                            advanced: "Synthesizes multiple evidence sources for complex conclusions"
                        }
                    },
                    {
                        skill: "Team Collaboration", 
                        levels: {
                            developing: "Participates in team activities with encouragement",
                            proficient: "Actively contributes to team success",
                            advanced: "Leads team problem-solving and supports others' learning"
                        }
                    }
                ]
            }
        ],
        summativeAssessments: [
            {
                type: "Master Detective Case",
                description: "Comprehensive final investigation requiring integration of all learned skills",
                components: [
                    "Independent evidence analysis and interpretation",
                    "Geographic concept application and explanation",
                    "Team leadership and collaboration demonstration",
                    "Professional presentation of findings and solutions"
                ],
                rubric: {
                    geographic_knowledge: "Demonstrates mastery of coordinate systems, map reading, and geographic themes",
                    problem_solving: "Uses systematic investigation methods to reach logical conclusions",
                    communication: "Presents findings clearly with appropriate geographic vocabulary",
                    real_world_application: "Connects case solutions to authentic geographic challenges"
                }
            }
        ]
    },

    teacherGuide: {
        title: "Teacher Implementation Guide",
        description: "Comprehensive instructor resource for successful simulation implementation",
        preparation: {
            beforeImplementation: [
                "Review all case materials and practice solutions",
                "Prepare physical materials: maps, compasses, measuring tools",
                "Set up digital access: computers, mapping software, online resources",
                "Create investigation stations and team workspace areas",
                "Prepare assessment rubrics and tracking documents"
            ],
            classroomSetup: [
                "Designate team meeting areas with workspace for 4 students",
                "Create evidence analysis station with maps and tools",
                "Set up technology corner with computer/tablet access",
                "Organize reference library with atlases and geographic resources",
                "Prepare bulletin board space for case tracking and vocabulary"
            ]
        },
        facilitation: [
            {
                phase: "Introduction and Team Formation",
                techniques: [
                    "Build excitement with 'urgent Bureau recruitment' narrative",
                    "Use interest surveys to guide team role assignments",
                    "Establish investigation protocols and classroom procedures",
                    "Model evidence analysis techniques with simple examples"
                ]
            },
            {
                phase: "Daily Case Investigation", 
                techniques: [
                    "Present cases with appropriate urgency and mystery",
                    "Circulate to support teams without giving solutions",
                    "Use questioning strategies to guide geographic thinking",
                    "Facilitate peer teaching and knowledge sharing"
                ]
            },
            {
                phase: "Assessment and Reflection",
                techniques: [
                    "Use exit tickets to check daily understanding",
                    "Facilitate team debriefs to share successful strategies",
                    "Connect case solutions to real-world geographic applications",
                    "Celebrate progress and growth in geographic thinking"
                ]
            }
        ],
        extensions: [
            "Guest speaker connections: local GIS specialists, urban planners",
            "Field investigation opportunities: local geographic mysteries",
            "Technology integration: GPS units, GIS software, virtual reality",
            "Cross-curricular connections: history, science, mathematics"
        ]
    }
};

module.exports = { enhancedSimulationContent };
