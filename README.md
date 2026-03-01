# GeoLens
GeoLens is an extension for **GeoGuessr** that imports finished **Classic** games into and lets you explore per-country stats on an interactive world map.

## Building
```bash
npm install
npm run build
```
You can load the entire folder as an unpacked extension in Chrome or Edge.

## GeoJSON asset
All `geojson` files were generated from the [Natural Earth](https://www.naturalearthdata.com/) dataset using the following command:
```bash
mapshaper ne_10m_admin_0_map_units.shp \
  -simplify 15% keep-shapes \
  -filter-fields ISO_A2,ISO_A3,ADM0_A3,ADMIN,NAME,GEOUNIT,SOVEREIGNT,SOV_A3,POSTAL \
  -each 'code=(ISO_A2 && ISO_A2!="-99") ? ISO_A2 : (POSTAL && POSTAL!="-99") ? POSTAL : (ADM0_A3 || ISO_A3 || SOV_A3); name=(NAME && NAME.length) ? NAME : (ADMIN || GEOUNIT || SOVEREIGNT)' \
  -o format=geojson admin0_mapunits_simplified.geojson
```
## Future Features
- Add Admin1-level data (US states, etc.)
- Add more statistical breakdowns (round breakdowns/views, specific guesses, etc.)
- Add support for other game modes