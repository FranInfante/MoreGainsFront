import { Component, Input, Output, EventEmitter, ElementRef, ViewChild } from '@angular/core';
import { Plan } from '../../../../shared/interfaces/plan';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tabs.component.html',
  styleUrl: './tabs.component.css'
})
export class TabsComponent {
  @Input() plans: Plan[] = [];
  @Input() activePlanId: number | null = null;
  @Input() PlusSignIcon: string = '';
  @Output() planSelected = new EventEmitter<number>();
  @Output() addNewPlan = new EventEmitter<void>();

  @ViewChild('navTabs', { static: false }) navTabs!: ElementRef<HTMLUListElement>;

  selectPlan(id: number): void {
    this.planSelected.emit(id);
  }

  addPlan(): void {
    this.addNewPlan.emit();
  }

  scrollToRight(): void {
    if (this.navTabs) {
      const navTabsElement = this.navTabs.nativeElement;
      const maxScrollLeft = navTabsElement.scrollWidth - navTabsElement.clientWidth;
      navTabsElement.scrollTo({
        left: maxScrollLeft,
        behavior: 'smooth'
      });
    }
  }
}
