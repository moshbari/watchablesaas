
<context>
The “Watchable” bar that’s covering the mobile menu items is the Landing page’s own sticky navigation (`.landing-nav`), not the Radix Sheet itself.

In `src/styles/landing.css` the Landing nav is:
- `position: sticky; top: 0;`
- `z-index: 1000;`

But the mobile menu (Radix Sheet) uses:
- `SheetOverlay` = `z-50`
- `SheetContent` = `z-50` (in `src/components/ui/sheet.tsx`)

So on mobile, the Landing sticky nav (z=1000) renders above the Sheet overlay/content (z=50), which makes it look like the menu is “behind” the bar and the bar blocks clicks.
</context>

<best-solution>
Normalize z-index layering so “temporary overlays” (Sheet/Dialogs) always sit above “persistent UI” (sticky headers).

The cleanest fix is to lower the Landing nav z-index to something reasonable (so it’s still above page content, but below overlays). This prevents the same issue from happening with any modal/drawer/popover across the site.
</best-solution>

<implementation-steps>
1) Fix the root cause (Landing sticky nav z-index)
   - File: `src/styles/landing.css`
   - Change `.landing-nav { z-index: 1000; }` to something below overlays, e.g. `z-index: 30;` (or `40`).
   - Keep `position: sticky` and `top: 0` as-is.

2) Validate overlay layering still behaves correctly
   - Confirm Radix Sheet overlay/content still appear above:
     - Landing sticky nav
     - Any other page elements (cards, sections, embeds)
   - Check that the Landing nav still stays on top of normal content while scrolling (it will).

3) Optional hardening (only if you want “never again” protection)
   - File: `src/components/ui/sheet.tsx`
   - Raise Sheet overlay/content z-index from `z-50` to something higher (e.g. `z-[1100]`) so it always beats unusually high z-index components.
   - Tradeoff: this may place Sheets above other UI (like toasts) depending on your intended layering. If you like toasts on top, keep toasts higher than sheets.

I recommend Step 1 as the primary fix because it keeps a clean, consistent z-index scale across the app and avoids needing “infinite z-index escalation”.
</implementation-steps>

<testing-checklist>
- Mobile viewport:
  - Go to `/` (Landing)
  - Open hamburger menu (Sheet)
  - Verify no part of the Landing sticky nav overlaps the Sheet panel.
  - Verify the top menu items are fully visible and clickable.
  - Close/open the menu a few times to ensure it’s consistent.

- Regression:
  - Check any other sheets (e.g. the UI sidebar’s mobile sheet) still open and layer correctly.
</testing-checklist>

<files-touched>
- Primary: `src/styles/landing.css`
- Optional: `src/components/ui/sheet.tsx`
</files-touched>
