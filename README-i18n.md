# Guide d'internationalisation (i18n) pour EcoDeli

Ce document explique comment utiliser le système de traduction dans l'application EcoDeli.

## Structure

Le système de traduction est basé sur :
- Un contexte React (`LanguageContext`) qui gère l'état de la langue
- Des fichiers JSON de traduction dans le dossier `locales/`
- Un hook personnalisé `useLanguage()` pour accéder aux traductions

## Comment utiliser les traductions dans un composant

1. Importez le hook `useLanguage` :
```jsx
import { useLanguage } from "@/components/language-context"

