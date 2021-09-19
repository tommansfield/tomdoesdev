import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  public facebookUrl = `${environment.backendUrl}/auth/facebook`;
  public googleUrl = `${environment.backendUrl}/auth/google`;
  public githubUrl = `${environment.backendUrl}/auth/github`;
  public twitterUrl = `${environment.backendUrl}/auth/twitter`;

  public isRegister = false;
  public email: string;
  public password: string;
  public confirmPassword: string;
  private homeUrl = '/';

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {}

  login(): void {
    this.authService
      .login({ email: this.email, password: this.password })
      .subscribe(
        (token) => {
          this.authService.setLocalStorage(token);
          this.router.navigate([this.homeUrl]);
        },
        (err) => {
          console.error(err.error);
        }
      );
  }

  register(): void {
    this.authService
      .register({
        email: this.email,
        password: this.password,
        confirmPassword: this.confirmPassword,
      })
      .subscribe(
        (token) => {
          token.user = btoa(JSON.stringify(token.user));
          this.authService.setLocalStorage(token);
          this.router.navigate([this.homeUrl]);
        },
        (err) => {
          console.error(err.error);
        }
      );
  }
}
