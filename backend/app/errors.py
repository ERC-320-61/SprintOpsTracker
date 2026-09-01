from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse


class APIError(Exception):
    """An error returned to the client in the frozen `{"error": {...}}` envelope."""

    def __init__(self, status_code: int, code: str, message: str) -> None:
        self.status_code = status_code
        self.code = code
        self.message = message


def _envelope(code: str, message: str, **extra: object) -> dict:
    return {"error": {"code": code, "message": message, **extra}}


async def _api_error_handler(_: Request, exc: APIError) -> JSONResponse:
    return JSONResponse(
        _envelope(exc.code, exc.message), status_code=exc.status_code
    )


async def _validation_error_handler(
    _: Request, exc: RequestValidationError
) -> JSONResponse:
    fields = [
        {"loc": ".".join(str(p) for p in err["loc"]), "msg": err["msg"]}
        for err in exc.errors()
    ]
    return JSONResponse(
        _envelope("validation_error", "Request validation failed.", fields=fields),
        status_code=422,
    )


def register_error_handlers(app: FastAPI) -> None:
    app.add_exception_handler(APIError, _api_error_handler)
    app.add_exception_handler(RequestValidationError, _validation_error_handler)
