import { Component, OnInit } from '@angular/core';
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';

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

export interface SelectedSubjectSelector {
  id: string;
  name: string;
  subjectDetail?: SubjectDetail[];
  value: string;
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

export interface GroupSelector {
  id: string;
  blocks: SubjectBlock[];
  isDisabled: boolean
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
  daysOfWeek = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
  days = "LUNES|MARTES|MIERCOLES|JUEVES|VIERNES|SABADO|DOMINGO".split("|")
  hours = [...Array(17).keys()].map(elem => 6 + elem);
  scheduledList: any[] = [];

  schedule: any = {};
  hourList = [...Array(17).keys()].map(elem => 6 + elem).map(elem => elem.toString());
  scheduledSubjectList = [];

  kit: any[] = []

  constructor() { }

  ngOnInit(): void {
    this.loadCareerList();
    //this.loadFile();
    this.createScheduleGrid();
    this.generateSchedule();
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

      this.disableGroupsFromOtherSubjects(subject.id);
    }

    console.log(this.selectedSubjectList);
    console.log(this.schedule);
  }

  unselectSubject(subject: CareerSubject): void {
    this.selectedSubjectList = this.selectedSubjectList.filter(elem => elem.id != subject.id);
  }

  cleanSelectedList(): void {
    this.selectedSubjectList = [];
    this.scheduledList = [];
    this.generateSchedule();
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

  getDefaultHour(value: string) {
    return {
      value: value,
      infoStudent: null,
      isOnUse: false
    };
  }

  generateSchedule() {
    this.days.forEach(elem => {

      let hours = this.hourList.map(item => this.getDefaultHour(item));
      this.schedule[elem] = hours;
    })
  }


  filterGroups(subjectId: string, groupId: any) {

    if(groupId == ''){
      if(this.isOnScheduledList(subjectId)){      
  
        let groupToUnscheduleId = this.scheduledList.filter(item => item.id == subjectId)[0].groupId;
        let group =  (this.selectedSubjectList
          .filter(item => item.id == subjectId)
          .map(elem => elem.subjectDetailList)[0])
          .filter((elem: any) => elem.id == groupToUnscheduleId)[0];
  
        console.log(groupToUnscheduleId);
        console.log("----")
        console.log(group)
  
        this.unsetGroupSubjectOnSchedule(subjectId, group);
  
        this.scheduledList = this.scheduledList.filter(item => item.id != subjectId);   
        
        this.selectedSubjectList
        .forEach(elem => {
            let isDisabled = elem.subjectDetailList.map((item: any) => { return {id: item.id,  isDisabled:this.checkUnavailability(item)}});
            
            isDisabled.forEach( (item : any) => this.toggleGroup(elem.id, item.id, item.isDisabled));
  
          });        
      }


    }
    else{


      console.log("SubjectId: ", subjectId);

      let groupOfSubject = (this.selectedSubjectList
        .filter(item => item.id == subjectId)
        .map(elem => elem.subjectDetailList)[0])
        .filter((elem: any) => elem.id == groupId)[0];
  
      console.log(groupOfSubject);
  
      if(this.isOnScheduledList(subjectId)){      
  
        let groupToUnscheduleId = this.scheduledList.filter(item => item.id == subjectId)[0].groupId;
        let group =  (this.selectedSubjectList
          .filter(item => item.id == subjectId)
          .map(elem => elem.subjectDetailList)[0])
          .filter((elem: any) => elem.id == groupToUnscheduleId)[0];
  
        console.log(groupToUnscheduleId);
        console.log("----")
        console.log(group)
  
        this.unsetGroupSubjectOnSchedule(subjectId, group);
  
        this.scheduledList = this.scheduledList.filter(item => item.id != subjectId);
      }
  
      this.scheduledList.push({
        "id": subjectId,
        "groupId" : groupId
      });
  
      if (!this.checkUnavailability(groupOfSubject)) {
        console.log("The group %s of subject with id %s is available", groupId, subjectId);
        this.setGroupSubjectOnSchedule(subjectId, groupOfSubject);
      }
  
  
      console.log(this.schedule);
  
      this.disableGroupsFromOtherSubjects(subjectId);
        
      console.log(this.selectedSubjectList);
      console.log(this.scheduledList);
  
  
      //this.printSched()
      //console.log("S:" + aaa);
  
    }
  }

  disableGroupsFromOtherSubjects(subjectId: string) {
    this.selectedSubjectList
      .filter(elem => elem.id != subjectId)
      .forEach(elem => {
        let isDisabled = elem.subjectDetailList.map((item: any) => { return { id: item.id, isDisabled: this.checkUnavailability(item) } });

        isDisabled.forEach((item: any) => this.toggleGroup(elem.id, item.id, item.isDisabled));

      });
  }

  setGroupSubjectOnSchedule(subjectId : any, group : any){
    group.block.forEach( (item :any)  => {
      //console.log(this.schedule[item.day][parseInt(item.start) - 6]);
      this.schedule[item.day][parseInt(item.start) - 6].isOnUse = true;
      this.schedule[item.day][parseInt(item.start) - 6].infoStudent = { subject : this.selectedSubjectList.find(elem => elem.id ==subjectId), group: this.findSpecificBlock(group,item.day,item.start)}
    });
  }

  unsetGroupSubjectOnSchedule(subjectId : any, group : any){
    group.block.forEach( (item :any)  => {
      console.log("AAAA")
      console.log(this.schedule[item.day][parseInt(item.start) - 6]);
      this.schedule[item.day][parseInt(item.start) - 6].isOnUse = false;
      this.schedule[item.day][parseInt(item.start) - 6].infoStudent = null;
    });
  }

  findSpecificBlock(group :any , day :any, hour :any){

    return {
      id: group.id,
      block: group.block.filter( (item:any ) => item.day == day && item.start == hour)[0],
      isDisabled: group.isDisabled
    }
  }

  isOnScheduledList(subjectId : string){
    let isOnSchedule = this.scheduledList.filter(item => (item.id == subjectId));
    return isOnSchedule.length > 0;
  }


  checkUnavailability(group: any) {


    let availableBlocks = group.block.filter((item: any) => this.schedule[item['day']][parseInt(item['start']) - 6].isOnUse == false);

    //console.log(availableBlocks);

    if (availableBlocks.length < group.block.length) {
      console.warn("The group %s is not available under this schedule", group.id)
      return true;
    }
    return false;
  }

  toggleGroup(subjectId : string, groupId: string, value : boolean){

    let subjectIndex = this.selectedSubjectList.findIndex(item => item.id == subjectId);

    let groupIndex = this.selectedSubjectList[subjectIndex].subjectDetailList.findIndex( (item : any) => item.id == groupId);

    if((this.selectedSubjectList[subjectIndex])["value"] != undefined){
      let valSplit = (this.selectedSubjectList[subjectIndex])["value"].split("|");
      let selectedSubject = this.selectedSubjectList.findIndex(item => item.id == valSplit[0]);
      let selectedGroup = this.selectedSubjectList[subjectIndex].subjectDetailList.findIndex( (item : any) => item.id == valSplit[1]);
  
      if(subjectIndex == selectedSubject && selectedGroup == groupIndex){
        this.selectedSubjectList[subjectIndex].subjectDetailList[groupIndex].isDisabled = false;  
      }
      else{
        this.selectedSubjectList[subjectIndex].subjectDetailList[groupIndex].isDisabled = value;
      }
    }
    else{
      this.selectedSubjectList[subjectIndex].subjectDetailList[groupIndex].isDisabled = value;
    }
    

  }


  getGroupInfo(group : any){
    
    return `<div><h6>${group.id}</h6></div>`;

  }

  createScheduleGrid(): void {
    this.kit = this.days.map(elem => {
      return { id: elem, hours: [...Array(17).keys()].map(i => '-') }
    })
  }

  printSchedule() {


    const doc = new jsPDF({
      orientation: 'l',
      unit: 'mm',
      format: 'legal',
      putOnlyUsedFonts:true
     })    

    doc.setFontSize(16);
    doc.text("Horario de clase", doc.internal.pageSize.getWidth() / 2, 50);
    doc.setFontSize(8);

    
    autoTable(doc, { html: '#schedTable', useCss: true, startY: 10, tableWidth: 'auto', styles: {minCellWidth: 5, fontSize: 8, overflow: 'linebreak'}});
    doc.output("dataurlnewwindow");
  }

  selectSchedule(val: any): void {
    console.log(val);

    if (val == '') {
      console.log('F')
    }
    else {
      const vals = val.split("|");
      let subject = this.selectedSubjectList.filter(elem => elem.id == vals[0])[0]
      console.log(subject);
      let requiredGroup = subject.subjectDetailList.filter((elem: any) => elem.id == vals[1])[0];
      console.log(requiredGroup);

      let subjectOnList = this.scheduledList.filter(item => item.subject_id == subject.id)
      console.log(subjectOnList);

      if (subjectOnList.length > 0) {
        this.scheduledList = this.scheduledList.filter(item => item.subject_id != subject.id);


        this.selectedSubjectList.forEach(elem => {

          if (elem.id != subject.id) {

            elem.subjectDetailList.forEach((item: any) => {
              item.isDisabled = true;
            });

          }

        });



        let tempSched: any[] = []
        requiredGroup.block.forEach((elem: any) => {
          let dayIndex = this.days.findIndex(day => day == elem.day)

          tempSched.push({
            subject_id: subject.id,
            subject_name: subject.name,
            group_id: requiredGroup.id,
            start: elem.start,
            end: elem.end,
            day: elem.day,
            loc: elem.loc
          });
          this.kit[dayIndex].hours[elem.start - 6] = {
            subject_id: subject.id,
            subject_name: subject.name,
            group_id: requiredGroup.id,
            start: elem.start,
            end: elem.end,
            day: elem.day,
            loc: elem.loc
          }
        })

        tempSched.forEach((elem: any) => {
          this.scheduledList.push(elem);
        })

        console.log(this.scheduledList);

      }
      else {
        let tempSched: any[] = []
        requiredGroup.block.forEach((elem: any) => {
          let dayIndex = this.days.findIndex(day => day == elem.day)

          tempSched.push({
            subject_id: subject.id,
            subject_name: subject.name,
            group_id: requiredGroup.id,
            start: elem.start,
            end: elem.end,
            day: elem.day,
            loc: elem.loc
          });
          this.kit[dayIndex].hours[elem.start - 6] = {
            subject_id: subject.id,
            subject_name: subject.name,
            group_id: requiredGroup.id,
            start: elem.start,
            end: elem.end,
            day: elem.day,
            loc: elem.loc
          }
        })

        tempSched.forEach((elem: any) => {
          this.scheduledList.push(elem);
        })

        console.log(this.scheduledList);
      }




    }
  }
}
