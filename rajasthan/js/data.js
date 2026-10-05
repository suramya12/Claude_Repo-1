/* All country-specific content for the panorama. Swap this file (plus geo.js and photos.js) to change country.
   Facts were checked on 5 October 2026 against the sources listed in RJ.sources. Fees and dates change:
   anything time-sensitive carries "confirm before booking". */
(function () {
  'use strict';
  const CHECKED = '5 Oct 2026';

  const meta = {
    name: 'Rajasthan',
    native: 'राजस्थान',
    nickname: 'The Land of Kings',
    tagline: 'Padharo Mhare Des: welcome to my land',
    checked: CHECKED,
    // Geographic centre of the state, computed from the Natural Earth outline.
    viewer: { lat: 26.587, lon: 73.835, label: 'The geographic centre of Rajasthan, about 90 km north-east of Jodhpur' },
    tz: 5.5, tzName: 'IST',
    geoKey: 'rajasthan',
    savedNode: 'saved',
    soundName: 'desert wind, a tanpura drone and a morchang',
    searchSuggest: ['amber-fort', 'sheesh-mahal', 'jaisalmer-fort', 'ranthambore', 'lake-pichola', 'seasons', 'plan', 'phrasebook'],
  };

  const panorama = {
    eyebrow: 'You are standing at the centre of Rajasthan · 26.59° N 73.84° E',
    startYaw: 77,
    // Terrain shaped like the real horizon from the centre: the Aravalli crest runs from the north-east round
    // through the east and south to Mount Abu (about 207°); the west and north are open Thar with dunes.
    layers: [
      { color: '#231f2a', base: 0, amp: 0.085, freq: 2.5, rough: 0.1, points: [[0, 0.1], [30, 0.16], [55, 0.32], [80, 0.55], [100, 0.78], [125, 0.58], [150, 0.68], [178, 0.84], [200, 0.96], [214, 0.7], [228, 0.22], [260, 0.08], [300, 0.1], [330, 0.07]] },
      { color: '#1a1412', base: 0.025, amp: 0.05, freq: 5, rough: 0.22, points: [[0, 0.4], [30, 0.32], [60, 0.22], [90, 0.25], [120, 0.3], [150, 0.24], [180, 0.3], [210, 0.4], [240, 0.62], [270, 0.8], [300, 0.72], [330, 0.52]] },
      { color: '#0e0b09', base: 0.075, amp: 0.035, freq: 3, rough: 0.25, points: [[0, 0.3], [90, 0.5], [180, 0.35], [270, 0.6]] },
    ],
    foreground: [[35, 0.17, 1.7], [148, 0.2, 2.3], [232, 0.16, 1.5], [305, 0.22, 2.7]],
  };

  const geo = {
    // Schematic line of the Aravalli crest for the maps (not survey data).
    aravalli: [[28.4, 77.0], [27.6, 76.5], [27.2, 76.0], [26.95, 75.8], [26.45, 74.65], [26.1, 74.3], [25.6, 73.9], [25.15, 73.6], [24.9, 73.3], [24.6, 72.75]],
    labels: [
      { at: [27.0, 69.4], text: 'Pakistan', kind: 'neigh' },
      { at: [23.4, 72.6], text: 'Gujarat', kind: 'neigh' },
      { at: [24.2, 77.3], text: 'Madhya Pradesh', kind: 'neigh' },
      { at: [29.1, 76.4], text: 'Haryana', kind: 'neigh' },
      { at: [30.3, 74.6], text: 'Punjab', kind: 'neigh' },
      { at: [27.6, 71.2], text: 'Thar Desert', kind: 'neigh' },
      { at: [25.5, 74.4], text: 'Aravalli Range (schematic)', kind: 'aravalli' },
      { at: [25.62, 76.62], text: 'Chambal', kind: 'river' },
      { at: [23.55, 74.0], text: 'Mahi', kind: 'river' },
      { at: [25.95, 75.25], text: 'Banas', kind: 'river' },
    ],
  };

  // Season by calendar month (0 = January), for the festival dial.
  const seasons = ['best', 'best', 'shoulder', 'hot', 'hot', 'hot', 'monsoon', 'monsoon', 'monsoon', 'best', 'best', 'best'];

  // Next twelve months. Lunar and Islamic dates move each year; "approx" ones are marked on the page.
  const festivals = [
    { id: 'dussehra-26', name: 'Dussehra', start: '2026-10-20', place: 'Across Rajasthan; Kota holds a large fair', text: 'The victory of Rama over Ravana. Effigies of Ravana are burned at dusk; Kota’s Dussehra fair is one of the biggest in the state.' },
    { id: 'marwar-26', name: 'Marwar Festival', start: '2026-10-25', end: '2026-10-26', place: 'Jodhpur', approx: true, go: 'mehrangarh', text: 'Two days of Marwar folk music and dance around Sharad Purnima, the full moon of Ashvin, with events at Jodhpur’s forts and lakes.' },
    { id: 'diwali-26', name: 'Diwali', start: '2026-11-06', end: '2026-11-10', place: 'Across Rajasthan; Jaipur’s bazaars are lit', photo: 'fest-diwali', alt: 'Shopfronts in Jaipur strung with coloured Diwali lights at night', go: 'jaipur', text: 'Five days from Dhanteras to Bhai Dooj; the main night is 8 November 2026. Jaipur’s markets compete to light their streets.' },
    { id: 'pushkar-26', name: 'Pushkar Fair', start: '2026-11-17', end: '2026-11-24', place: 'Pushkar', photo: 'pushkar-fair', alt: 'An elderly man in a turban with camels resting behind him at the Pushkar fair', go: 'pushkar', text: 'Camel and cattle trading in the first days, then races, music and a dawn bathe in the lake on Kartik Purnima, 24 November.' },
    { id: 'bundi-26', name: 'Bundi Utsav', start: '2026-11-27', end: '2026-11-29', place: 'Bundi', approx: true, photo: 'bundi', alt: 'Bundi’s Garh Palace on the hillside above the town', go: 'bundi', text: 'Bundi’s three-day cultural festival of processions, folk music and dance in the old town below the palace.' },
    { id: 'urs-26', name: 'Urs of Khwaja Moinuddin Chishti', start: '2026-12-11', end: '2026-12-19', place: 'Ajmer', approx: true, photo: 'ajmer-sharif', alt: 'Green and white gateway of the Ajmer Sharif dargah with pilgrims', go: 'ajmer-sharif', text: 'The anniversary of the saint’s death, in the month of Rajab. Dates follow the moon sighting; qawwali goes on through the nights.' },
    { id: 'abu-26', name: 'Mount Abu Winter Festival', start: '2026-12-29', end: '2026-12-31', place: 'Mount Abu', photo: 'mount-abu', alt: 'Boats on Nakki Lake at Mount Abu', go: 'mount-abu', text: 'Folk dance and music to close the year in Rajasthan’s only hill station.' },
    { id: 'camel-27', name: 'Bikaner Camel Festival', start: '2027-01-09', end: '2027-01-10', place: 'Bikaner', approx: true, photo: 'wild-camel', alt: 'A dromedary camel resting on a dune in the Thar', go: 'junagarh', text: 'Decorated camels, camel dances and races, organised by Rajasthan Tourism. Sources differ on the exact days.' },
    { id: 'kites-27', name: 'Makar Sankranti kite flying', start: '2027-01-14', place: 'Jaipur', photo: 'fest-kites', alt: 'A string of kites flying against a blue sky over Jaipur', go: 'jaipur', text: 'The sun enters Capricorn and Jaipur’s rooftops fill with kite flyers from dawn to dusk.' },
    { id: 'jlf-27', name: 'Jaipur Literature Festival', start: '2027-01-14', end: '2027-01-18', place: 'Jaipur', go: 'jaipur', text: 'The 20th edition of one of the world’s largest literary festivals, held at Hotel Clarks Amer.' },
    { id: 'desert-27', name: 'Desert Festival', start: '2027-02-18', end: '2027-02-20', place: 'Jaisalmer and the Sam dunes', approx: true, photo: 'fest-desert', alt: 'A decorated camel jumping on command at the Jaisalmer Desert Festival', go: 'sam-dunes', text: 'Turban tying, camel polo and folk music, ending on the dunes at Sam under the Magh full moon.' },
    { id: 'baneshwar-27', name: 'Baneshwar Fair', start: '2027-02-18', end: '2027-02-20', place: 'Baneshwar, Dungarpur district', approx: true, go: 'banswara', text: 'A large tribal fair at the meeting of the Som and Mahi rivers, around the Magh full moon.' },
    { id: 'holi-27', name: 'Holi', start: '2027-03-21', end: '2027-03-22', place: 'Across Rajasthan', photo: 'fest-holi', alt: 'Clouds of coloured powder as children play Holi in Pushkar', go: 'pushkar', text: 'Bonfires on the night of the 21st, colours on the 22nd. Pushkar and Jaipur draw big crowds; wear clothes you can throw away.' },
    { id: 'gangaur-27', name: 'Gangaur', start: '2027-04-08', end: '2027-04-09', place: 'Jaipur, Udaipur and across the state', photo: 'fest-gangaur', alt: 'Decorated Gangaur idols carried through a street in Kishangarh', go: 'bagore-ki-haveli', text: 'Women worship Gauri for eighteen days from the day after Holi; processions of the goddess fill the streets on the last two days.' },
    { id: 'teej-27', name: 'Teej', start: '2027-08-04', place: 'Jaipur', photo: 'fest-teej', alt: 'A decorated palanquin carried in the Teej procession in Jaipur', go: 'city-palace-jaipur', text: 'The monsoon festival of Parvati. Jaipur’s Teej procession leaves the City Palace; swings and ghewar sweets are everywhere.' },
    { id: 'dussehra-27', name: 'Dussehra', start: '2027-10-09', place: 'Across Rajasthan', text: 'Next year’s Dussehra.' },
  ];

  const phrases = [
    { deva: 'खम्मा घणी', roman: 'Khammā ghaṇī', say: 'KHUM-maa GHUH-nee', mean: 'Rajasthani greeting of respect: literally “much forgiveness”. The reply is “Ghaṇī khammā”.', lang: 'Rajasthani' },
    { deva: 'राम राम सा', roman: 'Rām Rām sā', say: 'RAAM raam saa', mean: 'An everyday hello in villages. “Sā” is an honorific that adds respect.', lang: 'Rajasthani' },
    { deva: 'पधारो म्हारे देस', roman: 'Padhāro mhāre des', say: 'puh-DHAA-ro MHAA-ray days', mean: '“Welcome to my land.” You will hear it more than say it: it is Rajasthan’s welcome.', lang: 'Rajasthani' },
    { deva: 'नमस्ते', roman: 'Namaste', say: 'nuh-MUS-tay', mean: 'Hello, in Hindi, understood everywhere. Hands together at the chest.', lang: 'Hindi' },
    { deva: 'धन्यवाद', roman: 'Dhanyavād', say: 'DHUN-yuh-vaad', mean: 'Thank you. “Shukriyā” is also common.', lang: 'Hindi' },
    { deva: 'कितने का है?', roman: 'Kitne kā hai?', say: 'KIT-nay kaa hai', mean: 'How much is it?', lang: 'Hindi' },
    { deva: 'बहुत स्वादिष्ट', roman: 'Bahut svādiṣṭ', say: 'buh-HUT swaa-DISHT', mean: 'Very tasty. Said to a cook, it goes a long way.', lang: 'Hindi' },
  ];

  // Entry fees per person in ₹, Indian / foreign visitor. Checked 5 Oct 2026; confirm before booking.
  const fees = {
    'amber-fort': { name: 'Amber Fort', in: 200, fo: 1000, note: 'Revised 1 Jan 2026; some sources still show ₹100 / ₹500.' },
    'jaipur-composite': { name: 'Jaipur composite ticket (2 days)', in: 550, fo: 1700, note: 'Amber, Hawa Mahal, Jantar Mantar, Albert Hall, Nahargarh and several more.' },
    'hawa-mahal': { name: 'Hawa Mahal', in: 100, fo: 600, composite: true },
    'jantar-mantar': { name: 'Jantar Mantar', in: 100, fo: 600, composite: true },
    'nahargarh': { name: 'Nahargarh', in: 100, fo: 600, composite: true },
    'mehrangarh': { name: 'Mehrangarh', in: 100, fo: 600, approx: true, note: 'Run by the Mehrangarh Museum Trust; audio guide extra.' },
    'city-palace-udaipur': { name: 'City Palace, Udaipur', in: 450, fo: 1200, approx: true, note: 'Sources differ (₹250–450 Indian, ₹500–1,200 foreign).' },
    'kumbhalgarh': { name: 'Kumbhalgarh (ASI)', in: 15, fo: 200, approx: true, note: 'ASI site: SAARC and BIMSTEC citizens pay the Indian rate.' },
    'chittorgarh': { name: 'Chittorgarh (ASI)', in: 15, fo: 200, approx: true, note: 'Assumed same ASI band as Kumbhalgarh; not confirmed.' },
    'keoladeo': { name: 'Keoladeo National Park', in: 75, fo: 500, approx: true, note: 'Fees were revised from 1 Apr 2026; new amounts not confirmed.' },
    'ranthambore': { name: 'Ranthambore safari, gypsy seat', in: 2500, fo: 5000, approx: true, perSafari: true, note: 'Canter seat about ₹1,600 / ₹4,200. Book on ranthambhoresafari.rajasthan.gov.in.' },
  };

  const visa = {
    india: { label: 'Indian citizen', text: 'No visa needed.', usd: 0 },
    nepalbhutan: { label: 'Citizen of Nepal or Bhutan', text: 'No visa needed to enter India.', usd: 0, saarc: true },
    saarc: { label: 'Other SAARC or BIMSTEC country (Bangladesh, Sri Lanka, Maldives, Thailand, Myanmar…)', text: 'e-Tourist Visa for most of these nationalities; fees vary by country, so check the official table. At ASI monuments you pay the Indian rate.', usd: null, saarc: true },
    evisa: { label: 'Most other countries (US, UK, EU, Canada, Australia, Japan…)', text: 'e-Tourist Visa: 30 days (double entry) US$25 from July to March or US$10 from April to June; 1 year US$40; 5 years US$80. Plus a bank charge of about 2.5–3%. Some nationalities pay a different, reciprocal amount.', usd: 25, usdLow: 10 },
    pakistan: { label: 'Pakistani citizen', text: 'Not eligible for the e-Visa. Apply through an Indian mission and check the current status first.', usd: null },
  };

  // Suggested routes. Drive times are from the research summary (approx.); stays are nights.
  const routes = [
    { id: 'r5', days: 5, title: 'Pink city and tigers', focus: ['forts', 'wildlife'], stops: [
      { at: 'Jaipur', nights: 3, see: ['amber-fort', 'city-palace-jaipur', 'hawa-mahal', 'jantar-mantar', 'nahargarh', 'chand-baori'], fees: ['jaipur-composite'] },
      { at: 'Ranthambore', nights: 2, see: ['ranthambore'], fees: ['ranthambore', 'ranthambore'], leg: 'Jaipur → Sawai Madhopur: about 3–4 h by road or train (approx.)' },
    ] },
    { id: 'r7', days: 7, title: 'Forts and a holy lake', focus: ['forts', 'temples', 'lakes'], stops: [
      { at: 'Jaipur', nights: 2, see: ['amber-fort', 'hawa-mahal', 'jantar-mantar', 'city-palace-jaipur'], fees: ['jaipur-composite'] },
      { at: 'Pushkar', nights: 1, see: ['pushkar', 'ajmer-sharif'], fees: [], leg: 'Jaipur → Pushkar: about 3 h, 150 km' },
      { at: 'Jodhpur', nights: 2, see: ['mehrangarh', 'jaswant-thada', 'blue-city'], fees: ['mehrangarh'], leg: 'Pushkar → Jodhpur: about 4 h (approx.)' },
      { at: 'Udaipur', nights: 2, see: ['ranakpur', 'city-palace-udaipur', 'lake-pichola', 'bagore-ki-haveli'], fees: ['city-palace-udaipur'], leg: 'Jodhpur → Udaipur: about 5 h, 250 km; stop at Ranakpur on the way' },
    ] },
    { id: 'r10', days: 10, title: 'Desert and lakes', focus: ['forts', 'desert', 'lakes'], stops: [
      { at: 'Jaipur', nights: 2, see: ['amber-fort', 'hawa-mahal', 'city-palace-jaipur', 'nahargarh'], fees: ['jaipur-composite'] },
      { at: 'Jodhpur', nights: 2, see: ['mehrangarh', 'blue-city', 'umaid-bhawan'], fees: ['mehrangarh'], leg: 'Jaipur → Jodhpur: about 6–7 h, 340 km' },
      { at: 'Jaisalmer', nights: 3, see: ['jaisalmer-fort', 'patwon-ki-haveli', 'gadisar', 'sam-dunes', 'kuldhara'], fees: [], leg: 'Jodhpur → Jaisalmer: about 5–6 h, 285 km' },
      { at: 'Udaipur', nights: 3, see: ['city-palace-udaipur', 'lake-pichola', 'kumbhalgarh', 'ranakpur'], fees: ['city-palace-udaipur', 'kumbhalgarh'], leg: 'Jaisalmer → Udaipur: about 8–9 h, 490 km (or fly via Jodhpur)' },
    ] },
    { id: 'r14', days: 14, title: 'The grand loop', focus: ['forts', 'desert', 'lakes', 'wildlife', 'crafts'], stops: [
      { at: 'Jaipur', nights: 2, see: ['amber-fort', 'city-palace-jaipur', 'hawa-mahal', 'jantar-mantar'], fees: ['jaipur-composite'] },
      { at: 'Shekhawati', nights: 1, see: ['mandawa', 'nawalgarh'], fees: [], leg: 'Jaipur → Mandawa: about 170 km (approx.)' },
      { at: 'Bikaner', nights: 1, see: ['junagarh', 'karni-mata'], fees: [], leg: 'Mandawa → Bikaner: about 190 km (approx.)' },
      { at: 'Jaisalmer', nights: 2, see: ['jaisalmer-fort', 'patwon-ki-haveli', 'sam-dunes'], fees: [], leg: 'Bikaner → Jaisalmer: about 330 km (approx.)' },
      { at: 'Jodhpur', nights: 2, see: ['mehrangarh', 'jaswant-thada', 'osian'], fees: ['mehrangarh'], leg: 'Jaisalmer → Jodhpur: about 5–6 h' },
      { at: 'Kumbhalgarh', nights: 1, see: ['ranakpur', 'kumbhalgarh'], fees: ['kumbhalgarh'], leg: 'Jodhpur → Ranakpur: about 170 km (approx.)' },
      { at: 'Udaipur', nights: 2, see: ['city-palace-udaipur', 'lake-pichola', 'bagore-ki-haveli'], fees: ['city-palace-udaipur'], leg: 'Kumbhalgarh → Udaipur: about 85 km (approx.)' },
      { at: 'Bundi', nights: 1, see: ['chittorgarh', 'bundi'], fees: ['chittorgarh'], leg: 'Udaipur → Chittorgarh → Bundi: about 270 km (approx.)' },
      { at: 'Ranthambore', nights: 2, see: ['ranthambore'], fees: ['ranthambore', 'ranthambore'], leg: 'Bundi → Sawai Madhopur: about 130 km (approx.)' },
    ] },
  ];
  const interestStops = {
    wildlife: ['keoladeo', 'tal-chhapar', 'jawai', 'desert-np'],
    desert: ['sam-dunes', 'desert-np', 'kuldhara'],
    temples: ['ranakpur', 'mount-abu', 'pushkar', 'osian'],
    crafts: ['nawalgarh', 'kishangarh', 'culture'],
    lakes: ['lake-pichola', 'pushkar', 'mount-abu', 'gadisar'],
    forts: ['chittorgarh', 'kumbhalgarh', 'gagron', 'bhangarh'],
  };

  const kbyg = [
    { h: 'Visas and entry', p: ['Most visitors apply online for the Indian e-Tourist Visa on the official portal, indianvisaonline.gov.in. Choose 30 days, 1 year or 5 years; fees depend on nationality and season (see the planner).', 'Use only the official portal: many look-alike sites charge extra.'], src: ['evisa', 'embassy-us'] },
    { h: 'Safety advice', p: ['The UK FCDO and the US State Department both advise against travel within 10 km of the India–Pakistan border, which runs along the west of Jaisalmer, Barmer, Bikaner and Sri Ganganagar districts. Jaisalmer town, the Sam dunes and the usual tourist routes are well inside that line.', 'Both rate the rest of Rajasthan at their standard level of caution for India. Check their current pages before you go: advice changes quickly.'], src: ['fcdo', 'usstate'] },
    { h: 'Money', p: ['The currency is the Indian rupee (₹). Cards work in hotels and larger shops; carry cash for markets, villages and tips. ATMs are common in cities.', 'UPI, India’s phone-payment system, is everywhere. A prepaid “UPI One World” wallet for foreign visitors was piloted in 2026; check whether it is open to you before relying on it.'], src: ['upi'] },
    { h: 'SIM cards and data', p: ['A local SIM needs your passport, visa and a local address (a hotel booking works), and a photo taken in store. Airtel shops are usually the easiest for visitors.', 'An eSIM bought before you fly avoids the paperwork.'], src: ['sim'] },
    { h: 'Plugs and power', p: ['Sockets are type C, D and M; supply is 230 V, 50 Hz. Type D (three round pins) is the most common.'], src: ['plugs'] },
    { h: 'Dress and temples', p: ['Cover shoulders and knees at temples and mosques; take shoes off where asked. At Ajmer Sharif, cover your head.', 'Jain temples such as Ranakpur and Dilwara do not allow leather (belts, wallets, bags). Visitors who are not Jain are admitted from about noon to 5 pm. Photography is not allowed inside the Dilwara temples.'], src: ['jain-dress'] },
    { h: 'Photos and people', p: ['Ask before photographing people, especially women and at bathing ghats. Some monuments charge a camera fee; some temples ban cameras.'], src: [] },
    { h: 'Heat and health', p: ['From April to June the desert reaches 40–45 °C and can touch 48 °C. October to March is mild by day and cool at night (around 10 °C).', 'Drink bottled or filtered water, carry a hat, and plan sightseeing for mornings and late afternoons.'], src: ['season'] },
    { h: 'Getting around', p: ['Distances are long. Typical drives: Jaipur to Udaipur 7–8 h; Jaipur to Jodhpur 6–7 h; Jodhpur to Jaisalmer 5–6 h; Udaipur to Jodhpur about 5 h; Jaipur to Pushkar about 3 h.', 'Trains and domestic flights link Jaipur, Jodhpur, Udaipur and Jaisalmer. Hiring a car with a driver is common and not expensive by international standards.'], src: ['drives'] },
    { h: 'Time and borders', p: ['India Standard Time is UTC+5:30, with no daylight saving.', 'Maps on this site use approximate boundaries from Natural Earth. They are for orientation only and imply no position on any disputed boundary.'], src: ['ne'] },
  ];

  const reasons = [
    { n: '27 m', name: 'The world’s largest stone sundial', text: ['The Samrat Yantra at Jaipur’s Jantar Mantar is 27 m tall and tells local time to about 2 seconds. It was finished in 1734.'], go: 'samrat-yantra', photo: 'samrat-yantra', x: 0.1, y: 0.2, mx: 0.12, my: 0.0 },
    { n: '36 km', name: 'A wall over the hills', text: ['Kumbhalgarh’s perimeter wall runs for about 36 km along Aravalli ridges, among the longest continuous walls in the world.'], go: 'kumbhalgarh', photo: 'kumbhalgarh', x: 0.3, y: 0.05, mx: 0.78, my: 0.1 },
    { n: '1,444', name: 'Pillars, no two alike', text: ['Ranakpur’s Jain temple stands on 1,444 carved marble pillars, laid out so you can see the shrine from almost anywhere inside.'], go: 'ranakpur', photo: 'ranakpur', x: 0.52, y: 0.18, mx: 0.3, my: 0.26 },
    { n: '1156', name: 'A fort people still live in', text: ['Families still live inside Jaisalmer Fort, founded in 1156, alongside its palace, temples and shops.'], go: 'jaisalmer-fort', photo: 'jaisalmer-fort', x: 0.75, y: 0.08, mx: 0.86, my: 0.38 },
    { n: '363', name: 'People who died for trees', text: ['In 1730 at Khejarli, 363 Bishnoi villagers were killed trying to stop the felling of their sacred khejri trees.'], go: 'khejarli', photo: 'khejarli', x: 0.92, y: 0.3, mx: 0.62, my: 0.54 },
    { n: '3,500', name: 'Steps into a well', text: ['Chand Baori, a 9th-century stepwell, drops 13 storeys down 3,500 steps to its water.'], go: 'chand-baori', photo: 'chand-baori', x: 0.62, y: 0.5, mx: 0.14, my: 0.6 },
    { n: '370+', name: 'Bird species in 29 km²', text: ['Keoladeo, a former royal duck-shoot, is now a wetland where more than 370 bird species have been recorded.'], go: 'keoladeo', photo: 'keoladeo', x: 0.35, y: 0.55, mx: 0.72, my: 0.78 },
    { n: '1,334 km²', name: 'Of tiger forest round a fort', text: ['Ranthambore Tiger Reserve covers 1,334 km² around a UNESCO-listed hill fort; its tigers are often seen in daylight.'], go: 'ranthambore', photo: 'ranthambore', x: 0.12, y: 0.62, mx: 0.24, my: 0.94 },
  ];

  const sources = [
    { id: 'evisa', t: 'Indian e-Visa portal (Government of India)', u: 'https://indianvisaonline.gov.in/evisa/tvoa.html' },
    { id: 'embassy-us', t: 'Embassy of India, Washington: reduction in e-Tourist Visa fees', u: 'https://www.indianembassyusa.gov.in/News?id=24889' },
    { id: 'evisa-fees', t: 'Country-wise e-Tourist Visa fee table (PDF)', u: 'https://indianvisaonline.gov.in/evisa/images/Etourist_fee_final.pdf' },
    { id: 'fcdo', t: 'UK FCDO: India travel advice, regional risks', u: 'https://www.gov.uk/foreign-travel-advice/india/regional-risks' },
    { id: 'usstate', t: 'US Embassy in India: travel advisory', u: 'https://in.usembassy.gov/travel-advisory-india-level-2-exercise-increased-caution-2/' },
    { id: 'fees-2026', t: 'Pink City Post: Jaipur monument fees from 1 January 2026', u: 'https://www.pinkcitypost.com/visiting-jaipurs-heritage-sites-to-cost-more-from-jan-1-what-tourists-should-know/' },
    { id: 'fees-composite', t: 'Jaipur monument ticket prices 2026 (Rajasthan Tour Trip)', u: 'https://www.rajasthantourtrip.com/blog/jaipur-monuments-timing-entry-fee.html' },
    { id: 'keoladeo-fee', t: 'ETV Bharat: Keoladeo fees revised from 1 April 2026', u: 'https://www.etvbharat.com/hi/state/increase-in-entry-and-boating-fees-at-keoladeo-national-park-effective-april-1-2026-rajasthan-news-rjs26040203984' },
    { id: 'ranthambore', t: 'Ranthambore safari booking (Rajasthan Forest Department)', u: 'https://ranthambhoresafari.rajasthan.gov.in/' },
    { id: 'ranthambore-wwf', t: 'WWF India: Ranthambore Tiger Reserve (1,334 km², expanded in 1992)', u: 'https://www.wwfindia.org/about_wwf/critical_regions/national_parks_tiger_reserves/ranthambore_tiger_reserve/' },
    { id: 'festivals', t: 'Rajasthan Tourism: fairs and festivals 2024–2030 (PDF)', u: 'https://www.tourism.rajasthan.gov.in/content/dam/rajasthan-tourism/english/pdf/FairsandFestivals.pdf' },
    { id: 'jlf', t: 'Jaipur Literature Festival', u: 'https://www.jaipurliteraturefestival.org/' },
    { id: 'teej', t: 'Drik Panchang: Hariyali Teej 2027', u: 'https://www.drikpanchang.com/festivals/teej/hariyali-teej-date-time.html' },
    { id: 'urs', t: 'Urs Ajmer Sharif 2026 dates', u: 'https://www.ajmersharifkhwaja.com/post/urs-ajmer-sharif-2026' },
    { id: 'unesco-forts', t: 'UNESCO: Hill Forts of Rajasthan', u: 'https://whc.unesco.org/en/list/247' },
    { id: 'unesco-jm', t: 'UNESCO: The Jantar Mantar, Jaipur', u: 'https://whc.unesco.org/en/list/1338' },
    { id: 'unesco-jaipur', t: 'UNESCO: Jaipur City, Rajasthan', u: 'https://whc.unesco.org/en/list/1605' },
    { id: 'unesco-keoladeo', t: 'UNESCO: Keoladeo National Park', u: 'https://whc.unesco.org/en/list/340' },
    { id: 'gib', t: 'The Tribune: great Indian bustard population about 130', u: 'https://www.tribuneindia.com/news/india/critically-endangered-great-indian-bustard-population-stable-at-130-environment-ministry-report/' },
    { id: 'sariska', t: 'Wikipedia: Sariska Tiger Reserve', u: 'https://en.wikipedia.org/wiki/Sariska_Tiger_Reserve' },
    { id: 'rajasthan', t: 'Wikipedia: Rajasthan', u: 'https://en.wikipedia.org/wiki/Rajasthan' },
    { id: 'thar', t: 'Wikipedia: Thar Desert', u: 'https://en.wikipedia.org/wiki/Thar_Desert' },
    { id: 'khejarli', t: 'Wikipedia: Khejarli massacre', u: 'https://en.wikipedia.org/wiki/Khejarli_massacre' },
    { id: 'ramgarh', t: 'Wikipedia: Ramgarh crater', u: 'https://en.wikipedia.org/wiki/Ramgarh_crater' },
    { id: 'thikri', t: 'MeMeraki: the craft of thikri', u: 'https://www.memeraki.com/blogs/posts/the-glittering-legacy-of-thikri-art' },
    { id: 'khamma', t: 'Rajasthan Tourism on “Khamma ghani”', u: 'https://x.com/my_rajasthan/status/1268025429614563335' },
    { id: 'upi', t: 'Zee Business: UPI One World wallet for visitors (Feb 2026)', u: 'https://www.zeebiz.com/markets/currency/news-foreign-visitors-can-now-use-upi-in-india-as-npci-rolls-out-upi-one-world-wallet-at-ai-impact-summit-2026-390522' },
    { id: 'sim', t: 'India Someday: local SIM cards for foreigners', u: 'https://indiasomeday.com/en/how-to-get-a-local-sim-card-in-india-for-foreigners/' },
    { id: 'plugs', t: 'Plug types in India', u: 'https://plugtypes.com/country/india' },
    { id: 'jain-dress', t: 'Incredible India: Dilwara Jain Temples', u: 'https://www.incredibleindia.gov.in/en/rajasthan/mount-abu/dilwara-jain-temples' },
    { id: 'season', t: 'Best time to visit Rajasthan (Rajasthan Tours & Drivers)', u: 'https://www.rajasthandriver.com/travel-info/best-time-to-visit-rajasthan-climate-weather/' },
    { id: 'drives', t: 'Distances between Rajasthan cities (Rajasthan Tour Taxi)', u: 'https://www.rajasthantourtaxi.com/rajasthan/rajasthan-major-cities-distance-travel-time' },
    { id: 'ne', t: 'Natural Earth (public domain map data)', u: 'https://www.naturalearthdata.com/' },
    { id: 'commons', t: 'Wikimedia Commons (all photographs)', u: 'https://commons.wikimedia.org/' },
  ];

  window.RJ_PARTS = { meta, panorama, geo, seasons, festivals, phrases, fees, visa, routes, interestStops, kbyg, reasons, sources, CHECKED };
})();
