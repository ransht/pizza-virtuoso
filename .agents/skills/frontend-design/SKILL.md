---
name: frontend-design
description: Production-quality frontend design guidance for websites, landing pages, dashboards, ecommerce flows, restaurant ordering menus, and interactive web apps. Use when Codex is asked to redesign, polish, modernize, premium-ize, make responsive, improve UX/UI, build a beautiful frontend, audit visual quality, or turn a functional interface into a professional production-ready experience.
---

# Frontend Design

Use this skill to make interfaces feel intentional, polished, responsive, and ready for real users. Treat design as product work: clarify the user's goal, study the existing system, improve the primary workflow, and validate the result in a browser.

## Workflow

1. Inspect the existing UI, content, CSS, components, assets, and target audience before editing.
2. Identify the primary user journey and design around it. For ordering sites, this is usually: choose category -> choose item/options -> review cart -> send/order.
3. Choose a visual direction that fits the business. Avoid generic templates, decorative filler, and childish visual noise.
4. Implement the design in the existing architecture, using local patterns and minimal new dependencies.
5. Validate desktop and mobile layouts, interaction states, text fit, and console errors.
6. Commit or deploy only after the interface is coherent and the primary workflow works.

## Visual Standards

- Build strong hierarchy: clear page purpose, obvious primary action, scan-friendly sections, and meaningful grouping.
- Use restrained but distinctive color. Avoid one-note palettes and overused purple/blue gradients unless the brand requires them.
- Use real product visuals when the user needs trust or appetite. Avoid fake-looking illustrations for food, venues, products, or people.
- Prefer dense, useful UI for operational tools; prefer immersive product-first composition for marketing or ordering experiences.
- Keep cards for real units: menu items, products, repeated records, modals, and checkout panels. Do not nest cards inside cards.
- Make interactive controls look like controls: buttons, segmented choices, toggles, checkboxes, quantity steppers, tabs, sticky category navigation, and clear cart/checkout actions.
- Use icons only when they clarify action or scanning. Do not replace important text with ambiguous icons.

## Layout

- Design mobile first for ordering and local-business sites.
- Use stable dimensions for grids, cards, toolbar buttons, quantity controls, sticky bars, and media.
- Prevent layout shift from hover states, badges, long labels, dynamic prices, or empty/loading states.
- Keep sticky elements from colliding: headers, category tabs, floating carts, and mobile action bars need deliberate spacing.
- Ensure long Hebrew/RTL text wraps cleanly and does not overflow buttons or cards.
- Avoid viewport-based font scaling. Use `clamp()` only for broad heading ranges and keep UI text stable.

## Ordering UX

- Keep the menu as structured data when possible, not hard-coded markup.
- Show product families as product cards with variants/options, rather than duplicating many near-identical rows.
- Put the add action close to the exact choice being added.
- For pizza or configurable food, show size, base price, topping groups, topping prices, notes, quantity, and a clear summary.
- Cart state should be persistent when requested, easy to open, and support remove item, quantity changes, and clear all.
- Generated WhatsApp/order messages should be readable by staff: item, quantity, options, notes, subtotal/estimated total, customer name, delivery/pickup, address, and final notes.
- Price copy should be honest: use "סה״כ משוער" when final confirmation happens in WhatsApp or by phone.

## Motion

- Use motion only to clarify state changes or add subtle energy.
- Avoid gimmicks that make the site feel like a toy: spinning product images, endless bouncing, excessive parallax, or decorative animation loops.
- Respect `prefers-reduced-motion`.

## Validation

Before finishing a frontend design task:

- Check the page locally in a browser.
- Test the primary workflow end to end.
- Check mobile width around 390px and a desktop width.
- Verify sticky/floating controls do not overlap.
- Verify console has no new errors.
- Confirm key content comes from the intended source of truth when structured data is involved.
- Run available build/lint/static checks when the project has them.

## Delivery

In the final response, summarize the user-visible improvement, the primary workflow tested, and any live URL/build/commit status when applicable. Keep technical detail concise unless the user asks for it.
