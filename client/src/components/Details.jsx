import React from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShare, faBell } from "@fortawesome/free-solid-svg-icons";

function Details({ event, onhandleNotifChange, onhandlePushNotif }) {
  const [show, setShow] = React.useState(false);

  console.log("render Details");
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <>
      <Button variant="outline-primary" onClick={handleShow}>
        <FontAwesomeIcon icon={faBell} size="2x" />
      </Button>

      <Modal show={show} onHide={handleClose} animation={false}>
        <Modal.Header closeButton>
          <Modal.Title>
            From: {event.itinary.start} <br />
            To: {event.itinary.end} <br />
            Date: {event.itinary.date}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* <p>
            If you don't find any buddies to invite people, edit the event and
            select them!
          </p> */}
          <hr />
          {!event.participants ? (
            <p>
              If you don't find any buddies to invite people, edit the event and
              select them!
            </p>
          ) : (
            event.participants.map((participant, idx) => (
              <Container key={idx}>
                <Row key={participant.id}>
                  <Col xs="8">{participant.email}</Col>
                  <Col xs="4">
                    <Form.Group controlId="formBasicCheckbox">
                      <Form.Check
                        name={idx}
                        type="checkbox"
                        label="Notif?"
                        checked={JSON.parse(participant.notif)}
                        onChange={onhandleNotifChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Container>
            ))
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={onhandlePushNotif}>
            <FontAwesomeIcon icon={faShare} /> Send notifications
          </Button>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
// export default Details;
export default React.memo(Details);
