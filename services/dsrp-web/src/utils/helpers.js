/* eslint-disable */
import moment from "moment";
import { reset } from "redux-form";
import { createNumberMask, createTextMask } from "redux-form-input-masks";
import { notification } from "antd";
import { isObjectLike, forEach, isArray, isPlainObject } from "lodash";

/**
 * Helper function to clear redux form after submission
 *
 * Usage:
 *  export default (reduxForm({
    form: formName,
    onSubmitSuccess: resetForm(formName),
  })(Component)
  );
 *
 */
export const resetForm = (form) => (result, dispatch) => dispatch(reset(form));

// Function to create a reusable reducer (used in src/reducers/rootReducer)
export const createReducer = (reducer, name) => (state, action) => {
  if (name !== action.name && state !== undefined) {
    return state;
  }
  return reducer(state, action);
};
// Function to create state object using the id as the key (used in src/reducers/<customReducer>)
export const createItemMap = (array, idField) => {
  const mapping = {};
  // NOTE: Implementation chosen for performance
  // Please do not refactor to use immutable data
  array.forEach((item) => {
    mapping[item[idField]] = item;
  });
  return mapping;
};

// Function create id array for redux state. (used in src/reducers/<customReducer>)
export const createItemIdsArray = (array, idField) => array.map((item) => item[idField]);

export const createDropDownList = (array, labelField, valueField) =>
  array.map((item) => ({ value: item[valueField], label: item[labelField] }));

export const createDropDownListWithDescriptions = (
  array,
  labelField,
  valueField,
  descriptionValue
) =>
  array.map((item) => ({
    value: item[valueField],
    label: item[labelField],
    description: item[descriptionValue],
  }));

export const createFilterList = (array, labelField, valueField) =>
  array.map((item) => ({ value: item[valueField], text: item[labelField] }));

// Function to create a hash given an array of values and labels
export const createLabelHash = (arr) =>
  arr.reduce((map, { value, label }) => ({ [value]: label, ...map }), {});

// Function to format an API date string to human readable
export const formatDate = (dateString) =>
  dateString && dateString !== "None" && moment(dateString, "YYYY-MM-DD").format("MMM DD YYYY");

export const formatTime = (timeStamp) => timeStamp && moment(timeStamp).format("h:mm a");

export const formatDateTime = (dateTime) => dateTime && moment(dateTime).format("lll");

export const formatDateTimeFine = (dateTime) => dateTime && moment(dateTime).format("ll h:mm:ss a");

export const formatPostalCode = (code) => code && code.replace(/.{3}$/, " $&");

export const formatTitleString = (input) =>
  input.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());

export const currencyMask = createNumberMask({
  prefix: "$",
  suffix: "",
  decimalPlaces: 2,
  locale: "en-CA",
  allowEmpty: true,
  stringValue: false,
});

export const metersMask = createNumberMask({
  prefix: "",
  suffix: " metres",
  decimalPlaces: 0,
  allowEmpty: true,
  stringValue: false,
  allowNegative: false,
});

export const phoneMask = createTextMask({
  pattern: "(999) 999-9999",
  // placeholder: '_',
  // maskDefinitions: defaultMaskDefinitions,
  guide: false,
  // stripMask: true,
  allowEmpty: true,
  // onChange: value => {},
  // onCompletePattern: value => {},
});

export const postalCodeMask = createTextMask({
  pattern: "XXX XXX",
  // placeholder: '_',
  maskDefinitions: {
    X: {
      regExp: /[A-Za-z0-9]/,
      transform: (char) => char.toUpperCase(),
    },
  },
  guide: false,
  // stripMask: true,
  allowEmpty: true,
  // onChange: value => {},
  // onCompletePattern: value => {},
});

export const guidMask = createTextMask({
  pattern: "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX",
  // placeholder: '_',
  maskDefinitions: {
    X: {
      regExp: /[A-Fa-f0-9]/,
      transform: (char) => char.toLowerCase(),
    },
  },
  guide: false,
  stripMask: false,
  allowEmpty: true,
  // onChange: value => {},
  // onCompletePattern: value => {},
});

export const wellAuthorizationNumberMask = createTextMask({
  pattern: "99999",
  guide: false,
  stripMask: true,
  allowEmpty: true,
});

export const businessNumberMask = createTextMask({
  pattern: "999999999",
  guide: false,
  stripMask: true,
  allowEmpty: true,
});

export const dateSorter = (key) => (a, b) => {
  if (a[key] === b[key]) {
    return 0;
  }
  if (!a[key]) {
    return 1;
  }
  if (!b[key]) {
    return -1;
  }
  return moment(a[key]) - moment(b[key]);
};

export const nullableStringOrNumberSorter = (key) => (a, b) => {
  if (a[key] === b[key]) {
    return 0;
  }
  if (!a[key]) {
    return 1;
  }
  if (!b[key]) {
    return -1;
  }
  return isNaN(a[key]) && isNaN(b[key])
    ? (a[key] || "").localeCompare(b[key] || "")
    : a[key] - b[key];
};

export const contractedWorkIdSorter = (a, b) =>
  Number(a.work_id.split(".")[1]) > Number(b.work_id.split(".")[1]) ? 1 : -1;

// Case insensitive filter for a SELECT field by label string
export const caseInsensitiveLabelFilter = (input, option) =>
  option.props.children.toLowerCase().includes(input.toLowerCase());

// function taken directly from redux-forms (https://redux-form.com/6.0.0-rc.1/examples/normalizing)
// automatically adds dashes to phone number
export const normalizePhone = (value, previousValue) => {
  if (!value) {
    return value;
  }
  const onlyNums = value.replace(/[^\d]/g, "");
  if (!previousValue || value.length > previousValue.length) {
    // typing forward
    if (onlyNums.length === 3) {
      return `${onlyNums}-`;
    }
    if (onlyNums.length === 6) {
      return `${onlyNums.slice(0, 3)}-${onlyNums.slice(3)}-`;
    }
  }
  if (onlyNums.length <= 3) {
    return onlyNums;
  }
  if (onlyNums.length <= 6) {
    return `${onlyNums.slice(0, 3)}-${onlyNums.slice(3)}`;
  }
  return `${onlyNums.slice(0, 3)}-${onlyNums.slice(3, 6)}-${onlyNums.slice(6, 10)}`;
};

export const upperCase = (value) => value && value.toUpperCase();

export const truncateFilename = (filename, max = 40) => {
  if (filename.length <= max) {
    return filename;
  }

  // String to use to represent that a string has been truncated
  const trunc = "[...]";

  // Extract the parts (name and extension) of the filename
  const parts = /(^.+)\.([^.]+)$/.exec(filename);

  // If the filename has no extension (e.g., the filename is "foo", not "foo.txt")
  if (!parts) {
    return `${filename.substring(0, max)}${trunc}`;
  }

  // Get the name of the filename (e.g., "foo.txt" will give "foo")
  const name = parts[1].length > max ? `${parts[1].substring(0, max)}${trunc}` : parts[1];

  // Get the extension of the filename (e.g., "foo.txt" will give "txt")
  // Extensions can be very long too, so limit their length as well
  const extMax = 5;
  const ext = parts[2].length > extMax ? `${parts[2].substring(0, extMax)}${trunc}` : parts[2];

  // Return the formatted shortened version of the filename
  return `${name}.${ext}`;
};

export const getFiscalYear = () => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const fiscalYear = new Date(currentYear, 3, 1);
  if (today > fiscalYear) {
    return currentYear;
  }
  return currentYear - 1;
};

export const formatParamStringToArray = (param) => (param ? param.split(",").filter((x) => x) : []);

// Used for parsing/stringifying list query params.
// method :: String enum[split, join]
// listFields :: Array of Strings matching the list query params. ex. ['mine_region']
// fields :: Object created by queryString.parse()
export const formatQueryListParams = (method, listFields) => (fields) => {
  const params = Object.assign({}, fields);
  listFields.forEach((listField) => {
    params[listField] = fields[listField] ? fields[listField][method](",") : undefined;
  });
  return params;
};

// Adapt our { label, value } options arrays to work with AntDesign column filter
export const optionsFilterLabelAndValue = (options) =>
  options.map(({ label, value }) => ({ text: label, value }));

// Adapt our { label, value } options arrays to work with AntDesign column filter (value is label)
export const optionsFilterLabelOnly = (options) =>
  options.map(({ label }) => ({ text: label, value: label }));

// This method sorts codes of the for '#.#.# - Lorem Ipsum'
// where the number of integers is variable and the text is optional
export const compareCodes = (a, b) => {
  // Null codes are sorted before non-null codes
  if (!a) {
    return 1;
  }
  if (!b) {
    return -1;
  }
  // Returns the first match that is non-null.
  const regexParse = (input) =>
    input.match(/([0-9]+)\.([0-9]+)\.([0-9]+)\.\(([0-9]+)/) ||
    input.match(/([0-9]+)\.([0-9]+)\.([0-9]+)/) ||
    input.match(/([0-9]+)\.([0-9]+)/) ||
    input.match(/([0-9]+)/);
  const aCodes = regexParse(a.toString());
  const bCodes = regexParse(b.toString());
  if (!aCodes) {
    return -1;
  }
  if (!bCodes) {
    return 1;
  }
  const k = Math.min(aCodes.length, bCodes.length);
  // Compares the non-null parts of two strings of potentially different lengths (e.g 1.11 and 1.4.12)
  for (let i = 1; i < k; i += 1) {
    const aInt = Number(aCodes[i]);
    const bInt = Number(bCodes[i]);
    if (aInt > bInt) {
      return 1;
    }
    if (aInt < bInt) {
      return -1;
    }
  }
  // This line is only reached if all non-null code sections match (e.g 1.11 and 1.11.4)
  // if both codes have the same length then they must be the same code.
  if (aCodes.length === bCodes.length) {
    return 0;
  }
  // The shorter of two codes with otherwise matching numbers is sorted before the longer one.
  // since null is sorted before non-null (e.g 1.11 is before 1.11.12)
  return aCodes.length < bCodes.length ? -1 : 1;
};

export const formatComplianceCodeValueOrLabel = (code, showDescription) => {
  const { section, sub_section, paragraph, sub_paragraph, description } = code;
  const formattedSubSection = sub_section ? `.${sub_section}` : "";
  const formattedParagraph = paragraph ? `.${paragraph}` : "";
  const formattedSubParagraph = sub_paragraph !== null ? `.${sub_paragraph}` : "";
  const formattedDescription = showDescription ? ` - ${description}` : "";

  return `${section}${formattedSubSection}${formattedParagraph}${formattedSubParagraph}${formattedDescription}`;
};

// function to flatten an object for nested items in redux form
// eslint-disable-snippets
export const flattenObject = (ob) => {
  const toReturn = {};
  let flatObject;
  for (const i in ob) {
    if (typeof ob[i] === "object") {
      flatObject = flattenObject(ob[i]);
      for (const x in flatObject) {
        if (!flatObject.hasOwnProperty(x)) {
          continue;
        }
        toReturn[i + (isNaN(x) ? `.${x}` : "")] = flatObject[x];
      }
    } else {
      toReturn[i] = ob[i];
    }
  }
  return toReturn;
};

export const formatMoney = (value) => {
  let number = isNaN(value) ? (isNaN(Number(value)) ? null : Number(value)) : value;
  number = number !== null ? (Number(number).toFixed(2) === "-0.00" ? 0 : number) : null;
  return number !== null
    ? Number(number).toLocaleString("en-US", { style: "currency", currency: "USD" })
    : null;
};

export const getPathsToLeaves = (obj = {}) => {
  const result = [];

  const flatten = (collection, prefix = "", suffix = "") => {
    forEach(collection, (value, key) => {
      const path = `${prefix}${key}${suffix}`;

      if (isArray(value)) {
        flatten(value, `${path}[`, "]");
      } else if (isPlainObject(value)) {
        flatten(value, `${path}.`);
      } else {
        result.push(path);
      }
    });
  };

  flatten(obj);

  return result;
};

export const getPathElements = (paths) => {
  const elements = {};
  paths.map((path) => {
    const query = `[id="${path}"], [name="${path}"]`;
    const element = document.querySelector(query);
    if (element) {
      elements[path] = element;
    }
  });
  return elements;
};

export const getFirstPathElement = (pathsElements) => {
  const paths = Object.keys(pathsElements);
  const nodeBefore = (a, b) => b.compareDocumentPosition(a) === Node.DOCUMENT_POSITION_PRECEDING;
  paths.sort((a, b) => {
    if (pathsElements[a] === null || nodeBefore(pathsElements[b], pathsElements[a])) {
      return b;
    }
    return a;
  });

  return { path: paths[0], element: pathsElements[paths[0]] };
};

export const scrollToFirstError = (errors, fallbackElement = null) => {
  if (!isObjectLike(errors)) {
    return false;
  }

  notification.warning({
    message: "Application contains errors. Please correct any issues and try again.",
    duration: 10,
  });

  const errorPaths = getPathsToLeaves(errors);
  const errorElements = getPathElements(errorPaths);
  let firstErrorElement = getFirstPathElement(errorElements).element;
  firstErrorElement = firstErrorElement ? firstErrorElement : fallbackElement;

  if (!firstErrorElement) {
    return false;
  }

  firstErrorElement.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
  return true;
};

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const createUuidv4 = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const isGuid = (input) => {
  if (input[0] === "{") {
    input = input.substring(1, input.length - 1);
  }
  const regexGuid = /^(\{){0,1}[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}(\}){0,1}$/gi;
  return regexGuid.test(input);
};

export const isUserTemporarySessionStarted = () =>
  localStorage.getItem("app_guid") &&
  localStorage.getItem("issued_time_utc") &&
  localStorage.getItem("otp") &&
  localStorage.getItem("timeout_seconds");
