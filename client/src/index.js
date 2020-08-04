import React, { useContext } from "react";
import ReactDOM from "react-dom";

import "bootstrap/dist/css/bootstrap.min.css";
import App from "./components/App";
import MyNavBar from "./components/MyNavBar";
import CardList from "./components/CardList";
import * as serviceWorker from "./serviceWorker";

import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faTrash,
  faEdit,
  faInfoCircle,
  faPlusSquare,
  faCheck,
  faBell,
  faShare,
  faPaperPlane,
  faCamera,
  faGlobeAmericas,
} from "@fortawesome/free-solid-svg-icons";
library.add(
  faTrash,
  faEdit,
  faInfoCircle,
  faPlusSquare,
  faCheck,
  faBell,
  faShare,
  faPaperPlane,
  faCamera,
  faGlobeAmericas
);

// <React.StrictMode></React.StrictMode>
ReactDOM.render(
  <>
    <App />
  </>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
