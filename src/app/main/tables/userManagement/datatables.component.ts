import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ColumnMode, DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';

import { CoreTranslationService } from '@core/services/translation.service';

import { locale as german } from 'app/main/tables/userManagement/i18n/de';
import { locale as english } from 'app/main/tables/userManagement/i18n/en';
import { locale as french } from 'app/main/tables/userManagement/i18n/fr';
import { locale as portuguese } from 'app/main/tables/userManagement/i18n/pt';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as snippet from 'app/main/tables/userManagement/datatables.snippetcode';
import { CoreMenuService } from '@core/components/core-menu/core-menu.service';
import { DatatablesService } from 'app/main/tables/userManagement/datatables.service';
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
  public contentHeader: object;
  public rows: any;
  public initialData: any;
  public collegeList: Array<{}>;
  public coursesList: Array<{}>;
  public semesterList: Array<{}>;
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
  public selectedCollege = '';
  public selectedCourse = '';
  public selectedSemester = '';
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
  currentUser: any;

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
    console.log(row)
    if (row) {
      this.initial = row
      this.editId = row.id
    } else {
      this.initial = {}
      this.editId = 0
    }

    this.modalService.open(modalForm);
  }

  deleteData() {
    console.log(this.editId)
    new ItemsService().childPath('get', `User/DeleteUsers?id=${this.editId}`).then((e) => {
      // window.alert(e.data.message)
      this.ngOnInit()
      this.modalService.dismissAll()
    })
  }


  submit(data) {
    // window.alert(subjectName + description)
    if (this.editId) {
      new ItemsService().childPath('post', 'User/UpdateUsers', { id: this.editId, ...data, collegeId: this.selectedCollege, isActive: true, semesterId: this.selectedSemester, courses: this.selectedCourse }).then((e) => {
        // window.alert(e.data.message)
        this.ngOnInit()
        this.modalService.dismissAll()
      })
    } else {
      new ItemsService().childPath('post', 'User/AddUsers', { ...data, collegeId: this.selectedCollege, isActive: true, semesterId: this.selectedSemester, courses: this.selectedCourse }).then((e) => {
        // window.alert(e.data.message)
        this.ngOnInit()
        this.modalService.dismissAll()
      })
    }


  }

  collegeOnChange({ name, value }) {
    console.log(name, value)
    console.log(this.initialData, this.initialData.filter((e: any) => +e.collegeId === +value))
    this._datatablesService.getColleges('coursesList', `?CollegeId=${value}`).then((response) => {
      let filter = this.initialData.filter((e) => +e.collegeId === +value)
      this.tempData = filter
      this.kitchenSinkRows = filter;
      this.exportCSVData = filter;
      this.rows = filter
      this.coursesList = response
      this.semesterList = []
      this.selectedCourse = '';
      this.selectedSemester = '';
    })
  }

  coursesOnChange({ name, value }) {
    console.log(name, value)
    this._datatablesService.getColleges('semesterList', `?CollegeId=${value}&CourseId=${value}`).then((response) => {
      let filter = this.initialData.filter((e) => +e.collegeId === +this.selectedCollege && +e.courses === +value)
      this.tempData = filter
      this.kitchenSinkRows = filter;
      this.exportCSVData = filter;
      this.rows = filter
      this.semesterList = response
      this.selectedSemester = '';
    })
  }

  semesterOnChange({ name, value }) {
    console.log(name, value)
    let filter = this.initialData.filter((e) => +e.collegeId === +this.selectedCollege && +e.courses === +this.selectedCourse && +e.semesterId === +value)
    this.tempData = filter
    this.kitchenSinkRows = filter;
    this.exportCSVData = filter;
    this.rows = filter
    // this._datatablesService.getColleges('semesterList', `?CollegeId=${value}&CourseId=${value}`).then((response) => {
    //   this.semesterList = response
    // })
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
  constructor(private _datatablesService: DatatablesService, private _coreTranslationService: CoreTranslationService, private modalService: NgbModal, private _coreMenuService: CoreMenuService) {
    this._unsubscribeAll = new Subject();
    this._coreTranslationService.translate(english, french, german, portuguese);
  }

  // Lifecycle Hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit() {
    this._datatablesService.getDataTableRows().then(response => {
      this.initialData = response;
    });

    this._datatablesService.getColleges('collegesList').then(response => {
      this.collegeList = response
    });

    this._coreMenuService.onMenuChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
      this.currentUser = this._coreMenuService.currentUser;
      console.log(this.currentUser, "maulik303")
      if (this.currentUser.userRoleId === 1) {
        // this._datatablesService.getColleges('collegesList').then(response => {
        //   this.collegeList = response
        // });
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
