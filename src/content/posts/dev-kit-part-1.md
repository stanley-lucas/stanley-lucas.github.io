---
title: "My AI Dev Kit — Part 1: Building a Personal Claude Code Toolkit"
pubDatetime: 2026-05-25T00:00:00-03:00
description: "How I built stanley-dev-kit — a portable Claude Code setup that installs in seconds and keeps every project consistent."
featured: true
tags:
  - dev-kit
  - claude-code
  - tooling
  - productivity
---

There's a before and after in how I think about software development. The line is somewhere around mid-2025, when it became clear that ignoring AI wasn't a valid stance anymore — not because of hype, but because the productivity gap between developers who use it well and those who don't is widening fast enough to matter.

Fabio Akita put numbers on this in his [Zero to Post-Production in 1 Week](https://akitaonrails.com/en/2026/02/20/zero-to-post-production-in-1-week-using-ai-on-real-projects-behind-the-m-akita-chronicles/) retrospective: 274 commits in 8 days, a complete production system, shipped. Not with magic — with process. He wasn't "vibe coding," he was pair programming with Claude as a partner, staying in charge of architecture and direction while the agent handled the mechanical work. The conclusion he draws isn't that AI is special. It's that AI is a mirror — it amplifies whatever engineering discipline you already have.

That framing changed how I approached the tooling problem.

Because the problem isn't whether to use AI. It's that using it badly is actively worse than not using it at all. Every project I started with Claude Code began the same way: me re-explaining what I care about.

Don't nest more than two levels. Use conventional commits. Don't add abstractions beyond what the task requires. Functions between 4 and 20 lines. Don't `git add -A` blindly.

Every time. New project, same conversation. And even then, Claude would drift — produce something that worked but violated the style I'd spent months refining. Not because it couldn't follow rules. Because the rules weren't written anywhere persistent.

That's the problem I built `stanley-dev-kit` to solve.

## The real pain: code going everywhere

Working with AI on real projects for long enough, you start to notice a specific failure mode. It's not that the agent writes bad code exactly — it's that it writes *inconsistent* code. You ask for a feature, you get something that works, but it doesn't look like anything else in the codebase. Types inferred instead of declared. Error handling done three different ways across three different files. Naming that made sense locally but clashes with the vocabulary you've been building for months.

I call this the "everything everywhere" problem. Each session, Claude arrived without memory of the last one. Each request was an opportunity for the model to make new choices — choices that piled up as inconsistencies, as divergence, as entropy you had to manually fight to contain.

This isn't hypothetical. I've watched a codebase degrade from project to project. Not because of carelessness, but because the cognitive overhead of re-establishing style and context is high, and the path of least resistance is to just let it drift.

Akita documented a version of this in [Zero to Post-Production in 1 Week](https://akitaonrails.com/en/2026/02/20/zero-to-post-production-in-1-week-using-ai-on-real-projects-behind-the-m-akita-chronicles/). His counter-example was a project called FrankMD: no discipline, no process, and the result was a 5,000-line JavaScript file and six emergency refactoring sessions. The fix wasn't to use less AI — it was to pair AI with the engineering discipline that keeps it from running loose.

## Standards as infrastructure

I had a working intuition that the problem was upstream of any individual prompt. The inconsistency wasn't happening because I was asking badly. It was happening because I hadn't codified my standards anywhere the model could find them before the conversation started.

Reading Akita's [Clean Code for AI Agents](https://akitaonrails.com/en/2026/04/20/clean-code-for-ai-agents/) sharpened that intuition into something concrete. His argument is that the primary reader of code has shifted — it's not other developers anymore, it's the LLM itself. That changes which principles matter most: small functions that fit in a single context window, single responsibility so the model can isolate units without loading the whole graph, distinctive names so grep returns one result instead of fifty. And critically: `CLAUDE.md` files with explicit coding rules the agent reads before every iteration.

This isn't "write comments for the AI." It's treat your coding standards as technical infrastructure, not personal preference. If you don't write them down and put them somewhere persistent, you're re-negotiating them every session — and losing ground each time.

The `stanley-dev-kit` is my attempt to make that infrastructure portable, installable, and non-negotiable.

## What it is

A portable Claude Code configuration. A single git repo I can clone and run two scripts to get my entire workflow installed — global standards, slash commands, project templates, and hooks.

It doesn't touch anything it shouldn't. Scripts never overwrite files that already exist. Safe to re-run. No surprises.

## The split that matters

The design came from one insight: some rules are universal, some are project-specific.

Universal rules belong in `~/.claude/CLAUDE.md`. They apply to every project Claude touches on this machine. Formatting conventions, commit structure, test philosophy, what I *never* do — all of it lives there, loaded automatically at session start.

Project-specific context — what the stack is, what the entities are called, where tests live, what commands to run — belongs in the project's own `CLAUDE.md`. That file is generated from a template on first bootstrap and then customized once.

Two files. No duplication. No drift between them.

```
global/                    # → ~/.claude/
  CLAUDE.md                # universal standards (every project)
  commands/
    commit.md              # /commit
    push.md                # /push
    pr.md                  # /pr

templates/                 # → any project via install.sh
  CLAUDE.md                # skeleton to fill in once
  ARCHITECTURE.md          # architecture doc skeleton
  .claude/
    commands/
      start.md             # /start — session start protocol
      context.md           # /context — snapshot of where the project is
      refactor.md          # /refactor — targeted cleanup after a feature
      sync-docs.md         # /sync-docs — update source of truth
      release.md           # /release — version bump + GitHub release
  docs/
    adr/000-template.md    # Architecture Decision Records
    prd/INDEX.md
    prd/TEMPLATE.md
    DECISIONS.md           # quick decision log, read by /context
  experiments/             # disposable spikes — gitignored, never production code
```

## The commands

The slash commands are where the workflow lives.

`/context` is where most sessions actually start now. It reads recent git history, open issues, and the project's reference docs, then produces a single structured block: what was done recently, what's open, and what the next logical step is. Akita solved the same problem with a persistent wiki (`ai-memory`) that indexes decisions across sessions. My version is simpler — a slash command that assembles the picture on demand — but covers the same need: re-orienting without having to reconstruct everything manually.

`/start` comes next. Before writing any code, I run `/start new` or `/start fix issue-42`. It loads the project's CLAUDE.md, checks the current branch, runs `gh issue view` if there's a reference number, and restates the vocabulary for this session. Then it produces a summary: level, context, branch, module, next action. Akita called the `CLAUDE.md` his "living documentation" in the retrospective — the agent referenced it before every interaction, reducing context-switching overhead. `/start` makes that automatic.

`/refactor` closes the loop after a feature lands. Akita had 27 dedicated refactoring commits in his one-week project — not cleanup as an afterthought, but a deliberate practice after each significant change. The command scopes itself to files changed in the current branch, scans for signals (files over 300 lines, duplication, deep nesting, dead code), proposes changes before touching anything, and commits each one atomically. It never mixes refactoring with behavior changes.

The rest are mechanical:

| Command | What it does |
|---------|-------------|
| `/commit` | Lints changed files, stages, generates a conventional commit message |
| `/push` | Pushes to remote, handles upstream setup for new branches |
| `/pr` | Lints, type-checks, pushes, creates the PR via `gh` |
| `/sync-docs` | Updates roadmap and PRD docs after significant work |
| `/release` | Version bump, tag, GitHub release |

All of them operate within the rules defined in the global CLAUDE.md. Consistent across every project without thinking about it.

There's also `experiments/` — a gitignored directory for disposable spikes before committing to an approach. Akita recommends this explicitly: prototype first, extract the useful parts into `src/`, delete the rest. No tests required, no style enforcement, no permanence. It's where you prove out an idea before the codebase has to care about it.

And `DECISIONS.md` — a quick log of non-obvious decisions and their rationale, read by `/context`. Not a formal ADR, just the things that would otherwise live only in your head and disappear between sessions.

## The hooks

Two hooks run automatically.

After any file write, prettier formats the file if it's TypeScript, JS, CSS, or HTML. I don't think about formatting. I don't ask Claude to format. It just happens — wired into `PostToolUse` in settings.json.

When Claude is waiting for input, `terminal-notifier` fires a macOS notification with the message. When it finishes, another one fires. I work in Ghostty and switch contexts often. Not having to watch the shell to know when Claude is done has made a measurable difference.

## The philosophy

I don't have years of team experience to draw from. Most of what I know about working in codebases comes from solo projects, a few collaborative ones, and a lot of reading. So when Akita's [Zero to Post-Production in 1 Week](https://akitaonrails.com/en/2026/02/20/zero-to-post-production-in-1-week-using-ai-on-real-projects-behind-the-m-akita-chronicles/) landed, I didn't recognize the principles from personal scars — I recognized them because they matched the problems I was already running into, just described by someone with the experience to name them properly.

The line I put in the global CLAUDE.md:

> Human decides WHAT and WHY. AI decides HOW.

That's his framing, not something I arrived at independently. I read it, agreed immediately, and codified it — because it described exactly the failure mode I kept hitting. The split maps cleanly to what goes wrong when you don't hold it: the agent starts deciding WHAT, and you end up with a codebase that works but that you didn't choose.

The same goes for TDD as obligation, atomic commits, continuous refactoring, small releases. These aren't conclusions I reached from war stories. They're practices I adopted because someone who shipped a production system in a week with 1,300 tests and no broken commits used them, explained why, and the explanation made sense.

The kit is the operational form of that agreement. Standards codified, loaded at session start, enforced by commands. Not because I invented the standards — because I found ones I could commit to and made them impossible to forget.

## What's next

The kit is brand new. The [Falcon 9 Telemetry Dashboard](https://stanley-lucas.github.io/posts/falcon9-dashboard-part-1/) is where it'll get its first real use — everything from the first feature branch forward.

One thing I haven't tackled yet is persistent cross-session memory — the kind Akita built with [`ai-memory`](https://akitaonrails.com/en/2026/05/24/akita-ai-tips-toolkit-ai-jail-ai-memory-ai-usagebar/), a wiki that captures prompts, tool calls, and decisions across different agent sessions, indexed with SQLite FTS5. `DECISIONS.md` covers some of that ground, but it's manual and text-only. If the problem gets bad enough, I'll wire something up — his repo is open.

For now, the kit does what I needed it to do: I stop re-teaching my standards, Claude stops drifting, and every project starts from the same baseline.
