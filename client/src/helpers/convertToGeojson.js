export default function convertToGeojson(data) {
  const geojsonElt = {
    type: "Feature",
    geometry: {
      type: "LineString",
      coordinates: "",
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
    const {
      geometry: { coordinates },
      properties: { start, end, eventID, participants, date, itinaryID },
    } = geojsonElt;
    geojson.push({
      ...geojsonElt,
      coordinates: [d.itinary.start_gps, d.itinary.end_gps],
      start: d.itinary.start,
      end: d.itinary.end,
      itinaryID: d.itinary_id,
      eventID: d.id,
      participants: d.participants,
      date: d.itinary.date,
    });
  });

  return geojson;
}
