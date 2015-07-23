var indexController = function() {
  $.ajax({
    url: '/all_tv_series.json',
    success: function(data) {
      var tv_series_list = $.map(
        data,
        function(tv_series, _) {
          var params = {
            'objectId': tv_series.objectId,
            'title': tv_series.title
          };
          return <PressNavigationLink
            label={tv_series.title}
            uri='/tv_series'
            params={params}
          />
        }
      );
      React.render(
        <PressList items={tv_series_list}/>,
        $('#tv-series-content').get(0)
      );
      $('#tv-series-loading-animation').hide();
    },
    error: function() {
      // TODO do something
    },
    dataType: 'json',
  });

  var tv_series_header = <h1>Your TV series:</h1>;
  var tv_series_content = (
    <div>
      <div id='tv-series-content'></div>
      <PressLoadingAnimation id='tv-series-loading-animation'/>
    </div>
  );
  var updateAllTVSeries = function() {
    console.log('update');
  }
  var toolbar = (
    <div>
      <PressButton
        label='Update all TV series info'
        onClick={updateAllTVSeries}
        className='press-right'
      />
      <PressNavigationButton
        label='New'
        uri='/new'
        className='press-right'
      />
      <h1>Hathor</h1>
    </div>
  );
  return {
    'toolbar': toolbar,
    'content':
      <div>
        <ReadyEpisodes/>
        <NextEpisodes/>
        <PressCard
          header={tv_series_header}
          content={tv_series_content}
        />
      </div>,
  }
}
