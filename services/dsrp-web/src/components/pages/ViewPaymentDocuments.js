import React from "react";
import { Typography } from "antd";
import PropTypes from "prop-types";
import { paymentDocuments } from "@/customPropTypes/paymentDocuments";
import { PaymentDocumentTable } from "@/components/pages/PaymentDocumentTable";
import { PAYMENT_DOCUMENT_TYPES } from "@/constants/paymentDocumentTypes";

const { Title } = Typography;

const propTypes = {
  application_guid: PropTypes.string.isRequired,
  documents: PropTypes.arrayOf(paymentDocuments).isRequired,
};

export const ViewPaymentDocuments = (props) => {
  const firstPhasePaymentDocs = props.documents.filter(
    (doc) => doc.payment_document_code === PAYMENT_DOCUMENT_TYPES.FIRST_PRF
  );
  const interimPhasePaymentDocs = props.documents.filter(
    (doc) => doc.payment_document_code === PAYMENT_DOCUMENT_TYPES.INTERIM_PRF
  );
  const finalPhasePaymentDocs = props.documents.filter(
    (doc) => doc.payment_document_code === PAYMENT_DOCUMENT_TYPES.FINAL_PRF
  );
  return (
    <>
      <Title level={3} className="documents-section">
        Payment Requests Forms
      </Title>
      <PaymentDocumentTable
        {...props}
        documents={firstPhasePaymentDocs}
        emptyText="This application does not contain any first-phase payment request documents."
        tableTitle={`First Phase (${firstPhasePaymentDocs.length})`}
      />
      <PaymentDocumentTable
        {...props}
        documents={interimPhasePaymentDocs}
        emptyText="This application does not contain any interim-phase payment request documents."
        tableTitle={`Interim Phase (${interimPhasePaymentDocs.length})`}
      />
      <PaymentDocumentTable
        {...props}
        documents={finalPhasePaymentDocs}
        emptyText="This application does not contain any final-phase payment request documents."
        tableTitle={`Final Phase (${finalPhasePaymentDocs.length})`}
      />
    </>
  );
};

ViewPaymentDocuments.propTypes = propTypes;

export default ViewPaymentDocuments;
