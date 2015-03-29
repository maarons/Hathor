from PressUI.cherrypy.Parse import ParseObjFB

class TVSeries(ParseObjFB):
    def __init__(self, **kwargs):
        ParseObjFB.__init__(
            self,
            {
                'title': {'type': str},
            },
            kwargs,
        )

    @staticmethod
    def all():
        return TVSeries.query_safe().ascending('title').find()
