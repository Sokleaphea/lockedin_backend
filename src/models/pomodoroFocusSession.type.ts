export type PomodoroFocusSession = {
    _id: string;
    userId: string;
    durationMinutes: number;
    completedAt: Date;
};
