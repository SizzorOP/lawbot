---
name: case-management
description: >
  Manage case information, deadlines and court events.  Integrate with
  calendars to schedule and retrieve hearings, filings and reminders.
---

## Instructions

1. Use the calendar tools (`calendar_add` and `calendar_query`) to
   create and retrieve events.  Each calendar entry should include: case
   name, event type (hearing, filing, deadline), date and time, court and
   any relevant notes.
2. Maintain a timeline for each case in memory.  Update the timeline when
   new events are scheduled, orders are received or filings are made.  Use
   the `case_status` tool to fetch status from e‑court websites when
   available.
3. During heartbeat intervals, review upcoming events and send reminders
   to the attorney.  Highlight any approaching deadlines that require
   immediate action.
4. Ensure that calendar events respect the attorney’s timezone specified in
   `USER.md` (Asia/Kolkata by default).  Convert times if necessary.
5. Do not expose sensitive case information in calendar descriptions if
   calendar data is shared beyond the agent’s workspace.