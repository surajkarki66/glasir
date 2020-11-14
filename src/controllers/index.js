import {
  getUsers,
  login,
  refreshToken,
  signup,
  activation,
  logout,
  forgotPassword,
  resetPassword,
  changePassword,
  changeUserDetails,
  changeEmail,
  verifyEmail,
  deleteUser,
  getUserDetails,
} from "./user/user.controller";

import { makeProfile } from "./freelancer/freelancer.controller";

export const UserController = {
  getUsers,
  login,
  refreshToken,
  signup,
  activation,
  logout,
  forgotPassword,
  resetPassword,
  changePassword,
  changeUserDetails,
  changeEmail,
  verifyEmail,
  deleteUser,
  getUserDetails,
};

export const FreelancerController = { makeProfile };
