from flask import request, current_app
from flask_restplus import Resource
from werkzeug.exceptions import BadRequest

from app.extensions import api
from app.api.utils.resources_mixins import UserMixin
from app.api.utils.access_decorators import requires_role_admin
from app.api.dsrp_settings.models.dsrp_settings import DSRPSettings
from app.api.dsrp_settings.response_models import DSRP_SETTINGS, DSRP_SETTING


class DSRPSettingsResource(Resource, UserMixin):
    @api.doc(description='Request all app settings')
    @api.marshal_with(DSRP_SETTINGS, code=200)
    def get(self):
        settings = DSRPSettings.get_all()
        return {'settings': settings}

    @api.doc(description='Update app settings')
    @api.expect(DSRP_SETTING)
    @api.marshal_with(DSRP_SETTING, code=200)
    @requires_role_admin
    def put(self):
        new_setting = request.json
        current_app.logger.info(new_setting)
        app_setting = DSRPSettings.find_by_setting(new_setting.get('setting', None))
        if not app_setting:
            raise BadRequest(f'Setting not found')

        current_app.logger.info(f'Updating {app_setting}')
        app_setting.setting_value = new_setting.get('setting_value', None)
        app_setting.save()

        return app_setting
