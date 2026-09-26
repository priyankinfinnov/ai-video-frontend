import { AUTH_TOKEN_EXPIRY_DURATION_DAYS } from '@/constants/constants';
import { InputStateType } from '@/types/auth';

// cookie related utils

export const getDateOfXDaysLater = (expDays: number) => {
  const todayDate = new Date();
  todayDate.setTime(todayDate.getTime() + expDays * 24 * 60 * 60 * 1000);
  return todayDate;
};

export const setCookie = ({
  cookieName,
  cookieValue,
}: {
  cookieName: string;
  cookieValue: string;
}) => {
  // as expiry is 29 days
  const expiryDate = getDateOfXDaysLater(AUTH_TOKEN_EXPIRY_DURATION_DAYS);
  document.cookie = `${cookieName}=${cookieValue}; expires=${expiryDate.toUTCString()}; path=/;`;
};

// split as per "; ", find by cookieName, split and get the cookie Value.
export const getCookieValue = (cookieName: string) => {
  const cookieValue = document.cookie
    .split('; ')
    .find((cookie) => cookie.startsWith(cookieName))
    ?.split('=')[1];

  return cookieValue ?? null;
};

// find the value using the cookieName, delete the cookie using max-age=0
export const removeCookie = (cookieName: string) => {
  const cookieToBeRemovedString = `${cookieName}=${getCookieValue(cookieName)}`;

  document.cookie = `${cookieToBeRemovedString}; max-age=0`;
};

export const getTrimmedInput = (inputObj: InputStateType) => {
  const trimmed = {} as InputStateType;

  for (const key in inputObj) {
    const inputValue = inputObj[key as keyof InputStateType];
    if (typeof inputValue !== 'string') {
      continue;
    }

    let trimmedKey = inputValue.trim();

    if (key === 'email') {
      trimmedKey = trimmedKey.toLowerCase();
    }

    trimmed[key as keyof InputStateType] = trimmedKey;
  }

  return trimmed;
};

export const isAnyPropertyOfObjEmpty = <ObjType extends Record<string, string>>(
  obj: ObjType
) => Object.values(obj).some((value) => !value);

type ComposableFunction<T> = (arg: T) => T;

export const composition =
  <T>(...funcs: ComposableFunction<T>[]) =>
  (initialValue: T) =>
    funcs.reduce(
      (acc: T, curr: ComposableFunction<T>) => curr(acc),
      initialValue
    );

export const removeSpecialChars = (text: string) =>
  text.replace(/[^a-zA-Z0-9\s_]/g, '');

export const replaceSpaceWithUnderScores = (text: string) =>
  text.replace(/ /g, '_');

const camelCaseToSentenceCase = (camelCaseString: string) => {
  // Use regular expressions to split the string at capital letters and digits
  const words = camelCaseString.split(
    /(?=[A-Z])|(?<=[0-9])(?=[A-Z])|(?<=[A-Z])(?=[0-9])/
  );

  // Capitalize the first letter of each word and convert the rest to lowercase
  const sentence = words
    .map(
      (word) => `${word.charAt(0).toUpperCase()}${word.slice(1).toLowerCase()}`
    )
    .join(' ');

  return sentence;
};

// compare object properties
type GenericObject = { [key: string]: any };

const isObject = <T>(object: T) =>
  object !== null && typeof object === 'object';

// we dont compare the objects, we just compare the properties of both objects.

// obj1 -> {x: 1, y: 2, z: {a: 10, b: 11, c: 12}}, obj2 -> {x: 1, z:{a: 10, b: 11}}
//output: true

export const compareObjectProperties = (
  object1: GenericObject,
  object2: GenericObject
) => {
  if (Array.isArray(object1) && Array.isArray(object2)) {
    const keys1 = Object.keys(object1);
    const keys2 = Object.keys(object2);

    if (keys1.length !== keys2.length) return false;
  }

  for (const key in object1) {
    const value1 = object1[key];
    const value2 = object2[key];

    const isBothObject =
      isObject<typeof value1>(value1) && isObject<typeof value2>(value2);

    if (!(key in object1) || !(key in object2)) {
      continue;
    }

    // they are not objects, it means they are primitives and if both are not equal then return false
    if (!isBothObject && value1 !== value2) return false;

    // if they are objects, and compare their values
    if (isBothObject && !compareObjectProperties(value1, value2)) return false;
  }

  return true;
};

export const deepCloneTrimmed = (object) => {
  if (typeof object !== 'object') {
    let primitive = object;
    if (typeof object === 'string') {
      primitive = primitive.trim();
    }
    return primitive;
  }

  if (Array.isArray(object)) {
    return object.map((item) => deepCloneTrimmed(item));
  }

  let copy = {};
  for (const key in object) {
    copy = {
      ...copy,
      [key]: deepCloneTrimmed(object[key]),
    };
  }

  return copy;
};

type TypeIsAnyNestedPropertyOfObjectEmpty = (object: any) => string | boolean;
export const isAnyNestedPropertyOfObjectEmpty: TypeIsAnyNestedPropertyOfObjectEmpty =
  (object) => {
    for (const key in object) {
      const value = object[key];

      if (typeof value === 'string' && !value)
        return camelCaseToSentenceCase(key);

      if (isObject(value) && isAnyNestedPropertyOfObjectEmpty(value))
        return isAnyNestedPropertyOfObjectEmpty(value);
    }

    return false;
  };

export const removeIdAndGiveRest = ({ _id, ...rest }) => rest;

export const getCreatedDate = (dateStr: string) => {
  const pastDate = new Date(dateStr);
  const timeDifference = new Date().getTime() - pastDate.getTime();
  if (timeDifference < 86400000) {
    // 86400000 milliseconds = 1 day
    const hoursDifference = Math.floor(timeDifference / (1000 * 60 * 60));
    const minutesDifference = Math.floor((timeDifference / (1000 * 60)) % 60);

    if (hoursDifference === 0) {
      return `${minutesDifference}m ago`;
    } else {
      return `${hoursDifference}h ago`;
    }
  } else {
    const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

    return `${daysDifference}d ago`;
  }
};
