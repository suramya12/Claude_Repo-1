/** Practical travel guide content. Facts checked October 2026; anything regulatory should be confirmed with the Department of Tourism. */

export const FEES = {
  sdfUsd: 100,
  sdfValidUntil: '31 August 2027',
  visaUsd: 40,
  sdfInr: 1200,
  sdfBdUsd: 15,
};

export type GuideSection = { id: string; title: string; items: { h: string; p: string }[] };
export const GUIDE: GuideSection[] = [
  { id: 'entry', title: 'Entry & fees', items: [
    { h: 'Visa', p: `Most visitors need a visa, applied for online before travel. It costs USD 40 per person, once per trip. Your tour operator or hotel can apply on your behalf. Indian nationals do not need a visa and receive an entry permit on arrival with a valid passport or voter ID card.` },
    { h: 'Sustainable Development Fee (SDF)', p: "USD 100 per adult per night, confirmed at that rate until 31 August 2027. Children aged 6–11 pay half and children under 6 pay nothing. Visitors from India pay INR 1,200 per night. The fee funds free healthcare and education, conservation and carbon-neutral development." },
    { h: 'Booking', p: 'You can book through a licensed Bhutanese tour operator or directly with hotels. Most first-time visitors use an operator, who handles visa, SDF, guide, driver and hotels in one booking.' },
    { h: 'Guides', p: 'International visitors need a licensed guide for travel beyond Thimphu and Paro and for all treks. Guides are trained by the government and are usually the highlight of a trip.' },
  ] },
  { id: 'getting-there', title: 'Getting there & around', items: [
    { h: 'By air', p: 'Paro is the only international airport. Drukair and Bhutan Airlines fly from cities including Delhi, Kolkata, Bagdogra, Guwahati, Kathmandu, Dhaka, Bangkok and Singapore. Flights are small and fill early in spring and autumn.' },
    { h: 'By land', p: 'Overland entry from India is through Phuentsholing (West Bengal), Gelephu or Samdrup Jongkhar (Assam). Phuentsholing to Thimphu takes about six hours by road.' },
    { h: 'Domestic travel', p: 'Most travel is by private car with a driver along winding mountain roads, so distances take longer than maps suggest. Domestic flights link Paro with Bumthang, Gelephu and Yongphulla in the east.' },
  ] },
  { id: 'money', title: 'Money & connectivity', items: [
    { h: 'Currency', p: 'The ngultrum (BTN) is pegged 1:1 to the Indian rupee, and rupees are widely accepted. ATMs are found in towns; larger hotels and shops take cards. Carry cash for villages and festivals.' },
    { h: 'Phones & internet', p: 'Local SIM cards from B-Mobile and TashiCell are sold at Paro airport and in towns. Coverage is good in towns and along main roads, limited on treks.' },
    { h: 'Power', p: '230 V. Sockets are a mix of Indian (type D), European (type F) and British (type G) styles. Bring a universal adapter.' },
    { h: 'Time', p: 'Bhutan Time is UTC+6, half an hour ahead of India.' },
  ] },
  { id: 'health', title: 'Health & altitude', items: [
    { h: 'Altitude', p: 'Paro and Thimphu sit around 2,200–2,400 m, Tiger’s Nest at 3,120 m and the high passes near 4,000 m. Most visitors feel fine in the valleys. Take the first day gently, drink plenty of water and leave the Tiger’s Nest hike until you have acclimatised.' },
    { h: 'Treks', p: 'High-altitude treks climb well above 4,000 m. Operators build in acclimatisation days, and you should get travel insurance that covers trekking and evacuation.' },
    { h: 'Food & water', p: 'Drink bottled or filtered water. Food is generally safe; tell your guide early if you cannot handle chilli, because Bhutanese cooking uses a lot of it.' },
  ] },
  { id: 'etiquette', title: 'Etiquette', items: [
    { h: 'Dress for dzongs and temples', p: 'Long sleeves and long trousers or skirts, no hats, no shorts. Bhutanese wear a ceremonial scarf when visiting dzongs; visitors are not expected to.' },
    { h: 'Walk clockwise', p: 'Always pass chortens, prayer wheels and temples with them on your right, and spin prayer wheels clockwise.' },
    { h: 'Photography', p: 'Photography is not allowed inside temples and shrine rooms. Ask before photographing people, especially monks. Flying a drone needs prior government permission.' },
    { h: 'Respect', p: 'Do not point your feet at altars or people, do not touch religious objects or anyone’s head, and accept offered tea or food with both hands. Pictures of the royal family are treated with respect.' },
  ] },
  { id: 'packing', title: 'What to pack', items: [
    { h: 'Layers', p: 'Valleys can be warm by day and near freezing at night, even outside winter. Bring a warm jacket, fleece and a rain shell.' },
    { h: 'For dzongs', p: 'One smart long-sleeved top and long trousers or a long skirt for temple and festival days.' },
    { h: 'For walking', p: 'Broken-in hiking shoes, a daypack, sunscreen and sunglasses. The sun is strong at altitude.' },
  ] },
];

export type Faq = { q: string; a: string };
export const FAQ: Faq[] = [
  { q: 'Is Bhutan expensive to visit?', a: 'It is more expensive than most of the region because of the USD 100 per night Sustainable Development Fee. On top of that you pay for hotels, a guide, a driver and food. The fee is the reason trails and temples are uncrowded and why tourism funds healthcare and conservation.' },
  { q: 'Can I travel independently?', a: 'You can book hotels yourself and explore Thimphu and Paro without a guide. For travel beyond those two districts, and for all treks, international visitors need a licensed guide.' },
  { q: 'How many days do I need?', a: 'Five nights covers Paro, Thimphu, Punakha and the Tiger’s Nest. Eight nights adds Haa and Phobjikha. Twelve nights or more lets you reach Bumthang and central Bhutan.' },
  { q: 'When is the best time to go?', a: 'October and November have the clearest mountain views. March to May brings rhododendrons and jacaranda. June to August is the monsoon, green and quiet. December to February is cold but clear, with cranes in Phobjikha.' },
  { q: 'Is the Tiger’s Nest hike difficult?', a: 'It climbs about 500 m to the viewpoint and more to the temple, at an altitude above 3,000 m. Most reasonably fit people manage it in 4–6 hours round trip at their own pace. Ponies can carry you part of the way up.' },
  { q: 'Do Indian travellers need a visa?', a: 'No. Indian nationals receive a free entry permit with a valid passport or voter ID card, and pay an SDF of INR 1,200 per night.' },
  { q: 'Is Bhutan safe?', a: 'Bhutan is one of the safest countries in Asia for travellers. The main risks are mountain roads and altitude, both of which your driver and guide are used to managing.' },
  { q: 'Can I visit during festivals?', a: 'Yes, and you should. Festivals are open to everyone. Hotels in Paro and Thimphu fill early around Tshechu dates, so book months ahead and confirm lunar dates with your operator.' },
  { q: 'Can I climb any mountains?', a: 'No. Mountaineering has been banned since 2003 out of respect for local belief. You can trek to the foot of peaks like Jomolhari and cross passes above 5,000 m on the Snowman Trek.' },
  { q: 'Can I use cards and ATMs?', a: 'In towns, mostly yes. Carry cash for rural areas, small shops and festival stalls. The ngultrum is tied 1:1 to the Indian rupee.' },
  { q: 'Is it suitable for children?', a: 'Yes. Children under 6 pay no SDF and ages 6–11 pay half. Shorter drives, farmhouse stays, archery and festivals work well with kids. Save long treks for older children.' },
  { q: 'What should I wear?', a: 'Comfortable layers for the day, plus long sleeves and long trousers or a long skirt to enter dzongs and temples.' },
];
