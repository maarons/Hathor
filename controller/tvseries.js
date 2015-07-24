var tvseriesController = function(params) {
  var requiredParams = ['objectId', 'title'];
  var ok = params !== undefined;
  $.each(
    requiredParams,
    function(_, param) {
      if (!ok || params[param] === undefined) {
        ok = false;
      }
    }
  );
  if (!ok) {
    PressNavigation.switchToUri('/');
    return;
  }

  $.ajax({
    url: '/tv_series.json',
    data: {'objectId': params.objectId},
    success: function(data) {
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
      React.render(
        <div>
          <PressList items={seasonsList}/>
          {seasons}
        </div>,
        $('#content').get(0)
      );
      $('#loading-animation').hide();
    },
    error: function() {
      // TODO do something
    },
    dataType: 'json',
  });

  var updateTVSeries = function() {
    Util.fetchTVSeries(
      params.objectId,
      function(tv_series) {
        var lib = WikipediaLib(
          tv_series.wikipedia_article,
          '',
          '',
          function() { console.log('error'); }
        );
        lib.getTVSeries(function(data) {
          console.log(data);
        });
      }
    );
  }

  var toolbar = (
    <div>
      <PressNavigationButton
        label='Back'
        uri='/'
        className='press-right'
      />
      <PressNavigationButton
        label='Edit'
        uri='/edit'
        params={{'objectId': params.objectId, 'title': params.title}}
        className='press-right'
      />
      <PressButton
        label='Update TV series'
        className='press-right'
        onClick={updateTVSeries}
      />
      <h1 id='header'>{params.title}</h1>
    </div>
  );
  var content = (
    <div>
      <div id='content'></div>
      <PressLoadingAnimation id='loading-animation'/>
    </div>
  );

  return {
    'toolbar': toolbar,
    'content': content
  };
}
