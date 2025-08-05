const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');

async function checkMongoDBSlides() {
  try {
    // Connect to MongoDB using the same connection string as your server
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://scosom:nonPhubic4@brainstorm-cluster.bg60my0.mongodb.net/geography-curriculum';
    
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      bufferCommands: false
    });
    
    console.log('✅ Connected to MongoDB');
    console.log('📊 Database:', mongoose.connection.name);
    
    // Initialize GridFS bucket for slides
    const slidesBucket = new GridFSBucket(mongoose.connection.db, {
      bucketName: 'slides'
    });
    
    console.log('\n🗂️ Checking GridFS slides bucket...');
    
    // Get all files in the slides bucket
    const files = await slidesBucket.find({}).toArray();
    
    console.log(`📋 Total slides found: ${files.length}`);
    
    if (files.length > 0) {
      console.log('\n📁 First 10 slide files:');
      files.slice(0, 10).forEach((file, index) => {
        console.log(`${index + 1}. ${file.filename} (${Math.round(file.length / 1024)}KB) - uploaded: ${file.uploadDate}`);
      });
      
      if (files.length > 10) {
        console.log(`... and ${files.length - 10} more files`);
      }
      
      // Check for numbered slides (like 01_, 02_, etc.)
      const numberedSlides = files.filter(file => /^\d+_/.test(file.filename));
      console.log(`\n🔢 Numbered slides found: ${numberedSlides.length}`);
      
      if (numberedSlides.length > 0) {
        console.log('📝 Sample numbered slides:');
        numberedSlides.slice(0, 5).forEach((file, index) => {
          console.log(`  ${index + 1}. ${file.filename}`);
        });
      }
      
      // Check file types
      const fileTypes = {};
      files.forEach(file => {
        const extension = file.filename.split('.').pop().toLowerCase();
        fileTypes[extension] = (fileTypes[extension] || 0) + 1;
      });
      
      console.log('\n📊 File types:');
      Object.entries(fileTypes).forEach(([ext, count]) => {
        console.log(`  .${ext}: ${count} files`);
      });
      
    } else {
      console.log('❌ No slides found in GridFS bucket');
      
      // Check if there are any collections in the database
      const collections = await mongoose.connection.db.listCollections().toArray();
      console.log('\n📁 Available collections:');
      collections.forEach(collection => {
        console.log(`  - ${collection.name}`);
      });
      
      // Check if there's a different GridFS bucket
      const gridFSCollections = collections.filter(col => 
        col.name.startsWith('fs.') || col.name.includes('slides') || col.name.includes('files')
      );
      
      if (gridFSCollections.length > 0) {
        console.log('\n🗂️ Found potential GridFS collections:');
        gridFSCollections.forEach(col => {
          console.log(`  - ${col.name}`);
        });
      }
    }
    
    // Also check the main database collections for any curriculum data
    console.log('\n📚 Checking curriculum collections...');
    
    try {
      const curriculumCount = await mongoose.connection.db.collection('curricula').countDocuments();
      const moduleCount = await mongoose.connection.db.collection('modules').countDocuments();
      const lessonCount = await mongoose.connection.db.collection('lessons').countDocuments();
      
      console.log(`📖 Curricula: ${curriculumCount}`);
      console.log(`📑 Modules: ${moduleCount}`);
      console.log(`📄 Lessons: ${lessonCount}`);
    } catch (error) {
      console.log('⚠️ Error checking curriculum collections:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔚 Database connection closed');
  }
}

// Run the check
checkMongoDBSlides();
