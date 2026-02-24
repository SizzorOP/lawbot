# LawBOT Project

This repository contains the template workspace and skills for the **LawBOT** project.  LawBOT is a litigation intelligence system built on top of the OpenClaw agent framework.  It organises agent workspaces, skills, and memory to support attorneys with research, drafting, case management and ethical compliance.

To set up a new attorney agent, copy the `attorney_template` directory into a new folder (e.g. `attorney_jane_doe`) and customise `USER.md` with the attorney's details.  Each attorney gets an isolated workspace with its own memory and skills.

This template includes:

- `AGENTS.md` – high‑level agent instructions and responsibilities.
- `SOUL.md` – defines the agent's personality and tone.
- `USER.md` – stores attorney‑specific details and jurisdictional limits.
- `MEMORY.md` – curated long‑term memory file.
- `skills/` – a collection of skills that teach the agent how to perform tasks such as research, drafting and case management.

Use this template as the starting point for each attorney agent in your LawBOT deployment.  Make sure to configure API keys and environment variables required by the skills (e.g. `LEGAL_API_TOKEN`) in the agent's environment.