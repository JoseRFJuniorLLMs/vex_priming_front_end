import { Component, OnInit } from '@angular/core';
import { MatRippleModule } from '@angular/material/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { fadeInUp400ms } from '@vex/animations/fade-in-up.animation';
import { stagger40ms } from '@vex/animations/stagger.animation';


import { AsyncPipe, NgClass, NgFor, NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { VexScrollbarComponent } from '@vex/components/vex-scrollbar/vex-scrollbar.component';

import { CdkDrag, CdkDragDrop } from '@angular/cdk/drag-drop';


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
    RouterOutlet,
    MatSidenavModule,
    MatMenuModule,
    MatIconModule,
    NgClass,
    NgIf,
    VexScrollbarComponent,
    NgFor,
    MatRippleModule,
    RouterLinkActive,
    RouterLink,
    RouterOutlet,
    AsyncPipe,
    MatButtonModule,
    MatDividerModule,
    MatInputModule
  ],
})

export class PuzzleBlockComponent implements OnInit {
  
  dropped = false; 
    
  constructor() {}

  ngOnInit() {}


    handleDrop(event: CdkDragDrop<string[]>) {
      console.log('Drop event triggered:', event);
      const containerId = event.container.element.nativeElement.id;
      console.log('Container ID:', containerId);
    
      if (containerId === 'drop-zone1') {
        const draggedElementName = event.item.element.nativeElement.getAttribute('name');
        console.log('Dragged Element Name:', draggedElementName);
    
        if (draggedElementName === 'love') {
          console.log('Removing element with name "love"');
          event.item.element.nativeElement.remove(); // Remove o elemento do DOM
          this.dropped = true;
        } else {
          console.log('Element does not have name "love", not removing.');
        }
      } else {
        console.log('Not dropping into "drop-zone1", ignoring.');
      }
    }

  }



