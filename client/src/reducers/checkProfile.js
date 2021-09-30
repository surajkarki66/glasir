import {
  CHECK_PROFILE,
  CHECK_PROFILE_STATUS,
  CHECKING_PROFILE,
  CHECK_PROFILE_REDIRECT,
  CHECK_PROFILE_ERROR,
} from "../actions/types";

const initialState = {
  checkingProfile: false,
  checkProfileSuccessfulRedirect: false,
  checkProfileError: false,
};

// eslint-disable-next-line
export default function (state = initialState, action) {
  switch (action.type) {
    case CHECK_PROFILE:
      return {
        ...state,
        data: action.payload,
      };
    case CHECK_PROFILE_STATUS:
      return {
        ...state,
        checkProfileStatus: action.payload,
      };
    case CHECKING_PROFILE:
      return {
        ...state,
        checkingProfile: action.payload,
      };
    case CHECK_PROFILE_REDIRECT:
      return {
        ...state,
        checkProfileSuccessfulRedirect: action.payload,
      };
    case CHECK_PROFILE_ERROR:
      return {
        ...state,
        checkProfileError: action.payload,
      };
    default:
      return state;
  }
}
