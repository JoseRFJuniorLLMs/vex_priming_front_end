import { NgClass, NgFor } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { fadeInUp400ms } from '@vex/animations/fade-in-up.animation';
import { stagger40ms } from '@vex/animations/stagger.animation';

import { CdkDrag } from '@angular/cdk/drag-drop';

/**
 * @title Drag&Drop position opened and boundary
 */
@Component({
  selector: 'puzzle-block',
  templateUrl: 'puzzle-block.html',
  styleUrls: ['puzzle-block.scss'],
  animations: [stagger40ms, fadeInUp400ms],
  standalone: true,
  imports: [
    CdkDrag,
    MatIconModule,
    MatButtonModule,
    NgFor,
    MatRippleModule,
    RouterLinkActive,
    NgClass,
    RouterLink,
    RouterOutlet
  ],
})

export class PuzzleBlockComponent implements OnInit {

  constructor() {}

  ngOnInit() {}
}
