import { InjectionKey } from 'vue';
import { AuthContext } from './auth/authContext';

export const authContextKey = Symbol() as InjectionKey<AuthContext>;
