import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ColumnMode, DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';

import { CoreTranslationService } from '@core/services/translation.service';
import { FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { locale as german } from 'app/main/tables/topics/i18n/de';
import { locale as english } from 'app/main/tables/topics/i18n/en';
import { locale as french } from 'app/main/tables/topics/i18n/fr';
import { locale as portuguese } from 'app/main/tables/topics/i18n/pt';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as snippet from 'app/main/tables/topics/datatables.snippetcode';

import { DatatablesService } from 'app/main/tables/topics/datatables.service';
import { ItemsService } from 'app/service/config';
import { environment } from 'environments/environment';
import { CoreMenuService } from '@core/components/core-menu/core-menu.service';
import { User } from 'app/auth/models';

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
  public imagePreview = 'assets/images/previewImage/previewImage.png'
  public imagePreviewAttachMents = 'assets/images/previewImage/previewImage.png'
  public adminAttachMentsPre = ''
  public collegeAttachMentsPre = ''
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
  public attachMents: Array<{}>;
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
  editId: any;
  initial: any;
  file: any;
  isSubmitted: boolean;
  collegeAttachMents: any;
  currentUser: User;
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
      return d.topicName.toLowerCase().indexOf(val) !== -1 || !val;
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

  onFileSelected(event) {
    let { files, name } = event.target
    if (name === 'file' && files.length) {
      this.file = event.target.files[0]
      const reader = new FileReader();
      reader.onload = e => this.imagePreview = reader.result as any;
      reader.readAsDataURL(this.file)
    }
    if (name === 'attachMents' && files.length) {
      this.attachMents = event.target.files
      const reader = new FileReader();
      reader.onload = e => this.imagePreviewAttachMents = reader.result as any;
      reader.readAsDataURL(this.attachMents[0] as any)
    }
    if (name === 'collegeAttachMents' && files.length) {
      this.collegeAttachMents = event.target.files[0]
      // const reader = new FileReader();
      // reader.onload = e => this.imagePreviewAttachMents = reader.result as any;
      // reader.readAsDataURL(this.attachMents[0] as any)
    }
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

  getError(k, message) {
    const controlErrors: ValidationErrors = this.loginForm.get(k).errors;
    if (controlErrors !== null && this.isSubmitted) {
      return message;
    }
    return "";
  }

  modalOpenForm(modalForm, row?) {
    console.log(row)
    this.loginForm.reset()
    this.isSubmitted = false;
    this.imagePreview = 'assets/images/previewImage/previewImage.png'
    this.imagePreviewAttachMents = 'assets/images/previewImage/previewImage.png'
    if (row) {
      this.initial = row
      this.editId = row.id
      this.loadAttachments(this.editId, modalForm)
      this.editor = row.description
      this.imagePreview = this.imageUrl + '/' + row.filePath
      // this.imagePreviewAttachMents = this.imageUrl + '/' + row.filePath
      console.log(this.imageUrl + '/' + this.adminAttachMentsPre)
      console.log(this.imageUrl + '/' + this.collegeAttachMentsPre)
      this.loginForm.get('file').setValidators([])
      this.loginForm.get('attachMents').setValidators([])
      for (let key in this.loginForm.value) {
        this.loginForm.get(key).setValue(row[key])
      }
    } else {
      this.initial = {}
      this.editId = 0
      this.modalService.open(modalForm);
    }


  }

  deleteData() {
    console.log(this.editId)
    new ItemsService().childPath('get', `Topic/DeleteTopics?id=${this.editId}`).then((e) => {
      // window.alert(e.data.message)
      this.ngOnInit()
      this.modalService.dismissAll()
    })
  }

  loadAttachments(subTopicId, modalForm) {
    new ItemsService().childPath('get', `Topic/GetTopicattachmentsByTopic?TopicId=${subTopicId}`).then((e) => {
      this.collegeAttachMentsPre = e.data.data.table?.length && e.data.data.table[0].filePath as any
      this.adminAttachMentsPre = e.data.data.table?.length && e.data.data.table[1].filePath as any
      console.log(this.imageUrl + '/' + this.collegeAttachMentsPre)
      console.log(this.imageUrl + '/' + this.adminAttachMentsPre)
      this.modalService.open(modalForm)
    }).catch((e) => {
      this.modalService.open(modalForm)
    })
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
      for (let i = 0; i < this.attachMents?.length; i++) {
        formData.append("attachMents", this.attachMents[i] as any);
      }
      formData.append("collegeAttachMents", this.collegeAttachMents);
      formData.append("file", this.file);
      formData.append("id", this.editId.toString());
      formData.append("topicName", data.topicName);
      formData.append("description", this.editor);
      formData.append("filePath", "test");
      formData.append("isActive", true as any);
      formData.append("isLock", data.isLock);
      formData.append("chapterId", this.selectedChapter);
      new ItemsService().childPath('post', 'Topic/UpdateTopics', formData).then((e) => {
        // window.alert(e.data.message)
        this.ngOnInit()
        this.modalService.dismissAll()
      })
    } else {
      let formData = new FormData();
      for (let i = 0; i < this.attachMents?.length; i++) {
        formData.append("attachMents", this.attachMents[i] as any);
      }
      formData.append("collegeAttachMents", this.collegeAttachMents);
      formData.append("file", this.file);
      formData.append("topicName", data.topicName);
      formData.append("description", this.editor);
      formData.append("filePath", "test");
      formData.append("isActive", true as any);
      formData.append("isLock", data.isLock);
      formData.append("chapterId", this.selectedChapter);
      new ItemsService().childPath('post', 'Topic/AddTopics', formData).then((e) => {
        // window.alert(e.data.message)
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
    let filter = this.initialData.filter((e) => +e.chapterId === +value)
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
      topicName: ['', Validators.required],
      description: [''],
      file: ['', Validators.required],
      isLock: [true, Validators.required],
      attachMents: ['', Validators.required],
      collegeAttachMents: [''],
    });
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
    this._datatablesService.getDataTableRows().then(response => {
      if (this.selectedCourse !== '' && this.selectedCollege !== '' && this.selectedSemester !== '' && this.selectedSubject && this.selectedChapter) {
        this.initialData = response;
        let filter = response.filter((e) => +e.chapterId === +this.selectedChapter)
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
