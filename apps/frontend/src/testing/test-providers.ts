import { ActivatedRoute } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of } from 'rxjs';

export function provideTestingDependencies() {
  return [
    provideHttpClient(),
    provideHttpClientTesting(),
    {
      provide: ActivatedRoute,
      useValue: {
        snapshot: {
          paramMap: { get: () => null },
          queryParamMap: { get: () => null },
        },
        paramMap: of({ get: () => null }),
        queryParamMap: of({ get: () => null }),
      },
    },
  ];
}
