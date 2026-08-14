import { Component, computed, EventEmitter, input, Output } from '@angular/core';

@Component({
  selector: 'app-pagination',
  imports: [],
  templateUrl: './pagination.html',
  styleUrl: './pagination.css',
})
export class Pagination {
  currentPage = input.required<number>();
  totalCount = input.required<number>();
  pageSize = input.required<number>();

  @Output() pageChange = new EventEmitter<number>();

  totalPages = computed(() => {
    return Math.ceil(this.totalCount()/this.pageSize());
  })

  onPrevious() {
    if (this.currentPage() > 1) {
      this.pageChange.emit(this.currentPage() - 1);
    }
  }

  onNext() {
    if (this.currentPage() < this.totalPages()) {
      this.pageChange.emit(this.currentPage() + 1);
    }
  }
}
