import React, { useState } from 'react';
import { Globe, Type, Image as ImageIcon, Check, RotateCcw } from 'lucide-react';
import { CloneSettingsDocument } from '../data/storeTypes';
import {
  SUPPORTED_LANGUAGES,
  DEFAULT_TRANSLATIONS,
  FONT_STYLE_OPTIONS,
  FontStyleMode,
  TranslationKeys,
  applyFontStyle,
} from '../data/localesData';

interface LocalizationBrandingPanelProps {
  activeClone: CloneSettingsDocument;
  onUpdateDefaultLanguage: (langCode: string) => void;
  onUpdateFontStyle: (mode: FontStyleMode) => void;
  onSaveTranslationOverride: (langCode: string, key: TranslationKeys, value: string) => void;
  onUpdateBranding: (branding: CloneSettingsDocument['ui_branding']) => void;
}

const EDITABLE_KEYS: { key: TranslationKeys; label: string }[] = [
  { key: 'welcome_title', label: 'Store Welcome Title' },
  { key: 'btn_view_products', label: 'Primary Button: View Products' },
  { key: 'btn_open_dashboard', label: 'Primary Button: Open Dashboard' },
  { key: 'btn_pay_wallet', label: 'Success Button: Pay via Wallet' },
  { key: 'btn_confirm_purchase', label: 'Success Button: Confirm Purchase' },
  { key: 'btn_cancel_order', label: 'Danger Button: Cancel Order' },
  { key: 'btn_out_of_stock', label: 'Danger Button: Out of Stock' },
];

export const LocalizationBrandingPanel: React.FC<LocalizationBrandingPanelProps> = ({
  activeClone,
  onUpdateDefaultLanguage,
  onUpdateFontStyle,
  onSaveTranslationOverride,
  onUpdateBranding,
}) => {
  const [editingLang, setEditingLang] = useState(activeClone.default_language || 'hi');
  const [brandingForm, setBrandingForm] = useState(activeClone.ui_branding);
  const [savedToast, setSavedToast] = useState(false);

  React.useEffect(() => {
    setBrandingForm(activeClone.ui_branding);
  }, [activeClone]);

  const handleSaveBrandingForm = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateBranding(brandingForm);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Custom Font & Text Styling Engine */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div>
          <h3 className="text-base font-semibold text-slate-100">
            Custom Font & Typography Styling Engine (fonts.py)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            All dynamic bot responses and colored reply buttons automatically adapt to the selected typography mode.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {FONT_STYLE_OPTIONS.map((opt) => {
            const isSelected = activeClone.font_style === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onUpdateFontStyle(opt.id)}
                className={`p-3.5 rounded-lg border text-left transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-sky-950/40 border-sky-500 text-slate-100'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="text-xs font-semibold text-slate-100">
                    {opt.label}
                  </div>
                  <div className="text-xs text-slate-300 mt-2 truncate">
                    {opt.sample}
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-800/80 text-[11px] font-mono text-sky-400">
                  {opt.htmlTagPreview}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 18-Language Localization Studio */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-semibold text-slate-100">
              18-Language Global & Indian Regional Localization Engine (locales.py)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Set the clone’s default language (`/changelang`) or customize translation strings directly in MongoDB.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Clone Default Language:</span>
            <select
              value={activeClone.default_language}
              onChange={(e) => {
                onUpdateDefaultLanguage(e.target.value);
                setEditingLang(e.target.value);
              }}
              className="px-3 py-1.5 text-xs font-medium bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
            >
              {SUPPORTED_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.code.toUpperCase()} — {l.name} ({l.nativeName}) [{l.region}]
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Language Pills Selector for String Customization */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {SUPPORTED_LANGUAGES.map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => setEditingLang(l.code)}
              className={`px-2.5 py-1.5 text-xs rounded-md border transition-colors whitespace-nowrap shrink-0 ${
                editingLang === l.code
                  ? 'bg-sky-600 text-white border-sky-500 font-medium'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              <span className="font-mono uppercase mr-1">{l.code}</span>
              <span>{l.nativeName}</span>
            </button>
          ))}
        </div>

        {/* String Editor Table */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          {EDITABLE_KEYS.map(({ key, label }) => {
            const currentVal =
              activeClone.custom_translations?.[editingLang]?.[key] ??
              DEFAULT_TRANSLATIONS[editingLang]?.[key] ??
              DEFAULT_TRANSLATIONS['en'][key];
            return (
              <div
                key={key}
                className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium">{label}</span>
                  <span className="font-mono text-[11px] text-slate-500">{key}</span>
                </div>
                <input
                  type="text"
                  value={currentVal}
                  onChange={(e) =>
                    onSaveTranslationOverride(editingLang, key, e.target.value)
                  }
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded text-slate-100 focus:border-sky-500 focus:outline-none"
                />
                <div className="text-[11px] text-sky-400/90 truncate">
                  Styled Preview: {applyFontStyle(currentVal, activeClone.font_style)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dynamic UI/UX & Media Banner Pointers */}
      <form
        onSubmit={handleSaveBrandingForm}
        className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-semibold text-slate-100">
              Dynamic UI/UX & Media Banner Pointers (Clone Admin Panel)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Customize <code className="text-sky-300">START_PHOTO</code>, <code className="text-sky-300">CATALOG_PHOTO</code>, <code className="text-sky-300">WALLET_PHOTO</code>, and <code className="text-sky-300">OUT_OF_STOCK_PHOTO</code> message pointers.
            </p>
          </div>
          <button
            type="submit"
            className="px-4 py-2 text-xs font-medium bg-sky-600 hover:bg-sky-500 text-white rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
          >
            {savedToast ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Branding Updated</span>
              </>
            ) : (
              <span>Save UI Branding</span>
            )}
          </button>
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1">
            Custom Welcome Message (ui_branding.custom_welcome_msg)
          </label>
          <input
            type="text"
            value={brandingForm.custom_welcome_msg}
            onChange={(e) =>
              setBrandingForm((prev) => ({
                ...prev,
                custom_welcome_msg: e.target.value,
              }))
            }
            className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-md text-slate-100"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(
            [
              {
                tag: 'START_PHOTO',
                msgIdKey: 'start_photo_message_id',
                urlKey: 'start_photo_url',
              },
              {
                tag: 'CATALOG_PHOTO',
                msgIdKey: 'catalog_photo_message_id',
                urlKey: 'catalog_photo_url',
              },
              {
                tag: 'WALLET_PHOTO',
                msgIdKey: 'wallet_photo_message_id',
                urlKey: 'wallet_photo_url',
              },
              {
                tag: 'OUT_OF_STOCK_PHOTO',
                msgIdKey: 'out_of_stock_photo_message_id',
                urlKey: 'out_of_stock_photo_url',
              },
            ] as const
          ).map((slot) => (
            <div
              key={slot.tag}
              className="rounded-lg bg-slate-950 border border-slate-800 overflow-hidden flex flex-col"
            >
              <div className="h-24 w-full bg-slate-900 relative overflow-hidden border-b border-slate-800">
                <img
                  src={brandingForm[slot.urlKey]}
                  alt={slot.tag}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-transparent" />
                <span className="absolute bottom-1.5 left-2 text-[11px] font-mono text-white">
                  {slot.tag}
                </span>
              </div>
              <div className="p-3 space-y-2">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-0.5">
                    DB Channel Message ID Pointer
                  </label>
                  <input
                    type="number"
                    value={brandingForm[slot.msgIdKey]}
                    onChange={(e) =>
                      setBrandingForm((prev) => ({
                        ...prev,
                        [slot.msgIdKey]: parseInt(e.target.value, 10) || 100,
                      }))
                    }
                    className="w-full px-2 py-1 text-xs font-mono tabular-nums bg-slate-900 border border-slate-800 rounded text-slate-100"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </form>
    </div>
  );
};
