import React from 'react';

const questions = [
    { subject: 'Physics', difficulty: 'Medium', preview: 'A ball is thrown vertically upward with a velocity of 20 m/s...' },
    { subject: 'Chemistry', difficulty: 'Easy', preview: 'What is the IUPAC name of CH₃–CH₂–OH?' },
    { subject: 'Biology', difficulty: 'Hard', preview: 'Describe the events during metaphase II of meiosis...' },
    { subject: 'Maths', difficulty: 'Medium', preview: 'Solve: ∫(x² + 3x + 2)dx between limits 0 to 1' },
    { subject: 'Physics', difficulty: 'Easy', preview: 'State Newton\'s second law of motion and give its mathematical form.' },
    { subject: 'Chemistry', difficulty: 'Hard', preview: 'Explain the principle of chemical equilibrium using Le Chatelier\'s...' },
];

const difficultyBadge = {
    Easy: 'bg-emerald-50 text-emerald-600',
    Medium: 'bg-amber-50 text-amber-600',
    Hard: 'bg-red-50 text-red-500',
};

const subjectBadge = {
    Physics: 'bg-blue-50 text-blue-600',
    Chemistry: 'bg-purple-50 text-purple-600',
    Biology: 'bg-green-50 text-green-600',
    Maths: 'bg-indigo-50 text-indigo-600',
};

export default function Questions() {
    return (
        <div className="p-6 sm:p-8 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Questions</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage your question bank</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm shadow-indigo-200">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Question
                </button>
            </div>

            {/* Filters (placeholder) */}
            <div className="flex gap-3 flex-wrap">
                {['All', 'Physics', 'Chemistry', 'Biology', 'Maths'].map((f) => (
                    <button
                        key={f}
                        className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${f === 'All' ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-500 hover:border-indigo-300 hover:text-indigo-600'}`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-6 py-4">Subject</th>
                                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-6 py-4">Difficulty</th>
                                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-6 py-4">Question Preview</th>
                                <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wide px-6 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {questions.map((q, i) => (
                                <tr key={i} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${subjectBadge[q.subject]}`}>
                                            {q.subject}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${difficultyBadge[q.difficulty]}`}>
                                            {q.difficulty}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 max-w-xs truncate">{q.preview}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <button className="px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors">
                                                Edit
                                            </button>
                                            <button className="px-3 py-1.5 text-xs font-semibold text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                    <p className="text-xs text-slate-400">Firestore integration coming in Phase 2</p>
                    <span className="text-xs text-slate-400">Showing {questions.length} questions</span>
                </div>
            </div>
        </div>
    );
}
