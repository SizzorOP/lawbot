# Next.js Frontend Design: NyayAssist (Lawbot)

**Date**: 2026-02-27
**Topic**: Frontend Architecture & UI Design (Option A: Pure Search)

## 1. Overview & Aesthetic
The web application will serve as the primary interface for Lawbot ("NyayAssist"). Based on the user's requirement for a "Glean-style minimalistic design" and the `brand-identity` guidelines, we have opted for Option A: **The Pure Search**.

The UI will be drastically simple:
*   **Initial State:** A large, centered search bar with subtle branding. No clutter, no complex sidebars.
*   **Active State:** Upon submitting a query, the search bar elegantly animates to the top/header. The space below fills with a conversational thread (like a chat) streaming results from the FastAPI backend.
*   **Aesthetic Constraints:**
    *   Colors: Predominantly black/white/grays (Tailwind `zinc` or `slate`), with subtle, professional accent colors (e.g., a muted blue or standard primary button). 
    *   Typography: `Inter` for headings, `Roboto` for body (per brand tokens).
    *   Components: `shadcn/ui` with Lucide React icons.
    *   Layout: Centered flex/grid containers with generous whitespace.

## 2. Technical Stack
*   **Framework:** Next.js (App Router, React 18+).
*   **Styling:** Tailwind CSS mapped to the `design-tokens.json` equivalents.
*   **Component Library:** `shadcn/ui` (specifically using `Input`, `Button`, `Card`, `ScrollArea`, `Skeleton`).
*   **State Management:** React `useState`/`useReducer` or simple context for the chat thread.
*   **API Communication:** Standard `fetch` API connecting to our local backend at `http://127.0.0.1:8000/api/query`.

## 3. Data Flow
1.  User types a query in the `<SearchBar />`.
2.  On submit, state transitions from `isIdle` to `isSearching`. The layout transitions via CSS/Framer Motion.
3.  A POST request is sent to `http://127.0.0.1:8000/api/query` with `{ "query": "..." }`.
4.  The backend's Navigation Router classifies the intent, triggers the requisite tool (e.g., `legal_search`, `document_processor`), and returns the JSON payload.
5.  The frontend parses the `route` and `result` object:
    *   If `route == "legal_search"`, render a list of Kanoon citations in a clean card format.
    *   If `route == "document_processor"`, render the summary text followed by a chronological timeline UI.
    *   If `route == "adversarial_engine"`, render objections with severity badges.

## 4. Components Breakdown
*   **`Home` / `Layout`:** The main container that handles the centering vs. top-alignment based on search state.
*   **`SearchBar`:** The primary input component. Needs to handle `onKeyDown` (Enter) and have a clean, focused state outline (e.g., standard shadcn `ring`).
*   **`MessageList` / `ChatThread`:** The scrolling container that displays previous queries and their responses.
*   **`ResultCards`:** Specific renderers for different tool outputs.
    *   `CitationCard`: Displays title, snippet, Court, Date.
    *   `TimelineCard`: Displays dates and events.

## 5. Error Handling & Edge Cases
*   If the FastAPI backend is down, catch the network error and display a clean "System Offline" toast/message.
*   If the router returns "unknown", display a polite "I didn't understand that, can you rephrase?" message.
*   Add a loading spinner or skeleton loader while waiting for the LLM/API to respond.
