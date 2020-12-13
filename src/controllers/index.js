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
} from "./user";

import {
  makeProfile,
  uploadDocument,
  getFreelancers,
  searchFreelancer,
  getFreelancerDetails,
  me,
  changeFreelancerDetails,
  addEmployment,
  updateEmployment,
} from "./freelancer";

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

export const FreelancerController = {
  makeProfile,
  uploadDocument,
  getFreelancers,
  searchFreelancer,
  getFreelancerDetails,
  me,
  changeFreelancerDetails,
  addEmployment,
  updateEmployment,
};
