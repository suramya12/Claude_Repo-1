export type Day = { day: string; title: string; text: string; places?: string[] };
export type Itinerary = {
  slug: string; name: string; nights: number; style: string; summary: string; bestFor: string; seasons: string;
  scene: string; days: Day[];
};

export const ITINERARIES: Itinerary[] = [
  {
    slug: 'first-light', name: 'First Light', nights: 5, style: 'Culture · Easy hiking', scene: 'taktsang',
    summary: 'Paro, Thimphu and Punakha. The classic western loop for a first visit, ending with the climb to the Tiger’s Nest.',
    bestFor: 'First-time visitors with a week of holiday', seasons: 'March–May, September–December',
    days: [
      { day: 'Day 1', title: 'Land in Paro', text: 'Window-seat arrival, then Rinpung Dzong across the covered bridge and the National Museum above it.', places: ['paro-airport', 'rinpung-dzong', 'national-museum'] },
      { day: 'Day 2', title: 'Thimphu', text: 'Buddha Dordenma, the National Memorial Chorten, the takin preserve and Tashichho Dzong for the evening flag ceremony.', places: ['buddha-dordenma', 'memorial-chorten', 'takin-preserve', 'tashichho-dzong'] },
      { day: 'Day 3', title: 'Over Dochula to Punakha', text: 'The 108 chortens at sunrise, Punakha Dzong and the suspension bridge, then a walk through rice paddies to Chimi Lhakhang.', places: ['dochula', 'punakha-dzong', 'chimi-lhakhang'] },
      { day: 'Day 4', title: 'Back to Paro', text: 'Drive back over the pass, Kyichu Lhakhang in the late afternoon, and a farmhouse dinner with a hot stone bath.', places: ['kyichu-lhakhang'] },
      { day: 'Day 5', title: "Tiger's Nest", text: 'The hike everyone comes for. Start early and take your time at the top.', places: ['tigers-nest'] },
      { day: 'Day 6', title: 'Fly out', text: 'Morning flights have the clearest mountain views.', places: ['paro-airport'] },
    ],
  },
  {
    slug: 'valleys-and-cranes', name: 'Valleys & Cranes', nights: 8, style: 'Culture · Nature · Homestay', scene: 'phobjikha',
    summary: 'Adds the Haa valley, Chele La and the crane valley of Phobjikha to the classic loop.',
    bestFor: 'Travellers who want villages and nature as well as dzongs', seasons: 'October–March for cranes, April–May for flowers',
    days: [
      { day: 'Day 1', title: 'Paro', text: 'Arrive, Rinpung Dzong and the National Museum.', places: ['paro-airport', 'rinpung-dzong'] },
      { day: 'Day 2', title: 'Over Chele La to Haa', text: 'Prayer flags and Jomolhari views at 3,988 m, then a farmhouse stay in Haa.', places: ['chele-la', 'haa-valley'] },
      { day: 'Day 3', title: 'Thimphu', text: 'Markets, crafts and Buddha Dordenma at sunset.', places: ['thimphu', 'buddha-dordenma'] },
      { day: 'Day 4', title: 'Punakha', text: 'Dochula, Punakha Dzong and an afternoon rafting on the Mo Chhu.', places: ['dochula', 'punakha-dzong'] },
      { day: 'Days 5–6', title: 'Phobjikha', text: 'Gangtey Goemba, the Gangtey Nature Trail and crane-watching in the wetland.', places: ['phobjikha-valley'] },
      { day: 'Day 7', title: 'Back west', text: 'Drive back toward Paro, with Chimi Lhakhang on the way.', places: ['chimi-lhakhang'] },
      { day: 'Day 8', title: "Tiger's Nest", text: 'The finale, above the clouds.', places: ['tigers-nest'] },
      { day: 'Day 9', title: 'Fly out', text: '' },
    ],
  },
  {
    slug: 'the-heartland', name: 'The Heartland', nights: 12, style: 'Culture · Festivals · Road trip', scene: 'dochula',
    summary: 'Crosses the country to Trongsa and the sacred valleys of Bumthang, then flies back to Paro.',
    bestFor: 'A second visit, or anyone with two weeks', seasons: 'March–May, September–November',
    days: [
      { day: 'Days 1–2', title: 'Paro', text: 'Arrive and acclimatise with Rinpung Dzong, Kyichu Lhakhang and the National Museum.', places: ['rinpung-dzong', 'kyichu-lhakhang', 'national-museum'] },
      { day: 'Day 3', title: 'Thimphu', text: 'The capital and its craft schools.', places: ['thimphu', 'tashichho-dzong'] },
      { day: 'Day 4', title: 'Punakha', text: 'Dochula and the Palace of Great Happiness.', places: ['dochula', 'punakha-dzong'] },
      { day: 'Day 5', title: 'Phobjikha', text: 'The crane valley and Gangtey Goemba.', places: ['phobjikha-valley'] },
      { day: 'Day 6', title: 'Trongsa', text: 'The largest dzong in the country and the royal museum in its watchtower.', places: ['trongsa-dzong'] },
      { day: 'Days 7–9', title: 'Bumthang', text: 'Jakar Dzong, Jambay and Kurjey Lhakhang, the Burning Lake, the Tang valley and the village of Ura.', places: ['bumthang', 'jambay-lhakhang', 'burning-lake'] },
      { day: 'Day 10', title: 'Fly back west', text: 'A short domestic flight from Bumthang saves a long day on the road.' },
      { day: 'Day 11', title: "Tiger's Nest", text: 'Saved for last, when you are fully acclimatised.', places: ['tigers-nest'] },
      { day: 'Day 12', title: 'Paro', text: 'Hot stone bath and a last market visit.' },
      { day: 'Day 13', title: 'Fly out', text: '' },
    ],
  },
  {
    slug: 'druk-path-trek', name: 'Druk Path & Tiger’s Nest', nights: 9, style: 'Trekking · Camping', scene: 'range',
    summary: 'Six days walking the high ridge between Paro and Thimphu, framed by culture days at each end.',
    bestFor: 'Fit walkers who want a real trek without a month off work', seasons: 'April–May, September–November',
    days: [
      { day: 'Day 1', title: 'Paro', text: 'Arrive and rest. Gentle walk to Kyichu Lhakhang.', places: ['paro-airport', 'kyichu-lhakhang'] },
      { day: 'Day 2', title: "Tiger's Nest", text: 'An acclimatisation hike to the cliff monastery.', places: ['tigers-nest'] },
      { day: 'Days 3–7', title: 'Druk Path Trek', text: 'Five or six days of high lakes, rhododendron forest and ridge camps, crossing passes around 4,200 m and finishing above Thimphu.' },
      { day: 'Day 8', title: 'Thimphu', text: 'Hot showers, the weekend market and Buddha Dordenma.', places: ['thimphu', 'buddha-dordenma'] },
      { day: 'Day 9', title: 'Dochula & Punakha day trip', text: 'If the sky is clear, the Himalayan view you walked beneath.', places: ['dochula', 'punakha-dzong'] },
      { day: 'Day 10', title: 'Fly out', text: '' },
    ],
  },
];
