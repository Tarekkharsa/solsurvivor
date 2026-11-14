/** Real NASA photos for the science journal. All public domain, from images.nasa.gov. */
export interface Photo {
  id: string
  file: string
  title: string
  credit: string
  nasaId: string
}

const base = import.meta.env.BASE_URL + 'photos/'
const p = (id: string, nasaId: string, title: string, credit = 'NASA/JPL-Caltech'): Photo => ({ id, file: `${base}${id}.jpg`, title, credit, nasaId })

export const photos: Photo[] = [
  p('landing', 'PIA24430', 'Perseverance’s first color look at Mars, 2021'),
  p('delta', 'PIA24485', 'The old river delta in Jezero Crater'),
  p('wildcat', 'PIA25246', 'A rock ground smooth at Wildcat Ridge', 'NASA/JPL-Caltech/ASU/MSSS'),
  p('depot', 'PIA25681', 'Perseverance with sample tubes at Three Forks', 'NASA/JPL-Caltech/MSSS'),
  p('rim', 'PIA26377', 'Wheel tracks on the climb up the crater rim'),
  p('cheyava', 'PIA26368', 'Cheyava Falls and its “leopard spots”, 2024', 'NASA/JPL-Caltech/MSSS'),
  p('flight', 'PIA24550', 'Ingenuity’s first flight, seen by Perseverance', 'NASA/JPL-Caltech/ASU/MSSS'),
  p('seitah', 'PIA24793', 'Séítah from 12 meters up, with Ingenuity’s shadow'),
  p('moon-landing', 'PIA13523', 'The Moon’s south pole, seen by the Lunar Reconnaissance Orbiter', 'NASA/GSFC/Arizona State University'),
  p('malapert', 'PIA12953', 'Near the summit of Malapert Mountain', 'NASA/GSFC/Arizona State University'),
  p('moon-pole', 'PIA00001', 'The Moon’s south polar region, seen by Clementine', 'NASA/JPL/USGS'),
  p('lcross', 'ARC-2009-ACD09-0220-126', 'The LCROSS team on impact night, 2009', 'NASA/Ames'),
  p('aitken', 'art002e009283', 'The edge of the South Pole–Aitken basin, from Artemis II', 'NASA'),
  p('lro-earth', 'GSFC_20171208_Archive_e000496', 'Earth over the Moon’s horizon, from LRO', 'NASA/GSFC/Arizona State University'),
  p('blue-sunset', 'PIA19400', 'A blue sunset in Gale Crater, seen by Curiosity', 'NASA/JPL-Caltech/MSSS/Texas A&M Univ.'),
]

export const photoById = (id: string) => photos.find((x) => x.id === id)
