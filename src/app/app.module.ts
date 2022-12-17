import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CareerSelectorComponent } from './career-selector/career-selector.component';
import { FormsModule } from '@angular/forms';
import { SubjectCheckerComponent } from './subject-checker/subject-checker.component';

@NgModule({
  declarations: [
    AppComponent,
    CareerSelectorComponent,
    SubjectCheckerComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule,
    FormsModule
  ],
  exports: [
    CareerSelectorComponent,
    SubjectCheckerComponent,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
