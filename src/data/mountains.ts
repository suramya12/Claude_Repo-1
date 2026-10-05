export type Peak = { id: string; name: string; alt: number; x: number; text: string; trek: string; note: string; place?: string };

export const PEAKS: Peak[] = [
  { id: 'jomolhari', name: 'Jomolhari', alt: 7326, x: 180, place: 'jomolhari', trek: 'Jomolhari Trek · about 8 days',
    text: 'The goddess mountain above Paro. Its north face rises almost 3,000 m above the yak pastures of Jangothang base camp.',
    note: 'Jomolhari was climbed in 1937 and 1970, before Bhutan closed its mountains. Today you admire it from base camp.' },
  { id: 'masang', name: 'Masang Gang', alt: 7165, x: 360, trek: 'Snowman Trek · about 25 days',
    text: 'A broad ice massif on the north-west border, seen from the remote Laya and Lunana sections of the Snowman Trek.',
    note: 'Bhutan’s high peaks have been closed to climbers since 2003.' },
  { id: 'table', name: 'Table Mountain', alt: 7100, x: 500, place: 'dochula', trek: 'Seen from Dochula',
    text: 'Zongophu Gang, named for its long flat summit ridge. Visible on clear mornings from Dochula.',
    note: 'One of the peaks you can pick out from the 108 chortens at Dochula.' },
  { id: 'gangkhar', name: 'Gangkhar Puensum', alt: 7570, x: 660, place: 'gangkhar-puensum', trek: 'Base-camp trek from Bumthang',
    text: 'The highest unclimbed mountain on Earth, and it is likely to stay that way: Bhutan closed all mountaineering in 2003.',
    note: 'Four attempts in 1985–86 failed. No one has stood on the summit.' },
  { id: 'kula', name: 'Kula Kangri', alt: 7538, x: 820, trek: 'On the Tibet border',
    text: 'A huge glaciated massif on the Bhutan–Tibet border, sacred to both sides.',
    note: 'Kula Kangri was first climbed from the Tibetan side in 1986. Bhutan’s own peaks are closed to climbers.' },
];
export const HUMAN_MARKS: [number, string][] = [[2235, 'Paro airport'], [3120, "Tiger's Nest"], [3988, 'Chele La'], [5230, 'Snowman Trek, highest point']];

export type Trek = { slug: string; name: string; days: string; maxAlt: string; grade: 'Easy' | 'Moderate' | 'Hard' | 'Extreme'; season: string; route: string; text: string; places: string[] };
export const TREKS: Trek[] = [
  { slug: 'bumdrak', name: 'Bumdrak Trek', days: '2 days', maxAlt: 'about 3,900 m', grade: 'Moderate', season: 'Mar–May, Sep–Nov', route: 'Paro → Bumdrak → Tiger’s Nest',
    text: 'An overnight walk to a camp on a ridge above the Tiger’s Nest, with sunset over the Paro valley, then a descent into the monastery from above with almost no one else on the trail.', places: ['tigers-nest'] },
  { slug: 'druk-path', name: 'Druk Path Trek', days: '5–6 days', maxAlt: 'about 4,200 m', grade: 'Moderate', season: 'Mar–May, Sep–Nov', route: 'Paro → Thimphu',
    text: 'The classic first trek in Bhutan, linking Paro and Thimphu over a ridge of high lakes and rhododendron forest, with Jomolhari on the horizon on clear days.', places: ['rinpung-dzong', 'thimphu'] },
  { slug: 'dagala', name: 'Dagala Thousand Lakes', days: '5–6 days', maxAlt: 'about 4,500 m', grade: 'Moderate', season: 'Apr–Jun, Sep–Oct', route: 'Thimphu valley loop',
    text: 'A quiet trek south of Thimphu through yak pastures to a high plateau of glacial lakes, with views stretching from Everest to Gangkhar Puensum on clear days.', places: ['thimphu'] },
  { slug: 'jomolhari', name: 'Jomolhari Trek', days: '7–9 days', maxAlt: 'about 4,900 m', grade: 'Hard', season: 'Apr–May, Sep–Nov', route: 'Paro → Jangothang → Lingshi → Thimphu',
    text: 'Yak trails to the base camp beneath Jomolhari’s north face, then over high passes to the remote dzong at Lingshi.', places: ['jomolhari'] },
  { slug: 'trans-bhutan-trail', name: 'Trans Bhutan Trail', days: 'Up to about 5 weeks, or in sections', maxAlt: 'Varies by section', grade: 'Moderate', season: 'Mar–May, Sep–Dec', route: 'Haa → Trashigang, 403 km',
    text: 'A centuries-old pilgrim and messenger route restored and reopened in 2022. It crosses nine districts and links villages, temples and dzongs from the west of the country to the east. Most people walk a section of a few days.', places: ['haa-valley', 'dochula', 'phobjikha-valley', 'trongsa-dzong', 'bumthang', 'trashigang'] },
  { slug: 'snowman', name: 'Snowman Trek', days: 'About 25 days', maxAlt: 'Passes above 5,000 m', grade: 'Extreme', season: 'Late Sep–Oct only', route: 'Paro → Laya → Lunana → Bumthang',
    text: 'About 347 km across the high north, through Laya and Lunana and over a string of passes above 5,000 m. Often called one of the hardest treks in the world. Snow closes it early and many who start do not finish.', places: ['jomolhari', 'laya', 'lunana', 'gangkhar-puensum'] },
];
