from model.Base import Base
from model.Episode import Episode
from model.Season import Season
from model.TvSeries import TvSeries
from model.Provider import Provider
from utils.session import engine

Base.metadata.create_all(engine)
