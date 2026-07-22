import { Component, computed, inject, signal } from '@angular/core';
import { CardService } from '../../core/services/card.service';
import { Card } from '../../core/models/card.model';
import { finalize } from 'rxjs';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardVisual } from "../../shared/components/card-visual/card-visual";
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-cards',
  imports: [CurrencyPipe, FormsModule, CardVisual, RouterLink],
  templateUrl: './cards.html',
  styleUrl: './cards.css',
})
export class Cards {
  private cardService = inject(CardService);

  cards = signal<Card[]>([]);
  isLoading = signal(true);
  hasError = signal(false);
  selectedStatus = signal<string>('all');
  selectedType = signal<string>('all');

  constructor(){
    this.loadCardsData();
  }

  filteredCards = computed(() => {
    let result = this.cards();
    const selectedStatus = this.selectedStatus();
    const selectedType = this.selectedType();


    if(selectedStatus && selectedStatus !== 'all') {
      result = result.filter((card) => selectedStatus === card.status);
    }

    if(selectedType && selectedType !== 'all'){
      result = result.filter((card) => selectedType === card.type)
    }

    return result;
  })

  private loadCardsData() {
    this.isLoading.set(true);
    this.hasError.set(false);
    this.cardService.getCards().pipe(
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: (cards) => {
        this.cards.set(cards)
      },
      error: () => {
        this.hasError.set(true);
      }
    })
  }

}
