import { SIGNIN, SIGNING_IN, SIGNIN_ERROR, SIGNIN_REDIRECT, SIGNIN_STATUS } from '../actions/types';

const initialState = {
  signingIn: false,
  signInSuccessfulRedirect: false,
  signInError: false,
};

// eslint-disable-next-line
export default function (state = initialState, action) {
  switch (action.type) {
    case SIGNIN:
      return {
        ...state,
        token: action.payload,
      };
    case SIGNIN_STATUS:
      return {
        ...state,
        signInStatus: action.payload,
      }
    case SIGNING_IN:
      return {
        ...state,
        signingIn: action.payload
      }
    case SIGNIN_REDIRECT:
      return {
        ...state,
        signInSuccessfulRedirect: action.payload,
      }
    case SIGNIN_ERROR:
      return {
        ...state,
        signInError: action.payload
      }
    default:
      return state;
  }
};