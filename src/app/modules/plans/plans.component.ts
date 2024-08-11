import { Component } from '@angular/core';
import { PlanTabsComponent } from './components/plan-tabs/plan-tabs.component';
import { UserService } from '../../shared/service/user.service';
import { User } from '../../shared/interfaces/users';
import { BackToMenuComponent } from '../../shared/components/back-to-menu/back-to-menu.component';

@Component({
  selector: 'app-plans',
  standalone: true,
  imports: [PlanTabsComponent, BackToMenuComponent],
  templateUrl: './plans.component.html',
  styleUrl: './plans.component.css'
})
export class PlansComponent {

  user: User | null = null;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.userService.getCurrentUser().subscribe(user => {
      if (user && user.id) {
        this.user = user;
      }
    });
  }

}
