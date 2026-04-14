# Company Dashboard KPIs & Metrics Framework

| Field        | Value                                           |
|--------------|-------------------------------------------------|
| **Status**   | Draft                                           |
| **Date**     | 2026-04-14                                      |
| **Author**   | Product Spec Writer                             |
| **Scope**    | Internal company control dashboard (AdminDashboard) |

---

## 1. Overview

This document specifies the metrics, KPIs, and OKR framework for the XYZ Empresa internal company control dashboard. The dashboard serves the operations team and leadership to monitor product development progress, business growth, financial health, and operational performance across the four-product aviation SaaS platform (CrewExpense, FlightOps, CrewPortal, AdminDashboard).

The dashboard is the AdminDashboard product described in [ADR-001](architecture/ADR-001-backend-infrastructure.md), accessible to `super_admin` users via VPN/IP-restricted access.

### 1.1 Audiences

| Audience | Primary Needs |
|----------|---------------|
| **CEO / Leadership** | Revenue trends, customer growth, OKR progress, burn rate |
| **Product Manager** | Feature adoption, product-level engagement, development velocity |
| **Operations Lead** | Platform uptime, support volume, tenant health |
| **Finance** | MRR, churn, ARPU, expense tracking |

### 1.2 Design Principles

- Every metric has a single source of truth, an owner, and a defined update cadence.
- Alert thresholds exist for all critical metrics so the team is notified before problems escalate.
- Dashboard is read-only; no write operations from the dashboard UI.
- All monetary values displayed in the platform base currency (USD) with the original currency shown in detail views.

---

## 2. Dashboard Sections

The dashboard is organized into two levels and five sections.

```
┌─────────────────────────────────────────────────────────────────────┐
│                    COMPANY-LEVEL DASHBOARD                          │
│  ┌─────────────────┐  ┌─────────────────┐  ┌────────────────────┐  │
│  │  2.1 Growth &   │  │  2.2 Financial  │  │  2.3 Operational   │  │
│  │  Customer       │  │  Health         │  │  Health            │  │
│  │  Metrics        │  │                 │  │                    │  │
│  └─────────────────┘  └─────────────────┘  └────────────────────┘  │
├─────────────────────────────────────────────────────────────────────┤
│                    PRODUCT-LEVEL DASHBOARD                          │
│  ┌─────────────────────────────────┐  ┌──────────────────────────┐ │
│  │  2.4 Product Engagement &       │  │  2.5 Development         │ │
│  │  Adoption (per product)         │  │  Progress                │ │
│  └─────────────────────────────────┘  └──────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────┤
│                    OKR TRACKING (Section 4)                         │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 3. KPI Definitions

### 3.1 Growth & Customer Metrics (Company Level)

#### KPI-01: Monthly Recurring Revenue (MRR)

| Attribute | Value |
|-----------|-------|
| **Definition** | Sum of all active tenant subscription fees for the current calendar month, normalized to USD. |
| **Formula** | `SUM(plans.price) for all tenants WHERE tenants.status = 'active'` |
| **Data Source** | `billing` module → `subscriptions` table joined with `plans` table |
| **Owner** | Finance Lead |
| **Update Frequency** | Real-time (recalculated on each subscription change); displayed as daily snapshot |
| **Visualization** | Line chart (trailing 12 months) with numeric current-value card |
| **Benchmark** | 15% month-over-month growth in first year of operation |
| **Alert Threshold** | MRR declines >5% vs. previous month → alert to Finance Lead and CEO |

#### KPI-02: Active Tenants

| Attribute | Value |
|-----------|-------|
| **Definition** | Count of tenants with `status = 'active'` that have had at least one API request in the trailing 30 days. |
| **Formula** | `COUNT(DISTINCT tenant_id) FROM audit_logs WHERE created_at >= NOW() - INTERVAL '30 days'` cross-referenced with `tenants WHERE status = 'active'` |
| **Data Source** | `tenants` table + `audit_logs` table |
| **Owner** | Operations Lead |
| **Update Frequency** | Daily (batch calculation at 02:00 UTC) |
| **Visualization** | Numeric card with trend arrow (vs. previous period) + stacked bar chart showing tenant count by plan tier |
| **Benchmark** | 10% month-over-month net new tenants in first year |
| **Alert Threshold** | Active tenants drops >10% week-over-week → alert to Operations Lead |

#### KPI-03: Customer Churn Rate

| Attribute | Value |
|-----------|-------|
| **Definition** | Percentage of tenants that moved to `status = 'suspended'` or `status = 'cancelled'` during a calendar month, relative to the tenant count at the start of that month. |
| **Formula** | `(churned_tenants_in_month / tenants_active_at_month_start) × 100` |
| **Data Source** | `tenants` table (status change history tracked via `audit_logs`) |
| **Owner** | CEO |
| **Update Frequency** | Monthly (calculated on 1st of each month for the prior month) |
| **Visualization** | Line chart (trailing 12 months) with numeric card showing current month's rate |
| **Benchmark** | < 5% monthly churn |
| **Alert Threshold** | Churn rate exceeds 5% in any month → alert to CEO and Operations Lead |

#### KPI-04: Average Revenue Per User (ARPU)

| Attribute | Value |
|-----------|-------|
| **Definition** | MRR divided by total active tenant count. Measures revenue efficiency per customer. |
| **Formula** | `MRR / COUNT(tenants WHERE status = 'active')` |
| **Data Source** | Derived from KPI-01 (MRR) and KPI-02 (Active Tenants) |
| **Owner** | Finance Lead |
| **Update Frequency** | Monthly |
| **Visualization** | Line chart (trailing 12 months) with numeric card |
| **Benchmark** | ARPU ≥ plan midpoint price (target increases over time with upsells) |
| **Alert Threshold** | ARPU declines >10% month-over-month → alert to Finance Lead |

### 3.2 Financial Health Metrics (Company Level)

#### KPI-05: Net Revenue Retention (NRR)

| Attribute | Value |
|-----------|-------|
| **Definition** | Revenue from existing tenants at end of period (including expansions and contractions) divided by revenue from same cohort at start of period. Values >100% indicate expansion outpaces churn. |
| **Formula** | `(MRR_end − new_tenant_MRR) / MRR_start × 100` |
| **Data Source** | `billing` module → `subscriptions` table with historical snapshots |
| **Owner** | Finance Lead |
| **Update Frequency** | Monthly (calculated on 1st of each month) |
| **Visualization** | Line chart (trailing 12 months) with numeric card and 100% reference line |
| **Benchmark** | ≥ 100% (net positive retention) |
| **Alert Threshold** | NRR drops below 95% → alert to CEO and Finance Lead |

#### KPI-06: Runway (Months of Cash Remaining)

| Attribute | Value |
|-----------|-------|
| **Definition** | Current cash balance divided by average monthly burn rate (trailing 3 months). |
| **Formula** | `cash_balance / avg_monthly_burn_rate_3m` |
| **Data Source** | External accounting system (manual CSV upload or API integration). Cash balance and burn rate imported monthly. |
| **Owner** | Finance Lead |
| **Update Frequency** | Monthly (manual entry or sync after month-end close) |
| **Visualization** | Numeric card (months remaining) with color indicator: green (>12mo), yellow (6–12mo), red (<6mo) |
| **Benchmark** | ≥ 18 months runway |
| **Alert Threshold** | Runway < 12 months → yellow alert to CEO. Runway < 6 months → red alert to CEO and board. |

### 3.3 Operational Health Metrics (Company Level)

#### KPI-07: Platform Uptime

| Attribute | Value |
|-----------|-------|
| **Definition** | Percentage of time the API is available and responding within SLA (p95 < 200ms) during a calendar month. |
| **Formula** | `(total_minutes_in_month − downtime_minutes) / total_minutes_in_month × 100` |
| **Data Source** | External monitoring service (e.g., UptimeRobot, Datadog, or CloudWatch). Health check endpoint: `GET /api/v1/health`. |
| **Owner** | Tech Lead |
| **Update Frequency** | Real-time (1-minute health checks); monthly aggregate displayed |
| **Visualization** | Numeric percentage card with status dot (green/yellow/red) + 90-day uptime timeline bar |
| **Benchmark** | ≥ 99.9% monthly uptime (≤ 43 minutes downtime/month) |
| **Alert Threshold** | Any downtime event > 5 minutes → immediate alert to Tech Lead. Monthly uptime < 99.5% → alert to CEO. |

#### KPI-08: API Response Time (p95)

| Attribute | Value |
|-----------|-------|
| **Definition** | 95th percentile response time across all API endpoints during the measurement period. |
| **Formula** | `PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY response_time_ms)` from request logs |
| **Data Source** | Application performance monitoring (APM) or NestJS request logging middleware |
| **Owner** | Tech Lead |
| **Update Frequency** | Real-time (rolling 5-minute window); daily aggregate for trend |
| **Visualization** | Line chart (trailing 30 days, daily p95) with numeric current-value card. Overlay: 200ms target line. |
| **Benchmark** | < 200ms (per ADR-001 §4.2) |
| **Alert Threshold** | p95 > 500ms for 10 consecutive minutes → alert to Tech Lead. p95 > 200ms sustained for 1 hour → warning to Tech Lead. |

#### KPI-09: Support Ticket Volume & Resolution Time

| Attribute | Value |
|-----------|-------|
| **Definition** | (a) Count of new support tickets opened per week. (b) Median time from ticket creation to resolution. |
| **Formula** | (a) `COUNT(tickets) WHERE created_at IN current_week` (b) `MEDIAN(resolved_at − created_at)` for tickets resolved in period |
| **Data Source** | Support/helpdesk system (e.g., Zendesk, Linear, or internal ticketing). Integrated via API or manual sync. |
| **Owner** | Operations Lead |
| **Update Frequency** | Daily |
| **Visualization** | (a) Bar chart (weekly volume, trailing 12 weeks) (b) Numeric card (median resolution hours) with trend arrow |
| **Benchmark** | (a) < 20 tickets/week per 100 active tenants. (b) Median resolution < 24 hours. |
| **Alert Threshold** | (a) Weekly volume spikes >50% vs. 4-week average → alert to Operations Lead. (b) Median resolution exceeds 48 hours → alert to Operations Lead. |

### 3.4 Product Engagement & Adoption Metrics (Product Level)

These metrics are displayed per product with a product selector (CrewExpense, FlightOps, CrewPortal).

#### KPI-10: Daily Active Users (DAU) per Product

| Attribute | Value |
|-----------|-------|
| **Definition** | Count of distinct users who made at least one authenticated API request to a specific product module in the trailing 24 hours. |
| **Formula** | `COUNT(DISTINCT user_id) FROM audit_logs WHERE entity_type IN (<product_entities>) AND created_at >= NOW() - INTERVAL '24 hours'` |
| **Data Source** | `audit_logs` table, filtered by entity_type: CrewExpense = `expense, category, receipt`; FlightOps = `flight, aircraft, route`; CrewPortal = `schedule, qualification, document, leave_request` |
| **Owner** | Product Manager |
| **Update Frequency** | Real-time (recalculated every 15 minutes) |
| **Visualization** | Line chart (trailing 30 days) per product, with product comparison toggle. Numeric cards showing today's DAU per product. |
| **Benchmark** | DAU/MAU ratio (stickiness) ≥ 30% per product |
| **Alert Threshold** | DAU drops >30% day-over-day for any product (excluding weekends) → alert to Product Manager |

#### KPI-11: Feature Adoption Rate

| Attribute | Value |
|-----------|-------|
| **Definition** | Percentage of active tenants that have used a specific feature at least once in the trailing 30 days. Tracked per key feature. |
| **Key Features Tracked** | CrewExpense: receipt upload, CSV export, multi-currency. FlightOps: flight scheduling, aircraft assignment. CrewPortal: leave requests, qualification upload. |
| **Formula** | `COUNT(DISTINCT tenant_id WHERE feature_used) / COUNT(active_tenants) × 100` |
| **Data Source** | `audit_logs` table filtered by action and entity_type per feature |
| **Owner** | Product Manager |
| **Update Frequency** | Weekly (calculated Mondays at 03:00 UTC) |
| **Visualization** | Horizontal bar chart per product showing adoption % for each tracked feature. Heatmap showing adoption by tenant. |
| **Benchmark** | Core features (expense creation, flight scheduling): ≥ 80% adoption. Secondary features (CSV export, multi-currency): ≥ 40% adoption. |
| **Alert Threshold** | Any core feature adoption drops below 60% → alert to Product Manager |

#### KPI-12: Tenant Health Score

| Attribute | Value |
|-----------|-------|
| **Definition** | Composite score (0–100) per tenant reflecting engagement, adoption, and growth signals. Used to predict churn risk. |
| **Formula** | Weighted average: `(DAU_ratio × 0.3) + (feature_adoption × 0.25) + (seat_utilization × 0.2) + (support_sentiment × 0.15) + (billing_health × 0.1)` |
| **Components** | **DAU ratio**: tenant DAU / tenant total users. **Feature adoption**: % of tracked features used. **Seat utilization**: active users / licensed seats. **Support sentiment**: inverse of ticket frequency. **Billing health**: 1.0 if current, 0.5 if overdue <30d, 0.0 if overdue >30d. |
| **Data Source** | Aggregated from `audit_logs`, `users`, `subscriptions`, and support system |
| **Owner** | Operations Lead |
| **Update Frequency** | Weekly (calculated Mondays at 04:00 UTC) |
| **Visualization** | Sortable tenant list with health score bar (color-coded: green ≥70, yellow 40–69, red <40). Drill-down to component scores per tenant. |
| **Benchmark** | ≥ 80% of tenants in green zone (score ≥ 70) |
| **Alert Threshold** | Any tenant's score drops below 40 → alert to Operations Lead for proactive outreach. More than 20% of tenants in red zone → alert to CEO. |

### 3.5 Development Progress Metrics (Product Level)

#### KPI-13: Sprint Velocity

| Attribute | Value |
|-----------|-------|
| **Definition** | Total story points completed per sprint (2-week cycle) by the engineering team. |
| **Formula** | `SUM(story_points) WHERE status = 'done' AND sprint = current_sprint` |
| **Data Source** | Project management tool (Linear, Jira, or GitHub Projects). Synced via API. |
| **Owner** | Tech Lead |
| **Update Frequency** | Per sprint (every 2 weeks) |
| **Visualization** | Bar chart (trailing 6 sprints) with rolling average line. Burndown chart for current sprint. |
| **Benchmark** | Velocity within ±20% of 6-sprint rolling average |
| **Alert Threshold** | Velocity drops >30% vs. rolling average for 2 consecutive sprints → flag to Product Manager and Tech Lead |

#### KPI-14: Bug Density (Open Bugs per Product Module)

| Attribute | Value |
|-----------|-------|
| **Definition** | Count of open bugs categorized by severity (High, Medium, Low) per product module. |
| **Formula** | `COUNT(issues WHERE type = 'bug' AND status != 'closed') GROUP BY product_module, severity` |
| **Data Source** | Issue tracker (Linear, Jira, or GitHub Issues). Synced via API. |
| **Owner** | Tech Lead |
| **Update Frequency** | Daily |
| **Visualization** | Stacked bar chart per product module (color by severity). Numeric card showing total open bugs with severity breakdown. |
| **Benchmark** | Zero open High-severity bugs. ≤ 5 open Medium-severity bugs per module. |
| **Alert Threshold** | Any High-severity bug open > 48 hours → alert to Tech Lead. Total open bugs per module exceeds 15 → alert to Product Manager. |

#### KPI-15: Deployment Frequency

| Attribute | Value |
|-----------|-------|
| **Definition** | Number of production deployments completed per week. |
| **Formula** | `COUNT(deployments) WHERE environment = 'production' AND completed_at IN current_week` |
| **Data Source** | CI/CD system (GitHub Actions). Deployment events from `deploy.yml` workflow runs. |
| **Owner** | Tech Lead |
| **Update Frequency** | Real-time (event-driven from CI/CD webhook) |
| **Visualization** | Bar chart (weekly, trailing 12 weeks). Numeric card showing current week count. |
| **Benchmark** | ≥ 2 deployments per week (continuous delivery target) |
| **Alert Threshold** | Zero deployments in a calendar week → flag to Tech Lead. Failed deployment rate > 20% → alert to Tech Lead. |

---

## 4. OKR Framework

### 4.1 Structure

OKRs are tracked quarterly. Each Objective has 2–5 Key Results. Key Results must be measurable and map to one or more KPIs defined in Section 3.

```
┌──────────────────────────────────────────────────────┐
│                  QUARTERLY OKR CYCLE                  │
│                                                      │
│  ┌──────────────────────────────────────────────┐    │
│  │  Objective                                    │    │
│  │  ├── Key Result 1  ──→  linked KPI(s)        │    │
│  │  ├── Key Result 2  ──→  linked KPI(s)        │    │
│  │  └── Key Result 3  ──→  linked KPI(s)        │    │
│  │                                               │    │
│  │  Progress: 0%─────────────────────────100%    │    │
│  │  Status: On Track / At Risk / Off Track       │    │
│  └──────────────────────────────────────────────┘    │
│                                                      │
│  Owner: One person per Objective                     │
│  Review cadence: Weekly check-in, monthly scoring    │
│  Grading: 0.0–1.0 scale (0.7 = success)             │
└──────────────────────────────────────────────────────┘
```

### 4.2 OKR Data Model

Each OKR is stored with the following fields:

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Unique identifier |
| `quarter` | String | e.g., `2026-Q2` |
| `level` | Enum | `company` or `product` |
| `product` | String (nullable) | Product name if `level = product`; null if `level = company` |
| `objective` | Text | Qualitative objective statement |
| `owner` | String | Person or team responsible |
| `status` | Enum | `on_track`, `at_risk`, `off_track`, `completed` |
| `key_results` | Array | List of key results (see below) |

Each Key Result:

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Unique identifier |
| `description` | Text | Measurable statement |
| `metric_type` | Enum | `number`, `percentage`, `currency`, `boolean` |
| `start_value` | Decimal | Baseline at quarter start |
| `target_value` | Decimal | Target at quarter end |
| `current_value` | Decimal | Latest measured value |
| `linked_kpis` | Array[String] | References to KPI IDs (e.g., `KPI-01`) |
| `progress` | Decimal | `(current_value − start_value) / (target_value − start_value)`, clamped 0.0–1.0 |
| `updated_at` | Timestamp | Last time `current_value` was refreshed |

### 4.3 Example OKRs (Q2 2026)

#### Company-Level Objectives

**Objective 1: Accelerate revenue growth and establish market traction**
- Owner: CEO
- Status: On Track

| # | Key Result | Type | Start | Target | Linked KPIs |
|---|-----------|------|-------|--------|-------------|
| 1 | Increase MRR from $15,000 to $40,000 | Currency | $15,000 | $40,000 | KPI-01 |
| 2 | Grow active tenants from 12 to 35 | Number | 12 | 35 | KPI-02 |
| 3 | Keep monthly churn rate below 5% | Percentage | 3% | <5% | KPI-03 |
| 4 | Achieve NRR ≥ 105% | Percentage | 98% | 105% | KPI-05 |

**Objective 2: Deliver a reliable and performant platform**
- Owner: Tech Lead
- Status: On Track

| # | Key Result | Type | Start | Target | Linked KPIs |
|---|-----------|------|-------|--------|-------------|
| 1 | Maintain 99.9% platform uptime | Percentage | 99.7% | 99.9% | KPI-07 |
| 2 | Reduce API p95 response time to < 150ms | Number (ms) | 210 | 150 | KPI-08 |
| 3 | Achieve ≥ 3 production deployments per week | Number | 1.5 | 3 | KPI-15 |
| 4 | Zero High-severity bugs open > 48 hours | Number | 2 | 0 | KPI-14 |

#### Product-Level Objectives

**Objective 3: Drive CrewExpense to product-market fit**
- Owner: Product Manager
- Product: CrewExpense

| # | Key Result | Type | Start | Target | Linked KPIs |
|---|-----------|------|-------|--------|-------------|
| 1 | Reach 200 DAU across all CrewExpense tenants | Number | 45 | 200 | KPI-10 |
| 2 | Receipt upload adoption ≥ 70% of active tenants | Percentage | 35% | 70% | KPI-11 |
| 3 | CSV export adoption ≥ 50% of active tenants | Percentage | 20% | 50% | KPI-11 |
| 4 | DAU/MAU stickiness ratio ≥ 35% | Percentage | 22% | 35% | KPI-10 |

**Objective 4: Launch FlightOps MVP and validate with early adopters**
- Owner: Product Manager
- Product: FlightOps

| # | Key Result | Type | Start | Target | Linked KPIs |
|---|-----------|------|-------|--------|-------------|
| 1 | Onboard 10 tenants to FlightOps module | Number | 0 | 10 | KPI-02 |
| 2 | Flight scheduling feature adoption ≥ 60% among FlightOps tenants | Percentage | 0% | 60% | KPI-11 |
| 3 | Tenant health score ≥ 70 for 80% of FlightOps tenants | Percentage | 0% | 80% | KPI-12 |

### 4.4 OKR Dashboard Visualization

| Element | Specification |
|---------|---------------|
| **Quarterly view** | Dropdown selector for quarter. Default: current quarter. |
| **Objective cards** | One card per objective showing: title, owner, overall progress bar (average of KR progress), status badge (On Track / At Risk / Off Track). |
| **Key Result rows** | Within each objective card: one row per KR showing description, progress bar, current vs. target, linked KPI sparkline. |
| **Filtering** | Filter by: level (company/product), product, owner, status. |
| **Historical view** | Toggle to view past quarters' final grades side by side. |
| **Color coding** | Progress ≥ 70%: green. 40–69%: yellow. < 40%: red. |

### 4.5 OKR Workflow

| Step | Timing | Action |
|------|--------|--------|
| **Set OKRs** | First week of quarter | CEO and Product Manager define objectives and key results. Enter into dashboard. |
| **Weekly check-in** | Every Monday | Owners update `current_value` for each KR. Auto-calculated KRs refresh from linked KPIs. |
| **Monthly scoring** | First Monday of each month | Team reviews OKR progress. Status updated (On Track / At Risk / Off Track). |
| **Quarter close** | Last week of quarter | Final values locked. Grades calculated (0.0–1.0). Retrospective notes added. |

---

## 5. Alert System

### 5.1 Alert Configuration

All alerts defined in Section 3 are implemented via the AdminDashboard notification system. Alerts are dispatched through two channels:

| Channel | Use Case |
|---------|----------|
| **In-app notification** | All alerts appear in the AdminDashboard notification panel |
| **Email** | Critical (red) alerts are sent via the Notification module (BullMQ email job) |

### 5.2 Alert Severity Levels

| Level | Trigger | Response |
|-------|---------|----------|
| **Critical (Red)** | Metric breaches a threshold that impacts revenue, security, or availability (e.g., uptime < 99.5%, runway < 6 months, NRR < 95%) | Immediate email to owner + CEO. Dashboard banner. |
| **Warning (Yellow)** | Metric trending toward a threshold or minor breach (e.g., p95 > 200ms for 1 hour, churn > 5%, velocity drop) | In-app notification to owner. Dashboard badge. |
| **Info (Blue)** | Notable change that is not actionable but worth awareness (e.g., new tenant onboarded, deployment completed) | In-app notification only. |

### 5.3 Consolidated Alert Threshold Reference

| KPI | Warning Threshold | Critical Threshold | Alert Recipients |
|-----|-------------------|-------------------|------------------|
| KPI-01: MRR | MRR growth < 5% MoM | MRR decline > 5% MoM | Finance Lead, CEO |
| KPI-02: Active Tenants | Growth < 5% MoM | Drop > 10% WoW | Operations Lead |
| KPI-03: Churn Rate | Churn > 4% monthly | Churn > 5% monthly | CEO, Operations Lead |
| KPI-04: ARPU | Decline > 5% MoM | Decline > 10% MoM | Finance Lead |
| KPI-05: NRR | NRR < 100% | NRR < 95% | CEO, Finance Lead |
| KPI-06: Runway | < 12 months | < 6 months | CEO, Board |
| KPI-07: Uptime | Monthly < 99.9% | Monthly < 99.5% or outage > 5 min | Tech Lead, CEO |
| KPI-08: API p95 | > 200ms sustained 1 hour | > 500ms for 10 min | Tech Lead |
| KPI-09: Support Tickets | Volume spike > 30% vs 4-week avg | Volume spike > 50% or resolution > 48h | Operations Lead |
| KPI-10: DAU | DAU drop > 20% DoD (weekday) | DAU drop > 30% DoD (weekday) | Product Manager |
| KPI-11: Feature Adoption | Core feature < 70% | Core feature < 60% | Product Manager |
| KPI-12: Tenant Health | > 10% tenants in red zone | > 20% tenants in red zone | Operations Lead, CEO |
| KPI-13: Velocity | Drop > 20% vs rolling avg | Drop > 30% for 2 consecutive sprints | Tech Lead, Product Manager |
| KPI-14: Bug Density | > 10 open bugs per module | High-severity bug open > 48h | Tech Lead |
| KPI-15: Deployment Freq | < 2 deployments/week | Zero deployments in a week | Tech Lead |

---

## 6. Data Sources & Integration

| Source | Integration Method | Data Provided | Refresh |
|--------|--------------------|---------------|---------|
| **PostgreSQL (platform DB)** | Direct query via Prisma (same monolith) | Tenants, users, subscriptions, plans, audit_logs | Real-time |
| **Redis** | Direct connection (same infra) | Session counts, cache hit rates | Real-time |
| **CI/CD (GitHub Actions)** | GitHub API or webhook | Deployment events, workflow runs | Event-driven |
| **APM / Monitoring** | API integration (Datadog, CloudWatch, or UptimeRobot) | Uptime, response times, error rates | 1-minute intervals |
| **Issue Tracker** | API integration (Linear, Jira, or GitHub Issues) | Bug counts, sprint velocity, story points | Hourly sync |
| **Support System** | API integration (Zendesk or similar) | Ticket volume, resolution times | Hourly sync |
| **Accounting System** | CSV upload or API (QuickBooks, Xero) | Cash balance, burn rate | Monthly |

---

## 7. Out of Scope

The following are explicitly not covered by this spec:

- **Customer-facing analytics**: Tenant-visible dashboards showing their own usage data. This is a separate feature.
- **Real-time alerting infrastructure**: This spec defines what to alert on; the alerting pipeline implementation (webhook delivery, retry, escalation) is an engineering concern.
- **Dashboard UI design**: Wireframes, color palettes, and component library selection are design team decisions.
- **Data warehouse / ETL**: If reporting queries become too heavy for the production database, a read replica or data warehouse strategy is an engineering decision per ADR-001 §4.4.
- **Per-user metrics within a tenant**: The dashboard tracks tenant-level and platform-level metrics, not individual user behavior within a tenant.

---

## 8. Open Questions

| # | Question | Decision Needed By |
|---|----------|--------------------|
| 1 | Should OKR data be stored in the platform PostgreSQL database or in a separate tool (e.g., Lattice, Weekdone)? If in-database, the data model in §4.2 applies. If external, the dashboard needs an API integration. | Product Manager + Tech Lead |
| 2 | Which APM / monitoring tool will be used for KPI-07 and KPI-08? The choice affects the data source integration. Candidates: Datadog, AWS CloudWatch, self-hosted Prometheus+Grafana. | Tech Lead |
| 3 | For KPI-06 (Runway), should we integrate with an accounting API (QuickBooks/Xero) or accept monthly CSV upload as the initial implementation? | Finance Lead |
| 4 | What is the retention policy for dashboard metric history? Suggestion: raw data 90 days, daily aggregates 2 years, monthly aggregates indefinitely. | Tech Lead + Operations Lead |
| 5 | Should support ticket data (KPI-09) be pulled from a dedicated helpdesk tool, or should we build a lightweight internal ticketing module? | Operations Lead |
