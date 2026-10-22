
# Bookora — Theme and Design System

## 1. Design Direction

**Style:** Premium Dark SaaS  
**Mood:** Elegant, focused, trustworthy, modern  
**Brand Personality:** Organized, welcoming, efficient  
**Visual Principle:** Use contrast, spacing, and typography to create premium quality rather than relying on excessive gradients or glow effects.

## 2. Color Palette

### Backgrounds
- App background: #0B0B10
- Secondary background: #101017
- Card surface: #15151D
- Elevated surface: #1C1C27
- Input surface: #111119

### Brand Colors
- Primary violet: #8B5CF6
- Primary hover: #7C3AED
- Soft violet: #A78BFA
- Violet tint: #251B3B
- Focus ring: #A78BFA

### Text
- Primary text: #F5F5FA
- Secondary text: #A1A1B3
- Muted text: #8A8A9E (>=4.5:1 on app, surface, card, and elevated)
- Text on primary button: #FFFFFF

### Borders
- Default border: #292936
- Strong border: #3A3A4B
- Subtle divider: #22222D

### Semantic Colors
- Success: #22C55E
- Success background: #10251A
- Warning: #F59E0B
- Warning background: #2A2111
- Error: #F87171
- Error background: #301719
- Information: #60A5FA
- Information background: #15243A

Maintain accessible text contrast. Never use color as the only way to communicate status.

## 3. Color Usage

- Reserve violet for primary actions, selected dates, active navigation, and key highlights.
- Use neutral charcoal surfaces for most containers.
- Use semantic colors only for status indicators and relevant feedback.
- Avoid using multiple saturated accent colors in one component.
- Gradients are optional decorative enhancements, not required backgrounds.

## 4. Layout System

- Maximum marketing content width: 1200px
- Maximum dashboard content width: 1440px
- Main dashboard sidebar: approximately 240px on desktop
- Desktop page padding: 32px
- Tablet page padding: 24px
- Mobile page padding: 16px
- Standard section spacing: 64–96px
- Dashboard section spacing: 24–32px
- Card padding: 20–24px
- Form field spacing: 16–20px

Use a consistent spacing scale based on 4px increments.

## 5. Border Radius

- Small controls: 8px
- Inputs and buttons: 10px
- Standard cards: 14px
- Featured panels: 20px
- Pills and status badges: fully rounded

Avoid mixing unrelated radius values within the same interface.

## 6. Component Styling

### Buttons
- Primary: accessible violet background (#7C3AED) with white text (5.7:1)
- Secondary: charcoal background with neutral border
- Ghost: transparent background with hover surface
- Destructive: red styling, used only for destructive actions
- Disabled: reduced contrast with no hover interaction

Buttons must have visible hover, focus, active, and disabled states.

### Cards
- Charcoal surface with subtle border
- Consistent internal spacing
- Optional restrained shadow for elevated overlays
- No excessive glow or ornamental gradients

### Inputs
- Dark input background
- Neutral border
- Clear placeholder and label
- Violet focus ring
- Inline validation feedback
- Accessible labels and error descriptions

### Navigation
- Highlight the active route
- Keep navigation labels clear
- Collapse desktop sidebar into mobile navigation
- Provide an accessible mobile menu

### Status Badges
- Pending: amber
- Confirmed: blue or violet
- Completed: green
- Cancelled: red

Use both a label and a visual treatment.

## 7. Motion and Interaction

- Hover transitions: 150–200ms
- Small entrance transitions: 200–300ms
- Use subtle fades and short translations
- Avoid unnecessary animated backgrounds
- Respect reduced-motion preferences
- Provide immediate feedback for booking and admin actions

## 8. Responsive Behavior

### Desktop: 1024px and above
- Full dashboard sidebar
- Multi-column service and metric grids
- Wide appointment tables

### Tablet: 768px–1023px
- Compact navigation
- Reduced grid columns
- Scrollable or restructured data tables

### Mobile: below 768px
- Single-column booking flow
- Full-width primary CTA
- Compact service cards
- Mobile-friendly date and time selection
- Sidebar replaced with drawer or mobile navigation
- Appointment tables converted to readable cards when appropriate

## 9. Accessibility

- Maintain readable contrast.
- Use semantic buttons, links, headings, and form labels.
- Support keyboard navigation.
- Show visible focus states.
- Use descriptive names for icon-only controls.
- Provide accessible error and success feedback.
- Do not rely on hover alone to expose essential information.

## 10. Design Quality Standard

Every page must feel like part of one product. Reuse design tokens and components instead of styling each screen independently. Avoid generic placeholder layouts, inconsistent spacing, unnecessary gradients, and controls that look functional but do nothing.
