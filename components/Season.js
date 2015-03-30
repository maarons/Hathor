var Season = React.createClass({
  propTypes: {
    objectId: React.PropTypes.string.isRequired,
    number: React.PropTypes.number.isRequired,
    episodes: React.PropTypes.array.isRequired,
  },

  getInitialState: function() {
    return {'watched': true, 'episodes': {}};
  },

  componentWillMount: function() {
    var this_ = this;
    $.each(this.props.episodes, function(_, episode) {
      this_.state.episodes[episode.objectId] = episode;
    });
  },

  componentDidMount: function() {
    this.updateWatched();
  },

  updateWatched: function() {
    var watched = true;
    $.each(this.state.episodes, function(_, episode) {
      watched = watched && episode.watched;
    });
    this.setState({'watched': watched});
  },

  onChangeWatched: function(objectId, state) {
    this.state['episodes'][objectId].watched = state;
    this.updateWatched();
  },

  render: function() {
    var episodes = $.map(
      this.state.episodes,
      function(episode, _) { return episode; }
    );
    episodes.sort(function(a, b) { return a.number - b.number; });
    var this_ = this;
    episodes = $.map(
      episodes,
      function(episode, _) {
        return <Episode
          key={episode.objectId}
          objectId={episode.objectId}
          number={episode.number}
          title={episode.title}
          summary={episode.summary}
          watched={episode.watched}
          airDate={episode.air_date}
          onChangeWatched={this_.onChangeWatched}
        />;
      }
    );
    function watchRequest(watched) {
      $.ajax({
        url: '/watch_season',
        data: {'objectId': this_.props.objectId, 'watched': watched},
        method: 'POST',
        success: function(data) {
          if (data['success']) {
            $.each(this_.state.episodes, function(_, episode) {
              episode.watched = watched;
            });
            this_.setState({'episodes': this_.state.episodes});
            this_.updateWatched();
          }
        }
      });
    }
    var watchLabel = null;
    var watchAction = null;
    if (this.state.watched) {
      watchLabel = 'I haven’t seen this season';
      watchAction = function() { watchRequest(false); };
    } else {
      watchLabel = 'I’ve seen this season';
      watchAction = function() { watchRequest(true); };
    }
    var watchPart = <PressButton
      label={watchLabel}
      onClick={watchAction}
      className='press-right'
    />
    var content = <PressAccordion items={episodes}/>;
    var header = <h2>{'Season ' + this.props.number}{watchPart}</h2>;
    return <PressCard
      header={header}
      content={content}
    />
  }
});
