import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from 'app/services/api.service';
import { TradingTiersService } from '../trading-tiers.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Globals } from 'globals.service';

@Component({
  selector: 'app-add-edit-trading-tiers',
  templateUrl: './add-edit-trading-tiers.component.html',
  styleUrls: ['./add-edit-trading-tiers.component.scss'],
  encapsulation: ViewEncapsulation.None,
})

export class AddEditTradingTiersComponent implements OnInit {

  tradingTierForm: FormGroup;
  tradingTierId;
  fromTime : string[] = ['00:00', '00:15', '00:30', '00:45', '01:00', '01:15', '01:30', '01:45', '02:00', '02:15', '02:30', '02:45',
    '03:00', '03:15', '03:30', '03:45', '04:00', '04:15', '04:30', '04:45', '05:00', '05:15', '05:30', '05:45',
    '06:00', '06:15', '06:30', '06:45', '07:00', '07:15', '07:30', '07:45', '08:00', '08:15', '08:30', '08:45',
    '09:00', '09:15', '09:30', '09:45', '10:00', '10:15', '10:30', '10:45', '11:00', '11:15', '11:30', '11:45',
    '12:00', '12:15', '12:30', '12:45', '13:00', '13:15', '13:30', '13:45', '14:00', '14:15', '14:30', '14:45',
    '15:00', '15:15', '15:30', '15:45', '16:00', '16:15', '16:30', '16:45', '17:00', '17:15', '17:30', '17:45',
    '18:00', '18:15', '18:30', '18:45', '19:00', '19:15', '19:30', '19:45', '20:00', '20:15', '20:30', '20:45',
    '21:00', '21:15', '21:30', '21:45', '22:00', '22:15', '22:30', '22:45', '23:00'];
  toTime : string[] = ['00:00', '00:15', '00:30', '00:45', '01:00', '01:15', '01:30', '01:45', '02:00', '02:15', '02:30', '02:45',
    '03:00', '03:15', '03:30', '03:45', '04:00', '04:15', '04:30', '04:45', '05:00', '05:15', '05:30', '05:45',
    '06:00', '06:15', '06:30', '06:45', '07:00', '07:15', '07:30', '07:45', '08:00', '08:15', '08:30', '08:45',
    '09:00', '09:15', '09:30', '09:45', '10:00', '10:15', '10:30', '10:45', '11:00', '11:15', '11:30', '11:45',
    '12:00', '12:15', '12:30', '12:45', '13:00', '13:15', '13:30', '13:45', '14:00', '14:15', '14:30', '14:45',
    '15:00', '15:15', '15:30', '15:45', '16:00', '16:15', '16:30', '16:45', '17:00', '17:15', '17:30', '17:45',
    '18:00', '18:15', '18:30', '18:45', '19:00', '19:15', '19:30', '19:45', '20:00', '20:15', '20:30', '20:45',
    '21:00', '21:15', '21:30', '21:45', '22:00', '22:15', '22:30', '22:45', '23:00'];
  defaultPrices = ['Flat 1%', 'Flat 3%'];
  rateSources: string[] = ['Online', 'Offline'];
  ccyGroupId;
  isDefaultTradingTier = false;
  isTierNameReadOnly = true;
  isFirstPage = true;
  tenorsList: any;
  defaultPricesList = ['Flat 1%', 'Flat 2%', 'Flat 3%'];
  availableCCYPairs: any = [];
  selectedCCYPairs: any = [];
  isToggled: boolean = false;
  
  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<AddEditTradingTiersComponent>,
    private _formBuilder: FormBuilder,
    public apiService: ApiService,
    private tradingTier: TradingTiersService,
    private globalService: Globals) {
    if (data && data.isDefaultTradingTier) {
      this.isDefaultTradingTier = true;
      if (data.tradingTierId && data.ccyGroupId) {
        this.tradingTierId = data.tradingTierId;
        this.ccyGroupId = data.ccyGroupId;
      }
      else {
        this.isTierNameReadOnly = false;
      }
    }
    else if (data && !data.isDefaultTradingTier && data.tradingTierId) {
      this.isDefaultTradingTier = false;
      this.tradingTierId = data.tradingTierId;
      if (data.ccyGroupId) {
        this.ccyGroupId = data.ccyGroupId;
        this.isToggled = data.isAllDay;
      }
    }
  }

  ngOnInit() {
    this.getCCYPair();
    this.getTenor();
    this.initializeForm();
  }

  getTradingTierById(tierId: any) {
    this.tradingTier.getTradingTierById(tierId).subscribe(
      (data) => {
        return data;
      }
    );
  }

  getCCYPair() {
    this.apiService.get(ApiService.StaticData_URL + "currency-pairs").subscribe(
      (data) => {
        if (data && Array.isArray(data)) {
          const uniqueCCYPairs = data
            .map(item => item.ccyPair)
            .filter(ccyPair => !this.selectedCCYPairs.includes(ccyPair));
          this.availableCCYPairs = uniqueCCYPairs;
        }
      },
      (error) => {
        console.error("Error fetching data:", error);
      }
    );
  }

  getTenor() {
    this.apiService.get(ApiService.STATIC_DATA_PROP_CONFIG + "IndexTenors").subscribe(
      (data: any) => {
        if (data) {
          this.tenorsList = (data.value).split(',');
        }
      },
      (error) => {
        console.error("Error fetching data:", error);
      }
    );
  }

  initializeForm() {
    const formGroupConfig: any = {
      tierName: ['', Validators.required],
      tenorRange: this._formBuilder.array([
        this.initTenorRange()
      ]),
      defaultPrice: ['', Validators.required],
      availableCCYPairsSearch: [''],
      selectedCCYPairsSearch: [''],
      fromTime: ['', Validators.required],
      toTime: ['', Validators.required],
      noQuoteMessage: ['', Validators.required],
      rateSource: ['', Validators.required]
    };

    this.tradingTierForm = this._formBuilder.group(formGroupConfig);

    if (this.tradingTierId) {
      this.tradingTier.getTradingTierById(this.tradingTierId).subscribe(
        (data) => {
          if (data) {
            this.tradingTierForm.patchValue({
              tierName : data.tierName,
              isToggled: data.isAllDay,
              fromTime : data.fromTime,
              toTime : data.toTime,
              rateSource : data.rateSource,
              noQuoteMessage : data.noQuoteMsg
            });

            if (this.ccyGroupId) {
              this.tradingTierForm.get('defaultPrice').setValue(this.tradingTier.getDefaultPriceNameById(data.defaultPrice));

              const tenorRangeArray = this.getTenorRangeFormArray;
              while (tenorRangeArray.length) {
                tenorRangeArray.removeAt(0);
              }

              if (data.ccyGroups && data.ccyGroups.length > 0) {
                let ccyGroup = data.ccyGroups.find(ccyGrp => ccyGrp.id === this.ccyGroupId);
                ccyGroup.tenors.forEach((tenorRange: any) => {
                  tenorRangeArray.push(this.initTenorRange(tenorRange));
                });

                if (ccyGroup.pricingCcySet && ccyGroup.pricingCcySet.length > 0) {
                  ccyGroup.pricingCcySet.forEach((ccyPair: any) => {
                    this.selectedCCYPairs.push(ccyPair.ccyPair);
                  })
                }
              }
            }
          }
        }
      );
    }
  }

  initTenorRange(tenorRange?: any) {
    return this._formBuilder.group({
      from: [tenorRange ? tenorRange.rangeFrom : '', Validators.required],
      to: [tenorRange ? tenorRange.rangeTo : '', Validators.required],
      price: [(tenorRange && tenorRange.pricingAmount && tenorRange.pricingAmount.tierName) ? tenorRange.pricingAmount.tierName : '']
    });
  }

  get getTenorRangeFormArray(): FormArray {
    return this.tradingTierForm.get('tenorRange') as FormArray;
  }

  addTier() {
    const control = this.getTenorRangeFormArray;
    const lastIndex = control.length - 1;

    if (lastIndex >= 0) {
      const lastTier = control.at(lastIndex);
      const from = lastTier.get('from').value;
      const to = lastTier.get('to').value;

      if (!from || !to) {
        lastTier.get('from').markAsTouched();
        lastTier.get('to').markAsTouched();
        return;
      }
    }

    control.push(this.initTenorRange());
  }

  deleteTier(index: number) {
    const control = this.getTenorRangeFormArray;
    control.removeAt(index);
  }

  closeModal(): void {
    this.dialogRef.close();
  }

  onNextButtonClick() {
    const formValues = this.tradingTierForm.value;
    console.log('Form Values:', formValues);
    if (this.tradingTierForm.valid) {
      this.isFirstPage = !this.isFirstPage;
      this.setDefualtPrice();
    } else {
      this.markFormGroupAsTouched(this.tradingTierForm);
    }
  }

  setDefualtPrice() {
    const formArray = this.getTenorRangeFormArray;
    formArray.controls.forEach(control => {
      if (control.get('price').value === '') {
        control.get('price').setValue(this.tradingTierForm.get('defaultPrice').value);
      }
    });
  }

  onSaveButtonClick() {
    if (this.tradingTierForm.valid) {
      if (!this.isDefaultTradingTier && this.selectedCCYPairs.length == 0) {
        this.markFormGroupAsTouched(this.tradingTierForm);
        return;
      }
      const formValues = this.tradingTierForm.value;
      console.log('Form Values:', formValues);
      console.log(this.selectedCCYPairs);
      this.closeModal();
    } else {
      this.markFormGroupAsTouched(this.tradingTierForm);
    }
  }

  markFormGroupAsTouched(formGroup: FormGroup | FormArray) {
    Object.values(formGroup.controls).forEach(control => {
      if (control instanceof FormGroup || control instanceof FormArray) {
        this.markFormGroupAsTouched(control);
      } else {
        control.markAsTouched();
      }
    });
  }

  toggle() {
    this.isToggled = !this.isToggled;
    if (this.isToggled) {

      this.tradingTierForm.get('fromTime').disable();
      this.tradingTierForm.get('toTime').disable();
      this.tradingTierForm.get('noQuoteMessage').disable();
    } else {
      this.tradingTierForm.get('fromTime').enable();
      this.tradingTierForm.get('toTime').enable();
      this.tradingTierForm.get('noQuoteMessage').enable();
    }
  }

  onPreviousButtonClick() {
    this.isFirstPage = !this.isFirstPage;
  }

  get filteredAvailableCCYPairs(): string[] {
    return this.availableCCYPairs.filter(item => item.toLowerCase().includes(this.tradingTierForm.get('availableCCYPairsSearch').value.toLowerCase()));
  }

  get filteredSelectedCCYPairs(): string[] {
    return this.selectedCCYPairs.filter(item => item.toLowerCase().includes(this.tradingTierForm.get('selectedCCYPairsSearch').value.toLowerCase()));
  }

  drop(event: CdkDragDrop<string[]>, filteredArray: string[]) {
    const previousIndex = event.previousIndex;
    const currentIndex = event.currentIndex;
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, previousIndex, currentIndex);
    } else {
      const draggedItem = filteredArray[previousIndex];
      const filteredPreviousIndex = event.previousContainer.data.indexOf(draggedItem);
      const filteredCurrentIndex = currentIndex;
      transferArrayItem(event.previousContainer.data, event.container.data, filteredPreviousIndex, filteredCurrentIndex);
    }
  }

  disableOption(item: string, currentIndex: number, fieldType: 'from' | 'to'): boolean {
    return this.globalService.disableOption(item, currentIndex, fieldType, this.getTenorRangeFormArray);
  }
}
