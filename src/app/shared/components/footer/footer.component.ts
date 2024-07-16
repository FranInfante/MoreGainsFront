import { Component } from '@angular/core';
import { ASSET_URLS } from '../constants';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
  logo = ASSET_URLS.logo;

}
