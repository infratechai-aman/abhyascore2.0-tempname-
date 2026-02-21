import React, { useState, useRef } from 'react';
import { db } from '../firebase/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { bulkCreateQuestions } from '../services/firestoreService';

export default function BulkImportModal({ isOpen, onClose, onImportSuccess }) {
    const [file, setFile] = useState(null);
    const [parsing, setParsing] = useState(false);
    const [importing, setImporting] = useState(false);
    const [questions, setQuestions] = useState([]); // Array of parsed questions
    const [error, setError] = useState('');
    const [summary, setSummary] = useState(null); // { total, duplicates, net }
    const fileInputRef = useRef(null);

    if (!isOpen) return null;

    // Helper to map XML subject attributes to our standard subject names
    const resolveSubjectName = (xmlSubjectAttr, chapterId) => {
        const key = xmlSubjectAttr.toLowerCase();
        if (key === 'biology') {
            return chapterId >= 310 ? 'Biology' : 'Zoology';
        }
        const mapping = {
            physics: 'Physics',
            chemistry: 'Chemistry',
            mathematics: 'Maths',
            maths: 'Maths'
        };
        return mapping[key] ?? xmlSubjectAttr;
    };

    const parseXML = async (xmlText) => {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

        const chapterNode = xmlDoc.getElementsByTagName('chapter')[0];
        if (!chapterNode) throw new Error('Invalid XML: No <chapter> tag found.');

        const chapterId = parseInt(chapterNode.getAttribute('id'));
        const subjectAttr = chapterNode.getAttribute('subject') ?? '';
        const subjectName = resolveSubjectName(subjectAttr, chapterId);

        const parsed = [];
        const difficulties = ['easy', 'medium', 'hard'];

        difficulties.forEach(diff => {
            const diffNode = xmlDoc.getElementsByTagName(diff)[0];
            if (!diffNode) return;

            const diffLabel = diff.charAt(0).toUpperCase() + diff.slice(1);
            const qNodes = Array.from(diffNode.getElementsByTagName('question'));

            qNodes.forEach(qNode => {
                const text = qNode.getElementsByTagName('text')[0]?.textContent?.trim();
                const answerLetter = qNode.getElementsByTagName('answer')[0]?.textContent?.trim();
                const explanation = qNode.getElementsByTagName('explanation')[0]?.textContent?.trim();

                const optionNodes = Array.from(qNode.getElementsByTagName('option'));
                const options = optionNodes.map(o => o.textContent?.trim());

                const correctOpt = optionNodes.find(o => o.getAttribute('id') === answerLetter);
                const correctAnswer = correctOpt?.textContent?.trim();

                if (text && options.length >= 2 && correctAnswer) {
                    parsed.push({
                        subject: subjectName,
                        chapterId,
                        difficulty: diffLabel,
                        question: text,
                        options,
                        correctAnswer,
                        ...(explanation ? { explanation } : {}),
                        isActive: true
                    });
                }
            });
        });

        return parsed;
    };

    const handleFileChange = async (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        setFile(selectedFile);
        setError('');
        setParsing(true);
        setQuestions([]);
        setSummary(null);

        try {
            const text = await selectedFile.text();
            const parsedQuestions = await parseXML(text);

            if (parsedQuestions.length === 0) {
                throw new Error('No valid questions found in this XML file.');
            }

            // Deduplication Check
            console.log('[BulkImport] Checking for duplicates...');
            const snap = await getDocs(collection(db, 'question_pools'));
            const existingSet = new Set();
            snap.docs.forEach(d => {
                const data = d.data();
                if (typeof data.question === 'string') {
                    existingSet.add(`${data.subject}|${data.chapterId}|${data.difficulty}|${data.question}`);
                }
            });

            const uniqueQuestions = [];
            let duplicateCount = 0;

            parsedQuestions.forEach(q => {
                const sig = `${q.subject}|${q.chapterId}|${q.difficulty}|${q.question}`;
                if (existingSet.has(sig)) {
                    duplicateCount++;
                } else {
                    uniqueQuestions.push(q);
                }
            });

            setQuestions(uniqueQuestions);
            setSummary({
                total: parsedQuestions.length,
                duplicates: duplicateCount,
                net: uniqueQuestions.length
            });

        } catch (err) {
            setError(err.message);
            setFile(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        } finally {
            setParsing(false);
        }
    };

    const handleImport = async () => {
        if (questions.length === 0) return;
        setImporting(true);
        setError('');

        try {
            await bulkCreateQuestions(questions);
            onImportSuccess(questions.length);
            handleClose();
        } catch (err) {
            setError('Import failed: ' + err.message);
        } finally {
            setImporting(false);
        }
    };

    const handleClose = () => {
        setFile(null);
        setQuestions([]);
        setError('');
        setSummary(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px', width: '90%' }}>
                <div className="modal-header">
                    <h2 className="modal-title">Bulk Import Questions (XML)</h2>
                    <button className="modal-close" onClick={handleClose}>&times;</button>
                </div>

                <div className="modal-body">
                    {!file && !parsing && (
                        <div style={{ textAlign: 'center', padding: '2rem', border: '2px dashed var(--card-border)', borderRadius: '0.75rem' }}>
                            <svg style={{ width: '3rem', height: '3rem', color: 'var(--text-muted)', marginBottom: '1rem' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <p style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>Select an XML file to parse questions</p>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept=".xml"
                                style={{ display: 'none' }}
                                id="xml-upload-input"
                            />
                            <label htmlFor="xml-upload-input" className="btn btn-primary" style={{ cursor: 'pointer' }}>
                                Choose XML File
                            </label>
                        </div>
                    )}

                    {parsing && (
                        <div style={{ textAlign: 'center', padding: '2rem' }}>
                            <div className="spinner" style={{ margin: '0 auto 1rem' }} />
                            <p>Parsing XML and checking for duplicates...</p>
                        </div>
                    )}

                    {error && (
                        <div className="badge-danger" style={{ padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.85rem' }}>
                            ⚠️ {error}
                        </div>
                    )}

                    {summary && (
                        <div style={{ background: 'var(--bg-light)', padding: '1rem', borderRadius: '0.75rem', marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span>Total found:</span>
                                <strong>{summary.total}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: summary.duplicates > 0 ? 'var(--warning)' : 'inherit', marginBottom: '0.5rem' }}>
                                <span>Existing duplicates (skipped):</span>
                                <strong>{summary.duplicates}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--card-border)', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
                                <span>New questions to import:</span>
                                <strong style={{ color: 'var(--primary)', fontSize: '1.2rem' }}>{summary.net}</strong>
                            </div>
                        </div>
                    )}

                    {questions.length > 0 && (
                        <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid var(--card-border)', borderRadius: '0.5rem', padding: '0.5rem' }}>
                            <p style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem', padding: '0 0.25rem' }}>Preview (First 10)</p>
                            {questions.slice(0, 10).map((q, i) => (
                                <div key={i} style={{ padding: '0.5rem', borderBottom: i === 9 || i === questions.length - 1 ? 'none' : '1px solid var(--card-border)', fontSize: '0.8rem' }}>
                                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                        <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>{q.subject}</span>
                                        <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}>Ch {q.chapterId}</span>
                                    </div>
                                    <p style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.question}</p>
                                </div>
                            ))}
                            {questions.length > 10 && (
                                <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', padding: '0.5rem' }}>
                                    + {questions.length - 10} more questions
                                </p>
                            )}
                        </div>
                    )}
                </div>

                <div className="modal-footer" style={{ justifyContent: 'flex-end', gap: '0.75rem' }}>
                    <button className="btn btn-outline" onClick={handleClose} disabled={importing}>Cancel</button>
                    {questions.length > 0 && (
                        <button className="btn btn-primary" onClick={handleImport} disabled={importing}>
                            {importing ? 'Importing...' : `Import ${questions.length} Questions`}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
