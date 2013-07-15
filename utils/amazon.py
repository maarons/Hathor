import config

import python_apis_maarons.Amazon.InstantVideo as AIV

def get_episode(episode):
    a = AIV.AmazonInstantVideo(
        config.amazon_key_id,
        config.amazon_secret,
    )
    a_episodes = a.search(
        episode.season.tv_series.title,
        episode.season.number,
        episode.number,
        episode.title,
    )
    a_episode = None
    for e in a_episodes:
        if a_episode is None:
            a_episode = e
        elif not e.hd:
            # Non HD prefered because images for HD videos have a big HD on
            # the top.
            a_episode = e
    if a_episode is not None:
        return a_episode
    return None
