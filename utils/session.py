from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import config

engine = create_engine("postgresql://{}:{}@localhost/{}".format(
    config.pg_user,
    config.pg_pass,
    config.pg_dbname,
), client_encoding = "utf8")

Session = sessionmaker(bind = engine)
