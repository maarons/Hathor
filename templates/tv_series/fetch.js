{% if tv_series.provider_type == 1 %}
  Update.wikipedia(
    {{ tv_series.id }},
    "{{ tv_series.title }}",
    "{{ metadata.get('wikipedia_episodes_article', '') }}",
    "{{ metadata.get('wikipedia_season_keyword', '') }}",
    "{{ metadata.get('wikipedia_episodes_keyword', '') }}"
  );
{% endif %}

{% if tv_series.provider_type == 2 %}
  Update.freebase(
    {{ tv_series.id }},
    "{{ tv_series.title }}",
    "{{ metadata.get('freebase_tv_series_id', '') }}"
  );
{% endif %}
