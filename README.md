# RestoraniZEGE

# Deploy
[https://restoranizege-frontend.onrender.com/](https://restoranizege-frontend.onrender.com/)

Baza i backend dio projekta trenutačno suspendani(zaustavljeni) na Renderu. Za pristup aplikaciji javite se putam maila nekom članu tima.

Admin credentials: 
- email: admin@admin.com
- password: Adm!ni!23

# Opis projekta
Cilj našeg projekta je izrada web aplikacije koja će pomoći svima u Zagrebu u pronalasku restorana i hrane po njihovom ukusu.
Bez obzira radi li se o turistu ili stanovniku grada, svima je zajedničko da, osim razgledavanja kulturnih znamenitosti i atraktivnih lokacija, žele i uživati u dobroj hrani.
Naša aplikacija objedinjuje sve potrebne informacije na jednom mjestu, čime proces odabira restorana postaje brz i jednostavan.
Korisnicima će biti omogućeno filtriranje restorana prema različitim kriterijima, poput vrste kuhinje, cjenovnog razreda, lokacije te ocjena drugih korisnika, kako bi lakše pronašli željeni restoran.

# Tehnologije

Projekt koristi sljedeće tehnologije:

## Backend – NestJS
- Node.js + TypeScript
- NestJS framework
- PostgreSQL baza podataka
- TypeORM za ORM sloj
- JWT autentifikacija
- REST API arhitektura

## Frontend – React + Vite
- React 18
- Vite build alat
- TypeScript
- Axios za API pozive
- React Router za navigaciju

# Instalacija i pokretanje projekta

Slijede upute kako klonirati repozitorij i pokrenuti backend i frontend dio aplikacije.

### 🔽 1. Kloniranje repozitorija
```bash
git clone https://github.com/karlokus/RestoraniZEGE.git
cd RestoraniZEGE
```

### 🛠️ Backend — NestJS

#### 📦 2. Instalacija ovisnosti
```bash
cd backend
npm install
```

#### ⚙️ 3. Kreiranje `.env` datoteke

U root `/backend` direktorija napravite datoteku `.env` i/ili `.env.development` (ovisno o načinu pokretanja: produkcijski/development) sa sljedećim sadržajem:
```env
DATABASE_PORT=your_database_configuration
DATABASE_USER=your_database_configuration
DATABASE_PASSWORD=your_database_configuration
DATABASE_HOST=your_database_configuration
DATABASE_NAME=your_database_configuration
DATABASE_SYNC=true
DATABASE_AUTOLOAD=true

PROFILE_API_KEY=whatever

JWT_SECRET=your_jwt_secret
JWT_TOKEN_AUDIENCE=localhost:3000
JWT_TOKEN_ISSUER=localhost:3000
JWT_ACCESS_TOKEN_TTL=3600

JWT_REFRESH_TOKEN_TTL=86400

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

SMTP_HOST=your_smtp_name
SMTP_PORT=your_smtp_port
SMTP_SECURE=true/false
SMTP_USER=your_smtp_user_email
SMTP_PASS=your_smtp_pass
EMAIL_FROM=RestoraniZEGE <restoranizege@gmail.com>
```

#### ▶️ 4. Pokretanje backend servera

**Development način:**
```bash
npm run start:dev
```

**Production build:**
```bash
npm run build
npm run start:prod
```

Backend će biti dostupan na: **http://localhost:3000**

### 💻 Frontend — React + Vite

#### 📦 5. Instalacija ovisnosti
```bash
cd frontend
npm install
```

#### 🔧 6. Konfiguracija environment varijabli

Napravite `.env.development` datoteku sa sljedećim sadržajem:
```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_API_URL=http://localhost:3000
```

#### ▶️ 7. Pokretanje frontend aplikacije
```bash
npm run dev
```

Aplikacija će biti dostupna na: **http://localhost:5173**

# Članovi tima 
- Ivan Gabrilo - Ivan.Gabrilo@fer.unizg.hr
- Karlo Kus - Karlo.Kus@fer.unizg.hr
- Nina Majetić - Nina.Majetic@fer.unizg.hr
- Petar Marčinko - Petar.Marcinko@fer.unizg.hr
- Noa Zvonimir Paić - Noa.Paic@fer.unizg.hr
- Matej Samaržija - Matej.Samarzija@fer.unizg.hr
- Matej Šest - Matej.Sest@fer.unizg.hr

# 📝 Kodeks ponašanja [![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)](CODE_OF_CONDUCT.md)
Kao studenti sigurno ste upoznati s minimumom prihvatljivog ponašanja definiran u [KODEKS PONAŠANJA STUDENATA FAKULTETA ELEKTROTEHNIKE I RAČUNARSTVA SVEUČILIŠTA U ZAGREBU](https://www.fer.hr/_download/repository/Kodeks_ponasanja_studenata_FER-a_procisceni_tekst_2016%5B1%5D.pdf), te dodatnim naputcima za timski rad na predmetu [Programsko inženjerstvo](https://wwww.fer.hr).
Očekujemo da ćete poštovati [etički kodeks IEEE-a](https://www.ieee.org/about/corporate/governance/p7-8.html) koji ima važnu obrazovnu funkciju sa svrhom postavljanja najviših standarda integriteta, odgovornog ponašanja i etičkog ponašanja u profesionalnim aktivnosti. Time profesionalna zajednica programskih inženjera definira opća načela koja definiranju  moralni karakter, donošenje važnih poslovnih odluka i uspostavljanje jasnih moralnih očekivanja za sve pripadnike zajenice.

Kodeks ponašanja skup je provedivih pravila koja služe za jasnu komunikaciju očekivanja i zahtjeva za rad zajednice/tima. Njime se jasno definiraju obaveze, prava, neprihvatljiva ponašanja te  odgovarajuće posljedice (za razliku od etičkog kodeksa). U ovom repozitoriju dan je jedan od široko prihvačenih kodeks ponašanja za rad u zajednici otvorenog koda.

# 📝 Licenca
Važeća (1)
[![CC BY-NC-SA 4.0][cc-by-nc-sa-shield]][cc-by-nc-sa]

Ovaj repozitorij sadrži otvoreni obrazovni sadržaji (eng. Open Educational Resources)  i licenciran je prema pravilima Creative Commons licencije koja omogućava da preuzmete djelo, podijelite ga s drugima uz 
uvjet da navođenja autora, ne upotrebljavate ga u komercijalne svrhe te dijelite pod istim uvjetima [Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License HR][cc-by-nc-sa].

[![CC BY-NC-SA 4.0][cc-by-nc-sa-image]][cc-by-nc-sa]

[cc-by-nc-sa]: https://creativecommons.org/licenses/by-nc/4.0/deed.hr 
[cc-by-nc-sa-image]: https://licensebuttons.net/l/by-nc-sa/4.0/88x31.png
[cc-by-nc-sa-shield]: https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg

Orginal [![cc0-1.0][cc0-1.0-shield]][cc0-1.0]
[![CC0-1.0][cc0-1.0-image]][cc0-1.0]

[cc0-1.0]: https://creativecommons.org/licenses/by/1.0/deed.en
[cc0-1.0-image]: https://licensebuttons.net/l/by/1.0/88x31.png
[cc0-1.0-shield]: https://img.shields.io/badge/License-CC0--1.0-lightgrey.svg

### Reference na licenciranje repozitorija
