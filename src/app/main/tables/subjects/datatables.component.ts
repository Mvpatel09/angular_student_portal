import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ColumnMode, DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';

import { CoreTranslationService } from '@core/services/translation.service';
import { FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { locale as german } from 'app/main/tables/subjects/i18n/de';
import { locale as english } from 'app/main/tables/subjects/i18n/en';
import { locale as french } from 'app/main/tables/subjects/i18n/fr';
import { locale as portuguese } from 'app/main/tables/subjects/i18n/pt';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { environment } from 'environments/environment';
import * as snippet from 'app/main/tables/subjects/datatables.snippetcode';

import { DatatablesService } from 'app/main/tables/subjects/datatables.service';
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
  public initial = {}
  public editId = 0
  public file = null;
  public initialData: any;
  public collegeList: Array<{}>;
  public selectedCollege = '';
  public coursesList: Array<{}>;
  public selectedCourse = '';
  public selectedSemester = '';
  public semesterList: Array<{}>;
  public imageUrl = environment.apiUrl

  @ViewChild(DatatableComponent) table: DatatableComponent;
  @ViewChild('tableRowDetails') tableRowDetails: any;

  // snippet code variables
  public _snippetCodeKitchenSink = snippet.snippetCodeKitchenSink;
  public _snippetCodeInlineEditing = snippet.snippetCodeInlineEditing;
  public _snippetCodeRowDetails = snippet.snippetCodeRowDetails;
  public _snippetCodeCustomCheckbox = snippet.snippetCodeCustomCheckbox;
  public _snippetCodeResponsive = snippet.snippetCodeResponsive;
  public _snippetCodeMultilangual = snippet.snippetCodeMultilangual;
  isSubmitted: boolean;

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

  modalOpenForm(modalForm, row?) {
    console.log(row)
    this.loginForm.reset()
    this.isSubmitted = false;
    if (row) {
      this.initial = row
      this.editId = row.id
      this.editor = row.description
      for (let key in this.loginForm.value) {
        this.loginForm.get(key).setValue(row[key])
      }
    } else {
      this.initial = {}
      this.editId = 0
    }

    this.modalService.open(modalForm);
  }

  onFileSelected(event) {
    if (event.target.files.length > 0) {
      console.log(event.target.files[0]);
      this.file = event.target.files[0]
    }
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
      let formData = new FormData();
      formData.append("file", this.file);
      formData.append("id", this.editId.toString());
      formData.append("subjectName", data.subjectName);
      formData.append("description", this.editor);
      formData.append("filePath", "test");
      formData.append("isActive", true as any);
      formData.append("semesterId", this.selectedSemester);
      new ItemsService().childPath('post', 'Subject/UpdateSubject', formData).then((e) => {
        // window.alert(e.data.message)
        this.ngOnInit()
        this.modalService.dismissAll()
      })
    } else {
      let formData = new FormData();
      formData.append("file", this.file);
      formData.append("subjectName", data.subjectName);
      formData.append("description", this.editor);
      formData.append("filePath", "test");
      formData.append("isActive", true as any);
      formData.append("semesterId", this.selectedSemester);
      new ItemsService().childPath('post', 'Subject/AddSubject', formData).then((e) => {
        // window.alert(e.data.message)
        this.ngOnInit()
        this.modalService.dismissAll()
      })
    }
  }

  deleteData() {
    console.log(this.editId)
    new ItemsService().childPath('get', `Subject/DeleteSubject?id=${this.editId}`).then((e) => {
      // window.alert(e.data.message)
      this.ngOnInit()
      this.modalService.dismissAll()
    })
  }


  collegeOnChange({ name, value }) {
    this._datatablesService.getColleges('coursesList', `?CollegeId=${value}`).then((response) => {
      this.coursesList = response
      this.selectedCourse = ''
      this.selectedSemester = ''
      this.semesterList = []
      this.tempData = []
      this.kitchenSinkRows = [];
      this.exportCSVData = [];
      this.rows = []
    })
  }

  coursesOnChange({ name, value }) {
    this._datatablesService.getColleges('semesterList', `?CollegeId=${value}&CourseId=${value}`).then((response) => {
      this.semesterList = response
      this.selectedSemester = ''
      this.tempData = []
      this.kitchenSinkRows = [];
      this.exportCSVData = [];
      this.rows = []
    })
  }

  semesterOnChange({ name, value }) {
    let filter = this.initialData.filter((e) => +e.semesterId === +value)
    this.tempData = filter
    this.kitchenSinkRows = filter;
    this.exportCSVData = filter;
    this.rows = filter
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
  constructor(private _datatablesService: DatatablesService, private _coreTranslationService: CoreTranslationService, private _formBuilder: FormBuilder, private modalService: NgbModal) {
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
      subjectName: ['', Validators.required],
      description: [''],
      file: ['', Validators.required],
    });
    this._datatablesService.getDataTableRows().then(response => {
      if (this.selectedCourse !== '' && this.selectedCollege !== '' && this.selectedSemester !== '') {
        this.initialData = response;
        let filter = response.filter((e) => +e.semesterId === +this.selectedSemester)
        this.tempData = filter
        this.kitchenSinkRows = filter;
        this.exportCSVData = filter;
        this.rows = filter
      } else {
        this.initialData = response;
      }
    });

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
