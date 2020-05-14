/* eslint-disable */
import React, { Component } from "react";
import { Col, Row, Steps } from "antd";
import PropTypes from "prop-types";
import ApplicationSectionOne from "@/components/forms/ApplicationSectionOne";
import ApplicationSectionTwo from "@/components/forms/ApplicationSectionTwo";
import ApplicationSectionThree from "@/components/forms/ApplicationSectionThree";

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  onFileLoad: PropTypes.func.isRequired,
  onRemoveFile: PropTypes.func.isRequired,
};

const { Step } = Steps;

export class ApplicationForm extends Component {
  state = { current: 0 };

  steps = [
    {
      title: "Company Details",
      content: (
        <ApplicationSectionOne
          onSubmit={this.nextFormStep}
          onFileLoad={this.props.onFileLoad}
          onRemoveFile={this.props.onRemoveFile}
        />
      ),
    },
    {
      title: "Well Sites",
      content: (
        <ApplicationSectionTwo previousStep={this.previousFormStep} onSubmit={this.nextFormStep} />
      ),
    },
    {
      title: "Review",
      content: (
        <ApplicationSectionThree
          previousStep={this.previousFormStep}
          onSubmit={this.props.handleSubmit}
        />
      ),
    },
  ];

  nextFormStep = () => {
    const current = this.state.current + 1;
    this.setState({ current });
  };

  previousFormStep = () => {
    const current = this.state.current - 1;
    this.setState({ current });
  };

  render() {
    return (
      <Row>
        <Col>
          <Steps current={this.state.current}>
            {this.steps.map((item) => (
              <Step key={item.title} title={item.title} />
            ))}
          </Steps>
          <Row className="steps-content">
            <Col>{this.steps[this.state.current].content}</Col>
          </Row>
        </Col>
      </Row>
    );
  }
}

ApplicationForm.propTypes = propTypes;

export default ApplicationForm;
