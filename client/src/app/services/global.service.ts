import { Injectable } from '@angular/core';

@Injectable()
export class GlobalService {

  public url: string;  

  constructor() {
    this.url = 'http://localhost:3977/api/';
  }

}
