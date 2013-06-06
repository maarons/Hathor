import cherrypy
from sqlalchemy import Sequence, Column, UniqueConstraint, ForeignKey
from sqlalchemy.dialects.postgresql import INTEGER
from sqlalchemy.orm import relationship, backref

from model.Base import Base
from model.Episode import Episode
import utils.time

class Season(Base):
    __tablename__ = "seasons"

    id = Column(
        INTEGER,
        Sequence("seasons_id_seq"),
        primary_key = True,
    )

    number = Column(INTEGER, nullable = False)
    tv_series_id = Column(INTEGER, ForeignKey("tv_series.id"), nullable = False)

    episodes = relationship(
        "Episode",
        cascade = "delete",
        single_parent = True,
        order_by = "Episode.number",
        backref = backref("season"),
    )

    __table_args__ = (
        UniqueConstraint(
            "tv_series_id",
            "number",
            name = "_season_unique",
        ),
    )

    @staticmethod
    def get(season_id):
        return cherrypy.request.session.query(Season).filter(
            Season.id == season_id,
        ).one()

    @staticmethod
    def new(tv_series, number):
        season = Season()
        season.tv_series_id = tv_series.id
        season.number = number
        season.fb_user_id = cherrypy.request.fb_user_id
        cherrypy.request.session.add(season)
        cherrypy.request.session.commit()
        return season

    def delete(self):
        cherrypy.request.session.delete(self)
        cherrypy.request.session.commit()

    def update_episodes_info(self, data):
        current_episodes = {}
        for episode in self.episodes:
            current_episodes[episode.number] = episode

        updated_episodes = {}
        for episode in data:
            for episode_number in episode["number"].split("/"):
                updated_episodes[int(episode_number)] = episode

        for episode_number in updated_episodes:
            episode = updated_episodes[episode_number]
            if not episode["air_date"]:
                continue
            air_date = utils.time.from_string(episode["air_date"], "%Y.%m.%d")
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
