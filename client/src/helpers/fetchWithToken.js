const fetchWithToken = (url, options) => {
  options.headers = {
    ...options.headers,
    Authorization: localStorage.getItem("jwt"),
  };
  return fetch(url, options);
};

export default fetchWithToken;
