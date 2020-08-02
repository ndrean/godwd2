import React, { useContext } from "react";
import Image from "react-bootstrap/Image";

import PositionContext from "./PositionContext";

function GeolocProvider(props) {
  const [accept, setAccept] = React.useState(false);
  const [pos, setPos] = React.useState(null);

  React.useEffect(() => {
    if (accept) {
      navigator.geolocation.getCurrentPosition(
        ({ coords: { latitude, longitude } } = {}) => {
          setPos({
            Lat: latitude.toFixed(2),
            Lng: longitude.toFixed(2),
          });

          localStorage.setItem(
            "localPosition",
            JSON.stringify({
              Lat: latitude.toFixed(2),
              Lng: longitude.toFixed(2),
            })
          );
        },
        (error) => console.log("not available", error),

        {
          enableHighAccuracy: true,
          timeout: 10_000,
          maximumAge: 10_000,
        }
      );
    }
  }, [accept]);

  return (
    <>
      <button onClick={() => setAccept(true)}>
        <Image
          src={require("../assets/geolocation-icon-128.png")}
          alt="logo"
          width="40px"
          height="40px"
        />
      </button>
      {accept &&
        pos &&
        {
          /* window.alert(
          `Your position is: latitude: ${pos.Lat} et Longitude: ${pos.Lng}`
        )  */
        } && <PositionContext.Provider value={pos} />}
    </>
  );
}

export default GeolocProvider;
