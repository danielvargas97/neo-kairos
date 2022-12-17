import { Component, OnInit, Input } from '@angular/core';
import { CareerSubject } from '../career-selector/career-selector.component';

@Component({
  selector: 'app-subject-checker',
  templateUrl: './subject-checker.component.html',
  styleUrls: ['./subject-checker.component.scss']
})
export class SubjectCheckerComponent implements OnInit {

  @Input() subject : any;
  selectedValue = '';

  constructor() { }

  ngOnInit(): void {
  }

}
