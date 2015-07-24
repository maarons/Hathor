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
            'components/NextEpisodes.js',
            'components/Season.js',
            'components/ReadyEpisodes.js',
            'components/TVSeriesEdit.js',
            'controller/edit.js',
            'controller/index.js',
            'controller/login.js',
            'controller/new.js',
            'controller/tvseries.js',
            'controller/uri_map.js',
            'lib/Util.js',
            'lib/WikipediaLib.js',
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

    def __with_seasons_and_tv_series(self, episodes):
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

    @cherrypy.tools.allow(methods = ['GET'])
    @safe_access
    def ready_episodes_json(self):
        episodes = Episode.get_ready()
        return self.__with_seasons_and_tv_series(episodes)

    @cherrypy.tools.allow(methods = ['GET'])
    @safe_access
    def next_episodes_json(self):
        episodes = Episode.get_next()
        return self.__with_seasons_and_tv_series(episodes)

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

    @cherrypy.tools.allow(methods = ['POST'])
    @safe_access
    def save_json(
        self,
        title,
        wikipedia_article,
        objectId = None,
    ):
        if objectId is not None:
            tv_series = TVSeries.get_safe(objectId)
        else:
            tv_series = TVSeries()
        tv_series.title = title.strip()
        tv_series.wikipedia_article = wikipedia_article.strip()
        ret = {'success': True, 'title': title}
        try:
            tv_series.save()
            ret['objectId'] = tv_series.objectId
        except Exception as e:
            ret = {'success': False}
        return self._json(ret)

    @cherrypy.tools.allow(methods = ['GET'])
    @safe_access
    def get_json(self, objectId):
        return self._json(TVSeries.get_safe(objectId).to_json())

    @cherrypy.tools.allow(methods = ['POST'])
    @safe_access
    def delete_json(self, objectId):
        tv_series = TVSeries.get_safe(objectId)
        tv_series.destroy()
        return self._json({'success': True})

if __name__ == '__main__':
    def parse_init():
        PressUI.cherrypy.Parse.init(
            PressConfig.get('parse_app_id'),
            PressConfig.get('parse_rest_key'),
        )
    quickstart(Hathor, 'hathor', parse_init)
