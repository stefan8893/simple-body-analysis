import { IPublicClientApplication } from '@azure/msal-browser';
import { Ref } from 'vue';

export function getTokenExpirationClaim(jwt: string) {
  const [, claims] = jwt.split('.');

  if (!claims) throw 'invalid token';

  const decodedClaims = atob(claims);
  const claimsJson = JSON.parse(decodedClaims);
  return claimsJson['exp'];
}

export function aquireAccessTokenCache(
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
  } catch {
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

function createCacheKey(scopes: string[]) {
  return scopes.reduce((acc, next) => acc + next, 'scopes:');
}

function isTokenExpired(token: string) {
  const expirationUnixTimestamp = getTokenExpirationClaim(token);
  const expiresAt = new Date(expirationUnixTimestamp * 1000);
  const now = new Date();

  return now >= expiresAt;
}
