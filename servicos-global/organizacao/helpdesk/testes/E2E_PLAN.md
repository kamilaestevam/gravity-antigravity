# E2E Test Plan - Helpdesk Template

## Overview
This plan outlines the End-to-End (E2E) test scenarios for the Helpdesk template service when integrated into a product. As a product service, Helpdesk operations are isolated to the tenant and product context.

## Scenarios

### 1. Configuration (Admin/Manager)
- **Setup Category:** Admin logs into the product, navigates to Helpdesk Settings, creates a "Billing" category.
- **Setup SLA:** Admin configures an SLA for "Billing" category with HIGH priority (Response: 2h, Resolution: 24h).
- **Setup Template:** Admin creates a standard response template for Refund requests.

### 2. Ticket Creation (User)
- User opens the Helpdesk portal in the product.
- User submits a new ticket selecting the "Billing" category.
- System validates that the SLA is correctly applied behind the scenes based on the category and priority.

### 3. Agent Workflow
- Agent logs in, views the open tickets list.
- Agent opens the new "Billing" ticket, template is available for use.
- Agent changes status to IN_PROGRESS. First response timestamp is successfully tracked.
- Agent changes status to RESOLVED. Resolved timestamp is set and SLA breach calculation is valid.

## Technical Details
- **Tool:** Playwright
- **Integration:** The Helpdesk is a product service, so E2E tests must be run inside a full product environment (e.g., `simulador-comex` or `nf-importacao` staging instances). The tests will mock the UI interactions corresponding to the APIs exposed in `/api/v1/helpdesk`.
