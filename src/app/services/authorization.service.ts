import { EventEmitter, Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { AngularFireAuth } from "@angular/fire/auth";
import { Router } from "@angular/router";

import { take } from "rxjs/operators";

import { LocalStorage } from "src/libs/storage/src";
import { IUser } from "../models/user";
import Firebase from "firebase/app";

@Injectable({
  providedIn: "root",
})
export class AuthorizationService {
  isAuthorized: any;
  user: IUser;

  authState: any;

  constructor(
    private _firebaseAuth: AngularFireAuth,
    private _firestore: AngularFirestore,
    private _localStorage: LocalStorage,
    private _router: Router
  ) {}

  public onSignIn = new EventEmitter<void>();

  async init() {
    this.user = await this._firebaseAuth.user.pipe(take(1)).toPromise();

    if (this.user) {
      this.isAuthorized = true;
      this.onSignIn.emit();
    }
  }

  async signIn(userData: IUser): Promise<void> {
    this.isAuthorized = true;
    this.user = userData;

    this.refreshUserLocalStorage(userData);
    this.onSignIn.emit();
  }

  async signInWithEmail(email: string, password: string) {
    try {
      const response = await this._firebaseAuth.signInWithEmailAndPassword(
        email,
        password
      );
      this.signIn(response.user);
    } catch (error) {
      console.log(error);
    }
  }

  async signInWithGoogle() {
    const provider = new Firebase.auth.GoogleAuthProvider();

    try {
      const response: any = await this._firebaseAuth.signInWithPopup(provider);

      this.signIn(response.user);
    } catch (error) {
      console.log(error);
    }
  }

  async signInWithAnyProvider(prov: "google" | "facebook" | "apple") {
    const provider = this.checkSignInProviders(prov);

    try {
      const response: any = await this._firebaseAuth.signInWithPopup(provider);

      this.signIn(response.user);
    } catch (error) {
      console.log(error);
    }
  }

  checkSignInProviders(prov: "google" | "facebook" | "apple") {
    switch (prov) {
      case "google":
        return new Firebase.auth.GoogleAuthProvider();
      case "facebook":
        return new Firebase.auth.FacebookAuthProvider();
      case "apple":
        return new Firebase.auth.OAuthProvider("apple.com");
    }
  }

  async signUp(email: string, password: string): Promise<void> {
    try {
      const response = await this._firebaseAuth.createUserWithEmailAndPassword(
        email,
        password
      );

      this.signIn(response.user);
    } catch (error) {
      console.log(error);
    }
  }

  getUser(): IUser {
    return this.user;
  }

  async restorePassword(email: string) {
    try {
      await this._firebaseAuth.sendPasswordResetEmail(email);
    } catch (error) {
      console.log(error);
    }
  }

  logOut(): void {
    this.isAuthorized = false;

    this._firebaseAuth.signOut();
    this.deleteUserFromLocalStorage();
    this._router.navigateByUrl("/login");
  }

  async isUserLogged() {
    this.isAuthorized = await this._firebaseAuth.authState
      .pipe(take(1))
      .toPromise();

    return !!this.isAuthorized;
  }

  refreshUserLocalStorage(userData: any) {
    this._localStorage.setItem("user", JSON.stringify(userData));
  }

  deleteUserFromLocalStorage() {
    this._localStorage.removeItem("user");
  }
}
