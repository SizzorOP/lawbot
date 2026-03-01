# Mobile Responsiveness Design - YuktiAI

**Goal:** Make the YuktiAI application fully usable on mobile devices without altering the existing desktop layout.

## Context
Currently, the UI is heavily desktop-oriented, using fixed sidebars (`w-[260px]`), flex rows without wrapping, and explicit heights (`h-screen`). On mobile, these elements squish together or overflow, making the app unusable.

The user explicitly requested: "make sure the windows website does not change."

## Proposed Approaches

### Approach 1: Mobile Top Bar + Hamburger Menu (Recommended)
This approach provides a clean, native-feeling mobile experience while neatly hiding the complex navigation until needed.

*   **Desktop Behaviour:** Unchanged. The fixed left `Sidebar` and right `Quick Prompts` panel remain as they are.
*   **Mobile Behaviour:**
    *   **Hide Fixed Sidebars:** Add `hidden md:flex` to the left sidebar in `AppShell` and `hidden xl:block` to the right sidebar in `Dashboard`.
    *   **Top App Bar:** Introduce a new `MobileHeader` component, visible only on mobile (`flex md:hidden`). It will contain the YuktiAI logo and a Hamburger (☰) icon.
    *   **Drawer Navigation:** Tapping the hamburger opens a slide-out mobile drawer containing all navigation links from the `Sidebar` and the user profile/logout menu.
    *   **Stack Content:** In the main `page.tsx`, change `grid-cols-2` to `grid-cols-1 md:grid-cols-2`. Change the horizontal flex layouts for news items to `flex-col md:flex-row`.
    *   **Quick Prompts:** The "Quick Prompts" column on the right will be moved below the main content area on mobile so it's still accessible.

### Approach 2: Mobile Bottom Navigation App-Style
This approach mimics native mobile apps with a bottom tab bar, suitable for rapid task switching.

*   **Desktop Behaviour:** Unchanged.
*   **Mobile Behaviour:**
    *   **Hide Fixed Sidebars:** Same as Approach 1.
    *   **Bottom Navigation Bar:** Add a sticky bottom bar (`fixed bottom-0 w-full md:hidden`) containing 4-5 primary icons (e.g., Dashboard, Cases, Research, Menu).
    *   **More Menu:** The "Menu" icon opens a modal or full-screen list with the remaining navigation items (Translation, Calendar, etc.) and user settings.
    *   **Stack Content:** Same as Approach 1.

## Recommendation
**Approach 1 (Mobile Top Bar + Hamburger)** is recommended. YuktiAI has a large number of navigation links (10+). A bottom navigation bar struggles to display more than 5 items clearly, meaning a "More" menu is unavoidable. A hamburger menu handles extensive navigation items more gracefully in complex web apps. 

**Does Approach 1 look good, or would you prefer Approach 2 (Bottom Tabs)? Please review and approve an option so we can proceed to the implementation plan.**
