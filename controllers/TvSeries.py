from utils.login import safe_access
from utils.redirect import perform_redirect
import templates as t
import model
import json
import cherrypy
import urllib.parse
from utils.log import log

class TvSeries():
    @safe_access
    def index(self, id):
        tv_series = model.TvSeries.get(id)
        return t.render("tv_series/show", tv_series = tv_series)

    @safe_access
    def new(self):
        providers = model.Provider.all()
        tv_series = model.TvSeries()
        return t.render(
            "tv_series/new",
            tv_series = tv_series,
            providers = providers,
        )

    @safe_access
    def save(self, title, provider_type, provider_metadata):
        tv_series = model.TvSeries.new(title, provider_type, provider_metadata)
        perform_redirect("/tv_series/?id={}", tv_series.id)

    @safe_access
    def edit(self, id):
        tv_series = model.TvSeries.get(id)
        providers = model.Provider.all()
        return t.render(
            "tv_series/edit",
            tv_series = tv_series,
            providers = providers
        )

    @safe_access
    def update(self, id, title, provider_type, provider_metadata):
        tv_series = model.TvSeries.get(id)
        tv_series.update(title, provider_type, provider_metadata)
        perform_redirect("/tv_series/?id={}", tv_series.id)

    @safe_access
    def delete(self, id):
        tv_series = model.TvSeries.get(id)
        tv_series.delete()
        perform_redirect("/")

    @safe_access
    def fetch(self, id, _):
        cherrypy.response.headers['Content-Type'] = "application/javascript"
        tv_series = model.TvSeries.get(id)
        metadata = json.loads(tv_series.provider_metadata)
        return t.render("tv_series/fetch.js", tv_series = tv_series,
                        metadata = metadata);

    @safe_access
    @cherrypy.tools.allow(methods=['POST'])
    def update_episodes_info(self, id, data):
        cherrypy.response.headers['Content-Type'] = "application/json"
        try:
            tv_series = model.TvSeries.get(id)
            tv_series.update_episodes_info(json.loads(data))
            return json.dumps(True).encode("utf-8")
        except Exception as e:
            log("Failed to update episodes info for {}:\n{}", id, str(e))
            return json.dumps(False).encode("utf-8")

    @safe_access
    def list_ids(self, _):
        cherrypy.response.headers['Content-Type'] = "application/json"
        ids = [t.id for t in model.TvSeries.all()]
        return json.dumps(ids).encode("utf-8")
