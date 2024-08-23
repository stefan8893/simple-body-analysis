<template>
  <q-layout view="hHh lpR fFf">
    <q-header bordered class="bg-grey-9 text-white">
      <q-toolbar>
        <q-btn v-if="isAuthenticated" flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />

        <q-toolbar-title>
          Simple Body Analysis
        </q-toolbar-title>

        <div v-if="!isAuthenticated">
          <q-btn color="white" text-color="grey-9" label="Login" @click="login"></q-btn>
        </div>
        <div v-else>
          <q-btn-dropdown dense color="white" text-color="grey-9" icon="account_circle">
            <q-list>
              <BusinessCard :user-name="user?.name" :email="user?.email" />
              <q-separator />
              <LogoutItem @click="logout" />
            </q-list>
          </q-btn-dropdown>
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer v-if="isAuthenticated" v-model="leftDrawerOpen" show-if-above side="left" bordered persistent>
      <SideBar />
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
import BusinessCard from './BusinessCard.vue';
import LogoutItem from './LogoutItem.vue';
import SideBar from './SideBar.vue'

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
