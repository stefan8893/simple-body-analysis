import { InjectionKey } from 'vue';
import { AuthContext } from './auth/authContext';
import { BodyAnalysisRepository } from './repositories/bodyAnalysisRepository';

export const authContextKey = Symbol() as InjectionKey<AuthContext>;
export const azureTablesRepositoryKey =
  Symbol() as InjectionKey<BodyAnalysisRepository>;
