import React from "react";
import LoginForm from "./LoginForm";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Image from "react-bootstrap/Image";
import FormControl from "react-bootstrap/FormControl";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import GeolocProvider from "../geoloc/GeolocProvider";
export default function MyNavBar() {
  return (
    <>
      <Navbar bg="primary" variant="dark">
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
            <LoginForm />
          </Nav.Link>
        </Nav>
        <Nav.Link>
          <GeolocProvider />
        </Nav.Link>
        <Form inline>
          {/* <FormControl type="text" placeholder="Search" className="mr-sm-2" /> */}
          <Button variant="outline-light" type="submit">
            <FontAwesomeIcon icon="globe-americas" size="2x" />
          </Button>
        </Form>
      </Navbar>
    </>
  );
}
