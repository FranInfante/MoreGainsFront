import { Component } from '@angular/core';
import { PlanTabsComponent } from './components/plan-tabs/plan-tabs.component';
import { UserService } from '../../shared/service/user.service';
import { User } from '../../shared/interfaces/users';
@Component({
  selector: 'app-plans',
  standalone: true,
  imports: [PlanTabsComponent],
  templateUrl: './plans.component.html',
  styleUrl: './plans.component.css'
})
export class PlansComponent {

}
