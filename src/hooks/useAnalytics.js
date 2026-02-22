import { useState, useMemo, useCallback } from 'react';

const GRADE_ORDER = ['A', 'B+', 'B', 'C+', 'C', 'D', 'F'];

export function useAnalytics(history) {
  const [companyFilter, setCompanyFilter] = useState('all');
  const [gradeFilter, setGradeFilter] = useState([]);
  const [dateRange, setDateRange] = useState('all');

  // Unique companies
  const companies = useMemo(() => {
    const set = new Set(history.map((s) => s.company));
    return Array.from(set).sort();
  }, [history]);

  // Filtered data
  const filteredHistory = useMemo(() => {
    let data = [...history];

    if (companyFilter !== 'all') {
      data = data.filter((s) => s.company === companyFilter);
    }

    if (gradeFilter.length > 0) {
      data = data.filter((s) => gradeFilter.includes(s.grade));
    }

    if (dateRange !== 'all') {
      const now = Date.now();
      const days = { '7d': 7, '30d': 30, '90d': 90 }[dateRange];
      if (days) {
        const ms = days * 86400000;
        data = data.filter((s) => now - new Date(s.date).getTime() <= ms);
      }
    }

    return data;
  }, [history, companyFilter, gradeFilter, dateRange]);

  // Computed analytics
  const analytics = useMemo(() => {
    if (!filteredHistory.length) return null;

    const avgScore = Math.round(
      filteredHistory.reduce((sum, s) => sum + s.pct, 0) / filteredHistory.length,
    );

    // Grade distribution
    const gradeDist = {};
    GRADE_ORDER.forEach((g) => (gradeDist[g] = 0));
    filteredHistory.forEach((s) => {
      if (gradeDist[s.grade] !== undefined) gradeDist[s.grade]++;
    });
    const maxGradeCount = Math.max(...Object.values(gradeDist), 1);

    // Trend
    const mid = Math.floor(filteredHistory.length / 2);
    const firstHalf = filteredHistory.slice(0, mid || 1);
    const secondHalf = filteredHistory.slice(mid);
    const avgFirst = firstHalf.reduce((s, h) => s + h.pct, 0) / firstHalf.length;
    const avgSecond = secondHalf.reduce((s, h) => s + h.pct, 0) / secondHalf.length;
    const trendDelta = Math.round(avgSecond - avgFirst);
    const trendDirection = trendDelta > 2 ? 'up' : trendDelta < -2 ? 'down' : 'flat';

    // Company breakdown
    const byCompany = {};
    filteredHistory.forEach((s) => {
      if (!byCompany[s.company]) byCompany[s.company] = { sessions: 0, totalPct: 0, totalQs: 0 };
      byCompany[s.company].sessions++;
      byCompany[s.company].totalPct += s.pct;
      byCompany[s.company].totalQs += s.count;
    });
    const companyBreakdown = Object.entries(byCompany)
      .map(([name, data]) => ({
        name,
        sessions: data.sessions,
        avgScore: Math.round(data.totalPct / data.sessions),
        totalQuestions: data.totalQs,
      }))
      .sort((a, b) => b.sessions - a.sessions);

    // Best / worst sessions
    const sorted = [...filteredHistory].sort((a, b) => b.pct - a.pct);
    const bestSession = sorted[0] || null;
    const worstSession = sorted[sorted.length - 1] || null;

    // Improvement rate (linear regression slope)
    const scores = filteredHistory.map((s) => s.pct);
    let improvementRate = 0;
    if (scores.length >= 3) {
      const n = scores.length;
      const sumX = (n * (n - 1)) / 2;
      const sumY = scores.reduce((a, b) => a + b, 0);
      const sumXY = scores.reduce((a, y, i) => a + i * y, 0);
      const sumXX = (n * (n - 1) * (2 * n - 1)) / 6;
      improvementRate = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    }

    // Streak tracking (sessions scoring >= 80%)
    let currentStreak = 0;
    let bestStreak = 0;
    for (const s of filteredHistory) {
      if (s.pct >= 80) {
        currentStreak++;
        bestStreak = Math.max(bestStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }

    return {
      avgScore,
      gradeOrder: GRADE_ORDER,
      gradeDist,
      maxGradeCount,
      trendDelta,
      trendDirection,
      companyBreakdown,
      totalSessions: filteredHistory.length,
      totalQuestions: filteredHistory.reduce((sum, s) => sum + s.count, 0),
      scores,
      dates: filteredHistory.map((s) => s.date),
      bestSession,
      worstSession,
      improvementRate: Math.round(improvementRate * 100) / 100,
      currentStreak,
      bestStreak,
    };
  }, [filteredHistory]);

  const toggleGradeFilter = useCallback((grade) => {
    setGradeFilter((prev) =>
      prev.includes(grade) ? prev.filter((g) => g !== grade) : [...prev, grade],
    );
  }, []);

  const clearFilters = useCallback(() => {
    setCompanyFilter('all');
    setGradeFilter([]);
    setDateRange('all');
  }, []);

  const hasActiveFilters =
    companyFilter !== 'all' || gradeFilter.length > 0 || dateRange !== 'all';

  return {
    companyFilter,
    setCompanyFilter,
    gradeFilter,
    toggleGradeFilter,
    dateRange,
    setDateRange,
    clearFilters,
    hasActiveFilters,
    companies,
    filteredHistory,
    analytics,
  };
}
