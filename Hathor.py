#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import cherrypy

from PressUI.API.FB.login import safe_access
from PressUI.cherrypy.PressApp import PressApp
from PressUI.cherrypy.PressConfig import PressConfig
from PressUI.cherrypy.server import quickstart
from model.TVSeries import TVSeries
from model.Season import Season
from model.Episode import Episode
import PressUI.cherrypy.Parse

class Hathor(PressApp):
    def _js_sources(self):
        return [
            'components/Episode.js',
            'components/Season.js',
            'components/ReadyEpisodes.js',
            'controller/index.js',
            'controller/login.js',
            'controller/tvseries.js',
            'controller/uri_map.js',
        ]

    @cherrypy.tools.allow(methods = ['GET'])
    @safe_access
    def all_tv_series_json(self):
        tv_series = TVSeries.all()
        return self._json(list(map(lambda t: t.to_json(), tv_series)))

    @cherrypy.tools.allow(methods = ['GET'])
    @safe_access
    def tv_series_json(self, objectId):
        tv_series_p = TVSeries.gen(objectId)
        seasons_p = Season.gen_for_tv_series(objectId)
        seasons = seasons_p.prep()
        episodes = Episode.get_for_seasons(
            list(map(lambda s: s.objectId, seasons))
        )
        for season_id in episodes:
            episodes[season_id] = list(map(
                lambda e: e.to_json(),
                episodes[season_id],
            ))
        return self._json({
            'tv_series': tv_series_p.prep().to_json(),
            'seasons': list(map(lambda s: s.to_json(), seasons)),
            'episodes': episodes,
        })

    @cherrypy.tools.allow(methods = ['GET'])
    @safe_access
    def ready_episodes_json(self):
        episodes = Episode.get_ready()
        seasons = Season.get_for_episodes(episodes)
        tv_series = TVSeries.get_for_seasons(seasons)
        def process(elements):
            data = {}
            for element in elements:
                data[element.objectId] = element.to_json()
            return data
        return self._json({
            'episodes': process(episodes),
            'seasons': process(seasons),
            'tv_series': process(tv_series),
        })

    @cherrypy.tools.allow(methods = ['POST'])
    @safe_access
    def watch_episode(self, objectId, watched):
        episode = Episode.get(objectId)
        try:
            if watched == 'true':
                episode.watch()
            else:
                episode.unwatch()
            return self._json({'success': True})
        except:
            return self._json({'success': False})

    @cherrypy.tools.allow(methods = ['POST'])
    @safe_access
    def watch_season(self, objectId, watched):
        season = Season.get(objectId)
        try:
            if watched == 'true':
                season.watch()
            else:
                season.unwatch()
            return self._json({'success': True})
        except:
            return self._json({'success': False})

if __name__ == '__main__':
    def parse_init():
        PressUI.cherrypy.Parse.init(
            PressConfig.get('parse_app_id'),
            PressConfig.get('parse_rest_key'),
        )
    quickstart(Hathor, 'hathor', parse_init)
