<template>
  <q-item clickable v-close-popup @click="$emit('click')">
    <q-item-section>
      <q-item-label>Logout</q-item-label>
    </q-item-section>
  </q-item>
</template>


<script setup lang="ts">

defineEmits(['click']);

</script>
