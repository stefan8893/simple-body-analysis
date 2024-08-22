<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar class="bg-grey-9 text-white">
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />

        <q-toolbar-title>
          Simple Body Analysis
        </q-toolbar-title>

        <div v-if="!isAuthenticated">
          <q-btn round color="white" text-color="black" icon="login" @click="login">
            <q-tooltip :delay="50" anchor="center left" self="center middle">
              Login
            </q-tooltip>
          </q-btn>
        </div>
        <div v-else>
          <q-btn round color="white" text-color="black" icon="logout" @click="logout">
            <q-tooltip :delay="50" anchor="center left" self="center middle">
              Logout
            </q-tooltip>
          </q-btn>
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <q-item-label header>
          Essential Links
        </q-item-label>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { AuthContext, EmptyAuthContext } from 'src/auth/authContext';
import { authContextKey } from 'src/injection-keys';
import { inject, ref } from 'vue';

defineOptions({
  name: 'MainLayout'
});

const { loginWithPopup, logoutWithPopup, isAuthenticated } = inject<AuthContext>(authContextKey, EmptyAuthContext)

const leftDrawerOpen = ref(false);
function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}

async function login() {
  await loginWithPopup();
}

async function logout() {
  await logoutWithPopup();
}
</script>
