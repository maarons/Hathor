import cherrypy
from base64 import urlsafe_b64decode
import json
import hashlib
import hmac

import python_apis_maarons.FB.login as FBlogin

import templates as t
from utils.log import log
import config
import utils.session

def safe_access(fn):
    @cherrypy.expose
    def wrapped(*args, **kwargs):
        try:
            try:
                FBlogin.cherrypy_authenticate(
                    config.fb_app_id,
                    config.fb_app_secret,
                )
            except FBlogin.LoginException as e:
                log(str(e))
                return t.render("login")

            if cherrypy.request.fb_user_id not in config.fb_allowed_user_ids:
                log("Unauthorized user: {}", cherrypy.request.fb_user_id)
                return t.render("unauthorized")

            cherrypy.request.session = utils.session.Session()

            try:
                ret = fn(*args, **kwargs)
                cherrypy.request.session.close()
                return ret
            except Exception as e:
                cherrypy.request.session.close()
                raise e
        except cherrypy.HTTPRedirect:
            raise
        except:
            if config.env == "production":
                return t.render("login")
            else:
                raise

    return wrapped
