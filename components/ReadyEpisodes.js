var ReadyEpisodes = React.createClass({
  getInitialState: function() {
    return {
      'episodes': {},
      'seasons': {},
      'tv_series': {},
      'loaded': false,
    };
  },

  componentDidMount: function() {
    this.fetch();
  },

  fetch: function() {
    var this_ = this;
    var node = null;
    try {
      node = React.findDOMNode(this);
    } catch(e) {
      // This will fail first time the object is rendered;
    }
    if (node !== null) {
      // Hide open episodes.
      var elements = $(node).find('.press-accordion-element.target');
      elements.find('.press-accordion-element-header').click();
    }
    $.ajax({
      url: '/ready_episodes.json',
      success: function(data) {
        this_.setState({
          'loaded': true,
          'episodes': data['episodes'],
          'seasons': data['seasons'],
          'tv_series': data['tv_series']
        });
      },
      error: function() {
        // TODO do something
      },
      dataType: 'json',
    });
  },

  onChangeWatched: function(objectId, state) {
    this.fetch();
  },

  render: function() {
    var this_ = this;
    var header = <h1>Ready episodes:</h1>;
    var content = null;
    if (!this.state.loaded) {
      content = <PressLoadingAnimation/>;
    } else {
      var latest_episodes = {};
      var episode_counts = {};
      $.each(
        this_.state.episodes,
        function(_, episode) {
          var tv_series_id = (
            this_.state.seasons[episode.season_id].tv_series_id
          );
          var latest = !(tv_series_id in latest_episodes);
          if (!latest) {
            latest = latest_episodes[tv_series_id].air_date < episode.air_date;
          }
          if (latest) {
            latest_episodes[tv_series_id] = episode;
          }
          if (!(tv_series_id in episode_counts)) {
            episode_counts[tv_series_id] = 0;
          }
          ++episode_counts[tv_series_id];
        }
      );
      var episodes = $.map(
        latest_episodes,
        function(episode, tv_series_id) {
          var extra_title = '';
          if (episode_counts[tv_series_id] > 1) {
            extra_title = (
              ' (and ' + (episode_counts[tv_series_id] - 1) + ' other episodes)'
            );
          }
          return <Episode
            key={episode.objectId}
            objectId={episode.objectId}
            number={episode.number}
            title={episode.title}
            summary={episode.summary}
            watched={episode.watched}
            air_date={episode.air_date}
            on_change_watched={this_.onChangeWatched}
            season={this_.state.seasons[episode.season_id]}
            tv_series={this_.state.tv_series[tv_series_id]}
            extra_title={extra_title}
          />;
        }
      );
      content = <PressAccordion items={episodes}/>;
    }
    return <PressCard
      header={header}
      content={content}
    />;
  }
});
