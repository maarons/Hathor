from sqlalchemy import create_engine
engine = create_engine("sqlite:///db.sqlite3", echo = False)
from sqlalchemy.orm import sessionmaker
Session = sessionmaker(bind = engine)

def with_session(commit = False):
    def decorator(fn):
        def wrapped(*args, use_session = None, **kwargs):
            if use_session is None:
                session = Session()
            else:
                session = use_session
            ret = fn(*args, session = session, **kwargs)
            if use_session is None:
                if commit:
                    session.commit()
                session.close()
            return ret
        return wrapped
    return decorator

def add_and_commit(obj):
    session = Session()
    session.add(obj)
    session.commit()
    session.refresh(obj)
    session.close()
    return obj
