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
      console.log(data);
      var seasons_list = $.map(
        data['seasons'],
        function(season, _) {
          return <span>{'Season ' + season.number}</span>;
        }
      );
      var seasons = $.map(
        data['seasons'],
        function(season, _) {
          var episodes = data['episodes'][season.objectId];
          var header = <span>{'Season ' + season.number}</span>;
          var content = <div>foo</div>;
          return <PressCard
            header={header}
            content={content}
            key={season.objectId}
          />
        }
      );
      React.render(
        <div>
          <PressList items={seasons_list}/>
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

  var toolbar = (
    <div>
      <PressNavigationButton
        label='Back'
        uri='/'
        className='press-right'
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
