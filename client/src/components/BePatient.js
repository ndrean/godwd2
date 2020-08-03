import React from "react";
import Spinner from "react-bootstrap/Spinner";

export default function BePatient({ go }) {
  if (go) {
    return (
      <Spinner animation="border" role="status">
        <span className="sr-only">Waiting for data...</span>
      </Spinner>
    );
  } else {
    return null;
  }
}
