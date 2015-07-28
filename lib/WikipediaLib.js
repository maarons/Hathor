/**
 * TODO: ECMAScript 5 has String.trim, change $.trim to it when browsers support
 * it.
 */

// Create a new namespace.
function WikipediaLib(
  episodes_article,
  season_keyword,
  episodes_keyword,
  progress_error
) {
  season_keyword = season_keyword.toLowerCase();
  episodes_keyword = episodes_keyword.toLowerCase();

  /**
   * Removes HTML comments from text.
   */
  function removeComments(text) {
    return text.replace(/<!--[\s\S]*?-->/gm, "");
  }

  /**
   * Finds and removes matching templates.
   */
  function removeTemplate(template_name, content) {
    var regex = new RegExp('\\{\\{\\s*' + template_name + '\\s*\\|');
    while (true) {
      var startIndex = content.search(regex);
      if (startIndex === -1) {
        break;
      }
      var i = startIndex;
      while (i < content.length && content[i] !== '|') {
        ++i;
      }
      if (i === content.length) {
        break;
      }
      var pipeIndex = i++;
      var lastChar = '|';
      var depth = 1;
      while (depth > 0 && i < content.length) {
        var c = content[i];
        if (lastChar === '{' && c === '{') {
          ++depth;
        }
        if (lastChar === '}' && c === '}') {
          --depth;
        }
        lastChar = c;
        ++i;
      }
      if (depth > 0) {
        break;
      }
      content = (
        content.substr(0, startIndex) +
        content.substr(pipeIndex + 1, i - pipeIndex - 3) +
        content.substr(i)
      );
    }
    return content;
  }

  /**
   * Removes some of MediaWiki markup - italic text, bold text, bold and italic
   * text, links, references, nowrap template, small tag.
   *
   * http://www.mediawiki.org/wiki/Help:Formatting
   * http://en.wikipedia.org/wiki/Template:Nowrap
   * https://en.wikipedia.org/wiki/Help:HTML_in_wikitext#Formatting
   */
  function removeMarkup(text) {
    text = text.replace(/'''''([\s\S]*?)'''''/g, '$1')
      .replace(/'''([\s\S]*?)'''/g, '$1')
      .replace(/''([\s\S]*?)''/g, '$1')
      .replace(/\[\[([^\|]*?)\]\]/g, '$1')
      .replace(/\[\[[\s\S]*?\|([\s\S]*?)\]\]/g, '$1')
      .replace(/<\s*ref[\s\S]*?\/>/gm, '')
      .replace(/<\s*ref[\s\S]*?[^\/]>[\s\S]*?<\s*\/\s*ref\s*>/gm, '')
      .replace(/<\s*ref\s*>[\s\S]*?<\s*\/\s*ref\s*>/gm, '')
      .replace(/<small>([\s\S]*?)\<\/small>/g, '$1');
    text = removeTemplate('nowrap', text);
    return text;
  }

  /**
   * Finds all top-level templates matching given template constructor.
   */
  function findTemplates(constructor, content) {
    var last = null;
    var depth = 0;
    var lastChar = " ";
    var templates = [];
    for (var i = 0; i < content.length; ++i) {
      var c = content[i];
      var d = depth;
      if ((lastChar ==  "{") && (c == "{")) {
        if (++depth == 1) {
          last = i - 1;
        }
      }
      if ((lastChar == "}") && (c == "}")) {
        --depth;
      }
      if ((depth == 0) && (last != null)) {
        try {
          var t = new constructor(content.substring(last, i + 1));
          templates.push(t);
        } catch (e) {
        }
        last = null;
      }
      if (d != depth) {
        lastChar = " ";
      } else {
        lastChar = c;
      }
    }
    return templates;
  }

  /**
   * MediaWiki template.  Object provides several variables:
   *
   * - templateName - name of the template
   *
   * - unnamedParams - list of unnamed parameters
   *
   * - namedParams - dictionary of named parameters
   *
   * http://en.wikipedia.org/wiki/Help:Template
   */
  function Template(content) {
    function splitParams(text) {
      var params = [], last = 0, depth = 0, lastChar = " ";
      for (var i = 0; i < text.length; ++i) {
        var c = text[i];
        var d = depth;
        if ((lastChar ==  "{") && (c == "{")) ++depth;
        if ((lastChar ==  "[") && (c == "[")) ++depth;
        if ((lastChar == "}") && (c == "}")) --depth;
        if ((lastChar == "]") && (c == "]")) --depth;
        if ((depth == 0) && (c == "|")) {
          params.push(text.substring(last, i));
          last = i + 1;
        }
        if (d != depth) lastChar = " ";
        else lastChar = c;
      }
      if (last != text.length) params.push(text.substring(last, text.length));
      if (depth != 0) throw "Unexpected end of template";
      return params;
    }

    var a = content.match(/^{{([\s\S]*)}}$/);
    if (!a) throw "Template syntax error";
    content = $.map(splitParams(a[1]), function(e, i) {
      return $.trim(e);
    });
    if (content.length < 1) throw "Template syntax error";
    this.templateName = content[0].toLowerCase();
    content = content.splice(1);

    this.unnamedParams = $.grep(content, function(e, i) {
      return !e.match("=");
    });

    var named = $.grep(content, function(e, i) {
      return e.match("=");
    });
    var namedParams = {}
    $.each(named, function(i, e) {
      var a = e.indexOf("=");
      var name = $.trim(e.substr(0, a));
      var value = $.trim(e.substr(a + 1));
      namedParams[name] = value;
    });
    this.namedParams = namedParams;
  }

  /**
   * Sub-class of Template.  Additional methods: getTitle, getNumber,
   * getAirDate, getSummary.  They will return null if requested information is
   * unavailable.
   *
   * http://en.wikipedia.org/wiki/Template:Episode_list
   */
  function EpisodeList(content) {
    Template.call(this, content);
    if (!this.templateName.match(/^episode list/))
      throw "This is not an episode list template";

    var params = this.namedParams;

    this.getTitle = function() {
      if (params["Title"]) return removeMarkup(params["Title"]);
      if (params["RTitle"]) return removeMarkup(params["RTitle"]);
      return null;
    }

    this.getNumber = function() {
      if (params["EpisodeNumber2"])
        return removeMarkup(params["EpisodeNumber2"]);
      if (params["EpisodeNumber"])
        return removeMarkup(params["EpisodeNumber"]);
      return null;
    }

    this.getAirDate = function() {
      if (!params['OriginalAirDate']) {
        return null;
      }
      try {
        var text = removeMarkup(params['OriginalAirDate']);

        // Ignore extra shit people tend to place here
        var start = null, end, depth = 0, lastChar = " ";
        for (var i = 0; i < text.length; ++i) {
          var c = text[i];
          var d = depth;
          if ((lastChar ==  "{") && (c == "{"))
            if (++depth == 1) start = i - 1;
          if ((lastChar == "}") && (c == "}")) --depth;
          if ((depth == 0) && (start != null)) {
            end = i + 1;
            break;
          }
          if (d != depth) {
            lastChar = " ";
          } else {
            lastChar = c;
          }
        }

        return new StartDate(text.substring(start, end));
      } catch (e) {
        try {
          return new USStyleStartDate(text);
        } catch (e) {
          console.error('Failed to parse start date: ' + text + ' ' + e);
          return null;
        }
      }
    }

    this.getSummary = function() {
      if (!params["ShortSummary"]) {
        return null;
      }
      return removeMarkup(params["ShortSummary"]);
    }
  }

  /**
   * Sub-class of Template.  Provides year, month, day variables and toString
   * method.
   *
   * http://en.wikipedia.org/wiki/Template:Start_date
   */
  function StartDate(content) {
    Template.call(this, content);
    if (
      (!this.templateName.match(/^start date$/)) &&
      (!this.templateName.match(/^dts$/))
    ) {
      throw 'This is not a start date template';
    }

    var params = this.unnamedParams, year, month = null, day = null;
    if (params.length < 1) {
      throw 'Not enough parameters';
    }
    year = params[0];
    if (params.length >= 2) month = params[1];
    if (params.length >= 3) day = params[2];
    if (isNaN(Number(year)) || isNaN(Number(month)) || isNaN(Number(day))) {
      throw 'The date is not numeric';
    }

    this.year = year;
    this.month = month;
    this.day = day;
    this.toString = function() {
      if (day !== null) {
        return year + "." + month + "." + day;
      }
      if (month !== null) {
        return year + "." + month;
      }
      return year;
    }
  }

  /**
   * This class parses plain US style dates that are not in templates.  Provides
   * year, month, day variables and toString method.
   */
  function USStyleStartDate(content) {
    var months = {
      'January': 1,
      'February': 2,
      'March': 3,
      'April': 4,
      'May': 5,
      'June': 6,
      'July': 7,
      'August': 8,
      'September': 9,
      'October': 10,
      'November': 11,
      'December': 12,
    };
    function error() {
      throw 'Not a US style start date';
    }
    var parts = content.trim().split(' ');
    if (parts.length !== 3) {
      error();
    }
    if (months[parts[0]] === undefined) {
      error();
    }
    if (
      !parts[1].endsWith(',') ||
      isNaN(Number(parts[1].substring(0, parts[1].length - 1)))
    ) {
      error();
    }
    if (Number(parts[2]) === NaN) {
      error();
    }

    this.year = parts[2];
    this.month = months[parts[0]].toString();
    this.day = parts[1].substring(0, parts[1].length - 1);
    this.toString = function() {
      return this.year + '.' + this.month + '.' + this.day;
    }
  }

  /**
   * Breaks down a MediaWiki article revision into sections.  Provides sections
   * variable.
   */
  function Article(content) {
    content = removeComments(content);
    var title =  "", step = true, sections = {};
    $.each(content.split(/==+([\s\S]+?)==+/), function(i, e) {
      if (step) sections[title] = e;
      else title = $.trim(e.toLowerCase());
      step = !step;
    });
    var names = content.match(/==+[\s\S]+?==+/g);
    if (names) {
      function sectionDepth(name) {
        return name.split("=").length - 1;
      }
      trimNames = $.map(names, function(e, i) {
        return $.trim(e.replace(/==+([\s\S]+?)==+/, "$1").toLowerCase());
      });
      // Adds sub-section contents to master sections.  O(n^2), could be O(n)
      for (var i = 0; i < names.length; ++i) {
        var depth = sectionDepth(names[i]);
        var j = i + 1;
        while ((j < names.length) && (sectionDepth(names[j]) > depth))
          sections[trimNames[i]] += sections[trimNames[j++]];
      }
    }
    this.sections = sections;
  }

  /**
   * Requests given article title from Wikipedia.  If request is successful it
   * runs given callback on the fetched article.
   */
  function getArticle(title, callback) {
    var url = "https://en.wikipedia.org/w/api.php?" +
      "format=json&callback=?&" +
      "action=query&prop=revisions&rvprop=content&redirects&titles=";
    $.ajax({
      dataType: "jsonp",
      url: url + title,
      success: function(data) {
        if (data.query.pages["-1"]) {
          progress_error();
        } else {
          var n;
          for (n in data.query.pages);
          callback(new Article(data.query.pages[n].revisions[0]["*"]));
        }
      },
      error: progress_error
    });
  }

  /**
   * All information about one TV series.  Provides seasons variables and toJSON
   * method.
   */
  function TVSeries(seasons) {
    this.seasons = seasons;
    this.toJSON = function() {
      function serialize(season) {
        return $.map(season, function(episode) {
          var airDate = episode.getAirDate();
          if (airDate != null) airDate = airDate.toString();
          return { number: episode.getNumber(),
                   title: episode.getTitle(),
                   air_date: airDate,
                   summary: episode.getSummary() };
        });
      }

      var data = {};
      for (season in seasons) {
        data[season] = serialize(seasons[season]);
      }
      return data;
    }
  }

  function getTVSeries(callback) {
    var seasonData = {};

    function finalize() {
      if (isSeasonDataEmpty()) {
        progress_error();
      } else {
        callback(new TVSeries(seasonData));
      }
    }

    function updateSeasonData(number, episodes) {
      // If there already is a season with this number then somebody is trying
      // to fuck us up.
      if ((episodes.length) && (seasonData[number] == null))
        seasonData[number] = episodes;
    }

    function isSeasonDataEmpty() {
      var empty = true;
      for (a in seasonData) empty = false;
      return empty;
    }

    function episodeSection(section) {
      return (section == "episodes") ||
        (section == "list of episodes") ||
        (section == "episode list") ||
        (episodes_keyword && section == episodes_keyword);
    }

    function seasonSection(section) {
      var m;
      if (season_keyword) {
        regex = new RegExp('^' + season_keyword + '\s*(\d+)[\s\S]*$');
        m = section.match(regex);
        if (m != null) return m[1];
      }
      m = section.match(/^season\s*(\d+)[\s\S]*$/);
      if (m != null) return m[1];
      m = section.match(/^series\s*(\d+)[\s\S]*$/);
      if (m != null) return m[1];
      return null;
    }

    // Episodes data without a season section
    function findOneSeason(article) {
      var success = false;
      for (section in article.sections) {
        if (episodeSection(section)) {
          var episodes = findTemplates(EpisodeList, article.sections[section]);
          updateSeasonData(1, episodes);
          success = true;
        }
      }
      if (!success) {
        progress_error();
      } else {
        finalize();
      }
    }

    function findBySeasons(article) {
      var sections = [];

      function processSections() {
        if (sections.length) {
          var section = sections.pop();
          var number = section[0];
          var section = section[1];
          var template = section.match(/$[\s\S]*?{{:([\s\S]*?)}}[\s\S]*/m);
          if (template != null) {
            // Episode list in a separate article
            template = $.trim(template[1]);
            getArticle(template, function(a) {
              for (section in a.sections) {
                if (episodeSection(section)) {
                  var episodes = findTemplates(EpisodeList, a.sections[section]);
                  updateSeasonData(number, episodes);
                }
              }
              processSections();
            });
          } else {
            var episodes = findTemplates(EpisodeList, section);
            updateSeasonData(number, episodes);
            processSections();
          }
        } else {
          if (isSeasonDataEmpty()) {
            findOneSeason(article);
          } else {
            finalize();
          }
        }
      }

      for (section in article.sections) {
        var number = seasonSection(section);
        if (number != null) {
          sections.push([number, article.sections[section]]);
        }
      }
      processSections();
    }

    getArticle(episodes_article, function(article) {
      findBySeasons(article);
    });
  }

  // Public methods.
  return { getTVSeries: getTVSeries };
}
