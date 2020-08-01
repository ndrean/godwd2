import React from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { Card, Button } from "react-bootstrap";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import Details from "./Details";

const CardItem = ({ event, ...props }) => {
  return (
    <Container>
      <Row>
        <Col xs={12}>
          <Card border="primary" style={{ padding: "10px" }}>
            <Card.Img
              variant="top"
              src="../assets/portugal.jpg/100px270"
              alt="Card image"
            />
            {/* <Card.ImgOverlay> */}
            <Card.Title>{event.itinary.date}</Card.Title>
            <Card.Text>
              Organized by: {event.user.email}
              <br />
              From: {event.itinary.start} <br />
              To: {event.itinary.end} <br />
            </Card.Text>
            <Card.Footer>
              <Details
                event={event}
                onhandleNotifChange={props.onhandleNotif}
                onhandlePushNotif={props.onhandlePush}
              />
              <Button
                variant="outline-danger"
                onClick={props.onhandleRemove}
                style={{ fontSize: "15px", margin: "15px" }}
              >
                <FontAwesomeIcon icon="trash" size="2x" />
              </Button>
              <Button
                variant="outline-dark"
                onClick={props.onhandleEdit}
                style={{ fontSize: "15px", margin: "10px" }}
              >
                <FontAwesomeIcon icon="edit" size="2x" />
              </Button>
            </Card.Footer>
            {/*
          
          
        </Card.Footer> */}
            {/* </Card.ImgOverlay> */}
          </Card>
        </Col>
      </Row>
      <br />
    </Container>
  );
};

export default CardItem;
