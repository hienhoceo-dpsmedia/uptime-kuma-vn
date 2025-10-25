/**
 * CSV Importer for Monitor Configuration
 * Allows bulk import of monitoring targets from CSV files
 */

const fs = require("fs");
const { log } = require("../../src/util");
const { R } = require("redbean-node");
const Monitor = require("../model/monitor");

class CSVImporter {
    /**
     * Parse CSV file and return monitor configurations
     * @param {string} csvContent CSV file content
     * @param {object} defaultSettings Default monitor settings
     * @returns {Array} Array of monitor configurations
     */
    parseCSV(csvContent, defaultSettings) {
        const lines = csvContent.split('\n').filter(line => line.trim() !== '');
        if (lines.length === 0) {
            return [];
        }

        // Get headers from first line
        const headers = this.parseCSVLine(lines[0]);
        const monitorConfigs = [];

        // Skip header and process data lines
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line === '') {
                continue;
            }

            const values = this.parseCSVLine(line);
            if (values.length !== headers.length) {
                log.warn("csv-importer", `Line ${i + 1}: Column count mismatch. Expected ${headers.length}, got ${values.length}`);
                continue;
            }

            const config = this.mapCSVToMonitorConfig(headers, values, defaultSettings);
            if (config) {
                monitorConfigs.push(config);
            }
        }

        return monitorConfigs;
    }

    /**
     * Parse a single CSV line
     * @param {string} line CSV line content
     * @returns {Array} Array of values
     */
    parseCSVLine(line) {
        const values = [];
        let currentValue = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];

            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                values.push(currentValue.trim());
                currentValue = '';
            } else {
                currentValue += char;
            }
        }

        values.push(currentValue.trim());
        return values;
    }

    /**
     * Map CSV values to monitor configuration
     * @param {Array} headers CSV headers
     * @param {Array} values CSV values
     * @param {object} defaultSettings Default settings
     * @returns {object|null} Monitor configuration
     */
    mapCSVToMonitorConfig(headers, values, defaultSettings) {
        const config = {};

        // Create header to value mapping
        const headerMap = {};
        headers.forEach((header, index) => {
            headerMap[header.toLowerCase()] = index;
        });

        // Map values to configuration
        Object.keys(headerMap).forEach(header => {
            const index = headerMap[header];
            if (index < values.length) {
                const value = values[index];

                // Map common CSV headers to monitor fields
                switch (header.toLowerCase()) {
                    case 'name':
                    config.name = value;
                        break;
                    case 'url':
                    case 'website':
                    case 'target':
                    case 'endpoint':
                        config.url = value;
                        break;
                    case 'type':
                        config.type = value || defaultSettings.type || 'http';
                        break;
                    case 'interval':
                        const interval = parseInt(value);
                        if (!isNaN(interval) && interval >= 20 && interval <= 86400) {
                            config.interval = interval;
                        }
                        break;
                    case 'timeout':
                        const timeout = parseInt(value);
                        if (!isNaN(timeout) && timeout >= 1 && timeout <= 900) {
                            config.timeout = timeout;
                        }
                        break;
                    case 'maxretries':
                        const maxretries = parseInt(value);
                        if (!isNaN(maxretries) && maxretries >= 0 && maxretries <= 10) {
                            config.maxretries = maxretries;
                        }
                        break;
                    case 'retryinterval':
                        const retryInterval = parseInt(value);
                        if (!isNaN(retryInterval) && retryInterval >= 1 && retryInterval <= 900) {
                            config.retryInterval = retryInterval;
                        }
                        break;
                    case 'keyword':
                        config.keyword = value;
                        break;
                    case 'description':
                        config.description = value;
                        break;
                    case 'tags':
                        config.tags = value.split(';').map(tag => tag.trim()).filter(tag => tag !== '');
                        break;
                    case 'notification':
                    case 'notifications':
                        // Handle comma-separated notification names
                        config.notificationIDList = {};
                        const notificationNames = value.split(',').map(n => n.trim()).filter(n => n !== '');
                        notificationNames.forEach(name => {
                            config.notificationIDList[name] = true;
                        });
                        break;
                    case 'active':
                        config.active = value.toLowerCase() === 'true' || value.toLowerCase() === '1';
                        break;
                    case 'upside_down':
                    case 'upsidedown':
                        config.upsideDown = value.toLowerCase() === 'true' || value.toLowerCase() === '1';
                        break;
                    case 'ignore_tls':
                    case 'ignoretls':
                        config.ignoreTls = value.toLowerCase() === 'true' || value.toLowerCase() === '1';
                        break;
                }
            }
        });

        // Validate required fields
        if (!config.name || !config.url) {
            log.warn("csv-importer", "Missing required fields: name and url");
            return null;
        }

        return config;
    }

    /**
     * Import monitors from CSV file
     * @param {string} filePath Path to CSV file
     * @param {number} userId User ID for ownership
     * @param {object} defaultSettings Default monitor settings
     * @returns {Promise<object>} Import result
     */
    async importFromFile(filePath, userId, defaultSettings) {
        try {
            const csvContent = fs.readFileSync(filePath, 'utf8');
            const monitorConfigs = this.parseCSV(csvContent, defaultSettings);

            const results = {
                total: monitorConfigs.length,
                imported: 0,
                skipped: 0,
                errors: []
            };

            for (const config of monitorConfigs) {
                try {
                    // Create monitor bean
                    const monitor = R.dispense("monitor");

                    // Set basic properties
                    monitor.user_id = userId;
                    monitor.name = config.name;
                    monitor.url = config.url;
                    monitor.type = config.type;
                    monitor.interval = config.interval || defaultSettings.interval || 60;
                    monitor.timeout = config.timeout || defaultSettings.timeout || 30;
                    monitor.maxretries = config.maxretries || defaultSettings.maxretries || 3;
                    monitor.retryInterval = config.retryInterval || defaultSettings.retryInterval || 60;
                    monitor.keyword = config.keyword || '';
                    monitor.description = config.description || '';
                    monitor.active = 1;
                    monitor.upsideDown = config.upsideDown || false;
                    monitor.ignoreTls = config.ignoreTls || false;

                    // Validate monitor before saving
                    monitor.validate();

                    // Save monitor
                    await R.store(monitor);
                    results.imported++;

                    // Handle tags if provided
                    if (config.tags && config.tags.length > 0) {
                        await this.handleTags(monitor.id, config.tags, userId);
                    }

                    // Handle notifications if provided
                    if (config.notificationIDList && Object.keys(config.notificationIDList).length > 0) {
                        await this.handleNotifications(monitor.id, config.notificationIDList, userId);
                    }

                    log.info("csv-importer", `Imported monitor: ${config.name} (${config.url})`);
                } catch (error) {
                    results.errors.push({
                        row: config.name || 'Unknown',
                        error: error.message
                    });
                    results.skipped++;
                }
            }

            return results;

        } catch (error) {
            log.error("csv-importer", `Failed to read CSV file: ${error.message}`);
            throw error;
        }
    }

    /**
     * Handle tags for imported monitor
     * @param {number} monitorId Monitor ID
     * @param {Array} tagNames Array of tag names
     * @param {number} userId User ID
     */
    async handleTags(monitorId, tagNames, userId) {
        for (const tagName of tagNames) {
            // Check if tag already exists
            let tag = await R.findOne("tag", " name = ? AND user_id = ?", [tagName, userId]);

            if (!tag) {
                // Create new tag
                tag = R.dispense("tag");
                tag.name = tagName;
                tag.user_id = userId;
                tag.color = this.getRandomColor();
                await R.store(tag);
            }

            // Link tag to monitor
            const monitorTag = R.dispense("monitor_tag");
            monitorTag.monitor_id = monitorId;
            monitorTag.tag_id = tag.id;
            monitorTag.value = '';
            await R.store(monitorTag);
        }
    }

    /**
     * Handle notifications for imported monitor
     * @param {number} monitorId Monitor ID
     * @param {object} notificationMap Map of notification names to enabled
     * @param {number} userId User ID
     */
    async handleNotifications(monitorId, notificationMap, userId) {
        for (const notificationName of Object.keys(notificationMap)) {
            // Find notification by name
            const notification = await R.findOne("notification", " name = ? AND user_id = ?", [notificationName, userId]);

            if (notification) {
                // Create monitor_notification link
                const monitorNotification = R.dispense("monitor_notification");
                monitorNotification.monitor_id = monitorId;
                monitorNotification.notification_id = notification.id;
                await R.store(monitorNotification);
            }
        }
    }

    /**
     * Generate random color for tags
     * @returns {string} Random hex color
     */
    getRandomColor() {
        const colors = ['#007bff', '#28a745', '#dc3545', '#fd7e14', '#6f42c1', '#20c997', '#6610f2'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    /**
     * Get CSV template
     * @returns {string} CSV template content
     */
    getCSVTemplate() {
        return `name,url,type,interval,timeout,maxretries,retryinterval,keyword,description,tags,notifications,active,upside_down,ignore_tls
Example Website,https://example.com,http,60,30,3,60,,Example website description,tag1;tag2,email;sms,true,false,false
Google API,https://api.google.com,http,120,60,2,120,API Key,Google service monitor,,slack,true,false,false`;
    }
}

module.exports = CSVImporter;
