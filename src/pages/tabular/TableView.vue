<template>
  <q-page class="row items-center justify-evenly">

    <DateRangePicker v-model:from="from" v-model:to="to" color="blue-grey-8" @submit="onDateRangePickerSubmit">
    </DateRangePicker>

    <div class="q-pa-md">
      <q-table title="Körperanalyse" :rows="rows" :columns="columns" row-key="analysedAt" />
    </div>

  </q-page>
</template>

<script setup lang="ts">
import { QTableColumn } from 'quasar';
import { onMounted, ref, Ref } from 'vue';
import DateRangePicker from 'components/dateRangePicker.vue';

const rows = ref([]) as Ref<BodyAnalysis[]>;
const from = ref(null);
const to = ref(null);

function onDateRangePickerSubmit() {
  console.log('onMounted: ', from.value, to.value);
}

onMounted(async () => {

  console.log('onMounted: ', from.value, to.value);

  // let entitiesIterator = client.listEntities()
  // for await (const entity of entitiesIterator) {
  //   rows.value.push({
  //     analysedAt: format(new Date(entity.rowKey as string), 'Pp', { locale: de }),
  //     weight: entity.Weight as number,
  //     bmi: entity.Bmi as number,
  //     bodyFat: entity.BodyFat as number,
  //     bodyWater: entity.BodyWater as number,
  //     muscleMass: entity.MuscleMass as number,
  //     dailyCalorieRequirement: entity.DailyCalorieRequirement as number
  //   });
  // }

});

type BodyAnalysis = {
  analysedAt: string;
  weight: number;
  bmi: number;
  bodyFat: number;
  bodyWater: number;
  muscleMass: number;
  dailyCalorieRequirement: number;
}

const columns: QTableColumn<BodyAnalysis>[] = [
  {
    name: 'analysedAt',
    required: true,
    label: 'Erfasst',
    align: 'left',
    field: 'analysedAt',
    sortable: true
  },
  { name: 'weight', align: 'center', label: 'Gewicht', field: 'weight', sortable: true },
  { name: 'bmi', label: 'BMI', field: 'bmi', sortable: true },
  { name: 'bodyFat', label: 'Körperfett', field: 'bodyFat' },
  { name: 'bodyWater', label: 'Wasseranteil', field: 'bodyWater' },
  { name: 'muscleMass', label: 'Muskelmasse', field: 'muscleMass' },
  { name: 'dailyCalorieRequirement', label: 'Tägl. Kalorienbedarf', field: 'dailyCalorieRequirement' },
];

</script>
