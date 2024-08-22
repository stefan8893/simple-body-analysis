import {
  AccountInfo,
  AuthenticationResult,
  Configuration,
  EventType,
  LogLevel,
  PublicClientApplication,
} from '@azure/msal-browser';
import { ref, Ref, watch } from 'vue';

type User = {
  name: string;
  email: string;
};

export type AuthContext = {
  loginWithPopup: () => Promise<void>;
  logoutWithPopup: () => Promise<void>;
  acquireAccessToken: () => Promise<string>;
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

export function initializeAuth(config: Configuration): AuthContext {
  const instance = new PublicClientApplication({ ...loggingConfig, ...config });

  const activeAccount = ref(instance.getActiveAccount());
  addEventListener(instance, activeAccount);
  initialize(instance);

  const acquireAccessToken = () => Promise.resolve('empty');

  const isAuthenticated = ref(!!activeAccount.value);

  const currentUser = ref({
    name: instance.getActiveAccount()?.name ?? '',
    email: instance.getActiveAccount()?.username ?? '',
  });

  watch(activeAccount, () => {
    isAuthenticated.value = !!activeAccount.value;

    if (isAuthenticated.value) {
      currentUser.value.name = activeAccount.value!.name!;
      currentUser.value.email = activeAccount.value!.username!;
    } else {
      currentUser.value.name = '';
      currentUser.value.email = '';
    }
  });

  const login = () =>
    instance
      .loginPopup({ scopes: ['openid', 'email', 'offline_access'] })
      .then(() => {});

  return {
    loginWithPopup: login,
    logoutWithPopup: () => instance.logoutPopup().then(() => {}),
    acquireAccessToken,
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

function addEventListener(
  instance: PublicClientApplication,
  activeAccount: Ref<AccountInfo | null>,
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
    }
  });
}
