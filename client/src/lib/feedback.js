// lib/feedback.js
import { api } from './api'

// -----------------------------
// User-side APIs
// -----------------------------

// Fetch today's feedback status
export async function getTodaysFeedback() {
    const { data } = await api.get('/feedback/today')
    return data // { submitted: true/false }
}

// Fetch today's questions
export async function getTodaysQuestions() {
    const { data } = await api.get('/feedback/questions/today')
    return data
}

// Submit feedback answers
export async function submitFeedback(answers) {
    const { data } = await api.post('/feedback', { answers })
    return data
}

// Get feedback lock status
export async function getFeedbackLockStatus() {
    const { data } = await api.get('/feedback/lock-status')
    return data
}

// -----------------------------
// Admin APIs (require auth + admin role)
// -----------------------------

// Create a new feedback question
export async function createFeedbackQuestion(questionData) {
    const { data } = await api.post('/feedback/questions', questionData)
    return data
}

// Update an existing question
export async function updateFeedbackQuestion(id, questionData) {
    const { data } = await api.put(`/feedback/questions/${id}`, questionData)
    return data
}

// Delete a feedback question
export async function deleteFeedbackQuestion(id) {
    const { data } = await api.delete(`/feedback/questions/${id}`)
    return data
}

export async function getTodayandfutureQuestions() {
    const { data } = await api.get('/feedback/questions/future')
    return data
}

