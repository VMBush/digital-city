import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';
import osmtogeojson from 'osmtogeojson';

const app = express();
app.use(cors());

const PORT = 3000;

// 📍 координаты (можно потом сделать динамическими)
const bbox = {
  north: 55.744582,
  east: 37.63121,
  south: 37.622874,
  west: 55.741895,
};
// way["building"](${bbox.south},${bbox.west},${bbox.north},${bbox.east});
//         way["highway"](${bbox.south},${bbox.west},${bbox.north},${bbox.east});
app.get('/api/map', async (req, res) => {
  try {

    const query = `
      [out:json][timeout:25];
      (
        way["building"](around:200, 55.744582,37.63121);
        way["highway"](around:200, 55.744582,37.63121);
      );
      out body;
      out skel qt;
      out geom;
    `;

    const endpoints = [
      "https://overpass-api.de/api/interpreter",
      "https://overpass.kumi.systems/api/interpreter",
      "https://lz4.overpass-api.de/api/interpreter",
    ];

    async function fetchOSM(query) {
      for (const url of endpoints) {
        try {
          const res = await fetch(url, {
            method: "POST",
            body: query,
          });
          // console.log(res);
          return await res.json();
        } catch (e) {
          console.log("fail:", url);
        }
      }
      throw new Error("All Overpass endpoints failed");
    }

    const response = await fetchOSM(query);
    // fetch(
    //   'https://overpass-api.de/api/interpreter',
    //   {
    //     method: 'POST',
    //     body: query
    //   }
    // );

    
    // console.log(response)
    const osmData = await response;
    const geojson = osmtogeojson(osmData);
    // console.log(geojson);

    res.json(geojson);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'OSM fetch error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});