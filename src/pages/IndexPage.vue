<template>
  <DashboadAnalysis v-if="isAuthenticated" />
  <LandingPage v-else />
</template>

<script setup lang="ts">
import LandingPage from './LandingPage.vue';
import DashboadAnalysis from './AnalysisDashboard.vue';
import { inject } from 'vue';
import { AuthContext, EmptyAuthContext } from 'src/auth/authContext';
import { authContextKey } from 'src/injection-keys';

const { isAuthenticated } = inject<AuthContext>(authContextKey, EmptyAuthContext);

</script>
