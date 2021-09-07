import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor() {}

  setLocalStorage(token: any): void {}

  login(): void {}

  register(): void {}

  logout(): void {}

  getUser(): void {}
}
