class Provider():
    def __init__(self, kwargs):
        self.type = kwargs["type"]
        self.name = kwargs["name"]

    @staticmethod
    def all():
        return map(Provider, [
            { "type": 1, "name": "Wikipedia" },
        ])
