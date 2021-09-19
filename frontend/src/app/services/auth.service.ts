import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { first } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  public localUser: BehaviorSubject<any>;
  public loginUrl = `${environment.backendUrl}/auth/login`;
  public registerUrl = `${environment.backendUrl}/auth/register`;

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
    return this.http.post(this.loginUrl, login).pipe(first());
  }

  register(register: any): Observable<any> {
    return this.http.post(this.registerUrl, register).pipe(first());
  }

  getToken(): any {
    if (this.isLoggedIn()) {
      return localStorage.getItem('token');
    }
    return null;
  }

  isLoggedIn(): boolean {
    const token: string | null = localStorage.getItem('token');
    const expiresIn: string | null = localStorage.getItem('expiresIn');
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
    this.localUser.next(null);
  }

  transformCookies(): void {
    const user = JSON.parse(this.cookieService.get('user'));
    const token = this.cookieService.get('token');
    const expiresIn = this.cookieService.get('expiresIn');
    this.cookieService.deleteAll();
    if (!token || !expiresIn) {
      this.logout();
    } else {
      this.setLocalStorage({ user, token, expiresIn });
      this.router.navigate(['/']);
    }
  }

  validateToken(expiresIn: string | null): boolean {
    // TODO: Validate token time
    return true;
  }
}
