import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ColumnMode, DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';

import { CoreTranslationService } from '@core/services/translation.service';
import { FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { locale as german } from 'app/main/tables/courses/i18n/de';
import { locale as english } from 'app/main/tables/courses/i18n/en';
import { locale as french } from 'app/main/tables/courses/i18n/fr';
import { locale as portuguese } from 'app/main/tables/courses/i18n/pt';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as snippet from 'app/main/tables/courses/datatables.snippetcode';

import { DatatablesService } from 'app/main/tables/courses/datatables.service';
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
  public selectedCollege = '';

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
      return d.name.toLowerCase().indexOf(val) !== -1 || !val;
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
    this.loginForm.reset()
    this.isSubmitted = false;
    if (row) {
      this.initial = row
      this.editId = row.id
      for (let key in this.loginForm.value) {
        this.loginForm.get(key).setValue(row[key])
      }
    } else {
      this.initial = {}
      this.editId = 0
    }

    this.modalService.open(modalForm);
  }

  deleteData() {
    console.log(this.editId)
    new ItemsService().childPath('get', `Colleges/DeleteCourses?id=${this.editId}`).then((e) => {
      // window.alert(e.data.message)
      this.ngOnInit()
      this.modalService.dismissAll()
    })
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
      new ItemsService().childPath('post', 'Colleges/UpdateCourses', { id: this.editId, ...data, collegeId: this.selectedCollege, isActive: true }).then((e) => {
        // window.alert(e.data.message)
        this.ngOnInit()
        this.modalService.dismissAll()

      })
    } else {
      new ItemsService().childPath('post', 'Colleges/AddCourses', { ...data, collegeId: this.selectedCollege, isActive: true }).then((e) => {
        // window.alert(e.data.message)
        this.ngOnInit()
        this.modalService.dismissAll()

      })
    }


  }

  collegeOnChange({ name, value }) {
    console.log(name, value)
    let filter = this.initialData.filter((e) => +e.collegeId === +value)
    this.tempData = filter
    this.kitchenSinkRows = filter;
    this.exportCSVData = filter;
    this.rows = filter
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
      name: ['', Validators.required],
    });

    this._datatablesService.getDataTableRows().then(response => {
      if (this.selectedCollege !== '') {
        this.initialData = response;
        let filter = response.filter((e) => +e.collegeId === +this.selectedCollege)
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
