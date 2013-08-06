var freebase_url = "https://www.googleapis.com/freebase/v1/mqlread";

function freebase_id_hint(name, callback) {
  var query = [{
    "type": "/tv/tv_program",
    "id": null,
    "/common/topic/alias": [],
    "name": name,
  }];
  var url = freebase_url + "?query=" + JSON.stringify(query);
  $.ajax({
    dataType: "jsonp",
    url: url,
    success: function(data) {
      if (data.result === undefined) {
        return;
      }
      var hints = {};
      $.each(data.result, function(_, obj) {
        var hint_name = name;
        if (obj["/common/topic/alias"].length > 0) {
          hint_name += " [" + obj["/common/topic/alias"].join(", ") + "]";
        }
        hints[obj.id] = hint_name;
      });
      callback(hints);
    }
  });
}

function FreebaseLib(freebase_id, progress_error) {
  var query = {
    "type": "/tv/tv_program",
    "id": freebase_id,
    "seasons": [{
      "season_number": null,
      "episodes": [{
        "name": null,
        "episode_number": null,
        "air_date": null,
        "/common/topic/description": []
      }]
    }]
  };

  function getTvSeries(callback) {
    var url = freebase_url + "?html_escape=false&query=";
    url += JSON.stringify(query);
    $.ajax({
      dataType: "jsonp",
      url: url,
      success: function(data) {
        if (data.result === undefined) {
          progress_error();
          return;
        }
        data = data.result;
        seasons = {};
        $.each(data.seasons, function(_, season) {
          if (season.season_number === 0) {
            // Season 0 usually contains trailers and other crap.
            return;
          }
          seasons[season.season_number] = [];
          $.each(season.episodes, function(_, episode) {
            if (!episode.name || !episode.episode_number || !episode.air_date) {
              return;
            }
            var summary = null;
            if (episode["/common/topic/description"]) {
              summary = episode["/common/topic/description"].join("\n\n");
            }
            seasons[season.season_number].push({
              "number": episode.episode_number.toString(),
              "title": episode.name,
              "air_date": episode.air_date.replace(/-/g, "."),
              "summary": summary,
            });
          });
        });
        callback(seasons);
      },
      error: progress_error
    });
  }

  return { getTvSeries: getTvSeries };
}
