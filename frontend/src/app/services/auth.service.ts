import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, first } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import * as dayjs from 'dayjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  public localUser: BehaviorSubject<any>;
  private loginUrl = `${environment.backendUrl}/auth/login`;
  private registerUrl = `${environment.backendUrl}/auth/register`;
  private userUrl = `${environment.backendUrl}/auth/user`;

  constructor(
    private http: HttpClient,
    private cookieService: CookieService,
    private router: Router
  ) {
    const userJson: string | null = localStorage.getItem('user');
    const user = userJson ? JSON.parse(atob(userJson)) : 'undefined';
    this.localUser = new BehaviorSubject(user);
  }

  login(login: any): Observable<any> {
    return this.http
      .post(this.loginUrl, login)
      .pipe(first(), catchError(this.handleError<any>('login')));
  }

  register(register: any): Observable<any> {
    return this.http
      .post(this.registerUrl, register)
      .pipe(first(), catchError(this.handleError<any>('register')));
  }

  getUser(): Observable<any> {
    return this.http
      .get(this.userUrl)
      .pipe(first(), catchError(this.handleError<any>('getUser')));
  }

  getToken(): any {
    if (this.isLoggedIn()) {
      return localStorage.getItem('token');
    }
    return null;
  }

  isLoggedIn(): boolean {
    const token: string | null = localStorage.getItem('token') || '';
    const expiresIn: string = localStorage.getItem('expiresIn') || '';
    const user: any = localStorage.getItem('user');
    const tokenisValid: boolean = this.validateToken(expiresIn);
    return user && token !== 'undefined' && tokenisValid;
  }

  setLocalStorage(login: any): void {
    localStorage.setItem('user', btoa(JSON.stringify(login.user)));
    localStorage.setItem('token', login.token);
    localStorage.setItem('expiresIn', login.expiresIn);
    this.localUser.next(login.user);
  }

  logout(): void {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('expiresIn');
    this.localUser.next('undefined');
  }

  transformCookies(): void {
    const userJson = this.cookieService.get('user');
    const user = userJson === '' ? null : JSON.parse(userJson);
    const token = this.cookieService.get('token');
    const expiresIn = this.cookieService.get('expiresIn');
    this.cookieService.deleteAll();
    if (!token || !expiresIn || !user) {
      this.logout();
      this.router.navigate(['/login']);
    } else {
      this.setLocalStorage({ user, token, expiresIn });
      this.router.navigate(['/user']);
    }
  }

  validateToken(expiresIn: string): boolean {
    console.log('now: ' + dayjs());
    console.log('');
    console.log(dayjs().format(expiresIn));
    return true;
  }

  private handleError<T>(operation = 'operation'): any {
    return (res: any): Observable<T> => {
      if (res.status === 401) {
        this.logout();
        this.router.navigate(['/login']);
      } else if (res.status === 403) {
        this.router.navigate(['/']);
      }
      console.error('Error: ' + res.error.error);
      return of();
    };
  }
}
