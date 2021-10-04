import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss'],
})
export class NavComponent implements OnInit {
  user: Observable<any>;
  url: string;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.user = this.authService.localUser;
  }

  logout(): void {
    this.authService.logout();
  }
}
