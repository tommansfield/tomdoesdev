import {
  HttpEvent,
  HttpHandler,
  HttpHeaders,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const token = localStorage.get('token');
    const expiresIn = localStorage.get('expiryDate');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    const clonedRequest = req.clone({ headers });
    return next.handle(clonedRequest);
  }
}
