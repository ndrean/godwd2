import React from "react";
import Button from "react-bootstrap/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faBell, faTrash, faEdit } from "@fortawesome/free-solid-svg-icons";
import Details from "./Details";

const TableRow = ({
  event,
  onhandleRemove,
  onhandleEdit,
  onhandleNotif,
  onhandlePush,
  //notify,
}) => {
  console.log("render Row");
  return (
    <tr key={event.id}>
      <td>{event.user.email}</td>
      <td>{event.itinary.date}</td>
      <td>{event.itinary.start}</td>
      <td>
        <Details
          event={event}
          onhandleNotifChange={onhandleNotif}
          onhandlePushNotif={onhandlePush}
        />
      </td>
      <td>
        <Button
          variant="outline-danger"
          onClick={onhandleRemove}
          style={{ fontSize: "12px" }}
        >
          <FontAwesomeIcon icon="trash" size="2x" />
        </Button>
      </td>
      <td>
        <Button
          variant="outline-dark"
          onClick={onhandleEdit}
          style={{ fontSize: "12px" }}
        >
          <FontAwesomeIcon icon="edit" size="2x" />
        </Button>
      </td>
    </tr>
  );
};
export default TableRow;
