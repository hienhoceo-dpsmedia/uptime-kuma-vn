/**
 * Monitor Queue Rate Limiter
 * Controls the frequency of monitoring checks to prevent server overload
 */

const { log } = require("../../src/util");
const { R } = require("redbean-node");
const { setting } = require("../util-server");

class MonitorQueue {
    constructor() {
        this.queue = [];
        this.processing = false;
        this.lastProcessTime = {};
        this.checkCounts = {};
        this.rateLimits = {};
        this.init();
    }

    /**
     * Initialize the queue with settings
     */
    async init() {
        await this.loadRateLimits();
        log.info("monitor-queue", "Monitor Queue initialized");
    }

    /**
     * Load rate limit settings from database
     */
    async loadRateLimits() {
        try {
            const limits = await setting("monitorRateLimits") || {};

            // Default rate limits if not set
            this.rateLimits = {
                maxPerSecond: limits.maxPerSecond || 10,
                maxPerMinute: limits.maxPerMinute || 100,
                maxPerHour: limits.maxPerHour || 1000,
                maxPerDay: limits.maxPerDay || 10000,
                enabled: limits.enabled !== false
            };

            log.info("monitor-queue", `Rate limits loaded: ${JSON.stringify(this.rateLimits)}`);
        } catch (error) {
            log.error("monitor-queue", `Failed to load rate limits: ${error.message}`);
            // Set default limits on error
            this.rateLimits = {
                maxPerSecond: 10,
                maxPerMinute: 100,
                maxPerHour: 1000,
                maxPerDay: 10000,
                enabled: true
            };
        }
    }

    /**
     * Update rate limit settings
     * @param {object} newLimits New rate limit settings
     */
    async updateRateLimits(newLimits) {
        try {
            await setting("monitorRateLimits", newLimits, "general");
            this.rateLimits = {
                maxPerSecond: newLimits.maxPerSecond || 10,
                maxPerMinute: newLimits.maxPerMinute || 100,
                maxPerHour: newLimits.maxPerHour || 1000,
                maxPerDay: newLimits.maxPerDay || 10000,
                enabled: newLimits.enabled !== false
            };
            log.info("monitor-queue", `Rate limits updated: ${JSON.stringify(this.rateLimits)}`);
        } catch (error) {
            log.error("monitor-queue", `Failed to update rate limits: ${error.message}`);
        }
    }

    /**
     * Get current rate limit settings
     * @returns {object} Current rate limits
     */
    getRateLimits() {
        return { ...this.rateLimits };
    }

    /**
     * Check if a monitor can be executed based on rate limits
     * @param {number} monitorId Monitor ID
     * @returns {boolean} Can execute?
     */
    canExecute(monitorId) {
        if (!this.rateLimits.enabled) {
            return true;
        }

        const now = Date.now();
        const currentSecond = Math.floor(now / 1000);
        const currentMinute = Math.floor(now / 60000);
        const currentHour = Math.floor(now / 3600000);
        const currentDay = Math.floor(now / 86400000);

        // Initialize counters if not exists
        if (!this.checkCounts[monitorId]) {
            this.checkCounts[monitorId] = {
                second: { time: currentSecond, count: 0 },
                minute: { time: currentMinute, count: 0 },
                hour: { time: currentHour, count: 0 },
                day: { time: currentDay, count: 0 }
            };
        }

        const counts = this.checkCounts[monitorId];

        // Reset counters if time period changed
        if (counts.second.time !== currentSecond) {
            counts.second = { time: currentSecond, count: 0 };
        }
        if (counts.minute.time !== currentMinute) {
            counts.minute = { time: currentMinute, count: 0 };
        }
        if (counts.hour.time !== currentHour) {
            counts.hour = { time: currentHour, count: 0 };
        }
        if (counts.day.time !== currentDay) {
            counts.day = { time: currentDay, count: 0 };
        }

        // Check rate limits
        if (counts.second.count >= this.rateLimits.maxPerSecond) {
            return false;
        }
        if (counts.minute.count >= this.rateLimits.maxPerMinute) {
            return false;
        }
        if (counts.hour.count >= this.rateLimits.maxPerHour) {
            return false;
        }
        if (counts.day.count >= this.rateLimits.maxPerDay) {
            return false;
        }

        // Increment counters
        counts.second.count++;
        counts.minute.count++;
        counts.hour.count++;
        counts.day.count++;

        return true;
    }

    /**
     * Get queue status information
     * @returns {object} Queue status
     */
    getStatus() {
        return {
            queueLength: this.queue.length,
            processing: this.processing,
            rateLimits: this.rateLimits,
            activeChecks: Object.keys(this.checkCounts).length
        };
    }

    /**
     * Clear old check counters to prevent memory leaks
     */
    cleanup() {
        const now = Date.now();
        const currentDay = Math.floor(now / 86400000);

        // Remove counters older than 2 days
        Object.keys(this.checkCounts).forEach(monitorId => {
            if (this.checkCounts[monitorId].day.time < currentDay - 2) {
                delete this.checkCounts[monitorId];
            }
        });
    }

    /**
     * Add a monitor check to the queue
     * @param {number} monitorId Monitor ID
     * @param {function} checkFunction Function to execute
     * @param {number} priority Priority (lower = higher priority)
     */
    addToQueue(monitorId, checkFunction, priority = 10) {
        this.queue.push({
            monitorId,
            checkFunction,
            priority,
            addedAt: Date.now()
        });

        // Sort by priority (lower first) and then by added time
        this.queue.sort((a, b) => {
            if (a.priority !== b.priority) {
                return a.priority - b.priority;
            }
            return a.addedAt - b.addedAt;
        });

        this.processQueue();
    }

    /**
     * Process the queue
     */
    async processQueue() {
        if (this.processing || this.queue.length === 0) {
            return;
        }

        this.processing = true;

        while (this.queue.length > 0) {
            const item = this.queue.shift();

            if (this.canExecute(item.monitorId)) {
                try {
                    await item.checkFunction();
                } catch (error) {
                    log.error("monitor-queue", `Error executing monitor ${item.monitorId}: ${error.message}`);
                }
            } else {
                // Rate limited, add back to queue with delay
                setTimeout(() => {
                    this.queue.push(item);
                    this.processQueue();
                }, 1000);
                break;
            }
        }

        this.processing = false;
    }
}

// Singleton instance
let instance = null;

/**
 * Get the singleton instance of MonitorQueue
 * @returns {MonitorQueue} MonitorQueue instance
 */
function getInstance() {
    if (!instance) {
        instance = new MonitorQueue();
    }
    return instance;
}

module.exports = {
    MonitorQueue,
    getInstance
};
