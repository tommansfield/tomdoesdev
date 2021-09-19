import { Component, Input, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  appName: string = environment.appName;
  user: Observable<any>;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.user = this.authService.localUser;
  }
}
