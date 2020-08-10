import React, { useRef, useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import L, { marker } from "leaflet";
import * as esriGeocode from "esri-leaflet-geocoder";
import "../index.css";
import { redIcon, greenIcon } from "./Icon";
import convertToGeojson from "../helpers/convertToGeojson";

export default function DisplayMap() {
  const [point, setPoint] = useState("");
  const [address, setAddress] = useState("");

  const mapRef = useRef(null);
  //const layer = React.useRef(null);

  useEffect(() => {
    mapRef.current = L.map("map", {
      center: [45, 1],
      zoom: 2,
      layers: [
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
        }),
      ],
    });
    L.control.scale().addTo(mapRef.current);

    //layer.current = L.layerGroup().addTo(mapRef.current);
    return () => mapRef.current.remove();
  }, []);

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
      const resultMarker = marker(e.latlng, { icon: redIcon }).addTo(
        mapRef.current
      );

      const content = L.DomUtil.create("div");
      content.innerHTML = `
        <p>${e.text}</p><br/>
        <label for="participate">Participate ?
        <input type="checkbox" id="participate"/>
        </label>
      `;

      const popup = resultMarker.bindPopup(content);
      popup.openPopup();
      if (popup) {
        handlePopup(popup);
      }
    });
  }, []);

  function handlePopup(popup) {
    popup.on("popupclose", () => {
      const check = document.body.querySelector('input[type="checkbox"]');
      if (check.checked) window.alert("welcome");
    });
  }

  const markersRef = React.useRef(null);

  // find address on click with reverseGeocode (ESRI)
  useEffect(() => {
    markersRef.current = L.layerGroup().addTo(mapRef.current);
    mapRef.current.on("click", (e) => {
      markersRef.current.clearLayers();
      setPoint({ lat: e.latlng.lat, lng: e.latlng.lng });
      reverseGeocode(e.latlng);
    });
    return () => markersRef.current.clearLayers();
  }, []);

  async function reverseGeocode(gps) {
    markersRef.current.clearLayers();
    esriGeocode
      .geocodeService()
      .reverse()
      .latlng(gps)
      .run((error, result) => {
        if (error) return alert("not found");
        const {
          address: { CountryCode, ShortLabel, City },
        } = result;
        setAddress({ Country: CountryCode, City: City, Address: ShortLabel });
        const marker = L.marker(gps, { icon: greenIcon }).addTo(
          markersRef.current
        );
        const content = L.DomUtil.create("div");
        content.innerHTML = `
          <p>${ShortLabel}</p>
          <p>${City}</p>
          <p>${JSON.stringify(gps)}</p>
          `;
        marker.bindPopup(content).openPopup();
      });
  }

  React.useEffect(() => {
    fetch("/api/v1/events")
      .then((res) => res.json())
      .then((res) => {
        L.geoJSON(convertToGeojson(res), {
          onEachFeature: onEachFeature,
        }).addTo(mapRef.current);
      });
  }, []);

  function onEachFeature(feature, layer) {
    const start = marker(feature.coordinates[0], { icon: redIcon }).addTo(
      mapRef.current
    );
    const end = marker(feature.coordinates[1], { icon: greenIcon }).addTo(
      mapRef.current
    );
    L.polyline(feature.coordinates).addTo(mapRef.current);

    const distance = Math.round(
      parseFloat(
        L.latLng(feature.coordinates[0]).distanceTo(
          L.latLng(feature.coordinates[1])
        ),
        0
      ) / 1000
    );

    const content = L.DomUtil.create("div");
    content.innerHTML = `
      <h1>${feature.date} </h1>
      <p> From: ${feature.start}</p>
      <p> To:  ${feature.end} </p>
      <p> Distance: ${distance} km </p>`;
    start.bindPopup(content);
    end.bindPopup(content);
  }

  return (
    <div className="center">
      <div id="map"> </div>
    </div>
  );
}
