#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from PressUI.cherrypy.PressApp import PressApp
from PressUI.cherrypy.PressConfig import PressConfig
from PressUI.cherrypy.server import quickstart
import PressUI.cherrypy.Parse

class Hathor(PressApp):
    def _js_sources(self):
        return [
            'controller/index.js',
            'controller/login.js',
            'controller/uri_map.js',
        ]

if __name__ == '__main__':
    def parse_init():
        PressUI.cherrypy.Parse.init(
            PressConfig.get('parse_app_id'),
            PressConfig.get('parse_rest_key'),
        )
    quickstart(Hathor, 'hathor', parse_init)
