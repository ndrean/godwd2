import React from "react";

import CardItem from "./CardItem";

const CardGrid = (props) => {
  const { events, ...rest } = props;
  return (
    <>
      {events &&
        events.map((event) => {
          return <CardItem key={event.id} event={event} rest={rest} />;
        })}
    </>
  );
};

export default CardGrid;
