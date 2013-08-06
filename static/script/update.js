var Update = function () {
  var num_tv_series = 1;
  var done_tv_series = 0;
  var cur_progress = 0.0;
  var errors = 0;

  function bump_progress(progress) {
    cur_progress += progress;
    var value = Math.round(cur_progress * 100.0 / num_tv_series);
    $("#update-progress-bar").width(value + "%");
  }
  bump_progress(0.0);

  function check_all_done() {
    if (done_tv_series == num_tv_series) {
      if (errors) {
        $("#update-error").removeClass("hide");
      } else {
        $("#update-reload").removeClass("hide");
      }
    }
  }

  function progress_done() {
    ++done_tv_series;
    check_all_done();
  }

  function progress_error(title) {
    ++done_tv_series;
    ++errors;
    $("#update-fail").append($("<li>" + title + " failed</li>"));
    check_all_done();
  }

  $("#update-reload, #update-error").click(function(event) {
    event.preventDefault();
    window.location.reload(true);
  });

  function show_dialog() {
    $("#update-dialog").removeClass("hide");
    $("#update-overlay").removeClass("hide");
  }

  $("#update").click(function(event) {
    event.preventDefault();
    show_dialog();
    var tv_series_id = $(this).data("tv-series-id");
    $.getScript("/tv_series/fetch/?id=" + tv_series_id);
  });

  $("#update-all").click(function(event) {
    event.preventDefault();
    show_dialog();
    $.ajax({
      url: "/tv_series/list_ids",
      cache: false,
      success: function(data) {
        if (!data.length) {
          bump_progress(1.0);
          progress_done();
          return;
        }
        num_tv_series = data.length;
        $.each(data, function(_, id) {
          $.ajax({
            url: "/tv_series/fetch/?id=" + id,
            dataType: "script",
            error: function() {
              progress_error("TV series id " + id);
            }
          });
        });
      },
      error: function() {
        progress_error("TV series list");
      }
    });
  });

  function bump_progress_single() {
    var num_actions = 3.0;
    bump_progress(1.0 / num_actions);
  }

  function send_data(tv_series_id, tv_series, lib_progress_error) {
    $.ajax({
      dataType: "json",
      url: "/tv_series/update_episodes_info/",
      data: {
        id: tv_series_id,
        data: JSON.stringify(tv_series),
      },
      success: function(ret) {
        bump_progress_single();
        if (ret === true) {
          progress_done();
        } else {
          lib_progress_error();
        }
      },
      error: lib_progress_error,
      type: 'POST'
    });
  }

  function wikipedia(tv_series_id, title, episodes_article, season_keyword,
                     episodes_keyword) {
    function lib_progress_error() {
      progress_error(title);
    }

    bump_progress_single();

    if (!episodes_article) {
      lib_progress_error();
      return;
    }
    var lib = WikipediaLib(episodes_article, season_keyword, episodes_keyword,
                           lib_progress_error);
    lib.getTvSeries(function(tv_series) {
      bump_progress_single();
      if (!tv_series) {
        lib_progress_error();
        return;
      }

      send_data(tv_series_id, tv_series.toJSON(), lib_progress_error);
    });
  }

  function freebase(tv_series_id, title, freebase_id) {
    function lib_progress_error() {
      progress_error(title);
    }

    bump_progress_single();

    if (!freebase_id) {
      lib_progress_error();
      return;
    }
    var lib = FreebaseLib(freebase_id, lib_progress_error);

    lib.getTvSeries(function(tv_series) {
      bump_progress_single();
      if (!tv_series) {
        lib_progress_error();
        return;
      }

      send_data(tv_series_id, tv_series, lib_progress_error);
    });
  }

  return { wikipedia: wikipedia, freebase: freebase };
}();
