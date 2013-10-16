$(document).on("click", ".accordion .header", function(event) {
  event.preventDefault();
  var should_show = true;
  if ($(this).parents("section").hasClass("target")) {
    should_show = false;
  }
  $(".target").removeClass("target");
  if (should_show) {
    $(this).parents("section").addClass("target");
  }
});

function reload_partial(t) {
  var p = t.parents(".reload");
  var url = p.data("url");
  if (url) {
    $(".target").removeClass("target");
    var animation_start = $.now();
    $.getJSON(url, function(data) {
      setTimeout(function() {
        p.replaceWith(data);
      }, 300 - ($.now() - animation_start));
      // 0.3s for accordion target animation to complete
    });
    return true;
  }
  return false;
}

$(document).on("click", ".episode .watch", function(event) {
  event.preventDefault();
  var episode_id = $(this).data("episode-id");
  var button = $(this);
  $.getJSON("/episodes/watch/?id=" + episode_id, function(data) {
    if (data === true) {
      if (!reload_partial(button)) {
        $(".episode-" + episode_id + " .unseen-marker").addClass("hide");
        $(".episode-" + episode_id + " .watch").addClass("hide");
        $(".episode-" + episode_id + " .unwatch").removeClass("hide");
      }
    }
  });
});

$(document).on("click", ".episode .unwatch", function(event) {
  event.preventDefault();
  var episode_id = $(this).data("episode-id");
  var button = $(this);
  $.getJSON("/episodes/unwatch/?id=" + episode_id, function(data) {
    if (data === true) {
      if (!reload_partial(button)) {
        $(".episode-" + episode_id + " .unseen-marker").removeClass("hide");
        $(".episode-" + episode_id + " .watch").removeClass("hide");
        $(".episode-" + episode_id + " .unwatch").addClass("hide");
      }
    }
  });
});

$(document).on("click", ".episode", function(event) {
  if ($(this).hasClass("has-cover")) {
    return;
  }
  $(this).addClass("has-cover");
  var episode_id = $(this).data("episode-id");
  var cover = $(this).find(".cover_image");
  if (cover.length !== 1) {
    return;
  }
  $.getJSON("/episodes/amazon_link/?id=" + episode_id, function(data) {
    if (data["error"] === false) {
      cover.append(data["html"]);
    }
  });
});
