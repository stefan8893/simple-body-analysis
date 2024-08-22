import { boot } from 'quasar/wrappers';
import { initializeAuth } from 'src/auth/authContext';
import { authContextKey } from 'src/injection-keys';

const authContext = initializeAuth({
  auth: {
    clientId: '2564e5b2-e1a5-4dbf-963e-37e123b024e8',
    authority:
      'https://login.microsoftonline.com/f64914bc-6b63-492c-9d53-830b704506e2',
  },
  cache: {
    cacheLocation: 'localStorage',
  },
});

export default boot(({ app }) => {
  app.provide(authContextKey, authContext);
});
