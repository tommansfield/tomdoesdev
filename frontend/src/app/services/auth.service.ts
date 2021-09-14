import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { Observable } from 'rxjs';
import { first } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  public headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  public loginUrl = `${environment.backendUrl}/auth/login`;
  public registerUrl = `${environment.backendUrl}/auth/register`;

  constructor(
    private http: HttpClient,
    private cookieService: CookieService,
    private router: Router
  ) {}

  login(login: any): Observable<any> {
    return this.http
      .post(this.loginUrl, login, {
        headers: this.headers,
      })
      .pipe(first());
  }

  register(register: any): Observable<any> {
    return this.http
      .post(this.registerUrl, register, {
        headers: this.headers,
      })
      .pipe(first());
  }

  getUser(): void {}

  transformCookies(): void {
    const token = this.cookieService.get('token');
    const expiresIn = this.cookieService.get('expiresIn');

    if (!token || !expiresIn) {
      this.router.navigate(['/login']);
    } else {
      this.cookieService.deleteAll();
      localStorage.setItem('access_token', token);
      localStorage.setItem('expiresAt', expiresIn);
      this.router.navigate(['user']);
    }
  }

  setLocalStorage(token: any): void {
    localStorage.setItem('token', token.token);
    localStorage.setItem('expiresIn', token.expiresIn);
  }

  logout(): void {}
}
