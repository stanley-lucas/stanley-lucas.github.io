---
title: "Falcon 9 Telemetry Dashboard — Part 1: What I'm Building and Why Every Decision Will Be Public"
pubDatetime: 2026-05-23T00:00:00-03:00
description: "The kickoff post: an ETL pipeline, PostgreSQL database, FastAPI backend, and Streamlit dashboard built on top of SpaceX's public launch data — with every architectural decision documented."
featured: true
tags:
  - python
  - postgresql
  - fastapi
  - spacex
  - portfolio
  - falcon9-series
---

SpaceX's public API exposes every Falcon 9 launch since 2006 — flight number,
launchpad, success flag, booster serials, and more. It's free, it's well-documented,
and nobody is stopping you from building something interesting with it.

So I did.

This is the first post in a series where I build a full telemetry dashboard on top of
that data: an ETL pipeline, a PostgreSQL database, a FastAPI backend, and a Streamlit
frontend. Every architecture decision, trade-off, and mistake will be documented here
as I make it.

## Why this project

I'm targeting aerospace and systems engineering roles. A Python-and-pandas portfolio
project needs to do more than run; it needs to demonstrate that you think like an
engineer — that you make deliberate choices, that you know when a simple solution is
right, and that you know when to level up.

Two things make this project different from a typical "I called an API and made a
chart" repo.

**Intentional progression.** The database starts as plain PostgreSQL. I'll measure
where it hurts, then migrate to TimescaleDB in a documented, benchmarked step. I
didn't choose TimescaleDB because it sounds impressive — I'll earn the migration by
proving the baseline is insufficient first.

**Everything is documented publicly.** Every post in this series is a paper trail of
my reasoning. An engineer reading this code on GitHub can follow the git history and
read the corresponding post to understand *why* each decision was made, not just
*what* was done.

## What we're building

```
SpaceX REST API (r-spacex/SpaceX-API v4)
        │
   [Fetcher]        HTTP client with retry logic
        │
   [Transformer]    Pandas — unit normalization, validation, deduplication
        │
   [PostgreSQL]     Raw + processed tables, indexed for dashboard queries
        │
   [FastAPI]        REST API over the processed data
        │
   [Streamlit]      Dashboard consuming FastAPI, rendered in the browser
```

Everything runs in Docker Compose — a single `docker-compose up --build` starts the
database, seeds it with historical data, and serves both the API and the dashboard.

## Stack choices and what I rejected

I spent time on these decisions because this is a portfolio project — the stack is
part of the argument.

| Tool | Why I chose it | What I rejected |
|---|---|---|
| **FastAPI** | Async-first, auto OpenAPI docs, Pydantic validation baked in | Flask (no async or validation), Django (too much for a data API) |
| **PostgreSQL** | Relational integrity, excellent index tooling, TimescaleDB-compatible | MongoDB (can't join across launch/core/pad data cleanly) |
| **TimescaleDB** *(Phase 2)* | Native time-series compression, `time_bucket()` queries | InfluxDB (separate ecosystem), plain PG before it's measured |
| **Pandas** | Industry standard for aerospace data wrangling | Polars (valid, but less recognizable on a resume right now) |
| **Streamlit** | Python-native, fast iteration, zero JavaScript | Dash (overkill), Grafana (not Python) |

A note on TimescaleDB: I deliberately deferred it. The correct engineering answer to
"should I use a specialized time-series database?" is "measure first." Starting with
plain PostgreSQL gives me a baseline. The migration will be a post of its own, with
actual query benchmarks.

## A note on AI-assisted development

I'm using Claude Code throughout this project and want to be transparent about it for
two reasons.

First, honesty: some architectural suggestions in this codebase came from conversations
with an AI assistant, and pretending otherwise would be dishonest and counterproductive.

Second, signal: using AI tools well is itself a skill. The engineers I want to work
with care whether you understood what you built and can defend the choices — not
whether you typed every character. Where Claude suggested an approach I adopted, it's
noted in `ARCHITECTURE.md` with the reasoning. The judgement calls — what to measure,
what to defer, what the data model should look like — are mine.

The repository is public at
[github.com/stanley-lucas/falcon9-telemetry-dashboard](https://github.com/stanley-lucas/falcon9-telemetry-dashboard).
