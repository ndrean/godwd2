// import fetchWithToken from "./fetchWithToken";
import { eventsEndPoint } from "./endpoints";
import returnUnauthorized from "./returnUnauthorized";
import fetchWithToken from "./fetchWithToken";

async function fetchAll({ method, index, status, body }) {
  try {
    const query = await fetchWithToken(eventsEndPoint + index, {
      method: method,
      index: index,
      body: body,
    });
    const response = await query.json();
    if (response.status === status) {
      const all = await fetch(eventsEndPoint);
      return await all.json();
    } else {
      returnUnauthorized();
    }
  } catch (err) {
    console.log(err);
  }
}

export default fetchAll;
