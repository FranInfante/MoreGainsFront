import { Component, OnDestroy, OnInit, TemplateRef } from '@angular/core';
import { UserService } from '../../shared/service/user.service';
import { User } from '../../shared/interfaces/users';
import { SubscriptionLike } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ASSET_URLS } from '../../shared/components/constants';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule],
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
  
  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.subscription = this.userService.getCurrentUser().subscribe(user => {
      this.currentUser = user;
    });
  }
  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  initUserSubject(): void {
    this.subscription = this.userService.userSubject.subscribe(user => {
      this.currentUser = user;
    });
  }

}
