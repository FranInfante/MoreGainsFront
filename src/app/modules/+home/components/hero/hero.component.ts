import { Component } from '@angular/core';
import { ASSET_URLS, LOCATIONS } from '../../../../shared/components/constants';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.css'
})
export class HeroComponent {
  herovideo: string = ASSET_URLS.herovideo;
  LOCATIONS: typeof LOCATIONS = LOCATIONS;

}
