import L, { coordsToLatLng } from "leaflet";

export default function convertToGeojson(data) {
  const geojsonElt = {
    type: "Feature",
    geometry: {
      type: "LineString",
      coordinates: [],
    },
    properties: {
      start: "",
      end: "",
      eventID: "",
      participants: "",
      date: "",
      itinaryID: "",
    },
  };

  const geojson = [];

  data.forEach((d) => {
    geojson.push({
      ...geojsonElt,
      geometry: {
        type: "LineString",
        coordinates: [d.itinary.start_gps, d.itinary.end_gps],
      },
      properties: {
        start: d.itinary.start,
        end: d.itinary.end,
        itinaryID: d.itinary_id,
        eventID: d.id,
        participants: d.participants,
        date: d.itinary.date,
      },
    });
  });
  return geojson;
}
