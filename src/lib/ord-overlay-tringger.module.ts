import { NgModule } from '@angular/core';
import { OrdOverlayContentComponent } from './dir/ord-overlay-content/ord-menu.component';
import { OrdOverlayTringgerDirective } from './dir/ord-overlay-tringger.directive';



@NgModule({
  declarations: [
      OrdOverlayContentComponent,
      OrdOverlayTringgerDirective
  ],
  imports: [
  ],
  exports: [
      OrdOverlayContentComponent,
      OrdOverlayTringgerDirective
  ]
})
export class OrdOverlayTringgerModule { }
