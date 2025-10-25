const express = require("express");
const { log } = require("../util-server");
const { getInstance } = require("../modules/monitor-queue");
const { CSVImporter } = require("../modules/csv-importer");
const { allowDevAllOrigin } = require("../util-server");
const { R } = require("redbean-node");

const router = express.Router();

/**
 * Get queue status information
 * @param {object} request Express request object
 * @param {object} response Express response object
 */
router.get("/api/queue/status", async (request, response) => {
    try {
        allowDevAllOrigin(response);

        const monitorQueue = getInstance();
        const status = monitorQueue.getStatus();

        log.info("queue-router", "Queue status requested");
        response.json({
            ok: true,
            data: status
        });
    } catch (error) {
        log.error("queue-router", `Error getting queue status: ${error.message}`);
        response.status(500).json({
            ok: false,
            msg: error.message
        });
    }
});

/**
 * Update queue rate limits
 * @param {object} request Express request object
 * @param {object} response Express response object
 */
router.post("/api/queue/settings", async (request, response) => {
    try {
        allowDevAllOrigin(response);

        const { enabled, maxPerSecond, maxPerMinute, maxPerHour, maxPerDay } = request.body;

        // Validate input
        if (typeof enabled !== "boolean") {
            return response.status(400).json({
                ok: false,
                msg: "enabled must be a boolean"
            });
        }

        const limits = {
            enabled
        };

        // Only include defined limits
        if (maxPerSecond !== undefined) {
            limits.maxPerSecond = parseInt(maxPerSecond);
            if (isNaN(limits.maxPerSecond) || limits.maxPerSecond < 1 || limits.maxPerSecond > 1000) {
                return response.status(400).json({
                    ok: false,
                    msg: "maxPerSecond must be between 1 and 1000"
                });
            }
        }

        if (maxPerMinute !== undefined) {
            limits.maxPerMinute = parseInt(maxPerMinute);
            if (isNaN(limits.maxPerMinute) || limits.maxPerMinute < 1 || limits.maxPerMinute > 10000) {
                return response.status(400).json({
                    ok: false,
                    msg: "maxPerMinute must be between 1 and 10000"
                });
            }
        }

        if (maxPerHour !== undefined) {
            limits.maxPerHour = parseInt(maxPerHour);
            if (isNaN(limits.maxPerHour) || limits.maxPerHour < 1 || limits.maxPerHour > 100000) {
                return response.status(400).json({
                    ok: false,
                    msg: "maxPerHour must be between 1 and 100000"
                });
            }
        }

        if (maxPerDay !== undefined) {
            limits.maxPerDay = parseInt(maxPerDay);
            if (isNaN(limits.maxPerDay) || limits.maxPerDay < 1 || limits.maxPerDay > 1000000) {
                return response.status(400).json({
                    ok: false,
                    msg: "maxPerDay must be between 1 and 1000000"
                });
            }
        }

        const monitorQueue = getInstance();
        await monitorQueue.updateRateLimits(limits);

        log.info("queue-router", `Queue settings updated: ${JSON.stringify(limits)}`);

        response.json({
            ok: true,
            msg: "Queue settings updated successfully"
        });

    } catch (error) {
        log.error("queue-router", `Error updating queue settings: ${error.message}`);
        response.status(500).json({
            ok: false,
            msg: error.message
        });
    }
});

/**
 * Import monitors from CSV file
 * @param {object} request Express request object
 * @param {object} response Express response object
 */
router.post("/api/import/monitors", async (request, response) => {
    try {
        allowDevAllOrigin(response);

        const { filePath, defaultSettings } = request.body;

        if (!filePath) {
            return response.status(400).json({
                ok: false,
                msg: "filePath is required"
            });
        }

        if (!request.files || !request.files.csvFile) {
            return response.status(400).json({
                ok: false,
                msg: "CSV file is required"
            });
        }

        // Get user ID from authenticated session
        const userId = request.userID;
        if (!userId) {
            return response.status(401).json({
                ok: false,
                msg: "Authentication required"
            });
        }

        const csvImporter = new CSVImporter();
        const defaultMonitorSettings = {
            type: 'http',
            interval: 60,
            timeout: 30,
            maxretries: 3,
            retryInterval: 60,
            active: true
        };

        const mergedSettings = { ...defaultMonitorSettings, ...defaultSettings };

        const result = await csvImporter.importFromFile(
            request.files.csvFile.path,
            userId,
            mergedSettings
        );

        log.info("queue-router", `CSV import completed: ${result.imported} imported, ${result.skipped} skipped, ${result.errors.length} errors`);

        response.json({
            ok: true,
            data: {
                total: result.total,
                imported: result.imported,
                skipped: result.skipped,
                errors: result.errors,
                errors: result.errors
            }
        });

    } catch (error) {
        log.error("queue-router", `Error importing monitors: ${error.message}`);
        response.status(500).json({
            ok: false,
            msg: error.message
        });
    }
});

/**
 * Get CSV template
 * @param {object} request Express request object
 * @param {object} response Express response object
 */
router.get("/api/import/template", (request, response) => {
    try {
        allowDevAllOrigin(response);

        const csvImporter = new CSVImporter();
        const template = csvImporter.getCSVTemplate();

        response.setHeader('Content-Type', 'text/csv; charset=utf-8');
        response.setHeader('Content-Disposition', 'attachment; filename="monitor-import-template.csv"');

        response.send(template);

    } catch (error) {
        log.error("queue-router", `Error generating CSV template: ${error.message}`);
        response.status(500).json({
            ok: false,
            msg: error.message
        });
    }
});

module.exports = router;
