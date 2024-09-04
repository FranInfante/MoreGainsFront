import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgbdToastInline } from "./shared/components/toast/toast.component";
import { AngularSvgIconModule } from 'angular-svg-icon';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NgbdToastInline],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'MoreGainsFront';
}
