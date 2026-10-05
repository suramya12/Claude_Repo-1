export type Experience = { title: string; when: string; level: string; text: string; icon: string; place?: string };

/** Icons are 34×34 line drawings, stroked with the accent colour. */
export const EXPERIENCES: Experience[] = [
  { title: "Hike to Tiger's Nest", when: 'Half a day', level: 'Moderate', place: 'tigers-nest', text: 'Pine forest, prayer wheels turned by streams and a final staircase across a waterfall gorge to a temple on a cliff.', icon: '<path d="M3 30 L13 14 L19 22 L24 15 L31 30Z"/><path d="M22 9h4v4h-4z"/>' },
  { title: 'Hot stone bath', when: 'Evening', level: 'Easy', place: 'haa-valley', text: 'River stones heated in a fire are dropped into a wooden tub with artemisia leaves. The traditional cure for aching trekkers.', icon: '<path d="M5 18h24v6a6 6 0 0 1-6 6H11a6 6 0 0 1-6-6z"/><path d="M12 13c0-3 3-3 3-6M18 13c0-3 3-3 3-6"/>' },
  { title: 'Watch an archery match', when: 'Weekends', level: 'Spectator', place: 'thimphu', text: 'The national sport. Targets 145 metres away, teams dancing after every hit and singing teasing songs at their rivals.', icon: '<path d="M8 28 L28 8"/><path d="M22 8h6v6"/><path d="M6 10a20 20 0 0 1 18 18"/>' },
  { title: 'Masked dance festival', when: '1–5 days', level: 'Easy', place: 'rinpung-dzong', text: 'Monks in carved masks dance stories of saints and demons in dzong courtyards. Locals come in their finest dress to receive blessings.', icon: '<circle cx="17" cy="17" r="11"/><path d="M11 15h4M19 15h4M12 22c3 3 7 3 10 0"/>' },
  { title: 'Farmhouse homestay', when: '1–2 nights', level: 'Easy', place: 'haa-valley', text: 'Sleep in a painted three-storey farmhouse, drink ara by the stove and help with whatever the season’s work is.', icon: '<path d="M5 15 L17 6 L29 15"/><path d="M8 14v14h18V14"/><path d="M15 28v-7h4v7"/>' },
  { title: 'Raft the Mo Chhu', when: '2 hours', level: 'Easy', place: 'punakha-dzong', text: 'A gentle run through the Punakha valley that finishes beneath the walls of Punakha Dzong.', icon: '<path d="M3 22c4-3 8 3 12 0s8-3 12 0 4 0 4 0"/><path d="M8 18h18l-3-5H11z"/>' },
  { title: 'Watch the cranes', when: 'Nov–Feb', level: 'Easy', place: 'phobjikha-valley', text: 'Black-necked cranes feeding in the Phobjikha wetland at dawn, and the walk along the Gangtey Nature Trail.', icon: '<path d="M6 20c6 0 10-4 12-8l8-4-3 6c-2 6-8 8-17 6z"/><path d="M14 20l-2 8M18 19l1 9"/>' },
  { title: 'Learn the 13 arts', when: 'Half a day', level: 'Easy', place: 'thimphu', text: 'Watch students at the Institute for Zorig Chusum learn painting, wood carving, embroidery and sculpture, then visit the Royal Textile Academy.', icon: '<path d="M8 26 L22 12l4 4L12 30H8z"/><path d="M20 14l4 4"/>' },
  { title: 'Trans Bhutan Trail', when: 'Days to weeks', level: 'Choose a section', text: 'A 403 km restored pilgrim path from Haa to Trashigang, used for centuries by monks, traders and royal messengers.', icon: '<path d="M4 26c6 0 6-8 12-8s6-8 12-8"/><circle cx="4" cy="26" r="2"/><circle cx="28" cy="10" r="2"/>' },
  { title: 'Snowman Trek', when: 'About 25 days', level: 'Extreme', place: 'lunana', text: 'Several passes above 5,000 m and the remote valley of Lunana. Often called the hardest trek in the world.', icon: '<path d="M17 4v26M6 10l22 14M28 10L6 24"/>' },
  { title: 'Night at the Burning Lake', when: 'Dusk', level: 'Easy', place: 'burning-lake', text: 'Float a butter lamp on the dark water of Mebar Tsho where Pema Lingpa found his treasure.', icon: '<path d="M17 6c4 5 6 8 6 11a6 6 0 0 1-12 0c0-3 2-6 6-11z"/><path d="M6 28h22"/>' },
  { title: 'Golden langurs in Manas', when: '2–3 nights', level: 'Easy', place: 'royal-manas', text: 'Jungle walks and rafting in Royal Manas, one of the last strongholds of the golden langur and the Bengal tiger.', icon: '<circle cx="17" cy="14" r="6"/><path d="M11 22c-4 2-5 6-5 8M23 22c4 2 5 6 5 8M17 20v10"/>' },
];

export type Dish = { name: string; local: string; text: string };
export const DISHES: Dish[] = [
  { name: 'Ema datshi', local: 'ཨེ་མ་དར་ཚིལ།', text: 'The national dish. Chillies cooked as a vegetable in a sauce of melted farmer’s cheese. Fiery, rich and served at almost every meal.' },
  { name: 'Kewa datshi', local: 'Potato and cheese', text: 'The gentler cousin of ema datshi, with sliced potatoes. Ask for it if you are not ready for the full chilli experience.' },
  { name: 'Shamu datshi', local: 'Mushroom and cheese', text: 'Wild mushrooms in cheese sauce, best in late summer when the forests of Bumthang are full of them.' },
  { name: 'Red rice', local: 'Paro valley', text: 'A nutty, slightly sticky rice grown in the high valleys, eaten with everything.' },
  { name: 'Phaksha paa', local: 'Pork with chillies', text: 'Strips of pork stewed with radish or spinach, dried chillies and ginger.' },
  { name: 'Momos', local: 'Dumplings', text: 'Steamed dumplings filled with cheese, cabbage, beef or pork, served with chilli sauce.' },
  { name: 'Hoentay', local: 'Haa valley', text: 'Buckwheat dumplings stuffed with turnip greens and cheese, the speciality of the Haa valley.' },
  { name: 'Suja and ara', local: 'Butter tea and rice spirit', text: 'Salted butter tea to warm you up in the morning, and ara, a home-distilled spirit, often served warm with butter and egg.' },
];
