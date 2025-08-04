const fs = require('fs');
const path = require('path');
const { MongoClient, GridFSBucket } = require('mongodb');

// MongoDB connection string (matches server.js)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://scosom:nonPhubic4@brainstorm-cluster.bg60my0.mongodb.net/geography-curriculum';
const DATABASE_NAME = 'geography-curriculum';

// Source directory for new PNG files
const NEW_SLIDES_DIR = path.join(__dirname, 'public', 'new png uploads', 'Geographic-Detective-Academy-try-2');

async function uploadNewSlides() {
    console.log('🔄 Starting slide upload process...');
    
    // Connect to MongoDB
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db(DATABASE_NAME);
    const bucket = new GridFSBucket(db, { bucketName: 'slides' });
    
    try {
        // Read all PNG files from the new slides directory
        const files = fs.readdirSync(NEW_SLIDES_DIR)
            .filter(file => file.endsWith('.png'))
            .sort((a, b) => {
                // Sort by number at beginning of filename
                const numA = parseInt(a.split('_')[0]);
                const numB = parseInt(b.split('_')[0]);
                return numA - numB;
            });
        
        console.log(`📁 Found ${files.length} PNG files to upload`);
        
        let uploadCount = 0;
        let replaceCount = 0;
        
        for (const filename of files) {
            const filePath = path.join(NEW_SLIDES_DIR, filename);
            
            try {
                // Check if file already exists in GridFS
                const existingFile = await bucket.find({ filename }).toArray();
                
                if (existingFile.length > 0) {
                    // Delete existing file
                    await bucket.delete(existingFile[0]._id);
                    console.log(`🗑️  Deleted existing: ${filename}`);
                    replaceCount++;
                } else {
                    uploadCount++;
                }
                
                // Upload new file
                const readStream = fs.createReadStream(filePath);
                const uploadStream = bucket.openUploadStream(filename, {
                    metadata: {
                        uploadDate: new Date(),
                        source: 'gamma.app export',
                        version: '2.0'
                    }
                });
                
                await new Promise((resolve, reject) => {
                    readStream.pipe(uploadStream)
                        .on('error', reject)
                        .on('finish', resolve);
                });
                
                console.log(`✅ Uploaded: ${filename}`);
                
            } catch (error) {
                console.error(`❌ Error processing ${filename}:`, error.message);
            }
        }
        
        console.log('\n📊 Upload Summary:');
        console.log(`   📁 Total files processed: ${files.length}`);
        console.log(`   🔄 Files replaced: ${replaceCount}`);
        console.log(`   ➕ New files uploaded: ${uploadCount}`);
        
        // Verify all slides are now in database
        const allSlides = await bucket.find().toArray();
        console.log(`\n✅ Database now contains ${allSlides.length} slides`);
        
        // Show first few slides for verification
        console.log('\n📋 Sample slides in database:');
        allSlides.slice(0, 5).forEach(slide => {
            console.log(`   - ${slide.filename} (${Math.round(slide.length / 1024)}KB)`);
        });
        
    } catch (error) {
        console.error('❌ Upload process failed:', error);
    } finally {
        await client.close();
        console.log('🔌 MongoDB connection closed');
    }
}

// Run the upload process
uploadNewSlides()
    .then(() => {
        console.log('\n🎉 Slide upload process completed!');
        console.log('🌐 Your Geographic Detective Academy is now running with new slides!');
    })
    .catch(error => {
        console.error('💥 Upload process failed:', error);
        process.exit(1);
    });
