import { LanguageCode } from '@/config/countries';

export interface Translations {
  // Nav
  nav_services: string;
  nav_about: string;
  nav_how_it_works: string;
  nav_partners: string;
  nav_careers: string;
  nav_sign_in: string;
  nav_get_started: string;

  // Hero
  hero_badge: string;
  hero_title_1: string;
  hero_title_2: string;
  hero_title_3: string;
  hero_title_4: string;
  hero_subtitle: string;
  hero_cta_order: string;
  hero_cta_rider: string;
  hero_stat_delivery: string;
  hero_stat_delivery_label: string;
  hero_stat_rating: string;
  hero_stat_rating_label: string;
  hero_stat_available: string;
  hero_stat_available_label: string;

  // Services
  services_label: string;
  services_title: string;
  services_subtitle: string;
  service_food: string;
  service_groceries: string;
  service_pharmacy: string;
  service_errands: string;
  service_packages: string;
  service_documents: string;

  // How it works
  how_label: string;
  how_title: string;
  how_subtitle: string;
  how_step1_title: string;
  how_step1_desc: string;
  how_step2_title: string;
  how_step2_desc: string;
  how_step3_title: string;
  how_step3_desc: string;

  // Global
  global_network_title: string;
  global_network_subtitle: string;
  global_countries_count: string;
  global_countries_label: string;
  coming_soon: string;

  // CTA
  cta_rider_title: string;
  cta_rider_subtitle: string;
  cta_rider_button: string;

  // Footer
  footer_description: string;
  footer_platform: string;
  footer_company: string;
  footer_rights: string;
  footer_product_of: string;
}

const en: Translations = {
  nav_services: 'Services',
  nav_about: 'About Us',
  nav_how_it_works: 'How it Works',
  nav_partners: 'Partners',
  nav_careers: 'Drive with Us',
  nav_sign_in: 'Sign In',
  nav_get_started: 'Get Started',

  hero_badge: 'A Genesis Holdings Inc. (USA) Company',
  hero_title_1: 'Premium',
  hero_title_2: 'Delivery',
  hero_title_3: 'At Your',
  hero_title_4: 'Fingertips.',
  hero_subtitle: 'From food and groceries to packages and errands — SpeedUp connects you with reliable riders for fast, secure deliveries worldwide.',
  hero_cta_order: 'Order a Delivery',
  hero_cta_rider: 'Earn as a Rider',
  hero_stat_delivery: '15 min',
  hero_stat_delivery_label: 'Avg. Delivery',
  hero_stat_rating: '4.9★',
  hero_stat_rating_label: 'Customer Rating',
  hero_stat_available: '24/7',
  hero_stat_available_label: 'Always Available',

  services_label: 'Our Services',
  services_title: 'What do you need delivered?',
  services_subtitle: 'From meals to medicines, packages to paperwork — we deliver anything, anywhere.',
  service_food: 'Food Delivery',
  service_groceries: 'Groceries',
  service_pharmacy: 'Pharmacy',
  service_errands: 'Errands',
  service_packages: 'Packages',
  service_documents: 'Documents',

  how_label: 'Simple & Fast',
  how_title: 'How SpeedUp Works',
  how_subtitle: 'Three simple steps to get anything delivered',
  how_step1_title: 'Choose Service',
  how_step1_desc: 'Select what you need delivered and enter your pickup & delivery locations.',
  how_step2_title: 'Get Matched',
  how_step2_desc: 'We instantly connect you with the nearest verified rider for your delivery.',
  how_step3_title: 'Track & Receive',
  how_step3_desc: 'Follow your delivery in real-time on the map and receive it at your doorstep.',

  global_network_title: 'Our Global Delivery Network',
  global_network_subtitle: 'Motorcycles, bicycles, scooters, and cars — our diverse fleet ensures fast, reliable deliveries across multiple countries.',
  global_countries_count: '5',
  global_countries_label: 'Countries',
  coming_soon: 'Coming Soon',

  cta_rider_title: 'Turn Your Vehicle Into Your Business.',
  cta_rider_subtitle: 'Whether you ride a motorcycle, bicycle, scooter, or drive a car — join thousands of riders earning flexible income with SpeedUp.',
  cta_rider_button: 'Start Earning Today',

  footer_description: 'SpeedUp is a premium on-demand delivery platform by Genesis Holdings Inc., a registered company in the United States of America. Connecting customers with reliable riders worldwide.',
  footer_platform: 'Platform',
  footer_company: 'Company',
  footer_rights: '© 2025 SpeedUp. All rights reserved.',
  footer_product_of: 'A product of Genesis Holdings Inc. — United States of America 🇺🇸',
};

const fi: Translations = {
  nav_services: 'Palvelut',
  nav_about: 'Tietoa meistä',
  nav_how_it_works: 'Miten se toimii',
  nav_partners: 'Kumppanit',
  nav_careers: 'Aja kanssamme',
  nav_sign_in: 'Kirjaudu',
  nav_get_started: 'Aloita',

  hero_badge: 'Genesis Holdings Inc. (USA) yritys',
  hero_title_1: 'Premium',
  hero_title_2: 'Toimitus',
  hero_title_3: 'Käden',
  hero_title_4: 'Ulottuvilla.',
  hero_subtitle: 'Ruuasta ja päivittäistavaroista paketteihin ja asiointiin — SpeedUp yhdistää sinut luotettaviin kuljettajiin nopeisiin, turvallisiin toimituksiin.',
  hero_cta_order: 'Tilaa toimitus',
  hero_cta_rider: 'Tienaa kuljettajana',
  hero_stat_delivery: '15 min',
  hero_stat_delivery_label: 'Keskim. toimitus',
  hero_stat_rating: '4.9★',
  hero_stat_rating_label: 'Asiakasarvio',
  hero_stat_available: '24/7',
  hero_stat_available_label: 'Aina saatavilla',

  services_label: 'Palvelumme',
  services_title: 'Mitä tarvitset toimitettavan?',
  services_subtitle: 'Aterioista lääkkeisiin, paketeista paperitöihin — toimitamme mitä tahansa, minne tahansa.',
  service_food: 'Ruokatoimitus',
  service_groceries: 'Päivittäistavarat',
  service_pharmacy: 'Apteekki',
  service_errands: 'Asiointi',
  service_packages: 'Paketit',
  service_documents: 'Asiakirjat',

  how_label: 'Yksinkertainen & Nopea',
  how_title: 'Miten SpeedUp toimii',
  how_subtitle: 'Kolme helppoa askelta mihin tahansa toimitukseen',
  how_step1_title: 'Valitse palvelu',
  how_step1_desc: 'Valitse toimitettava tuote ja syötä nouto- ja toimitusosoitteet.',
  how_step2_title: 'Yhdistä kuljettaja',
  how_step2_desc: 'Yhdistämme sinut automaattisesti lähimpään vahvistettuun kuljettajaan.',
  how_step3_title: 'Seuraa & Vastaanota',
  how_step3_desc: 'Seuraa toimitustasi reaaliajassa kartalla ja vastaanota se ovellesi.',

  global_network_title: 'Globaali toimitusverkostomme',
  global_network_subtitle: 'Moottoripyörät, polkupyörät, skootterit ja autot — monipuolinen kalustomme takaa nopeat, luotettavat toimitukset.',
  global_countries_count: '5',
  global_countries_label: 'Maata',
  coming_soon: 'Tulossa pian',

  cta_rider_title: 'Muuta ajoneuvosi liiketoiminnaksi.',
  cta_rider_subtitle: 'Ajoitpa moottoripyörällä, polkupyörällä tai autolla — liity tuhansiin kuljettajiin, jotka tienaavat joustavasti SpeedUpilla.',
  cta_rider_button: 'Aloita tienaaminen',

  footer_description: 'SpeedUp on premium-tilaustoimitusalusta Genesis Holdings Inc.:ltä, rekisteröity yritys Yhdysvalloissa. Yhdistämme asiakkaita luotettaviin kuljettajiin maailmanlaajuisesti.',
  footer_platform: 'Alusta',
  footer_company: 'Yritys',
  footer_rights: '© 2025 SpeedUp. Kaikki oikeudet pidätetään.',
  footer_product_of: 'Genesis Holdings Inc. — Yhdysvallat 🇺🇸',
};

const am: Translations = {
  nav_services: 'አገልግሎቶች',
  nav_about: 'ስለ እኛ',
  nav_how_it_works: 'እንዴት ይሰራል',
  nav_partners: 'አጋሮች',
  nav_careers: 'ከእኛ ጋር ንዱ',
  nav_sign_in: 'ግባ',
  nav_get_started: 'ጀምር',

  hero_badge: 'የ Genesis Holdings Inc. (USA) ኩባንያ',
  hero_title_1: 'ፕሪሚየም',
  hero_title_2: 'ማድረስ',
  hero_title_3: 'በእጅዎ',
  hero_title_4: 'ጫፍ ላይ።',
  hero_subtitle: 'ከምግብ እና ግሮሰሪ እስከ ጥቅሎች እና ስራዎች — SpeedUp ከታማኝ ራይደሮች ጋር ያገናኝዎታል ለፈጣን፣ ደህንነቱ የተጠበቀ ማድረስ።',
  hero_cta_order: 'ማድረስ ዝዘዙ',
  hero_cta_rider: 'እንደ ራይደር ያግኙ',
  hero_stat_delivery: '15 ደቂቃ',
  hero_stat_delivery_label: 'አማካይ ማድረስ',
  hero_stat_rating: '4.9★',
  hero_stat_rating_label: 'የደንበኛ ደረጃ',
  hero_stat_available: '24/7',
  hero_stat_available_label: 'ሁልጊዜ ይገኛል',

  services_label: 'አገልግሎቶቻችን',
  services_title: 'ምን እንዲደርስልዎ ይፈልጋሉ?',
  services_subtitle: 'ከምግብ እስከ መድሀኒት፣ ከጥቅሎች እስከ ወረቀቶች — ማንኛውንም ነገር፣ በየትኛውም ቦታ እናደርሳለን።',
  service_food: 'ምግብ ማድረስ',
  service_groceries: 'ግሮሰሪ',
  service_pharmacy: 'ፋርማሲ',
  service_errands: 'ስራዎች',
  service_packages: 'ጥቅሎች',
  service_documents: 'ሰነዶች',

  how_label: 'ቀላል & ፈጣን',
  how_title: 'SpeedUp እንዴት ይሰራል',
  how_subtitle: 'ሦስት ቀላል ደረጃዎች ማንኛውንም ነገር ለማድረስ',
  how_step1_title: 'አገልግሎት ይምረጡ',
  how_step1_desc: 'የሚያስፈልገውን ያስመርጡ እና ቦታዎችን ያስገቡ።',
  how_step2_title: 'ራይደር ያግኙ',
  how_step2_desc: 'ወዲያውኑ ከቅርብ ራይደር ጋር እናገናኝዎታለን።',
  how_step3_title: 'ይከታተሉ & ይቀበሉ',
  how_step3_desc: 'ማድረስዎን በቀጥታ በካርታ ላይ ይከታተሉ።',

  global_network_title: 'ዓለም አቀፍ የማድረስ ኔትወርክ',
  global_network_subtitle: 'ሞተርሳይክሎች፣ ብስክሌቶች፣ ስኩተሮች እና መኪናዎች — ፈጣን፣ ታማኝ ማድረስ።',
  global_countries_count: '5',
  global_countries_label: 'ሀገራት',
  coming_soon: 'በቅርቡ ይመጣል',

  cta_rider_title: 'ተሽከርካሪዎን ወደ ንግድ ይቀይሩ።',
  cta_rider_subtitle: 'ሞተርሳይክል፣ ብስክሌት ወይም መኪና — ከሺዎች ራይደሮች ጋር ይቀላቀሉ።',
  cta_rider_button: 'ዛሬ ማግኘት ይጀምሩ',

  footer_description: 'SpeedUp ከ Genesis Holdings Inc. የፕሪሚየም ማድረስ መድረክ ነው።',
  footer_platform: 'መድረክ',
  footer_company: 'ኩባንያ',
  footer_rights: '© 2025 SpeedUp. መብቶች በሙሉ የተጠበቁ ናቸው።',
  footer_product_of: 'Genesis Holdings Inc. — ዩናይትድ ስቴትስ 🇺🇸',
};

const fr: Translations = {
  nav_services: 'Services',
  nav_about: 'À propos',
  nav_how_it_works: 'Comment ça marche',
  nav_partners: 'Partenaires',
  nav_careers: 'Conduisez avec nous',
  nav_sign_in: 'Se connecter',
  nav_get_started: 'Commencer',

  hero_badge: 'Une entreprise Genesis Holdings Inc. (USA)',
  hero_title_1: 'Livraison',
  hero_title_2: 'Premium',
  hero_title_3: 'À portée',
  hero_title_4: 'de main.',
  hero_subtitle: 'De la nourriture aux courses, des colis aux courses — SpeedUp vous connecte avec des livreurs fiables pour des livraisons rapides et sécurisées.',
  hero_cta_order: 'Commander une livraison',
  hero_cta_rider: 'Gagner en tant que livreur',
  hero_stat_delivery: '15 min',
  hero_stat_delivery_label: 'Livraison moy.',
  hero_stat_rating: '4.9★',
  hero_stat_rating_label: 'Note client',
  hero_stat_available: '24/7',
  hero_stat_available_label: 'Toujours disponible',

  services_label: 'Nos Services',
  services_title: 'Que voulez-vous livrer?',
  services_subtitle: 'Des repas aux médicaments, des colis aux documents — nous livrons tout, partout.',
  service_food: 'Livraison de repas',
  service_groceries: 'Courses',
  service_pharmacy: 'Pharmacie',
  service_errands: 'Courses',
  service_packages: 'Colis',
  service_documents: 'Documents',

  how_label: 'Simple & Rapide',
  how_title: 'Comment SpeedUp fonctionne',
  how_subtitle: 'Trois étapes simples pour tout livrer',
  how_step1_title: 'Choisir le service',
  how_step1_desc: 'Sélectionnez ce que vous avez besoin et entrez vos adresses.',
  how_step2_title: 'Trouver un livreur',
  how_step2_desc: 'Nous vous connectons instantanément avec le livreur vérifié le plus proche.',
  how_step3_title: 'Suivre & Recevoir',
  how_step3_desc: 'Suivez votre livraison en temps réel sur la carte.',

  global_network_title: 'Notre réseau de livraison mondial',
  global_network_subtitle: 'Motos, vélos, scooters et voitures — notre flotte diversifiée assure des livraisons rapides et fiables.',
  global_countries_count: '5',
  global_countries_label: 'Pays',
  coming_soon: 'Bientôt disponible',

  cta_rider_title: 'Transformez votre véhicule en business.',
  cta_rider_subtitle: 'Que vous conduisiez une moto, un vélo ou une voiture — rejoignez des milliers de livreurs.',
  cta_rider_button: "Commencez à gagner aujourd'hui",

  footer_description: "SpeedUp est une plateforme de livraison premium de Genesis Holdings Inc., une société enregistrée aux États-Unis d'Amérique.",
  footer_platform: 'Plateforme',
  footer_company: 'Entreprise',
  footer_rights: '© 2025 SpeedUp. Tous droits réservés.',
  footer_product_of: 'Genesis Holdings Inc. — États-Unis 🇺🇸',
};

export const translations: Record<LanguageCode, Translations> = { en, fi, am, fr };

export const languageNames: Record<LanguageCode, string> = {
  en: 'English',
  fi: 'Suomi',
  am: 'አማርኛ',
  fr: 'Français',
};
