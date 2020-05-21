import React, { Component } from "react";
import { connect } from "react-redux";
import { Link, withRouter } from "react-router-dom";
import { Menu, Dropdown, Button, Icon, Divider } from "antd";
import MediaQuery from "react-responsive";
import PropTypes from "prop-types";
import * as routes from "@/constants/routes";
import { signOutFromSiteMinder } from "@/utils/authenticationHelpers";
import { isAuthenticated, getUserInfo, getIsViewOnly } from "@/selectors/authenticationSelectors";
import { MENU } from "@/constants/assets";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";

const propTypes = {
  isAuthenticated: PropTypes.bool.isRequired,
  location: PropTypes.shape({ pathname: PropTypes.string }).isRequired,
  userInfo: PropTypes.objectOf(PropTypes.string),
  isAdmin: PropTypes.bool,
};

const defaultProps = {
  userInfo: {},
  isAdmin: false,
};

export class HeaderDropdown extends Component {
  handleLogout = () => {
    signOutFromSiteMinder();
  };

  setActiveLink = (pathname) => {
    return this.props.location.pathname === pathname ? "header-link active" : "header-link";
  };

  render() {
    const menuItemLogout = (
      <Menu.Item key="logout" className="custom-menu-item">
        <Button className="header-dropdown-item-button" onClick={this.handleLogout}>
          Log out
        </Button>
      </Menu.Item>
    );

    // TODO: WHEN LAUNCH - REPLACE `isViewOnly` with `!isAuthenticated`
    const dropdownMenuMobile = (
      <Menu className="header-dropdown-menu">
        {this.props.isViewOnly && (
          <>
            <Menu.Item key="submit-application" className="custom-menu-item">
              <Button className="header-dropdown-item-button">
                <Link to={routes.SUBMIT_APPLICATION.route}>Apply</Link>
              </Button>
            </Menu.Item>
            <Menu.Item key="view-application-status" className="custom-menu-item">
              <Button className="header-dropdown-item-button">
                <Link to={routes.VIEW_APPLICATION_STATUS.route}>Status</Link>
              </Button>
            </Menu.Item>
          </>
        )}
        <AuthorizationWrapper>
          <React.Fragment>
            <Divider className="bg-color-table-seperator" style={{ margin: 0 }} />
            <Menu.Item key="review-applications" className="custom-menu-item">
              <Button className="header-dropdown-item-button">
                <Link to={routes.REVIEW_APPLICATIONS.route}>Applications</Link>
              </Button>
            </Menu.Item>
          </React.Fragment>
        </AuthorizationWrapper>
        {this.props.isAuthenticated && (
          <>
            <Divider className="bg-color-table-seperator" style={{ margin: 0 }} />
            {menuItemLogout}
          </>
        )}
      </Menu>
    );

    const dropdownMenuDesktop = (
      <Menu className="header-dropdown-menu">
        <AuthorizationWrapper>
          <Menu.Item key="review-applications" className="custom-menu-item" onItemHover={() => {}}>
            <Button className="header-dropdown-item-button">
              <Link to={routes.REVIEW_APPLICATIONS.route}>Applications</Link>
            </Button>
          </Menu.Item>
        </AuthorizationWrapper>
        {this.props.isAuthenticated && menuItemLogout}
      </Menu>
    );

    const smallestDesktopWidth = 1280;
    return (
      // TODO: WHEN LAUNCH - REPLACE `isViewOnly` with `!isAuthenticated`
      <>
        <MediaQuery minWidth={smallestDesktopWidth}>
          <span>
            {this.props.isViewOnly && (
              <>
                <Link
                  to={routes.SUBMIT_APPLICATION.route}
                  className={this.setActiveLink(routes.SUBMIT_APPLICATION.route)}
                >
                  New Application
                </Link>
                <Link
                  to={routes.VIEW_APPLICATION_STATUS.route}
                  className={this.setActiveLink(routes.VIEW_APPLICATION_STATUS.route)}
                >
                  Check Application Status
                </Link>
              </>
            )}
            {this.props.isAuthenticated && (
              <Dropdown overlay={dropdownMenuDesktop}>
                <Button className="header-dropdown-button">
                  {this.props.userInfo.email}
                  <Icon type="caret-down" />
                </Button>
              </Dropdown>
            )}
          </span>
        </MediaQuery>
        <MediaQuery maxWidth={smallestDesktopWidth - 1}>
          <Dropdown overlay={dropdownMenuMobile} placement="bottomRight">
            <Button id="dropdown-menu-mobile-trigger" className="header-dropdown-button">
              <img src={MENU} alt="Menu" />
            </Button>
          </Dropdown>
        </MediaQuery>
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  userInfo: getUserInfo(state),
  isViewOnly: getIsViewOnly(state),
  isAuthenticated: isAuthenticated(state),
});

HeaderDropdown.propTypes = propTypes;
HeaderDropdown.defaultProps = defaultProps;

export default withRouter(connect(mapStateToProps)(HeaderDropdown));
