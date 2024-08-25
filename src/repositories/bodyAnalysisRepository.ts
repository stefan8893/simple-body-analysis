import { TableClient } from '@azure/data-tables';
import { AccessToken, TokenCredential } from '@azure/identity';
import { getTokenExpirationClaim } from 'src/auth/accessToken';
import { AcquireAccessToken } from 'src/auth/authContext';

export type AzureTablesConfiguration = {
  storageAccount: string;
  scope: string;
  table: string;
};

export type BodyAnalysisRepository = {
  get: () => void;
};

export function initializeAzureTablesRepository(
  config: AzureTablesConfiguration,
  acquireAccessToken: AcquireAccessToken,
) {
  const scope = 'https://storage.azure.com/user_impersonation';

  const tokenAdapter: TokenCredential = {
    getToken: async (): Promise<AccessToken | null> => {
      const accessToken = await acquireAccessToken([scope]);

      return {
        token: accessToken,
        expiresOnTimestamp: getTokenExpirationClaim(accessToken),
      };
    },
  };

  const client = new TableClient(
    config.storageAccount,
    config.table,
    tokenAdapter,
  );

  console.log(client);

  return {
    get: () => {},
  };
}
