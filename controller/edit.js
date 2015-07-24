var editController = function(params) {
  if (params === undefined || params.objectId === undefined) {
    PressNavigation.switchToUri('/');
    return;
  }

  $.ajax({
    url: '/get.json',
    data: {'objectId': params.objectId},
    success: function(tv_series) {
      var edit_form = (
        <div>
          <TVSeriesEdit
            title={tv_series.title}
            wikipediaArticle={tv_series.wikipedia_article}
            objectId={tv_series.objectId}
            submitLabel='Update'
          />
          <PressButton
            label='Delete'
            className='press-left'
            onClick={deleteTVSeries}
          />
        </div>
      );
      React.render(edit_form, $('#content').get(0));
      $('#loading-animation').hide();
    },
    error: function() {
      // TODO
    },
    dataType: 'json',
  });

  function deleteTVSeries() {
    if (confirm('Are you sure?')) {
      $.ajax({
        url: '/delete.json',
        data: {'objectId': params.objectId},
        success: function() {
          PressNavigation.switchToUri('/');
        },
        error: function() {
          // TODO
        },
        dataType: 'json',
        type: 'POST',
      });
    }
  }

  var content = (
    <div>
      <div id='content'></div>
      <PressLoadingAnimation id='loading-animation'/>
    </div>
  );
  return {
    'toolbar':
      <div>
        <PressNavigationButton
          label='Back'
          uri='/tv_series'
          params={{'objectId': params.objectId}}
          className='press-right'
        />
        <h1>Edit TV series</h1>
      </div>,
    'content': <PressCard content={content}/>
  };
}
