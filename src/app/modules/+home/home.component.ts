import { Component } from '@angular/core';
import { HeroComponent } from './components/hero/hero.component';
import { LandingcomponentsComponent } from "./components/landingcomponents/landingcomponents.component";
import { FooterComponent } from "../../shared/components/footer/footer.component";

@Component({
    selector: 'app-home',
    standalone: true,
    templateUrl: './home.component.html',
    styleUrl: './home.component.css',
    imports: [HeroComponent, LandingcomponentsComponent, FooterComponent]
})
export class HomeComponent {

}
