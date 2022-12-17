import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CareerSelectorComponent } from './career-selector/career-selector.component';
const routes: Routes = [

  { path: '', component: CareerSelectorComponent}

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  declarations:[
    CareerSelectorComponent
  ]
})
export class AppRoutingModule { }
