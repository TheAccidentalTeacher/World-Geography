const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');

// MongoDB connection
const connectDB = async () => {
  try {
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
    
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    return false;
  }
};

const deleteAllSlides = async () => {
  try {
    // Initialize GridFS bucket for slides
    const slidesBucket = new GridFSBucket(mongoose.connection.db, {
      bucketName: 'slides'
    });
    
    console.log('🗂️ GridFS bucket initialized');
    
    // Get all slides first to see what we're deleting
    console.log('📋 Getting list of all slides...');
    const allFiles = await slidesBucket.find({}).toArray();
    
    console.log(`📊 Found ${allFiles.length} slides to delete:`);
    allFiles.forEach((file, index) => {
      console.log(`   ${index + 1}. ${file.filename} (${Math.round(file.length / 1024)}KB)`);
    });
    
    if (allFiles.length === 0) {
      console.log('✅ No slides found - collection is already empty');
      return;
    }
    
    // Ask for confirmation (in a real scenario, but for script we'll proceed)
    console.log('\n⚠️  WARNING: This will permanently delete ALL slides from the database!');
    console.log('🗑️  Proceeding with deletion in 3 seconds...');
    
    // Wait 3 seconds to allow user to cancel if needed
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Delete all files
    console.log('\n🗑️  Starting deletion process...');
    let deletedCount = 0;
    let errorCount = 0;
    
    for (const file of allFiles) {
      try {
        await slidesBucket.delete(file._id);
        deletedCount++;
        console.log(`✅ Deleted: ${file.filename} (${deletedCount}/${allFiles.length})`);
      } catch (error) {
        errorCount++;
        console.error(`❌ Failed to delete ${file.filename}:`, error.message);
      }
    }
    
    // Final report
    console.log('\n📊 DELETION SUMMARY:');
    console.log(`   ✅ Successfully deleted: ${deletedCount} slides`);
    console.log(`   ❌ Failed to delete: ${errorCount} slides`);
    console.log(`   📊 Total processed: ${deletedCount + errorCount} slides`);
    
    // Verify deletion
    console.log('\n🔍 Verifying deletion...');
    const remainingFiles = await slidesBucket.find({}).toArray();
    console.log(`📊 Remaining slides in database: ${remainingFiles.length}`);
    
    if (remainingFiles.length === 0) {
      console.log('🎉 SUCCESS: All slides have been deleted from the database!');
      console.log('🔄 You can now upload the correct 133 slides.');
    } else {
      console.log('⚠️  Some slides may not have been deleted:');
      remainingFiles.forEach(file => {
        console.log(`   - ${file.filename}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error during deletion process:', error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('🔐 Database connection closed');
  }
};

// Main execution
const main = async () => {
  console.log('🚀 Starting slide deletion process...');
  console.log('📅 Timestamp:', new Date().toISOString());
  
  const connected = await connectDB();
  if (!connected) {
    console.error('❌ Could not connect to database. Exiting.');
    process.exit(1);
  }
  
  await deleteAllSlides();
  
  console.log('✅ Slide deletion process completed');
  process.exit(0);
};

// Run the script
main().catch(error => {
  console.error('🚨 Fatal error:', error);
  process.exit(1);
});
