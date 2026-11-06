import React, { useState } from 'react';
import { Download } from 'lucide-react';
import {
  INITIAL_CLONES,
  INITIAL_PRODUCTS,
  INITIAL_WALLETS,
  INITIAL_CHANNEL_LOGS,
  INITIAL_IMAGES,
  CloneSettingsDocument,
  DigitalProduct,
  UserWalletRecord,
  ChannelLogEntry,
} from './data/storeTypes';
import { FontStyleMode, TranslationKeys } from './data/localesData';
import { generatePythonSourceFiles } from './data/pythonSourceFiles';
import { TelegramBotSimulator } from './components/TelegramBotSimulator';
import { DualLayerStoragePanel } from './components/DualLayerStoragePanel';
import { RuntimeGatewayPanel } from './components/RuntimeGatewayPanel';
import { LocalizationBrandingPanel } from './components/LocalizationBrandingPanel';
import { CloneFleetManagerPanel } from './components/CloneFleetManagerPanel';
import { PythonCodebasePanel } from './components/PythonCodebaseModal';

type WorkspaceSection =
  | 'storage'
  | 'gateways'
  | 'localization'
  | 'clones'
  | 'codebase';

export default function App() {
  const [clones, setClones] = useState<CloneSettingsDocument[]>(INITIAL_CLONES);
  const [activeCloneId, setActiveCloneId] = useState<string>(INITIAL_CLONES[0]._id);
  const [products, setProducts] = useState<DigitalProduct[]>(INITIAL_PRODUCTS);
  const [wallets, setWallets] = useState<UserWalletRecord[]>(INITIAL_WALLETS);
  const [activeWalletUserId, setActiveWalletUserId] = useState<number>(
    INITIAL_WALLETS[0].user_id
  );
  const [channelLogs, setChannelLogs] = useState<ChannelLogEntry[]>(
    INITIAL_CHANNEL_LOGS
  );
  const [activeSection, setActiveSection] = useState<WorkspaceSection>('storage');

  const activeClone =
    clones.find((c) => c._id === activeCloneId) || clones[0];
  const activeWallet =
    wallets.find((w) => w.user_id === activeWalletUserId) || wallets[0];

  const appendAuditLog = (
    channelType: ChannelLogEntry['channel_type'],
    eventType: ChannelLogEntry['event_type'],
    summary: string,
    metadataPointer: Record<string, string | number | boolean>
  ) => {
    const nextMsgId = 98200 + channelLogs.length;
    const channelId =
      channelType === 'MASTER_ADMIN_AUDIT'
        ? activeClone.master_audit_channel_id
        : channelType === 'CLONE_PRIVATE_DB'
        ? activeClone.db_channel_id
        : activeClone.log_channel_id;

    const newEntry: ChannelLogEntry = {
      id: `LOG-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      message_id: nextMsgId,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
      channel_type: channelType,
      channel_id: channelId,
      bot_id: activeClone._id,
      bot_username: activeClone.bot_username,
      event_type: eventType,
      summary,
      metadata_pointer: metadataPointer,
    };
    setChannelLogs((prev) => [newEntry, ...prev]);
  };

  // Upload Digital Product to Clone DB Channel + Mirror to Master Audit Channel
  const handleUploadDigitalProduct = (newProd: {
    title: string;
    category: string;
    price_usd: number;
    stock: number;
    file_name: string;
    file_size: string;
    file_type: 'ZIP' | 'PDF' | 'MP4' | 'SOURCE_BUNDLE';
  }) => {
    const dbMsgId = 4100 + products.length * 7;
    const masterMsgId = 98300 + products.length * 11;
    const prodId = `PRD-${905 + products.length}`;

    const created: DigitalProduct = {
      _id: prodId,
      bot_id: activeClone._id,
      title: newProd.title,
      category: newProd.category,
      price_usd: newProd.price_usd,
      stock: newProd.stock,
      file_name: newProd.file_name,
      file_size: newProd.file_size,
      file_type: newProd.file_type,
      db_channel_message_id: dbMsgId,
      master_backup_message_id: masterMsgId,
      created_at: new Date().toISOString().slice(0, 16).replace('T', ' ') + ' UTC',
    };

    setProducts((prev) => [created, ...prev]);

    appendAuditLog(
      'CLONE_PRIVATE_DB',
      'ASSET_UPLOAD',
      `Uploaded ${newProd.file_name} (${newProd.file_size}) to Clone Owner Private DB Channel.`,
      {
        product_id: prodId,
        db_channel_msg_id: dbMsgId,
        bot_id: activeClone._id,
      }
    );

    appendAuditLog(
      'MASTER_ADMIN_AUDIT',
      'ASSET_UPLOAD',
      `Mandatory Master Mirror: Backed up ${newProd.title} (${newProd.file_name}) from ${activeClone.bot_username}.`,
      {
        product_id: prodId,
        db_msg_id: dbMsgId,
        master_backup_msg_id: masterMsgId,
        price_usd: newProd.price_usd,
      }
    );
  };

  const handleUpdateChannelIds = (dbChannelId: number, logChannelId: number) => {
    setClones((prev) =>
      prev.map((c) =>
        c._id === activeClone._id
          ? { ...c, db_channel_id: dbChannelId, log_channel_id: logChannelId }
          : c
      )
    );
    appendAuditLog(
      'MASTER_ADMIN_AUDIT',
      'CLONE_PROVISIONED',
      `Channel Pointers Updated for ${activeClone.bot_username}: DB=${dbChannelId}, Log=${logChannelId}`,
      { db_channel_id: dbChannelId, log_channel_id: logChannelId }
    );
  };

  const handleUpdateGatewayConfig = (
    gateways: CloneSettingsDocument['gateways'],
    usdToInr: number,
    currencies: CloneSettingsDocument['currencies']
  ) => {
    setClones((prev) =>
      prev.map((c) =>
        c._id === activeClone._id
          ? { ...c, gateways, usd_to_inr: usdToInr, currencies }
          : c
      )
    );
    appendAuditLog(
      'MASTER_ADMIN_AUDIT',
      'GATEWAY_UPDATED',
      `In-Panel Runtime Gateway Sync on ${activeClone.bot_username}: OxaPay=${gateways.oxapay.enabled}, FamPay=${gateways.fampay.upi_id}`,
      {
        oxapay_enabled: gateways.oxapay.enabled,
        fampay_upi: gateways.fampay.upi_id,
        usd_to_inr: usdToInr,
      }
    );
  };

  const handlePurchaseWithWallet = (product: DigitalProduct) => {
    if (activeWallet.balance_usd < product.price_usd) {
      return { ok: false, message: 'Insufficient balance' };
    }
    // Deduct balance & increment purchase counter
    setWallets((prev) =>
      prev.map((w) =>
        w.user_id === activeWallet.user_id
          ? {
              ...w,
              balance_usd: Number((w.balance_usd - product.price_usd).toFixed(2)),
              purchases_count: w.purchases_count + 1,
            }
          : w
      )
    );
    // Decrement stock if positive
    setProducts((prev) =>
      prev.map((p) =>
        p._id === product._id && p.stock > 0 ? { ...p, stock: p.stock - 1 } : p
      )
    );

    appendAuditLog(
      'MASTER_ADMIN_AUDIT',
      'ORDER_DELIVERY',
      `Wallet Checkout: ${activeWallet.username} bought ${product.title} ($${product.price_usd.toFixed(
        2
      )}) · Delivered via copy_message(#${product.db_channel_message_id})`,
      {
        buyer_id: activeWallet.user_id,
        product_id: product._id,
        db_msg_id: product.db_channel_message_id,
        amount_usd: product.price_usd,
      }
    );
    return { ok: true, message: 'Order delivered' };
  };

  const handleSimulateWebhook = (
    gateway: 'oxapay' | 'fampay',
    product: DigitalProduct
  ) => {
    setProducts((prev) =>
      prev.map((p) =>
        p._id === product._id && p.stock > 0 ? { ...p, stock: p.stock - 1 } : p
      )
    );
    setWallets((prev) =>
      prev.map((w) =>
        w.user_id === activeWallet.user_id
          ? { ...w, purchases_count: w.purchases_count + 1 }
          : w
      )
    );
    appendAuditLog(
      'MASTER_ADMIN_AUDIT',
      'WEBHOOK_CALLBACK',
      `Dynamic Webhook POST /webhook/${gateway}/${activeClone._id} verified · Delivered ${product.file_name} (#${product.db_channel_message_id})`,
      {
        gateway,
        bot_id: activeClone._id,
        product_id: product._id,
        buyer_id: activeWallet.user_id,
        amount_usd: product.price_usd,
      }
    );
  };

  const handleCreateClone = (
    botToken: string,
    botUsername: string,
    botName: string,
    ownerUsername: string
  ) => {
    const extractedId =
      botToken.split(':')[0]?.replace(/\D/g, '') ||
      String(Math.floor(7000000000 + Math.random() * 900000000));
    const newDoc: CloneSettingsDocument = {
      _id: extractedId,
      bot_username: botUsername,
      bot_name: botName,
      token_masked: `${extractedId}:AAH...${botToken.slice(-5)}`,
      owner_id: Math.floor(500000000 + Math.random() * 400000000),
      owner_username: ownerUsername,
      status: 'running',
      db_channel_id: -1002910492811,
      log_channel_id: -1002910499900,
      master_audit_channel_id: -1001999888777,
      default_language: 'en',
      font_style: 'default_html',
      ui_branding: {
        start_photo_message_id: 301,
        catalog_photo_message_id: 302,
        wallet_photo_message_id: 303,
        out_of_stock_photo_message_id: 304,
        start_photo_url: INITIAL_IMAGES.start,
        catalog_photo_url: INITIAL_IMAGES.catalog,
        wallet_photo_url: INITIAL_IMAGES.wallet,
        out_of_stock_photo_url: INITIAL_IMAGES.outOfStock,
        custom_welcome_msg: `Welcome to ${botName} — Automated Digital Delivery.`,
      },
      gateways: {
        oxapay: {
          enabled: true,
          api_key: `OXA_RUNTIME_${extractedId.slice(0, 5)}`,
          network: 'USDT-TRC20 / TON',
        },
        fampay: {
          enabled: true,
          merchant_id: `FAMPAY_${extractedId.slice(0, 5)}`,
          upi_id: `${botUsername.replace('@', '').toLowerCase()}@fam`,
        },
      },
      currencies: { INR: true, USD: true, USDT: true },
      usd_to_inr: 85.0,
      fsub_channels: [],
      custom_translations: {},
    };

    setClones((prev) => [...prev, newDoc]);
    setActiveCloneId(newDoc._id);

    appendAuditLog(
      'MASTER_ADMIN_AUDIT',
      'CLONE_PROVISIONED',
      `New Bot Cloned via /clone: ${botUsername} (${extractedId}) by ${ownerUsername}`,
      {
        bot_id: extractedId,
        bot_username: botUsername,
        owner: ownerUsername,
      }
    );
  };

  const handleDeleteClone = (botId: string) => {
    if (clones.length <= 1) return;
    const target = clones.find((c) => c._id === botId);
    const remaining = clones.filter((c) => c._id !== botId);
    setClones(remaining);
    if (activeCloneId === botId) {
      setActiveCloneId(remaining[0]._id);
    }
    if (target) {
      appendAuditLog(
        'MASTER_ADMIN_AUDIT',
        'CLONE_PROVISIONED',
        `Clone Destroyed via /deleteclone: ${target.bot_username} (${botId})`,
        { deleted_bot_id: botId }
      );
    }
  };

  const handleAddFSubChannel = (
    channelId: number,
    title: string,
    inviteLink: string
  ) => {
    setClones((prev) =>
      prev.map((c) =>
        c._id === activeClone._id
          ? {
              ...c,
              fsub_channels: [
                ...c.fsub_channels,
                {
                  channel_id: channelId,
                  title,
                  invite_link: inviteLink,
                  added_at: 'Just now',
                },
              ],
            }
          : c
      )
    );
  };

  const handleRemoveFSubChannel = (channelId: number) => {
    setClones((prev) =>
      prev.map((c) =>
        c._id === activeClone._id
          ? {
              ...c,
              fsub_channels: c.fsub_channels.filter(
                (ch) => ch.channel_id !== channelId
              ),
            }
          : c
      )
    );
  };

  const handleAdjustWalletBalance = (userId: number, deltaUsd: number) => {
    setWallets((prev) =>
      prev.map((w) =>
        w.user_id === userId
          ? {
              ...w,
              balance_usd: Math.max(
                0,
                Number((w.balance_usd + deltaUsd).toFixed(2))
              ),
            }
          : w
      )
    );
    appendAuditLog(
      'MASTER_ADMIN_AUDIT',
      'WALLET_ADJUSTMENT',
      `Admin Wallet Adjustment (${deltaUsd >= 0 ? '/addmoney' : '/removemoney'}): User ${userId} ${
        deltaUsd >= 0 ? `+$${deltaUsd}` : `-$${Math.abs(deltaUsd)}`
      } USD`,
      { user_id: userId, delta_usd: deltaUsd, bot_id: activeClone._id }
    );
  };

  const handleExecuteSlashCommand = (rawCmd: string) => {
    const parts = rawCmd.trim().split(/\s+/);
    const cmd = parts[0].toLowerCase();

    if (cmd === '/start') {
      return {
        replyTitle: `${activeClone.bot_name} (${activeClone.bot_username})`,
        replyBody: `${activeClone.ui_branding.custom_welcome_msg}\n\nActive Language: ${activeWallet.language.toUpperCase()} · Font Mode: ${activeClone.font_style}`,
        bannerTag: 'START_PHOTO' as const,
        codeBlock: `FSub Channels: ${activeClone.fsub_channels.length} | Wallet: $${activeWallet.balance_usd.toFixed(2)}`,
      };
    }
    if (cmd === '/admin') {
      setActiveSection('gateways');
      return {
        replyTitle: 'Telegram Admin Control Panel (/admin)',
        replyBody: `Opened Runtime Admin Configuration for ${activeClone.bot_username}.\n• Payment Gateways: OxaPay (${
          activeClone.gateways.oxapay.enabled ? 'ON' : 'OFF'
        }) | FamPay (${activeClone.gateways.fampay.upi_id})\n• DB Channel: ${activeClone.db_channel_id}`,
      };
    }
    if (cmd === '/setgateway') {
      setActiveSection('gateways');
      return {
        replyTitle: 'In-Panel Payment Gateway Wizard (/setgateway)',
        replyBody:
          'Switched right workspace panel to Runtime Payment Gateways. Edit OxaPay Merchant API Key or FamPay UPI ID directly.',
      };
    }
    if (cmd === '/clone') {
      const tokenArg = parts[1] || '7991029384:AAH7xLmP_NewCloneToken';
      const botIdPrefix = tokenArg.split(':')[0] || '7991029384';
      handleCreateClone(
        tokenArg,
        `@ClonedStore_${botIdPrefix.slice(-4)}Bot`,
        `Nohara Clone #${botIdPrefix.slice(-4)}`,
        activeWallet.username
      );
      setActiveSection('clones');
      return {
        replyTitle: 'Dynamic Hydrogram Clone Provisioned (/clone)',
        replyBody: `Validated token and started in-memory client @ClonedStore_${botIdPrefix.slice(
          -4
        )}Bot.\nMaster Admin Audit Channel (${activeClone.master_audit_channel_id}) notified.`,
        codeBlock: `Next: /setdbchannel -1002910492811\n/setlogchannel -1002910499900`,
      };
    }
    if (cmd === '/setdbchannel' && parts[1]) {
      const newDbId = parseInt(parts[1], 10);
      if (newDbId) {
        handleUpdateChannelIds(newDbId, activeClone.log_channel_id);
        return {
          replyTitle: 'Private Database Channel Connected (/setdbchannel)',
          replyBody: `Bound db_channel_id = ${newDbId} in MongoDB clone_settings.`,
        };
      }
    }
    if (cmd === '/setlogchannel' && parts[1]) {
      const newLogId = parseInt(parts[1], 10);
      if (newLogId) {
        handleUpdateChannelIds(activeClone.db_channel_id, newLogId);
        return {
          replyTitle: 'Owner Audit Log Channel Connected (/setlogchannel)',
          replyBody: `Bound log_channel_id = ${newLogId} in MongoDB clone_settings.`,
        };
      }
    }
    if ((cmd === '/addmoney' || cmd === '/removemoney') && parts.length >= 3) {
      const targetUser = parseInt(parts[1], 10) || activeWallet.user_id;
      const amt = parseFloat(parts[2]) || 10;
      const signed = cmd === '/addmoney' ? Math.abs(amt) : -Math.abs(amt);
      handleAdjustWalletBalance(targetUser, signed);
      return {
        replyTitle: `Wallet Balance Updated (${cmd})`,
        replyBody: `Adjusted user ${targetUser} wallet by ${
          signed >= 0 ? `+$${signed.toFixed(2)}` : `-$${Math.abs(signed).toFixed(2)}`
        } USD.`,
        bannerTag: 'WALLET_PHOTO' as const,
      };
    }
    if (cmd === '/fsublist') {
      const list =
        activeClone.fsub_channels.length > 0
          ? activeClone.fsub_channels
              .map((c) => `• ${c.title} (${c.channel_id})`)
              .join('\n')
          : 'No active Force-Sub channels.';
      return {
        replyTitle: 'Force-Subscription Channels (/fsublist)',
        replyBody: list,
      };
    }
    if (cmd === '/changelang') {
      setActiveSection('localization');
      return {
        replyTitle: '18-Language Localization Engine (/changelang)',
        replyBody:
          'Opened Localization Studio. Choose from 9 Indian Regional + 9 Global languages.',
      };
    }
    return null;
  };

  const handleExportFullBundle = () => {
    const files = generatePythonSourceFiles(activeClone);
    const combined = files
      .map(
        (f) =>
          `# ============================================================================\n# FILE: ${f.path}\n# ${f.description}\n# ============================================================================\n\n${f.code}\n`
      )
      .join('\n\n');
    const blob = new Blob([combined], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nohara_store_bot_${activeClone._id}_bundle.py`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const navItems: { id: WorkspaceSection; label: string }[] = [
    { id: 'storage', label: 'Dual-Layer Storage' },
    { id: 'gateways', label: 'Runtime Gateways' },
    { id: 'localization', label: '18 Locales & Fonts' },
    { id: 'clones', label: 'Clones & Wallets' },
    { id: 'codebase', label: 'Python Codebase' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Strict 3-Zone Top Bar Contract */}
      <header className="flex items-center justify-between gap-8 px-6 py-3.5 border-b border-slate-800 bg-slate-950">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            setActiveSection('storage');
          }}
          className="text-base font-bold tracking-tight text-white whitespace-nowrap shrink-0 font-display"
        >
          Nohara Store Bot
        </a>

        {/* Zone 2: 5 concise single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveSection(item.id)}
              className={`transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
                activeSection === item.id
                  ? 'text-white border-sky-500'
                  : 'text-slate-400 hover:text-slate-100 border-transparent'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={handleExportFullBundle}
            className="px-4 py-2 text-xs font-medium text-white bg-sky-600 hover:bg-sky-500 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Python Bundle</span>
          </button>
        </div>
      </header>

      {/* Contextual Architecture Strip & Clone Switcher */}
      <div className="border-b border-slate-800/80 bg-slate-900/50 px-6 py-3">
        <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 font-mono tabular-nums">
            <span className="text-slate-200 font-medium">
              Active Clone: {activeClone.bot_username}
            </span>
            <span aria-hidden="true">·</span>
            <span>Clone DB: {activeClone.db_channel_id}</span>
            <span aria-hidden="true">·</span>
            <span>Master Audit: {activeClone.master_audit_channel_id}</span>
            <span aria-hidden="true">·</span>
            <span>FX: 1 USD = ₹{activeClone.usd_to_inr} INR</span>
          </div>

          {/* Mobile section selector + Active Clone selector */}
          <div className="flex items-center gap-2">
            <select
              value={activeClone._id}
              onChange={(e) => setActiveCloneId(e.target.value)}
              className="px-2.5 py-1 text-xs font-mono bg-slate-900 border border-slate-800 rounded-md text-slate-200"
            >
              {clones.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.bot_username} (ID: {c._id})
                </option>
              ))}
            </select>

            <div className="flex md:hidden items-center gap-1">
              <select
                value={activeSection}
                onChange={(e) =>
                  setActiveSection(e.target.value as WorkspaceSection)
                }
                className="px-2.5 py-1 text-xs bg-slate-900 border border-slate-800 rounded-md text-slate-200"
              >
                {navItems.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main 1440px 2-Column Split Workspace */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (5 cols): Live Interactive Telegram Client & Colored Buttons Simulator */}
          <div className="lg:col-span-5 lg:sticky lg:top-6">
            <TelegramBotSimulator
              activeClone={activeClone}
              products={products}
              activeWallet={activeWallet}
              onExecuteCommand={handleExecuteSlashCommand}
              onPurchaseWithWallet={handlePurchaseWithWallet}
              onTriggerGatewayWebhook={(prod, gw) =>
                handleSimulateWebhook(gw, prod)
              }
              onChangeUserLanguage={(langCode) =>
                setWallets((prev) =>
                  prev.map((w) =>
                    w.user_id === activeWallet.user_id
                      ? { ...w, language: langCode }
                      : w
                  )
                )
              }
              onToggleFSubStatus={() =>
                setWallets((prev) =>
                  prev.map((w) =>
                    w.user_id === activeWallet.user_id
                      ? { ...w, joined_fsub: !w.joined_fsub }
                      : w
                  )
                )
              }
              onOpenAdminDrawerTab={(tab) => setActiveSection(tab)}
            />
          </div>

          {/* Right Column (7 cols): Contextual Architecture & Multi-Tenant Admin Workbench */}
          <div className="lg:col-span-7">
            {activeSection === 'storage' && (
              <DualLayerStoragePanel
                activeClone={activeClone}
                products={products}
                channelLogs={channelLogs}
                onUploadDigitalProduct={handleUploadDigitalProduct}
                onUpdateChannelIds={handleUpdateChannelIds}
              />
            )}

            {activeSection === 'gateways' && (
              <RuntimeGatewayPanel
                activeClone={activeClone}
                products={products}
                onUpdateGatewayConfig={handleUpdateGatewayConfig}
                onSimulateWebhook={handleSimulateWebhook}
              />
            )}

            {activeSection === 'localization' && (
              <LocalizationBrandingPanel
                activeClone={activeClone}
                onUpdateDefaultLanguage={(langCode) =>
                  setClones((prev) =>
                    prev.map((c) =>
                      c._id === activeClone._id
                        ? { ...c, default_language: langCode }
                        : c
                    )
                  )
                }
                onUpdateFontStyle={(mode: FontStyleMode) =>
                  setClones((prev) =>
                    prev.map((c) =>
                      c._id === activeClone._id ? { ...c, font_style: mode } : c
                    )
                  )
                }
                onSaveTranslationOverride={(
                  langCode: string,
                  key: TranslationKeys,
                  value: string
                ) =>
                  setClones((prev) =>
                    prev.map((c) =>
                      c._id === activeClone._id
                        ? {
                            ...c,
                            custom_translations: {
                              ...c.custom_translations,
                              [langCode]: {
                                ...(c.custom_translations?.[langCode] || {}),
                                [key]: value,
                              },
                            },
                          }
                        : c
                    )
                  )
                }
                onUpdateBranding={(branding) => {
                  setClones((prev) =>
                    prev.map((c) =>
                      c._id === activeClone._id
                        ? { ...c, ui_branding: branding }
                        : c
                    )
                  );
                  appendAuditLog(
                    'MASTER_ADMIN_AUDIT',
                    'UI_BRANDING_SYNC',
                    `Updated Dynamic Media Message IDs on ${activeClone.bot_username}: START=#${branding.start_photo_message_id}, CATALOG=#${branding.catalog_photo_message_id}`,
                    {
                      start_msg_id: branding.start_photo_message_id,
                      catalog_msg_id: branding.catalog_photo_message_id,
                    }
                  );
                }}
              />
            )}

            {activeSection === 'clones' && (
              <CloneFleetManagerPanel
                clones={clones}
                activeClone={activeClone}
                wallets={wallets}
                activeWallet={activeWallet}
                onSelectClone={(botId) => setActiveCloneId(botId)}
                onSelectWalletUser={(userId) => setActiveWalletUserId(userId)}
                onCreateClone={handleCreateClone}
                onDeleteClone={handleDeleteClone}
                onAddFSubChannel={handleAddFSubChannel}
                onRemoveFSubChannel={handleRemoveFSubChannel}
                onAdjustWalletBalance={handleAdjustWalletBalance}
              />
            )}

            {activeSection === 'codebase' && (
              <PythonCodebasePanel activeClone={activeClone} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
