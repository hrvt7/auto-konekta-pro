

# AutoDok — Magyar Autókereskedés Kezelő SaaS

## Áttekintés
Teljes körű autókereskedés-kezelő alkalmazás magyar nyelven, amely leegyszerűsíti a készletkezelést, vevőnyilvántartást és a szerződéskötési folyamatot. A meglévő Supabase adatbázis sémára épül.

---

## 1. Landing Page & Navigáció
- Hero szekció: "Gyorsabb autóeladás, hibamentes szerződéskötés" üzenettel
- 3 feature kártya (Készletkezelés, Automatikus szerződés, Vevőnyilvántartás)
- Árazási szekció (Starter 15.000 Ft/hó, Pro 25.000 Ft/hó)
- CTA gombok regisztrációhoz
- Navigáció: Logo + Bejelentkezés + Kipróbálom

## 2. Autentikáció & Onboarding
- **Regisztráció** oldal (név, email, jelszó) → átirányítás onboarding-ra
- **Bejelentkezés** oldal + jelszó-emlékeztető
- **Onboarding**: kereskedő típus választása (magánszemély/jogi személy), kereskedés adatainak megadása → dealerships tábla létrehozás, profil összekapcsolás
- Védett útvonalak: bejelentkezés nélkül → /login, dealership_id nélkül → /onboarding

## 3. Dashboard
- Oldalsáv navigáció (Készlet, Vevők, Értékesítések, Dokumentumok, Beállítások)
- Felső navigáció: logo + felhasználó menü (név, kijelentkezés)
- 4 statisztika kártya: készleten lévő, foglalt, eladott (aktuális hónap), összes vevő
- Legutóbbi járművek táblázat státusz badge-ekkel (zöld/sárga/szürke/kék)
- Mobilon: oldalsáv alsó navigációvá alakul

## 4. Készletkezelés (Vehicles)
- **Lista nézet**: szűrőkkel (márka, státusz, ár, km) + jármű kártya rács
- **Új jármű felvétele**: többszekciós űrlap (azonosítók, alapadatok, ár, leírás, képfeltöltés Supabase storage-ba)
- **Jármű részletek**: képgaléria, összes adat, státusz változtatás, státusz napló, kapcsolódó dokumentumok, "Eladás indítása" gomb
- **Szerkesztés**: előre kitöltött űrlap

## 5. Vevőkezelés (Customers)
- **Lista**: keresés névvel, táblázat (név, típus, telefon, email, vásárlások száma)
- **Új vevő**: magánszemély/jogi személy toggle, a magyar hivatalos okmányokhoz szükséges összes mező
- **Vevő részletek**: összes adat + vásárlási előzmények

## 6. Értékesítési folyamat (Sales) — Fő munkafolyamat
6 lépéses varázsló:
1. **Jármű kiválasztása** — keresés vagy előre kiválasztott
2. **Vevő kiválasztása** — meglévő keresés vagy új vevő inline felvétele
3. **Üzembentartó** — megegyezik a vevővel checkbox, vagy külön személy
4. **Tranzakció adatok** — ár, ár szöveggel, fizetési mód, dátumok, km állás, bizalmi vagyonkezelés
5. **Tanúk** — 2 tanú adatai (név, okmány, lakcím)
6. **Összefoglalás & Dokumentumgenerálás** — áttekintés + dokumentum típus választás (adásvételi szerződés, üzembentartói szerződés, meghatalmazás, átadás-átvételi elismervény)

Mentéskor: sales + witnesses táblák kitöltése, jármű státusz "eladva"-ra, documents tábla "pending" státusszal.

## 7. Értékesítések lista & részletek
- **Lista**: táblázat szűrőkkel (dátum, státusz)
- **Részletek**: jármű + vevő kártyák, tranzakció adatok, dokumentumok listája letöltés gombokkal

## 8. Dokumentumok
- Összes dokumentum listája az összes értékesítésből
- Szűrés típus és dátum szerint
- Státusz badge-ek (Generálva/Függőben/Hiba)
- Megjegyzés: a tényleges PDF generálás később Make.com webhook-kal lesz megoldva

## 9. Beállítások
- Kereskedés adatainak szerkesztése (magánszemély/jogi személy toggle, az onboarding-hoz hasonló mezők)

---

## Design rendszer
- **Elsődleges szín**: #1E3A5F (sötét tengerészkék)
- **Kiemelő szín**: #E8A000 (arany/borostyán)
- Fehér hátterek, finom árnyékok, professzionális B2B megjelenés
- Magyar szám formázás: "3 500 000 Ft", "125 000 km"
- Üres állapotok illusztrációval és CTA-val minden listán
- Skeleton betöltés animációk
- Toast értesítések minden művelethez

## Technikai megvalósítás
- Meglévő Supabase adatbázis séma használata (nincs új tábla létrehozás)
- Supabase Storage bucket létrehozása képfeltöltéshez ("vehicle-images")
- Supabase Auth a hitelesítéshez
- RLS policy-k már konfigurálva vannak dealership szintű elválasztásra
- Reszponzív: desktop-first, mobilon alsó navigáció

