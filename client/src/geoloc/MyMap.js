import React, { useRef, useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import L, { marker } from "leaflet";
import * as esriGeocode from "esri-leaflet-geocoder";
import "../index.css";
import { redIcon, greenIcon, blueIcon } from "./Icon";
import convertToGeojson from "../helpers/convertToGeojson";

export default function DisplayMap() {
  //const [point, setPoint] = useState("");
  const [itinary, setItinary] = useState([]);

  const mapRef = useRef(null);
  const markersLayer = React.useRef(L.layerGroup([]));

  useEffect(() => {
    mapRef.current = L.map("map", {
      center: [45, 1],
      zoom: 8,
      layers: [
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
        }),
      ],
    });
    L.control.scale().addTo(mapRef.current);
    return () => mapRef.current.remove();
  }, []);

  const html = `<p>
      <hr/>
      <label for="start">Start
      <input type="radio" name="place_type" value="start"/>
      </label>
      <label for="start">End
      <input type="radio" name="place_type" value="end"/>
      </label><br/>
      <hr/>
      <label for="start" style="font-weight:bold" >Remove
      <input type="radio" name="place_type" value="remove"/>
      </label>
    </p>`;

  useEffect(() => {
    const searchControl = new esriGeocode.geosearch({
      expanded: true,
      zoomToResult: true,
      position: "topright",
      placeholder: "Search City / addresses",
      title: "Location Search",
      collapseAfterResult: true,
      allowMultipleResults: true,
    }).addTo(mapRef.current);

    searchControl.on("results", (e) => {
      if (!e.results) {
        return alert("Not found");
      }
      const gps = e.latlng;
      const resultMarker = marker(gps, { icon: blueIcon }).addTo(
        markersLayer.current
      );
      markersLayer.current.addTo(mapRef.current);
      const place = e.results[0].text;
      const content = L.DomUtil.create("div");
      content.innerHTML = `<p>${e.results[0].text}</p><br/> ${html}`;
      const popup = resultMarker.bindPopup(content);
      popup.openPopup();
      if (popup) {
        const chemin = handlePopupPlace(popup, place, gps, resultMarker);
        console.log("chemin", chemin);
      }
    });
  }, []);

  // find address on click with reverseGeocode (ESRI)
  //const mymarker = useRef(null);
  useEffect(() => {
    mapRef.current.on("click", (e) => {
      const mymarker = marker(e.latlng, { icon: blueIcon }).addTo(
        markersLayer.current
      );
      markersLayer.current.addTo(mapRef.current);
      reverseGeocode(e.latlng, mymarker);
    });
    return () => mapRef.current.clearLayers();
  }, []);

  async function reverseGeocode(gps, mymarker) {
    esriGeocode
      .geocodeService()
      .reverse()
      .latlng(gps)
      .run((error, result) => {
        if (error) return alert("not found");
        const {
          address: { CountryCode, ShortLabel, City },
        } = result;
        const place = [ShortLabel, City, CountryCode];
        //const marker = L.marker(gps, { icon: greenIcon }).addTo(
        //  markersLayer.current
        //);
        const content = L.DomUtil.create("div");
        content.innerHTML = `
          <p>${ShortLabel}</p>
          <p>${City}</p>
          <p>
          ${html}
          `;
        const popup = mymarker.bindPopup(content).openPopup();
        if (popup) {
          const chemin = handlePopupPlace(popup, place, gps, mymarker);
          console.log(chemin);
        }
      });
  }

  let address = [];
  function handlePopupPlace(popup, place, gps, mymarker) {
    popup.on("popupclose", () => {
      let place_val = "";
      const check = document.body.querySelectorAll('input[type="radio"]');
      check.forEach((c) => {
        if (c.checked) {
          place_val = c.value;
        }
      });

      if (place_val === "start") {
        if (Array.isArray(place)) {
          place = place.join(" ");
        }
        setItinary((prev) => [
          ...prev,
          { start: place, start_gps: [gps.lat, gps.lng] },
        ]);
        address = [...address, { start: place, start_gps: [gps.lat, gps.lng] }];
      } else if (place_val === "end") {
        if (Array.isArray(place)) {
          place = place.join(" ");
        }

        setItinary((prev) => [
          ...prev,
          { end: place, end_gps: [gps.lat, gps.lng] },
        ]);
        address = [...address, { end: place, end_gps: [gps.lat, gps.lng] }];
      } else if (place_val === "remove") {
        address = address.filter((a) => {
          return (
            (a.start_gps !== undefined &&
              a.start_gps[0] !== gps.lat &&
              a.start_gps[1] !== gps.lng) ||
            (a.end_gps !== undefined &&
              a.end_gps[0] !== gps.lat &&
              a.end_gps[1] !== gps.lng)
          );
        });
        markersLayer.current.removeLayer(mymarker);
      }
      console.log(address);
      if (address.length > 2) {
        return window.alert(
          "A path has only two points, starting and ending point"
        );
      }
      return address;
    });
  }

  // display the events
  React.useEffect(() => {
    fetch("/api/v1/events")
      .then((res) => res.json())
      .then((res) => {
        if (res) {
          L.geoJSON(convertToGeojson(res), {
            onEachFeature: onEachFeature,
          }).addTo(mapRef.current);
        }
      });
  }, []);

  function onEachFeature(feature, layer) {
    const start = marker(feature.geometry.coordinates[0], {
      icon: redIcon,
    }).addTo(mapRef.current);
    const end = marker(feature.geometry.coordinates[1], {
      icon: greenIcon,
    }).addTo(mapRef.current);
    L.polyline(feature.geometry.coordinates).addTo(mapRef.current);

    const distance = Math.round(
      parseFloat(
        L.latLng(feature.geometry.coordinates[0]).distanceTo(
          L.latLng(feature.geometry.coordinates[1])
        ),
        0
      ) / 1000
    );

    const content = L.DomUtil.create("div");
    content.innerHTML = `
      <h3>${feature.properties.date} </h3>
      <p> From: ${feature.properties.start}</p>
      <p> To:  ${feature.properties.end} </p>
      <p> Distance: ${distance} km </p>`;
    start.bindPopup(content);
    end.bindPopup(content);
  }

  return (
    <div className="center">
      <button>Save</button>
      <div id="map"></div>
    </div>
  );
}
