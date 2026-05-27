# Booking Conversion Tracking — Acuity → GA4 → Google Ads

How an Acuity booking becomes an **attributed** `booking_confirmed` conversion in GA4
(and, by import, in Google Ads). Written after building it; read this before touching
any of the pieces below.

---

## TL;DR

The booking happens inside a **cross-origin Acuity iframe**, so the conversion can't be
observed client-side. The authoritative conversion is generated **server-side** from
Acuity's webhook in the sGTM container. A raw webhook has no browser context, so we
**pass the visitor's GA4 identifiers through Acuity** and rebuild the event with them —
this "stitches" the server conversion back onto the original web session.

```
BROWSER (main.js)                         ACUITY                    sGTM (server)
─────────────────                         ──────                    ─────────────
gtag sets _ga / _ga_<id> cookies          intake form              Acuity Webhook Receiver
  → client_id (decimal) + session_id      "Internal Tracker"       (custom client) reads the
main.js reads them + gclid                 (form 3282818)           form fields back via the
  → injects into iframe URL ──booking──▶   stores them on  ──hook─▶ Acuity API, sets
    as field:<id>=<value>                  the appointment          client_id/session_id/gclid,
                                                                    runContainer → GA4 tag
                                                                            │
                                                                            ▼
                                                                    GA4 stitches to the
                                                                    original session →
                                                                    real landing page + source
                                                                            │
                                                                            ▼
                                                                    Google Ads imports the
                                                                    GA4 booking_confirmed
                                                                    conversion (no native Ads tag)
```

---

## Key IDs and locations

| Thing | Value |
|---|---|
| GA4 Measurement ID | `G-R6QP26PTW9` (session cookie: `_ga_R6QP26PTW9`) |
| sGTM endpoint | `https://sgtm.evermore-permanentjewelry.com` |
| sGTM hosting | Google Cloud Run service **`server-side-tagging`**, region `us-central1` |
| Webhook path | `/acuity-webhook` (POST) |
| Acuity intake form | **"Internal Tracker"**, form ID `3282818`, **internal-use-only** |

### Acuity intake field IDs (the "Internal Tracker" form)
| Field label | Acuity field ID | Carries |
|---|---|---|
| `ga_client_id` | `18578989` | GA4 client_id (decimal `_ga` value) |
| `ga_session_id` | `18578990` | GA4 session_id |
| `gclid` | `18578991` | Google Ads click ID |

These IDs are referenced in **two** places — keep them in sync:
- `staging/assets/js/main.js` → `ACUITY_FIELD` config in `initAcuityWidget()`
- the sGTM **Acuity Webhook Receiver** client template (`getFormValue(appt, '...')` calls)

### Acuity calendar → location (mapped in the webhook client template)
| Calendar ID | Location |
|---|---|
| `14011805` | Gulf Shores / Foley, AL |
| `14012033` | West Palm Beach, FL |
| `14012097` | Myrtle Beach, SC |

---

## The pieces

### 1. Browser — `staging/assets/js/main.js`
- **`initAdClickCapture()`** (runs every page): captures `gclid`/`wbraid`/`gbraid` from the
  landing URL into a first-party cookie (`_ev_gclid`, 90 days) so the click ID survives
  until the visitor reaches a booking page.
- **`initAcuityWidget()`**: reads `client_id` (`_ga` cookie), `session_id` (`_ga_<id>` cookie),
  and `gclid`, then builds the Acuity iframe URL with `&field:<id>=<value>` appended.

The booking iframes use **`data-acuity-src`** (NOT a static `src`) so the script controls the
single load and appends the fields before the request is made. Pages with the widget:
`book-gulf-shores`, `book-myrtle-beach`, `book-west-palm-beach`, `gulf-shores`,
`myrtle-beach`, `west-palm-beach`.

### 2. sGTM — "Acuity Webhook Receiver" custom client
- Claims POST requests to the webhook path.
- Fetches the full appointment from the Acuity API (validates it's real + gets PII).
- `getFormValue(appt, fieldId)` pulls `ga_client_id` / `ga_session_id` / `gclid` out of
  `appt.forms[].values[]` by `fieldID`.
- Sets the event's **`client_id` = `ga_client_id`** (falls back to hashed email, then a
  synthetic id), plus `session_id`, `engagement_time_msec`, and `gclid`.
- Also builds Enhanced Conversions `user_data` (hashed email/phone/name).

### 3. sGTM — "GA4 (Web)" client
- **Cookies and Client Identification = "JavaScript Managed"** (see gotcha below).
- Default Parameters to Include = **All** (so `session_id`/`engagement_time_msec` pass through).

### 4. Google Ads
- The Ads conversion is the **GA4 `booking_confirmed` event imported via the GA4↔Ads link** —
  there is **no native Google Ads conversion tag**. Ads attribution is inherited from GA4's
  session attribution, so fixing GA4 stitching fixes Ads automatically.

---

## Gotchas (the things that cost us time)

1. **GA4 (Web) client MUST be "JavaScript Managed", not "Server Managed" (FPID).**
   Server Managed/FPID gives web sessions a server-derived **base64** client_id that the
   browser can't read, so the **decimal** `_ga` client_id we pass through Acuity won't match →
   no stitching → `(not set)` landing page → unattributed Ads conversion. JavaScript Managed
   makes the decimal `_ga` value the canonical client_id. Tradeoff: slightly weaker Safari/ITP
   durability — acceptable, and the only way browser→webhook stitching works.

2. **GA4 session cookie has TWO formats.** Newer accounts use `GS2.1.s<session_id>$o…$g…$t…`
   (note the `s` prefix); older use `GS1.1.<session_id>.<n>`. The regex must handle both:
   `/_ga_[A-Z0-9]+=GS\d\.\d\.s?(\d+)/`.

3. **The `_ga_<id>` session cookie can lag.** It's written when GA4 fires (sometimes just
   after `main.js` runs), unlike the persistent `_ga` cookie. `initAcuityWidget()` waits up to
   ~2s for the session cookie before building the iframe URL.

4. **The webhook does NOT appear in sGTM Preview.** Preview only captures requests carrying its
   debug header; Acuity's server-to-server POST has none. **Verify via Cloud Logging**, not Preview.

5. **Cache-busting is required.** The booking iframe has no static `src`, so it depends entirely
   on the new `main.js`. A stale cached `main.js` against new HTML = a blank widget. The publish
   step appends `?v=<content-hash>` to `main.js`/`style.css` in the root HTML so HTML and JS
   always update together. (Staging keeps plain references for local dev.)

6. **GTM changes must be PUBLISHED, not just saved.** The live webhook hits the published
   container version. Saving a template or switching a setting in the workspace does nothing
   until you Submit → Publish.

---

## How to verify end-to-end

1. **Web client_id is decimal:** sGTM Preview → any web event → `client_id` reads `NNNN.NNNN`
   (not base64). Confirms FPID is off / JavaScript Managed.
2. **Fields inject:** load a booking page (optionally `?gclid=TEST123`) → DevTools → the iframe
   `src` ends with `&field:18578989=…&field:18578990=…&field:18578991=…`.
3. **Stored on appointment:** complete a test booking → Acuity → the appointment's "Internal
   Tracker" form shows the three values.
4. **Server processed them (definitive):** Cloud Run `server-side-tagging` → **Logs** → search
   `TEST123`:
   ```
   Acuity stitch fields - cid:<decimal> sid:<id> gclid:TEST123
   Acuity webhook processed: booking_confirmed for <location> (apt …) with client_id <decimal>…
   runContainer callback fired - tags should have run for: booking_confirmed
   ```
   `cid:` must be the **decimal** value, not a 64-char hash.
5. **GA4 received it:** GA4 → Realtime → `booking_confirmed` appears.
6. **Attribution payoff (24–48h later):** GA4 Landing Page report / exploration filtered to
   `booking_confirmed` shows a real source instead of `(not set)`; the imported Ads conversion
   attributes over the same window.

Remember to **cancel test appointments** in Acuity and consider excluding internal traffic in GA4.

---

## If you add a new booking location/page
- Give the iframe `data-acuity-src` (not `src`), inside `.acuity-widget-wrapper` with
  `data-location` and `data-fallback-url`.
- Add the calendar-ID → location mapping in the webhook client template.
- Re-run the publish (auto cache-busts). The intake-form fields are shared across all
  appointment types (the "Internal Tracker" form is set to all types), so no new fields needed.
