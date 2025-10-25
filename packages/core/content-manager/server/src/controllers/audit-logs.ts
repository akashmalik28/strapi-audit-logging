export default {
    type: 'admin',
    routes: [
        // GET /audit-logs - List audit logs with filtering and pagination
        {
            method: 'GET',
            path: '/audit-logs',
            handler: 'audit-logs.find',
            config: {
                policies: [
                    'admin::isAuthenticatedAdmin',
                    {
                        name: 'admin::hasPermissions',
                        config: {
                            actions: ['admin::audit-log.read'],
                        },
                    },
                ],
            },
        },
        // GET /audit-logs/:id - Get single audit log
        {
            method: 'GET',
            path: '/audit-logs/:id',
            handler: 'audit-logs.findOne',
            config: {
                policies: [
                    'admin::isAuthenticatedAdmin',
                    {
                        name: 'admin::hasPermissions',
                        config: {
                            actions: ['admin::audit-log.read'],
                        },
                    },
                ],
            },
        },
        // GET /audit-logs/stats - Get audit log statistics
        {
            method: 'GET',
            path: '/audit-logs/stats',
            handler: 'audit-logs.getStats',
            config: {
                policies: [
                    'admin::isAuthenticatedAdmin',
                    {
                        name: 'admin::hasPermissions',
                        config: {
                            actions: ['admin::audit-log.read'],
                        },
                    },
                ],
            },
        },
    ],
};