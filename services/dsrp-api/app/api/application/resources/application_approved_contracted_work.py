from flask_restplus import Resource, marshal
from werkzeug.exceptions import NotFound
from flask import request

from app.extensions import api
from app.api.utils.resources_mixins import UserMixin
from app.api.constants import PAGE_DEFAULT, PER_PAGE_DEFAULT
from app.api.application.response_models import APPLICATION_APPROVED_CONTRACTED_WORK
from app.api.application.models.application import Application
from app.api.utils.access_decorators import requires_role_admin
from app.api.utils.helpers import apply_pagination_to_records


class ApplicationApprovedContractedWorkResource(Resource, UserMixin):
    # TODO: Protect me with OTP
    @api.doc(
        description=
        'Get the information required for an applicant to manage the approved contracted work payment information on their application.'
    )
    @api.marshal_with(APPLICATION_APPROVED_CONTRACTED_WORK, code=200)
    def get(self, application_guid):
        application = Application.find_by_guid(application_guid)
        if application is None:
            raise NotFound('No application was found matching the provided reference number')

        return application


class ApplicationApprovedContractedWorkListResource(Resource, UserMixin):
    @api.doc(
        description=
        'Get all approved contracted work item payment information on all approved applications.')
    # @requires_role_admin
    def get(self):
        # Get all approved applications
        approved_applications = Application.query.filter_by(
            application_status_code='FIRST_PAY_APPROVED').all()

        # Get all approved contracted work items on those applications
        approved_applications_approved_contracted_work = [
            approved_contracted_work for application in approved_applications
            for approved_contracted_work in application.approved_contracted_work
        ]

        # Get pagination/sorting query params
        page_number = request.args.get('page', PAGE_DEFAULT, type=int)
        page_size = request.args.get('per_page', PER_PAGE_DEFAULT, type=int)
        sort_field = request.args.get('sort_field', 'application_id', type=str)
        sort_dir = request.args.get('sort_dir', 'asc', type=str)

        # Get filtering query params
        application_id = request.args.get('application_id', type=int)
        work_id = request.args.get('work_id', type=str)
        well_authorization_number = request.args.get('well_authorization_number', type=str)
        contracted_work_type = request.args.getlist('contracted_work_type', type=str)
        interim_payment_status_code = request.args.getlist('interim_payment_status_code', type=str)
        final_payment_status_code = request.args.getlist('interim_payment_status_code', type=str)

        # Apply filtering
        records = []
        for approved_work in approved_applications_approved_contracted_work:

            if application_id and approved_work['application_id'] != application_id:
                continue

            if work_id and approved_work['work_id'] != work_id:
                continue

            if well_authorization_number and approved_work[
                    'well_authorization_number'] != well_authorization_number:
                continue

            if contracted_work_type and approved_work[
                    'contracted_work_type'] not in contracted_work_type:
                continue

            contracted_work_payment = approved_work.get('contracted_work_payment', None)

            status = 'INFORMATION_REQUIRED' if not contracted_work_payment else contracted_work_payment[
                'interim_payment_status_code']
            if interim_payment_status_code and status not in interim_payment_status_code:
                continue

            status = 'INFORMATION_REQUIRED' if not contracted_work_payment else contracted_work_payment[
                'final_payment_status_code']
            if final_payment_status_code and status not in final_payment_status_code:
                continue

            records.append(approved_work)

        # Apply sorting
        reverse = sort_dir == 'desc'
        if sort_field in ('application_id', 'work_id', 'well_authorization_number',
                          'contracted_work_type'):
            records.sort(key=lambda x: x[sort_field], reverse=reverse)
        elif sort_field in ('interim_payment_status_code', 'final_payment_status_code'):
            records.sort(
                key=lambda x: (x.get('contracted_work_payment') and x['contracted_work_payment'][
                    sort_field]) or 'INFORMATION_REQUIRED',
                reverse=reverse)

        # Return records with pagination applied
        return apply_pagination_to_records(records, page_number, page_size)
