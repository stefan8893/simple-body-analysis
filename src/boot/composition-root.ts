import { boot } from 'quasar/wrappers';
import { initializeAuth } from 'src/auth/authContext';
import {
  authContextKey,
  azureTablesRepositoryKey as bodyAnalysisRepositoryKey,
} from 'src/injection-keys';
import {
  AzureTablesConfiguration,
  initializeAzureTablesRepository,
} from 'src/repositories/bodyAnalysisRepository';

const authConfiguration = {
  auth: {
    clientId: '2564e5b2-e1a5-4dbf-963e-37e123b024e8',
    authority:
      'https://login.microsoftonline.com/f64914bc-6b63-492c-9d53-830b704506e2',
    redirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: 'localStorage',
  },
};

const azureTablesConfiguration: AzureTablesConfiguration = {
  storageAccount: 'https://simplebodyanalysis.table.core.windows.net',
  scope: 'https://storage.azure.com/user_impersonation',
  table: 'BodyAnalysis',
};

export default boot(({ app, router }) => {
  const authContext = initializeAuth(authConfiguration, router);
  app.provide(authContextKey, authContext);

  app.provide(
    bodyAnalysisRepositoryKey,
    initializeAzureTablesRepository(
      azureTablesConfiguration,
      authContext.acquireAccessToken,
    ),
  );
});
