import { Component, OnInit } from '@angular/core';
import { ModalService } from "../../../../../../src/modal/modal.service";

@Component( {
  selector: 'cad-pessoa',
  templateUrl: './cadPessoa.html',
  styleUrls: [ './cadPessoa.component.scss' ]
} )
export class CadPessoa implements OnInit {

  private people;

  constructor(private modalService: ModalService) {}

  ngOnInit() {
    this.people =
      {
        name: 'William',
        lastname: 'Aguera',
        age: 23,
        city: 'Palotina-PR',
        job: 'Programador'
      }
    ;
  }

}
