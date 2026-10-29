# MediKiosk Color Scheme Guide

## Color Palette Reference

### Primary Colors (Medical Blue)
```
Primary 50:  #eff6ff  - Lightest blue backgrounds
Primary 100: #dbeafe  - Light blue accents
Primary 200: #bfdbfe  - Subtle highlights
Primary 300: #93c5fd  - Light interactions
Primary 400: #60a5fa  - Medium interactions
Primary 500: #3b82f6  - Base primary color ⭐
Primary 600: #2563eb  - Main buttons & actions ⭐⭐⭐
Primary 700: #1d4ed8  - Hover states & emphasis ⭐⭐
Primary 800: #1e40af  - Dark accents
Primary 900: #1e3a8a  - Darkest blue
Primary 950: #172554  - Ultra dark (text on light)
```

### Accent Colors (Success Green)
```
Accent 50:  #f0fdf4  - Success background
Accent 100: #dcfce7  - Light success
Accent 200: #bbf7d0  - Success highlights
Accent 300: #86efac  - Medium success
Accent 400: #4ade80  - Success interactions
Accent 500: #22c55e  - Base success ⭐
Accent 600: #16a34a  - Success buttons ⭐⭐
Accent 700: #15803d  - Success hover
Accent 800: #166534  - Dark success
Accent 900: #14532d  - Darkest success
```

### Secondary Colors (Premium Purple)
```
Secondary 50:  #faf5ff  - Purple background
Secondary 100: #f3e8ff  - Light purple
Secondary 200: #e9d5ff  - Purple highlights
Secondary 300: #d8b4fe  - Medium purple
Secondary 400: #c084fc  - Purple interactions
Secondary 500: #a855f7  - Base purple ⭐
Secondary 600: #9333ea  - Purple actions ⭐⭐
Secondary 700: #7e22ce  - Purple hover
Secondary 800: #6b21a8  - Dark purple
Secondary 900: #581c87  - Darkest purple
```

### System Colors (Tailwind Default)
```
Gray: For text, borders, backgrounds
Red: Errors, alerts, danger states
Orange: Warnings, low stock alerts
Yellow: Caution, pending states
Green: Success messages (use Accent)
Blue: Information (use Primary)
Purple: Premium features (use Secondary)
```

---

## Usage Guidelines

### Buttons

**Primary Action Button:**
```jsx
className="bg-gradient-to-r from-primary-600 to-primary-700 
           text-white rounded-xl shadow-lg 
           hover:from-primary-700 hover:to-primary-800"
```

**Secondary Action Button:**
```jsx
className="bg-white text-primary-700 border-2 border-primary-600 
           rounded-xl hover:bg-primary-50"
```

**Success Button:**
```jsx
className="bg-gradient-to-r from-accent-500 to-accent-600 
           text-white rounded-xl"
```

**Danger Button:**
```jsx
className="bg-gradient-to-r from-red-500 to-red-600 
           text-white rounded-xl"
```

### Cards

**Glassmorphism Card:**
```jsx
className="bg-white/80 backdrop-blur-sm rounded-2xl 
           shadow-glass border border-white/60"
```

**Solid Card:**
```jsx
className="bg-white rounded-2xl shadow-soft 
           border border-gray-200/60"
```

**Stat Card with Color:**
```jsx
className="bg-white/80 backdrop-blur-sm rounded-2xl 
           border border-blue-200 hover:shadow-lg"
```

### Badges

**Status Badges:**
```jsx
// Success
className="px-3 py-1 rounded-full bg-green-100 text-green-700"

// Warning
className="px-3 py-1 rounded-full bg-orange-100 text-orange-700"

// Error
className="px-3 py-1 rounded-full bg-red-100 text-red-700"

// Info
className="px-3 py-1 rounded-full bg-blue-100 text-blue-700"

// Pending
className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700"
```

### Backgrounds

**Page Background:**
```jsx
className="bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20"
```

**Section Background:**
```jsx
className="bg-gradient-to-br from-blue-50 via-purple-50/30 to-pink-50/20"
```

**Card Background:**
```jsx
className="bg-white/80 backdrop-blur-sm"
```

### Text

**Gradient Text:**
```jsx
className="bg-gradient-to-r from-primary-700 to-primary-600 
           bg-clip-text text-transparent"
```

**Headers:**
```jsx
className="text-gray-900 font-bold"
```

**Body Text:**
```jsx
className="text-gray-600 font-medium"
```

**Muted Text:**
```jsx
className="text-gray-500 text-sm"
```

---

## Color Combinations

### High Contrast (WCAG AAA)
- White (#ffffff) on Primary-700 (#1d4ed8) ✅
- Primary-900 (#1e3a8a) on White (#ffffff) ✅
- Gray-900 (#111827) on White (#ffffff) ✅

### Medium Contrast (WCAG AA)
- White on Primary-600 (#2563eb) ✅
- Primary-700 on Primary-50 (#eff6ff) ✅
- Gray-700 on Gray-50 ✅

### Avoid
- Light blue on white ❌
- Yellow text on white ❌
- Primary-300 on white ❌

---

## Decorative Elements

### Blur Circles:**
```jsx
<div className="absolute top-20 left-10 w-72 h-72 
                bg-primary-200/30 rounded-full blur-3xl" />
```

### Glow Effects:**
```jsx
className="shadow-lg shadow-primary-500/30"
```

### Glass Panel:**
```jsx
className="bg-white/20 backdrop-blur-md rounded-2xl 
           border border-white/20"
```

---

## Semantic Color Mapping

### Status Colors
```
✅ Success/Completed: Accent Green (accent-500)
⏳ Pending/Warning:   Orange (orange-500)
❌ Error/Failed:      Red (red-500)
ℹ️ Info/Default:      Primary Blue (primary-500)
⏸️ Disabled:          Gray (gray-400)
```

### Stock Status
```
High Stock:  Green (accent-500)
Low Stock:   Orange (orange-500)
Out of Stock: Red (red-500)
```

### Order Status
```
Pending:    Yellow (yellow-500)
Confirmed:  Blue (primary-600)
Completed:  Green (accent-500)
Cancelled:  Red (red-500)
Rejected:   Red (red-600)
```

### Priority Levels
```
Low:      Gray (gray-400)
Medium:   Blue (primary-500)
High:     Orange (orange-500)
Critical: Red (red-600)
```

---

## Gradients Library

### Button Gradients
```css
/* Primary */
from-primary-600 to-primary-700

/* Success */
from-accent-500 to-accent-600

/* Warning */
from-orange-500 to-orange-600

/* Danger */
from-red-500 to-red-600

/* Purple Premium */
from-purple-500 to-purple-700

/* Multi-color */
from-primary-500 via-purple-500 to-pink-500
```

### Background Gradients
```css
/* Subtle */
bg-gradient-to-br from-gray-50 to-white

/* Medical Blue */
bg-gradient-to-br from-blue-50 via-purple-50/30 to-pink-50/20

/* Dashboard */
bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20

/* Hero Section */
bg-gradient-to-br from-blue-50 via-purple-50/30 to-pink-50/20
```

---

## Design Tokens

### Spacing Scale
```
xs:  0.5rem (8px)
sm:  0.75rem (12px)
base: 1rem (16px)
lg:  1.25rem (20px)
xl:  1.5rem (24px)
2xl: 2rem (32px)
3xl: 3rem (48px)
```

### Border Radius
```
lg:  0.5rem (8px)   - Small cards
xl:  0.75rem (12px) - Buttons, inputs
2xl: 1rem (16px)    - Cards
3xl: 1.5rem (24px)  - Large cards
full: 9999px        - Pills, avatars
```

### Shadows
```
sm:    0 1px 2px rgba(0,0,0,0.05)
md:    0 4px 6px rgba(0,0,0,0.07)
lg:    0 10px 15px rgba(0,0,0,0.1)
xl:    0 20px 25px rgba(0,0,0,0.1)
glass: 0 8px 32px rgba(31,38,135,0.07)
soft:  0 2px 15px rgba(0,0,0,0.07)
```

---

## Quick Reference Chart

| Element | Background | Text | Border | Hover |
|---------|-----------|------|--------|-------|
| Primary Button | primary-600 | white | none | primary-700 |
| Secondary Button | white | primary-700 | primary-600 | primary-50 bg |
| Card | white/80 | gray-900 | white/60 | shadow-lg |
| Stat Card | white/80 | primary-600 | blue-200 | lift up |
| Badge Success | green-100 | green-700 | none | - |
| Badge Warning | orange-100 | orange-700 | none | - |
| Badge Error | red-100 | red-700 | none | - |
| Input | white/50 | gray-900 | gray-300 | primary-500 ring |
| Sidebar Active | primary-600 gradient | white | none | none |
| Sidebar Inactive | transparent | gray-700 | none | primary-50 |

---

## Dos and Don'ts

### ✅ DO
- Use primary blue for main actions
- Use accent green for success states
- Apply glassmorphism to overlay cards
- Use gradients on hero buttons
- Keep text high contrast
- Use shadows for depth

### ❌ DON'T
- Mix too many colors in one section
- Use low contrast text combinations
- Over-use glassmorphism (can hurt readability)
- Use bright colors for large areas
- Forget hover states
- Ignore dark mode considerations

---

## Medical Industry Standards

### Why Blue?
- **Trust**: Medical institutions use blue
- **Calm**: Reduces anxiety in healthcare
- **Professional**: Conveys expertise
- **Clean**: Associated with hygiene
- **Universal**: Recognized worldwide

### Color Psychology in Healthcare
- Blue: Trust, stability, calm
- Green: Health, growth, success
- White: Cleanliness, sterility
- Gray: Neutrality, balance
- Red: Urgency (use sparingly)

---

This color scheme creates a modern, trustworthy, and professional medical application while following 2026 design trends.
