# Test Screen Fullscreen & Instructions Implementation

## Overview

Implemented complete fullscreen testing flow with instructions, sidebar collapse functionality, and timer pause on fullscreen exit.

## Components Created

### 1. FullscreenRequired.jsx

**Purpose**: Initial modal shown to users before entering test

- Displays when test is first loaded
- Prompts user to enter fullscreen mode
- Cannot proceed without entering fullscreen
- Located: `src/features/test/components/FullscreenRequired.jsx`

### 2. InstructionsModal.jsx

**Purpose**: First step of instructions (General Instructions)

- Shows test details (duration, number of questions, section info)
- Displays important general instructions (1-3 points)
- Previous/Next navigation
- Located: `src/features/test/components/InstructionsModal.jsx`

### 3. OtherInstructionsModal.jsx

**Purpose**: Second step of instructions (Other Important Instructions)

- Shows candidate information
- Displays 7 important instructions about exam conduct
- Requires checkbox agreement before proceeding
- Submit button only enabled after agreement
- Located: `src/features/test/components/OtherInstructionsModal.jsx`

### 4. FullscreenExitedModal.jsx

**Purpose**: Modal shown when user exits fullscreen during test

- Prevents accidental test completion
- Offers "Enter Fullscreen" or "Exit Test" options
- Located: `src/features/test/components/FullscreenExitedModal.jsx`

## Test.jsx Updates

### New State Variables

```javascript
const [isFullscreen, setIsFullscreen] = useState(false)
const [hasSeenInstructions, setHasSeenInstructions] = useState(false)
const [instructionStep, setInstructionStep] = useState(0) // 0: general, 1: other, 2: confirmed
const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
const [timerPaused, setTimerPaused] = useState(false)
const testContainerRef = useRef(null)
```

### Fullscreen Detection (New Effect)

- Monitors fullscreen change events (all browser prefixes)
- Automatically pauses timer when user exits fullscreen
- Sets `isFullscreen` state based on current fullscreen status
- Handles fullscreen API errors gracefully

### Fullscreen Functions

```javascript
enterFullscreen() // Enters fullscreen mode with proper browser support
exitFullscreen() // Exits fullscreen mode
```

### Instructions Flow Logic

When test loads (non-practice/preview only):

1. Check if in fullscreen → Show `FullscreenRequired` if not
2. Once in fullscreen, show `InstructionsModal` (step 0)
3. Next → Show `OtherInstructionsModal` (step 1)
4. After agreement → Mark `hasSeenInstructions = true`
5. If user exits fullscreen → Show `FullscreenExitedModal`

### Timer Pause Logic

- Timer continues when `timerPaused = false`
- Timer pauses automatically when fullscreen is exited
- Timer resumes when user re-enters fullscreen
- Practice/Preview modes unaffected

### Sidebar Collapse

- New toggle button with chevron icons
- Responsive grid:
  - Expanded: `grid-cols-12` (5-4-3 layout)
  - Collapsed: `grid-cols-9` (5-4 layout)
- Question column width adjusts dynamically
- User can toggle with button in top-right of sidebar

### TopBar Fullscreen Button

- Added fullscreen toggle button to TopBar top section
- Shows `Maximize2` icon when not fullscreen
- Shows `Minimize2` icon when fullscreen
- Positioned in top-right next to timer
- Only visible for non-practice/preview tests

## Flow Diagram

```
Test Loaded (Non-Practice/Preview)
    ↓
Not Fullscreen? → Show FullscreenRequired
    ↓
User Enters Fullscreen
    ↓
Show InstructionsModal (General)
    ↓
User clicks Next
    ↓
Show OtherInstructionsModal (Important)
    ↓
User agrees + clicks Start Test
    ↓
hasSeenInstructions = true
    ↓
Display Full Test Interface
    ↓
If User Exits Fullscreen → Show FullscreenExitedModal
    → Resume Fullscreen → Continue Test
    → Exit Test → Navigate to Dashboard
```

## Key Features

### ✅ Fullscreen Enforcement

- Test cannot start without entering fullscreen
- Instructions must be read in fullscreen
- If user exits fullscreen, test is paused

### ✅ Timer Management

- Timer automatically pauses on fullscreen exit
- Resumes when returning to fullscreen
- Elapsed time preserved correctly

### ✅ Instructions Flow

- Two-step instruction process with navigation
- Agreement checkbox prevents accidental test start
- Clear, step-by-step guidance

### ✅ Sidebar Collapse

- Toggle button in sidebar header
- Smooth responsive layout adjustment
- More screen space for questions when collapsed

### ✅ Fullscreen Toggle in TopBar

- Easy access to fullscreen toggle
- Clear visual indicators (expand/collapse icons)
- Positioned prominently in control bar

## Browser Compatibility

All fullscreen API methods support:

- Standard: `requestFullscreen()` / `exitFullscreen()`
- Webkit: `webkitRequestFullscreen()` / `webkitExitFullscreen()`
- Mozilla: `mozRequestFullScreen()` / `mozCancelFullScreen()`
- MS: `msRequestFullscreen()` / `msExitFullscreen()`

## localStorage Integration

- Sidebar collapse state NOT persisted (resets on page load)
- Instructions state NOT persisted (must be re-viewed per session)
- Test progress (answers, timer) continues to persist as before
- Allows users to start fresh with instructions if they exit/return

## Edge Cases Handled

1. ✅ User exits fullscreen immediately after entering
2. ✅ Multiple fullscreen/exit cycles
3. ✅ Timer reaches zero while in fullscreen (submits normally)
4. ✅ User closes fullscreen exit modal and returns to fullscreen
5. ✅ Browser fullscreen API not supported (graceful error)
6. ✅ Practice/Preview modes skip fullscreen entirely

## Testing Checklist

- [ ] Fullscreen required modal displays on test load
- [ ] Instructions show after entering fullscreen
- [ ] Next/Previous navigation works in instructions
- [ ] Agreement checkbox required before test start
- [ ] Timer visible and counting down
- [ ] Exiting fullscreen shows pause modal
- [ ] Sidebar collapse toggle works
- [ ] Returning to fullscreen resumes test
- [ ] Test continues seamlessly after fullscreen exit/return
- [ ] Timer pauses correctly on fullscreen exit
- [ ] Full test completion works as before
- [ ] Practice/Preview modes skip fullscreen flow

## Files Modified

1. `src/features/test/Test.jsx` - Main test component with fullscreen logic
2. `src/features/test/components/FullscreenRequired.jsx` - NEW
3. `src/features/test/components/InstructionsModal.jsx` - NEW
4. `src/features/test/components/OtherInstructionsModal.jsx` - NEW
5. `src/features/test/components/FullscreenExitedModal.jsx` - NEW

## Imports Added to Test.jsx

```javascript
import { Maximize2, Minimize2, ChevronLeft, ChevronRight } from 'lucide-react'
import FullscreenRequired from './components/FullscreenRequired'
import InstructionsModal from './components/InstructionsModal'
import OtherInstructionsModal from './components/OtherInstructionsModal'
import FullscreenExitedModal from './components/FullscreenExitedModal'
```

## Notes

- Fullscreen requirement only applies to non-practice/preview tests
- Users can toggle fullscreen anytime via the TopBar button
- If fullscreen is exited, test is paused but not submitted
- Users can return to fullscreen and continue without losing progress
- Instructions are shown once per test session (not persistent)
