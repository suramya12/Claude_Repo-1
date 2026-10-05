/* The zoom tree: every scene, its archetype and its content. Depth comes from the parent links.
   Horizon nodes carry real coordinates; the engine turns them into compass bearings from the viewer. */
(function () {
  'use strict';
  const R = window.RJ_PARTS;
  const C = R.CHECKED;
  const fee = (id) => { const f = R.fees[id]; return `₹${f.in.toLocaleString('en-IN')} Indian / ₹${f.fo.toLocaleString('en-IN')} foreign${f.approx ? ' (approx.)' : ''}`; };
  const confirm = `confirm before booking · checked ${C}`;
  const place = (o) => ({ archetype: 'photo', ...o });

  const nodes = [
    // ---------------- root ----------------
    { id: 'earth', archetype: 'orbit', title: 'Earth', crumb: 'Earth', eyebrow: 'From orbit · 26.6° N 73.8° E', big: 'Land of kings', line: 'India’s largest state: forts on every ridge, a desert full of people, and lakes built by hand.',
      stats: [['342,239 km²', 'Largest state in India, 10.4% of its land'], ['4', 'UNESCO World Heritage listings'], ['1,722 m', 'Guru Shikhar, top of the Aravallis']],
      note: 'Globe: Natural Earth land outlines. No national boundaries are drawn.', noSearch: true },
    { id: 'rajasthan', parent: 'earth', archetype: 'panorama', title: 'Rajasthan', native: 'राजस्थान', crumb: 'Rajasthan', big: 'Turn around slowly', line: 'Places sit at their true compass bearing. Themes are in the sky; tools are on the ground.', aliases: ['panorama', 'home', 'centre'] },

    // ---------------- sky: themes ----------------
    { id: 'wonders', parent: 'rajasthan', archetype: 'ring', band: 'sky', bearing: 12, alt: 33, title: 'Seven Wonders', eyebrow: 'Our selection: no official list exists', big: 'Seven to start with', line: 'Built, sacred, natural and living wonders, spread across the state. Each also sits on the horizon at its real bearing.', teaser: 'Our pick of seven: forts, temples, tigers and a holy lake.', note: 'Drag or use ← → to turn the ring · click a portal to enter' },
    { id: 'seasons', parent: 'rajasthan', archetype: 'dial', band: 'sky', bearing: 52, alt: 26, title: 'Seasons & festivals', eyebrow: `Next twelve months · dates ${confirm}`, big: 'The year ahead', line: 'Festival dates for the next twelve months, set by the lunar calendar where it applies. The ring’s colour shows the season.', teaser: 'Pushkar Fair, Diwali, Holi, Gangaur and Teej, with live countdowns.', aliases: ['festivals', 'calendar', 'when to go', 'weather', 'best time'] },
    { id: 'culture', parent: 'rajasthan', archetype: 'constellation', band: 'sky', bearing: 92, alt: 35, title: 'Culture', eyebrow: 'Music, dance, craft, painting', big: 'Made by hand', line: 'Click a star: the dances, music, crafts and painting schools of Rajasthan, and where to see them.', teaser: 'Kalbelia dance, Manganiyar music, blue pottery, Pichwai painting.', aliases: ['crafts', 'music', 'dance', 'art'] },
    { id: 'reasons', parent: 'rajasthan', archetype: 'constellation', band: 'sky', bearing: 132, alt: 28, title: 'Eight reasons to go', eyebrow: 'True and a little surprising', big: 'Stars to steer by', line: 'Eight facts about Rajasthan that surprise first-time visitors. Each one leads to a place.', teaser: 'A 27 m sundial, a 36 km wall, 1,444 pillars…', aliases: ['why go', 'reasons'] },
    { id: 'landscape', parent: 'rajasthan', archetype: 'profile', band: 'sky', bearing: 172, alt: 32, title: 'Dunes to the Aravallis', eyebrow: 'Landscape · a west-to-east cross-section', big: 'Sand, then ancient rock', line: 'From the dunes at Sam across the Marwar plain, over the Aravalli crest at Mount Abu and down to the Chambal at Kota.', teaser: 'The terrain to scale, with the Burj Khalifa for comparison.', aliases: ['terrain', 'aravalli', 'mountains', 'elevation'] },
    { id: 'wildlife', parent: 'rajasthan', archetype: 'story', band: 'sky', bearing: 212, alt: 27, title: 'Wildlife', eyebrow: 'Wildlife', big: 'Tigers to bustards', line: 'Five animals worth the trip, and where to see them.', teaser: 'Tigers, leopards, blackbuck, sarus cranes, great Indian bustards.', aliases: ['animals', 'tiger', 'leopard', 'birds'] },
    { id: 'skies', parent: 'rajasthan', archetype: 'sky', band: 'sky', bearing: 252, alt: 34, title: 'Skies over the Thar', coords: [26.86, 70.49], eyebrow: 'Sky · computed for today over the Sam dunes', big: 'Night over Sam', line: 'The sky above the dunes at dawn, golden hour and night, with the real sun and moon for today.', teaser: 'Dawn, golden hour and the night sky above the dunes.', aliases: ['stars', 'night sky', 'sunset'],
      facts: [['42 km', 'Sam lies 42 km west of Jaisalmer, away from city light'], ['~10 °C', 'Typical winter night: bring a warm layer'], ['2 s', 'Jaipur’s Samrat Yantra reads local time from the sun to about 2 seconds'], ['1734', 'The year Jai Singh II finished his Jaipur observatory']] },
    { id: 'food', parent: 'rajasthan', archetype: 'closeup', band: 'sky', bearing: 292, alt: 25, title: 'Dal baati churma', eyebrow: 'Food · the dish of Rajasthan', big: 'Baked, cracked, drenched', line: 'Rajasthan’s best-known meal: hard-baked wheat rolls, lentils and sweet crumbled wheat, all with ghee.', teaser: 'Dal baati churma, laal maas, ker sangri, ghewar.', photo: 'food-dal-baati', alt: 'A plate of dal baati churma: baked baati rolls, a bowl of dal, a bowl of churma topped with almonds, and green chillies', noHeart: true, aliases: ['food', 'eat', 'dishes', 'cuisine'],
      notes: [
        { x: 60, y: 72, title: 'Baati', text: 'Hard wheat rolls baked until crusted, then cracked open and soaked in ghee.' },
        { x: 28, y: 45, title: 'Dal', text: 'A thick lentil dal, here with whole pulses, poured over the broken baati.' },
        { x: 57, y: 25, title: 'Churma', text: 'Crushed wheat cooked with ghee and jaggery or sugar; this bowl is topped with almonds.' },
        { x: 75, y: 25, title: 'Green chillies', text: 'Raw chillies on the side, for heat.' },
        { title: 'Also try: laal maas', text: 'Mutton slow-cooked with yoghurt and the dried red Mathania chillies of Rajasthan.' },
        { title: 'Also try: ker sangri', text: 'Desert berries (ker) and beans (sangri, from the khejri tree), dried and spiced.' },
        { title: 'Also try: pyaaz kachori', text: 'Jodhpur’s onion-filled fried pastry, eaten with tamarind chutney.' },
        { title: 'Also try: ghewar', text: 'A honeycomb disc of fried batter soaked in syrup, made around Teej.' },
      ] },
    { id: 'stories', parent: 'rajasthan', archetype: 'story', band: 'sky', bearing: 332, alt: 30, title: 'Stories', eyebrow: 'Five true stories', big: 'Five true stories', line: 'Trees, paint, a grain trader’s lake, an astronomer king and a fort still lived in.', teaser: 'Khejarli 1730, the pink paint of 1876, a lake from 1362.', aliases: ['history', 'stories'] },

    // ---------------- ground: tools ----------------
    { id: 'plan', parent: 'rajasthan', archetype: 'tool', tool: 'planner', band: 'ground', bearing: 20, drop: 0.25, title: 'Plan a trip', eyebrow: `Planner · fees ${confirm}`, big: 'Days, places, costs', line: 'Pick your passport, month, days and interests. Get a route, drive times and the entry fees we could verify.', teaser: 'Routes, visa and entry fees, festivals in your month.', aliases: ['planner', 'itinerary', 'cost', 'budget', 'visa', 'fees'] },
    { id: 'phrasebook', parent: 'rajasthan', archetype: 'tool', tool: 'phrasebook', band: 'ground', bearing: 80, drop: 0.27, title: 'Phrasebook', eyebrow: 'Hindi and Rajasthani', big: 'Khamma ghani', line: 'Seven phrases with pronunciation, and a quiz.', teaser: 'Khamma ghani, Ram Ram sa, and five more.', aliases: ['language', 'hindi', 'phrases', 'quiz'] },
    { id: 'kbyg', parent: 'rajasthan', archetype: 'tool', tool: 'kbyg', band: 'ground', bearing: 140, drop: 0.24, title: 'Know before you go', eyebrow: `Practicalities · ${confirm}`, big: 'Before you fly', line: 'Visas, safety advice, money, SIM cards, plugs, dress codes, heat and drive times.', teaser: 'Visas, advisories, money, plugs, dress codes.', aliases: ['practical', 'safety', 'advisory', 'money', 'sim', 'plug', 'dress code'] },
    { id: 'gallery', parent: 'rajasthan', archetype: 'lightbox', band: 'ground', bearing: 200, drop: 0.26, title: 'Gallery', eyebrow: 'Every photo, with credits', big: 'Every photo', line: 'All the photographs on this site, with their authors and licences.', teaser: 'Every photograph, with credits.', aliases: ['photos', 'pictures'] },
    { id: 'saved', parent: 'rajasthan', archetype: 'tool', tool: 'saved', band: 'ground', bearing: 260, drop: 0.24, title: 'Saved places', eyebrow: 'Your list, kept in this browser', big: 'Your shortlist', line: 'Places you hearted. They stay in this browser between visits.', teaser: 'The places you hearted.', aliases: ['favourites', 'saved', 'hearts'] },
    { id: 'credits', parent: 'rajasthan', archetype: 'tool', tool: 'credits', band: 'ground', bearing: 320, drop: 0.27, title: 'Credits & sources', eyebrow: 'Photos, data and sources', big: 'Who made what', line: 'Photographers, licences, map data and the sources behind every fact.', teaser: 'Photo credits and sources.', aliases: ['about', 'sources', 'licence', 'license'] },

    // ---------------- the seven wonders (children of the ring, drawn on the horizon) ----------------
    place({ id: 'amber-fort', parent: 'wonders', band: 'horizon', order: 1, sil: 'palace', kind: 'Built · Jaipur · UNESCO', title: 'Amber Fort', native: 'आमेर का किला', coords: [26.9855, 75.8513], cat: 'heritage', photo: 'amber-fort', alt: 'Amber Fort’s palace on a green hillside above Maota Lake, with walls running along the ridge', fy: 60,
      eyebrow: 'Wonder I · Heritage · Jaipur district · UNESCO', big: 'Palace above a lake', line: 'Begun by Raja Man Singh I in 1592 on a ridge above Maota Lake, about 11 km north of Jaipur.', teaser: 'Sandstone courts and a hall of mirrors above Maota Lake.', aliases: ['amer', 'amber palace', 'jaipur'],
      story: [
        'Raja Man Singh I, a general at Akbar’s court, began the palace in 1592 on a ridge above Maota Lake. His successors kept building: Mirza Raja Jai Singh I added the painted Ganesh Pol gateway and the Sheesh Mahal around 1640.',
        'You climb through a sequence of courts, each more private than the last: the parade ground of Jaleb Chowk, the pillared Diwan-i-Aam where the ruler heard petitions, the Ganesh Pol, then the garden court between the Sheesh Mahal and the Sukh Niwas, where water once ran through marble channels to cool the rooms.',
        'Amber was the Kachwaha capital until Sawai Jai Singh II moved his court to his new planned city, Jaipur, in 1727. UNESCO listed it in 2013 as one of six Hill Forts of Rajasthan.',
      ],
      facts: [['Begun', '1592, Raja Man Singh I'], ['Listed', 'UNESCO 2013, Hill Forts of Rajasthan'], ['Entry', fee('amber-fort'), confirm], ['Composite ticket', fee('jaipur-composite'), 'Two days, covers several Jaipur monuments'], ['Time needed', '2–3 hours'], ['Best time', 'Oct–Mar, at opening time'], ['Region', 'Jaipur & the East']],
      tips: ['Arrive at opening to walk the courts before the tour groups.', 'The two-day composite ticket covers Amber and several city monuments.', 'Walk up from the lake road or take a jeep; the ramp is steep in the heat.'],
      nearby: ['nahargarh', 'hawa-mahal', 'chand-baori'],
      spots: [
        { x: 55, y: 62, label: 'Inside the palace', go: 'amber-inside' },
        { x: 25, y: 82, label: 'Maota Lake', text: 'The lake below the fort supplied its water and cooled the air around it.' },
        { x: 54, y: 82, label: 'Kesar Kyari', text: 'A geometric garden on a terrace in the lake, laid out in star-shaped beds.' },
        { x: 32, y: 50, label: 'Ridge walls', text: 'Walls climb along the ridge to Jaigarh Fort, which guards Amber from above.' },
      ] }),
    place({ id: 'jaisalmer-fort', parent: 'wonders', band: 'horizon', order: 2, sil: 'fort', kind: 'Living fort · Thar · UNESCO', title: 'Jaisalmer Fort', native: 'सोनार किला', coords: [26.9124, 70.9126], cat: 'heritage', photo: 'jaisalmer-fort', alt: 'Round yellow sandstone bastions of Jaisalmer Fort with houses on top, under a blue sky', fy: 40,
      eyebrow: 'Wonder II · Living heritage · Jaisalmer · UNESCO', big: 'A fort people live in', line: 'Founded in 1156 on Trikuta Hill, the golden sandstone fort still holds homes, temples, shops and guesthouses.', teaser: 'A golden fort, founded in 1156, that people still live in.', aliases: ['sonar qila', 'golden fort', 'jaisalmer'],
      story: [
        'Rawal Jaisal of the Bhati Rajputs moved his capital from Lodurva to Trikuta Hill in 1156. Ninety-nine bastions ring the hilltop, and the yellow sandstone turns gold in the late afternoon, which gave the fort its name: Sonar Qila, the golden fort.',
        'Unlike most forts, this one never emptied. Families still live inside, in lanes too narrow for cars, alongside a palace, a group of Jain temples and guesthouses. Sources estimate that about a quarter of the old town’s people live within the walls.',
        'Living in a monument has a cost. Conservationists have warned for years that water from modern plumbing seeps into the old foundations. Staying outside the walls and using water carefully helps.',
      ],
      facts: [['Founded', '1156, Rawal Jaisal'], ['Bastions', '99'], ['Hill', 'Trikuta, about 76 m (250 ft)'], ['Listed', 'UNESCO 2013, Hill Forts of Rajasthan'], ['Entry', 'Free to walk in; palace museum ticketed'], ['Time needed', 'Half a day'], ['Best time', 'Oct–Mar; late afternoon light']],
      tips: ['Walk in early, when the lanes are empty and cool.', 'Shoes off in the Jain temples; check their visiting hours at the gate.', 'Watch the walls turn gold from Gadisar Lake at sunset.'],
      nearby: ['patwon-ki-haveli', 'gadisar', 'sam-dunes'],
      spots: [
        { x: 22, y: 42, label: 'The bastions', text: 'Round towers like these, 99 in all, ring the hilltop.' },
        { x: 68, y: 22, label: 'Homes on the walls', text: 'The houses and havelis above the bastions are lived in today.' },
        { x: 50, y: 75, label: 'The lower wall', text: 'A second wall of the same yellow sandstone wraps the foot of the hill.' },
      ] }),
    place({ id: 'mehrangarh', parent: 'wonders', band: 'horizon', order: 3, sil: 'fort', kind: 'Built · Jodhpur', title: 'Mehrangarh', native: 'मेहरानगढ़', coords: [26.2979, 73.0186], cat: 'heritage', photo: 'mehrangarh', alt: 'Carved red sandstone palace facades with projecting balconies at Mehrangarh Fort', fy: 45,
      eyebrow: 'Wonder III · Heritage · Jodhpur', big: 'A fort grown from rock', line: 'Rao Jodha founded it in 1459 on a cliff 125 m above the city he named Jodhpur.', teaser: 'Palaces on a cliff, 125 m above the blue city.', aliases: ['jodhpur fort', 'mehrangarh fort'],
      story: [
        'Rao Jodha of the Rathore clan began the fort in 1459 and founded Jodhpur below it. Its walls rise straight from the rock, up to about 36 m high, so cliff and masonry read as one.',
        'Inside, a sequence of palaces climbs the summit, among them the Moti Mahal, the Sheesh Mahal and the gilded Phool Mahal. A trust run by the former royal family manages the fort and its museum of palanquins, howdahs, arms and paintings.',
        'From the ramparts you see why Jodhpur is called the Blue City: much of the old quarter below is painted indigo.',
      ],
      facts: [['Founded', '1459, Rao Jodha'], ['Height', '125 m above the city'], ['Walls', 'Up to about 36 m high'], ['Entry', fee('mehrangarh'), confirm], ['Hours', '9:00–17:00 (one source; confirm)'], ['Time needed', '2–3 hours'], ['Best time', 'Oct–Mar, mornings']],
      tips: ['Take the audio guide: the museum labels are brief.', 'Go early, before the ramparts heat up.', 'Walk down through the blue lanes to the clock tower market afterwards.'],
      nearby: ['jaswant-thada', 'blue-city', 'umaid-bhawan'],
      spots: [
        { x: 50, y: 40, label: 'Jharokhas', text: 'Projecting balconies with stone screens let the women of the court look out unseen.' },
        { x: 63, y: 86, label: 'Carved sandstone', text: 'Facades are cut from the local red sandstone into screens, brackets and arches.' },
        { x: 12, y: 90, label: 'Chhatris', text: 'Small domed pavilions crown roofs and corners.' },
      ] }),
    place({ id: 'ranakpur', parent: 'wonders', band: 'horizon', order: 4, sil: 'temple', kind: 'Sacred · Pali district', title: 'Ranakpur', native: 'रणकपुर जैन मंदिर', coords: [25.1162, 73.4730], cat: 'sacred', photo: 'ranakpur', alt: 'Rows of intricately carved white marble pillars and domes inside the Ranakpur Jain temple',
      eyebrow: 'Wonder IV · Sacred · Pali district', big: '1,444 pillars. None alike.', line: 'A white marble Jain temple to Adinath, begun in 1437 in a wooded valley of the Aravallis.', teaser: 'A marble Jain temple on 1,444 carved pillars.', aliases: ['ranakpur temple', 'jain temple', 'adinath'],
      story: [
        'In 1437 the Jain merchant Dharna Shah began a temple to Adinath, the first Tirthankara, after a dream. The architect Depa laid it out as a chaumukha, four-faced, so the image of Adinath looks out in all four directions.',
        'The halls stand on 1,444 carved marble pillars under 80 domes, placed so that you can see the sanctum from almost anywhere inside. Building went on for at least 50 years.',
        'It is a working temple. Mornings are kept for worship; visitors who are not Jain are admitted from about noon.',
      ],
      facts: [['Begun', '1437, patron Dharna Shah'], ['Pillars', '1,444'], ['Domes', '80'], ['Halls', '29'], ['Visiting', 'About 12:00–17:00 for non-Jains', 'Mornings are for worship'], ['Dress', 'Shoulders and knees covered; no leather'], ['Time needed', '1.5–2 hours']],
      tips: ['Leave belts, wallets and other leather at the counter.', 'Pair it with Kumbhalgarh: they sit on either side of the same hills.', 'Look up: the domes are carved in concentric rings.'],
      nearby: ['kumbhalgarh', 'jawai', 'city-palace-udaipur'],
      spots: [
        { x: 25, y: 45, label: 'Carved pillars', text: 'Each pillar is carved differently: figures, bells, flowers and bands of ornament.' },
        { x: 52, y: 10, label: 'The domes', text: 'Eighty domes roof the halls; their ceilings are carved in concentric rings.' },
        { x: 56, y: 70, label: 'Sightlines', text: 'Pillars are spaced so the view runs through to the central shrine.' },
      ] }),
    place({ id: 'ranthambore', parent: 'wonders', band: 'horizon', order: 5, sil: 'fort', kind: 'Natural · tigers · UNESCO fort', title: 'Ranthambore', native: 'रणथंभौर', coords: [26.0173, 76.4560], cat: 'wildlife', photo: 'ranthambore', alt: 'A Bengal tiger lying in a waterhole in Ranthambore, looking at the camera', fy: 45,
      eyebrow: 'Wonder V · Wildlife · Sawai Madhopur · UNESCO fort', big: 'Tigers among the ruins', line: 'A tiger reserve where the Aravallis meet the Vindhyas, with a hill fort at its heart.', teaser: 'Wild tigers in dry forest, around a UNESCO hill fort.', aliases: ['tiger', 'safari', 'national park', 'sawai madhopur'],
      story: [
        'Ranthambore National Park covers 1,334 km² of dry forest, lakes and ravines; the wider tiger reserve is larger. Its tigers are often seen by day, which made it one of the best-known places in India to watch them.',
        'A hill fort stands inside the park. UNESCO listed it in 2013 among the Hill Forts of Rajasthan, and its Ganesha temple still draws pilgrims through the forest.',
        'Ranthambore also restocks other reserves. Since 2008 its tigers have been moved to Sariska, where poaching had wiped them out.',
      ],
      facts: [['Park area', '1,334 km²'], ['Tigers', 'At least 40 (approx.)'], ['Season', 'Zones 1–5 open 1 Oct–30 Jun; zones 6–10 also in monsoon'], ['Safari', 'Gypsy (6 seats) or canter (20 seats), about 3 hours'], ['Safari seat', fee('ranthambore'), confirm], ['Booking', 'Official portal, up to 90 days ahead'], ['Fort', 'UNESCO 2013, Hill Forts of Rajasthan']],
      tips: ['Book on the official forest department portal as early as you can; zones are allotted.', 'Winter mornings in an open jeep are cold: bring a warm layer.', 'Do one morning and one afternoon safari; the light and the animals differ.'],
      nearby: ['bundi', 'chand-baori', 'ramgarh-crater'],
      spots: [
        { x: 55, y: 42, label: 'In the waterhole', text: 'Tigers here often cool off in water in the heat of the day.' },
        { x: 38, y: 78, label: 'Stripes', text: 'No two tigers share a stripe pattern; researchers identify individuals from photographs.' },
      ] }),
    place({ id: 'keoladeo', parent: 'wonders', band: 'horizon', order: 6, sil: 'marsh', kind: 'Natural · birds · UNESCO', title: 'Keoladeo', native: 'केवलादेव राष्ट्रीय उद्यान', coords: [27.1591, 77.5226], cat: 'wildlife', photo: 'keoladeo', alt: 'A chital stag wading through shallow water in the Keoladeo wetland, trees behind', fy: 55,
      eyebrow: 'Wonder VI · Wildlife · Bharatpur · UNESCO', big: '370 bird species, 29 km²', line: 'A former royal duck-shooting reserve turned wetland sanctuary, where winter brings birds from northern Asia.', teaser: 'A wetland of 370+ bird species, once a royal shoot.', aliases: ['bharatpur', 'bird sanctuary', 'birds', 'ghana'],
      story: [
        'In the 1850s the rulers of Bharatpur flooded this low ground to make a duck-shooting reserve. The shooting stopped long ago: it became a bird sanctuary in 1976, a Ramsar wetland in 1981, a national park in 1982 and a UNESCO World Heritage Site in 1985.',
        'More than 370 bird species have been recorded in its 29 km². Storks, cormorants and herons nest in the trees after the monsoon, and ducks, geese and raptors arrive for the winter.',
        'It was once the only regular wintering ground in India for the Siberian crane; those birds have not returned for decades. Sarus cranes, the tallest flying birds in the world, still stalk the marshes.',
      ],
      facts: [['Area', '29 km²'], ['Bird species', '370+'], ['Listed', 'UNESCO 1985; Ramsar 1981'], ['Entry', fee('keoladeo'), confirm], ['Getting around', 'On foot, by bicycle or cycle-rickshaw'], ['Best time', 'Oct–Mar for migrants'], ['Hours', 'About 6:00–18:00, varies by season']],
      tips: ['Go at first light, when birds are most active.', 'Hire one of the licensed cycle-rickshaw pullers: they know where the birds are.', 'Bring binoculars; many birds sit far out on the water.'],
      nearby: ['chand-baori', 'sariska', 'bhangarh'],
      spots: [
        { x: 47, y: 63, label: 'Chital stag', text: 'Spotted deer wade between the islands.' },
        { x: 55, y: 35, label: 'Trees in water', text: 'Trees standing in the wetland hold nesting colonies of storks and herons after the monsoon.' },
      ] }),
    place({ id: 'pushkar', parent: 'wonders', band: 'horizon', order: 7, sil: 'lake', kind: 'Sacred · living culture · Ajmer', title: 'Pushkar', native: 'पुष्कर', coords: [26.4875, 74.5543], cat: 'sacred', photo: 'pushkar', alt: 'Pushkar Lake with white ghats and houses on the far shore and hills behind', fy: 55,
      eyebrow: 'Wonder VII · Sacred · Ajmer district', big: '52 ghats, one lake', line: 'A sacred lake ringed by 52 bathing ghats, one of the few temples to Brahma, and each November a great livestock fair.', teaser: 'A holy lake, a rare Brahma temple and the November fair.', aliases: ['pushkar fair', 'camel fair', 'brahma temple'],
      story: [
        'Hindu tradition holds that Brahma, the creator, made the lake where a lotus fell from his hand. Pilgrims bathe from the 52 ghats around it, and Pushkar keeps one of the few temples anywhere dedicated to Brahma.',
        'For eight days around Kartik Purnima, the full moon of November, the sands west of town fill with camels, horses and cattle for trade, then with races, music and pilgrims. In 2026 the fair runs from 17 to 24 November.',
        'Pushkar is a vegetarian town: meat and alcohol are not served. Evening aarti on the ghats, with lamps and bells, is the time to be at the water.',
      ],
      facts: [['Ghats', '52'], ['Fair 2026', '17–24 Nov; Kartik Purnima 24 Nov'], ['From Ajmer', 'About 14 km'], ['From Jaipur', 'About 3 h, 150 km'], ['Best time', 'Oct–Mar'], ['Time needed', '1–2 days']],
      tips: ['Book fair-week rooms months ahead.', 'Ask before photographing people bathing.', 'Shoes off on the ghats.'],
      nearby: ['ajmer-sharif', 'kishangarh', 'sambhar'],
      spots: [
        { x: 86, y: 57, label: 'The ghats', text: 'Fifty-two flights of steps lead down to the water for bathing.' },
        { x: 42, y: 48, label: 'The town', text: 'Lanes lead from the ghats to the Brahma temple and the bazaar.' },
        { x: 15, y: 26, label: 'Hilltop temple', text: 'Temples crown the hills around the town; the climbs are popular at sunrise.' },
      ] }),

    // ---------------- Amber, deeper: inside → Sheesh Mahal → ceiling → thikri ----------------
    { id: 'amber-inside', parent: 'amber-fort', archetype: 'inside', title: 'Inside the palace', native: 'आमेर महल', eyebrow: 'Amber Fort · room by room', big: 'Courts rising uphill', line: 'Walk from the parade ground to the private palaces. Use ← → or the plan below.', coords: [26.9855, 75.8513],
      rooms: [
        { name: 'Jaleb Chowk', photo: 'amber-jaleb-chowk', alt: 'The wide Jaleb Chowk courtyard at Amber with trees and the palace beyond', text: ['The first and largest court. Armies paraded here on their return from campaigns, while the women of the court watched from latticed windows above.'] },
        { name: 'Diwan-i-Aam', photo: 'amber-diwan-i-aam', alt: 'The open pillared Diwan-i-Aam pavilion at Amber Fort', text: ['The Hall of Public Audience: a raised, open pavilion on rows of carved columns where the ruler heard petitions.'] },
        { name: 'Ganesh Pol', photo: 'amber-ganesh-pol', alt: 'The painted three-storey Ganesh Pol gateway at Amber Fort', text: ['A three-storey painted gateway built under Mirza Raja Jai Singh I (1621–1667). It leads into the private palaces; a painted Ganesha, remover of obstacles, sits above the arch.'] },
        { name: 'Garden court', where: 'Jai Mandir and Sukh Niwas', photo: 'amber-jai-mandir', alt: 'A formal garden with fountains in front of the Jai Mandir at Amber Fort', go: 'sheesh-mahal', text: ['A formal garden between two palaces. On one side the Jai Mandir, the hall of private audience, which holds the Sheesh Mahal. Facing it, the Sukh Niwas, where water ran through marble channels to cool the rooms.'] },
        { name: 'Man Singh I Palace', photo: 'amber-zenana', alt: 'A courtyard with a central pavilion in the oldest part of Amber palace', text: ['The oldest part of the palace, around a courtyard with a central pavilion (baradari). The queens’ apartments open off it.'] },
      ] },
    place({ id: 'sheesh-mahal', parent: 'amber-inside', title: 'Sheesh Mahal', native: 'शीश महल', coords: [26.9855, 75.8513], cat: 'heritage', photo: 'amber-sheesh-mahal', alt: 'Interior of the Sheesh Mahal at Amber, walls and vaulted ceiling covered in mirror work, a bright doorway at the end', fy: 45,
      eyebrow: 'Amber Fort · Jai Mandir · c. 1640', big: 'A room of mirrors', line: 'The hall of private audience, built under Mirza Raja Jai Singh I around 1640, its walls and vaults set with thousands of convex mirrors.', teaser: 'Thousands of convex mirrors under one vault.', aliases: ['mirror palace', 'jai mandir', 'sheesh mahal amber'],
      story: [
        'The Jai Mandir was built around 1640 under Mirza Raja Jai Singh I as the hall of private audience. Its mirror work gave it the name Sheesh Mahal, the palace of mirrors.',
        'Every surface carries mirror, coloured glass and plaster relief in floral and geometric patterns. The convex pieces catch light from every angle, so a single flame is multiplied across the ceiling.',
        'The room is roped off to protect the inlay; the best view is from the doorways, looking up.',
      ],
      facts: [['Built', 'Around 1640'], ['Patron', 'Mirza Raja Jai Singh I (r. 1621–1667)'], ['Craft', 'Thikri: mirror pieces set in plaster'], ['Entry', 'Part of the Amber Fort ticket']],
      tips: ['Come early: the room fills quickly.', 'Look at the ceiling from the doorway, then step back to see the walls.'],
      nearby: ['amber-fort', 'nahargarh', 'hawa-mahal'],
      spots: [
        { x: 50, y: 24, label: 'The mirror ceiling', go: 'mirror-ceiling' },
        { x: 36, y: 63, label: 'Wall panels', text: 'Panels of mirror and coloured glass frame painted vases and flowers.' },
        { x: 88, y: 84, label: 'Marble dado', text: 'The lower walls are white marble carved in low relief.' },
      ] }),
    { id: 'mirror-ceiling', parent: 'sheesh-mahal', archetype: 'closeup', title: 'The mirror ceiling', native: 'शीशे की छत', coords: [26.9855, 75.8513], photo: 'amber-ceiling', alt: 'Close view of a corner of the Sheesh Mahal where mirror-covered walls meet the vaulted ceiling', eyebrow: 'Sheesh Mahal · close up', big: 'Light, multiplied', line: 'Close up, the vault is small hand-cut mirrors pressed into plaster in repeating stars and flowers.', noHeart: true,
      notes: [
        { x: 50, y: 15, title: 'Mirror vault', text: 'Thousands of small convex mirror pieces cover the vault in star and flower patterns.' },
        { x: 47, y: 50, title: 'Where wall meets vault', text: 'Bands of mirror follow every edge, so the room reads as one shining surface.' },
        { x: 62, y: 58, title: 'White plaster leaves', text: 'Raised plaster forms break up the glass and give the surface relief.' },
        { x: 38, y: 58, title: 'Dark glass', text: 'Panels of tinted glass add contrast among the silvered pieces.' },
        { x: 22, y: 75, title: 'Wall panels', text: 'Rectangular frames of mirror enclose flower motifs.' },
      ] },
    { id: 'thikri', parent: 'mirror-ceiling', archetype: 'story', title: 'Thikri: the craft', native: 'ठीकरी', eyebrow: 'Craft story', big: 'Shards of light', line: 'How the mirror rooms of Rajasthan are made.', coords: [26.9855, 75.8513],
      pages: [
        { title: 'Thikri means shards', photo: 'amber-mirror-detail', alt: 'A panel in Amber’s Sheesh Mahal with a vase of flowers outlined in small mirror pieces', text: ['Thikri (ठीकरी) is Marwari for shards, small broken pieces. Craftspeople cut thin mirror glass into tiny shapes and set them into a surface to build up floral and geometric patterns.', 'The best-known example is Amber’s Sheesh Mahal.'] },
        { title: 'Plaster first', photo: 'amber-mirror-vase', alt: 'Mirror-inlaid wall at Amber with a vase motif and a small painting', text: ['The wall or ceiling is first coated with lime plaster mixed with marble dust. While it is still damp, the cut mirror pieces are pressed in, following a drawn design.', 'It is slow work: one panel can take days.'] },
        { title: 'A family skill', photo: 'amber-ceiling', alt: 'Mirror-covered corner of the Sheesh Mahal ceiling at Amber', text: ['The skill is passed down in artisan families. Thikri is still made in Rajasthan, for palaces under restoration, for hotels, and for smaller pieces such as panels and tables.'] },
        { title: 'Where else to see it', text: ['Other mirror rooms survive at Mehrangarh in Jodhpur and at the City Palace in Udaipur.'], go: 'mehrangarh', goLabel: 'Go to Mehrangarh' },
      ] },

    // ---------------- horizon: regions ----------------
    { id: 'r-east', parent: 'rajasthan', archetype: 'map', band: 'horizon', coords: [27.05, 76.15], title: 'Jaipur & the East', native: 'ढूँढाड़ · मेवात · ब्रज', crumb: 'East', eyebrow: 'Region · Dhundhar, Mewat and Braj', big: 'Pink city, tiger hills', line: 'The capital and its forts, a 9th-century stepwell, a salt lake, a ruined town, tiger forest and a wetland of birds.', teaser: 'Jaipur, Chand Baori, Sambhar, Bhangarh, Sariska.', jumps: ['amber-fort', 'keoladeo'], legend: ['● place to enter', '◆ one of the seven wonders'], aliases: ['jaipur region', 'east', 'dhundhar'] },
    { id: 'r-shekhawati', parent: 'rajasthan', archetype: 'map', band: 'horizon', coords: [27.9, 74.95], title: 'Shekhawati', native: 'शेखावाटी', crumb: 'Shekhawati', eyebrow: 'Region · north-east', big: 'Painted merchant towns', line: 'Semi-arid towns where Marwari traders covered their havelis in frescoes in the 18th and 19th centuries, and a grassland full of blackbuck.', teaser: 'Painted havelis of Mandawa and Nawalgarh; blackbuck at Tal Chhapar.', legend: ['● place to enter'], aliases: ['havelis', 'frescoes'] },
    { id: 'r-thar', parent: 'rajasthan', archetype: 'map', band: 'horizon', coords: [27.2, 71.6], title: 'The Thar', native: 'थार', crumb: 'Thar', eyebrow: 'Region · Jaisalmer and Bikaner', big: 'The golden desert', line: 'Dunes, the living fort of Jaisalmer and the red city of Bikaner, in the most densely populated desert on Earth.', teaser: 'Jaisalmer, the Sam dunes, Kuldhara, Bikaner, Karni Mata.', jumps: ['jaisalmer-fort'], legend: ['● place to enter', '◆ one of the seven wonders'], aliases: ['desert', 'jaisalmer region', 'bikaner region'] },
    { id: 'r-marwar', parent: 'rajasthan', archetype: 'map', band: 'horizon', coords: [26.35, 73.0], title: 'Marwar', native: 'मारवाड़', crumb: 'Marwar', eyebrow: 'Region · Jodhpur', big: 'Land of the Rathores', line: 'Jodhpur’s blue old city under Mehrangarh, temple towns in the scrub, and the Bishnoi villages that guard their trees.', teaser: 'Jodhpur, Jaswant Thada, Umaid Bhawan, Osian, Khejarli.', jumps: ['mehrangarh'], legend: ['● place to enter', '◆ one of the seven wonders'], aliases: ['jodhpur region'] },
    { id: 'r-mewar', parent: 'rajasthan', archetype: 'map', band: 'horizon', coords: [24.75, 73.5], title: 'Mewar & the Aravallis', native: 'मेवाड़', crumb: 'Mewar', eyebrow: 'Region · Udaipur to Mount Abu', big: 'Lakes, forts, marble', line: 'The old Sisodia kingdom: Udaipur’s lakes, the forts of Chittor and Kumbhalgarh, leopards on granite, the hills of Mount Abu and the green south.', teaser: 'Udaipur, Chittorgarh, Kumbhalgarh, Jawai, Mount Abu, Banswara.', jumps: ['ranakpur'], legend: ['● place to enter', '◆ one of the seven wonders'], aliases: ['udaipur region', 'mewar', 'vagad'] },
    { id: 'r-hadoti', parent: 'rajasthan', archetype: 'map', band: 'horizon', coords: [25.1, 76.2], title: 'Hadoti & Ranthambore', native: 'हाड़ौती', crumb: 'Hadoti', eyebrow: 'Region · south-east', big: 'Murals, water forts, tigers', line: 'The south-east along the Chambal: Bundi’s painted palace, Gagron’s water fort, an impact crater and Ranthambore’s tigers.', teaser: 'Bundi, Gagron, Ramgarh crater, Ranthambore.', jumps: ['ranthambore'], legend: ['● place to enter', '◆ one of the seven wonders'], aliases: ['bundi region', 'kota', 'chambal'] },
    { id: 'r-heartland', parent: 'rajasthan', archetype: 'map', band: 'horizon', coords: [26.5, 74.7], title: 'The Heartland', native: 'अजमेर · पुष्कर · किशनगढ़', crumb: 'Heartland', eyebrow: 'Region · Ajmer, Pushkar and Kishangarh', big: 'Shrines of many faiths', line: 'The centre of the state: a Sufi shrine at Ajmer, Hindu pilgrims at Pushkar, and Kishangarh’s painters.', teaser: 'Ajmer Sharif, Pushkar, Kishangarh.', jumps: ['pushkar'], legend: ['● place to enter', '◆ one of the seven wonders'], aliases: ['ajmer region', 'merwara'] },

    // ---------------- Jaipur & the East ----------------
    { id: 'jaipur', parent: 'r-east', archetype: 'map', city: true, title: 'Jaipur', native: 'जयपुर', coords: [26.9239, 75.8267], cat: 'town', eyebrow: 'City · capital of Rajasthan · UNESCO 2019', big: 'Planned in 1727', line: 'Sawai Jai Singh II laid out a gridded walled city in 1727. Painted pink for the Prince of Wales in 1876, it has been a UNESCO World Heritage Site since 2019.', teaser: 'The Pink City: Hawa Mahal, City Palace, Jantar Mantar, Nahargarh.', bounds: [[75.806, 26.913], [75.838, 26.942]], legend: ['● place to enter'], note: 'Map of the old city. Amber Fort lies 11 km north.', aliases: ['pink city', 'jaipur city'] },
    place({ id: 'hawa-mahal', parent: 'jaipur', title: 'Hawa Mahal', native: 'हवा महल', coords: [26.9239, 75.8267], cat: 'heritage', photo: 'hawa-mahal', alt: 'The five-storey pink sandstone facade of the Hawa Mahal with its many small windows, above a busy street', fy: 40,
      eyebrow: 'Jaipur · Heritage', big: '953 windows, one facade', line: 'Built in 1799 so the women of the court could watch the street unseen: a five-storey screen of pink sandstone.', teaser: 'A honeycomb of 953 windows over the bazaar.', aliases: ['palace of winds', 'wind palace'],
      story: [
        'Maharaja Sawai Pratap Singh had the Hawa Mahal built in 1799 to a design by Lal Chand Ustad. Its 953 small windows, or jharokhas, let the women of the palace, who kept purdah, watch processions in the street without being seen.',
        'The building is mostly facade: five storeys of honeycombed sandstone, shaped like the crown of Krishna, some floors only a room deep. The lattices pull air through, which gave it its name: Palace of Winds.',
        'The best view is from across the road early in the morning, when the sun lights the east-facing front.',
      ],
      facts: [['Built', '1799, Maharaja Sawai Pratap Singh'], ['Architect', 'Lal Chand Ustad'], ['Windows', '953 jharokhas'], ['Storeys', '5'], ['Entry', fee('hawa-mahal'), `Covered by the composite ticket · ${confirm}`], ['Time needed', '45 minutes'], ['Best time', 'Early morning']],
      tips: ['The entrance is round the back, not on the famous street front.', 'Cafés across the road have the best view of the facade.'],
      nearby: ['city-palace-jaipur', 'jantar-mantar', 'nahargarh'],
      spots: [
        { x: 50, y: 46, label: 'Jharokhas', text: 'Small windows with lattice screens let air through and hid the women of the court.' },
        { x: 50, y: 15, label: 'Crown shape', text: 'The tapering top storeys echo the crown of Krishna.' },
        { x: 50, y: 88, label: 'The street front', text: 'The facade faces the main bazaar; the way in is from behind.' },
      ] }),
    place({ id: 'city-palace-jaipur', parent: 'jaipur', title: 'City Palace, Jaipur', native: 'सिटी पैलेस', coords: [26.9258, 75.8237], cat: 'heritage', photo: 'city-palace-jaipur', alt: 'The cream and pink seven-storey Chandra Mahal at Jaipur’s City Palace against a blue sky', fx: 55, fy: 35,
      eyebrow: 'Jaipur · Heritage', big: 'Still a royal home', line: 'Chandra Mahal, the seven-storey heart of the palace, is still the residence of the former royal family; much of the rest is a museum.', teaser: 'A seven-storey palace that is still a home.', aliases: ['chandra mahal', 'city palace'],
      story: [
        'Sawai Jai Singh II built the palace at the centre of his grid when he founded Jaipur in 1727. The seven-storey Chandra Mahal is still home to the former royal family.',
        'Courtyards, halls and the Mubarak Mahal are open as the City Palace museum: textiles, arms, royal costumes, and two giant silver urns made to carry Ganges water to London in 1902.',
        'In the Pritam Niwas Chowk courtyard, four painted gateways stand for the four seasons. The peacock gate is the one everyone photographs.',
      ],
      facts: [['Built', 'From 1727, Sawai Jai Singh II'], ['Chandra Mahal', '7 storeys, still a residence'], ['Entry', 'Ticketed by the City Palace museum; prices vary by tour', confirm], ['Time needed', '1.5–2 hours']],
      tips: ['Go early to see the courtyard gates before the crowds.', 'Combine with Jantar Mantar next door.'],
      nearby: ['jantar-mantar', 'hawa-mahal', 'nahargarh'],
      spots: [
        { x: 47, y: 22, label: 'Seven storeys', text: 'The upper floors of the Chandra Mahal; the former royal family still lives here.' },
        { x: 88, y: 72, label: 'Museum courts', text: 'Courts and halls around the Chandra Mahal form the City Palace museum.' },
      ] }),
    place({ id: 'jantar-mantar', parent: 'jaipur', title: 'Jantar Mantar', native: 'जंतर मंतर', coords: [26.9248, 75.8246], cat: 'heritage', photo: 'jantar-mantar', alt: 'A tall stone instrument with a stepped gnomon and curved quadrants at Jaipur’s Jantar Mantar', fy: 50,
      eyebrow: 'Jaipur · Science · UNESCO 2010', big: 'Astronomy in stone', line: 'Nineteen masonry instruments, completed in 1734, that measure time, track stars and predict eclipses.', teaser: 'Nineteen giant stone instruments for reading the sky.', aliases: ['observatory', 'astronomy', 'sundial'],
      story: [
        'Sawai Jai Singh II, Jaipur’s founder, was an astronomer. He built observatories in five cities; Jaipur’s, completed in 1734, is the largest and best preserved, with 19 instruments.',
        'The instruments are buildings, and you read them by walking around them. The Rashivalaya group has one instrument for each sign of the zodiac; the Jai Prakash bowls map the sky onto marble.',
        'UNESCO listed it in 2010. Go in the morning, when the shadows on the dials are sharp.',
      ],
      facts: [['Completed', '1734, Sawai Jai Singh II'], ['Instruments', '19'], ['Largest', 'Samrat Yantra, 27 m'], ['Listed', 'UNESCO 2010'], ['Entry', fee('jantar-mantar'), `Covered by the composite ticket · ${confirm}`], ['Time needed', '1–1.5 hours']],
      tips: ['A guide or the audio guide makes the instruments make sense.', 'Morning light gives the clearest shadows.'],
      nearby: ['city-palace-jaipur', 'hawa-mahal', 'nahargarh'],
      spots: [
        { x: 52, y: 30, label: 'Gnomon', text: 'Each Rashivalaya instrument has a gnomon tilted for its sign of the zodiac.' },
        { x: 33, y: 64, label: 'Quadrant scales', text: 'The shadow of the gnomon is read off marked, curved scales.' },
      ] }),
    { id: 'samrat-yantra', parent: 'jantar-mantar', archetype: 'closeup', title: 'Samrat Yantra', native: 'सम्राट यंत्र', coords: [26.9248, 75.8246], cat: 'heritage', photo: 'samrat-yantra', alt: 'The giant triangular gnomon of the Samrat Yantra at Jaipur, with a visitor standing in the foreground for scale', eyebrow: 'Jantar Mantar · close up', big: 'A sundial 27 m tall', line: 'The giant sundial at Jaipur, finished in 1734, tells local time to about 2 seconds.', aliases: ['largest sundial', 'brihat samrat yantra'],
      notes: [
        { x: 25, y: 42, title: 'The gnomon', text: 'A right-angled wall 27 m high. Its sloping edge is parallel to Earth’s axis, pointing at the celestial pole.' },
        { x: 40, y: 40, title: 'The staircase edge', text: 'Steps run up the sloping edge to the top.' },
        { x: 19, y: 6, title: 'The pavilion', text: 'A small pavilion crowns the top of the gnomon.' },
        { x: 90, y: 62, title: 'For scale', text: 'A visitor at the right of the photo.' },
        { title: 'How it tells time', text: 'The gnomon’s shadow falls on curved quadrant scales on either side; its position gives local solar time, to about 2 seconds.' },
      ] },
    place({ id: 'nahargarh', parent: 'jaipur', title: 'Nahargarh', native: 'नाहरगढ़', coords: [26.9373, 75.8155], cat: 'heritage', photo: 'nahargarh', alt: 'Crenellated walls of Nahargarh running along a scrubby Aravalli ridge, with a stepped water tank below', fy: 55,
      eyebrow: 'Jaipur · Heritage', big: 'Jaipur’s ridge-top guard', line: 'Built in 1734 on the Aravalli ridge above the city, with walls running along the hilltops toward Jaigarh.', teaser: 'Ridge-top walls and a sunset view over the Pink City.', aliases: ['nahargarh fort', 'sunset point'],
      story: [
        'Sawai Jai Singh II built Nahargarh in 1734 as a retreat and lookout on the ridge above his new city. Its walls run along the hilltops toward Jaigarh Fort.',
        'Inside, the Madhavendra Bhawan was added by Sawai Madho Singh: a set of near-identical suites for the queens around a courtyard, with the king’s suite at the head.',
        'Most people come for the view: at sunset the whole old city lies below.',
      ],
      facts: [['Built', '1734, Sawai Jai Singh II'], ['Madhavendra Bhawan', 'Added by Sawai Madho Singh'], ['Entry', fee('nahargarh'), `Covered by the composite ticket · ${confirm}`], ['Time needed', '2 hours, including sunset'], ['Getting there', 'By road via the Amber side, or a steep path from the old city']],
      tips: ['Stay for sunset, then head down before dark.', 'Combine with Jaigarh and Amber along the same ridge.'],
      nearby: ['amber-fort', 'city-palace-jaipur', 'hawa-mahal'],
      spots: [
        { x: 30, y: 62, label: 'Ridge walls', text: 'Walls follow the Aravalli ridge, linking Nahargarh toward Jaigarh.' },
        { x: 56, y: 66, label: 'Stepped tank', text: 'A stepped tank collected monsoon rain for the fort.' },
      ] }),
    place({ id: 'chand-baori', parent: 'r-east', title: 'Chand Baori', native: 'चाँद बावड़ी', coords: [27.0074, 76.6067], cat: 'heritage', photo: 'chand-baori', alt: 'Looking down into Chand Baori: criss-crossing flights of steps descend on three sides',
      eyebrow: 'Abhaneri · Heritage · Dausa district', big: '3,500 steps, 13 storeys', line: 'A stepwell of the 8th–9th century in the village of Abhaneri, built to reach water through the dry season.', teaser: 'A 13-storey stepwell of 3,500 steps.', aliases: ['abhaneri', 'stepwell', 'baori'],
      story: [
        'Stepwells were how this dry land stored water. At Chand Baori, 3,500 narrow steps in criss-crossing flights descend about 30 m on three sides to a square pool.',
        'It is named after Raja Chanda of the Nikumbh dynasty and dated to the 8th–9th century, though no inscription records its building. The fourth side holds galleries.',
        'Next door, the Harshat Mata temple, also of about the 8th century, is dedicated to a goddess of joy. Its broken carvings are worth the extra minutes.',
      ],
      facts: [['Steps', 'About 3,500'], ['Depth', 'About 30 m, 13 storeys'], ['Age', '8th–9th century'], ['Next door', 'Harshat Mata temple'], ['Time needed', '1 hour'], ['From Jaipur', 'About 90 km by road (approx.)']],
      tips: ['You can’t walk down the steps; the view is from the top.', 'Stop on the way between Jaipur and Agra, Keoladeo or Ranthambore.'],
      nearby: ['keoladeo', 'bhangarh', 'sariska'],
      spots: [
        { x: 40, y: 40, label: 'Criss-cross flights', text: 'Narrow double flights descend 13 levels.' },
        { x: 90, y: 84, label: 'Galleries', text: 'The fourth side has carved galleries.' },
        { x: 40, y: 83, label: 'Viewing only', text: 'Railings keep visitors at the top.' },
      ] }),
    place({ id: 'sambhar', parent: 'r-east', title: 'Sambhar Salt Lake', native: 'साँभर झील', coords: [26.93, 75.10], cat: 'nature', photo: 'sambhar', alt: 'A still, grey salt lake with a small building reflected in the water',
      eyebrow: 'Jaipur district · Nature · Ramsar site', big: 'India’s largest inland salt lake', line: 'A shallow saline lake west of Jaipur that makes salt and, in good years, draws flamingos in winter.', teaser: 'India’s largest inland salt lake, with winter flamingos.', aliases: ['salt lake', 'flamingos'],
      story: [
        'Sambhar is India’s largest inland salt lake: 35.5 km long and 3 to 11 km wide. Its surface swells from about 190 km² to more than 2,300 km² depending on the rain.',
        'Salt has been made here for centuries, by evaporating brine in pans along the shore.',
        'It has been a Ramsar wetland since 1990 because tens of thousands of flamingos, pelicans and other migrants winter here. In dry years the birds go elsewhere.',
      ],
      facts: [['Length', '35.5 km'], ['Area', '190 to 2,300 km², with the rain'], ['Ramsar site', 'Since 23 March 1990'], ['Best time', 'Nov–Feb for flamingos'], ['From Jaipur', 'About 80 km (approx.)']],
      tips: ['Ask locally where the birds are: they move with the water.', 'Sunset over the flats is the time for photos.'],
      nearby: ['kishangarh', 'pushkar', 'city-palace-jaipur'],
      spots: [
        { x: 53, y: 43, label: 'Still water', text: 'The lake is shallow; on calm days it mirrors everything.' },
        { x: 18, y: 42, label: 'Shoreline', text: 'Embankments and pans along the shore are used for salt.' },
      ] }),
    place({ id: 'bhangarh', parent: 'r-east', title: 'Bhangarh', native: 'भानगढ़', coords: [27.0961, 76.2896], cat: 'heritage', photo: 'bhangarh', alt: 'A roofless stone gateway of the Bhangarh palace, with hills and the plain beyond under a cloudy sky', fy: 60,
      eyebrow: 'Alwar district · Heritage · ASI', big: 'A town left to ruin', line: 'Founded in 1573 for Madho Singh, son of Bhagwant Das of Amber; its bazaars, temples and palace now stand empty.', teaser: 'A 16th-century town, empty and roofless.', aliases: ['haunted fort', 'bhangarh fort'],
      story: [
        'Bhagwant Das of Amber founded Bhangarh in 1573 as the seat of his second son, Madho Singh. The walled town had a market street, temples and a palace climbing the hill.',
        'It was later abandoned, and records do not say why. Local legends of curses made it famous as a ‘haunted’ fort.',
        'The Archaeological Survey of India closes the site from sunset to sunrise, partly because it borders the forest of Sariska.',
      ],
      facts: [['Founded', '1573'], ['Built by', 'Bhagwant Das, for his son Madho Singh'], ['Open', 'Sunrise to sunset (ASI)'], ['Time needed', '1.5 hours'], ['From Jaipur', 'About 85 km (approx.)']],
      tips: ['Go early in the day: it is hot and shadeless by noon.', 'Walk to the top of the palace for the view over the plain.'],
      nearby: ['sariska', 'chand-baori', 'amber-fort'],
      spots: [
        { x: 50, y: 72, label: 'Palace gateway', text: 'Stone gateways and walls of the palace complex, roofless today.' },
        { x: 40, y: 46, label: 'Aravalli foothills', text: 'The ruins sit at the edge of the hills; the plain stretches beyond.' },
      ] }),
    place({ id: 'sariska', parent: 'r-east', title: 'Sariska', native: 'सरिस्का', coords: [27.32, 76.43], cat: 'wildlife', photo: 'sariska', alt: 'A dirt track through dry forest toward rocky cliffs in Sariska, a yellow-flowering tree at right',
      eyebrow: 'Alwar district · Tiger reserve', big: 'The tigers came back', line: 'A tiger reserve in the Aravalli hills that lost every tiger to poaching by 2005, and got them back from Ranthambore.', teaser: 'A reserve that lost its tigers, then got them back.', aliases: ['sariska tiger reserve', 'alwar'],
      story: [
        'By January 2005 Sariska had no tigers left: poaching had emptied it.',
        'In July 2008 the first two tigers were moved in from Ranthambore. After 13 translocations, the population had recovered to 43 by March 2024.',
        'The reserve is dry forest, cliffs and old temples; sambar, chital, nilgai and langurs are common.',
      ],
      facts: [['Tigers', '43 (March 2024)'], ['Reintroduced', 'From 2008'], ['District', 'Alwar'], ['Safaris', 'Gypsy and canter, booked through the forest department'], ['Best time', 'Oct–Jun']],
      tips: ['Combine with Bhangarh, at the reserve’s edge.', 'Book safaris ahead in winter.'],
      nearby: ['bhangarh', 'keoladeo', 'chand-baori'],
      spots: [
        { x: 35, y: 25, label: 'Cliffs', text: 'Rock cliffs of the Aravalli hills wall the valleys.' },
        { x: 52, y: 90, label: 'Forest track', text: 'Safaris follow tracks like this one through dry forest.' },
      ] }),

    // ---------------- Shekhawati ----------------
    place({ id: 'mandawa', parent: 'r-shekhawati', title: 'Mandawa', native: 'मंडावा', coords: [28.0552, 75.1494], cat: 'town', photo: 'mandawa', alt: 'Upper storey of a Mandawa haveli covered in faded frescoes in blue, red and ochre above carved stone brackets', fy: 40,
      eyebrow: 'Jhunjhunu district · Town', big: 'Walls painted for show', line: 'A Shekhawati town of frescoed havelis around a fort founded in 1755.', teaser: 'Painted mansions around a 1755 fort.', aliases: ['shekhawati', 'haveli', 'fresco'],
      story: [
        'Thakur Nawal Singh founded Mandawa’s fort in 1755. As caravan trade made local merchant families rich, they built havelis, courtyard mansions, and paid painters to cover them inside and out.',
        'The frescoes mix gods and epics with what the merchants saw in the wider world: camel caravans and bazaars, but also steam trains and motorcars.',
        'Many families moved to Kolkata and Mumbai in the 20th century. Some havelis are now hotels; others are locked or fading. Caretakers often open them for a small fee.',
      ],
      facts: [['Fort founded', '1755'], ['District', 'Jhunjhunu'], ['From Jaipur', 'About 170 km (approx.)'], ['Time needed', '1 day'], ['Best time', 'Oct–Mar']],
      tips: ['Hire a local guide: the best havelis are not signposted.', 'Look up: the finest scenes are under the eaves.'],
      nearby: ['nawalgarh', 'tal-chhapar', 'junagarh'],
      spots: [
        { x: 45, y: 32, label: 'Painted panels', text: 'Upper panels show gods and figures in blue, red and ochre.' },
        { x: 40, y: 82, label: 'Carved brackets', text: 'Stone brackets carry the overhanging balcony.' },
        { x: 8, y: 55, label: 'Weathered walls', text: 'Unrestored walls fade in sun and rain.' },
      ] }),
    place({ id: 'nawalgarh', parent: 'r-shekhawati', title: 'Nawalgarh', native: 'नवलगढ़', coords: [27.85, 75.27], cat: 'town', photo: 'nawalgarh', alt: 'Cusped arches of the Morarka Haveli in Nawalgarh, painted with vases of flowers and patterned borders',
      eyebrow: 'Jhunjhunu district · Town', big: 'Courtyards of painted arches', line: 'Founded in 1737 by Thakur Nawal Singh; the restored Morarka Haveli shows how bright the paintings once were.', teaser: 'Restored frescoes at the Morarka Haveli.', aliases: ['morarka haveli'],
      story: [
        'Nawalgarh was founded in 1737 and grew rich on trade. Its merchant havelis hold some of the most complete frescoes in Shekhawati.',
        'The Morarka Haveli Museum has been restored, so its painted arches, door frames and courtyards look close to how they did when new.',
        'Walk the lanes between havelis and look up: the most detailed scenes are often under the eaves and above doorways.',
      ],
      facts: [['Founded', '1737'], ['Museum', 'Morarka Haveli'], ['District', 'Jhunjhunu'], ['Time needed', 'Half a day']],
      tips: ['Start at the Morarka Haveli to see restored colour before the faded ones.', 'Combine with Mandawa, about 25 km away.'],
      nearby: ['mandawa', 'tal-chhapar', 'junagarh'],
      spots: [
        { x: 40, y: 20, label: 'Cusped arches', text: 'Arches with scalloped edges, painted inside and out.' },
        { x: 70, y: 62, label: 'Flower vases', text: 'A favourite motif: vases of flowers in mirrored pairs.' },
        { x: 31, y: 40, label: 'Border patterns', text: 'Columns and frames carry repeating painted borders.' },
      ] }),
    place({ id: 'tal-chhapar', parent: 'r-shekhawati', title: 'Tal Chhapar', native: 'ताल छापर', coords: [27.80, 74.43], cat: 'wildlife', photo: 'tal-chhapar', alt: 'Two male blackbuck with spiralled horns face each other on dry grassland at Tal Chhapar', fy: 55,
      eyebrow: 'Churu district · Wildlife sanctuary', big: 'Blackbuck on open grass', line: 'A 7.19 km² grassland sanctuary with about 4,000 blackbuck and dozens of raptor species in winter.', teaser: 'About 4,000 blackbuck on open grassland.', aliases: ['blackbuck', 'raptors', 'churu'],
      story: [
        'Tal Chhapar is flat grassland, open to the horizon, protected for its blackbuck: about 4,000 live here. Adult males are dark above with spiralled horns; females and young are fawn.',
        'In winter it draws raptors: more than 40 species have been recorded, including harriers and eagles. Over 300 bird species are listed in all.',
        'The sanctuary is small and flat, so you can drive its tracks in a couple of hours. Early morning and late afternoon are best.',
      ],
      facts: [['Area', '7.19 km²'], ['Blackbuck', 'About 4,000'], ['Raptor species', '40+'], ['Bird species', '300+'], ['District', 'Churu'], ['Best time', 'Sep–Mar']],
      tips: ['Stay in the vehicle near the herds; they run if approached on foot.', 'Bring a long lens and binoculars for raptors.'],
      nearby: ['mandawa', 'junagarh', 'karni-mata'],
      spots: [
        { x: 28, y: 62, label: 'Male blackbuck', text: 'Adult males are dark brown-black above and white below.' },
        { x: 63, y: 32, label: 'Spiral horns', text: 'Only males carry the long spiralled horns.' },
        { x: 85, y: 20, label: 'Open grassland', text: 'Flat, open grass: the habitat the sanctuary protects.' },
      ] }),

    // ---------------- The Thar ----------------
    place({ id: 'patwon-ki-haveli', parent: 'r-thar', title: 'Patwon ki Haveli', native: 'पटवों की हवेली', coords: [26.9157, 70.9161], cat: 'heritage', photo: 'patwon-ki-haveli', alt: 'Golden sandstone facades of the Patwon ki Haveli in Jaisalmer, stacked with carved balconies', fy: 40,
      eyebrow: 'Jaisalmer · Heritage', big: 'Five mansions in stone', line: 'A cluster of five carved sandstone havelis begun in 1805 by the merchant Guman Chand Patwa.', teaser: 'Five carved merchant mansions from 1805.', aliases: ['patwa haveli', 'havelis jaisalmer'],
      story: [
        'Guman Chand Patwa, a wealthy trader, began the first haveli in 1805, and the cluster grew to five. Building took about 55 years.',
        'The facades are carved yellow sandstone, so fine they look like lace: jharokhas, brackets and lattice screens, storey upon storey.',
        'One haveli is a museum furnished as a merchant’s house; others hold shops.',
      ],
      facts: [['Begun', '1805'], ['Havelis', '5'], ['Building time', 'About 55 years'], ['Location', 'Jaisalmer old town'], ['Time needed', '1 hour']],
      tips: ['Visit in the morning, when the lane is in sun.', 'The museum haveli shows how the rooms were used.'],
      nearby: ['jaisalmer-fort', 'gadisar', 'kuldhara'],
      spots: [
        { x: 25, y: 35, label: 'Jharokhas', text: 'Projecting balconies on carved brackets, storey upon storey.' },
        { x: 40, y: 85, label: 'Arched ground floor', text: 'Doorways and shops open at street level.' },
        { x: 75, y: 30, label: 'Five in a row', text: 'The havelis run one after another along the lane.' },
      ] }),
    place({ id: 'gadisar', parent: 'r-thar', title: 'Gadisar Lake', native: 'गड़ीसर झील', coords: [26.905, 70.922], cat: 'heritage', photo: 'gadisar', alt: 'Gadisar Lake in Jaisalmer with sandstone temples and pavilions on its banks and boats moored in front',
      eyebrow: 'Jaisalmer · Heritage', big: 'A reservoir in the desert', line: 'Created when Jaisalmer was founded in 1156 and rebuilt around 1367 by Rawal Gadsi, the lake held the town’s water.', teaser: 'A 12th-century reservoir lined with temples.', aliases: ['gadsisar', 'lake jaisalmer'],
      story: [
        'In the desert, water decided where towns stood. Rawal Jaisal created this reservoir when he founded Jaisalmer in 1156; Rawal Gadsi rebuilt it around 1367, which gave it its name.',
        'Its banks are lined with temples, ghats and chhatris, and pavilions stand out in the water.',
        'Come at sunrise or sunset, when the sandstone glows. Boats can be hired at the ghat.',
      ],
      facts: [['Created', '1156'], ['Rebuilt', 'Around 1367, Rawal Gadsi'], ['Location', 'Edge of Jaisalmer town'], ['Time needed', '1 hour']],
      tips: ['Sunrise is quiet; sunset is busy.', 'Walk the ghats to see the pavilions from several angles.'],
      nearby: ['jaisalmer-fort', 'patwon-ki-haveli', 'sam-dunes'],
      spots: [
        { x: 90, y: 48, label: 'Pavilion in the water', text: 'A domed chhatri stands out in the lake.' },
        { x: 52, y: 25, label: 'Lakeside temples', text: 'Temples and ghats line the banks.' },
        { x: 38, y: 93, label: 'Boats', text: 'Pedal and rowing boats can be hired.' },
      ] }),
    place({ id: 'sam-dunes', parent: 'r-thar', title: 'Sam sand dunes', native: 'सम के धोरे', coords: [26.86, 70.49], cat: 'terrain', photo: 'sam-dunes', alt: 'Rippled sand dunes at Sam stretching to a flat horizon dotted with scrub', fy: 50,
      eyebrow: 'Jaisalmer district · Terrain', big: 'Dunes, 30 to 60 m', line: 'Rolling sand dunes about 42 km west of Jaisalmer, at the edge of the Desert National Park.', teaser: 'The Thar’s best-known dunes, 42 km west of Jaisalmer.', aliases: ['sand dunes', 'camel safari', 'desert camp'],
      story: [
        'Much of the Thar is scrub and rock. At Sam the wind has piled sand into dunes 30 to 60 m high across a few kilometres.',
        'Camel rides, tent camps and folk music gather at the main dunes in the evening, and it gets busy. Quieter dunes lie further out, toward Khuri.',
        'In February the Desert Festival ends here, under the full moon.',
      ],
      facts: [['From Jaisalmer', '42 km'], ['Dune height', '30–60 m'], ['Desert Festival', 'About 18–20 Feb 2027 (approx.)'], ['Best time', 'Oct–Mar'], ['Time needed', 'An evening or overnight']],
      tips: ['Sunset is crowded; sunrise is not.', 'Winter nights are cold: bring a warm layer.', 'Choose a camp that keeps its music down if you want the stars.'],
      nearby: ['desert-np', 'kuldhara', 'gadisar'],
      spots: [
        { x: 22, y: 66, label: 'Wind ripples', text: 'Ripples form at right angles to the wind.' },
        { x: 60, y: 28, label: 'Dune field', text: 'Dunes here rise 30 to 60 m.' },
        { x: 50, y: 14, label: 'Scrub plain', text: 'Beyond the dunes the Thar is mostly flat scrub.' },
      ] }),
    place({ id: 'kuldhara', parent: 'r-thar', title: 'Kuldhara', native: 'कुलधरा', coords: [26.8124, 70.7979], cat: 'town', photo: 'kuldhara', alt: 'Roofless stone walls of abandoned houses at Kuldhara on a flat desert plain', fy: 45,
      eyebrow: 'Jaisalmer district · Abandoned village', big: 'A village left standing', line: 'A Paliwal Brahmin village near Jaisalmer, settled around the 13th century and abandoned by the early 19th.', teaser: 'An abandoned Paliwal village of stone houses.', aliases: ['abandoned village', 'ghost village'],
      story: [
        'Paliwal Brahmins farmed this valley from around the 13th century, in a village laid out in rows along lanes.',
        'By the early 19th century everyone had gone. Historians point to failing water or an earthquake; local legend blames the cruelty of Salim Singh, a minister of Jaisalmer State, and says the villagers left together in one night.',
        'Roofless stone houses, a temple and the lanes remain; a few houses have been rebuilt to show how they looked.',
      ],
      facts: [['Settled', 'Around the 13th century'], ['Abandoned', 'By the early 19th century'], ['From Jaisalmer', 'About 16 km (approx.)'], ['Time needed', '1 hour']],
      tips: ['Combine with the drive to the Sam dunes.', 'Go early or late: there is no shade.'],
      nearby: ['sam-dunes', 'gadisar', 'jaisalmer-fort'],
      spots: [
        { x: 40, y: 55, label: 'Stone houses', text: 'Walls of local stone, laid in rough courses.' },
        { x: 72, y: 30, label: 'Lanes', text: 'Houses stand in rows along straight lanes.' },
        { x: 60, y: 10, label: 'Open scrub', text: 'The village sat in open scrub west of Jaisalmer.' },
      ] }),
    place({ id: 'desert-np', parent: 'r-thar', title: 'Desert National Park', native: 'मरु राष्ट्रीय उद्यान', coords: [26.65, 70.60], cat: 'wildlife', photo: 'desert-np', alt: 'Two great Indian bustards standing in dry grassland in Desert National Park',
      eyebrow: 'Jaisalmer and Barmer · Wildlife', big: 'Last stand of the bustard', line: '3,162 km² of dunes, rock and grass, the main refuge of the great Indian bustard.', teaser: 'The last refuge of the great Indian bustard.', aliases: ['great indian bustard', 'godawan', 'dnp'],
      story: [
        'The park protects a slice of the Thar as it was: rolling dunes, rocky plateaus and grass, spread over 3,162 km² of Jaisalmer and Barmer districts.',
        'It is the main refuge of the great Indian bustard, a heavy grassland bird that stands about a metre tall. A 2025 survey put the remaining population at about 130 (±21), most of them in the Thar.',
        'Power lines and the loss of grassland are the main threats. Chinkara, desert foxes and many raptors live here too.',
      ],
      facts: [['Area', '3,162 km²'], ['Districts', 'Jaisalmer and Barmer'], ['Bustards', 'About 130 left (2025 survey)'], ['Visits', 'By permit; arrange through the forest department or a local naturalist'], ['Best time', 'Oct–Mar'], ['Coordinates', 'Park centre, approx.']],
      tips: ['Go with a local naturalist at dawn; bustards are shy.', 'Stay on tracks: the grassland is the habitat.'],
      nearby: ['sam-dunes', 'kuldhara', 'jaisalmer-fort'],
      spots: [
        { x: 20, y: 60, label: 'Great Indian bustard', text: 'A pair in Desert National Park. Adults stand about a metre tall.' },
        { x: 45, y: 65, label: 'Grass and scrub', text: 'Bustards need open grassland, which this park protects.' },
      ] }),
    place({ id: 'junagarh', parent: 'r-thar', title: 'Junagarh Fort', native: 'जूनागढ़ किला', coords: [28.0218, 73.3186], cat: 'heritage', photo: 'junagarh', alt: 'Red sandstone walls and palace storeys of Junagarh Fort in Bikaner, pigeons in the forecourt',
      eyebrow: 'Bikaner · Heritage', big: 'Red walls, painted rooms', line: 'Raja Rai Singh built the fort in 1589–1594 on the plain at Bikaner, a city founded in 1488 by Rao Bika.', teaser: 'A plains fort with gold-leaf and painted rooms.', aliases: ['bikaner fort', 'bikaner'],
      story: [
        'Unusually for Rajasthan, Junagarh stands on flat ground rather than a hill. Raja Rai Singh, a general of Akbar, built it between 1589 and 1594, and later rulers kept adding palaces.',
        'Inside, rooms are covered in gold leaf, mirror work and painted lacquer; the Badal Mahal is painted with clouds.',
        'Bikaner was founded in 1488 by Rao Bika, a son of Rao Jodha of Jodhpur. The city is also known for bhujia, its spiced gram-flour snack.',
      ],
      facts: [['Built', '1589–1594, Raja Rai Singh'], ['City founded', '1488, Rao Bika'], ['From Jaipur', 'About 330 km, 6 h'], ['Time needed', '2 hours']],
      tips: ['Take a guided tour: some rooms open only with a guide.', 'Combine with Karni Mata at Deshnoke, 30 km south.'],
      nearby: ['karni-mata', 'tal-chhapar', 'mandawa'],
      spots: [
        { x: 40, y: 62, label: 'Red sandstone walls', text: 'The fort is built of red sandstone on open ground.' },
        { x: 60, y: 38, label: 'Palace storeys', text: 'Palaces rise above the walls, with jharokha balconies.' },
      ] }),
    place({ id: 'karni-mata', parent: 'r-thar', title: 'Karni Mata Temple', native: 'करणी माता मंदिर', coords: [27.7905, 73.3407], cat: 'sacred', photo: 'karni-mata', alt: 'The carved white marble gateway of the Karni Mata temple at Deshnoke, set in pink walls', fy: 50,
      eyebrow: 'Deshnoke · Sacred', big: 'Where rats are sacred', line: 'At Deshnoke, 30 km south of Bikaner, thousands of rats live in a temple to Karni Mata and are fed by devotees.', teaser: 'A temple where thousands of rats are sacred.', aliases: ['rat temple', 'deshnoke'],
      story: [
        'Karni Mata, a 15th-century sage, is worshipped as a form of the goddess Durga. Her followers believe their families are reborn as the rats, called kabbas, that live in her temple.',
        'Estimates run past 20,000 rats. Spotting one of the few white rats is considered especially lucky.',
        'The present temple was completed in the early 20th century by Maharaja Ganga Singh of Bikaner, who gave its solid silver doors.',
      ],
      facts: [['Rats', '20,000+ (estimates)'], ['Built', 'Early 20th century, Maharaja Ganga Singh'], ['From Bikaner', 'About 30 km'], ['Dress', 'Shoes off at the gate'], ['Time needed', '1 hour']],
      tips: ['Shoes come off at the gate: bring socks if you prefer.', 'Walk carefully; stepping on a rat is considered bad luck.'],
      nearby: ['junagarh', 'tal-chhapar', 'mandawa'],
      spots: [
        { x: 50, y: 62, label: 'Marble gateway', text: 'The carved marble front dates from the early 20th century; the silver doors are inside.' },
        { x: 77, y: 80, label: 'Carved lions', text: 'Marble lions guard the steps.' },
      ] }),

    // ---------------- Marwar ----------------
    place({ id: 'blue-city', parent: 'r-marwar', title: 'The Blue City', native: 'नीला शहर', coords: [26.298, 73.024], cat: 'town', photo: 'blue-city', alt: 'Blue-painted houses of old Jodhpur at dawn with Mehrangarh Fort on its cliff above', fy: 55,
      eyebrow: 'Jodhpur · Town', big: 'A city washed in indigo', line: 'The old quarter below Mehrangarh, where many houses are painted blue, around the clock tower market.', teaser: 'Jodhpur’s blue lanes under the fort.', aliases: ['jodhpur', 'brahmpuri', 'clock tower', 'sardar market'],
      story: [
        'Look down from Mehrangarh and much of the old city is blue. Explanations vary: tradition links the colour to Brahmin households, others say it cools the walls or keeps insects away. None is proven.',
        'The lanes of the old quarter are best on foot. They are steep, narrow and full of motorbikes.',
        'The Ghanta Ghar clock tower stands in Sardar Market, where spices, textiles and bangles are sold.',
      ],
      facts: [['City founded', '1459, Rao Jodha'], ['Market', 'Sardar Market, around the clock tower'], ['Time needed', 'Half a day'], ['Food', 'Pyaaz kachori and mirchi bada']],
      tips: ['Walk down from Mehrangarh through the blue lanes.', 'Try a pyaaz kachori near the clock tower.'],
      nearby: ['mehrangarh', 'jaswant-thada', 'umaid-bhawan'],
      spots: [
        { x: 40, y: 37, label: 'Mehrangarh', text: 'The fort on its cliff, 125 m above the city.' },
        { x: 35, y: 82, label: 'Blue houses', text: 'Many houses in the old quarter are washed blue.' },
        { x: 62, y: 62, label: 'Old city', text: 'Narrow lanes climb toward the fort.' },
      ] }),
    place({ id: 'jaswant-thada', parent: 'r-marwar', title: 'Jaswant Thada', native: 'जसवंत थड़ा', coords: [26.303, 73.023], cat: 'heritage', photo: 'jaswant-thada', alt: 'The white marble Jaswant Thada memorial with domed kiosks, steps and a fountain garden', fy: 45,
      eyebrow: 'Jodhpur · Heritage', big: 'A marble memorial', line: 'Built in 1899 by Maharaja Sardar Singh in memory of his father, Maharaja Jaswant Singh II.', teaser: 'A white marble memorial below Mehrangarh.', aliases: ['cenotaph', 'jaswant thada jodhpur'],
      story: [
        'Jaswant Thada was built in 1899 by Maharaja Sardar Singh in memory of his father, Maharaja Jaswant Singh II.',
        'It is carved from thin sheets of white marble that glow when the sun shines through them.',
        'Inside hang portraits of the rulers of Jodhpur. The royal cremation ground is beside it.',
      ],
      facts: [['Built', '1899'], ['In memory of', 'Maharaja Jaswant Singh II'], ['Material', 'White marble'], ['Time needed', '45 minutes'], ['Distance', 'About 1 km from Mehrangarh']],
      tips: ['Visit on the way down from Mehrangarh.', 'Late afternoon light is warmest on the marble.'],
      nearby: ['mehrangarh', 'blue-city', 'umaid-bhawan'],
      spots: [
        { x: 50, y: 26, label: 'Main cenotaph', text: 'The central memorial to Jaswant Singh II.' },
        { x: 17, y: 40, label: 'Chhatris', text: 'Domed kiosks line the terraces.' },
        { x: 48, y: 74, label: 'Marble steps', text: 'Steps lead up from the garden to the memorial.' },
      ] }),
    place({ id: 'umaid-bhawan', parent: 'r-marwar', title: 'Umaid Bhawan Palace', native: 'उम्मेद भवन', coords: [26.2808, 73.0472], cat: 'heritage', photo: 'umaid-bhawan', alt: 'The long sandstone facade of Umaid Bhawan Palace with its central dome and towers', fy: 70,
      eyebrow: 'Jodhpur · Heritage', big: '347 rooms, still lived in', line: 'Built from 1929 to 1943 for Maharaja Umaid Singh on Chittar Hill: part home, part hotel, part museum.', teaser: 'A 1940s palace with 347 rooms, still a home.', aliases: ['umaid bhawan', 'palace hotel'],
      story: [
        'Ground was broken on 18 November 1929, and the palace was finished in 1943.',
        'It has 347 rooms and remains the principal residence of the former Jodhpur royal family. The rest is a hotel and a museum.',
        'Its interiors are Art Deco; outside, Rajput and European forms meet under a central dome.',
      ],
      facts: [['Built', '1929–1943'], ['Rooms', '347'], ['Location', 'Chittar Hill'], ['Visit', 'Museum wing open to visitors (ticketed)'], ['Time needed', '1 hour']],
      tips: ['The museum covers the family’s history and its vintage cars.', 'The hotel is open to guests only.'],
      nearby: ['mehrangarh', 'jaswant-thada', 'blue-city'],
      spots: [
        { x: 47, y: 48, label: 'Central dome', text: 'A dome rises over the central hall.' },
        { x: 8, y: 60, label: 'Corner towers', text: 'Towers frame the long facade.' },
      ] }),
    place({ id: 'osian', parent: 'r-marwar', title: 'Osian', native: 'ओसियां', coords: [26.7236, 72.91], cat: 'sacred', photo: 'osian', alt: 'Close view of a carved sandstone temple tower at Osian against a blue sky',
      eyebrow: 'Jodhpur district · Sacred', big: 'Temples older than Jodhpur', line: 'A desert town about 65 km north of Jodhpur with Hindu and Jain temples from the 8th to the 12th centuries.', teaser: 'Hindu and Jain temples of the 8th–12th centuries.', aliases: ['osiyan', 'sachiya mata'],
      story: [
        'Osian was a trading town on desert routes in the time of the Gurjara-Pratihara kings. A group of temples survives from the 8th to the 12th centuries.',
        'The Mahavira Jain temple is among the oldest Jain temples in western India, linked to an inscription naming King Vatsaraja in the late 8th century. The Sachiya Mata temple on the hill is still busy with pilgrims.',
        'Dunes start at the edge of town; camel rides and desert camps are common.',
      ],
      facts: [['Temples', '8th–12th century'], ['From Jodhpur', 'About 65 km (approx.)'], ['Time needed', 'Half a day']],
      tips: ['Shoes off in the temples; leather may not be allowed in the Jain temple.', 'Pair with an overnight desert camp.'],
      nearby: ['khejarli', 'mehrangarh', 'blue-city'],
      spots: [
        { x: 55, y: 25, label: 'The shikhara', text: 'The tower over the shrine is built of smaller copies of itself.' },
        { x: 70, y: 80, label: 'Carved frieze', text: 'Bands of figures run around the base.' },
      ] }),
    place({ id: 'khejarli', parent: 'r-marwar', title: 'Khejarli', native: 'खेजड़ली', coords: [26.18, 73.20], cat: 'town', photo: 'khejarli', alt: 'Two leafy khejri trees in sandy scrubland, photographed near Jaisalmer', photoNote: 'Photographed near Jaisalmer, not at Khejarli',
      eyebrow: 'Jodhpur district · Village', big: 'They hugged the trees', line: 'In 1730, 363 Bishnoi villagers died here trying to stop soldiers from felling their khejri trees.', teaser: 'Where 363 Bishnois died for their trees in 1730.', aliases: ['bishnoi', 'chipko', 'amrita devi', 'khejri'],
      story: [
        'In September 1730 men sent by the Kingdom of Marwar came to Khejarli to fell khejri trees. Amrita Devi, a Bishnoi woman, refused to let them: her faith forbids cutting green trees.',
        'She and her three daughters were killed, and 359 more villagers followed them, embracing the trees. When the ruler heard, he banned felling and hunting in Bishnoi villages.',
        'Bishnoi communities still protect trees and wildlife, and blackbuck and chinkara graze near their villages. A memorial and a yearly fair mark the day.',
      ],
      facts: [['Date', 'September 1730'], ['Lives lost', '363'], ['Tree', 'Khejri (Prosopis cineraria)'], ['Location', 'South-east of Jodhpur (approx.)'], ['Photo', 'Khejri trees near Jaisalmer']],
      tips: ['Visit with a local guide who can arrange a Bishnoi village visit.', 'Look for blackbuck in the fields around Bishnoi villages.'],
      nearby: ['blue-city', 'osian', 'mehrangarh'],
      spots: [
        { x: 30, y: 30, label: 'Khejri tree', text: 'Deep-rooted and drought-hardy: its pods (sangri) are eaten and its leaves fed to animals.' },
        { x: 75, y: 40, label: 'About this photo', text: 'Khejri trees photographed near Jaisalmer, not at Khejarli itself.' },
      ] }),

    // ---------------- Mewar & the Aravallis ----------------
    { id: 'udaipur', parent: 'r-mewar', archetype: 'map', city: true, title: 'Udaipur', native: 'उदयपुर', coords: [24.5764, 73.6835], cat: 'town', eyebrow: 'City · founded 1559', big: 'A city of lakes', line: 'Founded in 1559 by Maharana Udai Singh II beside Lake Pichola, a reservoir made in 1362.', teaser: 'City Palace, Lake Pichola and Bagore ki Haveli.', bounds: [[73.668, 24.565], [73.696, 24.588]], legend: ['● place to enter'], aliases: ['city of lakes', 'udaipur city'] },
    place({ id: 'city-palace-udaipur', parent: 'udaipur', title: 'City Palace, Udaipur', native: 'सिटी पैलेस, उदयपुर', coords: [24.5764, 73.6835], cat: 'heritage', photo: 'city-palace-udaipur', alt: 'The long cream City Palace of Udaipur along the shore of Lake Pichola in evening light', fy: 40,
      eyebrow: 'Udaipur · Heritage', big: 'Palaces stacked on palaces', line: 'Begun in the 16th century on the east bank of Lake Pichola and extended by Maharanas for some 400 years.', teaser: 'A lakeside palace built over four centuries.', aliases: ['city palace udaipur'],
      story: [
        'Maharana Udai Singh II began the palace when he moved his capital from Chittor, and each successor added to it, until it ran about 244 m along the ridge above the lake.',
        'Courtyards and rooms are a museum: mirror work, miniature paintings and balconies over the lake. Part of it is still home to the former royal family.',
        'The Lake Palace on Jag Niwas island, built 1743–1746 by Maharana Jagat Singh II, is now a hotel. Jag Mandir, on the next island, is open to boat visitors.',
      ],
      facts: [['Begun', '16th century, Maharana Udai Singh II'], ['Length', 'About 244 m (approx.)'], ['Entry', fee('city-palace-udaipur'), confirm], ['Time needed', '2–3 hours'], ['Boats', 'Leave from the palace jetty']],
      tips: ['Go early; the museum rooms are narrow and fill up.', 'Take the boat afterwards to see the palace from the water.'],
      nearby: ['lake-pichola', 'bagore-ki-haveli', 'kumbhalgarh'],
      spots: [
        { x: 32, y: 38, label: 'On the ridge', text: 'The palace runs along the ridge above the lake.' },
        { x: 75, y: 42, label: 'Southern wings', text: 'Further wings run south along the shore.' },
        { x: 18, y: 63, label: 'Boat jetty', text: 'Lake boats leave from the palace jetty.' },
      ] }),
    place({ id: 'lake-pichola', parent: 'udaipur', title: 'Lake Pichola', native: 'पिछोला झील', coords: [24.572, 73.679], cat: 'nature', photo: 'lake-pichola', alt: 'Sunset over Lake Pichola, the Lake Palace on its island at right and hills on the horizon', fy: 45,
      eyebrow: 'Udaipur · Lake', big: 'A lake from 1362', line: 'An artificial lake made in 1362, by tradition by a Banjara grain trader, and enlarged after Udaipur was founded.', teaser: 'A 14th-century lake with two island palaces.', aliases: ['pichola', 'lake palace', 'jag mandir', 'boat ride'],
      story: [
        'Lake Pichola was created in 1362, in the reign of Maharana Lakha, by a Banjara: one of the travelling traders who carried grain on bullock trains.',
        'Udai Singh II chose its eastern shore for his new capital in 1559. Two island palaces stand in it: Jag Niwas, now the Lake Palace hotel (1743–1746), and Jag Mandir.',
        'Boats run from the City Palace jetty; sunset trips cost more. The lake is fullest from September to March, after the monsoon.',
      ],
      facts: [['Created', '1362'], ['Islands', 'Jag Niwas (Lake Palace), Jag Mandir'], ['Boat rides', 'About ₹400–1,500 per person (sources differ)', confirm], ['Best time', 'Sep–Mar, when the lake is full']],
      tips: ['Book a sunset boat in season; they sell out.', 'Watch the sunset free from Ambrai Ghat or the city side.'],
      nearby: ['city-palace-udaipur', 'bagore-ki-haveli', 'chittorgarh'],
      spots: [
        { x: 73, y: 45, label: 'Lake Palace', text: 'Jag Niwas island: the Lake Palace, built 1743–1746, now a hotel.' },
        { x: 22, y: 41, label: 'Aravalli hills', text: 'Hills ring the lake; the sun sets behind them.' },
        { x: 19, y: 49, label: 'Boats', text: 'Boats cross the lake to Jag Mandir.' },
      ] }),
    place({ id: 'bagore-ki-haveli', parent: 'udaipur', title: 'Bagore ki Haveli', native: 'बागोर की हवेली', coords: [24.5803, 73.6838], cat: 'heritage', photo: 'bagore-ki-haveli', alt: 'Gangaur Ghat in Udaipur with its triple-arched gate, the haveli and houses along the lake', fy: 55,
      eyebrow: 'Udaipur · Heritage', big: 'Dances on the ghat', line: 'An 18th-century haveli on Gangaur Ghat, built by Mewar’s prime minister Amar Chand Badwa, now a museum with a nightly folk dance show.', teaser: 'An 18th-century haveli with a nightly folk dance show.', aliases: ['dharohar', 'gangaur ghat', 'dance show'],
      story: [
        'Amar Chand Badwa, prime minister of Mewar, built the haveli in the late 18th century on the water at Gangaur Ghat.',
        'Its rooms have been restored as a museum, with frescoes, mirror work and costumes.',
        'Every evening the Dharohar show presents Rajasthani folk dances: Ghoomar, Kalbelia, Bhavai pot-balancing, and puppets.',
      ],
      facts: [['Built', 'Late 18th century'], ['Builder', 'Amar Chand Badwa'], ['Show', 'Daily in the evening (times vary)', confirm], ['Time needed', '1 hour plus the show']],
      tips: ['Arrive early for the show to get a seat.', 'See the museum rooms by daylight first.'],
      nearby: ['city-palace-udaipur', 'lake-pichola', 'culture'],
      spots: [
        { x: 20, y: 68, label: 'Gangaur Ghat gate', text: 'The triple-arched gate opens onto the ghat.' },
        { x: 50, y: 88, label: 'On the water', text: 'The ghat steps run down into Lake Pichola.' },
      ] }),
    place({ id: 'chittorgarh', parent: 'r-mewar', title: 'Chittorgarh', native: 'चित्तौड़गढ़', coords: [24.8869, 74.6455], cat: 'heritage', photo: 'chittorgarh', alt: 'The carved nine-storey Vijay Stambha tower at Chittorgarh behind a large tree', fy: 35,
      eyebrow: 'Mewar · Heritage · UNESCO', big: 'Eight centuries of Mewar', line: 'A 280-hectare hill fort, capital of Mewar for some eight centuries, besieged in 1303, 1535 and 1568.', teaser: 'India’s largest fort and its Tower of Victory.', aliases: ['chittor', 'vijay stambh', 'tower of victory', 'padmini'],
      story: [
        'Chittor rises from the plain on a long hill, its walls enclosing 280 ha of palaces, temples and reservoirs. It was the capital of Mewar for some eight centuries.',
        'It fell three times: to Alauddin Khalji in 1303, to Bahadur Shah of Gujarat in 1535, and to Akbar in 1568. Each time the women of the fort chose jauhar, death by fire, rather than capture. The story of Rani Padmini, told in the 1540 poem Padmavat, is more legend than record.',
        'Rana Kumbha built the 37 m Vijay Stambha, the Tower of Victory, in 1448 after defeating the sultans of Malwa and Gujarat. After 1568 the capital moved to Udaipur.',
      ],
      facts: [['Area', '280 ha'], ['Sieges', '1303, 1535, 1568'], ['Vijay Stambha', '37 m, 1448, Rana Kumbha'], ['Listed', 'UNESCO 2013, Hill Forts of Rajasthan'], ['Entry', fee('chittorgarh'), confirm], ['Time needed', '3–4 hours, with a vehicle']],
      tips: ['The fort is large: hire an auto-rickshaw or car to go round.', 'Climb the Vijay Stambha if it is open; the stairs are narrow.'],
      nearby: ['city-palace-udaipur', 'bundi', 'kumbhalgarh'],
      spots: [
        { x: 50, y: 25, label: 'Vijay Stambha', text: 'Nine storeys, 37 m, built in 1448 by Rana Kumbha.' },
        { x: 22, y: 88, label: 'Ramparts', text: 'Walls enclose 280 ha on top of the hill.' },
      ] }),
    place({ id: 'kumbhalgarh', parent: 'r-mewar', title: 'Kumbhalgarh', native: 'कुंभलगढ़', coords: [25.1528, 73.587], cat: 'heritage', photo: 'kumbhalgarh', alt: 'Kumbhalgarh’s crenellated wall running across green hills, with temples and the palace inside', fy: 50,
      eyebrow: 'Rajsamand district · Heritage · UNESCO', big: 'A wall 36 km long', line: 'Rana Kumbha’s 15th-century fort, about 1,100 m up in the Aravallis, birthplace of Maharana Pratap.', teaser: 'A 36 km wall over the Aravalli hills.', aliases: ['great wall of india', 'kumbhalgarh fort'],
      story: [
        'Rana Kumbha built Kumbhalgarh in the 15th century on a ridge about 1,100 m above sea level. Its perimeter wall runs about 36 km over the hills, among the longest continuous walls in the world.',
        'Inside the walls are Jain and Hindu temples and, at the top, the Badal Mahal, the palace of clouds. Maharana Pratap, Mewar’s best-known ruler, was born here in 1540.',
        'Walking a stretch of the wall at sunset is the best way to grasp its scale. UNESCO listed the fort in 2013.',
      ],
      facts: [['Built', '15th century, Rana Kumbha'], ['Wall', 'About 36 km'], ['Altitude', 'About 1,100 m'], ['Born here', 'Maharana Pratap, 1540'], ['Listed', 'UNESCO 2013, Hill Forts of Rajasthan'], ['Entry', fee('kumbhalgarh'), confirm], ['From Udaipur', 'About 85 km (approx.)']],
      tips: ['Stay nearby and walk the wall at sunset.', 'Combine with Ranakpur, on the other side of the hills.'],
      nearby: ['ranakpur', 'jawai', 'city-palace-udaipur'],
      spots: [
        { x: 75, y: 58, label: 'The wall', text: 'The wall runs about 36 km over the hills.' },
        { x: 28, y: 62, label: 'Temples', text: 'Jain and Hindu temples stand inside the walls.' },
        { x: 52, y: 34, label: 'Badal Mahal', text: 'The palace of clouds, at the top of the fort.' },
      ] }),
    place({ id: 'jawai', parent: 'r-mewar', title: 'Jawai', native: 'जवाई', coords: [25.07, 73.17], cat: 'wildlife', photo: 'jawai', alt: 'An Indian leopard lying on a granite boulder at Jawai, bare branches behind', fy: 40,
      eyebrow: 'Pali district · Wildlife', big: 'Leopards on granite', line: 'Granite hills around the Jawai dam, where leopards share the land with Rabari herders and their flocks.', teaser: 'Leopards on granite hills beside herders’ villages.', aliases: ['leopard', 'jawai bandh', 'rabari'],
      story: [
        'Jawai is bare granite domes with caves and scrub around a large reservoir. Leopards rest on the rocks by day and hunt at night.',
        'The Rabari, a pastoral community, graze goats and cattle here and have long shared the hills with the cats.',
        'The area has been set aside as a leopard conservation reserve. Local camps run safaris in open jeeps; mugger crocodiles live in the reservoir.',
      ],
      facts: [['District', 'Pali'], ['Landscape', 'Granite hills and a reservoir'], ['Safaris', 'Run by local camps'], ['Best time', 'Oct–Mar'], ['From Udaipur', 'About 140 km (approx.)']],
      tips: ['Choose a camp that keeps a respectful distance from the cats.', 'Dawn and dusk are the best times.'],
      nearby: ['kumbhalgarh', 'ranakpur', 'mount-abu'],
      spots: [
        { x: 35, y: 42, label: 'Leopard', text: 'An Indian leopard resting on granite at Jawai, April 2025.' },
        { x: 40, y: 88, label: 'Granite', text: 'Granite domes full of caves make dens and lookouts.' },
      ] }),
    place({ id: 'mount-abu', parent: 'r-mewar', title: 'Mount Abu', native: 'माउंट आबू', coords: [24.596, 72.712], cat: 'nature', photo: 'mount-abu', alt: 'Nakki Lake at Mount Abu with boats on calm water and wooded hills behind',
      eyebrow: 'Sirohi district · Hill station', big: 'Rajasthan’s only hill station', line: 'Cool hills on an Aravalli plateau, with the marble Dilwara temples and Guru Shikhar, at 1,722 m the range’s highest point.', teaser: 'Marble Jain temples and the Aravallis’ highest peak.', aliases: ['dilwara', 'guru shikhar', 'nakki lake', 'hill station'],
      story: [
        'Mount Abu sits on a plateau about 1,200 m up, so it stays cooler than the plains. It is Rajasthan’s summer escape and its only hill station.',
        'The Dilwara temples are carved from white marble between the 11th and 13th centuries; Vimal Vasahi (1031) and Luna Vasahi (1230) are the best known. Photography is not allowed inside, leather is not allowed, and visitors who are not Jain enter from about noon.',
        'Guru Shikhar, about 15 km away, is the highest point of the Aravallis at 1,722 m. In town, Nakki Lake fills with boats at sunset.',
      ],
      facts: [['Highest point', 'Guru Shikhar, 1,722 m'], ['Dilwara temples', 'Vimal Vasahi 1031, Luna Vasahi 1230'], ['Dilwara visiting', 'About 12:00–17:00 for non-Jains; free; no photos'], ['Winter Festival', '29–31 Dec 2026'], ['Best time', 'All year; cool in summer'], ['Time needed', '2 days']],
      tips: ['Leave cameras and phones as instructed at Dilwara.', 'Go up Guru Shikhar early, before the haze.'],
      nearby: ['jawai', 'ranakpur', 'kumbhalgarh'],
      spots: [
        { x: 45, y: 73, label: 'Nakki Lake', text: 'Boats on Nakki Lake, in the middle of town.' },
        { x: 55, y: 58, label: 'Aravalli plateau', text: 'Mount Abu sits about 1,200 m up in the Aravallis.' },
      ] }),
    place({ id: 'banswara', parent: 'r-mewar', title: 'Banswara and Arthuna', native: 'बाँसवाड़ा', coords: [23.5461, 74.435], cat: 'sacred', photo: 'banswara', alt: 'Stone temples of the Arthuna group in Banswara with a tall brick shikhara and steps down to a tank',
      eyebrow: 'Vagad · far south', big: 'City of a hundred islands', line: 'Rajasthan’s green south, where a reservoir on the Mahi scatters islands and the Arthuna temples recall the Paramara kings.', teaser: 'Islands on the Mahi and 11th-century temples.', aliases: ['vagad', 'arthuna', 'mahi', 'hundred islands'],
      story: [
        'Banswara lies in Vagad, the far south of Rajasthan, near Gujarat and Madhya Pradesh. It is greener than the rest of the state.',
        'The Mahi Bajaj Sagar dam on the Mahi river made a reservoir dotted with islands, which gave the town its nickname, the City of a Hundred Islands.',
        'At Arthuna, about a dozen temples survive from the 11th and 12th centuries, when it was a capital of the Paramaras of Vagad. One Shiva temple, the Mandalesa, was built in 1079.',
      ],
      facts: [['Region', 'Vagad'], ['Arthuna temples', '11th–12th century'], ['Mandalesa temple', '1079'], ['Baneshwar Fair', 'About 18–20 Feb 2027 (approx.)'], ['From Udaipur', 'About 160 km (approx.)'], ['Best time', 'Sep–Mar']],
      tips: ['Go after the monsoon, when the land is green and the reservoir full.', 'Combine with the Baneshwar Fair in February.'],
      nearby: ['chittorgarh', 'city-palace-udaipur', 'mount-abu'],
      spots: [
        { x: 62, y: 20, label: 'Shikhara', text: 'A temple tower of the Arthuna group, 11th–12th century.' },
        { x: 25, y: 85, label: 'Tank steps', text: 'Steps lead down to the temple tank.' },
      ] }),

    // ---------------- Hadoti ----------------
    place({ id: 'bundi', parent: 'r-hadoti', title: 'Bundi', native: 'बूँदी', coords: [25.4469, 75.6407], cat: 'town', photo: 'bundi', alt: 'Bundi’s Garh Palace on a green hillside above the town, Taragarh fort on the ridge', fy: 55,
      eyebrow: 'Bundi district · Town', big: 'Murals and stepwells', line: 'A small town under Taragarh fort, with the painted Chitrashala and a 46 m stepwell.', teaser: 'A painted palace and deep stepwells.', aliases: ['taragarh', 'chitrashala', 'raniji ki baori'],
      story: [
        'The Garh Palace climbs the hill below Taragarh, the star fort, on the ridge above. Rudyard Kipling visited and wrote about the palace.',
        'In the Chitrashala, rooms built under Rao Ummed Singh in the 18th century are covered in murals of Krishna, court processions and ragamala, mixing Mughal and Mewar styles.',
        'In town, the Raniji ki Baori, built in 1699 by Rani Nathavati, is a stepwell 46 m deep with carved arches and pillars.',
      ],
      facts: [['Raniji ki Baori', '1699, 46 m deep'], ['Chitrashala', '18th-century murals'], ['Bundi Utsav', 'About 27–29 Nov 2026 (approx.)'], ['From Jaipur', 'About 210 km (approx.)'], ['Time needed', '1–2 days']],
      tips: ['Climb to Taragarh in the morning; take a stick for the monkeys.', 'The Chitrashala is small: go early to have it to yourself.'],
      nearby: ['ranthambore', 'chittorgarh', 'gagron'],
      spots: [
        { x: 52, y: 58, label: 'Garh Palace', text: 'The palace climbs the hillside above the town.' },
        { x: 70, y: 23, label: 'Taragarh', text: 'The star fort on the ridge above.' },
        { x: 50, y: 14, label: 'TV tower', text: 'A modern television tower stands above the old fort.' },
        { x: 30, y: 92, label: 'Blue houses', text: 'Like Jodhpur, Bundi has blue-washed houses in its old town.' },
      ] }),
    place({ id: 'gagron', parent: 'r-hadoti', title: 'Gagron Fort', native: 'गागरोन किला', coords: [24.628, 76.183], cat: 'heritage', photo: 'gagron', alt: 'Gagron Fort’s walls on a rocky bank above a wide brown river in the monsoon', fy: 55,
      eyebrow: 'Jhalawar district · Heritage · UNESCO', big: 'Water on three sides', line: 'A water fort at the meeting of the Ahu and Kali Sindh rivers, one of six Hill Forts of Rajasthan on UNESCO’s list.', teaser: 'A water fort wrapped by two rivers.', aliases: ['jaladurg', 'water fort', 'jhalawar'],
      story: [
        'Gagron is a jaladurg, a water fort: rivers wrap it on three sides and a moat closes the fourth.',
        'It stands where the Ahu meets the Kali Sindh, in the Hadoti region. UNESCO listed it in 2013 among the Hill Forts of Rajasthan.',
        'In the monsoon the rivers rise around the walls, as in this photo. Visitors are few.',
      ],
      facts: [['Rivers', 'Ahu and Kali Sindh'], ['Type', 'Jaladurg (water fort)'], ['Listed', 'UNESCO 2013, Hill Forts of Rajasthan'], ['District', 'Jhalawar'], ['Time needed', '1–2 hours']],
      tips: ['After the monsoon the rivers are highest and the fort looks most like an island.', 'Combine with Jhalawar town.'],
      nearby: ['ramgarh-crater', 'bundi', 'ranthambore'],
      spots: [
        { x: 30, y: 55, label: 'Fort walls', text: 'Walls rise from the rock of the riverbank.' },
        { x: 55, y: 85, label: 'The rivers', text: 'The Ahu and Kali Sindh meet here and surround the fort.' },
      ] }),
    place({ id: 'ramgarh-crater', parent: 'r-hadoti', title: 'Ramgarh crater', native: 'रामगढ़ क्रेटर', coords: [25.3333, 76.625], cat: 'terrain', photo: 'ramgarh-crater', alt: 'Astronaut photograph of Baran district from orbit, with a ring-shaped structure near the centre', photoNote: 'NASA astronaut photo; the ring near the centre matches the crater (our identification)',
      eyebrow: 'Baran district · Terrain', big: 'A crater from space', line: 'A ring of hills about 3 km across, confirmed in 2020 as a meteorite impact crater.', teaser: 'A 3 km impact crater with a 10th-century temple inside.', aliases: ['impact crater', 'meteorite', 'bhand devra', 'baran'],
      story: [
        'Seen from above, the hills near Ramgarh form an almost perfect ring, about 3 km wide, rising from the flat plain.',
        'Geologists long debated its origin. In 2020 it was added to the Earth Impact Database as a confirmed impact crater.',
        'Beside a lake inside the crater stands the Bhand Devra temple, a 10th-century Shiva temple in the Khajuraho style, which the ASI is restoring.',
      ],
      facts: [['Diameter', 'About 3–4 km (sources differ)'], ['Confirmed', '2020, Earth Impact Database'], ['Temple', 'Bhand Devra, 10th century'], ['From Baran', 'About 40 km'], ['Photo', 'NASA, ISS Expedition 61']],
      tips: ['Combine with Gagron and Bundi on a Hadoti loop.', 'The rim walk gives the best sense of the ring.'],
      nearby: ['gagron', 'bundi', 'ranthambore'],
      spots: [
        { x: 55, y: 57, label: 'The ring', text: 'The crater: a ring of hills about 3 km across, with water inside.' },
      ] }),

    // ---------------- Heartland ----------------
    place({ id: 'ajmer-sharif', parent: 'r-heartland', title: 'Ajmer Sharif', native: 'अजमेर शरीफ़ दरगाह', coords: [26.456, 74.6283], cat: 'sacred', photo: 'ajmer-sharif', alt: 'A tall green and white gateway of the Ajmer Sharif dargah with pilgrims below',
      eyebrow: 'Ajmer · Sacred', big: 'The shrine of Garib Nawaz', line: 'The tomb of the Sufi saint Khwaja Moinuddin Chishti, visited by people of every faith.', teaser: 'A Sufi shrine visited by people of every faith.', aliases: ['dargah', 'moinuddin chishti', 'ajmer', 'urs'],
      story: [
        'Khwaja Moinuddin Chishti, who brought the Chishti order of Sufism to South Asia, settled in Ajmer and died here in 1236. His tomb, the Dargah, is among the most visited shrines in the region.',
        'Pilgrims of all faiths bring flowers and chadars, embroidered cloths laid on the tomb; qawwali is sung in the courtyards.',
        'The Urs, the anniversary of his death, fills the town in the month of Rajab. In 2026 it falls around 11–19 December, depending on the moon.',
      ],
      facts: [['Saint died', '1236'], ['Urs 2026', 'About 11–19 Dec (approx.)'], ['Dress', 'Cover your head; shoes off'], ['From Pushkar', 'About 14 km'], ['Time needed', '2 hours']],
      tips: ['Carry a scarf or cap; they are also sold outside.', 'Leave shoes at a stall outside the gate.'],
      nearby: ['pushkar', 'kishangarh', 'sambhar'],
      spots: [
        { x: 45, y: 40, label: 'Gateway', text: 'Pilgrims enter through tall gateways lined with stalls of flowers and chadars.' },
      ] }),
    place({ id: 'kishangarh', parent: 'r-heartland', title: 'Kishangarh', native: 'किशनगढ़', coords: [26.593, 74.854], cat: 'town', photo: 'kishangarh', alt: 'Kishangarh miniature painting: women in a garden pavilion and bathing in a lake below a palace', photoNote: 'Kishangarh school painting, Minneapolis Institute of Art',
      eyebrow: 'Ajmer district · Town', big: 'Home of Bani Thani', line: 'A former princely state between Ajmer and Jaipur, known for an 18th-century school of miniature painting and, today, for marble.', teaser: 'The painting school of Bani Thani, India’s “Mona Lisa”.', aliases: ['bani thani', 'nihal chand', 'miniature painting'],
      story: [
        'Around 1750 the court painter Nihal Chand painted a woman with arched brows, a long neck and lotus eyes: Bani Thani, said to be the singer loved by Raja Sawant Singh. The face became the signature of the Kishangarh school.',
        'In 1973 India issued a postage stamp of the painting; the art historian Eric Dickinson had called it the Indian Mona Lisa.',
        'This painting, from the Minneapolis Institute of Art, shows Bani Thani bathing at the Phool Sagar palace. Kishangarh today is a centre of the marble trade.',
      ],
      facts: [['Painting school', 'Kishangarh, about 1750'], ['Painter', 'Nihal Chand'], ['Stamp', '1973'], ['From Ajmer', 'About 27 km (approx.)']],
      tips: ['Ask in town for painters still working in the Kishangarh style.', 'Stop on the Jaipur–Ajmer road.'],
      nearby: ['ajmer-sharif', 'pushkar', 'sambhar'],
      spots: [
        { x: 78, y: 22, label: 'The palace', text: 'A palace on the hill above the lake.' },
        { x: 72, y: 68, label: 'Bathers', text: 'Women bathe in the lake; the title names Bani Thani.' },
        { x: 35, y: 45, label: 'Pavilion', text: 'A garden pavilion with attendants.' },
      ] }),
  ];

  // ---------------- theme content ----------------
  const culture = {
    groups: [{ name: 'Music & dance' }, { name: 'Crafts' }, { name: 'Painting' }],
    stars: [
      { name: 'Kalbelia', group: 'Music & dance', photo: 'culture-kalbelia', alt: 'Two Kalbelia dancers in swirling black skirts', text: ['The dance of the Kalbelia community, its movements like a serpent’s. Women in black swirling skirts dance; men play the pungi and khanjari.', 'On UNESCO’s list of intangible cultural heritage since 2010. (Photo location not stated.)'], where: 'bagore-ki-haveli', whereText: 'Dharohar show, Udaipur', x: 0.08, y: 0.18, mx: 0.05, my: 0.02 },
      { name: 'Ghoomar', group: 'Music & dance', photo: 'culture-ghoomar', alt: 'Ghoomar dancers in bright skirts and veils', text: ['A women’s dance of slow, spinning circles in long ghagra skirts, performed at weddings and festivals.'], where: 'bagore-ki-haveli', whereText: 'Dharohar show, Udaipur', x: 0.26, y: 0.06, mx: 0.35, my: 0.0 },
      { name: 'Manganiyar music', group: 'Music & dance', photo: 'culture-manganiyar', alt: 'A Manganiyar musician in a turban playing a bowed instrument in Jaisalmer', text: ['Hereditary musicians of the western desert who sing for patron families, playing the bowed kamaicha and the dholak.'], where: 'jaisalmer-fort', whereText: 'Jaisalmer and the Thar', x: 0.12, y: 0.42, mx: 0.15, my: 0.2 },
      { name: 'Kathputli', group: 'Music & dance', photo: 'culture-kathputli', alt: 'A puppeteer with Rajasthani string puppets in Jaipur', text: ['Rajasthani string puppets, carved and dressed by hand, worked by a puppeteer singing the story.'], where: 'bagore-ki-haveli', whereText: 'Shows in Udaipur and Jaipur', x: 0.3, y: 0.36, mx: 0.42, my: 0.24 },
      { name: 'Blue pottery', group: 'Crafts', photo: 'culture-blue-pottery', alt: 'Shelves of blue and white Jaipur pottery in a shop', text: ['Jaipur’s blue pottery is not clay: it is made from quartz powder, powdered glass, fuller’s earth, borax and gum, then painted cobalt blue and white.', 'The technique is Turko-Persian in origin.'], where: 'jaipur', whereText: 'Jaipur', x: 0.5, y: 0.1, mx: 0.72, my: 0.04 },
      { name: 'Block printing', group: 'Crafts', photo: 'culture-block-print', alt: 'A printer pressing a carved wooden block onto cloth', text: ['Cloth printed by hand with carved wooden blocks. Sanganer and Bagru, near Jaipur, each have a protected geographical indication: Sanganer since 2009, Bagru since 2011. (Photo location not stated.)'], where: 'jaipur', whereText: 'Sanganer and Bagru, near Jaipur', x: 0.64, y: 0.28, mx: 0.9, my: 0.18 },
      { name: 'Bandhani', group: 'Crafts', photo: 'culture-bandhani', alt: 'Stacks of bandhani tie-dyed turbans in a Jaipur market', text: ['Tie-dye: cloth is pinched and bound in thousands of tiny points before dyeing, leaving dotted patterns.'], where: 'jaipur', whereText: 'Bazaars in Jaipur and Jodhpur', x: 0.48, y: 0.42, mx: 0.62, my: 0.36 },
      { name: 'Thikri', group: 'Crafts', photo: 'amber-mirror-detail', alt: 'Mirror inlay of a flower vase in Amber’s Sheesh Mahal', text: ['Mirror inlay: small hand-cut mirrors set in lime plaster. The Sheesh Mahal at Amber is the best-known example.'], where: 'thikri', whereText: 'Amber’s Sheesh Mahal', x: 0.66, y: 0.52, mx: 0.85, my: 0.45 },
      { name: 'Mewar painting', group: 'Painting', photo: 'culture-miniature', alt: 'A crowded battle scene from a 17th-century Mewar Ramayana painting', text: ['Udaipur’s court painters illustrated epics in bold colour. This Battle at Lanka is from Sahib Din’s Ramayana, painted at Udaipur in 1649–1653.'], where: 'city-palace-udaipur', whereText: 'City Palace museum, Udaipur', x: 0.82, y: 0.08, mx: 0.1, my: 0.6 },
      { name: 'Bani Thani', group: 'Painting', photo: 'kishangarh', alt: 'Kishangarh painting of women bathing below a palace', text: ['The Kishangarh school, around 1750, known for elongated faces and lotus eyes; its icon is Nihal Chand’s Bani Thani.'], where: 'kishangarh', x: 0.92, y: 0.32, mx: 0.35, my: 0.68 },
      { name: 'Pichwai', group: 'Painting', photo: 'culture-pichwai', alt: 'A 19th-century pichwai cloth painting of Krishna among cows', text: ['Large cloth paintings hung behind the image of Shrinathji at Nathdwara, near Udaipur, changed with the seasons and festivals. This one shows Gopashtami, the festival of cattle (19th century).'], where: 'r-mewar', whereText: 'Nathdwara, near Udaipur', x: 0.78, y: 0.5, mx: 0.62, my: 0.74 },
      { name: 'Shekhawati frescoes', group: 'Painting', photo: 'nawalgarh', alt: 'Painted arches of a Nawalgarh haveli', text: ['Merchant havelis painted inside and out in the 18th and 19th centuries, with gods, epics, trains and motorcars.'], where: 'nawalgarh', x: 0.95, y: 0.62, mx: 0.88, my: 0.82 },
    ],
    links: [[0, 1], [0, 2], [2, 3], [1, 3], [4, 5], [5, 6], [4, 6], [6, 7], [8, 9], [9, 10], [10, 11], [8, 10]],
  };
  const reasonsC = {
    groups: [],
    stars: R.reasons.map((r) => ({ name: `${r.n} · ${r.name}`, num: r.n, label: r.name, group: 'Reason', photo: r.photo, text: r.text, where: r.go, x: r.x, y: r.y, mx: r.mx, my: r.my })),
    links: [[0, 1], [1, 2], [2, 3], [3, 4], [2, 5], [5, 6], [6, 7]],
  };
  const wildlife = [
    { title: 'Tiger', num: '40+', photo: 'ranthambore', alt: 'A tiger in a waterhole at Ranthambore', text: ['Ranthambore’s tigers are often seen in daylight, among lakes and old ruins. Sariska’s were wiped out by 2005 and brought back from Ranthambore from 2008.'], go: 'ranthambore' },
    { title: 'Leopard', photo: 'jawai', alt: 'A leopard on a granite boulder at Jawai', text: ['At Jawai, leopards den in granite hills beside herding villages. Jhalana, on the edge of Jaipur, also has leopards.'], go: 'jawai' },
    { title: 'Great Indian bustard', num: '~130', photo: 'desert-np', alt: 'Two great Indian bustards in grassland', text: ['One of the world’s rarest large birds. A 2025 survey estimated about 130 left, most in the Thar around Desert National Park.'], go: 'desert-np' },
    { title: 'Blackbuck', num: '~4,000', photo: 'tal-chhapar', alt: 'Two male blackbuck facing each other', text: ['Tal Chhapar holds about 4,000. Bishnoi villages around Jodhpur protect them too.'], go: 'tal-chhapar' },
    { title: 'Sarus crane', photo: 'wild-sarus', alt: 'A pair of sarus cranes in grass at Keoladeo', text: ['The tallest flying bird in the world, grey with a red head. Look for pairs in the marshes of Keoladeo.'], go: 'keoladeo' },
  ];
  const stories = [
    { title: 'The tree-huggers of Khejarli', num: '1730', photo: 'khejarli', alt: 'Khejri trees near Jaisalmer', text: ['When soldiers came to cut khejri trees, Amrita Devi and 362 other Bishnoi villagers held on to them and were killed. The ruler then banned felling in Bishnoi villages.', 'Photo: khejri trees near Jaisalmer.'], go: 'khejarli' },
    { title: 'Pink for a prince', num: '1876', photo: 'jaipur-walled-city', alt: 'A street in Jaipur’s walled city with pink buildings', text: ['Jaipur’s old city was painted pink to welcome the Prince of Wales in 1876. Pink has been the city’s colour ever since.'], go: 'jaipur' },
    { title: 'The grain trader’s lake', num: '1362', photo: 'lake-pichola', alt: 'Sunset over Lake Pichola', text: ['Lake Pichola was made in 1362 by a Banjara, a travelling grain trader. Two centuries later a king chose its shore for his new capital, Udaipur.'], go: 'lake-pichola' },
    { title: 'The astronomer king', num: '1734', photo: 'samrat-yantra', alt: 'The Samrat Yantra at Jaipur', text: ['Sawai Jai Singh II founded Jaipur and built five observatories across north India. The one in Jaipur, finished in 1734, still works.'], go: 'jantar-mantar' },
    { title: 'A fort still lived in', num: '1156', photo: 'jaisalmer-fort', alt: 'Bastions of Jaisalmer Fort', text: ['Jaisalmer Fort was founded in 1156 and never emptied. People still live, cook and sell inside its walls.'], go: 'jaisalmer-fort' },
  ];
  const profile = {
    exaggeration: 100,
    // West to east. Distances are straight-line between stops; heights at stops are real, the line between is schematic.
    stops: [
      { name: 'Sam dunes', km: 0, elev: 200, approx: true }, { name: 'Jaisalmer', km: 42, elev: 225 }, { name: 'Jodhpur', km: 264, elev: 231 },
      { name: 'Guru Shikhar', km: 442, elev: 1722 }, { name: 'Udaipur', km: 533, elev: 598, approx: true }, { name: 'Chittorgarh', km: 637, elev: 394, approx: true }, { name: 'Kota (Chambal)', km: 761, elev: 271, approx: true },
    ],
    terrain: [[0, 200], [6, 245], [11, 205], [18, 250], [26, 212], [34, 240], [42, 225], [90, 238], [150, 255], [210, 245], [264, 231], [320, 270], [370, 330], [405, 560], [425, 1150], [442, 1722], [458, 1150], [480, 820], [505, 680], [533, 598], [570, 560], [605, 470], [637, 394], [690, 350], [730, 300], [761, 271]],
    // drawn on the plain between Jodhpur and the hills, at the same vertical scale
    refs: [{ name: 'Burj Khalifa 828 m', h: 828, km: 318 }, { name: 'Eiffel Tower 330 m', h: 330, km: 362 }],
  };

  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));
  byId.culture.stars = culture.stars; byId.culture.groups = culture.groups; byId.culture.links = culture.links;
  byId.reasons.stars = reasonsC.stars; byId.reasons.groups = reasonsC.groups; byId.reasons.links = reasonsC.links;
  byId.wildlife.pages = wildlife;
  byId.stories.pages = stories;
  byId.landscape.profile = profile;

  window.RJ = {
    ...R, nodes, culture, wildlife, stories, profile,
    gallery() {
      const out = []; const seen = new Set();
      const add = (slot, caption, go, alt) => { if (!slot || seen.has(slot)) return; seen.add(slot); out.push({ slot, caption, go, alt }); };
      for (const n of nodes) {
        if (n.photo) add(n.photo, n.title + (n.photoNote ? ` (${n.photoNote})` : ''), n.archetype === 'closeup' ? n.id : n.id, n.alt);
        (n.rooms || []).forEach((r) => add(r.photo, `${r.name}, Amber Fort`, 'amber-inside', r.alt));
        (n.pages || []).forEach((p) => add(p.photo, p.title, n.id, p.alt));
      }
      culture.stars.forEach((s) => add(s.photo, s.name, 'culture', s.alt));
      R.festivals.forEach((f) => add(f.photo, f.name, 'seasons', f.alt));
      wildlife.forEach((w) => add(w.photo, w.title, 'wildlife', w.alt));
      add('wild-camel', 'A dromedary in the Thar', 'r-thar', 'A dromedary camel resting on a dune in the Thar');
      return out;
    },
  };
})();
