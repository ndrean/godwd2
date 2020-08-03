import React from "react";

import Table from "react-bootstrap/Table";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";

// import TableRow from "./TableRow";
import AddEventModal from "./AddEventModal";
import AddEventForm from "./AddEventForm";
import fetchWithToken from "../helpers/fetchWithToken";

import CardItem from "./CardItem";

// utilitaries for fetch (Rails token with @rails/ujs)
// import fetchWithToken from "../helpers/fetchWithToken"; // token for POST, PATCH, DELETE
import fetchAll from "../helpers/fetchAll"; // returns data after PATCH or POST depending upon endpoint
import returnUnauthorized from "../helpers/returnUnauthorized";
import { eventsEndPoint, usersEndPoint } from "../helpers/endpoints"; // const endpoints
import cloudName from "../config/cloudName";

const uri = process.env.REACT_APP_URL;

const DataTable = () => {
  // from db: events= [event:{user, itinary, participants}]
  const [users, setUsers] = React.useState([]); // fetch from db
  const [events, setEvents] = React.useState([]); // fetch from db

  const [itinary, setItinary] = React.useState({
    date: "",
    start: "",
    end: "",
  });
  // const [fileAS, setFileAS] = React.useState("");
  const [fileCL, setFileCL] = React.useState("");
  const [previewCL, setPreviewCL] = React.useState(""); // test
  // const [previewAS, setPreviewAS] = React.useState("");
  const [publicID, setPublicID] = React.useState("");
  const [changed, setChanged] = React.useState(false); // if file selected
  const [loading, setLoading] = React.useState(false);

  const [participants, setParticipants] = React.useState([]);

  // api/v1/events/{indexEdit} to set PATCH or POST if not exist
  const [indexEdit, setIndexEdit] = React.useState(null);
  // Modal opened/closed
  const [show, setShow] = React.useState(false);
  console.log("render table");
  const handleShow = () => {
    setShow(true);
  };

  const handleClose = () => {
    setShow(false);
    setItinary({ date: "", start: "", end: "" });
    setParticipants([]);
    // setPreviewAS("");
    setPreviewCL("");
    setPublicID("");
    // setFileAS("");
    setIndexEdit("");
    setChanged(false);
  };

  function bePatient(bool) {
    if (bool) {
      return (
        <Spinner animation="border" role="status">
          <span className="sr-only">Waiting for data...</span>
        </Spinner>
      );
    } else {
      return null;
    }
  }

  function update() {
    (async function fetchData() {
      try {
        const responseEvents = await fetch(eventsEndPoint);
        const responseUsers = await fetch(usersEndPoint);
        const dataEvents = await responseEvents.json();
        const dataUsers = await responseUsers.json();
        if (dataEvents && dataUsers) {
          setEvents(dataEvents);
          setUsers(dataUsers);
        }
      } catch (err) {
        throw new Error(err);
      } finally {
        //setLoading(false);
        bePatient(false);
      }
    })();
  }

  // upload db
  React.useEffect(() => {
    //setLoading(true);
    bePatient(true);
    update();
    // (async function fetchData() {
    //   try {
    //     const responseEvents = await fetch(eventsEndPoint);
    //     const responseUsers = await fetch(usersEndPoint);
    //     const dataEvents = await responseEvents.json();
    //     const dataUsers = await responseUsers.json();
    //     if (dataEvents && dataUsers) {
    //       setEvents(dataEvents);
    //       setUsers(dataUsers);
    //     }
    //   } catch (err) {
    //     throw new Error(err);
    //   } finally {
    //     //setLoading(false);
    //     bePatient(false);
    //   }
    // })(); //.catch(() => console.log);
    //fetchData().catch((err) => console.log(err));
  }, []);

  // remove row from table
  const handleRemove = async (e, event) => {
    e.preventDefault();
    if (window.confirm("Confirm removal?")) {
      try {
        const query = await fetchWithToken(eventsEndPoint + event.id, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }); // then new updated rows

        console.log(query.status);
        if (query.status !== 200) {
          return returnUnauthorized();
        }
        if (query.status === 200) {
          const response = await query.json();
          if (response.status === 401) {
            return returnUnauthorized();
          }
          setEvents((prev) => [...prev].filter((ev) => ev.id !== event.id));
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

    // adding boolean  field for notified? to participant
    // let members = [];
    // if (participants) {
    //   members = participants.map((participant) => {
    //     // if (!participant.hasOwnProperty("email")) {
    //     return { email: participant, ptoken: null, notif: true };
    //     // } else {
    //     //   return participant;
    //     // }
    //   });
    // }
    console.log(participants);
    // first promise to append non async data to the FormData
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
      // if (fileAS) {
      //   fd.append("event[photo]", fileAS);
      // }
      return Promise.resolve(fd);
    }

    // second promise that Post photo to CL and receives link back and append FormData
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
    // chaining of promises
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
            status: 201,
          })
            .then((result) => {
              if (result) {
                setEvents(result);
              }
            })
            .catch((err) => console.log(err));
        } else if (indexEdit) {
          // index <=> PATCH to 'events/:id'
          fetchAll({
            method: "PATCH",
            index: indexEdit,
            body: data,
            status: 200,
          })
            .then((result) => {
              if (result) {
                setEvents(result);
              }
            })
            .catch((err) => console.log(err));
        }
      });
    handleClose(); // reset
  }

  // Edit event
  async function handleEdit(event) {
    setIndexEdit(event.id); // get /api/v1/events/ID
    const data = events.find((ev) => ev.id === event.id);
    setItinary({
      date: new Date(data.itinary.date).toISOString().slice(0, 10),
      start: data.itinary.start,
      end: data.itinary.end,
    });
    setParticipants(data.participants || []);

    // if (event.url) {
    //   setPreviewAS(event.url);
    // }
    // if (event.directCLUrl) {
    //   setPreviewCL(event.directCLUrl);
    // }
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

  // get photoAS
  // async function handlePhotoAS(e) {
  //   if (e.target.files[0]) {
  //     setPreviewAS(URL.createObjectURL(e.target.files[0]));
  //     setFileAS(e.target.files[0]);
  //   }
  // }

  async function handlePictureCL(e) {
    if (e.target.files[0]) {
      setPreviewCL(URL.createObjectURL(e.target.files[0]));
      setChanged(true);
      setFileCL(e.target.files[0]);
    }
  }

  // update state & db on notification checkbox per event per participant
  function handleNotif(e, event) {
    event.participants[e.target.name].notif = e.target.checked;
    // find & replace
    const items = [...events];
    const idx = items.findIndex((item) => item.id === event.id);
    items[idx] = event;
    setEvents(items);

    const formdata = new FormData();
    for (const key in event.itinary) {
      formdata.append(`event[itinary_attributes][${key}]`, event.itinary[key]);
    }
    event.participants.forEach((member) => {
      for (const key in member) {
        formdata.append(`event[participants][][${key}]`, member[key]);
      }
    });
    fetchAll({ method: "PATCH", index: event.id, body: formdata });
  }

  // send mail to ask to join an event
  async function handlePush(event) {
    const jwt = localStorage.getItem("jwt");
    const getCurrentUser = await fetch(uri + "/api/v1/profile", {
      headers: { authorization: "Bearer " + jwt },
    });

    const currentUser = await getCurrentUser.json();
    const demand = JSON.stringify({
      user: currentUser,
      owner: event.user.email,
      event: event,
    });
    const queryPushDemand = await fetchWithToken(uri + "/api/v1/pushDemand", {
      method: "POST",
      body: demand,
    });
    const response = await queryPushDemand.json();
    console.log(response, response.status);
    if (response.status === 200) {
      window.alert("Mail sent");

      handleClose();
    } else {
      window.alert("Please login to access");
    }
  }

  return (
    <>
      {!events || !users ? (
        <Container>
          <Row className="justify-content-md-center">
            <Spinner animation="border" role="status" />
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
                <FontAwesomeIcon icon={faCheck} /> <span> Create an event</span>
              </Button>

              <AddEventModal show={show} onhandleClose={handleClose}>
                <AddEventForm
                  users={users}
                  participants={participants}
                  date={itinary.date}
                  start={itinary.start}
                  end={itinary.end}
                  // previewAS={previewAS}
                  previewCL={previewCL}
                  publicID={publicID}
                  loading={loading}
                  onFormSubmit={handleFormSubmit}
                  onhandleItinaryChange={handleItinaryChange}
                  onSelectChange={handleSelectChange}
                  // onhandlePhotoAS={handlePhotoAS}
                  onhandlePictureCL={handlePictureCL}
                />
              </AddEventModal>
            </Row>
          </Container>

          <br />

          <Container>
            {events &&
              events.map((event) => {
                return (
                  <CardItem
                    key={event.id}
                    event={event}
                    onhandleRemove={(e) => handleRemove(e, event)}
                    onhandleEdit={() => handleEdit(event)}
                    onhandleNotif={(e) => handleNotif(e, event)}
                    onhandlePush={() => handlePush(event)}
                  />
                );
              })}
          </Container>

          {/* <br />
          <Table bordered size="md" striped responsive="sm">
            <thead>
              <tr>
                <th>Event Owner</th>
                <th>Date</th>
                <th>Starting</th>
                <th>Notify</th>
                <th colSpan={2}></th>
              </tr>
            </thead>
            <tbody>
              {!events
                ? null
                : events.map((event) => (
                    <TableRow
                      key={event.id}
                      event={event}
                      //notify={notify}
                      onhandleRemove={(e) => handleRemove(e, event)}
                      onhandleEdit={() => handleEdit(event)}
                      onhandleNotif={(e) => handleNotif(e, event)}
                      onhandlePush={() => handlePush(event)}
                    />
                  ))}
            </tbody>
          </Table> */}
        </>
      )}
    </>
  );
};

export default DataTable;
