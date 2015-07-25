from time import time

from PressUI.cherrypy.Parse import ParseObjFB
from PressUI.cherrypy.Parse import ParseQuery

from model.TVSeries import TVSeries

class Episode(ParseObjFB):
    def __init__(self, **kwargs):
        ParseObjFB.__init__(
            self,
            {
                'season_id': {'type': str},
                'number': {'type': int},
                'title': {'type': str},
                'summary': {'type': str, 'nullable': True},
                'watched': {'type': bool},
                'air_date': {'type': int, 'nullable': True},
            },
            kwargs,
        )

    @staticmethod
    def get_for_seasons(season_ids):
        if len(season_ids) == 0:
            return {}
        episodes_p = {}
        for season_id in season_ids:
            episodes_p[season_id] = Episode.gen_for_season(season_id)
        episode_buckets = {}
        for season_id in season_ids:
            episode_buckets[season_id] = episodes_p[season_id].prep()
        return episode_buckets

    @staticmethod
    def get_for_season(season_id):
        return Episode.gen_for_season(season_id).prep()

    @staticmethod
    def gen_for_season(season_id):
        return (
            Episode.query_safe().equal_to('season_id', season_id)
            .ascending('number').gen_find()
        )

    @staticmethod
    def get_ready_or_next_json(ready = False, next = False):
        assert ready or next, 'Both ready and next are False'
        assert not (ready and next), 'Both ready and next are True'
        from model.Season import Season
        tv_series_list = TVSeries.query_safe().find()
        tv_series_list = dict((t.objectId, t) for t in tv_series_list)
        seasons_list_p = []
        for tv_series in tv_series_list.values():
            seasons_list_p.append(Season.gen_for_tv_series(tv_series.objectId))
        ready_or_next_episodes_p = []
        seasons_list = {}
        for seasons_p in seasons_list_p:
            seasons = seasons_p.prep()
            for season in seasons:
                seasons_list[season.objectId] = season
            query = (
                Episode.query_safe()
                .contained_in(
                    'season_id',
                    list(map(lambda s: s.objectId, seasons)),
                )
                .equal_to('watched', False).ascending('air_date')
                .limit(11 if ready else 1)
            )
            if ready:
                query = query.less_than('air_date', time())
            else:
                query = query.greater_than('air_date', time())
            ready_or_next_episodes_p.append(query.gen_find())
        ready_or_next_episodes = {}
        for episodes_p in ready_or_next_episodes_p:
            for episode in episodes_p.prep():
                ready_or_next_episodes[episode.objectId] = episode.to_json()
        ret = {
            'episodes': ready_or_next_episodes,
            'seasons': {},
            'tv_series': {},
        }
        for episode in ready_or_next_episodes.values():
            season = seasons_list[episode['season_id']]
            tv_series = tv_series_list[season.tv_series_id]
            ret['seasons'][season.objectId] = season.to_json()
            ret['tv_series'][tv_series.objectId] = tv_series.to_json()
        return ret

    @staticmethod
    def get_ready_json():
        return Episode.get_ready_or_next_json(ready = True)

    @staticmethod
    def get_next_json():
        return Episode.get_ready_or_next_json(next = True)

    def watch(self):
        self.watched = True
        self.save()

    def unwatch(self):
        self.watched = False
        self.save()
