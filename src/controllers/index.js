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
  uploadAvatar,
  getUserDetails,
} from "./user/user.controller";

import { makeProfile, me } from "./freelancer/freelancer.controller";

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
  uploadAvatar,
};

export const FreelancerController = { makeProfile, uploadAvatar, me };
