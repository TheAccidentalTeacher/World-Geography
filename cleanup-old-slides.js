const { MongoClient, GridFSBucket } = require('mongodb');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://scosom:nonPhubic4@brainstorm-cluster.bg60my0.mongodb.net/geography-curriculum';
const DATABASE_NAME = 'geography-curriculum';

async function cleanupOldSlides() {
    console.log('🧹 Starting cleanup of old slides...');
    
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db(DATABASE_NAME);
    const bucket = new GridFSBucket(db, { bucketName: 'slides' });
    
    try {
        // Get all slides
        const allSlides = await bucket.find().toArray();
        console.log(`📊 Found ${allSlides.length} total slides`);
        
        // Separate old slides (July 29) from new slides (August 3)
        const oldSlides = allSlides.filter(slide => 
            slide.uploadDate < new Date('2025-08-03') // Before August 3rd
        );
        
        const newSlides = allSlides.filter(slide => 
            slide.uploadDate >= new Date('2025-08-03') // August 3rd or later
        );
        
        console.log(`🗑️  Old slides to delete: ${oldSlides.length}`);
        console.log(`✅ New slides to keep: ${newSlides.length}`);
        
        // Delete old slides
        let deletedCount = 0;
        for (const slide of oldSlides) {
            try {
                await bucket.delete(slide._id);
                console.log(`🗑️  Deleted: ${slide.filename}`);
                deletedCount++;
            } catch (error) {
                console.error(`❌ Error deleting ${slide.filename}:`, error.message);
            }
        }
        
        console.log(`\n📊 Cleanup Summary:`);
        console.log(`   🗑️  Old slides deleted: ${deletedCount}`);
        console.log(`   ✅ New slides remaining: ${newSlides.length}`);
        
        // Verify final count
        const finalSlides = await bucket.find().toArray();
        console.log(`\n✅ Final slide count: ${finalSlides.length}`);
        
        // Show the first few remaining slides for verification
        console.log('\n📋 Remaining slides (first 10):');
        finalSlides.slice(0, 10).forEach((slide, index) => {
            console.log(`   ${index + 1}. ${slide.filename} (${new Date(slide.uploadDate).toLocaleDateString()})`);
        });
        
    } catch (error) {
        console.error('❌ Cleanup failed:', error);
    } finally {
        await client.close();
        console.log('🔌 MongoDB connection closed');
    }
}

// Run the cleanup
cleanupOldSlides()
    .then(() => {
        console.log('\n🎉 Cleanup completed!');
        console.log('🌐 Your Geographic Detective Academy should now show all new slides!');
    })
    .catch(error => {
        console.error('💥 Cleanup failed:', error);
        process.exit(1);
    });
