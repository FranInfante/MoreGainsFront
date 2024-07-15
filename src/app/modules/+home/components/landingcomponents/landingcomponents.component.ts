import { Component } from '@angular/core';
import { ASSET_URLS } from '../../../../shared/components/constants';

@Component({
  selector: 'app-landingcomponents',
  standalone: true,
  imports: [],
  templateUrl: './landingcomponents.component.html',
  styleUrl: './landingcomponents.component.css'
})
export class LandingcomponentsComponent {
  sample1: string = ASSET_URLS.sample1;
  sample2: string = ASSET_URLS.sample2;

}
