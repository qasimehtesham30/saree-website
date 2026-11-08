// NOOLAM demo catalogue — every name and price here is fictional.
const DATA = {
  ticker: [
    ['THE LOOMS', 'Handwoven in Kanchipuram, one saree at a time'],
    ['TRY THE LOOK', 'Eight Kanjivaram looks, styled head to toe'],
    ['PURE ZARI', 'Silver-core zari woven into every temple border'],
    ['THE RACK', 'Browse the full rail of silks'],
    ['BRIDAL', 'Heirloom bridal silks for the day that matters'],
  ],

  moods: [
    { name: 'Wedding Edit', decor: 'arches', bg: ['#e9dcc6', '#fff6e6'], fig: { body: '#a3172c', border: '#2f5d4f', pattern: 'brocade', seed: 11 } },
    { name: 'Kanchipuram Icons', decor: 'wall', bg: ['#7d8a62', '#5f6b47'], fig: { body: '#d0187a', border: '#1f7a3f', pattern: 'check', accent: '#e8481c', seed: 12 } },
    { name: 'Banarasi Heirlooms', decor: 'lamp', bg: ['#3b2a1c', '#e0a63a'], fig: { body: '#5b2079', border: '#d4b13a', pattern: 'brocade', seed: 13 } },
    { name: 'Festive Radiance', decor: 'foliage', bg: ['#4f6b33', '#94a85a'], fig: { body: '#e08a1e', border: '#c0392b', pattern: 'plain', seed: 14 } },
    { name: 'Zari Signatures', decor: 'garland', bg: ['#24170f', '#3b2416'], fig: { body: '#0f4d3a', border: '#d9488a', pattern: 'butta', seed: 15 } },
    { name: 'Bridal Élan', decor: 'arches', bg: ['#3e5a52', '#c7b18a'], fig: { body: '#d2361f', border: '#7aa02f', pattern: 'butta', seed: 16 } },
  ],

  // pieces: [type, name, price, colour]
  looks: [
    { name: 'Temple Purple', fig: { body: '#5d1f80', border: '#d4a24c', pallu: '#7a2b9c', seed: 21 }, pieces: [['saree', 'Purple Korvai Kanjivaram', 34500, '#5d1f80'], ['blouse', 'Antique Gold Blouse', 4800, '#c99a3c'], ['choker', 'Ruby Lakshmi Choker', 11200, '#b3122a'], ['jhumkas', 'Temple Bell Jhumkas', 3900, '#b3122a'], ['ottiyanam', 'Peacock Ottiyanam', 14200, '#1f7a3f'], ['bangles', 'Violet Glass & Gold Stack', 3400, '#7b1fa2']] },
    { name: 'Peacock Green', fig: { body: '#11563a', border: '#d4a24c', blouse: '#d9901a', pattern: 'butta', seed: 22 }, pieces: [['saree', 'Peacock Green Butta Pattu', 29800, '#11563a'], ['blouse', 'Mango Silk Blouse', 3900, '#d9901a'], ['choker', 'Emerald Kemp Choker', 8800, '#1f7a3f'], ['jhumkas', 'Mayil Jhumkas', 4200, '#1f7a3f'], ['ottiyanam', 'Leaf Motif Ottiyanam', 13600, '#1f7a3f'], ['bangles', 'Green Kemp Bangles', 3600, '#11563a']] },
    { name: 'Lotus Pink', fig: { body: '#d63f7f', border: '#4b1d6b', seed: 23 }, pieces: [['saree', 'Lotus Pink Kanjivaram', 27400, '#d63f7f'], ['blouse', 'Plum Zari Blouse', 4100, '#4b1d6b'], ['choker', 'Pink Stone Choker', 9100, '#d63f7f'], ['jhumkas', 'Rose Pearl Jhumkas', 4400, '#d63f7f'], ['ottiyanam', 'Kamalam Ottiyanam', 14600, '#d63f7f'], ['bangles', 'Pink Glass Stack', 3200, '#d63f7f']] },
    { name: 'Midnight Zari', fig: { body: '#1d2a5c', border: '#c99a3c', pattern: 'brocade', seed: 24 }, pieces: [['saree', 'Midnight Zari Brocade', 38200, '#1d2a5c'], ['blouse', 'Navy Brocade Blouse', 4600, '#1d2a5c'], ['choker', 'Sapphire Kemp Choker', 10400, '#1f4a9a'], ['jhumkas', 'Star Drop Jhumkas', 4100, '#1f4a9a'], ['ottiyanam', 'Night Sky Ottiyanam', 15400, '#1d2a5c'], ['bangles', 'Indigo & Gold Stack', 3500, '#1d2a5c']] },
    { name: 'Mango Gold', fig: { body: '#e3a21a', border: '#8e1b1b', pattern: 'butta', motif: '#8e1b1b', seed: 25 }, pieces: [['saree', 'Mango Gold Pattu', 26800, '#e3a21a'], ['blouse', 'Arakku Red Blouse', 3800, '#8e1b1b'], ['choker', 'Coral Bead Choker', 7900, '#d84315'], ['jhumkas', 'Mango Mala Jhumkas', 4300, '#d84315'], ['ottiyanam', 'Mango Ottiyanam', 13900, '#8e1b1b'], ['bangles', 'Red & Gold Stack', 3300, '#8e1b1b']] },
    { name: 'Maroon Mayil', fig: { body: '#7a1530', border: '#d4a24c', pallu: '#8f1c3a', pattern: 'brocade', seed: 26 }, pieces: [['saree', 'Maroon Mayil Kanjivaram', 36400, '#7a1530'], ['blouse', 'Green Contrast Blouse', 4200, '#1f6a40'], ['choker', 'Kemp Peacock Choker', 11800, '#b3122a'], ['jhumkas', 'Maroon Kemp Jhumkas', 4500, '#7a1530'], ['ottiyanam', 'Mayil Ottiyanam', 15800, '#1f6a40'], ['bangles', 'Maroon Velvet Stack', 3700, '#7a1530']] },
    { name: 'Ivory Elephant', fig: { body: '#f1e3c8', border: '#c99a3c', blouse: '#d77a8b', motif: '#d77a8b', pallu: '#e8cf9f', seed: 27 }, pieces: [['saree', 'Ivory Kanjivaram with Elephant Border', 32000, '#f1e3c8'], ['blouse', 'Dusty Rose Silk Blouse', 4200, '#d77a8b'], ['choker', 'Pink Stone Temple Choker', 9400, '#d77a8b'], ['jhumkas', 'Jhumkas with Pearl Drops', 4600, '#d77a8b'], ['ottiyanam', 'Elephant Motif Ottiyanam', 15000, '#d77a8b'], ['bangles', 'Gold and Dusty Rose Bangle Stack', 3800, '#d77a8b']] },
    { name: 'Saffron Swan', fig: { body: '#d9531e', border: '#c99a3c', blouse: '#0f4d5c', pattern: 'butta', seed: 28 }, pieces: [['saree', 'Saffron Annam Kanjivaram', 30600, '#d9531e'], ['blouse', 'Teal Silk Blouse', 3900, '#0f4d5c'], ['choker', 'Swan Kemp Choker', 9600, '#0f4d5c'], ['jhumkas', 'Annam Jhumkas', 4200, '#0f4d5c'], ['ottiyanam', 'Swan Ottiyanam', 14800, '#d9531e'], ['bangles', 'Teal & Gold Stack', 3400, '#0f4d5c']] },
  ],

  silks: [
    { name: 'Kesari Pattu', price: 21400, bg: '#ef7d1a', ink: '#5a1a05', fig: { body: '#d3401c', border: '#f1b500', pattern: 'butta', seed: 31 } },
    { name: 'Magenta Shot Silk', price: 29800, bg: '#7b2cbf', ink: '#fff3dc', fig: { body: '#c2187a', border: '#d4a24c', pattern: 'stripe', accent: '#8e1a5b', seed: 32 } },
    { name: 'Palace Check', price: 19900, bg: '#b21f31', ink: '#fff3dc', fig: { body: '#3d2b9a', border: '#d4a24c', pattern: 'check', accent: '#e3a21a', seed: 33 } },
    { name: 'Bengal Garden', price: 24600, bg: '#efab3c', ink: '#3a1a08', fig: { body: '#efe2c4', border: '#1b5e3a', motif: '#b23a2c', pattern: 'butta', seed: 34 } },
    { name: 'Kanchi Rani', price: 32400, bg: '#c8193d', ink: '#fff3dc', fig: { body: '#e0177a', border: '#1f7a3f', pattern: 'stripe', accent: '#b0125f', seed: 35 } },
    { name: 'Benares Gold', price: 41800, bg: '#f2c014', ink: '#3a1a08', fig: { body: '#c99a3c', border: '#a8792a', pattern: 'brocade', motif: '#f6dd8d', seed: 36 } },
    { name: 'Kovai Check', price: 18600, bg: '#23a356', ink: '#fff3dc', fig: { body: '#d63f2a', border: '#1d2a5c', pattern: 'check', accent: '#1d2a5c', seed: 37 } },
    { name: 'Neelam Night', price: 27200, bg: '#1f4fb5', ink: '#fff3dc', fig: { body: '#0d1f4d', border: '#d4a24c', pattern: 'brocade', seed: 38 } },
  ],

  // rack: cat ∈ saree | half | full | halfsleeve ; tags: check, zari
  rack: [
    { name: 'Noolam Royal Check Silk', price: 24500, cat: 'saree', tags: ['check'], art: { body: '#d3266f', accent: '#e8b21a', pattern: 'check' } },
    { name: 'Noolam Neela Zari Stripe', price: 28900, cat: 'saree', tags: ['zari'], art: { body: '#1736a3', accent: '#0d1f6d', pattern: 'stripe' } },
    { name: 'Noolam Ivory Butta', price: 21000, cat: 'saree', tags: [], art: { body: '#efe5d1', motif: '#c99a3c', pattern: 'butta' } },
    { name: 'Noolam Madras Check', price: 19800, cat: 'saree', tags: ['check'], art: { body: '#e3b12a', accent: '#1f4a7a', pattern: 'check', border: '#8e1b1b' } },
    { name: 'Noolam Rani Pink Pattu', price: 26400, cat: 'saree', tags: [], art: { body: '#c2187a', accent: '#8e1a5b', pattern: 'stripe' } },
    { name: 'Noolam Temple Gold Brocade', price: 32000, cat: 'saree', tags: ['zari'], art: { body: '#b38a2c', motif: '#e8c66a', pattern: 'brocade', border: '#8a6a22' } },
    { name: 'Noolam Mustard Gingham', price: 18200, cat: 'saree', tags: ['check'], art: { body: '#e4c84a', accent: '#5a7a2a', pattern: 'check' } },
    { name: 'Noolam Kovai Multi Check', price: 20600, cat: 'saree', tags: ['check'], art: { body: '#c7562a', accent: '#1f6a5c', pattern: 'check' } },
    { name: 'Noolam Rose Plaid', price: 22400, cat: 'saree', tags: ['check'], art: { body: '#e46fa3', accent: '#9d1157', pattern: 'check', border: '#1f6a40' } },
    { name: 'Noolam Pavadai Mango', price: 14800, cat: 'half', tags: [], art: { body: '#e3a21a', accent: '#c2185b', kind: 'half', pattern: 'butta' } },
    { name: 'Noolam Pavadai Parrot', price: 15600, cat: 'half', tags: ['zari'], art: { body: '#4caf50', accent: '#c2185b', kind: 'half', pattern: 'brocade' } },
    { name: 'Noolam Pavadai Lavender', price: 13900, cat: 'half', tags: [], art: { body: '#9575cd', accent: '#f4c430', kind: 'half', pattern: 'butta' } },
    { name: 'Noolam Pavadai Coral', price: 14200, cat: 'half', tags: ['zari'], art: { body: '#ef6c57', accent: '#1f6a5c', kind: 'half', pattern: 'brocade' } },
    { name: 'Noolam Velvet Full Sleeve', price: 6400, cat: 'full', tags: [], art: { body: '#7a1530', sleeve: 'full', pattern: 'plain' } },
    { name: 'Noolam Brocade Full Sleeve', price: 7200, cat: 'full', tags: [], art: { body: '#1d2a5c', sleeve: 'full', pattern: 'brocade' } },
    { name: 'Noolam Emerald Full Sleeve', price: 5900, cat: 'full', tags: [], art: { body: '#11563a', sleeve: 'full', pattern: 'butta' } },
    { name: 'Noolam Ivory Full Sleeve', price: 6100, cat: 'full', tags: [], art: { body: '#efe5d1', sleeve: 'full', pattern: 'butta', motif: '#c2185b' } },
    { name: 'Noolam Dusty Rose Blouse', price: 4200, cat: 'halfsleeve', tags: [], art: { body: '#d77a8b' } },
    { name: 'Noolam Mango Blouse', price: 3900, cat: 'halfsleeve', tags: [], art: { body: '#d9901a' } },
    { name: 'Noolam Peacock Blouse', price: 4100, cat: 'halfsleeve', tags: [], art: { body: '#0f4d5c', pattern: 'butta' } },
    { name: 'Noolam Arakku Blouse', price: 3800, cat: 'halfsleeve', tags: [], art: { body: '#8e1b1b' } },
    { name: 'Noolam Plum Zari Blouse', price: 4600, cat: 'halfsleeve', tags: [], art: { body: '#4b1d6b', pattern: 'brocade' } },
    { name: 'Noolam Parrot Blouse', price: 3700, cat: 'halfsleeve', tags: [], art: { body: '#4caf50' } },
    { name: 'Noolam Gold Tissue Blouse', price: 4900, cat: 'halfsleeve', tags: [], art: { body: '#c99a3c', pattern: 'brocade', motif: '#f6dd8d' } },
    { name: 'Noolam Kumkum Blouse', price: 3600, cat: 'halfsleeve', tags: [], art: { body: '#c62828', pattern: 'butta' } },
  ],
  filters: [
    ['all', 'All pieces'], ['saree', 'Silk Sarees'], ['half', 'Half Sarees'], ['full', 'Full-Sleeve Blouses'],
    ['halfsleeve', 'Half-Sleeve Blouses'], ['check', 'Checked Sarees'], ['zari', 'Zari & Brocade'],
  ],

  film: [
    { decor: 'garland', bg: ['#2a1a10', '#4a2a18'], fig: { body: '#d3361f', border: '#e3a21a', seed: 41 } },
    { decor: 'foliage', bg: ['#3e5a2c', '#8aa35a'], fig: { body: '#e08a1e', border: '#c0392b', pattern: 'plain', seed: 42 } },
    { decor: 'wall', bg: ['#c9b98a', '#3f6e4f'], fig: { body: '#c62828', border: '#e3a21a', seed: 43 } },
    { decor: 'arches', bg: ['#cdb79a', '#f6ead6'], fig: { body: '#e3c84a', border: '#1f6a40', seed: 44 } },
    { decor: 'lamp', bg: ['#2b1a12', '#f0a43a'], fig: { body: '#7a1530', border: '#d4a24c', seed: 45 } },
    { decor: 'sea', bg: ['#cfd8dc', '#7895a2'], fig: { body: '#0d7377', border: '#e3a21a', seed: 46 } },
    { decor: 'garland', bg: ['#3a1d0e', '#5a2e14'], fig: { body: '#1e88a8', border: '#d84315', seed: 47 } },
    { decor: 'wall', bg: ['#e0c8a8', '#a8805a'], fig: { body: '#d63f7f', border: '#1f6a40', seed: 48 } },
  ],

  reels: [
    { no: '01', dur: 16, fabric: 'Tissue Kanjivaram', title: 'Ponni Kanjivaram', place: 'Lamp room, Kanchipuram', decor: 'lamp', bg: ['#2b140c', '#e8902a'], fig: { body: '#6a2a8a', border: '#d4a24c', pattern: 'brocade', seed: 51 } },
    { no: '02', dur: 31, fabric: 'Hand-block cotton', title: 'Marina Morning', place: 'Mylapore to the sea', decor: 'sea', bg: ['#cfd8dc', '#6f8f9c'], fig: { body: '#efe2c4', border: '#8e1b1b', motif: '#8e1b1b', seed: 52 } },
    { no: '03', dur: 17, fabric: 'Banarasi Katan', title: 'Kaali Banarasi', place: 'Studio, Varanasi red', decor: 'lamp', bg: ['#3a0d0d', '#c0392b'], fig: { body: '#1b1b1b', border: '#d4a24c', pattern: 'brocade', seed: 53 } },
    { no: '04', dur: 15, fabric: 'Kanjivaram silk', title: 'Pachai Pattu', place: "The bride's chamber", decor: 'wall', bg: ['#d9b9a0', '#8a5a3a'], fig: { body: '#f2d23c', border: '#1f6a40', seed: 54 } },
    { no: '05', dur: 38, fabric: 'Georgette silk', title: 'Galli Sindoor', place: 'Old-city lanes', decor: 'arches', bg: ['#7a6a5a', '#b8a58c'], fig: { body: '#b3122a', border: '#e3a21a', pattern: 'plain', seed: 55 } },
  ],

  bridal: [
    { name: 'Arakku Rani', fabric: 'Pattu', pallu: 'Temple-gold pallu', price: 34800, off: 0, decor: 'arches', bg: ['#d8c2a8', '#f2e4cf'], fig: { body: '#8e1b26', border: '#d4a24c', pattern: 'brocade', seed: 61 } },
    { name: 'Kumkum Muhurtham', fabric: 'Kanjivaram', pallu: 'Rich zari pallu', price: 41200, off: 0, decor: 'lamp', bg: ['#4a2416', '#d98a3a'], fig: { body: '#c62828', border: '#d4a24c', seed: 62 } },
    { name: 'Rose Thali Silk', fabric: 'Soft silk', pallu: 'Rose-gold pallu', price: 29600, off: 8, decor: 'foliage', bg: ['#e8d8d0', '#d47a96'], fig: { body: '#d32f2f', border: '#c99a3c', pattern: 'butta', seed: 63 } },
    { name: 'Manjal Kalyanam Pattu', fabric: 'Pattu', pallu: 'Red-gold pallu', price: 27300, off: 0, decor: 'wall', bg: ['#e8e2cf', '#8d8f3a'], fig: { body: '#d62f2a', border: '#e9a91c', blouse: '#e9a91c', pallu: '#e9a91c', palluPattern: 'butta', motif: '#f6d36b', seed: 64 } },
    { name: 'Pachai Kalyani', fabric: 'Organza silk', pallu: 'Mint & gold pallu', price: 31900, off: 10, decor: 'foliage', bg: ['#cfd5c0', '#9cb39a'], fig: { body: '#a5c9a2', border: '#7a1530', blouse: '#7a1530', seed: 65 } },
    { name: 'Mayil Neelam', fabric: 'Kanjivaram', pallu: 'Peacock pallu', price: 38500, off: 0, decor: 'wall', bg: ['#b8a46a', '#7a6a3a'], fig: { body: '#c0392b', border: '#1f4a7a', seed: 66 } },
    { name: 'Swarna Vivah', fabric: 'Tissue silk', pallu: 'All-over zari pallu', price: 45400, off: 12, decor: 'arches', bg: ['#d8bf9a', '#f0e0c0'], fig: { body: '#c99a3c', border: '#8e1b26', pattern: 'brocade', motif: '#f6dd8d', seed: 67 } },
  ],
};
