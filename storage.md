# ADO Webhook → Next.js Integration Guide

**Trigger:** Story moves to "In Progress" with specific tags  
**Action:** Call a downstream endpoint with full story details + attachments  
**Auth options:** PAT (simple) or OAuth 2.0 / Entra ID (enterprise)

---

## Table of Contents

1. [Overview](#1-overview)
2. [Prerequisites](#2-prerequisites)
3. [Project structure](#3-project-structure)
4. [Approach A — Personal Access Token (PAT)](#4-approach-a--personal-access-token-pat)
5. [Approach B — OAuth 2.0 with Azure Entra ID](#5-approach-b--oauth-20-with-azure-entra-id)
6. [Shared route handler](#6-shared-route-handler)
7. [Configure ADO service hook](#7-configure-ado-service-hook)
8. [Testing locally](#8-testing-locally)
9. [Deployment checklist](#9-deployment-checklist)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Overview

Azure DevOps (ADO) does not natively support tag-based filtering in service hooks, and its webhook payloads do not include attachment data. This guide walks through building a Next.js API route that:

1. Receives the ADO webhook event
2. Validates a shared secret
3. Checks that the work item state is **"In Progress"**
4. Fetches the full work item via the ADO REST API to check tags
5. Fetches all attachments
6. Forwards an enriched payload to your target endpoint

Authentication to the ADO REST API is handled in one of two ways:

| | Approach A — PAT | Approach B — OAuth 2.0 |
|---|---|---|
| Setup complexity | Low | Medium |
| Suitable for | Personal projects, small teams | Enterprise / org policy |
| Token lifecycle | Manual rotation | Auto-refreshed |
| Requires Azure portal | No | Yes |
| Works if org blocks PATs | No | Yes |

---

## 2. Prerequisites

- Node.js 18+ and a Next.js 13+ project (App Router)
- Access to your ADO organisation (Project Administrator or above)
- For Approach B: access to the Azure portal to register an app

Install dependencies:

```bash
# Required for both approaches
npm install

# Only for Approach B (optional but recommended)
npm install @azure/identity
```

---

## 3. Project structure

Create the following files. The route handler (`route.ts`) and the ADO helpers (`lib/ado.ts`) are shared between both approaches — only the auth layer changes.

```
your-nextjs-app/
├── app/
│   └── api/
│       └── ado-webhook/
│           └── route.ts          ← Next.js route handler (shared)
├── lib/
│   ├── ado.ts                    ← ADO API helpers (shared)
│   └── ado-auth.ts               ← Auth logic (differs per approach)
└── .env.local                    ← Environment variables (never commit)
```

---

## 4. Approach A — Personal Access Token (PAT)

Use this approach when your organisation permits PATs. It is the quickest path to a working integration.

### 4.1 Create a PAT in ADO

1. Go to `https://dev.azure.com/{your-org}`
2. Click your avatar (top right) → **Personal access tokens**
3. Click **New Token**
4. Configure:
   - **Name:** `ado-webhook-service`
   - **Organisation:** your org
   - **Expiration:** set a rotation reminder (90 days recommended)
   - **Scopes:** select **Custom defined**, then tick:
     - `Work Items` → **Read**
5. Click **Create** and copy the token value immediately — it will not be shown again

### 4.2 Set environment variables

Create `.env.local` at the project root:

```bash
# ADO organisation and project
ADO_ORG=your-org-name
ADO_PROJECT=your-project-name

# PAT — keep this secret, never commit
ADO_PAT=your-pat-token-here

# Tags that must ALL be present on the work item (comma-separated)
ADO_REQUIRED_TAGS=automation,priority-high

# Shared secret — paste this as the Basic Auth password in the ADO service hook
WEBHOOK_SECRET=generate-a-strong-random-string

# Where to forward the enriched payload
TARGET_ENDPOINT=https://your-service.com/api/ingest
```

### 4.3 Create `lib/ado-auth.ts`

```typescript
// lib/ado-auth.ts (Approach A — PAT)

export function getAdoAuthHeader(): Record<string, string> {
  const pat = process.env.ADO_PAT!;
  const encoded = Buffer.from(`:${pat}`).toString('base64');
  return {
    Authorization: `Basic ${encoded}`,
    'Content-Type': 'application/json',
  };
}
```

### 4.4 Create `lib/ado.ts`

```typescript
// lib/ado.ts

import { getAdoAuthHeader } from './ado-auth';

const ADO_ORG = process.env.ADO_ORG!;
const ADO_PROJECT = process.env.ADO_PROJECT!;
const ADO_BASE = `https://dev.azure.com/${ADO_ORG}/${ADO_PROJECT}/_apis`;

async function adoFetch(path: string) {
  const headers = getAdoAuthHeader();
  const res = await fetch(`${ADO_BASE}${path}`, { headers });

  if (!res.ok) {
    throw new Error(`ADO API error ${res.status} for path: ${path}`);
  }

  return res.json();
}

export async function fetchWorkItemDetails(id: number) {
  // $expand=all returns fields, relations, links, and comments in one call
  return adoFetch(`/wit/workitems/${id}?$expand=all&api-version=7.1`);
}

export async function fetchWorkItemAttachments(id: number) {
  const data = await adoFetch(`/wit/workitems/${id}/attachments?api-version=7.1`);
  return data.value ?? [];
}

// Optional: download attachment binary content
export async function downloadAttachment(url: string): Promise<Buffer> {
  const headers = getAdoAuthHeader();
  const res = await fetch(url, { headers });

  if (!res.ok) {
    throw new Error(`Attachment download failed: ${res.status}`);
  }

  return Buffer.from(await res.arrayBuffer());
}
```

> **Skip to [Section 6](#6-shared-route-handler)** to complete the route handler, then continue to [Section 7](#7-configure-ado-service-hook).

---

## 5. Approach B — OAuth 2.0 with Azure Entra ID

Use this approach when your organisation policy disallows PATs. This uses a **service principal** with the **client credentials** (app-only) OAuth flow — no user login required.

### 5.1 Register an application in Azure Entra ID

1. Sign in to the [Azure portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** → **App registrations** → **New registration**
3. Configure:
   - **Name:** `ado-webhook-service`
   - **Supported account types:** Accounts in this organisational directory only (single tenant)
   - **Redirect URI:** leave blank (not needed for client credentials)
4. Click **Register**
5. On the app overview page, copy and save:
   - **Application (client) ID**
   - **Directory (tenant) ID**

### 5.2 Create a client secret

1. In your app registration, go to **Certificates & secrets**
2. Click **New client secret**
3. Set a description (`webhook-secret`) and expiry (12 or 24 months)
4. Click **Add** and **immediately copy the Value** — it will not be shown again
5. Store it securely (Azure Key Vault in production)

### 5.3 Grant ADO API permissions

1. In your app registration, go to **API permissions** → **Add a permission**
2. Click **APIs my organisation uses**
3. Search for and select **Azure DevOps**
4. Select **Delegated permissions** → tick `user_impersonation`
5. Click **Add permissions**
6. Click **Grant admin consent for {your org}** — this requires Global Administrator or Application Administrator role

> **Note:** Despite the permission being labelled "Delegated", client credentials flow is still app-only. This is an ADO API quirk — `user_impersonation` is the only exposed scope and it works for service principals.

### 5.4 Add the service principal to your ADO organisation

The app registration must be a member of your ADO org:

1. Go to `https://dev.azure.com/{your-org}` → **Organisation Settings** → **Users**
2. Click **Add users**
3. Search for your app registration name (`ado-webhook-service`)
4. Assign access level: **Basic** (minimum required to read work items)
5. Add to the relevant project(s)

### 5.5 Enable OAuth access in ADO org settings

Two policies must be enabled by an ADO Organisation Administrator:

1. Go to **Organisation Settings** → **Security** → **Policies**
2. Enable: **Third-party application access via OAuth**
3. Enable: **Allow public and OAuth access to organisation APIs**

> If either of these is disabled, your service principal will receive `401 Unauthorized` even with a valid token. Confirm with your ADO admin before testing.

### 5.6 Set environment variables

```bash
# Azure Entra ID — service principal credentials
AZURE_TENANT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
AZURE_CLIENT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
AZURE_CLIENT_SECRET=your-client-secret-value

# ADO organisation and project
ADO_ORG=your-org-name
ADO_PROJECT=your-project-name

# Tags that must ALL be present on the work item (comma-separated)
ADO_REQUIRED_TAGS=automation,priority-high

# Shared secret — paste this as the Basic Auth password in the ADO service hook
WEBHOOK_SECRET=generate-a-strong-random-string

# Where to forward the enriched payload
TARGET_ENDPOINT=https://your-service.com/api/ingest
```

### 5.7 Create `lib/ado-auth.ts`

**Option 1 — Manual fetch (no extra dependencies):**

```typescript
// lib/ado-auth.ts (Approach B — OAuth 2.0, manual)

// The ADO resource ID in Azure — this value is fixed across all tenants
const ADO_SCOPE = '499b84ac-1321-427f-aa17-267ca6975798/.default';

interface TokenCache {
  token: string;
  expiresAt: number; // Unix ms
}

// In-memory cache — sufficient for long-running servers
// For serverless (Vercel), see the note below about Vercel KV
let cache: TokenCache | null = null;

export async function getAdoAccessToken(): Promise<string> {
  // Return cached token if still valid, with a 60-second buffer for clock skew
  if (cache && Date.now() < cache.expiresAt - 60_000) {
    return cache.token;
  }

  const tenantId = process.env.AZURE_TENANT_ID!;
  const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;

  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: process.env.AZURE_CLIENT_ID!,
    client_secret: process.env.AZURE_CLIENT_SECRET!,
    scope: ADO_SCOPE,
  });

  const res = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Entra ID token fetch failed: ${res.status} — ${error}`);
  }

  const data = await res.json();

  cache = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  return cache.token;
}

export function getAdoAuthHeader(): Record<string, string> {
  // Synchronous wrapper — call getAdoAccessToken() first
  throw new Error('Call getAdoAccessToken() instead for OAuth approach');
}
```

**Option 2 — Using `@azure/identity` (recommended for production):**

```bash
npm install @azure/identity
```

```typescript
// lib/ado-auth.ts (Approach B — OAuth 2.0, @azure/identity)

import { ClientSecretCredential } from '@azure/identity';

// The ADO resource ID in Azure — fixed across all tenants
const ADO_SCOPE = '499b84ac-1321-427f-aa17-267ca6975798/.default';

// Instantiated once — @azure/identity handles token caching and refresh internally
const credential = new ClientSecretCredential(
  process.env.AZURE_TENANT_ID!,
  process.env.AZURE_CLIENT_ID!,
  process.env.AZURE_CLIENT_SECRET!
);

export async function getAdoAccessToken(): Promise<string> {
  const tokenResponse = await credential.getToken(ADO_SCOPE);
  if (!tokenResponse?.token) {
    throw new Error('Failed to acquire ADO access token from Entra ID');
  }
  return tokenResponse.token;
}
```

> `@azure/identity` handles token caching, automatic refresh, and retry logic. Prefer this in production.

### 5.8 Create `lib/ado.ts`

```typescript
// lib/ado.ts (Approach B — identical shape to Approach A, different auth call)

import { getAdoAccessToken } from './ado-auth';

const ADO_ORG = process.env.ADO_ORG!;
const ADO_PROJECT = process.env.ADO_PROJECT!;
const ADO_BASE = `https://dev.azure.com/${ADO_ORG}/${ADO_PROJECT}/_apis`;

async function adoFetch(path: string) {
  const token = await getAdoAccessToken();
  const res = await fetch(`${ADO_BASE}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error(`ADO API error ${res.status} for path: ${path}`);
  }

  return res.json();
}

export async function fetchWorkItemDetails(id: number) {
  return adoFetch(`/wit/workitems/${id}?$expand=all&api-version=7.1`);
}

export async function fetchWorkItemAttachments(id: number) {
  const data = await adoFetch(`/wit/workitems/${id}/attachments?api-version=7.1`);
  return data.value ?? [];
}

export async function downloadAttachment(url: string): Promise<Buffer> {
  const token = await getAdoAccessToken();
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error(`Attachment download failed: ${res.status}`);
  }

  return Buffer.from(await res.arrayBuffer());
}
```

---

## 6. Shared route handler

This file is **identical for both approaches** — all auth differences are encapsulated in `lib/ado-auth.ts` and `lib/ado.ts`.

### `app/api/ado-webhook/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import {
  fetchWorkItemDetails,
  fetchWorkItemAttachments,
} from '@/lib/ado';

const REQUIRED_TAGS = (process.env.ADO_REQUIRED_TAGS || '')
  .split(',')
  .map((t) => t.trim())
  .filter(Boolean);

const TARGET_ENDPOINT = process.env.TARGET_ENDPOINT!;

export async function POST(req: NextRequest) {
  try {
    // ── 1. Verify shared secret ──────────────────────────────────────
    const authHeader = req.headers.get('authorization');
    const expectedAuth = `Basic ${Buffer.from(`:${process.env.WEBHOOK_SECRET}`).toString('base64')}`;

    if (authHeader !== expectedAuth) {
      console.warn('Webhook: unauthorised request rejected');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ── 2. Parse event body ──────────────────────────────────────────
    const event = await req.json();

    // Ignore non-update events (e.g. pings from ADO on first save)
    if (event.eventType !== 'workitem.updated') {
      return NextResponse.json({ ok: true, skipped: 'not a workitem.updated event' });
    }

    // ── 3. Check state changed to "In Progress" ──────────────────────
    const newState = event?.resource?.fields?.['System.State']?.newValue;

    if (newState !== 'In Progress') {
      return NextResponse.json({ ok: true, skipped: `state is "${newState}"` });
    }

    const workItemId: number = event?.resource?.workItemId;

    if (!workItemId) {
      return NextResponse.json({ error: 'Missing workItemId' }, { status: 400 });
    }

    // ── 4. Fetch full work item (includes all fields and tags) ────────
    const workItem = await fetchWorkItemDetails(workItemId);
    const rawTags: string = workItem.fields['System.Tags'] ?? '';
    const tags = rawTags.split(';').map((t: string) => t.trim()).filter(Boolean);

    // ── 5. Tag filter ────────────────────────────────────────────────
    const hasRequiredTags =
      REQUIRED_TAGS.length === 0 ||
      REQUIRED_TAGS.every((tag) => tags.includes(tag));

    if (!hasRequiredTags) {
      return NextResponse.json({
        ok: true,
        skipped: `tags [${tags.join(', ')}] do not include all required tags [${REQUIRED_TAGS.join(', ')}]`,
      });
    }

    // ── 6. Fetch attachments ─────────────────────────────────────────
    const rawAttachments = await fetchWorkItemAttachments(workItemId);

    // ── 7. Build enriched payload ────────────────────────────────────
    const payload = {
      workItemId,
      title: workItem.fields['System.Title'],
      state: workItem.fields['System.State'],
      type: workItem.fields['System.WorkItemType'],
      assignedTo: workItem.fields['System.AssignedTo']?.displayName ?? null,
      tags,
      description: workItem.fields['System.Description'] ?? null,
      storyPoints: workItem.fields['Microsoft.VSTS.Scheduling.StoryPoints'] ?? null,
      priority: workItem.fields['Microsoft.VSTS.Common.Priority'] ?? null,
      iterationPath: workItem.fields['System.IterationPath'],
      areaPath: workItem.fields['System.AreaPath'],
      createdBy: workItem.fields['System.CreatedBy']?.displayName ?? null,
      createdDate: workItem.fields['System.CreatedDate'],
      changedDate: workItem.fields['System.ChangedDate'],
      url: workItem._links?.html?.href,
      attachments: rawAttachments.map((att: any) => ({
        name: att.attributes?.name,
        url: att.url,        // authenticated download URL — requires ADO auth to access
        size: att.attributes?.resourceSize ?? null,
        comment: att.attributes?.comment ?? null,
      })),
    };

    // ── 8. Forward to target endpoint ────────────────────────────────
    const response = await fetch(TARGET_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const body = await response.text();
      console.error(`Target endpoint responded ${response.status}:`, body);
      return NextResponse.json({ error: 'Target endpoint failed' }, { status: 502 });
    }

    return NextResponse.json({ ok: true, workItemId });

  } catch (err) {
    console.error('Webhook handler error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

### Attachment download option (optional)

If your target endpoint does not have ADO credentials and cannot use the attachment URLs directly, embed the file content as base64 before forwarding. Replace the `attachments` mapping in step 7 above:

```typescript
import { downloadAttachment } from '@/lib/ado';

// Inside the route handler, after fetching rawAttachments:
const attachments = await Promise.all(
  rawAttachments.map(async (att: any) => {
    const buffer = await downloadAttachment(att.url);
    return {
      name: att.attributes?.name,
      contentType: 'application/octet-stream',
      data: buffer.toString('base64'),  // decode with Buffer.from(data, 'base64') on the other end
      size: att.attributes?.resourceSize ?? null,
    };
  })
);
```

> **Warning:** This increases payload size significantly for large files. Only use this if the target endpoint truly cannot authenticate with ADO. For most cases, pass the URL and let the consumer fetch on demand.

---

## 7. Configure ADO service hook

1. In ADO, go to **Project Settings** (bottom-left cog) → **Service hooks**
2. Click **Create subscription** (the `+` button)
3. Select **Web Hooks** → **Next**
4. Configure the trigger:

   | Field | Value |
   |---|---|
   | Trigger on this type of event | Work item updated |
   | Area path | *(optional — scope to your team's area)* |
   | Work item type | User Story |
   | Field | State |
   | Value (new value) | In Progress |

5. Click **Next**, then configure the action:

   | Field | Value |
   |---|---|
   | URL | `https://your-app.com/api/ado-webhook` |
   | HTTP headers | *(leave blank)* |
   | Basic authentication username | *(leave blank)* |
   | Basic authentication password | `<value of WEBHOOK_SECRET from .env.local>` |

6. Click **Test** to send a test payload, then **Finish**

> **Local development:** ADO cannot reach `localhost`. Use [ngrok](https://ngrok.com) or [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/) to expose your local server temporarily during testing.

---

## 8. Testing locally

### 8.1 Expose localhost with ngrok

```bash
# Install ngrok and authenticate, then:
ngrok http 3000
# Copy the https:// forwarding URL — use this as your ADO webhook URL during testing
```

### 8.2 Send a test payload manually

You can simulate an ADO webhook without touching the board using `curl`:

```bash
# Generate the Basic Auth header value
echo -n ":your-webhook-secret" | base64
# → copy the output

curl -X POST https://your-ngrok-url/api/ado-webhook \
  -H "Content-Type: application/json" \
  -H "Authorization: Basic <base64-output-from-above>" \
  -d '{
    "eventType": "workitem.updated",
    "resource": {
      "workItemId": 12345,
      "fields": {
        "System.State": {
          "oldValue": "To Do",
          "newValue": "In Progress"
        }
      }
    }
  }'
```

Replace `12345` with a real work item ID that has your required tags.

### 8.3 Expected responses

| Scenario | HTTP status | Response body |
|---|---|---|
| Wrong or missing secret | 401 | `{ "error": "Unauthorized" }` |
| State is not "In Progress" | 200 | `{ "ok": true, "skipped": "state is ..." }` |
| Tags do not match | 200 | `{ "ok": true, "skipped": "tags do not include ..." }` |
| Success | 200 | `{ "ok": true, "workItemId": 12345 }` |
| ADO API failure | 500 | `{ "error": "Internal server error" }` |
| Target endpoint failure | 502 | `{ "error": "Target endpoint failed" }` |

---

## 9. Deployment checklist

### Environment variables

Ensure all the following are set in your deployment environment (Vercel, Azure App Service, etc.) — **never commit `.env.local` to source control**.

**Approach A:**
- [ ] `ADO_ORG`
- [ ] `ADO_PROJECT`
- [ ] `ADO_PAT`
- [ ] `ADO_REQUIRED_TAGS`
- [ ] `WEBHOOK_SECRET`
- [ ] `TARGET_ENDPOINT`

**Approach B (replace `ADO_PAT` with)::**
- [ ] `AZURE_TENANT_ID`
- [ ] `AZURE_CLIENT_ID`
- [ ] `AZURE_CLIENT_SECRET`

### Vercel-specific notes

- The default serverless function timeout is **10 seconds**. If stories have many large attachments, increase it by adding to your route file:

  ```typescript
  export const maxDuration = 30; // seconds — requires Vercel Pro plan
  ```

- In-memory token caching (Approach B manual) will **not persist across cold starts**. This is generally fine since Entra ID tokens are valid for 3600 seconds and the overhead of re-fetching is minimal. If you need persistent caching, use Vercel KV:

  ```bash
  npm install @vercel/kv
  ```

  ```typescript
  import { kv } from '@vercel/kv';

  export async function getAdoAccessToken(): Promise<string> {
    const cached = await kv.get<string>('ado:token');
    if (cached) return cached;

    // ... fetch token as before ...

    await kv.set('ado:token', data.access_token, { ex: data.expires_in - 60 });
    return data.access_token;
  }
  ```

### Security checklist

- [ ] `WEBHOOK_SECRET` is at least 32 random characters
- [ ] `.env.local` is in `.gitignore`
- [ ] PAT (Approach A) has minimum required scopes — only `Work Items: Read`
- [ ] Client secret (Approach B) is stored in Azure Key Vault for production
- [ ] ADO service hook is HTTPS only — never HTTP
- [ ] Target endpoint validates incoming requests (add a shared secret there too)

---

## 10. Troubleshooting

### `401 Unauthorized` from the webhook route

The `Authorization` header sent by ADO does not match `WEBHOOK_SECRET`. Double-check that the password field in the ADO service hook exactly matches the env var value, with no trailing spaces.

### `401` when calling ADO REST API (Approach A)

- Verify the PAT has not expired
- Check the PAT has `Work Items: Read` scope
- Ensure the PAT is for the correct organisation

### `401` when calling ADO REST API (Approach B)

Work through this checklist in order:

1. Is **"Third-party application access via OAuth"** enabled in ADO org settings?
2. Is **"Allow public and OAuth access to organisation APIs"** enabled?
3. Has admin consent been granted for the `user_impersonation` permission?
4. Is the service principal added as a user in the ADO organisation?
5. Does the service principal have at least **Basic** access level?

### `403 Forbidden` from ADO REST API

The service principal or PAT does not have permission to read the specific project or work item. Check the user's project membership and access level in ADO.

### Tags not matching as expected

ADO stores tags as a semicolon-separated string with spaces: `"tag1; tag2; tag3"`. The route handler splits on `;` and trims whitespace, so your `ADO_REQUIRED_TAGS` values should not include semicolons. Example:

```bash
# Correct
ADO_REQUIRED_TAGS=automation,priority-high

# Wrong — do not use semicolons
ADO_REQUIRED_TAGS=automation;priority-high
```

### Webhook not firing at all

- Confirm the ADO service hook status is **Enabled** (not paused or failing)
- Check the service hook history in ADO — it shows recent delivery attempts and HTTP response codes
- Verify the trigger filters match: work item type must be exactly `User Story` and state filter must match your board's column name exactly

### Payload too large (Approach B with base64 attachments)

If you are embedding attachment binaries and hitting size limits on your target endpoint, switch to forwarding attachment URLs instead and let the consumer fetch them using an ADO token passed in a request header.

---

*Guide version: 1.0 — covers Next.js App Router, ADO REST API v7.1, Azure Entra ID client credentials flow*
