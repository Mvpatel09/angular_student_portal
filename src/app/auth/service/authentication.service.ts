import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from 'environments/environment';
import { User, Role } from 'app/auth/models';
import { ToastrService } from 'ngx-toastr';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
  //public
  public currentUser: Observable<User>;

  //private
  private currentUserSubject: BehaviorSubject<User>;

  /**
   *
   * @param {HttpClient} _http
   * @param {ToastrService} _toastrService
   */
  constructor(private _http: HttpClient, private _toastrService: ToastrService) {
    this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser')));
    this.currentUser = this.currentUserSubject.asObservable();
  }

  // getter: currentUserValue
  public get currentUserValue(): User {
    return this.currentUserSubject.value;
  }

  /**
   *  Confirms if user is admin
   */
  get isAdmin() {
    return this.currentUser && this.currentUserSubject.value.role === Role.Admin;
  }

  /**
   *  Confirms if user is client
   */
  get isClient() {
    return this.currentUser && this.currentUserSubject.value.role === Role.Client;
  }

  /**
   * User login
   *
   * @param email
   * @param password
   * @returns user
   */
  login(email: string, password: string) {
    let a = this._http
      .post<any>(`${environment.apiUrl}/User/Login`, { email, password })
      .pipe(
        map(user => {
          // login successful if there's a jwt token in the response
          if (user && user.data) {
            // store user details and jwt token in local storage to keep user logged in between page refreshes
            localStorage.setItem('token', user.data)
            localStorage.setItem('currentUser', JSON.stringify({
              id: 1,
              email: 'admin@demo.com',
              password: 'admin',
              firstName: 'John',
              lastName: 'Doe',
              avatar: 'avatar-s-11.jpg',
              role: Role.Admin,
              token: user.data
            }));

            // Display welcome toast!
            setTimeout(() => {
              this._toastrService.success(
                'You have successfully logged in as an '
                ,
                '👋 Welcome, ' + '!',
                { toastClass: 'toast ngx-toastr', closeButton: true }
              );
            }, 2500);

            // notify
            this.currentUserSubject.next({
              id: 1,
              email: 'admin@demo.com',
              password: 'admin',
              firstName: 'John',
              lastName: 'Doe',
              avatar: 'avatar-s-11.jpg',
              role: Role.Admin,
              token: user.data
            });
          }
          return user;
        })
      );
    console.log(a)
    return a;
  }

  /**
   * User logout
   *
   */
  logout() {
    // remove user from local storage to log user out
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    // notify
    this.currentUserSubject.next(null);
  }
}
