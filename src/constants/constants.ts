/* eslint-disable no-useless-escape */
// used in useResponsive hook
export const MAX_MOBILE_WIDTH = 768;
export const AUTH_TOKEN_EXPIRY_DURATION_DAYS = 29;

// related to cookies
export const COOKIE_NAMES = {
  TOKEN: 'token',
  PROTECTED_ROUTE_TO_VISIT_AFTER_LOGIN: 'protected-route',
};

// REGEX Patterns
// password must contain atleast 8 chars with 1 char uppercase letter
// firstName or lastName should include a letter, no emojis and no numbers anywhere in the firstName, length of the firstName should be between 1 to 50
// same for lastName
export const PATTERN_REGEX = {
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]{8,64}$/,
  firstName:
    /^(?=(?:[^\p{Emoji}\p{Emoji_Presentation}\p{Emoji_Modifier_Base}\p{Emoji_Modifier}\p{Emoji_Component}])*\p{L})[^\d\p{Emoji}\p{Emoji_Presentation}\p{Emoji_Modifier_Base}\p{Emoji_Modifier}\p{Emoji_Component}]{1,50}$/u,
  lastName:
    /^(?=(?:[^\p{Emoji}\p{Emoji_Presentation}\p{Emoji_Modifier_Base}\p{Emoji_Modifier}\p{Emoji_Component}])*\p{L})[^\d\p{Emoji}\p{Emoji_Presentation}\p{Emoji_Modifier_Base}\p{Emoji_Modifier}\p{Emoji_Component}]{1,50}$/u,
};

export const DASH_API = '/dashapi/v1';
