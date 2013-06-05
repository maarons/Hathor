import cherrypy
from sqlalchemy import Sequence, Column, UniqueConstraint
from sqlalchemy import Integer
from datetime import datetime

from model.Base import Base
from model.Episode import Episode
from utils.session import with_session, add_and_commit

class Season(Base):
    __tablename__ = "seasons"

    id = Column(
        Integer,
        Sequence("seasons_id_seq"),
        primary_key = True,
    )

    fb_user_id = Column(Integer, nullable = False)
    number = Column(Integer, nullable = False)
    tv_series_id = Column(Integer, nullable = False)

    __table_args__ = (
        UniqueConstraint(
            "fb_user_id",
            "tv_series_id",
            "number",
            name = "_season_unique",
        ),
    )

    # Always use this to query for Seasons to ensure fb_user_id is set.
    @staticmethod
    @with_session()
    def all_query(session = None):
        return session.query(Season).filter(
            Season.fb_user_id == cherrypy.request.fb_user_id,
        ).order_by(Season.number).order_by(Season.id)

    @staticmethod
    @with_session()
    def get(season_id, session = None):
        return Season.all_query(use_session = session).filter(
            Season.id == season_id,
        ).one()

    @staticmethod
    def new(tv_series, number):
        season = Season()
        season.tv_series_id = tv_series.id
        season.number = number
        season.fb_user_id = cherrypy.request.fb_user_id
        return add_and_commit(season)

    @with_session(commit = True)
    def delete(self, session = None):
        episodes = self.episodes(use_session = session)
        for episode in episodes:
            episode.delete(use_session = session)
        session.delete(self)

    @with_session()
    def tv_series(self, session = None):
        from model import TvSeries
        return TvSeries.get(self.tv_series_id, use_session = session)

    @with_session()
    def episodes(self, session = None):
        return Episode.all_query(use_session = session).filter(
            Episode.season_id == self.id,
        ).all()

    def update_episodes_info(self, data):
        current_episodes = {}
        for episode in self.episodes():
            current_episodes[episode.number] = episode

        updated_episodes = {}
        for episode in data:
            for episode_number in episode["number"].split("/"):
                updated_episodes[int(episode_number)] = episode

        for episode_number in updated_episodes:
            episode = updated_episodes[episode_number]
            air_date = datetime.strptime(
                episode["air_date"],
                "%Y.%m.%d",
            ).date()
            if episode_number not in current_episodes:
                current_episodes[episode_number] = Episode.new(
                    self,
                    episode_number,
                    episode["title"] or "",
                    air_date,
                    episode["summary"],
                )
            else:
                current_episodes[episode_number].update(
                    episode["title"] or "",
                    air_date,
                    episode["summary"],
                )

        for episode_number in current_episodes:
            if episode_number not in updated_episodes:
                current_episodes[episode_number].delete()
