# Apeverse test run 2026-11-27 08:26

**137 / 137 passed** (desktop)

| Check | Result | Detail |
|---|---|---|
| boot: game starts | PASS |  |
| boot: registered + playable | PASS |  |
| arrive in Sevilla (Plaza Nueva): loads | PASS |  |
| arrive in Sevilla (Plaza Nueva): built, no error | PASS | {"houses":1467,"shopFronts":599,"lanterns":324,"filler":2312,"fillerVis":756,"trees":164,"palms":54,"parts":86692,"festParts":3521,"signs":1268,"atlasOver":0,"atlasBad":0,"lots":1467,"shopsPlaced":13,"sitters":17,"crowd":137,"navNodes":2421,"deadEnds":0,"components":1,"reach":1,"buildMs":5136,"rental":true,"fest":false} |
| arrive in Sevilla (Plaza Nueva): load time | PASS | 9178 ms (build 5136 ms) |
| arrive in Sevilla (Plaza Nueva): spawn on Plaza Nueva, on the ground | PASS | -64.0,-150.0 |
| arrive in Sevilla (Plaza Nueva): 13 businesses placed, every sign fits the atlas | PASS | 13 shops · 1268 sign quads · over 0 |
| arrive in Sevilla (Plaza Nueva): a dense city: houses + shopfronts | PASS | 1467 houses · 599 shopfronts · 86692 parts |
| arrive in Sevilla (Plaza Nueva): portal to the Apeverse | PASS |  |
| arrive in Sevilla (Plaza Nueva): frame at the arrival (Medium) | PASS | {"fps":15.2,"calls":199,"ktris":676} |
| street network: connected, no accidental dead ends, no invisible walls: one walking graph | PASS | 1 components [] |
| street network: connected, no accidental dead ends, no invisible walls: walkable ground all reachable from the arrival | PASS | 100.00% of 101323 m2 · pockets [] |
| street network: connected, no accidental dead ends, no invisible walls: no accidental dead ends | PASS | [] |
| street network: connected, no accidental dead ends, no invisible walls: intentional callejón kept | PASS | [{"id":"callejon_dormitorio","end":"end","at":[166,64]}] |
| street network: connected, no accidental dead ends, no invisible walls: no walkable ground at the map edge | PASS | 0 |
| street network: connected, no accidental dead ends, no invisible walls: walking graph size | PASS | 2421 nodes |
| GPS routes between landmarks (+ alternatives exist): Plaza Nueva -> Plaza de Santa Cruz | PASS | 63 pts · 391 m (straight 324) · graph+grid |
| GPS routes between landmarks (+ alternatives exist): Plaza Nueva -> Mercado de Triana | PASS | 20 pts · 269 m (straight 207) · grid 2.5 |
| GPS routes between landmarks (+ alternatives exist): Giralda -> Torre del Oro | PASS | 78 pts · 466 m (straight 329) · graph+grid |
| GPS routes between landmarks (+ alternatives exist): Altozano -> Plaza de Cuba | PASS | 52 pts · 304 m (straight 278) · graph+grid |
| GPS routes between landmarks (+ alternatives exist): Plaza de Cuba -> Real de la Feria | PASS | 13 pts · 185 m (straight 144) · grid 1.5 |
| GPS routes between landmarks (+ alternatives exist): El Salvador -> Doña Elvira | PASS | 16 pts · 219 m (straight 192) · grid 1.5 |
| GPS routes between landmarks (+ alternatives exist): Alcázar gardens -> Jardines de Murillo | PASS | 8 pts · 141 m (straight 113) · grid 1.5 |
| GPS routes between landmarks (+ alternatives exist): Puerta de Jerez -> Virgen de los Reyes | PASS | 61 pts · 377 m (straight 288) · graph+grid |
| GPS routes between landmarks (+ alternatives exist): Calle Alfarería -> Calle Sierpes | PASS | 98 pts · 568 m (straight 317) · graph+grid |
| solid buildings, water, bridges: house interiors are solid (no walking through buildings) | PASS | 40 sampled |
| solid buildings, water, bridges: the river is water | PASS |  |
| solid buildings, water, bridges: Triana bridge arches over the river | PASS | 1.62 |
| solid buildings, water, bridges: San Telmo bridge walkable | PASS |  |
| solid buildings, water, bridges: landmarks solid (cathedral, bullring, Torre del Oro) | PASS |  |
| solid buildings, water, bridges: Alcázar patios + gardens walkable inside | PASS | 0,0,0 |
| walk like a player: Plaza Nueva -> Santa Cruz -> Alcázar gardens: Plaza Nueva -> Plaza de Santa Cruz on foot | PASS | {"ok":true,"len":360,"pts":59} |
| walk like a player: Plaza Nueva -> Santa Cruz -> Alcázar gardens: Santa Cruz -> Callejón del Agua | PASS | {"ok":true,"len":192,"pts":17} |
| walk like a player: Plaza Nueva -> Santa Cruz -> Alcázar gardens: Callejón del Agua -> Alcázar gardens (via a gate) | PASS | {"ok":true,"len":144,"pts":11} |
| walk like a player: Plaza Nueva -> Santa Cruz -> Alcázar gardens: gardens -> Puerta de Jerez (the other way out) | PASS | {"ok":true,"len":248,"pts":17} |
| walk like a player: Plaza Nueva -> Santa Cruz -> Alcázar gardens: frame in Santa Cruz | PASS | {"fps":52,"calls":124,"ktris":513} |
| walk over the river: Arenal -> Triana -> Calle Alfarería -> Betis -> San Telmo: Arenal -> Mercado de Triana over the bridge | PASS | {"ok":true,"len":126,"pts":11} |
| walk over the river: Arenal -> Triana -> Calle Alfarería -> Betis -> San Telmo: Mercado -> Calle Alfarería | PASS | {"ok":true,"len":112,"pts":10} |
| walk over the river: Arenal -> Triana -> Calle Alfarería -> Betis -> San Telmo: Alfarería -> Calle Betis | PASS | {"ok":true,"len":259,"pts":21} |
| walk over the river: Arenal -> Triana -> Calle Alfarería -> Betis -> San Telmo: Betis -> San Telmo bridge -> Torre del Oro | PASS | {"ok":true,"len":132,"pts":11} |
| walk over the river: Arenal -> Triana -> Calle Alfarería -> Betis -> San Telmo: frame at the Mercado de Triana | PASS | {"fps":48.4,"calls":150,"ktris":538} |
| walk into the four walk-ins through their doors: casafermin: walk-in exists | PASS |  |
| walk into the four walk-ins through their doors: casafermin: in through the door | PASS | 153.1,-127.4 |
| walk into the four walk-ins through their doors: casafermin: counter target | PASS |  |
| walk into the four walk-ins through their doors: casafermin: reach the counter | PASS | 0.35 m |
| walk into the four walk-ins through their doors: casafermin: side wall solid | PASS |  |
| walk into the four walk-ins through their doors: solea: walk-in exists | PASS |  |
| walk into the four walk-ins through their doors: solea: in through the door | PASS | 156.6,10.4 |
| walk into the four walk-ins through their doors: solea: counter target | PASS |  |
| walk into the four walk-ins through their doors: solea: reach the counter | PASS | 0.46 m |
| walk into the four walk-ins through their doors: solea: side wall solid | PASS |  |
| walk into the four walk-ins through their doors: ceramica: walk-in exists | PASS |  |
| walk into the four walk-ins through their doors: ceramica: in through the door | PASS | -315.0,-30.0 |
| walk into the four walk-ins through their doors: ceramica: counter target | PASS |  |
| walk into the four walk-ins through their doors: ceramica: reach the counter | PASS | 0.40 m |
| walk into the four walk-ins through their doors: ceramica: side wall solid | PASS |  |
| walk into the four walk-ins through their doors: volantes: walk-in exists | PASS |  |
| walk into the four walk-ins through their doors: volantes: in through the door | PASS | 2.0,-236.0 |
| walk into the four walk-ins through their doors: volantes: counter target | PASS |  |
| walk into the four walk-ins through their doors: volantes: reach the counter | PASS | 1.88 m |
| walk into the four walk-ins through their doors: volantes: side wall solid | PASS |  |
| shops: tapas, drinks, souvenirs; items work: shop Bar \(Manolo\) | PASS |  |
| shops: tapas, drinks, souvenirs; items work: bought sev_espinacas | PASS | 4 credits |
| shops: tapas, drinks, souvenirs; items work: bought sev_manzanilla | PASS | 3 credits |
| shops: tapas, drinks, souvenirs; items work: shop Freiduría | PASS |  |
| shops: tapas, drinks, souvenirs; items work: bought sev_pescaito | PASS | 6 credits |
| shops: tapas, drinks, souvenirs; items work: shop Cerámica La Cava | PASS |  |
| shops: tapas, drinks, souvenirs; items work: bought sev_azulejo | PASS | 18 credits |
| shops: tapas, drinks, souvenirs; items work: shop Guitarrería | PASS |  |
| shops: tapas, drinks, souvenirs; items work: bought sev_cuerdas | PASS | 9 credits |
| shops: tapas, drinks, souvenirs; items work: shop Volantes | PASS |  |
| shops: tapas, drinks, souvenirs; items work: bought sev_flor | PASS | 8 credits |
| shops: tapas, drinks, souvenirs; items work: shop Heladería | PASS |  |
| shops: tapas, drinks, souvenirs; items work: bought sev_helado | PASS | 3 credits |
| shops: tapas, drinks, souvenirs; items work: shop Taberna Er Salvador | PASS |  |
| shops: tapas, drinks, souvenirs; items work: bought sev_naranja_vino | PASS | 4 credits |
| shops: tapas, drinks, souvenirs; items work: shop Fruit stall | PASS |  |
| shops: tapas, drinks, souvenirs; items work: bought sev_naranja | PASS | 2 credits |
| shops: tapas, drinks, souvenirs; items work: shop Churrería | PASS |  |
| shops: tapas, drinks, souvenirs; items work: bought sev_churros | PASS | 4 credits |
| shops: tapas, drinks, souvenirs; items work: eating works | PASS | energy undefined -> undefined |
| shops: tapas, drinks, souvenirs; items work: convent torno | PASS |  |
| shops: tapas, drinks, souvenirs; items work: torno panel | PASS |  |
| shops: tapas, drinks, souvenirs; items work: yemas through the torno | PASS |  |
| missions: strings for Rocío, an azulejo for Manolo: Rocío gives the mission | PASS |  |
| missions: strings for Rocío, an azulejo for Manolo: deliver the strings | PASS | money 30 |
| missions: strings for Rocío, an azulejo for Manolo: Manolo gives the mission | PASS |  |
| missions: strings for Rocío, an azulejo for Manolo: deliver the azulejo | PASS |  |
| rides: Metrocentro, horse carriage, river cruise, public bikes: tram stop | PASS |  |
| rides: Metrocentro, horse carriage, river cruise, public bikes: tram ride starts | PASS |  |
| rides: Metrocentro, horse carriage, river cruise, public bikes: carriage stop | PASS |  |
| rides: Metrocentro, horse carriage, river cruise, public bikes: carriage ride starts | PASS |  |
| rides: Metrocentro, horse carriage, river cruise, public bikes: cruise stop | PASS |  |
| rides: Metrocentro, horse carriage, river cruise, public bikes: cruise ride starts | PASS |  |
| rides: Metrocentro, horse carriage, river cruise, public bikes: SeviBici rental placed | PASS |  |
| rides: Metrocentro, horse carriage, river cruise, public bikes: ride counters saved | PASS | {"t":1,"c":1,"b":1} |
| discoveries: the narrowest street + the callejón that ends at a door: 6 hidden discoveries | PASS | 6 |
| discoveries: the narrowest street + the callejón that ends at a door: found saved | PASS |  |
| Feria de Abril ON: casetas you walk into, walls solid, bars, wheel, crowd: festival layer shown | PASS |  |
| Feria de Abril ON: casetas you walk into, walls solid, bars, wheel, crowd: casetas built | PASS | 70 |
| Feria de Abril ON: casetas you walk into, walls solid, bars, wheel, crowd: caseta side wall solid | PASS |  |
| Feria de Abril ON: casetas you walk into, walls solid, bars, wheel, crowd: walk into a caseta to its bar | PASS | -412.5,277.3 |
| Feria de Abril ON: casetas you walk into, walls solid, bars, wheel, crowd: caseta bar sells | PASS |  |
| Feria de Abril ON: casetas you walk into, walls solid, bars, wheel, crowd: bought sev_rebujito | PASS | 8 credits |
| Feria de Abril ON: casetas you walk into, walls solid, bars, wheel, crowd: Ferris wheel ride | PASS |  |
| Feria de Abril ON: casetas you walk into, walls solid, bars, wheel, crowd: GPS into the fair while it runs | PASS | 13 pts |
| Feria de Abril ON: casetas you walk into, walls solid, bars, wheel, crowd: dance sevillanas with Rocío | PASS |  |
| Feria de Abril ON: casetas you walk into, walls solid, bars, wheel, crowd: frame in the Feria at night | PASS | {"fps":42.8,"calls":155,"ktris":526} |
| Feria close-up: the portada: portada sign quads | PASS | 3521 |
| Feria OFF: the Real is open ground again: festival layer hidden | PASS |  |
| Feria OFF: the Real is open ground again: caseta walls gone from the walk mask | PASS |  |
| Feria OFF: the Real is open ground again: caseta bars closed | PASS |  |
| named residents follow their routines: 5 named residents | PASS |  |
| named residents follow their routines: Rocío heads to the tablao in the evening | PASS | [-300,-100] -> -300,-99 |
| named residents follow their routines: crowd on the street graph | PASS | 137 |
| named residents follow their routines: café regulars at terrace tables | PASS | 17 |
| night: the tablao show + Santa Cruz lit: show on at 21:30 | PASS |  |
| night: the tablao show + Santa Cruz lit: ticket bought | PASS |  |
| night: the tablao show + Santa Cruz lit: frame in Santa Cruz at night | PASS | {"fps":60.4,"calls":60,"ktris":162} |
| viewpoints: Giralda, Sierpes, Torre del Oro: frame under the Giralda | PASS | {"fps":45.5,"calls":219,"ktris":742} |
| view: Calle Sierpes: frame on Sierpes | PASS | {"fps":60.5,"calls":74,"ktris":239} |
| view: Torre del Oro + the river: frame at the Torre del Oro | PASS | {"fps":48,"calls":98,"ktris":169} |
| view: Alcázar, Patio de las Doncellas: frame in the Alcázar | PASS | {"fps":49.5,"calls":114,"ktris":291} |
| ambience preset registered: preset | PASS |  |
| ambience preset registered: layers | PASS | crowd,fountain,river,traffic,bells,swifts,birds,guitar,palmas,hooves,clinks,crickets,steps |
| ambience preset registered: festival on the calendar | PASS | {"wd":3,"h":12} |
| save -> loadSave roundtrip (sandbox): Sevilla state saved (missions, rides, discoveries) | PASS |  |
| save -> loadSave roundtrip (sandbox): souvenirs kept | PASS |  |
| save -> loadSave roundtrip (sandbox): world saved | PASS |  |
| save -> loadSave roundtrip (sandbox): player's real save untouched | PASS |  |
| portal round trip: Ape Town and back: left to Ape Town | PASS |  |
| portal round trip: Ape Town and back: back in Sevilla | PASS |  |
| portal round trip: Ape Town and back: rebuilt cleanly | PASS |  |
| Low quality: graphics | PASS | Low is tested by switching gq before travel in a separate run |
| summary: sev | PASS | {"fps":{"arrival":{"fps":15.2,"calls":199,"ktris":676},"santacruz":{"fps":52,"calls":124,"ktris":513},"triana":{"fps":48.4,"calls":150,"ktris":538},"feria":{"fps":42.8,"calls":155,"ktris":526},"night":{"fps":60.4,"calls":60,"ktris":162},"giralda":{"fps":45.5,"calls":219,"ktris":742},"sierpes":{"fps":60.5,"calls":74,"ktris":239},"torre":{"fps":48,"calls":98,"ktris":169},"alcazar":{"fps":49.5,"calls":114,"ktris":291}},"loadMs":9178,"routes":{"Plaza Nueva>Plaza de Santa Cruz":391,"Plaza Nueva>Mercado de Triana":269,"Giralda>Torre del Oro":466,"Altozano>Plaza de Cuba":304,"Plaza de Cuba>Real de la Feria":185,"El Salvador>Doña Elvira":219,"Alcázar gardens>Jardines de Murillo":141,"Puerta de Jerez>Virgen de los Reyes":377,"Calle Alfarería>Calle Sierpes":568}} |
| no JS errors: clean | PASS |  |
| no uncaught JS errors during the run | PASS |  |
