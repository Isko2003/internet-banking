import { Component, inject, Input, OnInit, signal } from '@angular/core';
import { CardService } from '../../core/services/card.service';
import { Card } from '../../core/models/card.model';
import { finalize } from 'rxjs';
import { RouterLink } from "@angular/router";
import { CardVisual } from '../../shared/components/card-visual/card-visual';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-card-detail',
  imports: [RouterLink, CardVisual, CurrencyPipe],
  templateUrl: './card-detail.html',
  styleUrl: './card-detail.css',
})
export class CardDetail implements OnInit {
  private cardService = inject(CardService);

  @Input() id!: string;

  card = signal<Card | null>(null);
  isLoading = signal(true);
  hasError = signal(false);

  ngOnInit() {
    this.cardService.getCardById(this.id).pipe(
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: (card) => {
        this.card.set(card);
      },
      error: () => {
        this.hasError.set(true);
      }
    })
  }
}
