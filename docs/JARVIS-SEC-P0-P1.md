# JARVIS-SEC P0 / P1 Implementation Plan

## P0 — trust and production foundation

- OIDC/OAuth identity integration
- short-lived sessions and revocation
- server-side RBAC
- organization/tenant isolation
- append-only audit events
- secret-manager integration
- request correlation IDs
- structured logging
- health/readiness checks
- error boundaries and failure states
- backup/restore runbook

## P1 — revenue operations

- lead/company/contact records
- opportunities and stages
- ownership and activity history
- import/export
- duplicate detection
- enrichment adapters
- provenance and confidence for enriched fields
- lead scoring and qualification
- campaign creation/scheduling
- approval queue
- campaign analytics
- global search
- notifications
- command center layouts
- AI Copilot read-only analytics first, then permissioned actions

## Acceptance criteria

A new user must be able to sign in, enter an organization workspace, create/import a lead, inspect provenance and score, create an opportunity, create a campaign, review an AI-generated action, approve/reject it, see the resulting activity, search for the lead, and see the mutation in the audit log.

The demo implementation must never be mistaken for production persistence. Browser mock data is a development/demo mode only and must be replaced with API-backed repositories before marketplace release.
