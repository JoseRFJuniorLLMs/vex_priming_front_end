import { Component, HostListener, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { VexBreadcrumbsComponent } from '@vex/components/vex-breadcrumbs/vex-breadcrumbs.component';
import { VexSecondaryToolbarComponent } from '@vex/components/vex-secondary-toolbar/vex-secondary-toolbar.component';
import gpt4 from 'gpt4.json';
import { WidgetAssistantComponent } from '../components/widgets/widget-assistant/widget-assistant.component';
import { WidgetLargeChartComponent } from '../components/widgets/widget-large-chart/widget-large-chart.component';
import { WidgetLargeGoalChartComponent } from '../components/widgets/widget-large-goal-chart/widget-large-goal-chart.component';
import { WidgetQuickLineChartComponent } from '../components/widgets/widget-quick-line-chart/widget-quick-line-chart.component';
import { WidgetQuickValueCenterComponent } from '../components/widgets/widget-quick-value-center/widget-quick-value-center.component';
import { WidgetTableComponent } from '../components/widgets/widget-table/widget-table.component';

import { MatTabsModule } from '@angular/material/tabs';
import { VexPageLayoutContentDirective } from '@vex/components/vex-page-layout/vex-page-layout-content.directive';
import { VexPageLayoutHeaderDirective } from '@vex/components/vex-page-layout/vex-page-layout-header.directive';
import { VexPageLayoutComponent } from '@vex/components/vex-page-layout/vex-page-layout.component';
import { PageLayoutDemoComponent } from '../../ui/page-layouts/page-layout-demo/page-layout-demo.component';

import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition
} from '@angular/material/snack-bar';

import { MatTooltipModule } from '@angular/material/tooltip';
import screenfull from 'screenfull';

// Interface para descrever a estrutura da resposta da API
interface ResponseData {
  choices?: { message: { content: string } }[];
}

@Component({
  selector: 'vex-dashboard-analytics',
  templateUrl: './dashboard-analytics.component.html',
  styleUrls: ['./dashboard-analytics.component.scss'],
  standalone: true,
  imports: [CommonModule,FormsModule, MatBottomSheetModule, MatListModule,
    VexSecondaryToolbarComponent,
    VexBreadcrumbsComponent,
    MatButtonModule,
    MatIconModule,
    WidgetAssistantComponent,
    WidgetQuickLineChartComponent,
    WidgetLargeGoalChartComponent,
    WidgetQuickValueCenterComponent,
    WidgetLargeChartComponent,
    WidgetTableComponent,
    PageLayoutDemoComponent,
    MatTabsModule,
    VexPageLayoutContentDirective,
    VexPageLayoutHeaderDirective,
    VexPageLayoutComponent,
    MatCardModule,
    MatTooltipModule,
    MatInputModule,
    MatFormFieldModule

  ]
})
export class DashboardAnalyticsComponent implements OnInit {

  durationInSeconds = 130;
  horizontalPosition: MatSnackBarHorizontalPosition = 'end';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';

  questionAnswerList: any[] = [];
  questionText: any = '';
  chatMessage: any;
  isLoading = false;
  errorText = '';
  selectedText: string = '';
  data: any;


  constructor(
    private http: HttpClient,
    private _snackBar: MatSnackBar
  ) {}

  openSnackBar(message: string) {
    this._snackBar.open(message, 'Save Notes', {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      duration: this.durationInSeconds * 1000,
    });
  }

  ngOnInit(): void {
    if (screenfull.isEnabled) {
      screenfull.request();
    }
 }

 async questionToOpenAI(question: string) {
  this.isLoading = true;
  try {
    const headers = new HttpHeaders({
      "Authorization": `Bearer ${gpt4.gptApiKey}`,
      "Content-Type": "application/json"
    });

    const response: ResponseData | undefined = await this.http.post<ResponseData>(gpt4.gptUrl, {
      messages: [{ role: 'user', content: question }],
      temperature: 0.5,
      max_tokens: 4000,
      model: "gpt-4",
    }, { headers }).toPromise();

         // Verificando se a resposta é indefinida
         if (response === undefined) {
          throw new Error("Resposta indefinida.");
        }

        // Verificando se a propriedade 'choices' está presente na resposta
        if (response.choices && response.choices.length > 0) {
          this.chatMessage = response.choices[0].message.content;
          // Chamando a função para exibir o Snackbar com a mensagem processada
          this.openSnackBar(this.chatMessage);
        } else {
          throw new Error("Resposta inválida.");
        }
      } catch (error) {
        this.errorText = (error as any).error.message;
      } finally {
        this.isLoading = false;
      }
    }

    @HostListener('document:mouseup', ['$event'])
    handleMouseUp(event: MouseEvent) {
      const selection = window.getSelection();
      if (selection && selection.toString().trim() !== '') {
        this.selectedText = selection.toString();
        this.questionToOpenAI(this.selectedText);
      }
    }
  }
