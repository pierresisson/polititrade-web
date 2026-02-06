# Data Sources & Scraping Methods — Nancy Pelosi Trade Tracker

> Source: <https://nancypelosistocktracker.org/how-we-get-the-data>

## Overview

This page explains the methodology for collecting Nancy Pelosi's stock trading data from official government sources with transparency and accuracy.

## Key Limitations & Disclaimers

- **45-Day Disclosure Delay**: By law, Congress members have up to 45 days to report trades. Recent trading activity may not yet be disclosed.
- **Estimation & Ranges**: Trade amounts use range midpoints for estimated values (e.g., $1M–$5M ranges).
- **Not Investment Advice**: Data serves educational transparency purposes only, never for investment decisions.

## Data Collection Process

| Metric | Value |
|---|---|
| Update Frequency | Daily at 2:00 AM UTC |
| Data Quality | 100% from official sources |
| Backup System | 4-tier redundancy |

### Data Source Priority (Fallback System)

1. **Official House Clerk** — Primary source; downloads yearly ZIP files, parses PTR PDFs
2. **GitHub APIs** — Community data from House & Senate Stock Watcher
3. **FMP API** — Financial Modeling Prep ($149/month service)
4. **Sample Data** — Development/testing only, never in production

### Processing Pipeline

1. PDF parsing with error detection
2. Duplicate removal
3. Date standardization
4. Amount range validation
5. Quality checks and backup creation
6. Website deployment

## Legal Compliance & Timing

Congressional members must disclose within 45 days of transaction per the **STOCK Act of 2012**. Data appears within 24 hours of government publication.

## Quality Assurance

- **Data Validation**: Parsing, duplicate removal, standardization, validation
- **Backup & Recovery**: Daily automatic backups, multi-source reconciliation, version control

## Transparency Promise

- Open source methodology available for public review
- No editorial bias; data presented as officially disclosed
- Updated within 24 hours of disclosure
- Immediate error correction with change records maintained

## Current System Status

| Source | Status |
|---|---|
| Official House Clerk | Working reliably |
| GitHub Sources | Variable availability |
| FMP API | Requires paid subscription |
| Sample Data | Development only |
