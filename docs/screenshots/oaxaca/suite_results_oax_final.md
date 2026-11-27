# Apeverse test run 2026-11-27 11:07

**81 / 83 passed** (desktop)

| Check | Result | Detail |
|---|---|---|
| boot: game starts | PASS |  |
| boot: registered + playable | PASS |  |
| arrive in Oaxaca (Zócalo): loads | PASS |  |
| arrive in Oaxaca (Zócalo): built, no error | PASS | {"murals":23,"houses":1057,"shopFronts":444,"lanterns":127,"filler":1872,"fillerVis":770,"trees":157,"palms":0,"parts":32051,"detailParts":13158,"festParts":677,"signs":951,"atlasOver":0,"atlasBad":0,"shopsPlaced":7,"crowd":97,"sitters":13,"navNodes":2229,"deadEnds":0,"components":2,"reach":1,"buildMs":2080,"lots":1057,"rental":true,"fest":false} |
| arrive in Oaxaca (Zócalo): 7 businesses, atlas fits | PASS | 7 · over 0 |
| arrive in Oaxaca (Zócalo): a town of houses + murals | PASS | 1057 houses · 23 murals |
| arrive in Oaxaca (Zócalo): frame at the Zócalo | PASS | {"fps":57.2,"calls":149,"ktris":175} |
| network gates: one walking graph | **FAIL** | 2 |
| network gates: all walkable ground reachable | PASS | 100.00% |
| network gates: no accidental dead ends | PASS | [] |
| network gates: no hidden dead ends | PASS | [] |
| network gates: the intentional callejón | PASS |  |
| network gates: no invisible walls | PASS |  |
| network gates: the Fortín is a real hill | PASS | 24.5 m |
| network gates: landmarks solid | PASS |  |
| GPS routes: Zócalo -> Santo Domingo | PASS | 279 m |
| GPS routes: Zócalo -> Mercado 20 de Noviembre | PASS | 163 m |
| GPS routes: Alameda -> El Llano | PASS | 298 m |
| GPS routes: Soledad -> Jalatlaco | PASS | 655 m |
| GPS routes: Santo Domingo -> Cerro del Fortín | PASS | 338 m |
| GPS routes: Mercado Juárez -> Panteón General | PASS | 369 m |
| GPS routes: Jalatlaco -> Zócalo | PASS | 442 m |
| walk: Zócalo -> Alcalá -> Santo Domingo -> Jalatlaco -> Panteón: Zócalo -> Alcalá | PASS | {"ok":true,"len":230,"y":0} |
| walk: Zócalo -> Alcalá -> Santo Domingo -> Jalatlaco -> Panteón: Alcalá -> Santo Domingo | PASS | {"ok":true,"len":60,"y":0} |
| walk: Zócalo -> Alcalá -> Santo Domingo -> Jalatlaco -> Panteón: -> San Matías Jalatlaco | PASS | {"ok":true,"len":315,"y":0} |
| walk: Zócalo -> Alcalá -> Santo Domingo -> Jalatlaco -> Panteón: -> the Panteón | PASS | {"ok":true,"len":342,"y":0} |
| walk: Zócalo -> Alcalá -> Santo Domingo -> Jalatlaco -> Panteón: frame on Alcalá | PASS | {"fps":45.6,"calls":107,"ktris":120} |
| climb the Cerro del Fortín: up the escalinata | PASS | {"ok":true,"len":107,"y":22.1} |
| climb the Cerro del Fortín: the viewpoint | PASS |  |
| climb the Cerro del Fortín: frame from the hill | PASS | {"fps":57.5,"calls":167,"ktris":191} |
| view: Jalatlaco murals: frame in Jalatlaco | PASS | {"fps":53,"calls":89,"ktris":183} |
| walk-ins + shops: mezcaleria: walk-in | PASS |  |
| walk-ins + shops: mezcaleria: in through the door | PASS |  |
| walk-ins + shops: mezcaleria: counter | PASS |  |
| walk-ins + shops: chocolate: walk-in | PASS |  |
| walk-ins + shops: chocolate: in through the door | **FAIL** |  |
| walk-ins + shops: chocolate: counter | PASS |  |
| walk-ins + shops: textiles: walk-in | PASS |  |
| walk-ins + shops: textiles: in through the door | PASS |  |
| walk-ins + shops: textiles: counter | PASS |  |
| walk-ins + shops: shop Mezcal bar | PASS |  |
| walk-ins + shops: bought oax_mezcal | PASS |  |
| walk-ins + shops: shop Chocolatería La Molienda | PASS |  |
| walk-ins + shops: bought oax_chocolate | PASS |  |
| walk-ins + shops: bought oax_pan_muerto | PASS |  |
| walk-ins + shops: shop Chapulines | PASS |  |
| walk-ins + shops: bought oax_chapulines | PASS |  |
| walk-ins + shops: shop Flowers \+ candles | PASS |  |
| walk-ins + shops: bought oax_cempasuchil | PASS |  |
| walk-ins + shops: bought oax_vela | PASS |  |
| walk-ins + shops: shop Pasillo de humo | PASS |  |
| walk-ins + shops: bought oax_tasajo | PASS |  |
| walk-ins + shops: shop Alebrijes Don Pancho | PASS |  |
| walk-ins + shops: bought oax_alebrije | PASS |  |
| walk-ins + shops: shop Nieves de la Soledad | PASS |  |
| walk-ins + shops: bought oax_nieve | PASS |  |
| market hall: stalls | PASS | 12 |
| Día de Muertos: seasonal + switch: off in an ordinary week | PASS |  |
| Día de Muertos: seasonal + switch: on in its week (day 16) | PASS |  |
| Día de Muertos: seasonal + switch: manual switch | PASS |  |
| Día de Muertos: seasonal + switch: switched on | PASS |  |
| Día de Muertos: altars, papel picado, comparsa, catrina, the mission: decorations shown | PASS |  |
| Día de Muertos: altars, papel picado, comparsa, catrina, the mission: altars | PASS |  |
| Día de Muertos: altars, papel picado, comparsa, catrina, the mission: Doña Rosa gives the mission | PASS |  |
| Día de Muertos: altars, papel picado, comparsa, catrina, the mission: ofrenda delivered (marigolds, pan de muerto, chocolate) | PASS |  |
| Día de Muertos: altars, papel picado, comparsa, catrina, the mission: the comparsa | PASS |  |
| Día de Muertos: altars, papel picado, comparsa, catrina, the mission: joined the muerteada | PASS |  |
| Día de Muertos: altars, papel picado, comparsa, catrina, the mission: catrina stall | PASS |  |
| Día de Muertos: altars, papel picado, comparsa, catrina, the mission: frame on Alcalá in Día de Muertos | PASS | {"fps":60.4,"calls":136,"ktris":255} |
| Día de Muertos: the panteón at night: frame in the panteón | PASS | {"fps":60.4,"calls":125,"ktris":335} |
| Día de Muertos OFF: off again | PASS |  |
| residents, banda, taxis: 5 residents | PASS |  |
| residents, banda, taxis: crowd | PASS | 97 |
| residents, banda, taxis: banda at 19:00 | PASS |  |
| residents, banda, taxis: Alcalá is no-car | PASS |  |
| residents, banda, taxis: Calzada is a car street | PASS |  |
| residents, banda, taxis: taxi stays off Alcalá | PASS | road |
| save -> loadSave roundtrip (sandbox): Oaxaca state saved | PASS |  |
| save -> loadSave roundtrip (sandbox): world saved | PASS |  |
| save -> loadSave roundtrip (sandbox): real save untouched | PASS |  |
| summary: oax | PASS | {"fps":{"arrival":{"fps":57.2,"calls":149,"ktris":175},"alcala":{"fps":45.6,"calls":107,"ktris":120},"fortin":{"fps":57.5,"calls":167,"ktris":191},"jal":{"fps":53,"calls":89,"ktris":183},"muertos":{"fps":60.4,"calls":136,"ktris":255},"panteon":{"fps":60.4,"calls":125,"ktris":335}},"loadMs":3900,"routes":{"Zócalo>Santo Domingo":279,"Zócalo>Mercado 20 de Noviembre":163,"Alameda>El Llano":298,"Soledad>Jalatlaco":655,"Santo Domingo>Cerro del Fortín":338,"Mercado Juárez>Panteón General":369,"Jalatlaco>Zócalo":442}} |
| no JS errors: clean | PASS |  |
| no uncaught JS errors during the run | PASS |  |
