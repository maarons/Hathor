from config import env

def log(msg, *args, **kwargs):
    if env == "production":
        return
    print(">>> ", msg.format(*args, **kwargs))
