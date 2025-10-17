# Test Screen Component Structure

## Visual Hierarchy

```
┌─────────────────────────────────────────────────────────────────────┐
│                          Test.jsx                                   │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │           Grid Layout (12 columns, gap-4)                     │  │
│  │                                                                │  │
│  │  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐    │  │
│  │  │ Passage     │  │ Question     │  │ Right Panel      │    │  │
│  │  │ col-span-5  │  │ col-span-4   │  │ col-span-3       │    │  │
│  │  │             │  │              │  │                  │    │  │
│  │  │ Title       │  │ Q 1 / 4      │  │ UserProfileCard  │    │  │
│  │  │ Timer       │  │ Practice     │  │                  │    │  │
│  │  │─────────────│  │──────────────│  │──────────────────│    │  │
│  │  │             │  │              │  │ QuestionStatus   │    │  │
│  │  │ Passage     │  │ Question     │  │ Legend           │    │  │
│  │  │ Text        │  │ Text         │  │                  │    │  │
│  │  │             │  │              │  │──────────────────│    │  │
│  │  │ (Scrolls)   │  │ Options:     │  │ SectionInfo      │    │  │
│  │  │             │  │ ○ A          │  │                  │    │  │
│  │  │             │  │ ○ B          │  │──────────────────│    │  │
│  │  │             │  │ ○ C          │  │ QuestionPalette  │    │  │
│  │  │             │  │ ○ D          │  │                  │    │  │
│  │  │             │  │              │  │ ┌──┬──┬──┬──┐   │    │  │
│  │  │             │  │ Explanation  │  │ │🔶│🟩│🟥│⬜│   │    │  │
│  │  │             │  │              │  │ └──┴──┴──┴──┘   │    │  │
│  │  │             │  │ ☑ Mark       │  │ (4x1 grid)      │    │  │
│  │  └─────────────┘  └──────────────┘  └──────────────────┘    │  │
│  └──────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                        Footer                                 │  │
│  │  ← Dashboard   [Mark & Next] [Clear] [Save & Next] [Submit]  │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

## Component Tree

```
Test.jsx
├── Passage Column (col-span-5)
│   ├── Header
│   │   ├── Title
│   │   └── Timer Badge
│   └── Passage Text (scrollable)
│
├── Question Column (col-span-4)
│   ├── Header
│   │   ├── Question Number
│   │   └── Mode Indicator
│   ├── Question Text
│   ├── Options (Radio Group)
│   ├── Explanation (Practice Mode)
│   └── Mark Checkbox
│
├── Right Panel (col-span-3)
│   ├── UserProfileCard
│   │   ├── Avatar Circle (initials)
│   │   ├── User Name
│   │   └── User Email
│   │
│   ├── QuestionStatusLegend
│   │   ├── Answered (🔶 Green Shield)
│   │   ├── Not Answered (🟥 Red Shield)
│   │   ├── Not Visited (⬜ White Square)
│   │   ├── Marked (🟣 Purple Circle)
│   │   └── Answered+Marked (🟣 + Green Dot)
│   │
│   ├── SectionInfo
│   │   ├── Section Name
│   │   └── Topic Tags
│   │
│   └── QuestionPalette
│       └── Grid (4 columns x 1 row for 4 questions)
│           └── QuestionPaletteButton (x4)
│               ├── Shape Layer (SVG)
│               │   ├── ShieldDown (answered)
│               │   ├── ShieldUp (not answered)
│               │   ├── Square (not visited)
│               │   └── Circle (marked)
│               ├── Question Number
│               └── Status Icon
│
└── Footer
    ├── Dashboard Link
    └── Action Buttons
        ├── Mark for Review & Next
        ├── Clear Response (conditional)
        ├── Save & Next
        └── Submit (last question)
```

## Shape Component Details

### ShieldDown (Answered - Green)

```
    ████████
   ██████████
  ████████████
  ████████████
   ██████████
    ████████
      ████
       ██
        ▼
```

### ShieldUp (Not Answered - Red)

```
        ▲
       ██
      ████
    ████████
   ██████████
  ████████████
  ████████████
   ██████████
    ████████
```

### Square (Not Visited - White)

```
  ┌──────────┐
  │          │
  │          │
  │          │
  │          │
  └──────────┘
```

### Circle (Marked - Purple)

```
      ████
    ████████
   ██████████
  ████████████
  ████████████
   ██████████
    ████████
      ████
```

### Circle with Dot (Answered + Marked)

```
      ████
    ████████
   ██████████
  ████████████  🟢 (green dot)
  ████████████
   ██████████
    ████████
      ████
```

## State Flow Diagram

```
┌─────────────┐
│ Not Visited │  (Default state)
│   ⬜ White  │
└──────┬──────┘
       │ Click question
       ▼
┌─────────────┐
│Not Answered │  (Visited, no answer)
│  🟥 Red     │
└──────┬──────┘
       │ Select answer
       ▼
┌─────────────┐
│  Answered   │  (Answer selected)
│  🔶 Green   │
└──────┬──────┘
       │ Mark checkbox
       ▼
┌─────────────┐
│ Answered +  │  (Both conditions)
│   Marked    │
│ 🟣 + Green  │
│    Dot      │
└─────────────┘

Alternative Path:
Not Answered → Mark checkbox → Marked (🟣 Purple)
```

## Button Action Flow

```
┌──────────────────────┐
│  Question Index: 0   │
└──────────┬───────────┘
           │
    ┌──────┴──────────────────────┐
    │                              │
    ▼                              ▼
[Mark & Next]              [Clear Response]
    │                              │
    ├─ Set marked[0] = true        │
    └─ Go to question 1     ← Clear answer[0]
                                   │
    ┌──────────────────────────────┘
    │
    ▼
[Save & Next]
    │
    └─ Go to question 1

On Last Question:
    ┌──────────────────┐
    │ Question Index: 3│
    └──────────┬───────┘
               ▼
         [Submit Test]
               │
               └─ Submit attempt → Navigate to results
```

## Color Coding Reference

| Status            | Shape        | Color          | Hex Code | Design Token   |
| ----------------- | ------------ | -------------- | -------- | -------------- |
| Answered          | Shield Down  | Green          | #23A094  | success-green  |
| Not Answered      | Shield Up    | Red            | #E4572E  | error-red      |
| Not Visited       | Square       | White/Gray     | #FFFFFF  | card-surface   |
| Marked            | Circle       | Purple         | #7B68EE  | (CAT-specific) |
| Answered + Marked | Circle + Dot | Purple + Green | Both     | (Combination)  |
| Current Question  | Ring         | Amber          | #F6B26B  | accent-amber   |
| Save & Next       | Button       | Crimson        | #D33F49  | primary        |
| Submit            | Button       | Green          | #23A094  | success-green  |
| Clear             | Button       | Red            | #E4572E  | error-red      |

## Responsive Breakpoints (Future)

Currently optimized for desktop (≥1024px):

- Grid: 5-4-3 columns
- All panels visible
- Full feature set

Mobile (future enhancement):

- Stack vertically or use tabs
- Collapsible passage
- Bottom sheet for palette
- Simplified footer (1-2 buttons)

## Accessibility Features

1. **Keyboard Navigation**

   - Tab through questions
   - Arrow keys for options
   - Enter to select

2. **Screen Reader Support**

   - aria-labels on all buttons
   - aria-live on timer
   - Descriptive question status

3. **Focus Management**

   - Visible focus rings (blue)
   - Ring offset for clarity
   - Focus-within for groups

4. **Color Independence**
   - Icons supplement colors
   - Text labels for all states
   - Status legend explains meanings

## File Size Estimates

```
Component                      Lines  Size
─────────────────────────────────────────
ShieldDown.jsx                  13    ~400 bytes
ShieldUp.jsx                    13    ~400 bytes
Square.jsx                      13    ~350 bytes
Circle.jsx                      13    ~350 bytes
QuestionPaletteButton.jsx       75    ~2.5 KB
QuestionPalette.jsx             25    ~800 bytes
UserProfileCard.jsx             40    ~1.3 KB
QuestionStatusLegend.jsx        55    ~1.8 KB
SectionInfo.jsx                 25    ~800 bytes
Test.jsx (updated)             330    ~11 KB
─────────────────────────────────────────
Total                          602    ~20 KB
```

## Performance Metrics (Estimated)

- Initial render: < 50ms
- Shape render: < 5ms per button
- State update: < 10ms
- Re-render on question change: < 30ms
- LocalStorage save: < 5ms

All within excellent performance range for 60fps interactions.
