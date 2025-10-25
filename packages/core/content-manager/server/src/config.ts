export default {
    default: {
        auditLog: {
            enabled: true,
            excludeContentTypes: [
                'admin::permission',
                'admin::user',
                'admin::role',
                'admin::api-token',
                'admin::api-token-permission',
                'admin::transfer-token',
                'admin::transfer-token-permission',
                'admin::audit-log', // Prevent recursive logging
            ],
        },
    },
    validator(config: any) {
        if (typeof config.auditLog !== 'object') {
            throw new Error('auditLog configuration must be an object');
        }

        if (typeof config.auditLog.enabled !== 'boolean') {
            throw new Error('auditLog.enabled must be a boolean');
        }

        if (!Array.isArray(config.auditLog.excludeContentTypes)) {
            throw new Error('auditLog.excludeContentTypes must be an array');
        }

        config.auditLog.excludeContentTypes.forEach((contentType: any) => {
            if (typeof contentType !== 'string') {
                throw new Error('All items in auditLog.excludeContentTypes must be strings');
            }
        });
    },
};
