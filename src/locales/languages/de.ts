export default {
  // Card
  'card.title': 'Heute',
  'card.loading': 'Schlafdaten werden geladen...',
  'card.no_data': 'Keine Schlafdaten verfügbar',
  'card.error_entity_not_found': 'Entität nicht gefunden',
  'card.label.awake': 'Wach',
  'card.label.rem': 'REM',
  'card.label.light_sleep': 'Leichtschlaf',
  'card.label.deep_sleep': 'Tiefschlaf',
  'card.duration.hours_minutes': '{hours} Std. {minutes} Min.',
  'card.duration.hours_only': '{hours} Std.',
  'card.duration.minutes_only': '{minutes} Min.',
  'card.sleep_efficiency': '{value}% Effizienz',
  'card.sleep_cycles': '{count} Zyklen',
  // Editor
  'editor.title_label': 'Titel',
  'editor.show_title_label': 'Titel anzeigen',
  'editor.show_legends_label': 'Legenden anzeigen',
  'editor.legend_format_label': 'Format für Legendenwerte',
  'editor.legend_format_helper':
    'Phasendauer, Prozentsatz oder beides neben jeder Legendenbeschriftung anzeigen.',
  'editor.legend_format.none': 'Nur Phasenname',
  'editor.legend_format.percent': 'Prozentual (50%)',
  'editor.legend_format.duration': 'Dauer (4 Std. 38 Min.)',
  'editor.legend_format.both': 'Beides (4 Std. 38 Min. (50%))',
  'editor.show_sleep_efficiency_label': 'Schlafeffizienz anzeigen',
  'editor.show_sleep_efficiency_helper':
    'Tatsächliche Schlafzeit geteilt durch die Gesamtzeit im Bett, dargestellt als Prozentsatz im Header.',
  'editor.show_sleep_cycles_label': 'Geschätzte Schlafzyklen anzeigen',
  'editor.show_sleep_cycles_helper':
    'Zählt Übergänge in den Tiefschlaf während der Nacht und zeigt die Gesamtzahl im Header an.',
  'editor.legend_position_label': 'Position der Legende',
  'editor.legend_position.left': 'Links',
  'editor.legend_position.right': 'Rechts',
  'editor.display_options_label': 'Anzeigeoptionen',
  'editor.show_period_range_label': 'Zeitraum anzeigen',
  'editor.show_total_time_label': 'Gesamtzeit anzeigen',
  'editor.entity_label': 'Schlafdaten-Entität (Erforderlich)',
  'editor.primary_color_label': 'Diagrammfarbe',
  'editor.primary_color_helper':
    'Hex-, RGB- oder CSS-Variablen. Phasenfarben werden hiervon abgeleitet. Tippe {{ oder {% um ein Template zu verwenden.',
  'editor.primary_color_template_helper':
    'Jinja2-Template, das eine Farbe zurückgibt (Hex, RGB oder CSS-Variable). Die Konfigurationsvariable `config` ist verfügbar.',
  'editor.chart_configuration_label': 'Diagrammkonfiguration',
  'editor.bucket_minutes_label': 'Intervallgröße (Minuten)',
  'editor.bucket_minutes_helper':
    'Fasst kurze Phasenwechsel in Zeitintervallen zusammen. Höhere Werte glätten das Diagramm. Kann auf 1–30 Minuten eingestellt werden.',
  'editor.stages_attribute_label': 'Attribut für Schlafphasen',
  'editor.stages_attribute_helper':
    'Optional. Entitätsattribut mit einer Liste von Objekten mit stage, start und end, für Daten ohne Zustandshistorie. Leer lassen, um die Zustandshistorie zu verwenden.',
  'editor.tap_action_label': 'Tippaktion',
  'editor.hold_action_label': 'Halteaktion',
  'editor.double_tap_action_label': 'Doppeltippaktion',
  'editor.interaction_label': 'Interaktion',
  'editor.state_mapping_label': 'Zustandsmapping',
  'editor.state_mapping_helper':
    'Entitätszustandswerte für jede Schlafphase. Standardwerte entsprechen Sleep as Android.',
  'editor.state_mapping.deep_sleep': 'Tiefschlaf-Entitätszustand',
  'editor.state_mapping.light_sleep': 'Leichtschlaf-Entitätszustand',
  'editor.state_mapping.rem': 'REM-Entitätszustand',
  'editor.state_mapping.awake': 'Wach-Entitätszustand',
  'editor.tracking_mapping_label': 'Tracking-Mapping',
  'editor.tracking_mapping_helper':
    'Entitätszustandswerte, die Start und Ende einer Schlafsitzung markieren. Standardwerte entsprechen Sleep as Android.',
  'editor.tracking_mapping.started': 'Schlaf gestartet Entitätszustand',
  'editor.tracking_mapping.stopped': 'Schlaf beendet Entitätszustand',
}
