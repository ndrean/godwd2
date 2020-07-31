export default function returnUnauthorized() {
  alert("You can't modify other's events");
  throw new Error("not authorized");
}
