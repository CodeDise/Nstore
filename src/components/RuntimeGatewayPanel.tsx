import React, { useState } from 'react';
import {
  CreditCard,
  Webhook,
  Check,
  Play,
  Database,
  RefreshCw,
  Shield,
} from 'lucide-react';
import { CloneSettingsDocument, DigitalProduct } from '../data/storeTypes';

interface RuntimeGatewayPanelProps {
  activeClone: CloneSettingsDocument;
  products: DigitalProduct[];
  onUpdateGatewayConfig: (updated: CloneSettingsDocument['gateways'], usdToInr: number, currencies: CloneSettingsDocument['currencies']) => void;
  onSimulateWebhook: (gateway: 'oxapay' | 'fampay', product: DigitalProduct) => void;
}

export const RuntimeGatewayPanel: React.FC<RuntimeGatewayPanelProps> = ({
  activeClone,
  products,
  onUpdateGatewayConfig,
  onSimulateWebhook,
}) => {
  const [oxapayEnabled, setOxapayEnabled] = useState(activeClone.gateways.oxapay.enabled);
  const [oxapayKey, setOxapayKey] = useState(activeClone.gateways.oxapay.api_key);
  const [oxapayNet, setOxapayNet] = useState(activeClone.gateways.oxapay.network);

  const [fampayEnabled, setFampayEnabled] = useState(activeClone.gateways.fampay.enabled);
  const [fampayMerchant, setFampayMerchant] = useState(activeClone.gateways.fampay.merchant_id);
  const [fampayUpi, setFampayUpi] = useState(activeClone.gateways.fampay.upi_id);

  const [usdToInr, setUsdToInr] = useState(activeClone.usd_to_inr);
  const [currencies, setCurrencies] = useState(activeClone.currencies);
  const [savedNotice, setSavedNotice] = useState(false);
  const [webhookResponseLog, setWebhookResponseLog] = useState<string | null>(null);

  const cloneProducts = products.filter((p) => p.bot_id === activeClone._id);
  const [selectedWebhookProdId, setSelectedWebhookProdId] = useState(
    cloneProducts[0]?._id || ''
  );

  React.useEffect(() => {
    setOxapayEnabled(activeClone.gateways.oxapay.enabled);
    setOxapayKey(activeClone.gateways.oxapay.api_key);
    setOxapayNet(activeClone.gateways.oxapay.network);
    setFampayEnabled(activeClone.gateways.fampay.enabled);
    setFampayMerchant(activeClone.gateways.fampay.merchant_id);
    setFampayUpi(activeClone.gateways.fampay.upi_id);
    setUsdToInr(activeClone.usd_to_inr);
    setCurrencies(activeClone.currencies);
  }, [activeClone]);

  const handleSaveRuntimeConfig = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateGatewayConfig(
      {
        oxapay: {
          enabled: oxapayEnabled,
          api_key: oxapayKey.trim(),
          network: oxapayNet.trim(),
        },
        fampay: {
          enabled: fampayEnabled,
          merchant_id: fampayMerchant.trim(),
          upi_id: fampayUpi.trim(),
        },
      },
      Number(usdToInr) || 85.0,
      currencies
    );
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2200);
  };

  const handleFireWebhook = (gateway: 'oxapay' | 'fampay') => {
    const prod = cloneProducts.find((p) => p._id === selectedWebhookProdId) || cloneProducts[0];
    if (!prod) return;
    onSimulateWebhook(gateway, prod);
    const endpoint = `/webhook/${gateway}/${activeClone._id}`;
    const logPayload = {
      status: 200,
      route: `POST ${endpoint}`,
      resolved_from_mongodb: `clone_settings._id == "${activeClone._id}"`,
      verified_credential:
        gateway === 'oxapay'
          ? `HMAC-SHA512(${oxapayKey.slice(0, 10)}...)`
          : `merchant_id == "${fampayMerchant}" (${fampayUpi})`,
      delivery_action: `client.copy_message(chat_id=804921004, from_chat_id=${activeClone.db_channel_id}, message_id=${prod.db_channel_message_id})`,
      master_audit_synced: `master_bot.send_message(${activeClone.master_audit_channel_id})`,
    };
    setWebhookResponseLog(JSON.stringify(logPayload, null, 2));
  };

  const mongoSchemaPreview = {
    _id: activeClone._id,
    owner_id: activeClone.owner_id,
    db_channel_id: activeClone.db_channel_id,
    log_channel_id: activeClone.log_channel_id,
    master_audit_channel_id: activeClone.master_audit_channel_id,
    default_language: activeClone.default_language,
    font_style: activeClone.font_style,
    ui_branding: {
      start_photo_message_id: activeClone.ui_branding.start_photo_message_id,
      catalog_photo_message_id: activeClone.ui_branding.catalog_photo_message_id,
      custom_welcome_msg: activeClone.ui_branding.custom_welcome_msg,
    },
    gateways: {
      oxapay: {
        enabled: oxapayEnabled,
        api_key: oxapayKey,
      },
      fampay: {
        enabled: fampayEnabled,
        merchant_id: fampayMerchant,
        upi_id: fampayUpi,
      },
    },
    currencies,
    usd_to_inr: Number(usdToInr),
  };

  return (
    <div className="space-y-6">
      {/* Zero-Repo-Hardcoding Runtime Gateway Form */}
      <form
        onSubmit={handleSaveRuntimeConfig}
        className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5"
      >
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-semibold text-slate-100">
              In-Panel Runtime Payment API Configuration (/setgateway)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Zero credentials stored in <code className="text-sky-300">.env</code> or repository files. Stored per-clone in <code className="text-sky-300">clone_settings</code>.
            </p>
          </div>
          <button
            type="submit"
            className="px-4 py-2 text-xs font-medium bg-sky-600 hover:bg-sky-500 text-white rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
          >
            {savedNotice ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Saved to MongoDB Atlas</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Sync Runtime Credentials</span>
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* OxaPay Crypto Gateway */}
          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200">
                OxaPay Crypto Merchant API
              </span>
              <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={oxapayEnabled}
                  onChange={(e) => setOxapayEnabled(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-sky-500"
                />
                <span>Enabled</span>
              </label>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Runtime Merchant API Key
              </label>
              <input
                type="text"
                value={oxapayKey}
                onChange={(e) => setOxapayKey(e.target.value)}
                className="w-full px-3 py-1.5 text-xs font-mono bg-slate-900 border border-slate-800 rounded-md text-slate-100 focus:border-sky-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Supported Chains
              </label>
              <input
                type="text"
                value={oxapayNet}
                onChange={(e) => setOxapayNet(e.target.value)}
                className="w-full px-3 py-1.5 text-xs font-mono bg-slate-900 border border-slate-800 rounded-md text-slate-100 focus:border-sky-500 focus:outline-none"
              />
            </div>
          </div>

          {/* FamPay / UPI Gateway */}
          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200">
                FamPay & Instant Indian UPI Gateway
              </span>
              <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={fampayEnabled}
                  onChange={(e) => setFampayEnabled(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-sky-500"
                />
                <span>Enabled</span>
              </label>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Runtime FamPay Merchant ID
              </label>
              <input
                type="text"
                value={fampayMerchant}
                onChange={(e) => setFampayMerchant(e.target.value)}
                className="w-full px-3 py-1.5 text-xs font-mono bg-slate-900 border border-slate-800 rounded-md text-slate-100 focus:border-sky-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Dynamic Receiver UPI ID
              </label>
              <input
                type="text"
                value={fampayUpi}
                onChange={(e) => setFampayUpi(e.target.value)}
                className="w-full px-3 py-1.5 text-xs font-mono bg-slate-900 border border-slate-800 rounded-md text-slate-100 focus:border-sky-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Multi-Currency & FX Conversion */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-400">Active Currencies:</span>
            {(['INR', 'USD', 'USDT'] as const).map((curr) => (
              <label
                key={curr}
                className="flex items-center gap-1.5 text-xs font-mono text-slate-200 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={currencies[curr]}
                  onChange={(e) =>
                    setCurrencies((prev) => ({ ...prev, [curr]: e.target.checked }))
                  }
                  className="rounded border-slate-700 bg-slate-900 text-sky-500"
                />
                <span>{curr}</span>
              </label>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-400">1 USD to INR Rate:</label>
            <input
              type="number"
              step="0.5"
              value={usdToInr}
              onChange={(e) => setUsdToInr(parseFloat(e.target.value) || 85)}
              className="w-24 px-2.5 py-1 text-xs font-mono tabular-nums bg-slate-950 border border-slate-800 rounded-md text-slate-100"
            />
          </div>
        </div>
      </form>

      {/* Dynamic aiohttp Webhook Callback Tester */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-100">
              Dynamic aiohttp Webhook Router Simulator
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">
              POST /webhook/oxapay/{activeClone._id} · POST /webhook/fampay/{activeClone._id}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={selectedWebhookProdId}
              onChange={(e) => setSelectedWebhookProdId(e.target.value)}
              className="px-3 py-1.5 text-xs font-mono bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
            >
              {cloneProducts.map((p) => (
                <option key={p._id} value={p._id}>
                  {p._id}: {p.title.slice(0, 26)} (${p.price_usd})
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => handleFireWebhook('oxapay')}
              className="px-3 py-1.5 text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <Play className="w-3 h-3" />
              <span>Fire OxaPay Webhook</span>
            </button>
            <button
              type="button"
              onClick={() => handleFireWebhook('fampay')}
              className="px-3 py-1.5 text-xs font-medium bg-sky-600 hover:bg-sky-500 text-white rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <Play className="w-3 h-3" />
              <span>Fire FamPay Webhook</span>
            </button>
          </div>
        </div>

        {webhookResponseLog && (
          <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-300 overflow-x-auto tabular-nums">
            {webhookResponseLog}
          </pre>
        )}
      </div>

      {/* Ultra-Lightweight MongoDB clone_settings Schema Inspector */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-sky-400" />
            <h3 className="text-sm font-semibold text-slate-100">
              Live MongoDB Atlas Document (clone_settings)
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400 tabular-nums">
            Document Size: {JSON.stringify(mongoSchemaPreview).length} bytes · Pointers Only
          </span>
        </div>
        <pre className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto tabular-nums leading-relaxed">
          {JSON.stringify(mongoSchemaPreview, null, 2)}
        </pre>
      </div>
    </div>
  );
};
