import React, { useState, useEffect } from "react";
import Container from "react-bootstrap/Container";

import MyNavBar from "./MyNavBar";
import CardList from "./CardList";
import DisplayMap from "../geoloc/MyMap";

import { eventsEndPoint, usersEndPoint } from "../helpers/endpoints";
import "../index.css";

export default function App() {
  console.log("__App__");
  const [users, setUsers] = useState("");
  const [events, setEvents] = useState("");
  const [user, setUser] = useState("");
  const [loading, setLoading] = useState(false);
  const [jwtToken, setJwtToken] = useState("");

  useEffect(() => {
    (async function fetchData() {
      setLoading(true);
      try {
        const responseEvents = await fetch(eventsEndPoint);
        if (responseEvents.ok) {
          const dataEvents = await responseEvents.json();
          setEvents(dataEvents);
        }
      } catch (err) {
        setEvents(null);
        throw new Error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    (async function fetchData() {
      setLoading(true);
      try {
        const responseUsers = await fetch(usersEndPoint);
        if (responseUsers.ok) {
          const dataUsers = await responseUsers.json();
          setUsers(dataUsers);
        }
      } catch (err) {
        setUsers(null);
        throw new Error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // get currentUser in the child component App>MyNavBar>LoginForm and takes it up back here to update
  function handleAddUser(currentUser) {
    setUser(currentUser);
    if (!users.find((user) => user.email === currentUser.email)) {
      setUsers((prev) => [...prev, currentUser]);
    }
  }

  function handleRemoveEvent(event) {
    console.log("*removeEvt*");
    setEvents((prev) => [...prev].filter((ev) => ev.id !== event.id));
  }

  function handleAddEvent(event) {
    console.log("*AddEvt*");
    setEvents((prev) => [...prev, event]);
  }

  function handleUpdateEvents(results) {
    console.log("*updateEvts*");
    setEvents(results);
  }
  function handleToken(value) {
    setJwtToken(value);
  }

  function removeToken() {
    setJwtToken("");
  }
  return (
    <>
      <MyNavBar
        user={user}
        onhandleToken={handleToken}
        onRemoveToken={removeToken}
        onhandleAddUser={handleAddUser}
        onhandleUpdateEvents={handleUpdateEvents}
      />
      <CardList
        user={user}
        token={jwtToken}
        users={users}
        events={events}
        onhandleRemoveEvent={handleRemoveEvent}
        onhandleAddEvent={handleAddEvent}
        onhandleUpdateEvents={handleUpdateEvents}
      />

      <Container>
        <DisplayMap
          user={user}
          token={jwtToken}
          onhandleUpdateEvents={handleUpdateEvents}
          events={events}
        />
      </Container>
    </>
  );
}
