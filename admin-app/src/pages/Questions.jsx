import React, { useState } from 'react';
import { useQuestions } from '../hooks/useQuestions';
import QuestionModal from '../components/QuestionModal';
import ConfirmDialog from '../components/ConfirmDialog';

// ─── Constants ────────────────────────────────────────────────────────────────

const SUBJECTS = ['Physics', 'Chemistry', 'Biology', 'Maths', 'Zoology'];
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

const CHAPTERS_BY_SUBJECT = {
    Physics: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    Chemistry: [101, 102, 103, 104, 105, 106, 107, 108, 109],
    Maths: [201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 212, 213, 214],
    Zoology: [301, 302, 303, 304, 305, 306, 307, 308, 309],
    Biology: [310, 311, 312, 313, 314, 315, 316, 317, 318, 319],
};

const DIFFICULTY_CLS = {
    Easy: 'bg-emerald-50 text-emerald-600',
    Medium: 'bg-amber-50  text-amber-600',
    Hard: 'bg-red-50    text-red-500',
};
const SUBJECT_CLS = {
    Physics: 'bg-blue-50    text-blue-600',
    Chemistry: 'bg-purple-50  text-purple-600',
    Biology: 'bg-green-50   text-green-600',
    Maths: 'bg-indigo-50  text-indigo-600',
    Zoology: 'bg-teal-50    text-teal-600',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const Skeleton = () => (
    <div className="animate-pulse space-y-3 p-4">
        {[...Array(5)].map((_, i) => (
            <div key={i} className="h-14 bg-slate-100 rounded-xl" />
        ))}
    </div>
);

function FilterSelect({ id, label, value, onChange, options, placeholder }) {
    return (
        <div className="flex flex-col gap-1 min-w-[140px]">
            <label htmlFor={id} className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                {label}
            </label>
            <select
                id={id}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="text-sm border border-slate-200 bg-white rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition cursor-pointer"
            >
                <option value="">{placeholder}</option>
                {options.map((o) => (
                    <option key={o.value ?? o} value={o.value ?? o}>
                        {o.label ?? o}
                    </option>
                ))}
            </select>
        </div>
    );
}

function ActiveBadge({ isActive }) {
    if (isActive === false) {
        return (
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                Inactive
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Active
        </span>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Questions() {

    // ── Filters ────────────────────────────────────────────────────────────────
    const [filterSubject, setFilterSubject] = useState('');
    const [filterDifficulty, setFilterDifficulty] = useState('');
    const [filterChapterId, setFilterChapterId] = useState('');

    const filters = {
        ...(filterSubject ? { subject: filterSubject } : {}),
        ...(filterDifficulty ? { difficulty: filterDifficulty } : {}),
        ...(filterChapterId ? { chapterId: filterChapterId } : {}),
    };

    const {
        questions,
        loading, loadingMore, error, hasMore,
        loadMore, addQuestion, editQuestion, removeQuestion, bulkSetActiveQuestions,
    } = useQuestions(filters);

    // ── Chapter options (static) ────────────────────────────────────────────────
    const chapterOptions = filterSubject
        ? (CHAPTERS_BY_SUBJECT[filterSubject] ?? []).map((id) => ({ value: String(id), label: `Chapter ${id}` }))
        : Object.values(CHAPTERS_BY_SUBJECT).flat().sort((a, b) => a - b).map((id) => ({ value: String(id), label: `Chapter ${id}` }));

    // ── Selection state ─────────────────────────────────────────────────────────
    const [selected, setSelected] = useState(new Set());
    const [bulkWorking, setBulkWorking] = useState(false);

    const visibleIds = questions.filter((q) => !q.id?.startsWith('temp_')).map((q) => q.id);
    const allSelected = visibleIds.length > 0 && visibleIds.every((id) => selected.has(id));
    const someSelected = selected.size > 0;

    const toggleOne = (id) =>
        setSelected((prev) => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });

    const toggleAll = () =>
        setSelected(allSelected ? new Set() : new Set(visibleIds));

    const clearSelection = () => setSelected(new Set());

    const handleBulkActive = async (isActive) => {
        if (!someSelected) return;
        setBulkWorking(true);
        try {
            await bulkSetActiveQuestions([...selected], isActive);
            clearSelection();
        } finally {
            setBulkWorking(false);
        }
    };

    // ── Modals ──────────────────────────────────────────────────────────────────
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
        if (editTarget) await editQuestion(editTarget.id, data);
        else await addQuestion(data);
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            await removeQuestion(deleteTarget.id);
            setDeleteTarget(null);
            setSelected((prev) => { const s = new Set(prev); s.delete(deleteTarget.id); return s; });
        } catch (e) {
            setActionError(e.message ?? 'Delete failed');
        } finally {
            setDeleting(false);
        }
    };

    const clearFilters = () => {
        setFilterSubject('');
        setFilterDifficulty('');
        setFilterChapterId('');
    };

    const hasActiveFilter = filterSubject || filterDifficulty || filterChapterId;

    return (
        <div className="p-6 sm:p-8 space-y-6">

            {/* ── Header ──────────────────────────────────────────────────── */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Questions</h1>
                    <p className="text-slate-500 text-sm mt-1">
                        {questions.length} question{questions.length !== 1 ? 's' : ''} shown
                        {hasActiveFilter && ' (filtered)'}
                    </p>
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

            {/* ── Filter Bar ──────────────────────────────────────────────── */}
            <div className="bg-white border border-slate-200 rounded-2xl px-5 py-4">
                <div className="flex flex-wrap items-end gap-4">
                    <FilterSelect
                        id="filter-subject"
                        label="Subject"
                        value={filterSubject}
                        onChange={(v) => { setFilterSubject(v); setFilterChapterId(''); }}
                        options={SUBJECTS}
                        placeholder="All subjects"
                    />
                    <FilterSelect
                        id="filter-difficulty"
                        label="Difficulty"
                        value={filterDifficulty}
                        onChange={setFilterDifficulty}
                        options={DIFFICULTIES}
                        placeholder="All difficulties"
                    />
                    <FilterSelect
                        id="filter-chapter"
                        label="Chapter ID"
                        value={filterChapterId}
                        onChange={setFilterChapterId}
                        options={chapterOptions}
                        placeholder="All chapters"
                    />
                    {hasActiveFilter && (
                        <button
                            onClick={clearFilters}
                            className="mt-5 flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-500 hover:text-red-500 bg-slate-100 hover:bg-red-50 rounded-xl transition-colors"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Clear
                        </button>
                    )}
                </div>

                {hasActiveFilter && (
                    <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-100">
                        {filterSubject && (
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${SUBJECT_CLS[filterSubject] ?? 'bg-slate-100 text-slate-600'}`}>
                                {filterSubject}
                            </span>
                        )}
                        {filterDifficulty && (
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${DIFFICULTY_CLS[filterDifficulty] ?? 'bg-slate-100 text-slate-600'}`}>
                                {filterDifficulty}
                            </span>
                        )}
                        {filterChapterId && (
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                                Ch. {filterChapterId}
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* ── Bulk Toolbar (visible when rows are selected) ────────────── */}
            {someSelected && (
                <div className="flex items-center gap-3 bg-indigo-50 border border-indigo-100 rounded-2xl px-5 py-3 flex-wrap">
                    <span className="text-sm font-semibold text-indigo-700">
                        {selected.size} selected
                    </span>
                    <div className="flex items-center gap-2 ml-auto flex-wrap">
                        <button
                            onClick={() => handleBulkActive(true)}
                            disabled={bulkWorking}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 rounded-lg disabled:opacity-50 transition-colors"
                        >
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            Activate
                        </button>
                        <button
                            onClick={() => handleBulkActive(false)}
                            disabled={bulkWorking}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-200 hover:bg-slate-300 rounded-lg disabled:opacity-50 transition-colors"
                        >
                            <span className="w-2 h-2 rounded-full bg-slate-400" />
                            Deactivate
                        </button>
                        <button
                            onClick={clearSelection}
                            className="px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                    {bulkWorking && (
                        <div className="w-4 h-4 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" />
                    )}
                </div>
            )}

            {/* ── Error ───────────────────────────────────────────────────── */}
            {(error || actionError) && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
                    ⚠️ {error || actionError}
                </div>
            )}

            {/* ── Table ───────────────────────────────────────────────────── */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                {loading ? (
                    <Skeleton />
                ) : questions.length === 0 ? (
                    <div className="py-20 text-center">
                        <svg className="w-12 h-12 text-slate-200 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {hasActiveFilter ? (
                            <>
                                <p className="text-slate-500 text-sm font-medium mb-2">No questions match these filters</p>
                                <button onClick={clearFilters} className="text-xs text-indigo-600 font-semibold hover:underline">
                                    Clear filters
                                </button>
                            </>
                        ) : (
                            <>
                                <p className="text-slate-500 text-sm font-medium mb-3">No questions yet</p>
                                <button onClick={openAdd} className="text-xs text-indigo-600 font-semibold hover:underline">
                                    Add your first question
                                </button>
                            </>
                        )}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    {/* Select-all checkbox */}
                                    <th className="px-4 py-4 w-10">
                                        <input
                                            type="checkbox"
                                            checked={allSelected}
                                            onChange={toggleAll}
                                            className="w-4 h-4 rounded border-slate-300 text-indigo-600 cursor-pointer accent-indigo-600"
                                        />
                                    </th>
                                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-4">Status</th>
                                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-4">Subject</th>
                                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-4">Difficulty</th>
                                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-4 hidden sm:table-cell">Ch.</th>
                                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-4">Question Preview</th>
                                    <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {questions.map((q) => {
                                    const isTemp = q.id?.startsWith('temp_');
                                    const isSelected = selected.has(q.id);
                                    return (
                                        <tr
                                            key={q.id}
                                            className={`transition-colors ${isSelected ? 'bg-indigo-50/60' : 'hover:bg-slate-50'} ${isTemp ? 'opacity-60' : ''} ${q.isActive === false ? 'opacity-50' : ''}`}
                                        >
                                            {/* Checkbox */}
                                            <td className="px-4 py-4">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    disabled={isTemp}
                                                    onChange={() => toggleOne(q.id)}
                                                    className="w-4 h-4 rounded border-slate-300 cursor-pointer accent-indigo-600 disabled:opacity-40"
                                                />
                                            </td>
                                            {/* Active status */}
                                            <td className="px-4 py-4">
                                                <ActiveBadge isActive={q.isActive} />
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${SUBJECT_CLS[q.subject] ?? 'bg-slate-100 text-slate-600'}`}>
                                                    {q.subject}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${DIFFICULTY_CLS[q.difficulty] ?? 'bg-slate-100 text-slate-600'}`}>
                                                    {q.difficulty}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 hidden sm:table-cell text-slate-400 text-xs font-mono">
                                                {q.chapterId ?? '—'}
                                            </td>
                                            <td className="px-4 py-4 text-slate-600 max-w-xs">
                                                <p className="truncate">{q.question}</p>
                                                {q.options?.length > 0 && (
                                                    <p className="text-xs text-slate-400 mt-0.5">
                                                        {q.options.length} options · Ans: {q.correctAnswer}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => openEdit(q)}
                                                        disabled={isTemp}
                                                        className="px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors disabled:opacity-40"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteTarget(q)}
                                                        disabled={isTemp}
                                                        className="px-3 py-1.5 text-xs font-semibold text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-40"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Footer */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between flex-wrap gap-3">
                    <p className="text-xs text-slate-400">
                        Showing {questions.length} question{questions.length !== 1 ? 's' : ''}
                        {hasActiveFilter && ' · filtered'}
                        {someSelected && ` · ${selected.size} selected`}
                    </p>
                    {hasMore && !hasActiveFilter && (
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

            {/* ── Modals ──────────────────────────────────────────────────── */}
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
