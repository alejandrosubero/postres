import { ApplicationConfig, LOCALE_ID } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getDatabase, provideDatabase } from '@angular/fire/database';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { provideAnimations } from '@angular/platform-browser/animations';


const firebaseConfig = {
  apiKey: "AIzaSyCyCqhVpEFQImS280jlRIMNZarGnt6KSPY",
  authDomain: "postres-e6f51.firebaseapp.com",
  databaseURL: "https://postres-e6f51-default-rtdb.firebaseio.com",
  projectId: "postres-e6f51",
  storageBucket: "postres-e6f51.firebasestorage.app",
  messagingSenderId: "314715028983",
  appId: "1:314715028983:web:6802ff8d4d283df8b802f2",
  measurementId: "G-4Q4VH5PZR1"
};


export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideDatabase(() => getDatabase()), provideAnimationsAsync(),
    provideAnimations(), 
    { provide: LOCALE_ID, useValue: 'en-US' }
  ]
};
