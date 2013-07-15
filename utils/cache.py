from threading import Lock
from collections import OrderedDict

lock = Lock()
cache = OrderedDict()
SIZE_LIMIT = 1000

def get(key):
    with lock:
        if key in cache:
            cache.move_to_end(key)
        return cache.get(key)

def put(key, value):
    with lock:
        if key in cache:
            cache[key] = value
            cache.move_to_end(key)
        else:
            cache[key] = value
            while len(cache) > SIZE_LIMIT:
                cache.popitem(last = False)
