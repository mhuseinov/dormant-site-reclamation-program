import axios from "axios";
import { notification } from "antd";
import { request, success, error } from "@/actions/genericActions";
import * as reducerTypes from "@/constants/reducerTypes";
import * as API from "@/constants/api";
import { ENVIRONMENT } from "@/constants/environment";
import { createRequestHeader } from "../utils/requestHeaders";
import * as authorizationActions from "@/actions/authorizationActions";
import * as router from "@/constants/routes";

export const createOTL = (application_guid) => (dispatch) => {
  localStorage.removeItem("app_guid");
  localStorage.removeItem("otp");
  localStorage.removeItem("timeout_seconds");
  localStorage.removeItem("issue_time_utc");
  dispatch(request(reducerTypes.GET_OTL));
  return axios
    .post(ENVIRONMENT.apiUrl + API.AUTHORIZE_OTP, { application_guid }, createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_OTL));
      notification.success({
        message: "A One-Time Link has been sent to your email",
        duration: 10,
      });
      return response;
    })
    .catch((err) => {
      const message = err.response.data.message ?? "Unexpected error occurred, please try again";
      notification.error({
        message,
        duration: 10,
      });

      dispatch(error(reducerTypes.GET_OTL));
      throw new Error(err);
    });
};

export const exchangeOTLForOTP = (otl_guid) => (dispatch) => {
  dispatch(request(reducerTypes.GET_OTP));
  return axios
    .put(ENVIRONMENT.apiUrl + API.AUTHORIZE_OTP, { otl_guid }, createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_OTP));
      localStorage.setItem("otp", response.data.OTP);
      localStorage.setItem("app_guid", response.data.application_guid);
      localStorage.setItem("issued_time_utc", response.data.issued_time_utc);
      localStorage.setItem("timeout_seconds", response.data.timeout_seconds);
      dispatch(
        authorizationActions.initUserAuthorizationTimer({
          issuedTimeUtc: response.data.issued_time_utc,
          timeOutSeconds: response.data.timeout_seconds,
        })
      );
      return response.data;
    })
    .catch((err) => {
      const message = err.response.data.message ?? "Unexpected error occurred, please try again";
      notification.error({
        message,
        duration: 10,
      });
      dispatch(error(reducerTypes.GET_OTP));
      throw new Error(err);
    });
};

export const endUserTemporarySession = (history) => (dispatch) => {
  dispatch(authorizationActions.endUserTemporarySession());
  localStorage.removeItem("app_guid");
  localStorage.removeItem("issued_time_utc");
  localStorage.removeItem("otp");
  localStorage.removeItem("timeout_seconds");

  if (history) {
    history.push(router.REQUEST_ACCESS.dynamicRoute());
  }
};

export const initAuthorizationTimer = () => (dispatch) => {
  const issuedTimeUtc = localStorage.getItem("issued_time_utc");
  const timeOutSeconds = localStorage.getItem("timeout_seconds");
  if (issuedTimeUtc && timeOutSeconds)
    dispatch(
      authorizationActions.initUserAuthorizationTimer({
        issuedTimeUtc,
        timeOutSeconds,
      })
    );
};
