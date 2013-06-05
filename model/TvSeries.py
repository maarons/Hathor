import cherrypy
from sqlalchemy import Sequence, Column
from sqlalchemy import Integer, String
from time import time

from model.Base import Base
from model.Season import Season
from utils.session import with_session, add_and_commit

class TvSeries(Base):
    __tablename__ = "tv_series"

    id = Column(
        Integer,
        Sequence("tv_series_id_seq"),
        primary_key = True,
    )

    title = Column(String, nullable = False)
    fb_user_id = Column(Integer, nullable = False)
    last_update_time = Column(Integer, nullable = False)
    provider_type = Column(Integer, nullable = False)
    provider_metadata = Column(String, nullable = False)

    def __init__(self):
        self.title = ""

    # Always use this to query for TvSeries to ensure fb_user_id is set.
    @staticmethod
    @with_session()
    def all_query(session = None):
        return session.query(TvSeries).filter(
            TvSeries.fb_user_id == cherrypy.request.fb_user_id,
        ).order_by(TvSeries.title).order_by(TvSeries.id)

    @staticmethod
    @with_session()
    def get(tv_series_id, session = None):
        return TvSeries.all_query(use_session = session).filter(
            TvSeries.id == tv_series_id,
        ).one()

    @staticmethod
    def all():
        return TvSeries.all_query().all()

    @staticmethod
    def new(title, provider_type, provider_metadata):
        tv_series = TvSeries()
        tv_series.title = title
        tv_series.fb_user_id = cherrypy.request.fb_user_id
        tv_series.provider_type = provider_type
        tv_series.provider_metadata = provider_metadata
        tv_series.last_update_time = int(time())
        return add_and_commit(tv_series)

    @with_session(commit = True)
    def delete(self, session = None):
        seasons = self.seasons(use_session = session)
        for season in seasons:
            season.delete(use_session = session)
        session.delete(self)

    def update(self, title, provider_type, provider_metadata):
        self.title = title
        self.provider_type = provider_type
        self.provider_metadata = provider_metadata
        self.last_update_time = int(time())
        return add_and_commit(self)

    @with_session()
    def seasons(self, session = None):
        return Season.all_query(use_session = session).filter(
            Season.tv_series_id == self.id,
        ).all()

    def get_provider_metadata(self):
        if self.provider_metadata:
            return self.provider_metadata
        else:
            return ""

    def update_episodes_info(self, data):
        current_seasons = {}
        for season in self.seasons():
            current_seasons[season.number] = season

        for season_number in data:
            season_number = int(season_number)
            if season_number not in current_seasons:
                current_seasons[season_number] = Season.new(self, season_number)

        for season_number in current_seasons:
            if str(season_number) not in data:
                current_seasons[season_number].delete()

        for season_number in data:
            current_seasons[int(season_number)].update_episodes_info(
                data[season_number]
            )
