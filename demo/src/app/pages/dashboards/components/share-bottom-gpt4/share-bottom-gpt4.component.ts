import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatBottomSheetModule, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';

const gptUrl = "https://api.openai.com/v1/chat/completions";
const gptApiKey = "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";

@Component({
  selector: 'vex-share-bottom-gpt4',
  templateUrl: './share-bottom-gpt4.component.html',
  styleUrls: ['./share-bottom-gpt4.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatListModule,
    MatIconModule,
    MatBottomSheetModule
  ]
})
export class ShareBottomGpt4Component implements OnInit {
  questionAnswerList: any[] = [];
  questionText: any = '';
  chatMessage: any;
  isLoading = false;
  errorText = '';

  constructor(
    private _bottomSheetRef: MatBottomSheetRef<ShareBottomGpt4Component>,
    private http: HttpClient
  ) {}

  ngOnInit() {}

  async questionToOpenAI(question: string) {
    this.isLoading = true;
    try {
      const headers = new HttpHeaders({
        "Authorization": `Bearer ${gptApiKey}`,
        "Content-Type": "application/json"
      });

      const response = await this.http.post(gptUrl, {
        messages: [{ role: 'user', content: question }],
        temperature: 0.5,
        max_tokens: 4000,
        model: "gpt-4",
      }, { headers }).toPromise();

      this.chatMessage = response;

    } catch (error) {
      this.errorText = (error as any).error.message;
    } finally {
      this.isLoading = false;
    }
  }

  close() {
    this._bottomSheetRef.dismiss();
  }
}
