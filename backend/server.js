import express from "express";
import cors from "cors";
import fs from "fs";
import osmtogeojson from "osmtogeojson";
import { DOMParser } from "@xmldom/xmldom";

const app = express();
app.use(cors());

const PORT = 3000;

app.get("/api/map", async (req, res) => {
  try {
    const xml = fs.readFileSync("./data/mapo.osm", "utf-8");

    const dom = new DOMParser().parseFromString(xml);

    const geojson = osmtogeojson(dom);

    res.json(geojson);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "OSM file read error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
