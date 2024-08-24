import {
  AccountInfo,
  AuthenticationResult,
  Configuration,
  EventMessage,
  EventMessageUtils,
  EventType,
  InteractionStatus,
  IPublicClientApplication,
  LogLevel,
  PublicClientApplication,
} from '@azure/msal-browser';
import { ref, Ref, watch } from 'vue';
import { Router } from 'vue-router';

export type User = {
  name: string;
  email: string;
  idToken: string;
};

export type AuthContext = {
  loginWithPopup: () => Promise<void>;
  logoutWithPopup: () => Promise<void>;
  acquireAccessToken: (scopes: string[]) => Promise<string>;
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

export function initializeAuth(
  config: Configuration,
  router: Router,
): AuthContext {
  const inProgress = ref(InteractionStatus.Startup);

  const instance = new PublicClientApplication({ ...loggingConfig, ...config });

  const activeAccount = ref(instance.getActiveAccount());
  addEventListeners(instance, activeAccount, inProgress, router);
  initialize(instance);

  const isAuthenticated = ref(!!activeAccount.value);

  const currentUser = initializeUser(activeAccount);
  watch(activeAccount, () => {
    isAuthenticated.value = !!activeAccount.value;

    if (isAuthenticated.value) updateUser(currentUser, activeAccount);
    else clearUser(currentUser);
  });

  const login = () =>
    instance
      .loginPopup({
        scopes: ['openid', 'email', 'offline_access'],
      })
      .then(() => {
        instance.handleRedirectPromise();
      });

  const logout = () =>
    instance.logoutPopup().then(() => {
      instance.handleRedirectPromise();
    });

  const fetchTokenWithCaching = aquireAccessTokenCache(
    instance,
    isAuthenticated,
  );

  return {
    loginWithPopup: login,
    logoutWithPopup: logout,
    acquireAccessToken: fetchTokenWithCaching,
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

function createCacheKey(scopes: string[]) {
  return scopes.reduce((acc, next) => acc + next, 'scopes:');
}

function aquireAccessTokenCache(
  instance: IPublicClientApplication,
  isAuthenticated: Ref<boolean>,
) {
  const tokenCache = new Map<string, string>();

  const fetchToken = async (scopes: string[]) => {
    const accessToken = await acquireAccessToken(instance, scopes);

    const tokenCacheKey = createCacheKey(scopes);
    tokenCache.set(tokenCacheKey, accessToken);

    return accessToken;
  };

  const isTokenExpired = (token: string) => {
    const [, claims] = token.split('.');

    if (!claims) throw 'invalid token';

    const decodedClaims = atob(claims);
    const claimsJson = JSON.parse(decodedClaims);
    const expirationUnixTimestamp = claimsJson['exp'];
    const expiresAt = new Date(expirationUnixTimestamp * 1000);
    const now = new Date();

    return now >= expiresAt;
  };

  return async (scopes: string[]) => {
    const cacheKey = createCacheKey(scopes);
    if (!isAuthenticated.value) {
      tokenCache.delete(cacheKey);
    }

    if (!tokenCache.has(cacheKey)) return await fetchToken(scopes);

    const cachedToken = tokenCache.get(cacheKey);

    if (isTokenExpired(cachedToken!)) {
      return fetchToken(scopes);
    }

    return cachedToken!;
  };
}

async function acquireAccessToken(
  instance: IPublicClientApplication,
  scopes: string[],
) {
  const tokenRequest = {
    scopes: scopes,
  };

  try {
    const response = await instance.acquireTokenSilent(tokenRequest);
    return response.accessToken;
  } catch (e) {
    return instance
      .loginPopup(tokenRequest)
      .then((response) => {
        return response.accessToken;
      })
      .catch((e) => {
        throw e;
      });
  }
}

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

function addEventListeners(
  instance: PublicClientApplication,
  activeAccount: Ref<AccountInfo | null>,
  inProgress: Ref<InteractionStatus>,
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

  instance.addEventCallback((message: EventMessage) => {
    const status = EventMessageUtils.getInteractionStatusFromEvent(
      message,
      inProgress.value,
    );
    if (status !== null) inProgress.value = status;
  });
}
