import fastapi
import uvicorn
from fastapi.middleware.cors import CORSMiddleware

from api import router

api = fastapi.FastAPI()
api.include_router(router)
api.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


if __name__ == '__main__':
    uvicorn.run(api)
