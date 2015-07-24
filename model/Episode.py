from time import time

from PressUI.cherrypy.Parse import ParseObjFB
from PressUI.cherrypy.Parse import ParseQuery

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
    def get_ready():
        return (
            Episode.query_safe().equal_to('watched', False)
            .less_than('air_date', time()).find()
        )

    @staticmethod
    def get_next():
        episodes = Episode.query_safe().greater_than('air_date', time()).find()
        next_episodes = {}
        for episode in episodes:
            if (
                episode.season_id not in next_episodes or
                next_episodes[episode.season_id].air_date >
                episode.air_date
            ):
                next_episodes[episode.season_id] = episode
        return next_episodes.values()

    def watch(self):
        self.watched = True
        self.save()

    def unwatch(self):
        self.watched = False
        self.save()
