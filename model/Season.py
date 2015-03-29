from PressUI.cherrypy.Parse import ParseObjFB

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
