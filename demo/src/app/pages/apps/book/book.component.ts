import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import ePub from 'epubjs';
import gpt4 from '../../../../../gpt4.json';

@Component({
  selector: 'book',
  templateUrl: 'book.html',
  styleUrls: ['book.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [MatBadgeModule, MatCardModule,
    MatIconModule],

})
export class BookComponent implements OnInit {
  book: any;
  rendition: any;
  selectedText: string = '';
  totalPages: number = 0;
  currentPage: number = 0;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.initializeBook();
  }

  async initializeBook() {
    try {
      this.book = ePub("../../assets/epub/TheLittlePrince.epub");
      await this.book.ready;

      this.rendition = this.book.renderTo("area-de-exibicao");
      this.rendition.display();

      this.rendition.on('selection', (selection: any) => {
        this.selectedText = selection.text;
        const elements = document.querySelectorAll('.ePubSelection');
      });

    } catch (error) {
      console.error("Error loading or rendering book: ", error);
    }
  }

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

  toggleLayout() {
    return () => {
      this.rendition.spread = (this.rendition.spread === "none") ? "always" : "none";
      this.rendition.display();
    };
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

  clearSelection() {
    this.selectedText = '';
  }

  copySelectedText() {
    navigator.clipboard.writeText(this.selectedText);
  }

  async sendCurrentPageTextToAI() {
    const currentPageText = await this.getCurrentPageText();

    const headers = new HttpHeaders({
      "Authorization": `Bearer ${gpt4.gptApiKey}`,
      "Content-Type": "application/json"
    });

    const body = {
      prompt: currentPageText,
      max_tokens: 10,
      temperature: 0.0,
      model: "gpt-4",
    };

    this.http.post(gpt4.gptUrl, body, { headers }).subscribe((response: any) => {
      console.log("Resposta da OpenAI:", response);
    }, (error: any) => {
      console.error("Erro ao enviar texto para a OpenAI: ", error);
    });
  }

  async countPages(): Promise<number> {
    const numberOfPages = await this.book.locations.length;
    return numberOfPages;
  }

  getCurrentPage(): number {
    const currentPageIndex = this.book && this.book.navigation && this.book.navigation.indexOf(this.book.currentLocation);
    return currentPageIndex + 1;
  }
}
