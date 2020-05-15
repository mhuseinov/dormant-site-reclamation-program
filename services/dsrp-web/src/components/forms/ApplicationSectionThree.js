import React, { Component } from "react";
import { reduxForm, Field, FormSection } from "redux-form";
import PropTypes from "prop-types";
import { Row, Col, Form, Button } from "antd";

import { renderConfig } from "@/components/common/config";
import { required } from "@/utils/validate";
import * as FORM from "@/constants/forms";

const propTypes = {
  previousStep: PropTypes.func,
  onSubmit: PropTypes.func,
  isEditable: PropTypes.bool,
  initialValues: PropTypes.objectOf(PropTypes.strings),
};

const defaultProps = {
  previousStep: () => {},
  onSubmit: () => {},
  isEditable: true,
  initialValues: {},
};

class ApplicationSectionThree extends Component {
  render() {
    return (
      <Form layout="vertical" onSubmit={this.props.handleSubmit}>
        <FormSection name="review">
          <Field
            id="reviewed_and_verified"
            name="reviewed_and_verified"
            label="I have reviewed and verified that this application's information is correct."
            component={renderConfig.CHECKBOX}
            validate={[required]}
            disabled={!this.props.isEditable}
          />
        </FormSection>
        {this.props.isEditable && (
          <Row className="steps-action">
            <Col>
              <Button
                type="primary"
                htmlType="submit"
                disabled={this.props.submitting || this.props.pristine}
              >
                Submit
              </Button>
              <Button style={{ margin: "0 8px" }} onClick={this.props.previousStep}>
                Previous
              </Button>
            </Col>
          </Row>
        )}
      </Form>
    );
  }
}

ApplicationSectionThree.propTypes = propTypes;
ApplicationSectionThree.defaultProps = defaultProps;

export default reduxForm({
  form: FORM.APPLICATION_FORM,
  destroyOnUnmount: false,
  forceUnregisterOnUnmount: true,
  keepDirtyOnReinitialize: true,
  enableReinitialize: true,
  updateUnregisteredFields: true,
})(ApplicationSectionThree);
