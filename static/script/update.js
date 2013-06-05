var Update = function () {
  var num_tv_series = 1;
  var done_tv_series = 0;
  var cur_progress = 0.0;
  var errors = 0;

  function bump_progress(progress) {
    cur_progress += progress;
    var value = Math.round(cur_progress * 100.0 / num_tv_series);
    $("#update-progress").progressbar({ value: value });
  }
  bump_progress(0.0);

  function check_all_done() {
    if (done_tv_series == num_tv_series) {
      if (errors) {
        $("#update-error").show();
      } else {
        $("#update-reload").show();
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
    window.location.replace(window.location.href);
  });

  function show_dialog() {
    $("#update-dialog").dialog({
      modal: true,
      resizable: false,
      draggable: false,
      closeOnEscape: false,
      // Prevents the dialog from being closed.
      beforeClose: function(event, _) {
        event.preventDefault();
      },
    });
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

  function wikipedia(tv_series_id, title, episodes_article, season_keyword,
                     episodes_keyword) {
    function bump_wikipedia_progress() {
      var num_actions = 3.0;
      bump_progress(1.0 / num_actions);
    }

    bump_wikipedia_progress();

    if (!episodes_article) {
      progress_error(title);
      return;
    }

    function lib_progress_error() {
      progress_error(title);
    }
    var lib = WikipediaLib(episodes_article, season_keyword, episodes_keyword,
                           lib_progress_error);
    lib.getTvSeries(function(tv_series) {
      bump_wikipedia_progress();
      if (!tv_series) {
        progress_error(title);
        return;
      }

      $.ajax({
        dataType: "json",
        url: "/tv_series/update_episodes_info/",
        data: {
          id: tv_series_id,
          data: JSON.stringify(tv_series.toJSON()),
        },
        success: function(ret) {
          bump_wikipedia_progress();
          if (ret === true) {
            progress_done();
          } else {
            progress_error(title);
          }
        },
        error: function() {
          progress_error(title);
        },
        type: 'POST'
      });
    });
  }

  return { wikipedia: wikipedia };
}();
