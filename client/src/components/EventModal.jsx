import React from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

function EventModal(props) {
  return (
    <>
      <Modal show={props.show} onHide={props.onhandleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Define the event and invite kiters</Modal.Title>
        </Modal.Header>
        {/* the form goes into the body as props.children */}
        <Modal.Body>{props.children}</Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={props.onhandleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default React.memo(EventModal);
