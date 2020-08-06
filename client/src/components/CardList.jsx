import React, { useState } from "react";

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Button from "react-bootstrap/Button";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";

import CardItem from "./CardItem";
import Details from "./Details";

import BePatient from "./BePatient";
import EventModal from "./EventModal";
import EventForm from "./EventForm";
import fetchWithToken from "../helpers/fetchWithToken";
import fetchAll from "../helpers/fetchAll"; // returns data after PATCH or POST depending upon endpoint
import returnUnauthorized from "../helpers/returnUnauthorized";
import { eventsEndPoint, usersEndPoint } from "../helpers/endpoints"; // const endpoints
import cloudName from "../config/cloudName"; // for Cloudinary

const uri = process.env.REACT_APP_URL;

function CardList({ user, users, events, ...props }) {
  // events= [event:{user, itinary, participants, url, publicID}]
  const [itinary, setItinary] = useState(""); // array [date, start, end, startGSP, endGPS]
  const [fileCL, setFileCL] = useState("");
  const [previewCL, setPreviewCL] = useState(""); // preview photo
  const [publicID, setPublicID] = useState(""); // id for Cloudinary
  const [changed, setChanged] = useState(false); // boolean if file selected
  const [loading, setLoading] = useState(false);
  const [participants, setParticipants] = useState([]); // array of users
  const [indexEdit, setIndexEdit] = useState(null); // :id for PATCH
  const [show, setShow] = useState(false); // modal
  const [modalId, setModalId] = useState(null);

  console.log("_render CardList_");

  // modal in a list: use index boolean
  const handleCloseDetail = () => setModalId(null);

  const handleShowDetail = (index) => {
    setModalId(index);
  };

  const handleShow = () => setShow(true);

  const handleClose = () => {
    setShow(false);
    setItinary("");
    setParticipants([]);
    setPreviewCL("");
    setPublicID("");
    setIndexEdit("");
    setChanged(false);
    setModalId(null);
  };

  // remove row from table
  const handleRemove = async (e, event) => {
    e.preventDefault();
    if (!user) return window.alert("Please login");

    if (window.confirm("Confirm removal?")) {
      try {
        const query = await fetchWithToken(eventsEndPoint + event.id, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }); // then new updated rows
        if (query.status !== 200) {
          return returnUnauthorized();
        }
        if (query.status === 200) {
          const response = await query.json();
          if (response.status === 401) {
            return returnUnauthorized();
          }
          props.onhandleRemoveEvent(event);
        }
      } catch (err) {
        console.log(err);
      }
    }
  };

  // POST or PATCH the modal form:
  /* => object formdata to pass to the backend
    {event: {
      itinary_attributes:{date:xxx, start:xxx, end:xxx},
      participants:[{email:xxx,notif:bool}, {...}],
      photo : "http://res.cloudinary.com/xxx",
      directClURL, publicID
    */

  async function handleFormSubmit(e) {
    e.preventDefault();
    if (!user) return window.alert("Please login");

    // 1st promise to append non-async data to the FormData
    function init(fd) {
      for (const key in itinary) {
        console.log(key, itinary[key]);
        fd.append(`event[itinary_attributes][${key}]`, itinary[key]);
      }
      if (participants.length > 0) {
        participants.forEach((member) => {
          for (const key in member) {
            console.log(key, member[key]);
            fd.append(`event[participants][][${key}]`, member[key]);
          }
        });
      } else {
        fd.append(`event[participants][]`, []);
      }
      return Promise.resolve(fd);
    }

    // 2d promise: POST photo to CL, receives link back , and append FormData
    async function upLoadToCL(ffd) {
      if (changed) {
        // boolean: changed <=> new file input for CL
        const newfd = new FormData();
        newfd.append("file", fileCL);
        newfd.append("upload_preset", "ml_default");
        return fetch(`https://api.cloudinary.com/v1_1/${cloudName}/upload`, {
          method: "POST",
          body: newfd,
        })
          .then((res) => res.json())
          .then((resCL) => {
            //setPreviewCL(resCL);
            ffd.append("event[directCLurl]", resCL.secure_url);
            ffd.append("event[publicID]", resCL.public_id);
            return ffd;
          })
          .catch((err) => {
            throw new Error(err);
          });
      } else {
        return Promise.resolve(ffd);
      }
    }
    // chaining of promises 1 & 2
    init(new FormData())
      .then((res) => upLoadToCL(res))
      .then((data) => {
        if (!indexEdit) {
          // no index <=> POST to '/events'
          fetchAll({
            // !!!!! no headers "Content-type".. for formdata !!!!!
            method: "POST",
            index: "",
            body: data,
          })
            .then((result) => {
              if (result) {
                props.onhandleUpdateEvents(result);
              }
            })
            .catch((err) => console.log(err));
        } else if (indexEdit) {
          // index <=> PATCH to 'events/:id'
          fetchAll({
            method: "PATCH",
            index: indexEdit,
            body: data,
          })
            .then((result) => {
              if (result) {
                props.onhandleUpdateEvents(result);
              }
            })
            .catch((err) => console.log(err));
        }
      });
    handleClose(); // reset
  }

  // Edit event
  async function handleEdit(event) {
    setIndexEdit(event.id); // get /api/v1/events/:id
    const data = events.find((ev) => ev.id === event.id);
    setItinary({
      date: new Date(data.itinary.date).toISOString().slice(0, 10),
      start: data.itinary.start,
      end: data.itinary.end,
    });
    setParticipants(data.participants || []);

    if (event.publicID) {
      setPublicID(event.publicID);
    }
    handleShow(); // open modal-form
  }

  function handleSelectChange(selectedOptions) {
    if (selectedOptions) {
      const kiters = [];
      selectedOptions.forEach((selOpt) => {
        const participant = participants.find((p) => p.email === selOpt.value);
        if (participant) {
          return kiters.push({
            email: selOpt.value,
            notif: participant.notif,
            ptoken: "",
          });
        } else {
          return kiters.push({
            email: selOpt.value,
            notif: false,
            ptoken: "",
          });
        }
      });
      setParticipants(kiters);
    } else setParticipants([]);
  }

  // update dynamically key/value for date, start, end of itinary
  function handleItinaryChange(e) {
    setItinary({
      ...itinary,
      [e.target.name]: e.target.value,
    });
  }

  async function handlePictureCL(e) {
    if (e.target.files[0]) {
      setPreviewCL(URL.createObjectURL(e.target.files[0]));
      setChanged(true);
      setFileCL(e.target.files[0]);
    }
  }

  // send mail to ask to join an event
  async function handlePush(event) {
    if (user) {
      const demand = JSON.stringify({
        user: user, //,currentUser,
        owner: event.user.email,
        event: event,
      });
      await fetchWithToken(uri + "/api/v1/pushDemand", {
        method: "POST",
        body: demand,
      });
      window.alert("Mail sent");
      const responseEvents = await fetch(eventsEndPoint);
      if (responseEvents.ok) {
        const dataEvents = await responseEvents.json();
        props.onhandleUpdateEvents(dataEvents);
      }
      handleCloseDetail();
    } else {
      window.alert("Please login");
      handleCloseDetail();
    }
  }

  function checkUserDemand(index, modalId, event) {
    if (index !== modalId) return null;
    console.log("*check*");
    if (user) {
      if (user.email === event.user.email) {
        window.alert("You are asking to yourself...! ;)");
        return true;
      }
      const checkDemander = event.participants.find(
        (participant) => participant.email === user.email
      );
      if (checkDemander) {
        window.alert("Already done!");
        return true;
      }
    }
    return false;
  }

  return (
    <>
      {!events || !users ? (
        <Container>
          <Row className="justify-content-md-center">
            <BePatient go={loading} />
          </Row>
        </Container>
      ) : (
        <>
          <br />
          <Container>
            <Row style={{ justifyContent: "center" }}>
              <Button
                variant="outline-dark"
                onClick={handleShow}
                style={{ fontSize: "30px" }}
              >
                <FontAwesomeIcon icon="fa-check" />{" "}
                <span> Create an event</span>
              </Button>

              <EventModal show={show} onhandleClose={handleClose}>
                <EventForm
                  users={users}
                  participants={participants}
                  date={itinary.date}
                  start={itinary.start}
                  end={itinary.end}
                  previewCL={previewCL}
                  publicID={publicID}
                  loading={loading}
                  onFormSubmit={handleFormSubmit}
                  onhandleItinaryChange={handleItinaryChange}
                  onSelectChange={handleSelectChange}
                  onhandlePictureCL={handlePictureCL}
                />
              </EventModal>
            </Row>
          </Container>
          <br />

          {events &&
            events.map((event, index) => {
              return (
                <CardItem
                  key={event.id}
                  event={event}
                  onhandleRemove={(e) => handleRemove(e, event)}
                  onhandleEdit={() => handleEdit(event)}
                >
                  <Details
                    event={event}
                    index={index}
                    modalId={modalId}
                    onhandleShowDetail={() => handleShowDetail(index)}
                    onhandlePush={() => handlePush(event)}
                    onhandleCloseDetail={() => handleCloseDetail(index)}
                    onCheckUserDemand={() =>
                      checkUserDemand(index, modalId, event)
                    }
                  />
                </CardItem>
              );
            })}
        </>
      )}
    </>
  );
}

export default React.memo(CardList);
