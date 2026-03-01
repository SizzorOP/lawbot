# Mobile Responsiveness Implementation Plan - YuktiAI

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make YuktiAI fully usable on mobile devices through a top app bar and slide-out hamburger menu, while preserving the existing desktop layout exactly as-is.

**Architecture:** We will create a new `MobileHeader` component that renders only on mobile (`md:hidden`). We will update the `AppShell` and `Dashboard (page.tsx)` to hide their permanent sidebars on mobile (`hidden md:flex` / `hidden xl:block`), and wrap main content to ensure proper stacking (`flex-col md:flex-row`). The new `MobileHeader` will contain a Sheet component from shadcn/ui (or a custom slide-over) to display the existing `Sidebar` navigation.

**Tech Stack:** Next.js App Router, Tailwind CSS, Lucide React, Shadcn UI (if available, otherwise custom Tailwind sheet).

---

### Task 1: Update AppShell & Hide Desktop Sidebar on Mobile

**Files:**
- Modify: `ui/src/components/AppShell.tsx`

**Step 1: Hide the fixed Sidebar and adjust padding for mobile**

Modify `AppShell.tsx` to conditionally hide the fixed left sidebar and remove the left padding on mobile screens. We will also add a `div` wrapper for the new Mobile Header (to be built in Task 2).

```tsx
// In AppShell.tsx, update the layout wrapper classes:
<div className="flex min-h-screen bg-white dark:bg-zinc-900 selection:bg-blue-100 selection:text-blue-900">
    {/* Sidebar is fixed on the left - HIDDEN ON MOBILE */}
    <div className={`hidden md:block fixed top-0 left-0 h-screen z-50 transition-all duration-300 ${isCollapsed ? 'w-[72px]' : 'w-[260px]'}`}>
        <Sidebar isCollapsed={isCollapsed} toggleSidebar={() => setIsCollapsed(!isCollapsed)} />
    </div>

    {/* Main content area — offset by sidebar width ON DESKTOP ONLY */}
    <main className={`flex-1 min-h-screen transition-all duration-300 w-full md:${isCollapsed ? 'pl-[72px]' : 'pl-[260px]'}`}>
        {children}
    </main>
</div>
```

**Step 2: Commit**

```bash
git add ui/src/components/AppShell.tsx
git commit -m "feat(layout): hide desktop sidebar on mobile in AppShell"
```

---

### Task 2: Create MobileHeader with Drawer

**Files:**
- Create: `ui/src/components/MobileHeader.tsx`
- Modify: `ui/src/components/Sidebar.tsx` (to make it embeddable in the drawer without `h-screen` and border conflicts)
- Modify: `ui/src/components/AppShell.tsx` (to include `<MobileHeader />`)

**Step 1: Ensure Sidebar is flexible**
Update `Sidebar.tsx` to accept a `className` override so we can strip `h-screen` and borders when rendering it inside a mobile drawer.

**Step 2: Create MobileHeader.tsx**
Build a `MobileHeader` component that uses a fixed `z-50` top bar containing the YuktiAI logo and a Hamburger icon. Clicking the icon opens a full-height, slide-over div containing the `Sidebar` component (forced `isCollapsed={false}`).

```tsx
// Basic structure for MobileHeader.tsx:
"use client";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Sidebar } from "./Sidebar";
import Link from "next/link";

export function MobileHeader() {
  const [isOpen, setIsOpen] = useState(false);
  // Returns a top bar for mobile (`md:hidden`)
  // Returns a fixed slide-out drawer when `isOpen` is true containing <Sidebar isCollapsed={false} className="w-full h-full border-none" />
}
```

**Step 3: Integrate MobileHeader into AppShell**
Add `<MobileHeader />` inside the `<main>` tag of `AppShell.tsx` so it renders at the top of the content only on mobile. Add `pt-16 md:pt-0` to the children container so content isn't hidden under the fixed mobile header.

**Step 4: Commit**

```bash
git add ui/src/components/MobileHeader.tsx ui/src/components/Sidebar.tsx ui/src/components/AppShell.tsx
git commit -m "feat(mobile): create MobileHeader and integrate drawer navigation"
```

---

### Task 3: Make Dashboard Stack Responsively

**Files:**
- Modify: `ui/src/app/page.tsx`

**Step 1: Update Dashboard layout grids and flexboxes**

Currently, the dashboard uses hardcoded widths and sidebars.

- Change the right "Quick Prompts" column wrapper to hide on mobile OR move it. Since Approach 1 said it stacks below main content: change the outermost `flex` to `flex-col xl:flex-row`.
- Change right sidebar width to `w-full xl:w-[320px]`. Remove `border-l` on mobile, change to `border-t xl:border-l xl:border-t-0`.
- Remove `h-screen overflow-y-auto` from the right panel and the left panel, placing the scroll on the generic window instead, or ensure both sections scroll naturally when stacked.
- Change onboarding cards grid: `grid-cols-1 md:grid-cols-2`.
- Change News items flex: `flex-col md:flex-row`. Add `w-full` to the news image wrapper on mobile, `h-48 md:w-[200px] md:h-[220px]`.

**Step 2: Check padding and text scaling**
Adjust `px-8 py-10` on the header to `px-4 py-6 md:px-8 md:py-10`.
Adjust `text-[28px]` to `text-2xl md:text-[28px]`.

**Step 3: Commit**

```bash
git add ui/src/app/page.tsx
git commit -m "feat(mobile): make dashboard layout responsive"
```

---

### Task 4: Responsive Adjustments for Other Pages

**Files:**
- Modify: `ui/src/app/research/page.tsx`
- Modify: `ui/src/app/cases/page.tsx`
- (And other core pages as needed to ensure tables, search bars, and chat UIs don't overflow horizontally).

**Step 1: Fix Research page ChatHistorySidebar**
Like the main sidebar, the `ChatHistorySidebar` is fixed width. Add `hidden lg:flex` to hide chat history on mobile by default, or implement a mobile sheet for it. Since Chat is primary, make the chat input `w-full` padding `px-4` instead of `left-[240px]`.

**Step 2: Commit**

```bash
git add ui/src/app/research/page.tsx
git commit -m "feat(mobile): ensure research chat UI is responsive"
```
