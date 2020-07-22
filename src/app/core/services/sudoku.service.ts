import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppConstants } from '../constants/app-constants';
import { SudokuResponse } from '../interfaces/sudoku-response';
import { saveSudoku } from '../interfaces/save-sudoku';
import { solveSudokuResponse } from '../interfaces/solve-sudoku-response';

@Injectable({
  providedIn: 'root'
})
export class SudokuService {

  private apiBaseUrl: string;
  constructor(public httpClient: HttpClient) {
    this.apiBaseUrl = localStorage.getItem(AppConstants.API_BASE_URL);
  }

  // Get Sudoku
  public getSudoku(): Observable<SudokuResponse> {
    return this.httpClient.get(`${this.apiBaseUrl}${AppConstants.GET_SUDOKU}`)
      .pipe(map((response: SudokuResponse) => response));
  }

  // Get Sudoku
  public getAllSudoku(): Observable<SudokuResponse> {
    return this.httpClient.get(`${this.apiBaseUrl}${AppConstants.GET_ALL_SUDOKU}`)
      .pipe(map((response: SudokuResponse) => response));
  }

  // upload and get sudoku
  public uploadAndGetSudoku(json): Observable<solveSudokuResponse> {
    return this.httpClient.post(`${this.apiBaseUrl}${AppConstants.UPLOAD_AND_GET_SUDOKU}`, json)
      .pipe(map((response: solveSudokuResponse) => response));
  }

  public saveSudoku(to_solve, solution): Observable<solveSudokuResponse> {
    let toSolveClear = JSON.stringify(to_solve).replace(/"/g,"");
    let solutionClear = JSON.stringify(solution).replace(/"/g,"");
    const requestPayload: saveSudoku = {
      userId: null,
      to_solve: toSolveClear.replace(/[\[\]']+/g, ''),
      solution: solutionClear.replace(/[\[\]']+/g, '')
    };
    console.log(requestPayload);
    return this.httpClient.post(`${this.apiBaseUrl}${AppConstants.SAVE_RESULT}`, requestPayload)
      .pipe(map((response: solveSudokuResponse) => response));
  }

  public solveSudoku(sudoku){
    return new Promise((resolve, reject) => {
      try {
        var emptyPositions = this.saveEmptyPositions(sudoku);
        let limit = 9, i = 0, row, column, value, found;
  
        while (i < emptyPositions.length) {
          row = emptyPositions[i][0];
          column = emptyPositions[i][1];
          // console.log("row" + row + "column"+ column);
          value = sudoku[row][column] + 1;  // Try the first value
          // console.log("vaolue" + value);
          found = false;
  
          while (!found && value <= limit) {
            // If a valid value is found, mark found true, set the position to the value, and move to the next position until the limit
            if (this.checkValue(sudoku, column, row, value)) {
              found = true;
              sudoku[row][column] = value;
              i++;
            } else {
              value++; // If value is not valid then increment the value by 1 and check until valid value not found. 
            }
          }
  
          // If all possible values (1 to 9) checked and not found valid value then move back track to the previous position
          if (found === false) {
            sudoku[row][column] = null;
            i--; // Back track
          }
        }
        resolve(sudoku);
      } catch (error) {
        reject(error);
      }
    });
  }

// Keep empty positions in one array 
saveEmptyPositions = (sudoku) => {
  let emptyPositions = [];
  sudoku.forEach((rows, rowIndex) => rows.forEach((element, columnIndex) => {
    // console.log(rows, rowIndex);
    if (element === null) {
      emptyPositions.push([rowIndex, columnIndex]);
    }
  }));
  console.log(emptyPositions);
  return emptyPositions;
};

// Check if the VALUE is already exists in current row, column or 3X3 square
checkValue = (sudoku, column, row, value) => {
  let isColumnIncludesThisValue = sudoku.some(row => row[column] === value);
  let isRowIncludesThisValue = sudoku[row].includes(value);
  let is3X3SquareIncludesThisValue = this.check3x3Square(sudoku, column, row, value);
  return (!isColumnIncludesThisValue && !isRowIncludesThisValue && !is3X3SquareIncludesThisValue);
};

// Check if the value is already exists in current 3X3 square or not
check3x3Square = (sudoku, column, row, value) => {
  let rowCorner = Math.floor(row / 3) * 3;
  let columnCorner = Math.floor(column / 3) * 3;
  let rows = [rowCorner, rowCorner + 1, rowCorner + 2];
  let columns = [columnCorner, columnCorner + 1, columnCorner + 2];
  return rows.some(row => columns.some(column => sudoku[row][column] === value));
};

  public checkSudoku(sudoku){
    return new Promise((resolve, reject) => {
    try {
      let errorIndexList = [];
      let indexCounter = 0;
      sudoku.forEach((row, rowIndex) => {
        row.forEach((value, columnIndex) => {
          if (value) {
            // check the current row if the value repeats
            if (sudoku[rowIndex].some((element, index) => element === value && index !== columnIndex)) {
              errorIndexList.push(indexCounter);
            }
            // check the current column if the value repeats
            if (sudoku.some((row, index) => row[columnIndex] === value && index !== rowIndex)) {
              errorIndexList.push(indexCounter);
            }

            // Check the current 3X3 square if the value repeats
            let rowCorner = Math.floor(rowIndex / 3) * 3;
            let columnCorner = Math.floor(columnIndex / 3) * 3;
            let rows = [rowCorner, rowCorner + 1, rowCorner + 2];
            let columns = [columnCorner, columnCorner + 1, columnCorner + 2];
            if (rows.some(row => columns.some(column => sudoku[row][column] === value && column !== columnIndex) && row !== rowIndex)) {
                errorIndexList.push(indexCounter);
            }
          }
          indexCounter++;
          });
        });
        resolve([...new Set(errorIndexList)]);
      } catch(error){
        reject(error);
      }
    });
  }

}
