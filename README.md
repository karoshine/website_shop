# 🛒 ALL IN STORE 

Kompletna platforma e-commerce zrealizowana w architekturze Client-Server. Projekt spełnia wszystkie wymagania zaliczeniowe, w tym autoryzację JWT z Refresh Tokenem, system ról (Admin/User), pełną historię zamówień oraz persystencję danych w pliku JSON.

![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-green?style=for-the-badge&logo=nodedotjs)
![MUI](https://img.shields.io/badge/MUI-Material--UI-007FFF?style=for-the-badge&logo=mui)
![Vite](https://img.shields.io/badge/Vite-Bundler-646CFF?style=for-the-badge&logo=vite)

---

## 🚀 Instrukcja Uruchomienia

Projekt składa się z dwóch części: Backendu (serwer) i Frontendu (klient). Należy uruchomić je w dwóch osobnych terminalach.

### Krok 1: Backend
Odpowiada za API, bazę danych i autoryzację.

```
bash
cd backend
npm install
node server.js
```

> Serwer wystartuje na porcie **5000**.
> *Uwaga: Przy pierwszym uruchomieniu serwer automatycznie utworzy plik bazy danych `db.json`.*

### Krok 2: Frontend
Interfejs użytkownika w React.

```
bash
cd frontend
npm install
npm run dev
```

> Aplikacja otworzy się pod adresem wskazanym w terminalu (zazwyczaj `http://localhost:5173`).

---

## 🔑 Dostęp Administratora 
System posiada automatyczne przydzielanie uprawnień na podstawie loginu. Aby przetestować funkcje administratora (np. usuwanie dowolnych opinii):

1. Wejdź w zakładkę **Rejestracja**.
2. Utwórz konto z loginem: **`admin`**
3. Hasło: dowolne (np. `admin123`).
4. **Gotowe!** System wykryje ten login i nada uprawnienia **ADMIN**.

---

## 🌟 Zaimplementowane Funkcjonalności

### 1. Backend & Baza Danych
* **REST API:** Pełna obsługa produktów, koszyka, użytkowników i zamówień.
* **Persystencja Danych:** Wszystkie dane (użytkownicy, opinie, zamówienia) są trwale zapisywane w pliku `db.json`.
* **Security:**
    * **JWT (Access Token):** Ważny 15 minut.
    * **Refresh Token:** Ważny 7 dni (automatyczne odświeżanie sesji).
    * **Role:** Backend blokuje próby usunięcia cudzych opinii przez zwykłych użytkowników.

### 2. Sklep i Produkty
* **Przeglądanie:** Pobieranie produktów z zewnętrznego API (FakeStoreAPI).
* **Szukanie i Filtrowanie:** Wyszukiwarka tekstowa oraz filtrowanie po kategoriach.
* **Szczegóły:** Widok pojedynczego produktu z wyborem ilości sztuk.

### 3. Koszyk i Zamówienia
* **Koszyk:** Stan koszyka jest zapisywany w bazie. Użytkownik nie traci koszyka po wylogowaniu.
* **Składanie Zamówienia:** Proces zakupu czyści koszyk i przenosi produkty do historii.
* **Historia Zamówień:** Dedykowana podstrona, gdzie użytkownik widzi swoje przeszłe zamówienia, daty i kwoty.

### 4. Opinie i Interakcje
* **System Ocen:** Gwiazdki + komentarz tekstowy.
* **Uprawnienia (DELETE):**
    * **Zwykły User:** Może usunąć tylko swoją opinię.
    * **Admin:** Widzi ikonę kosza przy każdej opinii i może usunąć każdą z nich.

---

## 🛠 Technologie

* **Frontend:** React, React Router DOM, Material UI (MUI) - styl "High-End".
* **Backend:** Node.js, Express.js, Cors, Body-parser.
* **Auth:** JsonWebToken (JWT).
* **Database:** Low-level JSON storage (fs module).

---

## 📂 Dokumentacja API

W folderze głównym projektu znajduje się plik `AllInStore_FINAL.postman_collection.json`. Jest to pełna dokumentacja Postman, zawierająca gotowe scenariusze testowe (Rejestracja, Logowanie, Refresh Token, Obsługa Zamówień).

---

## 👥 Autor

Projekt wykonany przez:
Karoline Marmola
