from uuid import uuid4

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.api.routes import admin, ai, auth, catalog, chat, health, planner, provider
from app.adapters.llm.provider import LLMNotConfigured, LLMProviderError
from app.core.config import settings
from app.services.prompt_service import InvalidStructuredOutput

app = FastAPI(title="Local Explorer AI API", version="0.1.0", description="Explore simulated local experiences and build feasible itineraries.", openapi_url="/openapi.json")
app.add_middleware(CORSMiddleware, allow_origins=settings.cors_origin_list, allow_credentials=True, allow_methods=["*"], allow_headers=["*"])


@app.middleware("http")
async def request_id_middleware(request: Request, call_next):
    request_id = request.headers.get("X-Request-ID") or str(uuid4())
    request.state.request_id = request_id
    response = await call_next(request)
    response.headers["X-Request-ID"] = request_id
    return response


def error_response(request: Request, code: str, message: str, details: list | None = None, status_code: int = 400):
    return JSONResponse(status_code=status_code, content={"error": {"code": code, "message": message, "details": details or [], "request_id": getattr(request.state, "request_id", str(uuid4()))}})


@app.exception_handler(StarletteHTTPException)
async def http_error_handler(request: Request, exc: StarletteHTTPException):
    detail = exc.detail if isinstance(exc.detail, dict) else {}
    return error_response(request, detail.get("code", "HTTP_ERROR"), detail.get("message", str(exc.detail)), status_code=exc.status_code)


@app.exception_handler(RequestValidationError)
async def validation_error_handler(request: Request, exc: RequestValidationError):
    details = [{"field": ".".join(str(part) for part in error["loc"]), "message": error["msg"]} for error in exc.errors()]
    return error_response(request, "VALIDATION_ERROR", "Request validation failed.", details, 422)


@app.exception_handler(LLMNotConfigured)
async def llm_not_configured_handler(request: Request, exc: LLMNotConfigured):
    return error_response(request, "LLM_NOT_CONFIGURED", str(exc), status_code=503)


@app.exception_handler(LLMProviderError)
async def llm_provider_error_handler(request: Request, exc: LLMProviderError):
    return error_response(request, "LLM_PROVIDER_ERROR", str(exc), status_code=502)


@app.exception_handler(InvalidStructuredOutput)
async def invalid_output_handler(request: Request, exc: InvalidStructuredOutput):
    return error_response(request, "INVALID_MODEL_OUTPUT", str(exc), status_code=502)


@app.get("/")
def root():
    return {"name": "Local Explorer AI API", "docs": "/docs", "data_mode": "simulated"}


app.include_router(health.router)
app.include_router(auth.router)
app.include_router(provider.router)
app.include_router(admin.router)
app.include_router(catalog.router)
app.include_router(planner.router)
app.include_router(chat.router)
app.include_router(ai.router)
