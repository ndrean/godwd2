import React from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";

function CardItem({ event, ...props }) {
  return (
    <Container>
      <Row>
        <Col xs={12}>
          <Card border="primary" key={props.key}>
            <Card.Img
              variant="top"
              src={event.directCLurl || require("../assets/pointreyes.jpg")}
              alt="Card image"
              style={{ height: "270px", opacity: "0.6" }}
            />
            <Card.ImgOverlay>
              <Card.Title>{event.itinary.date}</Card.Title>

              <Card.Text style={{ fontWeight: "bold", fontSize: "12px" }}>
                Organizer: {event.user.email}
                <br />
                Distance: {event.itinary.distance} <br />
                From: {event.itinary.start} <br />
                To: {event.itinary.end} <br />
              </Card.Text>

              <Card.Footer>
                {props.children}

                <Button
                  variant="outline-danger"
                  onClick={props.onhandleRemove}
                  style={{ fontSize: "15px", margin: "15px" }}
                >
                  <FontAwesomeIcon icon={faTrash} size="2x" />
                </Button>

                <Button
                  variant="outline-dark"
                  onClick={props.onhandleEdit}
                  style={{ fontSize: "15px", margin: "10px" }}
                >
                  <FontAwesomeIcon icon={faEdit} size="2x" />
                </Button>
              </Card.Footer>
            </Card.ImgOverlay>
          </Card>
        </Col>
      </Row>
      <br />
    </Container>
  );
}

export default React.memo(CardItem);
