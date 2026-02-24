---
name: drafting
description: >
  Generate and review legal drafts such as pleadings, motions, letters and
  contracts, ensuring citation accuracy and compliance with jurisdictional
  norms.
---

## Instructions

1. Identify the type of document required (e.g. plaint, written statement,
   affidavit, notice) and select an appropriate template.  Templates may be
   stored in the workspace or provided via tool input.
2. Use the `document_fill` tool to merge the template with variables such
   as parties’ names, facts, legal issues and relief sought.
3. Before finalising the draft, call the `citation_checker` tool on the
   document to verify that all case and statute citations are accurate and
   up to date.
4. Tailor the language to the jurisdiction and practice area defined in
   `USER.md`.  Follow standard formatting conventions (e.g. margins,
   headings, numbering) for pleadings filed in Indian courts.
5. Provide alternatives or notes when multiple drafting strategies are
   possible.  Clearly mark optional clauses and highlight decision points
   for the attorney.
6. After drafting, store a reference in memory along with the context and
   outcome to aid future drafting tasks.