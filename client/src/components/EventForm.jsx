import React from "react";

import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Image from "react-bootstrap/Image";

import { Image as CLImage, CloudinaryContext } from "cloudinary-react";
import Select from "react-select";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import cloudName from "../config/cloudName";

const EventForm = (props) => {
  const {
    users,
    participants,
    date,
    start,
    end,
    comment,
    loading,
    previewCL,
    publicID,
    onFormSubmit,
    onhandleItinaryChange,
    onhandleCommentChange,
    onSelectChange,
    onhandlePictureCL,
  } = props;

  // console.log("render Form");
  // setup SELECT
  const options = [],
    defaultOpt = [];
  users.forEach((u) => options.push({ value: u.email, label: u.email }));
  if (participants) {
    participants.forEach((p) =>
      defaultOpt.push({ value: p.email, label: p.email })
    );
  }

  return (
    <>
      <Form onSubmit={onFormSubmit} id="eventForm">
        <Form.Group controlId="ControlDate">
          <Form.Label>Date event</Form.Label>
          <Form.Control
            type="date"
            value={date || ""}
            name="date"
            required
            onChange={onhandleItinaryChange}
            isInvalid={!date}
          />
        </Form.Group>

        <Form.Group controlId="ControlStart">
          <Form.Label>Start place</Form.Label>
          <Form.Control
            type="text"
            value={start || ""}
            required
            name="start"
            onChange={onhandleItinaryChange}
            isInvalid={!start}
          />
        </Form.Group>

        <Form.Group controlId="ControlEnd">
          <Form.Label>End place</Form.Label>
          <Form.Control
            type="text"
            value={end || ""}
            required
            name="end"
            onChange={onhandleItinaryChange}
            isInvalid={!end}
          />
        </Form.Group>
        <Form.Group controlId="ControlKiters">
          <Form.Label>Participants</Form.Label>
          <Select
            defaultValue={defaultOpt}
            isMulti
            name="participants"
            options={options}
            className="basic-multi-select"
            classNamePrefix="select"
            onChange={onSelectChange}
          />
        </Form.Group>

        <Form.Group>
          <Form.Label>
            <span>Join a ... </span>
            <FontAwesomeIcon icon="camera" size="2x" />
            <Form.File
              type="file"
              name="pic"
              hidden
              onChange={onhandlePictureCL}
              accept="image/*"
            />
          </Form.Label>
        </Form.Group>

        <Form.Group controlId="ControlComment">
          <Form.Label>Comments</Form.Label>
          <Form.Control
            as="textarea"
            rows="2"
            type="text"
            name="comment"
            value={comment || ""}
            onChange={onhandleCommentChange}
          />
        </Form.Group>

        <Row style={{ justifyContent: "center" }}>
          <Button
            variant="outline-primary"
            type="submit"
            style={{ fontSize: "24px" }}
            //disabled={loading}
          >
            <FontAwesomeIcon icon="paper-plane" /> Submit
          </Button>
        </Row>
      </Form>

      <br />

      <Row className="justify-content-md-center">
        <Col xs={8} md="auto">
          {/* {publicID && (
            <CloudinaryContext cloudName={cloudName}>
              <div>
                <CLImage
                  publicId={publicID}
                  width="100"
                  crop="scale"
                  loading="lazy"
                />
              </div>
            </CloudinaryContext>
          )} */}
          {previewCL && (
            <Image
              src={previewCL}
              alt={"CL"}
              // style={{ width: "250" }}
              fluid
              width="100"
              loading="lazy"
            />
          )}
        </Col>
      </Row>
    </>
  );
};

export default React.memo(EventForm);
