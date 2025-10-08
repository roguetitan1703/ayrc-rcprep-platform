# Comprehensive Metrics & Features Audit

**Date:** October 8, 2025  
**Purpose:** Complete analysis of all metrics captured, displayed, and missing across the ARC platform

---

## Executive Summary

**Current State:**

- ✅ **Metrics Captured & Displayed:** ~45% of available data
- 🟡 **Metrics Captured But Hidden:** ~30% of available data
- 🔴 **Metrics Not Captured:** ~25% of potential insights

**Key Findings:**

1. Backend captures rich data (attempts, questions, timing, reasons)
2. Frontend displays basic metrics (accuracy, attempts, coverage)
3. Advanced insights missing (trends, comparisons, predictions)

---

## 1. METRICS WE ARE DISPLAYING

### 1.1 Dashboard Page

| Metric                       | Location                 | Data Source              | Status       |
| ---------------------------- | ------------------------ | ------------------------ | ------------ |
| Total Attempts               | StatsRow                 | `/users/me/dashboard`    | ✅ Displayed |
| Accuracy (7 days)            | StatsRow                 | `/users/me/dashboard`    | ✅ Displayed |
| Reason Coverage              | StatsRow                 | `/users/me/dashboard`    | ✅ Displayed |
| Topic Distribution (30 days) | TopicRingChart           | `/users/me/dashboard`    | ✅ Displayed |
| Activity Graph (12 weeks)    | ContributionGraph        | `/attempts/me?limit=100` | ✅ Displayed |
| 7-Day Attempt Trend          | AnalyticsPanel (removed) | `/users/me/dashboard`    | ❌ Removed   |

### 1.2 Results Page

| Metric             | Location   | Data Source        | Status       |
| ------------------ | ---------- | ------------------ | ------------ |
| Attempts (7 days)  | StatsPanel | `/attempts?page=1` | ✅ Displayed |
| Accuracy (7 days)  | StatsPanel | `/attempts?page=1` | ✅ Displayed |
| Avg Duration       | StatsPanel | `/attempts?page=1` | ✅ Displayed |
| Reason Coverage    | StatsPanel | `/attempts?page=1` | ✅ Displayed |
| Per-Attempt Score  | Table Row  | `/attempts`        | ✅ Displayed |
| Per-Attempt Date   | Table Row  | `/attempts`        | ✅ Displayed |
| Per-Attempt Topics | Table Row  | `/attempts`        | ✅ Displayed |

### 1.3 Performance Studio (Insights Page)

| Metric         | Location        | Data Source | Status       |
| -------------- | --------------- | ----------- | ------------ |
| Daily Streak   | OverviewMetrics | `/users/me` | ✅ Displayed |
| Personal Best  | OverviewMetrics | `/users/me` | ✅ Displayed |
| Total Attempts | OverviewMetrics | `/users/me` | ✅ Displayed |
| Avg Score      | OverviewMetrics | `/users/me` | ✅ Displayed |

### 1.4 Profile Page

| Metric              | Location             | Data Source | Status       |
| ------------------- | -------------------- | ----------- | ------------ |
| Daily Streak        | Streak Card          | `/users/me` | ✅ Displayed |
| Personal Best       | Static (placeholder) | N/A         | 🟡 Hardcoded |
| Total Attempts      | Static (placeholder) | N/A         | 🟡 Hardcoded |
| Member Since        | Subscription Card    | `/users/me` | ✅ Displayed |
| Subscription Status | Subscription Card    | `/users/me` | ✅ Displayed |
| Subscription Dates  | Subscription Card    | `/users/me` | ✅ Displayed |

### 1.5 Analysis Page (Per Attempt)

| Metric                     | Location              | Data Source              | Status       |
| -------------------------- | --------------------- | ------------------------ | ------------ |
| Score                      | Hero Card             | `/attempts/analysis/:id` | ✅ Displayed |
| Time Taken                 | Hero Card             | `/attempts/analysis/:id` | ✅ Displayed |
| Correct Count              | Hero Card             | `/attempts/analysis/:id` | ✅ Displayed |
| Avg Time Per Question      | Stats Section         | `/attempts/analysis/:id` | ✅ Displayed |
| Speed Tier                 | Stats Section         | `/attempts/analysis/:id` | ✅ Displayed |
| Question-Level Correctness | Question Cards        | `/attempts/analysis/:id` | ✅ Displayed |
| Question-Level Time        | Question Cards        | `/attempts/analysis/:id` | ✅ Displayed |
| Reason Tags                | ReasonTagSelect       | `/attempts/analysis/:id` | ✅ Displayed |
| Coverage Meter             | CoverageMeter         | `/attempts/analysis/:id` | ✅ Displayed |
| Category Accuracy Table    | CategoryAccuracyTable | `/attempts/analysis/:id` | ✅ Displayed |

### 1.6 Archive Page

| Metric         | Location      | Data Source | Status       |
| -------------- | ------------- | ----------- | ------------ |
| Total Archived | Stats Summary | `/rcs`      | ✅ Displayed |
| Avg Score      | Stats Summary | `/rcs`      | ✅ Displayed |
| Topics Covered | Stats Summary | `/rcs`      | ✅ Displayed |

### 1.7 Leaderboard Page

| Metric              | Location    | Data Source        | Status       |
| ------------------- | ----------- | ------------------ | ------------ |
| Global Rank         | Today Tab   | `/all/leaderboard` | ✅ Displayed |
| Monthly Rank        | Monthly Tab | `/all/leaderboard` | ✅ Displayed |
| Tag-Wise Rank       | Tag Tab     | `/all/leaderboard` | ✅ Displayed |
| User Accuracy       | All Tabs    | `/all/leaderboard` | ✅ Displayed |
| User Time Taken     | All Tabs    | `/all/leaderboard` | ✅ Displayed |
| User Attempts Count | All Tabs    | `/all/leaderboard` | ✅ Displayed |

---

## 2. METRICS WE ARE CAPTURING BUT NOT SHOWING

### 2.1 User Model - Hidden Fields

| Field               | Captured | Displayed                       | Potential Use                           |
| ------------------- | -------- | ------------------------------- | --------------------------------------- |
| `phoneNumber`       | ✅ Yes   | ❌ No                           | Contact verification, account recovery  |
| `location`          | ✅ Yes   | ❌ No                           | **Local cohort leaderboards** (planned) |
| `referralCode`      | ✅ Yes   | ❌ No                           | Referral tracking, growth analytics     |
| `parentrefCode`     | ✅ Yes   | ❌ No                           | Referral attribution                    |
| `subon`             | ✅ Yes   | ✅ Yes (Profile)                | -                                       |
| `subexp`            | ✅ Yes   | ✅ Yes (Profile)                | -                                       |
| `passwordChangedAt` | ✅ Yes   | ❌ No                           | Security audit log                      |
| `createdAt`         | ✅ Yes   | ✅ Yes (Profile - Member Since) | -                                       |

### 2.2 Attempt Model - Hidden Fields

| Field                                | Captured | Displayed                   | Potential Use                                        |
| ------------------------------------ | -------- | --------------------------- | ---------------------------------------------------- |
| `durationSeconds`                    | ✅ Yes   | 🟡 Partial                  | Full time tracking across pages                      |
| `deviceType`                         | ✅ Yes   | ❌ No                       | **Device analytics** (mobile vs desktop performance) |
| `isPersonalBest`                     | ✅ Yes   | ❌ No                       | **Highlight best attempts** in results list          |
| `isTimed`                            | ✅ Yes   | ❌ No                       | Compare timed vs untimed performance                 |
| `analysisNotes`                      | ✅ Yes   | ❌ No                       | **Show notes in results list**                       |
| `q_details.wasReviewed`              | ✅ Yes   | ❌ No                       | **Review pattern analysis**                          |
| `q_details.timeSpent`                | ✅ Yes   | 🟡 Partial                  | Per-question timing heatmap                          |
| `q_details.qType`                    | ✅ Yes   | ❌ No                       | **Question type accuracy breakdown**                 |
| `q_details.qCategory`                | ✅ Yes   | ✅ Yes (Analysis page only) | Expand to dashboard                                  |
| `attemptType` (official vs practice) | ✅ Yes   | ❌ No                       | **Separate stats for practice vs official**          |

### 2.3 RC Passage Model - Hidden Fields

| Field                      | Captured | Displayed | Potential Use                       |
| -------------------------- | -------- | --------- | ----------------------------------- |
| `difficulty`               | ✅ Yes   | ❌ No     | **Filter by difficulty** in archive |
| `wordCount`                | 🔴 No    | ❌ No     | Reading speed calculation           |
| `questions[].questionType` | ✅ Yes   | ❌ No     | **Question type analytics**         |
| `questions[].difficulty`   | ✅ Yes   | ❌ No     | **Question difficulty analytics**   |
| `isActive`                 | ✅ Yes   | ❌ No     | Archive status filter               |

---

## 3. METRICS WE ARE NOT CAPTURING

### 3.1 Time & Behavior Tracking (Missing)

| Metric                         | Current Status    | How to Capture                    | Potential Value                    |
| ------------------------------ | ----------------- | --------------------------------- | ---------------------------------- |
| **Session Time of Day**        | 🔴 Not Captured   | Add `attemptedAt` hour analysis   | Best practice times recommendation |
| **Consecutive Days Practiced** | 🔴 Not Calculated | Analyze `dailyStreak` over time   | Consistency tracking               |
| **Longest Streak Ever**        | 🔴 Not Stored     | Add `longestStreak` field to User | Motivation & gamification          |
| **Time to First Answer**       | 🔴 Not Captured   | Track first question timestamp    | Reading comprehension analysis     |
| **Review Time per Question**   | 🔴 Not Captured   | Track review mode timestamps      | Review effectiveness               |
| **Pause/Resume Events**        | 🔴 Not Captured   | Track test interruptions          | Focus analysis                     |

### 3.2 Advanced Analytics (Missing)

| Metric                       | Current Status    | How to Calculate                        | Potential Value                |
| ---------------------------- | ----------------- | --------------------------------------- | ------------------------------ |
| **Accuracy Trend (Slope)**   | 🔴 Not Calculated | Linear regression on accuracy over time | Improvement rate visualization |
| **Consistency Score**        | 🔴 Not Calculated | Std deviation of scores                 | Identify erratic performance   |
| **Speed-Accuracy Trade-off** | 🔴 Not Calculated | Correlation between speed and accuracy  | Optimal pacing recommendation  |
| **Topic Mastery Level**      | 🔴 Not Calculated | Topic accuracy + attempts threshold     | Badge system, skill tree       |
| **Predicted Next Score**     | 🔴 Not Calculated | ML model based on trends                | Goal setting                   |
| **Time to Mastery**          | 🔴 Not Calculated | Attempts until 90%+ accuracy            | Learning curve analysis        |

### 3.3 Comparative Analytics (Missing)

| Metric                           | Current Status          | How to Calculate                    | Potential Value                |
| -------------------------------- | ----------------------- | ----------------------------------- | ------------------------------ |
| **Percentile Rank**              | 🔴 Not Calculated       | Compare user score to all users     | Competition motivation         |
| **Cohort Average**               | 🔴 Not Calculated       | Group by location/subscription      | Local benchmarking             |
| **Topic Difficulty Ranking**     | 🔴 Not Calculated       | Aggregate all users' topic accuracy | Identify hardest topics        |
| **Passage Global Success Rate**  | 🔴 Not Calculated       | All users' accuracy on passage      | Passage difficulty calibration |
| **Question Option Distribution** | 🟡 Partial (Admin only) | Aggregate option selections         | Trap answer identification     |

### 3.4 Engagement Metrics (Missing)

| Metric                         | Current Status    | How to Capture              | Potential Value         |
| ------------------------------ | ----------------- | --------------------------- | ----------------------- |
| **Login Frequency**            | 🔴 Not Tracked    | Add login event timestamps  | Engagement analysis     |
| **Feature Usage**              | 🔴 Not Tracked    | Track page visits           | Feature adoption        |
| **Feedback Completion Rate**   | 🔴 Not Tracked    | Daily feedback submissions  | User satisfaction       |
| **Practice-to-Official Ratio** | 🔴 Not Calculated | Compare attemptType counts  | Preparation behavior    |
| **Coverage Completion Time**   | 🔴 Not Tracked    | Time to reach 100% coverage | Reason tagging adoption |

---

## 4. INCOMPLETE FEATURES (FROM DOCS)

### 4.1 Performance Studio (BLOCKED)

**Status:** Page exists but blocked by SubBlocker  
**Missing Components:**

- ✅ OverviewMetrics (exists)
- 🔴 RangeSelector (7/30/90 days) - Missing
- 🔴 Radar Chart (question type accuracy) - Missing
- 🔴 Timeline Chart (progress over time) - Missing
- 🔴 Question Type Table - Missing
- 🔴 Export to CSV - Missing

**Backend Support:**

- 🔴 `/api/performance` endpoint - Missing
- 🔴 `buildQuestionRollups()` function - Exists in `analytics.service.js` but not connected
- 🔴 `buildProgressTimeline()` function - Exists but not connected
- 🔴 `buildRadarDataset()` function - Exists but not connected

### 4.2 Local Cohort Leaderboard

**Status:** Infrastructure ready, not implemented  
**Ready:**

- ✅ `location` field in User model
- ✅ Location input in registration (now hidden per user request)

**Missing:**

- 🔴 `/api/users/me/cohort-leaderboard` endpoint
- 🔴 `LeaderboardLocal.jsx` component
- 🔴 Tab in Leaderboard page

### 4.3 Help Center

**Status:** Placeholder component only  
**Missing:**

- 🔴 6 content sections (Getting Started, Features, Scoring, Subscription, Troubleshooting, FAQ)
- 🔴 Search functionality
- 🔴 Category navigation
- 🔴 Popular articles section

### 4.4 Leaderboard Transformation

**Status:** Current design uses custom table, user wants premium cards  
**Current:** Simple table layout  
**Requested:** Premium card grid similar to Archive page

---

## 5. DESIGN INCONSISTENCIES FIXED

### 5.1 Recent Fixes (From FIXES_COMPLETED.md)

- ✅ Gradient backgrounds applied to all stats sections
- ✅ Topic rings redesigned (separate charts per topic)
- ✅ Activity graph simplified (3-state color scale)
- ✅ Paywall restored as blocking modal
- ✅ Analysis active question styling (crimson ring)
- ✅ Results page title added

### 5.2 Remaining Padding Issues

- ✅ Profile page - Fixed (removed max-w-6xl mx-auto)
- 🔴 Subscriptions page - Needs check
- 🔴 Feedback page - Needs check
- 🔴 Leaderboard page - Needs check

---

## 6. PRIORITY ROADMAP

### Phase 1: Quick Wins (1-2 weeks)

**Goal:** Surface existing data that's already captured

1. **Display Device Type Analytics**

   - Add "Device Mix" widget to Dashboard
   - Show mobile vs desktop performance comparison

2. **Highlight Personal Best**

   - Add PB badge to Results table
   - Add PB filter in Results page

3. **Show Analysis Notes in Results**

   - Add notes preview column in Results table
   - Click to expand full notes

4. **Display Attempt Type**

   - Separate "Official" vs "Practice" tabs in Results
   - Show practice-to-official ratio on Dashboard

5. **Show Question Type Breakdown**
   - Add question type accuracy to Dashboard
   - Requires populating `qType` in existing questions

### Phase 2: Feature Completion (2-3 weeks)

**Goal:** Complete blocked/incomplete features

1. **Unblock Performance Studio**

   - Connect existing backend functions to frontend
   - Add RangeSelector component
   - Add Timeline Chart (line graph)
   - Add Question Type Table

2. **Transform Leaderboard**

   - Convert table layout to premium card grid
   - Add animations and hover effects
   - Add user highlighting

3. **Implement Local Cohort**

   - Create backend endpoint
   - Create LeaderboardLocal component
   - Add tab to existing Leaderboard

4. **Create Help Center**
   - Write content for 6 sections
   - Implement search
   - Add category navigation

### Phase 3: Advanced Analytics (3-4 weeks)

**Goal:** Add insights and predictions

1. **Trend Analysis**

   - Calculate accuracy slope
   - Show improvement rate graph
   - Add momentum indicator

2. **Comparative Analytics**

   - Show percentile rank
   - Add cohort averages
   - Show topic difficulty rankings

3. **Behavioral Insights**

   - Track session times
   - Identify best practice hours
   - Show consistency score

4. **Predictive Metrics**
   - Predict next score
   - Estimate time to mastery
   - Recommend focus areas

---

## 7. BACKEND ENDPOINTS AUDIT

### 7.1 Existing Endpoints

| Endpoint                               | Purpose             | Used By            | Status    |
| -------------------------------------- | ------------------- | ------------------ | --------- |
| `GET /api/v1/users/me`                 | User profile        | Profile, Dashboard | ✅ Active |
| `GET /api/v1/users/me/dashboard`       | Dashboard analytics | Dashboard          | ✅ Active |
| `GET /api/v1/attempts`                 | Paginated attempts  | Results            | ✅ Active |
| `GET /api/v1/attempts/me?limit=100`    | Recent attempts     | ContributionGraph  | ✅ Active |
| `GET /api/v1/attempts/analysis/:id`    | Detailed analysis   | Analysis           | ✅ Active |
| `PATCH /api/v1/attempts/:id/reasons`   | Save reason tags    | Analysis           | ✅ Active |
| `PATCH /api/v1/attempts/:id/notes`     | Save notes          | Analysis           | ✅ Active |
| `GET /api/v1/all/leaderboard`          | Global leaderboard  | Leaderboard        | ✅ Active |
| `GET /api/v1/feedback/questions/today` | Daily questions     | Feedback           | ✅ Active |
| `POST /api/v1/feedback`                | Submit feedback     | Feedback           | ✅ Active |
| `GET /api/v1/rcs`                      | RC passages         | Archive, Test      | ✅ Active |

### 7.2 Missing Endpoints (Needed)

| Endpoint                                  | Purpose                   | Priority | Effort    |
| ----------------------------------------- | ------------------------- | -------- | --------- |
| `GET /api/v1/performance?range=30`        | Performance Studio data   | HIGH     | 2-3 hours |
| `GET /api/v1/users/me/cohort-leaderboard` | Local cohort rankings     | MEDIUM   | 2 hours   |
| `GET /api/v1/users/me/reasons/week`       | Weekly reason summary     | MEDIUM   | 1 hour    |
| `GET /api/v1/users/me/trends`             | Accuracy trends           | LOW      | 3 hours   |
| `GET /api/v1/analytics/comparative`       | Percentile & cohort stats | LOW      | 4 hours   |

---

## 8. FRONTEND COMPONENTS AUDIT

### 8.1 Existing Components (Complete)

- ✅ Dashboard (StatsRow, AnalyticsPanel, ContributionGraph, TopicRingChart)
- ✅ Results (StatsPanel, Results Table)
- ✅ Analysis (Full breakdown with reason tagging)
- ✅ Archive (Premium card grid with filters)
- ✅ Profile (Account info + subscription)
- ✅ Leaderboard (3 tabs: Today, Monthly, Tag-Wise)

### 8.2 Missing Components (Needed)

- 🔴 Performance Studio (RangeSelector, RadarChart, TimelineChart, QuestionTypeTable, ExportButton)
- 🔴 LeaderboardLocal (Local cohort component)
- 🔴 Help Center (6 sections with search)
- 🔴 DashboardGreeting (Personalized welcome with streak)
- 🔴 ReasonSummaryWidget (Top 2 reasons from past week)
- 🔴 DeviceMixWidget (Mobile vs desktop performance)

---

## 9. DATA SCHEMA COMPLETENESS

### 9.1 Well-Structured (Complete)

- ✅ User schema (all fields defined, indexed)
- ✅ Attempt schema (rich q_details, reason tracking)
- ✅ RcPassage schema (questions with types/difficulty)
- ✅ Feedback schema (daily questions)

### 9.2 Missing Fields (Needed)

- 🔴 User: `longestStreak`, `preferences` (object with goalType, examDate, focusDefault, fontScale, theme)
- 🔴 Attempt: `wordCount` calculation, `readingSpeed` calculation
- 🔴 AnalyticsEvent: No event tracking schema exists (for login, feature usage, page views)

---

## 10. KEY RECOMMENDATIONS

### Immediate Actions (This Week)

1. ✅ Hide location field in registration (DONE)
2. ✅ Fix Profile padding (DONE)
3. 🔴 Fix Subscriptions, Feedback, Leaderboard padding
4. 🔴 Transform Leaderboard to premium card layout
5. 🔴 Create Help Center with content

### Short-Term (Next 2 Weeks)

1. Unblock Performance Studio
2. Implement Local Cohort Leaderboard
3. Display hidden metrics (device type, personal best, attempt type)
4. Add question type breakdown

### Long-Term (Next Month)

1. Build advanced analytics (trends, predictions)
2. Add behavioral tracking
3. Implement comparative analytics
4. Create recommendation engine

---

## 11. METRICS SUMMARY BY CATEGORY

### Captured & Displayed Well (45%)

- User basics (name, email, streak, subscription)
- Attempt basics (score, time, accuracy)
- Topic distribution
- Activity heatmap
- Reason tagging and coverage
- Leaderboard rankings

### Captured But Hidden (30%)

- Device type
- Location
- Personal best flags
- Analysis notes
- Question types and categories
- Attempt type (official vs practice)
- Referral codes
- Subscription dates

### Not Captured (25%)

- Session timing patterns
- Behavioral analytics (pauses, reviews, first answer time)
- Trend calculations (slopes, predictions)
- Comparative metrics (percentiles, cohorts)
- Engagement metrics (feature usage, login frequency)
- Question-level global statistics

---

## 12. CONCLUSION

**Current State:** The platform has a solid foundation with comprehensive data capture in the backend and good display of core metrics in the frontend.

**Biggest Gaps:**

1. Performance Studio blocked (easy fix - just connect existing backend)
2. Many captured metrics not displayed (easy wins)
3. Advanced analytics not calculated (requires development)
4. Help Center not built (content creation needed)

**Estimated Effort to 90% Completion:**

- Performance Studio: 1 week
- Display hidden metrics: 1 week
- Local Cohort + Help Center: 1 week
- Leaderboard transformation: 3 days
- **Total:** ~3-4 weeks of focused development

**ROI Priority:**

1. **HIGH:** Performance Studio (data already exists, just needs UI)
2. **HIGH:** Display hidden metrics (low effort, high value)
3. **MEDIUM:** Local Cohort (feature parity with specs)
4. **MEDIUM:** Help Center (user support)
5. **LOW:** Advanced analytics (nice-to-have, but time-intensive)

---

**Document Complete** ✅  
**Next Steps:** Review with team and prioritize implementation phases.
