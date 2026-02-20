import React, { useState, useEffect } from 'react';

const SUBJECTS = ['Physics', 'Chemistry', 'Biology', 'Maths', 'Zoology'];
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

const CHAPTERS_BY_SUBJECT = {
    Physics: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    Chemistry: [101, 102, 103, 104, 105, 106, 107, 108, 109],
    Maths: [201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 212, 213, 214],
    Zoology: [301, 302, 303, 304, 305, 306, 307, 308, 309],
    Biology: [310, 311, 312, 313, 314, 315, 316, 317, 318, 319],
};

const EMPTY_FORM = {
    subject: 'Physics',
    chapterId: 1,
    difficulty: 'Easy',
    question: '',
    options: ['', ''],
    correctAnswer: '',
    explanation: '',
};

export default function QuestionModal({ isOpen, question, onClose, onSubmit }) {
    const [form, setForm] = useState(EMPTY_FORM);
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setForm(question
                ? { explanation: '', ...question }
                : EMPTY_FORM
            );
            setErrors({});
        }
    }, [isOpen, question]);

    if (!isOpen) return null;

    // When subject changes, reset chapterId to first chapter of new subject
    const handleSubjectChange = (newSubject) => {
        const firstChapter = (CHAPTERS_BY_SUBJECT[newSubject] ?? [])[0] ?? '';
        setForm((f) => ({ ...f, subject: newSubject, chapterId: firstChapter }));
    };

    const validate = () => {
        const e = {};
        if (!form.question.trim()) e.question = 'Question text is required.';
        if (!form.chapterId) e.chapterId = 'Select a chapter.';
        const validOpts = form.options.filter((o) => o.trim());
        if (validOpts.length < 2) e.options = 'At least 2 non-empty options required.';
        if (!form.correctAnswer || !validOpts.includes(form.correctAnswer))
            e.correctAnswer = 'Select the correct answer from your options.';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setSubmitting(true);
        try {
            await onSubmit({
                subject: form.subject,
                chapterId: Number(form.chapterId),
                difficulty: form.difficulty,
                question: form.question.trim(),
                options: form.options.filter((o) => o.trim()),
                correctAnswer: form.correctAnswer,
                ...(form.explanation?.trim() ? { explanation: form.explanation.trim() } : {}),
                isActive: form.isActive ?? true, // preserve existing or default true
            });
            onClose();
        } catch (err) {
            setErrors({ form: err.message ?? 'Failed to save. Try again.' });
        } finally {
            setSubmitting(false);
        }
    };

    const updateOption = (i, val) => {
        const opts = [...form.options];
        opts[i] = val;
        setForm((f) => ({ ...f, options: opts }));
    };

    const addOption = () => {
        if (form.options.length >= 4) return;
        setForm((f) => ({ ...f, options: [...f.options, ''] }));
    };

    const removeOption = (i) => {
        if (form.options.length <= 2) return;
        const opts = form.options.filter((_, idx) => idx !== i);
        const removedVal = form.options[i];
        setForm((f) => ({
            ...f,
            options: opts,
            correctAnswer: f.correctAnswer === removedVal ? '' : f.correctAnswer,
        }));
    };

    const inputCls = (field) =>
        `form-input${errors[field] ? ' error' : ''}`;

    const chapters = CHAPTERS_BY_SUBJECT[form.subject] ?? [];

    return (
        <div className="modal-overlay">
            <div className="modal-panel" style={{ maxWidth: '36rem' }}>
                {/* Header */}
                <div className="card-header">
                    <h2 className="card-title" style={{ fontSize: '1rem' }}>
                        {question ? 'Edit Question' : 'Add Question'}
                    </h2>
                    <button onClick={onClose} className="header-icon-btn">
                        <svg style={{ width: '1rem', height: '1rem' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {/* Row 1: Subject + Difficulty */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Subject</label>
                            <select
                                className="form-select"
                                value={form.subject}
                                onChange={(e) => handleSubjectChange(e.target.value)}
                            >
                                {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
                            </select>
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Difficulty</label>
                            <select
                                className="form-select"
                                value={form.difficulty}
                                onChange={(e) => setForm((f) => ({ ...f, difficulty: e.target.value }))}
                            >
                                {DIFFICULTIES.map((d) => <option key={d}>{d}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Row 2: Chapter ID */}
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">
                            Chapter
                            <span style={{ marginLeft: '0.375rem', color: 'var(--text-muted)', fontWeight: 400 }}>(required for student app)</span>
                        </label>
                        <select
                            className={`form-select${errors.chapterId ? ' error' : ''}`}
                            style={errors.chapterId ? { borderColor: 'rgb(var(--danger-rgb))' } : {}}
                            value={form.chapterId}
                            onChange={(e) => setForm((f) => ({ ...f, chapterId: Number(e.target.value) }))}
                        >
                            <option value="">— Select chapter —</option>
                            {chapters.map((id) => (
                                <option key={id} value={id}>Chapter {id}</option>
                            ))}
                        </select>
                        {errors.chapterId && <p style={{ color: 'rgb(var(--danger-rgb))', fontSize: '0.6875rem', marginTop: '0.25rem' }}>{errors.chapterId}</p>}
                    </div>

                    {/* Question */}
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Question</label>
                        <textarea
                            rows={3}
                            className={`form-textarea${errors.question ? ' error' : ''}`}
                            style={errors.question ? { borderColor: 'rgb(var(--danger-rgb))' } : {}}
                            placeholder="Enter the question text…"
                            value={form.question}
                            onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))}
                        />
                        {errors.question && <p style={{ color: 'rgb(var(--danger-rgb))', fontSize: '0.6875rem', marginTop: '0.25rem' }}>{errors.question}</p>}
                    </div>

                    {/* Options */}
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <label className="form-label" style={{ marginBottom: 0 }}>Options</label>
                            {form.options.length < 4 && (
                                <button type="button" onClick={addOption}
                                    style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>
                                    + Add option
                                </button>
                            )}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {form.options.map((opt, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', width: '1.25rem', flexShrink: 0 }}>
                                        {String.fromCharCode(65 + i)}.
                                    </span>
                                    <input
                                        type="text"
                                        className={`form-input${errors.options ? ' error' : ''}`}
                                        style={errors.options ? { borderColor: 'rgb(var(--danger-rgb))' } : {}}
                                        placeholder={`Option ${String.fromCharCode(65 + i)}`}
                                        value={opt}
                                        onChange={(e) => updateOption(i, e.target.value)}
                                    />
                                    {form.options.length > 2 && (
                                        <button type="button" onClick={() => removeOption(i)} className="header-icon-btn">
                                            <svg style={{ width: '0.875rem', height: '0.875rem' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                        {errors.options && <p style={{ color: 'rgb(var(--danger-rgb))', fontSize: '0.6875rem', marginTop: '0.25rem' }}>{errors.options}</p>}
                    </div>

                    {/* Correct Answer */}
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Correct Answer</label>
                        <select
                            className={`form-select${errors.correctAnswer ? ' error' : ''}`}
                            style={errors.correctAnswer ? { borderColor: 'rgb(var(--danger-rgb))' } : {}}
                            value={form.correctAnswer}
                            onChange={(e) => setForm((f) => ({ ...f, correctAnswer: e.target.value }))}
                        >
                            <option value="">— Select correct option —</option>
                            {form.options.filter((o) => o.trim()).map((opt, i) => (
                                <option key={i} value={opt}>
                                    {String.fromCharCode(65 + i)}. {opt}
                                </option>
                            ))}
                        </select>
                        {errors.correctAnswer && <p style={{ color: 'rgb(var(--danger-rgb))', fontSize: '0.6875rem', marginTop: '0.25rem' }}>{errors.correctAnswer}</p>}
                    </div>

                    {/* Explanation (optional) */}
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">
                            Explanation <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span>
                        </label>
                        <textarea
                            rows={2}
                            className="form-textarea"
                            placeholder="Brief solution or hint shown after the quiz…"
                            value={form.explanation}
                            onChange={(e) => setForm((f) => ({ ...f, explanation: e.target.value }))}
                        />
                    </div>

                    {errors.form && (
                        <div style={{ background: 'rgba(var(--danger-rgb),0.08)', border: '1px solid rgba(var(--danger-rgb),0.25)', borderRadius: '0.5rem', padding: '0.625rem 0.875rem', fontSize: '0.75rem', color: 'rgb(var(--danger-rgb))' }}>
                            {errors.form}
                        </div>
                    )}

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.375rem' }}>
                        <button type="button" onClick={onClose} className="btn btn-outline" style={{ flex: 1 }}>
                            Cancel
                        </button>
                        <button type="submit" disabled={submitting} className="btn btn-primary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem' }}>
                            {submitting ? (
                                <><div style={{ width: '1rem', height: '1rem', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin 0.7s linear infinite' }} />Saving…</>
                            ) : (
                                question ? 'Save Changes' : 'Add Question'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
