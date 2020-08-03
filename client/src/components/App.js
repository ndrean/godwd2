import React, { useState, useEffect } from "react";

import MyNavBar from "./MyNavBar";
import CardList from "./CardList";

import { eventsEndPoint, usersEndPoint } from "../helpers/endpoints";

export default function App() {
  console.log("__App__");
  const [users, setUsers] = useState("");
  const [events, setEvents] = useState("");
  const [user, setUser] = useState("");
  const [loading, setLoading] = useState(false);

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
  function handleUser(currentUser) {
    setUser(currentUser);
    if (!users.find((user) => user.email === currentUser.email)) {
      setUsers((prev) => [...prev, currentUser]);
    }
  }

  async function getUsers() {
    try {
      const responseUsers = await fetch(usersEndPoint);
      const dataUsers = await responseUsers.json();
      if (dataUsers) {
        setUsers(dataUsers);
      }
    } catch (err) {
      throw new Error(err);
    }
  }

  async function getEvents() {
    try {
      const responseEvents = await fetch(eventsEndPoint);
      const dataEvents = await responseEvents.json();
      if (dataEvents) {
        setEvents(dataEvents);
      }
    } catch (err) {
      throw new Error(err);
    }
  }

  return (
    <>
      <MyNavBar user={user} onhandleUser={handleUser} />
      <CardList
        users={users}
        events={events}
        ongetEvents={getEvents}
        ongetUsers={getUsers}
      />
    </>
  );
}
