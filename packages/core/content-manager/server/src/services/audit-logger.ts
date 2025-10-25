import { differenceWith, isEqual, pick, omit } from 'lodash/fp';
import type { Core, UID } from '@strapi/types';

interface AuditLogEntry {
    contentType: string;
    recordId: string;
    documentId?: string;
    actionType: 'create' | 'update' | 'delete' | 'publish' | 'unpublish';
    timestamp: Date;
    userId?: number;
    userEmail?: string;
    changedFields?: string[];
    previousValues?: any;
    newValues?: any;
    fullPayload?: any;
    ipAddress?: string;
    userAgent?: string;
}

interface AuditLogConfig {
    enabled: boolean;
    excludeContentTypes: string[];
}

const AUDIT_LOG_UID = 'admin::audit-log' as UID.ContentType;

export default ({ strapi }: { strapi: Core.Strapi }) => ({
    /**
     * Get audit log configuration
     */
    getConfig(): AuditLogConfig {
        return strapi.config.get('auditLog', {
            enabled: true,
            excludeContentTypes: [],
        });
    },

    /**
     * Check if audit logging is enabled for a content type
     */
    isLoggingEnabled(contentType: string): boolean {
        const config = this.getConfig();
        return config.enabled && !config.excludeContentTypes.includes(contentType);
    },

    /**
     * Calculate changed fields between old and new data
     */
    getChangedFields(oldData: any, newData: any): {
        changedFields: string[];
        previousValues: any;
        newValues: any;
    } {
        if (!oldData) {
            return {
                changedFields: Object.keys(newData || {}),
                previousValues: null,
                newValues: newData,
            };
        }

        const allKeys = Array.from(new Set([
            ...Object.keys(oldData || {}),
            ...Object.keys(newData || {}),
        ]));

        const changedFields: string[] = [];
        const previousValues: any = {};
        const newValues: any = {};

        for (const key of allKeys) {
            const oldValue = oldData[key];
            const newValue = newData[key];

            if (!isEqual(oldValue, newValue)) {
                changedFields.push(key);
                previousValues[key] = oldValue;
                newValues[key] = newValue;
            }
        }

        return {
            changedFields,
            previousValues: changedFields.length > 0 ? previousValues : null,
            newValues: changedFields.length > 0 ? newValues : null,
        };
    },

    /**
     * Extract user information from context
     */
    extractUserInfo(ctx: any): { userId?: number; userEmail?: string } {
        const user = ctx?.state?.user;
        return {
            userId: user?.id,
            userEmail: user?.email,
        };
    },

    /**
     * Extract request metadata
     */
    extractRequestMetadata(ctx: any): { ipAddress?: string; userAgent?: string } {
        return {
            ipAddress: ctx?.request?.ip || ctx?.ip,
            userAgent: ctx?.request?.header?.['user-agent'],
        };
    },

    /**
     * Create an audit log entry
     */
    async createLogEntry(entry: Omit<AuditLogEntry, 'timestamp'>): Promise<void> {
        try {
            // Don't log audit log operations to prevent recursion
            if (entry.contentType === AUDIT_LOG_UID) {
                return;
            }

            if (!this.isLoggingEnabled(entry.contentType)) {
                return;
            }

            const logEntry: AuditLogEntry = {
                ...entry,
                timestamp: new Date(),
            };

            // Use raw database query to avoid triggering more audit logs
            await strapi.db.query(AUDIT_LOG_UID).create({
                data: logEntry,
            });
        } catch (error) {
            strapi.log.error('Failed to create audit log entry:', error);
        }
    },

    /**
     * Log create operation
     */
    async logCreate(
        contentType: string,
        recordId: string,
        documentId: string | undefined,
        data: any,
        ctx?: any
    ): Promise<void> {
        const userInfo = ctx ? this.extractUserInfo(ctx) : {};
        const requestMetadata = ctx ? this.extractRequestMetadata(ctx) : {};

        await this.createLogEntry({
            contentType,
            recordId,
            documentId,
            actionType: 'create',
            fullPayload: data,
            changedFields: Object.keys(data || {}),
            newValues: data,
            ...userInfo,
            ...requestMetadata,
        });
    },

    /**
     * Log update operation
     */
    async logUpdate(
        contentType: string,
        recordId: string,
        documentId: string | undefined,
        oldData: any,
        newData: any,
        ctx?: any
    ): Promise<void> {
        const userInfo = ctx ? this.extractUserInfo(ctx) : {};
        const requestMetadata = ctx ? this.extractRequestMetadata(ctx) : {};
        const { changedFields, previousValues, newValues } = this.getChangedFields(oldData, newData);

        // Only log if there are actual changes
        if (changedFields.length === 0) {
            return;
        }

        await this.createLogEntry({
            contentType,
            recordId,
            documentId,
            actionType: 'update',
            changedFields,
            previousValues,
            newValues,
            fullPayload: newData,
            ...userInfo,
            ...requestMetadata,
        });
    },

    /**
     * Log delete operation
     */
    async logDelete(
        contentType: string,
        recordId: string,
        documentId: string | undefined,
        deletedData: any,
        ctx?: any
    ): Promise<void> {
        const userInfo = ctx ? this.extractUserInfo(ctx) : {};
        const requestMetadata = ctx ? this.extractRequestMetadata(ctx) : {};

        await this.createLogEntry({
            contentType,
            recordId,
            documentId,
            actionType: 'delete',
            fullPayload: deletedData,
            previousValues: deletedData,
            ...userInfo,
            ...requestMetadata,
        });
    },

    /**
     * Log publish/unpublish operations
     */
    async logPublishAction(
        contentType: string,
        recordId: string,
        documentId: string | undefined,
        actionType: 'publish' | 'unpublish',
        data: any,
        ctx?: any
    ): Promise<void> {
        const userInfo = ctx ? this.extractUserInfo(ctx) : {};
        const requestMetadata = ctx ? this.extractRequestMetadata(ctx) : {};

        await this.createLogEntry({
            contentType,
            recordId,
            documentId,
            actionType,
            fullPayload: data,
            ...userInfo,
            ...requestMetadata,
        });
    },

    /**
     * Find audit logs with filtering and pagination
     */
    async findLogs(params: {
        contentType?: string;
        userId?: number;
        actionType?: string;
        dateFrom?: string;
        dateTo?: string;
        sort?: string;
        pagination?: {
            page?: number;
            pageSize?: number;
            start?: number;
            limit?: number;
        };
    }) {
        const { contentType, userId, actionType, dateFrom, dateTo, sort = 'timestamp:desc', pagination } = params;

        // Build where clause
        const where: any = {};

        if (contentType) {
            where.contentType = contentType;
        }

        if (userId) {
            where.userId = userId;
        }

        if (actionType) {
            where.actionType = actionType;
        }

        if (dateFrom || dateTo) {
            where.timestamp = {};
            if (dateFrom) {
                where.timestamp.$gte = new Date(dateFrom);
            }
            if (dateTo) {
                where.timestamp.$lte = new Date(dateTo);
            }
        }

        // Build sort
        const orderBy: any = {};
        if (sort) {
            const [field, direction = 'asc'] = sort.split(':');
            orderBy[field] = direction;
        }

        // Execute query with pagination
        const queryParams: any = {
            where,
            orderBy,
        };

        if (pagination) {
            if (pagination.page && pagination.pageSize) {
                queryParams.offset = (pagination.page - 1) * pagination.pageSize;
                queryParams.limit = pagination.pageSize;
            } else if (pagination.start !== undefined && pagination.limit !== undefined) {
                queryParams.offset = pagination.start;
                queryParams.limit = pagination.limit;
            }
        }

        const [results, total] = await Promise.all([
            strapi.db.query(AUDIT_LOG_UID).findMany(queryParams),
            strapi.db.query(AUDIT_LOG_UID).count({ where }),
        ]);

        return {
            results,
            pagination: pagination ? {
                page: pagination.page || Math.floor((pagination.start || 0) / (pagination.limit || 25)) + 1,
                pageSize: pagination.pageSize || pagination.limit || 25,
                pageCount: Math.ceil(total / (pagination.pageSize || pagination.limit || 25)),
                total,
            } : { total },
        };
    },
});