# ARC RC Prep Platform – User-Facing Features, Tags, and Stats Audit

This document provides an exhaustive list of all features, tags, and stats shown or used on every user-facing screen of the ARC RC Prep platform frontend (React). Use this as a reference for backend verification, QA, or product documentation.

---

## 1. Dashboard

- **Greeting:** Daily streak (`user?.dailyStreak`)
- **StatsRow:**
  - Attempts (7 days): `stats?.attempts7d` or `analytics?.attempts7d`
  - Accuracy (7 days): `stats?.accuracy`
  - Reason Coverage: `stats?.coverage` or `analytics?.coverage`
  - 70% target (subtext)
- **AnalyticsPanel:**
  - Topic Distribution (last 30 days): `analytics.topics` (tag, accuracy, totalQuestions)
  - TopicRingChart: donut chart for each topic
  - ContributionGraph: activity graph (from attempts)
  - "View detailed analytics" link
- **Today's RCs:**
  - Title, date, topic tags, status (attempted/pending), score
  - Buttons: "View Results", "Practice", "Start Test", "Unlock by submitting feedback or subscribing"
- **SubFeedbackBlocker:** Feedback required wall
- **Tags:** RC topic tags, status badge ("Attempted"), analytics topic tags
- **Stats:** Attempts (7d), accuracy (7d), reason coverage, topic accuracy, total questions per topic, daily streak

---

## 2. Results

- **Attempt History:**
  - Page header, total attempts, pagination
  - Table: passage title, excerpt, date, score, accuracy, topics, "View Details"
- **StatsPanel:**
  - Attempts (7d), accuracy (7d), avg duration
  - CoverageMeter: reason coverage, target, tagged/total wrong
- **AttemptScoreCard:**
  - Score %, correct/total, duration, date, (PB tag commented out)
- **CoverageMeter:**
  - Reason coverage %, progress bar, tagged/total mistakes
- **Tags:** Passage topic tags, score color, accuracy %, "View Details"
- **Other UI:** Loading skeletons, empty state, pagination controls

---

## 3. Analysis

- **Hero Panel:**
  - Score %, stat tiles (correct, time, avg/q, speed tier, date, topics)
  - (PB tag commented out)
- **Coverage Meter:**
  - Reason coverage %, target, tagged/total wrong
- **Passage:** Passage text
- **Category Accuracy Table:** categoryStats (if present)
- **Questions Section:**
  - Number, text, options, correct/incorrect badge, difficulty, type, user/correct answer, option %, explanation, reason tagging
  - "Tag Reason" prompt
- **Question Navigation:** Tabs for each question, color-coded
- **Tags:** Topic, difficulty, type, correct/incorrect, answer labels, reason tags
- **Stats:** Score %, correct/total, time, avg/q, speed tier, date, option %, reason coverage, tagged/total wrong, category accuracy

---

## 4. Profile

- **Header:** "My Profile"
- **User Info Card:** Name (editable), email, account creation date, save button, toasts/messages
- **Performance Stats:** Total attempts, avg accuracy, practice hours, streak record
- **Error/Loading:** Error message, skeleton loaders

---

## 5. Subscriptions

- **Current Plan:** Name, price, period, description, icon, color, features, limitations, upgrade/manage
- **Available Plans:** Free, 1 Week, Till CAT 2025, Basic/Pro/Elite Reader (features, limitations, price, offer, duration, badges)
- **Plan Tags:** "Recommended" badge
- **Subscription Status:** Uses `user.subscription`

---

## 6. Auth

- **Login:** Email, password, remember me, forgot password, sign in, error messages, redirects
- **Register:** Name, email, phone, city, state, pincode, password, validation, city dropdown, error messages, success redirect
- **Forgot:** Email, send reset link, success message, back to sign in
- **Reset:** Email, new password, reset button, success redirect, error messages

---

## 7. Feedback

- **Daily Feedback Flow:**
  - Loads daily questions, unlocks if none, already submitted message
  - Question types: rating, multi-select, open text, redirect
  - Navigation: next/prev, next disabled for timer
  - Submission: API, success/error

---

## 8. Onboarding

- **Onboarding Steps:** 3 steps (mastery, explanations, habit), progress bar, next/start buttons

---

## 9. Help

- **Sections:** Getting Started, Features Guide, Scoring & Analysis, Subscription & Billing, Troubleshooting, Contact
- **Articles:** Account creation, taking tests, dashboard, analytics, analysis, archive, results, performance studio, scoring, reason tags, coverage, speed tiers, category accuracy, subscription plans, payment, refunds, support
- **Icons/Tags:** Section icons, search bar

---

## 10. Community (Leaderboard)

- **Leaderboard Table:** Rank, name, accuracy, time, attempts
- **Rank Icons:** Trophy, medal, award for top 3
- **Stats:** User’s rank, accuracy, time, attempts
- **No Data State:** Message if no data

---

## 11. Static/Info Pages

- **Pricing:** All plans, features, prices, offers, countdowns, badges
- **About:** Mission, features grid (daily RCs, explanations, analytics, admin portal, topic tagging, no distractions)
- **Other:** Privacy, terms, refund, contact, home (about, CTA, why use, video, testimonials, sample RC, counter, overview, how it works, hero)

---

## 12. Performance Studio (Insights)

- **Header:** "Performance Studio"
- **Range Selector:** 7/30/90 days
- **Overview Metrics:** Attempts, accuracy, avg time, coverage, PB, etc.
- **Radar Chart:** Skill breakdown
- **Question Type Table:** Accuracy by type
- **Progress Timeline:** Score/accuracy over time
- **Recent Attempts:** List, PB highlight
- **Error/Loading:** Skeletons, error messages

---

## 13. Archive

- **Archive List:** All RCs (filtered by plan, attempted, scheduled)
- **Stats:** Total archived, avg score, unique topics
- **Search/Sort:** By title, topic, date, score
- **RC Card:** Title, date, topic tags, attempted, score, buttons
- **Badges:** Attempted, score, topic tags

---

## 14. Test Screens

- **Today’s RC:** List, title, date, topic tags, attempted, score, buttons
- **Test Taking:** Fullscreen, instructions, prevent back, timer, autosave, palette, legend, section info, user card, answer selection, mark for review, navigation, submit, modals, modes, bottom bar, error/loading

---

## 15. Tags/Badges/Icons Used Across Screens

- **Tags:** Attempted, Score, Topic, Plan, Offer, Recommended, PB (commented out), Subscription, Feedback Required
- **Icons:** Trophy, Medal, Award, Target, TrendingUp, Clock, Calendar, BookOpen, CreditCard, AlertCircle, HelpCircle, Star, User, etc.

---

**This document covers all user-side screens and features. For admin or backend mapping, see additional documentation.**
