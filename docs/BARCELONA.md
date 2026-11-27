# Barcelona (agent 2, new worlds)

Files: `js/world_barcelona.js` (the city), `js/barcelona_life.js` (life, shops, transport, festival). Tests: `tools/tests/suite_barcelona.js` (release gate) and the Barcelona area in `tools/tests/suite_connect.js` (connectivity gate). Scale is 1 m = 1 m, with north at −z.

Barcelona was built to the 2.2 interconnected standard from the start. The street network was designed first, and the walking graph is generated with `AV.nwkit.graph`, which makes every crossing a junction by construction.

## The street network

- **Eixample (north):** a grid of 4 × 3 chamfered 70 m blocks (xamfrans). Every corner has its own corner building, and many have a glazed tribune.
  - **North–south streets:**
    - the west edge street;
    - **Rambla de Catalunya**, a pedestrian street with a tree-lined centre;
    - **Passeig de Gràcia**, 30 m wide;
    - one more street;
    - the east edge street.
  - **East–west streets:** Mallorca, València, Aragó, the **Gran Via** and the Ronda.
  - **The garden courtyard (interior d'illa):** block x11 has its courtyard open, with a passatge from Carrer de València and one from Aragó, so you can walk through the block.
- **Plaça de Catalunya, the hub:**
  - lawns, two fountains and the compass-star paving;
  - Passeig de Gràcia, Rambla de Catalunya and La Rambla all open onto it;
  - the department store (Grans Magatzems Simi) on its east side.
- **La Rambla:** a central promenade between two narrow roads, running from the plaça down to the port.
  - **Along the way:** plane trees, flower and press kiosks, a souvenir kiosk, two living statues, and the pavement mosaic at Liceu.
  - **Market hall:** the iron-and-glass hall on the west side is open at both ends (Rambla ↔ Raval lane), with four stalls.
- **Gothic Quarter:**
  - **Lanes:** Petritxol, Portal de l'Àngel and Bisbe (with the neo-Gothic bridge), plus Portaferrissa, Palla, Boqueria, Ferran / Jaume I, Pietat and Escudellers.
  - **The cathedral square:** the cathedral, with its two towers, spire and rose window.
  - **Plaça del Pi:** the Pi church, with its rose window and bell tower.
  - **Plaça Sant Jaume:** the Palau de la Generalitat and the Ajuntament face each other across it.
  - **Plaça Reial:** an arcaded ring with four passages, palms, a fountain and helmeted lamps.
- **Raval:** a north–south lane and two cross lanes (Carme, Hospital).
- **Via Laietana:** an avenue with traffic.
- **Born:** two lanes (Princesa and one more).
- **The port:**
  - the road (Passeig de Colom) and the promenade (moll), lined with palms;
  - the Columbus column;
  - moored boats and a pier.
- **Skyline (scenery):** the basilica's spires to the north-east, Montjuïc and its castle to the south-west.

## What you can do

- **Walk-ins:**
  - **Cafès and bars:** Cafè de la Rambla, Granja La Banana (xocolata amb xurros) and Bar de Tapes El Simi.
  - **Shops:** Llibreria El Drac and Moda Gràcia.
  - **Sala Simi Jazz Club:** open 21:00–03:00. Entry is a stamp at the door, or you can be on the guest list. There is a band, a dance floor and a piano to play.
- **The market hall:**
  - Núria's fruit juices;
  - jamón and olives;
  - a seafood bar;
  - torrons and sweets.
- **Counters:**
  - **Food and drink:** Vermuteria Can Pep, Pastisseria La Mona, Gelats Mediterrani, Forn Sant Simi, Xampanyeria Bombolles and La Paella del Port.
  - **Shops:** Groove Dealers Discos, Records de Barcelona, La Samarreta (Simi FC) and the department store.
  - **Rambla kiosks:** flowers, press and souvenirs.
- **Things to see and do:**
  - **Visits:** Casa Simi, a fictional modernista house (09:00–20:00), and the cathedral cloister with its geese.
  - **Shows:** Tablao El Duende flamenco (20:00–24:00), and coins for the living statues.
  - **Quiet spots:** sit in the garden courtyard.
- **Transport:**
  - **Metro L3:** Catalunya, Passeig de Gràcia, Liceu and Drassanes.
  - **Harbour boat:** round the Port Vell.
  - **Taxis and bikes:** black-and-yellow taxis; BiciApe bikes to rent, or bikes and scooters to buy.
- **People:** Montse, Jordi, Lucía, Pau and Núria, each with a routine and four conversation choices.
  - **Story: Jordi's faixa.** The casteller's sash turned up at Núria's stall. Returning it pays +25 credits and puts you on the jazz club's guest list.
- **La Mercè:** every Thursday from 18:00 to 02:00 on the Apeverse calendar.
  - **Castells:** a human tower rises tier by tier in Plaça Sant Jaume from 19:00, and the enxaneta reaches the top at 21:00. You can join the pinya.
  - **Gegants:** two giants parade the Rambla and Ferran from 18:00 to 21:00.
  - **Correfoc:** devils with fireworks run down Via Laietana, with real sparks, from 21:00 to 23:00.
  - **Around the city:** a concert on the port stage, plus garlands and banners.

## Connectivity

- **Walking graph:** about 1,960 nodes. There are no unplanned dead ends; the one planned terminus is the end of the pier, where the boat stand is.
- **Gate (`suite_connect`):** the Barcelona area is in the gate with 20 destinations, 11 second-route checks, 4 collision walks and 60 random pocket samples.
- **Passatges:** the row walker may shift a special lot by a few metres. Each passage records where it actually landed (`BCN.passC`), and its walking line follows that position.

## Performance

- **Size:** about 990 buildings and about 59,000 parts.
- **Merging:** everything is merged into 64 m chunks in two regions: the Eixample, and the Ciutat Vella. Only the region you are in is drawn; both are drawn near the plaça.
- **Signs:** a single 2048 × 2560 atlas.

## Not built yet (honest)

- **Waterfront:** no beach (Barceloneta) and no Montjuïc to walk up; Montjuïc is scenery.
- **Interiors:** the Palau, the Ajuntament and the department store are façades or counters.
- **Districts:** the Born has only two lanes. Gràcia, Sant Antoni and Poblenou are future districts.
- **Music:** none of Barcelona's own yet. The venues use existing playlists.
