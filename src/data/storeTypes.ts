import { FontStyleMode, TranslationKeys } from './localesData';

export type ButtonColorStyle = 'success' | 'danger' | 'primary' | 'default';

export interface ColoredButtonSpec {
  id: string;
  label: string;
  style: ButtonColorStyle;
  action: string;
  payload?: string;
}

export interface DigitalProduct {
  _id: string;
  bot_id: string;
  title: string;
  category: string;
  price_usd: number;
  stock: number; // -1 for unlimited digital download or positive integer for license keys/slots
  file_name: string;
  file_size: string;
  file_type: 'ZIP' | 'PDF' | 'MP4' | 'SOURCE_BUNDLE';
  db_channel_message_id: number;
  master_backup_message_id: number;
  created_at: string;
}

export interface FSubChannel {
  channel_id: number;
  title: string;
  invite_link: string;
  added_at: string;
}

export interface UserWalletRecord {
  user_id: number;
  username: string;
  balance_usd: number;
  language: string;
  joined_fsub: boolean;
  purchases_count: number;
}

export interface CloneSettingsDocument {
  _id: string; // BOT_ID e.g. "7194820192"
  bot_username: string;
  bot_name: string;
  token_masked: string;
  owner_id: number;
  owner_username: string;
  status: 'running' | 'paused';
  db_channel_id: number;
  log_channel_id: number;
  master_audit_channel_id: number;
  default_language: string;
  font_style: FontStyleMode;
  ui_branding: {
    start_photo_message_id: number;
    catalog_photo_message_id: number;
    wallet_photo_message_id: number;
    out_of_stock_photo_message_id: number;
    start_photo_url: string;
    catalog_photo_url: string;
    wallet_photo_url: string;
    out_of_stock_photo_url: string;
    custom_welcome_msg: string;
  };
  gateways: {
    oxapay: {
      enabled: boolean;
      api_key: string;
      network: string;
    };
    fampay: {
      enabled: boolean;
      merchant_id: string;
      upi_id: string;
    };
  };
  currencies: {
    INR: boolean;
    USD: boolean;
    USDT: boolean;
  };
  usd_to_inr: number;
  fsub_channels: FSubChannel[];
  custom_translations: Partial<Record<string, Partial<Record<TranslationKeys, string>>>>;
}

export interface ChannelLogEntry {
  id: string;
  message_id: number;
  timestamp: string;
  channel_type: 'CLONE_PRIVATE_DB' | 'CLONE_OWNER_LOG' | 'MASTER_ADMIN_AUDIT';
  channel_id: number;
  bot_id: string;
  bot_username: string;
  event_type:
    | 'ASSET_UPLOAD'
    | 'ORDER_DELIVERY'
    | 'WALLET_ADJUSTMENT'
    | 'GATEWAY_UPDATED'
    | 'CLONE_PROVISIONED'
    | 'WEBHOOK_CALLBACK'
    | 'UI_BRANDING_SYNC';
  summary: string;
  metadata_pointer: Record<string, string | number | boolean>;
}

export const INITIAL_IMAGES = {
  start: '/src/assets/images/start_banner_nohara_1793951204661.jpg',
  catalog: '/src/assets/images/catalog_banner_nohara_1793951206028.jpg',
  wallet: '/src/assets/images/wallet_banner_nohara_1793951207082.jpg',
  outOfStock: '/src/assets/images/out_of_stock_nohara_1793951206972.jpg',
};

export const INITIAL_CLONES: CloneSettingsDocument[] = [
  {
    _id: '7194820192',
    bot_username: '@NoharaPrimeStoreBot',
    bot_name: 'Nohara Prime Digital Vault',
    token_masked: '7194820192:AAH9xK...8vQpL2',
    owner_id: 582910442,
    owner_username: '@arjun_dev_in',
    status: 'running',
    db_channel_id: -1002198441022,
    log_channel_id: -1002198449981,
    master_audit_channel_id: -1001999888777,
    default_language: 'en',
    font_style: 'default_html',
    ui_branding: {
      start_photo_message_id: 105,
      catalog_photo_message_id: 106,
      wallet_photo_message_id: 107,
      out_of_stock_photo_message_id: 108,
      start_photo_url: INITIAL_IMAGES.start,
      catalog_photo_url: INITIAL_IMAGES.catalog,
      wallet_photo_url: INITIAL_IMAGES.wallet,
      out_of_stock_photo_url: INITIAL_IMAGES.outOfStock,
      custom_welcome_msg: 'Instant zero-latency delivery from verified private Telegram channel vaults.',
    },
    gateways: {
      oxapay: {
        enabled: true,
        api_key: 'OXA_LIVE_9482_A7F19C02D8E',
        network: 'TRC20 / TON / Polygon',
      },
      fampay: {
        enabled: true,
        merchant_id: 'FAMPAY_MERCH_88210',
        upi_id: 'noharaprimestore@fam',
      },
    },
    currencies: {
      INR: true,
      USD: true,
      USDT: true,
    },
    usd_to_inr: 85.0,
    fsub_channels: [
      {
        channel_id: -1001847291011,
        title: 'Nohara Prime Announcements',
        invite_link: 'https://t.me/+NoharaPrimeUpdates',
        added_at: '2026-11-01 14:20 UTC',
      },
    ],
    custom_translations: {},
  },
  {
    _id: '6841029384',
    bot_username: '@KenshinAssetsBot',
    bot_name: 'Kenshin UI & Shader Store',
    token_masked: '6841029384:AAEw2M...3nZyR9',
    owner_id: 619044821,
    owner_username: '@kenshin_tokyo',
    status: 'running',
    db_channel_id: -1003019283746,
    log_channel_id: -1003019289912,
    master_audit_channel_id: -1001999888777,
    default_language: 'hi',
    font_style: 'small_caps_unicode',
    ui_branding: {
      start_photo_message_id: 210,
      catalog_photo_message_id: 211,
      wallet_photo_message_id: 212,
      out_of_stock_photo_message_id: 213,
      start_photo_url: INITIAL_IMAGES.start,
      catalog_photo_url: INITIAL_IMAGES.catalog,
      wallet_photo_url: INITIAL_IMAGES.wallet,
      out_of_stock_photo_url: INITIAL_IMAGES.outOfStock,
      custom_welcome_msg: 'Curated 3D Shaders, LUTs, and Async Python Automation Kits.',
    },
    gateways: {
      oxapay: {
        enabled: true,
        api_key: 'OXA_LIVE_3019_K8P44M12X9B',
        network: 'USDT-TRC20 / TON',
      },
      fampay: {
        enabled: true,
        merchant_id: 'FAMPAY_MERCH_44109',
        upi_id: 'kenshinstore@fam',
      },
    },
    currencies: {
      INR: true,
      USD: true,
      USDT: true,
    },
    usd_to_inr: 85.5,
    fsub_channels: [],
    custom_translations: {},
  },
];

export const INITIAL_PRODUCTS: DigitalProduct[] = [
  {
    _id: 'PRD-901',
    bot_id: '7194820192',
    title: 'Hydrogram Multi-Tenant SaaS Boilerplate v4.2',
    category: 'Source Code',
    price_usd: 18.0,
    stock: 24,
    file_name: 'hydrogram_saas_v4_2_full.zip',
    file_size: '48.4 MB',
    file_type: 'ZIP',
    db_channel_message_id: 4012,
    master_backup_message_id: 98102,
    created_at: '2026-11-04 09:15 UTC',
  },
  {
    _id: 'PRD-902',
    bot_id: '7194820192',
    title: 'High-Frequency AsyncIO & Motor Architecture Guide',
    category: 'Engineering PDF',
    price_usd: 9.5,
    stock: 150,
    file_name: 'asyncio_motor_production_handbook.pdf',
    file_size: '19.2 MB',
    file_type: 'PDF',
    db_channel_message_id: 4018,
    master_backup_message_id: 98109,
    created_at: '2026-11-04 16:40 UTC',
  },
  {
    _id: 'PRD-903',
    bot_id: '7194820192',
    title: 'Zero-Downtime Render & Webhook Masterclass (4K MP4)',
    category: 'Video Course',
    price_usd: 25.0,
    stock: 0,
    file_name: 'render_webhook_masterclass_4k.mp4',
    file_size: '612.0 MB',
    file_type: 'MP4',
    db_channel_message_id: 4025,
    master_backup_message_id: 98118,
    created_at: '2026-11-05 02:10 UTC',
  },
  {
    _id: 'PRD-904',
    bot_id: '6841029384',
    title: 'Cinema4D & Octane Anodized Metal Shader Pack',
    category: '3D Assets',
    price_usd: 14.0,
    stock: 42,
    file_name: 'anodized_shaders_4k_bundle.zip',
    file_size: '384.6 MB',
    file_type: 'ZIP',
    db_channel_message_id: 710,
    master_backup_message_id: 98140,
    created_at: '2026-11-05 05:30 UTC',
  },
];

export const INITIAL_WALLETS: UserWalletRecord[] = [
  {
    user_id: 804921004,
    username: '@rohan_k_buyer',
    balance_usd: 42.5,
    language: 'en',
    joined_fsub: true,
    purchases_count: 3,
  },
  {
    user_id: 991204811,
    username: '@priya_sharma_ux',
    balance_usd: 12.0,
    language: 'hi',
    joined_fsub: true,
    purchases_count: 1,
  },
  {
    user_id: 441092831,
    username: '@alex_volkov_ru',
    balance_usd: 5.0,
    language: 'ru',
    joined_fsub: false,
    purchases_count: 0,
  },
];

export const INITIAL_CHANNEL_LOGS: ChannelLogEntry[] = [
  {
    id: 'LOG-1001',
    message_id: 98102,
    timestamp: '2026-11-05 22:14:09 UTC',
    channel_type: 'MASTER_ADMIN_AUDIT',
    channel_id: -1001999888777,
    bot_id: '7194820192',
    bot_username: '@NoharaPrimeStoreBot',
    event_type: 'ASSET_UPLOAD',
    summary: 'Dual-Layer Sync: Digital asset uploaded to Clone DB (#4012) & mirrored to Master Backup (#98102).',
    metadata_pointer: {
      product_id: 'PRD-901',
      db_channel_msg_id: 4012,
      master_backup_msg_id: 98102,
      mongo_doc_bytes: 284,
    },
  },
  {
    id: 'LOG-1002',
    message_id: 4012,
    timestamp: '2026-11-05 22:14:08 UTC',
    channel_type: 'CLONE_PRIVATE_DB',
    channel_id: -1002198441022,
    bot_id: '7194820192',
    bot_username: '@NoharaPrimeStoreBot',
    event_type: 'ASSET_UPLOAD',
    summary: 'Stored binary payload hydrogram_saas_v4_2_full.zip (48.4 MB) in Clone Owner Private Channel.',
    metadata_pointer: {
      file_name: 'hydrogram_saas_v4_2_full.zip',
      message_id: 4012,
      owner_id: 582910442,
    },
  },
  {
    id: 'LOG-1003',
    message_id: 98135,
    timestamp: '2026-11-05 23:02:41 UTC',
    channel_type: 'MASTER_ADMIN_AUDIT',
    channel_id: -1001999888777,
    bot_id: '7194820192',
    bot_username: '@NoharaPrimeStoreBot',
    event_type: 'GATEWAY_UPDATED',
    summary: 'Runtime Gateway Update: Owner @arjun_dev_in updated OxaPay & FamPay credentials in-panel.',
    metadata_pointer: {
      oxapay_enabled: true,
      fampay_upi: 'noharaprimestore@fam',
      usd_to_inr: 85.0,
    },
  },
  {
    id: 'LOG-1004',
    message_id: 98149,
    timestamp: '2026-11-05 23:31:18 UTC',
    channel_type: 'MASTER_ADMIN_AUDIT',
    channel_id: -1001999888777,
    bot_id: '7194820192',
    bot_username: '@NoharaPrimeStoreBot',
    event_type: 'ORDER_DELIVERY',
    summary: 'Order Executed: @rohan_k_buyer purchased PRD-901 ($18.00 via Wallet). Delivered via copy_message(4012).',
    metadata_pointer: {
      buyer_id: 804921004,
      amount_usd: 18.0,
      amount_inr: 1530.0,
      source_msg_id: 4012,
    },
  },
];
