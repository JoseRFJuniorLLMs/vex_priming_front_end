import { DialogModule } from '@angular/cdk/dialog';
import {
  CdkDrag,
  CdkDropList
} from '@angular/cdk/drag-drop';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { fadeInUp400ms } from '@vex/animations/fade-in-up.animation';
import { stagger40ms } from '@vex/animations/stagger.animation';

import ePub from 'epubjs';
import hljs from 'highlight.js';
import { PdfViewerModule } from 'ng2-pdf-viewer';

@Component({
  selector: 'book',
  templateUrl: 'book.html',
  styleUrls: ['book.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: [stagger40ms, fadeInUp400ms],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    PdfViewerModule,
    MatButtonModule,
    CdkDrag,
    CdkDropList,
    DialogModule,
    MatIconModule,
    MatCardModule,
    MatTooltipModule
  ]
})
export class BookComponent implements OnInit {
  book: any;
  rendition: any;
  selectedText: string = '';
  highlighted: boolean = false;

  constructor() {}

  async ngOnInit() {
    try {
      this.book = ePub("../../assets/file.epub");
      await this.book.ready;
      this.rendition = this.book.renderTo("area-de-exibicao");
      this.rendition.display();

      // Lógica para destacar o texto selecionado
      this.rendition.on('selection', (selection: any) => {
        console.log('Selection event fired @@@@@@');
        this.selectedText = selection.text;
        this.highlighted = true;

        const elements = document.querySelectorAll('.ePubSelection');
        Array.from(elements).forEach(element => {
          hljs.highlightElement(element as HTMLElement);
        });
      });
    } catch (error) {
      console.error("Error loading or rendering book: ", error);
    }
  }

  nextPage() {
    this.rendition.next();
  }

  prevPage() {
    this.rendition.prev();
  }

  zoomIn() {
    this.rendition.themes.fontSize('120%');
  }

  zoomOut() {
    this.rendition.themes.fontSize('100%');
  }

  // Destaca quando você clica fora da seleção
  clearSelection() {
    this.selectedText = '';
    this.highlighted = false;
  }

  // Exemplo de ação ao copiar texto
  copySelectedText() {
    navigator.clipboard.writeText(this.selectedText);
  }
}
