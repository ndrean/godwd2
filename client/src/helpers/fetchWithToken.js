const fetchWithToken = (url, options) => {
  options.headers = {
    ...options.headers,
    "Content-Type": "application/json",
    Authorization: localStorage.getItem("jwt"),
  };
  return fetch(url, options);
};

export default fetchWithToken;
