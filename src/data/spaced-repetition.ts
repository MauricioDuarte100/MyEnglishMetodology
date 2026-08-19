/**
 * Spaced Repetition System based on Ebbinghaus Forgetting Curve
 * Intervals: 5min, 30min, 12h, 1d, 2d, 4d, 7d, 15d
 * Reference: https://github.com/byoungd/English-level-up-tips (vocabulary chapter)
 */

export interface SRSCard {
  word: string;
  category: string;
  level: number; // 0-7 (8 review cycles)
  nextReview: number; // timestamp
  lastReview: number; // timestamp
  easeFactor: number; // 1.3 - 2.5
  correctStreak: number;
  totalReviews: number;
  totalCorrect: number;
}

// Ebbinghaus intervals in milliseconds
export const SRS_INTERVALS = [
  5 * 60 * 1000,        // Level 0: 5 minutes
  30 * 60 * 1000,       // Level 1: 30 minutes
  12 * 60 * 60 * 1000,  // Level 2: 12 hours
  24 * 60 * 60 * 1000,  // Level 3: 1 day
  2 * 24 * 60 * 60 * 1000, // Level 4: 2 days
  4 * 24 * 60 * 60 * 1000, // Level 5: 4 days
  7 * 24 * 60 * 60 * 1000, // Level 6: 7 days
  15 * 24 * 60 * 60 * 1000, // Level 7: 15 days (mastered)
];

export const SRS_LEVEL_LABELS = [
  'Nuevo',
  'Aprendiendo',
  'Repaso corto',
  'Diario',
  '2 días',
  '4 días',
  'Semanal',
  'Dominado'
];

/**
 * Calculate next review time based on performance
 */
export function calculateNextReview(card: SRSCard, correct: boolean): SRSCard {
  const now = Date.now();
  
  if (correct) {
    const newLevel = Math.min(card.level + 1, 7);
    const interval = SRS_INTERVALS[newLevel] * card.easeFactor;
    return {
      ...card,
      level: newLevel,
      nextReview: now + interval,
      lastReview: now,
      easeFactor: Math.min(card.easeFactor + 0.1, 2.5),
      correctStreak: card.correctStreak + 1,
      totalReviews: card.totalReviews + 1,
      totalCorrect: card.totalCorrect + 1,
    };
  } else {
    // On failure, drop back but not to zero
    const newLevel = Math.max(0, card.level - 2);
    const interval = SRS_INTERVALS[newLevel];
    return {
      ...card,
      level: newLevel,
      nextReview: now + interval,
      lastReview: now,
      easeFactor: Math.max(card.easeFactor - 0.2, 1.3),
      correctStreak: 0,
      totalReviews: card.totalReviews + 1,
    };
  }
}

/**
 * Get cards due for review right now
 */
export function getDueCards(cards: SRSCard[]): SRSCard[] {
  const now = Date.now();
  return cards.filter(c => c.nextReview <= now).sort((a, b) => a.nextReview - b.nextReview);
}

/**
 * Create a new SRS card
 */
export function createSRSCard(word: string, category: string): SRSCard {
  return {
    word,
    category,
    level: 0,
    nextReview: Date.now(),
    lastReview: 0,
    easeFactor: 1.5,
    correctStreak: 0,
    totalReviews: 0,
    totalCorrect: 0,
  };
}

/**
 * Estimate vocabulary level based on mastered words
 * Based on CEFR scale from the repo
 */
export function estimateCEFRLevel(masteredCount: number): string {
  if (masteredCount < 500) return 'A1';
  if (masteredCount < 1000) return 'A2';
  if (masteredCount < 2500) return 'B1';
  if (masteredCount < 5000) return 'B2';
  if (masteredCount < 8000) return 'C1';
  return 'C2';
}

/**
 * Weekly study plan template based on the repo's recommendations
 */
export const WEEKLY_PLAN = {
  monday: { focus: 'speaking', description: '15 min oral practice + 10 min correction/repetition' },
  tuesday: { focus: 'reading', description: 'Read 1 short article, extract 5-10 expressions' },
  wednesday: { focus: 'speaking', description: 'Conversation simulation on same topic' },
  thursday: { focus: 'review', description: 'Quiz/flashcards from this week\'s materials' },
  friday: { focus: 'writing', description: 'Write a short email/summary, revise twice' },
  saturday: { focus: 'review', description: 'Review week\'s frequent errors, consolidation' },
  sunday: { focus: 'listening', description: 'Watch content in English, take notes' },
};
