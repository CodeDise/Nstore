import React, { useState } from 'react';
import {
  Bot,
  PlusCircle,
  Trash2,
  Users,
  Wallet,
  Shield,
  ArrowUpCircle,
  ArrowDownCircle,
} from 'lucide-react';
import {
  CloneSettingsDocument,
  UserWalletRecord,
  FSubChannel,
} from '../data/storeTypes';

interface CloneFleetManagerPanelProps {
  clones: CloneSettingsDocument[];
  activeClone: CloneSettingsDocument;
  wallets: UserWalletRecord[];
  activeWallet: UserWalletRecord;
  onSelectClone: (botId: string) => void;
  onSelectWalletUser: (userId: number) => void;
  onCreateClone: (botToken: string, botUsername: string, botName: string, ownerUsername: string) => void;
  onDeleteClone: (botId: string) => void;
  onAddFSubChannel: (channelId: number, title: string, inviteLink: string) => void;
  onRemoveFSubChannel: (channelId: number) => void;
  onAdjustWalletBalance: (userId: number, deltaUsd: number) => void;
}

export const CloneFleetManagerPanel: React.FC<CloneFleetManagerPanelProps> = ({
  clones,
  activeClone,
  wallets,
  activeWallet,
  onSelectClone,
  onSelectWalletUser,
  onCreateClone,
  onDeleteClone,
  onAddFSubChannel,
  onRemoveFSubChannel,
  onAdjustWalletBalance,
}) => {
  const [newToken, setNewToken] = useState('7942108831:AAH5vLmN02pQx8_liveToken');
  const [newUsername, setNewUsername] = useState('@AkiraDigitalStoreBot');
  const [newName, setNewName] = useState('Akira Creator Vault');
  const [newOwner, setNewOwner] = useState('@akira_creator');

  const [fsubId, setFsubId] = useState('-1001928374655');
  const [fsubTitle, setFsubTitle] = useState('Nohara VIP Buyers Club');
  const [fsubLink, setFsubLink] = useState('https://t.me/+NoharaVipClub');

  const [walletAmount, setWalletAmount] = useState('20.00');

  const handleProvisionClone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newToken.trim() || !newUsername.trim()) return;
    onCreateClone(
      newToken.trim(),
      newUsername.startsWith('@') ? newUsername.trim() : `@${newUsername.trim()}`,
      newName.trim() || 'Cloned Digital Store',
      newOwner.trim() || '@store_owner'
    );
    setNewToken('8104928371:AAK2pQw99zLm_token');
    setNewUsername('@ZenithStoreBot');
    setNewName('Zenith Digital Assets');
  };

  const handleAddFSub = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedId = parseInt(fsubId, 10);
    if (!parsedId || !fsubTitle.trim()) return;
    onAddFSubChannel(parsedId, fsubTitle.trim(), fsubLink.trim() || 'https://t.me/telegram');
    setFsubTitle('');
  };

  return (
    <div className="space-y-6">
      {/* Automated Bot Cloning Provisioner (/clone <BOT_TOKEN>) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="border-b border-slate-800 pb-3">
          <h3 className="text-base font-semibold text-slate-100">
            Automated Multi-Tenant Bot Cloning Engine (/clone & /deleteclone)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Validates token via Telegram API, boots an isolated in-memory Hydrogram Client, and initializes <code className="text-sky-300">clone_settings</code> in MongoDB.
          </p>
        </div>

        <form onSubmit={handleProvisionClone} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="lg:col-span-2">
            <label className="block text-xs text-slate-400 mb-1">
              BotFather Token (/clone &lt;BOT_TOKEN&gt;)
            </label>
            <input
              type="text"
              required
              value={newToken}
              onChange={(e) => setNewToken(e.target.value)}
              className="w-full px-3 py-1.5 text-xs font-mono bg-slate-950 border border-slate-800 rounded-md text-slate-100"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Bot Username</label>
            <input
              type="text"
              required
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              className="w-full px-3 py-1.5 text-xs font-mono bg-slate-950 border border-slate-800 rounded-md text-slate-100"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Store Display Name</label>
            <input
              type="text"
              required
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-md text-slate-100"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full py-1.5 px-3 text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white rounded-md transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Provision Clone</span>
            </button>
          </div>
        </form>

        {/* Active Clones Table */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          {clones.map((c) => {
            const isCurrent = c._id === activeClone._id;
            return (
              <div
                key={c._id}
                className={`p-3.5 rounded-lg border transition-colors flex items-center justify-between gap-3 ${
                  isCurrent
                    ? 'bg-sky-950/30 border-sky-500/80'
                    : 'bg-slate-950 border-slate-800'
                }`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-100 truncate">
                      {c.bot_name}
                    </span>
                    <span className="text-xs font-mono text-sky-400">
                      {c.bot_username}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 mt-1 tabular-nums">
                    ID: {c._id} · Owner: {c.owner_username} ({c.owner_id}) · DB: {c.db_channel_id}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {!isCurrent && (
                    <button
                      type="button"
                      onClick={() => onSelectClone(c._id)}
                      className="px-2.5 py-1 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700"
                    >
                      Switch
                    </button>
                  )}
                  {clones.length > 1 && (
                    <button
                      type="button"
                      onClick={() => onDeleteClone(c._id)}
                      className="p-1.5 text-rose-400 hover:bg-rose-950/50 rounded border border-transparent hover:border-rose-800/60"
                      title="/deleteclone — Revoke and destroy cloned bot instance"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Force Subscription (FSub) & Wallet Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Force Subscription Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-100">
              Force Subscription (FSub) Channels (/addfsub, /removefsub, /fsublist)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Enforces automatic <code className="text-sky-300">get_chat_member</code> check middleware on <code className="text-sky-300">/start</code> and store checkout.
            </p>
          </div>

          <form onSubmit={handleAddFSub} className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input
              type="text"
              placeholder="-1001928374655"
              value={fsubId}
              onChange={(e) => setFsubId(e.target.value)}
              className="px-2.5 py-1.5 text-xs font-mono bg-slate-950 border border-slate-800 rounded text-slate-100"
            />
            <input
              type="text"
              placeholder="Channel Title"
              value={fsubTitle}
              onChange={(e) => setFsubTitle(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded text-slate-100"
            />
            <button
              type="submit"
              className="px-3 py-1.5 text-xs font-medium bg-sky-600 hover:bg-sky-500 text-white rounded transition-colors whitespace-nowrap shrink-0"
            >
              + Add FSub (/addfsub)
            </button>
          </form>

          <div className="space-y-2">
            {activeClone.fsub_channels.length === 0 ? (
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-400">
                No mandatory FSub channels configured for {activeClone.bot_username}. Users bypass FSub middleware.
              </div>
            ) : (
              activeClone.fsub_channels.map((ch) => (
                <div
                  key={ch.channel_id}
                  className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between gap-2"
                >
                  <div>
                    <div className="text-xs font-medium text-slate-200">{ch.title}</div>
                    <div className="text-[11px] font-mono text-slate-400 tabular-nums">
                      ID: {ch.channel_id} · {ch.invite_link}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemoveFSubChannel(ch.channel_id)}
                    className="px-2 py-1 text-xs font-mono text-rose-400 hover:bg-rose-950/40 rounded border border-rose-900/40"
                  >
                    /removefsub
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Built-In User Wallet Manager (/addmoney & /removemoney) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-100">
              Built-In Wallet & Balances (/addmoney & /removemoney)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Select a simulated buyer account or credit/debit their balance with Master Admin audit logging.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="number"
              step="1"
              value={walletAmount}
              onChange={(e) => setWalletAmount(e.target.value)}
              className="w-28 px-2.5 py-1.5 text-xs font-mono tabular-nums bg-slate-950 border border-slate-800 rounded text-slate-100"
            />
            <button
              type="button"
              onClick={() =>
                onAdjustWalletBalance(
                  activeWallet.user_id,
                  Math.abs(parseFloat(walletAmount) || 10)
                )
              }
              className="px-3 py-1.5 text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white rounded transition-colors flex items-center gap-1 whitespace-nowrap shrink-0"
            >
              <ArrowUpCircle className="w-3.5 h-3.5" />
              <span>/addmoney (+${walletAmount})</span>
            </button>
            <button
              type="button"
              onClick={() =>
                onAdjustWalletBalance(
                  activeWallet.user_id,
                  -Math.abs(parseFloat(walletAmount) || 10)
                )
              }
              className="px-3 py-1.5 text-xs font-medium bg-rose-600 hover:bg-rose-500 text-white rounded transition-colors flex items-center gap-1 whitespace-nowrap shrink-0"
            >
              <ArrowDownCircle className="w-3.5 h-3.5" />
              <span>/removemoney (-${walletAmount})</span>
            </button>
          </div>

          <div className="space-y-2">
            {wallets.map((w) => {
              const isSelected = w.user_id === activeWallet.user_id;
              return (
                <div
                  key={w.user_id}
                  onClick={() => onSelectWalletUser(w.user_id)}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors flex items-center justify-between ${
                    isSelected
                      ? 'bg-sky-950/30 border-sky-500/80'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="text-xs font-medium text-slate-100">
                      {w.username}{' '}
                      <span className="font-mono text-slate-400">({w.user_id})</span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-400 tabular-nums">
                      Lang: {w.language.toUpperCase()} · Orders: {w.purchases_count} · FSub:{' '}
                      {w.joined_fsub ? 'Joined' : 'Not Joined'}
                    </div>
                  </div>
                  <div className="text-right font-mono tabular-nums">
                    <div className="text-xs font-semibold text-emerald-400">
                      ${w.balance_usd.toFixed(2)} USD
                    </div>
                    <div className="text-[11px] text-slate-400">
                      ₹{(w.balance_usd * activeClone.usd_to_inr).toFixed(0)} INR
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
