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

const DIFFICULTY_BADGE = {
    Easy: 'badge-success',
    Medium: 'badge-warning',
    Hard: 'badge-danger',
};
const SUBJECT_BADGE = {
    Physics: 'badge-primary',
    Chemistry: 'badge-info',
    Biology: 'badge-success',
    Maths: 'badge-warning',
    Zoology: 'badge-indigo',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const Skeleton = () => (
    <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
        {[...Array(5)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: '3.5rem', borderRadius: '0.5rem' }} />
        ))}
    </div>
);

function FilterSelect({ id, label, value, onChange, options, placeholder }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', minWidth: '10rem' }}>
            <label htmlFor={id} className="form-label">{label}</label>
            <select
                id={id}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="form-select"
                style={{ cursor: 'pointer' }}
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
            <span className="badge badge-gray">
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--text-muted)', marginRight: '0.25rem', flexShrink: 0 }} />
                Inactive
            </span>
        );
    }
    return (
        <span className="badge badge-success">
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'rgb(var(--success-rgb))', marginRight: '0.25rem', flexShrink: 0 }} />
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
    const [filterStatus, setFilterStatus] = useState(''); // '' | 'active' | 'inactive'
    const [pageSize, setPageSize] = useState(20); // 20 | 50 | 100 | 0 (All)

    const filters = {
        ...(filterSubject ? { subject: filterSubject } : {}),
        ...(filterDifficulty ? { difficulty: filterDifficulty } : {}),
        ...(filterChapterId ? { chapterId: filterChapterId } : {}),
    };

    const {
        questions: rawQuestions,
        totalCount,
        loading, loadingMore, error, hasMore,
        loadMore, addQuestion, editQuestion, removeQuestion, bulkSetActiveQuestions,
    } = useQuestions(filters, pageSize);

    // Client-side status filter applied on top of hook results
    const questions = filterStatus === 'active'
        ? rawQuestions.filter((q) => q.isActive !== false)
        : filterStatus === 'inactive'
            ? rawQuestions.filter((q) => q.isActive === false)
            : rawQuestions;


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
        setFilterStatus('');
    };

    const hasActiveFilter = filterSubject || filterDifficulty || filterChapterId || filterStatus;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* ── Header ──────────────────────────────────────────────────── */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div className="page-header" style={{ marginBottom: 0 }}>
                    <div className="breadcrumb">
                        <span>Admin</span><span>/</span><span>Questions</span>
                    </div>
                    <h1>Questions</h1>
                    <p>
                        {hasActiveFilter
                            ? <>{questions.length} of {totalCount ?? rawQuestions.length} question{(totalCount ?? rawQuestions.length) !== 1 ? 's' : ''} <span style={{ color: 'var(--primary)', fontWeight: 600 }}>(filtered)</span></>
                            : <>{totalCount !== null ? totalCount : rawQuestions.length} question{(totalCount ?? rawQuestions.length) !== 1 ? 's' : ''} total</>
                        }
                    </p>
                </div>
                <button onClick={openAdd} className="btn btn-primary">
                    <svg style={{ width: '0.875rem', height: '0.875rem' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Question
                </button>
            </div>

            {/* ── Filter Bar ──────────────────────────────────────────────── */}
            <div className="card" style={{ padding: '1rem 1.25rem' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: '0.875rem' }}>
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
                    <FilterSelect
                        id="filter-status"
                        label="Status"
                        value={filterStatus}
                        onChange={setFilterStatus}
                        options={[
                            { value: 'active', label: '🟢 Active' },
                            { value: 'inactive', label: '⚫ Inactive' },
                        ]}
                        placeholder="All statuses"
                    />
                    {hasActiveFilter && (
                        <button onClick={clearFilters} className="btn btn-danger btn-sm" style={{ alignSelf: 'flex-end' }}>
                            <svg style={{ width: '0.75rem', height: '0.75rem' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Clear
                        </button>
                    )}
                </div>

                {hasActiveFilter && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--card-border)' }}>
                        {filterSubject && <span className={`badge ${SUBJECT_BADGE[filterSubject] ?? 'badge-gray'}`}>{filterSubject}</span>}
                        {filterDifficulty && <span className={`badge ${DIFFICULTY_BADGE[filterDifficulty] ?? 'badge-gray'}`}>{filterDifficulty}</span>}
                        {filterChapterId && <span className="badge badge-gray">Ch. {filterChapterId}</span>}
                        {filterStatus && <span className={`badge ${filterStatus === 'active' ? 'badge-success' : 'badge-gray'}`}>
                            {filterStatus === 'active' ? '🟢 Active only' : '⚫ Inactive only'}
                        </span>}
                    </div>
                )}
            </div>

            {/* ── Bulk Toolbar ─────────────────────────────────────────────── */}
            {someSelected && (
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap',
                    background: 'var(--primary-01)', border: '1px solid var(--primary-02)',
                    borderRadius: '0.625rem', padding: '0.75rem 1rem'
                }}>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--primary)' }}>
                        {selected.size} selected
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto', flexWrap: 'wrap' }}>
                        <button onClick={() => handleBulkActive(true)} disabled={bulkWorking} className="btn btn-sm badge-success" style={{ background: 'rgba(var(--success-rgb),0.12)', color: 'rgb(var(--success-rgb))', border: 'none', cursor: 'pointer' }}>
                            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'rgb(var(--success-rgb))' }} />
                            Activate
                        </button>
                        <button onClick={() => handleBulkActive(false)} disabled={bulkWorking} className="btn btn-outline btn-sm">
                            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--text-muted)' }} />
                            Deactivate
                        </button>
                        <button onClick={clearSelection} className="btn btn-outline btn-sm">Cancel</button>
                    </div>
                </div>
            )}

            {/* ── Error ───────────────────────────────────────────────────── */}
            {(error || actionError) && (
                <div style={{ background: 'rgba(230,83,60,0.08)', border: '1px solid rgba(230,83,60,0.25)', borderRadius: '0.625rem', padding: '0.75rem 1rem', fontSize: '0.8125rem', color: 'rgb(var(--danger-rgb))' }}>
                    ⚠️ {error || actionError}
                </div>
            )}

            {/* ── Table ───────────────────────────────────────────────────── */}
            <div className="card" style={{ overflow: 'hidden' }}>
                {loading ? (
                    <Skeleton />
                ) : questions.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">
                            <svg style={{ width: '1.5rem', height: '1.5rem' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        {hasActiveFilter ? (
                            <>
                                <p style={{ fontWeight: 500 }}>No questions match these filters</p>
                                <button onClick={clearFilters} className="btn btn-outline btn-sm" style={{ marginTop: '0.5rem' }}>Clear filters</button>
                            </>
                        ) : (
                            <>
                                <p style={{ fontWeight: 500 }}>No questions yet</p>
                                <button onClick={openAdd} className="btn btn-primary btn-sm" style={{ marginTop: '0.5rem' }}>Add your first question</button>
                            </>
                        )}
                    </div>
                ) : (
                    <div className="table-wrapper">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '2.5rem' }}>
                                        <input
                                            type="checkbox"
                                            checked={allSelected}
                                            onChange={toggleAll}
                                            style={{ width: '1rem', height: '1rem', accentColor: 'var(--primary)', cursor: 'pointer' }}
                                        />
                                    </th>
                                    <th>Status</th>
                                    <th>Subject</th>
                                    <th>Difficulty</th>
                                    <th>Ch.</th>
                                    <th>Question Preview</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {questions.map((q) => {
                                    const isTemp = q.id?.startsWith('temp_');
                                    const isSelected = selected.has(q.id);
                                    return (
                                        <tr
                                            key={q.id}
                                            style={{
                                                background: isSelected ? 'var(--primary-005)' : undefined,
                                                opacity: (isTemp || q.isActive === false) ? 0.6 : 1
                                            }}
                                        >
                                            <td>
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    disabled={isTemp}
                                                    onChange={() => toggleOne(q.id)}
                                                    style={{ width: '1rem', height: '1rem', accentColor: 'var(--primary)', cursor: 'pointer' }}
                                                />
                                            </td>
                                            <td><ActiveBadge isActive={q.isActive} /></td>
                                            <td>
                                                <span className={`badge ${SUBJECT_BADGE[q.subject] ?? 'badge-gray'}`}>{q.subject}</span>
                                            </td>
                                            <td>
                                                <span className={`badge ${DIFFICULTY_BADGE[q.difficulty] ?? 'badge-gray'}`}>{q.difficulty}</span>
                                            </td>
                                            <td style={{ color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '0.75rem' }}>
                                                {q.chapterId ?? '—'}
                                            </td>
                                            <td style={{ maxWidth: '20rem' }}>
                                                <p style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.question}</p>
                                                {q.options?.length > 0 && (
                                                    <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>
                                                        {q.options.length} options · Ans: {q.correctAnswer}
                                                    </p>
                                                )}
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.375rem' }}>
                                                    <button onClick={() => openEdit(q)} disabled={isTemp} className="btn btn-sm badge-primary" style={{ background: 'var(--primary-01)', color: 'var(--primary)', border: 'none', cursor: 'pointer', opacity: isTemp ? 0.4 : 1 }}>Edit</button>
                                                    <button onClick={() => setDeleteTarget(q)} disabled={isTemp} className="btn btn-danger btn-sm" style={{ opacity: isTemp ? 0.4 : 1 }}>Delete</button>
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
                <div style={{
                    padding: '0.75rem 1rem', borderTop: '1px solid var(--card-border)',
                    background: 'rgba(var(--primary-rgb),0.02)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Show</span>
                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                            {[20, 50, 100, 0].map((size) => (
                                <button
                                    key={size}
                                    onClick={() => setPageSize(size)}
                                    style={{
                                        padding: '0.2rem 0.55rem', fontSize: '0.6875rem', fontWeight: 600, borderRadius: '0.375rem',
                                        border: '1px solid', cursor: 'pointer', transition: 'all 0.15s',
                                        background: pageSize === size ? 'var(--primary)' : 'transparent',
                                        color: pageSize === size ? '#fff' : 'var(--text-muted)',
                                        borderColor: pageSize === size ? 'var(--primary)' : 'var(--card-border)'
                                    }}
                                >
                                    {size === 0 ? 'All' : size}
                                </button>
                            ))}
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Showing {rawQuestions.length}{totalCount !== null && rawQuestions.length < totalCount ? ` of ${totalCount}` : ''}{someSelected ? ` · ${selected.size} selected` : ''}
                        </span>
                    </div>
                    {hasMore && pageSize !== 0 && (
                        <button onClick={loadMore} disabled={loadingMore} className="btn btn-outline btn-sm">
                            {loadingMore ? 'Loading…' : 'Load more'}
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
