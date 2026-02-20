import React, { useState, useEffect } from 'react';

const SUBJECTS = ['Physics', 'Chemistry', 'Biology', 'Maths'];
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

const EMPTY_FORM = {
    subject: 'Physics',
    difficulty: 'Easy',
    question: '',
    options: ['', ''],
    correctAnswer: '',
};

export default function QuestionModal({ isOpen, question, onClose, onSubmit }) {
    const [form, setForm] = useState(EMPTY_FORM);
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setForm(question ? { ...question } : EMPTY_FORM);
            setErrors({});
        }
    }, [isOpen, question]);

    if (!isOpen) return null;

    const validate = () => {
        const e = {};
        if (!form.question.trim()) e.question = 'Question text is required.';
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
                difficulty: form.difficulty,
                question: form.question.trim(),
                options: form.options.filter((o) => o.trim()),
                correctAnswer: form.correctAnswer,
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
        `w-full px-3 py-2.5 text-sm border rounded-xl bg-white text-slate-800 focus:outline-none focus:ring-2 transition-colors ${errors[field]
            ? 'border-red-300 focus:ring-red-200'
            : 'border-slate-200 focus:ring-indigo-200 focus:border-indigo-400'
        }`;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                    <h2 className="text-lg font-bold text-slate-800">
                        {question ? 'Edit Question' : 'Add Question'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Subject + Difficulty row */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Subject</label>
                            <select
                                className={inputCls('subject')}
                                value={form.subject}
                                onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                            >
                                {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Difficulty</label>
                            <select
                                className={inputCls('difficulty')}
                                value={form.difficulty}
                                onChange={(e) => setForm((f) => ({ ...f, difficulty: e.target.value }))}
                            >
                                {DIFFICULTIES.map((d) => <option key={d}>{d}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Question */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Question</label>
                        <textarea
                            rows={3}
                            className={inputCls('question')}
                            placeholder="Enter the question text..."
                            value={form.question}
                            onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))}
                        />
                        {errors.question && <p className="text-red-500 text-xs mt-1">{errors.question}</p>}
                    </div>

                    {/* Options */}
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="text-xs font-semibold text-slate-600">Options</label>
                            {form.options.length < 4 && (
                                <button
                                    type="button"
                                    onClick={addOption}
                                    className="text-xs text-indigo-600 font-semibold hover:underline"
                                >
                                    + Add option
                                </button>
                            )}
                        </div>
                        <div className="space-y-2">
                            {form.options.map((opt, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <span className="text-xs font-semibold text-slate-400 w-5 shrink-0">
                                        {String.fromCharCode(65 + i)}.
                                    </span>
                                    <input
                                        type="text"
                                        className={`flex-1 px-3 py-2 text-sm border rounded-xl bg-white text-slate-800 focus:outline-none focus:ring-2 transition-colors ${errors.options ? 'border-red-300 focus:ring-red-200' : 'border-slate-200 focus:ring-indigo-200 focus:border-indigo-400'
                                            }`}
                                        placeholder={`Option ${String.fromCharCode(65 + i)}`}
                                        value={opt}
                                        onChange={(e) => updateOption(i, e.target.value)}
                                    />
                                    {form.options.length > 2 && (
                                        <button
                                            type="button"
                                            onClick={() => removeOption(i)}
                                            className="p-1.5 text-slate-400 hover:text-red-400 transition-colors"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                        {errors.options && <p className="text-red-500 text-xs mt-1">{errors.options}</p>}
                    </div>

                    {/* Correct Answer */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Correct Answer</label>
                        <select
                            className={inputCls('correctAnswer')}
                            value={form.correctAnswer}
                            onChange={(e) => setForm((f) => ({ ...f, correctAnswer: e.target.value }))}
                        >
                            <option value="">— Select correct option —</option>
                            {form.options
                                .filter((o) => o.trim())
                                .map((opt, i) => (
                                    <option key={i} value={opt}>
                                        {String.fromCharCode(65 + i)}. {opt}
                                    </option>
                                ))}
                        </select>
                        {errors.correctAnswer && (
                            <p className="text-red-500 text-xs mt-1">{errors.correctAnswer}</p>
                        )}
                    </div>

                    {errors.form && (
                        <div className="bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl p-3">
                            {errors.form}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 border border-slate-200 text-slate-600 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                        >
                            {submitting ? (
                                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</>
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
