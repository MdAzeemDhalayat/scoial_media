const { publishScheduledPosts } = require("../models/post");
const logger = require("./logger");

/**
 * Background job scheduler for publishing scheduled posts
 * 
 * SCHEDULED POSTING: This scheduler runs every 60 seconds to automatically publish
 * scheduled posts whose scheduled_at time has been reached. It starts automatically
 * when the server starts (called from app.js). This ensures scheduled posts appear
 * in the feed without manual intervention, meeting the scheduled posting requirement.
 */

let schedulerInterval = null;

/**
 * Start the scheduler to publish scheduled posts
 * Runs every 60 seconds (1 minute)
 */
const startScheduler = () => {
  if (schedulerInterval) {
    logger.verbose("Scheduler is already running");
    return;
  }

  logger.verbose("Starting scheduled posts scheduler...");

  // Run immediately on start
  checkAndPublishPosts();

  // Then run every minute (60000 ms)
  schedulerInterval = setInterval(async () => {
    await checkAndPublishPosts();
  }, 60000); // 60 seconds = 60000 milliseconds

  logger.verbose("Scheduled posts scheduler started (runs every 60 seconds)");
};

/**
 * Stop the scheduler
 */
const stopScheduler = () => {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
    logger.verbose("Scheduled posts scheduler stopped");
  }
};

/**
 * Check for scheduled posts that should be published and publish them
 */
const checkAndPublishPosts = async () => {
  try {
    const count = await publishScheduledPosts();
    if (count > 0) {
      logger.verbose(`Published ${count} scheduled post(s)`);
    }
  } catch (error) {
    logger.critical("Error publishing scheduled posts:", error);
  }
};

module.exports = {
  startScheduler,
  stopScheduler,
  checkAndPublishPosts,
};

