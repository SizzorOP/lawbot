---
name: summarize_case
description: >
  Summarise legal documents such as judgments, transcripts and contracts
  into structured components: facts, issues, arguments, precedents and
  reasoning.
---

## Instructions

1. Use the `summarize_doc` tool to process the raw text of a judgment or
   other legal document.  Pass the document’s contents and any relevant
   metadata (e.g. court, date, parties).
2. Extract and organise the information into the following sections:
   - **Facts:** Material background facts of the case.
   - **Issues:** Legal questions presented for determination.
   - **Arguments:** Summarise the petitioner’s and respondent’s arguments
     separately.
   - **Precedents:** List cited cases and briefly describe their influence
     on the decision.
   - **Reasoning:** Explain the court’s reasoning, including statutory
     interpretation and application of precedents.
   - **Holding/Disposition:** State the outcome (allowed/dismissed/etc.).
3. Provide pinpoint citations to paragraph or page numbers wherever
   possible.  Ensure citations follow the accepted format in the
   jurisdiction.
4. Store the summarised case in memory for future recall and reference in
   drafting or argument preparation.