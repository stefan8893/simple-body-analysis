<template>
  <q-page class="row items-center justify-evenly">


    <div class="q-pa-md">
      <q-table title="Körperanalyse" :rows="rows" :columns="columns" row-key="analysedAt" />
    </div>


  </q-page>
</template>

<script setup lang="ts">
import { QTableColumn } from 'quasar';
import { TableClient } from '@azure/data-tables';
import { AccessToken, TokenCredential } from '@azure/identity';
import { inject, onMounted, ref, Ref } from 'vue';
import { AuthContext, EmptyAuthContext } from 'src/auth/authContext';
import { authContextKey } from 'src/injection-keys';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

const rows = ref([]) as Ref<BodyAnalysis[]>;

const { acquireAccessToken } = inject<AuthContext>(authContextKey, EmptyAuthContext);

onMounted(async () => {
  const accessToken = await acquireAccessToken(['https://storage.azure.com/user_impersonation']);

  const tokenAdapter: TokenCredential = {
    getToken: (): Promise<AccessToken | null> => Promise.resolve(<AccessToken>{
      token: accessToken,
      expiresOnTimestamp: Date.now() + 60 * 60 * 1000
    })
  }

  const client = new TableClient('https://simplebodyanalysis.table.core.windows.net', 'BodyAnalysis', tokenAdapter);

  let entitiesIterator = client.listEntities()
  for await (const entity of entitiesIterator) {
    rows.value.push({
      analysedAt: format(new Date(entity.rowKey as string), 'Pp', { locale: de }),
      weight: entity.Weight as number,
      bmi: entity.Bmi as number,
      bodyFat: entity.BodyFat as number,
      bodyWater: entity.BodyWater as number,
      muscleMass: entity.MuscleMass as number,
      dailyCalorieRequirement: entity.DailyCalorieRequirement as number
    });
  }

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
]




</script>
