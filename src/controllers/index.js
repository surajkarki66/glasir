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
} from "./user";

import {
  createFreelancer,
  uploadAvatar,
  uploadDocument,
  getFreelancers,
  searchFreelancer,
  getFreelancerDetails,
  changeFreelancerDetails,
  addEmployment,
  updateEmployment,
  verifyPhoneNumber,
  confirmPhoneNumber,
} from "./freelancer";

import { me } from "./common";

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

export const FreelancerController = {
  createFreelancer,
  uploadAvatar,
  uploadDocument,
  getFreelancers,
  searchFreelancer,
  getFreelancerDetails,
  changeFreelancerDetails,
  addEmployment,
  updateEmployment,
  verifyPhoneNumber,
  confirmPhoneNumber,
};

export const CommonController = { me };
