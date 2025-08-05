/**
 * Upload Geographic Detective Academy slides to MongoDB
 * This script uploads all 60 slide images to MongoDB GridFS for production deployment
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// MongoDB GridFS setup
const { GridFSBucket } = require('mongodb');

let slidesBucket;

// Connect to MongoDB
async function connectToMongoDB() {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://scosom:nonPhubic4@brainstorm-cluster.bg60my0.mongodb.net/geography-curriculum';
        
        console.log('🔗 Connecting to MongoDB...');
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB');
        
        // Initialize GridFS bucket for slides
        slidesBucket = new GridFSBucket(mongoose.connection.db, {
            bucketName: 'slides'
        });
        
        console.log('🗂️ GridFS bucket initialized for slides');
        
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error);
        process.exit(1);
    }
}

// Upload a single slide to MongoDB
async function uploadSlide(filePath, fileName) {
    return new Promise((resolve, reject) => {
        const readStream = fs.createReadStream(filePath);
        const uploadStream = slidesBucket.openUploadStream(fileName, {
            metadata: {
                originalName: fileName,
                uploadDate: new Date(),
                contentType: 'image/png'
            }
        });

        readStream.pipe(uploadStream);

        uploadStream.on('error', (error) => {
            console.error(`❌ Error uploading ${fileName}:`, error);
            reject(error);
        });

        uploadStream.on('finish', () => {
            console.log(`✅ Uploaded: ${fileName}`);
            resolve();
        });
    });
}

// Upload all slides from the slides directory
async function uploadAllSlides() {
    const slidesDir = path.join(__dirname, 'public', 'Presentation', 'all');
    
    try {
        const files = fs.readdirSync(slidesDir);
        const slideFiles = files.filter(file => file.endsWith('.png')).sort();
        
        console.log(`📁 Found ${slideFiles.length} slide files to upload`);
        
        for (let i = 0; i < slideFiles.length; i++) {
            const fileName = slideFiles[i];
            const filePath = path.join(slidesDir, fileName);
            
            console.log(`📤 Uploading ${i + 1}/${slideFiles.length}: ${fileName}`);
            await uploadSlide(filePath, fileName);
        }
        
        console.log('🎉 All slides uploaded successfully!');
        
    } catch (error) {
        console.error('❌ Error uploading slides:', error);
    }
}

// Main function
async function main() {
    console.log('🎮 Geographic Detective Academy Slide Upload');
    console.log('================================================');
    
    await connectToMongoDB();
    await uploadAllSlides();
    
    console.log('✅ Upload process completed');
    process.exit(0);
}

// Run the upload
main().catch(error => {
    console.error('❌ Upload failed:', error);
    process.exit(1);
});
