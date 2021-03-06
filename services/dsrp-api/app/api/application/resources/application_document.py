import decimal
import uuid
import base64
import requests
import json

from datetime import datetime
from flask import request, current_app, Response
from flask_restplus import Resource, reqparse, fields

from werkzeug.exceptions import BadRequest, NotFound, Unauthorized
from sqlalchemy.exc import DBAPIError

from app.extensions import api, db, cache, jwt
from app.api.utils.access_decorators import ADMIN

from app.api.utils.resources_mixins import UserMixin
from app.api.utils.access_decorators import requires_role_view_all, requires_role_admin
from app.api.constants import DOWNLOAD_TOKEN, TIMEOUT_5_MINUTES
from app.api.utils.access_decorators import requires_otp_or_admin

from app.api.application.models.application import Application
from app.api.application.models.application_document import ApplicationDocument
from app.api.application.models.application_status_change import ApplicationStatusChange
from app.api.services.object_store_storage_service import ObjectStoreStorageService
from app.api.services.email_service import EmailService

from app.api.application.response_models import APPLICATION_DOCUMENT, APPLICATION_DOCUMENT_LIST
from app.api.documents.response_models import DOWNLOAD_TOKEN_MODEL


class ApplicationDocumentListResource(Resource, UserMixin):
    @requires_otp_or_admin
    @api.doc(description='Register files that have been uploaded to the document store')
    def post(self, application_guid):
        application = Application.find_by_guid(application_guid)
        if not application:
            raise NotFound('No application was found matching the provided reference number')

        # Documents can only be uploaded for application's in the correct status or if its being done by an admin
        if application.application_status_code == 'WAIT_FOR_DOCS' or jwt.validate_roles([ADMIN]):
            docs = request.json.get('documents', [])

            for doc in docs:
                new_doc = ApplicationDocument(
                    document_name=doc['document_name'],
                    object_store_path=doc['object_store_path'],
                    application_document_code='SUPPORTING_DOC')
                application.documents.append(new_doc)
                application.save()

            if request.json.get('confirm_final_documents'):
                app_status_change = ApplicationStatusChange(
                    application=application,
                    application_status_code='DOC_SUBMITTED',
                    note='Thank you for uploading the required documents.')
                app_status_change.save()

            return '', 204
        raise Unauthorized('Not currently accepting documents on this application')


class ApplicationDocumentResource(Resource, UserMixin):
    @api.doc(description='Generate a token to retrieve a file object storage')
    @api.marshal_with(DOWNLOAD_TOKEN_MODEL, code=200)
    @requires_otp_or_admin
    def get(self, application_guid, document_guid):
        app_document = ApplicationDocument.find_by_guid(application_guid, document_guid)
        if not app_document:
            raise NotFound('Application document not found')

        token_guid = uuid.uuid4()
        cache.set(DOWNLOAD_TOKEN(token_guid), {'document_guid': document_guid}, TIMEOUT_5_MINUTES)
        return {'token_guid': token_guid}
