import moment from "moment";
import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Link } from "react-router-dom";
import { isArray, isEmpty, startCase, camelCase } from "lodash";
import {
  Table,
  Icon,
  Pagination,
  Input,
  Button,
  Popover,
  Tooltip,
  Divider,
  Row,
  Col,
  Typography,
} from "antd";
import { formatMoney, formatDate, formatDateTimeFine } from "@/utils/helpers";
import { openModal, closeModal } from "@/actions/modalActions";
import {
  getFilterListContractedWorkPaymentStatusOptions,
  getFilterListContractedWorkTypeOptions,
  getDropdownContractedWorkPaymentStatusOptions,
} from "@/selectors/staticContentSelectors";
import * as Strings from "@/constants/strings";
import * as route from "@/constants/routes";
import { modalConfig } from "@/components/modalContent/config";

const { Text } = Typography;

const propTypes = {
  applicationsApprovedContractedWork: PropTypes.any.isRequired,
  filterListContractedWorkPaymentStatusOptions: PropTypes.objectOf(PropTypes.any).isRequired,
  filterListContractedWorkTypeOptions: PropTypes.objectOf(PropTypes.any).isRequired,
  onSelectedRowsChanged: PropTypes.func.isRequired,
  handleReviewContractedWorkPaymentModalSubmit: PropTypes.func.isRequired,
  contractedWorkPaymentStatusDropdownOptions: PropTypes.any.isRequired,
  contractedWorkPaymentStatusOptionsHash: PropTypes.any.isRequired,
  handleTableChange: PropTypes.func.isRequired,
  isLoaded: PropTypes.bool.isRequired,
  params: PropTypes.objectOf(PropTypes.any).isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
};

const applySortIndicator = (columns, params) =>
  columns.map((column) => ({
    ...column,
    sortOrder:
      params.sort_dir && column.sortField === params.sort_field
        ? params.sort_dir.concat("end")
        : false,
  }));

const handleTableChange = (updateParams, tableFilters) => (pagination, filters, sorter) => {
  const params = {
    page: pagination.current,
    ...tableFilters,
    sort_field: sorter.order ? sorter.field : undefined,
    sort_dir: sorter.order ? sorter.order.replace("end", "") : sorter.order,
    ...filters,
  };

  updateParams(params);
};

const popover = (message, extraClassName) => (
  <Popover
    title={<div className="font-size-small">Admin Note</div>}
    content={<div className="font-size-small">{message}</div>}
  >
    <Icon type="info-circle" className={`icon-sm ${extraClassName}`} style={{ marginLeft: 4 }} />
  </Popover>
);

export class ApprovedContractedWorkPaymentTable extends Component {
  state = {
    selectedRowKeys: [],
    selectedApplicationId: null,
  };

  componentWillReceiveProps = (nextProps) => {
    const newSelectedRows = this.transformRowData(
      nextProps.applicationsApprovedContractedWork || []
    ).filter(({ work_id }) => this.state.selectedRowKeys.includes(work_id));
    this.props.onSelectedRowsChanged(newSelectedRows);
  };

  getParamFilteredValue = (key) => {
    const val = this.props.params[key];
    return isArray(val) ? val : val ? [val] : [];
  };

  transformRowData = (applicationApprovedContractedWork) => {
    const data = applicationApprovedContractedWork.map((work) => {
      const contracted_work_payment = work.contracted_work_payment || {};
      const { interim_payment_submission_date } = contracted_work_payment;
      let interim_report_days_until_deadline = Infinity;
      let interim_report_deadline = null;
      if (interim_payment_submission_date) {
        if (contracted_work_payment.interim_report) {
          interim_report_days_until_deadline = -Infinity;
        } else {
          const daysToSubmit = 30;
          const interimSubmissionDate = moment(interim_payment_submission_date).startOf("day");
          const daysLeftCount = daysToSubmit - moment().diff(interimSubmissionDate, "days");
          interim_report_days_until_deadline = daysLeftCount;
          interim_report_deadline = interimSubmissionDate.add(daysToSubmit, "days");
        }
      }

      return {
        ...work,
        key: work.work_id,
        interim_paid_amount: parseFloat(contracted_work_payment.interim_paid_amount),
        final_paid_amount: parseFloat(contracted_work_payment.final_paid_amount),
        interim_payment_status_code:
          contracted_work_payment.interim_payment_status_code || "INFORMATION_REQUIRED",
        final_payment_status_code:
          contracted_work_payment.final_payment_status_code || "INFORMATION_REQUIRED",
        has_interim_prfs: contracted_work_payment.has_interim_prfs || false,
        has_final_prfs: contracted_work_payment.has_final_prfs || false,
        interim_eoc_document: isEmpty(contracted_work_payment.interim_eoc_document)
          ? null
          : contracted_work_payment.interim_eoc_document,
        final_eoc_document: isEmpty(contracted_work_payment.final_eoc_document)
          ? null
          : contracted_work_payment.final_eoc_document,
        final_report_document: isEmpty(contracted_work_payment.final_report_document)
          ? null
          : contracted_work_payment.final_report_document,
        interim_report_days_until_deadline,
        interim_report_deadline,
        review_deadlines: contracted_work_payment ? contracted_work_payment.review_deadlines : null,
        work,
      };
    });
    return data;
  };

  handleSearch = (selectedKeys, dataIndex) => {
    const params = {
      ...this.props.params,
      [dataIndex]: (isArray(selectedKeys) && selectedKeys[0]) || selectedKeys,
    };
    this.props.handleTableChange(params);
  };

  handleReset = (dataIndex, clearFilters) => {
    const params = {
      ...this.props.params,
      [dataIndex]: undefined,
    };
    this.props.handleTableChange(params);
    clearFilters();
  };

  openAdminReviewContractedWorkPaymentModal = (record) =>
    this.props.openModal({
      width: 1000,
      props: {
        title: `Review Information for Work ID ${record.work_id}`,
        contractedWork: record,
        onSubmit: this.props.handleReviewContractedWorkPaymentModalSubmit,
      },
      content: modalConfig.ADMIN_REVIEW_CONTRACTED_WORK_PAYMENT,
    });

  columnSearchInput = (dataIndex, placeholder) => ({
    setSelectedKeys,
    selectedKeys,
    clearFilters,
  }) => {
    return (
      <div style={{ padding: 8 }}>
        <Input
          placeholder={placeholder}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => this.handleSearch(selectedKeys, dataIndex)}
          style={{ width: 188, marginBottom: 8, display: "block", fontSize: 12 }}
        />
        <Button
          type="primary"
          onClick={() => this.handleSearch(selectedKeys, dataIndex)}
          size="small"
          style={{ width: 90, marginRight: 8 }}
        >
          Search
        </Button>
        <Button
          onClick={() => this.handleReset(dataIndex, clearFilters)}
          size="small"
          style={{ width: 90 }}
        >
          Reset
        </Button>
      </div>
    );
  };

  searchFilterIcon = (dataIndex) => {
    return (
      <Icon
        type="search"
        theme="outlined"
        className={!isEmpty(this.props.params[dataIndex]) ? "color-primary" : ""}
      />
    );
  };

  onSelectChange = (selectedRowKeys, selectedRows) => {
    this.setState({
      selectedRowKeys: selectedRowKeys,
    });
    this.props.onSelectedRowsChanged(selectedRows);
  };

  onSelect = (record, selected, selectedRows) =>
    this.setState({
      selectedApplicationId: selected
        ? record.application_id
        : !isEmpty(selectedRows)
        ? record.application_id
        : null,
    });

  onSelectAll = (selected, selectedRows) => {
    const selectedApplicationId = selected
      ? this.state.selectedApplicationId
        ? this.state.selectedApplicationId
        : !isEmpty(selectedRows)
        ? selectedRows[0].application_id
        : null
      : null;

    selectedRows = selectedRows.filter(
      ({ application_id }) => selectedApplicationId === application_id
    );
    const selectedRowKeys = selectedRows.reduce((list, record) => [...list, record.work_id], []);

    this.setState({
      selectedRowKeys: selectedRowKeys,
      selectedApplicationId: selectedApplicationId,
    });

    this.props.onSelectedRowsChanged(selectedRows);
  };

  render() {
    const columns = [
      {
        title: "Application ID",
        key: "application_id",
        dataIndex: "application_id",
        sortField: "application_id",
        sorter: true,
        filterDropdown: this.columnSearchInput("application_id", "Enter Application ID"),
        filterIcon: () => this.searchFilterIcon("application_id"),
        render: (text, record) => (
          <div title="Application ID">
            <Link to={route.VIEW_APPLICATION.dynamicRoute(record.application_guid)}>{text}</Link>
          </div>
        ),
      },
      {
        title: "Company Name",
        key: "company_name",
        dataIndex: "company_name",
        sortField: "company_name",
        sorter: true,
        filterDropdown: this.columnSearchInput("company_name", "Enter Company Name"),
        filterIcon: () => this.searchFilterIcon("company_name"),
        render: (text) => <div title="Company Name">{text}</div>,
      },
      {
        title: "Work ID",
        key: "work_id",
        dataIndex: "work_id",
        sortField: "work_id",
        sorter: true,
        filterDropdown: this.columnSearchInput("work_id", "Enter Work ID"),
        filterIcon: () => this.searchFilterIcon("work_id"),
        render: (text) => <div title="Work ID">{text}</div>,
      },
      {
        title: "Well Auth No.",
        key: "well_authorization_number",
        dataIndex: "well_authorization_number",
        sortField: "well_authorization_number",
        sorter: true,
        filterDropdown: this.columnSearchInput("well_authorization_number", "Enter Well Auth No."),
        filterIcon: () => this.searchFilterIcon("well_authorization_number"),
        render: (text) => <div title="Well Auth No.">{text}</div>,
      },
      {
        title: "Work Type",
        key: "contracted_work_type",
        dataIndex: "contracted_work_type",
        sortField: "contracted_work_type",
        sorter: true,
        filters: this.props.filterListContractedWorkTypeOptions,
        filteredValue: this.getParamFilteredValue("contracted_work_type"),
        render: (text) => <div title="Work Type">{startCase(camelCase(text))}</div>,
      },
      {
        title: "Interim Approved",
        key: "interim_paid_amount",
        dataIndex: "interim_paid_amount",
        className: "table-column-right-align",
        render: (text) => <div title="Interim Approved">{formatMoney(text) || Strings.DASH}</div>,
      },
      {
        title: "Interim Status",
        key: "interim_payment_status_code",
        dataIndex: "interim_payment_status_code",
        sortField: "interim_payment_status_code",
        sorter: true,
        filters: this.props.filterListContractedWorkPaymentStatusOptions,
        filteredValue: this.getParamFilteredValue("interim_payment_status_code"),
        render: (text, record) => {
          const note =
            record.contracted_work_payment && record.contracted_work_payment.interim_payment_status
              ? record.contracted_work_payment.interim_payment_status.note
              : null;
          return (
            <div title="Interim Status">
              {record.has_interim_prfs && (
                <Tooltip title="This work item has been used to generate Interim PRFs">
                  <Icon type="dollar" className="table-record-tooltip color-success" />
                </Tooltip>
              )}
              {note && popover(note, "table-record-tooltip color-warning")}
              {this.props.contractedWorkPaymentStatusOptionsHash[text]}
            </div>
          );
        },
      },
      {
        title: "Final Approved",
        key: "final_paid_amount",
        dataIndex: "final_paid_amount",
        className: "table-column-right-align",
        render: (text) => <div title="Final Approved">{formatMoney(text) || Strings.DASH}</div>,
      },
      {
        title: "Final Status",
        key: "final_payment_status_code",
        dataIndex: "final_payment_status_code",
        sortField: "final_payment_status_code",
        sorter: true,
        filters: this.props.filterListContractedWorkPaymentStatusOptions,
        filteredValue: this.getParamFilteredValue("final_payment_status_code"),
        render: (text, record) => {
          const note =
            record.contracted_work_payment && record.contracted_work_payment.final_payment_status
              ? record.contracted_work_payment.final_payment_status.note
              : null;
          return (
            <div title="Final Status">
              {record.has_final_prfs && (
                <Tooltip title="This work item has been used to generate Final PRFs">
                  <Icon type="dollar" className="table-record-tooltip color-success" />
                </Tooltip>
              )}
              {note && popover(note, "table-record-tooltip color-warning")}
              {this.props.contractedWorkPaymentStatusOptionsHash[text]}
            </div>
          );
        },
      },
      {
        title: "Review Deadlines",
        key: "review_deadlines",
        dataIndex: "review_deadlines",
        sortField: "review_deadlines",
        sorter: true,
        render: (text) => {
          let interim = text && text["interim"];
          interim =
            !interim || interim === Strings.REVIEW_DEADLINE_NOT_APPLICABLE ? (
              "N/A"
            ) : interim === Strings.REVIEW_DEADLINE_PAID ? (
              "Paid"
            ) : (
              <Text title={formatDateTimeFine(interim)}>{formatDate(interim)}</Text>
            );

          let final = text && text["final"];
          final =
            !final || final === Strings.REVIEW_DEADLINE_NOT_APPLICABLE ? (
              "N/A"
            ) : final === Strings.REVIEW_DEADLINE_PAID ? (
              "Paid"
            ) : (
              <Text title={formatDateTimeFine(final)}>{formatDate(final)}</Text>
            );

          return (
            <div title="Review Deadlines">
              <Row>
                <Col span={10} style={{ textAlign: "right" }}>
                  {interim}
                </Col>
                <Col span={4} style={{ textAlign: "center" }}>
                  <Divider type="vertical" style={{ width: 2 }} />
                </Col>
                <Col span={10} style={{ textAlign: "left" }}>
                  {final}
                </Col>
              </Row>
            </div>
          );
        },
      },
      {
        title: "Review",
        key: "review",
        className: "table-header-center-align table-column-center-align",
        render: (text, record) => (
          <Button
            type="link"
            onClick={() => this.openAdminReviewContractedWorkPaymentModal(record)}
            disabled={!record.contracted_work_payment}
          >
            <Icon type="solution" className="icon-lg" />
          </Button>
        ),
      },
    ];

    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: this.onSelectChange,
      onSelect: this.onSelect,
      onSelectAll: this.onSelectAll,
      getCheckboxProps: (record) => ({
        disabled:
          record &&
          ((this.state.selectedApplicationId &&
            record.application_id !== this.state.selectedApplicationId) ||
            (record.interim_payment_status_code !== "APPROVED" &&
              record.final_payment_status_code !== "APPROVED")),
      }),
    };

    return (
      <>
        <Table
          columns={applySortIndicator(columns, this.props.params)}
          pagination={false}
          rowSelection={rowSelection}
          rowKey={(record) => record.work_id}
          dataSource={this.transformRowData(this.props.applicationsApprovedContractedWork)}
          onChange={handleTableChange(this.props.handleTableChange, this.props.params)}
          className="table-headers-center"
          loading={{
            spinning: !this.props.isLoaded,
          }}
        />
        <br />
        {!isEmpty(this.props.applicationsApprovedContractedWork) && (
          <div className="center">
            <Pagination
              defaultCurrent={Number(this.props.params.page)}
              defaultPageSize={Number(this.props.params.per_page)}
              pageSizeOptions={Strings.PAGE_SIZE_OPTIONS}
              current={this.props.pageData.current_page}
              total={this.props.pageData.total}
              pageSize={this.props.pageData.items_per_page}
              showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} items`}
              onChange={this.props.onPageChange}
              onShowSizeChange={this.props.onPageChange}
              showSizeChanger
            />
          </div>
        )}
      </>
    );
  }
}

ApprovedContractedWorkPaymentTable.propTypes = propTypes;

const mapStateToProps = (state) => ({
  filterListContractedWorkPaymentStatusOptions: getFilterListContractedWorkPaymentStatusOptions(
    state
  ),
  filterListContractedWorkTypeOptions: getFilterListContractedWorkTypeOptions(state),
  contractedWorkPaymentStatusDropdownOptions: getDropdownContractedWorkPaymentStatusOptions(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      openModal,
      closeModal,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(ApprovedContractedWorkPaymentTable);
