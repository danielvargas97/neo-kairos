import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CareerSelectorComponent } from './career-selector/career-selector.component';
import { FormsModule } from '@angular/forms';
import { SubjectListFilterPipe } from './subject-list-filter.pipe';

@NgModule({
  declarations: [
    AppComponent,
    CareerSelectorComponent,
    SubjectListFilterPipe
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
