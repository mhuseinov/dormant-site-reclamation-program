import * as authenticationReducer from "@/reducers/authenticationReducer";

export const {
  isAuthenticated,
  getUserInfo,
  getRedirect,
  getIsAdmin,
  getUserRoles,
  getIsViewOnly,
} = authenticationReducer;
