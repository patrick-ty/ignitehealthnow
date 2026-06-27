# Agent Teams — Master Reference Guide

> Source: https://code.claude.com/docs/en/agent-teams
> Claude Code v2.1.32+

## Overview

Agent teams coordinate multiple Claude Code instances working together. One session acts as the **team lead**, coordinating work, assigning tasks, and synthesizing results. **Teammates** work independently, each in its own context window, and communicate directly with each other.

Unlike subagents (which run within a single session and can only report back to the main agent), you can interact with individual teammates directly without going through the lead.

---

## Enabling Agent Teams

Agent teams are disabled by default. Enable via environment variable in `settings.json` or `settings.local.json`:

```json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  }
}
```

---

## When to Use Agent Teams

### Best Use Cases

| Use Case | Why It Works |
|---|---|
| **Research and review** | Multiple teammates investigate different aspects simultaneously, share and challenge findings |
| **New modules or features** | Teammates each own a separate piece without stepping on each other |
| **Debugging with competing hypotheses** | Teammates test different theories in parallel and converge faster |
| **Cross-layer coordination** | Changes spanning frontend, backend, and tests, each owned by a different teammate |

### When NOT to Use

Agent teams add coordination overhead and use significantly more tokens. Avoid when:

- Tasks are sequential
- Work involves same-file edits
- Tasks have many dependencies
- A single session or subagents would suffice

### Agent Teams vs Subagents

| | Subagents | Agent Teams |
|---|---|---|
| **Context** | Own context window; results return to caller | Own context window; fully independent |
| **Communication** | Report results back to main agent only | Teammates message each other directly |
| **Coordination** | Main agent manages all work | Shared task list with self-coordination |
| **Best for** | Focused tasks where only the result matters | Complex work requiring discussion and collaboration |
| **Token cost** | Lower: results summarized back to main context | Higher: each teammate is a separate Claude instance |

**Rule of thumb:** Use subagents when you need quick, focused workers that report back. Use agent teams when teammates need to share findings, challenge each other, and coordinate on their own.

---

## Architecture

An agent team consists of:

| Component | Role |
|---|---|
| **Team lead** | The main Claude Code session that creates the team, spawns teammates, and coordinates work |
| **Teammates** | Separate Claude Code instances that each work on assigned tasks |
| **Task list** | Shared list of work items that teammates claim and complete |
| **Mailbox** | Messaging system for communication between agents |

### Storage Locations

- **Team config**: `~/.claude/teams/{team-name}/config.json`
- **Task list**: `~/.claude/tasks/{team-name}/`

The team config contains a `members` array with each teammate's name, agent ID, and agent type. Teammates can read this file to discover other team members.

### Task States

Tasks have three states: **pending**, **in progress**, and **completed**. Tasks can also depend on other tasks — a pending task with unresolved dependencies cannot be claimed until those dependencies are completed. Task claiming uses file locking to prevent race conditions.

### Permissions

Teammates start with the lead's permission settings. If the lead runs with `--dangerously-skip-permissions`, all teammates do too. After spawning, you can change individual teammate modes, but you can't set per-teammate modes at spawn time.

### Context and Communication

Each teammate has its own context window. When spawned, a teammate loads the same project context as a regular session (CLAUDE.md, MCP servers, skills) plus the spawn prompt from the lead. **The lead's conversation history does NOT carry over.**

**How teammates share information:**
- **Automatic message delivery**: messages are delivered automatically to recipients
- **Idle notifications**: when a teammate finishes and stops, they automatically notify the lead
- **Shared task list**: all agents can see task status and claim available work

**Messaging types:**
- **message**: send to one specific teammate
- **broadcast**: send to all teammates simultaneously (use sparingly — costs scale with team size)

---

## Display Modes

### In-Process (Default)

All teammates run inside your main terminal.

- **Shift+Down**: cycle through teammates
- **Enter**: view a teammate's session
- **Escape**: interrupt a teammate's current turn
- **Ctrl+T**: toggle the task list
- After the last teammate, Shift+Down wraps back to the lead

Works in any terminal, no extra setup required.

### Split Panes

Each teammate gets its own pane. See everyone's output at once; click into a pane to interact directly.

Requires **tmux** or **iTerm2**.

### Configuration

Default is `"auto"` (uses split panes if already running inside tmux, in-process otherwise).

```json
{
  "teammateMode": "in-process"
}
```

Or per-session via flag:

```bash
claude --teammate-mode in-process
```

### Installing Split Pane Dependencies

- **tmux**: install through your package manager. See [tmux wiki](https://github.com/tmux/tmux/wiki/Installing).
- **iTerm2**: install the [`it2` CLI](https://github.com/mkusaka/it2), then enable Python API in iTerm2 > Settings > General > Magic > Enable Python API.

> **Note:** `tmux` traditionally works best on macOS. Using `tmux -CC` in iTerm2 is the suggested entrypoint.

---

## Starting a Team

Tell Claude to create an agent team and describe the task and team structure in natural language:

```text
I'm designing a CLI tool that helps developers track TODO comments across
their codebase. Create an agent team to explore this from different angles: one
teammate on UX, one on technical architecture, one playing devil's advocate.
```

Claude creates the team, spawns teammates, and coordinates work based on your prompt.

### How Teams Get Started

Two ways:
1. **You request a team**: explicitly ask for one
2. **Claude proposes a team**: Claude suggests it if your task would benefit; you confirm before it proceeds

Claude won't create a team without your approval.

---

## Controlling Your Team

### Specify Teammates and Models

```text
Create a team with 4 teammates to refactor these modules in parallel.
Use Sonnet for each teammate.
```

### Require Plan Approval

For complex or risky tasks, require teammates to plan before implementing:

```text
Spawn an architect teammate to refactor the authentication module.
Require plan approval before they make any changes.
```

**Flow:**
1. Teammate works in read-only plan mode
2. Teammate sends plan approval request to lead
3. Lead reviews and approves or rejects with feedback
4. If rejected, teammate revises and resubmits
5. Once approved, teammate exits plan mode and begins implementation

Influence the lead's judgment with criteria: "only approve plans that include test coverage" or "reject plans that modify the database schema."

### Talk to Teammates Directly

Each teammate is a full, independent Claude Code session.

- **In-process mode**: Shift+Down to cycle, type to message
- **Split-pane mode**: click into a teammate's pane

### Assign and Claim Tasks

- **Lead assigns**: tell the lead which task to give to which teammate
- **Self-claim**: after finishing a task, a teammate picks up the next unassigned, unblocked task

### Shut Down Teammates

```text
Ask the researcher teammate to shut down
```

The lead sends a shutdown request. The teammate can approve (exit gracefully) or reject with an explanation.

### Clean Up the Team

```text
Clean up the team
```

This removes shared team resources. The lead checks for active teammates and fails if any are still running — shut them down first.

> **Always use the lead to clean up.** Teammates should not run cleanup because their team context may not resolve correctly, potentially leaving resources in an inconsistent state.

---

## Quality Gates with Hooks

Use hooks to enforce rules when teammates finish work or tasks complete:

- **`TeammateIdle`**: runs when a teammate is about to go idle. Exit with code 2 to send feedback and keep the teammate working.
- **`TaskCompleted`**: runs when a task is being marked complete. Exit with code 2 to prevent completion and send feedback.

---

## Use Case Examples

### Parallel Code Review

```text
Create an agent team to review PR #142. Spawn three reviewers:
- One focused on security implications
- One checking performance impact
- One validating test coverage
Have them each review and report findings.
```

Each reviewer applies a different filter. The lead synthesizes findings after they finish.

### Competing Hypotheses Debugging

```text
Users report the app exits after one message instead of staying connected.
Spawn 5 agent teammates to investigate different hypotheses. Have them talk to
each other to try to disprove each other's theories, like a scientific
debate. Update the findings doc with whatever consensus emerges.
```

Multiple independent investigators actively trying to disprove each other prevent anchoring bias — the theory that survives is more likely to be the actual root cause.

---

## Best Practices

### 1. Give Teammates Enough Context

Teammates load project context (CLAUDE.md, MCP servers, skills) but **don't inherit the lead's conversation history**. Include task-specific details in the spawn prompt:

```text
Spawn a security reviewer teammate with the prompt: "Review the authentication module
at src/auth/ for security vulnerabilities. Focus on token handling, session
management, and input validation. The app uses JWT tokens stored in
httpOnly cookies. Report any issues with severity ratings."
```

### 2. Choose Appropriate Team Size

- **Token costs scale linearly** with each teammate
- **Coordination overhead increases** with more teammates
- **Diminishing returns** beyond a certain point

**Start with 3-5 teammates** for most workflows.

**Target 5-6 tasks per teammate** for optimal productivity. Example: 15 independent tasks → 3 teammates.

Three focused teammates often outperform five scattered ones.

### 3. Size Tasks Appropriately

| Size | Problem |
|---|---|
| Too small | Coordination overhead exceeds benefit |
| Too large | Teammates work too long without check-ins, increasing risk of wasted effort |
| Just right | Self-contained units with a clear deliverable (a function, a test file, a review) |

> The lead breaks work into tasks automatically. If it isn't creating enough tasks, ask it to split the work into smaller pieces.

### 4. Wait for Teammates to Finish

Sometimes the lead starts implementing tasks itself instead of waiting. If you notice this:

```text
Wait for your teammates to complete their tasks before proceeding
```

### 5. Start with Research and Review

If new to agent teams, start with tasks that have clear boundaries and don't require writing code: reviewing a PR, researching a library, or investigating a bug.

### 6. Avoid File Conflicts

Two teammates editing the same file leads to overwrites. Break work so each teammate owns a different set of files.

### 7. Monitor and Steer

Check in on progress, redirect approaches that aren't working, and synthesize findings as they come in. Letting a team run unattended for too long increases the risk of wasted effort.

---

## Troubleshooting

### Teammates Not Appearing

- In in-process mode, press **Shift+Down** to cycle through active teammates (they may already be running)
- Check that your task was complex enough to warrant a team
- For split panes, verify tmux is installed: `which tmux`
- For iTerm2, verify `it2` CLI is installed and Python API is enabled

### Too Many Permission Prompts

Pre-approve common operations in your permission settings before spawning teammates.

### Teammates Stopping on Errors

Check their output via Shift+Down (in-process) or clicking the pane (split mode), then:
- Give them additional instructions directly
- Spawn a replacement teammate

### Lead Shuts Down Before Work Is Done

Tell the lead to keep going, or tell it to wait for teammates to finish before proceeding.

### Orphaned tmux Sessions

```bash
tmux ls
tmux kill-session -t <session-name>
```

---

## Known Limitations

- **No session resumption with in-process teammates**: `/resume` and `/rewind` do not restore teammates. After resuming, tell the lead to spawn new teammates.
- **Task status can lag**: teammates sometimes fail to mark tasks completed, blocking dependent tasks. Check and update manually if stuck.
- **Shutdown can be slow**: teammates finish their current request/tool call before shutting down.
- **One team per session**: clean up the current team before starting a new one.
- **No nested teams**: teammates cannot spawn their own teams. Only the lead can manage the team.
- **Lead is fixed**: the creating session is the lead for its lifetime. No promotion or transfer.
- **Permissions set at spawn**: all teammates start with lead's permission mode. Can change individually after spawning.
- **Split panes require tmux or iTerm2**: not supported in VS Code integrated terminal, Windows Terminal, or Ghostty.

> **CLAUDE.md works normally**: teammates read CLAUDE.md files from their working directory. Use this to provide project-specific guidance to all teammates.

---

## Related Approaches

| Approach | When to Use |
|---|---|
| **Subagents** | Lightweight delegation for research/verification within a session; no inter-agent coordination needed |
| **Git worktrees** | Manual parallel sessions without automated team coordination |
| **Agent teams** | Complex parallel work requiring discussion, collaboration, and shared task coordination |
