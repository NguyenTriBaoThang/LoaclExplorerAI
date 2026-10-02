import base64
import hashlib
import hmac
import json
import secrets
import time

from app.core.config import settings

_development_key = secrets.token_bytes(48)


class AuthNotConfigured(Exception):
    pass


def _key() -> bytes:
    if settings.auth_secret and len(settings.auth_secret) >= 32:
        return settings.auth_secret.encode("utf-8")
    if settings.app_env.lower() in {"development", "test"}:
        return _development_key
    raise AuthNotConfigured("Set AUTH_SECRET to a random value of at least 32 characters.")


def _b64(value: bytes) -> str:
    return base64.urlsafe_b64encode(value).rstrip(b"=").decode("ascii")


def _unb64(value: str) -> bytes:
    return base64.urlsafe_b64decode(value + "=" * (-len(value) % 4))


def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    digest = hashlib.scrypt(password.encode("utf-8"), salt=salt, n=2**14, r=8, p=1, dklen=64)
    return f"scrypt$16384$8$1${_b64(salt)}${_b64(digest)}"


def verify_password(password: str, encoded: str | None) -> bool:
    if not encoded:
        return False
    try:
        algorithm, n, r, p, salt, expected = encoded.split("$")
        if algorithm != "scrypt":
            return False
        actual = hashlib.scrypt(
            password.encode("utf-8"), salt=_unb64(salt),
            n=int(n), r=int(r), p=int(p), dklen=64,
        )
        return hmac.compare_digest(actual, _unb64(expected))
    except (ValueError, TypeError):
        return False


def create_session_token(user_id: str) -> str:
    now = int(time.time())
    header = _b64(json.dumps({"alg": "HS256", "typ": "JWT"}, separators=(",", ":")).encode())
    payload = _b64(json.dumps({
        "sub": user_id, "iat": now, "exp": now + settings.session_ttl_seconds,
        "iss": "local-explorer-ai",
    }, separators=(",", ":")).encode())
    unsigned = f"{header}.{payload}"
    signature = hmac.new(_key(), unsigned.encode("ascii"), hashlib.sha256).digest()
    return f"{unsigned}.{_b64(signature)}"


def decode_session_token(token: str) -> str:
    try:
        header, payload, signature = token.split(".")
        unsigned = f"{header}.{payload}"
        expected = hmac.new(_key(), unsigned.encode("ascii"), hashlib.sha256).digest()
        if not hmac.compare_digest(expected, _unb64(signature)):
            raise ValueError("invalid signature")
        claims = json.loads(_unb64(payload))
        if claims.get("iss") != "local-explorer-ai" or int(claims.get("exp", 0)) <= int(time.time()):
            raise ValueError("expired token")
        subject = claims.get("sub")
        if not isinstance(subject, str) or not subject:
            raise ValueError("missing subject")
        return subject
    except AuthNotConfigured:
        raise
    except Exception as error:
        raise ValueError("invalid session token") from error
