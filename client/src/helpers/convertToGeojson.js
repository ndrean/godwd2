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
  if (data) {
    data.forEach((d) => {
      if (d.itinary.start_gps || d.itinary_end_gps) {
        if (d.itinary.start_gps.length > 0 || d.itinary.end_gps.length > 0) {
          geojson.push({
            ...geojsonElt,
            geometry: {
              type: "LineString",
              coordinates: [
                [
                  parseFloat(d.itinary.start_gps[0]),
                  parseFloat(d.itinary.start_gps[1]),
                ],
                [
                  parseFloat(d.itinary.end_gps[0]),
                  parseFloat(d.itinary.end_gps[1]),
                ],
              ],
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
        }
      }
    });
  }
  console.log(geojson);
  return geojson;
}
