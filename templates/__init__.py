import cherrypy
from jinja2 import Environment, FileSystemLoader
env = Environment(loader = FileSystemLoader("templates"))
env.autoescape = True

from config import fb_app_id

def render(tmpl, **kwargs):
    for ext in ['.js']:
        if not tmpl.endswith(ext):
            tmpl = tmpl + ".html"
    t = env.get_template(tmpl)
    hostname = cherrypy.request.base
    return t.render(
        fb_app_id = fb_app_id,
        fb_user_id = cherrypy.request.fb_user_id,
        hostname = hostname,
        **kwargs
    ).encode("utf-8")
