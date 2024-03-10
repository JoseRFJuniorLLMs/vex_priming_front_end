import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';

import { MatBadgeModule } from '@angular/material/badge';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select'; // Importar MatSelectModule

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

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.initializeBook();
  }

  async initializeBook() {
    try {
      this.book = ePub("../../assets/epub/TheLittlePrince.epub");
      await this.book.ready;

      this.rendition = this.book.renderTo("area-de-exibicao");

      // Função para atualizar as configurações de renderização
      this.rendition.updateRenderMethod = (options: any) => {
        // Limpa a área de exibição antes de aplicar novas configurações
        this.rendition.clear();

        if (options.method) {
          // Se a opção 'method' for fornecida, ajuste-a conforme necessário
          // Nota: Esta é uma sugestão conceitual. Adapte conforme as APIs disponíveis do EPUB.js
          this.rendition.settings.method = options.method;
        }
        if (options.flow) {
          // Se a opção 'flow' for fornecida, ajuste-a conforme necessário
          this.rendition.flow(options.flow);
        }
        if (options.width && options.height) {
          // Ajusta a largura e a altura da área de renderização
          this.rendition.resize(options.width, options.height);
        }

        // Reexibe o conteúdo após atualizar as configurações
        this.rendition.display();
      };

      this.rendition.display();

      // Event listener para seleção de texto
      this.rendition.on('selection', (cfiRange: any, contents: any) => {
        this.selectedText = contents.text();
        // Pode-se adicionar lógica adicional aqui, como manipulação de seleção de texto
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

  // Muda o tipo de visualizacao.
  changeRenderOption(option: string) {
    let flowValue: string | null = null;
    let width: string | null = null;
    let height: string | null = null;

    switch(option) {
      case 'default':
        // Possivelmente, manter padrões ou aplicar configurações específicas
        break;
      case 'continuous':
        flowValue = 'scrolled-doc'; // ou 'scrolled' dependendo da versão do epub.js
        break;
      case 'paginated':
        flowValue = 'paginated';
        width = '900px';
        height = '600px';
        break;
      case 'auto':
        // Definir lógica para 'auto', se aplicável
        break;
    }

    if (flowValue) {
      this.rendition.flow(flowValue);
    }

    if (width && height) {
      this.rendition.resize(width, height);
    }

    // Re-renderizar o conteúdo no ponto atual
    const currentLocation = this.rendition.currentLocation();
    if (currentLocation) {
      this.rendition.display(currentLocation.start.cfi);
    }
  }

}
