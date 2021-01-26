import React from "react";
import PropTypes from "prop-types";
import { Form, Select } from "antd";
import { caseInsensitiveLabelFilter } from "@/utils/helpers";
import CustomPropTypes from "@/customPropTypes";

/**
 * @constant RenderSelect - Ant Design `Select` component for redux-form - used for small data sets that (< 100);
 */
const propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  input: PropTypes.objectOf(PropTypes.any).isRequired,
  placeholder: PropTypes.string,
  label: PropTypes.string,
  mode: PropTypes.string,
  meta: CustomPropTypes.formMeta,
  data: CustomPropTypes.options,
  filterOption: PropTypes.oneOfType([PropTypes.func, PropTypes.bool]),
  disabled: PropTypes.bool,
  onSearch: PropTypes.func,
};

const defaultProps = {
  placeholder: "",
  label: "",
  mode: "multiple",
  data: [],
  disabled: false,
  meta: {},
  onSearch: () => {},
  filterOption: false,
};

export const RenderMultiSelect = (props) => (
  <div>
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
      <Select
        disabled={!props.data || props.disabled}
        mode={props.mode}
        getPopupContainer={() => document.getElementById(props.id)}
        placeholder={props.placeholder}
        id={props.id}
        onSearch={props.onSearch}
        {...props.input}
        filterOption={props.filterOption || caseInsensitiveLabelFilter}
        showArrow
      >
        {props.data &&
          props.data.map(({ value, label, tooltip }) => (
            <Select.Option key={value} title={tooltip}>
              {label}
            </Select.Option>
          ))}
      </Select>
    </Form.Item>
  </div>
);

RenderMultiSelect.propTypes = propTypes;
RenderMultiSelect.defaultProps = defaultProps;

export default RenderMultiSelect;
