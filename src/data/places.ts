import type { SceneKind } from '../lib/scenes';

export type Category = 'sacred' | 'peaks' | 'wild' | 'towns';
export const CATEGORIES: Record<Category, { label: string; color: string; blurb: string }> = {
  sacred: { label: 'Dzongs & temples', color: '#e7a33e', blurb: 'Fortress-monasteries, cliff temples and the oldest shrines in the Himalaya.' },
  peaks: { label: 'Peaks & passes', color: '#e6ecf2', blurb: 'Sacred summits nobody climbs, and the high road passes that look at them.' },
  wild: { label: 'Valleys & wildlife', color: '#6fb08f', blurb: 'Crane wetlands, tiger jungle and highland villages reached on foot.' },
  towns: { label: 'Towns & gateways', color: '#8fb2c9', blurb: 'Where you land, cross the border, sleep and stock up.' },
};

export type Place = {
  slug: string;
  name: string;
  tib?: string;
  cat: Category;
  lon: number;
  lat: number;
  alt: string;
  district: string;
  region: 'West' | 'Central' | 'East' | 'North' | 'South';
  /** Painted scene: a named spec (the seven wonders) or a generic kind. */
  scene: string;
  kind?: SceneKind;
  night?: boolean;
  w?: number;
  summary: string;
  body: string[];
  highlights: string[];
  bestTime: string;
  timeNeeded: string;
  access: string;
  tip: string;
};

export const PLACES: Place[] = [
  {
    slug: 'tigers-nest', name: "Tiger's Nest", tib: 'སྤ་གྲོ་སྟག་ཚང་།', cat: 'sacred', lon: 89.3632, lat: 27.4919, alt: '3,120 m', district: 'Paro', region: 'West', scene: 'taktsang',
    summary: 'Paro Taktsang, a cluster of temples fixed to a sheer granite cliff 900 metres above the Paro valley. The image most people picture when they hear the word Bhutan.',
    body: [
      'Bhutanese tradition holds that in the 8th century Guru Rinpoche, the teacher who brought Vajrayana Buddhism to the Himalaya, flew to this cliff on the back of a tigress and meditated in a cave here to subdue a local demon. The cave is now the heart of the monastery, and the name Taktsang means “tiger’s lair”.',
      'The main temple complex was built in 1692 around that cave. A fire in 1998 destroyed much of it, and it was rebuilt with traditional methods and reconsecrated in 2005. Monks still live and practise here, which is why the inner shrines are closed to cameras and why the atmosphere inside is quiet rather than touristy.',
      'Reaching it is part of the experience. The trail climbs through blue pine and rhododendron forest, past water-driven prayer wheels, to a cafeteria with the classic postcard view. From there a final section drops down a staircase beside a waterfall and climbs back up to the temple gate.',
    ],
    highlights: ['The cave where Guru Rinpoche meditated', 'The view from the cafeteria viewpoint, halfway up', 'The waterfall and snow-lion bridge just below the gate', 'Butter-lamp offerings inside the main shrine'],
    bestTime: 'October–November and March–May for clear skies. Start early in any season.',
    timeNeeded: '4–6 hours round trip',
    access: 'Trailhead about 20 minutes’ drive from Paro town. Ponies can carry you to the cafeteria; the last stretch is on foot.',
    tip: 'Leave by 7 am to climb in shade and beat the tour groups. Leave bags and phones in the lockers at the entrance.',
  },
  {
    slug: 'rinpung-dzong', name: 'Rinpung Dzong', tib: 'རིན་སྤུངས་རྫོང་།', cat: 'sacred', lon: 89.4164, lat: 27.4287, alt: '2,280 m', district: 'Paro', region: 'West', scene: 'generic', kind: 'dzong', w: 0.5,
    summary: 'The “fortress on a heap of jewels”, guarding the Paro valley since 1646 and home of the Paro Tshechu festival.',
    body: [
      'Like every dzong, Rinpung serves two purposes at once: half of it is the district administration, the other half a monastery. It was built on the orders of Zhabdrung Ngawang Namgyal, the lama who unified Bhutan in the 17th century, on the foundations of an older temple.',
      'You enter across Nyamai Zam, a traditional covered cantilever bridge over the Paro Chhu, and climb up through the gate into courtyards lined with galleries of carved and painted wood. Inside are some of the finest wall paintings in the country, including a large cosmic mandala.',
      'Each spring, on the final morning of the Paro Tshechu, a huge appliqué thangka is unrolled across a wall of the dzong before sunrise. Seeing it is believed to cleanse the viewer of sin, and the whole valley comes out in its finest clothes to do so.',
    ],
    highlights: ['Nyamai Zam covered bridge', 'Painted galleries around the monastic courtyard', 'Thongdrel unveiling at dawn during Paro Tshechu', 'Evening light from the riverbank below'],
    bestTime: 'Year-round. Late March to early April for the festival.',
    timeNeeded: '1–2 hours',
    access: 'Walkable from Paro town.',
    tip: 'Cross the bridge late in the afternoon when the dzong walls glow, then walk up to the National Museum above it.',
  },
  {
    slug: 'national-museum', name: 'National Museum (Ta Dzong)', cat: 'sacred', lon: 89.4158, lat: 27.4319, alt: '2,350 m', district: 'Paro', region: 'West', scene: 'generic', kind: 'dzong', w: 0.3,
    summary: 'A round 17th-century watchtower above Rinpung Dzong, now the National Museum of Bhutan.',
    body: [
      'Ta Dzong was built to watch over Rinpung Dzong and the valley below. Its unusual shape, a rounded tower rather than the usual rectangle, was designed for defence.',
      'Since 1968 it has housed the National Museum. The collection covers masks used in sacred dances, thangka paintings, textiles, weapons and the natural history of a country that runs from subtropical jungle to glaciers. It is the best single place to make sense of what you will see in the rest of the trip.',
    ],
    highlights: ['Sacred dance masks', 'Thangka and textile galleries', 'View over Rinpung Dzong and the Paro valley'],
    bestTime: 'Any time. Good on your first day.',
    timeNeeded: '1–1.5 hours',
    access: 'Short drive or steep walk above Paro town.',
    tip: 'Visit before your first festival. The masks make far more sense once you know which deity is which.',
  },
  {
    slug: 'kyichu-lhakhang', name: 'Kyichu Lhakhang', tib: 'སྐྱེར་ཆུ་ལྷ་ཁང་།', cat: 'sacred', lon: 89.384, lat: 27.442, alt: '2,300 m', district: 'Paro', region: 'West', scene: 'generic', kind: 'temple',
    summary: 'One of the oldest temples in Bhutan, traditionally dated to the 7th century.',
    body: [
      'According to legend, the Tibetan king Songtsen Gampo built 108 temples in a single day to pin down a giant demoness lying across the Himalaya. Kyichu Lhakhang is said to hold down her left foot, and Jambay Lhakhang in Bumthang her left knee.',
      'The original temple is small and dark, with an orange tree in the courtyard said to bear fruit all year. A second temple was added in 1968 by Queen Ashi Kesang Choden Wangchuck. Elderly Paro residents walk around it all day spinning the prayer wheels, which is the best introduction to everyday Bhutanese faith you will get.',
    ],
    highlights: ['The 7th-century inner shrine', 'Prayer-wheel circuit with local pilgrims', 'The orange trees in the courtyard'],
    bestTime: 'Early morning, when pilgrims are doing their circuits.',
    timeNeeded: '45 minutes',
    access: 'About 10 minutes’ drive north of Paro town, on the way to the Tiger’s Nest trailhead.',
    tip: 'Walk the circuit clockwise with everyone else, and keep your hat off inside the courtyard.',
  },
  {
    slug: 'paro-airport', name: 'Paro Airport', cat: 'towns', lon: 89.4246, lat: 27.4032, alt: '2,235 m', district: 'Paro', region: 'West', scene: 'generic', kind: 'airport',
    summary: 'Bhutan’s only international airport, and one of the most dramatic approaches in commercial aviation.',
    body: [
      'Ridges around the valley rise to more than 5,000 metres, so aircraft fly along the valley and bank between hillsides before lining up with a short runway that appears only moments before touchdown. Landings are flown manually in daylight, and only a small number of specially trained pilots are certified to operate here.',
      'Drukair and Bhutan Airlines are the two carriers. On a clear day the flight in from Kathmandu or Delhi passes the high Himalaya, and the arrival terminal is built in traditional style with painted woodwork.',
    ],
    highlights: ['Himalayan views on the inbound flight', 'Watching the bank-and-drop landing from the road above', 'Traditional painted terminal building'],
    bestTime: 'Morning flights have the clearest weather and best mountain views.',
    timeNeeded: 'Your arrival and departure',
    access: 'About 10 minutes from Paro town, around an hour to Thimphu.',
    tip: 'Flying from Kathmandu, sit on the left for Everest and Kangchenjunga. Leaving Paro, sit on the right.',
  },
  {
    slug: 'chele-la', name: 'Chele La', cat: 'peaks', lon: 89.342, lat: 27.37, alt: '3,988 m', district: 'Paro–Haa', region: 'West', scene: 'generic', kind: 'pass',
    summary: 'One of the highest road passes in Bhutan, strung with thousands of prayer flags and facing Jomolhari.',
    body: [
      'The road from Paro to the Haa valley climbs through forest to a ridge draped in prayer flags. On clear mornings Jomolhari and the peaks of the Tibetan border sit directly across from you.',
      'Short hikes along the ridge lead to higher viewpoints and, for the fit, to Kila Gompa, a nunnery built into the cliffs below the pass. Wildflowers and blue poppies grow here in early summer.',
    ],
    highlights: ['Prayer-flag ridge', 'Jomolhari on clear mornings', 'Ridge walk toward Kila Gompa nunnery'],
    bestTime: 'October–December for clearest skies. The road can close briefly after snow.',
    timeNeeded: '1–3 hours',
    access: 'About 1.5 hours’ drive from Paro.',
    tip: 'Go at sunrise. The flags light up and you will likely have the pass to yourself.',
  },
  {
    slug: 'haa-valley', name: 'Haa Valley', cat: 'wild', lon: 89.28, lat: 27.37, alt: '2,700 m', district: 'Haa', region: 'West', scene: 'generic', kind: 'village',
    summary: 'A quiet farming valley on the Tibetan side of Chele La, only opened to tourists in 2002.',
    body: [
      'Haa is the start of the Trans Bhutan Trail and still feels like an older Bhutan: wooden farmhouses, barley and buckwheat fields, and very few vehicles. Its two temples, Lhakhang Karpo and Lhakhang Nagpo, the white and the black temple, are said to have been built in the same era as Kyichu Lhakhang.',
      'This is the best valley in the west for a farmhouse homestay, with home-cooked food, ara rice spirit by the stove and a hot stone bath. In July the Haa Summer Festival brings out nomad culture, yak products and traditional games.',
    ],
    highlights: ['White and Black temples', 'Farmhouse homestays and hot stone baths', 'Haa Summer Festival in July', 'Start of the Trans Bhutan Trail'],
    bestTime: 'May–October. July for the summer festival.',
    timeNeeded: '1–2 nights',
    access: 'Over Chele La from Paro, about 2.5 hours.',
    tip: 'Ask your host to make hoentay, Haa’s buckwheat dumplings stuffed with turnip greens and cheese.',
  },
  {
    slug: 'jomolhari', name: 'Jomolhari', tib: 'ཇོ་མོ་ལྷ་རི།', cat: 'peaks', lon: 89.269, lat: 27.827, alt: '7,326 m', district: 'Paro / Thimphu', region: 'North', scene: 'jomolhari',
    summary: 'The sacred mountain of the goddess Jomo on the Tibetan border, and the goal of one of the great Himalayan treks.',
    body: [
      'Jomolhari rises straight out of yak pastures. It is believed to be the home of the goddess Jomo, and the Paro Chhu that waters the valley below begins on its slopes.',
      'The Jomolhari trek starts near the ruins of Drukgyel Dzong above Paro and follows yak trails through forest and alpine meadow for several days to Jangothang base camp at about 4,080 metres, where the north face fills the sky. Most routes then cross high passes to Lingshi and descend toward Thimphu.',
      'The mountain was climbed in 1937 and again in 1970, before Bhutan closed its peaks to mountaineering. Today you admire it from below.',
    ],
    highlights: ['Jangothang base camp below the north face', 'Lingshi Dzong on the trek', 'Yak herder camps', 'Jomolhari Mountain Festival in October'],
    bestTime: 'April–May and late September–November.',
    timeNeeded: 'About 7–9 days trekking',
    access: 'Trek from Drukgyel Dzong, Paro. A licensed guide and trekking crew are required.',
    tip: 'Time the trek for the Jomolhari Mountain Festival in October, which supports snow leopard conservation.',
  },
  {
    slug: 'thimphu', name: 'Thimphu', tib: 'ཐིམ་ཕུ།', cat: 'towns', lon: 89.639, lat: 27.4728, alt: '2,334 m', district: 'Thimphu', region: 'West', scene: 'generic', kind: 'town', night: true,
    summary: 'The capital, and the only capital in the world without a single traffic light.',
    body: [
      'Thimphu stretches along the Wang Chhu valley. A traffic light was installed at the main intersection once, but residents found it impersonal and it was removed. Police in white gloves still direct traffic by hand from a painted pavilion.',
      'The city is where Bhutan’s modern and traditional lives meet: cafés and bookshops beside the Centenary Farmers’ Market, the Folk Heritage Museum, the Royal Textile Academy, the School of Arts and Crafts where students learn the 13 traditional arts, and a weekend market selling red rice, dried yak cheese and every kind of chilli.',
    ],
    highlights: ['Traffic police at the main junction', 'Centenary Farmers’ Market', 'Royal Textile Academy', 'Institute for Zorig Chusum (traditional arts school)'],
    bestTime: 'Year-round. September for Thimphu Tshechu.',
    timeNeeded: '1–2 days',
    access: 'About an hour by road from Paro airport.',
    tip: 'Walk the weekend market on Saturday or Sunday morning, then cross the cantilever bridge to the handicraft stalls.',
  },
  {
    slug: 'buddha-dordenma', name: 'Buddha Dordenma', tib: 'རྡོ་རྗེ་གདན་མ།', cat: 'sacred', lon: 89.645, lat: 27.443, alt: 'Above Thimphu', district: 'Thimphu', region: 'West', scene: 'buddha',
    summary: 'A 54-metre gilded bronze Buddha watching over the capital from Kuenselphodrang ridge.',
    body: [
      'The statue of Shakyamuni Buddha sits on a ridge at the southern end of the Thimphu valley. It is one of the largest seated Buddha statues in the world and was completed in 2015, partly to mark the 60th birthday of the fourth King.',
      'Inside the throne building are 125,000 smaller gilded Buddha statues. The forested Kuenselphodrang Nature Park surrounds the site, with walking trails down toward the city.',
    ],
    highlights: ['The statue at sunset', '125,000 smaller Buddhas inside', 'Kuenselphodrang Nature Park trails'],
    bestTime: 'Late afternoon into sunset.',
    timeNeeded: '1 hour',
    access: 'About 15 minutes’ drive from central Thimphu.',
    tip: 'Stay until the city lights come on, then walk down through the forest trail with your guide.',
  },
  {
    slug: 'tashichho-dzong', name: 'Tashichho Dzong', tib: 'བཀྲ་ཤིས་ཆོས་རྫོང་།', cat: 'sacred', lon: 89.6347, lat: 27.49, alt: '2,350 m', district: 'Thimphu', region: 'West', scene: 'generic', kind: 'dzong', night: true, w: 0.55,
    summary: 'Seat of Bhutan’s government, the King’s throne room, and summer home of the central monk body.',
    body: [
      'Tashichho Dzong stands on the west bank of the Wang Chhu at the north end of Thimphu. It houses the throne room and offices of the King, several ministries and, in summer, the Je Khenpo, the chief abbot of Bhutan, with the central monk body.',
      'Visitors can enter in the late afternoon once government offices close. Every evening a flag-lowering ceremony is held in the courtyard, and in September the dzong hosts the Thimphu Tshechu.',
    ],
    highlights: ['Evening flag-lowering ceremony', 'Thimphu Tshechu in September', 'The dzong lit up at night from across the river'],
    bestTime: 'Late afternoon on weekdays, or any time on weekends.',
    timeNeeded: '1 hour',
    access: 'Northern Thimphu.',
    tip: 'Visitors need long sleeves and long trousers or skirts to enter any dzong. Bring a jacket even in summer.',
  },
  {
    slug: 'memorial-chorten', name: 'National Memorial Chorten', cat: 'sacred', lon: 89.6416, lat: 27.4729, alt: '2,320 m', district: 'Thimphu', region: 'West', scene: 'generic', kind: 'chorten',
    summary: 'A white Tibetan-style stupa built in 1974 in memory of the third King, circled by pilgrims from dawn to dusk.',
    body: [
      'The chorten was built in 1974 to honour the third King, Jigme Dorji Wangchuck, often called the father of modern Bhutan. Unlike many chortens it holds no relics of his remains; it is a memorial to his mind and to world peace.',
      'At any hour you will find people walking around it clockwise, spinning the large prayer wheels and reciting mantras. Many older Thimphu residents come here every day. It is one of the easiest places to simply sit and watch Bhutanese life.',
    ],
    highlights: ['Dawn and dusk circumambulation', 'Large prayer wheels at the entrance', 'Golden spire against the evening sky'],
    bestTime: 'Early morning or early evening.',
    timeNeeded: '30–45 minutes',
    access: 'Central Thimphu.',
    tip: 'Join the circuit for a round or two. Nobody minds, as long as you walk clockwise.',
  },
  {
    slug: 'takin-preserve', name: 'Motithang Takin Preserve', cat: 'wild', lon: 89.62, lat: 27.4836, alt: '2,500 m', district: 'Thimphu', region: 'West', scene: 'generic', kind: 'village',
    summary: 'A forested reserve on the edge of Thimphu where you can see the takin, Bhutan’s national animal.',
    body: [
      'The takin looks like a cross between a goat and a cow, and a legend explains why: the 15th-century saint Drukpa Kunley is said to have made one by sticking a goat’s head onto the skeleton of a cow after a meal.',
      'The animals once lived in a small zoo in Thimphu. When the King decided that keeping animals in captivity went against Buddhist values, they were released, but they kept wandering the streets of the city. The preserve was set up to give them a forested home nearby.',
    ],
    highlights: ['Takin in a natural forest enclosure', 'Views over Thimphu', 'Nearby Sangaygang viewpoint and BBS tower'],
    bestTime: 'Morning, when the takin are most active.',
    timeNeeded: '45 minutes',
    access: 'About 10 minutes above central Thimphu.',
    tip: 'Combine with the Sangaygang viewpoint just above for the best panorama of the city.',
  },
  {
    slug: 'dochula', name: 'Dochula Pass', tib: 'རྡོ་ཆུ་ལ།', cat: 'peaks', lon: 89.75, lat: 27.49, alt: '3,100 m', district: 'Thimphu–Punakha', region: 'West', scene: 'dochula',
    summary: 'A pass on the Thimphu–Punakha road with 108 memorial chortens and the best roadside view of the Bhutan Himalaya.',
    body: [
      'The 108 Druk Wangyal chortens were commissioned by the Queen Mother, Ashi Dorji Wangmo Wangchuck, and completed in 2004 to commemorate Bhutanese soldiers who died in the December 2003 operation to remove insurgent camps from southern Bhutan.',
      'On clear days between October and February the full line of Bhutan’s northern peaks stands along the horizon, including Gangkhar Puensum and Table Mountain. The Druk Wangyal Lhakhang temple sits above the chortens, and the Royal Botanical Park’s rhododendron forest spreads down the slopes.',
      'Every 13 December the pass hosts the Dochula Druk Wangyal Festival, performed in the open air among the chortens with the mountains behind the dancers.',
    ],
    highlights: ['108 Druk Wangyal chortens', 'Himalayan panorama on clear winter days', 'Druk Wangyal Festival, 13 December', 'Royal Botanical Park rhododendrons in spring'],
    bestTime: 'October–February for views. April for rhododendrons.',
    timeNeeded: '1 hour stop, or a half-day hike in the botanical park',
    access: 'About 45 minutes from Thimphu on the road to Punakha.',
    tip: 'Leave Thimphu before dawn on a clear day. Cloud usually builds up by mid-morning.',
  },
  {
    slug: 'punakha-dzong', name: 'Punakha Dzong', tib: 'སྤུ་ན་ཁ་རྫོང་།', cat: 'sacred', lon: 89.8616, lat: 27.5823, alt: '1,200 m', district: 'Punakha', region: 'West', scene: 'punakha',
    summary: 'The Palace of Great Happiness, at the meeting of two rivers. Widely considered the most beautiful dzong in Bhutan.',
    body: [
      'Zhabdrung Ngawang Namgyal founded Punakha Dzong in 1637–38 on a tongue of land where the Pho Chhu (“father river”) and the Mo Chhu (“mother river”) meet. It was the seat of government and the capital until 1955, and it is still where Bhutan’s kings are crowned and where the current King married in 2011.',
      'The dzong is the winter home of the central monk body, which moves here from Thimphu each autumn because Punakha is much lower and warmer. Its main temple holds the embalmed body of the Zhabdrung himself, and is closed to everyone except the King and the Je Khenpo.',
      'In late March and April, jacaranda trees around the walls bloom purple. Nearby, one of the longest suspension bridges in the country crosses the Pho Chhu between prayer flags.',
    ],
    highlights: ['Covered cantilever bridge over the Mo Chhu', 'Jacaranda in spring', 'Punakha Drubchen and Tshechu festivals', 'The nearby Pho Chhu suspension bridge'],
    bestTime: 'February–April and October–December. Pleasant even in winter.',
    timeNeeded: 'Half a day including the bridge',
    access: 'About 3 hours from Thimphu over Dochula.',
    tip: 'Raft the Mo Chhu in the afternoon. The gentle run finishes right beneath the dzong.',
  },
  {
    slug: 'chimi-lhakhang', name: 'Chimi Lhakhang', tib: 'འཆི་མེད་ལྷ་ཁང་།', cat: 'sacred', lon: 89.8655, lat: 27.5313, alt: '1,300 m', district: 'Punakha', region: 'West', scene: 'generic', kind: 'temple',
    summary: 'The fertility temple of the “Divine Madman”, Drukpa Kunley, reached on foot through rice fields.',
    body: [
      'Drukpa Kunley was a 15th-century saint who taught through outrageous humour, songs and sexual innuendo, mocking religious pretension. The temple was built in 1499 on a hillock he had blessed.',
      'Couples hoping for children come from all over Bhutan and beyond to be blessed with his wooden phallus. The painted phalluses you will see on farmhouse walls across the country are protective symbols linked to him.',
    ],
    highlights: ['Walk through the rice paddies from Sopsokha', 'Fertility blessing from the resident monk', 'Painted houses in Sopsokha village'],
    bestTime: 'Year-round. The paddies are greenest in summer and golden in September.',
    timeNeeded: '1–1.5 hours',
    access: 'About 20 minutes’ walk from the road at Sopsokha, between Dochula and Punakha.',
    tip: 'Have lunch at a farmhouse in Sopsokha before or after the walk.',
  },
  {
    slug: 'phobjikha-valley', name: 'Phobjikha Valley', tib: 'སྒང་སྟེང་།', cat: 'wild', lon: 90.182, lat: 27.462, alt: '3,000 m', district: 'Wangdue Phodrang', region: 'Central', scene: 'phobjikha',
    summary: 'A broad glacial valley where endangered black-necked cranes spend the winter, watched over by Gangtey monastery.',
    body: [
      'Black-necked cranes breed on the Tibetan plateau and fly over the Himalaya each autumn to winter in a few valleys of Bhutan. Phobjikha is the most important of them. The birds arrive from late October and leave by mid-February.',
      'Local belief says the cranes circle Gangtey Goemba three times when they arrive and again before they leave. To protect them, electricity lines in the valley were laid underground. The Black-necked Crane Festival on 11 November is held in the monastery courtyard, with children dancing in crane costumes.',
      'Gangtey Goemba, founded in 1613, is the most important Nyingma monastery in western Bhutan. The Gangtey Nature Trail is one of the most beautiful short walks in the country.',
    ],
    highlights: ['Black-necked cranes, late October–February', 'Gangtey Goemba', 'Gangtey Nature Trail', 'Black-necked Crane Visitor Centre'],
    bestTime: 'November–February for cranes. Lush and green in summer.',
    timeNeeded: '1–2 nights',
    access: 'About 3 hours from Punakha.',
    tip: 'Use the spotting scopes at the Black-necked Crane Visitor Centre and keep your distance from the birds in the wetland.',
  },
  {
    slug: 'trongsa-dzong', name: 'Trongsa Dzong', tib: 'ཀྲོང་གསར་རྫོང་།', cat: 'sacred', lon: 90.507, lat: 27.4995, alt: '2,200 m', district: 'Trongsa', region: 'Central', scene: 'generic', kind: 'dzong', w: 0.55,
    summary: 'The largest dzong in Bhutan, spilling down a ridge at the geographic centre of the country.',
    body: [
      'Trongsa controlled the only route between east and west Bhutan for centuries, so whoever held it held the country. The first and second kings ruled as Penlop, or governor, of Trongsa before the monarchy was founded in 1907, and the crown prince traditionally holds the title before becoming king.',
      'The dzong is a maze of courtyards, temples and passageways built down the ridge in stages from the 17th century. The Ta Dzong watchtower above it is now a museum on the history of the Wangchuck dynasty.',
    ],
    highlights: ['Views of the dzong from the viewpoint on the approach road', 'Royal Heritage Museum in the Ta Dzong', 'Trongsa Tshechu in December or January'],
    bestTime: 'March–May and September–December.',
    timeNeeded: 'Half a day',
    access: 'About 4–5 hours’ drive from Phobjikha.',
    tip: 'Stop at the viewpoint on the road from the west for the full view of the dzong before you arrive.',
  },
  {
    slug: 'bumthang', name: 'Bumthang & Jakar', tib: 'བུམ་ཐང་།', cat: 'sacred', lon: 90.752, lat: 27.549, alt: '2,600 m', district: 'Bumthang', region: 'Central', scene: 'generic', kind: 'dzong', w: 0.4,
    summary: 'Bhutan’s spiritual heartland: four valleys full of the country’s oldest temples, plus Swiss cheese and a craft brewery.',
    body: [
      'Bumthang is made up of four valleys: Chumey, Choekhor, Tang and Ura. Guru Rinpoche and the treasure-revealer Pema Lingpa both worked here, and the density of ancient temples is greater than anywhere else in Bhutan. Jakar Dzong, the “castle of the white bird”, overlooks the main town.',
      'Kurjey Lhakhang holds a rock bearing the body imprint of Guru Rinpoche. Jambay Lhakhang is one of the two oldest temples in the country. In the Tang valley, Ogyen Choling is a manor house turned museum that shows how a noble family lived.',
      'A Swiss volunteer who settled here in the 1960s introduced cheese-making, and Bumthang still produces Swiss-style cheese, honey and Red Panda beer.',
    ],
    highlights: ['Jakar Dzong', 'Kurjey Lhakhang', 'Jambay Lhakhang fire dance in autumn', 'Ogyen Choling museum in Tang', 'Ura village and the Matsutake Festival in August'],
    bestTime: 'September–November for festivals, March–May for flowers.',
    timeNeeded: '2–3 nights',
    access: 'About 2.5 hours’ drive from Trongsa, or a short domestic flight from Paro.',
    tip: 'Fly one way. The road is spectacular, but flying back from Bumthang saves a full day of driving.',
  },
  {
    slug: 'jambay-lhakhang', name: 'Jambay Lhakhang', tib: 'བྱམས་པའི་ལྷ་ཁང་།', cat: 'sacred', lon: 90.7378, lat: 27.5786, alt: '2,600 m', district: 'Bumthang', region: 'Central', scene: 'generic', kind: 'temple',
    summary: 'A 7th-century temple famous for its midnight fire dance under a burning gate.',
    body: [
      'Jambay Lhakhang is one of the 108 temples that tradition says the Tibetan king Songtsen Gampo built in a single day, and with Kyichu Lhakhang in Paro it is considered one of the two oldest in Bhutan.',
      'Its festival, the Jambay Lhakhang Drup, is held in autumn by the lunar calendar. The most famous ritual is the Mewang fire blessing: at night, people run beneath an arch of burning straw to be cleansed of misfortune. The festival also includes the Tercham, a sacred naked dance performed at midnight.',
    ],
    highlights: ['7th-century inner sanctum', 'Mewang fire blessing during the autumn festival'],
    bestTime: 'October or November during the festival (lunar dates).',
    timeNeeded: '1 hour, or a full night at the festival',
    access: 'Short drive from Jakar.',
    tip: 'Photography of the midnight dance is forbidden. Respect it.',
  },
  {
    slug: 'burning-lake', name: 'Burning Lake', tib: 'མེ་འབར་མཚོ།', cat: 'sacred', lon: 90.768, lat: 27.596, alt: '2,700 m', district: 'Bumthang', region: 'Central', scene: 'generic', kind: 'lake',
    summary: 'Mebar Tsho, a pool in a gorge where Pema Lingpa is said to have recovered sacred treasure with a burning lamp.',
    body: [
      'In 1475, according to tradition, the young Pema Lingpa had a vision of treasure hidden in this river gorge. Doubted by the local governor, he dived in holding a lit butter lamp and declared that if he were a true treasure revealer he would return with the treasure and the lamp still burning. He did.',
      'Pema Lingpa became one of the most important saints of Bhutan, and the royal family traces its descent from him. Pilgrims still come to float butter lamps on the dark water.',
    ],
    highlights: ['Butter lamps on the water at dusk', 'Prayer-flag-hung footbridge over the gorge'],
    bestTime: 'Late afternoon.',
    timeNeeded: '45 minutes',
    access: 'About 30 minutes’ drive from Jakar toward Tang valley.',
    tip: 'The rocks are slippery. Stay well back from the edge, especially with children.',
  },
  {
    slug: 'gangkhar-puensum', name: 'Gangkhar Puensum', tib: 'གངས་དཀར་སྤུན་གསུམ།', cat: 'peaks', lon: 90.455, lat: 28.047, alt: '7,570 m', district: 'Bumthang / Tibet border', region: 'North', scene: 'gangkhar',
    summary: 'The highest mountain on Earth that nobody has climbed, and very likely nobody ever will.',
    body: [
      'Gangkhar Puensum means “white peak of the three spiritual brothers”. At 7,570 metres it is the highest point in Bhutan and the highest unclimbed mountain in the world.',
      'Four expeditions attempted it in 1985 and 1986 and all failed. In 1994 Bhutan banned climbing above 6,000 metres out of respect for local belief that mountains are the homes of protective deities, and in 2003 it banned mountaineering altogether.',
      'You can see it from Dochula on clear winter days, from high points around Bumthang, and on a demanding trek from Bumthang toward its base. Few visitors make that journey.',
    ],
    highlights: ['Views from Dochula in winter', 'Gangkhar Puensum base camp trek from Bumthang', 'Glimpses from the Snowman Trek'],
    bestTime: 'October–December for clear views.',
    timeNeeded: 'A clear morning to see it; about 2–3 weeks to trek near it',
    access: 'Viewpoints by road; base-camp approach on foot only, with a licensed trekking operator.',
    tip: 'Ask your guide which peak is which at Dochula. Gangkhar Puensum is easy to miss among its neighbours.',
  },
  {
    slug: 'laya', name: 'Laya', tib: 'ལ་ཡ།', cat: 'wild', lon: 89.7, lat: 28.06, alt: '3,800 m', district: 'Gasa', region: 'North', scene: 'generic', kind: 'village',
    summary: 'A highland village of yak herders near the Tibetan border, known for its women’s conical bamboo hats.',
    body: [
      'The Layap people have their own language and dress, including the distinctive pointed bamboo hats worn by women. Laya sits below glaciated peaks on the Snowman and Laya–Gasa treks.',
      'Since 2016 the Royal Highland Festival has brought herders from across the northern highlands to Laya each October for yak competitions, songs and dances. On the way, the Gasa hot springs are a favourite stop to soak tired legs.',
    ],
    highlights: ['Layap dress and bamboo hats', 'Royal Highland Festival in October', 'Gasa hot springs nearby'],
    bestTime: 'September–November.',
    timeNeeded: 'About 6–8 days on the Laya–Gasa trek',
    access: 'On foot from Gasa, or on the Snowman Trek.',
    tip: 'Bring warm layers even in October. Nights at 3,800 metres are below freezing.',
  },
  {
    slug: 'lunana', name: 'Lunana', tib: 'ལུང་ནག་ན།', cat: 'peaks', lon: 90.25, lat: 28.08, alt: '4,000 m+', district: 'Gasa', region: 'North', scene: 'generic', kind: 'peak', night: true,
    summary: 'One of the most remote inhabited valleys on Earth, under glaciers at the heart of the Snowman Trek.',
    body: [
      'Lunana is a cluster of villages more than a week’s walk from the nearest road, cut off by snow for much of the year. Its people herd yaks and grow what little the altitude allows.',
      'The valley became widely known through “Lunana: A Yak in the Classroom”, the Bhutanese film about a young teacher posted there, which was nominated for the Academy Award for Best International Feature Film in 2022.',
    ],
    highlights: ['Glacial lakes and peaks of the Snowman Trek', 'Village life largely unchanged by roads'],
    bestTime: 'September–October only.',
    timeNeeded: 'Part of a 25-day trek',
    access: 'On foot only, via the Snowman Trek.',
    tip: 'Watch the film before you go.',
  },
  {
    slug: 'royal-manas', name: 'Royal Manas National Park', cat: 'wild', lon: 90.95, lat: 26.82, alt: '100 m+', district: 'Sarpang / Zhemgang', region: 'South', scene: 'generic', kind: 'jungle',
    summary: 'Bhutan’s oldest protected area: subtropical jungle with Bengal tigers, elephants, rhinos and golden langurs.',
    body: [
      'Royal Manas lies along the Indian border and adjoins India’s Manas National Park, forming one of the most important tiger conservation landscapes in Asia. It is home to Bengal tigers, Asian elephants, greater one-horned rhinoceros, clouded leopards and hundreds of bird species.',
      'It is also one of the best places to see the golden langur, a rare monkey found only in this region. Visits involve jungle walks, river rafting on the Manas and stays in community-run camps.',
    ],
    highlights: ['Golden langurs along the river', 'Rafting the Manas', 'Hornbills and over 400 bird species', 'Community-run eco-camps'],
    bestTime: 'November–April. The park is hot and wet in the monsoon.',
    timeNeeded: '2–3 nights',
    access: 'Via Gelephu in the south, or overland from Assam.',
    tip: 'Tigers are rarely seen. Come for the birds and langurs and treat any big cat as a bonus.',
  },
  {
    slug: 'trashigang', name: 'Trashigang', tib: 'བཀྲ་ཤིས་སྒང་།', cat: 'towns', lon: 91.554, lat: 27.333, alt: '1,100 m', district: 'Trashigang', region: 'East', scene: 'generic', kind: 'dzong', w: 0.38,
    summary: 'The largest town in the east, and where the 403 km Trans Bhutan Trail ends.',
    body: [
      'Trashigang Dzong, built in 1659, sits on a spur high above the Drangme Chhu. The east sees a fraction of Bhutan’s visitors, and the dzongs, temples and weaving villages here feel very much your own.',
      'It is the gateway to Merak and Sakteng, the semi-nomadic Brokpa villages near the Arunachal border, and to Radhi, a village known for its raw silk weaving.',
    ],
    highlights: ['Trashigang Dzong above the gorge', 'Radhi weaving village', 'Gateway to Merak and Sakteng'],
    bestTime: 'October–April.',
    timeNeeded: '1–2 nights',
    access: 'Long drive from Bumthang via Thrumshing La, or domestic flight to Yongphulla.',
    tip: 'Combine with Trashi Yangtse and its Chorten Kora, a white stupa modelled on Boudhanath in Kathmandu.',
  },
  {
    slug: 'merak-sakteng', name: 'Merak & Sakteng', cat: 'wild', lon: 91.95, lat: 27.37, alt: '3,000 m+', district: 'Trashigang', region: 'East', scene: 'generic', kind: 'village',
    summary: 'Highland villages of the semi-nomadic Brokpa people, in a sanctuary famous for protecting the habitat of the migoi, the Bhutanese yeti.',
    body: [
      'The Brokpa herd yaks and sheep and wear distinctive felt hats with long tassels that work as rain spouts. Their villages were closed to visitors until 2010.',
      'The Sakteng Wildlife Sanctuary protects rhododendron forest and red pandas, and local lore holds that it is also home to the migoi. A trek of several days links Merak and Sakteng over a high pass.',
    ],
    highlights: ['Brokpa culture and dress', 'Merak–Sakteng trek', 'Rhododendron forests in spring'],
    bestTime: 'March–May and September–November.',
    timeNeeded: '3–5 days',
    access: 'Road to near Merak from Trashigang, then on foot.',
    tip: 'Ask about the migoi. Everyone has a story.',
  },
  {
    slug: 'gelephu', name: 'Gelephu', cat: 'towns', lon: 90.49, lat: 26.87, alt: '250 m', district: 'Sarpang', region: 'South', scene: 'generic', kind: 'town',
    summary: 'A southern border town and the site of the Gelephu Mindfulness City, a new special region planned around wellbeing and nature.',
    body: [
      'Gelephu is a warm lowland town on the border with Assam and one of the official overland entry points. It has a domestic airport and is the closest town to Royal Manas National Park.',
      'In December 2023 the King announced the Gelephu Mindfulness City, a special administrative region designed around sustainability, wellbeing and Bhutanese values. It is being developed over many years.',
    ],
    highlights: ['Overland entry from Assam', 'Gateway to Royal Manas', 'Gelephu Mindfulness City development'],
    bestTime: 'October–March.',
    timeNeeded: '1 night',
    access: 'Road from Assam, domestic flights from Paro.',
    tip: 'A good way to start or end a trip that includes Royal Manas.',
  },
  {
    slug: 'phuentsholing', name: 'Phuentsholing', cat: 'towns', lon: 89.3884, lat: 26.8516, alt: '300 m', district: 'Chukha', region: 'South', scene: 'generic', kind: 'town',
    summary: 'Bhutan’s main overland gateway from India, where the plains end abruptly at a painted gate.',
    body: [
      'Phuentsholing sits directly across from Jaigaon in West Bengal. Stepping through the Bhutan Gate is a sudden change of pace, architecture and atmosphere.',
      'From here the road climbs from subtropical plains through cloud forest to Thimphu in roughly six hours, one of the most dramatic road journeys in the country.',
    ],
    highlights: ['The Bhutan Gate', 'Zangtho Pelri temple in the town centre', 'Climb from plains to pine forest on the way to Thimphu'],
    bestTime: 'October–March.',
    timeNeeded: 'A night, or a few hours in transit',
    access: 'Overland from Bagdogra airport or Siliguri in India.',
    tip: 'Visa and permit processing happens here for overland arrivals. Arrive early in the day.',
  },
];

export const placeBySlug = (slug: string) => PLACES.find((p) => p.slug === slug);

export function distanceKm(a: Place, b: Place) {
  const R = 6371, toR = Math.PI / 180;
  const dLat = (b.lat - a.lat) * toR, dLon = (b.lon - a.lon) * toR;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * toR) * Math.cos(b.lat * toR) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
export const nearby = (p: Place, n = 3) =>
  PLACES.filter((q) => q.slug !== p.slug).map((q) => ({ q, d: distanceKm(p, q) })).sort((a, b) => a.d - b.d).slice(0, n);
