import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ColumnMode, DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';

import { CoreTranslationService } from '@core/services/translation.service';
import { FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { locale as german } from 'app/main/tables/examQuestionsList/i18n/de';
import { locale as english } from 'app/main/tables/examQuestionsList/i18n/en';
import { locale as french } from 'app/main/tables/examQuestionsList/i18n/fr';
import { locale as portuguese } from 'app/main/tables/examQuestionsList/i18n/pt';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as snippet from 'app/main/tables/examQuestionsList/datatables.snippetcode';

import { DatatablesService } from 'app/main/tables/examQuestionsList/datatables.service';
import { ItemsService } from 'app/service/config';
import { CoreMenuService } from '@core/components/core-menu/core-menu.service';

@Component({
  selector: 'app-datatables',
  templateUrl: './datatables.component.html',
  styleUrls: ['./datatables.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DatatablesComponent implements OnInit {
  // Private
  private _unsubscribeAll: Subject<any>;
  private tempData = [];

  // public
  public loginForm: FormGroup;
  public contentHeader: object;
  public rows: any;
  public selected = [];
  public kitchenSinkRows: any;
  public basicSelectedOption: number = 10;
  public ColumnMode = ColumnMode;
  public expanded = {};
  public editingName = {};
  public editingStatus = {};
  public editingAge = {};
  public editingSalary = {};
  public chkBoxSelected = [];
  public SelectionType = SelectionType;
  public exportCSVData;
  public payload = {};
  public initialData: any;
  public collegeList: Array<{}>;
  public selectedCollege;
  public coursesList: Array<{}>;
  public selectedCourse = '';
  public selectedSemester = '';
  public semesterList: Array<{}>;
  public selectedSubject = '';
  public subjectList: Array<{}>;
  public selectedChapter = '';
  public chapterList: Array<{}>;
  public selectedTopic = '';
  public topicList: Array<{}>;
  public cars = [
    { id: 1, name: "BMW Hyundai" },
    { id: 2, name: "Kia Tata" },
    { id: 3, name: "Volkswagen Ford" },
    { id: 4, name: "Renault Audi" },
    { id: 5, name: "Mercedes Benz Skoda" },
  ];


  @ViewChild(DatatableComponent) table: DatatableComponent;
  @ViewChild('tableRowDetails') tableRowDetails: any;

  // snippet code variables
  public _snippetCodeKitchenSink = snippet.snippetCodeKitchenSink;
  public _snippetCodeInlineEditing = snippet.snippetCodeInlineEditing;
  public _snippetCodeRowDetails = snippet.snippetCodeRowDetails;
  public _snippetCodeCustomCheckbox = snippet.snippetCodeCustomCheckbox;
  public _snippetCodeResponsive = snippet.snippetCodeResponsive;
  public _snippetCodeMultilangual = snippet.snippetCodeMultilangual;
  initial: any;
  editId: any;
  isSubmitted: boolean;
  currentUser: import("f:/angular_student_portal/src/app/auth/models/user").User;
  public isAdmin = false;

  // Public Methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Inline editing Name
   *
   * @param event
   * @param cell
   * @param rowIndex
   */
  inlineEditingUpdateName(event, cell, rowIndex) {
    this.editingName[rowIndex + '-' + cell] = false;
    this.rows[rowIndex][cell] = event.target.value;
    this.rows = [...this.rows];
  }

  /**
   * Inline editing Age
   *
   * @param event
   * @param cell
   * @param rowIndex
   */
  inlineEditingUpdateAge(event, cell, rowIndex) {
    this.editingAge[rowIndex + '-' + cell] = false;
    this.rows[rowIndex][cell] = event.target.value;
    this.rows = [...this.rows];
  }

  /**
   * Inline editing Salary
   *
   * @param event
   * @param cell
   * @param rowIndex
   */
  inlineEditingUpdateSalary(event, cell, rowIndex) {
    this.editingSalary[rowIndex + '-' + cell] = false;
    this.rows[rowIndex][cell] = event.target.value;
    this.rows = [...this.rows];
  }

  /**
   * Inline editing Status
   *
   * @param event
   * @param cell
   * @param rowIndex
   */
  inlineEditingUpdateStatus(event, cell, rowIndex) {
    this.editingStatus[rowIndex + '-' + cell] = false;
    this.rows[rowIndex][cell] = event.target.value;
    this.rows = [...this.rows];
  }

  /**
   * Search (filter)
   *
   * @param event
   */
  filterUpdate(event) {
    const val = event.target.value.toLowerCase();

    // filter our data
    const temp = this.tempData.filter(function (d) {
      return d.subjectName.toLowerCase().indexOf(val) !== -1 || !val;
    });

    // update the rows
    this.kitchenSinkRows = temp;
    // Whenever the filter changes, always go back to the first page
    this.table.offset = 0;
  }

  /**
   * Row Details Toggle
   *
   * @param row
   */
  rowDetailsToggleExpand(row) {
    this.tableRowDetails.rowDetail.toggleExpandRow(row);
  }

  modalOpenWarning(modalWarning, id?) {
    this.modalService.open(modalWarning, {
      centered: true,
      windowClass: 'modal modal-warning'
    });
    if (id) {
      this.editId = id
    } else {
      this.editId = 0
    }
  }

  modalOpenForm(modalForm, row?) {
    this.loginForm.reset()
    this.isSubmitted = false;
    // function getKeyByValue(object, value) {
    //   return Object.keys(object).find(key => object[key] === value);
    // }
    // if (row) {
    //   this.initial = { ...row, selectedAns: getKeyByValue(row, row.ans) }
    //   this.editId = row.id
    // } else {
    //   this.initial = {}
    //   this.editId = 0
    // }
    this.modalService.open(modalForm);
  }

  getError(k, message) {
    const controlErrors: ValidationErrors = this.loginForm.get(k).errors;
    if (controlErrors !== null && this.isSubmitted) {
      return message;
    }
    return "";
  }

  submit(data = this.loginForm.value) {
    console.log(data)
    // window.alert(subjectName + description)
    this.isSubmitted = true;
    if (this.loginForm.invalid) {
      return;
    }
    if (this.editId) {
      new ItemsService().childPath('post', 'Exam/UpdateExam', { id: this.editId, ...data, questionIds: this.selected.map((e) => e.id), semesterId: this.selectedSemester, addedByCollege: this.selectedCollege, AddedByUser: 0, isActive: true }).then((e) => {
        this.ngOnInit()
        this.modalService.dismissAll()
      })
    } else {
      new ItemsService().childPath('post', 'Exam/AddExam', { ...data, questionIds: this.selected.map((e) => e.id), isActive: true, semesterId: this.selectedSemester, addedByCollege: this.selectedCollege, AddedByUser: 0 }).then((e) => {
        this.ngOnInit()
        this.modalService.dismissAll()
      })
    }

  }

  collegeOnChange({ name, value }) {
    this._datatablesService.getColleges('coursesList', `?CollegeId=${value}`).then((response) => {
      this.coursesList = response
      this.selectedCourse = ''
      this.selectedSemester = ''
      this.selectedSubject = ''
      this.subjectList = []
      this.semesterList = []
      this.tempData = []
      this.kitchenSinkRows = [];
      this.exportCSVData = [];
      this.rows = []
    })
  }

  coursesOnChange({ name, value }) {
    this._datatablesService.getColleges('semesterList', `?CollegeId=${this.selectedCollege}&CourseId=${value}`).then((response) => {
      this.semesterList = response
      this.selectedSemester = ''
      this.selectedSubject = ''
      this.subjectList = []
      this.tempData = []
      this.kitchenSinkRows = [];
      this.exportCSVData = [];
      this.rows = []
    })
  }

  semesterOnChange({ name, value }) {
    this._datatablesService.getExamList(`?CollegeId=${this.selectedCollege}&SemId=${value}`).then((response) => {

    })
    this._datatablesService.getColleges('subjectsList', `?CollegeId=${this.selectedCollege}&CourseId=${this.selectedCourse}&SemId=${value}`).then((response) => {
      this.subjectList = response
      this.selectedSubject = ''
      this.tempData = []
      this.kitchenSinkRows = [];
      this.exportCSVData = [];
      this.rows = []
    })
  }

  subjectOnChange({ name, value }) {
    this._datatablesService.getColleges('chaptersList', `?CollegeId=${this.selectedCollege}&CourseId=${this.selectedCourse}&SemId=${this.selectedSemester}&SubId=${value}`).then((response) => {
      this.chapterList = response
      this.selectedChapter = ''
      this.tempData = []
      this.kitchenSinkRows = [];
      this.exportCSVData = [];
      this.rows = []
    })
  }

  chapterOnChange({ name, value }) {
    this._datatablesService.getColleges('topicsList', `?CollegeId=${this.selectedCollege}&CourseId=${this.selectedCourse}&SemId=${this.selectedSemester}&SubId=${this.selectedSubject}&ChapId=${value}`).then((response) => {
      this.topicList = response
      this.selectedTopic = ''
      this.tempData = []
      this.kitchenSinkRows = [];
      this.exportCSVData = [];
      this.rows = []
    })
  }

  topicOnChange(val) {
    this.getTopicList(val.map((e) => e.id))
  }

  getTopicList(value) {
    this._datatablesService.getDataTableRows(value).then(response => {
      if (this.selectedCourse !== '' && this.selectedCollege !== '' && this.selectedSemester !== '' && this.selectedSubject && this.selectedChapter) {
        this.initialData = response;
        let filter = response.filter((e) => value.some((el) => +e.topicId === +el))
        this.tempData = filter
        this.kitchenSinkRows = filter;
        this.exportCSVData = filter;
        this.rows = filter
      } else {
        this.initialData = response;
      }
    });
  }

  /**
   * For ref only, log selected values
   *
   * @param selected
   */
  onSelect({ selected }) {
    console.log('Select Event', selected, this.selected);

    this.selected.splice(0, this.selected.length);
    this.selected.push(...selected);
  }

  /**
   * For ref only, log activate events
   *
   * @param selected
   */
  onActivate(event) {
    // console.log('Activate Event', event);
  }

  /**
   * Custom Chkbox On Select
   *
   * @param { selected }
   */
  customChkboxOnSelect({ selected }) {
    this.chkBoxSelected.splice(0, this.chkBoxSelected.length);
    this.chkBoxSelected.push(...selected);
  }

  /**
   * Constructor
   *
   * @param {DatatablesService} _datatablesService
   * @param {CoreTranslationService} _coreTranslationService
   */
  constructor(private _datatablesService: DatatablesService, private _coreTranslationService: CoreTranslationService, private _formBuilder: FormBuilder, private modalService: NgbModal, private _coreMenuService: CoreMenuService) {
    this._unsubscribeAll = new Subject();
    this._coreTranslationService.translate(english, french, german, portuguese);
  }

  // Lifecycle Hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit() {
    this.loginForm = this._formBuilder.group({
      name: ['', Validators.required],
      markPerQuestion: ['', Validators.required],
      totalMarks: ['', Validators.required],
      totalExamTimeInMinutes: ['', Validators.required],
      examTime: ['', Validators.required]
    });
    if (this.selectedCollege === '') {
      this._datatablesService.getColleges('collegesList').then(response => {
        this.collegeList = response
      });
    }
    this._coreMenuService.onMenuChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
      this.currentUser = this._coreMenuService.currentUser;
      console.log(this.currentUser, "maulik303")
      if (this.currentUser.roleId === 1) {
        this.isAdmin = true;
        console.log(this.selectedCollege, "maulik312")
        if (!this.selectedCollege) {
          this._datatablesService.getColleges('collegesList').then(response => {
            this.collegeList = response
          });
        }
      } else {
        this.selectedCollege = this.currentUser.collegeId
        if (!this.selectedCourse) {
          this.collegeOnChange({ name: "", value: this.currentUser.collegeId });
        }
        this.isAdmin = false;
      }
    });
    // content header
    this.contentHeader = {
      headerTitle: 'Datatables',
      actionButton: true,
      breadcrumb: {
        type: '',
        links: [
          {
            name: 'Home',
            isLink: true,
            link: '/'
          },
          {
            name: 'Forms & Tables',
            isLink: true,
            link: '/'
          },
          {
            name: 'Datatables',
            isLink: false
          }
        ]
      }
    };
  }
}
