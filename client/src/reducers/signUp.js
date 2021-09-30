import { SIGNUP_USER_TYPE, SIGNUP_USER_CREDENTIALS, SIGNUP_STATUS, SIGNING_UP, SIGNUP_RESULT } from "../actions/types";

const initalState = {
  signingUp: false,
  signUpStatus: 'Dummy message',
  signUpSuccessful: false,
};

// eslint-disable-next-line
export default function (state = initalState, action) {
  switch (action.type) {
    case SIGNUP_USER_TYPE:
      return {
        ...state,
        userType: action.payload,
      };
    case SIGNUP_USER_CREDENTIALS:
      return {
        ...state,
        username: action.payload.username,
        email: action.payload.email,
        password: action.payload.password,
      }
    case SIGNUP_STATUS:
      return {
        ...state,
        signUpStatus: action.payload
      }
    case SIGNING_UP:
      return {
        ...state,
        signingUp: action.payload
      }
    case SIGNUP_RESULT:
      return {
        ...state,
        signUpSuccessful: action.payload
      }
    default:
      return state;
  }
}
