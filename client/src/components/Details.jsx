import React from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShare,
  // faBell,
  faSignInAlt,
} from "@fortawesome/free-solid-svg-icons";

function Details({ event, onhandlePushNotif }) {
  const [show, setShow] = React.useState(false);

  // console.log("render Details");
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <>
      <Button variant="outline-primary" onClick={handleShow}>
        <FontAwesomeIcon icon={faSignInAlt} size="2x" />
      </Button>

      <Modal show={show} onHide={handleClose} animation={false}>
        <Modal.Header closeButton>
          <Modal.Title>
            Date: {event.itinary.date} <br />
            From: {event.itinary.start} <br />
            To: {event.itinary.end}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Participants{" "}
            <span style={{ fontSize: "12px" }}>
              (go to 'edit' to invit buddies)
            </span>
          </p>
          {!event.participants
            ? null
            : event.participants.map((participant, idx) => (
                <Container key={idx}>
                  <Row key={participant.id}>
                    <Col xs="8">{participant.email}</Col>
                    <Col xs="4">
                      <Form.Group controlId="formBasicCheckbox">
                        <Form.Check
                          name={idx}
                          type="checkbox"
                          label="Notified"
                          readOnly
                          checked={JSON.parse(participant.notif)}
                          // onChange={onhandleNotifChange}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </Container>
              ))}
          <Button variant="primary" onClick={onhandlePushNotif}>
            <FontAwesomeIcon icon={faShare} /> Ask to participate
          </Button>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
// export default Details;
export default Details;
