# 🎨 Frontend Analytics - Visual Component Guide

This guide shows exactly what each component looks like and how to use them.

---

## 🚀 Performance Studio Components

### 1. Range Selector

```
┌────────────────────────────┐
│ 🕐 [7 Days] [30 Days] [90 Days] │
└────────────────────────────┘
```

- **Active State:** Crimson background (#D33F49)
- **Inactive:** Light gray with hover effect
- **Icon:** Clock icon on left

---

### 2. Overview Metrics (4 Tiles)

```
┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ DAILY STREAK│ │PERSONAL BEST│ │TOTAL ATTEMPTS│ │AVERAGE SCORE│
│     🔥      │ │     🏆      │ │     📊      │ │     🎯      │
│   7 days    │ │    4/4      │ │     45      │ │   2.8/4     │
└─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘
   Green            Crimson          Blue           Amber
```

---

### 3. Radar Chart (Skill Assessment)

```
        Main Idea (56%)
              ↑
    App ←─────┼─────→ Detail
   (57%)      │      (50%)
              │
    Vocab ←───┼───→ Tone
   (60%)      │     (42%)
              ↓
         Inference (80%)
```

- **Your Accuracy:** Crimson filled area
- **Target (80%):** Blue dashed line
- **Tooltip:** Shows dimension, accuracy, questions
- **Interactive:** Hover to see details

---

### 4. Question Type Table

```
┌─────────────────────────────────────────────────────────┐
│ TYPE ↕          │    QUESTIONS ↕    │    ACCURACY ↕    │
├─────────────────────────────────────────────────────────┤
│ Inference       │        25         │ ████████░ 80.0%  │
│ Vocabulary      │        10         │ ██████░░░ 60.0%  │
│ Main Idea       │         9         │ █████░░░░ 55.6%  │
└─────────────────────────────────────────────────────────┘
```

- **Sortable:** Click headers to sort
- **Color Bars:** Mini progress bars
- **Color Coded:** Green ≥75%, Amber ≥60%, Red <60%

---

### 5. Progress Timeline (Dual-Axis Chart)

```
Attempts │                    ┌─┐
    4    │              ┌─┐   │ │
    3    │        ┌─┐   │ │   │ │
    2    │  ┌─┐   │ │   │ │   │ │
    1    │  │ │   │ │   │ │   │ │
    0    └──┴─┴───┴─┴───┴─┴───┴─┴──── Score %
         10/1  10/2  10/3  10/4  10/5
```

- **Blue Bars:** Daily attempts (left axis)
- **Crimson Line:** Average score % (right axis)
- **Tooltip:** Date, attempts, avg score
- **Gradient:** Blue gradient fill on bars

---

### 6. Recent Attempts List

```
┌─────────────────────────────────────────────────────────┐
│ Climate Change Passage          [🏆 PB]    4/4  100%  →│
│ Oct 5, 2025 • SCIENCE                                   │
├─────────────────────────────────────────────────────────┤
│ Economic Theory                             3/4   75%  →│
│ Oct 4, 2025 • ECONOMICS                                 │
├─────────────────────────────────────────────────────────┤
│ Historical Analysis                         2/4   50%  →│
│ Oct 3, 2025 • HISTORY                                   │
└─────────────────────────────────────────────────────────┘
```

- **PB Badge:** Personal Best indicator (crimson)
- **Score Colors:** Green ≥75%, Amber ≥50%, Red <50%
- **Clickable:** Links to Analysis page
- **Hover:** Background changes, arrow highlights

---

## 🏠 Dashboard Components

### 7. Dashboard Greeting

```
┌─────────────────────────────────────────────────────────┐
│ Good Morning, Asha! 👋               🔥 7 day streak    │
│ Ready to sharpen your skills today?                     │
└─────────────────────────────────────────────────────────┘
```

- **Dynamic:** Morning/Afternoon/Evening
- **Personalized:** Uses first name
- **Streak Badge:** Only shows if streak > 0
- **Gradient Background:** Subtle gradient on streak badge

---

### 8. Enhanced Stats Row

```
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│ ATTEMPTS (7 DAYS)│ │ ACCURACY (7 DAYS)│ │ REASON COVERAGE  │
│       📊         │ │       🎯         │ │       🏷️         │
│        5         │ │       80%        │ │       65%        │
│                  │ │                  │ │  70% target      │
└──────────────────┘ └──────────────────┘ └──────────────────┘
    Blue                 Green                Crimson
```

- **Icons:** In colored background pills
- **Numbers:** Large, bold (3xl)
- **Subtext:** For context (e.g., "70% target")

---

### 9. Analytics Panel

```
┌─────────────────────────────────────────────────────────┐
│ Analytics Snapshot                               📈     │
├─────────────────────────────────────────────────────────┤
│ Topic Accuracy (last 30 days)          3 topics attempted│
│ ┌────────┐ ┌────────┐ ┌────────┐                        │
│ │SCIENCE │ │HISTORY │ │  ARTS  │                        │
│ │  75%   │ │  80%   │ │  60%   │                        │
│ └────────┘ └────────┘ └────────┘                        │
│                                                          │
│ Attempt Trend (7 days)                                  │
│ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐      │
│ │ ██ │ │ █  │ │ ███│ │ █  │ │ ██ │ │ ███│ │ ██ │      │
│ └────┘ └────┘ └────┘ └────┘ └────┘ └────┘ └────┘      │
│  10/1   10/2   10/3   10/4   10/5   10/6   10/7        │
│                                                          │
│ [View detailed analytics →]                             │
└─────────────────────────────────────────────────────────┘
```

- **Topic Pills:** Color-coded by accuracy
- **Trend Bars:** Interactive with hover
- **Link:** Goes to Performance Studio

---

## 📊 Analysis Page Updates

### 10. Question Type Badges (Fixed)

```
┌─────────────────────────────────────────────────────────┐
│ Question 1                                     ✓ CORRECT│
├─────────────────────────────────────────────────────────┤
│ Difficulty: [MEDIUM] • Type: [INFERENCE]                │
├─────────────────────────────────────────────────────────┤
│ What can be inferred from the passage?                  │
└─────────────────────────────────────────────────────────┘
```

- **Difficulty Colors:**
  - Easy: Green
  - Medium: Amber
  - Hard: Red
- **Type:** Capitalized with spaces (e.g., "Main Idea")
- **Real Data:** From backend (no more mocking!)

---

## 🎨 Color Reference

### Primary Colors

```
🔴 Crimson:  #D33F49  (Primary actions, important metrics)
🔵 Blue:     #3B82F6  (Info, analytics, charts)
🟢 Green:    #23A094  (Success, positive metrics)
🟡 Amber:    #F6B26B  (Warnings, highlights)
🔴 Red:      #E4572E  (Errors, danger)
```

### Background Colors

```
⚪ Canvas:   #F7F8FC  (Page background)
⚪ Card:     #FFFFFF  (Elevated surfaces)
⚪ Muted:    #EEF1FA  (Alternating sections)
```

### Text Colors

```
⚫ Primary:   #273043  (Headings, emphasis)
⚫ Secondary: #5C6784  (Body text, metadata)
⚫ Tertiary:  #A9B2C3  (Disabled, placeholders)
```

### Border Colors

```
━━ Soft:     #D8DEE9  (Subtle dividers)
```

---

## 📐 Spacing & Sizing

### Card Padding

```
Desktop: p-6 (24px)
Mobile:  p-4 (16px)
```

### Grid Gaps

```
Standard: gap-4 (16px)
Larger:   gap-6 (24px)
```

### Border Radius

```
Cards:   rounded-xl (12px)
Buttons: rounded-lg (8px)
Badges:  rounded-md (6px)
Pills:   rounded-full (9999px)
```

### Font Sizes

```
Display: text-4xl (36px)  - Page titles
H1:      text-3xl (30px)  - Section headers
H2:      text-2xl (24px)  - Metric values
H3:      text-lg (18px)   - Card headers
Body:    text-sm (14px)   - Normal text
Micro:   text-xs (12px)   - Labels, metadata
Tiny:    text-[10px]      - Super small text
```

---

## 🎭 Interactive States

### Hover Effects

```css
Cards:   hover:shadow-lg
Buttons: hover:bg-primary-light
Links:   hover:text-primary
Bars:    hover:bg-primary (changes color)
```

### Transitions

```css
Standard: transition-colors duration-200
Smooth:   transition-all duration-300
```

### Focus States

```css
focus:outline-none
focus:ring-2
focus:ring-focus-ring
```

---

## 📱 Responsive Breakpoints

### Grid Columns

```
Mobile  (<640px):  1 column
Tablet  (≥640px):  2 columns
Desktop (≥1024px): 4 columns
```

### Example

```jsx
className = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'
```

---

## 🔧 Component Props

### PerformanceStudio

```jsx
// No props needed - self-contained
<PerformanceStudio />
```

### RangeSelector

```jsx
<RangeSelector
  value={30} // Current range in days
  onChange={setRange} // Callback function
/>
```

### OverviewMetrics

```jsx
<OverviewMetrics
  metrics={{
    dailyStreak: 7,
    personalBest: 4,
    totalAttempts: 45,
    avgScore: 2.8,
  }}
/>
```

### RadarChart

```jsx
<RadarChart
  data={[
    { dimension: 'Main Idea', value: 56, totalQuestions: 9 },
    // ... more dimensions
  ]}
/>
```

### QuestionTypeTable

```jsx
<QuestionTypeTable
  data={[
    { type: 'inference', accuracy: 80, totalQuestions: 25 },
    // ... more types
  ]}
/>
```

### ProgressTimeline

```jsx
<ProgressTimeline
  data={[
    { date: '2025-10-01', score: 2, rcId: '...', rcTitle: '...' },
    // ... more attempts
  ]}
/>
```

### RecentAttempts

```jsx
<RecentAttempts
  attempts={[...]}        // Array of attempt objects
  personalBest={4}        // User's best score
/>
```

### DashboardGreeting

```jsx
<DashboardGreeting
  streak={7} // Current daily streak
/>
```

---

## 🎯 Usage Examples

### Import Components

```jsx
// Performance Studio
import PerformanceStudio from './features/performance/PerformanceStudio'

// Dashboard Components
import { DashboardGreeting } from './features/dashboard/DashboardGreeting'
import { StatsRow } from './features/dashboard/StatsRow'
import { AnalyticsPanel } from './features/dashboard/AnalyticsPanel'
```

### Use in Routes

```jsx
<Route path="/performance" element={<PerformanceStudio />} />
```

### Fetch Data

```jsx
const { data } = await api.get('/all/performance?startDate=2025-09-01&endDate=2025-10-01')
```

---

## 🚀 Performance Tips

### Optimize Recharts

```jsx
// Use useMemo for data transformations
const chartData = useMemo(() => {
  return data.map((item) => ({
    // ... transform
  }))
}, [data])
```

### Loading States

```jsx
{
  loading && <Skeleton className="h-96 w-full" />
}
{
  !loading && data && <RadarChart data={data.radarData} />
}
```

### Error Handling

```jsx
try {
  const response = await api.get('/all/performance')
  setData(response.data)
} catch (e) {
  setError(e?.response?.data?.error || e.message)
}
```

---

## ✅ Checklist for New Features

When adding new analytics components:

- [ ] Use semantic color tokens (not raw hex)
- [ ] Add loading skeleton
- [ ] Add error state
- [ ] Add empty state
- [ ] Use proper spacing (p-6, gap-4)
- [ ] Add hover effects
- [ ] Make it responsive
- [ ] Add ARIA labels
- [ ] Test with real data
- [ ] Test with empty data
- [ ] Add TypeScript types (if using TS)
- [ ] Document props

---

**🎨 This guide ensures consistency across all new features!**
