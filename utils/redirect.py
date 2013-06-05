import cherrypy

def perform_redirect(url, *args, **kwargs):
    raise cherrypy.HTTPRedirect(url.format(*args, **kwargs))
