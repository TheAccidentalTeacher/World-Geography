const { MongoClient, GridFSBucket } = require('mongodb');

async function testSlideAccess() {
    const mongoUri = 'mongodb+srv://scosom:nonPhubic4@brainstorm-cluster.bg60my0.mongodb.net/geography-curriculum';
    const client = new MongoClient(mongoUri);
    
    try {
        await client.connect();
        console.log('✅ Connected to MongoDB');
        
        const db = client.db('geography-curriculum');
        const bucket = new GridFSBucket(db, { bucketName: 'slides' });
        
        // Test accessing slides 1-5
        for (let i = 1; i <= 5; i++) {
            const testFiles = [
                `${i}_Geographic-Detective-Academy.png`,
                `${i}_URGENT-Global-Geographic-Crisis.png`,
                `${i}_You-Are-Our-Last-Hope.png`,
                `${i}_Your-Detective-Academy-Training-Program.png`,
                `${i}_Form-Your-Detective-Unit.png`
            ];
            
            const filename = testFiles[i-1];
            console.log(`\n🔍 Testing slide ${i}: ${filename}`);
            
            try {
                const files = await bucket.find({ filename: filename }).toArray();
                if (files.length > 0) {
                    console.log(`✅ Found: ${filename} (${files[0].length} bytes)`);
                } else {
                    console.log(`❌ NOT FOUND: ${filename}`);
                }
            } catch (error) {
                console.log(`💥 ERROR accessing ${filename}:`, error.message);
            }
        }
        
    } catch (error) {
        console.error('Connection error:', error);
    } finally {
        await client.close();
    }
}

testSlideAccess();
