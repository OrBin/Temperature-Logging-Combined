import fastapi
import uvicorn
from fastapi.middleware.cors import CORSMiddleware

from api import router

app = fastapi.FastAPI()
app.include_router(router)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


if __name__ == '__main__':
    uvicorn.run(app)
