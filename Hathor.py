#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import cherrypy
from cherrypy.process.plugins import PIDFile
import os

from  controllers import Hathor
import config

cherrypy.config.update({
    "server.socket_host": "127.0.0.1",
    "server.socket_port": config.port,
    "tools.gzip.on": True,
})

if config.env == "production":
    cherrypy.config.update({
        "environment": "production",
        "tools.proxy.on": True
    })
    PIDFile(cherrypy.engine, "/tmp/hathor.pid").subscribe()

conf = {}
static_dirs = [
    "static/style",
    "static/script",
    "static/script/wikipedia",
]
for d in static_dirs:
    p = os.path.abspath(d)
    for f in os.listdir(d):
        conf["/{0}/{1}".format(d, f)] = {
            "tools.staticfile.on": True,
            "tools.staticfile.filename": "{0}/{1}".format(p, f),
            "tools.staticfile.content_types": {
                "css": "text/css",
                "js": "application/javascript"
            }
        }

cherrypy.quickstart(Hathor(), config = conf)
