// Test the AI Lesson Planner functionality
console.log('🧪 Starting AI Lesson Planner Test...');

// Test 1: Check if modules load
fetch('/api/modules')
  .then(response => response.json())
  .then(modules => {
    console.log(`✅ Modules loaded: ${modules.length} modules found`);
    
    if (modules.length > 0) {
      const firstModule = modules[0];
      console.log(`📚 First module: ${firstModule.title} (Module ${firstModule.moduleNumber})`);
      
      // Test 2: Check if lessons load for first module
      return fetch(`/api/modules/${firstModule._id}`);
    }
  })
  .then(response => response.json())
  .then(moduleData => {
    console.log(`✅ Lessons loaded: ${moduleData.lessons.length} lessons found`);
    
    if (moduleData.lessons.length > 0) {
      const firstLesson = moduleData.lessons[0];
      console.log(`📖 First lesson: ${firstLesson.title} (Lesson ${firstLesson.lessonNumber})`);
      
      // Test 3: Create currentLessonData object
      const currentLessonData = {
        moduleNumber: moduleData.moduleNumber,
        moduleName: moduleData.title,
        lessonNumber: firstLesson.lessonNumber,
        title: firstLesson.title,
        ...firstLesson
      };
      
      console.log('✅ currentLessonData created:', currentLessonData);
      console.log('🎯 The buttons should now work with this lesson data!');
    }
  })
  .catch(error => {
    console.error('❌ Test failed:', error);
  });
