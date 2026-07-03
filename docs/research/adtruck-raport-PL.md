# AdTruck — Raport: rynek, wycena i plan MVP do produkcji

_Reklama na naczepach TIR + mapa Europy na żywo. Rynek: Polska. Status: interaktywny POC — **https://ad-truck.vercel.app**. Data: lipiec 2026._

---

## 1. Podsumowanie
- **Nie istnieje gotowe („pudełkowe") oprogramowanie**, które można licencjonować i uruchomić jako własną firmę reklamy na naczepach. Są operatorzy-sieci (sprzedają kampanie, nie licencję) oraz pojedyncze „klocki" (GPS, pomiar, mapy), które można subskrybować i wpiąć.
- Dlatego nasza droga — **budować własne, wpinając gotowe klocki** — jest właściwa. To wolna nisza dla regionalnego gracza w PL.
- **Budżet dla firmy rodzinnej jest realny:** przy pracy „Ty + AI" ok. **$1,5–5 tys. jednorazowo + $60–250/mies.**, a nie „miliony".
- **Główne ryzyka** to nie kod, lecz: realny tracking GPS (współpraca przewoźników), **RODO/GDPR (potrzebny prawnik)**, płatności/księgowość, dwustronny cold-start.

---

## 2. Rynek: konkurenci i co można ponownie wykorzystać

### 2.1. Analogi/operatorzy (kupuje się u nich kampanie, licencji — nie)
| Platforma | Co / nośnik | Region | Model | Dla nas |
|---|---|---|---|---|
| **Adverttu → Drovo** | Marketplace marki↔właściciele aut/dostawczych/**HGV (naczepy)**; aplikacja, atrybucja, retargeting | UK/EU | Opłata za kampanię | **Najbliższy analog modelu** — wzorzec funkcji |
| **Movia Media** | Mobilne billboardy **na burtach naczep**, GPS, dashboard | US/CA | Opłata za kampanię | Najbliższy nośnikiem |
| **Wrapify / Carvertise** | Oklejanie prywatnych aut (rideshare), tracking | US | Kampanie; kierowcy $100–450/mies. | Ekonomia/metryki |
| **AdQuick** | Marketplace OOH + mobilne billboardy: weryfikacja GPS, proof-of-play (zdjęcia), CPM/ROAS | US | Pośrednictwo mediowe | **Wzorzec dashboardu** |
| **Firefly** | Ekrany cyfrowe na taxi/rideshare | US | Kampanie | Przykład gałęzi LED na przyszłość |

### 2.2. „Klocki" — można je subskrybować i wpiąć
- **Realny GPS:** aplikacja kierowcy (0 zł, zrobimy sami) · **Traccar** (open-source, ~$6–20/mies.) · Geotab (~$30–40/pojazd/mies. + sprzęt) · Samsara ($27–33/pojazd/mies., umowa 36 mies.).
- **Pomiar odsłon:** **StreetMetrics** (ruchoma reklama, US/EU, SaaS, cena na zapytanie) — „certyfikowane" liczby zamiast naszej oceny OTS. Na start zostawiamy własne OTS (norma branżowa).
- **Mapy/ruch:** MapLibre + OpenFreeMap (już, za darmo) + **TomTom/HERE Traffic** (free tier) — do „heatmapy wg ruchu".
- **Programmatic DOOH** (tylko przy ekranach cyfrowych): Vistar, Hivestack (jest white-label), Broadsign.

**Wniosek:** GPS = aplikacja kierowcy/Traccar; mapy/ruch = MapLibre + TomTom; pomiar = nasze OTS → StreetMetrics później. Drogi stack enterprise na start jest zbędny.

---

## 3. Wycena etapami (orientacyjnie, dla obecnego zakresu)

> ⚠️ **Wycena jest orientacyjna** i dotyczy **obecnego** zakresu wymagań (to, co jest już na ad-truck.vercel.app + plan MVP z rozdziału 5). Podzielone na etapy — dla przejrzystości wobec zamawiającego.

| Etap | Zakres | Czas | Wycena\* |
|---|---|---|---|
| **POC** ✅ | Interaktywny prototyp: mapa Europy na żywo, kreator zamówienia, raporty, role, funkcje-killer (heatmapa zasięgu, ETA, puls kampanii, karta pojazdu z reklamą na burcie) | wykonane, ~2–3 tyg. | ~$1,5–3 tys. (gotowe) |
| **MVP** | Expo (iOS/Android/web) + Supabase; auth + role + multi-tenant; zamówienie wg kraju/naczepy; kalkulator; **aplikacja kierowcy (realny GPS)**; mini-panel admina | 6–10 tyg. | **$6–15 tys.** |
| **Prod** | Płatności + VAT/faktury; workflow druku/montażu + okna dostępności naczep; raporty/atrybucja; heatmapa wg ruchu (TomTom); monitoring/backupy; RODO; audyt bezpieczeństwa; publikacja w App Store/Play | 4–8 tyg. | **$6–14 tys.** |
| **Wsparcie** (po starcie) | Poprawki błędów, aktualizacje, monitoring, drobne zmiany | miesięcznie | **$300–800/mies.** + infra $60–250/mies. |

\* Dla modelu „solo-deweloper + AI", stawki EE/PL, orientacyjnie. Software house pod klucz to $30–70 tys.+, agencja zachodnia $120–300 tys.+ („miliony" dotyczą platform wielorynkowych — nie nasz przypadek).

**Stack:** Expo (RN) → iOS + Android + web z jednej bazy kodu, wykorzystujemy gotową logikę.
**Infra/konta (gotówka):** Apple $99/rok, Google $25 jednorazowo, domena ~$15/rok; hosting managed (Supabase+Vercel+EAS) ~$25–60/mies. lub AWS ~$60–200/mies.; mapy/ruch $0–50; GPS $0–20; email/SMS $5–30; płatności — prowizja ~1,5–2,9%.

### O zakresie — szczerze (ważne do ustalenia z zamawiającym)
Powyższe kwoty dotyczą **obecnych, konkretnych** wymagań. Jeśli po drodze pojawią się nowe życzenia, których teraz nie ma na liście („a chciałoby się jeszcze to i tamto") — to normalne i częste, ale jest to już **dodatkowy zakres**: policzymy i ustalimy osobno, żeby terminy i cena pozostały uczciwe dla obu stron. Nad w nieskończoność rosnącym, rozmytym zakresem „za tę samą cenę" nie da się pracować nikomu. Dlatego idziemy **etapami**: ustalony zakres etapu → wykonane → odebrane → dalej.

---

## 4. Ryzyka / „kruczki" (szczerze)
1. **Realny GPS** — przejście od symulatora: aplikacja kierowcy (bateria, zgoda, lokalizacja w tle) lub telematyka. Trudność **operacyjna** — współpraca przewoźników.
2. **RODO/GDPR** — tracking pojazdów/osób, dane kierowców, retargeting → polityka prywatności, zgody, DPA. Część techniczną robimy my, **prawnik jest konieczny** w UE.
3. **Weryfikacja App Store/Play** — lokalizacja w tle → surowa moderacja (zwłaszcza Apple). Przejdziemy przy jasnej zgodzie.
4. **„Realne" odsłony** — nasze OTS to oszacowanie (norma branżowa); „certyfikowane" liczby → płatny StreetMetrics.
5. **Cold-start** — potrzebne realne naczepy, zanim reklamodawcy zobaczą wartość. **Ryzyko biznesowe.**
6. **Skala mapy na żywo** — realną telemetrię obsłuży backend (ingest + websockety + klasteryzacja), nie symulator po stronie klienta.
7. **Płatności/VAT (PL)** — Stripe/PayU + faktury → księgowy.
8. **Operacje fizyczne** — druk/oklejanie/montaż, okna dostępności naczep.

**Brak twardych blokerów „nie da się zakodować".** Całe oprogramowanie robimy sami; z zewnątrz potrzebni: **prawnik (RODO), księgowy (VAT), konta w sklepach, opc. audyt bezpieczeństwa i płatne dane (ruch/pomiar).**

---

## 5. Plan: pionowy wycinek wersji produkcyjnej (MVP)
Cel — zmienić POC w **prawdziwy produkt** na minimalnym, ale pełnym „pionowym wycinku".

**Stack:** Expo (iOS/Android/web) + **Supabase** (auth + baza Postgres + storage + RLS) + ponowne użycie obecnego kodu TS (domena/symulator/kalkulator/UI).

**Zakres wycinka:**
1. **Auth + role** (reklamodawca / przewoźnik / admin), zaproszenia, reset hasła.
2. **Multi-tenant** — izolacja danych per klient (polityki RLS w Supabase).
3. **Przeniesienie UI** POC do Expo (ekrany już zaprojektowane).
4. **Zamówienie kampanii wg kraju / konkretnej naczepy** + kalkulator (rozszerzamy estymator).
5. **Aplikacja kierowcy** — realny GPS zamiast symulatora (pierwszy uczciwy tracking).
6. **Mini-panel admina** — klienci/użytkownicy/kampanie/naczepy, moderacja.

**Etapy:**
1. Szkielet Expo + wspólny pakiet domeny + klient Supabase.
2. Auth + role + schemat bazy + RLS (multi-tenant).
3. Przeniesienie kluczowych ekranów (landing/kreator/mapa/kampanie).
4. Zamówienie wg kraju/naczepy + kalkulator na danych serwerowych.
5. Aplikacja kierowcy (geolokalizacja) → mapa na żywo na realnych danych.
6. Mini-panel admina + wdrożenie (EAS + web) + minimum RODO.

**Potrzebne od klienta:** konto Supabase (lub AWS), konta deweloperskie Apple/Google, prawnik do RODO, decyzja o płatnościach online.

---

## 6. Rekomendacja / następny krok
Zaczynamy **Poziom 1 (Ty + AI)** od pionowego wycinka na **Expo + Supabase**, wykorzystując gotowy kod. Pierwszy krok — wybrać backend (zalecam Supabase) i założyć konto; dalej rozwijam szkielet, auth i multi-tenant.

## Źródła
[AdQuick](https://www.adquick.com/mobile-billboard-advertising) · [Movia](https://movia.media/) · [Wrapify](https://wrapify.com/) · [Carvertise](https://carvertise.com/) · [Adverttu/Drovo](https://www.adverttu.com/) · [Firefly](https://www.fireflyon.com/) · [StreetMetrics](https://www.streetmetrics.com/measurement) · [Geopath](https://geopath.org/) · [Samsara](https://www.samsara.com/guides/fleet-gps-tracking-cost) · [Geotab](https://www.geotab.com/blog/fleet-gps-tracking-systems-cost/) · [Traccar](https://www.traccar.org/) · [Vistar](https://www.vistarmedia.com/) · [Hivestack](https://grapeseedmedia.com/adtech-guide/hivestack-review-guide/)
