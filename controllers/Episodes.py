from utils.login import safe_access
import templates as t
import model
import json
import cherrypy

from utils.redirect import perform_redirect
import utils.cache

class Episodes():
    @safe_access
    def watch(self, id):
        cherrypy.response.headers["Content-Type"] = "application/json"
        episode = model.Episode.get(id)
        episode.watch()
        return json.dumps(True).encode("utf-8")

    @safe_access
    def unwatch(self, id):
        cherrypy.response.headers["Content-Type"] = "application/json"
        episode = model.Episode.get(id)
        episode.unwatch()
        return json.dumps(True).encode("utf-8")

    @safe_access
    def ready_and_next(self):
        cherrypy.response.headers["Content-Type"] = "application/json"
        ready_episodes = model.Episode.ready()
        next_episodes = model.Episode.next()
        html = t.render(
            "episodes/ready_and_next",
            ready_episodes = ready_episodes,
            next_episodes = next_episodes,
        )
        return json.dumps(html.decode("utf-8")).encode("utf-8")

    @safe_access
    def amazon_link(self, id):
        cherrypy.response.headers["Content-Type"] = "application/json"

        cached = utils.cache.get("amazon_link:" + id)
        if cached is not None:
            return cached

        episode = model.Episode.get(id)
        a_episode = episode.amazon_episode()
        ret = {"error": a_episode is None}
        if a_episode is not None:
            ret["html"] = t.render(
                "episodes/amazon_link",
                a_episode = a_episode,
            ).decode("utf-8")
        response = json.dumps(ret).encode("utf-8")

        utils.cache.put("amazon_link:" + id, response)

        return response
