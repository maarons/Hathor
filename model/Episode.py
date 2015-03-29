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
        queries = []
        for season_id in season_ids:
            queries.append(
                Episode.query_safe().equal_to('season_id', season_id)
            )
            episode_buckets[season_id] = []
        episodes = ParseQuery.or_(*queries).find()
        for episode in episodes:
            episode_buckets[episode.season_id].append(episode)
        return episode_buckets

    def watch(self):
        self.watched = True
        self.save()

    def unwatch(self):
        self.watched = False
        self.save()
