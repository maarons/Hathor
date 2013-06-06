from utils.login import safe_access
import model
import json
from utils.redirect import perform_redirect

class Seasons():
    @safe_access
    def watch(self, id):
        season = model.Season.get(id)
        for episode in season.episodes:
            episode.watch()
        perform_redirect(
            "/tv_series/?id={}#season-{}",
            season.tv_series_id,
            season.id,
        )
