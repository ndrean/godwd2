import React from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShare, faSignInAlt } from "@fortawesome/free-solid-svg-icons";

export default function Details(props) {
  const { event, ...rest } = props;
  // console.log("render Details");

  return (
    <>
      <Button variant="outline-primary" onClick={rest.onhandleShowDetail}>
        <FontAwesomeIcon icon={faSignInAlt} size="2x" />
      </Button>

      <Modal
        show={rest.showDetail}
        onHide={rest.onhandleCloseDetail}
        animation={false}
      >
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
            : event.participants
                .filter((participant) => participant.notif === true)
                .map((participant, idx) => (
                  <Container key={idx}>
                    <Row key={participant.id}>
                      <Col xs="6">{participant.email}</Col>
                      <Col xs="3">
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
          <Button variant="primary" onClick={rest.onhandlePush}>
            <FontAwesomeIcon icon={faShare} /> Ask to participate
          </Button>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={props.onhandleCloseDetail}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
