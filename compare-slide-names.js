// Database slide names (from inspect-slides.js output)
const databaseSlides = [
    '1_Geographic-Detective-Academy.png',
    '2_URGENT-Global-Geographic-Crisis.png',
    '3_You-Are-Our-Last-Hope.png',
    '4_Your-Detective-Academy-Training-Program.png',
    '5_Form-Your-Detective-Unit.png',
    '6_DAY-1.png',
    '7_Initial-Crime-Scene-Investigation.png',
    '8_Critical-Evidence-Coordinate-Fragment.png',
    '9_Apply-Your-Geographic-Detective-Skills.png',
    '10_Witness-Interview-Maintenance-Staff.png',
    '11_Solve-the-Geographic-Mystery.png',
    '12_CASE-SOLVED.png',
    '13_DAY-2.png',
    '14_Crime-Scene-5200m-Elevation.png',
    '15_Evidence-Systematic-Elevation-Fraud.png',
    '16_Expert-Witness-International-Cartographer.png',
    '17_Reading-the-Landscape-for-Clues.png',
    '18_Elevation-Analysis-Truth-vs-Deception.png',
    '19_CASE-SOLVED-Mountain-Justice-Served.png',
    '20_Geographic-Detective-Skills-Level-Up.png',
    '21_DAY-3.png',
    '22_Cultural-Regions-Investigation.png',
    '23_Language-Family-Clues.png',
    '24_Religious-Geography-Evidence.png',
    '25_Economic-Geography-Clues.png',
    '26_Cultural-Diffusion-Investigation.png',
    '27_CASE-CLOSED.png',
    '28_DAY-4.png',
    '29_Climate-Zone-Evidence-Collection.png',
    '30_Weather-Pattern-Investigation.png',
    '31_Ocean-Current-Detective-Work.png',
    '32_Climate-Change-Evidence-Analysis.png',
    '33_Extreme-Weather-Investigation.png',
    '34_CLIMATE-MYSTERY-SOLVED.png',
    '35_DAY-5.png',
    '36_Global-Trade-Route-Investigation.png',
    '37_Resource-Distribution-Mystery.png',
    '38_Manufacturing-Geography-Evidence.png',
    '39_Economic-Development-Investigation.png',
    '40_ECONOMIC-NETWORK-EXPOSED.png',
    '41_DAY-6.png',
    '42_Political-Geography-Investigation-Setup.png',
    '43_Types-of-Political-Territories.png',
    '44_Boundary-Dispute-Investigation.png',
    '45_Maritime-Boundary-Investigation.png',
    '46_Capital-City-Investigation.png',
    '47_POLITICAL-BOUNDARIES-SECURED.png',
    '48_DAY-7.png',
    '49_Mesopotamian-Geography-Investigation.png',
    '50_Egyptian-Civilization-Geography-Clues.png',
    '51_Indus-Valley-Geographic-Mystery.png',
    '52_Chinese-Civilization-Geographic-Advantages.png',
    '53_Greek-Geographic-Influence-Investigation.png',
    '54_ANCIENT-GEOGRAPHIC-WISDOM-RECOVERED.png',
    '55_DAY-8.png',
    '56_Climate-Culture-Connection-Patterns.png',
    '57_Economic-Resource-Distribution-Patterns.png',
    '58_Political-Physical-Geography-Correlations.png',
    '59_GEOGRAPHIC-PATTERNS-MASTERED.png',
    '60_DAY-9-11.png'
];

// Presentation system slide names (from presentation-system.js)
const presentationSlides = [
    '1_Geographic-Detective-Academy.png',
    '2_URGENT-Global-Geographic-Crisis.png',
    '3_You-Are-Our-Last-Hope.png',
    '4_Your-Detective-Academy-Training-Program.png',
    '5_Form-Your-Detective-Unit.png',
    '6_DAY-1.png',
    '7_Initial-Crime-Scene-Investigation.png',
    '8_Critical-Evidence-Coordinate-Fragment.png',
    '9_Apply-Your-Geographic-Detective-Skills.png',
    '10_Witness-Interview-Maintenance-Staff.png',
    '11_Solve-the-Geographic-Mystery.png',
    '12_CASE-SOLVED.png',
    '13_DAY-2.png',
    '14_Crime-Scene-5200m-Elevation.png',
    '15_Evidence-Systematic-Elevation-Fraud.png',
    '16_Expert-Witness-International-Cartographer.png',
    '17_Reading-the-Landscape-for-Clues.png',
    '18_Elevation-Analysis-Truth-vs-Deception.png',
    '19_CASE-SOLVED-Mountain-Justice-Served.png',
    '20_Geographic-Detective-Skills-Level-Up.png',
    '21_DAY-3.png',
    '22_Cultural-Regions-Investigation.png',
    '23_Language-Family-Clues.png',
    '24_Religious-Geography-Evidence.png',
    '25_Economic-Geography-Clues.png',
    '26_Cultural-Diffusion-Investigation.png',
    '27_CASE-CLOSED.png',
    '28_DAY-4.png',
    '29_Climate-Zone-Evidence-Collection.png',
    '30_Weather-Pattern-Investigation.png',
    '31_Ocean-Current-Detective-Work.png',
    '32_Climate-Change-Evidence-Analysis.png',
    '33_Extreme-Weather-Investigation.png',
    '34_CLIMATE-MYSTERY-SOLVED.png',
    '35_DAY-5.png',
    '36_Global-Trade-Route-Investigation.png',
    '37_Resource-Distribution-Mystery.png',
    '38_Manufacturing-Geography-Evidence.png',
    '39_Economic-Development-Investigation.png',
    '40_ECONOMIC-NETWORK-EXPOSED.png',
    '41_DAY-6.png',
    '42_Political-Geography-Investigation-Setup.png',
    '43_Types-of-Political-Territories.png',
    '44_Boundary-Dispute-Investigation.png',
    '45_Maritime-Boundary-Investigation.png',
    '46_Capital-City-Investigation.png',
    '47_POLITICAL-BOUNDARIES-SECURED.png',
    '48_DAY-7.png',
    '49_Mesopotamian-Geography-Investigation.png',
    '50_Egyptian-Civilization-Geography-Clues.png',
    '51_Indus-Valley-Geographic-Mystery.png',
    '52_Chinese-Civilization-Geographic-Advantages.png',
    '53_Greek-Geographic-Influence-Investigation.png',
    '54_ANCIENT-GEOGRAPHIC-WISDOM-RECOVERED.png',
    '55_DAY-8.png',
    '56_Climate-Culture-Connection-Patterns.png',
    '57_Economic-Resource-Distribution-Patterns.png',
    '58_Political-Physical-Geography-Correlations.png',
    '59_GEOGRAPHIC-PATTERNS-MASTERED.png',
    '60_DAY-9-11.png'
];

console.log('🔍 COMPARING DATABASE VS PRESENTATION SYSTEM SLIDE NAMES\n');

let allMatch = true;
let mismatches = [];

for (let i = 0; i < 60; i++) {
    const dbName = databaseSlides[i];
    const presName = presentationSlides[i];
    
    if (dbName === presName) {
        console.log(`✅ Slide ${i + 1}: MATCH - ${dbName}`);
    } else {
        console.log(`❌ Slide ${i + 1}: MISMATCH`);
        console.log(`   Database:     ${dbName}`);
        console.log(`   Presentation: ${presName}`);
        allMatch = false;
        mismatches.push({
            slideNumber: i + 1,
            database: dbName,
            presentation: presName
        });
    }
}

console.log('\n📋 SUMMARY:');
if (allMatch) {
    console.log('🎉 PERFECT! All 60 slide names match exactly between database and presentation system.');
} else {
    console.log(`💥 PROBLEM! Found ${mismatches.length} mismatches:`);
    mismatches.forEach(mismatch => {
        console.log(`   Slide ${mismatch.slideNumber}: DB="${mismatch.database}" vs PRES="${mismatch.presentation}"`);
    });
}
