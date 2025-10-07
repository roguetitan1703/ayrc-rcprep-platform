import React, { useEffect, useState } from 'react'
import {
    getTodayandfutureQuestions,
    createFeedbackQuestion,
    updateFeedbackQuestion,
    deleteFeedbackQuestion,
} from '../../lib/feedback'
import { Button } from '../../components/ui/Button'

const AdminFeedback = () => {
    const [questions, setQuestions] = useState([])
    const [loading, setLoading] = useState(true)
    const [editingQuestion, setEditingQuestion] = useState(null)
    const [newQuestion, setNewQuestion] = useState({
        type: 'rating',
        label: '',
        options: [],
        url: '',
        buttonText: '',
        minWords: 0,
        time: 0,
        date: new Date().toISOString().slice(0, 10), // default today
    })

    useEffect(() => {
        fetchQuestions()
    }, [])

    const fetchQuestions = async () => {
        try {
            setLoading(true)
            const data = await getTodayandfutureQuestions()

            setQuestions(data)
        } catch (e) {
            console.error('Error fetching questions', e)
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (field, value, isNew = false) => {
        if (isNew) {
            setNewQuestion((prev) => ({ ...prev, [field]: value }))
        } else if (editingQuestion) {
            setEditingQuestion((prev) => ({ ...prev, [field]: value }))
        }
    }

    const handleCreate = async () => {
        try {
            await createFeedbackQuestion(newQuestion)
            setNewQuestion({
                type: 'rating',
                label: '',
                options: [],
                url: '',
                buttonText: '',
                minWords: 0,
                time: 0,
                date: new Date().toISOString().slice(0, 10),
            })
            fetchQuestions()
        } catch (e) {
            console.error('Error creating question', e)
        }
    }

    const handleUpdate = async (id) => {
        try {
            await updateFeedbackQuestion(id, editingQuestion)
            setEditingQuestion(null)
            fetchQuestions()
        } catch (e) {
            console.error('Error updating question', e)
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this question?')) return
        try {
            await deleteFeedbackQuestion(id)
            fetchQuestions()
        } catch (e) {
            console.error('Error deleting question', e)
        }
    }

    if (loading) return <div>Loading questions...</div>


    const todayStr = new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD'

    const todaysQuestions = questions.filter(q => q.date?.slice(0, 10) === todayStr);
    const futureQuestions = questions.filter(q => q.date?.slice(0, 10) > todayStr);


    const renderTypeFields = (q, isNew = false) => {
        const type = isNew ? newQuestion.type : q.type
        return (
            <>
                {type === 'multi' && (
                    <div className="space-y-1">
                        <label className="block text-sm font-medium">Options (comma separated)</label>
                        <input
                            type="text"
                            value={isNew ? newQuestion.options.join(',') : q.options?.join(',') || ''}
                            onChange={(e) =>
                                handleChange('options', e.target.value.split(','), isNew)
                            }
                            className="border p-2 rounded w-full"
                        />
                    </div>
                )}
                {type === 'redirect' && (
                    <>
                        <div className="space-y-1">
                            <label className="block text-sm font-medium">URL</label>
                            <input
                                type="text"
                                value={isNew ? newQuestion.url : q.url || ''}
                                onChange={(e) => handleChange('url', e.target.value, isNew)}
                                className="border p-2 rounded w-full"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="block text-sm font-medium">Button Text</label>
                            <input
                                type="text"
                                value={isNew ? newQuestion.buttonText : q.buttonText || ''}
                                onChange={(e) => handleChange('buttonText', e.target.value, isNew)}
                                className="border p-2 rounded w-full"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="block text-sm font-medium">Min Words</label>
                            <input
                                type="number"
                                value={isNew ? newQuestion.minWords : q.minWords || 0}
                                onChange={(e) => handleChange('minWords', Number(e.target.value), isNew)}
                                className="border p-2 rounded w-full"
                            />
                        </div>
                    </>
                )}
                {type === 'open' && (
                    <div className="space-y-1">
                        <label className="block text-sm font-medium">Min Words</label>
                        <input
                            type="number"
                            value={isNew ? newQuestion.minWords : q.minWords || 0}
                            onChange={(e) => handleChange('minWords', Number(e.target.value), isNew)}
                            className="border p-2 rounded w-full"
                        />
                    </div>
                )}
            </>
        )
    }

    const renderQuestionCard = (q) => {
        if (!q) return null;

        const isEditing = editingQuestion && editingQuestion.id === q.id;

        return (
            <div key={q.id || q._id} className="bg-card-surface p-4 rounded shadow space-y-2">
                {isEditing ? (
                    <>
                        <div className="space-y-1">
                            <label className="block text-sm font-medium">Label</label>
                            <input
                                type="text"
                                value={editingQuestion.label || ''}
                                onChange={(e) => handleChange('label', e.target.value)}
                                className="border p-2 rounded w-full"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="block text-sm font-medium">Type</label>
                            <select
                                value={editingQuestion.type || 'rating'}
                                onChange={(e) => handleChange('type', e.target.value)}
                                className="border p-2 rounded w-full"
                            >
                                <option value="rating">Rating</option>
                                <option value="multi">Multi</option>
                                <option value="open">Open</option>
                                <option value="redirect">Redirect</option>
                            </select>
                        </div>

                        {renderTypeFields(editingQuestion)}

                        <Button onClick={() => handleUpdate(q._id)}>Save</Button>
                        <Button onClick={() => setEditingQuestion(null)}>Cancel</Button>
                    </>
                ) : (
                    <>
                        <div>
                            <strong>{q.label || 'No label'}</strong> ({q.type || 'rating'}) — Time: {q.time || 0}s — Date: {q.date ? new Date(q.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={() => setEditingQuestion(q)}>Edit</Button>
                            <Button onClick={() => handleDelete(q._id)}>Delete</Button>
                        </div>
                    </>
                )}
            </div>
        )
    }


    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <h1 className="h2">Admin Feedback Dashboard</h1>

            {/* New Question Form */}
            <div className="bg-card-surface p-6 rounded shadow space-y-4">
                <h2 className="h4">Add New Question</h2>

                <div className="space-y-1">
                    <label className="block text-sm font-medium">Label</label>
                    <input
                        type="text"
                        value={newQuestion.label}
                        onChange={(e) => handleChange('label', e.target.value, true)}
                        className="border p-2 rounded w-full"
                    />
                </div>

                <div className="space-y-1">
                    <label className="block text-sm font-medium">Type</label>
                    <select
                        value={newQuestion.type}
                        onChange={(e) => handleChange('type', e.target.value, true)}
                        className="border p-2 rounded w-full"
                    >
                        <option value="rating">Rating</option>
                        <option value="multi">Multi</option>
                        <option value="open">Open</option>
                        <option value="redirect">Redirect</option>
                    </select>
                </div>

                {renderTypeFields(newQuestion, true)}

                <div className="space-y-1">
                    <label className="block text-sm font-medium">Time in seconds</label>
                    <input
                        type="number"
                        value={newQuestion.time}
                        onChange={(e) => handleChange('time', Number(e.target.value), true)}
                        className="border p-2 rounded w-full"
                    />
                </div>

                <div className="space-y-1">
                    <label className="block text-sm font-medium">Date</label>
                    <input
                        type="date"
                        value={newQuestion.date}
                        onChange={(e) => handleChange('date', e.target.value, true)}
                        className="border p-2 rounded w-full"
                    />
                </div>

                <Button onClick={handleCreate} className="w-full mt-2">
                    Add Question
                </Button>
            </div>

            {/* Today's Questions */}
            <h2 className="h4 mt-6">Today's Questions</h2>
            <div className="space-y-4">
                {todaysQuestions.length > 0 ? todaysQuestions.map(renderQuestionCard) : <div>No questions for today.</div>}
            </div>

            {/* Future Questions */}
            <h2 className="h4 mt-6">Future Questions</h2>
            <div className="space-y-4">
                {futureQuestions.length > 0 ? futureQuestions.map(renderQuestionCard) : <div>No future questions.</div>}
            </div>
        </div>
    )
}

export default AdminFeedback
