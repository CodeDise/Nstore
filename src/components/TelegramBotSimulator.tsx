import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  ShieldCheck,
  Terminal,
  Globe,
  Wallet,
  Package,
  AlertCircle,
  CheckCircle2,
  Sliders,
  FileArchive,
  ArrowUpRight,
} from 'lucide-react';
import {
  CloneSettingsDocument,
  DigitalProduct,
  UserWalletRecord,
  ColoredButtonSpec,
} from '../data/storeTypes';
import {
  SUPPORTED_LANGUAGES,
  DEFAULT_TRANSLATIONS,
  TranslationKeys,
  applyFontStyle,
} from '../data/localesData';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  timestamp: string;
  bannerUrl?: string;
  bannerTag?: 'START_PHOTO' | 'CATALOG_PHOTO' | 'WALLET_PHOTO' | 'OUT_OF_STOCK_PHOTO';
  bannerMsgId?: number;
  title?: string;
  body: string;
  codeBlock?: string;
  fileDelivery?: {
    fileName: string;
    fileSize: string;
    dbChannelId: number;
    dbMsgId: number;
    masterBackupMsgId: number;
  };
}

interface TelegramBotSimulatorProps {
  activeClone: CloneSettingsDocument;
  products: DigitalProduct[];
  activeWallet: UserWalletRecord;
  onExecuteCommand: (rawCmd: string) => {
    replyTitle: string;
    replyBody: string;
    codeBlock?: string;
    bannerTag?: 'START_PHOTO' | 'CATALOG_PHOTO' | 'WALLET_PHOTO' | 'OUT_OF_STOCK_PHOTO';
  } | null;
  onPurchaseWithWallet: (product: DigitalProduct) => {
    ok: boolean;
    message: string;
  };
  onTriggerGatewayWebhook: (product: DigitalProduct, gateway: 'oxapay' | 'fampay') => void;
  onChangeUserLanguage: (langCode: string) => void;
  onToggleFSubStatus: () => void;
  onOpenAdminDrawerTab: (tab: 'gateways' | 'localization' | 'storage' | 'clones') => void;
}

export const TelegramBotSimulator: React.FC<TelegramBotSimulatorProps> = ({
  activeClone,
  products,
  activeWallet,
  onExecuteCommand,
  onPurchaseWithWallet,
  onTriggerGatewayWebhook,
  onChangeUserLanguage,
  onToggleFSubStatus,
  onOpenAdminDrawerTab,
}) => {
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [commandInput, setCommandInput] = useState('');
  const [showLangSelector, setShowLangSelector] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const cloneProducts = products.filter((p) => p.bot_id === activeClone._id);
  const selectedProduct = cloneProducts.find((p) => p._id === selectedProductId) || null;

  const currentLang = activeWallet.language || activeClone.default_language || 'en';

  const t = (key: TranslationKeys): string => {
    const custom = activeClone.custom_translations?.[currentLang]?.[key];
    if (custom) return applyFontStyle(custom, activeClone.font_style);
    const base =
      DEFAULT_TRANSLATIONS[currentLang]?.[key] ||
      DEFAULT_TRANSLATIONS['en'][key];
    return applyFontStyle(base, activeClone.font_style);
  };

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'MSG-INIT',
      sender: 'bot',
      timestamp: '23:45',
      bannerUrl: activeClone.ui_branding.start_photo_url,
      bannerTag: 'START_PHOTO',
      bannerMsgId: activeClone.ui_branding.start_photo_message_id,
      title: t('welcome_title'),
      body: `${activeClone.ui_branding.custom_welcome_msg}\n\n${t('welcome_subtitle')}`,
      codeBlock: `db_channel_id: ${activeClone.db_channel_id}\nmaster_audit_id: ${activeClone.master_audit_channel_id}\nfont_engine: ${activeClone.font_style}`,
    },
  ]);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages]);

  const appendMessages = (...newMsgs: ChatMessage[]) => {
    setMessages((prev) => [...prev, ...newMsgs]);
  };

  const nowTime = () => {
    const d = new Date();
    return d.toTimeString().slice(0, 5);
  };

  const checkFSubBeforeAction = (actionLabel: string): boolean => {
    if (activeClone.fsub_channels.length > 0 && !activeWallet.joined_fsub) {
      appendMessages(
        {
          id: `USR-${Date.now()}`,
          sender: 'user',
          timestamp: nowTime(),
          body: actionLabel,
        },
        {
          id: `BOT-${Date.now() + 1}`,
          sender: 'bot',
          timestamp: nowTime(),
          title: 'Force Subscription (FSub) Check Failed',
          body: `${t('fsub_required_msg')}\n\nMandatory Channel: ${activeClone.fsub_channels
            .map((c) => `${c.title} (${c.channel_id})`)
            .join(', ')}`,
          codeBlock: `Middleware: UserNotParticipant raised for user ${activeWallet.user_id}.\nClick "FSub Joined: False" toggle above to simulate joining.`,
        }
      );
      return false;
    }
    return true;
  };

  const handleColoredButtonClick = (btn: ColoredButtonSpec) => {
    if (btn.action === 'view_products') {
      if (!checkFSubBeforeAction(btn.label)) return;
      setSelectedProductId(null);
      setShowLangSelector(false);
      const listSummary =
        cloneProducts.length > 0
          ? cloneProducts
              .map(
                (p, idx) =>
                  `${idx + 1}. ${p.title} — $${p.price_usd.toFixed(2)} (₹${(
                    p.price_usd * activeClone.usd_to_inr
                  ).toFixed(0)}) · ${p.stock > 0 ? `${p.stock} in stock` : 'OUT OF STOCK'}`
              )
              .join('\n')
          : 'No products uploaded to this clone DB channel yet.';

      appendMessages(
        {
          id: `USR-${Date.now()}`,
          sender: 'user',
          timestamp: nowTime(),
          body: btn.label,
        },
        {
          id: `BOT-${Date.now() + 1}`,
          sender: 'bot',
          timestamp: nowTime(),
          bannerUrl: activeClone.ui_branding.catalog_photo_url,
          bannerTag: 'CATALOG_PHOTO',
          bannerMsgId: activeClone.ui_branding.catalog_photo_message_id,
          title: `${activeClone.bot_name} — Product Catalog`,
          body: `Select any digital product below to inspect its checkout keyboard:\n\n${listSummary}`,
        }
      );
    } else if (btn.action === 'open_wallet') {
      if (!checkFSubBeforeAction(btn.label)) return;
      setShowLangSelector(false);
      const inrValue = (activeWallet.balance_usd * activeClone.usd_to_inr).toFixed(2);
      appendMessages(
        {
          id: `USR-${Date.now()}`,
          sender: 'user',
          timestamp: nowTime(),
          body: btn.label,
        },
        {
          id: `BOT-${Date.now() + 1}`,
          sender: 'bot',
          timestamp: nowTime(),
          bannerUrl: activeClone.ui_branding.wallet_photo_url,
          bannerTag: 'WALLET_PHOTO',
          bannerMsgId: activeClone.ui_branding.wallet_photo_message_id,
          title: `${t('wallet_balance_label')}`,
          body: `User: ${activeWallet.username} (${activeWallet.user_id})\nUSD Balance: $${activeWallet.balance_usd.toFixed(
            2
          )} USDT/USD\nINR Equivalent: ₹${inrValue} (Rate: 1 USD = ₹${activeClone.usd_to_inr})`,
          codeBlock: `Admin Commands: /addmoney ${activeWallet.user_id} 25.00 | /removemoney ${activeWallet.user_id} 10.00`,
        }
      );
    } else if (btn.action === 'change_lang') {
      setShowLangSelector((prev) => !prev);
    } else if (btn.action === 'open_dashboard') {
      appendMessages(
        {
          id: `USR-${Date.now()}`,
          sender: 'user',
          timestamp: nowTime(),
          body: btn.label,
        },
        {
          id: `BOT-${Date.now() + 1}`,
          sender: 'bot',
          timestamp: nowTime(),
          title: 'In-Panel Runtime Admin Configuration (/admin)',
          body: `Owner ID: ${activeClone.owner_id} (${activeClone.owner_username})\n• OxaPay Runtime Key: ${
            activeClone.gateways.oxapay.enabled ? 'ACTIVE' : 'DISABLED'
          }\n• FamPay Runtime UPI: ${activeClone.gateways.fampay.upi_id}\n• Private DB Channel: ${
            activeClone.db_channel_id
          }\n• Master Audit Mirror: ${activeClone.master_audit_channel_id}`,
        }
      );
      onOpenAdminDrawerTab('gateways');
    } else if (btn.action === 'pay_wallet' || btn.action === 'confirm_purchase') {
      if (!selectedProduct) return;
      if (!checkFSubBeforeAction(btn.label)) return;
      const result = onPurchaseWithWallet(selectedProduct);
      if (result.ok) {
        appendMessages(
          {
            id: `USR-${Date.now()}`,
            sender: 'user',
            timestamp: nowTime(),
            body: `${btn.label} (${selectedProduct.title})`,
          },
          {
            id: `BOT-${Date.now() + 1}`,
            sender: 'bot',
            timestamp: nowTime(),
            title: 'Instant Wallet Checkout Verified',
            body: t('order_delivered_msg'),
            fileDelivery: {
              fileName: selectedProduct.file_name,
              fileSize: selectedProduct.file_size,
              dbChannelId: activeClone.db_channel_id,
              dbMsgId: selectedProduct.db_channel_message_id,
              masterBackupMsgId: selectedProduct.master_backup_message_id,
            },
          }
        );
      } else {
        appendMessages(
          {
            id: `USR-${Date.now()}`,
            sender: 'user',
            timestamp: nowTime(),
            body: btn.label,
          },
          {
            id: `BOT-${Date.now() + 1}`,
            sender: 'bot',
            timestamp: nowTime(),
            title: 'Wallet Checkout Declined',
            body: `${t('insufficient_balance')}\nRequired: $${selectedProduct.price_usd.toFixed(
              2
            )} · Your Balance: $${activeWallet.balance_usd.toFixed(2)}`,
          }
        );
      }
    } else if (btn.action === 'pay_oxapay') {
      if (!selectedProduct) return;
      onTriggerGatewayWebhook(selectedProduct, 'oxapay');
      appendMessages(
        {
          id: `USR-${Date.now()}`,
          sender: 'user',
          timestamp: nowTime(),
          body: btn.label,
        },
        {
          id: `BOT-${Date.now() + 1}`,
          sender: 'bot',
          timestamp: nowTime(),
          title: 'OxaPay Dynamic Webhook Callback Processed',
          body: `POST /webhook/oxapay/${activeClone._id} verified with runtime HMAC key.\n${t(
            'order_delivered_msg'
          )}`,
          fileDelivery: {
            fileName: selectedProduct.file_name,
            fileSize: selectedProduct.file_size,
            dbChannelId: activeClone.db_channel_id,
            dbMsgId: selectedProduct.db_channel_message_id,
            masterBackupMsgId: selectedProduct.master_backup_message_id,
          },
        }
      );
    } else if (btn.action === 'pay_fampay') {
      if (!selectedProduct) return;
      onTriggerGatewayWebhook(selectedProduct, 'fampay');
      appendMessages(
        {
          id: `USR-${Date.now()}`,
          sender: 'user',
          timestamp: nowTime(),
          body: btn.label,
        },
        {
          id: `BOT-${Date.now() + 1}`,
          sender: 'bot',
          timestamp: nowTime(),
          title: `FamPay / UPI Instant Callback (${activeClone.gateways.fampay.upi_id})`,
          body: `POST /webhook/fampay/${activeClone._id} verified ₹${(
            selectedProduct.price_usd * activeClone.usd_to_inr
          ).toFixed(0)} INR.\n${t('order_delivered_msg')}`,
          fileDelivery: {
            fileName: selectedProduct.file_name,
            fileSize: selectedProduct.file_size,
            dbChannelId: activeClone.db_channel_id,
            dbMsgId: selectedProduct.db_channel_message_id,
            masterBackupMsgId: selectedProduct.master_backup_message_id,
          },
        }
      );
    } else if (btn.action === 'cancel_order') {
      setSelectedProductId(null);
      appendMessages(
        {
          id: `USR-${Date.now()}`,
          sender: 'user',
          timestamp: nowTime(),
          body: btn.label,
        },
        {
          id: `BOT-${Date.now() + 1}`,
          sender: 'bot',
          timestamp: nowTime(),
          title: 'Order Cancelled',
          body: 'Checkout session closed. Returning to main store keyboard.',
        }
      );
    } else if (btn.action === 'out_of_stock') {
      appendMessages(
        {
          id: `USR-${Date.now()}`,
          sender: 'user',
          timestamp: nowTime(),
          body: btn.label,
        },
        {
          id: `BOT-${Date.now() + 1}`,
          sender: 'bot',
          timestamp: nowTime(),
          bannerUrl: activeClone.ui_branding.out_of_stock_photo_url,
          bannerTag: 'OUT_OF_STOCK_PHOTO',
          bannerMsgId: activeClone.ui_branding.out_of_stock_photo_message_id,
          title: t('btn_out_of_stock'),
          body: 'This item currently has 0 stock slots remaining in MongoDB metadata.',
        }
      );
    }
  };

  const handleSelectProductCard = (product: DigitalProduct) => {
    if (!checkFSubBeforeAction(`Select ${product.title}`)) return;
    setSelectedProductId(product._id);
    const isOut = product.stock === 0;
    appendMessages({
      id: `BOT-PROD-${Date.now()}`,
      sender: 'bot',
      timestamp: nowTime(),
      bannerUrl: isOut
        ? activeClone.ui_branding.out_of_stock_photo_url
        : activeClone.ui_branding.catalog_photo_url,
      bannerTag: isOut ? 'OUT_OF_STOCK_PHOTO' : 'CATALOG_PHOTO',
      bannerMsgId: isOut
        ? activeClone.ui_branding.out_of_stock_photo_message_id
        : activeClone.ui_branding.catalog_photo_message_id,
      title: `${product.title} (${product._id})`,
      body: `Price: $${product.price_usd.toFixed(2)} USD · ₹${(
        product.price_usd * activeClone.usd_to_inr
      ).toFixed(0)} INR\nFile: ${product.file_name} (${product.file_size})\nStock: ${
        product.stock > 0 ? `${product.stock} available` : 'OUT OF STOCK (0)'
      }`,
      codeBlock: `Clone DB Pointer: msg_id #${product.db_channel_message_id} (${activeClone.db_channel_id})\nMaster Audit Backup: msg_id #${product.master_backup_message_id} (${activeClone.master_audit_channel_id})`,
    });
  };

  const handleSendCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = commandInput.trim();
    if (!trimmed) return;
    setCommandInput('');

    const cmdResponse = onExecuteCommand(trimmed);
    const bannerMap = {
      START_PHOTO: {
        url: activeClone.ui_branding.start_photo_url,
        id: activeClone.ui_branding.start_photo_message_id,
      },
      CATALOG_PHOTO: {
        url: activeClone.ui_branding.catalog_photo_url,
        id: activeClone.ui_branding.catalog_photo_message_id,
      },
      WALLET_PHOTO: {
        url: activeClone.ui_branding.wallet_photo_url,
        id: activeClone.ui_branding.wallet_photo_message_id,
      },
      OUT_OF_STOCK_PHOTO: {
        url: activeClone.ui_branding.out_of_stock_photo_url,
        id: activeClone.ui_branding.out_of_stock_photo_message_id,
      },
    };

    appendMessages(
      {
        id: `USR-CMD-${Date.now()}`,
        sender: 'user',
        timestamp: nowTime(),
        body: trimmed,
      },
      cmdResponse
        ? {
            id: `BOT-CMD-${Date.now() + 1}`,
            sender: 'bot',
            timestamp: nowTime(),
            bannerUrl: cmdResponse.bannerTag ? bannerMap[cmdResponse.bannerTag].url : undefined,
            bannerTag: cmdResponse.bannerTag,
            bannerMsgId: cmdResponse.bannerTag ? bannerMap[cmdResponse.bannerTag].id : undefined,
            title: cmdResponse.replyTitle,
            body: cmdResponse.replyBody,
            codeBlock: cmdResponse.codeBlock,
          }
        : {
            id: `BOT-CMD-${Date.now() + 1}`,
            sender: 'bot',
            timestamp: nowTime(),
            title: 'Command Executed',
            body: `Processed input on ${activeClone.bot_username}. Try /start, /admin, /clone, /setdbchannel, /setgateway, /addmoney, /fsublist, or /changelang.`,
          }
    );
  };

  // Build Native Telegram Colored ReplyKeyboard Buttons (`KeyboardButtonStyle`)
  const activeReplyButtons: ColoredButtonSpec[][] = selectedProduct
    ? selectedProduct.stock === 0
      ? [
          [
            {
              id: 'btn-oos',
              label: t('btn_out_of_stock'),
              style: 'danger',
              action: 'out_of_stock',
            },
          ],
          [
            {
              id: 'btn-back-cat',
              label: t('btn_view_products'),
              style: 'primary',
              action: 'view_products',
            },
          ],
        ]
      : [
          [
            {
              id: 'btn-pay-wallet',
              label: `${t('btn_pay_wallet')} ($${selectedProduct.price_usd.toFixed(2)})`,
              style: 'success' as const,
              action: 'pay_wallet',
            },
            {
              id: 'btn-confirm',
              label: t('btn_confirm_purchase'),
              style: 'success' as const,
              action: 'confirm_purchase',
            },
          ],
          [
            ...(activeClone.gateways.oxapay.enabled
              ? [
                  {
                    id: 'btn-oxa',
                    label: t('btn_pay_oxapay'),
                    style: 'primary' as const,
                    action: 'pay_oxapay',
                  },
                ]
              : []),
            ...(activeClone.gateways.fampay.enabled
              ? [
                  {
                    id: 'btn-fam',
                    label: `${t('btn_pay_fampay')} (₹${(
                      selectedProduct.price_usd * activeClone.usd_to_inr
                    ).toFixed(0)})`,
                    style: 'primary' as const,
                    action: 'pay_fampay',
                  },
                ]
              : []),
          ],
          [
            {
              id: 'btn-cancel',
              label: t('btn_cancel_order'),
              style: 'danger' as const,
              action: 'cancel_order',
            },
          ],
        ].filter((row) => row.length > 0)
    : [
        [
          {
            id: 'btn-products',
            label: t('btn_view_products'),
            style: 'primary',
            action: 'view_products',
          },
          {
            id: 'btn-wallet',
            label: `${t('btn_wallet')} ($${activeWallet.balance_usd.toFixed(2)})`,
            style: 'success',
            action: 'open_wallet',
          },
        ],
        [
          {
            id: 'btn-dashboard',
            label: t('btn_open_dashboard'),
            style: 'primary',
            action: 'open_dashboard',
          },
          {
            id: 'btn-lang',
            label: `🌐 ${t('btn_change_lang')} (${currentLang.toUpperCase()})`,
            style: 'default',
            action: 'change_lang',
          },
        ],
      ];

  const getColoredButtonClass = (style: ColoredButtonSpec['style']) => {
    switch (style) {
      case 'success':
        return 'bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500/60 shadow-sm';
      case 'danger':
        return 'bg-rose-600 hover:bg-rose-500 text-white border border-rose-500/60 shadow-sm';
      case 'primary':
        return 'bg-sky-600 hover:bg-sky-500 text-white border border-sky-500/60 shadow-sm';
      default:
        return 'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700';
    }
  };

  const quickSlashCommands = [
    '/start',
    '/admin',
    '/setgateway',
    `/addmoney ${activeWallet.user_id} 25`,
    '/fsublist',
    '/clone 7901238412:AAH8xLmP09qWz_demo',
  ];

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
      {/* Simulator Top Header */}
      <div className="flex items-center justify-between gap-4 px-4 py-3 bg-slate-950 border-b border-slate-800">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-slate-100 truncate">
              {activeClone.bot_name}
            </h2>
            <span className="text-xs font-mono text-sky-400 truncate">
              {activeClone.bot_username}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5 font-mono tabular-nums">
            <span>ID: {activeClone._id}</span>
            <span aria-hidden="true">·</span>
            <span>Lang: {currentLang.toUpperCase()}</span>
            <span aria-hidden="true">·</span>
            <span>Font: {activeClone.font_style}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onToggleFSubStatus}
            className={`px-2.5 py-1.5 text-xs font-mono rounded-lg border transition-colors whitespace-nowrap shrink-0 ${
              activeWallet.joined_fsub
                ? 'bg-emerald-950/60 border-emerald-700/60 text-emerald-300'
                : 'bg-amber-950/60 border-amber-700/60 text-amber-300'
            }`}
            title="Simulate user membership in mandatory Force-Subscribe channel"
          >
            FSub Joined: {activeWallet.joined_fsub ? 'True' : 'False'}
          </button>
          <button
            type="button"
            onClick={() => setShowLangSelector((prev) => !prev)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors whitespace-nowrap shrink-0"
          >
            <Globe className="w-3.5 h-3.5 text-sky-400" />
            <span>18 Locales</span>
          </button>
        </div>
      </div>

      {/* Interactive 18-Language Switcher Drawer inside Telegram Client */}
      {showLangSelector && (
        <div className="p-3 bg-slate-950/95 border-b border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-300">
              Instant User Language Switcher (9 Indian Regional · 9 Global)
            </span>
            <button
              type="button"
              onClick={() => setShowLangSelector(false)}
              className="text-xs text-slate-400 hover:text-slate-200"
            >
              Close
            </button>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
            {SUPPORTED_LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => {
                  onChangeUserLanguage(lang.code);
                  setShowLangSelector(false);
                }}
                className={`px-2 py-1.5 text-left rounded-md border text-xs transition-colors truncate ${
                  currentLang === lang.code
                    ? 'bg-sky-600/20 border-sky-500 text-sky-200 font-medium'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="font-mono uppercase mr-1">{lang.code}</span>
                <span>{lang.nativeName}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quick Product Selector Bar */}
      <div className="flex items-center gap-2 px-4 py-2 bg-slate-900/90 border-b border-slate-800 overflow-x-auto">
        <span className="text-xs text-slate-400 whitespace-nowrap shrink-0">
          Catalog Items:
        </span>
        {cloneProducts.map((prod) => (
          <button
            key={prod._id}
            type="button"
            onClick={() => handleSelectProductCard(prod)}
            className={`px-2.5 py-1 text-xs rounded-md border transition-colors whitespace-nowrap shrink-0 font-mono tabular-nums ${
              selectedProductId === prod._id
                ? 'bg-sky-600 text-white border-sky-500'
                : prod.stock === 0
                ? 'bg-rose-950/40 text-rose-300 border-rose-800/50 hover:bg-rose-900/40'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            {prod.title.slice(0, 22)}... (${prod.price_usd})
          </button>
        ))}
      </div>

      {/* Chat Messages Viewport */}
      <div
        ref={chatScrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[280px] max-h-[420px] bg-slate-950/50"
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.sender === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            <div
              className={`max-w-[90%] rounded-xl overflow-hidden border ${
                msg.sender === 'user'
                  ? 'bg-sky-700 text-white border-sky-600 px-3.5 py-2'
                  : 'bg-slate-900 text-slate-100 border-slate-800'
              }`}
            >
              {msg.bannerUrl && (
                <div className="relative h-32 w-full bg-slate-950 overflow-hidden border-b border-slate-800">
                  <img
                    src={msg.bannerUrl}
                    alt={msg.title || 'Telegram Bot Media Banner'}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
                  <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-xs font-mono text-slate-300">
                    <span>{msg.bannerTag}</span>
                    <span>msg_id: #{msg.bannerMsgId}</span>
                  </div>
                </div>
              )}

              <div className={msg.sender === 'bot' ? 'p-3.5' : ''}>
                {msg.title && (
                  <div
                    className={`text-sm font-semibold text-white mb-1 ${
                      activeClone.font_style === 'monospace_code'
                        ? 'font-mono'
                        : activeClone.font_style === 'italic_editorial'
                        ? 'italic'
                        : ''
                    }`}
                  >
                    {msg.title}
                  </div>
                )}

                <div
                  className={`text-xs leading-relaxed whitespace-pre-line ${
                    msg.sender === 'user' ? 'text-sky-50' : 'text-slate-300'
                  } ${
                    activeClone.font_style === 'monospace_code'
                      ? 'font-mono'
                      : activeClone.font_style === 'italic_editorial'
                      ? 'italic'
                      : ''
                  }`}
                >
                  {msg.body}
                </div>

                {msg.fileDelivery && (
                  <div className="mt-3 p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/60 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FileArchive className="w-5 h-5 text-emerald-400 shrink-0" />
                      <div className="min-w-0">
                        <div className="text-xs font-mono font-medium text-emerald-200 truncate">
                          {msg.fileDelivery.fileName}
                        </div>
                        <div className="text-[11px] font-mono text-emerald-400/80 tabular-nums">
                          {msg.fileDelivery.fileSize} · copy_message(#{msg.fileDelivery.dbMsgId}) · Audit #{msg.fileDelivery.masterBackupMsgId}
                        </div>
                      </div>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  </div>
                )}

                {msg.codeBlock && (
                  <pre className="mt-2.5 p-2 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-sky-300 overflow-x-auto tabular-nums">
                    {msg.codeBlock}
                  </pre>
                )}

                <div
                  className={`mt-1.5 text-[10px] font-mono tabular-nums text-right ${
                    msg.sender === 'user' ? 'text-sky-200' : 'text-slate-500'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Slash Command Triggers */}
      <div className="px-3 py-2 bg-slate-950 border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto">
        {quickSlashCommands.map((cmd) => (
          <button
            key={cmd}
            type="button"
            onClick={() => setCommandInput(cmd)}
            className="px-2 py-1 text-[11px] font-mono text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded transition-colors whitespace-nowrap shrink-0"
          >
            {cmd}
          </button>
        ))}
      </div>

      {/* Command Input Box */}
      <form
        onSubmit={handleSendCommand}
        className="flex items-center gap-2 px-3 py-2 bg-slate-900 border-t border-slate-800"
      >
        <Terminal className="w-4 h-4 text-slate-400 shrink-0" />
        <input
          type="text"
          value={commandInput}
          onChange={(e) => setCommandInput(e.target.value)}
          placeholder="Run bot command (/clone, /setdbchannel, /setgateway, /addmoney)..."
          className="flex-1 bg-transparent text-xs font-mono text-slate-100 placeholder:text-slate-500 focus:outline-none"
        />
        <button
          type="submit"
          className="px-3 py-1.5 text-xs font-medium bg-sky-600 hover:bg-sky-500 text-white rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Send</span>
        </button>
      </form>

      {/* Native Telegram Colored ReplyKeyboardMarkup Deck */}
      <div className="p-3 bg-slate-950 border-t border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span>Telegram Colored ReplyKeyboard (KeyboardButtonStyle)</span>
          <span>bg_primary · bg_success · bg_danger</span>
        </div>
        <div className="space-y-1.5">
          {activeReplyButtons.map((row, rIdx) => (
            <div key={rIdx} className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {row.map((btn) => (
                <button
                  key={btn.id}
                  type="button"
                  onClick={() => handleColoredButtonClick(btn)}
                  className={`py-2 px-3 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-2 truncate ${getColoredButtonClass(
                    btn.style
                  )} ${row.length === 1 ? 'sm:col-span-2' : ''}`}
                >
                  <span className="truncate">{btn.label}</span>
                  <span className="text-[10px] font-mono opacity-75 shrink-0">
                    [{btn.style === 'default' ? 'std' : `bg_${btn.style}`}]
                  </span>
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
