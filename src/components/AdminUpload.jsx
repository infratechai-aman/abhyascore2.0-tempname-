import React, { useState } from 'react';
import { db } from '../firebase';
import { writeBatch, doc, collection } from 'firebase/firestore';
import { Upload, FileText, CheckCircle, AlertCircle, Terminal } from 'lucide-react';

const AdminUpload = ({ onBack }) => {
    const [logs, setLogs] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);

    const addLog = (msg, type = 'info') => {
        setLogs(prev => [...prev, { msg, type, time: new Date().toLocaleTimeString() }]);
    };

    const parseXML = (xmlText) => {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, "text/xml");

        const chapterNode = xmlDoc.getElementsByTagName("chapter")[0];
        if (!chapterNode) throw new Error("No chapter tag found");

        const subject = chapterNode.getAttribute("subject");
        const chapterId = parseInt(chapterNode.getAttribute("id"));
        const chapterName = chapterNode.getAttribute("name");

        let subjectCode = subject.toLowerCase().substring(0, 3);

        // Correct mapping to match App.jsx expectations
        if (subject.toLowerCase() === 'physics') subjectCode = 'phy';
        if (subject.toLowerCase() === 'chemistry') subjectCode = 'chem';
        if (subject.toLowerCase() === 'mathematics') subjectCode = 'math';
        if (subject.toLowerCase() === 'biology') {
            // Distinguish Botany vs Zoology based on ID range
            // Botany (310+) -> bio
            // Zoology (301-309) -> zoo
            if (chapterId >= 310) subjectCode = 'bio';
            else subjectCode = 'zoo';
        }

        const difficulties = ['easy', 'medium', 'hard'];
        const pools = [];

        difficulties.forEach(diff => {
            const diffNode = xmlDoc.getElementsByTagName(diff)[0];
            if (diffNode) {
                const questions = [];
                const qNodes = diffNode.getElementsByTagName("question");

                Array.from(qNodes).forEach((qNode, index) => {
                    const text = qNode.getElementsByTagName("text")[0]?.textContent || "";
                    const answer = qNode.getElementsByTagName("answer")[0]?.textContent || "";
                    const explanation = qNode.getElementsByTagName("explanation")[0]?.textContent || "";

                    const options = [];
                    Array.from(qNode.getElementsByTagName("option")).forEach(opt => {
                        options.push({
                            id: opt.getAttribute("id") || "unknown",
                            text: opt.textContent || ""
                        });
                    });

                    questions.push({
                        id: `q${index + 1}`,
                        text,
                        options,
                        answer,
                        explanation
                    });
                });

                if (questions.length > 0) {
                    pools.push({
                        id: `${subjectCode}_${chapterId}_${diff}`,
                        data: {
                            subject: subjectCode, // Store the code (phy, chem, etc) used for retrieval
                            chapterId: chapterId,
                            chapterName,
                            difficulty: diff,
                            version: 1,
                            questions
                        }
                    });
                }
            }
        });

        return pools;
    };

    const handleUpload = async () => {
        setUploading(true);
        setLogs([]);
        addLog("Starting upload process...", "info");

        try {
            // Import all XML files using Vite's glob import
            const modules = import.meta.glob('../data/raw_questions/*.xml', { as: 'raw', eager: true });
            const filePaths = Object.keys(modules);

            addLog(`Found ${filePaths.length} XML files.`, "info");

            let totalPools = 0;
            const allPools = [];

            // 1. Parse all files
            for (const path of filePaths) {
                try {
                    // Skip template file
                    if (path.includes('template.xml')) continue;

                    const xmlContent = modules[path];
                    const pools = parseXML(xmlContent);
                    allPools.push(...pools);
                    addLog(`Parsed ${path.split('/').pop()} (${pools.length} pools)`, "success");
                } catch (e) {
                    addLog(`Failed to parse ${path}: ${e.message}`, "error");
                }
            }

            addLog(`Total pools to upload: ${allPools.length}`, "info");

            // 2. Upload in batches (Firestore limit is 500 ops per batch)
            const batchSize = 400;
            const chunks = [];
            for (let i = 0; i < allPools.length; i += batchSize) {
                chunks.push(allPools.slice(i, i + batchSize));
            }

            let completed = 0;

            for (const chunk of chunks) {
                const batch = writeBatch(db);
                chunk.forEach(pool => {
                    const docRef = doc(db, "question_pools", pool.id);
                    batch.set(docRef, pool.data);
                });

                await batch.commit();
                completed += chunk.length;
                setProgress((completed / allPools.length) * 100);
                addLog(`Uploaded batch of ${chunk.length} pools...`, "success");
            }

            addLog("All uploads completed successfully!", "success");

        } catch (error) {
            console.error(error);
            addLog(`Critical Error: ${error.message}`, "error");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="h-full flex flex-col items-center justify-center p-8 animate-in fade-in">
            <div className="w-full max-w-2xl bg-[#16161c] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">

                {/* Header */}
                <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 p-6 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400">
                            <Upload size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-white tracking-tight">DATA UPLINK</h2>
                            <p className="text-white/40 text-xs font-bold tracking-widest uppercase">Admin Control Panel</p>
                        </div>
                    </div>
                    <button
                        onClick={onBack}
                        disabled={uploading}
                        className="text-white/40 hover:text-white text-xs font-bold uppercase tracking-widest"
                    >
                        Exit
                    </button>
                </div>

                {/* Body */}
                <div className="p-8">
                    <p className="text-white/60 mb-8 text-sm leading-relaxed">
                        This tool scans the local <code className="bg-white/10 px-2 py-1 rounded text-white font-mono text-xs">src/data/raw_questions</code> directory,
                        parses all XML files, and hydrates the Firestore <code className="bg-white/10 px-2 py-1 rounded text-white font-mono text-xs">question_pools</code> collection.
                    </p>

                    <button
                        onClick={handleUpload}
                        disabled={uploading}
                        className={`w-full py-4 rounded-xl font-black text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all
                            ${uploading
                                ? 'bg-white/5 text-white/20 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_30px_rgba(37,99,235,0.3)] hover:shadow-[0_0_50px_rgba(37,99,235,0.5)]'
                            }`}
                    >
                        {uploading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <Upload size={18} />
                                Initiate Upload
                            </>
                        )}
                    </button>

                    {/* Progress Bar */}
                    {uploading && (
                        <div className="mt-6">
                            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-500 transition-all duration-500 ease-out"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Console Output */}
                <div className="bg-black/50 border-t border-white/5 p-4 h-64 overflow-y-auto font-mono text-xs">
                    <div className="flex items-center gap-2 text-white/20 mb-3 sticky top-0 bg-black/50 backdrop-blur w-full pb-2">
                        <Terminal size={14} />
                        <span className="uppercase tracking-widest font-bold">System Logs</span>
                    </div>

                    <div className="space-y-1.5">
                        {logs.length === 0 && <span className="text-white/20 italic">Waiting for command...</span>}
                        {logs.map((log, i) => (
                            <div key={i} className="flex gap-3">
                                <span className="text-white/20 shrink-0 select-none">[{log.time}]</span>
                                <span className={`
                                    ${log.type === 'error' ? 'text-red-400' : ''}
                                    ${log.type === 'success' ? 'text-green-400' : ''}
                                    ${log.type === 'info' ? 'text-blue-200' : ''}
                                `}>
                                    {log.type === 'success' && '✓ '}
                                    {log.type === 'error' && '✕ '}
                                    {log.msg}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AdminUpload;
