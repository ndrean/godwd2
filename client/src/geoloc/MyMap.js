import React, { useRef, useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import L, { marker } from "leaflet";
import * as esriGeocode from "esri-leaflet-geocoder";

import { redIcon, greenIcon, blueIcon } from "./Icon";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import convertToGeojson from "../helpers/convertToGeojson";
import fetchAll from "../helpers/fetchAll";
import "../index.css";

export default function DisplayMap(props) {
  //const [point, setPoint] = useState("");
  //const [itinary, setItinary] = useState([]);
  const [startPoint, setStartPoint] = useState("");
  const [endPoint, setEndPoint] = useState("");
  const [date, setDate] = useState("");

  const mapRef = useRef(null);
  const markersLayer = React.useRef(L.layerGroup([]));

  let itinary = "";
  let address = [];

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
    return () => {
      mapRef.current.remove();
      console.log("removed");
    };
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
    // https://github.com/Esri/esri-leaflet-geocoder
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
        handlePopupPlace(popup, place, gps, resultMarker);
      }
    });
  }, []);

  // find address on click with reverseGeocode (ESRI)
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
        const content = L.DomUtil.create("div");
        content.innerHTML = `
          <p>${ShortLabel}</p>
          <p>${City}</p>
          <p>
          ${html}
          `;
        const popup = mymarker.bindPopup(content);
        popup.openPopup();
        if (popup) {
          handlePopupPlace(popup, place, gps, mymarker);
        }
      });
  }

  function handlePopupPlace(popup, place, gps, mymarker) {
    popup.on("popupclose", (e) => {
      const getId = e.target._leaflet_id;
      let typeValue = "";
      const typeRadio = document.body.querySelectorAll('input[type="radio"]');
      typeRadio.forEach((c) => {
        if (c.checked) {
          typeValue = c.value;
        }
      });
      if (typeValue === "start") {
        if (Array.isArray(place)) {
          place = place.join(" ");
        }
        setStartPoint({
          start: place,
          start_gps: [gps.lat, gps.lng],
          id: e.target._leaflet_id,
        });

        if (address.find((a) => Object.keys(a).includes("start"))) {
          address = address.filter((a) => !Object.keys(a).includes("start"));
        }
        address = [
          ...address,
          {
            start: place,
            start_gps: [gps.lat, gps.lng],
            id: e.target._leaflet_id,
          },
        ];
      } else if (typeValue === "end") {
        if (Array.isArray(place)) {
          place = place.join(" ");
        }
        setEndPoint({
          end: place,
          end_gps: [gps.lat, gps.lng],
          id: e.target._leaflet_id,
        });

        if (address.find((a) => Object.keys(a).includes("end"))) {
          address = address.filter((a) => !Object.keys(a).includes("end"));
        }
        address = [
          ...address,
          {
            end: place,
            end_gps: [gps.lat, gps.lng],
            id: e.target._leaflet_id,
          },
        ];
      } else if (typeValue === "remove") {
        address = address.filter((a) => a.id !== getId);
        markersLayer.current.removeLayer(mymarker);
      }
      return address;
    });
  }

  // display the events
  React.useEffect(() => {
    fetch("/api/v1/events")
      .then((res) => res.json())
      .then((res) => {
        console.log(res);
        if (res) {
          L.geoJSON(convertToGeojson(res), {
            onEachFeature: onEachFeature,
          }).addTo(mapRef.current);
        }
      });
  }, [props.events]);

  function onEachFeature(feature, layer) {
    if (feature.geometry.coordinates) {
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
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!props.user) return window.alert("Please login");

    if (!startPoint || !endPoint)
      return window.alert("Please select two points");

    const distance =
      startPoint.start_gps && endPoint.end_gps
        ? (
            L.latLng(startPoint.start_gps).distanceTo(
              L.latLng(endPoint.end_gps)
            ) / 1000
          ).toFixed(0)
        : null;

    itinary = {
      date: date,
      start: startPoint.start,
      start_gps: startPoint.start_gps,
      end: endPoint.end,
      end_gps: endPoint.end_gps,
      distance: distance,
    };
    const formdata = new FormData();
    for (const key in itinary) {
      console.log(key, itinary[key]);
      formdata.append(`event[itinary_attributes][${key}]`, itinary[key]);
    }

    // !!!!! no headers "Content-type".. for formdata !!!!!
    fetchAll({
      method: "POST",
      index: "",
      body: formdata,
      token: props.token,
    })
      .then((result) => {
        if (result) {
          props.onhandleUpdateEvents(result);
          window.alert("Saved!");
          setStartPoint("");
          setEndPoint("");
          address = [];
          setDate("");
          mapRef.current.removeLayer(markersLayer.current);
        }
      })
      .catch((err) => console.log(err));
  }

  function onStartChange() {}
  function onEndChange() {}

  function handleDate(e) {
    setDate(e.target.value);
  }

  return (
    <Container>
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="formPlaintextItinary">
          <Form.Label>Starting point:</Form.Label>
          <Form.Control
            as="textarea"
            rows="2"
            readOnly
            required
            value={startPoint ? startPoint.start : null}
            onChange={onStartChange}
          />
        </Form.Group>

        <Form.Group controlId="formPlaintextPassword">
          <Form.Label>Ending point::</Form.Label>
          <Form.Control
            as="textarea"
            rows="2"
            readOnly
            required
            value={endPoint ? endPoint.end : null}
            onChange={onEndChange}
          />
        </Form.Group>
        <Form.Control
          type="date"
          value={date || ""}
          name="date"
          required
          onChange={handleDate}
        />
        <Row>
          <Button variant="primary" type="submit">
            Submit
          </Button>
        </Row>
      </Form>

      <br />
      <p>
        Click on the map or use the 'Search' box to define a point, and assign
        'start' or 'end' to define an event.
      </p>
      <Row>
        <div id="map"></div>
      </Row>
    </Container>
  );
}
