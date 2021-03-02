import {} from "./user.controller";

import {} from "./freelancer.controller";

import { me } from "./common.controller";

import {} from "./client.controller";

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
  createFreelancerProfile,
  uploadFreelancerAvatar,
  uploadDocument,
  getFreelancers,
  searchFreelancer,
  getFreelancerDetails,
  changeFreelancerDetails,
  addEmployment,
  updateEmployment,
  verifyFreelancerPhoneNumber,
  confirmFreelancerPhoneNumber,
};

export const CommonController = { me };

export const ClientController = {
  createClientProfile,
  getClients,
  getClientDetails,
  changeClientDetails,
  uploadClientAvatar,
  verifyClientPhoneNumber,
  confirmClientPhoneNumber,
};
