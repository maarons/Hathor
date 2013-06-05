import cherrypy

from utils.login import safe_access
import templates as t
import model
import controllers

class Hathor():
    @safe_access
    def index(self):
        tv_series = model.TvSeries.all()
        ready_episodes = model.Episode.ready()
        next_episodes = model.Episode.next()
        return t.render(
            "index",
            tv_series = tv_series,
            ready_episodes = ready_episodes,
            next_episodes = next_episodes,
        )

    # For FB SDK.
    @cherrypy.expose
    def channel(self):
        cherrypy.request.fb_user_id = None
        # TODO add cache
        return t.render("channel")

    tv_series = controllers.TvSeries()
    seasons = controllers.Seasons()
    episodes = controllers.Episodes()
