import React, { useState, useEffect } from "react";

import MyNavBar from "./MyNavBar";
import CardList from "./CardList";

import { eventsEndPoint, usersEndPoint } from "../helpers/endpoints";

export default function App() {
  console.log("__App__");
  const [users, setUsers] = useState("");
  const [events, setEvents] = useState("");

  const user = "";

  useEffect(() => {
    (async function fetchData() {
      //   setLoading(true);
      try {
        const responseEvents = await fetch(eventsEndPoint);
        if (responseEvents.ok) {
          const dataEvents = await responseEvents.json();
          setEvents(dataEvents);
        }
      } catch (err) {
        setEvents(null);
        throw new Error(err);
        //   } finally {
        //     setLoading(false);
        //   }
      }
    })();
  }, []);

  useEffect(() => {
    (async function fetchData() {
      //   setLoading(true);
      try {
        const responseUsers = await fetch(usersEndPoint);
        if (responseUsers.ok) {
          const dataUsers = await responseUsers.json();
          setUsers(dataUsers);
        }
      } catch (err) {
        setUsers(null);
        throw new Error(err);
        //   } finally {
        //     setLoading(false);
        //   }
      }
    })();
  }, []);

  function handleUser(user) {
    setUsers((prev) => [...prev, user]);
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

  // function register(){
  //     console.log("_onRegister_");
  //     const email = document.querySelector("#email").value;
  //     const password = document.querySelector("#password").value;
  //     if (!email || !password) {
  //         setError(true);
  //     } else {
  //         onLoginSuccess("formUp", { email, password });
  //         setUsers((prev) => {
  //             [...prev, result];
  //         });
  //         handleUsers()
  //     }
  // }

  // function saveUser(jwt, user) {
  //     setLoggedIn(true);
  //     localStorage.setItem("jwt", jwt);
  //     localStorage.setItem("user", user.email);
  //     alert(`Welcome ${user.email}`);
  //     setResult(user);
  // }

  // async function onLoginSuccess(method, response) {
  //     setResult({ method, response });
  //     const { email, password } = response;

  //     if (method === "facebook") {
  //     const {
  //         authResponse: { accessToken }, //, userID },
  //     } = response;
  //     // call Facebook to get user's credentials: window.FB.api(userID, (res) =>{ setResult(res.name )})
  //     const query = await fetch(`https://graph.facebook.com/me?access_token=${accessToken}&
  // fields=id,name,email,picture.width(640).height(640)`);
  //     const {
  //         id,
  //         email,
  //         picture: {
  //         data: { url },
  //         },
  //     } = await query.json();
  //     setAvatar(url);
  //     const fbUserData = {
  //         user: {
  //         email,
  //         uid: id,
  //         },
  //     };
  //     // call API to find or create user and get Knock_token
  //     const queryAppToken = await fetch(uri + "/api/v1/findCreateFbUser", {
  //         method: "POST",
  //         body: JSON.stringify(fbUserData),
  //         headers: { "Content-Type": "application/json" },
  //     });
  //     if (queryAppToken.ok) {
  //         const { access_token } = await queryAppToken.json();
  //         try {
  //         const getCurrentUser = await fetch(uri + "/api/v1/profile", {
  //             headers: { authorization: "Bearer " + access_token },
  //         });
  //         const currentUser = await getCurrentUser.json();

  //         if (currentUser.confirm_email && !currentUser.confirm_token) {
  //             saveUser(access_token, currentUser);
  //         } else {
  //             onLoginFail("Check your mail to confirm password update");
  //         }
  //         } catch (err) {
  //         throw new Error(err);
  //         }
  //     } else {
  //         onLoginFail("Please confirm with your email");
  //     }
  //     }

  //     const authData = JSON.stringify({
  //     auth: { email, password },
  //     });

  //     if (method === "formUp") {
  //     // 1- check if user already exists with these credentials
  //     try {
  //         const getUserToken = await fetch(uri + "/api/v1/getUserToken", {
  //         method: "POST",
  //         headers: {
  //             "Content-Type": "application/json",
  //         },
  //         body: authData,
  //         });

  //         if (getUserToken.ok) {
  //         const { jwt } = await getUserToken.json();
  //         const getCurrentUser = await fetch(uri + "/api/v1/profile", {
  //             headers: { authorization: "Bearer " + jwt },
  //         });
  //         const currentUser = await getCurrentUser.json();
  //         if (currentUser.confirm_email && !currentUser.confirm_token) {
  //             console.log("__confirmed__");
  //             saveUser(jwt, currentUser);
  //         } else {
  //             onLoginFail("Check your mail to confirm password update 1");
  //         }
  //         } else {
  //         console.log("__update__");
  //         // credentials don't exist: update with received credentials via email
  //         const userData = JSON.stringify({
  //             user: { email: response.email, password: response.password },
  //         });
  //         const checkUser = await fetch(uri + "/api/v1/createUser", {
  //             method: "POST",
  //             headers: { "Content-Type": "application/json" },
  //             body: userData,
  //         });

  //         if (checkUser.ok) {
  //             try {
  //             const getUserToken = await fetch(uri + "/api/v1/getUserToken", {
  //                 method: "POST",
  //                 headers: {
  //                 "Content-Type": "application/json",
  //                 },
  //                 body: authData,
  //             });

  //             if (getUserToken.ok) {
  //                 console.log("updated in db, waiting for mail confirmation");
  //                 const { jwt } = await getUserToken.json();

  //                 // check in db if email_confirmed with the token
  //                 const getCurrentUser = await fetch(uri + "/api/v1/profile", {
  //                 headers: { authorization: "Bearer " + jwt },
  //                 });
  //                 const currentUser = await getCurrentUser.json();

  //                 if (currentUser.confirm_mail && !currentUser.confirm_token) {
  //                 console.log("__updated__");
  //                 saveUser(jwt, currentUser);
  //                 } else {
  //                 onLoginFail("Check your mail to confirm password update 2");
  //                 }
  //             } else {
  //                 onLoginFail("Not existing");
  //             }
  //             } catch (err) {
  //             throw new Error(err);
  //             }
  //         } else {
  //             onLoginFail("Bad input");
  //         }
  //         }
  //     } catch (err) {
  //         throw new Error(err);
  //     }
  //     }

  //     if (method === "formIn") {
  //     // check user with the jwt token return from the backend
  //     try {
  //         const getUserToken = await fetch(uri + "/api/v1/getUserToken", {
  //         method: "POST",
  //         headers: {
  //             "Content-Type": "application/json",
  //         },
  //         body: authData,
  //         });

  //         if (getUserToken.ok) {
  //         // need to have mail checked to enter
  //         const { jwt } = await getUserToken.json();
  //         const getCurrentUser = await fetch(uri + "/api/v1/profile", {
  //             headers: { authorization: "Bearer " + jwt },
  //         });
  //         const currentUser = await getCurrentUser.json();
  //         if (currentUser.confirm_email && !currentUser.confirm_token) {
  //             saveUser(jwt, currentUser);
  //         } else {
  //             onLoginFail("Please confirm with your email");
  //         }
  //         } else {
  //         onLoginFail("Wrong credentials");
  //         }
  //     } catch (err) {
  //         throw new Error(err);
  //     }
  //     }
  //     closeModal();
  //     setLoading(false);
  //     setInitialTab("login");
  // }

  return (
    <>
      <MyNavBar onhandleUser={() => handleUser(user)} />
      <CardList
        users={users}
        events={events}
        ongetEvents={getEvents}
        ongetUsers={getUsers}
      />
    </>
  );
}
