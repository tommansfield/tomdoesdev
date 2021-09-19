import {
  HttpEvent,
  HttpHandler,
  HttpHeaders,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from './services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const headers = new HttpHeaders();
    headers.set('Content-Type', 'application/json');

    const token: string = this.authService.getToken();

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const clonedRequest = req.clone({ headers });
    return next.handle(clonedRequest);
  }
}
