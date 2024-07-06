import { Component } from '@angular/core';
import { ASSET_URLS } from '../../shared/components/constants';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  herovideo: string = ASSET_URLS.herovideo;

}
