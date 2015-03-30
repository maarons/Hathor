from PressUI.cherrypy.Parse import ParseObjFB
from model.Episode import Episode

class Season(ParseObjFB):
    def __init__(self, **kwargs):
        ParseObjFB.__init__(
            self,
            {
                'tv_series_id': {'type': str},
                'number': {'type': int},
            },
            kwargs,
        )

    @staticmethod
    def gen_for_tv_series(tv_series_id):
        return (
            Season.query_safe().equal_to('tv_series_id', tv_series_id)
            .ascending('number').gen_find()
        )

    @staticmethod
    def get_for_episodes(episodes):
        season_ids = set([])
        for episode in episodes:
            season_ids.add(episode.season_id)
        return (
            Season.query_safe().contained_in('objectId', list(season_ids))
            .find()
        )

    def __updateWatched(self, watched):
        episodes = Episode.get_for_seasons([self.objectId])
        promises = []
        for episode in episodes[self.objectId]:
            episode.watched = watched
            promises.append(episode.gen_save())
        for promise in promises:
            promise.prep()

    def watch(self):
        self.__updateWatched(True)

    def unwatch(self):
        self.__updateWatched(False)
