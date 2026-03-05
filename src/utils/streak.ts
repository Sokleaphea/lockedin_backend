export function formatStreak(streak: any) {
    return {
        currentStreak: streak?.currentStreak ?? 0,
        longestStreak: streak?.longestStreak ?? 0,
        totalGoalDays: streak?.totalGoalDays ?? 0,
        dailyGoalSeconds: streak?.dailyGoalSeconds ?? 0,
        todayAccumulatedSeconds: streak?.todayAccumulatedSeconds ?? 0,
    };
}