# Strapi Audit Logging Implementation

This repository contains the implementation of automated audit logging for Strapi's Content API.

## 🚀 Quick Start

### Option 1: Direct Integration (Recommended for development)

1.**Clone this repository**:

```bash

   git clone <your-repo-url>

   cd strapi-audit-logging

```

2.**Copy the implementation files** to your Strapi project:

```bash

   # Copy all audit logging files to your Strapi content-manager package

   cp -r packages/core/content-manager/server/src/* your-strapi-project/packages/core/content-manager/server/src/

```

3.**Update your Strapi configuration**:

```javascript

   // config/plugins.js

   module.exports = {

     'content-manager': {

       config: {

         auditLog: {

           enabled:true,

           excludeContentTypes: [

             'admin::permission',

             'admin::user', 

             'admin::role',

           ],

         },

       },

     },

   };

```

4.**Restart your Strapi application**:

```bash

   npm run develop

```

### Option 2: Fork and Modify

1.**Fork the Strapi repository**:

```bash

   git clone https://github.com/strapi/strapi.git

   cd strapi

```

2.**Apply the audit logging changes** from this repository

3.**Build and use your custom Strapi version**

## 📁 Implementation Files

The audit logging feature consists of these key files:

### Core Implementation

-`server/src/services/audit-logger.ts` - Core audit logging service

-`server/src/services/audit-document-manager.ts` - Document manager wrapper

-`server/src/controllers/audit-logs.ts` - REST API controller

-`server/src/routes/audit-logs.ts` - API route definitions

-`server/src/content-types/audit-log.ts` - Audit log schema

### Configuration & Setup

-`server/src/config.ts` - Configuration schema and validation

-`server/src/register.ts` - Content type and permission registration

-`server/src/index.ts` - Main plugin exports

### Documentation

-`README_AUDIT_LOGGING.md` - Complete feature documentation

-`DESIGN_NOTE.md` - Architectural design and implementation details

## 🔧 Integration Guide

### 1. Service Integration

Update your services index to include audit logging:

```typescript

// packages/core/content-manager/server/src/services/index.ts

importauditLoggerfrom'./audit-logger';

importauditDocumentManagerfrom'./audit-document-manager';


exportdefault {

  'audit-logger':auditLogger,

  'audit-document-manager':auditDocumentManager,

  // ... existing services

};

```

### 2. Controller Updates

Replace document manager calls in controllers:

```typescript

// In collection-types.ts

constdocumentManager = getService('audit-document-manager');

returndocumentManager.create(model, { ...opts, ctx });

```

### 3. Route Registration

Add audit log routes:

```typescript

// packages/core/content-manager/server/src/routes/index.ts

importauditLogsfrom'./audit-logs';


exportdefault {

  'audit-logs':auditLogs,

  // ... existing routes

};

```

## 🔒 Permissions Setup

1.**Navigate to Strapi Admin** → Settings → Administration Panel → Roles

2.**Select the appropriate role** (e.g., Super Admin)

3.**Enable the permission**: Content Manager → Read audit logs

## 📊 API Usage Examples

### Retrieve All Audit Logs

```bash

GET/content-manager/audit-logs

```

### Filter by Content Type

```bash

GET/content-manager/audit-logs?contentType=api::article.article

```

### Filter by Action and Date Range

```bash

GET/content-manager/audit-logs?actionType=update&dateFrom=2023-10-01&dateTo=2023-10-31

```

### Get Audit Statistics

```bash

GET/content-manager/audit-logs/stats

```

## 🧪 Testing

### Manual Testing

1.**Create content** through Strapi admin or API

2.**Check audit logs**:

```bash

   GET /content-manager/audit-logs

```

3.**Verify log entries** contain expected metadata

### Automated Testing

Run the existing Strapi test suite to ensure no regressions:

```bash

npmruntest

```

## 📈 Performance Considerations

-**Async Processing**: Audit logging is performed asynchronously

-**Database Indexing**: Optimized indexes for common query patterns

-**Configuration**: Disable for non-critical content types

-**Archiving**: Implement retention policies for long-term performance

## 🔍 Troubleshooting

### Audit Logs Not Appearing

1.**Check configuration**:

```javascript

   // Ensure auditLog.enabled is true

   console.log(strapi.config.get('auditLog'));

```

2.**Verify content type not excluded**:

```javascript

   // Check excludeContentTypes array

   constconfig = strapi.config.get('auditLog');

   console.log(config.excludeContentTypes);

```

3.**Check permissions**:

- Ensure user has `admin::audit-log.read` permission

### Permission Errors

- Verify user authentication
- Check role permissions in Strapi admin
- Ensure proper JWT token in requests

## 🤝 Contributing

1.**Fork the repository**

2.**Create a feature branch**: `git checkout -b feature/audit-enhancement`

3.**Make your changes**

4.**Add tests** for new functionality

5.**Submit a pull request**

## 📄 License

This implementation follows the same license as Strapi.

## 🙋‍♂️ Support

For questions or issues:

1. Check the troubleshooting section above
2. Review the design documentation in `DESIGN_NOTE.md`
3. Create an issue in this repository

---

## 📋 Implementation Checklist

- [X] Audit log data model and schema
- [X] Audit logging service with change detection
- [X] Document manager integration
- [X] REST API endpoints with filtering
- [X] Role-based permissions and access control
- [X] Configuration options
- [X] Comprehensive documentation
- [X] Performance optimizations
- [X] Error handling and validation

## 🎯 Next Steps

1.**Deploy** to your Strapi environment

2.**Configure** audit log settings for your needs

3.**Set up permissions** for appropriate user roles

4.**Monitor** audit log performance and storage

5.**Implement** retention policies if needed
