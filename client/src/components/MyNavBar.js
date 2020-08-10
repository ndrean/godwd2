import React from "react";
import LoginForm from "./LoginForm";
import Nav from "react-bootstrap/Nav";
import Container from "react-bootstrap/Container";
import Navbar from "react-bootstrap/Navbar";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Image from "react-bootstrap/Image";
// import FormControl from "react-bootstrap/FormControl";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "../index.css";
import GeolocProvider from "../geoloc/GeolocProvider";

function MyNavBar({ user, onhandleAddUser, ...props }) {
  return (
    <>
      <Container>
        <Navbar fixed="top" bg="primary" variant="dark">
          <Navbar.Brand href="#home">
            <Image
              src={require("../assets/kitesurfing.svg")}
              alt="logo"
              width="40px"
              height="40px"
            />
          </Navbar.Brand>
          <Nav className="mr-auto">
            <Nav.Link href="#home">
              <LoginForm
                user={user}
                handleAddUser={onhandleAddUser}
                onhandleUpdateEvents={props.onhandleUpdateEvents}
              />
            </Nav.Link>
          </Nav>
          <Nav.Link>
            <GeolocProvider />
          </Nav.Link>
          <Nav.Link href="#search">
            <Button variant="outline-light" type="submit">
              <FontAwesomeIcon icon="globe-americas" size="2x" />
            </Button>
          </Nav.Link>
          <Form inline></Form>
        </Navbar>
      </Container>
      {props.children}
    </>
  );
}

export default React.memo(MyNavBar);
