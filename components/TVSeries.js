var TVSeries = React.createClass({
  propTypes: {
    objectId: React.PropTypes.string.isRequired,
    title: React.PropTypes.string.isRequired,
    setUpdateFunction: React.PropTypes.func,
  },

  getInitialState: function() {
    return {
      'isLoading': false,
      'isUpdating': false,
      'updateProgress': 0.0,
      'tvSeriesData': null,
    };
  },

  fetchData: function() {
    var this_ = this;
    this.setState({'isLoading': true});
    $.ajax({
      url: '/tv_series.json',
      data: {'objectId': this.props.objectId},
      success: function(data) {
        this_.setState({
          'isLoading': false,
          'tvSeriesData': data,
        });
      },
      error: function() {
        this_.setState({'isLoading': false});
      },
      dataType: 'json',
    });
  },

  componentWillMount: function() {
    this.fetchData();
    if (this.props.setUpdateFunction !== undefined) {
      this.props.setUpdateFunction(this.updateTVSeries);
    }
  },

  updateTVSeries: function() {
    var this_ = this;
    this.setState({'isUpdating': true, 'updateProgress': 0})
    var afterDone = function(msg) {
      console.log(msg);
      this_.setState({'updateProgress': 100});
      this_.fetchData();
      setTimeout(function() {
        this_.setState({'isUpdating': false});
      }, 1000);
    }
    Util.fetchTVSeries(
      this.props.objectId,
      function(tv_series) {
        this_.setState({'updateProgress': 33});
        var lib = WikipediaLib(
          tv_series.wikipedia_article,
          '',
          '',
          function() { afterDone('error'); }
        );
        lib.getTVSeries(function(data) {
          this_.setState({'updateProgress': 66})
          Util.uploadTVSeriesData(
            this_.props.objectId,
            data.toJSON(),
            function() { afterDone('success'); },
            function() { afterDone('error'); }
          );
        });
      }
    );
  },

  render: function() {
    var content = null;
    if (this.state.isLoading) {
      content = <PressLoadingAnimation id='loading-animation'/>;
    } else if (this.state.tvSeriesData === null) {
      content = <div></div>;
    } else {
      var data = this.state.tvSeriesData;
      var seasonsList = $.map(
        data['seasons'],
        function(season, _) {
          return <span>{'Season ' + season.number}</span>;
        }
      );
      var seasons = $.map(
        data['seasons'],
        function(season, _) {
          return <Season
            key={season.objectId}
            objectId={season.objectId}
            number={season.number}
            episodes={data['episodes'][season.objectId]}
          />
        }
      );
      content = (
        <div>
          <PressList items={seasonsList}/>
          {seasons}
        </div>
      );
    }
    var overlay = null;
    if (this.state.isUpdating) {
      overlay = <PressModalProgressBar
        title={'Updating ' + this.props.title + ' info'}
        maxValue={100}
        value={this.state.updateProgress}
      />;
    }
    return (
      <div>
        {content}
        {overlay}
      </div>
    );
  },
});
