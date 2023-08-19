import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ColumnMode, DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';

import { CoreTranslationService } from '@core/services/translation.service';

import { locale as german } from 'app/main/tables/questionBank/i18n/de';
import { locale as english } from 'app/main/tables/questionBank/i18n/en';
import { locale as french } from 'app/main/tables/questionBank/i18n/fr';
import { locale as portuguese } from 'app/main/tables/questionBank/i18n/pt';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as snippet from 'app/main/tables/questionBank/datatables.snippetcode';

import { DatatablesService } from 'app/main/tables/questionBank/datatables.service';
import { ItemsService } from 'app/service/config';

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
  @ViewChild('editor') editor;
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
  public selectedCollege = '';
  public coursesList: Array<{}>;
  public selectedCourse = '';
  public selectedSemester = '';
  public semesterList: Array<{}>;
  public selectedSubject = '';
  public subjectList: Array<{}>;
  public selectedChapter = '';
  public chapterList: Array<{}>;
  public selectedTopic = 0;
  public topicList: Array<{}>;

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
    function getKeyByValue(object, value) {
      return Object.keys(object).find(key => object[key] === value);
    }
    if (row) {
      this.initial = { ...row, selectedAns: getKeyByValue(row, row.ans) }
      this.editId = row.id
    } else {
      this.initial = {}
      this.editId = 0
    }
    this.modalService.open(modalForm);
  }

  submit(data) {
    if (this.editId) {
      new ItemsService().childPath('post', 'ExamQuestion/UpdateExamQuestion', { id: this.editId, description: this.editor, ...data, topicId: this.selectedTopic, ans: data[data.selectedAns], isActive: true }).then((e) => {
        this.ngOnInit()
        this.getTopicList(this.selectedTopic)
        this.modalService.dismissAll()
      })
    } else {
      new ItemsService().childPath('post', 'ExamQuestion/AddExamQuestion', { ...data, topicId: this.selectedTopic, description: this.editor, isActive: true, ans: data[data.selectedAns] }).then((e) => {
        this.ngOnInit()
        this.getTopicList(this.selectedTopic)
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
      this.selectedTopic = 0
      this.tempData = []
      this.kitchenSinkRows = [];
      this.exportCSVData = [];
      this.rows = []
    })
  }

  topicOnChange({ name, value }) {
    this.getTopicList(value)
    // let filter = this.initialData.filter((e) => +e.topicId === +value)
    // this.tempData = filter
    // this.kitchenSinkRows = filter;
    // this.exportCSVData = filter;
    // this.rows = filter
  }

  getTopicList(value) {
    this._datatablesService.getDataTableRows([value]).then(response => {
      if (this.selectedCourse !== '' && this.selectedCollege !== '' && this.selectedSemester !== '' && this.selectedSubject && this.selectedChapter) {
        this.initialData = response;
        let filter = response.filter((e) => +e.topicId === +value)
        this.tempData = filter
        this.kitchenSinkRows = filter;
        this.exportCSVData = filter;
        this.rows = filter
      } else {
        this.initialData = response;
      }
    });
  }

  modules = {
    formula: true,
    toolbar: [
      [{ header: [1, 2, false] }],
      ['bold', 'italic', 'underline'],
      ['formula'],
      ['image', 'code-block']
    ]
  };

  logChange({ html }) {
    console.log(html)
    this.editor = html
  }

  add3Dots(string, limit = 20) {
    string = string.replace(/(<([^>]+)>)/ig, '')
    if (string.length > limit) {
      string = string.substring(0, limit) + "...";
    }
    return string;
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
  constructor(private _datatablesService: DatatablesService, private _coreTranslationService: CoreTranslationService, private modalService: NgbModal) {
    this._unsubscribeAll = new Subject();
    this._coreTranslationService.translate(english, french, german, portuguese);
  }

  // Lifecycle Hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit() {

    if (this.selectedCollege === '') {
      this._datatablesService.getColleges('collegesList').then(response => {
        this.collegeList = response
      });
    }

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
