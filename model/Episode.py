import cherrypy
from sqlalchemy import Sequence, Column, UniqueConstraint
from sqlalchemy import Integer, String, Date, Boolean
from sqlalchemy import and_
from datetime import date

from model.Base import Base
from utils.session import with_session, add_and_commit

class Episode(Base):
    __tablename__ = "episodes"

    id = Column(
        Integer,
        Sequence("episodes_id_seq"),
        primary_key = True,
    )

    fb_user_id = Column(Integer, nullable = False)
    number = Column(Integer, nullable = False)
    title = Column(String, nullable = False)
    watched = Column(Boolean, nullable = False)
    air_date = Column(Date, nullable = False)
    summary = Column(String)
    season_id = Column(Integer, nullable = False)

    __table_args__ = (
        UniqueConstraint(
            "fb_user_id",
            "season_id",
            "number",
            name = "_episode_unique",
        ),
    )

    # Always use this to query for Episodes to ensure fb_user_id is set.
    @staticmethod
    @with_session()
    def all_query(no_order = False, session = None):
        query = session.query(Episode).filter(
            Episode.fb_user_id == cherrypy.request.fb_user_id,
        )
        if not no_order:
            query = query.order_by(Episode.number).order_by(Episode.id)
        return query

    @staticmethod
    @with_session()
    def get(episode_id, session = None):
        return Episode.all_query(use_session = session).filter(
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
        return add_and_commit(episode)

    @with_session(commit = True)
    def delete(self, session = None):
        session.delete(self)

    def update(self, title, air_date, summary = None):
        if self.title != title or self.air_date != air_date or \
                self.summary != summary:
            self.title = title
            self.air_date = air_date
            self.summary = summary
            return add_and_commit(self)
        else:
            return self

    @with_session()
    def season(self, session = None):
        from model import Season
        return Season.get(self.season_id, use_session = session)

    @with_session()
    def tv_series(self, session = None):
        return self.season(use_session = session).tv_series()

    # Returns all ready episodes (one per TV series).
    @staticmethod
    @with_session()
    def ready(session = None):
        def date_filter(query):
            return query.filter(and_(
                Episode.air_date <= date.today(),
                Episode.watched == False,
            ))
        return Episode.__ready_or_next(date_filter, use_session = session)

    # Returns all episodes that will air in the future (one per TV series).
    @staticmethod
    @with_session()
    def next(session = None):
        def date_filter(query):
            return query.filter(Episode.air_date > date.today())
        return Episode.__ready_or_next(date_filter, use_session = session)

    @staticmethod
    @with_session()
    def __ready_or_next(date_filter, session = None):
        query = Episode.all_query(no_order = True, use_session = session)
        all_episodes = date_filter(query).order_by(
            Episode.air_date,
        ).order_by(
            Episode.number,
        ).order_by(
            Episode.id,
        ).all()
        episodes = {}
        for episode in all_episodes:
            season = episode.season(use_session = session)
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
        return self.air_date.strftime("%m/%d/%Y")

    def available(self):
        return self.air_date <= date.today()

    def watch(self):
        if self.available():
            self.watched = True
            add_and_commit(self)

    def unwatch(self):
        self.watched = False
        add_and_commit(self)

    def season_and_number(self):
        return "S{}E{}".format(self.season().number, str(self.number).zfill(2))
