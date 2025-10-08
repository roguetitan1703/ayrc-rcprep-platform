# Question Type Classification Guide

**For:** Admin RC Creators  
**Purpose:** How to properly classify questions using the new question type system  
**Date:** January 2025

---

## 🎯 Quick Reference

When creating or editing RC passages, each question must now include:

1. **`questionType`** - The cognitive skill being tested (REQUIRED)
2. **`difficulty`** - How challenging the question is (REQUIRED)

---

## 📋 Question Type Taxonomy

### 1. `main-idea`

**What it tests:** Understanding the passage's central purpose or primary message

**When to use:**

- "What is the primary purpose of this passage?"
- "Which of the following best describes the main idea?"
- "The passage is primarily concerned with..."
- "The author's main goal is to..."

**Example:**

```json
{
  "questionText": "What is the primary purpose of the passage?",
  "questionType": "main-idea",
  "difficulty": "medium"
}
```

---

### 2. `inference`

**What it tests:** Drawing logical conclusions not explicitly stated

**When to use:**

- "What can be inferred about X?"
- "The passage suggests that..."
- "Based on the passage, which is most likely true?"
- "The author would most likely agree that..."

**Example:**

```json
{
  "questionText": "Based on the information in the passage, what can be inferred about the author's view on climate change?",
  "questionType": "inference",
  "difficulty": "hard"
}
```

---

### 3. `detail`

**What it tests:** Locating specific information explicitly stated

**When to use:**

- "According to the passage, when did X occur?"
- "The passage states that..."
- "Which of the following is mentioned in paragraph 2?"
- "What does the author explicitly say about...?"

**Example:**

```json
{
  "questionText": "According to paragraph 3, what was the primary cause of the economic downturn?",
  "questionType": "detail",
  "difficulty": "easy"
}
```

---

### 4. `vocabulary`

**What it tests:** Understanding word meaning in context

**When to use:**

- "The word 'resilient' in line 15 most nearly means..."
- "In context, 'temperament' (paragraph 2) refers to..."
- "As used in the passage, 'paradox' suggests..."

**Example:**

```json
{
  "questionText": "In line 23, the word 'pragmatic' most nearly means:",
  "questionType": "vocabulary",
  "difficulty": "medium"
}
```

---

### 5. `tone-attitude`

**What it tests:** Identifying author's tone, attitude, or perspective

**When to use:**

- "The author's tone can best be described as..."
- "The author's attitude toward X is primarily..."
- "Which word best describes the author's stance?"
- "The passage conveys a sense of..."

**Example:**

```json
{
  "questionText": "The author's tone toward modern technology is best described as:",
  "questionType": "tone-attitude",
  "difficulty": "medium"
}
```

---

### 6. `structure-function`

**What it tests:** Understanding how the passage is organized or why author made specific choices

**When to use:**

- "Why does the author include paragraph 3?"
- "The function of the second paragraph is to..."
- "The author organizes the passage by..."
- "What is the relationship between paragraphs 2 and 4?"

**Example:**

```json
{
  "questionText": "Why does the author include the anecdote about Marie Curie in paragraph 4?",
  "questionType": "structure-function",
  "difficulty": "hard"
}
```

---

### 7. `application`

**What it tests:** Applying the passage's reasoning to new scenarios

**When to use:**

- "Which of the following scenarios best illustrates the concept?"
- "If the author's hypothesis is correct, which would be true?"
- "Which example is most analogous to...?"
- "How would the author likely respond to...?"

**Example:**

```json
{
  "questionText": "Which of the following scenarios best illustrates the 'tragedy of the commons' concept described in the passage?",
  "questionType": "application",
  "difficulty": "hard"
}
```

---

## 🎚️ Difficulty Levels

### `easy`

- Question directly asks about information clearly stated in passage
- Requires minimal inference
- Vocabulary is straightforward
- Answer is obvious after reading relevant section

**Example:** "According to paragraph 2, what year did the event occur?"

---

### `medium`

- Requires moderate inference or synthesis
- May need to connect ideas from multiple paragraphs
- Vocabulary may require context clues
- Answer requires careful reading but is not tricky

**Example:** "What can be inferred about the author's view based on paragraphs 3-4?"

---

### `hard`

- Requires deep inference or complex synthesis
- May involve subtle distinctions between answer choices
- Tests nuanced understanding of tone, structure, or implications
- Answer requires careful analysis and elimination

**Example:** "Which of the following best describes the relationship between the author's argument and the counterargument presented?"

---

## 📝 Complete Question Schema

```json
{
  "questionText": "What is the primary purpose of the passage?",
  "options": [
    { "id": "A", "text": "To explain a scientific theory" },
    { "id": "B", "text": "To argue for policy reform" },
    { "id": "C", "text": "To describe historical events" },
    { "id": "D", "text": "To compare different approaches" }
  ],
  "correctAnswerId": "B",
  "explanation": "The passage repeatedly emphasizes the need for urgent policy changes, making option B the best answer. Options A and C are mentioned but are not the main focus, and option D is not supported by the text.",
  "questionType": "main-idea",
  "difficulty": "medium"
}
```

---

## ✅ Validation Checklist

Before saving an RC passage, verify:

- [ ] All 4 questions have `questionType` field
- [ ] All 4 questions have `difficulty` field
- [ ] Question types are varied (not all the same type)
- [ ] Difficulty distribution is balanced (not all hard/all easy)
- [ ] Question types match actual question content
- [ ] Each question tests a distinct skill

---

## 📊 Recommended Distribution

For a balanced RC set (4 questions):

### By Type:

- **1 inference question** (most common in GRE/GMAT)
- **1 main-idea or detail question**
- **1 structure-function or tone-attitude question**
- **1 application or vocabulary question**

### By Difficulty:

- **1-2 easy questions**
- **1-2 medium questions**
- **0-1 hard question**

---

## ❌ Common Mistakes

### ❌ Mistake 1: Mislabeling Inference as Detail

```json
// WRONG
{
  "questionText": "The author suggests that climate change is...",
  "questionType": "detail" // ❌ Should be 'inference'
}

// CORRECT
{
  "questionText": "The author suggests that climate change is...",
  "questionType": "inference" // ✅
}
```

---

### ❌ Mistake 2: All Questions Same Type

```json
// BAD BALANCE
{
  "questions": [
    { "questionType": "detail" },
    { "questionType": "detail" },
    { "questionType": "detail" },
    { "questionType": "detail" }
  ]
}

// GOOD BALANCE
{
  "questions": [
    { "questionType": "main-idea" },
    { "questionType": "inference" },
    { "questionType": "detail" },
    { "questionType": "tone-attitude" }
  ]
}
```

---

### ❌ Mistake 3: Overestimating Difficulty

```json
// TOO HARSH
{
  "questionText": "According to paragraph 1, when did the event occur?",
  "questionType": "detail",
  "difficulty": "hard" // ❌ This is clearly 'easy'
}

// CORRECT
{
  "questionText": "According to paragraph 1, when did the event occur?",
  "questionType": "detail",
  "difficulty": "easy" // ✅
}
```

---

## 🎓 Learning Resources

### For Practice:

- Review official GRE RC questions and classify them
- Analyze GMAT CR questions for inference patterns
- Study LSAT reading comp for structure questions

### Internal Resources:

- Check existing RCs to see classification patterns
- Review student performance data by question type
- Consult with other admins for difficult cases

---

## 🆘 When Unsure

If you're uncertain about classification:

1. **Default to `inference` + `medium`** - Most common and safest choice
2. **Ask:** "What cognitive skill does this question primarily test?"
3. **Consider:** Would this question be easier with or without the passage?
   - **With passage needed:** Likely `detail`, `main-idea`, `structure-function`
   - **Heavy reasoning needed:** Likely `inference`, `application`, `tone-attitude`

---

## 📈 Impact on Students

Proper classification enables:

- **Personalized feedback** - "You're strong at inference but struggle with vocabulary"
- **Targeted practice** - System recommends passages with specific question types
- **Progress tracking** - Students see improvement in weak areas over time
- **Performance insights** - Detailed analytics by question type

---

## 🔄 Updating Old RCs

### For Existing Passages (Created Before Schema Change):

- **Current State:** Questions have no `questionType` or `difficulty`
- **Backend Handling:** Defaults applied automatically (`inference`, `medium`)
- **Recommendation:** Optionally update when editing, no rush

### How to Update:

1. Open RC in admin form
2. Edit questions JSON to add `questionType` and `difficulty`
3. Verify classifications using this guide
4. Save changes

---

## 📞 Support

**Questions about classification?**

- Review this guide
- Check example questions below
- Ask in admin Slack channel
- Escalate difficult cases to dev team

---

## 📚 Example Question Set

Here's a complete RC with properly classified questions:

```json
{
  "title": "The Evolution of Urban Planning",
  "passageText": "[Passage text about urban planning history and modern approaches]",
  "topicTags": ["Urban Studies", "History"],
  "questions": [
    {
      "questionText": "What is the primary purpose of the passage?",
      "options": [
        { "id": "A", "text": "To trace the historical development of urban planning" },
        { "id": "B", "text": "To argue for sustainable city design" },
        { "id": "C", "text": "To compare American and European approaches" },
        { "id": "D", "text": "To criticize modern architecture" }
      ],
      "correctAnswerId": "A",
      "explanation": "The passage chronologically describes how urban planning evolved...",
      "questionType": "main-idea",
      "difficulty": "easy"
    },
    {
      "questionText": "What can be inferred about the author's view on car-centric design?",
      "options": [
        { "id": "A", "text": "It was necessary for economic growth" },
        { "id": "B", "text": "It has created unforeseen problems" },
        { "id": "C", "text": "It was inevitable given the era" },
        { "id": "D", "text": "It should be completely abandoned" }
      ],
      "correctAnswerId": "B",
      "explanation": "While not explicitly stated, the passage's discussion of...",
      "questionType": "inference",
      "difficulty": "medium"
    },
    {
      "questionText": "According to the passage, when did the 'garden city' movement begin?",
      "options": [
        { "id": "A", "text": "Early 1800s" },
        { "id": "B", "text": "Late 1800s" },
        { "id": "C", "text": "Early 1900s" },
        { "id": "D", "text": "Mid 1900s" }
      ],
      "correctAnswerId": "B",
      "explanation": "Paragraph 3 explicitly states that Ebenezer Howard...",
      "questionType": "detail",
      "difficulty": "easy"
    },
    {
      "questionText": "Why does the author include the example of Brasília in paragraph 5?",
      "options": [
        { "id": "A", "text": "To illustrate the failures of modernist planning" },
        { "id": "B", "text": "To show successful implementation of grand design" },
        { "id": "C", "text": "To contrast with European approaches" },
        { "id": "D", "text": "To demonstrate political influence on city planning" }
      ],
      "correctAnswerId": "A",
      "explanation": "The Brasília example follows the discussion of...",
      "questionType": "structure-function",
      "difficulty": "hard"
    }
  ]
}
```

---

**Last Updated:** January 2025  
**Version:** 1.0  
**Questions?** Contact dev team or post in #admin-support
