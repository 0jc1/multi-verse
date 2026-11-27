# Rio de Janeiro, district 1: Copacabana + Leme (agent 4, world id `rio`)

## Verdict

Rio's first district is **playable and connected**. Results: 70/70 on the real GPU (queued). The offline network check passes, and so does the offline load check. A second district (Lapa, Santa Teresa and the Selarón steps, by metro) is not started.

## The map

- **The beach:** sand you can walk on, then the sea.
- **The calçadão:** the black-and-white **wave mosaic**.
- **Avenida Atlântica:** palms, car traffic, a bike lane.
- **Inland:** a grid of 1940s–60s **apartment blocks**, 7–12 storeys. A new kit building type paints their facades (art deco, ribbon windows, tiles, brise-soleil, balconies) as bands from the sign atlas: about 460 towers for about 16k parts.
  - The streets are the Avenida Nossa Senhora de Copacabana (shopping), Barata Ribeiro, Tonelero and 13 cross streets.
  - A galeria passage and two travessas cut through the blocks.
  - A ladeira climbs the green **morro** (an intentional dead end).
- **Plazas:** Lido, Serzedelo Correia, Cardeal Arcoverde (the metro portal).
- **The Copacabana Palace.**
- **West end:** the **Forte de Copacabana** on its point.
- **East end:** the **Pedra do Leme**, with the fishermen's path to the lookout.
- **Out to sea:** the **Sugar Loaf**.

## Things to do

| What | Details |
|---|---|
| Walk-ins | **Bar do Pandeiro** (chope, petiscos, the **roda de samba every night from 21:00**); **Churrascaria Gaúcha** (rodízio) |
| Walk-up shops | Casa dos Sucos (açaí, maracujá, coconut), Chinelos Copacabana (flip-flops, cangas), Sambaqui Instrumentos (tamborim, pandeiro, costumes), Padaria do Leme (pão de queijo) |
| Beach | Four kiosks (coconut, caipirinha, mate, biscoito); swim; futevôlei on three courts; umbrellas; lifeguard posts; the fishermen's boats at Posto 6 |
| Mission | "O tamborim da Bia" |
| People | Bia, Thiago, Seu Zé, Carla, Luís; sunbathers, joggers, cyclists, taxis and cars on Atlântica |
| **Carnaval de rua** | Seasonal: the Carnival week, shared with Cádiz, or switched by hand. A bloco of revellers in costume follows its **trio elétrico** truck along Atlântica, with bunting and a bateria in the ambience; you can join it |

## Performance

Real GPU (Intel Iris Xe), Medium, 1536×864, queued run (GPU lock):

| View | fps | draw calls | triangles |
|---|---|---|---|
| The calçadão (arrival) | 50.8 | 147 | 115k |
| The inland grid | 54.0 | 105 | 92k |
| The beach and the Sugar Loaf | 47.5 | 70 | 52k |
| Carnaval: the bloco on Atlântica | 49.2 | 140 | 179k |
| Night on Atlântica | 52.4 | 147 | 213k |

**Fixed in this run:** the land ground used to be draped only at the coastline's corners. Its long triangles cut through the morro's slope, and the sea showed on Avenida Atlântica. The drape now splits triangles where the slope bends (about 4.9k triangles).

## Known limitations

- **Second district:** Lapa and Santa Teresa are not built yet.
- **Corcovado and Cristo:** not included.
- **The morro** is green hillside with trees, not a modelled neighbourhood.
- **Phone:** not yet tested on phone emulation.
