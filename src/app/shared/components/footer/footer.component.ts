import { Component } from '@angular/core';
import { ASSET_URLS, LOCATIONS } from '../constants';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
  logo = ASSET_URLS.logo;
  LOCATIONS: typeof LOCATIONS = LOCATIONS;

}
