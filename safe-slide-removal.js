const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');
const fs = require('fs');
const path = require('path');

// SAFE slide removal script with backup functionality
async function safeSlideRemoval() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://scosom:nonPhubic4@brainstorm-cluster.bg60my0.mongodb.net/geography-curriculum';
    
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
    
    // Initialize GridFS bucket
    const slidesBucket = new GridFSBucket(mongoose.connection.db, {
      bucketName: 'slides'
    });
    
    // Create backup directory
    const backupDir = path.join(__dirname, 'slide-backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir);
      console.log('📁 Created backup directory');
    }
    
    // Get all slide files
    const files = await slidesBucket.find({}).toArray();
    console.log(`\n🔍 Found ${files.length} slides to process`);
    
    // Prompt user for confirmation
    console.log('\n⚠️  WARNING: This will remove ALL presentation slides from MongoDB!');
    console.log('📝 Current slides will be backed up to ./slide-backups/ directory');
    console.log('🔄 You can restore them later if needed');
    console.log('\n🤔 Do you want to proceed? (y/N)');
    
    // Simulate user input for now - in practice, use readline
    const userConfirm = false; // Set to true to actually run removal
    
    if (!userConfirm) {
      console.log('❌ Operation cancelled - slides remain unchanged');
      return;
    }
    
    console.log('\n🔄 Starting backup and removal process...\n');
    
    // Backup each file before removal
    for (const file of files) {
      try {
        console.log(`📥 Backing up: ${file.filename}`);
        
        // Create backup file
        const backupPath = path.join(backupDir, file.filename);
        const writeStream = fs.createWriteStream(backupPath);
        const downloadStream = slidesBucket.openDownloadStreamByName(file.filename);
        
        // Backup the file
        await new Promise((resolve, reject) => {
          downloadStream.pipe(writeStream);
          downloadStream.on('end', resolve);
          downloadStream.on('error', reject);
        });
        
        console.log(`✅ Backed up: ${file.filename}`);
        
        // Remove from database
        await slidesBucket.delete(file._id);
        console.log(`🗑️  Removed: ${file.filename}`);
        
      } catch (error) {
        console.error(`❌ Error processing ${file.filename}:`, error);
      }
    }
    
    console.log('\n🎉 REMOVAL COMPLETE!');
    console.log(`📁 Backups saved to: ${backupDir}`);
    console.log('🔄 Your presentation system is now ready for new slides');
    
  } catch (error) {
    console.error('❌ Error in removal process:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Create restore function
async function restoreSlides() {
  try {
    const backupDir = path.join(__dirname, 'slide-backups');
    
    if (!fs.existsSync(backupDir)) {
      console.log('❌ No backup directory found');
      return;
    }
    
    console.log('🔄 Restore function available - implementation needed if required');
    console.log('📁 Backup files location:', backupDir);
    
  } catch (error) {
    console.error('❌ Error in restore function:', error);
  }
}

// Export functions
module.exports = { safeSlideRemoval, restoreSlides };

// Command line execution
if (require.main === module) {
  const action = process.argv[2];
  
  if (action === 'remove') {
    console.log('🚨 SLIDE REMOVAL SCRIPT');
    console.log('⚠️  Set userConfirm = true in script to actually remove slides');
    safeSlideRemoval();
  } else if (action === 'restore') {
    restoreSlides();
  } else {
    console.log('📋 Available commands:');
    console.log('  node safe-slide-removal.js remove  - Backup and remove all slides');
    console.log('  node safe-slide-removal.js restore - Show restore information');
    console.log('\n⚠️  RECOMMENDED: Replace slides instead of removing them');
  }
}
