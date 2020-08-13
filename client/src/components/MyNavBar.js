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
//import "../index.css";
import GeolocProvider from "../geoloc/GeolocProvider";

// fixed="top"
function MyNavBar({
  user,
  onhandleAddUser,
  onhandleUpdateEvents,
  onhandleToken,
  onRemoveToken,
}) {
  return (
    <Navbar bg="primary" fixed="top">
      <Navbar.Brand>
        <Image
          src={require("../assets/kitesurfing.svg")}
          alt="logo"
          width="40px"
          height="40px"
        />
      </Navbar.Brand>
      <Nav className="mr-auto">
        {/* <Nav.Link href=""> */}
        <LoginForm
          user={user}
          onhandleToken={onhandleToken}
          onRemoveToken={onRemoveToken}
          handleAddUser={onhandleAddUser}
          onhandleUpdateEvents={onhandleUpdateEvents}
        />
        {/* </Nav.Link> */}
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
  );
}

export default MyNavBar;
