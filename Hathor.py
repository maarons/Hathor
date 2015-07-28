#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import cherrypy
import datetime
import json
import time

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
            'components/TVSeries.js',
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
        seasons = Season.get_for_tv_series(objectId)
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
        return self._json(Episode.get_ready_json())

    @cherrypy.tools.allow(methods = ['GET'])
    @safe_access
    def next_episodes_json(self):
        return self._json(Episode.get_next_json())

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
        seasons = Season.get_for_tv_series(objectId)
        episodes = Episode.get_for_seasons(list(map(
            lambda s: s.objectId,
            seasons,
        )))
        for season_id in episodes:
            for episode in episodes[season_id]:
                episode.destroy()
        for season in seasons:
            season.destroy()
        tv_series.destroy()
        return self._json({'success': True})

    @cherrypy.tools.allow(methods = ['POST'])
    @safe_access
    def upload_json(self, objectId, data):
        js_data = json.loads(data)
        data = {}
        for key in js_data:
            data[int(key)] = js_data[key]
        tv_series = TVSeries.get_safe(objectId)
        old_seasons = Season.get_for_tv_series(tv_series.objectId)
        seasons = {}
        for season in old_seasons:
            if season.number not in data.keys():
                season.destroy()
            else:
                seasons[season.number] = season
        for season_number in data:
            if season_number not in seasons.keys():
                season = Season()
                season.tv_series_id = tv_series.objectId
                season.number = season_number
                season.save()
                seasons[season.number] = season
        for season in seasons.values():
            season_data = data[season.number]
            episodes = Episode.get_for_season(season.objectId)
            season_data.sort(key = lambda e: int(e['number']))
            episodes.sort(key = lambda e: e.number)
            def parse_air_date(air_date):
                if air_date is None:
                    return None
                parts = air_date.split('.')
                dt = datetime.datetime(
                    int(parts[0]),
                    int(parts[1]) if len(parts) > 1 else 0,
                    int(parts[2]) if len(parts) > 2 else 0,
                    tzinfo = datetime.timezone.utc,
                )
                return int(time.mktime(dt.timetuple()))
            def new_episode(episode_data):
                episode = Episode()
                episode.season_id = season.objectId
                episode.number = int(episode_data['number'])
                episode.title = episode_data['title']
                episode.summary = episode_data['summary']
                episode.watched = False
                episode.air_date = parse_air_date(episode_data['air_date'])
                episode.save()
            def update_episode(episode, episode_data):
                changed = False
                if episode.title != episode_data['title']:
                    episode.title = episode_data['title']
                    changed = True
                if episode.summary != episode_data['summary']:
                    episode.summary = episode_data['summary']
                    changed = True
                if episode.air_date != parse_air_date(episode_data['air_date']):
                    episode.air_date = parse_air_date(episode_data['air_date'])
                    changed = True
                if changed:
                    episode.save()
            a = 0
            b = 0
            while a < len(season_data) or b < len(episodes):
                if a == len(season_data):
                    episodes[b].destroy()
                    b += 1
                elif b == len(episodes):
                    new_episode(season_data[a])
                    a += 1
                elif int(season_data[a]['number']) == episodes[b].number:
                    update_episode(episodes[b], season_data[a])
                    a += 1
                    b += 1
                elif int(season_data[a]['number']) < episodes[b].number:
                    new_episode(season_data[a])
                    a += 1
                else:
                    episodes[b].destroy()
                    b += 1

        return self._json({'success': True})

if __name__ == '__main__':
    def parse_init():
        PressUI.cherrypy.Parse.init(
            PressConfig.get('parse_app_id'),
            PressConfig.get('parse_rest_key'),
        )
    quickstart(Hathor, 'hathor', parse_init)
