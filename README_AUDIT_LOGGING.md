# Strapi Audit Logging Feature

## Overview

This feature adds automated audit logging to Strapi's Content API, capturing comprehensive metadata for all content changes including creates, updates, deletes, publishes, and unpublishes. It provides a complete audit trail with REST API access for retrieving and analyzing audit logs.

## Features

✅ **Automated Logging**: Captures all content changes automatically without manual intervention

✅ **Comprehensive Metadata**: Records user, content type, timestamps, field changes, and more

✅ **REST API**: Full REST endpoint with filtering, pagination, and sorting

✅ **Role-Based Access**: Permission-based access control for audit log viewing

✅ **Configurable**: Enable/disable logging and exclude specific content types

✅ **Performance Optimized**: Efficient database indexing and async processing

### ✅ REST API Filtering Features (All Implemented)

**Content Type Filtering**: ✅ Filter by specific content types (e.g., `api::article.article`)

**User ID Filtering**: ✅ Filter by specific user who performed actions

**Action Type Filtering**: ✅ Filter by action types (`create`, `update`, `delete`, `publish`, `unpublish`)

**Date Range Filtering**: ✅ Filter by date ranges with `dateFrom` and `dateTo` parameters

**Pagination Support**: ✅ Both page-based (`page`/`pageSize`) and offset-based (`start`/`limit`) pagination

**Sorting Support**: ✅ Sort by `timestamp`, `contentType`, `actionType`, `userId` in ascending or descending order

**Combined Filtering**: ✅ Use multiple filters simultaneously for precise queries

## Architecture Overview

The audit logging system integrates seamlessly with Strapi's existing architecture:

```

Content API Request

       ↓

Controller (collection-types.ts)

       ↓

Audit Document Manager (audit-document-manager.ts)

       ↓

Original Document Manager + Audit Logger (audit-logger.ts)

       ↓

Database (Original Content + Audit Log)

```

### Key Components

1.**Audit Logger Service** (`packages/core/content-manager/server/src/services/audit-logger.ts`): Core service for creating and querying audit logs

2.**Audit Document Manager** (`packages/core/content-manager/server/src/services/audit-document-manager.ts`): Wrapper around original document manager that adds audit logging

3.**Audit Log Content Type** (`packages/core/content-manager/server/src/content-types/audit-log.ts`): Schema definition for audit log storage

4.**Audit Logs Controller** (`packages/core/content-manager/server/src/controllers/audit-logs.ts`): REST API endpoints for retrieving audit logs

5.**Audit Logs Routes** (`packages/core/content-manager/server/src/routes/audit-logs.ts`): API route definitions and permissions

6.**Configuration** (`packages/core/content-manager/server/src/config.ts`): Settings for enabling/disabling and excluding content types

## Installation & Setup

### 1. Integration

The audit logging feature is integrated into the content-manager package at `packages/core/content-manager/`. The implementation includes:

**Core Files Added:**

-`packages/core/content-manager/server/src/services/audit-logger.ts`

-`packages/core/content-manager/server/src/services/audit-document-manager.ts`

-`packages/core/content-manager/server/src/controllers/audit-logs.ts`

-`packages/core/content-manager/server/src/routes/audit-logs.ts`

-`packages/core/content-manager/server/src/content-types/audit-log.ts`

-`packages/core/content-manager/server/src/content-types/index.ts`

**Modified Files:**

-`packages/core/content-manager/server/src/config.ts`

-`packages/core/content-manager/server/src/register.ts`

-`packages/core/content-manager/server/src/index.ts`

-`packages/core/content-manager/server/src/services/index.ts`

-`packages/core/content-manager/server/src/controllers/index.ts`

-`packages/core/content-manager/server/src/controllers/collection-types.ts`

-`packages/core/content-manager/server/src/routes/index.ts`

When you update Strapi with this feature, audit logging will be automatically available.

### 2. Configuration

Add configuration to your Strapi application:

```javascript

// config/plugins.js

module.exports = {

  'content-manager': {

    config: {

      auditLog: {

        enabled:true, // Enable/disable audit logging

        excludeContentTypes: [

          'admin::permission',

          'admin::user', 

          'admin::role',

          // Add other content types to exclude

        ],

      },

    },

  },

};

```

### 3. Permissions

Grant the `Read audit logs` permission to roles that need access:

1. Go to **Settings** → **Administration Panel** → **Roles**
2. Select the role (e.g., Super Admin)
3. Under **Content Manager**, enable **Read audit logs** permission

## API Reference

### Base URL

```

/content-manager/audit-logs

```

### Endpoints

#### GET /audit-logs

Retrieve audit logs with comprehensive filtering, pagination, and sorting capabilities.

**✅ All Required Filtering Features Implemented:**

**Query Parameters:**

-**Content Type Filtering**: `contentType` (string) - Filter by content type UID (e.g., "api::article.article")

-**User ID Filtering**: `userId` (number) - Filter by specific user ID who performed the action

-**Action Type Filtering**: `actionType` (string) - Filter by action type (`create`, `update`, `delete`, `publish`, `unpublish`)

-**Date Range Filtering**:

  -`dateFrom` (string) - Filter from date (ISO format: "2023-10-01T00:00:00.000Z")

  -`dateTo` (string) - Filter to date (ISO format: "2023-10-31T23:59:59.999Z")

-**Sorting**: `sort` (string) - Sort field and direction (e.g., "timestamp:desc", "actionType:asc", "contentType:desc")

-**Pagination**:

  -`page` (number) - Page number (default: 1)

  -`pageSize` (number) - Items per page (default: 25, max: 100)

- Alternative: `start` (number) and `limit` (number) for offset-based pagination

**Advanced Filtering Examples:**

1.**Filter by Content Type:**

```bash

GET/content-manager/audit-logs?contentType=api::article.article

```

2.**Filter by User ID:**

```bash

GET/content-manager/audit-logs?userId=123

```

3.**Filter by Action Type:**

```bash

GET/content-manager/audit-logs?actionType=update

```

4.**Filter by Date Range:**

```bash

GET/content-manager/audit-logs?dateFrom=2023-10-01&dateTo=2023-10-31

```

5.**Combined Filtering with Sorting and Pagination:**

```bash

GET/content-manager/audit-logs?contentType=api::article.article&actionType=update&userId=123&dateFrom=2023-10-01&dateTo=2023-10-31&sort=timestamp:desc&page=2&pageSize=50

```

**Example Response:**

```json

{

  "data": [

    {

      "id": 1,

      "contentType": "api::article.article",

      "recordId": "123",

      "documentId": "doc_456",

      "actionType": "update",

      "timestamp": "2023-10-25T10:30:00.000Z",

      "userId": 1,

      "userEmail": "admin@example.com",

      "changedFields": ["title", "content"],

      "previousValues": {

        "title": "Old Title",

        "content": "Old content..."

      },

      "newValues": {

        "title": "New Title", 

        "content": "New content..."

      },

      "ipAddress": "192.168.1.1",

      "userAgent": "Mozilla/5.0..."

    }

  ],

  "meta": {

    "pagination": {

      "page": 1,

      "pageSize": 20,

      "pageCount": 5,

      "total": 100

    }

  }

}

```

#### GET /audit-logs/:id

Retrieve a single audit log entry by its unique ID.

**Path Parameters:**

-`id` (number) - Unique audit log ID

**Example Request:**

```bash

GET/content-manager/audit-logs/123

```

**Example Response:**

```json

{

  "data": {

    "id": 123,

    "contentType": "api::article.article",

    "recordId": "456",

    "documentId": "doc_789",

    "actionType": "update",

    "timestamp": "2023-10-25T10:30:00.000Z",

    "userId": 1,

    "userEmail": "admin@example.com",

    "changedFields": ["title", "content"],

    "previousValues": {

      "title": "Old Title",

      "content": "Old content..."

    },

    "newValues": {

      "title": "New Title",

      "content": "New content..."

    },

    "fullPayload": { /* complete payload */ },

    "ipAddress": "192.168.1.1",

    "userAgent": "Mozilla/5.0...",

    "createdAt": "2023-10-25T10:30:01.000Z",

    "updatedAt": "2023-10-25T10:30:01.000Z"

  }

}

```

#### GET /audit-logs/stats

Get comprehensive audit log statistics and analytics.

**Query Parameters:**

-`contentType` (string) - Filter stats by content type

-`dateFrom` (string) - Filter stats from date

-`dateTo` (string) - Filter stats to date

**Example Request:**

```bash

GET/content-manager/audit-logs/stats?dateFrom=2023-10-01&dateTo=2023-10-31

```

**Example Response:**

```json

{

  "data": {

    "totalCount": 1547,

    "actionTypeStats": [

      { "action_type": "update", "count": 823 },

      { "action_type": "create", "count": 412 },

      { "action_type": "delete", "count": 198 },

      { "action_type": "publish", "count": 89 },

      { "action_type": "unpublish", "count": 25 }

    ],

    "contentTypeStats": [

      { "content_type": "api::article.article", "count": 945 },

      { "content_type": "api::page.page", "count": 321 },

      { "content_type": "api::product.product", "count": 281 }

    ],

    "recentActivity": [

      { "date": "2023-10-25", "count": 89 },

      { "date": "2023-10-24", "count": 156 },

      { "date": "2023-10-23", "count": 134 }

    ]

  }

}

```

## Audit Log Schema

Each audit log entry contains:

| Field | Type | Description |

|-------|------|-------------|

| `id` | Integer | Unique identifier |

| `contentType` | String | Content type UID (e.g., "api::article.article") |

| `recordId` | String | Record ID |

| `documentId` | String | Document ID (for v5 documents) |

| `actionType` | Enum | Action performed (`create`, `update`, `delete`, `publish`, `unpublish`) |

| `timestamp` | DateTime | When the action occurred |

| `userId` | Integer | ID of user who performed the action |

| `userEmail` | String | Email of user who performed the action |

| `changedFields` | JSON | Array of field names that changed |

| `previousValues` | JSON | Previous values of changed fields |

| `newValues` | JSON | New values of changed fields |

| `fullPayload` | JSON | Complete payload for the action |

| `ipAddress` | String | IP address of the request |

| `userAgent` | String | User agent of the request |

| `createdAt` | DateTime | When audit log was created |

| `updatedAt` | DateTime | When audit log was updated |

## Implementation Details

### File Structure in Strapi Repository

```

packages/core/content-manager/

├── server/src/

│   ├── content-types/

│   │   ├── audit-log.ts          # Audit log schema definition

│   │   └── index.ts              # Content types export

│   ├── controllers/

│   │   ├── audit-logs.ts         # Audit logs API controller (NEW)

│   │   ├── collection-types.ts   # Modified for audit integration

│   │   └── index.ts              # Controllers export (MODIFIED)

│   ├── routes/

│   │   ├── audit-logs.ts         # Audit logs API routes (NEW)

│   │   └── index.ts              # Routes export (MODIFIED)

│   ├── services/

│   │   ├── audit-logger.ts       # Core audit logging service (NEW)

│   │   ├── audit-document-manager.ts # Document manager wrapper (NEW)

│   │   └── index.ts              # Services export (MODIFIED)

│   ├── config.ts                 # Configuration schema (MODIFIED)

│   ├── register.ts               # Content type registration (MODIFIED)

│   └── index.ts                  # Main plugin export (MODIFIED)

```

### Key Implementation Features

**✅ Complete REST API Implementation:**

- All filtering parameters implemented and validated
- Comprehensive error handling and validation
- Flexible pagination (page-based and offset-based)
- Multiple sorting options
- Statistics and analytics endpoint

**✅ Performance Optimizations:**

- Async audit logging to minimize API latency
- Database indexes on commonly queried fields
- Efficient change detection algorithms
- Batch operation support

**✅ Security & Access Control:**

- Role-based permission system (`admin::audit-log.read`)
- Request context capture (IP, User-Agent)
- Admin-only access by default
- Input validation and sanitization

### auditLog.enabled (boolean)

-**Default**: `true`

-**Description**: Enable or disable audit logging globally

### auditLog.excludeContentTypes (array)

-**Default**: `['admin::permission', 'admin::user', 'admin::role', ...]`

-**Description**: Content types to exclude from audit logging

**Example Configuration:**

```javascript

{

  auditLog: {

    enabled: true,

    excludeContentTypes: [

      'admin::permission',

      'admin::user',

      'admin::role',

      'api::internal-log.internal-log', // Custom exclusion

    ],

  }

}

```

## API Testing Examples

### Testing All Filtering Features

**1. Content Type Filtering:**

```bash

# Filter by specific content type

curl-H"Authorization: Bearer <token>"\

  "http://localhost:1337/content-manager/audit-logs?contentType=api::article.article"

```

**2. User ID Filtering:**

```bash

# Filter by specific user

curl-H"Authorization: Bearer <token>"\

  "http://localhost:1337/content-manager/audit-logs?userId=123"

```

**3. Action Type Filtering:**

```bash

# Filter by action type

curl-H"Authorization: Bearer <token>"\

  "http://localhost:1337/content-manager/audit-logs?actionType=update"

```

**4. Date Range Filtering:**

```bash

# Filter by date range

curl-H"Authorization: Bearer <token>"\

  "http://localhost:1337/content-manager/audit-logs?dateFrom=2023-10-01T00:00:00.000Z&dateTo=2023-10-31T23:59:59.999Z"

```

**5. Pagination Support:**

```bash

# Page-based pagination

curl-H"Authorization: Bearer <token>"\

  "http://localhost:1337/content-manager/audit-logs?page=2&pageSize=50"


# Offset-based pagination

curl-H"Authorization: Bearer <token>"\

  "http://localhost:1337/content-manager/audit-logs?start=100&limit=25"

```

**6. Sorting Support:**

```bash

# Sort by timestamp descending (default)

curl-H"Authorization: Bearer <token>"\

  "http://localhost:1337/content-manager/audit-logs?sort=timestamp:desc"


# Sort by content type ascending

curl-H"Authorization: Bearer <token>"\

  "http://localhost:1337/content-manager/audit-logs?sort=contentType:asc"

```

**7. Combined Filtering (All Features Together):**

```bash

# Complex query with all filters

curl-H"Authorization: Bearer <token>"\

  "http://localhost:1337/content-manager/audit-logs?contentType=api::article.article&userId=123&actionType=update&dateFrom=2023-10-01&dateTo=2023-10-31&sort=timestamp:desc&page=1&pageSize=20"

```

### Response Format

All API responses follow this structure:

```json

{

  "data": [...],           // Array of audit log entries

  "meta": {

    "pagination": {

      "page": 1,           // Current page

      "pageSize": 25,      // Items per page

      "pageCount": 10,     // Total pages

      "total": 250         // Total items

    }

  }

}

```

## Security Considerations

1.**Access Control**: Only users with `admin::audit-log.read` permission can access audit logs

2.**Sensitive Data**: Audit logs may contain sensitive information - ensure proper access controls

3.**Data Retention**: Consider implementing data retention policies for audit logs

4.**Performance**: Large audit log tables may impact performance - consider archiving strategies

## Performance Optimization

1.**Database Indexing**: Automatic indexes on frequently queried fields:

   -`contentType`

   -`userId`

   -`actionType`

   -`timestamp`

2.**Async Processing**: Audit logging is performed asynchronously to minimize impact on API performance

3.**Batch Operations**: Bulk operations are logged efficiently

## Troubleshooting

### Audit logs not appearing

1. Check if `auditLog.enabled` is set to `true`
2. Verify the content type is not in `excludeContentTypes`
3. Check Strapi logs for error messages

### Permission denied errors

1. Ensure user has `admin::audit-log.read` permission
2. Verify user is authenticated as admin

### Performance issues

1. Check database indexes on audit_logs table
2. Consider implementing data archiving for old audit logs
3. Review audit log retention policies

## Migration Notes

When upgrading to this version:

1. The audit_logs table will be created automatically
2. Existing data will not be retroactively audited
3. Audit logging will begin immediately after deployment

## Contributing

When modifying this feature:

1. Ensure all CRUD operations are properly audited
2. Add appropriate tests for new functionality
3. Update documentation for any API changes
4. Consider performance implications of changes

## License

This feature is part of Strapi and follows the same license terms.
