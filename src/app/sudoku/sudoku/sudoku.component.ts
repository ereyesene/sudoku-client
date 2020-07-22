import { Component, OnInit } from '@angular/core';
import { SudokuService } from 'src/app/core/services/sudoku.service';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { LoaderService } from '../../core/services/loader.service';
import { ToastrService } from 'ngx-toastr';
import { AppConstants } from 'src/app/core/constants/app-constants';
import { MessageConstants } from 'src/app/core/constants/message-constants';

@Component({
  selector: 'app-sudoku',
  templateUrl: './sudoku.component.html',
  styleUrls: ['./sudoku.component.scss']
})
export class SudokuComponent implements OnInit {

  public puzzle;
  public sudokuFormGroup: FormGroup;
  public uploadJson:any;
  public toSolve:any;
  public sudokuList:any;

  constructor(
    private sudokuService: SudokuService,
    private formBuilder: FormBuilder,
    private loaderService: LoaderService,
    private toastrService: ToastrService) { }

  public ngOnInit(): void {
    this.loaderService.start();
    this.getSudoku();
    this.getAllSudoku();
    this.sudokuFormGroup = this.formBuilder.group({
      cells: this.formBuilder.array([])   // create reactive form group
    });
  }

  public getAllSudoku(): void{
    this.sudokuService.getAllSudoku().subscribe((response: any) => {
      if (response) {
        this.sudokuList = response;
        console.log("response",this.sudokuList)
        this.toastrService.success(MessageConstants.GET_SUCCESS);
      } else {
        this.toastrService.error(MessageConstants.SUDOKU_NOTFOUND);
      }
      this.loaderService.stop();
    }, () => {
      this.loaderService.stop();
      this.toastrService.error(MessageConstants.GET_FAILED);
    });
  }

  // GET SUDOKU
  public getSudoku(): void {
    this.sudokuService.getSudoku().subscribe((response: any) => {
      this.toSolve = response;
      console.log("-----------------"+response);
      if (response) {
        if (this.cells && this.cells.length > 0) {
          this.sudokuFormGroup.get(AppConstants.CELLS).setValue(response);
        } else {
          response.forEach(value => this.cells.push(this.formBuilder.control(value))); // create form controls for each cell
        }
        this.puzzle = this.get2DArray([...response]);
        this.toastrService.success(MessageConstants.GET_SUCCESS);
      } else {
        this.toastrService.error(MessageConstants.SUDOKU_NOTFOUND);
      }
      this.loaderService.stop();
    }, () => {
      this.loaderService.stop();
      this.toastrService.error(MessageConstants.GET_FAILED);
    });
  }

  // SOLVE SUDOKU
  public solveSudoku(): void {
    this.loaderService.start();
    this.sudokuService.solveSudoku(this.puzzle).then((response:any) => {
      console.log(response.length);
      if (response && response.length > 0) {
        const flatArray = response.reduce((acc, val) => acc.concat(val), []);
        this.sudokuFormGroup.get(AppConstants.CELLS).setValue(flatArray);
        this.toastrService.success(MessageConstants.SOLVE_SUCCESS);
      } else {
        this.toastrService.error(MessageConstants.SUDOKU_NOTFOUND);
      }
      this.loaderService.stop();
    }, () => {
      this.loaderService.stop();
      this.toastrService.error(MessageConstants.SOLVE_FAILED);
    });
  }

  // CHECK SUDOKU
  public checkSudoku(): void {
    this.loaderService.start();
    this.resetErrors();
    const requestData = this.get2DArray([...this.sudokuFormGroup.get(AppConstants.CELLS).value]);
    
    this.sudokuService.checkSudoku(requestData).then((response:any) => {
      console.log(response);
      if (response && response.length > 0) {
        response.forEach(index => {
          this.sudokuFormGroup.get(AppConstants.CELLS)[AppConstants.CONTROLS][index].setErrors(true);
        });
        this.toastrService.error(MessageConstants.CHECK_INVALID);
      } else {
        this.toastrService.success(MessageConstants.CHECK_VALID);
      }
      this.loaderService.stop();
    }, () => {
      this.loaderService.stop();
      this.toastrService.error(MessageConstants.CHECK_FAILED);
    });
  }

  // RESET SUDOKU
  public resetSudoku(): void {
    this.sudokuFormGroup.reset();
    const flatArray = this.puzzle.reduce((acc, val) => acc.concat(val), []);
    this.sudokuFormGroup.get(AppConstants.CELLS).setValue(flatArray);
  }

  // prevent invalid input values on keypress event
  public onKeyPress(event): void {
    if (event.key === '0' || event.target.value.length > 0) {
      event.preventDefault();
    }
    event.target.classList.remove(AppConstants.ERR_CLASS);
  }

  // convert 1D array into 2D array
  private get2DArray(array): Array<number> {
    const newArray = [];
    while (array.length) {
      newArray.push(array.splice(0, 9));
    }
    return newArray;
  }

  // getter for sudoku cells form array
  get cells(): FormArray {
    return this.sudokuFormGroup.get(AppConstants.CELLS) as FormArray;
  }

  // reset checked errors
  private resetErrors(): void {
    this.sudokuFormGroup.get(AppConstants.CELLS)[AppConstants.CONTROLS].forEach(control => control.errors = null);
  }

  public uploadSudoku(){
    if(this.uploadJson){
      try {
        JSON.parse(this.uploadJson);
        this.sudokuService.uploadAndGetSudoku(JSON.parse(this.uploadJson)).subscribe((response: any) => {
          this.toSolve = response;
          console.log("-----------------"+response);
          if (response) {
            if (this.cells && this.cells.length > 0) {
              this.sudokuFormGroup.get(AppConstants.CELLS).setValue(response);
            } else {
              response.forEach(value => this.cells.push(this.formBuilder.control(value))); // create form controls for each cell
            }
            this.puzzle = this.get2DArray([...response]);
            this.toastrService.success(MessageConstants.GET_SUCCESS);
          } else {
            this.toastrService.error(MessageConstants.SUDOKU_NOTFOUND);
          }
          this.loaderService.stop();
        }, () => {
          this.loaderService.stop();
          this.toastrService.error(MessageConstants.GET_FAILED);
        });
      } catch (e) {
        this.toastrService.error(MessageConstants.JSON_NO_VALID);        
      }
      console.log('validate' + this.uploadJson);
    }else{
      this.toastrService.error(MessageConstants.EPMTY_JSON);      
    }
    
  }

  public saveResults(){
    this.sudokuService.saveSudoku(this.toSolve, this.sudokuFormGroup.value.cells).subscribe((response: any) => {
      this.toSolve = response;
      console.log("-----------------"+response);
      if (response) {
        this.toastrService.success(MessageConstants.GET_SUCCESS);
        this.getAllSudoku();
      } else {
        this.toastrService.error(MessageConstants.SUDOKU_NOTFOUND);
      }
      this.loaderService.stop();
    }, () => {
      this.loaderService.stop();
      this.toastrService.error(MessageConstants.GET_FAILED);
    });
    console.log('save' +this.sudokuFormGroup.value.cells);
  }

  viewSolution(solution:any){
    var response = solution.split(',');
    if (this.cells && this.cells.length > 0) {
      this.sudokuFormGroup.get(AppConstants.CELLS).setValue(response);
    } else {
      response.forEach(value => this.cells.push(this.formBuilder.control(value))); // create form controls for each cell
    }
    this.puzzle = this.get2DArray([...response]);
  }

}
