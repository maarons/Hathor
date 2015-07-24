from PressUI.cherrypy.Parse import ParseObjFB

class TVSeries(ParseObjFB):
    def __init__(self, **kwargs):
        ParseObjFB.__init__(
            self,
            {
                'title': {'type': str},
                'wikipedia_article': {'type': str}
            },
            kwargs,
        )

    @staticmethod
    def all():
        return TVSeries.query_safe().ascending('title').find()

    @staticmethod
    def get_for_seasons(seasons):
        tv_series_ids = set([])
        for season in seasons:
            tv_series_ids.add(season.tv_series_id)
        return (
            TVSeries.query_safe().contained_in('objectId', list(tv_series_ids))
            .find()
        )
