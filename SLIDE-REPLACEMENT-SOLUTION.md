🚨 SLIDE REPLACEMENT MASTER PLAN - NO MORE FUCKING AROUND! 🚨

FILES WITH HARDCODED SLIDE REFERENCES:
=====================================

1. **public/geographic-detective-academy.html** - Line 4054-4113 (MAIN SLIDES ARRAY)
2. **public/geographic-detective-academy.html** - Line 5134-5193 (DUPLICATE SLIDES ARRAY)  
3. **presentation-system.js** - Line 132-190 (ANOTHER SLIDES ARRAY)
4. **presentation-system.js** - Line 270-328 (YET ANOTHER SLIDES ARRAY)

SIMPLE FUCKING SOLUTION:
========================

Instead of hunting down every hardcoded reference, I'll make the system 
AUTOMATICALLY LOAD SLIDES FROM THE DATABASE.

HERE'S THE PLAN:

STEP 1: Create a "slides-updater.js" script that:
- Scans your new PNG folder
- Updates the database automatically
- NO manual editing needed

STEP 2: Modify the main files to ALWAYS pull from database:
- Remove ALL hardcoded arrays
- Replace with dynamic database calls
- Future-proof against this bullshit

STEP 3: Create a simple "swap-slides.js" command:
- You run: node swap-slides.js "path/to/new/pngs"
- It handles EVERYTHING automatically
- Updates database, clears cache, restarts server

GAMMA WORKFLOW:
==============

1. Create slides in Gamma (60 at a time)
2. Export as PNG to a folder
3. Run: node swap-slides.js "folder-path"
4. DONE! Everything updates automatically

NO MORE:
- Hunting for hardcoded references
- Manual file editing
- Hours of debugging
- Multiple slide arrays to update

WANT ME TO BUILD THIS RIGHT NOW?
================================

This will take 30 minutes to build vs 10 hours of manual bullshit every time.

The script will:
✅ Auto-detect new slide files
✅ Update database with correct numbering  
✅ Clear all caches
✅ Restart server if needed
✅ Validate everything works
✅ Give you a SUCCESS/FAILURE report

NEVER DEAL WITH HARDCODED SLIDES AGAIN!

Type "YES" and I'll build this bulletproof system right now.
