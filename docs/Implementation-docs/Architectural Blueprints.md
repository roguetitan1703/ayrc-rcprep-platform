# Blueprint

**Disabled States:** We will define a disabled state for our components: they will have a `neutral-grey` background and reduced opacity.  
**Result Score Coloring:** **Decision:** 4/4 \= Green. 3/4 \= Amber. 2/4 or less \= standard text color (no special coloring).  
**Tablet Responsiveness:** We will define a standard set of breakpoints (`sm`, `md`, `lg`, `xl`) in the `tailwind.config.js` file to be used consistently across the application.  
**Font Usage:** **Decision:** We will establish a clear hierarchy. `Poppins` (sans) will be used for all headings and UI elements (buttons, labels). `Inter` (serif) will be used exclusively for the body text of the RC Passages themselves, for optimal long-form readability.  
**Streak Definition:** A "Daily Streak" is maintained by **completing at least one RC for the day.** Logging in or starting is not enough.  
**Admin Preview Flow:** The "Preview" button will open the `Test Screen` in a special "Admin Preview Mode," allowing the admin to see exactly what the user will see, but without a timer or the ability to save an attempt.  
**Static Content Management:** **Decision:** We will use a **single JSON document within the codebase** to manage the content for pages like "About Us" and "ToS". The admin will not have a CMS for this in the MVP.  
**Scheduling Enforcement:** We will add a view in the admin panel (e.g., a calendar view) that  visually shows how many RCs are scheduled for each day. If a day has more or less than two, it will be flagged with a warning icon. We will not hard-block the admin but will provide a clear warning to prevent mistakes.

### **The Aspirant Dashboard**

* **Theme:** "Deep Focus" (Dark charcoal background \#1A1B26, amber accents \#FFC107).  
* **Purpose:** To serve as the user's home base, showing daily tasks, tracking progress, and providing access to their entire practice history.

#### **Components**

1. **Top Navigation Bar (Fixed)**  
   * **ARC Logo:** Left-aligned, in the primary amber brand color.  
   * **User Profile Icon:** Right-aligned. Clicking this navigates to the User Profile Screen.  
   * **Logout Button:** Next to the profile icon.  
2. **Main Content Area**  
   * **(Component A) "Daily Feedback" Banner**  
     * A prominent banner at the very top.  
     * **Content:** "Great work today\! Provide quick feedback to unlock tomorrow's RCs." Includes an amber Give Feedback button.  
     * **State Logic:** This component is **hidden by default**. It becomes **visible ONLY when both of today's RCs are marked as 'Attempted'** and the feedback for the day has not yet been submitted.  
   * **(Component B) "Today's Practice" Section**  
     * **Heading:** Displays the current date (e.g., "August 24, 2025").  
     * **RC Card 1:** A distinct card for the first RC. Contains RC title (e.g., "RC \#1: Philosophy of Mind") and its current state.  
     * **RC Card 2:** A second distinct card for the day's other RC.  
     * **State Logic for RC Cards:**  
       * **Default State:** Card shows a primary amber Start Test button.  
       * **Completed State:** The Start Test button is replaced with Attempted (Score: 3/4). The text is in a success-green color. The card is still clickable to navigate to the Analysis Screen.  
   * **(Component C) Stats Row**  
     * A horizontal row of three smaller, distinct cards to show key metrics.  
     * **Card 1:** "RCs Attempted" with a large number.  
     * **Card 2:** "Overall Accuracy" with a percentage.  
     * **Card 3:** "Daily Streak" with a number and a fire icon 🔥.  
   * **(Component D) "RC Archive" List**  
     * **Heading:** "Practice History"  
     * **Content:** A scrollable list of all previously completed RCs, grouped by date. Each list item shows the RC Title, the user's score, and is clickable to go to the Analysis Screen for that RC.

#### **Logic & States**

* **Data Loading State:** On initial load, the main content area will show a subtle loading animation (e.g., skeleton placeholders that mimic the layout) to prevent a blank screen flash.  
* **Empty State (Day 1 User):** The "RC Archive" will display a friendly message: "Your practice history will appear here once you complete your first RC." The Stats Row will show "0" for all metrics.  
* **Error State:** If data cannot be fetched from the server, a simple message will appear: "Could not load dashboard. Please check your connection and refresh."  
* **Date Logic:** The "Today's Practice" section dynamically updates at midnight IST. If a user is on the site during the changeover, the dashboard will prompt them to refresh to see the new day's RCs.

---

### **Sanity Check for the Dashboard Blueprint**

Let's apply our new review process.

1. **Completeness Check (Is this all?):**  
   * Yes. The user can initiate their primary tasks (start today's RCs), track their core metrics (stats), review past work (archive), manage their account (profile icon), and complete the pilot loop (feedback banner). All key goals are accessible from here.  
2. **Cohesion Check (Is this logical?):**  
   * Yes. The flow is logical. The dashboard is the central hub. Clicking Start Test correctly leads to the Test Screen. Clicking a completed RC or an archived item leads to the Analysis Screen. The feedback banner only appears after the prerequisite actions are completed, creating a logical progression gate.  
3. **Edge Case Check (Did we miss a key part?):**  
   * **Day 1 User:** Covered by the "Empty State" logic.  
   * **Data Fails to Load:** Covered by the "Error State" logic.  
   * **Admin Forgets to Upload RCs:** This is a good one. We need to add a state for this.  
     * **Missing Content State:** If the user logs in and no RCs are scheduled for that day, the "Today's Practice" section should display a message like: "Today's RCs are being prepared. Please check back shortly\!" This is better than showing a broken or empty area.

.

---

### **Blueprint: The Test Screen 📝**

* **Theme:** "Deep Focus" (Dark charcoal background \#1A1B26, amber accents \#FFC107).  
* **Purpose:** To provide a focused, exam-like environment for the user to read the RC passage and answer the corresponding questions under a timer, optimized for both desktop and mobile platforms.

---

### **Desktop View**

* **Layout:** A three-column layout designed for wide screens, mimicking traditional exam software to build user familiarity and minimize cognitive load.

#### **Components (Desktop)**

1. **Top Header (Fixed)**  
   * **RC Title:** Left-aligned (e.g., "RC \#1: Philosophy of Mind").  
   * **Timer:** Center-aligned, prominent. Displays **"Time Remaining:"** in the primary amber color.  
   * **User Profile Icon:** Right-aligned.  
2. **Left Panel (RC Passage)**  
   * A large, vertically scrollable area occupying \~60% of the screen width, displaying the full RC passage text.  
   * **Functionality:** Copy-paste is enabled.  
3. **Right Panel (Question & Options)**  
   * Occupies \~40% of the screen width.  
   * **Header:** "Question \[X\] of 4".  
   * **Question Text:** The full text of the current question.  
   * **Options:** Four radio button options (A, B, C, D) with their corresponding text.  
4. **Far-Right Gutter (Question Palette)**  
   * A fixed, vertical grid of 4 numbered buttons for at-a-glance status and quick navigation.  
   * **State Logic (Color-Coded):**  
     * **Not Visited:** Neutral Grey (\#4A4A5A).  
     * **Not Answered (Current):** Amber outline.  
     * **Answered:** Success Green (\#19D895).  
     * **Marked for Review:** Amber fill (\#FFC107).  
     * **Answered & Marked for Review:** Green fill with an amber dot in the corner.  
5. **Bottom Footer (Fixed)**  
   * **Mark for Review button:** Amber text/border. Toggles the "Marked for Review" state.  
   * **Clear Response button:** Neutral grey text. Clears the current selection.  
   * **Save & Next button:** Primary amber button. Saves the current answer and moves to the next question.  
   * **Submit Test button:** Replaces Save & Next on the final question.

---

### **Mobile View**

* **Layout:** A vertically stacked, single-column layout optimized for touch interaction and smaller viewports. The key elements (timer, passage, question, navigation) are always accessible.

#### **Components (Mobile)**

1. **Top Header (Fixed)**  
   * **RC Title:** Left-aligned, possibly truncated with an ellipsis if too long.  
   * **Timer:** Right-aligned, prominent amber text.  
2. **Main Content Area (Vertically Scrollable)**  
   * **Passage Section:** Occupies the top \~50-60% of the viewport. The passage text is displayed here. If the text exceeds the allocated space, this section has its own internal scrollbar to ensure the question below remains visible.  
   * **Question & Options Section:** Occupies the remaining \~30-40% of the viewport. Contains the "Question \[X\] of 4" header, question text, and radio button options. The user can scroll this entire main area to see all content.  
3. **Bottom Navigation Footer (Fixed)**  
   * This is the primary interaction hub for mobile.  
   * **Prev Button:** A left arrow icon to navigate to the previous question.  
   * **Horizontal Question Palette:** A set of four small, circular, color-coded buttons (1, 2, 3, 4) showing the test status, exactly like the desktop palette.  
   * **Next Button:** A right arrow icon to navigate to the next question.  
   * **More Options (...) Button:** A button with three dots that opens a small pop-up menu containing the Mark for Review and Clear Response actions.  
   * **Submit Button:** When the user is on the final question, the Next button becomes a primary amber Submit button.

---

### **Shared Logic & States (Applies to both views)**

* **Timer Logic:** The timer starts on screen load. At 00:00, the test is **auto-submitted**, and the user is navigated to the Results Screen, regardless of their progress.  
* **State Saving:** The user's selections and "Marked for Review" status for each question are saved to the device's local state instantly upon interaction. This state is synced with the server every 30 seconds and upon final submission.  
* **Practice Mode:** When accessed from the RC Archive, the screen enters "Practice Mode": the timer is hidden, and a View Solution button appears in the More Options (...) menu on mobile or the bottom footer on desktop.  
* **API Interaction:** On load, the screen fetches the passage and all 4 questions from the server. On submission, it sends an array of the user's answers back to the server for grading.

---

### **Sanity Check for the Test Screen Blueprint**

1. **Completeness Check (Is this all?):**  
   * Yes. Both views provide the full range of functionality required: reading, answering, timed conditions, navigation, and status tracking. The mobile view cleverly condenses the palette and secondary actions to maintain a clean interface without sacrificing capability.  
2. **Cohesion Check (Is this logical?):**  
   * Yes. The component serves as the logical bridge between the Dashboard (where a test is initiated) and the Results Screen (where performance is displayed). The user experience is consistent, just adapted for different screen sizes.  
3. **Edge Case Check (Did we miss a key part?):**  
   * **Responsiveness (Tablets):** For screen sizes in between mobile and desktop (e.g., tablets), the layout will use the desktop split-screen view, as it provides the best experience when horizontal space is available. We'll set a specific breakpoint (e.g., 768px width) to switch between mobile and desktop layouts.  
   * **User Leaves Mid-Test:** A browser confirmation prompt ("Are you sure you want to leave?") will be triggered to prevent accidental exits.  
   * **Internet Loss:** The state-saving logic (saving to local state) ensures that if a user loses connection, their answers up to that point are not lost. They can submit once reconnected.  
   * **Accessibility:** The "Deep Focus" dark mode with off-white text and amber accents provides high contrast. Font sizes will be responsive to ensure readability on mobile. Touch targets on mobile (buttons, radio options) will be large enough for easy interaction.

Of course. Here are the detailed blueprints for the next two screens in the user flow: the **Results Screen** and the **Analysis Screen**.

---

### **Blueprint: The Results Screen 🏆**

* **Theme:** "Deep Focus"  
* **Purpose:** To provide the user with immediate, clear, and concise feedback on their performance right after submitting a test, and to guide them to the detailed analysis.

---

### **Desktop View**

* **Layout:** A clean, centered modal or card-based layout that focuses the user's attention on their score and the primary call-to-action.

#### **Components (Desktop)**

1. **Main Results Card**  
   * **Header:** "Result: RC \#1 \- \[Passage Topic\]"  
   * **Score Display:** A very large, prominent score (e.g., "**3/4**") in the center of the card. The score is color-coded: amber for average performance, green for excellent performance (e.g., 4/4).  
   * **Feedback Statement:** A short, encouraging message below the score, such as "Well done\!" or "Good effort, now let's analyze."  
   * **Quick Stats:** Two small data points for context:  
     * "Accuracy: **75%**"  
     * "Time Taken: **06:45**"  
   * **Call-to-Action (CTA):** A large, primary amber button at the bottom of the card: View Detailed Analysis.

---

### **Mobile View**

* **Layout:** A full-screen view that presents the same information in a vertically stacked, easy-to-read format.

#### **Components (Mobile)**

1. **Header:** "Test Result"  
2. **Score Display:** A large, centered score "**3/4**", color-coded as on desktop.  
3. **Feedback Statement:** The same encouraging text.  
4. **Stats Section:**  
   * "Accuracy: **75%**"  
   * "Time Taken: **06:45**"  
5. **Fixed Bottom Button:** A full-width, primary amber View Detailed Analysis button fixed to the bottom of the screen for easy access.

---

### **Shared Logic & States**

* **Data:** This screen receives the final score, accuracy, and time taken from the completed test session.  
* **Navigation:** Clicking the View Detailed Analysis CTA is the primary action and navigates the user to the Analysis Screen. A secondary "Back to Dashboard" link might be present in the header.

---

### **Sanity Check for the Results Screen**

1. **Completeness Check:** Yes. It provides all the immediate information a user needs post-test: their score, accuracy, and time. It has a single, clear purpose and CTA.  
2. **Cohesion Check:** Yes. It's the logical screen after submitting the Test Screen and flows directly into the Analysis Screen.  
3. **Edge Case Check:**  
   * **Perfect Score:** If a user scores 4/4, the feedback statement can be more celebratory: "Excellent work\! Perfect score\!".  
   * **Low Score:** If a user scores 0/4 or 1/4, the message can be more encouraging: "A great learning opportunity. Let's see what we can improve."

---

---

### **Blueprint: The Analysis Screen 🔬**

* **Theme:** "Deep Focus"  
* **Purpose:** To provide a detailed, question-by-question breakdown with expert explanations, enabling the user to understand their mistakes and learn from them. This is a core feature of the platform.

---

### **Desktop View**

* **Layout:** A two-panel layout. The left side lists the questions for easy navigation, and the right, larger side displays the detailed analysis of the selected question.

#### **Components (Desktop)**

1. **Left Panel (Question Navigator)**  
   * A scrollable list of all 4 questions from the test.  
   * Each list item shows "Question 1", the user's result (a green ✓ for correct, a red X for incorrect), and is clickable. The currently selected question is highlighted with an amber border.  
2. **Right Panel (Detailed Analysis)**  
   * **Question Display:** The full text of the selected question.  
   * **Your Answer Section:** Shows the option the user selected, clearly marked as "Correct" (green) or "Incorrect" (red). The correct answer is always shown for comparison.  
   * **Detailed Explanation Section:** A large, well-formatted text area with the comprehensive expert explanation. Copy-paste is enabled here.  
   * **(Pilot Phase) Feedback Input:** The small section asking "Why did you get this wrong?" with radio button options.

---

### **Mobile View**

* **Layout:** A single-column, scrollable layout. A top tab bar allows the user to switch between questions.

#### **Components (Mobile)**

1. **Top Tab Bar (Fixed)**  
   * A horizontal bar with 4 tabs, one for each question (e.g., "Q1", "Q2", "Q3", "Q4").  
   * Each tab is color-coded with a small green ✓ or red X to indicate the user's result for that question. The active tab has an amber underline.  
2. **Main Content Area (Scrollable)**  
   * All the components from the desktop's right panel are stacked vertically:  
     * Question Display  
     * Your Answer Section  
     * Detailed Explanation Section  
     * (Pilot Phase) Feedback Input

---

### **Shared Logic & States**

* **Data:** On load, this screen fetches the user's answers, the correct answers, and the detailed explanations for all 4 questions.  
* **Interactivity:** Clicking a question in the navigator (desktop) or a tab (mobile) updates the main content area with the corresponding data.  
* **Navigation:** A clear Back to Dashboard button is present in the header.

---

### **Sanity Check for the Analysis Screen**

1. **Completeness Check:** Yes. It provides a full breakdown of performance, shows the user's choice vs. the correct answer, and delivers the core value proposition: the detailed explanation.  
2. **Cohesion Check:** Yes. It's the natural destination from the Results Screen. After analysis, the user's journey is complete for that RC, so navigating back to the Dashboard is the logical next step.  
3. **Edge Case Check:**  
   * **No Attempt:** If a user did not answer a question, the "Your Answer" section should clearly state "Not Answered".  
   * **Practice Mode Analysis:** If accessed from the RC archive in "Practice Mode", the user-feedback input section ("Why did you get this wrong?") would be hidden, as it's only relevant for the first, timed attempt.

The next screen is the **Feedback Screen**.

It's the final, crucial step in the daily practice loop for the pilot phase. This is the screen that collects user insights and acts as the gatekeeper to unlock the next day's content.

Here is its detailed blueprint.

---

### **Blueprint: The Feedback Screen 💡**

* **Theme:** "Deep Focus"  
* **Purpose:** To gather structured, actionable feedback from pilot users about their daily experience and to serve as the mandatory gate to unlock the following day's set of RCs.

---

### **Desktop View**

* **Layout:** A clean, focused modal or a centered card that overlays the dashboard. This directs the user's full attention to the single task of providing feedback.

#### **Components (Desktop)**

1. **Header Section**  
   * **Headline:** A motivating call-to-action: "**Unlock Tomorrow's Challenge**"  
   * **Sub-headline:** "Your 60-second feedback helps us build a better ARC for you."  
2. **MCQ Feedback Section**  
   * **Question 1:** "How would you rate the difficulty of today's passages?"  
     * Radio button options: ( ) Too Easy ( ) Just Right ( ) Challenging ( ) Very Difficult  
   * **Question 2:** "Were the question explanations clear and helpful?"  
     * Radio button options: ( ) Very Clear ( ) Mostly Clear ( ) A Bit Confusing ( ) Not Helpful  
3. **Descriptive Feedback Section**  
   * **Prompt:** "What was the most challenging part for you today? (Optional)"  
   * **Component:** A multi-line text input area with a subtle border.  
4. **Call-to-Action (CTA)**  
   * A large, primary amber button at the bottom: Submit & Unlock.

---

### **Mobile View**

* **Layout:** A full-screen, single-column view that presents the feedback form in a simple, scrollable format.

#### **Components (Mobile)**

1. **Header Section**  
   * The same "Unlock Tomorrow's Challenge" headline and sub-headline, stacked vertically.  
2. **Feedback Form**  
   * The MCQ questions and the descriptive text area are stacked cleanly, with ample spacing for easy touch interaction.  
3. **Fixed Bottom Button**  
   * A full-width, primary amber Submit & Unlock button is fixed to the bottom of the screen, always accessible without scrolling.

---

### **Shared Logic & States**

* **Access Logic:** This screen can only be accessed by clicking the "Daily Feedback" banner on the Dashboard, which only appears after both of the day's RCs are completed.  
* **Submission Logic:** When the user clicks Submit & Unlock, the feedback data is sent to the server. The server then flags the user's account as having completed feedback for that specific date. Upon successful submission, the user is redirected back to the Dashboard.  
* **Post-Submission State:** After a successful submission, the user is shown a success message on the Dashboard (e.g., "Thanks\! You're all set for tomorrow.") and the "Daily Feedback" banner for the current day is permanently hidden.

---

### **Sanity Check for the Feedback Screen**

1. **Completeness Check (Is this all?):**  
   * Yes. It captures both quantitative (MCQ) and qualitative (text) feedback, fulfilling its data collection purpose. It also clearly communicates its function as a gatekeeper for future content.  
2. **Cohesion Check (Is this logical?):**  
   * Yes. It logically follows the completion of the day's practice. After submission, it correctly returns the user to the Dashboard, completing the daily loop.  
3. **Edge Case Check (Did we miss a key part?):**  
   * **Incomplete Form:** The Submit & Unlock button should be disabled until the mandatory MCQ questions are answered.  
   * **Submission Error:** If the feedback fails to submit due to a network error, an error message ("Could not submit feedback. Please try again.") should appear, and the button should become active again.  
   * **Multiple Submissions:** The system logic will prevent this. Once feedback for a given day is submitted, the entry point (the dashboard banner) disappears, making it impossible to submit again.

Of course. Adding a phone number is a good step for account identity. We'll add it as a non-editable field on the profile and adjust the relevant flows.

This change implies that we will also need to update the **Registration Screen** blueprint later to include a mandatory phone number field.

### **Blueprint: The User Profile Screen**

* **Theme:** "Deep Focus"  
* **Purpose:** To provide a secure and straightforward interface for users to view their account identifiers, manage their name, and change their password.

---

### **Desktop View**

* **Layout:** A single, centered card on a dimmed background.

#### **Components (Desktop)**

1. **Main Profile Card**  
   * **Header:** "Your Profile"  
   * **Profile Information Section:**  
     * **Email:** Displayed as non-editable text (e.g., user@email.com).  
     * **Phone Number:** Displayed as non-editable text (e.g., \+91 \*\*\*\*\*\*\*\*78).  
     * **Name:** A text input field pre-filled with the user's current name, followed by an amber Save button.  
   * **Change Password Section:**  
     * A horizontal divider separates this section.  
     * **Header:** "Change Password"  
     * **Input Fields:** "Current Password," "New Password," and "Confirm New Password" stacked vertically.  
     * **Button:** A primary amber Update Password button at the bottom of the card.

---

### **Mobile View**

* **Layout:** A clean, full-screen, single-column view.

#### **Components (Mobile)**

1. **Header:** "Your Profile"  
2. **Profile Information Section:**  
   * The Email, Phone Number, and Name fields are presented, stacked vertically. The Save button appears below the Name field.  
3. **Change Password Section:**  
   * The "Change Password" header and its three input fields are stacked below the profile section.  
4. **Fixed Bottom Button:** The Update Password button is fixed to the bottom of the screen.

---

### **Shared Logic & States**

* **Name Update:** On Save click, the button shows a loading state, an API call is made, and a success ("Name updated\!") or error message is displayed.  
* **Password Update:**  
  * **Client-Side Validation:** Checks if new passwords match and meet strength requirements.  
  * **Server-Side Validation:** Verifies the "Current Password" is correct.  
  * **Success:** Password is changed, a success message is shown, and all other active sessions for that user are logged out for security.

---

### **Sanity Check for the User Profile Screen**

1. **Completeness Check:** Yes. Users can view their fixed identifiers (email, phone), update their editable info (name), and manage security (password).  
2. **Cohesion Check:** Yes. It's logically accessed from the Dashboard. All actions keep the user on this screen with clear feedback.  
3. **Edge Case Check:**  
   * **Data Origin:** The non-editable Email and Phone Number are set during registration. This screen is for viewing only.  
   * **Password Strength:** Password strength indicators will be included to guide the user.

---

### **Blueprint: The Password Reset Flow** 

* **Theme:** "Deep Focus"  
* **Purpose:** To provide a secure, multi-step process for users to regain account access, allowing them to initiate the process with either their email or phone number.

---

### **Screen 1: Request Reset Screen**

* **Layout (Desktop & Mobile):** A simple, centered form, identical on both platforms.

#### **Components**

1. **Header:** "Forgot Password?"  
2. **Instructional Text:** "Enter the email or phone number associated with your account. We'll send a reset link to your registered email address."  
3. **Input Field:** "Email or Phone Number"  
4. **Button:** A primary amber Send Reset Link button.

---

### **Screen 2: Confirmation Screen**

* **Layout (Desktop & Mobile):** A centered, static message, identical on both platforms.

#### **Components**

1. **Icon:** A large email icon. 📧  
2. **Header:** "Check Your Email"  
3. **Text:** "If an account with that email or phone number exists, a reset link has been sent to the registered email address. Please check your inbox."  
4. **Button:** A secondary Back to Login button.

---

### **Screen 3: Reset Password Page**

* **Layout (Desktop & Mobile):** Another simple, centered form, accessible only via the unique link from the email.

#### **Components**

1. **Header:** "Create a New Password"  
2. **Input Field:** "New Password" (with strength requirements displayed).  
3. **Input Field:** "Confirm New Password"  
4. **Button:** A primary amber Reset Password button.

---

### **Shared Logic & States (for the entire flow)**

* **Initiation:** The system accepts either an email or a phone number to identify the user's account.  
* **Security:** Regardless of the input method, the secure, single-use, time-limited reset token is **always sent to the registered email address** associated with the found account. We will not implement SMS-based resets in this version.  
* **Token Validation:** The Reset Password Page is only functional if the URL contains a valid, non-expired token.  
* **Finalization:** Upon successful reset, the token is invalidated, the password is changed, and the user is redirected to the Login Screen with a success message.

---

### **Sanity Check for the Password Reset Flow**

1. **Completeness Check:** Yes. The flow allows initiation with either key identifier and provides a secure, email-based method for completing the reset.  
2. **Cohesion Check:** Yes. Each screen logically leads to the next, with clear instructions for the user.  
3. **Edge Case Check:**  
   * **Unregistered Identifier:** The confirmation screen's generic message handles this securely, preventing account enumeration.  
   * **Invalid/Expired Token:** The user is safely informed on the Reset Password Page and guided to restart the process.  
   * **Account with No Email (Future-proofing):** Our current logic mandates an email for every account for this flow to work. This is a sound decision for the MVP.

---

### **Blueprint: The Registration Screen 🚀**

* **Theme:** "Deep Focus"  
* **Purpose:** To provide a simple, secure, and welcoming entry point for new users to create their ARC account.

---

### **Desktop View**

* **Layout:** A two-panel layout. The left panel contains a strong marketing statement or image, while the right panel contains the registration form. This adds visual appeal and reinforces the brand value.

#### **Components (Desktop)**

1. **Left Panel (Brand Reinforcement)**  
   * **Background:** A subtle, high-quality image related to focus or learning (e.g., a well-lit desk, an abstract neural network).  
   * **Text:** A powerful tagline like "**Master VARC. One Day at a Time.**" in large, amber letters.  
2. **Right Panel (Registration Form)**  
   * **Header:** "Create Your Account"  
   * **Input Field:** "Full Name"  
   * **Input Field:** "Email Address"  
   * **Input Field:** "Phone Number"  
   * **Input Field:** "Password" (with a toggle to show/hide the password).  
   * **Legal Text:** A small checkbox with the text "I agree to the **Terms of Service** and **Privacy Policy**." The bolded parts are links to the static pages.  
   * **Button:** A primary amber Sign Up button.  
   * **Footer Link:** A simple text link: "Already have an account? **Log In**"

---

### **Mobile View**

* **Layout:** A single-column layout. The brand reinforcement is integrated at the top, followed by the form.

#### **Components (Mobile)**

1. **Header Section**  
   * The "Master VARC. One Day at a Time." tagline is displayed prominently at the top.  
2. **Registration Form**  
   * The "Create Your Account" header and all input fields are stacked vertically.  
3. **Footer Section**  
   * The legal checkbox, Sign Up button, and the "Log In" link are at the bottom. The Sign Up button is full-width.

---

### **Shared Logic & States**

* **Validation:** All fields are mandatory. The form performs real-time validation (e.g., checking if the email format is valid, if the phone number is 10 digits, if the password meets strength requirements).  
* **Submission:** On clicking Sign Up, the system checks if the email or phone number is already registered.  
  * **Success:** If unique, the account is created, and the user is automatically logged in and redirected to the Onboarding Flow.  
  * **Failure:** If the email/phone exists, a clear error message is shown ("This email is already registered.").

---

### **Sanity Check**

1. **Completeness Check:** Yes. It collects all necessary information for account creation (Name, Email, Phone, Password) and includes the mandatory legal agreement.  
2. **Cohesion Check:** Yes. It's the logical entry point for new users from the Landing Page. Upon success, it correctly flows into the Onboarding Flow.  
3. **Edge Case Check:**  
   * **Invalid Data:** Strong client-side validation prevents the user from submitting the form with invalid data, providing instant feedback.  
   * **Duplicate Account:** The server-side check prevents duplicate accounts, protecting data integrity.

---

### **Blueprint: The Login Screen 🔑**

* **Theme:** "Deep Focus"  
* **Purpose:** To provide a quick, secure, and easy way for existing users to access their accounts.

---

### **Desktop View**

* **Layout:** A similar two-panel layout to the registration screen for brand consistency.

#### **Components (Desktop)**

1. **Left Panel (Brand Reinforcement)**  
   * Same as the registration screen.  
2. **Right Panel (Login Form)**  
   * **Header:** "Welcome Back"  
   * **Input Field:** "Email or Phone Number"  
   * **Input Field:** "Password" (with show/hide toggle).  
   * **Link:** A Forgot Password? link aligned to the right, above the main button.  
   * **Button:** A primary amber Log In button.  
   * **Footer Link:** "Don't have an account? **Sign Up**"

---

### **Mobile View**

* **Layout:** A single-column layout, consistent with the mobile registration screen.

#### **Components (Mobile)**

1. **Header Section:** "Welcome Back" is the primary header.  
2. **Login Form:** The input fields are stacked vertically.  
3. **Footer Section:** The Forgot Password? link, full-width Log In button, and the Sign Up link are at the bottom.

---

### **Shared Logic & States**

* **Authentication:** On clicking Log In, the system sends the credentials to the server.  
  * **Success:** If credentials are valid, a session is created, and the user is redirected to their Dashboard.  
  * **Failure:** If credentials are invalid, a clear and generic error message is shown ("Invalid credentials. Please try again.").

---

### **Sanity Check**

1. **Completeness Check:** Yes. It has all the necessary elements for a user to log in or navigate to account recovery (Forgot Password?) or registration (Sign Up).  
2. **Cohesion Check:** Yes. It's the entry point for returning users and correctly directs them to the Dashboard on success.  
3. **Edge Case Check:**  
   * **Incorrect Credentials:** Handled by a clear error message without specifying whether the username or password was wrong (a security best practice).  
   * **Multiple Failed Attempts:** To prevent brute-force attacks, we can implement rate limiting (e.g., temporarily locking the account after 5 failed attempts).

---

### **Blueprint: The Landing Page 🌐**

* **Theme:** "Deep Focus"  
* **Purpose:** To serve as the public-facing marketing page. Its sole purpose is to clearly communicate ARC's value proposition and convert visitors into registered users.

#### **Layout & Components**

This is a single, scrollable page designed to tell a compelling story. It will be fully responsive, stacking into a single column on mobile.

1. **Navigation Bar (Top)**  
   * **ARC Logo:** Left-aligned.  
   * **Links:** "Features," "How It Works."  
   * **Buttons:** A secondary Log In button and a primary amber Sign Up For Free button.  
2. **Hero Section (Above the Fold)**  
   * **Headline:** "**Master VARC. One Day at a Time.**"  
   * **Sub-headline:** "Stop generic reading. Start acing CAT-level Reading Comprehension with daily, focused practice and expert analysis."  
   * **Primary CTA:** A large, amber Sign Up & Start Your Free Trial button.  
3. **Problem Section**  
   * **Header:** "Why 'Just Reading More' Doesn't Work"  
   * **Content:** Three small cards with icons, explaining the core problems: **Untested Comprehension**, **Difficulty Mismatch**, and **Lack of Reliable Questions**.  
4. **Solution Section ("Features")**  
   * **Header:** "The ARC Method: Deliberate Practice"  
   * **Content:** Three feature blocks explaining our solutions: **Daily CAT-Level Passages**, **Expert-Crafted Questions & Explanations**, and **Actionable Analytics**.  
5. **"How It Works" Section**  
   * **Header:** "Start Improving in 3 Simple Steps"  
   * **Content:** A simple visual graphic showing:  
     3. **Practice Daily:** Complete your 2 daily RCs.  
        4. **Analyze Deeply:** Review expert explanations.  
        5. **Track Mastery:** Watch your accuracy and speed improve.  
6. **Final CTA Section**  
   * **Header:** "Turn Your Biggest Weakness Into Your Greatest Strength."  
   * **CTA:** A final, prominent Sign Up For Free button.

#### **Shared Logic & States**

* **Navigation:** All Sign Up buttons navigate to the Registration Screen. The Log In button navigates to the Login Screen. The internal links ("Features," etc.) scroll smoothly to the corresponding section on the page.

---

### **Sanity Check**

1. **Completeness Check:** Yes. It tells a complete story from problem to solution and provides multiple, clear opportunities for a user to convert.  
2. **Cohesion Check:** Yes. It serves as the main entry funnel into the application, linking correctly to the registration and login flows.  
3. **Edge Case Check:** The primary edge case is responsiveness. The multi-column sections (Problem, Solution) must stack cleanly into a single column on mobile without losing readability or impact.

---

### **Blueprint: The Static Pages Template 📄**

* **Theme:** "Deep Focus"  
* **Purpose:** To provide a single, reusable template for all informational and legal content, ensuring consistency and saving development time.

#### **Layout & Components**

This is not a single page, but a template that will be used for multiple pages.

1. **Standard Site Header:** The same header used on the main application dashboard (with Profile/Logout links if the user is logged in).  
2. **Content Area:**  
   * A clean, centered content block with a maximum width for optimal readability (even on large screens).  
   * **Page Title:** A large, bold \<h1\> heading (e.g., "**About Us**").  
   * **Body:** A well-formatted text area where the specific content for each page will be placed. It will support standard formatting like paragraphs, bold text, and lists.  
3. **Standard Site Footer:** A simple footer containing links back to these static pages and copyright information.

#### **Pages Using This Template**

* **About Us:** Content describing ARC's mission, vision, and the team.  
* **Contact Us:** Simple contact information (e.g., support email).  
* **Terms of Service:** The legal terms for using the platform.  
* **Privacy Policy:** The legal policy regarding user data.

#### **Shared Logic & States**

* These pages are static. Their only logic is to display the formatted text content provided by the admin.

---

### **Sanity Check**

1. **Completeness Check:** Yes. This templated approach covers all necessary informational and legal pages required for launch.  
2. **Cohesion Check:** Yes. By using the standard site header and footer, these pages will feel like an integrated part of the application, not disconnected documents.  
3. **Edge Case Check:** The template must be fully responsive, ensuring the centered text column is readable and well-proportioned on all devices, from mobile to ultra-wide desktop monitors.

---

### **Blueprint: Admin Login Screen**

* **Theme:** "Deep Focus" (Functional variant)  
* **Purpose:** To provide simple, secure access to the content management system.

#### **Layout & Components (Desktop & Mobile)**

* A minimalist, centered form. The design is identical on all devices.  
  * **Header:** "ARC Admin Portal"  
  * **Input Field:** "Email"  
  * **Input Field:** "Password"  
  * **Button:** A primary amber Log In button.

#### **Shared Logic & States**

* **Authentication:** Standard credential check against a dedicated admin user table in the database.  
* **Security:** To prevent brute-force attacks, failed login attempts will be rate-limited. For the MVP, password reset for the admin account will be a manual process.

---

### **Sanity Check**

1. **Completeness Check:** Yes. It provides the necessary secure entry point for an administrator.  
2. **Cohesion Check:** Yes. It is the sole gateway to the Admin Dashboard.  
3. **Edge Case Check:** Rate limiting on failed attempts is the primary security consideration here, which we've noted.

---

---

### **Blueprint: Admin Dashboard**

* **Theme:** "Deep Focus" (Functional variant)  
* **Purpose:** To provide a comprehensive overview of all RC content and serve as the main hub for management actions.

#### **Layout & Components (Desktop-First)**

1. **Header**  
   * **ARC Logo:** Left-aligned. Title: "Admin Dashboard"  
   * **User Display:** "Welcome, Kunal"  
   * **Button:** Logout  
2. **Primary Actions**  
   * A prominent, amber \+ Upload New RC button at the top right.  
3. **Controls & Filters**  
   * **Search Bar:** To find an RC by its title.  
   * **Filter Dropdowns:** Filter the list by **Status** (Draft, Scheduled, Live) or by **Date**.  
4. **Content Table**  
   * The main component of the screen, displaying all RCs.  
   * **Columns:**  
     * **RC Title:** The title of the passage.  
     * **Status:** A color-coded badge (e.g., Grey for Draft, Blue for Scheduled, Green for Live).  
     * **Scheduled Date:** The date the RC is set to be published. Displays "---" if unscheduled.  
     * **Actions:** A set of icon buttons for each row: Edit, Preview, and Delete.

#### **Shared Logic & States**

* **Data:** The table fetches and displays all RC records from the database.  
* **Interactivity:** The search and filter controls update the displayed list in real-time. The Edit button navigates to the RC Upload/Edit Screen pre-filled with that RC's data.  
* **Responsiveness:** On mobile, this table would transform into a list of cards, with each card representing an RC and containing the same information and action buttons.

---

### **Sanity Check**

1. **Completeness Check:** Yes. The admin can find any RC, see its status, and initiate any necessary management action (edit, preview, delete, create).  
2. **Cohesion Check:** Yes. It's the central hub that logically connects the Admin Login to the RC Upload/Edit Screen.  
3. **Edge Case Check:**  
   * **Pagination:** When the number of RCs grows large (\>50), we will need to add pagination to the bottom of the table to ensure the page loads quickly.  
   * **Empty State:** If there are no RCs in the system yet, the table area will display a message: "No RCs found. Click 'Upload New RC' to get started."

---

---

### **Blueprint: RC Upload/Edit Screen**

* **Theme:** "Deep Focus" (Functional variant)  
* **Purpose:** To be the all-in-one interface for creating a new RC set or modifying an existing one.

#### **Layout & Components (Desktop-First)**

* A detailed, multi-section form on a single page.  
1. **Header:** "Create New RC" or "Editing: \[RC Title\]"  
2. **Passage Details Section**  
   * **Input Field:** RC Title  
   * **Text Area:** Passage Text (A large, rich-text enabled area).  
   * **Input Field:** Source (e.g., "Adapted from Aeon Essays").  
   * **Input Field:** Topic Tags (e.g., "Economics, Philosophy").  
3. **Question Editor Section**  
   * Four collapsible sections, one for each question ("Question 1", "Question 2", etc.).  
   * **Inside each question section:**  
     * Question Text (Text area).  
     * Four Option text input fields (A, B, C, D).  
     * A set of radio buttons to select the **Correct Answer**.  
     * Detailed Explanation (Large text area).  
4. **Scheduling & Status Section**  
   * **Date Picker:** A calendar interface to select the Scheduled Date.  
   * **Status Dropdown:** Draft or Scheduled.  
   * We will add a view in the admin panel (e.g., a calendar view) that visually shows how many RCs are scheduled for each day. If a day has more or less than two, it will be flagged with a warning icon. We will not hard-block the admin but will provide a clear warning to prevent mistakes.  
5. **Action Buttons (Footer)**  
   * **Save Draft / Update button:** Primary amber button.  
   * **Archive button:** A secondary red button (only appears when editing an existing RC).  
   * An admin **cannot delete** an RC that has user attempts linked to it. The "Delete" button will be disabled, and it will be replaced by an "Archive" button. Archiving will hide it from users but preserve the data.

#### **Shared Logic & States**

* **Validation:** The form will not allow saving unless all required fields are filled and a correct answer is chosen for each question.  
* **Saving:** Save Draft or Update commits all changes to the database. If a date is set and the status is "Scheduled," the system will automatically publish it on that date.

---

### **Sanity Check**

1. **Completeness Check:** Yes. This single screen contains every field necessary to create and schedule a complete RC set for the users.  
2. **Cohesion Check:** Yes. It is logically accessed from the Admin Dashboard and returns the admin there after saving.  
3. **Edge Case Check:**  
   * **Accidental Deletion:** The Archive button will trigger a confirmation modal ("Are you sure you want to archive this RC?") to prevent errors.  
   * **Scheduling Conflict:** The system should allow multiple RCs to be scheduled for the same day (since we have two per day). The interface on the dashboard will make this clear.

