import type { Core, Modules, UID } from '@strapi/types';
import { getService } from '../utils';

interface AuditContext {
    ctx?: any;
}

/**
 * Audit-enabled document manager wrapper
 * This service wraps the original document manager to add audit logging
 */
const auditDocumentManager = ({ strapi }: { strapi: Core.Strapi }) => {
    const originalDocumentManager = getService('document-manager');
    const auditLogger = getService('audit-logger');

    return {
        // Pass through methods that don't need auditing
        findOne: originalDocumentManager.findOne.bind(originalDocumentManager),
        findLocales: originalDocumentManager.findLocales.bind(originalDocumentManager),
        findMany: originalDocumentManager.findMany.bind(originalDocumentManager),
        findPage: originalDocumentManager.findPage.bind(originalDocumentManager),
        exists: originalDocumentManager.exists.bind(originalDocumentManager),
        countDraftRelations: originalDocumentManager.countDraftRelations?.bind(originalDocumentManager),

        /**
         * Create with audit logging
         */
        async create(
            uid: UID.CollectionType,
            opts: Parameters<typeof originalDocumentManager.create>[1] & AuditContext = {} as any
        ) {
            const { ctx, ...createOpts } = opts;

            try {
                const result = await originalDocumentManager.create(uid, createOpts);

                // Log the creation
                if (result) {
                    await auditLogger.logCreate(
                        uid,
                        result.id,
                        result.documentId,
                        createOpts.data,
                        ctx
                    );
                }

                return result;
            } catch (error) {
                throw error;
            }
        },

        /**
         * Update with audit logging
         */
        async update(
            id: Modules.Documents.ID,
            uid: UID.CollectionType,
            opts: Parameters<typeof originalDocumentManager.update>[2] & AuditContext = {} as any
        ) {
            const { ctx, ...updateOpts } = opts;

            try {
                // Get the current data before update for diff
                const existingData = await originalDocumentManager.findOne(id, uid, {
                    locale: updateOpts.locale,
                    status: 'draft'
                });

                const result = await originalDocumentManager.update(id, uid, updateOpts);

                // Log the update
                if (result) {
                    await auditLogger.logUpdate(
                        uid,
                        result.id,
                        result.documentId,
                        existingData,
                        result,
                        ctx
                    );
                }

                return result;
            } catch (error) {
                throw error;
            }
        },

        /**
         * Delete with audit logging
         */
        async delete(
            id: Modules.Documents.ID,
            uid: UID.CollectionType,
            opts: Parameters<typeof originalDocumentManager.delete>[2] & AuditContext = {} as any
        ) {
            const { ctx, ...deleteOpts } = opts;

            try {
                // Get the data before deletion for audit
                const existingData = await originalDocumentManager.findOne(id, uid, {
                    locale: deleteOpts.locale,
                    status: deleteOpts.status || 'draft'
                });

                const result = await originalDocumentManager.delete(id, uid, deleteOpts);

                // Log the deletion
                if (existingData) {
                    await auditLogger.logDelete(
                        uid,
                        existingData.id,
                        existingData.documentId,
                        existingData,
                        ctx
                    );
                }

                return result;
            } catch (error) {
                throw error;
            }
        },

        /**
         * Delete many with audit logging
         */
        async deleteMany(
            documentIds: Modules.Documents.ID[],
            uid: UID.CollectionType,
            opts: Parameters<typeof originalDocumentManager.deleteMany>[2] & AuditContext = {}
        ) {
            const { ctx, ...deleteOpts } = opts;

            try {
                // Get all documents before deletion for audit
                const existingDocuments = await Promise.all(
                    documentIds.map(id =>
                        originalDocumentManager.findOne(id, uid, {
                            locale: deleteOpts.locale,
                        }).catch(() => null) // Handle not found gracefully
                    )
                );

                const result = await originalDocumentManager.deleteMany(documentIds, uid, deleteOpts);

                // Log each deletion
                await Promise.all(
                    existingDocuments
                        .filter(Boolean)
                        .map(doc =>
                            auditLogger.logDelete(
                                uid,
                                doc.id,
                                doc.documentId,
                                doc,
                                ctx
                            )
                        )
                );

                return result;
            } catch (error) {
                throw error;
            }
        },

        /**
         * Publish with audit logging
         */
        async publish(
            id: Modules.Documents.ID,
            uid: UID.CollectionType,
            opts: Parameters<typeof originalDocumentManager.publish>[2] & AuditContext = {} as any
        ) {
            const { ctx, ...publishOpts } = opts;

            try {
                const result = await originalDocumentManager.publish(id, uid, publishOpts);

                // Log the publish action
                if (result && result.length > 0) {
                    await Promise.all(
                        result.map(doc =>
                            auditLogger.logPublishAction(
                                uid,
                                doc.id,
                                doc.documentId,
                                'publish',
                                doc,
                                ctx
                            )
                        )
                    );
                }

                return result;
            } catch (error) {
                throw error;
            }
        },

        /**
         * Publish many with audit logging
         */
        async publishMany(
            uid: UID.ContentType,
            documentIds: string[],
            locale?: string | string[],
            ctx?: any
        ) {
            try {
                const result = await originalDocumentManager.publishMany(uid, documentIds, locale);

                // Log publish actions for each document
                await Promise.all(
                    documentIds.map(async (documentId) => {
                        try {
                            const doc = await originalDocumentManager.findOne(documentId, uid, {
                                locale: Array.isArray(locale) ? locale[0] : locale,
                                status: 'published'
                            });
                            if (doc) {
                                await auditLogger.logPublishAction(
                                    uid,
                                    doc.id,
                                    doc.documentId,
                                    'publish',
                                    doc,
                                    ctx
                                );
                            }
                        } catch (err) {
                            // Continue with other documents if one fails
                            strapi.log.warn('Failed to audit log publish action for document:', documentId, err);
                        }
                    })
                );

                return result;
            } catch (error) {
                throw error;
            }
        },

        /**
         * Unpublish with audit logging
         */
        async unpublish(
            id: Modules.Documents.ID,
            uid: UID.CollectionType,
            opts: Parameters<typeof originalDocumentManager.unpublish>[2] & AuditContext = {} as any
        ) {
            const { ctx, ...unpublishOpts } = opts;

            try {
                const result = await originalDocumentManager.unpublish(id, uid, unpublishOpts);

                // Log the unpublish action
                if (result) {
                    await auditLogger.logPublishAction(
                        uid,
                        result.id,
                        result.documentId,
                        'unpublish',
                        result,
                        ctx
                    );
                }

                return result;
            } catch (error) {
                throw error;
            }
        },

        /**
         * Unpublish many with audit logging
         */
        async unpublishMany(
            documentIds: Modules.Documents.ID[],
            uid: UID.CollectionType,
            opts: Parameters<typeof originalDocumentManager.unpublishMany>[2] & AuditContext = {} as any
        ) {
            const { ctx, ...unpublishOpts } = opts;

            try {
                const result = await originalDocumentManager.unpublishMany(documentIds, uid, unpublishOpts);

                // Log unpublish actions for each document
                await Promise.all(
                    documentIds.map(async (documentId) => {
                        try {
                            const doc = await originalDocumentManager.findOne(documentId, uid, {
                                locale: unpublishOpts.locale,
                                status: 'draft'
                            });
                            if (doc) {
                                await auditLogger.logPublishAction(
                                    uid,
                                    doc.id,
                                    doc.documentId,
                                    'unpublish',
                                    doc,
                                    ctx
                                );
                            }
                        } catch (err) {
                            // Continue with other documents if one fails
                            strapi.log.warn('Failed to audit log unpublish action for document:', documentId, err);
                        }
                    })
                );

                return result;
            } catch (error) {
                throw error;
            }
        },

        /**
         * Clone - pass through (doesn't need audit logging as it creates a new document)
         */
        clone: originalDocumentManager.clone?.bind(originalDocumentManager),

        /**
         * Discard draft - pass through 
         */
        discardDraft: originalDocumentManager.discardDraft?.bind(originalDocumentManager),
    };
};

export default auditDocumentManager;