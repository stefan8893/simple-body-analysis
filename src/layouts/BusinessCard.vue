<template>
  <q-item v-ripple>
    <q-item-section side>
      <q-icon name="person" color="grey-9" size="2.2em"></q-icon>
    </q-item-section>
    <q-item-section>
      <q-item-label>{{ props.userName }}</q-item-label>
      <q-item-label caption> {{ props.email }}</q-item-label>
    </q-item-section>
  </q-item>
</template>

<script setup lang="ts">

const props = defineProps({
  email: {
    type: String,
    required: false,
    default: ''
  },
  userName: {
    type: String,
    required: false,
    default: ''
  }
});

</script>
