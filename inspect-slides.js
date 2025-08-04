const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');

// Database inspection script for slides
async function inspectSlides() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://scosom:nonPhubic4@brainstorm-cluster.bg60my0.mongodb.net/geography-curriculum';
    
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
    console.log('📊 Database:', mongoose.connection.name);
    
    // Initialize GridFS bucket for slides
    const slidesBucket = new GridFSBucket(mongoose.connection.db, {
      bucketName: 'slides'
    });
    console.log('🗂️ GridFS bucket initialized for slides');
    
    // List all files in the slides bucket
    console.log('\n📋 SCANNING SLIDES BUCKET...\n');
    
    const files = await slidesBucket.find({}).toArray();
    
    if (files.length === 0) {
      console.log('✅ No slide files found in database - safe to proceed with new slides');
      return;
    }
    
    console.log(`🔍 Found ${files.length} slide files in database:\n`);
    
    files.forEach((file, index) => {
      console.log(`${index + 1}. ${file.filename}`);
      console.log(`   📅 Upload Date: ${file.uploadDate}`);
      console.log(`   📏 Size: ${(file.length / 1024 / 1024).toFixed(2)} MB`);
      console.log(`   🆔 ID: ${file._id}`);
      console.log('');
    });
    
    console.log('⚠️  SAFETY ANALYSIS:');
    console.log('   • These files are currently served by your web application');
    console.log('   • They are referenced in presentation-system.js');
    console.log('   • Removing them will break the current presentation system');
    console.log('   • New slides with gamma.app prompts will replace these');
    
    console.log('\n📋 NEXT STEPS:');
    console.log('1. Create new slides using the comprehensive prompts');
    console.log('2. Upload new slides to replace these');
    console.log('3. Test the new presentation system');
    console.log('4. Then safely remove old slides if needed');
    
  } catch (error) {
    console.error('❌ Error inspecting slides:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the inspection
inspectSlides();
