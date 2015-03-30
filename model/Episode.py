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
                'summary': {'type': str},
                'watched': {'type': bool},
                'air_date': {'type': int},
            },
            kwargs,
        )

    @staticmethod
    def get_for_seasons(season_ids):
        if len(season_ids) == 0:
            return {}
        episode_buckets = {}
        for season_id in season_ids:
            episode_buckets[season_id] = []
        episodes = (
            Episode.query_safe().contained_in('season_id', season_ids).find()
        )
        for episode in episodes:
            episode_buckets[episode.season_id].append(episode)
        return episode_buckets

    @staticmethod
    def get_ready():
        return (
            Episode.query_safe().equal_to('watched', False)
            .less_than('air_date', time()).find()
        )

    def watch(self):
        self.watched = True
        self.save()

    def unwatch(self):
        self.watched = False
        self.save()
