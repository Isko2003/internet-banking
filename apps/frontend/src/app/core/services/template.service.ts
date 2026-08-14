import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TransferTemplate } from '../models/transfer-template.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TemplateService {
  private http = inject(HttpClient);

  getTemplates(): Observable<TransferTemplate[]> {
    return this.http.get<TransferTemplate[]>(`${environment.apiUrl}/templates`);
  }

  updateTemplate(id: number, updates: Partial<TransferTemplate>): Observable<TransferTemplate> {
    return this.http.patch<TransferTemplate>(`${environment.apiUrl}/templates/${id}`, updates);
  }

  deleteTemplate(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${environment.apiUrl}/templates/${id}`);
  }
}
