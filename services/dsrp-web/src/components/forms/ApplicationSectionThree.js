import React, { Component } from "react";
import { reduxForm, Field, FormSection } from "redux-form";
import { compose } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Row, Col, Form, Button, Typography } from "antd";
import ApplicationFormReset from "@/components/forms/ApplicationFormReset";
import { renderConfig } from "@/components/common/config";
import { required } from "@/utils/validate";
import * as FORM from "@/constants/forms";

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  previousStep: PropTypes.func.isRequired,
  initialValues: PropTypes.objectOf(PropTypes.any).isRequired,
  isViewingSubmission: PropTypes.bool.isRequired,
  isEditable: PropTypes.bool,
};

const defaultProps = {
  isEditable: true,
};

const { Title } = Typography;

class ApplicationSectionThree extends Component {
  handleReset = () => {
    this.props.initialize();
    this.props.handleReset();
  };

  componentWillUnmount() {
    if (this.props.isViewingSubmission) {
      this.props.reset();
    }
  }

  render() {
    return (
      <Form layout="vertical" onSubmit={this.props.handleSubmit} onReset={this.handleReset}>
        <FormSection name="review">
          <Title level={3}>Submit Application</Title>
          <Row gutter={48}>
            <Col span={24}>
              <Field
                id="reviewed_and_verified"
                name="reviewed_and_verified"
                label="I have reviewed and verified that this application's information is correct."
                component={renderConfig.CHECKBOX}
                validate={[required]}
                disabled={!this.props.isEditable}
              />
            </Col>
          </Row>
        </FormSection>

        {this.props.isEditable && (
          <Row className="steps-action">
            <Col>
              <Button onClick={this.props.previousStep}>Previous</Button>
              <Button
                type="primary"
                htmlType="submit"
                disabled={this.props.submitting || this.props.invalid || this.props.submitSucceeded}
                style={{ marginLeft: 8, marginRight: 8 }}
              >
                Submit
              </Button>
              <ApplicationFormReset onConfirm={this.handleReset} />
            </Col>
          </Row>
        )}
      </Form>
    );
  }
}

const mapStateToProps = () => ({});

const mapDispatchToProps = () => ({});

ApplicationSectionThree.propTypes = propTypes;
ApplicationSectionThree.defaultProps = defaultProps;

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  reduxForm({
    form: FORM.APPLICATION_FORM,
    destroyOnUnmount: false,
    forceUnregisterOnUnmount: true,
    keepDirtyOnReinitialize: true,
    enableReinitialize: true,
    updateUnregisteredFields: true,
  })
)(ApplicationSectionThree);
