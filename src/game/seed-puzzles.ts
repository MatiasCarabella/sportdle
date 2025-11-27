// Sample F1 words for your game
// Run this script to seed initial puzzles

export const f1Words = [
  // Drivers (5 letters)
  { word: 'SENNA', category: 'driver', hint: 'Brazilian legend', difficulty: 'easy' },
  { word: 'PROST', category: 'driver', hint: 'The Professor', difficulty: 'medium' },
  { word: 'CLARK', category: 'driver', hint: 'Scottish champion', difficulty: 'hard' },
  { word: 'LAUDA', category: 'driver', hint: 'Austrian legend', difficulty: 'easy' },
  { word: 'ALESI', category: 'driver', hint: 'French driver', difficulty: 'hard' },
  
  // Teams (5 letters)
  { word: 'LOTUS', category: 'team', hint: 'British team', difficulty: 'medium' },
  { word: 'HAASS', category: 'team', hint: 'American team', difficulty: 'easy' },
  
  // Circuits (5 letters)
  { word: 'MONZA', category: 'circuit', hint: 'Temple of Speed', difficulty: 'easy' },
  { word: 'IMOLA', category: 'circuit', hint: 'San Marino GP', difficulty: 'medium' },
  { word: 'SUZKA', category: 'circuit', hint: 'Japanese circuit', difficulty: 'medium' },
  
  // F1 Terms (5 letters)
  { word: 'BRAKE', category: 'term', hint: 'Slow down', difficulty: 'easy' },
  { word: 'TYRES', category: 'term', hint: 'Pirelli product', difficulty: 'easy' },
  { word: 'PODIM', category: 'term', hint: 'Top 3 finish', difficulty: 'easy' },
  { word: 'STINT', category: 'term', hint: 'Time between pit stops', difficulty: 'medium' },
  { word: 'SHUNT', category: 'term', hint: 'Crash', difficulty: 'medium' },
];

// Helper to generate dates starting from today
export function generatePuzzlesWithDates(startDate: Date = new Date()) {
  return f1Words.map((word, index) => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + index);
    date.setHours(0, 0, 0, 0);
    
    return {
      ...word,
      date: date.toISOString(),
    };
  });
}
