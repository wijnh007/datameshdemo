/* ============================================================
   Wedding Website — Aina & Daan
   main.js — i18n, countdown, nav, animations, map
   ============================================================ */

'use strict';

/* ============================================================
   TRANSLATIONS
   ============================================================ */
const TRANSLATIONS = {
  nl: {
    // Nav
    nav_programme: 'Programma',
    nav_venue: 'Locatie',
    nav_travel: 'Reizen',
    nav_practical: 'Praktisch',
    nav_contact: 'Contact',

    // Hero
    hero_eyebrow: 'Jullie zijn uitgenodigd',
    hero_date_location: '4 juli 2026 · Vintermossen, Zweden',
    hero_cta: 'Bekijk programma',
    countdown_days: 'Dagen',
    countdown_hours: 'Uren',
    countdown_minutes: 'Minuten',
    countdown_seconds: 'Seconden',
    countdown_today: 'Het is vandaag! Gefeliciteerd Aina & Daan! 🎉',
    countdown_past: 'Wat een onvergetelijk dag was het!',

    // Programme section
    programme_tag: 'Het feestweekend',
    programme_title: 'Programma',
    programme_subtitle: 'Twee dagen vol liefde, lachen en herinneringen in het Zweedse bos.',
    friday_tag: 'Vrijdag 3 juli',
    saturday_tag: 'Zaterdag 4 juli',
    ladies_night_title: 'Vrijgezellenavond\nVrouwen',
    ladies_night_time: '19:00',
    ladies_night_desc: 'Een gezellige avond voor de vrouwen om de bruid te verwennen. Details volgen.',
    mens_night_title: 'Vrijgezellenavond\nMannen',
    mens_night_time: '19:00',
    mens_night_desc: 'Een avond voor de mannen — de bruidegom in stijl uitzwaaien. Details volgen.',
    pre_events_time: '19:00',
    ceremony_time: '14:00',
    ceremony_event: 'Ceremonie',
    ceremony_desc: 'De trouwceremonie in de openlucht te Vintermossen.',
    reception_time: '15:30',
    reception_event: 'Receptie',
    reception_desc: 'Proost op het nieuwe echtpaar met borrels en hapjes.',
    dinner_time: '18:00',
    dinner_event: 'Diner',
    dinner_desc: 'Gezamenlijk diner met seizoensgerechten.',
    party_time: '20:30',
    party_event: 'Feest',
    party_desc: 'Dansen en vieren tot in de kleine uurtjes — in Zweden is het in juli licht tot middernacht!',

    // Venue section
    venue_tag: 'De locatie',
    venue_title: 'Vintermossen',
    venue_subtitle: 'Een schilderachtig landgoed midden in de Zweedse natuur, omgeven door bos en meren.',
    venue_desc_1: 'Vintermossen is een unieke locatie bij Kopparberg, in de Bergslage-regio van Zweden. Omgeven door dennenbossen en rustige meren biedt het de perfecte setting voor een intieme en onvergetelijke bruiloft.',
    venue_desc_2: 'De locatie is uitsluitend voor ons gereserveerd — jullie verblijven samen met ons op dit prachtige landgoed voor een heel weekend vol samenzijn.',
    venue_photo1_caption: 'Het landgoed',
    venue_photo2_caption: 'Het bos & de natuur',
    venue_map_hint: 'Klik om de locatie op de kaart te bekijken',
    venue_map_btn: 'Toon op kaart',
    venue_map_loading: 'Kaart laden…',

    // Travel section
    travel_tag: 'Hoe kom je er',
    travel_title: 'Reizen naar Zweden',
    travel_subtitle: 'Vanuit Nederland vlieg je naar Stockholm Arlanda. Daarna is het ± 2,5 uur rijden door de prachtige Bergslage-regio naar Kopparberg.',
    travel_flight_title: 'Vliegen vanuit Nederland',
    travel_flight_text: 'Vlieg van <strong>Schiphol (AMS)</strong> of <strong>Eindhoven (EIN)</strong> naar <strong>Stockholm Arlanda (ARN)</strong>. Vluchttijd circa 2,5 uur. Boek vroeg voor de beste prijzen!',
    travel_flight_tip: 'KLM, Transavia en SAS vliegen rechtstreeks op ARN vanuit Schiphol.',
    travel_route_title: 'Route van Arlanda naar Vintermossen',
    travel_route_duration: '± 2,5 uur per auto',
    travel_step1_label: 'Stockholm Arlanda (ARN)',
    travel_step1_desc: 'Auto huren bij de luchthaven — ruime keuze aan huurautobedrijven aanwezig',
    travel_step2_label: 'E4 richting Stockholm → E18 west',
    travel_step2_desc: 'Rij de E4 zuidwaarts en neem bij Stockholm de E18 richting Västerås',
    travel_step3_label: 'Route 68 richting Kopparberg',
    travel_step3_desc: 'Neem bij Västerås route 68 noordwaarts via Norberg naar Kopparberg',
    travel_step4_label: 'Vintermossen',
    travel_step4_desc: 'Volg lokale wegen vanuit Kopparberg naar Vintermossen (Ljusnarsberg)',
    travel_tips_title: 'Praktische tips',
    tip1_text: 'Huur samen een auto met andere gasten om de kosten te delen.',
    tip2_text: 'De Arlanda Express trein brengt je in 20 min naar Stockholm Centraal, maar voor Vintermossen is een auto het handigst.',
    tip3_text: 'In Zweden rijd je rechts. Snelheidslimieten: 110 km/u op de snelweg, 70 of 50 km/u buiten de bebouwde kom.',
    tip4_text: 'Download offline kaarten van de regio via Google Maps of Maps.me voor het geval er geen bereik is.',
    tip5_text: 'Neem Zweedse kronen mee voor lokale winkels; de meeste plekken accepteren ook kaart.',

    // Practical section
    practical_tag: 'Wat je moet weten',
    practical_title: 'Praktische info',
    practical_subtitle: 'Alles wat je nodig hebt voor een zorgeloos weekend.',
    dresscode_title: 'Dresscode',
    dresscode_content: 'Smart casual — denk aan lichte zomerse outfits in <strong>sage groen, wit of crème</strong>. De ceremonie is buiten op gras, dus comfortabele schoenen worden aangeraden. Vermijd witte jurken (dat is voor de bruid!).',
    weather_title: 'Weer in juli',
    weather_content: 'De Bergslage-regio kent in juli aangenaam zomerweer: <strong>18 – 24°C</strong> overdag. De avonden kunnen frisser zijn. Neem een lichte jas of vest mee. Kans op korte zomerse buien — een dunne regenjas is handig.',
    accom_title: 'Verblijf',
    accom_content: 'Details over accommodatie op het landgoed en in de omgeving volgen binnenkort. Houd je e-mail in de gaten voor meer informatie.',

    // Contact section
    contact_tag: 'Vragen?',
    contact_title: 'Neem contact op',
    contact_subtitle: 'Heb je vragen over de bruiloft, de locatie of de reis? Stuur ons gerust een berichtje.',
    contact_email_label: 'Stuur een e-mail',
    contact_footer: 'Aina & Daan · 4 juli 2026 · Vintermossen, Zweden',
  },

  en: {
    // Nav
    nav_programme: 'Programme',
    nav_venue: 'Venue',
    nav_travel: 'Getting There',
    nav_practical: 'Practical',
    nav_contact: 'Contact',

    // Hero
    hero_eyebrow: 'You are invited',
    hero_date_location: 'July 4, 2026 · Vintermossen, Sweden',
    hero_cta: 'View programme',
    countdown_days: 'Days',
    countdown_hours: 'Hours',
    countdown_minutes: 'Minutes',
    countdown_seconds: 'Seconds',
    countdown_today: 'Today is the day! Congratulations Aina & Daan! 🎉',
    countdown_past: 'What an unforgettable day it was!',

    // Programme section
    programme_tag: 'The celebration weekend',
    programme_title: 'Programme',
    programme_subtitle: 'Two days of love, laughter and memories in the Swedish forest.',
    friday_tag: 'Friday, July 3',
    saturday_tag: 'Saturday, July 4',
    ladies_night_title: "Ladies'\nBachelorette",
    ladies_night_time: '19:00',
    ladies_night_desc: 'A fun evening to celebrate the bride. Details to follow.',
    mens_night_title: "Men's\nBachelor Night",
    mens_night_time: '19:00',
    mens_night_desc: "A night for the men — sending off the groom in style. Details to follow.",
    pre_events_time: '19:00',
    ceremony_time: '14:00',
    ceremony_event: 'Ceremony',
    ceremony_desc: 'The wedding ceremony outdoors at Vintermossen.',
    reception_time: '15:30',
    reception_event: 'Reception',
    reception_desc: 'Toast to the newlyweds with drinks and canapés.',
    dinner_time: '18:00',
    dinner_event: 'Dinner',
    dinner_desc: 'A shared dinner with seasonal dishes.',
    party_time: '20:30',
    party_event: 'Party',
    party_desc: "Dancing and celebrating into the night — in Sweden in July it stays light until midnight!",

    // Venue section
    venue_tag: 'The venue',
    venue_title: 'Vintermossen',
    venue_subtitle: 'A picturesque estate in the heart of the Swedish countryside, surrounded by forest and lakes.',
    venue_desc_1: 'Vintermossen is a unique venue near Kopparberg, in the Bergslagen region of Sweden. Surrounded by pine forests and peaceful lakes, it offers the perfect setting for an intimate and unforgettable wedding.',
    venue_desc_2: 'The venue is exclusively reserved for us — you will be staying together with us on this beautiful estate for a whole weekend of togetherness.',
    venue_photo1_caption: 'The Estate',
    venue_photo2_caption: 'Forest & Nature',
    venue_map_hint: 'Click to view the location on the map',
    venue_map_btn: 'Show on map',
    venue_map_loading: 'Loading map…',

    // Travel section
    travel_tag: 'Getting there',
    travel_title: 'Travelling to Sweden',
    travel_subtitle: 'From the Netherlands, fly to Stockholm Arlanda. Then it\'s a ± 2.5 hour drive through the beautiful Bergslagen region to Kopparberg.',
    travel_flight_title: 'Flying from the Netherlands',
    travel_flight_text: 'Fly from <strong>Amsterdam Schiphol (AMS)</strong> or <strong>Eindhoven (EIN)</strong> to <strong>Stockholm Arlanda (ARN)</strong>. Flight time approx. 2.5 hours. Book early for the best prices!',
    travel_flight_tip: 'KLM, Transavia and SAS fly direct to ARN from Schiphol.',
    travel_route_title: 'Route from Arlanda to Vintermossen',
    travel_route_duration: '± 2.5 hours by car',
    travel_step1_label: 'Stockholm Arlanda (ARN)',
    travel_step1_desc: 'Rent a car at the airport — many rental companies available',
    travel_step2_label: 'E4 south → E18 west',
    travel_step2_desc: 'Drive south on the E4, then take the E18 westbound towards Västerås',
    travel_step3_label: 'Route 68 to Kopparberg',
    travel_step3_desc: 'At Västerås take route 68 northwards via Norberg to Kopparberg',
    travel_step4_label: 'Vintermossen',
    travel_step4_desc: 'Follow local roads from Kopparberg to Vintermossen (Ljusnarsberg)',
    travel_tips_title: 'Practical tips',
    tip1_text: 'Share a rental car with other guests to split the costs.',
    tip2_text: 'The Arlanda Express train reaches Stockholm Central in 20 min, but for Vintermossen a car is most convenient.',
    tip3_text: 'In Sweden you drive on the right. Speed limits: 110 km/h on motorways, 70 or 50 km/h on other roads.',
    tip4_text: 'Download offline maps of the region via Google Maps or Maps.me in case of poor signal.',
    tip5_text: 'Bring some Swedish krona for local shops; most places also accept cards.',

    // Practical section
    practical_tag: 'Good to know',
    practical_title: 'Practical info',
    practical_subtitle: 'Everything you need for a carefree weekend.',
    dresscode_title: 'Dress code',
    dresscode_content: 'Smart casual — think light summer outfits in <strong>sage green, white or cream</strong>. The ceremony is outdoors on grass, so comfortable shoes are recommended. Please avoid white dresses (that\'s for the bride!).',
    weather_title: 'July weather',
    weather_content: 'The Bergslagen region enjoys pleasant summer weather in July: <strong>18 – 24°C</strong> during the day. Evenings can be cooler. Pack a light jacket or cardigan. Short summer showers are possible — a light raincoat is handy.',
    accom_title: 'Accommodation',
    accom_content: 'Details about accommodation on the estate and in the surrounding area will follow soon. Keep an eye on your email for more information.',

    // Contact section
    contact_tag: 'Questions?',
    contact_title: 'Get in touch',
    contact_subtitle: 'Have questions about the wedding, venue or travel? Feel free to send us a message.',
    contact_email_label: 'Send an email',
    contact_footer: 'Aina & Daan · July 4, 2026 · Vintermossen, Sweden',
  },

  sv: {
    // Nav
    nav_programme: 'Program',
    nav_venue: 'Plats',
    nav_travel: 'Ta sig dit',
    nav_practical: 'Praktiskt',
    nav_contact: 'Kontakt',

    // Hero
    hero_eyebrow: 'Ni är inbjudna',
    hero_date_location: '4 juli 2026 · Vintermossen, Sverige',
    hero_cta: 'Se programmet',
    countdown_days: 'Dagar',
    countdown_hours: 'Timmar',
    countdown_minutes: 'Minuter',
    countdown_seconds: 'Sekunder',
    countdown_today: 'Det är idag! Grattis Aina & Daan! 🎉',
    countdown_past: 'Vilken oförglömlig dag det var!',

    // Programme section
    programme_tag: 'Festhelgen',
    programme_title: 'Program',
    programme_subtitle: 'Två dagar fyllda med kärlek, skratt och minnen i den svenska skogen.',
    friday_tag: 'Fredag 3 juli',
    saturday_tag: 'Lördag 4 juli',
    ladies_night_title: 'Möhippa\nDamerna',
    ladies_night_time: '19:00',
    ladies_night_desc: 'En mysig kväll för att fira bruden. Mer info kommer.',
    mens_night_title: 'Svensexa\nHerrarna',
    mens_night_time: '19:00',
    mens_night_desc: 'En kväll för herrarna — skicka iväg brudgummen med stil. Mer info kommer.',
    pre_events_time: '19:00',
    ceremony_time: '14:00',
    ceremony_event: 'Vigsel',
    ceremony_desc: 'Bröllopsceremonin utomhus vid Vintermossen.',
    reception_time: '15:30',
    reception_event: 'Mottagning',
    reception_desc: 'Skåla för det nygifta paret med drinkar och tilltugg.',
    dinner_time: '18:00',
    dinner_event: 'Middag',
    dinner_desc: 'Gemensam middag med säsongens rätter.',
    party_time: '20:30',
    party_event: 'Fest',
    party_desc: 'Dans och firande hela natten — i Sverige i juli är det ljust ända till midnatt!',

    // Venue section
    venue_tag: 'Platsen',
    venue_title: 'Vintermossen',
    venue_subtitle: 'En pittoresk gård mitt i den svenska naturen, omgiven av skog och sjöar.',
    venue_desc_1: 'Vintermossen är en unik plats nära Kopparberg, i Bergslageregionen i Sverige. Omgiven av barrskog och lugna sjöar erbjuder den den perfekta miljön för ett intimt och oförglömligt bröllop.',
    venue_desc_2: 'Anläggningen är exklusivt reserverad för oss — ni bor tillsammans med oss på denna vackra gård under en hel helg av gemenskap.',
    venue_photo1_caption: 'Gården',
    venue_photo2_caption: 'Skog & Natur',
    venue_map_hint: 'Klicka för att se platsen på kartan',
    venue_map_btn: 'Visa på karta',
    venue_map_loading: 'Laddar karta…',

    // Travel section
    travel_tag: 'Ta sig dit',
    travel_title: 'Resa till Sverige',
    travel_subtitle: 'Från Nederländerna flyger du till Stockholm Arlanda. Sedan är det ± 2,5 timmar med bil genom den vackra Bergslageregionen till Kopparberg.',
    travel_flight_title: 'Flyg från Nederländerna',
    travel_flight_text: 'Flyg från <strong>Amsterdam Schiphol (AMS)</strong> eller <strong>Eindhoven (EIN)</strong> till <strong>Stockholm Arlanda (ARN)</strong>. Flygtid ca 2,5 timmar. Boka tidigt för bästa priser!',
    travel_flight_tip: 'KLM, Transavia och SAS flyger direkt till ARN från Schiphol.',
    travel_route_title: 'Väg från Arlanda till Vintermossen',
    travel_route_duration: '± 2,5 timmar med bil',
    travel_step1_label: 'Stockholm Arlanda (ARN)',
    travel_step1_desc: 'Hyr bil på flygplatsen — stort urval av biluthyrningsföretag',
    travel_step2_label: 'E4 söderut → E18 västerut',
    travel_step2_desc: 'Kör söderut på E4 och ta sedan E18 västerut mot Västerås',
    travel_step3_label: 'Väg 68 mot Kopparberg',
    travel_step3_desc: 'Vid Västerås tar du väg 68 norrut via Norberg till Kopparberg',
    travel_step4_label: 'Vintermossen',
    travel_step4_desc: 'Följ lokala vägar från Kopparberg till Vintermossen (Ljusnarsberg)',
    travel_tips_title: 'Praktiska tips',
    tip1_text: 'Dela hyrbil med andra gäster för att dela på kostnaderna.',
    tip2_text: 'Arlanda Express tar dig till Stockholm Central på 20 min, men för Vintermossen är bil mest praktiskt.',
    tip3_text: 'I Sverige kör man på höger sida. Hastighetsgränser: 110 km/h på motorväg, 70 eller 50 km/h på andra vägar.',
    tip4_text: 'Ladda ner offlinekartor över regionen via Google Maps eller Maps.me om täckningen är dålig.',
    tip5_text: 'Ta med svenska kronor till lokala affärer; de flesta ställen tar också kort.',

    // Practical section
    practical_tag: 'Bra att veta',
    practical_title: 'Praktisk info',
    practical_subtitle: 'Allt du behöver för en sorglös helg.',
    dresscode_title: 'Klädkod',
    dresscode_content: 'Smart casual — tänk lätta sommaroutfits i <strong>salviagrön, vit eller kräm</strong>. Ceremonin är utomhus på gräs, så bekväma skor rekommenderas. Undvik vita klänningar (det är för bruden!).',
    weather_title: 'Juliväder',
    weather_content: 'Bergslageregionen har behagligt sommarväder i juli: <strong>18 – 24°C</strong> på dagen. Kvällarna kan vara svalare. Ta med en lätt jacka eller kofta. Korta sommarskurar är möjliga — en lätt regnkappa är bra att ha.',
    accom_title: 'Boende',
    accom_content: 'Information om boende på gården och i närheten kommer snart. Håll utkik i din e-post för mer information.',

    // Contact section
    contact_tag: 'Frågor?',
    contact_title: 'Kontakta oss',
    contact_subtitle: 'Har du frågor om bröllopet, platsen eller resan? Skicka gärna ett meddelande.',
    contact_email_label: 'Skicka ett e-postmeddelande',
    contact_footer: 'Aina & Daan · 4 juli 2026 · Vintermossen, Sverige',
  }
};

/* ============================================================
   LANGUAGE SYSTEM
   ============================================================ */
const SUPPORTED_LANGS = ['nl', 'en', 'sv'];
const DEFAULT_LANG = 'nl';
let currentLang = DEFAULT_LANG;

function detectLang() {
  // 1. URL param
  const urlParam = new URLSearchParams(window.location.search).get('lang');
  if (urlParam && SUPPORTED_LANGS.includes(urlParam)) return urlParam;

  // 2. localStorage
  const stored = localStorage.getItem('wedding-lang');
  if (stored && SUPPORTED_LANGS.includes(stored)) return stored;

  // 3. Browser language
  const browserLangs = navigator.languages || [navigator.language];
  for (const lang of browserLangs) {
    const code = lang.split('-')[0].toLowerCase();
    if (SUPPORTED_LANGS.includes(code)) return code;
  }

  return DEFAULT_LANG;
}

function applyLang(lang) {
  if (!SUPPORTED_LANGS.includes(lang)) lang = DEFAULT_LANG;
  currentLang = lang;

  // Update html lang attribute
  document.documentElement.setAttribute('lang', lang);
  document.documentElement.setAttribute('data-lang', lang);

  const t = TRANSLATIONS[lang];

  // Update all data-i18n elements
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (t[key] !== undefined) {
      // Some content has HTML (like <strong>)
      if (el.hasAttribute('data-i18n-html')) {
        el.innerHTML = t[key];
      } else {
        el.textContent = t[key];
      }
    }
  });

  // Mark active lang button
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
  });

  // Save preference
  localStorage.setItem('wedding-lang', lang);
}

/* ============================================================
   COUNTDOWN TIMER
   ============================================================ */
const WEDDING_DATE = new Date('2026-07-04T14:00:00+02:00'); // CEST

function pad(n) {
  return String(Math.floor(n)).padStart(2, '0');
}

function tickCountdown() {
  const now = new Date();
  const diff = WEDDING_DATE - now;
  const t = TRANSLATIONS[currentLang];

  const countdownEl = document.getElementById('countdown');
  const messageEl = document.getElementById('countdown-message');
  if (!countdownEl) return;

  if (diff <= 0) {
    countdownEl.style.display = 'none';
    if (messageEl) {
      const isPast = diff < -86400000; // more than 1 day past
      messageEl.textContent = isPast ? t.countdown_past : t.countdown_today;
      messageEl.style.display = '';
    }
    return;
  }

  if (messageEl) messageEl.style.display = 'none';
  countdownEl.style.display = '';

  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);

  const nums = countdownEl.querySelectorAll('.countdown-unit__num');
  if (nums[0]) nums[0].textContent = pad(days);
  if (nums[1]) nums[1].textContent = pad(hours);
  if (nums[2]) nums[2].textContent = pad(minutes);
  if (nums[3]) nums[3].textContent = pad(seconds);
}

/* ============================================================
   GOOGLE MAPS (click-to-load)
   ============================================================ */
// Vintermossen, Ljusnarsberg, Örebro County
const MAP_LAT = 59.7833;
const MAP_LNG = 14.9333;

function initMap() {
  const container = document.getElementById('map-container');
  if (!container) return;

  const btn = container.querySelector('.map-btn');
  if (!btn) return;

  btn.addEventListener('click', () => {
    const t = TRANSLATIONS[currentLang];
    btn.disabled = true;
    btn.textContent = t.venue_map_loading;

    const iframe = document.createElement('iframe');
    iframe.className = 'map-iframe';
    iframe.loading = 'lazy';
    iframe.allowFullscreen = true;
    iframe.referrerPolicy = 'no-referrer-when-downgrade';
    iframe.src = `https://maps.google.com/maps?q=${MAP_LAT},${MAP_LNG}&z=13&output=embed`;
    iframe.title = 'Vintermossen locatie';

    const placeholder = container.querySelector('.map-placeholder');
    if (placeholder) {
      container.replaceChild(iframe, placeholder);
    } else {
      container.appendChild(iframe);
    }
  });
}

/* ============================================================
   NAVIGATION
   ============================================================ */
function initNav() {
  const nav = document.querySelector('.nav');
  const hamburger = document.getElementById('nav-hamburger');
  const overlay = document.getElementById('nav-overlay');
  const overlayLinks = overlay ? overlay.querySelectorAll('a') : [];

  // Scroll shadow
  window.addEventListener('scroll', () => {
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });

  // Hamburger toggle
  if (hamburger && overlay) {
    hamburger.addEventListener('click', () => {
      const isOpen = overlay.classList.toggle('open');
      hamburger.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close on link click
    overlayLinks.forEach(link => {
      link.addEventListener('click', () => {
        overlay.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  // Active nav link tracking via IntersectionObserver
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav__links a[href^="#"]');

  if (sections.length && navLinks.length) {
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
          });
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });

    sections.forEach(s => sectionObserver.observe(s));
  }
}

/* ============================================================
   SCROLL ANIMATIONS (fade-up)
   ============================================================ */
function initAnimations() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const fadeEls = document.querySelectorAll('.fade-up');
  if (!fadeEls.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -60px 0px', threshold: 0.08 });

  fadeEls.forEach((el, i) => {
    // Stagger delay for sibling cards
    el.style.transitionDelay = `${(i % 4) * 80}ms`;
    observer.observe(el);
  });
}

/* ============================================================
   HERO CTA SMOOTH SCROLL
   ============================================================ */
function initCTA() {
  const cta = document.querySelector('.hero__cta');
  if (!cta) return;
  cta.addEventListener('click', () => {
    const target = document.getElementById('programma');
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  });
}

/* ============================================================
   LANG BUTTON HANDLERS
   ============================================================ */
function initLangButtons() {
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.getAttribute('data-lang');
      if (lang) applyLang(lang);
    });
  });
}

/* ============================================================
   INIT
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  const lang = detectLang();
  applyLang(lang);

  initNav();
  initCTA();
  initMap();
  initLangButtons();
  initAnimations();

  // Start countdown
  tickCountdown();
  setInterval(tickCountdown, 1000);
});
