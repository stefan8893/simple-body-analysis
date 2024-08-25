import {
  AccountInfo,
  AuthenticationResult,
  Configuration,
  EventType,
  LogLevel,
  PublicClientApplication,
} from '@azure/msal-browser';
import { ref, Ref, watch } from 'vue';
import { Router } from 'vue-router';
import { aquireAccessTokenCache } from './accessToken';

export type User = {
  name: string;
  email: string;
  idToken: string;
};

export type AcquireAccessToken = (scopes: string[]) => Promise<string>;

export type AuthContext = {
  loginWithPopup: () => Promise<void>;
  logoutWithPopup: () => Promise<void>;
  acquireAccessToken: AcquireAccessToken;
  user: Ref<User | null>;
  isAuthenticated: Ref<boolean>;
};

export const EmptyAuthContext: AuthContext = {
  loginWithPopup: () => Promise.resolve(),
  logoutWithPopup: () => Promise.resolve(),
  acquireAccessToken: () => Promise.resolve(''),
  user: ref(null),
  isAuthenticated: ref(false),
};

const loggingConfig = {
  system: {
    loggerOptions: {
      loggerCallback: (
        level: LogLevel,
        message: string,
        containsPii: boolean,
      ) => {
        if (containsPii) {
          return;
        }
        switch (level) {
          case LogLevel.Error:
            console.error(message);
            return;
          case LogLevel.Info:
            console.info(message);
            return;
          case LogLevel.Verbose:
            console.debug(message);
            return;
          case LogLevel.Warning:
            console.warn(message);
            return;
          default:
            return;
        }
      },
      logLevel: LogLevel.Verbose,
    },
  },
};

export function initializeAuth(
  config: Configuration,
  router: Router,
): AuthContext {
  const instance = new PublicClientApplication({ ...loggingConfig, ...config });

  const activeAccount = ref(instance.getActiveAccount());
  addEventListeners(instance, activeAccount, router);
  initialize(instance);

  const isAuthenticated = ref(!!activeAccount.value);

  const currentUser = initializeUser(activeAccount);
  watch(activeAccount, () => {
    isAuthenticated.value = !!activeAccount.value;

    if (isAuthenticated.value) updateUser(currentUser, activeAccount);
    else clearUser(currentUser);
  });

  return {
    loginWithPopup: () => login(instance),
    logoutWithPopup: () => logout(instance),
    acquireAccessToken: aquireAccessTokenCache(instance, isAuthenticated),
    user: currentUser,
    isAuthenticated,
  };
}

function initialize(instance: PublicClientApplication) {
  instance.initialize().then(() => {
    instance.handleRedirectPromise().catch(() => {
      // Errors should be handled by listening to the LOGIN_FAILURE event
      return;
    });
  });
}

async function login(instance: PublicClientApplication) {
  await instance.loginPopup({
    scopes: ['openid', 'email', 'offline_access'],
  });
  instance.handleRedirectPromise();
}

async function logout(instance: PublicClientApplication) {
  await instance.logoutPopup();
  instance.handleRedirectPromise();
}

function addEventListeners(
  instance: PublicClientApplication,
  activeAccount: Ref<AccountInfo | null>,
  router: Router,
) {
  instance.addEventCallback((event) => {
    if (event.eventType === EventType.LOGIN_SUCCESS && event.payload) {
      const payload = event.payload as AuthenticationResult;
      const account = payload.account;
      instance.setActiveAccount(account);
      activeAccount.value = account;
    }

    if (event.eventType === EventType.LOGOUT_SUCCESS && event.payload) {
      instance.setActiveAccount(null);
      activeAccount.value = null;

      router.push({ name: 'Home' });
    }
  });
}

function initializeUser(account: Ref<AccountInfo | null>) {
  return ref({
    name: account.value?.name ?? '',
    email: account.value?.username ?? '',
    idToken: account.value?.idToken ?? '',
  });
}

function updateUser(
  currentUser: Ref<User>,
  activeAccount: Ref<AccountInfo | null>,
) {
  currentUser.value.name = activeAccount.value?.name ?? '';
  currentUser.value.email = activeAccount.value?.username ?? '';
  currentUser.value.idToken = activeAccount.value?.idToken ?? '';
}

function clearUser(currentUser: Ref<User>) {
  currentUser.value.name = '';
  currentUser.value.email = '';
  currentUser.value.idToken = '';
}
