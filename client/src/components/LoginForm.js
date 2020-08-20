import React from "react";
import ReactModalLogin from "react-modal-login";

import Image from "react-bootstrap/Image";
import Button from "react-bootstrap/Button";

import facebookConfig from "../config/facebookConfig";

//const uri = process.env.REACT_APP_URL;

function LoginForm({ user, ...props }) {
  console.log("__render Login__");
  const [showModal, setShowModal] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [loggedIn, setLoggedIn] = React.useState(false);
  const [initialTab, setInitialTab] = React.useState("login");
  const [avatar, setAvatar] = React.useState("");
  const [result, setResult] = React.useState("");

  function openModal() {
    setShowModal(true);
    setInitialTab("login");
  }

  function closeModal() {
    setShowModal(false);
    setError(null);
    setInitialTab("login");
  }

  function onLogin() {
    console.log("_onLogin_");
    const email = document.querySelector("#email").value;
    const password = document.querySelector("#password").value;
    if (!email || !password) {
      setError(true);
    } else {
      onLoginSuccess("formIn", { email, password });
    }
  }

  function onRegister() {
    console.log("_onRegister_");
    const email = document.querySelector("#email").value;
    const password = document.querySelector("#password").value;

    if (!email || !password) {
      setError(true);
    } else {
      onLoginSuccess("formUp", { email, password });
    }
  }

  async function saveUser(jwt, user) {
    setLoggedIn(true);
    localStorage.setItem("jwt", true);
    props.onhandleToken(jwt);
    localStorage.setItem("user", user.email);
    alert(`Welcome ${user.email}`);
    // take user up tp App
    props.handleAddUser(user);
    const queryRefresh = await fetch("/api/v1/events");
    props.onhandleUpdateEvents(await queryRefresh.json());
  }

  async function onLoginSuccess(method, response) {
    setResult({ method, response });
    const { email, password } = response;
    // 1. using Facebook log-in or sign-in
    if (method === "facebook") {
      // 1.1 call Facebook to get user's credentials: window.FB.api(userID, (res) =>{ setResult(res.name )})
      const {
        authResponse: { accessToken }, //, userID },
      } = response;
      const query = await fetch(`https://graph.facebook.com/me?access_token=${accessToken}&
fields=id,name,email,picture.width(640).height(640)`);
      const {
        id,
        email,
        picture: {
          data: { url },
        },
      } = await query.json();
      setAvatar(url);

      // 1.2 call API to FIND OR CREATE user and get API authentification Knock_token
      const fbUserData = {
        user: {
          email,
          uid: id,
        },
      };
      const queryAppToken = await fetch("/api/v1/findCreateFbUser", {
        method: "POST",
        body: JSON.stringify(fbUserData),
        headers: { "Content-Type": "application/json" },
      });
      if (queryAppToken.ok) {
        const { access_token } = await queryAppToken.json();
        console.log(access_token);
        try {
          const getCurrentUser = await fetch("/api/v1/profile", {
            headers: { authorization: "Bearer " + access_token },
          });
          const currentUser = await getCurrentUser.json();
          console.log(currentUser);

          if (currentUser.confirm_email && !currentUser.confirm_token) {
            saveUser(access_token, currentUser);
          } else {
            onLoginFail("Check your mail to confirm password update");
          }
        } catch (err) {
          throw new Error(err);
        }
      } else {
        onLoginFail("Please confirm with your email");
      }
    }
    // 2. using the form
    const authData = JSON.stringify({
      auth: { email, password },
    });
    // 2.1 form sign-up
    if (method === "formUp") {
      // 1- check if user already exists with these credentials
      try {
        const getUserToken = await fetch("/api/v1/getUserToken", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: authData,
        });

        if (getUserToken.ok) {
          const { jwt } = await getUserToken.json();
          const getCurrentUser = await fetch("/api/v1/profile", {
            headers: { authorization: "Bearer " + jwt },
          });
          const currentUser = await getCurrentUser.json();
          if (currentUser.confirm_email && !currentUser.confirm_token) {
            console.log("__confirmed__");
            saveUser(jwt, currentUser);
          } else {
            onLoginFail("Check your mail to confirm password update 1");
          }
        } else {
          console.log("__update__");
          // credentials don't exist: update with received credentials via email
          const userData = JSON.stringify({
            user: { email: response.email, password: response.password },
          });
          const checkUser = await fetch("/api/v1/createUser", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: userData,
          });

          if (checkUser.ok) {
            try {
              const getUserToken = await fetch("/api/v1/getUserToken", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: authData,
              });

              if (getUserToken.ok) {
                console.log("updated in db, waiting for mail confirmation");
                const { jwt } = await getUserToken.json();

                // check in db if email_confirmed with the token
                const getCurrentUser = await fetch("/api/v1/profile", {
                  headers: { authorization: "Bearer " + jwt },
                });
                const currentUser = await getCurrentUser.json();

                if (currentUser.confirm_mail && !currentUser.confirm_token) {
                  console.log("__updated__");
                  saveUser(jwt, currentUser);
                } else {
                  onLoginFail("Check your mail to confirm password update 2");
                }
              } else {
                onLoginFail("Not existing");
              }
            } catch (err) {
              throw new Error(err);
            }
          } else {
            onLoginFail("Bad input");
          }
        }
      } catch (err) {
        throw new Error(err);
      }
    }
    // 2.2 form sign-in
    if (method === "formIn") {
      // check user with the jwt token return from the backend
      try {
        const getUserToken = await fetch("/api/v1/getUserToken", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: authData,
        });

        if (getUserToken.ok) {
          // need to have mail checked to enter
          const { jwt } = await getUserToken.json();
          const getCurrentUser = await fetch("/api/v1/profile", {
            headers: { authorization: "Bearer " + jwt },
          });
          const currentUser = await getCurrentUser.json();
          if (currentUser.confirm_email && !currentUser.confirm_token) {
            saveUser(jwt, currentUser);
          } else {
            onLoginFail("Please confirm with your email");
          }
        } else {
          onLoginFail("Wrong credentials");
        }
      } catch (err) {
        throw new Error(err);
      }
    }
    closeModal();
    setLoading(false);
    setInitialTab("login");
  }

  function onLoginFail(response) {
    alert(response);
    setError(response);
    setLoading(false);
    setLoggedIn(false);
    setAvatar("");
    setResult({ error: response });
    localStorage.removeItem("jwt");
    localStorage.removeItem("user");
    setInitialTab("login");
    props.onRemoveToken();
  }

  function startLoading() {
    setLoading(true);
  }

  function finishLoading() {
    setLoading(false);
  }

  function logOut() {
    props.onRemoveToken();
    window.alert("bye");
  }

  return (
    <>
      <Button
        onClick={openModal}
        hidden={loggedIn}
        style={{
          padding: "10px",
          margin: "auto",
          border: "none",
          backgroundColor: "#1666C5", //"#3b5998",
          color: "white",
          fontWeight: "bold",
          fontSize: "20px",
        }}
      >
        Connect
      </Button>

      {!!localStorage.jwt ? (
        <Button
          onClick={() => {
            setLoggedIn(false);
            localStorage.removeItem("jwt");
            localStorage.removeItem("user");
            setAvatar("");
            setResult("");
            logOut();
          }}
          style={{
            padding: "5px",
            margin: "auto",
            border: "none",
            backgroundColor: "grey", //"#3b5998",
            color: "white",
          }}
        >
          {!avatar && !result ? null : avatar ? (
            <Image
              alt="avatar"
              src={avatar}
              style={{ width: 50, height: 50 }}
              loading="lazy"
            />
          ) : result.response ? (
            result.response.email
          ) : null}
        </Button>
      ) : null}

      <ReactModalLogin
        visible={showModal}
        onCloseModal={closeModal}
        loading={loading}
        error={error}
        initialTab={initialTab}
        loginError={{ label: "Couldn't sign in, please try again." }}
        registerError={{ label: "Couldn't sign up, please try again." }}
        startLoading={startLoading}
        finishLoading={finishLoading}
        providers={{
          facebook: {
            config: facebookConfig,
            onLoginSuccess: onLoginSuccess,
            onLoginFail: onLoginFail,
            label: "Continue with Facebook",
          },
        }}
        separator={{ label: "or" }}
        form={{
          onLogin: onLogin,
          onRegister: onRegister,
          loginBtn: {
            label: "Sign in",
          },
          registerBtn: {
            label: "Sign up",
          },
          loginInputs: [
            {
              containerClass: "RML-form-group",
              label: "Email",
              type: "email",
              inputClass: "RML-form-control",
              id: "email",
              name: "email",
              placeholder: "Email",
            },
            {
              containerClass: "RML-form-group",
              label: "Password",
              type: "password",
              inputClass: "RML-form-control",
              id: "password",
              name: "password",
              placeholder: "Password",
            },
          ],
          registerInputs: [
            {
              containerClass: "RML-form-group",
              label: "Email",
              type: "email",
              inputClass: "RML-form-control",
              id: "email",
              name: "email",
              placeholder: "Email",
            },
            {
              containerClass: "RML-form-group",
              label: "Password",
              type: "password",
              inputClass: "RML-form-control",
              id: "password",
              name: "password",
              placeholder: "Password",
            },
          ],
        }}
      />
    </>
  );
}

// export default LoginForm;
export default React.memo(LoginForm);
