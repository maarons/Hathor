import cherrypy
from sqlalchemy import Sequence, Column
from sqlalchemy.dialects.postgresql import BIGINT, TEXT, INTEGER
from sqlalchemy.types import DateTime
from sqlalchemy.orm import relationship, backref

from model.Base import Base
from model.Season import Season
import utils.time

class TvSeries(Base):
    __tablename__ = "tv_series"

    id = Column(
        INTEGER,
        Sequence("tv_series_id_seq"),
        primary_key = True,
    )

    title = Column(TEXT, nullable = False)
    fb_user_id = Column(BIGINT, nullable = False)
    last_update_time = Column(DateTime(True), nullable = False)
    provider_type = Column(INTEGER, nullable = False)
    provider_metadata = Column(TEXT, nullable = False)

    seasons = relationship(
        "Season",
        cascade = "delete",
        single_parent = True,
        order_by = "Season.number",
        backref = backref("tv_series"),
    )

    def __init__(self):
        self.title = ""

    # Always use this to query for TvSeries to ensure fb_user_id is set.
    @staticmethod
    def all_query():
        return cherrypy.request.session.query(TvSeries).filter(
            TvSeries.fb_user_id == cherrypy.request.fb_user_id,
        ).order_by(TvSeries.title).order_by(TvSeries.id)

    @staticmethod
    def get(tv_series_id):
        return TvSeries.all_query().filter(TvSeries.id == tv_series_id).one()

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
        tv_series.last_update_time = utils.time.now()
        cherrypy.request.session.add(tv_series)
        cherrypy.request.session.commit()
        return tv_series

    def delete(self):
        cherrypy.request.session.delete(self)
        cherrypy.request.session.commit()

    def update(self, title, provider_type, provider_metadata):
        self.title = title
        self.provider_type = provider_type
        self.provider_metadata = provider_metadata
        self.last_update_time = utils.time.now()
        cherrypy.request.session.add(self)
        cherrypy.request.session.commit()

    def get_provider_metadata(self):
        if self.provider_metadata:
            return self.provider_metadata
        else:
            return ""

    def update_episodes_info(self, data):
        current_seasons = {}
        for season in self.seasons:
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
