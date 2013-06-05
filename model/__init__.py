from model.Base import Base
from model.Episode import Episode
from model.Season import Season
from model.TvSeries import TvSeries
from model.Provider import Provider
from config import env
import config

from sqlalchemy import create_engine
if env == "development":
    engine = create_engine("sqlite:///db.sqlite3", echo = False)
elif env == "production":
    engine = create_engine("postgresql://{}:{}@localhost/{}".format(
        config.pg_user,
        config.pg_pass,
        config.pg_dbname,
    ), client_encoding = "utf8")
else:
    raise Exception("Unknown environment: " + env)
Base.metadata.create_all(engine)
