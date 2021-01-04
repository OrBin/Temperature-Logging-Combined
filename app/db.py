import os
from contextlib import asynccontextmanager
from typing import AsyncIterator
from aiopg.sa import create_engine, SAConnection


@asynccontextmanager
async def connect_db() -> AsyncIterator[SAConnection]:
    db_string = os.environ["DB_CONNECTION_STRING"]
    async with create_engine(db_string) as engine:
        async with engine.acquire() as connection:
            yield connection

async def init_db():
    with open("init_db.sql", "r") as f:
        sql_script = f.read()
    async with connect_db() as connection:
        await connection.execute(sql_script)
