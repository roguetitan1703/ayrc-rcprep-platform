### **User & Admin Flows (Version 2.0)**

**Executive Summary:** This document outlines every user journey for both Aspirants and Administrators on the ARC platform. It incorporates the "Deep Focus" design theme and a revised logic for the daily practice and pilot phase feedback lock. The core change is that the two daily RCs are presented as independent tasks; the feedback lock for the next day's content is triggered only after **both** of the current day's RCs are completed.

---

### **Part 1: The Aspirant Journey**

This section covers every scenario for the end-user, from their first visit to daily usage and account management.

#### **Flow 1.1: First-Time User Onboarding**

* **Goal:** To convert a new visitor into a registered, active user who understands the core value of the platform.  
1. External Site (Landing Page)  
   * User reads the value proposition ("Master VARC with daily, focused practice").  
   * **Action:** Clicks the primary amber button: Sign Up For Free.  
   * **➔** Registration Screen  
2. Registration Screen  
   * User fills in their Name,Phone Number, Email, and Password.  
   * **Action:** Clicks Create Account.  
   * **➔** Onboarding Flow (3-Step Modal)   
3. Onboarding Flow  
   * The user is presented with the 3-step "Mastery Narrative" modal.(Content is to be written)  
   * **Action:** Clicks Start My First RC on the final step.  
   * **➔** Dashboard

#### **Flow 1.2: Daily Practice & The Feedback Lock**

* **Goal:** To guide the user through their daily practice and enforce the feedback loop to unlock future content during the pilot.  
1. Dashboard  
   * The user sees a section titled **"Today's Practice: August 24, 2025"**.  
   * Within this section are two distinct cards:  
     * RC \#1: \[Passage Topic\] with a Start Test button.  
     * RC \#2: \[Passage Topic\] with a Start Test button.  
   * **Action:** User clicks Start Test on either RC card.  
   * **➔** Test Screen  
2. Test Screen  
   * User completes the timed RC (4 questions).  
   * **Action:** Clicks Submit Test.  
   * **➔** Results Screen  
3. Results Screen  
   * User sees their score for that specific RC (e.g., "Score: 3/4").  
   * **Action:** Clicks View Analysis.  
   * **➔** Analysis Screen  
4. Analysis Screen  
   * User reviews the detailed explanations for the 4 questions.  
   * **Action:** Clicks Back to Dashboard.  
   * **➔** Dashboard  
5. Dashboard (Updated State)  
   * The card for the completed RC now shows its status: Attempted (Score: 3/4). The other card remains as Start Test. The user can attempt the second RC at any time.  
6. Dashboard (Feedback Lock Trigger)  
   * **Once both of today's RCs have the status "Attempted"**, a new prominent banner or card appears at the top of the dashboard.  
   * **Banner Text:** "Great work today\! Provide quick feedback to unlock tomorrow's RCs."  
   * **Action:** User clicks the amber button on the banner: Give Feedback.  
   * **➔** Feedback Screen  
7. Feedback Screen  
   * User answers the brief MCQ and optional text question about their experience that day.  
   * **Action:** Clicks Submit & Unlock.  
   * **➔** Dashboard (with a success message: "Thanks\! Your next RCs are unlocked.")

#### **Flow 1.3: Reviewing & Re-attempting Past RCs**

* **Goal:** To allow users to revisit past material for revision and practice without time pressure.  
1. Dashboard  
   * User scrolls down to the **"RC Archive"** list, which shows all previous days' RCs.  
   * **Action:** Clicks on any previously attempted RC.  
   * **➔** Test Screen (Practice Mode)  
2. Test Screen (Practice Mode)  
   * The interface is the same, but with key differences:  
     * The timer is hidden or inactive.  
     * A View Solution button is available for each question, allowing immediate access to explanations.  
     * A Reset & Re-attempt button is available to clear all previous answers for a fresh try.  
   * **Action:** User reviews content or re-attempts the test. They can navigate back to the dashboard at any time.

#### **Flow 1.4: Account Management (Profile & Security)**

* **Goal:** To allow users to manage their personal details and password.  
1. Dashboard  
   * **Action:** User clicks the Profile icon in the top navigation bar.  
   * **➔** User Profile Screen  
2. User Profile Screen  
   * The user can edit their name or use the "Change Password" form.  
   * **Action 1:** Changes name and clicks Save Changes.  
   * **Action 2:** Fills out password fields and clicks Update Password.  
   * A success/error message is displayed, and the user remains on the profile screen.

#### **Flow 1.5: Account Management (Password Reset)**

* **Goal:** To provide a secure way for users to regain access to their account if they forget their password.  
1. Login Screen  
   * **Action:** User clicks the Forgot Password? link.  
   * **➔** Request Reset Screen  
2. Request Reset Screen  
   * User enters their account email.  
   * **Action:** Clicks Send Reset Link.  
   * **➔** Confirmation Screen ("Check your email...")  
3. User's Email Inbox  
   * User receives an email with a unique, time-sensitive link.  
   * **Action:** Clicks the link.  
   * **➔** Reset Password Page  
4. Reset Password Page  
   * User sets and confirms a new password.  
   * **Action:** Clicks Reset Password.  
   * **➔** Login Screen (with a success message: "Password reset successfully. Please log in.")

---

### **Part 2: The Admin Journey (Kunal's Workflow)**

This section covers the scenarios for the content administrator.

#### **Flow 2.1: Admin Login & Access**

1. Browser  
   * Admin navigates to a specific URL (e.g., arcprep.com/admin).  
   * **➔** Admin Login Screen  
2. Admin Login Screen  
   * Admin enters their specific admin credentials.  
   * **Action:** Clicks Admin Login.  
   * **➔** Admin Dashboard

#### **Flow 2.2: Content Creation & Management**

* **Goal:** To create, edit, and manage the library of RC passages and questions.  
1. Admin Dashboard  
   * The admin sees a table of all existing RCs and their status (Draft, Scheduled, Live).  
   * **Action:** Clicks the primary amber button Upload New RC.  
   * **➔** RC Upload/Edit Screen  
2. RC Upload/Edit Screen  
   * Admin fills in all the details for a new RC set: Title, Passage Text, Source, Topic, 4 Questions, 4 sets of Options, 4 Correct Answer selections, and 4 Detailed Explanations.  
   * **Action:** Clicks Save Draft.  
   * **➔** Admin Dashboard (with the new RC appearing in the list with "Draft" status).

#### **Flow 2.3: Scheduling Daily Content**

* **Goal:** To assign specific RCs to be published on specific dates for the users.  
1. Admin Dashboard  
   * Admin finds the RCs they want to schedule (which are in "Draft" status).  
   * **Action:** Clicks Edit on a specific RC.  
   * **➔** RC Upload/Edit Screen  
2. RC Upload/Edit Screen  
   * Admin uses a **Date Picker** element on the form to assign a publication date (e.g., September 15, 2025).  
   * Admin changes the status from "Draft" to Scheduled.  
   * **Action:** Clicks Update.  
   * **➔** Admin Dashboard (The RC now shows its status as "Scheduled" for the chosen date). On that date at midnight, the system will automatically make it visible to all users.

