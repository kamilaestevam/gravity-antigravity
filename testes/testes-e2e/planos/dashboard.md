# E2E Test Plan - Dashboard Service

## 1. URL Start
- Navigate to `/dashboard` (or equivalent URL routed via Shell) after successful login as a Tenant User.

## 2. Setup Prerequisites
- Valid User belonging to a valid Tenant.
- Prisma seed script should have seeded at least 2 default `MetricaSnapshot` records for this `tenant_id` to ensure initial data exists.
- Redis/Mocked Memory Cache must be cleared prior to test start.

## 3. Test Data
- `tenant_id`: `test-tenant-123`
- Metrics: "Total Revenue": 50000, "Active Subscriptions": 140

## 4. User Context
- User acts as an Admin Viewer trying to evaluate overall business health. 

## 5. Happy Path Flow
1. User logs in and arrives at the home layout.
2. User clicks on "Dashboard" in the Sidebar.
3. System loads `Dashboard.tsx` lazy component.
4. Client sends `GET /api/v1/dashboard/kpis?tenant_id=x`.
5. Initially loads Skeleton/Pulse loading UI for `KPICards`.
6. API responds with `source: 'db'` and KPI JSON data.
7. Cards render correctly with values and titles (e.g. Total Revenue: 50000).
8. Table below (`TabelaGlobal`) populates with matched details.

## 6. Edge Cases
- **Empty State**: Load dashboard for a new Tenant with 0 `MetricaSnapshot`.
  - Expectation: Shows "No KPIS available for this context" gracefully without throwing UI exceptions.
- **Cache Hit Test**: Refresh the page within < 5 minutes.
  - Expectation: Request takes < 50ms, response payload contains `source: 'cache'`, data matches perfectly.

## 7. Security Flow
- Attempt to fetch `/api/v1/dashboard/kpis` without a `tenant_id` query param or invalid internal token.
- **Expectation**: Receives 400 Bad Request (handled by Zod/AppError) or 401 Unauthorized via the proxy.

## 8. Visual/UI Logic
- Hover over a `KPICard`.
- **Validation**: Ensure it elevates using `-translate-y-2` (implemented inline as transform) and gains box-shadow based on interaction variables defined in the Design System.
- Trend arrows (`up`, `down`) should display correct thematic colors (Green vs Red).

## 9. Error Scenarios
- **Backend Down**: Simulate 500 error from backend or network timeout.
- **Validation**: The `Dashboard.tsx` component should catch the error and render `<div className="error">Dashboard Error</div>` locally, not crashing the entire Shell.

## 10. Expected Outcome
The Dashboard efficiently routes KPI requests, caches expensive db aggregations for 5 minutes, and presents unified metrics flawlessly while upholding tenant isolation policies.

## 11. Cleanup Strategy
- In E2E Post-test, simply delete created `MetricaSnapshot` fixtures for `test-tenant-123`.
- In-memory cache naturally expires or resets with the node process shutdown.
