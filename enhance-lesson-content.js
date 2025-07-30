const fs = require('fs');
const path = require('path');

// Enhanced lesson content to populate the lesson companion with rich, interactive content
const enhancedLessonContent = {
  "World Religions of Southwest Asia": {
    1: {
      title: "Introduction to Southwest Asian Religions",
      objectives: [
        "Identify the three major monotheistic religions that originated in Southwest Asia",
        "Explain the concept of monotheism and its significance", 
        "Locate the geographic origins of Judaism, Christianity, and Islam on a map",
        "Compare basic beliefs and practices of these three religions"
      ],
      vocabulary: [
        { term: "Monotheism", definition: "The belief in one God" },
        { term: "Judaism", definition: "The world's oldest monotheistic religion, whose followers are called Jews" },
        { term: "Christianity", definition: "A monotheistic religion based on the teachings of Jesus Christ" },
        { term: "Islam", definition: "A monotheistic religion founded by the Prophet Muhammad" },
        { term: "Abraham", definition: "The patriarch considered the father of the Jewish, Christian, and Islamic faiths" },
        { term: "Torah", definition: "The sacred text of Judaism" },
        { term: "Bible", definition: "The sacred text of Christianity" },
        { term: "Quran", definition: "The sacred text of Islam" }
      ],
      materials: [
        "World map showing Southwest Asia",
        "Timeline of religious development",
        "Comparison chart for three religions",
        "Images of religious symbols and sacred sites",
        "Student notebooks",
        "Colored pencils or markers"
      ],
      procedures: [
        "Begin with a map activity to locate Southwest Asia and identify key countries",
        "Introduce the concept of monotheism through discussion and examples",
        "Present timeline showing the development of Judaism, Christianity, and Islam",
        "Create a three-column comparison chart with students",
        "Discuss Abraham as the common ancestor figure",
        "Show images of religious symbols and explain their significance",
        "Have students complete vocabulary matching activity",
        "Conclude with exit ticket assessment"
      ],
      activities: [
        "Map location activity",
        "Timeline creation",
        "Religion comparison chart",
        "Symbol identification game",
        "Vocabulary matching",
        "Think-pair-share discussions"
      ],
      assessments: [
        "Map labeling quiz",
        "Vocabulary matching worksheet",
        "Exit ticket with one similarity and one difference between religions",
        "Participation in class discussions"
      ],
      timeEstimate: "50 minutes",
      difficulty: "medium"
    },
    2: {
      title: "Judaism: History and Beliefs",
      objectives: [
        "Trace the early history of Judaism from Abraham to Moses",
        "Explain the significance of the covenant between God and Abraham",
        "Describe key events in Jewish history including the Exodus",
        "Identify major Jewish holidays and their significance",
        "Understand the role of the synagogue in Jewish community life"
      ],
      vocabulary: [
        { term: "Covenant", definition: "A sacred agreement between God and the Jewish people" },
        { term: "Exodus", definition: "The departure of the Israelites from slavery in Egypt" },
        { term: "Moses", definition: "The prophet who led the Israelites out of Egypt and received the Ten Commandments" },
        { term: "Ten Commandments", definition: "The moral and religious laws given by God to Moses" },
        { term: "Synagogue", definition: "A Jewish house of worship and community center" },
        { term: "Rabbi", definition: "A Jewish religious leader and teacher" },
        { term: "Passover", definition: "Jewish holiday commemorating the Exodus from Egypt" },
        { term: "Yom Kippur", definition: "The Day of Atonement, the holiest day in Judaism" }
      ],
      materials: [
        "Map of ancient Middle East",
        "Timeline of Jewish history",
        "Images of Jewish symbols and artifacts",
        "Video clips about Jewish holidays",
        "Student worksheets",
        "Art supplies for creating symbols"
      ],
      procedures: [
        "Review previous lesson on monotheism and Southwest Asian religions",
        "Introduce Abraham and the covenant using map and timeline",
        "Tell the story of the Exodus and Moses receiving the Ten Commandments",
        "Explore Jewish holidays and their historical significance",
        "Virtual tour of a synagogue and discussion of its features",
        "Students create their own Star of David and explain its symbolism",
        "Complete guided notes worksheet",
        "Prepare for next lesson with preview questions"
      ],
      activities: [
        "Historical timeline construction",
        "Story mapping of the Exodus",
        "Holiday calendar creation",
        "Synagogue virtual tour",
        "Symbol art project",
        "Guided note-taking"
      ],
      assessments: [
        "Timeline accuracy check",
        "Vocabulary quiz",
        "Symbol explanation writing",
        "Class participation rubric"
      ],
      timeEstimate: "45 minutes",
      difficulty: "medium"
    },
    3: {
      title: "Christianity: Origins and Spread",
      objectives: [
        "Explain the historical context of Jesus's life in ancient Palestine",
        "Describe the key teachings and messages of Jesus Christ",
        "Trace the spread of Christianity throughout the Roman Empire",
        "Identify important Christian holidays and their meanings",
        "Compare Christianity's relationship to Judaism"
      ],
      vocabulary: [
        { term: "Jesus Christ", definition: "The central figure of Christianity, believed by Christians to be the Son of God" },
        { term: "Disciples", definition: "The twelve closest followers of Jesus" },
        { term: "Apostles", definition: "The disciples who spread Christianity after Jesus's death" },
        { term: "Gospel", definition: "The 'good news' of Jesus's teachings, or the first four books of the New Testament" },
        { term: "Crucifixion", definition: "The execution of Jesus on a cross" },
        { term: "Resurrection", definition: "The Christian belief that Jesus rose from the dead" },
        { term: "Christmas", definition: "Christian holiday celebrating the birth of Jesus" },
        { term: "Easter", definition: "Christian holiday celebrating the resurrection of Jesus" }
      ],
      materials: [
        "Map of the Roman Empire",
        "Timeline of early Christianity",
        "Images of early Christian art and symbols",
        "New Testament excerpts (age-appropriate)",
        "Comparison chart materials",
        "Video about early Christian communities"
      ],
      procedures: [
        "Set historical context with map of Roman-controlled Palestine",
        "Introduce Jesus and his teachings using stories and parables",
        "Explain the crucifixion and resurrection beliefs",
        "Trace the spread of Christianity using empire map",
        "Discuss major Christian holidays and traditions",
        "Create Venn diagram comparing Christianity and Judaism",
        "Explore early Christian symbols and their meanings",
        "Complete lesson review and preview next topic"
      ],
      activities: [
        "Historical context mapping",
        "Parable analysis and discussion",
        "Empire spread tracking",
        "Holiday timeline creation",
        "Venn diagram comparison",
        "Symbol interpretation activity"
      ],
      assessments: [
        "Map quiz on Christian spread",
        "Vocabulary matching test",
        "Comparison chart completion",
        "Discussion participation points"
      ],
      timeEstimate: "50 minutes",
      difficulty: "medium"
    }
  },
  "A Geographer's World": {
    1: {
      title: "What Is Geography?",
      objectives: [
        "Define geography and explain its importance in understanding our world",
        "Distinguish between physical and human geography",
        "Identify and explain the five themes of geography",
        "Give examples of how geography affects daily life",
        "Use geographic vocabulary accurately in discussions"
      ],
      vocabulary: [
        { term: "Geography", definition: "The study of Earth's surface and the processes that shape it, as well as human activities and their relationship to the environment" },
        { term: "Physical Geography", definition: "The study of Earth's natural features like landforms, climate, and natural resources" },
        { term: "Human Geography", definition: "The study of human activities and their relationship to Earth's surface" },
        { term: "Location", definition: "Where something is positioned on Earth's surface" },
        { term: "Place", definition: "The physical and human characteristics that make a location unique" },
        { term: "Region", definition: "An area with common characteristics that set it apart from other areas" },
        { term: "Movement", definition: "How people, goods, and ideas travel from one place to another" },
        { term: "Human-Environment Interaction", definition: "How people adapt to and modify their environment" }
      ],
      materials: [
        "World map or globe",
        "Geographic vocabulary cards",
        "Local area maps",
        "Photos of different places around the world",
        "Five themes organizer worksheet",
        "Markers or colored pencils"
      ],
      procedures: [
        "Begin with a 'Where in the World?' warm-up using photos of different places",
        "Introduce the definition of geography through interactive discussion",
        "Explain the difference between physical and human geography with examples",
        "Present the five themes of geography with local examples",
        "Students work in pairs to find examples of each theme in their community",
        "Create a class poster showing the five themes with student examples",
        "Complete vocabulary practice with geographic terms",
        "Exit ticket: Name one way geography affects your daily life"
      ],
      activities: [
        "Photo analysis and location guessing",
        "Five themes scavenger hunt",
        "Community geography mapping",
        "Collaborative poster creation",
        "Vocabulary card matching game",
        "Daily life geography reflection"
      ],
      assessments: [
        "Five themes worksheet completion",
        "Vocabulary matching quiz",
        "Community example accuracy",
        "Exit ticket responses",
        "Participation in discussions"
      ],
      timeEstimate: "45 minutes",
      difficulty: "easy"
    },
    2: {
      title: "Geographic Tools and Technology",
      objectives: [
        "Use latitude and longitude to locate places on Earth",
        "Read and interpret different types of maps and their symbols",
        "Compare advantages of maps, globes, and digital tools",
        "Demonstrate understanding of scale and direction",
        "Apply geographic tools to solve location problems"
      ],
      vocabulary: [
        { term: "Latitude", definition: "Lines that run east-west and measure distance north or south of the equator" },
        { term: "Longitude", definition: "Lines that run north-south and measure distance east or west of the prime meridian" },
        { term: "Equator", definition: "The imaginary line that divides Earth into northern and southern hemispheres" },
        { term: "Prime Meridian", definition: "The imaginary line at 0° longitude that divides Earth into eastern and western hemispheres" },
        { term: "Compass Rose", definition: "A symbol showing the cardinal and intermediate directions on a map" },
        { term: "Map Scale", definition: "The relationship between distance on a map and actual distance on Earth" },
        { term: "Map Legend", definition: "A key that explains the symbols used on a map" },
        { term: "GPS", definition: "Global Positioning System that uses satellites to determine exact location" }
      ],
      materials: [
        "World atlas",
        "Coordinate worksheets",
        "Different types of maps (political, physical, climate)",
        "Compass or compass app",
        "Rulers for scale measurement",
        "GPS coordinates activity sheets",
        "Graph paper for creating maps"
      ],
      procedures: [
        "Review previous lesson with quick geography definition quiz",
        "Introduce latitude and longitude using globe or world map",
        "Practice finding coordinates with guided examples",
        "Explore different map types and discuss their purposes",
        "Learn to read map symbols, scale, and compass rose",
        "Complete coordinate treasure hunt activity",
        "Compare traditional maps with modern GPS technology",
        "Students create their own classroom map with symbols and scale"
      ],
      activities: [
        "Coordinate practice worksheets",
        "Map type comparison chart",
        "Symbol interpretation game",
        "Treasure hunt using coordinates",
        "Scale measurement practice",
        "Classroom mapping project"
      ],
      assessments: [
        "Coordinate location accuracy test",
        "Map reading comprehension quiz",
        "Symbol identification worksheet",
        "Classroom map project rubric",
        "Technology comparison essay"
      ],
      timeEstimate: "50 minutes",
      difficulty: "medium"
    }
  },
  "The Physical World": {
    1: {
      title: "Earth's Structure and Formation",
      objectives: [
        "Describe the layers of Earth's structure",
        "Explain the theory of plate tectonics and continental drift",
        "Identify major landforms created by Earth's internal forces",
        "Connect geological processes to current world geography",
        "Analyze how Earth's structure affects human settlement patterns"
      ],
      vocabulary: [
        { term: "Crust", definition: "Earth's outermost solid layer" },
        { term: "Mantle", definition: "The layer of hot rock beneath Earth's crust" },
        { term: "Core", definition: "Earth's center, consisting of outer liquid and inner solid layers" },
        { term: "Plate Tectonics", definition: "The theory that Earth's crust is divided into moving plates" },
        { term: "Continental Drift", definition: "The theory that continents slowly move across Earth's surface" },
        { term: "Earthquake", definition: "Shaking of Earth's surface caused by movement of tectonic plates" },
        { term: "Volcano", definition: "An opening in Earth's crust where lava, gas, and ash can escape" },
        { term: "Pangaea", definition: "The supercontinent that existed millions of years ago" }
      ],
      materials: [
        "Cross-section diagram of Earth",
        "Tectonic plates map",
        "Clay or Play-Doh for modeling",
        "Earthquake and volcano videos",
        "World map showing major landforms",
        "Timeline of Earth's formation"
      ],
      procedures: [
        "Begin with a 'What's inside Earth?' brainstorming session",
        "Present Earth's layer structure using diagrams and analogies",
        "Demonstrate plate tectonics with clay modeling activity",
        "Show evidence for continental drift using puzzle-piece continents",
        "Explore earthquake and volcano locations on world map",
        "Connect geological processes to modern landscape features",
        "Create timeline of major geological events",
        "Assess understanding with layer identification quiz"
      ],
      activities: [
        "Earth layer modeling with clay",
        "Continental drift puzzle activity",
        "Earthquake and volcano mapping",
        "Geological timeline creation",
        "Landform identification game",
        "Virtual Earth exploration"
      ],
      assessments: [
        "Earth layer diagram labeling",
        "Plate tectonics explanation writing",
        "Landform identification quiz",
        "Timeline accuracy evaluation",
        "Class discussion participation"
      ],
      timeEstimate: "50 minutes",
      difficulty: "medium"
    }
  },
  "The Human World": {
    1: {
      title: "Population Patterns and Demographics",
      objectives: [
        "Analyze global population distribution patterns",
        "Explain factors that influence where people live",
        "Compare population density in different world regions",
        "Understand demographic concepts like birth rate and life expectancy",
        "Predict future population trends and their implications"
      ],
      vocabulary: [
        { term: "Population Density", definition: "The number of people living in a specific area" },
        { term: "Demographics", definition: "Statistical data about population characteristics" },
        { term: "Birth Rate", definition: "The number of births per 1,000 people per year" },
        { term: "Death Rate", definition: "The number of deaths per 1,000 people per year" },
        { term: "Life Expectancy", definition: "The average number of years a person is expected to live" },
        { term: "Migration", definition: "The movement of people from one place to another" },
        { term: "Urbanization", definition: "The process of population shift from rural to urban areas" },
        { term: "Population Growth Rate", definition: "The rate at which a population increases or decreases" }
      ],
      materials: [
        "World population density map",
        "Population pyramid worksheets",
        "Country demographic data sheets",
        "Graphing materials",
        "Population growth simulation game",
        "Calculator for statistics"
      ],
      procedures: [
        "Examine world population density map and identify patterns",
        "Discuss factors that make areas attractive or unattractive for settlement",
        "Introduce demographic vocabulary with real-world examples",
        "Create and interpret population pyramids for different countries",
        "Calculate population growth rates using provided data",
        "Simulate population changes through interactive game",
        "Analyze migration patterns and their causes",
        "Predict future population challenges and opportunities"
      ],
      activities: [
        "Population density map analysis",
        "Population pyramid construction",
        "Growth rate calculations",
        "Migration simulation game",
        "Demographic data comparison",
        "Future prediction discussion"
      ],
      assessments: [
        "Map interpretation quiz",
        "Population pyramid accuracy",
        "Calculation worksheet completion",
        "Prediction essay writing",
        "Group discussion participation"
      ],
      timeEstimate: "45 minutes",
      difficulty: "medium"
    }
  }
};

// Function to enhance existing lesson calendar map with rich content
function enhanceLessonContent() {
  const mapPath = path.join(__dirname, 'lesson-calendar-map.json');
  
  if (!fs.existsSync(mapPath)) {
    console.log('❌ Lesson calendar map not found. Please run curriculum extraction first.');
    return;
  }
  
  const lessonMap = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
  let enhancementCount = 0;
  
  // Enhance lessons with rich content
  for (const dayNumber in lessonMap) {
    const lessonInfo = lessonMap[dayNumber];
    const moduleTitle = lessonInfo.moduleTitle;
    const lessonNumber = lessonInfo.lessonNumber;
    
    // Check if we have enhanced content for this module and lesson
    if (enhancedLessonContent[moduleTitle] && enhancedLessonContent[moduleTitle][lessonNumber]) {
      const enhancedContent = enhancedLessonContent[moduleTitle][lessonNumber];
      
      // Merge enhanced content with existing lesson
      lessonInfo.lesson = {
        ...lessonInfo.lesson,
        ...enhancedContent,
        title: enhancedContent.title,
        lessonNumber: lessonNumber
      };
      
      enhancementCount++;
      console.log(`✅ Enhanced lesson ${dayNumber}: ${enhancedContent.title}`);
    }
  }
  
  // Save enhanced lesson map
  const enhancedMapPath = path.join(__dirname, 'lesson-calendar-map-enhanced.json');
  fs.writeFileSync(enhancedMapPath, JSON.stringify(lessonMap, null, 2));
  
  // Also update the original map
  fs.writeFileSync(mapPath, JSON.stringify(lessonMap, null, 2));
  
  console.log(`🎉 Enhanced ${enhancementCount} lessons with rich content!`);
  console.log(`📁 Enhanced data saved to: ${enhancedMapPath}`);
  
  return {
    totalLessons: Object.keys(lessonMap).length,
    enhancedLessons: enhancementCount,
    modules: Object.keys(enhancedLessonContent)
  };
}

// Export for use in other files
module.exports = {
  enhancedLessonContent,
  enhanceLessonContent
};

// Run if called directly
if (require.main === module) {
  console.log('🚀 Starting lesson content enhancement...');
  const report = enhanceLessonContent();
  console.log('📊 Enhancement Report:', JSON.stringify(report, null, 2));
}
