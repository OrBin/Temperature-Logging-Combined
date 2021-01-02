import fastapi
import uvicorn

from api import router

api = fastapi.FastAPI()
api.include_router(router)

if __name__ == '__main__':
    uvicorn.run(api)
