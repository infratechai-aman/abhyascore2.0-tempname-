import React, { useState } from 'react';
import { useQuestions } from '../hooks/useQuestions';
import QuestionModal from '../components/QuestionModal';
import ConfirmDialog from '../components/ConfirmDialog';

const DIFFICULTY_CLS = {
    Easy: 'bg-emerald-50 text-emerald-600',
    Medium: 'bg-amber-50 text-amber-600',
    Hard: 'bg-red-50 text-red-500',
};
const SUBJECT_CLS = {
    Physics: 'bg-blue-50 text-blue-600',
    Chemistry: 'bg-purple-50 text-purple-600',
    Biology: 'bg-green-50 text-green-600',
    Maths: 'bg-indigo-50 text-indigo-600',
};

const Skeleton = () => (
    <div className="animate-pulse space-y-3 p-4">
        {[...Array(5)].map((_, i) => (
            <div key={i} className="h-14 bg-slate-100 rounded-xl" />
        ))}
    </div>
);

export default function Questions() {
    const { questions, loading, loadingMore, error, hasMore, loadMore, addQuestion, editQuestion, removeQuestion } = useQuestions();

    const [modalOpen, setModalOpen] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [actionError, setActionError] = useState('');

    const openAdd = () => { setEditTarget(null); setModalOpen(true); };
    const openEdit = (q) => { setEditTarget(q); setModalOpen(true); };
    const closeModal = () => { setModalOpen(false); setEditTarget(null); };

    const handleSubmit = async (data) => {
        setActionError('');
        if (editTarget) {
            await editQuestion(editTarget.id, data);
        } else {
            await addQuestion(data);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            await removeQuestion(deleteTarget.id);
            setDeleteTarget(null);
        } catch (e) {
            setActionError(e.message ?? 'Delete failed');
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="p-6 sm:p-8 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Questions</h1>
                    <p className="text-slate-500 text-sm mt-1">{questions.length} questions loaded</p>
                </div>
                <button
                    onClick={openAdd}
                    className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Question
                </button>
            </div>

            {/* Errors */}
            {(error || actionError) && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
                    ⚠️ {error || actionError}
                </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                {loading ? (
                    <Skeleton />
                ) : questions.length === 0 ? (
                    <div className="py-20 text-center">
                        <svg className="w-12 h-12 text-slate-200 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-slate-500 text-sm font-medium mb-3">No questions yet</p>
                        <button onClick={openAdd} className="text-xs text-indigo-600 font-semibold hover:underline">
                            Add your first question
                        </button>
                    </div>
                ) : (
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
                                {questions.map((q) => (
                                    <tr key={q.id} className={`hover:bg-slate-50 transition-colors ${q.id?.startsWith('temp_') ? 'opacity-60' : ''}`}>
                                        <td className="px-6 py-4">
                                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${SUBJECT_CLS[q.subject] ?? 'bg-slate-100 text-slate-600'}`}>
                                                {q.subject}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${DIFFICULTY_CLS[q.difficulty] ?? 'bg-slate-100 text-slate-600'}`}>
                                                {q.difficulty}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 max-w-xs">
                                            <p className="truncate">{q.question}</p>
                                            {q.options?.length > 0 && (
                                                <p className="text-xs text-slate-400 mt-0.5">{q.options.length} options · Ans: {q.correctAnswer}</p>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openEdit(q)}
                                                    disabled={q.id?.startsWith('temp_')}
                                                    className="px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors disabled:opacity-40"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => setDeleteTarget(q)}
                                                    disabled={q.id?.startsWith('temp_')}
                                                    className="px-3 py-1.5 text-xs font-semibold text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-40"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Footer */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between flex-wrap gap-3">
                    <p className="text-xs text-slate-400">Showing {questions.length} questions</p>
                    {hasMore && (
                        <button
                            onClick={loadMore}
                            disabled={loadingMore}
                            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg disabled:opacity-50 transition-colors"
                        >
                            {loadingMore ? (
                                <><div className="w-3 h-3 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" /> Loading...</>
                            ) : 'Load more'}
                        </button>
                    )}
                </div>
            </div>

            {/* Modals */}
            <QuestionModal
                isOpen={modalOpen}
                question={editTarget}
                onClose={closeModal}
                onSubmit={handleSubmit}
            />
            <ConfirmDialog
                isOpen={!!deleteTarget}
                title="Delete Question"
                message={`Are you sure you want to delete this ${deleteTarget?.subject ?? ''} question? This cannot be undone.`}
                confirmLabel="Delete"
                loading={deleting}
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
            />
        </div>
    );
}
