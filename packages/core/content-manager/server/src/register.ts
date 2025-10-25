import type { Plugin } from '@strapi/types';
import history from './history';
import preview from './preview';
import contentTypes from './content-types';

const register: Plugin.LoadedPlugin['register'] = async ({ strapi }) => {
    // Register audit log content type
    Object.entries(contentTypes).forEach(([name, contentType]) => {
        strapi.contentType(`admin::${name}`, contentType);
    });

    // Register audit log permissions
    const actions = [
        {
            section: 'contentManager',
            displayName: 'Read audit logs',
            uid: 'admin::audit-log.read',
            pluginName: 'content-manager',
        },
    ];

    await strapi.admin.services.permission.actionProvider.registerMany(actions);

    await history.register?.({ strapi });
    await preview.register?.({ strapi });
};

export default register;
