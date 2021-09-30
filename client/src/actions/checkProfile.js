import Axios from "../axios-url";
import jwt_decode from "jwt-decode";
import {
  CHECK_PROFILE,
  CHECK_PROFILE_STATUS,
  CHECKING_PROFILE,
  CHECK_PROFILE_REDIRECT,
  CHECK_PROFILE_ERROR,
} from "./types";

export const checkProfile = (token) => (dispatch) => {
  const url = "/api/v1/common/me";
  const { aud } = jwt_decode(token);

  dispatch({
    type: CHECKING_PROFILE,
    payload: true,
  });

  dispatch({
    type: CHECK_PROFILE_STATUS,
    payload: "Fetching... Please wait...",
  });
  Axios.post(
    url,
    {
      userId: aud,
    },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  )
    .then((res) => {
      dispatch({
        type: CHECK_PROFILE_STATUS,
        payload: res.data.status,
      });
      dispatch({
        type: CHECK_PROFILE,
        payload: res.data,
      });
      dispatch({
        type: CHECKING_PROFILE,
        payload: false,
      });
      dispatch({
        type: CHECK_PROFILE_REDIRECT,
        payload: true,
      });
    })
    .catch((err) => {
      dispatch({
        type: CHECKING_PROFILE,
        payload: false,
      });
      dispatch({
        type: CHECK_PROFILE_STATUS,
        payload: err.response.data.data.error,
      });
      dispatch({
        type: CHECK_PROFILE_ERROR,
        payload: true,
      });
    });
};
