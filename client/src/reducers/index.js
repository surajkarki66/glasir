import { combineReducers } from "redux";
import signUp from "./signUp";
import signIn from "./signIn";
import checkProfile from "./checkProfile";

export default combineReducers({
  signUpForm: signUp,
  signInState: signIn,
  checkProfileState: checkProfile,
});
