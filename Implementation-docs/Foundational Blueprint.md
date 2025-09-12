## **Phase 3: The Complete Foundational Blueprint**

#### **Part 1: Technical Schematics (The Backend Blueprint)**

##### **1.1: Data Models (MongoDB Collections)**

1. **users Collection**  
   * Stores aspirant and admin data. The lastActiveDate and dailyStreak fields are critical for the streak logic.  
2. JSON

{  
  "\_id": ObjectId("..."),  
  "name": "String",  
  "email": "String",  
  "phoneNumber": "String",  
  "password": "String (Hashed)",  
  "role": "String ('aspirant' or 'admin')",  
  "dailyStreak": "Number",  
  "lastActiveDate": "Date",  
  "createdAt": "Date"  
}

3.   
4.   
5. **rc\_passages Collection**  
   * The core content model. Now features a more robust, object-based structure for questions.options to prevent data corruption.  
6. JSON

{  
  "\_id": ObjectId("..."),  
  "title": "String",  
  "passageText": "String",  
  "source": "String",  
  "topicTags": \["String"\],  
  "status": "String ('draft', 'scheduled', 'live', 'archived')",  
  "scheduledDate": "Date",  
  "questions": \[  
    {  
      "questionText": "String",  
      "options": \[  
        { "id": "A", "text": "String" },  
        { "id": "B", "text": "String" },  
        { "id": "C", "text": "String" },  
        { "id": "D", "text": "String" }  
      \],  
      "correctAnswerId": "String ('A', 'B', 'C', or 'D')",  
      "explanation": "String"  
    }  
  \],  
  "createdBy": ObjectId("Ref: 'users'")  
}

7.   
8.   
9. **attempts Collection**  
   * Links a user to an RC they have completed. The answers array now stores the stable option id instead of a brittle index.  
10. JSON

{  
  "\_id": ObjectId("..."),  
  "userId": ObjectId("Ref: 'users'"),  
  "rcPassageId": ObjectId("Ref: 'rc\_passages'"),  
  "answers": \["String ('A', 'B', etc.)"\],  
  "progress": \["String ('A', 'B', etc.)"\], // For mid-test saving  
  "score": "Number",  
  "timeTaken": "Number (seconds)",  
  "attemptedAt": "Date",  
  "analysisFeedback": \[  
    { "questionIndex": "Number", "reason": "String" }  
  \]  
}

11.   
12.   
13. **feedback Collection**  
    * Stores the end-of-day pilot feedback. No changes were needed here.  
14. JSON

{  
  "\_id": ObjectId("..."),  
  "userId": ObjectId("Ref: 'users'"),  
  "date": "Date",  
  "difficultyRating": "Number",  
  "explanationClarityRating": "Number",  
  "comment": "String"  
}

15.   
16. 

##### **1.2: API Endpoints & Contracts**

All endpoints are versioned under /api/v1 for future maintainability.

* **Authentication & Users**  
  * POST /auth/register (Creates user)  
  * POST /auth/login (Logs in user)  
  * GET /users/me (Gets current user profile, Auth Required)  
  * PATCH /users/me (Updates user name, Auth Required)  
  * POST /users/me/change-password (Changes password, Auth Required)  
  * POST /auth/forgot-password (Initiates password reset)  
  * POST /auth/reset-password (Completes password reset)  
* **RC Passages & Attempts (Aspirant)**  
  * GET /rcs/today (Fetches today's RCs for the Dashboard, Auth Required)  
  * GET /rcs/archive?page=1\&limit=20 (Fetches past RCs with pagination, Auth Required)  
  * GET /rcs/:id (Fetches a single RC for the Test Screen, Auth Required)  
  * POST /attempts (Submits a completed test, Auth Required)  
  * PATCH /attempts/:id/progress (**New**) (Saves mid-test progress, Auth Required)  
  * GET /attempts/analysis/:rcId (Fetches data for the Analysis Screen, Auth Required)  
  * PATCH /attempts/:id/analysis-feedback (**New**) (Saves feedback from Analysis Screen, Auth Required)  
* **Feedback (Aspirant)**  
  * POST /feedback (Submits end-of-day feedback, Auth Required)  
* **Admin Panel (Admin Role Required)**  
  * GET /admin/rcs (Gets all RCs for Admin Dashboard)  
  * POST /admin/rcs (Creates a new RC)  
  * PUT /admin/rcs/:id (Updates an existing RC)  
  * DELETE /admin/rcs/:id (Archives an RC, changed from hard delete)

#### **Part 2: Implementation Foundation (The Frontend & Design Blueprint)**

##### **2.1: Design System & Theming (tailwind.config.js)**

The heart of our visual identity, updated with standard responsive breakpoints.

JavaScript

// tailwind.config.js  
const { fontFamily } \= require('tailwindcss/defaultTheme');

module.exports \= {  
  content: \[  
    './src/pages/\*\*/\*.{js,ts,jsx,tsx}',  
    './src/components/\*\*/\*.{js,ts,jsx,tsx}',  
    './src/features/\*\*/\*.{js,ts,jsx,tsx}',  
  \],  
  theme: {  
    screens: {  
      sm: '640px',  
      md: '768px', // Tablet breakpoint  
      lg: '1024px',  
      xl: '1280px',  
    },  
    extend: {  
      colors: {  
        background: '\#1A1B26',  
        'text-primary': '\#EAEAEA',  
        'text-secondary': '\#A9A9A9',  
        'accent-amber': '\#FFC107',  
        'success-green': '\#19D895',  
        'error-red': '\#F44336',  
        'neutral-grey': '\#4A4A5A',  
        'card-surface': '\#2A2B3A',  
      },  
      fontFamily: {  
        sans: \['Poppins', ...fontFamily.sans\], // For headings & UI  
        serif: \['Inter', ...fontFamily.serif\],  // For RC passage body text  
      },  
    },  
  },  
  plugins: \[  
    require('@tailwindcss/forms'),  
  \],  
};

##### **2.2: UI Component Strategy**

Our strategy remains a hybrid model using **Headless UI** styled with our custom theme. The core components to build are: \<Button /\>, \<Card /\>, \<Input /\>, \<Modal /\>, and \<Badge /\>. Each will have defined variants and states, including a **disabled state** (reduced opacity, neutral-grey styles).

##### **2.3: Icon Library & Implementation**

We will use **Lucide Icons** implemented via a single, reusable \<Icon /\> component for consistency and scalability.

##### **2.4: Project Structure & File Organization**

We will use the defined feature-based organization model for a clean, maintainable codebase.

/src  
|-- /assets  
|-- /components  
|   |-- /ui  
|   |-- /layouts  
|-- /features  
|   |-- /authentication  
|   |-- /dashboard  
|   |-- /test  
|   |-- /admin  
|-- /hooks  
|-- /lib  
|-- /pages  
|-- /styles  
└── App.jsx

#### **Explanation of Key Directories**

* **/components/ui:** This is where our foundational building blocks like \<Button /\>, \<Card /\>, and \<Input /\> will live. They are generic and can be used anywhere.  
* **/features:** This is the core of our organization. Instead of having one giant folder for all components, we group them by feature. For example, everything related to the test-taking experience (the passage view, question palette, etc.) will live inside /features/test. This makes the code much easier to navigate.  
* **/pages:** This folder is very simple. It only contains the top-level component for each page/route, which then assembles the necessary feature components. For example, DashboardPage.jsx might import and arrange several components from /features/dashboard.  
* **/lib:** This is for shared logic that isn't a React component, like the configuration for our API client that talks to the backend.

---

### **Sanity Check**

1. **Completeness Check:** Yes. This structure provides a logical home for every type of file we will create, from UI components to API logic.  
2. **Cohesion Check:** Yes. The feature-based approach ensures that related code is kept together, making it easier to work on a specific part of the application without having to jump between many different folders.  
3. **Edge Case Check (Scalability):** This structure is highly scalable. As we add new features in the future (e.g., Verbal Ability practice), we can simply create a new folder inside /features (e.g., /features/verbal-ability) without cluttering the existing codebase.

