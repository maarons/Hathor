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

  var updateFunction = null;
  var updateTVSeries = function() {
    if (updateFunction !== null) {
      updateFunction();
    }
  }
  var setUpdateFunction = function(f) {
    updateFunction = f;
  }
  var tvSeries = <TVSeries
    objectId={params.objectId}
    title={params.title}
    setUpdateFunction={setUpdateFunction}
  />;
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

  return {
    'toolbar': toolbar,
    'content': tvSeries,
  };
}
