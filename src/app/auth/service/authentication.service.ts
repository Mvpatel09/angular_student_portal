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
          if (user && user.tocken && user.userRoleId === 1) {
            // store user details and jwt token in local storage to keep user logged in between page refreshes
            localStorage.setItem('token', user.tocken)
            localStorage.setItem('currentUser', JSON.stringify({
              id: user.userId,
              email,
              // password: '',
              firstName: user.userName,
              lastName: '',
              avatar: '',
              role: Role.Admin,
              token: user.tocken,
              roleId: user.userRoleId
            }));

            // Display welcome toast!
            setTimeout(() => {
              this._toastrService.success(
                'You have successfully logged in as an Admin'
                ,
                '👋 Welcome, ' + '!',
                { toastClass: 'toast ngx-toastr', closeButton: true }
              );
            }, 2500);

            // notify
            this.currentUserSubject.next({
              id: user.userId,
              email,
              password: 'admin',
              firstName: user.userName,
              lastName: '',
              avatar: '',
              role: Role.Admin,
              token: user.tocken,
              roleId: user.userRoleId
            });
          } else if (user && user.tocken && user.userRoleId === 2) {
            localStorage.setItem('token', user.tocken)
            localStorage.setItem('currentUser', JSON.stringify({
              id: user.userId,
              email,
              // password: '',
              firstName: user.userName,
              lastName: '',
              avatar: '',
              role: Role.Admin,
              token: user.tocken,
              roleId: user.userRoleId,
              collegeId: user.collegeId
            }));

            // Display welcome toast!
            setTimeout(() => {
              this._toastrService.success(
                'You have successfully logged in as an Organization'
                ,
                '👋 Welcome, ' + '!',
                { toastClass: 'toast ngx-toastr', closeButton: true }
              );
            }, 2500);

            // notify
            console.log(user, "maulik122")
            this.currentUserSubject.next({
              id: user.userId,
              email,
              password: 'admin',
              firstName: user.userName,
              lastName: '',
              avatar: '',
              role: Role.Admin,
              token: user.tocken,
              roleId: user.userRoleId,
              collegeId: user.collegeId
            });
          }
          return user;
        })
      );
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
