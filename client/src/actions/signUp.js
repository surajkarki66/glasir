import Axios from "../axios-url";

import {
  SIGNING_UP,
  SIGNUP_RESULT,
  SIGNUP_STATUS,
  SIGNUP_USER_CREDENTIALS,
  SIGNUP_USER_TYPE,
} from "./types";

export const updateSignUpForm = (type, value) => (dispatch) => {
  switch (type) {
    case SIGNUP_USER_TYPE:
      dispatch({
        type: SIGNUP_USER_TYPE,
        payload: value,
      });
      break;
    case SIGNUP_USER_CREDENTIALS:
      dispatch({
        type: SIGNUP_USER_CREDENTIALS,
        payload: value,
      });
      break;
    default:
      console.log("Error in sign up form");
      break;
  }
};

export const updateSignUpStatus = (type, value) => (dispatch) => {
  switch (type) {
    case SIGNUP_STATUS:
      dispatch({
        type: SIGNUP_STATUS,
        payload: value,
      });
      break;
    default:
      console.log("Nothing");
      break;
  }
};

export const signUp = (credentials) => (dispatch) => {
  const url = "/api/v1/user/signup";
  dispatch({
    type: SIGNUP_STATUS,
    payload: "Signing up... Please wait...",
  });

  dispatch({
    type: SIGNING_UP,
    payload: true,
  });

  Axios.post(url, {
    username: credentials.username,
    email: credentials.email,
    password: credentials.password,
    role: credentials.role,
  })
    .then((res) => {
      dispatch({
        type: SIGNUP_STATUS,
        payload: res.data.data.message,
      });
      dispatch({
        type: SIGNUP_RESULT,
        payload: true,
      });
    })
    .catch((err) => {
      dispatch({ type: SIGNUP_STATUS, payload: err.response.data.data.error });
      dispatch({
        type: SIGNUP_RESULT,
        payload: false,
      });
    });
};
