var NextEpisodes = React.createClass({
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
    press_hide_accordion_under_element(this);
    $.ajax({
      url: '/next_episodes.json',
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
    var header = <h1>Next episodes:</h1>;
    var content = null;
    if (!this.state.loaded) {
      content = <PressLoadingAnimation/>;
    } else {
      var all_episodes = $.map(this.state.episodes, function(a) { return a; });
      var next_episodes = all_episodes.sort(function(a, b) {
        return a.air_date - b.air_date;
      });
      var episodes = $.map(
        next_episodes,
        function(episode) {
          var season = this_.state.seasons[episode.season_id];
          var tv_series = this_.state.tv_series[season.tv_series_id];
          return <Episode
            key={episode.objectId}
            objectId={episode.objectId}
            number={episode.number}
            title={episode.title}
            summary={episode.summary}
            watched={episode.watched}
            air_date={episode.air_date}
            on_change_watched={this_.onChangeWatched}
            season={season}
            tv_series={tv_series}
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
