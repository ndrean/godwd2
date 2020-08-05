import React from "react";

import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShare, faSignInAlt } from "@fortawesome/free-solid-svg-icons";

function Details(props) {
  console.log("*details*");
  const { event, ...rest } = props;

  return (
    <>
      <Button variant="outline-primary" onClick={props.onhandleShowDetail}>
        <FontAwesomeIcon icon={faSignInAlt} size="2x" />
      </Button>
      <Modal
        show={props.modalId === props.index}
        onHide={props.onhandleCloseDetail}
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
          {/* .filter((participant) => participant.notif === true) */}
          {!event.participants
            ? null
            : event.participants.map((participant, idx) => (
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
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </Container>
              ))}
          <Button
            variant="primary"
            onClick={props.onhandlePush}
            disabled={props.onCheckUserDemand()}
          >
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

export default React.memo(Details);
