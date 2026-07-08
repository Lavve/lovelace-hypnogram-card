export default {
  // Card
  'card.title': 'Today',
  'card.loading': 'Loading sleep data...',
  'card.no_data': 'No sleep data available',
  'card.error_entity_not_found': 'Entity not found',
  'card.label.awake': 'Awake',
  'card.label.rem': 'REM',
  'card.label.light_sleep': 'Light sleep',
  'card.label.deep_sleep': 'Deep sleep',
  // Editor
  'editor.title_label': 'Title',
  'editor.show_title_label': 'Show title',
  'editor.show_legends_label': 'Show legends',
  'editor.show_legend_percentages_label': 'Show phase percentages',
  'editor.legend_position_label': 'Legend position',
  'editor.legend_position.left': 'Left',
  'editor.legend_position.right': 'Right',
  'editor.display_options_label': 'Display options',
  'editor.show_period_range_label': 'Show time range',
  'editor.show_total_time_label': 'Show total time',
  'editor.entity_label': 'Sleep Data Entity (Required)',
  'editor.primary_color_label': 'Chart color',
  'editor.primary_color_helper':
    'Hex, RGB or CSS variables. Phase colors are derived from this. Type {{ or {% to use a template.',
  'editor.primary_color_template_helper':
    'Jinja2 template returning a color (hex, RGB, or CSS variable). The config variable is available.',
  'editor.chart_configuration_label': 'Chart configuration',
  'editor.bucket_minutes_label': 'Bucket size (minutes)',
  'editor.bucket_minutes_helper':
    'Groups short phase changes into time buckets. Higher values smooth the chart. Can be set to 1-30 minutes.',
  'editor.tap_action_label': 'Tap action',
  'editor.hold_action_label': 'Hold action',
  'editor.double_tap_action_label': 'Double tap action',
  'editor.interaction_label': 'Interaction',
  'editor.state_mapping_label': 'State mapping',
  'editor.state_mapping_helper':
    'Entity state values for each sleep phase. Defaults match Sleep as Android.',
  'editor.state_mapping.deep_sleep': 'Deep sleep entity state',
  'editor.state_mapping.light_sleep': 'Light sleep entity state',
  'editor.state_mapping.rem': 'REM entity state',
  'editor.state_mapping.awake': 'Awake entity state',
}
