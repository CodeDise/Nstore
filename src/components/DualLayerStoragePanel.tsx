import React, { useState } from 'react';
import {
  UploadCloud,
  HardDrive,
  ShieldAlert,
  FileArchive,
  Plus,
  ArrowRight,
  Layers,
} from 'lucide-react';
import {
  CloneSettingsDocument,
  DigitalProduct,
  ChannelLogEntry,
} from '../data/storeTypes';

interface DualLayerStoragePanelProps {
  activeClone: CloneSettingsDocument;
  products: DigitalProduct[];
  channelLogs: ChannelLogEntry[];
  onUploadDigitalProduct: (newProduct: {
    title: string;
    category: string;
    price_usd: number;
    stock: number;
    file_name: string;
    file_size: string;
    file_type: 'ZIP' | 'PDF' | 'MP4' | 'SOURCE_BUNDLE';
  }) => void;
  onUpdateChannelIds: (dbChannelId: number, logChannelId: number) => void;
}

export const DualLayerStoragePanel: React.FC<DualLayerStoragePanelProps> = ({
  activeClone,
  products,
  channelLogs,
  onUploadDigitalProduct,
  onUpdateChannelIds,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Source Code');
  const [priceUsd, setPriceUsd] = useState('15.00');
  const [stock, setStock] = useState('50');
  const [fileName, setFileName] = useState('nohara_premium_kit_v2.zip');
  const [fileSize, setFileSize] = useState('128.5 MB');
  const [fileType, setFileType] = useState<'ZIP' | 'PDF' | 'MP4' | 'SOURCE_BUNDLE'>('ZIP');

  const [dbChannelInput, setDbChannelInput] = useState(String(activeClone.db_channel_id));
  const [logChannelInput, setLogChannelInput] = useState(String(activeClone.log_channel_id));
  const [channelFilter, setChannelFilter] = useState<'ALL' | 'CLONE_PRIVATE_DB' | 'MASTER_ADMIN_AUDIT'>('ALL');

  React.useEffect(() => {
    setDbChannelInput(String(activeClone.db_channel_id));
    setLogChannelInput(String(activeClone.log_channel_id));
  }, [activeClone]);

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onUploadDigitalProduct({
      title: title.trim(),
      category,
      price_usd: parseFloat(priceUsd) || 10.0,
      stock: parseInt(stock, 10) >= 0 ? parseInt(stock, 10) : 10,
      file_name: fileName.trim() || 'digital_payload.zip',
      file_size: fileSize.trim() || '45.0 MB',
      file_type: fileType,
    });
    setTitle('');
  };

  const handleSaveChannels = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateChannelIds(
      parseInt(dbChannelInput, 10) || activeClone.db_channel_id,
      parseInt(logChannelInput, 10) || activeClone.log_channel_id
    );
  };

  const cloneProducts = products.filter((p) => p.bot_id === activeClone._id);
  const filteredLogs = channelLogs.filter((l) =>
    channelFilter === 'ALL' ? true : l.channel_type === channelFilter
  );

  return (
    <div className="space-y-6">
      {/* Dual-Layer Channel Pointer Configuration */}
      <form
        onSubmit={handleSaveChannels}
        className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-semibold text-slate-100">
              Dual-Layer Telegram Database Channel Bindings
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Heavy files reside in Telegram’s cloud infrastructure; MongoDB stores only 64-bit integer <code className="text-sky-300">message_id</code> pointers.
            </p>
          </div>
          <button
            type="submit"
            className="px-3.5 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            Update Channel Pointers
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800">
            <label className="block text-xs text-slate-400 mb-1">
              Clone Private DB Channel (/setdbchannel)
            </label>
            <input
              type="text"
              value={dbChannelInput}
              onChange={(e) => setDbChannelInput(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs font-mono tabular-nums bg-slate-900 border border-slate-800 rounded text-slate-100"
            />
            <span className="block text-[11px] text-slate-500 mt-1">
              Bot must have Admin Post permission
            </span>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800">
            <label className="block text-xs text-slate-400 mb-1">
              Clone Owner Audit Channel (/setlogchannel)
            </label>
            <input
              type="text"
              value={logChannelInput}
              onChange={(e) => setLogChannelInput(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs font-mono tabular-nums bg-slate-900 border border-slate-800 rounded text-slate-100"
            />
            <span className="block text-[11px] text-slate-500 mt-1">
              Receives store sales & wallet logs
            </span>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800">
            <label className="block text-xs text-amber-300/90 mb-1">
              Master Admin Central Audit & Backup Channel
            </label>
            <div className="px-2.5 py-1.5 text-xs font-mono tabular-nums bg-slate-900/60 border border-amber-900/40 rounded text-amber-200">
              {activeClone.master_audit_channel_id}
            </div>
            <span className="block text-[11px] text-slate-500 mt-1">
              Mandatory platform-wide mirror (Immutable)
            </span>
          </div>
        </div>
      </form>

      {/* Upload New Digital Product to Dual-Layer Channel Vault */}
      <form
        onSubmit={handleUploadSubmit}
        className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4"
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-100">
              Upload Digital Asset to Private Channel + Master Backup Mirror
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Simulates uploading a file to {activeClone.bot_username}: forwards payload to <code className="text-sky-300">{activeClone.db_channel_id}</code> and mirrors backup to <code className="text-amber-300">{activeClone.master_audit_channel_id}</code>.
            </p>
          </div>
          <button
            type="submit"
            className="px-4 py-2 text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Upload & Mirror Asset</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-xs text-slate-400 mb-1">Product Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Async Telegram SaaS Kit v5"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-md text-slate-100"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Price (USD)</label>
            <input
              type="number"
              step="0.5"
              value={priceUsd}
              onChange={(e) => setPriceUsd(e.target.value)}
              className="w-full px-3 py-1.5 text-xs font-mono tabular-nums bg-slate-950 border border-slate-800 rounded-md text-slate-100"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Stock Count (0 = OOS)</label>
            <input
              type="number"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              className="w-full px-3 py-1.5 text-xs font-mono tabular-nums bg-slate-950 border border-slate-800 rounded-md text-slate-100"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">File Format & Size</label>
            <div className="flex gap-1.5">
              <select
                value={fileType}
                onChange={(e) => setFileType(e.target.value as any)}
                className="px-2 py-1.5 text-xs font-mono bg-slate-950 border border-slate-800 rounded-md text-slate-200"
              >
                <option value="ZIP">ZIP</option>
                <option value="PDF">PDF</option>
                <option value="MP4">MP4</option>
              </select>
              <input
                type="text"
                value={fileSize}
                onChange={(e) => setFileSize(e.target.value)}
                className="w-full px-2 py-1.5 text-xs font-mono bg-slate-950 border border-slate-800 rounded-md text-slate-100"
              />
            </div>
          </div>
        </div>
      </form>

      {/* Pointer Table in MongoDB */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-100">
            Lightweight Product Metadata Pointers ({cloneProducts.length} Items)
          </h3>
          <span className="text-xs font-mono text-slate-400 tabular-nums">
            1 USD = ₹{activeClone.usd_to_inr} INR
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-mono text-slate-400 bg-slate-950/60">
                <th className="py-2.5 px-4">ID / Product</th>
                <th className="py-2.5 px-4">Payload File</th>
                <th className="py-2.5 px-4 text-right">Price (USD / INR)</th>
                <th className="py-2.5 px-4 text-right">Stock</th>
                <th className="py-2.5 px-4 text-right">Clone DB Pointer</th>
                <th className="py-2.5 px-4 text-right">Master Backup Pointer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70 text-xs">
              {cloneProducts.map((prod) => (
                <tr key={prod._id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 px-4">
                    <div className="font-medium text-slate-100">{prod.title}</div>
                    <div className="text-[11px] font-mono text-slate-400">
                      {prod._id} · {prod.category}
                    </div>
                  </td>
                  <td className="py-2.5 px-4 font-mono text-slate-300">
                    {prod.file_name} · {prod.file_size}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono tabular-nums text-slate-200">
                    ${prod.price_usd.toFixed(2)} / ₹{(prod.price_usd * activeClone.usd_to_inr).toFixed(0)}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono tabular-nums">
                    <span
                      className={
                        prod.stock === 0 ? 'text-rose-400 font-semibold' : 'text-emerald-400'
                      }
                    >
                      {prod.stock === 0 ? '0 (OOS)' : prod.stock}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono tabular-nums text-sky-400">
                    msg_id #{prod.db_channel_message_id}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono tabular-nums text-amber-300">
                    msg_id #{prod.master_backup_message_id}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Live Dual-Layer Audit & Backup Stream */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-100">
              Master Admin Audit & Clone DB Channel Event Stream
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Real-time verification of every product upload, payment callback, and wallet operation.
            </p>
          </div>
          <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-lg">
            {(
              [
                { id: 'ALL', label: 'All Channels' },
                { id: 'CLONE_PRIVATE_DB', label: 'Clone DB Channel' },
                { id: 'MASTER_ADMIN_AUDIT', label: 'Master Audit Channel' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setChannelFilter(tab.id)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  channelFilter === tab.id
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {filteredLogs.map((log) => (
            <div
              key={log.id}
              className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-mono text-slate-400 tabular-nums">
                  <span
                    className={
                      log.channel_type === 'MASTER_ADMIN_AUDIT'
                        ? 'text-amber-300 font-semibold'
                        : 'text-sky-400 font-semibold'
                    }
                  >
                    {log.channel_type} ({log.channel_id})
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>msg_id #{log.message_id}</span>
                  <span aria-hidden="true">·</span>
                  <span>{log.bot_username}</span>
                  <span aria-hidden="true">·</span>
                  <span>{log.timestamp}</span>
                </div>
                <div className="text-xs text-slate-200">{log.summary}</div>
              </div>
              <div className="text-[11px] font-mono text-slate-400 bg-slate-900 px-2.5 py-1.5 rounded border border-slate-800 shrink-0 tabular-nums">
                {JSON.stringify(log.metadata_pointer)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
