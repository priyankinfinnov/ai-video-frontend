import { PayloadAction, createSlice } from '@reduxjs/toolkit';

// internal imports
import { COOKIE_NAMES } from '@/constants/constants';
import { getCookieValue, removeCookie, setCookie } from '@/utils/utils';
import UserType from '@/types/userType';

type authInitialStateType = {
  token: string | null;
  userInfo: null | UserType;
};

const initialState: authInitialStateType = {
  token: getCookieValue(COOKIE_NAMES.TOKEN),
  userInfo: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    addUserCredentials: (
      state,
      { payload: payloadToken }: PayloadAction<string>
    ) => {
      state.token = payloadToken;
      setCookie({ cookieName: COOKIE_NAMES.TOKEN, cookieValue: payloadToken });
    },

    updateUserInfo: (state, { payload }: PayloadAction<UserType>) => {
      state.userInfo = payload;
    },

    removeUserCredentials: (state) => {
      state.token = null;
      state.userInfo = null;
      removeCookie(COOKIE_NAMES.TOKEN);
    },
  },
});

// Action creators are generated for each case reducer function
export const { addUserCredentials, updateUserInfo, removeUserCredentials } =
  authSlice.actions;

export default authSlice.reducer;
