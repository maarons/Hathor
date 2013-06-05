from model.Base import Base
from model.Episode import Episode
from model.Season import Season
from model.TvSeries import TvSeries
from model.Provider import Provider

from sqlalchemy import create_engine
engine = create_engine("sqlite:///db.sqlite3", echo = False)
Base.metadata.create_all(engine)
