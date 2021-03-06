import React from "react";
import PropTypes from "prop-types";
import moment from "moment";
import { Form, DatePicker } from "antd";

/**
 * @constant RenderDate  - Ant Design `DatePicker` component for redux-form.
 */

const propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  input: PropTypes.objectOf(PropTypes.any).isRequired,
  meta: PropTypes.objectOf(PropTypes.any).isRequired,
  label: PropTypes.string,
  placeholder: PropTypes.string,
  error: PropTypes.string,
  defaultPickerValue: PropTypes.any,
  disabled: PropTypes.bool,
  showTime: PropTypes.bool,
};

const defaultProps = {
  label: "",
  placeholder: "",
  error: "",
  defaultPickerValue: moment(),
  disabled: false,
  showTime: false,
};

const RenderDate = (props) => (
  <Form.Item
    label={props.label}
    validateStatus={
      props.meta.touched || props.meta.submitFailed
        ? ((props.meta.error || props.error) && "error") || (props.meta.warning && "warning")
        : ""
    }
    help={
      (props.meta.touched || props.meta.submitFailed) &&
      ((props.meta.error && <span>{props.meta.error}</span>) ||
        (props.error && <span>{props.error}</span>) ||
        (props.meta.warning && <span>{props.meta.warning}</span>))
    }
  >
    <DatePicker
      disabled={props.disabled}
      id={props.id}
      {...props.input}
      placeholder={props.placeholder}
      disabledDate={props.disabledDate}
      defaultPickerValue={props.defaultPickerValue}
      onChange={(date, dateString) => props.input.onChange(dateString || null)}
      value={props.input.value ? moment(props.input.value) : null}
      showTime={props.showTime && { format: "HH:mm" }}
      format={props.showTime && "YYYY-MM-DD HH:mm"}
      style={{ width: "100%" }}
    />
  </Form.Item>
);

RenderDate.propTypes = propTypes;
RenderDate.defaultProps = defaultProps;

export default RenderDate;
