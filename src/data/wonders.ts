/** The site's own curated "seven wonders". Bhutan has no official list. */
export type Wonder = {
  slug: string; // place slug
  title: string[];
  sub: string;
  alt: string;
  card: string;
  meta: [string, string][];
  stats: [string, string, string][];
};

export const WONDERS: Wonder[] = [
  {
    slug: 'tigers-nest', title: ["Tiger's", 'Nest'], sub: 'Paro Taktsang · Paro Valley', alt: '3,120 M',
    card: 'In the 8th century Guru Rinpoche is said to have flown here on the back of a tigress and meditated in a cave in the cliff. The temples built around that cave in 1692 hang 900 metres above the valley floor.',
    meta: [['Altitude', '3,120 m'], ['Getting there', '2–3 h uphill hike'], ['Best light', 'Early morning']],
    stats: [['3,120', 'm', 'Above sea level'], ['900', 'm', 'Above the valley floor'], ['1692', '', 'Year it was built']],
  },
  {
    slug: 'punakha-dzong', title: ['Punakha', 'Dzong'], sub: 'Palace of Great Happiness · Punakha', alt: '1,200 M',
    card: 'Built in 1637 where the Pho Chhu (“father river”) meets the Mo Chhu (“mother river”). It was the capital until 1955, every king is crowned here, and in spring the walls are ringed with purple jacaranda.',
    meta: [['Founded', '1637–38'], ['Rivers', 'Pho Chhu + Mo Chhu'], ['Bloom', 'Jacaranda, late Mar–Apr']],
    stats: [['1637', '', 'Founded by Zhabdrung'], ['1955', '', 'Capital until'], ['2', '', 'Rivers at its feet']],
  },
  {
    slug: 'gangkhar-puensum', title: ['Gangkhar', 'Puensum'], sub: 'White Peak of the Three Spiritual Brothers', alt: '7,570 M',
    card: 'The highest mountain on Earth that no one has ever climbed. Four expeditions failed in the 1980s. Bhutan banned climbing above 6,000 m in 1994 and closed all mountaineering in 2003, so it will likely stay untouched.',
    meta: [['Height', '7,570 m'], ['Summits', 'None, ever'], ['See it from', 'Dochula, Bumthang ridges']],
    stats: [['7,570', 'm', 'Highest unclimbed'], ['0', '', 'People on top'], ['2003', '', 'All climbing banned']],
  },
  {
    slug: 'dochula', title: ['Dochula', 'Pass'], sub: '108 Druk Wangyal Chortens · Thimphu–Punakha road', alt: '3,100 M',
    card: 'On the road from Thimphu to Punakha, 108 white chortens circle a hilltop, completed in 2004 for the Queen Mother. On clear winter mornings the entire Himalayan range lines the northern horizon.',
    meta: [['Altitude', '3,100 m'], ['Clearest', 'October–February'], ['Festival', 'Druk Wangyal, 13 Dec']],
    stats: [['108', '', 'Memorial chortens'], ['3,100', 'm', 'Pass altitude'], ['13', 'Dec', 'Open-air festival']],
  },
  {
    slug: 'buddha-dordenma', title: ['Buddha', 'Dordenma'], sub: 'Kuenselphodrang · above Thimphu', alt: 'THIMPHU VALLEY',
    card: 'A 54-metre bronze Buddha, gilded in gold, sits on the ridge above the capital. Inside are 125,000 smaller Buddhas. Come at sunset when the statue catches the last light and Thimphu switches on below.',
    meta: [['Height', '54 m'], ['Completed', '2015'], ['Best time', 'Sunset']],
    stats: [['54', 'm', 'Gilded bronze'], ['125,000', '', 'Buddhas inside'], ['2015', '', 'Completed']],
  },
  {
    slug: 'phobjikha-valley', title: ['Phobjikha', 'Valley'], sub: 'Gangtey · Wangdue Phodrang', alt: '3,000 M',
    card: 'A wide glacial valley where endangered black-necked cranes arrive from Tibet each autumn. Locals say they circle Gangtey Goemba three times on arrival. Power lines here are buried so the birds can fly safely.',
    meta: [['Crane season', 'Late Oct–Feb'], ['Festival', '11 November'], ['Monastery', 'Gangtey, 1613']],
    stats: [['3×', '', 'Cranes circle the temple'], ['11', 'Nov', 'Crane Festival'], ['0', '', 'Overhead power lines']],
  },
  {
    slug: 'jomolhari', title: ['Jomolhari'], sub: 'Mountain of the Goddess · Paro–Tibet border', alt: '7,326 M',
    card: 'The sacred home of the goddess Jomo and the source of the Paro river. The Jomolhari trek follows yak trails for about a week to the base camp at Jangothang, where the north face fills the sky.',
    meta: [['Height', '7,326 m'], ['Base camp', 'Jangothang, 4,080 m'], ['Trek', 'About 8 days']],
    stats: [['7,326', 'm', 'Summit'], ['4,080', 'm', 'Base camp'], ['~8', 'days', 'Round-trip trek']],
  },
];

export const wonderIndex = (slug: string) => WONDERS.findIndex((w) => w.slug === slug);
