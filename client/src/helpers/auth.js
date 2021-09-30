import Axios from "../axios-url";

export const signOut = async (next) => {
  localStorage.removeItem("service");
  await Axios.get("/api/v1/user/logout");
  next();
};
