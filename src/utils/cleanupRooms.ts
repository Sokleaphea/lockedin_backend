import cron from "node-cron";
import { StudyRoom } from "../models/studyRoom.model";

export function startCleanupJobs() {
  // Every 5 minutes: delete rooms that are inactive and closed more than 5 minutes ago
  cron.schedule("*/5 * * * *", async () => {
    try {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const result = await StudyRoom.deleteMany({
        isActive: false,
        closedAt: { $lt: fiveMinutesAgo },
      });
      if (result.deletedCount > 0) {
        console.log(
          `[Cleanup] Deleted ${result.deletedCount} empty room(s)`
        );
      }
    } catch (error) {
      console.error("[Cleanup] Failed to delete empty rooms:", error);
    }
  });

  console.log("[Cleanup] Study room cleanup job started");
}
