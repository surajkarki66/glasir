import Axios from "../axios-url";
import {
  SIGNIN_STATUS,
  SIGNIN,
  SIGNING_IN,
  SIGNIN_REDIRECT,
  SIGNIN_ERROR,
} from "./types";

export const signIn = (email, password) => (dispatch) => {
  const url = "/api/v1/user/login";

  dispatch({
    type: SIGNING_IN,
    payload: true,
  });

  dispatch({
    type: SIGNIN_STATUS,
    payload: "Signing in... Please wait...",
  });

  Axios.post(url, {
    email: email,
    password: password,
  })
    .then((res) => {
      dispatch({
        type: SIGNIN_STATUS,
        payload: res.data.data.message,
      });
      dispatch({
        type: SIGNIN,
        payload: res.data.data.token,
      });
      dispatch({
        type: SIGNING_IN,
        payload: false,
      });
      dispatch({
        type: SIGNIN_REDIRECT,
        payload: true,
      });
    })
    .catch((err) => {
      dispatch({
        type: SIGNING_IN,
        payload: false,
      });
      dispatch({
        type: SIGNIN_STATUS,
        payload: err.response.data.data.error,
      });
      dispatch({
        type: SIGNIN_ERROR,
        payload: true,
      });
    });
};
