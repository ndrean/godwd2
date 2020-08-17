// import fetchWithToken from "./fetchWithToken";
//import { eventsEndPoint } from "./endpoints";
import returnUnauthorized from "./returnUnauthorized";

async function fetchAll({ method, index, body, token }) {
  try {
    const query = await fetch("api/v1/events/" + index, {
      method: method,
      headers: {
        Authorization: "Bearer " + token, //localStorage.getItem("jwt"),
      },
      index: index,
      body: body,
    });
    if (query.ok) {
      // return all after PATCH
      const response = await query.json();
      if (response.status === 401) {
        return returnUnauthorized();
      }
      const all = await fetch("api/v1/events");
      return await all.json();
    } else {
      returnUnauthorized();
    }
  } catch (err) {
    console.log(err);
    // throw new Error(err);
  }
}

export default fetchAll;
