import type { Schema } from '@strapi/types';

export default {
  kind: 'collectionType',
  collectionName: 'audit_logs',
  info: {
    name: 'audit-log',
    displayName: 'Audit Log',
    description: 'Automated audit logging for content changes',
  },
  options: {
    draftAndPublish: false,
    timestamps: true,
  },
  pluginOptions: {
    'content-manager': {
      visible: false,
    },
    'content-type-builder': {
      visible: false,
    },
  },
  attributes: {
    contentType: {
      type: 'string',
      required: true,
      configurable: false,
    },
    recordId: {
      type: 'string',
      required: true,
      configurable: false,
    },
    documentId: {
      type: 'string',
      required: false,
      configurable: false,
    },
    actionType: {
      type: 'enumeration',
      enum: ['create', 'update', 'delete', 'publish', 'unpublish'],
      required: true,
      configurable: false,
    },
    timestamp: {
      type: 'datetime',
      required: true,
      configurable: false,
    },
    userId: {
      type: 'integer',
      required: false,
      configurable: false,
    },
    userEmail: {
      type: 'string',
      required: false,
      configurable: false,
    },
    changedFields: {
      type: 'json',
      required: false,
      configurable: false,
    },
    previousValues: {
      type: 'json',
      required: false,
      configurable: false,
    },
    newValues: {
      type: 'json',
      required: false,
      configurable: false,
    },
    fullPayload: {
      type: 'json',
      required: false,
      configurable: false,
    },
    ipAddress: {
      type: 'string',
      required: false,
      configurable: false,
    },
    userAgent: {
      type: 'text',
      required: false,
      configurable: false,
    },
  },
} as Schema.ContentType;
