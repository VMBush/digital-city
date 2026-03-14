import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

console.log("start");

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
        paint: {
          "background-color": "#eef",
        },
      },
    ],
  },

  center: [37.61, 55.76], 
  zoom: 16,
  pitch: 60,
  bearing: -20,
});

// загрузка данных
async function loadData() {
  const res = await fetch("http://46.38.156.143:3000/api/map");
  return res.json();
}

map.on("load", async () => {
  console.log("map loaded");

  const data = await loadData();
  console.log("data loaded", data);

  map.addSource("osm", {
    type: "geojson",
    data,
  });

  // 🛣 ДОРОГИ
  map.addLayer({
    id: "roads",
    type: "line",
    source: "osm",
    filter: ["has", "highway"],
    paint: {
      "line-color": [
        "case",

        // 1. ЖД и метро, если есть railway
        ["has", "railway"],
        "#996633",

        // 2. Пешеходные и циклопути
        // [
        //   "match",
        //   ["get", "highway"],
        //   ["footway", "path", "pedestrian", "steps", "cycleway", "steps"],
        //   true,
        //   false,
        // ],
        // "#999999",

        // 3. Автомобильные дороги (остальные highway)
        ["has", "highway"],
        [
          "match",
          ["get", "highway"],
          ["motorway", "motorway_link", "trunk", "trunk_link"],
          "#ff0000",
          ["primary", "primary_link"],
          "#ff6600",
          ["secondary", "secondary_link"],
          "#ffaa00",
          [
            "tertiary",
            "tertiary_link",
            "residential",
            "service",
            "unclassified",
          ],
          "#666666",
          "#ff0000",
        ],

        // fallback — всё остальное чёрным
        "#333333",
      ],
      "line-width": [
        "match",
        ["get", "highway"],
        ["motorway"],
        6,
        ["primary"],
        4,
        ["secondary"],
        3,
        2,
      ],
    },
  });

  // 🏢 ЗДАНИЯ (3D)
  map.addLayer({
    id: "buildings",
    type: "fill-extrusion",
    source: "osm",
    filter: ["has", "building"],
    paint: {
      "fill-extrusion-color": [
        "case",
        ["==", ["get", "building"], "yes"],
        "#aaa",
        ["==", ["get", "building"], "residential"],
        "#d8cfc4",
        ["==", ["get", "building"], "commercial"],
        "#c4d8d8",
        "#bbb",
      ],

      "fill-extrusion-height": [
        "case",
        ["all", ["has", "height"], [">", ["to-number", ["get", "height"]], 0]],
        ["to-number", ["get", "height"]],

        [
          "all",
          ["has", "building:levels"],
          [">", ["to-number", ["get", "building:levels"]], 0],
        ],
        ["*", ["to-number", ["get", "building:levels"]], 3],

        10,
      ],

      "fill-extrusion-base": 0,
      "fill-extrusion-opacity": 0.9,
    },
  });

  // 🖱 POPUP
  map.on("click", "buildings", (e) => {
    const p = e.features[0].properties;

    const html = `
      <b>${p.name || "Здание"}</b><br/>
      Тип: ${p.building || "-"}<br/>
      Адрес: ${p["addr:street"] || ""} ${p["addr:housenumber"] || ""}<br/>
      Этажей: ${p["building:levels"] || "-"}<br/>
      Высота: ${p.height || p["building:levels"] * 3 || "-"}
    `;

    new maplibregl.Popup().setLngLat(e.lngLat).setHTML(html).addTo(map);
  });
map.on("click", (e) => {
  const features = map.queryRenderedFeatures(e.point, {
    layers: ["roads"],
  });
  // console.log(features[0]?.properties);
});
  // курсор
  map.on("mouseenter", "buildings", () => {
    map.getCanvas().style.cursor = "pointer";
  });

  map.on("mouseleave", "buildings", () => {
    map.getCanvas().style.cursor = "";
    // const roads = map.queryRenderedFeatures({ layers: ["roads"] });
    // console.log("🎯 Видимых объектов:", roads);
  });



  // const layers = map.getStyle().layers;
  // console.log("🔵 Слои:", layers);

  // // Источники
  // const sources = map.getStyle().sources;
  // console.log("📊 Источники:", Object.keys(sources));

  // // Видимые features
  // const features = map.queryRenderedFeatures();
  // console.log("🎯 Видимых объектов:", features);
});