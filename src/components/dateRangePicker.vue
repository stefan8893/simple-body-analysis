<template>
  <div class="q-pa-md">
    <q-input dense type="text" v-model="dateRangeFromInput" :color="color" @blur="onDateRangeInputBlur"
      ref="dateRangeInputElement" @keydown.enter.prevent="onDateRangeInputEnter"
      :rules="[val => isRangeInputValid(val)]" :lazy-rules="true">
      <template v-slot:append>
        <q-icon name="event" class="cursor-pointer">
          <q-popup-proxy ref="dateRangePickerPopup" transition-show="jump-down" transition-hide="jump-up"
            anchor="top start" transition-duration="300">
            <q-date landscape v-model="dateRangeFromPicker" range :mask="dateFormat" :color="color"
              :navigation-min-year-month="format(dateRangeLowerBound, 'yyyy/MM')"
              :navigation-max-year-month="format(dateRangeUpperBound, 'yyyy/MM')" first-day-of-week="1"
              :locale="deLocale" @range-end="onDatePickerRangeSelected(); dateRangePickerPopup?.hide()">
              <div class="row items-center justify-end">
                <q-btn dense v-close-popup label="Heute" :color="color" flat @click="setDateRange('Today')" />
              </div>
              <div class="row items-center justify-end">
                <q-btn dense v-close-popup label="Aktuelle Woche" :color="color" flat
                  @click="setDateRange('CurrentWeek')" />
              </div>
              <div class="row items-center justify-end">
                <q-btn dense v-close-popup label="Aktuelles Monat" :color="color" flat
                  @click="setDateRange('CurrentMonth')" />
              </div>
              <div class="row items-center justify-end">
                <q-btn dense v-close-popup label="Aktuelles Quartal" :color="color" flat
                  @click="setDateRange('CurrentQuarter')" />
              </div>
              <div class="row items-center justify-end">
                <q-btn dense v-close-popup label="Aktuelles Jahr" :color="color" flat
                  @click="setDateRange('CurrentYear')" />
              </div>
            </q-date>
          </q-popup-proxy>
        </q-icon>
      </template>
    </q-input>
  </div>
</template>

<script setup lang="ts">

import { endOfDay, endOfMonth, format, parse, parseISO, startOfDay, subDays } from 'date-fns';
import { de } from 'date-fns/locale';
import { QDate, QInput, QPopupProxy } from 'quasar';
import { Ref, ref, watch } from 'vue';
import { useDateRangePickerStringParser } from './dateRangeStringParser';

type ShortcutDateRanges = 'Today' | 'CurrentWeek' | 'CurrentMonth' | 'CurrentQuarter' | 'CurrentYear';

const props = defineProps({
  color: {
    type: String,
    defaultValue: 'grey-14'
  },
  initialFrom: {
    type: Date,
    default: subDays(new Date(), 28)
  },
  initialTo: {
    type: Date,
    default: new Date()
  }
});

const fromModel = defineModel('from', { required: true });
const toModel = defineModel('to', { required: true });
const emit = defineEmits(['submit']);

const dateFormat = 'DD.MM.YYYY';
const dateRangeLowerBound = parseISO('2024-01-01T00:00:00+01:00');
const dateRangeUpperBound = endOfMonth(new Date());

const { parseRangeInput, isRangeInputValid } = useDateRangePickerStringParser(dateRangeLowerBound, dateRangeUpperBound);

const deLocale = {
  days: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'],
  daysShort: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
  months: ['Jänner', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
  monthsShort: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
  firstDayOfWeek: 1,
  format24h: true,
  pluralDay: 'Tage'
};

export type DateRange = {
  from: string;
  to: string;
}

const toString = (dr: DateRange | string) => {
  if (typeof dr === 'string' || dr instanceof String)
    return `${dr} - ${dr}`;

  return `${dr.from} - ${dr.to}`;
};

const dateRangeInputElement = ref(null) as Ref<QInput | null>;
const dateRangePickerPopup = ref(null) as Ref<QPopupProxy | null>;

const initialFrom = !!props.initialFrom && props.initialFrom > dateRangeLowerBound ? props.initialFrom : subDays(new Date(), 28);
const initialTo = !!props.initialTo && props.initialTo < dateRangeUpperBound ? props.initialTo : new Date();

const dateRangeFromPicker = ref({
  from: format(initialFrom, 'P', { locale: de }),
  to: format(initialTo, 'P', { locale: de })
} as DateRange | string
);

const dateRangeFromInput = ref(toString(dateRangeFromPicker.value));

initializeModel();

function onDatePickerRangeSelected() {
  if (!dateRangeFromPicker.value)
    return;

  if (typeof dateRangeFromPicker.value == 'string')
    onSingleDateSelected(dateRangeFromPicker.value);
  else
    onDateRangeSelected(dateRangeFromPicker.value);
}

function onDateRangeSelected(dateRange: DateRange) {
  if (!dateRange.from || !dateRange.to)
    return;

  dateRangeFromInput.value = toString(dateRange);


  // give watcher a moment to catch the current value and set the model
  setTimeout(() => {
    // will remove a possible error message that was previously shown
    dateRangeInputElement.value?.validate();
    emit('submit');

  }, 30);
}

function onSingleDateSelected(date: string) {

  dateRangeFromInput.value = toString(date);
  dateRangeInputElement.value?.validate();

  if (!!date) {
    // give watcher a moment to catch the current value and set the model
    setTimeout(() => {
      // will remove a possible error message that was previously shown
      dateRangeInputElement.value?.validate();

      emit('submit');
    }, 30);
  }
}

function onDateRangeInputBlur() {
  const parsingResult = parseRangeInput(dateRangeFromInput.value);
  if (parsingResult.state !== 'valid')
    resetDateRangeFromPicker();
  else
    updateDateRangePicker(parsingResult.dateRange);
}

function updateDateRangePicker(dateRange: DateRange) {

  if (dateRange.from === dateRange.to)
    dateRangeFromPicker.value = dateRange.from;
  else
    dateRangeFromPicker.value = dateRange;

  dateRangeFromInput.value = toString(dateRange);
}


function onDateRangeInputEnter() {
  dateRangeInputElement.value?.validate();
  onDateRangeInputBlur();

  if (isRangeInputValid(dateRangeFromInput.value) === true)
    emit('submit');
}

function resetDateRangeFromPicker() {
  dateRangeFromPicker.value = { from: '', to: '' };
}

function initializeModel() {

  if (typeof dateRangeFromPicker.value == 'string') {
    fromModel.value = startOfDay(parse(dateRangeFromPicker.value, 'P', new Date(), { locale: de }));
    toModel.value = endOfDay(parse(dateRangeFromPicker.value, 'P', new Date(), { locale: de }));
  } else {
    fromModel.value = startOfDay(parse(dateRangeFromPicker.value.from, 'P', new Date(), { locale: de }));
    toModel.value = endOfDay(parse(dateRangeFromPicker.value.to, 'P', new Date(), { locale: de }));
  }
}

watch(dateRangeFromPicker, () => {
  if (!dateRangeFromPicker.value)
    return;

  if (typeof dateRangeFromPicker.value === 'string') {
    fromModel.value = startOfDay(parse(dateRangeFromPicker.value, 'P', new Date(), { locale: de }));
    toModel.value = endOfDay(parse(dateRangeFromPicker.value, 'P', new Date(), { locale: de }));
  }
  else if (!!dateRangeFromPicker.value.from && !!dateRangeFromPicker.value.to) {
    fromModel.value = startOfDay(parse(dateRangeFromPicker.value.from, 'P', new Date(), { locale: de }));
    toModel.value = endOfDay(parse(dateRangeFromPicker.value.to, 'P', new Date(), { locale: de }));
  }
});

watch(dateRangeFromInput, () => {
  if (!dateRangeFromInput.value)
    return;

  const parsingResult = parseRangeInput(dateRangeFromInput.value);
  if (parsingResult.state !== 'valid')
    return;


  fromModel.value = startOfDay(parse(parsingResult.dateRange.from, 'P', new Date(), { locale: de }));
  toModel.value = endOfDay(parse(parsingResult.dateRange.to, 'P', new Date(), { locale: de }));
});


function setDateRange(range: ShortcutDateRanges) {
  console.log(range);
}

</script>
