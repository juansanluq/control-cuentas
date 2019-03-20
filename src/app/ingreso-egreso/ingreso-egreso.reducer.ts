import * as fromIngresoEgreso from './ingreso-egreso.actions';
import { IngresoEgreso } from './ingreso-egreso.model';
import { map } from 'rxjs/operators';
import { AppState } from '../app.reducer';

export interface IngresoEgresoState {
    items: IngresoEgreso[];
}

export interface AppState extends AppState {
    ingresoEgreso: IngresoEgresoState;
}

const initState: IngresoEgresoState = {
    items: []
};

export function ingresoEgresoReducer( state = initState, action: fromIngresoEgreso.acciones ): IngresoEgresoState {

    switch ( action.type ) {
        // Devolvemos el array de items de los ingresos-egresos
        case fromIngresoEgreso.SET_ITEMS:
            return {
                items: [
                    ...action.items.map( item => {
                        return {
                            ...item
                        };
                    })
                ]
            };
        // Devolvemos un array vacío de items, quitando todos los que halla en el state
        case fromIngresoEgreso.UNSET_ITEMS:
            return {
                items: []
            };

        default:
            return state;
    }
}

