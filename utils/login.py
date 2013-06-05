import cherrypy
from base64 import urlsafe_b64decode
import json
import hashlib
import hmac

import templates as t
from utils.log import log
from config import fb_app_id
import config

def safe_access(fn):
    @cherrypy.expose
    def wrapped(*args, **kwargs):
        cherrypy.request.fb_user_id = None
        try:
            name = "fbsr_" + fb_app_id
            if name not in cherrypy.request.cookie:
                log("Cookie not present, redirecting to login.")
                return t.render("login")
            signed_request = cherrypy.request.cookie[name].value
            (encoded_sig, payload, ) = signed_request.split(".", 1)
            # Python requires base64 padding and useless convertions between
            # str and bytes.
            def b64padding(s):
                n = len(s) % 4
                if n == 0:
                    return s
                else:
                    return s + "=" * (4 - n)
            sig = urlsafe_b64decode(b64padding(encoded_sig).encode("ascii"))
            data = json.loads(urlsafe_b64decode(
                b64padding(payload).encode("ascii")
            ).decode("utf-8"))

            expected_sig = hmac.new(
                config.fb_app_secret.encode("ascii"),
                payload.encode("ascii"),
                hashlib.sha256,
            ).digest()

            if sig != expected_sig:
                log("Bad paylod signature, redirecting to login.")
                return t.render("login")

            cherrypy.request.fb_user_id = data["user_id"]

            if data["user_id"] not in config.fb_allowed_user_ids:
                log("Unauthorized user: {}", data["user_id"])
                return t.render("unauthorized")

            return fn(*args, **kwargs)
        except:
            if config.env == "production":
                return t.render("login")
            else:
                raise

    return wrapped
