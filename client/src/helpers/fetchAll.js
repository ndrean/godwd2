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
    if (query.ok) {
      // return all after PATCH
      const response = await query.json();
      if (response.status === 401) {
        return returnUnauthorized();
      }
      const all = await fetch(eventsEndPoint);
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
