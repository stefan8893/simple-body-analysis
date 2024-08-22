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
            <q-tooltip :delay="200" anchor="bottom middle" self="bottom middle" :offset="[0, 30]">
              Login
            </q-tooltip>
          </q-btn>
        </div>
        <div v-else>
          <q-btn push color="white" text-color="grey-9" icon="account_circle">
            <q-popup-proxy>
              <q-banner>
                <!-- <template v-slot:avatar>
                  <q-icon name="person" color="black" />
                </template> -->
                {{ user?.name }}
                {{ user?.email }}
              </q-banner>
            </q-popup-proxy>
          </q-btn>

          <q-btn class="q-ml-md" round color="white" text-color="black" icon="logout" @click="logout">
            <q-tooltip :delay="200" anchor="bottom middle" self="bottom middle" :offset="[0, 30]">
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

const { loginWithPopup, logoutWithPopup, isAuthenticated, user } = inject<AuthContext>(authContextKey, EmptyAuthContext)

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
