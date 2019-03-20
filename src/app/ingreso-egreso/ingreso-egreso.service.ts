import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { IngresoEgreso } from './ingreso-egreso.model';
import { AuthService } from '../auth/auth.service';
import { AppState } from '../app.reducer';
import { Store } from '@ngrx/store';
import { filter, map } from 'rxjs/operators';
import { SetItemsAction, UnsetItemsAction } from './ingreso-egreso.actions';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class IngresoEgresoService {

  ingresoEgresoListenerSubscription: Subscription = new Subscription();
  ingresoEgresoItemsSubscription: Subscription = new Subscription();

  constructor(private afDB: AngularFirestore, private authService: AuthService,
              private store: Store<AppState>) { }


  crearIngresoEgreso( ingresoEgreso: IngresoEgreso ) {
    const user = this.authService.getUser();
    return this.afDB.doc(`${ user.uid }/ingresos-egresos`)
        .collection('items').add( {...ingresoEgreso} );
  }

  initIngresoEgresoListener() {
    this.ingresoEgresoListenerSubscription = this.store.select('auth')
        .pipe(
          filter( auth => auth.user != null) // Con el operador pipe y filter filtramos y
        )                                    // obtenemos solo los valores que no sean nulos
        .subscribe( auth => this.ingresoEgresoItems(auth.user.uid));
  }

  cancelarSubscriptions() {
    this.ingresoEgresoListenerSubscription.unsubscribe();
    this.ingresoEgresoItemsSubscription.unsubscribe();
    this.store.dispatch(new UnsetItemsAction());
  }

  private ingresoEgresoItems( uid: string ) {
    this.ingresoEgresoItemsSubscription = this.afDB.collection(`${ uid }/ingresos-egresos/items`).snapshotChanges()
        .pipe(
          map( docData => {
            // La función map de JavaScript permite transformar cada elemento dentro del array
            return docData.map( doc => {
              return {
                uid: doc.payload.doc.id,
                ...doc.payload.doc.data()
              };
            });
          })
        )
        .subscribe( (coleccion: any[]) => {
            this.store.dispatch(new SetItemsAction(coleccion));
        });
  }

  borrarIngresoEgreso( uid: string) {
    const user = this.authService.getUser();
    return this.afDB.doc(`${ user.uid }/ingresos-egresos/items/${ uid }`)
        .delete();
  }
}
