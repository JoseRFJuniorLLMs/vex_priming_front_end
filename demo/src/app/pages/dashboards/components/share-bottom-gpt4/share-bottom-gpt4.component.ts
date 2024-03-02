import { Component, OnInit } from '@angular/core';
import {
  MatBottomSheetModule,
  MatBottomSheetRef
} from '@angular/material/bottom-sheet';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'vex-share-bottom-gpt4',
  templateUrl: './share-bottom-gpt4.component.html',
  styleUrls: ['./share-bottom-gpt4.component.scss'],
  standalone: true,
  imports: [MatListModule, RouterLink, MatIconModule, MatBottomSheetModule]
})
export class ShareBottomGpt4Component implements OnInit {
  constructor(
    private _bottomSheetRef: MatBottomSheetRef<ShareBottomGpt4Component>
  ) {}

  ngOnInit() {}

  close() {
    this._bottomSheetRef.dismiss();
  }
}
