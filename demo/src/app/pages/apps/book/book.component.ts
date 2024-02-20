import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { VexBreadcrumbsComponent } from '@vex/components/vex-breadcrumbs/vex-breadcrumbs.component';
import { VexSecondaryToolbarComponent } from '@vex/components/vex-secondary-toolbar/vex-secondary-toolbar.component';
import { PdfViewerModule } from 'ng2-pdf-viewer';

@Component({
  selector: 'book',
  templateUrl: 'book.html',
  styleUrls: ['book.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [
    VexSecondaryToolbarComponent,
    VexBreadcrumbsComponent,
    ReactiveFormsModule,
    PdfViewerModule
  ]
})
export class BookComponent implements OnInit {
  pdfSrc = "../../assets/file.pdf";

  constructor() {}

  ngOnInit() {}
}
