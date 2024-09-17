import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { Plan } from '../../../../shared/interfaces/plan';

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
  @Input() editMode: boolean = false;
  @Output() planSelected = new EventEmitter<number>();
  @Output() addNewPlan = new EventEmitter<void>();
  @Output() toggleEditMode = new EventEmitter<void>();
  @ViewChild('navTabs', { static: false }) navTabs!: ElementRef<HTMLUListElement>;

  selectPlan(id: number): void {
    this.planSelected.emit(id);

    if (this.editMode) {
      this.toggleEditMode.emit();
    }
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
