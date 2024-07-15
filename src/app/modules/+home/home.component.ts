import { Component } from '@angular/core';
import { HeroComponent } from './components/hero/hero.component';
import { LandingcomponentsComponent } from "./components/landingcomponents/landingcomponents.component";

@Component({
    selector: 'app-home',
    standalone: true,
    templateUrl: './home.component.html',
    styleUrl: './home.component.css',
    imports: [HeroComponent, LandingcomponentsComponent]
})
export class HomeComponent {

}
