import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';

import { MatBadgeModule } from '@angular/material/badge';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition
} from '@angular/material/snack-bar';

import ePub from 'epubjs';
import gpt4 from '../../../../../gpt4.json';

@Component({
  selector: 'book',
  templateUrl: 'book.html',
  styleUrls: ['book.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [MatBadgeModule, MatCardModule,
    MatIconModule, MatSelectModule],

})
export class BookComponent implements OnInit {
  book: any;
  rendition: any;
  selectedText: string = '';
  totalPages: number = 0;
  currentPage: number = 0;
  durationInSeconds = 130;

  horizontalPosition: MatSnackBarHorizontalPosition = 'end';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';

  constructor(private http: HttpClient, private _snackBar: MatSnackBar,) {}

  ngOnInit() {
    this.initializeBook();
  }

  //initializeBook
  async initializeBook() {
    try {
      this.book = ePub("../../assets/epub/TheLittlePrince.epub");
      await this.book.ready;

      this.rendition = this.book.renderTo("area-de-exibicao");

      // Gera as localizações.
      await this.book.locations.generate();
      this.totalPages = this.book.locations.length(); // Atualiza o total de páginas

      this.rendition.display();
      // Outro código...
    } catch (error) {
      console.error("Error loading or rendering book: ", error);
    }
  }

  //getCurrentPageText
  async getCurrentPageText(): Promise<string> {
    if (!this.rendition || !this.rendition.location) {
      return '';
    }

    const currentLocation = this.rendition.location.start;
    const currentPage = await this.book.spine.get(currentLocation);

    if (!currentPage) {
      return '';
    }

    return currentPage.getText();

  }

  //toggleLayout
  toggleLayout() {
    return () => {
      this.rendition.spread = (this.rendition.spread === "none") ? "always" : "none";
      this.rendition.display();
      this.openSnackBar(this.rendition.display());
    };
  }

  nextPage() {
    this.openSnackBar("nextPage"+this.rendition.next().length);
    this.rendition.next();
  }

  prevPage() {
    this.openSnackBar("prevPage"+this.rendition.prev().length);
    this.rendition.prev();
  }

  zoomIn() {
    this.openSnackBar("zoomIn");
    this.rendition.themes.fontSize('120%');
  }

  zoomOut() {
    this.openSnackBar("zoomOut");
    this.rendition.themes.fontSize('100%');
  }

  clearSelection() {
    this.selectedText = '';
  }

  copySelectedText() {
    this.openSnackBar("copySelectedText");
    navigator.clipboard.writeText(this.selectedText);
  }

  //sendCurrentPageTextToAI
  async sendCurrentPageTextToAI() {
    const currentPageText = await this.getCurrentPageText();

    const headers = new HttpHeaders({
      "Authorization": `Bearer ${gpt4.gptApiKey}`,
      "Content-Type": "application/json"
    });

    //body
    const body = {
      prompt: currentPageText,
      max_tokens: 10,
      temperature: 0.0,
      model: "gpt-4",
    };

    //post
    this.http.post(gpt4.gptUrl, body, { headers }).subscribe((response: any) => {
      console.log("Resposta da OpenAI:", response);
      this.openSnackBar(response);
    }, (error: any) => {
      console.error("Erro ao enviar texto para a OpenAI: ", error);
    });
  }//fim IA

  //countPages
  async countPages(): Promise<number> {
    const numberOfPages = await this.book.locations.length;
    this.openSnackBar("countPages:"+numberOfPages);
    return numberOfPages;
  }

  //getCurrentPage
  getCurrentPage(): number {
    const currentPageIndex = this.book && this.book.navigation && this.book.navigation.indexOf(this.book.currentLocation);
    this.openSnackBar("countPages:"+ currentPageIndex + 1);
    return currentPageIndex + 1;
  }

  // Muda o tipo de visualizacao.
  changeRenderOption(option: string) {
    let flowValue: string | null = null;
    let width: string | null = null;
    let height: string | null = null;

    switch(option) {
      case 'default':
        this.openSnackBar("Default");
        // Possivelmente, manter padrões ou aplicar configurações específicas
        break;
      case 'continuous':
        this.openSnackBar("Continuous");
        flowValue = 'scrolled-doc'; // ou 'scrolled' dependendo da versão do epub.js
        break;
      case 'paginated':
        this.openSnackBar("Paginated");
        flowValue = 'paginated';
        width = '900px';
        height = '600px';
        break;
      case 'auto':
        this.openSnackBar("Auto");
        // Definir lógica para 'auto', se aplicável
        break;
    }

    if (flowValue) {
      this.openSnackBar("flowValue");
      this.rendition.flow(flowValue);
    }

    if (width && height) {
      this.openSnackBar("height");
      this.rendition.resize(width, height);
    }

    // Re-renderizar o conteúdo no ponto atual
    const currentLocation = this.rendition.currentLocation();
    if (currentLocation) {
      this.openSnackBar(currentLocation.stringify(currentLocation(currentLocation)));
      this.rendition.display(currentLocation.start.cfi);
    }
  }

  /* ==================SNACK BAR==================== */
  openSnackBar(textDisplay: string) {
    const snackBarRef = this._snackBar.open(textDisplay, "Close", {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      duration: this.durationInSeconds * 100,
    });
  }

}//fim
