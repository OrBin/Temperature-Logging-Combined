import sqlalchemy as sa
from sqlalchemy.ext.declarative import DeclarativeMeta, declarative_base


Base: DeclarativeMeta = declarative_base()


class Logger(Base):
    __tablename__ = "loggers"
    id = sa.Column(sa.Integer, sa.Sequence("logger_id_seq"), primary_key=True)
    name = sa.Column(sa.UnicodeText, nullable=False, unique=True)
    is_displayed = sa.Column(sa.Boolean, nullable=False, default=False)


class Log(Base):
    __tablename__ = "logs"
    id = sa.Column(sa.Integer, sa.Sequence("log_id_seq"), primary_key=True)
    logger_id = sa.Column(sa.Integer, sa.ForeignKey(Logger.id, onupdate="cascade", ondelete="cascade"), nullable=False)
    temperature_c = sa.Column(sa.Float, nullable=False)
    humidity = sa.Column(sa.Float, nullable=False)
    timestamp = sa.Column(sa.TIMESTAMP(timezone=True), nullable=False, default=sa.func.now())
