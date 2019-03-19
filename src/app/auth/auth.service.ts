import { Injectable } from '@angular/core';
// Firebase
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

import * as firebase from 'firebase';
import { map } from 'rxjs/operators';
import { User } from './user.model';
import { Store } from '@ngrx/store';
import { AppState } from '../app.reducer';
import { ActivarLoadingAction, DesactivarLoadingAction } from '../shared/ui.actions';
import { SetUserAction } from './auth.actions';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  mensajeError: string;
  userSubscription: Subscription;

  constructor(private afAuth: AngularFireAuth, private router: Router,
              private afDB: AngularFirestore, private store: Store<AppState>) { }

  initAuthLister() {
    this.afAuth.authState.subscribe( (fbuser: firebase.User) => {
      if ( fbuser ) {
        this.userSubscription = this.afDB.doc(`${ fbuser.uid }/usuario`).valueChanges()
          .subscribe( (usuarioObj: any) => {
            const newUser = new User(usuarioObj);
            this.store.dispatch(new SetUserAction(newUser));

            console.log(newUser);
          });
      } else {
        if ( this.userSubscription != null ) {
          this.userSubscription.unsubscribe();
        }
      }
    });
  }


  crearUsuario( nombre: string, email: string, password: string ) {
    this.store.dispatch( new ActivarLoadingAction() );

    this.afAuth.auth
        .createUserWithEmailAndPassword(email, password)
        .then( resp => {
          // Constante de usuario que se almacenará en Firebase
          const user: User = {
            uid: resp.user.uid,
            nombre: nombre,
            email: resp.user.email,
          };

          this.afDB.doc(`${ user.uid }/usuario`)
            .set( user )
            .then( () => {
              this.router.navigate(['/']);
              this.store.dispatch( new DesactivarLoadingAction() );
            });

        })
        .catch( error => {
          console.error(error);
          this.store.dispatch( new DesactivarLoadingAction() );
          if ( error.message === 'The email address is already in use by another account.') {
            this.mensajeError = 'La dirección de correo ya está en uso en otra cuenta';
          }
          Swal.fire('Error al crear usuario', this.mensajeError, 'error');
        });
  }

  login( email: string, password: string ) {
    this.store.dispatch( new ActivarLoadingAction() );
    this.afAuth.auth
        .signInWithEmailAndPassword(email, password)
        .then( resp => {
          this.router.navigate(['/']);
          this.store.dispatch( new DesactivarLoadingAction() );
        })
        .catch( error => {
          console.error(error);
          if ( error.message === 'The password is invalid or the user does not have a password.' ) {
            this.mensajeError = 'La contraseña es invalida o el usuario no tiene contraseña';
          }
          Swal.fire('Error en el login', this.mensajeError, 'error');
        });
  }


  logout() {
    this.afAuth.auth.signOut();
    this.router.navigate(['/login']);
    // console.log('El usuario ha cerrado sesión');
  }

  isAuth() {
    return this.afAuth.authState
      .pipe(
        map( fbUser => {  
          if ( fbUser == null) {
            this.router.navigate(['/login']);
          }

          return fbUser != null;
        })
      );
  }

}
