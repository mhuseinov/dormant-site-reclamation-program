import React, { Component } from "react";
import { Field } from "redux-form";
import { Row, Col, Form, Button, Typography, Popconfirm, Alert, Tooltip, Icon } from "antd";
import { capitalize, isEmpty } from "lodash";
import PropTypes from "prop-types";
import { renderConfig } from "@/components/common/config";
import {
  required,
  requiredBoolean,
  number,
  notZero,
  requiredList,
  date,
  dateNotInFuture,
  minLength,
  maxLength,
} from "@/utils/validate";
import { currencyMask, formatTitleString, metersMask, formatMoney } from "@/utils/helpers";
import { PDF } from "@/constants/fileTypes";
import { EOC_TEMPLATE, FINAL_REPORT_TEMPLATE } from "@/constants/assets";
import { DATE_FORMAT, HELP_EMAIL } from "@/constants/strings";
import { downloadDocument } from "@/utils/actionlessNetworkCalls";
import LinkButton from "@/components/common/LinkButton";
import CustomPropTypes from "@/customPropTypes";
import { toolTip } from "@/components/admin/ApplicationTable";
import { PAYMENT_TYPES } from "@/constants/payments";
import * as Payment from "@/utils/paymentHelper";

const { Title, Text, Paragraph } = Typography;

const propTypes = {
  contractedWorkPayment: PropTypes.objectOf(PropTypes.any).isRequired,
  applicationSummary: CustomPropTypes.applicationSummary.isRequired,
  initialValues: PropTypes.objectOf(PropTypes.any).isRequired,
  handleSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  submitting: PropTypes.bool.isRequired,
  isAdminView: PropTypes.bool.isRequired,
  paymentType: PropTypes.oneOf([PAYMENT_TYPES.INTERIM, PAYMENT_TYPES.FINAL]),
};

const defaultProps = {
  paymentType: PAYMENT_TYPES.INTERIM,
};

const docSubmittedDropdownOptions = [
  { value: "NONE", label: "No" },
  {
    value: "COR_P1",
    label: "Yes - Certificate of Registration Pt 1",
  },
  {
    value: "DSAF",
    label: "Yes - Dormancy Site Assessment Form",
  },
];
const booleanDropdownOptions = [
  { value: "true", label: "Yes" },
  { value: "false", label: "No" },
];

const booleanFormat = (value) =>
  value === true || value === false || value === "true" || value === "false"
    ? value.toString()
    : undefined;

const renderReportingFields = (workType, isViewOnly) => {
  const workTypeName =
    workType === "preliminary_site_investigation" || workType === "detailed_site_investigation"
      ? "Site Investigation"
      : capitalize(workType);

  const validateMetresPipelineAbandoned = (value, allValues) => {
    if (
      value &&
      (!allValues.abandonment_was_pipeline_abandoned ||
        allValues.abandonment_was_pipeline_abandoned === "false")
    ) {
      return "You cannot provide this field if pipeline was not abandoned";
    }
    return undefined;
  };

  return (
    <Row className="final-report-fields">
      <Col>
        <Field
          id="surface_landowner"
          name="surface_landowner"
          label="Surface Landowner"
          placeholder="Select an option"
          disabled={isViewOnly}
          component={renderConfig.SELECT}
          validate={[required]}
          format={null}
          data={[
            { value: "Crown", label: "Crown" },
            { value: "Freehold", label: "Freehold" },
            { value: "Both", label: "Both" },
          ]}
        />

        {workType === "abandonment" && (
          <>
            <Field
              id="abandonment_downhole_completed"
              name="abandonment_downhole_completed"
              label="Was downhole abandonment completed (plugging of completion zones and/or remedial cementing)?"
              placeholder="Select an option"
              disabled={isViewOnly}
              component={renderConfig.SELECT}
              validate={[requiredBoolean]}
              format={booleanFormat}
              data={booleanDropdownOptions}
            />
            <Field
              id="abandonment_cut_and_capped_completed"
              name="abandonment_cut_and_capped_completed"
              label="Was Well Abandonment completed to Cut and Capped?"
              placeholder="Select an option"
              disabled={isViewOnly}
              component={renderConfig.SELECT}
              validate={[requiredBoolean]}
              format={booleanFormat}
              data={booleanDropdownOptions}
            />
            <Field
              id="abandonment_equipment_decommissioning_completed"
              name="abandonment_equipment_decommissioning_completed"
              label="Was equipment decommissioned (dismantling and removal of surface processing, storage, and/or transmission infrastructure)?"
              placeholder="Select an option"
              disabled={isViewOnly}
              component={renderConfig.SELECT}
              validate={[requiredBoolean]}
              format={booleanFormat}
              data={booleanDropdownOptions}
            />
            <Field
              id="abandonment_notice_of_operations_submitted"
              name="abandonment_notice_of_operations_submitted"
              label="Notice of Operations (NOO) form was submitted through OGC eSubmission portal"
              placeholder="Select an option"
              disabled={isViewOnly}
              component={renderConfig.SELECT}
              validate={[requiredBoolean]}
              format={booleanFormat}
              data={booleanDropdownOptions}
            />
            <Field
              id="abandonment_was_pipeline_abandoned"
              name="abandonment_was_pipeline_abandoned"
              label="Was pipeline abandoned as part of the Dormant Site Abandonment process?"
              placeholder="Select an option"
              disabled={isViewOnly}
              component={renderConfig.SELECT}
              validate={[requiredBoolean]}
              format={booleanFormat}
              data={booleanDropdownOptions}
            />
            <Field
              id="abandonment_metres_of_pipeline_abandoned"
              name="abandonment_metres_of_pipeline_abandoned"
              label={
                <>
                  <div>
                    Approximate length of pipeline abandoned as part of this work (if applicable)
                  </div>
                  <div className="font-weight-normal">
                    If you are unsure of the approximate length, please leave this field blank.
                  </div>
                </>
              }
              placeholder="0 metres"
              disabled={isViewOnly}
              validate={[validateMetresPipelineAbandoned, notZero]}
              component={renderConfig.FIELD}
              {...metersMask}
            />
          </>
        )}

        {workType === "remediation" && (
          <>
            <Field
              id="remediation_identified_contamination_meets_standards"
              name="remediation_identified_contamination_meets_standards"
              label="All identified contamination relating to the Dormant Site was remediated to meet Contaminated Sites Regulations standards or risk-based standards relevant to the site"
              placeholder="Select an option"
              disabled={isViewOnly}
              component={renderConfig.SELECT}
              validate={[requiredBoolean]}
              format={booleanFormat}
              data={booleanDropdownOptions}
            />
            <Field
              id="remediation_type_of_document_submitted"
              name="remediation_type_of_document_submitted"
              label="Has a Certificate of Restoration (Part 1) or a Dormancy Site Assessment Form been submitted to the OGC?"
              placeholder="Select an option"
              disabled={isViewOnly}
              component={renderConfig.SELECT}
              validate={[required]}
              format={null}
              data={docSubmittedDropdownOptions}
            />
            <Field
              id="remediation_reclaimed_to_meet_cor_p1_requirements"
              name="remediation_reclaimed_to_meet_cor_p1_requirements"
              label="Was the Dormant Site reclaimed to meet Certificate of Restoration (Part 1) requirements?"
              placeholder="Select an option"
              disabled={isViewOnly}
              component={renderConfig.SELECT}
              validate={[requiredBoolean]}
              format={booleanFormat}
              data={booleanDropdownOptions}
            />
          </>
        )}

        {workType === "reclamation" && (
          <>
            <Field
              id="reclamation_reclaimed_to_meet_cor_p2_requirements"
              name="reclamation_reclaimed_to_meet_cor_p2_requirements"
              label="Dormant Site reclamation meets Certificate of Restoration (Part 2) requirements"
              placeholder="Select an option"
              disabled={isViewOnly}
              component={renderConfig.SELECT}
              validate={[requiredBoolean]}
              format={booleanFormat}
              data={booleanDropdownOptions}
            />
            <Field
              id="reclamation_surface_reclamation_criteria_met"
              name="reclamation_surface_reclamation_criteria_met"
              label="Surface reclamation has been completed to match surrounding natural contour and re-vegetated with ecologically suitable species"
              placeholder="Select an option"
              disabled={isViewOnly}
              component={renderConfig.SELECT}
              validate={[requiredBoolean]}
              format={booleanFormat}
              data={booleanDropdownOptions}
            />
          </>
        )}

        {(workType === "preliminary_site_investigation" ||
          workType === "detailed_site_investigation") && (
          <>
            <Field
              id="site_investigation_type_of_document_submitted"
              name="site_investigation_type_of_document_submitted"
              label="Has a Certificate of Restoration (Part 1) or a Dormancy Site Assessment Form been submitted to the OGC?"
              placeholder="Select an option"
              disabled={isViewOnly}
              component={renderConfig.SELECT}
              validate={[required]}
              format={null}
              data={docSubmittedDropdownOptions}
            />
            <Field
              id="site_investigation_concerns_identified"
              name="site_investigation_concerns_identified"
              label="During site investigation, concerns were identified that are specific to other interested parties (e.g., landowners, municipalities, regional districts or Indigenous nations)"
              placeholder="Select an option"
              disabled={isViewOnly}
              component={renderConfig.SELECT}
              validate={[requiredBoolean]}
              format={booleanFormat}
              data={booleanDropdownOptions}
            />
          </>
        )}

        <Field
          id="reclamation_was_achieved"
          name="reclamation_was_achieved"
          label="Level of Reclamation achieved for the Dormant Site"
          placeholder="Select an option"
          disabled={isViewOnly}
          component={renderConfig.SELECT}
          validate={[requiredBoolean]}
          format={booleanFormat}
          data={[
            { value: "true", label: `${workTypeName} Complete` },
            { value: "false", label: `${workTypeName} Not Complete` },
          ]}
        />
      </Col>
    </Row>
  );
};

const label = (text, title) => (
  <>
    <span>{text}</span>
    {title && (
      <Tooltip title={title} placement="right" mouseEnterDelay={0.3}>
        <Icon
          type="info-circle"
          className="icon-sm"
          style={{ marginLeft: 4, verticalAlign: "baseline" }}
        />
      </Tooltip>
    )}
  </>
);

// eslint-disable-next-line react/prefer-stateless-function
export class ContractedWorkPaymentForm extends Component {
  state = { maxAmount: 0, estimatedFinancialContribution: 0 };

  calculateEstimatedFinancialContribution = (paymentType, contractedWork, actual_cost = null) => {
    const result = Payment.calculateEstimatedFinancialContribution(
      paymentType,
      contractedWork,
      actual_cost
    );

    this.setState({
      ...result,
    });

    return result;
  };

  componentDidMount() {
    if (
      this.props.paymentType === PAYMENT_TYPES.INTERIM ||
      this.props.paymentType === PAYMENT_TYPES.FINAL
    ) {
      this.calculateEstimatedFinancialContribution(
        this.props.paymentType,
        this.props.contractedWorkPayment
      );
    }
  }

  renderEstimatedFinancialContribution = (paymentType, contractedWorkPayment) =>
    (paymentType === PAYMENT_TYPES.INTERIM || paymentType === PAYMENT_TYPES.FINAL) && (
      <>
        <Row gutter={16} type="flex" justify="space-around" align="middle">
          <Col className="gutter-row" span={12}>
            <Text strong>
              {paymentType === PAYMENT_TYPES.FINAL && "Estimated"} Maximum Financial Contribution
              {toolTip(
                paymentType === PAYMENT_TYPES.INTERIM
                  ? "As per the program rules, the maximum possible interim payment is 60% of this work item's Estimated Shared Cost."
                  : "As per the program rules, the maximum possible final payment is 30% of this work item's Estimated Shared Cost, plus any unclaimed funds from the Interim Maximum Financial Contribution after the interim payment has been issued.",
                "history"
              )}
            </Text>
            <br />
            {formatMoney(this.state.maxAmount)}
          </Col>
          <Col className="gutter-row" span={12}>
            <Text strong>
              Estimated Financial Contribution
              {toolTip(
                paymentType === PAYMENT_TYPES.INTERIM
                  ? "As per the program rules, the estimated interim financial contribution is calculated at 50% of the provided interim Evidence of Cost Total, capped at the Interim Maximum Financial Contribution."
                  : "As per the program rules, the estimated final financial contribution is calculated at 50% of the provided final Evidence of Cost Total, capped at the Final Maximum Financial Contribution.",
                "history"
              )}
            </Text>
            <br />
            {formatMoney(this.state.estimatedFinancialContribution)}
          </Col>
        </Row>
        <br />
      </>
    );

  render() {
    const { paymentType, contractedWorkPayment } = this.props;
    const paymentInfo = contractedWorkPayment.contracted_work_payment;

    const interimPaymentStatus = paymentInfo
      ? paymentInfo.interim_payment_status_code
      : "INFORMATION_REQUIRED";

    const finalPaymentStatus = paymentInfo
      ? paymentInfo.final_payment_status_code
      : "INFORMATION_REQUIRED";

    const isViewOnly =
      this.props.isAdminView ||
      (paymentType === PAYMENT_TYPES.INTERIM && interimPaymentStatus !== "INFORMATION_REQUIRED") ||
      (paymentType === PAYMENT_TYPES.FINAL &&
        (interimPaymentStatus === "INFORMATION_REQUIRED" ||
          finalPaymentStatus !== "INFORMATION_REQUIRED"));

    const existingEvidenceOfCost = paymentInfo
      ? paymentType === PAYMENT_TYPES.INTERIM
        ? isEmpty(paymentInfo.interim_eoc_document)
          ? null
          : paymentInfo.interim_eoc_document
        : paymentType === PAYMENT_TYPES.FINAL
        ? isEmpty(paymentInfo.final_eoc_document)
          ? null
          : paymentInfo.final_eoc_document
        : null
      : null;

    const existingFinalReport = paymentInfo
      ? isEmpty(paymentInfo.final_report_document)
        ? null
        : paymentInfo.final_report_document
      : null;

    return (
      <Form layout="vertical" onSubmit={this.props.handleSubmit}>
        <Title level={4}>{capitalize(paymentType)} Payment Form</Title>
        {paymentType === PAYMENT_TYPES.FINAL && interimPaymentStatus === "INFORMATION_REQUIRED" && (
          <Paragraph>
            <Alert
              showIcon
              message="You must complete and submit an Interim Payment request before you can submit a Final Payment request."
            />
          </Paragraph>
        )}

        {paymentType === PAYMENT_TYPES.INTERIM && (
          <>
            <Paragraph>
              In order for your {formatTitleString(paymentType)} Payment request to be processed,
              you must complete this form and attach your Evidence of Cost file.
            </Paragraph>
            <Paragraph>
              The Interim Progress Report must be submitted within&nbsp; 30 days of requesting an
              interim payment.
            </Paragraph>
            <Paragraph>
              Once you submit your request, you cannot edit it. If you have any questions or
              concerns, contact <a href={`mailto:${HELP_EMAIL}`}>{HELP_EMAIL}</a>.
            </Paragraph>
          </>
        )}

        {paymentType === PAYMENT_TYPES.FINAL && (
          <>
            <Paragraph>
              In order for your Final Payment request to be processed, you must complete this form
              and attach your Evidence of Cost and Final Report files.
            </Paragraph>
            <Paragraph>
              Once you submit your request, you cannot edit it. If you have any questions, contact{" "}
              <a href={`mailto:${HELP_EMAIL}`}>{HELP_EMAIL}</a>.
            </Paragraph>
          </>
        )}

        <Row gutter={48}>
          <Col>
            <Field
              id={`${paymentType}_total_hours_worked_to_date`}
              name={`${paymentType}_total_hours_worked_to_date`}
              label={label(
                "Total Hours Worked",
                "Number of hours that have been attributed to completing this work to date."
              )}
              placeholder="0"
              disabled={isViewOnly}
              component={renderConfig.FIELD}
              validate={[required, number]}
            />
            <Field
              id={`${paymentType}_number_of_workers`}
              name={`${paymentType}_number_of_workers`}
              label={label(
                "Total Number of Workers",
                "Number of people who have worked on the Dormant Site completing eligible work activities to date."
              )}
              placeholder="0"
              disabled={isViewOnly}
              component={renderConfig.FIELD}
              validate={[required, number]}
            />
            <Field
              id={`${paymentType}_actual_cost`}
              name={`${paymentType}_actual_cost`}
              label={label(
                "Evidence of Cost Total",
                "Total of all invoices recorded on the Evidence of Cost form."
              )}
              placeholder="$0.00"
              disabled={isViewOnly}
              component={renderConfig.FIELD}
              validate={[required, number]}
              {...currencyMask}
              onChange={(event, newValue) => {
                if (newValue && newValue.toString().split(".")[0].length > 8) {
                  event.preventDefault();
                }
                this.calculateEstimatedFinancialContribution(
                  paymentType,
                  contractedWorkPayment,
                  newValue
                );
              }}
            />

            {this.renderEstimatedFinancialContribution(paymentType, contractedWorkPayment)}

            {paymentType === PAYMENT_TYPES.INTERIM &&
              (!paymentInfo ||
                !paymentInfo.interim_payment_status_code ||
                (paymentInfo.interim_payment_status &&
                  paymentInfo.interim_payment_status.contracted_work_payment_status_code ===
                    "INFORMATION_REQUIRED")) && (
                <Field
                  id="interim_report"
                  name="interim_report"
                  label={
                    <>
                      {label(
                        "Interim Progress Report (min. 25 - max. 250 characters)",
                        !paymentInfo || !paymentInfo.interim_payment_status_code
                          ? "If you do not complete this section now, submit your summary report on the Interim Progress Report tab within 30 days."
                          : null
                      )}
                      <div className="font-weight-normal color-default-font">
                        Briefly describe the work that was reported in the uploaded Interim Evidence
                        of Cost file.
                      </div>
                    </>
                  }
                  disabled={isViewOnly}
                  component={renderConfig.AUTO_SIZE_FIELD}
                  validate={[minLength(25), maxLength(250)]}
                />
              )}

            {paymentType === PAYMENT_TYPES.FINAL && (
              <Field
                id="work_completion_date"
                name="work_completion_date"
                label="Work Completion Date"
                placeholder={DATE_FORMAT}
                disabled={isViewOnly}
                component={renderConfig.DATE}
                validate={[required, date, dateNotInFuture]}
              />
            )}

            <Field
              id={`${paymentType}_eoc`}
              name={`${paymentType}_eoc`}
              label={
                <>
                  <div>Upload Evidence of Cost</div>
                  <div className="font-weight-normal color-default-font">
                    Fill in the&nbsp;
                    <a href={EOC_TEMPLATE} target="_blank" rel="noopener noreferrer">
                      Evidence of Cost form
                    </a>
                    &nbsp;and upload it as a PDF here.
                    {existingEvidenceOfCost &&
                      " If your original Evidence of Cost document has not changed, you do not need to re-upload it."}
                  </div>
                </>
              }
              disabled={isViewOnly}
              component={renderConfig.FILE_UPLOAD}
              validate={existingEvidenceOfCost ? [] : [requiredList]}
              acceptedFileTypesMap={PDF}
              allowMultiple={false}
              allowRevert
              renderAfterInput={() =>
                (existingEvidenceOfCost && (
                  <LinkButton
                    onClick={() =>
                      downloadDocument(
                        this.props.contractedWorkPayment.application_guid,
                        existingEvidenceOfCost.application_document_guid,
                        existingEvidenceOfCost.document_name
                      )
                    }
                  >
                    View attached Evidence of Cost
                  </LinkButton>
                )) || <></>
              }
            />

            {paymentType === PAYMENT_TYPES.FINAL && (
              <>
                <Field
                  id="final_report"
                  name="final_report"
                  label={
                    <>
                      <div>Final Report</div>
                      <div className="font-weight-normal">
                        Fill in the&nbsp;
                        <a href={FINAL_REPORT_TEMPLATE} target="_blank" rel="noopener noreferrer">
                          Final Report template
                        </a>
                        &nbsp;and upload it as a PDF here.
                        {existingFinalReport &&
                          " If your original Final Report document has not changed, you do not need to re-upload it."}
                      </div>
                    </>
                  }
                  disabled={isViewOnly}
                  component={renderConfig.FILE_UPLOAD}
                  validate={existingFinalReport ? [] : [requiredList]}
                  acceptedFileTypesMap={PDF}
                  allowMultiple={false}
                  allowRevert
                  renderAfterInput={() =>
                    (existingFinalReport && (
                      <LinkButton
                        onClick={() =>
                          downloadDocument(
                            this.props.contractedWorkPayment.application_guid,
                            existingFinalReport.application_document_guid,
                            existingFinalReport.document_name
                          )
                        }
                      >
                        View attached Final Report
                      </LinkButton>
                    )) || <></>
                  }
                />
                <Form.Item
                  label={
                    <>
                      <div>Final Report Summary</div>
                      <div className="font-weight-normal">
                        Complete this section using the information provided in the Final Report.
                      </div>
                    </>
                  }
                >
                  {renderReportingFields(
                    this.props.contractedWorkPayment.contracted_work_type,
                    isViewOnly
                  )}
                </Form.Item>
              </>
            )}

            <Form.Item label="Attestations">
              <Field
                id={`${paymentType}_submission_confirmation`}
                name={`${paymentType}_submission_confirmation`}
                label="I certify that the above information is correct and has been reviewed and approved by a senior officer of the recipient organization."
                disabled={isViewOnly}
                component={renderConfig.CHECKBOX}
                validate={[required]}
              />
              <Field
                id={`${paymentType}_dormancy_and_shutdown_regulations_confirmation`}
                name={`${paymentType}_dormancy_and_shutdown_regulations_confirmation`}
                label={
                  <>
                    I declare that all required notifications and activities have been submitted in
                    accordance with the&nbsp;
                    <a
                      href="https://www.bclaws.ca/civix/document/id/complete/statreg/112_2019"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Dormancy and Shutdown Regulation
                    </a>
                    .
                  </>
                }
                disabled={isViewOnly}
                component={renderConfig.CHECKBOX}
                validate={[required]}
              />
              <Field
                id={`${paymentType}_submitter_name`}
                label="Submitted by"
                name={`${paymentType}_submitter_name`}
                placeholder="Enter your name"
                disabled={isViewOnly}
                component={renderConfig.FIELD}
                validate={[required]}
              />
              {this.renderEstimatedFinancialContribution(paymentType, contractedWorkPayment)}
            </Form.Item>
            <Paragraph>
              Keep all records of original invoices for the work reported. If they are requested by
              the Province, you will be required to provide them within 30 days.
            </Paragraph>
          </Col>
        </Row>
        <div className="right">
          {(isViewOnly && (
            <Button type="primary" onClick={this.props.closeModal}>
              Close
            </Button>
          )) || (
            <>
              <Popconfirm
                placement="topRight"
                title="Are you sure you want to cancel?"
                onConfirm={this.props.closeModal}
                okText="Yes"
                cancelText="No"
                disabled={this.props.submitting}
              >
                <Button type="secondary" disabled={this.props.submitting}>
                  Cancel
                </Button>
              </Popconfirm>
              <Button
                type="primary"
                htmlType="submit"
                style={{ marginLeft: 5 }}
                loading={this.props.submitting}
              >
                Submit Request
              </Button>
            </>
          )}
        </div>
      </Form>
    );
  }
}

ContractedWorkPaymentForm.propTypes = propTypes;
ContractedWorkPaymentForm.defaultProps = defaultProps;

export default ContractedWorkPaymentForm;
