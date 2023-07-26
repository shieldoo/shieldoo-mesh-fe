import { createSelector, createSlice } from "@reduxjs/toolkit";
import { encode as base64_encode} from 'base-64';

import { AppState, AppThunk } from ".";
import { api, MeQuery, ConfigItem } from "../api/generated";

type User = MeQuery["me"];

interface AuthState {
  userProfile: User | null;
  uiConfig: ConfigItem | null;
}

const initialState: AuthState = {
  userProfile: null,
  uiConfig: null,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loggedOut: (state) => {
      state.userProfile = null;
    },
    setUiConfig: (state, action) => {
      state.uiConfig = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(api.endpoints.Me.matchFulfilled, (state, action) => {
      state.userProfile = action.payload.me;
    });
  },
});

const selectSelf = (state: AppState) => state.auth;

export const { loggedOut, setUiConfig } = authSlice.actions;

const loginHostName = () => {
  const domainParts = window.location.hostname.split(".");
  domainParts[0] = "login";
  return domainParts.join(".");
};

export const logIn = (): AppThunk => async () => {
  const redirect = base64_encode(`${window.location.origin}${window.location.pathname || "/"}`);

  let addConfig = "";
  // call async rest api to get config
  try{
    let resp  = await fetch("/api/config")   
    // returned json in this format {"aad_enabled":true,"aad_tenant_id":"0000"}
    let config = await resp.json();  
    if(config.aad_enabled){
      addConfig = `&aad_tenant_id=${config.aad_tenant_id}`
    }
  }catch(e){
    console.log(e);
  }

  let audience = window.location.hostname.substring(0, window.location.hostname.indexOf("."));
  if (window.location.hostname === "localhost") {
    audience = "localhost";
    window.location.href = `http://localhost:9001?redirect=${redirect}&audience=${audience}` + addConfig;
  } else {
    window.location.href = `https://${loginHostName()}?redirect=${redirect}&audience=${audience}` + addConfig;
  }
};

export const logOut = (): AppThunk => (dispatch) => {
  window.localStorage.removeItem("token");
  dispatch(loggedOut());
};

const isLoggedIn = createSelector(selectSelf, (state) => !!state.userProfile);

const selectUserProfile = createSelector(selectSelf, (state) => state.userProfile);

const isAdministrator = createSelector(selectUserProfile, (profile) => (profile ? profile.roles.includes("ADMINISTRATOR") : false));

const selectUiConfig = createSelector(selectSelf, (state) => state.uiConfig);

export const selectors = {
  isAdministrator,
  isLoggedIn,
  selectUserProfile,
  selectUiConfig,
};

export default authSlice.reducer;


