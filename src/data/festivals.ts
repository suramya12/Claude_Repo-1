export type Season = 'winter' | 'spring' | 'monsoon' | 'autumn';
export const SEASONS: Record<Season, { label: string; color: string }> = {
  winter: { label: 'Winter', color: '#8fb2c9' },
  spring: { label: 'Spring', color: '#c97ea0' },
  monsoon: { label: 'Monsoon', color: '#6fb08f' },
  autumn: { label: 'Autumn', color: '#e7a33e' },
};
export type Festival = { date: string; iso?: string; yearly?: boolean; name: string; text: string; place?: string };
export type Month = { m: string; name: string; season: Season; text: string; goodFor: string[]; festivals: Festival[] };

export const MONTHS: Month[] = [
  { m: 'Jan', name: 'January', season: 'winter', text: 'Cold, dry and very clear. Snow at the passes, sunny days in the valleys. The cranes are settled in Phobjikha and the trails are quiet.', goodFor: ['Crane watching', 'Mountain views', 'Few visitors'], festivals: [] },
  { m: 'Feb', name: 'February', season: 'winter', text: 'Days warm up, and Punakha at 1,200 m is already mild. Losar, the Bhutanese New Year, usually falls in February or early March.', goodFor: ['Punakha', 'Festivals', 'Clear skies'], festivals: [
    { date: '24–26 Feb 2026', iso: '2026-02-24', name: 'Punakha Drubchen', place: 'punakha-dzong', text: 'A re-enactment of the 17th-century battle against Tibetan invaders, with militia in full armour.' },
    { date: '27 Feb–1 Mar 2026', iso: '2026-02-27', name: 'Punakha Tshechu', place: 'punakha-dzong', text: 'Masked dances in the courtyard of the most beautiful dzong in the country.' }] },
  { m: 'Mar', name: 'March', season: 'spring', text: 'Rhododendrons start to flower on the passes and the valleys turn green. Peach and pear blossom in Paro.', goodFor: ['Rhododendrons', 'Festivals', 'Hiking'], festivals: [
    { date: '29 Mar–2 Apr 2026', iso: '2026-03-29', name: 'Paro Tshechu', place: 'rinpung-dzong', text: 'The biggest festival in western Bhutan, ending at dawn with the unveiling of a giant thangka.' }] },
  { m: 'Apr', name: 'April', season: 'spring', text: 'Peak flower season. Jacaranda blooms purple around Punakha Dzong and whole hillsides of rhododendron turn red, pink and white.', goodFor: ['Jacaranda', 'Rhododendrons', 'Treks'], festivals: [
    { date: 'April', name: 'Rhododendron Festival', place: 'dochula', text: 'Held in the Royal Botanical Park below Dochula, home to dozens of rhododendron species.' }] },
  { m: 'May', name: 'May', season: 'spring', text: 'Warm and green before the rains, with some haze. A good month for the Druk Path trek and valley hikes.', goodFor: ['Druk Path trek', 'Warm days', 'Gardens'], festivals: [] },
  { m: 'Jun', name: 'June', season: 'monsoon', text: 'The monsoon arrives. Afternoon rain, emerald valleys, waterfalls everywhere, and blue poppies, the national flower, on the high passes.', goodFor: ['Blue poppies', 'Lush valleys', 'Low season'], festivals: [
    { date: 'June–July (lunar)', name: 'Kurjey Tshechu', place: 'bumthang', text: 'A Bumthang festival at one of the most sacred temples, where Guru Rinpoche left his body print in rock.' }] },
  { m: 'Jul', name: 'July', season: 'monsoon', text: 'The wettest month. Mountains hide behind clouds, but the rice terraces are at their greenest and the summer festivals are local and intimate.', goodFor: ['Rice terraces', 'Haa', 'Photography'], festivals: [
    { date: 'July', name: 'Haa Summer Festival', place: 'haa-valley', text: 'Nomad culture, yak cheese, local games and home cooking in the Haa valley.' }] },
  { m: 'Aug', name: 'August', season: 'monsoon', text: 'Rain eases toward the end of the month. Wild mushrooms appear in the forests of Bumthang.', goodFor: ['Mushroom season', 'Bumthang', 'Quiet trails'], festivals: [
    { date: 'August', name: 'Ura Matsutake Festival', place: 'bumthang', text: 'A village festival in Bumthang celebrating the prized matsutake mushroom.' }] },
  { m: 'Sep', name: 'September', season: 'autumn', text: 'The skies clear, the rice turns gold and the high season begins. The capital celebrates its biggest festival.', goodFor: ['Golden rice', 'Thimphu', 'Festivals'], festivals: [
    { date: '21–23 Sep 2026', iso: '2026-09-21', name: 'Thimphu Tshechu', place: 'tashichho-dzong', text: 'Three days of masked dances at Tashichho Dzong. The whole city dresses in its best gho and kira.' }] },
  { m: 'Oct', name: 'October', season: 'autumn', text: 'The best month for mountain views and the most popular. Crisp, clear air and every high trek is open.', goodFor: ['Himalaya views', 'Jomolhari trek', 'Snowman Trek'], festivals: [
    { date: 'October', name: 'Jomolhari Mountain Festival', place: 'jomolhari', text: 'A small festival at the foot of Jomolhari that supports snow leopard conservation.' },
    { date: 'October', name: 'Royal Highland Festival', place: 'laya', text: 'Yak herders from across the north gather in Laya for games, songs and livestock competitions.' },
    { date: 'Late Oct–Nov (lunar)', name: 'Jambay Lhakhang Drup', place: 'jambay-lhakhang', text: 'A Bumthang festival famous for its midnight fire blessing under a burning gate.' }] },
  { m: 'Nov', name: 'November', season: 'autumn', text: 'Still clear, cooler and less busy. The cranes return to Phobjikha and are welcomed with their own festival.', goodFor: ['Cranes', 'Clear skies', 'Trekking'], festivals: [
    { date: '11 Nov, every year', iso: '2026-11-11', yearly: true, name: 'Black-necked Crane Festival', place: 'phobjikha-valley', text: 'Schoolchildren dress as cranes and dance in the courtyard of Gangtey Goemba.' }] },
  { m: 'Dec', name: 'December', season: 'winter', text: 'Cold mornings, brilliant days and the clearest Himalaya views of the year from Dochula.', goodFor: ['Dochula sunrise', 'Hot stone baths', 'Few visitors'], festivals: [
    { date: '13 Dec, every year', iso: '2026-12-13', yearly: true, name: 'Dochula Druk Wangyal Festival', place: 'dochula', text: 'Held in the open air among the 108 chortens, with the snow peaks behind the dancers.' },
    { date: 'Dec–Jan (lunar)', name: 'Trongsa Tshechu', place: 'trongsa-dzong', text: 'Masked dances in the largest dzong in the country.' }] },
];
