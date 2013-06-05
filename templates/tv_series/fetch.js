{% if tv_series.provider_type == 1 %}
  Update.wikipedia(
    {{ tv_series.id }},
    "{{ tv_series.title }}",
    "{{ metadata.get('wikipedia_episodes_article', '') }}",
    "{{ metadata.get('wikipedia_season_keyword', '') }}",
    "{{ metadata.get('wikipedia_episodes_keyword', '') }}"
  );
{% endif %}
