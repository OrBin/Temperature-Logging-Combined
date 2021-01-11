from datetime import timedelta
from typing import Optional
from fastapi import HTTPException
from psycopg2._psycopg import IntegrityError
from pydantic import BaseModel, constr
import sqlalchemy as sa
import fastapi
from db import connect_db
from models import Logger, Log


class CreateLogParams(BaseModel):
    logger_id: int
    temperature_c: float
    humidity: float


class CreateLoggerParams(BaseModel):
    name: constr(min_length=1)
    is_displayed: bool = False


class UpdateLoggerParams(BaseModel):
    name: Optional[constr(min_length=1)]
    is_displayed: Optional[bool] = False


router = fastapi.APIRouter()


@router.post('/logger')
async def insert_logger(params: CreateLoggerParams):
    async with connect_db() as connection:
        try:
            result = await connection.execute(
                sa.insert(Logger).values(params.dict()).returning(*Logger.__table__.columns)
            )
            if result.rowcount == 0:
                raise HTTPException(status_code=500, detail="The logger could not be created")
        except IntegrityError:
            raise HTTPException(status_code=400, detail=f"A logger named '{params.name}' already exists")
        created_logger = await result.fetchone()

    return dict(created_logger)


@router.get('/logger')
async def list_loggers(displayed_only: bool = False):
    async with connect_db() as connection:
        query = sa.select([Logger])
        if displayed_only:
            query = query.where(Logger.is_displayed)
        result = await connection.execute(query)
        return [dict(row) for row in await result.fetchall()]


@router.get('/logger/{logger_id}')
async def get_logger_by_id(logger_id: int):
    async with connect_db() as connection:
        result = await connection.execute(sa.select([Logger]).where(Logger.id == logger_id))
        logger = await result.fetchone()
        if logger is None:
            raise HTTPException(status_code=404, detail=f"No logger with id {logger_id}")

    return dict(logger)


@router.put('/logger/{logger_id}')
async def update_logger(logger_id: int, params: UpdateLoggerParams):
    params_to_update = params.dict(exclude_none=True)
    if not params_to_update:
        raise HTTPException(status_code=400, detail="Nothing to update")

    async with connect_db() as connection:
        result = await connection.execute(
            sa.update(Logger).values(params_to_update).where(Logger.id == logger_id).returning(*Logger.__table__.columns)
        )
        if result.rowcount == 0:
            raise HTTPException(status_code=404, detail=f"No logger with id {logger_id}")

        logger = await result.fetchone()

    return dict(logger)


@router.post('/log')
async def insert_log(params: CreateLogParams):
    async with connect_db() as connection:
        try:
            result = await connection.execute(
                sa.insert(Log).values(params.dict()).returning(*Log.__table__.columns)
            )
            if result.rowcount == 0:
                raise HTTPException(status_code=500, detail="The log could not be created")
        except IntegrityError:
            raise HTTPException(status_code=400, detail=f"No logger with id {params.logger_id}")
        created_log = await result.fetchone()

    return dict(created_log)


@router.get('/latest')
async def get_latest_logs_per_logger():
    async with connect_db() as connection:
        result = await connection.execute(
            sa.select(
                [
                    Logger.name.label("logger_display_name"),
                    Log.timestamp.label("updatedAt"),
                    Log.temperature_c.label("temperature_celsius"),
                    Log.humidity
                ]
            )
            .distinct(Logger.id)
            .where(
                sa.and_(
                    Logger.is_displayed,
                    Log.timestamp > (sa.func.now() - timedelta(weeks=1))
                )
            )
            .order_by(Logger.id, Log.timestamp.desc())  # Ordering by ID for consistent responses
            .select_from(sa.join(Log, Logger))
        )
        return [dict(row) for row in await result.fetchall()]
