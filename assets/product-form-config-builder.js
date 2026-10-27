(function () {
  'use strict';

  var FIELD_TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'textarea', label: 'Textarea' },
  { value: 'select', label: 'Select' },
  { value: 'time', label: 'Time' },
  { value: 'date', label: 'Date' },
  { value: 'year', label: 'Year' },
  { value: 'year_range', label: 'Date range (Entry / Exit year)' },
  { value: 'text_color', label: 'Text colour' },
  { value: 'background_color', label: 'Background colour' },
  { value: 'size', label: 'Size' },
  { value: 'size_and_orientation', label: 'Size and Orientation' },
  { value: 'radio', label: 'Radio' },
  { value: 'custom_message', label: 'Custom Message (radio group)' },
  { value: 'repeatable', label: 'Repeatable' },
  { value: 'input_group', label: 'Input groups' },
  { value: 'upload', label: 'File upload' },
  { value: 'voice_block', label: 'Voice block' }
];

  var CUSTOM_MESSAGE_DEFAULTS = [
    'From the first key turned to the last light switched off what was built here will travel with us',
    'Houses change hands but never entire hearts [House Number & Street Name] will always echo the rhythm of our family.',
    'The years spent at [House Number & Street Name] tell a story of time well lived. Where love grew laughter echoed and memories were made. Moving on doesn’t erase the story; it simply turns the page.',
    'Every wall in [House Number & Street Name] remembers something. The early mornings the long talks the laughter that echoed the love that grew. From [Entry year – Exit year] this home carried and protected us through life’s journey.',
    '[House Number & Street Name] was the foundation of everything we built and made possible. [Entry year – Exit year] marks not an ending but the beginning of our next unforgettable chapter.'
  ];

  var TYPE_DEFAULTS = {
    text: {
      key: 'field_name',
      type: 'text',
      enabled: true,
      property_name: 'field_name',
      placeholder: 'Placeholder',
      required: false
    },
    textarea: {
      key: 'message',
      type: 'textarea',
      enabled: true,
      property_name: 'message',
      placeholder: 'Enter text',
      rows: 3
    },
    select: {
      key: 'choice',
      type: 'select',
      enabled: true,
      property_name: 'choice',
      placeholder: 'Choose one',
      options: 'None,Option A,Option B',
      required: true,
      show_input_on_selection: false,
      selection_input_key: 'choice_detail',
      selection_input_property_name: 'choice_detail',
      selection_input_placeholder: 'Enter details',
      selection_input_required: false,
      selection_input_type: 'text'
    },
    time: {
      key: 'event_time',
      type: 'time',
      enabled: true,
      property_name: 'event_time',
      label: 'Time',
      placeholder: 'Select time',
      required: false
    },
    date: {
      key: 'event_date',
      type: 'date',
      enabled: true,
      property_name: 'event_date',
      placeholder: 'Select date',
      required: false
    },
    year: {
      key: 'year_field',
      type: 'year',
      enabled: true,
      property_name: 'year_field',
      placeholder: 'Select year',
      required: false
    },
    year_range: {
      key: 'entry_exit_years',
      type: 'year_range',
      enabled: true,
      placeholder: 'Entry Year - Exit Year',
      entry_label: 'Entry year',
      exit_label: 'Exit year',
      entry_property_name: 'Entry Year',
      exit_property_name: 'Exit Year',
      year_min: 1900,
      required: false
    },
    text_color: {
      key: 'text_color',
      type: 'text_color',
      enabled: true,
      required: true
    },
    background_color: {
      key: 'background_color',
      type: 'background_color',
      enabled: true,
      required: true
    },
    size: {
      key: 'size',
      type: 'size',
      enabled: true,
      label: 'Select Size (inches)',
      property_name: 'Size',
      options: '18x24,24x36',
      required: true
    },
    size_and_orientation: {
      key: 'size_and_orientation',
      type: 'size_and_orientation',
      enabled: true,
      label: 'Size and Orientation',
      property_name: 'Size and Orientation',
      placeholder: 'Size and Orientation',
      required: true
    },
    radio: {
      key: 'orientation',
      type: 'radio',
      enabled: true,
      label: 'Orientation',
      property_name: 'Orientation',
      options: 'Portrait,Landscape',
      required: true
    },
    custom_message: {
      key: 'custom_message',
      type: 'custom_message',
      enabled: true,
      label: 'Custom Message',
      property_name: 'Custom Message',
      required: true,
      use_selector: false,
      selector_label: 'Message type',
      selector_property_name: 'Custom Message Type',
      options: CUSTOM_MESSAGE_DEFAULTS.map(function (label) {
        return { label: label };
      }),
      option_groups: [
        {
          label: 'Option 1',
          value: 'Option 1',
          messages: CUSTOM_MESSAGE_DEFAULTS.slice(0, 3).map(function (label) {
            return { label: label };
          })
        },
        {
          label: 'Option 2',
          value: 'Option 2',
          messages: CUSTOM_MESSAGE_DEFAULTS.slice(3).map(function (label) {
            return { label: label };
          })
        }
      ]
    },
    repeatable: {
      key: 'guest',
      type: 'repeatable',
      enabled: true,
      property_name: 'guest',
      placeholder: 'Guest name',
      add_label: '+ Add',
      max_items: 5,
      required: false
    },
    input_group: {
      key: 'input_group',
      type: 'input_group',
      enabled: true,
      label: 'Input group',
      min_filled: 1,
      max_filled: '',
      inputs: [
        {
          key: 'item_1',
          property_name: 'item_1',
          placeholder: 'Item 1',
          required: false
        },
        {
          key: 'item_2',
          property_name: 'item_2',
          placeholder: 'Item 2',
          required: false
        }
      ]
    },
    upload: {
      key: 'file_upload',
      type: 'upload',
      enabled: true,
      property_name: 'Uploaded File',
      label: 'Upload file',
      select_label: 'Select files',
      upload_label: 'Upload',
      accept: 'image/*,.pdf',
      multiple: true,
      max_files: 5,
      max_size_mb: 10,
      upload_endpoint: '',
      upload_preset: '',
      dropbox_sync: true,
      dropbox_folder: '/custom_wedding_posters',
      required: false
    },
    voice_block: {
      key: 'message_voice',
      type: 'voice_block',
      enabled: true,
      audio_asset: 'wedding-poster.m4a',
      audio_id: 'wizard-voice-audio',
      canvas_id: 'wizard-voice-canvas'
    }
  };

  var root = document.getElementById('product-form-config-builder');
  if (!root) return;

  var sampleEl = document.getElementById('product-form-config-sample');
  var sampleConfig = null;
  if (sampleEl) {
    try {
      sampleConfig = JSON.parse(sampleEl.textContent);
    } catch (e) {
      sampleConfig = { steps: [] };
    }
  }

  var state = {
    heading: 'Customize Your Sign',
    steps: [],
    activeField: null
  };

  var els = {
    steps: root.querySelector('[data-pfcb-steps]'),
    json: root.querySelector('[data-pfcb-json]'),
    importArea: root.querySelector('[data-pfcb-import]'),
    builderPanel: root.querySelector('[data-pfcb-builder-panel]'),
    jsonPanel: root.querySelector('[data-pfcb-json-panel]'),
    jsonStatus: root.querySelector('[data-pfcb-json-status]')
  };

  var jsonIndicationEnabled = false;

  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function slugify(text) {
    return String(text || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '') || 'field';
  }

  function nextStepNumber() {
    if (!state.steps.length) return 1;
    return Math.max.apply(null, state.steps.map(function (s) { return s.number; })) + 1;
  }

  function uniqueKey(base, stepIndex) {
    var key = slugify(base);
    var step = state.steps[stepIndex];
    var keys = (step.fields || []).map(function (f) { return f.key; });
    if (keys.indexOf(key) === -1) return key;
    var i = 2;
    while (keys.indexOf(key + '_' + i) !== -1) i += 1;
    return key + '_' + i;
  }

  function createStep() {
    var num = nextStepNumber();
    var step = {
      number: num,
      title: num + '. Step ' + num,
      nav_label: '',
      fields: []
    };
    if (num === 1) {
      step.fields = [createField('text_color'), createField('background_color')];
    }
    return step;
  }

  function createField(type) {
    var base = clone(TYPE_DEFAULTS[type] || TYPE_DEFAULTS.text);
    base.type = type;
    return base;
  }

  function isProtectedFieldType(type) {
    return type === 'text_color' || type === 'background_color';
  }

  function protectedFieldLabel(type) {
    if (type === 'text_color') return 'Text colour';
    if (type === 'background_color') return 'Background colour';
    return type;
  }

  function ensureRequiredColorFields() {
    if (!state.steps.length) return;
    var step = state.steps[0];
    if (!step.fields) step.fields = [];
    var types = step.fields.map(function (f) { return f.type; });
    var toPrepend = [];
    if (types.indexOf('text_color') === -1) toPrepend.push(createField('text_color'));
    if (types.indexOf('background_color') === -1) toPrepend.push(createField('background_color'));
    if (toPrepend.length) step.fields = toPrepend.concat(step.fields);
    step.fields.forEach(function (field) {
      if (isProtectedFieldType(field.type)) {
        field.required = true;
      }
    });
  }

  function loadConfig(config) {
    if (!config || !Array.isArray(config.steps)) {
      throw new Error('JSON must have a "steps" array.');
    }
    state.heading = config.heading || 'Customize Your Sign';
    state.steps = clone(config.steps);
    state.activeField = null;
    renumberSteps();
    ensureRequiredColorFields();
    render();
  }

  function renumberSteps() {
    state.steps.forEach(function (step, index) {
      step.number = index + 1;
    });
  }

  function cleanField(field) {
    var out = {};
    var keys = Object.keys(field);
    keys.sort();
    keys.forEach(function (key) {
      var val = field[key];
      if (val === '' || val === null || val === undefined) return;
      if (typeof val === 'boolean' && val === false && key !== 'enabled') {
        // Keep explicit false for select "required" so optional selects stay optional in JSON.
        if (!(field.type === 'select' && key === 'required')) return;
      }
      if (key === 'additional_charge' && (typeof val !== 'number' || val <= 0)) return;
      if (key === 'max_items' && (typeof val !== 'number' || val <= 0)) return;
      if (key === 'max_files' && (typeof val !== 'number' || val <= 0)) return;
      if (key === 'max_size_mb' && (typeof val !== 'number' || val <= 0)) return;
      out[key] = val;
    });
    if (out.enabled === undefined) out.enabled = true;
    if (isProtectedFieldType(out.type)) {
      out.required = true;
    }
    if (out.type === 'select') {
      out.required = field.required !== false;
    }
    if (out.type === 'input_group' && Array.isArray(out.inputs)) {
      out.inputs = out.inputs.map(cleanGroupInput).filter(function (input) {
        return input && input.key;
      });
      if (!out.inputs.length) delete out.inputs;
      if (typeof out.min_filled === 'number' && out.min_filled <= 0) delete out.min_filled;
      if (typeof out.max_filled !== 'number' || out.max_filled <= 0) {
        delete out.max_filled;
      } else if (typeof out.min_filled === 'number' && out.max_filled < out.min_filled) {
        out.max_filled = out.min_filled;
      }
    }
    if (out.validation && typeof out.validation === 'object') {
      var validation = {};
      if (typeof out.validation.max_length === 'number' && out.validation.max_length > 0) {
        validation.max_length = out.validation.max_length;
      }
      if (out.validation.alphanumeric_only === true) {
        validation.alphanumeric_only = true;
      }
      if (Object.keys(validation).length) {
        out.validation = validation;
      } else {
        delete out.validation;
      }
    }
    if (out.type === 'select' && !out.show_input_on_selection) {
      delete out.show_input_on_selection;
      delete out.selection_input_key;
      delete out.selection_input_property_name;
      delete out.selection_input_placeholder;
      delete out.selection_input_required;
      delete out.selection_input_type;
    }
    if (out.type === 'select' && out.show_input_on_selection) {
      if (out.selection_input_type === 'property_date') {
        delete out.selection_input_key;
        delete out.selection_input_property_name;
        delete out.selection_input_placeholder;
      } else {
        delete out.selection_input_type;
        if (!out.selection_input_key && out.key) {
          out.selection_input_key = out.key + '_detail';
        }
        if (!out.selection_input_property_name && out.selection_input_key) {
          out.selection_input_property_name = out.selection_input_key;
        }
      }
    }
    if (out.type === 'select' && !out.options_source) delete out.options_source;
    if (out.type === 'select' && !out.option_modes) delete out.option_modes;
    if (out.type === 'select' && !out.hide_selection_values) delete out.hide_selection_values;
    if (out.type === 'select' && !out.show_selection_values) delete out.show_selection_values;
    if (out.type === 'select' && out.date_properties) {
      var dateProps = {};
      if (out.date_properties.date) dateProps.date = out.date_properties.date;
      if (out.date_properties.year) dateProps.year = out.date_properties.year;
      if (out.date_properties.circa_year) dateProps.circa_year = out.date_properties.circa_year;
      if (Object.keys(dateProps).length) {
        out.date_properties = dateProps;
      } else {
        delete out.date_properties;
      }
    }
    if (out.type === 'custom_message') {
      out.options = normalizeCustomMessageOptions(out.options);
      if (!out.options.length) delete out.options;
      out.option_groups = normalizeCustomMessageGroups(out.option_groups);
      if (!out.use_selector) {
        delete out.use_selector;
        delete out.option_groups;
        delete out.selector_label;
        delete out.selector_property_name;
      } else if (!out.option_groups.length) {
        delete out.option_groups;
      }
    }
    return out;
  }

  function normalizeCustomMessageOptions(options) {
    if (!Array.isArray(options)) return [];
    return options
      .map(function (option) {
        if (typeof option === 'string') {
          var text = option.trim();
          return text ? { label: text } : null;
        }
        if (option && typeof option === 'object') {
          var label = String(option.label || '').trim();
          return label ? { label: label } : null;
        }
        return null;
      })
      .filter(Boolean);
  }

  function normalizeCustomMessageGroups(groups) {
    if (!Array.isArray(groups)) return [];
    return groups
      .map(function (group) {
        if (!group || typeof group !== 'object') return null;
        var label = String(group.label || group.value || '').trim();
        var value = String(group.value || group.label || '').trim();
        if (!label && !value) return null;
        return {
          label: label || value,
          value: value || label,
          messages: normalizeCustomMessageOptions(group.messages)
        };
      })
      .filter(Boolean);
  }

  /** Keep empty rows while editing so "+ Add" blank options stay visible. */
  function customMessageOptionsForEditor(options) {
    if (!Array.isArray(options) || !options.length) return [{ label: '' }];
    return options.map(function (option) {
      if (typeof option === 'string') return { label: option };
      if (option && typeof option === 'object') return { label: String(option.label || '') };
      return { label: '' };
    });
  }

  function customMessageGroupsForEditor(groups) {
    if (!Array.isArray(groups) || !groups.length) {
      return [
        { label: 'Option 1', value: 'Option 1', messages: [{ label: '' }] },
        { label: 'Option 2', value: 'Option 2', messages: [{ label: '' }] }
      ];
    }
    return groups.map(function (group) {
      return {
        label: String((group && group.label) || (group && group.value) || ''),
        value: String((group && group.value) || (group && group.label) || ''),
        messages: customMessageOptionsForEditor(group && group.messages)
      };
    });
  }

  function cleanGroupInput(input) {
    var out = {};
    if (!input || typeof input !== 'object') return out;
    if (input.key) out.key = input.key;
    if (input.type) out.type = input.type;
    if (input.property_name) out.property_name = input.property_name;
    if (input.placeholder) out.placeholder = input.placeholder;
    if (input.options) out.options = input.options;
    if (input.options_source) out.options_source = input.options_source;
    if (input.info_label) out.info_label = input.info_label;
    if (typeof input.additional_charge === 'number' && input.additional_charge > 0) {
      out.additional_charge = input.additional_charge;
    }
    if (input.required === true) out.required = true;
    if (input.show_help === true) out.show_help = true;
    if (input.help_title) out.help_title = input.help_title;
    if (input.help_body) out.help_body = input.help_body;
    if (input.validation && typeof input.validation === 'object') {
      var validation = {};
      if (typeof input.validation.max_length === 'number' && input.validation.max_length > 0) {
        validation.max_length = input.validation.max_length;
      }
      if (input.validation.alphanumeric_only === true) {
        validation.alphanumeric_only = true;
      }
      if (Object.keys(validation).length) out.validation = validation;
    }
    return out;
  }

  function uniqueGroupInputKey(field, base) {
    var key = slugify(base);
    var keys = (field.inputs || []).map(function (input) { return input.key; });
    if (keys.indexOf(key) === -1) return key;
    var i = 2;
    while (keys.indexOf(key + '_' + i) !== -1) i += 1;
    return key + '_' + i;
  }

  function createGroupInput(field) {
    var count = (field.inputs || []).length + 1;
    var key = uniqueGroupInputKey(field, 'item_' + count);
    return {
      key: key,
      property_name: key,
      placeholder: 'Item ' + count,
      required: false
    };
  }

  function inputGroupEditorHtml(field) {
    var inputs = field.inputs || [];
    var html = '<div class="pfcb__input-group-editor" style="margin-top:0.85rem">';
    html += '<div class="pfcb__grid pfcb__grid--2" style="margin-bottom:0.75rem">';
    html += inputField('Group label', 'label', field.label || '', 'text');
    html += inputField('Minimum filled inputs', 'min_filled', field.min_filled || 0, 'number');
    html += inputField('Maximum filled inputs', 'max_filled', field.max_filled || '', 'number');
    html += inputField('Wrap class', 'wrap_class', field.wrap_class || '', 'text');
    html += '</div>';
    html += '<div class="pfcb__input-group-list">';
    inputs.forEach(function (input, index) {
      html += inputGroupRowHtml(input, index, inputs.length);
    });
    html += '</div>';
    html += '<button type="button" class="pfcb__btn" data-action="add-group-input" style="margin-top:0.65rem">+ Add text input</button>';
    html += '<p class="pfcb__help-inline">Customers must fill at least the minimum and no more than the maximum (leave maximum blank for no limit). Individual inputs can also be marked required or validated.</p>';
    html += '</div>';
    return html;
  }

  function inputGroupRowHtml(input, index, total) {
    var validation = input.validation || {};
    return (
      '<article class="pfcb__input-group-row" data-group-input-index="' + index + '">' +
      '<div class="pfcb__input-group-row-head">' +
      '<strong>Text input ' + (index + 1) + '</strong>' +
      '<div class="pfcb__field-actions">' +
      '<button type="button" class="pfcb__icon-btn" data-action="group-input-up" title="Move up">↑</button>' +
      '<button type="button" class="pfcb__icon-btn" data-action="group-input-down" title="Move down">↓</button>' +
      (total > 1 ? '<button type="button" class="pfcb__icon-btn pfcb__btn--danger" data-action="remove-group-input" title="Remove">×</button>' : '') +
      '</div></div>' +
      '<div class="pfcb__grid pfcb__grid--2">' +
      '<div class="pfcb__field"><label>Type</label><select data-group-input-prop="type">' +
      '<option value="text"' + ((input.type || 'text') === 'text' ? ' selected' : '') + '>Text</option>' +
      '<option value="select"' + (input.type === 'select' ? ' selected' : '') + '>Select</option>' +
      '</select></div>' +
      '<div class="pfcb__field"><label>Placeholder</label><input type="text" data-group-input-prop="placeholder" value="' + escapeHtml(input.placeholder || '') + '"></div>' +
      '<div class="pfcb__field"><label>Key</label><input type="text" data-group-input-prop="key" value="' + escapeHtml(input.key || '') + '"></div>' +
      '<div class="pfcb__field"><label>Property name</label><input type="text" data-group-input-prop="property_name" value="' + escapeHtml(input.property_name || '') + '"></div>' +
      '<div class="pfcb__field"><label>Options (select only)</label><input type="text" data-group-input-prop="options" value="' + escapeHtml(input.options || '') + '"></div>' +
      '<div class="pfcb__field"><label>Max length</label><input type="number" min="1" data-group-input-prop="max_length" value="' + escapeHtml(validation.max_length || '') + '" placeholder="No limit"></div>' +
      '<div class="pfcb__field"><label>Additional charge (AUD)</label><input type="number" min="0" step="0.01" data-group-input-prop="additional_charge" value="' + escapeHtml(input.additional_charge || '') + '" placeholder="0"></div>' +
      '</div>' +
      '<div class="pfcb__field" style="margin-top:0.5rem">' +
      '<label>Info label</label>' +
      '<textarea data-group-input-prop="info_label" placeholder="Optional extra. Additional charge applies. ($20.00)">' +
      escapeHtml(input.info_label || '') + '</textarea>' +
      '</div>' +
      '<div style="margin-top:0.65rem"><strong>Help tooltip</strong></div>' +
      '<div class="pfcb__grid pfcb__grid--2" style="margin-top:0.5rem">' +
      '<label class="pfcb__checkbox"><input type="checkbox" data-group-input-prop="show_help"' + (input.show_help === true ? ' checked' : '') + '><span>Show help</span></label>' +
      '<div class="pfcb__field"><label>Help title</label><input type="text" data-group-input-prop="help_title" value="' + escapeHtml(input.help_title || '') + '"></div>' +
      '<div class="pfcb__field" style="grid-column:1/-1"><label>Help body</label><textarea data-group-input-prop="help_body" placeholder="Help text shown in the tooltip">' +
      escapeHtml(input.help_body || '') + '</textarea></div>' +
      '</div>' +
      '<div class="pfcb__grid pfcb__grid--2" style="margin-top:0.5rem">' +
      '<label class="pfcb__checkbox"><input type="checkbox" data-group-input-prop="required"' + (input.required === true ? ' checked' : '') + '><span>Required</span></label>' +
      '<label class="pfcb__checkbox"><input type="checkbox" data-group-input-prop="alphanumeric_only"' + (validation.alphanumeric_only === true ? ' checked' : '') + '><span>Alphanumeric only (allows spaces)</span></label>' +
      '</div></article>'
    );
  }

  function syncInputGroupFromEditor(field, editor) {
    var rows = editor.querySelectorAll('.pfcb__input-group-row');
    field.inputs = Array.prototype.map.call(rows, function (row) {
      var input = { validation: {} };
      row.querySelectorAll('[data-group-input-prop]').forEach(function (el) {
        var prop = el.getAttribute('data-group-input-prop');
        if (el.type === 'checkbox') {
          if (!el.checked) return;
          if (prop === 'required') input.required = true;
          if (prop === 'show_help') input.show_help = true;
          if (prop === 'alphanumeric_only') input.validation.alphanumeric_only = true;
          return;
        }
        if (el.type === 'number') {
          if (prop === 'additional_charge') {
            if (el.value !== '') input.additional_charge = Number(el.value);
            return;
          }
          if (el.value !== '') input.validation.max_length = Number(el.value);
          return;
        }
        if (prop === 'info_label') {
          if (el.value !== '') input.info_label = el.value;
          return;
        }
        if (prop === 'help_title' || prop === 'help_body') {
          if (el.value !== '') input[prop] = el.value;
          return;
        }
        input[prop] = el.value;
      });
      if (!input.validation.max_length) delete input.validation.max_length;
      if (!input.validation.alphanumeric_only) delete input.validation.alphanumeric_only;
      if (!Object.keys(input.validation).length) delete input.validation;
      if (!input.property_name && input.key) input.property_name = input.key;
      return input;
    });
  }

  function customMessageEditorHtml(field) {
    var useSelector = !!field.use_selector;
    var html = '<div class="pfcb__custom-message-editor" style="margin-top:0.85rem">';
    html += checkboxField('Use select box to switch radio message sets', 'use_selector', useSelector);
    html += '<p class="pfcb__help-inline">When enabled, customers first choose Option 1 / Option 2 (etc.), then only that option’s radio messages are shown.</p>';

    if (useSelector) {
      html += '<div class="pfcb__grid pfcb__grid--2" style="margin-top:0.75rem">';
      html += inputField('Select label', 'selector_label', field.selector_label || 'Message type', 'text');
      html += inputField('Select property name', 'selector_property_name', field.selector_property_name || 'Custom Message Type', 'text');
      html += '</div>';
      html += '<div style="margin:0.85rem 0 0.5rem"><strong>Select options + radio messages</strong></div>';
      var groups = customMessageGroupsForEditor(field.option_groups);
      html += '<div class="pfcb__custom-message-groups">';
      groups.forEach(function (group, groupIndex) {
        html += customMessageGroupRowHtml(group, groupIndex, groups.length);
      });
      html += '</div>';
      html += '<button type="button" class="pfcb__btn" data-action="add-custom-message-group" style="margin-top:0.65rem">+ Add select option</button>';
    } else {
      var options = customMessageOptionsForEditor(field.options);
      if (!normalizeCustomMessageOptions(field.options).length && options.length === 1 && !options[0].label) {
        options = CUSTOM_MESSAGE_DEFAULTS.map(function (label) {
          return { label: label };
        });
      }
      html += '<div style="margin:0.85rem 0 0.5rem"><strong>Radio message options</strong></div>';
      html += '<p class="pfcb__help-inline">Each option becomes a radio button. Use placeholders like <code>[House Number &amp; Street Name]</code> or <code>[Entry year – Exit year]</code> in the label text.</p>';
      html += '<div class="pfcb__custom-message-list">';
      options.forEach(function (option, index) {
        html += customMessageOptionRowHtml(option, index, options.length);
      });
      html += '</div>';
      html += '<button type="button" class="pfcb__btn" data-action="add-custom-message-option" style="margin-top:0.65rem">+ Add radio option</button>';
    }

    html += '</div>';
    return html;
  }

  function customMessageGroupRowHtml(group, groupIndex, totalGroups) {
    var messages = customMessageOptionsForEditor(group.messages);
    var html = '<article class="pfcb__input-group-row" data-custom-message-group-index="' + groupIndex + '">';
    html += '<div class="pfcb__input-group-row-head">';
    html += '<strong>Select option ' + (groupIndex + 1) + '</strong>';
    html += '<div class="pfcb__field-actions">';
    html += '<button type="button" class="pfcb__icon-btn" data-action="custom-message-group-up" title="Move up">↑</button>';
    html += '<button type="button" class="pfcb__icon-btn" data-action="custom-message-group-down" title="Move down">↓</button>';
    if (totalGroups > 1) {
      html += '<button type="button" class="pfcb__icon-btn pfcb__btn--danger" data-action="remove-custom-message-group" title="Remove">×</button>';
    }
    html += '</div></div>';
    html += '<div class="pfcb__grid pfcb__grid--2" style="margin-top:0.5rem">';
    html += '<div class="pfcb__field"><label>Option label</label><input type="text" data-custom-message-group-prop="label" value="' +
      escapeHtml(group.label || '') + '" placeholder="Option 1"></div>';
    html += '<div class="pfcb__field"><label>Option value</label><input type="text" data-custom-message-group-prop="value" value="' +
      escapeHtml(group.value || '') + '" placeholder="Option 1"></div>';
    html += '</div>';
    html += '<div style="margin:0.75rem 0 0.35rem"><strong>Radio messages for this option</strong></div>';
    html += '<div class="pfcb__custom-message-list">';
    messages.forEach(function (message, messageIndex) {
      html += customMessageGroupedOptionRowHtml(message, groupIndex, messageIndex, messages.length);
    });
    html += '</div>';
    html += '<button type="button" class="pfcb__btn" data-action="add-custom-message-group-option" style="margin-top:0.5rem">+ Add radio message</button>';
    html += '</article>';
    return html;
  }

  function customMessageOptionRowHtml(option, index, total) {
    return (
      '<article class="pfcb__input-group-row" data-custom-message-index="' + index + '">' +
      '<div class="pfcb__input-group-row-head">' +
      '<strong>Option ' + (index + 1) + '</strong>' +
      '<div class="pfcb__field-actions">' +
      '<button type="button" class="pfcb__icon-btn" data-action="custom-message-up" title="Move up">↑</button>' +
      '<button type="button" class="pfcb__icon-btn" data-action="custom-message-down" title="Move down">↓</button>' +
      (total > 1 ? '<button type="button" class="pfcb__icon-btn pfcb__btn--danger" data-action="remove-custom-message-option" title="Remove">×</button>' : '') +
      '</div></div>' +
      '<div class="pfcb__field" style="margin-top:0.5rem">' +
      '<label>Label</label>' +
      '<textarea data-custom-message-prop="label" rows="4" placeholder="Enter message text">' +
      escapeHtml(option.label || '') +
      '</textarea>' +
      '</div></article>'
    );
  }

  function customMessageGroupedOptionRowHtml(option, groupIndex, index, total) {
    return (
      '<article class="pfcb__input-group-row" data-custom-message-group-index="' + groupIndex + '" data-custom-message-index="' + index + '">' +
      '<div class="pfcb__input-group-row-head">' +
      '<strong>Message ' + (index + 1) + '</strong>' +
      '<div class="pfcb__field-actions">' +
      '<button type="button" class="pfcb__icon-btn" data-action="custom-message-group-option-up" title="Move up">↑</button>' +
      '<button type="button" class="pfcb__icon-btn" data-action="custom-message-group-option-down" title="Move down">↓</button>' +
      (total > 1 ? '<button type="button" class="pfcb__icon-btn pfcb__btn--danger" data-action="remove-custom-message-group-option" title="Remove">×</button>' : '') +
      '</div></div>' +
      '<div class="pfcb__field" style="margin-top:0.5rem">' +
      '<label>Label</label>' +
      '<textarea data-custom-message-prop="label" rows="3" placeholder="Enter message text">' +
      escapeHtml(option.label || '') +
      '</textarea>' +
      '</div></article>'
    );
  }

  function syncCustomMessageFromEditor(field, editor) {
    var useSelectorEl = editor.querySelector('[data-prop="use_selector"]');
    field.use_selector = !!(useSelectorEl && useSelectorEl.checked);
    if (field.use_selector) {
      var groupRows = editor.querySelectorAll('.pfcb__custom-message-groups > [data-custom-message-group-index]');
      field.option_groups = Array.prototype.map.call(groupRows, function (row) {
        var labelEl = row.querySelector('[data-custom-message-group-prop="label"]');
        var valueEl = row.querySelector('[data-custom-message-group-prop="value"]');
        var label = labelEl ? String(labelEl.value || '').trim() : '';
        var value = valueEl ? String(valueEl.value || '').trim() : '';
        var list = null;
        var children = row.children;
        for (var i = 0; i < children.length; i += 1) {
          if (children[i].classList && children[i].classList.contains('pfcb__custom-message-list')) {
            list = children[i];
            break;
          }
        }
        var messageRows = list
          ? list.querySelectorAll(':scope > [data-custom-message-index]')
          : row.querySelectorAll('.pfcb__custom-message-list > [data-custom-message-index]');
        var messages = Array.prototype.map.call(messageRows, function (messageRow) {
          var messageEl = messageRow.querySelector('[data-custom-message-prop="label"]');
          return { label: messageEl ? String(messageEl.value || '') : '' };
        });
        return {
          label: label || value || 'Option',
          value: value || label || 'Option',
          messages: messages
        };
      });
    } else {
      var rows = editor.querySelectorAll('.pfcb__custom-message-list > [data-custom-message-index]');
      field.options = Array.prototype.map.call(rows, function (row) {
        var labelEl = row.querySelector('[data-custom-message-prop="label"]');
        return { label: labelEl ? String(labelEl.value || '') : '' };
      });
    }
  }

  function supportsValidationRules(type) {
    return type === 'text' || type === 'textarea' || type === 'repeatable';
  }

  function validationEditorHtml(field) {
    if (!supportsValidationRules(field.type)) return '';
    var validation = field.validation || {};
    var html = '<div style="margin-top:0.85rem"><strong>Validation</strong></div>';
    html += '<div class="pfcb__grid pfcb__grid--2" style="margin-top:0.5rem">';
    html += (
      '<div class="pfcb__field">' +
      '<label>Max length</label>' +
      '<input type="number" min="1" data-validation-prop="max_length" value="' +
      escapeHtml(validation.max_length || '') + '" placeholder="No limit">' +
      '</div>'
    );
    html += checkboxField(
      'Alphanumeric only (letters, numbers and spaces — no special characters)',
      'validation_alphanumeric_only',
      validation.alphanumeric_only === true
    );
    html += '</div>';
    return html;
  }

  function exportConfig() {
    return {
      heading: state.heading || 'Customize Your Sign',
      steps: state.steps.map(function (step) {
        var stepOut = {
          number: step.number,
          title: step.title || '',
          nav_label: step.nav_label || '',
          fields: (step.fields || []).map(cleanField)
        };
        return stepOut;
      })
    };
  }

  function getConfigStats() {
    var stepCount = state.steps.length;
    var fieldCount = state.steps.reduce(function (total, step) {
      return total + (step.fields || []).length;
    }, 0);
    return { stepCount: stepCount, fieldCount: fieldCount };
  }

  function showToast(message, options) {
    options = options || {};
    var type = options.type || 'info';
    var detail = options.detail || '';

    var ToastifyCtor = typeof window !== 'undefined' ? window.Toastify : undefined;
    if (typeof ToastifyCtor !== 'function') {
      window.alert(detail ? message + '\n' + detail : message);
      return;
    }

    var palette = {
      success: { background: '#0f766e', icon: 'hgi-checkmark-circle-02' },
      error: { background: '#b91c1c', icon: 'hgi-alert-circle' },
      info: { background: '#1f2937', icon: 'hgi-information-circle' }
    };
    var theme = palette[type] || palette.info;

    var content = document.createElement('div');
    content.className = 'pfcb-toastify__content';
    content.innerHTML =
      '<i class="hgi hgi-stroke hgi-rounded ' + theme.icon + ' pfcb-toastify__icon" aria-hidden="true"></i>' +
      '<div class="pfcb-toastify__text">' +
      '<strong class="pfcb-toastify__title">' + escapeHtml(message) + '</strong>' +
      (detail ? '<span class="pfcb-toastify__detail">' + escapeHtml(detail) + '</span>' : '') +
      '</div>';

    var toast = ToastifyCtor({
      node: content,
      duration: options.duration || (type === 'success' ? 3500 : 4500),
      close: true,
      gravity: 'top',
      position: 'right',
      stopOnFocus: true,
      escapeMarkup: false,
      ariaLive: type === 'error' ? 'assertive' : 'polite',
      className: 'pfcb-toastify product-page-toastify',
      style: {
        background: theme.background,
        color: '#fff',
        boxShadow: '0 10px 28px rgba(15, 23, 42, 0.22)',
        maxWidth: 'min(22rem, calc(100vw - 2rem))',
        padding: '0.85rem 1rem',
        borderRadius: '0.65rem',
        cursor: 'default',
        fontFamily: 'inherit',
        fontSize: '0.9375rem',
        lineHeight: '1.4'
      }
    });

    toast.showToast();

    var closeBtn = toast.toastElement && toast.toastElement.querySelector('.toast-close');
    if (closeBtn) {
      closeBtn.innerHTML =
        '<i class="hgi hgi-stroke hgi-rounded hgi-cancel-01 product-page-toastify__close-icon" aria-hidden="true"></i>';
    }
  }

  function showCopySuccessToast() {
    var stats = getConfigStats();
    var detail = stats.stepCount + ' step' + (stats.stepCount === 1 ? '' : 's') +
      ' · ' + stats.fieldCount + ' field' + (stats.fieldCount === 1 ? '' : 's') +
      ' — paste into Product Form Configuration';
    showToast('JSON copied to clipboard', { type: 'success', detail: detail });
  }

  function afterImportSuccess(stats) {
    if (els.importArea) {
      els.importArea.value = '';
    }

    showToast('JSON imported', {
      type: 'success',
      detail: stats.stepCount + ' step' + (stats.stepCount === 1 ? '' : 's') +
        ' · ' + stats.fieldCount + ' field' + (stats.fieldCount === 1 ? '' : 's') +
        ' — edit below, then copy when ready'
    });

    if (els.builderPanel) {
      els.builderPanel.classList.add('pfcb__panel--imported');
      clearTimeout(afterImportSuccess._highlightTimer);
      afterImportSuccess._highlightTimer = setTimeout(function () {
        els.builderPanel.classList.remove('pfcb__panel--imported');
      }, 1800);

      els.builderPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function copyJsonToClipboard() {
    var text = els.json.value;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).then(showCopySuccessToast).catch(function () {
        els.json.select();
        try {
          document.execCommand('copy');
          showCopySuccessToast();
        } catch (e) {
          showToast('Could not copy automatically', {
            type: 'error',
            detail: 'Select the JSON panel and press Cmd+C / Ctrl+C'
          });
        }
      });
    }

    els.json.select();
    try {
      document.execCommand('copy');
      showCopySuccessToast();
    } catch (e) {
      showToast('Could not copy automatically', {
        type: 'error',
        detail: 'Select the JSON panel and press Cmd+C / Ctrl+C'
      });
    }
    return Promise.resolve();
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function sanitizeHelpBodyHtml(html) {
    var container = document.createElement('div');
    container.innerHTML = html || '';
    container.querySelectorAll('script, style, iframe, object, embed').forEach(function (node) {
      node.remove();
    });
    container.querySelectorAll('*').forEach(function (node) {
      Array.prototype.slice.call(node.attributes).forEach(function (attr) {
        if (/^on/i.test(attr.name)) node.removeAttribute(attr.name);
      });
    });
    var cleaned = container.innerHTML.trim();
    if (!cleaned || cleaned === '<br>' || cleaned === '<div><br></div>') return '';
    return cleaned;
  }

  function helpBodyEditorHtml(field) {
    return (
      '<div class="pfcb__field pfcb__field--richtext" style="grid-column:1/-1">' +
      '<label>Help body</label>' +
      '<div class="pfcb__richtext" data-help-body-editor>' +
      '<div class="pfcb__richtext-toolbar" data-richtext-toolbar role="toolbar" aria-label="Help body formatting">' +
      '<button type="button" class="pfcb__richtext-btn" data-format="bold" title="Bold"><strong>B</strong></button>' +
      '<button type="button" class="pfcb__richtext-btn" data-format="italic" title="Italic"><em>I</em></button>' +
      '<button type="button" class="pfcb__richtext-btn" data-format="insertUnorderedList" title="Bullet list">• List</button>' +
      '<button type="button" class="pfcb__richtext-btn" data-format="createLink" title="Insert link">Link</button>' +
      '<button type="button" class="pfcb__richtext-btn" data-format="removeFormat" title="Clear formatting">Clear</button>' +
      '</div>' +
      '<div class="pfcb__richtext-editor" contenteditable="true" data-richtext-editor role="textbox" aria-multiline="true"></div>' +
      '</div>' +
      '<p class="pfcb__help-inline">Format help text with bold, italic, lists, and links. Shown in the product wizard help tooltip.</p>' +
      '</div>'
    );
  }

  function initHelpBodyEditor(stepIndex, fieldIndex, editor) {
    var rte = editor.querySelector('[data-richtext-editor]');
    if (!rte || rte.dataset.rteBound === '1') return;
    rte.dataset.rteBound = '1';

    var field = state.steps[stepIndex].fields[fieldIndex];
    rte.innerHTML = field.help_body || '';

    var toolbar = editor.querySelector('[data-richtext-toolbar]');
    if (toolbar) {
      toolbar.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-format]');
        if (!btn) return;
        e.preventDefault();
        rte.focus();
        var cmd = btn.getAttribute('data-format');
        if (cmd === 'createLink') {
          var url = window.prompt('Link URL (include https://)');
          if (url) document.execCommand('createLink', false, url);
        } else {
          document.execCommand(cmd, false, null);
        }
        updateFieldFromEditor(stepIndex, fieldIndex, editor);
        renderJson();
      });
    }

    rte.addEventListener('input', function () {
      updateFieldFromEditor(stepIndex, fieldIndex, editor);
      renderJson();
    });

    rte.addEventListener('paste', function (e) {
      e.preventDefault();
      var text = (e.clipboardData || window.clipboardData).getData('text/plain');
      document.execCommand('insertText', false, text);
      updateFieldFromEditor(stepIndex, fieldIndex, editor);
      renderJson();
    });
  }

  function fieldLabel(field) {
    if (isProtectedFieldType(field.type)) return protectedFieldLabel(field.type);
    if (field.type === 'input_group') {
      var count = (field.inputs || []).length;
      var title = field.label || field.key || 'Input group';
      return count ? title + ' (' + count + ' inputs)' : title;
    }
    if (field.type === 'custom_message') {
      if (field.use_selector) {
        var groupCount = normalizeCustomMessageGroups(field.option_groups).length;
        var messageTitle = field.label || 'Custom Message';
        return groupCount ? messageTitle + ' (' + groupCount + ' select options)' : messageTitle;
      }
      var optionCount = normalizeCustomMessageOptions(field.options).length;
      var flatTitle = field.label || 'Custom Message';
      return optionCount ? flatTitle + ' (' + optionCount + ' options)' : flatTitle;
    }
    return field.placeholder || field.label || field.key || field.type;
  }

  function isActive(stepIndex, fieldIndex) {
    return state.activeField &&
      state.activeField.stepIndex === stepIndex &&
      state.activeField.fieldIndex === fieldIndex;
  }

  function renderFieldEditor(stepIndex, fieldIndex) {
    var field = state.steps[stepIndex].fields[fieldIndex];
    var type = field.type;
    var html = '<div class="pfcb__editor" data-pfcb-editor>';

    html += '<div class="pfcb__grid pfcb__grid--2">';
    if (isProtectedFieldType(type)) {
      html += '<div class="pfcb__field"><label>Type</label><input type="text" value="' +
        escapeHtml(protectedFieldLabel(type)) + '" readonly tabindex="-1"></div>';
      html += checkboxField('Enabled', 'enabled', field.enabled !== false);
      html += '<div class="pfcb__field"><label class="pfcb__checkbox"><input type="checkbox" checked disabled tabindex="-1"><span>Required</span></label>' +
        '<p class="pfcb__help-inline">Text colour and background colour are always required.</p></div>';
      if (type === 'background_color') {
        html += '<p class="pfcb__help-inline">Options are loaded from the product variant option named <strong>Background Colour</strong> / <strong>Background Color</strong> (including option swatches).</p>';
      }
      if (type === 'text_color') {
        html += '<p class="pfcb__help-inline">Options are loaded from the product variant option named <strong>Text Colour</strong> / <strong>Text Color</strong> (including option swatches).</p>';
      }
    } else if (type === 'input_group') {
      html += inputField('Key', 'key', field.key, 'text');
      html += selectField('Type', 'type', type, FIELD_TYPES);
      html += checkboxField('Enabled', 'enabled', field.enabled !== false);
    } else {
      html += inputField('Key', 'key', field.key, 'text');
      html += selectField('Type', 'type', type, FIELD_TYPES);
      html += inputField('Property name', 'property_name', field.property_name || '', 'text', !isInputFieldType(type) || type === 'year_range');
      html += checkboxField('Enabled', 'enabled', field.enabled !== false);
    }
    html += '</div>';

    if (type === 'input_group') {
      html += inputGroupEditorHtml(field);
    } else if (isInputFieldType(type)) {
      html += '<div class="pfcb__grid pfcb__grid--2" style="margin-top:0.75rem">';
      if (type !== 'textarea' && type !== 'custom_message' && type !== 'upload') {
        html += inputField(type === 'year_range' ? 'Field label' : 'Placeholder', 'placeholder', field.placeholder || '', 'text');
      }
      if (type === 'textarea') {
        html += inputField('Placeholder', 'placeholder', field.placeholder || '', 'text');
        html += inputField('Rows', 'rows', field.rows || 3, 'number');
      }
      if (type === 'year_range') {
        html += inputField('Entry year label', 'entry_label', field.entry_label || 'Entry year', 'text');
        html += inputField('Exit year label', 'exit_label', field.exit_label || 'Exit year', 'text');
        html += inputField('Entry property name', 'entry_property_name', field.entry_property_name || 'Entry Year', 'text');
        html += inputField('Exit property name', 'exit_property_name', field.exit_property_name || 'Exit Year', 'text');
        html += inputField('Year min', 'year_min', field.year_min || 1900, 'number');
        html += inputField('Year max (blank = current)', 'year_max', field.year_max || '', 'number');
        html += '<p class="pfcb__help-inline">Shows two year selectors side by side. Labels and cart property names are customizable.</p>';
      }
      if (type === 'time' || type === 'size' || type === 'radio' || type === 'size_and_orientation' || type === 'custom_message' || type === 'upload') {
        html += inputField('Label', 'label', field.label || '', 'text');
      }
      if (type === 'upload') {
        html += inputField('Select files button label', 'select_label', field.select_label || 'Select files', 'text');
        html += inputField('Upload button label', 'upload_label', field.upload_label || 'Upload', 'text');
        html += inputField('Accepted file types', 'accept', field.accept || 'image/*,.pdf', 'text');
        html += checkboxField('Allow multiple files', 'multiple', field.multiple !== false);
        html += inputField('Max files', 'max_files', field.max_files || 5, 'number');
        html += inputField('Max file size (MB)', 'max_size_mb', field.max_size_mb || 10, 'number');
        html += inputField('Upload endpoint URL', 'upload_endpoint', field.upload_endpoint || '', 'text');
        html += inputField('Upload preset (Cloudinary)', 'upload_preset', field.upload_preset || '', 'text');
        html += checkboxField('Sync to Dropbox after upload', 'dropbox_sync', field.dropbox_sync !== false);
        html += inputField('Dropbox folder override', 'dropbox_folder', field.dropbox_folder || '/custom_wedding_posters', 'text');
        html += '<p class="pfcb__help-inline">Customers select files, then click Upload. Leave Upload endpoint empty to send files to the Dropbox proxy from Theme settings (recommended). Or set Cloudinary <code>https://api.cloudinary.com/v1_1/CLOUD_NAME/auto/upload</code> + preset; with Dropbox sync enabled the theme then asks the proxy to <code>save_url</code> into <code>/custom_wedding_posters/{fileName}</code>.</p>';
      }
      if (type === 'size_and_orientation') {
        html += '<p class="pfcb__help-inline">Options are loaded from the product variant option named <strong>Size and Orientation</strong>.</p>';
      }
      if (type === 'select' || type === 'size' || type === 'radio') {
        html += inputField('Options (comma-separated)', 'options', field.options || '', 'text');
      }
      if (type === 'select') {
        html += selectField('Options source', 'options_source', field.options_source || '', [
          { value: '', label: 'Manual options list' },
          { value: 'countries', label: 'Countries list (AU, FR, DE, IT, JP, SE, UK, US, Other)' }
        ]);
        if (field.options_source === 'countries') {
          html += '<p class="pfcb__help-inline">Uses a fixed country list. Selecting <strong>Other</strong> shows a text input so the customer can type a country.</p>';
        }
        html += inputField('Option modes (comma-separated)', 'option_modes', field.option_modes || '', 'text');
        html += inputField('Hide selection values', 'hide_selection_values', field.hide_selection_values || '', 'text');
        html += inputField('Show input only for values', 'show_selection_values', field.show_selection_values || '', 'text');
        html += checkboxField('Show input on selection', 'show_input_on_selection', !!field.show_input_on_selection || field.options_source === 'countries');
        if (field.show_input_on_selection || field.options_source === 'countries') {
          html += selectField('Selection input type', 'selection_input_type', field.selection_input_type || 'text', [
            { value: 'text', label: 'Text input' },
            { value: 'property_date', label: 'Property date (year range / year / date)' }
          ]);
          html += checkboxField('Selection input required', 'selection_input_required', !!field.selection_input_required);
          if ((field.selection_input_type || 'text') !== 'property_date') {
            html += '<div class="pfcb__grid pfcb__grid--2" style="margin-top:0.5rem">';
            html += inputField('Selection input key', 'selection_input_key', field.selection_input_key || '', 'text');
            html += inputField('Selection input property name', 'selection_input_property_name', field.selection_input_property_name || '', 'text');
            html += inputField('Selection input placeholder', 'selection_input_placeholder', field.selection_input_placeholder || (field.options_source === 'countries' ? 'Enter country' : ''), 'text');
            html += '</div>';
          } else {
            html += '<p class="pfcb__help-inline">Use option labels containing <strong>Entry</strong> + <strong>Exit</strong> for a year range, <strong>Single Year</strong>, <strong>Year</strong>, or <strong>Birth year</strong> for one year, <strong>CIRCA</strong> for circa year, <strong>Exact date</strong>, <strong>Birth date</strong>, or <strong>Current</strong> for a calendar date picker, and <strong>No Record</strong> to hide inputs. Or set explicit <strong>option_modes</strong> (date, year, circa_year, year_range, no_record).</p>';
            html += inputField('Date property name', 'date_properties.date', (field.date_properties && field.date_properties.date) || '', 'text');
            html += inputField('Year property name', 'date_properties.year', (field.date_properties && field.date_properties.year) || '', 'text');
            html += inputField('Circa year property name', 'date_properties.circa_year', (field.date_properties && field.date_properties.circa_year) || '', 'text');
          }
          html += '<p class="pfcb__help-inline">Shows an extra input after the customer picks an option. Use <strong>Show input only for values</strong> (e.g. <code>Other</code>) to limit when it appears. Hidden when the select value is empty or &quot;None&quot;.</p>';
        }
      }
      if (type === 'text') {
        html += inputField('Autocomplete', 'autocomplete', field.autocomplete || '', 'text');
        html += inputField('Input class', 'input_class', field.input_class || '', 'text');
      }
      if (type === 'repeatable') {
        html += inputField('No. of items to repeat', 'max_items', field.max_items || '', 'number');
        html += inputField('Add button label', 'add_label', field.add_label || '+ Add', 'text');
        html += inputField('Input class', 'input_class', field.input_class || '', 'text');
        html += '<p class="pfcb__help-inline">Maximum number of rows the customer can add. Leave empty for no limit.</p>';
      }
      if (type !== 'voice_block') {
        if (type === 'select') {
          html += checkboxField('Required', 'required', field.required !== false);
        } else {
          html += checkboxField('Required', 'required', !!field.required);
        }
      }
      html += inputField('Wrap class', 'wrap_class', field.wrap_class || '', 'text');
      html += '</div>';
      if (type === 'custom_message') {
        html += customMessageEditorHtml(field);
      }
      html += validationEditorHtml(field);
    }

    if (type === 'voice_block') {
      html += '<div class="pfcb__grid pfcb__grid--2" style="margin-top:0.75rem">';
      html += inputField('Audio asset', 'audio_asset', field.audio_asset || '', 'text');
      html += inputField('Audio ID', 'audio_id', field.audio_id || '', 'text');
      html += inputField('Canvas ID', 'canvas_id', field.canvas_id || '', 'text');
      html += inputField('Audio URL override', 'audio_src', field.audio_src || '', 'text');
      html += '</div>';
    }

    html += '<div style="margin-top:0.85rem"><strong>Additional charge</strong></div>';
    html += '<div class="pfcb__field" style="margin-top:0.5rem">';
    html += '<label>Charge when customer uses this field (AUD, e.g. 20)</label>';
    html += '<input type="number" min="0" step="0.01" data-prop="additional_charge" value="' +
      escapeHtml(field.additional_charge || '') + '" placeholder="0">';
    html += '<p class="pfcb__help-inline">Applied when the customer enters or selects a value. Updates product, cart, and checkout pricing.</p>';
    html += '</div>';

    html += '<div style="margin-top:0.85rem"><strong>Info label</strong></div>';
    html += '<div class="pfcb__field" style="margin-top:0.5rem">';
    html += '<label>Text shown below the input</label>';
    html += '<textarea data-prop="info_label" placeholder="Optional extra. Additional charge applies. ($20.00)">' +
      escapeHtml(field.info_label || '') + '</textarea>';
    html += '</div>';

    html += '<div style="margin-top:0.85rem"><strong>Help &amp; media</strong></div>';
    html += '<div class="pfcb__grid pfcb__grid--2" style="margin-top:0.5rem">';
    html += checkboxField('Show help', 'show_help', !!field.show_help);
    html += inputField('Help title', 'help_title', field.help_title || '', 'text');
    html += helpBodyEditorHtml(field);
    html += checkboxField('Show voice', 'show_voice', !!field.show_voice);
    html += inputField('Voice asset', 'voice_src', field.voice_src || '', 'text');
    html += checkboxField('Show video', 'show_video', !!field.show_video);
    html += inputField('Video index (eg 6)', 'media_url', field.media_url || '', 'number');
    html += '</div>';

    html += '</div>';
    return html;
  }

  function isInputFieldType(type) {
    return type !== 'text_color' && type !== 'background_color' && type !== 'voice_block' && type !== 'input_group';
  }

  function inputField(label, prop, value, inputType, hidden) {
    if (hidden) return '';
    return (
      '<div class="pfcb__field">' +
      '<label>' + escapeHtml(label) + '</label>' +
      '<input type="' + inputType + '" data-prop="' + prop + '" value="' + escapeHtml(value) + '">' +
      '</div>'
    );
  }

  function selectField(label, prop, value, options) {
    var opts = options.map(function (o) {
      return '<option value="' + escapeHtml(o.value) + '"' + (o.value === value ? ' selected' : '') + '>' +
        escapeHtml(o.label) + '</option>';
    }).join('');
    return (
      '<div class="pfcb__field">' +
      '<label>' + escapeHtml(label) + '</label>' +
      '<select data-prop="' + prop + '">' + opts + '</select>' +
      '</div>'
    );
  }

  function checkboxField(label, prop, checked) {
    return (
      '<label class="pfcb__checkbox">' +
      '<input type="checkbox" data-prop="' + prop + '"' + (checked ? ' checked' : '') + '>' +
      '<span>' + escapeHtml(label) + '</span>' +
      '</label>'
    );
  }

  function renderSteps() {
    var html = '';
    html += '<div class="pfcb__global-settings">';
    html += '<label class="pfcb__global-label" for="pfcb-wizard-heading">Wizard heading</label>';
    html += '<input id="pfcb-wizard-heading" type="text" data-config-prop="heading" value="' +
      escapeHtml(state.heading || '') + '" placeholder="Customize Your Sign">';
    html += '</div>';

    if (!state.steps.length) {
      html += '<p class="pfcb__empty">No steps yet. Click <strong>Add step</strong> to begin.</p>';
      els.steps.innerHTML = html;
      return;
    }
    state.steps.forEach(function (step, stepIndex) {
      html += '<article class="pfcb__step" data-step-index="' + stepIndex + '">';
      html += '<div class="pfcb__step-head">';
      html += '<span class="pfcb__step-title">Step ' + step.number + '</span>';
      html += '<input type="text" data-step-prop="title" value="' + escapeHtml(step.title || '') + '" placeholder="Step title" style="flex:2;min-width:10rem">';
      html += '<input type="text" data-step-prop="nav_label" value="' + escapeHtml(step.nav_label || '') + '" placeholder="Nav label (optional)" style="flex:1;min-width:8rem">';
      html += '<div class="pfcb__field-actions">';
      html += '<button type="button" class="pfcb__icon-btn" data-action="step-up" title="Move up">↑</button>';
      html += '<button type="button" class="pfcb__icon-btn" data-action="step-down" title="Move down">↓</button>';
      html += '<button type="button" class="pfcb__icon-btn pfcb__btn--danger" data-action="step-delete" title="Delete step">Delete</button>';
      html += '</div>';
      html += '</div>';

      (step.fields || []).forEach(function (field, fieldIndex) {
        var active = isActive(stepIndex, fieldIndex);
        html += '<div class="pfcb__field-row' + (field.enabled === false ? ' is-disabled' : '') + (active ? ' is-active' : '') + '" data-field-index="' + fieldIndex + '">';
        html += '<span class="pfcb__badge">' + escapeHtml(field.type) + '</span>';
        html += '<button type="button" class="pfcb__icon-btn" style="text-align:left" data-action="field-edit">' +
          escapeHtml(fieldLabel(field)) + ' <span style="color:#6b7280">(' + escapeHtml(field.key) + ')</span></button>';
        html += '<div class="pfcb__field-actions">';
        html += '<button type="button" class="pfcb__icon-btn" data-action="field-toggle" title="Enable/disable">' +
          (field.enabled === false ? 'Off' : 'On') + '</button>';
        html += '<button type="button" class="pfcb__icon-btn" data-action="field-up" title="Move up">↑</button>';
        html += '<button type="button" class="pfcb__icon-btn" data-action="field-down" title="Move down">↓</button>';
        if (!isProtectedFieldType(field.type)) {
          html += '<button type="button" class="pfcb__icon-btn pfcb__btn--danger" data-action="field-delete" title="Delete">×</button>';
        }
        html += '</div>';
        html += '</div>';
        if (active) {
          html += renderFieldEditor(stepIndex, fieldIndex);
        }
      });

      html += '<div style="padding:0.65rem 0.75rem;border-top:1px solid var(--pfcb-border)">';
      html += '<select data-action="add-field-type" style="margin-right:0.5rem">';
      FIELD_TYPES.forEach(function (t) {
        html += '<option value="' + t.value + '">' + escapeHtml(t.label) + '</option>';
      });
      html += '</select>';
      html += '<button type="button" class="pfcb__btn" data-action="add-field">+ Add field</button>';
      html += '</div>';
      html += '</article>';
    });

    els.steps.innerHTML = html;
  }

  function indicateJsonUpdated() {
    if (els.jsonPanel) {
      els.jsonPanel.classList.remove('pfcb__panel--json-updated');
      void els.jsonPanel.offsetWidth;
      els.jsonPanel.classList.add('pfcb__panel--json-updated');
      clearTimeout(indicateJsonUpdated._panelTimer);
      indicateJsonUpdated._panelTimer = setTimeout(function () {
        els.jsonPanel.classList.remove('pfcb__panel--json-updated');
      }, 900);
    }

    if (els.json) {
      els.json.classList.remove('pfcb__json--updated');
      void els.json.offsetWidth;
      els.json.classList.add('pfcb__json--updated');
      clearTimeout(indicateJsonUpdated._jsonTimer);
      indicateJsonUpdated._jsonTimer = setTimeout(function () {
        els.json.classList.remove('pfcb__json--updated');
      }, 900);
    }

    if (els.jsonStatus) {
      els.jsonStatus.hidden = false;
      els.jsonStatus.classList.add('is-visible');
      clearTimeout(indicateJsonUpdated._statusTimer);
      indicateJsonUpdated._statusTimer = setTimeout(function () {
        els.jsonStatus.classList.remove('is-visible');
        els.jsonStatus.hidden = true;
      }, 1400);
    }
  }

  function renderJson() {
    els.json.value = JSON.stringify(exportConfig(), null, 2);
    if (jsonIndicationEnabled) {
      indicateJsonUpdated();
    }
  }

  function render() {
    renderSteps();
    renderJson();
  }

  function moveItem(arr, from, to) {
    if (to < 0 || to >= arr.length) return;
    var item = arr.splice(from, 1)[0];
    arr.splice(to, 0, item);
  }

  function updateFieldFromEditor(stepIndex, fieldIndex, editor) {
    var field = state.steps[stepIndex].fields[fieldIndex];
    editor.querySelectorAll('[data-prop]').forEach(function (el) {
      var prop = el.getAttribute('data-prop');
      if (prop === 'validation_alphanumeric_only') return;
      if (prop.indexOf('.') !== -1) {
        var parts = prop.split('.');
        var parent = field;
        for (var i = 0; i < parts.length - 1; i += 1) {
          if (!parent[parts[i]] || typeof parent[parts[i]] !== 'object') {
            parent[parts[i]] = {};
          }
          parent = parent[parts[i]];
        }
        parent[parts[parts.length - 1]] = el.value;
        return;
      }
      if (el.type === 'checkbox') {
        field[prop] = el.checked;
      } else if (el.type === 'number') {
        field[prop] = el.value === '' ? undefined : Number(el.value);
      } else {
        field[prop] = el.value;
      }
    });

    if (supportsValidationRules(field.type)) {
      field.validation = field.validation || {};
      editor.querySelectorAll('[data-validation-prop]').forEach(function (el) {
        var prop = el.getAttribute('data-validation-prop');
        if (el.type === 'number') {
          field.validation[prop] = el.value === '' ? undefined : Number(el.value);
        }
      });
      var alphaCheckbox = editor.querySelector('[data-prop="validation_alphanumeric_only"]');
      if (alphaCheckbox) {
        field.validation.alphanumeric_only = alphaCheckbox.checked;
      }
      if (!field.validation.max_length) delete field.validation.max_length;
      if (!field.validation.alphanumeric_only) delete field.validation.alphanumeric_only;
      if (!Object.keys(field.validation).length) delete field.validation;
    }

    if (field.type === 'input_group') {
      syncInputGroupFromEditor(field, editor);
    }

    if (field.type === 'custom_message') {
      syncCustomMessageFromEditor(field, editor);
    }

    var helpBodyEditor = editor.querySelector('[data-richtext-editor]');
    if (helpBodyEditor) {
      field.help_body = sanitizeHelpBodyHtml(helpBodyEditor.innerHTML);
    }

    if (field.type === 'text_color' || field.type === 'background_color') {
      field.key = field.type;
      field.required = true;
    }

    if (!field.property_name && isInputFieldType(field.type) && field.type !== 'year_range') {
      field.property_name = field.key;
    }
    if (field.type === 'year_range') {
      delete field.property_name;
      if (!field.entry_label) field.entry_label = 'Entry year';
      if (!field.exit_label) field.exit_label = 'Exit year';
      if (!field.entry_property_name) field.entry_property_name = 'Entry Year';
      if (!field.exit_property_name) field.exit_property_name = 'Exit Year';
      if (!field.placeholder) field.placeholder = 'Entry Year - Exit Year';
    }
  }

  function bindEditorEvents(stepIndex, fieldIndex, editor) {
    initHelpBodyEditor(stepIndex, fieldIndex, editor);

    editor.addEventListener('input', function (e) {
      if (e.target.closest('[data-richtext-editor]')) return;
      updateFieldFromEditor(stepIndex, fieldIndex, editor);
      renderJson();
      var row = editor.previousElementSibling;
      if (row) {
        var btn = row.querySelector('[data-action="field-edit"]');
        if (btn) {
          btn.innerHTML = escapeHtml(fieldLabel(state.steps[stepIndex].fields[fieldIndex])) +
            ' <span style="color:#6b7280">(' + escapeHtml(state.steps[stepIndex].fields[fieldIndex].key) + ')</span>';
        }
      }
    });

    editor.addEventListener('change', function (e) {
      var prop = e.target.getAttribute('data-prop');
      if (prop === 'use_selector') {
        updateFieldFromEditor(stepIndex, fieldIndex, editor);
        var field = state.steps[stepIndex].fields[fieldIndex];
        if (field.use_selector) {
          if (!Array.isArray(field.option_groups) || !field.option_groups.length) {
            field.option_groups = [
              {
                label: 'Option 1',
                value: 'Option 1',
                messages: normalizeCustomMessageOptions(field.options).slice(0, 3)
              },
              {
                label: 'Option 2',
                value: 'Option 2',
                messages: normalizeCustomMessageOptions(field.options).slice(3)
              }
            ];
            if (!field.option_groups[0].messages.length) {
              field.option_groups[0].messages = CUSTOM_MESSAGE_DEFAULTS.slice(0, 3).map(function (label) {
                return { label: label };
              });
            }
            if (!field.option_groups[1].messages.length) {
              field.option_groups[1].messages = CUSTOM_MESSAGE_DEFAULTS.slice(3).map(function (label) {
                return { label: label };
              });
            }
          }
          field.selector_label = field.selector_label || 'Message type';
          field.selector_property_name = field.selector_property_name || 'Custom Message Type';
        }
        render();
        return;
      }
      if (prop && e.target.type === 'checkbox') {
        updateFieldFromEditor(stepIndex, fieldIndex, editor);
        renderJson();
        return;
      }
      if (prop === 'show_input_on_selection' || prop === 'selection_input_type' || prop === 'options_source') {
        updateFieldFromEditor(stepIndex, fieldIndex, editor);
        var field = state.steps[stepIndex].fields[fieldIndex];
        if (prop === 'options_source' && field.options_source === 'countries') {
          field.show_input_on_selection = true;
          field.selection_input_type = 'text';
          field.show_selection_values = field.show_selection_values || 'Other';
          field.selection_input_placeholder = field.selection_input_placeholder || 'Enter country';
          field.selection_input_required = field.selection_input_required !== false;
          if (!field.selection_input_key && field.key) {
            field.selection_input_key = field.key + '_other';
          }
          if (!field.selection_input_property_name && field.property_name) {
            field.selection_input_property_name = field.property_name + ' (Other)';
          }
        }
        render();
        return;
      }
      if (prop === 'type') {
        var newType = e.target.value;
        var current = state.steps[stepIndex].fields[fieldIndex];
        var oldKey = current.key;
        var merged = clone(TYPE_DEFAULTS[newType] || TYPE_DEFAULTS.text);
        merged.key = oldKey || merged.key;
        merged.type = newType;
        if (newType === 'input_group' && current.type === 'input_group') {
          merged.label = current.label || merged.label;
          merged.min_filled = current.min_filled !== undefined ? current.min_filled : merged.min_filled;
          merged.max_filled = current.max_filled !== undefined ? current.max_filled : merged.max_filled;
          merged.inputs = current.inputs && current.inputs.length ? current.inputs : merged.inputs;
          merged.wrap_class = current.wrap_class;
        }
        if (
          newType !== 'input_group' &&
          newType !== 'year_range' &&
          (merged.property_name === merged.key || !merged.property_name)
        ) {
          merged.property_name = oldKey;
        }
        if (newType === 'year_range') {
          delete merged.property_name;
        }
        state.steps[stepIndex].fields[fieldIndex] = merged;
        render();
      }
    });
  }

  root.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-action]');
    if (!btn) return;

    var action = btn.getAttribute('data-action');
    var stepEl = btn.closest('[data-step-index]');
    var stepIndex = stepEl ? Number(stepEl.getAttribute('data-step-index')) : -1;
    var fieldRow = btn.closest('[data-field-index]');
    var fieldIndex = fieldRow ? Number(fieldRow.getAttribute('data-field-index')) : -1;

    if (action === 'add-step') {
      state.steps.push(createStep());
      renumberSteps();
      render();
      return;
    }

    if (action === 'load-sample' && sampleConfig) {
      loadConfig(sampleConfig);
      var sampleStats = getConfigStats();
      showToast('Sample config loaded', {
        type: 'info',
        detail: sampleStats.stepCount + ' steps · ' + sampleStats.fieldCount + ' fields'
      });
      return;
    }

    if (action === 'copy-json') {
      copyJsonToClipboard();
      return;
    }

    if (action === 'import-json') {
      var raw = els.importArea ? els.importArea.value.trim() : '';
      if (!raw) {
        showToast('Nothing to import', {
          type: 'error',
          detail: 'Paste JSON into the import box first'
        });
        return;
      }

      try {
        loadConfig(JSON.parse(raw));
        afterImportSuccess(getConfigStats());
      } catch (err) {
        showToast('Invalid JSON', {
          type: 'error',
          detail: err.message || 'Check the format and try again'
        });
      }
      return;
    }

    if (stepIndex < 0) return;

    if (action === 'step-delete') {
      if (!window.confirm('Delete this step and all its fields?')) return;
      state.steps.splice(stepIndex, 1);
      state.activeField = null;
      renumberSteps();
      render();
      return;
    }

    if (action === 'step-up') {
      moveItem(state.steps, stepIndex, stepIndex - 1);
      renumberSteps();
      render();
      return;
    }

    if (action === 'step-down') {
      moveItem(state.steps, stepIndex, stepIndex + 1);
      renumberSteps();
      render();
      return;
    }

    if (action === 'add-field') {
      var select = stepEl.querySelector('[data-action="add-field-type"]');
      var type = select ? select.value : 'text';
      if (isProtectedFieldType(type)) {
        var exists = state.steps.some(function (step) {
          return (step.fields || []).some(function (field) { return field.type === type; });
        });
        if (exists) {
          showToast('Field already present', {
            type: 'info',
            detail: protectedFieldLabel(type) + ' is required and cannot be added twice'
          });
          return;
        }
      }
      var field = createField(type);
      field.key = uniqueKey(field.key, stepIndex);
      if (type !== 'input_group') {
        field.property_name = field.key;
      }
      state.steps[stepIndex].fields.push(field);
      state.activeField = { stepIndex: stepIndex, fieldIndex: state.steps[stepIndex].fields.length - 1 };
      render();
      return;
    }

    if (
      action === 'add-group-input' ||
      action === 'remove-group-input' ||
      action === 'group-input-up' ||
      action === 'group-input-down'
    ) {
      var groupEditor = btn.closest('[data-pfcb-editor]');
      if (!groupEditor) return;
      var groupStepEl = groupEditor.closest('[data-step-index]');
      var groupFieldRow = groupEditor.previousElementSibling;
      if (!groupStepEl || !groupFieldRow) return;
      var groupStepIndex = Number(groupStepEl.getAttribute('data-step-index'));
      var groupFieldIndex = Number(groupFieldRow.getAttribute('data-field-index'));
      var groupField = state.steps[groupStepIndex].fields[groupFieldIndex];
      if (!groupField || groupField.type !== 'input_group') return;
      if (!groupField.inputs) groupField.inputs = [];
      syncInputGroupFromEditor(groupField, groupEditor);
      var groupRow = btn.closest('[data-group-input-index]');
      var groupRowIndex = groupRow ? Number(groupRow.getAttribute('data-group-input-index')) : -1;
      if (action === 'add-group-input') {
        groupField.inputs.push(createGroupInput(groupField));
      } else if (action === 'remove-group-input' && groupField.inputs.length > 1 && groupRowIndex >= 0) {
        groupField.inputs.splice(groupRowIndex, 1);
      } else if (action === 'group-input-up' && groupRowIndex > 0) {
        moveItem(groupField.inputs, groupRowIndex, groupRowIndex - 1);
      } else if (action === 'group-input-down' && groupRowIndex >= 0 && groupRowIndex < groupField.inputs.length - 1) {
        moveItem(groupField.inputs, groupRowIndex, groupRowIndex + 1);
      }
      state.activeField = { stepIndex: groupStepIndex, fieldIndex: groupFieldIndex };
      render();
      return;
    }

    if (
      action === 'add-custom-message-option' ||
      action === 'remove-custom-message-option' ||
      action === 'custom-message-up' ||
      action === 'custom-message-down' ||
      action === 'add-custom-message-group' ||
      action === 'remove-custom-message-group' ||
      action === 'custom-message-group-up' ||
      action === 'custom-message-group-down' ||
      action === 'add-custom-message-group-option' ||
      action === 'remove-custom-message-group-option' ||
      action === 'custom-message-group-option-up' ||
      action === 'custom-message-group-option-down'
    ) {
      var messageEditor = btn.closest('[data-pfcb-editor]');
      if (!messageEditor) return;
      var messageStepEl = messageEditor.closest('[data-step-index]');
      var messageFieldRow = messageEditor.previousElementSibling;
      if (!messageStepEl || !messageFieldRow) return;
      var messageStepIndex = Number(messageStepEl.getAttribute('data-step-index'));
      var messageFieldIndex = Number(messageFieldRow.getAttribute('data-field-index'));
      var messageField = state.steps[messageStepIndex].fields[messageFieldIndex];
      if (!messageField || messageField.type !== 'custom_message') return;
      syncCustomMessageFromEditor(messageField, messageEditor);

      if (!messageField.use_selector) {
        if (!Array.isArray(messageField.options)) messageField.options = [];
        var messageRow = btn.closest('[data-custom-message-index]');
        var messageRowIndex = messageRow ? Number(messageRow.getAttribute('data-custom-message-index')) : -1;
        if (action === 'add-custom-message-option') {
          messageField.options.push({ label: '' });
        } else if (action === 'remove-custom-message-option' && messageField.options.length > 1 && messageRowIndex >= 0) {
          messageField.options.splice(messageRowIndex, 1);
        } else if (action === 'custom-message-up' && messageRowIndex > 0) {
          moveItem(messageField.options, messageRowIndex, messageRowIndex - 1);
        } else if (
          action === 'custom-message-down' &&
          messageRowIndex >= 0 &&
          messageRowIndex < messageField.options.length - 1
        ) {
          moveItem(messageField.options, messageRowIndex, messageRowIndex + 1);
        }
      } else {
        if (!Array.isArray(messageField.option_groups)) messageField.option_groups = [];
        var groupArticle = btn.closest('[data-custom-message-group-index]');
        // Prefer the outer select-option article (direct child of groups list).
        while (
          groupArticle &&
          groupArticle.parentElement &&
          !groupArticle.parentElement.classList.contains('pfcb__custom-message-groups')
        ) {
          groupArticle = groupArticle.parentElement.closest('[data-custom-message-group-index]');
        }
        var groupIndex = groupArticle ? Number(groupArticle.getAttribute('data-custom-message-group-index')) : -1;
        var nestedMessageRow = btn.closest('[data-custom-message-index]');
        var nestedMessageIndex = nestedMessageRow ? Number(nestedMessageRow.getAttribute('data-custom-message-index')) : -1;

        if (action === 'add-custom-message-group') {
          messageField.option_groups.push({
            label: 'Option ' + (messageField.option_groups.length + 1),
            value: 'Option ' + (messageField.option_groups.length + 1),
            messages: [{ label: '' }]
          });
        } else if (action === 'remove-custom-message-group' && messageField.option_groups.length > 1 && groupIndex >= 0) {
          messageField.option_groups.splice(groupIndex, 1);
        } else if (action === 'custom-message-group-up' && groupIndex > 0) {
          moveItem(messageField.option_groups, groupIndex, groupIndex - 1);
        } else if (
          action === 'custom-message-group-down' &&
          groupIndex >= 0 &&
          groupIndex < messageField.option_groups.length - 1
        ) {
          moveItem(messageField.option_groups, groupIndex, groupIndex + 1);
        } else if (groupIndex >= 0 && messageField.option_groups[groupIndex]) {
          var group = messageField.option_groups[groupIndex];
          if (!Array.isArray(group.messages)) group.messages = [];
          if (action === 'add-custom-message-group-option') {
            group.messages.push({ label: '' });
          } else if (
            action === 'remove-custom-message-group-option' &&
            group.messages.length > 1 &&
            nestedMessageIndex >= 0
          ) {
            group.messages.splice(nestedMessageIndex, 1);
          } else if (action === 'custom-message-group-option-up' && nestedMessageIndex > 0) {
            moveItem(group.messages, nestedMessageIndex, nestedMessageIndex - 1);
          } else if (
            action === 'custom-message-group-option-down' &&
            nestedMessageIndex >= 0 &&
            nestedMessageIndex < group.messages.length - 1
          ) {
            moveItem(group.messages, nestedMessageIndex, nestedMessageIndex + 1);
          }
        }
      }

      state.activeField = { stepIndex: messageStepIndex, fieldIndex: messageFieldIndex };
      render();
      return;
    }

    if (fieldIndex < 0) return;

    if (action === 'field-edit') {
      if (isActive(stepIndex, fieldIndex)) {
        state.activeField = null;
      } else {
        state.activeField = { stepIndex: stepIndex, fieldIndex: fieldIndex };
      }
      render();
      return;
    }

    if (action === 'field-toggle') {
      var f = state.steps[stepIndex].fields[fieldIndex];
      f.enabled = f.enabled === false;
      render();
      return;
    }

    if (action === 'field-delete') {
      var fieldToDelete = state.steps[stepIndex].fields[fieldIndex];
      if (isProtectedFieldType(fieldToDelete.type)) return;
      state.steps[stepIndex].fields.splice(fieldIndex, 1);
      state.activeField = null;
      render();
      return;
    }

    if (action === 'field-up') {
      moveItem(state.steps[stepIndex].fields, fieldIndex, fieldIndex - 1);
      state.activeField = { stepIndex: stepIndex, fieldIndex: fieldIndex - 1 };
      render();
      return;
    }

    if (action === 'field-down') {
      moveItem(state.steps[stepIndex].fields, fieldIndex, fieldIndex + 1);
      state.activeField = { stepIndex: stepIndex, fieldIndex: fieldIndex + 1 };
      render();
      return;
    }
  });

  root.addEventListener('input', function (e) {
    var configProp = e.target.getAttribute('data-config-prop');
    if (configProp) {
      state[configProp] = e.target.value;
      renderJson();
      return;
    }

    var stepProp = e.target.getAttribute('data-step-prop');
    if (!stepProp) return;
    var stepEl = e.target.closest('[data-step-index]');
    if (!stepEl) return;
    var stepIndex = Number(stepEl.getAttribute('data-step-index'));
    state.steps[stepIndex][stepProp] = e.target.value;
    renderJson();
  });

  root.addEventListener('focusin', function (e) {
    var editor = e.target.closest('[data-pfcb-editor]');
    if (!editor || editor._bound) return;
    editor._bound = true;
    var stepEl = editor.closest('[data-step-index]');
    var fieldRow = editor.previousElementSibling;
    if (!stepEl || !fieldRow) return;
    bindEditorEvents(
      Number(stepEl.getAttribute('data-step-index')),
      Number(fieldRow.getAttribute('data-field-index')),
      editor
    );
  });

  if (sampleConfig && sampleConfig.steps && sampleConfig.steps.length) {
    loadConfig(sampleConfig);
  } else {
    state.steps.push(createStep());
    render();
  }

  jsonIndicationEnabled = true;
})();
