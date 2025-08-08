// School Calendar Configuration for Copper River School District 2025-2026
// Based on the official uploaded calendar

const schoolCalendar = {
  schoolYear: '2025-2026',
  district: 'Copper River School District',
  
  // Important dates from the calendar
  firstDay: new Date('2025-08-18'), // School opens
  lastDay: new Date('2026-05-21'),  // Last day of school
  
  // First 2 weeks - no direct curriculum instruction
  orientationStart: new Date('2025-08-18'),
  orientationEnd: new Date('2025-08-29'),
  
  // First day of actual curriculum instruction
  curriculumStart: new Date('2025-09-02'), // After Labor Day
  
  // Last week of May - no curriculum instruction  
  curriculumEnd: new Date('2026-05-14'),
  
  // Quarter dates based on official Copper River School District calendar
  // September 11 is a REGULAR SCHOOL DAY (Q1 continues)
  // Fall Break is September 12-15, then Q1 resumes September 16
  quarters: {
    q1: {
      start: new Date('2025-09-02'), // After Labor Day, first curriculum day
      end: new Date('2025-10-20'),   // Q1 ends October 20th (confirmed by user)
      instructionalDaysNeeded: 35,
      simulationDays: 10
    },
    q2: {
      start: new Date('2025-10-22'), // Q2 starts October 22nd (after Parent/Teacher Conferences)
      end: new Date('2026-01-09'),   // Q2 ends after winter break
      instructionalDaysNeeded: 35,
      simulationDays: 10  
    },
    q3: {
      start: new Date('2026-01-13'), // Q3 starts January 13th (after conferences on 12th)
      end: new Date('2026-03-07'),   // Q3 ends before spring break
      instructionalDaysNeeded: 35,
      simulationDays: 10
    },
    q4: {
      start: new Date('2026-03-17'), // Q4 starts after spring break  
      end: new Date('2026-05-14'),   // Q4 ends when curriculum ends
      instructionalDaysNeeded: 30,   // Shorter quarter
      simulationDays: 10
    }
  },
  
  // Holidays and breaks (no school days) from official CRSD calendar
  holidays: [
    // Labor Day
    { name: 'Labor Day', date: new Date('2025-09-01') },
    
    // Fall Break (September 12-15) - September 11 IS a school day
    { name: 'Fall Break', start: new Date('2025-09-12'), end: new Date('2025-09-15') },
    
    // Parent/Teacher Conferences (no school)
    { name: 'Parent/Teacher Conferences', date: new Date('2025-10-21') },
    
    // Thanksgiving Break
    { name: 'Thanksgiving Break', start: new Date('2025-11-27'), end: new Date('2025-11-28') },
    
    // Winter Break (12/22 - 1/2) + New Year's Day
    { name: 'Winter Break', start: new Date('2025-12-22'), end: new Date('2026-01-02') },
    
    // Parent/Teacher Conferences (January)
    { name: 'Parent/Teacher Conferences', date: new Date('2026-01-12') },
    
    // Martin Luther King Jr. Day 
    { name: 'Martin Luther King Jr. Day', date: new Date('2026-01-20') },
    
    // Presidents Day
    { name: 'Presidents Day', date: new Date('2026-02-17') },
    
    // Spring Break
    { name: 'Spring Break', start: new Date('2026-03-09'), end: new Date('2026-03-13') },
    
    // Parent/Teacher Conferences (April)
    { name: 'Parent/Teacher Conferences', date: new Date('2026-04-01') },
    
    // End of year activities (various locations)
    { name: 'Slana Activities', date: new Date('2026-05-12') },
    { name: 'Upstream Learning', date: new Date('2026-05-13') },
    { name: 'Kenny Lake Activities', date: new Date('2026-05-14') },
    { name: 'Glennallen Activities', date: new Date('2026-05-15') }
  ],
  
  // Early Release Days (shortened instruction) - from official calendar images
  earlyReleaseDays: [
    new Date('2025-08-29'), // End of first week
    new Date('2025-10-17'), // October early release 
    new Date('2025-10-31'), // October 31 early release
    new Date('2025-11-08'), // November early release
    new Date('2025-11-22'), // November early release
    new Date('2025-12-05'), // December early release
    new Date('2025-12-12'), // December early release
    new Date('2025-12-19'), // Before winter break
    new Date('2026-01-10'), // January early release
    new Date('2026-01-17'), // January early release
    new Date('2026-01-24'), // January early release
    new Date('2026-01-31'), // January early release
    new Date('2026-02-13'), // February early release
    new Date('2026-02-27'), // February early release
    new Date('2026-03-20'), // March early release
    new Date('2026-03-27'), // March early release
    new Date('2026-04-03'), // April early release
    new Date('2026-04-10'), // April early release
    new Date('2026-04-17'), // April early release
    new Date('2026-04-24'), // April early release
    new Date('2026-05-08'), // May early release
    new Date('2026-05-15'), // May early release
    new Date('2026-05-16')  // Before last day
  ],
  
  // Teacher work days, conferences (no student days)
  teacherDays: [
    { name: 'New Teacher Inservice', date: new Date('2025-08-12') },
    { name: 'Teacher Workday', start: new Date('2025-08-13'), end: new Date('2025-08-15') },
    { name: 'Parent/Teacher Conferences', date: new Date('2025-10-21') },
    { name: 'Teacher Workday', date: new Date('2025-10-25') },
    { name: 'Parent/Teacher Conferences', date: new Date('2026-01-12') },
    { name: 'Parent/Teacher Conferences', date: new Date('2026-04-01') }
  ]
};

// Utility functions for calendar calculations
const calendarUtils = {
  
  // Check if a date is a school day
  isSchoolDay(date) {
    const dayOfWeek = date.getDay();
    
    // Skip weekends
    if (dayOfWeek === 0 || dayOfWeek === 6) return false;
    
    // Check if before school starts or after school ends
    if (date < schoolCalendar.firstDay || date > schoolCalendar.lastDay) return false;
    
    // Check holidays
    for (const holiday of schoolCalendar.holidays) {
      if (holiday.date && this.isSameDay(date, holiday.date)) return false;
      if (holiday.start && holiday.end && date >= holiday.start && date <= holiday.end) return false;
    }
    
    // Check teacher days
    for (const teacherDay of schoolCalendar.teacherDays) {
      if (teacherDay.date && this.isSameDay(date, teacherDay.date)) return false;
      if (teacherDay.start && teacherDay.end && date >= teacherDay.start && date <= teacherDay.end) return false;
    }
    
    return true;
  },
  
  // Check if date is during relationship building time
  isRelationshipBuilding(date) {
    return (date >= schoolCalendar.relationshipBuildingStart && date <= schoolCalendar.relationshipBuildingEnd) ||
           (date >= schoolCalendar.semester2Start && date <= schoolCalendar.semester2RelationshipEnd);
  },
  
  // Check if date is during a simulation project
  isSimulationProject(date) {
    for (const quarter of schoolCalendar.quarters) {
      if (date >= quarter.simulationStart && date <= quarter.simulationEnd) {
        return { quarter: quarter.number, start: quarter.simulationStart, end: quarter.simulationEnd };
      }
    }
    return false;
  },
  
  // Get school day number (excluding non-school days)
  getSchoolDayNumber(date) {
    let dayCount = 0;
    let currentDate = new Date(schoolCalendar.firstDay);
    
    while (currentDate <= date && currentDate <= schoolCalendar.lastDay) {
      if (this.isSchoolDay(currentDate) && !this.isRelationshipBuilding(currentDate) && !this.isSimulationProject(currentDate)) {
        dayCount++;
      }
      
      if (this.isSameDay(currentDate, date)) {
        return dayCount;
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dayCount;
  },
  
  // Get current quarter
  getCurrentQuarter(date = new Date()) {
    for (const quarter of schoolCalendar.quarters) {
      if (date >= quarter.start && date <= quarter.end) {
        return quarter.number;
      }
    }
    return 1; // Default to quarter 1
  },
  
  // Get lesson day (for curriculum mapping)
  getLessonDay(date = new Date()) {
    if (!this.isSchoolDay(date)) return null;
    if (this.isRelationshipBuilding(date)) return null;
    if (this.isSimulationProject(date)) return null;
    
    return this.getSchoolDayNumber(date);
  },
  
  // Helper function to check if two dates are the same day
  isSameDay(date1, date2) {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  },
  
  // Get the week overview (5 school days)
  getWeekOverview(date = new Date()) {
    const dayOfWeek = date.getDay();
    const monday = new Date(date);
    monday.setDate(date.getDate() - dayOfWeek + 1);
    
    const weekDays = [];
    for (let i = 0; i < 5; i++) {
      const currentDay = new Date(monday);
      currentDay.setDate(monday.getDate() + i);
      
      const dayInfo = {
        date: new Date(currentDay),
        dayName: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'][i],
        isToday: this.isSameDay(currentDay, date),
        isSchoolDay: this.isSchoolDay(currentDay),
        schoolDayNumber: null,
        lessonTitle: null,
        specialEvent: null
      };
      
      if (dayInfo.isSchoolDay) {
        if (this.isRelationshipBuilding(currentDay)) {
          dayInfo.specialEvent = 'Relationship Building';
        } else if (this.isSimulationProject(currentDay)) {
          const simulation = this.isSimulationProject(currentDay);
          dayInfo.specialEvent = `Q${simulation.quarter} Simulation`;
        } else {
          dayInfo.schoolDayNumber = this.getSchoolDayNumber(currentDay);
          dayInfo.lessonTitle = this.getLessonTitle(dayInfo.schoolDayNumber);
        }
      }
      
      weekDays.push(dayInfo);
    }
    
    return weekDays;
  },
  
  // Get lesson title for a given school day (placeholder - will be replaced with real data)
  getLessonTitle(schoolDay) {
    // This will be replaced with actual lesson mapping
    const sampleLessons = {
      1: 'What is Geography?',
      2: 'Geographic Tools',
      3: 'Physical Features',
      4: 'Climate Patterns',
      5: 'Human Geography',
      // ... more lessons
    };
    
    return sampleLessons[schoolDay] || `Lesson ${schoolDay}`;
  },
  
  // Format date for display
  formatDate(date) {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }
};

module.exports = {
  schoolCalendar,
  calendarUtils
};
