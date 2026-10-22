
# Bookora — Typography System

## 1. Font Family

### Primary Typeface: Inter
Use Inter for headings, body text, labels, buttons, forms, navigation, and dashboard data.

Preferred font stack:
Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif

Use a locally installed or bundled font when available. A system font fallback must always be provided.

## 2. Font Weights

- Regular: 400
- Medium: 500
- Semibold: 600
- Bold: 700

Usage:
- Regular: body text and descriptions
- Medium: navigation, labels, and supporting emphasis
- Semibold: card headings, buttons, and section titles
- Bold: hero headings and important metrics

Use weight to establish hierarchy, not to make every element visually heavy.

## 3. Type Scale

### Marketing Pages
- Hero heading: 56px / 1.08 line height
- Hero heading, tablet: 44px
- Hero heading, mobile: 36px
- Section heading: 36px / 1.2
- Section heading, mobile: 28px
- Section description: 18px / 1.65
- Standard body: 16px / 1.6
- Supporting text: 14px / 1.5

### Dashboard
- Page title: 28px / 1.25
- Section title: 20px / 1.4
- Card title: 16px / 1.4
- Metric value: 28–36px
- Table content: 14px / 1.5
- Supporting labels: 12–13px / 1.5

### Booking Flow
- Step heading: 24px / 1.3
- Service name: 16–18px
- Price: 16–20px
- Field label: 14px / 1.4
- Input text: 15–16px
- Helper text: 13px / 1.5
- Confirmation reference: 20–24px

Use responsive typography and avoid horizontal overflow at narrow widths.

## 4. Hierarchy Rules

1. One clear H1 per page.
2. Use H2 for major sections and H3 for subsections.
3. Keep dashboard titles concise.
4. Distinguish primary metrics through size and weight.
5. Use muted colors for supporting information, not smaller text alone.
6. Keep paragraphs comfortable to read.
7. Avoid excessive uppercase text.

## 5. Number and Currency Formatting

- Currency: Philippine peso (PHP)
- Example: ₱850
- Use consistent decimal formatting where needed.
- Use tabular numerals for dashboard metrics and aligned numeric values.
- Display appointment times consistently using the configured business timezone.
- Display durations in minutes or hours and minutes, as appropriate.

## 6. Buttons and Form Controls

- Button text: 14–15px, weight 600
- Form labels: 14px, weight 500
- Input text: 15–16px, weight 400
- Validation messages: 13px, weight 400–500

Labels must remain visible when a user enters a value. Do not depend on placeholder text as the only label.

## 7. Implementation

Define reusable typography styles or design tokens rather than repeating arbitrary font sizes throughout the project.

Use Tailwind responsive utilities or equivalent shared classes for:
- Display headings
- Page headings
- Section headings
- Body text
- Supporting text
- Form labels
- Metric values

## 8. Quality Standard

Typography must feel calm, legible, and intentional. Use a limited number of font sizes per page, consistent line heights, and clear visual hierarchy. Ensure the booking form and admin tables remain readable on mobile.
