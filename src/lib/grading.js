export function gradeAnswer(transcript, keys, timeUsed) {
  if (!transcript || !keys || keys.length === 0) return null;

  const lower = transcript.toLowerCase();
  const words = transcript.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  // Find keyword hits
  const hits = keys.filter((k) => lower.includes(k.toLowerCase()));

  // Base score: keyword coverage (max 80)
  let score = (hits.length / keys.length) * 80;

  // Engagement bonus (word count)
  if (wordCount >= 150) score += 10;
  else if (wordCount >= 80) score += 6;
  else if (wordCount >= 40) score += 3;

  // Brevity bonus
  if (timeUsed < 90 && wordCount >= 30) score += 5;

  // Word count floor
  if (wordCount < 15) score = Math.min(score, 25);

  // Clamp
  score = Math.max(0, Math.min(100, Math.round(score)));

  // Letter grade
  let grade;
  if (score >= 93) grade = 'A';
  else if (score >= 87) grade = 'B+';
  else if (score >= 80) grade = 'B';
  else if (score >= 73) grade = 'C+';
  else if (score >= 65) grade = 'C';
  else if (score >= 55) grade = 'D';
  else grade = 'F';

  return { pct: score, grade, hits, total: keys.length };
}

export function gradeColor(grade) {
  const map = {
    A: '#3ee8b5',
    'B+': '#3ee8b5',
    B: '#5eaaff',
    'C+': '#f0c654',
    C: '#f0c654',
    D: '#ff7e6b',
    F: '#ff5252',
  };
  return map[grade] || '#666';
}
