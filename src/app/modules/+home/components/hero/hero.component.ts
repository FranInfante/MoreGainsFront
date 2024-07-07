import { Component } from '@angular/core';
import { ASSET_URLS } from '../../../../shared/components/constants';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.css'
})
export class HeroComponent {
  herovideo: string = ASSET_URLS.herovideo;

}
