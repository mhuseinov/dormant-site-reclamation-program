import React, { Component } from "react";
import { reduxForm, FieldArray, getFormValues } from "redux-form";
import { connect } from "react-redux";
import { compose } from "redux";
import { Row, Col, Typography, Form, Divider, Button, Collapse, Descriptions, Icon } from "antd";
import { Field, FormSection } from "redux-form";
import { sum, flatten, union, merge } from "lodash";
import { renderConfig } from "@/components/common/config";
import { required, dateNotInFuture, maxLength } from "@/utils/validate";
import * as FORM from "@/constants/forms";
import { currencyMask, formatMoney } from "@/utils/helpers";

import PermitHolderSelect from "@/components/forms/PermitHolderSelect";

const { Text, Paragraph, Title } = Typography;
const { Panel } = Collapse;

const defaultProps = {};

const createMemberName = (member, name) => `${member}.${name}`;

const wellSiteConditions = [
  "Within 1000 m of a stream (defined in WSA and includes all water bodies)",
  "Within 500 m of a groundwater drinking well",
  "Sensitive habitat",
  "Suspected or known to have offsite contamination",
  "Within 1500 m of a school or residence",
  "On Traditional Lands Entitlement, cultural lands and/or First Nations critical area",
  "On Agricultural Land Reserve",
  "On range tenure, trapping licence, guide outfitting, and/or hunting area",
  "Winter only access",
  "On Private land",
  "Drilled or abandoned prior to 1997",
];

const renderMoneyTotal = (label, amount) => (
  <Paragraph style={{ float: "right" }}>
    <Text className="color-primary" strong>
      {label}:&nbsp;
    </Text>
    <Text>{formatMoney(amount)}</Text>
  </Paragraph>
);

class ApplicationSectionTwo extends Component {
  state = {
    contractedWorkTotals: { grandTotal: 0, wellTotals: {} },
  };

  componentWillReceiveProps = (nextProps) => {
    if (nextProps.formValues !== this.props.formValues) {
      this.calculateContractWorkTotals(nextProps.formValues);
    }
  };

  componentWillMount = () => {
    this.calculateContractWorkTotals(this.props.formValues);
  };

  calculateContractWorkTotals = (formValues) => {
    if (!formValues || !formValues.well_sites) {
      return;
    }

    let grandTotal = 0;
    let wellTotals = {};
    formValues.well_sites.map((wellSite, wellIndex) => {
      if (!wellSite.contracted_work) {
        return;
      }

      const sectionNames = Object.keys(wellSite.contracted_work);
      const sectionValues = Object.values(wellSite.contracted_work);

      let wellTotal = 0;
      wellTotals[wellIndex] = { sections: {} };
      sectionValues.map((section, sectionIndex) => {
        const sectionTotal = sum(Object.values(section).filter((value) => !isNaN(value)));
        wellTotals[wellIndex].sections[sectionNames[sectionIndex]] = sectionTotal;
        wellTotal += sectionTotal;
      });
      wellTotals[wellIndex].wellTotal = wellTotal;

      grandTotal += wellTotal;
    });

    const contractedWorkTotals = { grandTotal: grandTotal, wellTotals: wellTotals };
    this.setState({ contractedWorkTotals });
  };

  renderWells = ({ fields }) => (
    <>
      <Title level={2}>Well Sites</Title>
      <Row gutter={[48, 48]}>
        <Col span={24}>
          <Collapse bordered={false} accordion>
            {fields.map((member, index) => {
              const wellTotals = this.state.contractedWorkTotals.wellTotals[index];
              const wellSectionTotals = wellTotals ? wellTotals.sections : {};
              const wellTotal = wellTotals ? wellTotals.wellTotal : 0;
              return (
                <Panel
                  key={index}
                  header={
                    <Title level={4}>
                      {/* NOTE: Could update name with the well's name when it is retrieved. */}
                      Well Site #{index + 1}
                      <Button style={{ float: "right" }} onClick={() => fields.remove(index)}>
                        <Icon />
                        Remove
                      </Button>
                    </Title>
                  }
                >
                  <FormSection name={createMemberName(member, "details")}>
                    <Title level={4}>Details</Title>
                    <Row gutter={48}>
                      <Col span={24}>
                        <Field
                          name="well_authorization_number"
                          label="Well Authorization Number"
                          placeholder="Well Authorization Number"
                          component={renderConfig.FIELD}
                          validate={[required]}
                        />
                        <Descriptions column={1} title="Well Site Details">
                          <Descriptions.Item label="Name">N/A</Descriptions.Item>
                          <Descriptions.Item label="Operator">N/A</Descriptions.Item>
                          <Descriptions.Item label="Location">N/A</Descriptions.Item>
                        </Descriptions>
                      </Col>
                    </Row>
                  </FormSection>

                  <FormSection name={createMemberName(member, "site_conditions")}>
                    <Title level={4}>Site Conditions</Title>
                    <Paragraph>Reasons for site nomination (select all that apply):</Paragraph>
                    <Row gutter={48}>
                      <Col span={24}>
                        {wellSiteConditions.map((condition, index) => (
                          <Field
                            name={`site_condition_${index}`}
                            label={condition}
                            component={renderConfig.CHECKBOX}
                          />
                        ))}
                      </Col>
                    </Row>
                  </FormSection>

                  <FormSection name={createMemberName(member, "contracted_work")}>
                    <Title level={4}>Contracted Work</Title>
                    <Paragraph>
                      Enter the estimated cost of every work component your company will perform for
                      this contract.
                    </Paragraph>
                    <Row gutter={48}>
                      <Col span={24}>
                        <Collapse bordered={false}>
                          <Panel header="Abandonment">
                            <FormSection name="abandonment">
                              <Field
                                name="amount_0"
                                label="amount_0"
                                placeholder="amount_0"
                                component={renderConfig.FIELD}
                                {...currencyMask}
                              />
                              <Field
                                name="amount_1"
                                label="amount_1"
                                placeholder="amount_1"
                                component={renderConfig.FIELD}
                                {...currencyMask}
                              />
                              {renderMoneyTotal("Section total", wellSectionTotals.abandonment)}
                            </FormSection>
                          </Panel>
                          <Panel header="Preliminary Site Investigation">
                            <FormSection name="preliminary_site_investigation">
                              <Field
                                name="amount_0"
                                label="amount_0"
                                placeholder="amount_0"
                                component={renderConfig.FIELD}
                                {...currencyMask}
                              />
                              <Field
                                name="amount_1"
                                label="amount_1"
                                placeholder="amount_1"
                                component={renderConfig.FIELD}
                                {...currencyMask}
                              />
                              {renderMoneyTotal(
                                "Section total",
                                wellSectionTotals.preliminary_site_investigation
                              )}
                            </FormSection>
                          </Panel>
                          <Panel header="Detailed Site Investigation">
                            <FormSection name="detailed_site_investigation">
                              <Field
                                name="amount_0"
                                label="amount_0"
                                placeholder="amount_0"
                                component={renderConfig.FIELD}
                                {...currencyMask}
                              />
                              <Field
                                name="amount_1"
                                label="amount_1"
                                placeholder="amount_1"
                                component={renderConfig.FIELD}
                                {...currencyMask}
                              />
                              {renderMoneyTotal(
                                "Section total",
                                wellSectionTotals.detailed_site_investigation
                              )}
                            </FormSection>
                          </Panel>
                          <Panel header="Remediation">
                            <FormSection name="remediation">
                              <Field
                                name="amount_0"
                                label="amount_0"
                                placeholder="amount_0"
                                component={renderConfig.FIELD}
                                {...currencyMask}
                              />
                              <Field
                                name="amount_1"
                                label="amount_1"
                                placeholder="amount_1"
                                component={renderConfig.FIELD}
                                {...currencyMask}
                              />
                              {renderMoneyTotal("Section total", wellSectionTotals.remediation)}
                            </FormSection>
                          </Panel>
                          <Panel header="Reclamation">
                            <FormSection name="reclamation">
                              <Field
                                name="amount_0"
                                label="amount_0"
                                placeholder="amount_0"
                                component={renderConfig.FIELD}
                                {...currencyMask}
                              />
                              <Field
                                name="amount_1"
                                label="amount_1"
                                placeholder="amount_1"
                                component={renderConfig.FIELD}
                                {...currencyMask}
                              />
                              {renderMoneyTotal("Section total", wellSectionTotals.reclamation)}
                            </FormSection>
                          </Panel>
                        </Collapse>
                        {renderMoneyTotal("Well total", wellTotal)}
                      </Col>
                    </Row>
                  </FormSection>
                </Panel>
              );
            })}
          </Collapse>
          {fields.length > 0 &&
            renderMoneyTotal("Grand total", this.state.contractedWorkTotals.grandTotal)}
        </Col>
      </Row>
      <Button type="primary" onClick={() => fields.push({})}>
        Add Well Site
      </Button>
    </>
  );

  render() {
    return (
      <Form layout="vertical" onSubmit={this.props.handleSubmit}>
        <FormSection name="contract_details">
          <Title level={2}>Contract Information</Title>
          <Row gutter={48}>
            <Col span={24}>
              <Field
                id="organization_id"
                name="organization_id"
                label="Permit Holder"
                placeholder="Search for permit holder for whom this work will be performed"
                component={PermitHolderSelect}
                // validate={[required]}
              />
            </Col>
          </Row>
        </FormSection>

        <FieldArray name="well_sites" component={this.renderWells} />

        <Row className="steps-action">
          <Col>
            <Button type="primary" htmlType="submit">
              Next
            </Button>
            <Button style={{ margin: "0 8px" }} onClick={this.props.previousStep}>
              Previous
            </Button>
          </Col>
        </Row>
      </Form>
    );
  }
}

ApplicationSectionTwo.defaultProps = defaultProps;

export default compose(
  connect((state) => ({
    formValues: getFormValues(FORM.APPLICATION_FORM)(state),
  })),
  reduxForm({
    form: FORM.APPLICATION_FORM,
    destroyOnUnmount: false,
    forceUnregisterOnUnmount: true,
  })
)(ApplicationSectionTwo);
