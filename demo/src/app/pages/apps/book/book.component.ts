import {
  CdkDrag,
  CdkDropList
} from '@angular/cdk/drag-drop';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { fadeInUp400ms } from '@vex/animations/fade-in-up.animation';
import { stagger40ms } from '@vex/animations/stagger.animation';
import { VexBreadcrumbsComponent } from '@vex/components/vex-breadcrumbs/vex-breadcrumbs.component';
import { VexSecondaryToolbarComponent } from '@vex/components/vex-secondary-toolbar/vex-secondary-toolbar.component';
import ePub from 'epubjs';
import { PdfViewerModule } from 'ng2-pdf-viewer';

@Component({
  selector: 'book',
  templateUrl: 'book.html',
  styleUrls: ['book.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: [stagger40ms, fadeInUp400ms],
  standalone: true,
  imports: [
    VexSecondaryToolbarComponent,
    VexBreadcrumbsComponent,
    ReactiveFormsModule,
    PdfViewerModule,
    MatButtonModule,
    CdkDrag,
    CdkDropList
  ]
})
export class BookComponent implements OnInit {
  book: any;
  rendition: any;
  //pdfSrc = "../../assets/file.pdf";

  constructor() {}

  async ngOnInit() {
    try {
      this.book = ePub("../../assets/file.epub");
      await this.book.ready;
      this.rendition = this.book.renderTo("area-de-exibicao");
      const displayed = this.rendition.display();
      console.log(displayed);
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
}
