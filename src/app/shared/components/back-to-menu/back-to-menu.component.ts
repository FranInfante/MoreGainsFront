import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { LOCATIONS } from '../constants';

@Component({
  selector: 'app-back-to-menu',
  standalone: true,
  imports: [],
  templateUrl: './back-to-menu.component.html',
  styleUrl: './back-to-menu.component.css'
})
export class BackToMenuComponent {
  
  @Input() displayText: string = '';

  constructor(private router: Router) {}

  goToMenu() {
    this.router.navigate([LOCATIONS.menu]);
  }

}
