export interface LanguageMeta {
  code: string;
  name: string;
  nativeName: string;
  region: 'Indian Regional' | 'Global';
}

export const SUPPORTED_LANGUAGES: LanguageMeta[] = [
  // Indian Languages (9)
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', region: 'Indian Regional' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', region: 'Indian Regional' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', region: 'Indian Regional' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', region: 'Indian Regional' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', region: 'Indian Regional' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', region: 'Indian Regional' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', region: 'Indian Regional' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', region: 'Indian Regional' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', region: 'Indian Regional' },
  // Global Languages (9)
  { code: 'en', name: 'English', nativeName: 'English', region: 'Global' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', region: 'Global' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', region: 'Global' },
  { code: 'ko', name: 'South Korean', nativeName: '한국어', region: 'Global' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', region: 'Global' },
  { code: 'fr', name: 'French', nativeName: 'Français', region: 'Global' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', region: 'Global' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', region: 'Global' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', region: 'Global' },
];

export type TranslationKeys =
  | 'welcome_title'
  | 'welcome_subtitle'
  | 'btn_view_products'
  | 'btn_open_dashboard'
  | 'btn_wallet'
  | 'btn_change_lang'
  | 'btn_pay_wallet'
  | 'btn_confirm_purchase'
  | 'btn_pay_oxapay'
  | 'btn_pay_fampay'
  | 'btn_cancel_order'
  | 'btn_out_of_stock'
  | 'wallet_balance_label'
  | 'fsub_required_msg'
  | 'order_delivered_msg'
  | 'insufficient_balance';

export const DEFAULT_TRANSLATIONS: Record<string, Record<TranslationKeys, string>> = {
  en: {
    welcome_title: 'Welcome to Nohara Digital Store',
    welcome_subtitle: 'Instant automated digital delivery powered by Dual-Layer Telegram Channel Storage.',
    btn_view_products: 'View Products',
    btn_open_dashboard: 'Open Dashboard',
    btn_wallet: 'My Wallet',
    btn_change_lang: 'Change Language',
    btn_pay_wallet: 'Pay via Wallet',
    btn_confirm_purchase: 'Confirm Purchase',
    btn_pay_oxapay: 'Pay Crypto (OxaPay)',
    btn_pay_fampay: 'Pay UPI / FamPay',
    btn_cancel_order: 'Cancel Order',
    btn_out_of_stock: 'Out of Stock',
    wallet_balance_label: 'Available Wallet Balance',
    fsub_required_msg: 'Please join our mandatory update channels before accessing the store.',
    order_delivered_msg: 'Payment verified! Fetching your digital asset from private storage channel...',
    insufficient_balance: 'Insufficient wallet balance. Please top up or use instant gateway checkout.',
  },
  hi: {
    welcome_title: 'नोहारा डिजिटल स्टोर में आपका स्वागत है',
    welcome_subtitle: 'डुअल-लेयर टेलीग्राम चैनल स्टोरेज द्वारा संचालित तत्काल डिजिटल डिलीवरी।',
    btn_view_products: 'उत्पाद देखें',
    btn_open_dashboard: 'डैशबोर्ड खोलें',
    btn_wallet: 'मेरा वॉलेट',
    btn_change_lang: 'भाषा बदलें',
    btn_pay_wallet: 'वॉलेट से भुगतान करें',
    btn_confirm_purchase: 'खरीद की पुष्टि करें',
    btn_pay_oxapay: 'क्रिप्टो भुगतान (OxaPay)',
    btn_pay_fampay: 'UPI / FamPay से भुगतान',
    btn_cancel_order: 'ऑर्डर रद्द करें',
    btn_out_of_stock: 'स्टॉक समाप्त',
    wallet_balance_label: 'उपलब्ध वॉलेट बैलेंस',
    fsub_required_msg: 'स्टोर का उपयोग करने से पहले कृपया हमारे अनिवार्य चैनल से जुड़ें।',
    order_delivered_msg: 'भुगतान सफल! प्राइवेट स्टोरेज चैनल से आपकी डिजिटल फ़ाइल भेजी जा रही है...',
    insufficient_balance: 'अपर्याप्त वॉलेट बैलेंस। कृपया रिचार्ज करें या पेमेंट गेटवे चुनें।',
  },
  mr: {
    welcome_title: 'नोहारा डिजिटल स्टोअरमध्ये आपले स्वागत आहे',
    welcome_subtitle: 'ड्युअल-लेयर टेलिग्राम चॅनेल स्टोरेजद्वारे त्वरित डिजिटल वितरण.',
    btn_view_products: 'उत्पादने पहा',
    btn_open_dashboard: 'डॅशबोर्ड उघडा',
    btn_wallet: 'माझे वॉलेट',
    btn_change_lang: 'भाषा बदला',
    btn_pay_wallet: 'वॉलेटद्वारे पेमेंट करा',
    btn_confirm_purchase: 'खरेदी निश्चित करा',
    btn_pay_oxapay: 'क्रिप्टो पेमेंट (OxaPay)',
    btn_pay_fampay: 'UPI / FamPay पेमेंट',
    btn_cancel_order: 'ऑर्डर रद्द करा',
    btn_out_of_stock: 'स्टॉक उपलब्ध नाही',
    wallet_balance_label: 'उपलब्ध वॉलेट शिल्लक',
    fsub_required_msg: 'कृपया स्टोअर वापरण्यापूर्वी आमच्या मुख्य चॅनेलला जॉईन करा.',
    order_delivered_msg: 'पेमेंट यशस्वी! खाजगी चॅनेलवरून तुमची डिजिटल फाईल पाठवली जात आहे...',
    insufficient_balance: 'वॉलेटमध्ये पुरेशी शिल्लक नाही. कृपया टॉप-अप करा.',
  },
  ta: {
    welcome_title: 'நோஹாரா டிஜிட்டல் ஸ்டோருக்கு வரவேற்கிறோம்',
    welcome_subtitle: 'டூயல்-லேயர் டெலிகிராம் சேனல் மூலம் உடனடி டிஜிட்டல் டெலிவரி.',
    btn_view_products: 'பொருட்களைப் பார்க்க',
    btn_open_dashboard: 'டாஷ்போர்டைத் திற',
    btn_wallet: 'எனது வாலட்',
    btn_change_lang: 'மொழியை மாற்று',
    btn_pay_wallet: 'வாலட் மூலம் செலுத்து',
    btn_confirm_purchase: 'வாங்குவதை உறுதிசெய்',
    btn_pay_oxapay: 'கிரிப்டோ (OxaPay)',
    btn_pay_fampay: 'UPI / FamPay செலுத்து',
    btn_cancel_order: 'ஆர்டரை ரத்துசெய்',
    btn_out_of_stock: 'கையிருப்பு இல்லை',
    wallet_balance_label: 'வாலட் இருப்பு',
    fsub_required_msg: 'தொடர்வதற்கு முன் எங்கள் அதிகாரப்பூர்வ சேனலில் இணையவும்.',
    order_delivered_msg: 'கட்டணம் உறுதி செய்யப்பட்டது! உங்கள் கோப்பு அனுப்பப்படுகிறது...',
    insufficient_balance: 'வாலட் இருப்பு போதவில்லை. ரீசார்ஜ் செய்யவும்.',
  },
  te: {
    welcome_title: 'నోహారా డిజిటల్ స్టోర్‌కు స్వాగతం',
    welcome_subtitle: 'డ్యూయల్-లేయర్ టెలిగ్రామ్ ఛానెల్ స్టోరేజ్ ద్వారా తక్షణ డిజిటల్ డెలివరీ.',
    btn_view_products: 'ఉత్పత్తులను చూడండి',
    btn_open_dashboard: 'డాష్‌బోర్డ్ తెరవండి',
    btn_wallet: 'నా వాలెట్',
    btn_change_lang: 'భాషను మార్చండి',
    btn_pay_wallet: 'వాలెట్ ద్వారా చెల్లించండి',
    btn_confirm_purchase: 'కొనుగోలు నిర్ధారించండి',
    btn_pay_oxapay: 'క్రిప్టో (OxaPay)',
    btn_pay_fampay: 'UPI / FamPay చెల్లింపు',
    btn_cancel_order: 'ఆర్డర్ రద్దు చేయండి',
    btn_out_of_stock: 'స్టాక్ లేదు',
    wallet_balance_label: 'లభ్యమైన వాలెట్ బ్యాలెన్స్',
    fsub_required_msg: 'స్టోర్‌ను యాక్సెస్ చేయడానికి ముందు దయచేసి మా ఛానెల్‌లో చేరండి.',
    order_delivered_msg: 'చెల్లింపు ధృవీకరించబడింది! మీ ఫైల్ ప్రైవేట్ ఛానెల్ నుండి పంపబడుతోంది...',
    insufficient_balance: 'వాలెట్ బ్యాలెన్స్ సరిపోదు. దయచేసి టాప్ అప్ చేయండి.',
  },
  bn: {
    welcome_title: 'নোহার ডিজিটাল স্টোরে স্বাগতম',
    welcome_subtitle: 'ডুয়াল-লেয়ার টেলিগ্রাম চ্যানেল স্টোরেজের মাধ্যমে তাৎক্ষণিক ডিজিটাল ডেলিভারি।',
    btn_view_products: 'পণ্য দেখুন',
    btn_open_dashboard: 'ড্যাশবোর্ড খুলুন',
    btn_wallet: 'আমার ওয়ালেট',
    btn_change_lang: 'ভাষা পরিবর্তন করুন',
    btn_pay_wallet: 'ওয়ালেট দিয়ে পেমেন্ট করুন',
    btn_confirm_purchase: 'ক্রয় নিশ্চিত করুন',
    btn_pay_oxapay: 'ক্রিপ্টো পেমেন্ট (OxaPay)',
    btn_pay_fampay: 'UPI / FamPay পেমেন্ট',
    btn_cancel_order: 'অর্ডার বাতিল করুন',
    btn_out_of_stock: 'স্টক শেষ',
    wallet_balance_label: 'উপলব্ধ ওয়ালেট ব্যালেন্স',
    fsub_required_msg: 'স্টোর ব্যবহার করার আগে অনুগ্রহ করে আমাদের চ্যানেলে যুক্ত হন।',
    order_delivered_msg: 'পেমেন্ট যাচাই সম্পন্ন! প্রাইভেট চ্যানেল থেকে আপনার ফাইল পাঠানো হচ্ছে...',
    insufficient_balance: 'পর্যাপ্ত ওয়ালেট ব্যালেন্স নেই। অনুগ্রহ করে রিচার্জ করুন।',
  },
  gu: {
    welcome_title: 'નોહારા ડિજિટલ સ્ટોરમાં આપનું સ્વાગત છે',
    welcome_subtitle: 'ડ્યુઅલ-લેયર ટેલિગ્રામ ચેનલ સ્ટોરેજ દ્વારા ત્વરિત ડિજિટલ ડિલિવરી.',
    btn_view_products: 'ઉત્પાદનો જુઓ',
    btn_open_dashboard: 'ડેશબોર્ડ ખોલો',
    btn_wallet: 'મારું વોલેટ',
    btn_change_lang: 'ભાષા બદલો',
    btn_pay_wallet: 'વોલેટથી ચુકવણી કરો',
    btn_confirm_purchase: 'ખરીદી કન્ફર્મ કરો',
    btn_pay_oxapay: 'ક્રિપ્ટો (OxaPay)',
    btn_pay_fampay: 'UPI / FamPay ચુકવણી',
    btn_cancel_order: 'ઓર્ડર રદ કરો',
    btn_out_of_stock: 'સ્ટોક ખલાસ',
    wallet_balance_label: 'ઉપલબ્ધ વોલેટ બેલેન્સ',
    fsub_required_msg: 'કૃપા કરીને સ્ટોર વાપરતા પહેલા અમારી ચેનલમાં જોડાઓ.',
    order_delivered_msg: 'ચુકવણી સફળ! પ્રાઇવેટ ચેનલમાંથી તમારી ફાઇલ મોકલવામાં આવી રહી છે...',
    insufficient_balance: 'અપૂરતું વોલેટ બેલેન્સ. કૃપા કરીને રિચાર્જ કરો.',
  },
  pa: {
    welcome_title: 'ਨੋਹਾਰਾ ਡਿਜੀਟਲ ਸਟੋਰ ਵਿੱਚ ਤੁਹਾਡਾ ਸੁਆਗਤ ਹੈ',
    welcome_subtitle: 'ਡੁਅਲ-ਲੇਅਰ ਟੈਲੀਗ੍ਰਾਮ ਚੈਨਲ ਸਟੋਰੇਜ ਦੁਆਰਾ ਤੁਰੰਤ ਡਿਜੀਟਲ ਡਿਲੀਵਰੀ।',
    btn_view_products: 'ਉਤਪਾਦ ਦੇਖੋ',
    btn_open_dashboard: 'ਡੈਸ਼ਬੋਰਡ ਖੋਲ੍ਹੋ',
    btn_wallet: 'ਮੇਰਾ ਵਾਲਿਟ',
    btn_change_lang: 'ਭਾਸ਼ਾ ਬਦਲੋ',
    btn_pay_wallet: 'ਵਾਲਿਟ ਰਾਹੀਂ ਭੁਗਤਾਨ ਕਰੋ',
    btn_confirm_purchase: 'ਖਰੀਦ ਦੀ ਪੁਸ਼ਟੀ ਕਰੋ',
    btn_pay_oxapay: 'ਕ੍ਰਿਪਟੋ (OxaPay)',
    btn_pay_fampay: 'UPI / FamPay ਭੁਗਤਾਨ',
    btn_cancel_order: 'ਆਰਡਰ ਰੱਦ ਕਰੋ',
    btn_out_of_stock: 'ਸਟਾਕ ਖਤਮ',
    wallet_balance_label: 'ਉਪਲਬਧ ਵਾਲਿਟ ਬੈਲੇਂਸ',
    fsub_required_msg: 'ਕਿਰਪਾ ਕਰਕੇ ਸਟੋਰ ਦੀ ਵਰਤੋਂ ਕਰਨ ਤੋਂ ਪਹਿਲਾਂ ਸਾਡੇ ਚੈਨਲ ਨਾਲ ਜੁੜੋ।',
    order_delivered_msg: 'ਭੁਗਤਾਨ ਸਫਲ! ਪ੍ਰਾਈਵੇਟ ਚੈਨਲ ਤੋਂ ਤੁਹਾਡੀ ਫਾਈਲ ਭੇਜੀ ਜਾ ਰਹੀ ਹੈ...',
    insufficient_balance: 'ਵਾਲਿਟ ਬੈਲੇਂਸ ਘੱਟ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ਟਾਪ-ਅੱਪ ਕਰੋ।',
  },
  kn: {
    welcome_title: 'ನೊಹಾರಾ ಡಿಜಿಟಲ್ ಸ್ಟೋರ್‌ಗೆ স্বাగತ',
    welcome_subtitle: 'ಡ್ಯುಯಲ್-ಲೇಯರ್ ಟೆಲಿಗ್ರಾಮ್ ಚಾನೆಲ್ ಸ್ಟೋರೇಜ್ ಮೂಲಕ ತ್ವರಿತ ಡಿಜಿಟಲ್ ವಿತರಣೆ.',
    btn_view_products: 'ಉತ್ಪನ್ನಗಳನ್ನು ವೀಕ್ಷಿಸಿ',
    btn_open_dashboard: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ತೆರೆಯಿರಿ',
    btn_wallet: 'ನನ್ನ ವ್ಯಾಲೆಟ್',
    btn_change_lang: 'ಭಾಷೆ ಬದಲಿಸಿ',
    btn_pay_wallet: 'ವ್ಯಾಲೆಟ್ ಮೂಲಕ ಪಾವತಿಸಿ',
    btn_confirm_purchase: 'ಖರೀದಿ ದೃಢೀಕರಿಸಿ',
    btn_pay_oxapay: 'ಕ್ರಿಪ್ಟೋ (OxaPay)',
    btn_pay_fampay: 'UPI / FamPay ಪಾವತಿ',
    btn_cancel_order: 'ಆರ್ಡರ್ ರದ್ದುಮಾಡಿ',
    btn_out_of_stock: 'ಸ್ಟಾಕ್ ಇಲ್ಲ',
    wallet_balance_label: 'ಲಭ್ಯವಿರುವ ವ್ಯಾಲೆಟ್ ಬ್ಯಾಲೆನ್ಸ್',
    fsub_required_msg: 'ದಯವಿಟ್ಟು ಮುಂದುವರಿಯುವ ಮೊದಲು ನಮ್ಮ ಚಾನೆಲ್‌ಗೆ ಸೇರಿಕೊಳ್ಳಿ.',
    order_delivered_msg: 'ಪಾವತಿ ಯಶಸ್ವಿಯಾಗಿದೆ! ನಿಮ್ಮ ಡಿಜಿಟಲ್ ಫೈಲ್ ಕಳುಹಿಸಲಾಗುತ್ತಿದೆ...',
    insufficient_balance: 'ವ್ಯಾಲೆಟ್ ಬ್ಯಾಲೆನ್ಸ್ ಸಾಲುವುದಿಲ್ಲ. ದಯವಿಟ್ಟು ರೀಚಾರ್ಜ್ ಮಾಡಿ.',
  },
  ml: {
    welcome_title: 'നോഹാര ഡിജിറ്റൽ സ്റ്റോറിലേക്ക് സ്വാഗതം',
    welcome_subtitle: 'ഡ്യുവൽ-ലെയർ ടെലിഗ്രാം ചാനൽ സ്റ്റോറേജിലൂടെയുള്ള വേഗത്തിലുള്ള ഡിജിറ്റൽ ഡെലിവറി.',
    btn_view_products: 'ഉൽപ്പന്നങ്ങൾ കാണുക',
    btn_open_dashboard: 'ഡാഷ്‌ബോർഡ് തുറക്കുക',
    btn_wallet: 'എന്റെ വാലറ്റ്',
    btn_change_lang: 'ഭാഷ മാറ്റുക',
    btn_pay_wallet: 'വാലറ്റ് വഴി പണമടയ്ക്കുക',
    btn_confirm_purchase: 'വാങ്ങൽ സ്ഥിരീകരിക്കുക',
    btn_pay_oxapay: 'ക്രിപ്റ്റോ (OxaPay)',
    btn_pay_fampay: 'UPI / FamPay പേയ്‌മെന്റ്',
    btn_cancel_order: 'ഓർഡർ റദ്ദാക്കുക',
    btn_out_of_stock: 'സ്റ്റോക്ക് ഇല്ല',
    wallet_balance_label: 'ലഭ്യമായ വാലറ്റ് ബാലൻസ്',
    fsub_required_msg: 'സ്റ്റോർ ഉപയോഗിക്കുന്നതിന് മുമ്പ് ദയവായി ഞങ്ങളുടെ ചാനലിൽ ചേരുക.',
    order_delivered_msg: 'പേയ്‌മെന്റ് സ്ഥിരീകരിച്ചു! നിങ്ങളുടെ ഫയൽ അയക്കുന്നു...',
    insufficient_balance: 'വാലറ്റിൽ മതിയായ ബാലൻസ് ഇല്ല.',
  },
  ru: {
    welcome_title: 'Добро пожаловать в Nohara Digital Store',
    welcome_subtitle: 'Мгновенная доставка цифровых товаров через двухслойное хранилище Telegram.',
    btn_view_products: 'Каталог товаров',
    btn_open_dashboard: 'Панель управления',
    btn_wallet: 'Мой кошелек',
    btn_change_lang: 'Сменить язык',
    btn_pay_wallet: 'Оплатить с кошелька',
    btn_confirm_purchase: 'Подтвердить покупку',
    btn_pay_oxapay: 'Криптовалюта (OxaPay)',
    btn_pay_fampay: 'Оплата UPI / FamPay',
    btn_cancel_order: 'Отменить заказ',
    btn_out_of_stock: 'Нет в наличии',
    wallet_balance_label: 'Доступный баланс кошелька',
    fsub_required_msg: 'Пожалуйста, подпишитесь на обязательные каналы перед покупкой.',
    order_delivered_msg: 'Оплата подтверждена! Отправляем файл из приватного канала...',
    insufficient_balance: 'Недостаточно средств на балансе. Пополните кошелек.',
  },
  ja: {
    welcome_title: 'ノハラ・デジタルストアへようこそ',
    welcome_subtitle: 'デュアルレイヤーTelegramチャネルストレージによる即時自動配信。',
    btn_view_products: '商品一覧を見る',
    btn_open_dashboard: 'ダッシュボードを開く',
    btn_wallet: 'マイウォレット',
    btn_change_lang: '言語を変更',
    btn_pay_wallet: 'ウォレットで支払う',
    btn_confirm_purchase: '購入を確定する',
    btn_pay_oxapay: '暗号資産決済 (OxaPay)',
    btn_pay_fampay: 'UPI / FamPay決済',
    btn_cancel_order: '注文をキャンセル',
    btn_out_of_stock: '在庫切れ',
    wallet_balance_label: '利用可能なウォレット残高',
    fsub_required_msg: 'ストアを利用する前に必須チャンネルに参加してください。',
    order_delivered_msg: '決済完了！プライベートストレージから商品を転送しています...',
    insufficient_balance: 'ウォレット残高が不足しています。チャージしてください。',
  },
  ko: {
    welcome_title: '노하라 디지털 스토어에 오신 것을 환영합니다',
    welcome_subtitle: '듀얼 레이어 텔레그램 채널 스토리지 기반 즉시 디지털 배송.',
    btn_view_products: '상품 보기',
    btn_open_dashboard: '대시보드 열기',
    btn_wallet: '내 지갑',
    btn_change_lang: '언어 변경',
    btn_pay_wallet: '지갑으로 결제',
    btn_confirm_purchase: '구매 확정',
    btn_pay_oxapay: '암호화폐 결제 (OxaPay)',
    btn_pay_fampay: 'UPI / FamPay 결제',
    btn_cancel_order: '주문 취소',
    btn_out_of_stock: '품절',
    wallet_balance_label: '사용 가능한 지갑 잔액',
    fsub_required_msg: '스토어를 이용하기 전에 필수 채널에 가입해 주세요.',
    order_delivered_msg: '결제 확인 완료! 프라이빗 채널에서 파일을 전송 중입니다...',
    insufficient_balance: '지갑 잔액이 부족합니다. 충전해 주세요.',
  },
  zh: {
    welcome_title: '欢迎来到野原数字商店 (Nohara Store)',
    welcome_subtitle: '由双层 Telegram 频道存储驱动的即时自动数字交付。',
    btn_view_products: '浏览商品',
    btn_open_dashboard: '打开控制台',
    btn_wallet: '我的钱包',
    btn_change_lang: '切换语言',
    btn_pay_wallet: '使用钱包余额支付',
    btn_confirm_purchase: '确认购买',
    btn_pay_oxapay: '加密货币支付 (OxaPay)',
    btn_pay_fampay: 'UPI / FamPay 支付',
    btn_cancel_order: '取消订单',
    btn_out_of_stock: '暂时缺货',
    wallet_balance_label: '可用钱包余额',
    fsub_required_msg: '在访问商店之前，请先加入我们的指定频道。',
    order_delivered_msg: '付款已验证！正在从私有存储频道发送您的数字商品...',
    insufficient_balance: '钱包余额不足，请先充值或使用即时网关支付。',
  },
  fr: {
    welcome_title: 'Bienvenue sur Nohara Digital Store',
    welcome_subtitle: 'Livraison numérique instantanée via architecture Telegram double couche.',
    btn_view_products: 'Voir les produits',
    btn_open_dashboard: 'Ouvrir le tableau de bord',
    btn_wallet: 'Mon Portefeuille',
    btn_change_lang: 'Changer de langue',
    btn_pay_wallet: 'Payer via Portefeuille',
    btn_confirm_purchase: 'Confirmer l’achat',
    btn_pay_oxapay: 'Crypto (OxaPay)',
    btn_pay_fampay: 'Paiement UPI / FamPay',
    btn_cancel_order: 'Annuler la commande',
    btn_out_of_stock: 'Rupture de stock',
    wallet_balance_label: 'Solde disponible',
    fsub_required_msg: 'Veuillez rejoindre nos canaux obligatoires avant de continuer.',
    order_delivered_msg: 'Paiement vérifié ! Livraison du fichier depuis le canal privé...',
    insufficient_balance: 'Solde insuffisant. Veuillez recharger votre portefeuille.',
  },
  es: {
    welcome_title: 'Bienvenido a Nohara Digital Store',
    welcome_subtitle: 'Entrega digital instantánea mediante almacenamiento de canal Telegram de doble capa.',
    btn_view_products: 'Ver Productos',
    btn_open_dashboard: 'Abrir Panel',
    btn_wallet: 'Mi Billetera',
    btn_change_lang: 'Cambiar Idioma',
    btn_pay_wallet: 'Pagar con Billetera',
    btn_confirm_purchase: 'Confirmar Compra',
    btn_pay_oxapay: 'Pagar Cripto (OxaPay)',
    btn_pay_fampay: 'Pagar UPI / FamPay',
    btn_cancel_order: 'Cancelar Pedido',
    btn_out_of_stock: 'Agotado',
    wallet_balance_label: 'Saldo disponible en billetera',
    fsub_required_msg: 'Únete a nuestros canales obligatorios antes de acceder a la tienda.',
    order_delivered_msg: '¡Pago verificado! Enviando archivo desde el canal privado...',
    insufficient_balance: 'Saldo insuficiente. Recarga tu billetera o usa una pasarela.',
  },
  de: {
    welcome_title: 'Willkommen im Nohara Digital Store',
    welcome_subtitle: 'Sofortige digitale Lieferung über Dual-Layer-Telegram-Kanalspeicher.',
    btn_view_products: 'Produkte ansehen',
    btn_open_dashboard: 'Dashboard öffnen',
    btn_wallet: 'Mein Wallet',
    btn_change_lang: 'Sprache ändern',
    btn_pay_wallet: 'Mit Wallet bezahlen',
    btn_confirm_purchase: 'Kauf bestätigen',
    btn_pay_oxapay: 'Krypto zahlen (OxaPay)',
    btn_pay_fampay: 'UPI / FamPay zahlen',
    btn_cancel_order: 'Bestellung abbrechen',
    btn_out_of_stock: 'Ausverkauft',
    wallet_balance_label: 'Verfügbares Wallet-Guthaben',
    fsub_required_msg: 'Bitte treten Sie unseren Pflichtkanälen bei, um fortzufahren.',
    order_delivered_msg: 'Zahlung bestätigt! Datei wird aus dem privaten Kanal abgerufen...',
    insufficient_balance: 'Unzureichendes Guthaben. Bitte Wallet aufladen.',
  },
  ar: {
    welcome_title: 'مرحباً بك في متجر نوهارا الرقمي',
    welcome_subtitle: 'تسليم رقمي فوري مدعوم بتخزين قنوات تيليجرام ثنائي الطبقات.',
    btn_view_products: 'عرض المنتجات',
    btn_open_dashboard: 'فتح لوحة التحكم',
    btn_wallet: 'محفظتي',
    btn_change_lang: 'تغيير اللغة',
    btn_pay_wallet: 'الدفع عبر المحفظة',
    btn_confirm_purchase: 'تأكيد الشراء',
    btn_pay_oxapay: 'دفع عملات رقمية (OxaPay)',
    btn_pay_fampay: 'دفع UPI / FamPay',
    btn_cancel_order: 'إلغاء الطلب',
    btn_out_of_stock: 'نفدت الكمية',
    wallet_balance_label: 'رصيد المحفظة المتاح',
    fsub_required_msg: 'يرجى الانضمام إلى قنواتنا الإلزامية قبل تصفح المتجر.',
    order_delivered_msg: 'تم التحقق من الدفع! جاري إرسال الملف من القناة الخاصة...',
    insufficient_balance: 'رصيد المحفظة غير كافٍ. يرجى شحن الرصيد أولاً.',
  },
};

export type FontStyleMode =
  | 'default_html'
  | 'small_caps_unicode'
  | 'monospace_code'
  | 'serif_bold_italic'
  | 'italic_editorial';

export const FONT_STYLE_OPTIONS: {
  id: FontStyleMode;
  label: string;
  sample: string;
  htmlTagPreview: string;
}[] = [
  {
    id: 'default_html',
    label: 'Telegram Native HTML (<b> / <i>)',
    sample: 'Welcome to Nohara Digital Store',
    htmlTagPreview: '<b>{text}</b>',
  },
  {
    id: 'small_caps_unicode',
    label: 'Unicode Small Caps Engine',
    sample: 'ᴡᴇʟᴄᴏᴍᴇ ᴛᴏ ɴᴏʜᴀʀᴀ ᴅɪɢɪᴛᴀʟ sᴛᴏʀᴇ',
    htmlTagPreview: 'to_small_caps(text)',
  },
  {
    id: 'monospace_code',
    label: 'Telegram Monospace (<code>)',
    sample: 'Welcome to Nohara Digital Store',
    htmlTagPreview: '<code>{text}</code>',
  },
  {
    id: 'serif_bold_italic',
    label: 'Unicode Mathematical Bold Serif',
    sample: '𝐖𝐞𝐥𝐜𝐨𝐦𝐞 𝐭𝐨 𝐍𝐨𝐡𝐚𝐫𝐚 𝐃𝐢𝐠𝐢𝐭𝐚𝐥 𝐒𝐭𝐨𝐫𝐞',
    htmlTagPreview: 'to_serif_bold(text)',
  },
  {
    id: 'italic_editorial',
    label: 'Telegram Editorial Italic (<i><b>)',
    sample: 'Welcome to Nohara Digital Store',
    htmlTagPreview: '<i><b>{text}</b></i>',
  },
];

const SMALL_CAPS_MAP: Record<string, string> = {
  a: 'ᴀ', b: 'ʙ', c: 'ᴄ', d: 'ᴅ', e: 'ᴇ', f: 'ғ', g: 'ɢ', h: 'ʜ', i: 'ɪ',
  j: 'ᴊ', k: 'ᴋ', l: 'ʟ', m: 'ᴍ', n: 'ɴ', o: 'ᴏ', p: 'ᴘ', q: 'ǫ', r: 'ʀ',
  s: 's', t: 'ᴛ', u: 'ᴜ', v: 'ᴠ', w: 'ᴡ', x: 'x', y: 'ʏ', z: 'ᴢ',
};

const SERIF_BOLD_MAP: Record<string, string> = {
  A: '𝐀', B: '𝐁', C: '𝐂', D: '𝐃', E: '𝐄', F: '𝐅', G: '𝐆', H: '𝐇', I: '𝐈',
  J: '𝐉', K: '𝐊', L: '𝐋', M: '𝐌', N: '𝐍', O: '𝐎', P: '𝐏', Q: '𝐐', R: '𝐑',
  S: '𝐒', T: '𝐓', U: '𝐔', V: '𝐕', W: '𝐖', X: '𝐗', Y: '𝐘', Z: '𝐙',
  a: '𝐚', b: '𝐛', c: '𝐜', d: '𝐝', e: '𝐞', f: '𝐟', g: '𝐠', h: '𝐡', i: '𝐢',
  j: '𝐣', k: '𝐤', l: '𝐥', m: '𝐦', n: '𝐧', o: '𝐨', p: '𝐩', q: '𝐪', r: '𝐫',
  s: '𝐬', t: '𝐭', u: '𝐮', v: '𝐯', w: '𝐰', x: '𝐱', y: '𝐲', z: '𝐳',
};

export function applyFontStyle(text: string, mode: FontStyleMode): string {
  if (!text) return '';
  if (mode === 'small_caps_unicode') {
    return text
      .split('')
      .map((ch) => SMALL_CAPS_MAP[ch.toLowerCase()] || ch)
      .join('');
  }
  if (mode === 'serif_bold_italic') {
    return text
      .split('')
      .map((ch) => SERIF_BOLD_MAP[ch] || ch)
      .join('');
  }
  return text;
}
