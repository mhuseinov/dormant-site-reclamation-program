from sqlalchemy.schema import FetchedValue

from app.extensions import db
from app.api.utils.models_mixins import Base, AuditMixin


class ContractedWorkPaymentStatus(Base, AuditMixin):
    __tablename__ = 'contracted_work_payment_status'

    contracted_work_payment_status_code = db.Column(db.String, primary_key=True)
    description = db.Column(db.String, nullable=False)
    long_description = db.Column(db.String, nullable=False)
    active = db.Column(db.Boolean, nullable=False, server_default=FetchedValue())

    def __repr__(self):
        return f'<{self.__class__.__name__} {self.contracted_work_payment_status_code}>'

    @classmethod
    def get_active(cls):
        return cls.query.filter_by(active=True).all()

    @classmethod
    def find_by_code(cls, contracted_work_payment_status_code):
        return cls.query.filter_by(
            contracted_work_payment_status_code=contracted_work_payment_status_code).one_or_none()
