import { Component, QueryList, ViewChildren } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Observable } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UntypedFormBuilder, UntypedFormGroup, FormArray, Validators } from '@angular/forms';

// Sweet Alert
import Swal from 'sweetalert2';

// Date Format
import { DatePipe } from '@angular/common';

// Csv File Export
import { ngxCsv } from 'ngx-csv/ngx-csv';

import { customerModel } from './customers.model';
import { Customers } from './data';
import { CustomersService } from './customers.service';
import { NgbdcustomerSortableHeader, customerSortEvent } from './customers-sortable.directive';

// Rest Api Service
import { restApiService } from "../../../core/services/rest-api.service";


@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.scss'],
  providers: [CustomersService, DecimalPipe]
})

/**
 * Customers Component
 */
export class CustomersComponent {

  // bread crumb items
  breadCrumbItems!: Array<{}>;
  submitted = false;
  customerForm!: UntypedFormGroup;
  CustomersData!: customerModel[];
  masterSelected!: boolean;
  checkedList: any;

  content?: any;
  Customers?: any;

  // Table data
  customers!: Observable<customerModel[]>;
  total: Observable<number>;
  @ViewChildren(NgbdcustomerSortableHeader) headers!: QueryList<NgbdcustomerSortableHeader>;

  constructor(private modalService: NgbModal, public service: CustomersService, private formBuilder: UntypedFormBuilder, private ApiService: restApiService, private datePipe: DatePipe) {
    this.customers = service.customers$;
    this.total = service.total$;
  }

  ngOnInit(): void {
    /**
    * BreadCrumb
    */
    this.breadCrumbItems = [
      { label: 'Ecommerce' },
      { label: 'Customers', active: true }
    ];

    /**
    * Form Validation
    */
    this.customerForm = this.formBuilder.group({
      ids: [''],
      customer: ['', [Validators.required]],
      email: ['', [Validators.required]],
      phone: ['', [Validators.required]],
      date: ['', [Validators.required]],
      status: ['', [Validators.required]]
    });

    /**
    * fetches data
    */
    setTimeout(() => {
      this.customers.subscribe(x => {
        this.content = this.customers;
        this.Customers = Object.assign([], x);
    
      });
      document.getElementById('elmLoader')?.classList.add('d-none')
    }, 1500)
  }

  /**
  * Sort table data
  * @param param0 sort the column
  *
  */
  onSort({ column, direction }: customerSortEvent) {
    // resetting other headers
    this.headers.forEach(header => {
      if (header.customersortable !== column) {
        header.direction = '';
      }
    });

    this.service.sortColumn = column;
    this.service.sortDirection = direction;
  }

  /**
  * Open modal
  * @param content modal content
  */
  openModal(content: any) {
    this.submitted = false;
    this.modalService.open(content, { size: 'md', centered: true });
  }

  /**
   * Form data get
   */
  get form() {
    return this.customerForm.controls;
  }

  /**
 * Save user
 */
  saveUser() {
    if (this.customerForm.valid) {
      if (this.customerForm.get('ids')?.value) {
        this.ApiService.patchCustomerData(this.customerForm.value).subscribe(
          (data: any) => {
            this.service.customers = this.content.map((order: { _id: any; }) => order._id === data.data.ids ? { ...order, ...data.data } : order);
            this.modalService.dismissAll();
          }
        )
      }
      else {
        this.ApiService.postCustomerData(this.customerForm.value).subscribe(
          (data: any) => {
            this.service.customers.push(data.data);
            this.modalService.dismissAll();
            let timerInterval: any;
            Swal.fire({
              title: 'Customers inserted successfully!',
              icon: 'success',
              timer: 2000,
              timerProgressBar: true,
              willClose: () => {
                clearInterval(timerInterval);
              },
            }).then((result) => {
              /* Read more about handling dismissals below */
              if (result.dismiss === Swal.DismissReason.timer) {
              }
            });
          },)
      }
    }
    setTimeout(() => {
      this.customerForm.reset();
    }, 2000);
    this.submitted = true
  }

  // The master checkbox will check/ uncheck all items
  checkUncheckAll(ev: any) {
    this.Customers.forEach((x: { state: any; }) => x.state = ev.target.checked)
    var checkedVal: any[] = [];
    var result
    for (var i = 0; i < this.Customers.length; i++) {
      if (this.Customers[i].state == true) {
        result = this.Customers[i];
        checkedVal.push(result);
      }
    }
    this.checkedValGet = checkedVal
    checkedVal.length > 0 ? (document.getElementById("remove-actions") as HTMLElement).style.display = "block" : (document.getElementById("remove-actions") as HTMLElement).style.display = "none";
  }

  // Select Checkbox value Get
  onCheckboxChange(e: any) {
    var checkedVal: any[] = [];
    var result
    for (var i = 0; i < this.Customers.length; i++) {
      if (this.Customers[i].state == true) {
        result = this.Customers[i];
        checkedVal.push(result);
      }
    }
    this.checkedValGet = checkedVal
    checkedVal.length > 0 ? (document.getElementById("remove-actions") as HTMLElement).style.display = "block" : (document.getElementById("remove-actions") as HTMLElement).style.display = "none";
  }

  /**
   * Open Edit modal
   * @param content modal content
   */
  econtent?: any;
  editDataGet(id: any, content: any) {
    this.submitted = false;
    this.modalService.open(content, { size: 'md', centered: true });

    var modelTitle = document.querySelector('.modal-title') as HTMLAreaElement;
    modelTitle.innerHTML = 'Edit Customer';
    var updateBtn = document.getElementById('add-btn') as HTMLAreaElement;
    updateBtn.innerHTML = "Update";

    this.ApiService.getSingleCustomerData(id).subscribe({
      next: data => {
        const users = JSON.parse(data);
        this.econtent = users.data;
        this.customerForm.controls['customer'].setValue(this.econtent.customer);
        this.customerForm.controls['email'].setValue(this.econtent.email);
        this.customerForm.controls['phone'].setValue(this.econtent.phone);
        this.customerForm.controls['date'].setValue(this.econtent.date);
        this.customerForm.controls['status'].setValue(this.econtent.status);
        this.customerForm.controls['ids'].setValue(this.econtent._id);
      },
      error: err => {
        this.content = JSON.parse(err.error).message;
      }
    });

  }

  /**
* Confirmation mail model
*/
  deleteId: any;
  confirm(content: any, id: any) {
    this.deleteId = id;
    this.modalService.open(content, { centered: true });
  }

  // Delete Data
  deleteData(id: any) {
    if (id) {
      this.ApiService.deleteCustomer(id).subscribe({
        next: data => { },
        error: err => {
          this.content = JSON.parse(err.error).message;
        }
      });
      document.getElementById('c_' + id)?.remove();
    }
    else {
      this.checkedValGet.forEach((item: any) => {
        document.getElementById('c_' + item)?.remove();
      });
    }
  }

  /**
  * Multiple Delete
  */
  checkedValGet: any[] = [];
  deleteMultiple(content: any) {
    var checkboxes: any = document.getElementsByName('checkAll');
    var result
    var checkedVal: any[] = [];
    for (var i = 0; i < checkboxes.length; i++) {
      if (checkboxes[i].checked) {
        result = checkboxes[i].value;
        checkedVal.push(result);
      }
    }
    if (checkedVal.length > 0) {
      this.modalService.open(content, { centered: true });
    }
    else {
      Swal.fire({ text: 'Please select at least one checkbox', confirmButtonColor: '#239eba', });
    }
    this.checkedValGet = checkedVal;
  }

  // Filtering
  SearchData() {
    var status = document.getElementById("idStatus") as HTMLInputElement;
    var date = document.getElementById("isDate") as HTMLInputElement;
    var dateVal = date.value ? this.datePipe.transform(new Date(date.value), "yyyy-MM-dd") : '';
    if (status.value != 'all' && status.value != '' || dateVal != '') {
      this.customers = this.content.filter((customer: any) => {
        return this.datePipe.transform(new Date(customer.date), "yyyy-MM-dd") == dateVal || customer.status === status.value;
      });
    }
    else {
      this.customers = this.content
    }
  }

  // Csv File Export
  csvFileExport() {
    var customer = {
      fieldSeparator: ',',
      quoteStrings: '"',
      decimalseparator: '.',
      showLabels: true,
      showTitle: true,
      title: 'Customer Data',
      useBom: true,
      noDownload: false,
      headers: ["id", "customer Id", "customer", "email", "phone", "date", "status"]
    };
    new ngxCsv(this.content, "customers", customer);
  }
  /**
 * Sort table data
 * @param param0 sort the column
 *
 */
  

}
