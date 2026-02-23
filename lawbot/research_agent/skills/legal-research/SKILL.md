---
name: legal-research
description: >
  Perform legal research by querying authorised databases and summarising
  results with accurate citations.
requires:
  - LEGAL_API_TOKEN
---

## Instructions

1. When the attorney requests legal research, call the `legal_search` tool
   with the query string and any filters (e.g. court, date range).  The
   `legal_search` tool should query authorised databases (such as Indian
   Kanoon) and return structured results.
2. For each result, provide a brief summary including: case name, court,
   decision date, and a concise description of its relevance.  Include the
   citation (e.g. `AIR 1992 SC 604`) and relevant paragraph numbers for
   reference.
3. If deeper analysis is needed, call the `summarize_doc` tool on the
   judgment text to extract facts, issues, arguments and reasoning.  Use
   the `summarize_case` skill’s instructions for guidance.
4. Only research within the jurisdictions and practice areas authorised in
   `USER.md`.  If a query falls outside these parameters, respond that
   the request is beyond the agent’s scope and suggest alternative
   resources.
5. Store significant findings in memory with citations for future recall.