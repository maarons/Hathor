import cherrypy
from sqlalchemy import Sequence, Column, UniqueConstraint, ForeignKey
from sqlalchemy.dialects.postgresql import INTEGER, BOOLEAN, TEXT
from sqlalchemy.types import DateTime
from sqlalchemy import and_

from model.Base import Base
import utils.time

class Episode(Base):
    __tablename__ = "episodes"

    id = Column(
        INTEGER,
        Sequence("episodes_id_seq"),
        primary_key = True,
    )

    number = Column(INTEGER, nullable = False)
    title = Column(TEXT, nullable = False)
    watched = Column(BOOLEAN, nullable = False)
    air_date = Column(DateTime(True), nullable = False)
    summary = Column(TEXT)
    season_id = Column(INTEGER, ForeignKey("seasons.id"), nullable = False)

    __table_args__ = (
        UniqueConstraint(
            "season_id",
            "number",
            name = "_episode_unique",
        ),
    )

    @staticmethod
    def get(episode_id):
        return cherrypy.request.session.query(Episode).filter(
            Episode.id == episode_id,
        ).one()

    @staticmethod
    def new(season, number, title, air_date, summary = None):
        episode = Episode()
        episode.season_id = season.id
        episode.number = number
        episode.watched = False
        episode.title = title
        episode.air_date = air_date
        episode.summary = summary
        episode.fb_user_id = cherrypy.request.fb_user_id
        cherrypy.request.session.add(episode)
        cherrypy.request.session.commit()
        return episode

    def delete(self):
        cherrypy.request.session.delete(self)
        cherrypy.request.session.commit()

    def update(self, title, air_date, summary = None):
        if self.title != title or self.air_date != air_date or \
                self.summary != summary:
            self.title = title
            self.air_date = air_date
            self.summary = summary
            cherrypy.request.session.add(self)
            cherrypy.request.session.commit()

    # Returns all ready episodes (one per TV series).
    @staticmethod
    def ready():
        now = utils.time.now()
        def date_filter(query):
            return query.filter(and_(
                Episode.air_date <= now,
                Episode.watched == False,
            ))
        return Episode.__ready_or_next(date_filter)

    # Returns all episodes that will air in the future (one per TV series).
    @staticmethod
    def next():
        now = utils.time.now()
        def date_filter(query):
            return query.filter(Episode.air_date > now)
        return Episode.__ready_or_next(date_filter)

    @staticmethod
    def __ready_or_next(date_filter):
        query = cherrypy.request.session.query(Episode)
        all_episodes = date_filter(query).order_by(
            Episode.air_date,
        ).order_by(
            Episode.number,
        ).order_by(
            Episode.id,
        ).all()
        episodes = {}
        for episode in all_episodes:
            season = episode.season
            if season.tv_series_id not in episodes:
                episodes[season.tv_series_id] = []
            episodes[season.tv_series_id].append(episode)

        ret = []
        for tv_series_id in episodes:
            ret.append((
                episodes[tv_series_id][0],
                len(episodes[tv_series_id]) - 1,
            ))
        return ret

    def get_air_date(self):
        return utils.time.to_string(self.air_date)

    def available(self):
        return self.air_date <= utils.time.now()

    def watch(self):
        if self.available():
            self.watched = True
            cherrypy.request.session.add(self)
            cherrypy.request.session.commit()

    def unwatch(self):
        self.watched = False
        cherrypy.request.session.add(self)
        cherrypy.request.session.commit()

    def season_and_number(self):
        return "S{}E{}".format(self.season.number, str(self.number).zfill(2))
