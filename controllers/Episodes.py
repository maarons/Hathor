from utils.login import safe_access
import templates as t
import model
import json

class Episodes():
    @safe_access
    def watch(self, id):
        episode = model.Episode.get(id)
        episode.watch()
        return json.dumps(True)

    @safe_access
    def unwatch(self, id):
        episode = model.Episode.get(id)
        episode.unwatch()
        return json.dumps(True)

    @safe_access
    def ready_and_next(self):
        ready_episodes = model.Episode.ready()
        next_episodes = model.Episode.next()
        html = t.render(
            "episodes/ready_and_next",
            ready_episodes = ready_episodes,
            next_episodes = next_episodes,
        )
        return json.dumps(html.decode("utf-8"))
