from datetime import datetime
import pytz

def now():
    return datetime.now(timezone())

def timezone():
    return pytz.timezone("US/Pacific")

def from_string(date, pattern):
    date = datetime.strptime(date, pattern)
    return timezone().localize(date)

def to_string(date):
    return date.strftime("%m/%d/%Y")
