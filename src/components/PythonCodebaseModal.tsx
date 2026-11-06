import React, { useState } from 'react';
import { Code2, Copy, Check, Download } from 'lucide-react';
import { CloneSettingsDocument } from '../data/storeTypes';
import { generatePythonSourceFiles } from '../data/pythonSourceFiles';

interface PythonCodebasePanelProps {
  activeClone: CloneSettingsDocument;
}

export const PythonCodebasePanel: React.FC<PythonCodebasePanelProps> = ({
  activeClone,
}) => {
  const files = generatePythonSourceFiles(activeClone);
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const activeFile = files[selectedFileIndex] || files[0];

  const handleCopyCode = () => {
    navigator.clipboard.writeText(activeFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleDownloadFile = () => {
    const blob = new Blob([activeFile.code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeFile.filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
      <div className="p-4 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-slate-100">
            Production Async Python Codebase (Hydrogram + Motor + aiohttp)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Live-synced with {activeClone.bot_username} (<code className="text-sky-300">{activeClone._id}</code>) · Ready for Render Free Web Service deployment.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyCode}
            className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied File' : 'Copy Code'}</span>
          </button>
          <button
            type="button"
            onClick={handleDownloadFile}
            className="px-3.5 py-1.5 text-xs font-medium bg-sky-600 hover:bg-sky-500 text-white rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download {activeFile.filename}</span>
          </button>
        </div>
      </div>

      {/* File Tabs */}
      <div className="flex items-center gap-1 px-4 py-2 bg-slate-900 border-b border-slate-800 overflow-x-auto">
        {files.map((file, idx) => (
          <button
            key={file.filename}
            type="button"
            onClick={() => setSelectedFileIndex(idx)}
            className={`px-3 py-1.5 text-xs font-mono rounded-md transition-colors whitespace-nowrap shrink-0 ${
              idx === selectedFileIndex
                ? 'bg-sky-600/20 text-sky-300 border border-sky-500/60 font-medium'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
            }`}
          >
            {file.filename}
          </button>
        ))}
      </div>

      {/* File Description Bar */}
      <div className="px-4 py-2 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <span>{activeFile.description}</span>
        <span className="font-mono tabular-nums">{activeFile.linesCount} lines</span>
      </div>

      {/* Source Code Viewer */}
      <pre className="p-4 bg-slate-950 text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed max-h-[540px] overflow-y-auto tabular-nums">
        {activeFile.code}
      </pre>
    </div>
  );
};
