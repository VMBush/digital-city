import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

console.log(1)
// карта
const map = new maplibregl.Map({
  container: "map",
  style: {
    version: 8,
    sources: {},
    layers: [
      {
        id: "bg",
        type: "background",
        paint: { "background-color": "#eef" },
      },
    ],
  },
  center: [37.61, 55.76],
  zoom: 16,
  pitch: 60,
  bearing: -20,
});

// загрузка с backend
async function loadData() {
  const res = await fetch("http://localhost:3000/api/map");
  return res.json();
}
console.log(2);
map.on("load", async () => {
  console.log(3);
  const data = await loadData();
  console.log(4);
  map.addSource("osm", {
    type: "geojson",
    data,
  });

  // дороги
  map.addLayer({
    id: "roads",
    type: "line",
    source: "osm",
    filter: ["has", "highway"],
    paint: {
      "line-color": "#333",
      "line-width": 3,
    },
  });

  // здания
  map.addLayer({
    id: "buildings",
    type: "fill-extrusion",
    source: "osm",
    filter: ["has", "building"],
    paint: {
      "fill-extrusion-color": "#aaa",
      "fill-extrusion-height": [
        "coalesce",
        ["get", "height"],
        ["*", ["get", "building:levels"], 3],
        12,
      ],
      "fill-extrusion-opacity": 0.8,
    },
  });

  // popup
  map.on("click", "buildings", (e) => {
    const p = e.features[0].properties;

    new maplibregl.Popup()
      .setLngLat(e.lngLat)
      .setHTML(`<b>${p.name || "Здание"}</b>`)
      .addTo(map);
  });
});
