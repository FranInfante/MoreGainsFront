import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SubscriptionLike } from 'rxjs';
import { ASSET_URLS, LOCATIONS } from '../../shared/components/constants';
import { User } from '../../shared/interfaces/users';
import { BASE } from '../../shared/routes/user-routes';
import { UserService } from '../../shared/service/user.service';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export class MenuComponent implements OnInit, OnDestroy {

  currentUser: User | null = null;
  subscription?: SubscriptionLike;
  genericLogoUrl: string = ASSET_URLS.genericlogo;
  workouticon: string = ASSET_URLS.workout;
  mesosicon: string = ASSET_URLS.mesos;
  playicon: string = ASSET_URLS.play;
  favoritesicon: string = ASSET_URLS.favorites;
  LOCATIONS: typeof LOCATIONS = LOCATIONS;
  
  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.subscription = this.userService.getCurrentUser().subscribe(user => {
      if (user) {
        this.currentUser = {
          ...user,
          photoUrl: user.photoUrl ? `${BASE}${user.photoUrl}` : undefined
        };
      }
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  initUserSubject(): void {
    this.subscription = this.userService.userSubject.subscribe(user => {
      if (user) {
        this.currentUser = {
          ...user,
          photoUrl: user.photoUrl ? `${BASE}${user.photoUrl}` : undefined
        };
      }
    });
  }
}