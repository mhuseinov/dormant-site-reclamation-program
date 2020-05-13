import * as actionTypes from "../constants/actionTypes";
import { OGC } from "../constants/reducerTypes";

const initialState = {
  permitHolders: [],
  wells: [],
  liabilities: [],
};

export const OGCReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.STORE_PERMIT_HOLDERS:
      return {
        ...state,
        permitHolders: action.payload.records,
      };
    case actionTypes.STORE_WELLS:
      return {
        ...state,
        wells: action.payload.records,
      };
    case actionTypes.STORE_LIABILITIES:
      return {
        ...state,
        wells: action.payload.records,
      };
    default:
      return state;
  }
};

const OGCReducerObject = {
  [OGC]: OGCReducer,
};

export const getPermitHolders = (state) => state[OGC].permitHolders;
export const getWells = (state) => state[OGC].wells;
export const getLiabilities = (state) => state[OGC].liabilities;

export default OGCReducerObject;