import { startCase, camelCase, isObjectLike, isEmpty, isArrayLike, sum, get } from "lodash";
import { createSelector } from "reselect";
import * as applicationReducer from "../reducers/applicationReducer";
import { getWells, getLiabilities } from "@/selectors/OGCSelectors";

export const { getApplications, getApplication, getPageData } = applicationReducer;

// return an array of contracted_work on well sites
export const getApplicationsWellSitesContractedWork = createSelector(
  [getApplications, getWells, getLiabilities],
  (applications, wells, liabilities) => {
    const wellsHash = wells.reduce((map, obj) => ((map[obj.well_auth_number] = obj), map), {});
    const liabilitiesHash = liabilities.reduce(
      (map, obj) => ((map[obj.well_auth_number] = obj), map),
      {}
    );
    console.log(wellsHash);
    // console.log(liabilitiesHash);

    if (isEmpty(applications) || !isArrayLike(applications)) {
      return [];
    }

    const wellSitesContractedWork = [];
    applications.map((application) => {
      if (isEmpty(application) || isEmpty(application.json)) {
        return;
      }

      const wellSites = application.json.well_sites;
      if (isEmpty(wellSites) || !isArrayLike(wellSites)) {
        return;
      }

      const reviewJson = (isObjectLike(application.review_json) && application.review_json) || null;

      wellSites.map((site) => {
        if (isEmpty(site)) {
          return;
        }

        const wellAuthorizationNumber =
          (isObjectLike(site.details) && site.details.well_authorization_number) || null;

        const priorityCriteria =
          (isObjectLike(site.site_conditions) && Object.values(site.site_conditions).length) || 0;

        const reviewJsonWellSite =
          (reviewJson &&
            wellAuthorizationNumber &&
            isObjectLike(reviewJson.well_sites) &&
            reviewJson.well_sites[wellAuthorizationNumber]) ||
          null;

        const contractedWork = (isObjectLike(site.contracted_work) && site.contracted_work) || {};
        Object.keys(contractedWork).map((type) => {
          const estimatedCostArray = Object.values(contractedWork[type]).filter(
            (value) => !isNaN(value)
          );

          const maxSharedCost = 100000;
          const calculatedSharedCost = (sum(estimatedCostArray) / 2).toFixed(2);
          const sharedCost =
            calculatedSharedCost > maxSharedCost ? maxSharedCost : calculatedSharedCost;

          const contractedWorkStatusCode = get(
            reviewJsonWellSite,
            `contracted_work.${type}.contracted_work_status_code`,
            null
          );
          const OGCStatus = !isEmpty(wellsHash[wellAuthorizationNumber])
            ? wellsHash[wellAuthorizationNumber].current_status
            : null;
          const location = !isEmpty(wellsHash[wellAuthorizationNumber])
            ? wellsHash[wellAuthorizationNumber].surface_location
            : null;
          console.log(OGCStatus);
          console.log(wellAuthorizationNumber);
          const wellSiteContractedWorkType = {
            key: `${application.guid}.${wellAuthorizationNumber}.${type}`,
            application_guid: application.guid || null,
            well_authorization_number: wellAuthorizationNumber,
            contracted_work_type: type,
            contracted_work_type_description: startCase(camelCase(type)),
            priority_criteria: priorityCriteria,
            completion_date: contractedWork[type].planned_end_date || null,
            est_cost: sum(estimatedCostArray),
            est_shared_cost: sharedCost,
            LMR: null,
            OGC_status: OGCStatus,
            location,
            contracted_work_status_code: contractedWorkStatusCode || "NOT_STARTED",
            review_json: reviewJson,
          };

          wellSitesContractedWork.push(wellSiteContractedWorkType);
        });
      });
    });

    return wellSitesContractedWork;
  }
);
