/* eslint-disable */
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Table } from "antd";
import { getApplications } from "@/selectors/applicationSelectors";
import { fetchApplications } from "@/actionCreators/applicationActionCreator";
import { formatDateTime, dateSorter, nullableStringSorter } from "@/utils/helpers";

const columns = [
  {
    title: "Company Name",
    dataIndex: "company_name",
    render: (text) => <div title="company_name">{text || "N/A"}</div>,
  },
  {
    title: "Permit Holder",
    dataIndex: "permit_holder",
  },
  {
    title: "No. Wells",
    dataIndex: "wells",
  },
  {
    title: "Estimated Cost",
    dataIndex: "wells",
  },
  {
    title: "Eligable amount",
    dataIndex: "wells",
  },
  {
    title: "Total 10% Payment",
    dataIndex: "wells",
  },
  {
    title: "Submission Date",
    dataIndex: "submission_date",
    sorter: true,
    render: (text) => <div title="submission_date">{formatDateTime(text)}</div>,
  },
];

export class ReviewApplicationInfo extends Component {
  componentDidMount() {
    this.props.fetchApplications();
  }

  onChange = (pagination, filters, sorter, extra) => {
    console.log("params", pagination, filters, sorter, extra);
  };

  transformRowData = (applications) => {
    const apps = applications.map((application) => {
      return {
        key: application.guid,
        company_name: application.json.company_details.company_name.label,
        ...application,
      };
    });
    return apps;
  };

  render() {
    return (
      <>
        <Table
          columns={columns}
          pagination={false}
          dataSource={this.transformRowData(this.props.applications)}
          onChange={this.onChange}
          expandable={{
            expandedRowRender: () => <p style={{ margin: 0 }}>Surprise! more content here</p>,
          }}
        />
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  applications: getApplications(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchApplications,
    },
    dispatch
  );

// ReviewApplicationInfo.propTypes = propTypes;
// ReviewApplicationInfo.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(ReviewApplicationInfo);
