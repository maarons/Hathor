#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import cherrypy

from PressUI.API.FB.login import safe_access
from PressUI.cherrypy.PressApp import PressApp
from PressUI.cherrypy.PressConfig import PressConfig
from PressUI.cherrypy.server import quickstart
from model.TVSeries import TVSeries
import PressUI.cherrypy.Parse

class Hathor(PressApp):
    def _js_sources(self):
        return [
            'controller/index.js',
            'controller/login.js',
            'controller/uri_map.js',
        ]

    @cherrypy.tools.allow(methods = ['GET'])
    @safe_access
    def all_tv_series_json(self):
        tv_series = TVSeries.all()
        return self._json(list(map(lambda t: t.to_json(), tv_series)))

if __name__ == '__main__':
    def parse_init():
        PressUI.cherrypy.Parse.init(
            PressConfig.get('parse_app_id'),
            PressConfig.get('parse_rest_key'),
        )
    quickstart(Hathor, 'hathor', parse_init)
