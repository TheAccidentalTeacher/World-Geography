/**
 * 🚀 AUTOMATED SLIDE REPLACEMENT SYSTEM
 * 
 * This script replaces ALL slides with new ones from any folder.
 * No more hunting hardcoded references - everything updates automatically!
 * 
 * Usage: node swap-slides.js "C:\path\to\new\slides"
 * 
 * What it does:
 * 1. Clears old slides from MongoDB
 * 2. Uploads new slides to GridFS
 * 3. Updates totalSlides count everywhere
 * 4. Restarts presentation system
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
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

// Clear all existing slides
async function clearOldSlides() {
    console.log('🧹 Clearing old slides from database...');
    
    try {
        const files = await slidesBucket.find({}).toArray();
        
        for (const file of files) {
            await slidesBucket.delete(file._id);
        }
        
        console.log(`🗑️ Removed ${files.length} old slides`);
        
    } catch (error) {
        console.error('❌ Error clearing old slides:', error);
        throw error;
    }
}

// Upload a single slide
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
            resolve();
        });
    });
}

// Upload all slides from directory
async function uploadNewSlides(slidesDir) {
    console.log(`📁 Scanning directory: ${slidesDir}`);
    
    if (!fs.existsSync(slidesDir)) {
        throw new Error(`Directory does not exist: ${slidesDir}`);
    }
    
    const files = fs.readdirSync(slidesDir);
    const slideFiles = files.filter(file => 
        file.toLowerCase().endsWith('.png') || 
        file.toLowerCase().endsWith('.jpg') || 
        file.toLowerCase().endsWith('.jpeg')
    );
    
    if (slideFiles.length === 0) {
        throw new Error('No slide images found in directory');
    }
    
    // Sort slides numerically (01_, 02_, etc.)
    slideFiles.sort((a, b) => {
        const aNum = parseInt(a.match(/^(\d+)/)?.[1] || '0');
        const bNum = parseInt(b.match(/^(\d+)/)?.[1] || '0');
        return aNum - bNum;
    });
    
    console.log(`📤 Found ${slideFiles.length} slides to upload`);
    
    let uploaded = 0;
    for (const fileName of slideFiles) {
        const filePath = path.join(slidesDir, fileName);
        console.log(`📤 Uploading ${++uploaded}/${slideFiles.length}: ${fileName}`);
        await uploadSlide(filePath, fileName);
    }
    
    console.log(`🎉 Successfully uploaded ${slideFiles.length} slides!`);
    return slideFiles.length;
}

// Update totalSlides count in all files
async function updateSlideCount(newCount) {
    console.log(`🔄 Updating totalSlides count to ${newCount}...`);
    
    const filesToUpdate = [
        {
            path: './presentation-system.js',
            pattern: /this\.totalSlides = \d+;/g,
            replacement: `this.totalSlides = ${newCount};`
        },
        {
            path: './public/geographic-detective-academy.html',
            pattern: /this\.totalSlides = \d+;/g,
            replacement: `this.totalSlides = ${newCount};`
        }
    ];
    
    for (const file of filesToUpdate) {
        try {
            if (fs.existsSync(file.path)) {
                let content = fs.readFileSync(file.path, 'utf8');
                const originalContent = content;
                content = content.replace(file.pattern, file.replacement);
                
                if (content !== originalContent) {
                    fs.writeFileSync(file.path, content, 'utf8');
                    console.log(`✅ Updated: ${file.path}`);
                } else {
                    console.log(`⚠️ No changes needed: ${file.path}`);
                }
            } else {
                console.log(`⚠️ File not found: ${file.path}`);
            }
        } catch (error) {
            console.error(`❌ Error updating ${file.path}:`, error);
        }
    }
}

// Main execution
async function main() {
    console.log('🚀 GEOGRAPHIC DETECTIVE ACADEMY - SLIDE REPLACEMENT SYSTEM');
    console.log('=========================================================');
    
    // Get slides directory from command line argument
    const slidesDir = process.argv[2];
    
    if (!slidesDir) {
        console.error('❌ Usage: node swap-slides.js "path/to/slides/directory"');
        console.log('💡 Example: node swap-slides.js "C:\\Users\\scoso\\Geography-Workspace\\World-Geography\\public\\Presentation\\all"');
        process.exit(1);
    }
    
    try {
        console.log(`📂 Target directory: ${slidesDir}`);
        
        // Connect to database
        await connectToMongoDB();
        
        // Clear old slides
        await clearOldSlides();
        
        // Upload new slides
        const slideCount = await uploadNewSlides(slidesDir);
        
        // Update slide count in code files
        await updateSlideCount(slideCount);
        
        console.log('');
        console.log('🎉 SLIDE REPLACEMENT COMPLETE!');
        console.log(`📊 Total slides: ${slideCount}`);
        console.log('🔄 Restart your server to see changes');
        console.log('');
        
    } catch (error) {
        console.error('💥 Slide replacement failed:', error.message);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log('👋 Disconnected from MongoDB');
    }
}

// Run the script
if (require.main === module) {
    main();
}

module.exports = { main };
