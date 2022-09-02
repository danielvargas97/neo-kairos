import { Component, OnInit } from '@angular/core';

export interface Career {
  id: string;
  name: string;
}

export interface Faculty {
  id: string;
  name: string;
  careers: Career[];
}

export interface CareerSubject {
  id: string;
  name: string;
  subjectDetail?: SubjectDetail[];
}

export interface SubjectDetail {
  id: string;
  blocks: SubjectBlock[];
}

export interface SubjectBlock {
  dayOfTheWeek: string
  start: string;
  hour: string;
  loc: string;
}

@Component({
  selector: 'app-career-selector',
  templateUrl: './career-selector.component.html',
  styleUrls: ['./career-selector.component.scss']
})
export class CareerSelectorComponent implements OnInit {
  careerList: Career[] = [];
  selectedCareer?: string = '';
  searchedSubject: string = '';
  facultyList: Faculty[] = [];
  subjectList: any[] = [];
  copyList: any[] = [];
  selectedSubjectList: any[] = [];
  filteredItems: any[] = [];
  proncho: any = '';
  constructor() { }

  ngOnInit(): void {
    this.loadCareerList();
    //this.loadFile();
  }
  async getCareer(career: any): Promise<any> {
    //console.log(this.selectedCareer);
    //console.log(career);
    this.subjectList = [];
    await this.loadFile();

    this.copyList = this.subjectList;

  }
  selectSubject(subject: CareerSubject): void {

    const isSubjectSelected = this.selectedSubjectList.find(elem => elem.id == subject.id);

    if (isSubjectSelected == undefined) {

      this.selectedSubjectList.push(subject);
    }

  }

  unselectSubject(subject: CareerSubject): void {
    this.selectedSubjectList = this.selectedSubjectList.filter(elem => elem.id != subject.id);
  }

  cleanSelectedList(): void {
    this.selectedSubjectList = [];
  }

  filterSubjects(val: string): void {

    this.filteredItems = Object.assign([], this.subjectList);
    if (val != '') {
      this.filteredItems = this.filteredItems.filter((elem: CareerSubject) => elem.name.match(val.toUpperCase()) != null);
    }
  }

  isSelectedCareer(): Boolean {
    if (this.selectedCareer != '') {
      return true;
    }
    return false;
  }

  async loadCareerList() {
    await fetch("./assets/career_list.csv")
      .then((response) => response.text())
      .then((responseText) => {
        var careerFile = responseText.split("\n");
        careerFile = careerFile.slice(1, careerFile.length - 1);

        careerFile.forEach(elem => {
          let careerRow = elem.split("|")
          this.careerList.push({ id: careerRow[0], name: careerRow[1] })
        })

      })
      .catch(error => console.log(error));
  }


  async loadFile() {
    await fetch("./assets/kairos.xml")
      .then((response) => response.text())
      .then((responseText) => {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(responseText, "text/xml");
        let lejson = [];
        let xmlFacultyList = xmlDoc.getElementsByTagName("Facultad");
        console.log(xmlFacultyList);

        for (let i = 0; i < xmlFacultyList.length; i++) {
          var facultyJson: any = {}
          facultyJson["id"] = i;
          facultyJson["name"] = xmlFacultyList[i].getAttribute("name");
          facultyJson["careers"] = [];
          let faculty = xmlFacultyList[i];
          let career = faculty.getElementsByTagName("Carrera");
          for (let j = 0; j < career.length; j++) {
            facultyJson["careers"].push({ id: "x", name: career[j].getAttribute("name") });


            if (career[j].getAttribute("name") == this.selectedCareer) {

              let subjects = career[j].getElementsByTagName("Asignatura");
              console.log(subjects)
              for (let k = 0; k < subjects.length; k++) {


                let groups = subjects[k].getElementsByTagName("Grupo");
                let groupList = [];
                for (let m = 0; m < groups.length; m++) {
                  let blocks = groups[m].getElementsByTagName("Block");
                  let blockList = [];
                  for (let w = 0; w < blocks.length; w++) {
                    blockList.push({
                      day: blocks[w].getElementsByTagName("day")[0].innerHTML,
                      start: blocks[w].getElementsByTagName("sHour")[0].innerHTML,
                      end: blocks[w].getElementsByTagName("eHour")[0].innerHTML,
                      loc: blocks[w].getElementsByTagName("loc")[0].innerHTML
                    });
                  }
                  groupList.push({
                    id: groups[m].getAttribute("number"),
                    block: blockList
                  });

                }
                let subject = {
                  id: subjects[k].getAttribute("code"),
                  name: subjects[k].getAttribute("name"),
                  subjectDetailList: groupList
                };

                //console.log(subject);

                this.subjectList.push(subject);
                //console.log(subjects[k].getAttribute("name"));
              }
            }


            //console.log(career[j]);
          }
          lejson.push(facultyJson);
        }
        //console.log(lejson);


      })
      .then(() => {
        this.filteredItems = Object.assign([], this.subjectList);
      })
      .catch(error => console.log(error));
  }
}
