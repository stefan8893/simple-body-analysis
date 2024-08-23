<template>
  <div class="q-pa-md q-pt-lg q-gutter-md">
    <q-list padding class="rounded-borders" style="max-width: 350px">

      <RouterLink to="/" class="disable-link-styling">
        <q-item clickable v-ripple>
          <q-item-section avatar top>
            <q-avatar icon="home" color="blue-8" text-color="white" />
          </q-item-section>

          <q-item-section>
            <q-item-label lines="1">Home</q-item-label>
          </q-item-section>

        </q-item>
      </RouterLink>

      <RouterLink to="/daily" class="disable-link-styling">
        <q-item clickable v-ripple>
          <q-item-section avatar top>
            <q-avatar icon="calendar_view_week" color="light-green-9" text-color="white" />
          </q-item-section>

          <q-item-section>
            <q-item-label lines="1">Täglich</q-item-label>
          </q-item-section>

        </q-item>
      </RouterLink>

      <RouterLink to="/weekly" class="disable-link-styling">
        <q-item clickable v-ripple>
          <q-item-section avatar top>
            <q-avatar icon="calendar_month" color="brown-6" text-color="white" />
          </q-item-section>

          <q-item-section>
            <q-item-label lines="1">Wöchentlich</q-item-label>
          </q-item-section>

        </q-item>
      </RouterLink>

      <RouterLink to="/tabular" class="disable-link-styling">
        <q-item clickable v-ripple>
          <q-item-section avatar top>
            <q-avatar icon="table_chart" color="blue-grey-8" text-color="white" />
          </q-item-section>

          <q-item-section>
            <q-item-label lines="1">Tabular</q-item-label>
          </q-item-section>

        </q-item>
      </RouterLink>
    </q-list>

    <div class="row justify-center q-mt-xl">
      <div class="items-center">Version&nbsp;<q-badge outline color="teal">{{ version }}</q-badge></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { version } from '../../package.json'
</script>

<style lang="sass" scoped>
.my-card
  width: 100%
  max-width: 250px
</style>
