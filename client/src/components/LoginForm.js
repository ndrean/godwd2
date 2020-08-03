import React from "react";
import ReactModalLogin from "react-modal-login";

import Container from "react-bootstrap/Container";

import Image from "react-bootstrap/Image";
import Button from "react-bootstrap/Button";

import facebookConfig from "../config/facebookConfig";

const uri = process.env.REACT_APP_URL;

export default function LoginForm({ user, ...props }) {
  console.log("render Login");
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

  function saveUser(jwt, user) {
    setLoggedIn(true);
    localStorage.setItem("jwt", jwt);
    localStorage.setItem("user", user.email);
    alert(`Welcome ${user.email}`);
    // take user up tp App
    props.handleUser(user);
  }

  async function onLoginSuccess(method, response) {
    setResult({ method, response });
    const { email, password } = response;

    if (method === "facebook") {
      const {
        authResponse: { accessToken }, //, userID },
      } = response;
      // call Facebook to get user's credentials: window.FB.api(userID, (res) =>{ setResult(res.name )})
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
      const fbUserData = {
        user: {
          email,
          uid: id,
        },
      };
      // call API to find or create user and get Knock_token
      const queryAppToken = await fetch(uri + "/api/v1/findCreateFbUser", {
        method: "POST",
        body: JSON.stringify(fbUserData),
        headers: { "Content-Type": "application/json" },
      });
      if (queryAppToken.ok) {
        const { access_token } = await queryAppToken.json();
        try {
          const getCurrentUser = await fetch(uri + "/api/v1/profile", {
            headers: { authorization: "Bearer " + access_token },
          });
          const currentUser = await getCurrentUser.json();

          if (currentUser.confirm_email && !currentUser.confirm_token) {
            saveUser(access_token, currentUser);
            // user = currentUser;
            // props.handleUser(currentUser);
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

    const authData = JSON.stringify({
      auth: { email, password },
    });

    if (method === "formUp") {
      // 1- check if user already exists with these credentials
      try {
        const getUserToken = await fetch(uri + "/api/v1/getUserToken", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: authData,
        });

        if (getUserToken.ok) {
          const { jwt } = await getUserToken.json();
          const getCurrentUser = await fetch(uri + "/api/v1/profile", {
            headers: { authorization: "Bearer " + jwt },
          });
          const currentUser = await getCurrentUser.json();
          if (currentUser.confirm_email && !currentUser.confirm_token) {
            console.log("__confirmed__");
            saveUser(jwt, currentUser);
            // user = currentUser;
            // props.handleUser(currentUser);
          } else {
            onLoginFail("Check your mail to confirm password update 1");
          }
        } else {
          console.log("__update__");
          // credentials don't exist: update with received credentials via email
          const userData = JSON.stringify({
            user: { email: response.email, password: response.password },
          });
          const checkUser = await fetch(uri + "/api/v1/createUser", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: userData,
          });

          if (checkUser.ok) {
            try {
              const getUserToken = await fetch(uri + "/api/v1/getUserToken", {
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
                const getCurrentUser = await fetch(uri + "/api/v1/profile", {
                  headers: { authorization: "Bearer " + jwt },
                });
                const currentUser = await getCurrentUser.json();

                if (currentUser.confirm_mail && !currentUser.confirm_token) {
                  console.log("__updated__");
                  saveUser(jwt, currentUser);
                  // user = currentUser;
                  // props.handleUser(currentUser);
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

    if (method === "formIn") {
      // check user with the jwt token return from the backend
      try {
        const getUserToken = await fetch(uri + "/api/v1/getUserToken", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: authData,
        });

        if (getUserToken.ok) {
          // need to have mail checked to enter
          const { jwt } = await getUserToken.json();
          const getCurrentUser = await fetch(uri + "/api/v1/profile", {
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
  }

  function startLoading() {
    setLoading(true);
  }

  function finishLoading() {
    setLoading(false);
  }

  // function afterTabsChange() {
  //   setError(null);
  //   setRecoverPasswordSuccess(false);
  // }

  return (
    <>
      <Container>
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
      </Container>
      <Container>
        {!!localStorage.jwt ? (
          <Button
            onClick={() => {
              setLoggedIn(false);
              localStorage.removeItem("jwt");
              localStorage.removeItem("user");
              setAvatar("");
              setResult("");
            }}
            style={{
              padding: "5px",
              margin: "auto",
              border: "none",
              backgroundColor: "grey", //"#3b5998",
              color: "white",
            }}
          >
            {" "}
            {!avatar && result.email ? (
              result.email
            ) : avatar ? (
              <Image
                alt="avatar"
                src={avatar}
                style={{ width: 50, height: 50 }}
                loading="lazy"
                // roundedCircle
              />
            ) : (
              "Logout"
            )}
          </Button>
        ) : null}
      </Container>

      <Container>
        <ReactModalLogin
          visible={showModal}
          onCloseModal={closeModal}
          loading={loading}
          error={error}
          initialTab={initialTab}
          //   tabs={{ afterChange: afterTabsChange }}
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
          form={{
            onLogin: onLogin,
            onRegister: onRegister,
            // onRecoverPassword: onRecoverPassword,
            // recoverPasswordSuccessLabel: recoverPasswordSuccess
            //   ? {
            //       label: "New password has been sent to your mailbox!",
            //     }
            //   : null,
            // recoverPasswordAnchor: {
            //   label: "Forgot your password?",
            // },
            loginBtn: {
              label: "Sign in",
            },
            registerBtn: {
              label: "Sign up",
            },
            // recoverPasswordBtn: {
            //   label: "Send new password",
            // },
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
              // {
              //   containerClass: "RML-form-group",
              //   label: "Nickname",
              //   type: "text",
              //   inputClass: "RML-form-control",
              //   id: "login",
              //   name: "login",
              //   placeholder: "Nickname",
              // },
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
            recoverPasswordInputs: [
              {
                containerClass: "RML-form-group",
                label: "Email",
                type: "email",
                inputClass: "RML-form-control",
                id: "email",
                name: "email",
                placeholder: "Email",
              },
            ],
          }}
        />
      </Container>
    </>
  );
}
