// Archivo global que contiene toda la definción del estado


import * as fromUI from './shared/ui.reducer';
import * as fromAuth from './auth/auth.reducer';
import { ActionReducerMap } from '@ngrx/store';

export interface AppState {
    ui: fromUI.State;
    auth: fromAuth.AuthState;
}

// Permite fusionar varios reducers en uno solo, para que la aplicación sepa las partes 
// que va a tener el store
export const appReducers: ActionReducerMap<AppState> = {
    ui: fromUI.uiReducer,
    auth: fromAuth.authReducer,
};
