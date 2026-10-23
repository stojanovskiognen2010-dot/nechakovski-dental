/* Д-р Нечаковски — page behaviour. No dependencies and no scroll listeners (observers only).
   Macedonian is the source of truth in the markup; EN and EL are dictionaries that replace it.
   Chrome's Intl has no Macedonian, so month and day names are spelled out by hand for all three
   languages; Intl is used only to convert "now" into Europe/Skopje time, never for display. */
(function () {
  'use strict';

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    return node;
  }
  function icon(id) {
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'icon');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    var use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    use.setAttribute('href', '#' + id);
    svg.appendChild(use);
    return svg;
  }

  /* ===================== practice constants ===================== */

  var PHONE = '+38975306509';          // appointments line
  var VIBER = '+38970395362';
  var EMAIL = 'info@stomatolog.com.mk';
  var FOUNDED = 1993;
  var SLOT_MINUTES = 30;               // a review takes 30 minutes
  var OPEN = [[8 * 60, 20 * 60]];      // Mon–Fri 08:00–20:00 — two slots per hour, at :00 and :30
  var LEAD_MINUTES = 60;               // nothing bookable inside the next hour
  var BOOK_DAYS_AHEAD = 60;
  var SPLIT_AT = 14 * 60;              // morning / afternoon divider in the slot grid
  var MAP_EMBED = 'https://maps.google.com/maps?q=41.0332543,21.3373601&ll=41.0332543,21.3373601&z=17&output=embed';

  /* ===================== dictionaries ===================== */

  var EN = {
    'skip': 'Skip to content',
    'brand.aria': 'Dr. Nechakovski — home',
    'brand.sub': 'Dental practice · Bitola',
    'nav.aria': 'Main menu', 'nav.services': 'Services', 'nav.team': 'Team', 'nav.tech': 'Technology',
    'nav.reviews': 'Reviews', 'nav.contact': 'Contact', 'nav.book': 'Book a check-up',
    'lang.aria': 'Language', 'menu.label': 'Menu',
    'hero.eyebrow': 'A family dental practice since 1993',
    'hero.title1': 'Thirty-three years', 'hero.title2': 'of caring for your smile.',
    'hero.lead': 'Prosthodontics, implants, cosmetic dentistry and laser therapy in the centre of Bitola — with digital panoramic imaging and the strictest sterilisation protocols.',
    'hero.stat1': 'Years of experience', 'hero.stat2': 'Rating on Google', 'hero.stat3': 'Dental services',
    'hero.starsAria': '4.9 out of 5 stars',
    'hero.proof': '<strong>4.9</strong> on Google from <strong>31</strong> reviews',
    'quick.badge': 'Online booking', 'quick.title': 'Book a check-up',
    'quick.text': 'A check-up takes <strong>30 minutes</strong>. Pick a day and a time, leave your name and phone — we will call you to confirm.',
    'quick.p1': '30 minutes, Monday to Friday', 'quick.p2': 'Only your name and phone are needed',
    'quick.p3': 'We speak English, Greek and German',
    'quick.cta': 'Choose a time', 'quick.call': 'or call us on 075 306 509',
    'band.aria': 'The practice in numbers',
    'band.1': 'Year founded', 'band.2': 'Rating on Google', 'band.3': 'Patient reviews', 'band.4': 'Doctors in the team',
    'band.foot': 'Founded by Dr. Kiril Nechakovski. Nominated for the TOP-100 Achievements 2020 Award by the Achievements Forum, United Kingdom, in the healthcare category.',
    'sv.eyebrow': 'What we do', 'sv.title': 'Complete dental care', 'sv.title2': 'in one place.',
    'sv.lead': 'Pick a category, or just book a check-up and we will work out what you need together.',
    'sv.cats': 'Service categories', 'sv.empty': 'No services in this category.',
    'cat.all': 'All', 'cat.general': 'General', 'cat.prosthetics': 'Prosthodontics', 'cat.aesthetic': 'Cosmetic',
    'cat.children': "Children's", 'cat.perio': 'Perio & laser', 'cat.xray': 'X-ray',
    's.book': 'Book a check-up',
    's.plombi': 'Fillings', 's.plombi.d': 'Aesthetic nano-composite, microhybrid and glass-ionomer fillings.',
    's.lekuvanje': 'Treating decayed teeth', 's.lekuvanje.d': 'Treatment of caries and diseased teeth, preserving healthy tooth tissue.',
    's.endodoncija': 'Root canal treatment', 's.endodoncija.d': 'Endodontic treatment of the root canals.',
    's.ekstrakcii': 'Extractions', 's.ekstrakcii.d': 'Extractions and basic oral surgery under local anaesthetic.',
    's.kamenec': 'Scaling', 's.kamenec.d': 'Ultrasonic removal of calculus.',
    's.polirawe': 'Polishing', 's.polirawe.d': 'Removal of soft deposits with polishing.',
    's.fluor': 'Fluoride protection', 's.fluor.d': 'Protecting teeth from decay with fluoride preparations.',
    's.metalkeramika': 'Metal-ceramic crowns and bridges', 's.metalkeramika.d': 'Porcelain work on a metal base.',
    's.bezmetalni': 'All-ceramic work', 's.bezmetalni.d': 'Crowns, bridges, inlays, onlays and veneers for the highest aesthetics.',
    's.blagorodni': 'High noble alloy work', 's.blagorodni.d': 'Metal-ceramic on a gold and platinum base.',
    's.implanti': 'Implants', 's.implanti.d': 'Planning and prosthetic restoration. Certified for Straumann, BioHorizons and Impla Schütz Dental.',
    's.metalkompozit': 'Metal-composite work', 's.metalkompozit.d': 'Cast faced classic crowns and bridges.',
    's.akrilatni': 'Acrylic dentures', 's.akrilatni.d': 'Classic partial and full dentures.',
    's.skeletirani': 'Cast-frame dentures', 's.skeletirani.d': 'Vitallium and metal dentures with precision attachments.',
    's.nadogradbi': 'Cast posts and cores', 's.nadogradbi.d': 'Rebuilding badly damaged teeth before a crown.',
    's.fiberglas': 'Fibreglass posts', 's.fiberglas.d': 'Rebuilding teeth with fibreglass posts.',
    's.viniri': 'Veneers and laminates', 's.viniri.d': 'In porcelain or composite, for teeth that have changed colour, shape or position.',
    's.belenje': 'Teeth whitening', 's.belenje.d': 'Bleaching supervised by a dentist.',
    's.dijastema': 'Closing a diastema', 's.dijastema.d': 'Resolving a gap between the front teeth.',
    's.fileri': 'Hyaluronic fillers', 's.fileri.d': 'Facial aesthetics with Cytosial and Apriline, by a trained doctor.',
    's.mlecniplombi': 'Fillings for milk teeth', 's.mlecniplombi.d': 'Milk teeth and young permanent teeth.',
    's.mlecnilek': 'Treating milk teeth', 's.mlecnilek.d': 'Treatment of milk and young permanent teeth.',
    's.prevencija': 'Fluoride prevention', 's.prevencija.d': 'Planning and monitoring of caries prevention.',
    's.zalevanje': 'Fissure sealing', 's.zalevanje.d': 'Protecting the grooves of children’s teeth.',
    's.gingivitis': 'Gingivitis treatment', 's.gingivitis.d': 'Conservative treatment of inflamed gums.',
    's.parodontopatija': 'Periodontitis treatment', 's.parodontopatija.d': 'Conservative and laser-assisted therapy.',
    's.labr': 'LABR laser reduction', 's.labr.d': 'Laser Assisted Bacterial Reduction in the treatment of periodontitis.',
    's.alveolitis': 'Alveolitis treatment', 's.alveolitis.d': 'Laser therapy for complications after an extraction.',
    's.periapikalni': 'Periapical lesions', 's.periapikalni.d': 'Laser therapy for inflammation above the root of the tooth.',
    's.laserhirurgija': 'Laser surgery', 's.laserhirurgija.d': 'With the Sirona Sirolaser Blue.',
    's.lllt': 'Laser therapy (LLLT)', 's.lllt.d': 'With two lasers — 904 nm and 658 nm.',
    's.panoramsko': 'Digital panoramic imaging', 's.panoramsko.d': 'With the KaVo OP 3D — teeth, jaws, sinuses and the jaw joint, at the lowest dose.',
    's.periapikalnisnimki': 'Digital periapical radiographs', 's.periapikalnisnimki.d': 'Images of individual teeth during treatment.',
    'team.eyebrow': 'Who will see you', 'team.title': 'The doctors', 'team.title2': 'and the team.',
    'team.photoAlt': 'The team of Dr. Nechakovski Dental Practice in the practice, 2025',
    'team.photoCap': 'The practice team, 2025.',
    'team.founder': 'Founder', 'team.doctor': 'Doctor',
    'team.p1': 'Dr. Kiril Nechakovski', 'team.p1t': 'Specialist in dental prosthetics',
    'team.p1b': 'Born 1948 in Capari. Graduated from the Faculty of Dentistry in Skopje in 1974 and completed his specialisation in prosthodontics in 1986. Until 1993 he worked at the "Dr. Trifun Panovski" Medical Centre in Bitola; in 1993 he established this practice, where he worked until retiring in 2021.',
    'team.p2': 'Dr. Aleksandar Nechakovski', 'team.p2t': 'Specialist in dental prosthetics',
    'team.p2b': 'Born 1977 in Bitola, graduated in Skopje in 2002 and specialised in prosthodontics 2008–2011. Member of the European Society of Cosmetic Dentistry (ESCD) since 2017. Certified for the Impla Schütz Dental, Straumann and BioHorizons implant systems. In 2020–2021 he attended practical training in Washington, DC.',
    'team.lang': 'English · Greek · German',
    'team.p3': 'Dr. Eva Anastasova', 'team.p3t': 'Doctor of dentistry',
    'team.p3b': 'Born 1990 in Bitola, graduated in Skopje in 2014. She volunteered at the emergency dental service in Bitola from 2014 and has worked at the practice since 2016. Trained in hyaluronic fillers by Cytosial and Apriline.',
    'team.p4': 'Dr. Hristina Stojcheska', 'team.p4t': 'Doctor of dental medicine',
    'team.p4b': 'Born 1995 in Bitola. Graduated from the Faculty of Dentistry at "Goce Delchev" University in Štip in 2020. She spent two years as an intern in general dentistry, orthodontics and oral surgery practices. Part of the team since 2023.',
    'team.p5': 'Dr. Elena Vrtkovska', 'team.p5t': 'Doctor of dental medicine',
    'team.p5b': 'Born 1992 in Prilep, graduated in Skopje in 2019. She interned at the "St. Panteleimon" University Dental Clinical Centre in Skopje. Part of the team since 2023.',
    'team.edu': 'The whole team regularly attends lectures, courses and symposia — the Macedonian Dental Society, the Macedonian Implantology Association and the ESCD.',
    'tech.eyebrow': 'Equipment and safety', 'tech.title': 'Nothing is left', 'tech.title2': 'to chance.',
    'tech.lead': 'The hygiene, disinfection and sterilisation of our instruments and equipment matter equally for the health of our patients and of the team.',
    'tech.f1': 'KaVo OP 3D panoramic imaging',
    'tech.f1d': 'In use since 23 September 2021. It has programmes for every situation, including imaging for children at the lowest dose and with a limited field.',
    'tech.f2': 'MELAG B-class autoclave',
    'tech.f2d': 'Meets the most demanding sterilisation criteria and the EN 0630 and EN 867-5 directives.',
    'tech.f3': 'Three lasers',
    'tech.f3d': 'Two therapy lasers (904 nm and 658 nm) and the Sirona Sirolaser Blue for laser surgery and LABR.',
    'tech.f4': 'Single-use materials',
    'tech.f4d': 'For every patient — gloves, masks, cups, aspirators, syringes and needles. Surfaces are disinfected regularly and instruments are individually packed before sterilisation.',
    'tech.shotAlt': 'The KaVo OP 3D unit for digital panoramic imaging',
    'tech.shotCap': 'KaVo OP 3D — digital panoramic imaging of the teeth, jaws, sinuses and jaw joint.',
    'tech.shot2Alt': 'An Ivoclar curing light in the surgery',
    'tech.shot2Cap': 'Ivoclar curing light — for setting the aesthetic composite fillings.',
    'rev.eyebrow': 'What patients say', 'rev.title': '4.9 out of 5', 'rev.title2': 'on Google.',
    'rev.link': 'Read the reviews on Google', 'rev.fine': 'Rated 4.9 from 31 reviews on Google, October 2026.',
    'c.eyebrow': 'Where we are', 'c.title': 'In the centre', 'c.title2': 'of Bitola.',
    'c.mapBtn': 'Show the map',
    'c.addr': '54-1/1 Filip Vtori Makedonski St, 7000 Bitola',
    'c.addrNote': 'Formerly Ivan Milutinovikj St. Right next to the "Javor" department store, in the passage towards the city market, near "Crven Krst".',
    'c.directions': 'Directions on Google Maps',
    'c.hoursTitle': 'Opening hours', 'c.rotaTitle': 'Rota by doctor',
    'c.rotaNote': 'The rota alternates week by week. Check which doctor will see you when you book.',
    'c.rota1': '1st and 3rd week 12:00–19:00 · 2nd and 4th week 09:00–16:00',
    'c.rota2': '1st and 3rd week 09:00–16:00 · 2nd and 4th week 12:00–19:00',
    'c.rota3': '1st and 3rd week 09:00–16:00 · 2nd and 4th week 12:00–19:00',
    'c.rota4': '1st and 3rd week 16:00–20:00 · 2nd and 4th week 08:00–12:00',
    'c.urgent': 'In an emergency we can see you at any time.',
    'c.callTitle': 'Phone', 'c.forBooking': 'for appointments', 'c.viber': 'Viber · 070 395 362',
    'c.mailTitle': 'E-mail and social', 'c.pay': 'Payment in cash, by Visa and Mastercard.',
    'f.title': 'A 30-minute check-up,', 'f.title2': 'when it suits you.',
    'f.lead': 'Leave your name and phone — we will call you to confirm the appointment.',
    'f.book': 'Book a check-up',
    'footer.aria': 'Footer', 'footer.legal': 'The content of this site is informative and does not replace a dental examination.',
    'mbar.call': 'Call', 'mbar.book': 'Book a check-up',
    'bk.kicker': 'Check-up · 30 minutes', 'bk.close': 'Close',
    'bk.s1': 'Time', 'bk.s2': 'Details', 'bk.s3': 'Confirm',
    'bk.prevMonth': 'Previous month', 'bk.nextMonth': 'Next month', 'bk.pickDayAria': 'Choose a day',
    'bk.name': 'Full name', 'bk.req': 'required', 'bk.phone': 'Phone', 'bk.email': 'E-mail',
    'bk.optional': 'optional', 'bk.note': 'Reason for the visit',
    'bk.notePh': 'For example: pain in the lower left tooth',
    'bk.first': 'This is my first visit to you',
    'bk.hint': 'This is a request, not a confirmation. We will call you to confirm the appointment.',
    'bk.sendSms': 'Send by SMS', 'bk.sendViber': 'Send on Viber', 'bk.sendMail': 'Send by e-mail',
    'bk.ics': 'Add to calendar', 'bk.call': 'Call us', 'bk.editBack': '← Back — change the request',
    'bk.back': 'Back'
  };

  var EL = {
    'skip': 'Μετάβαση στο περιεχόμενο',
    'brand.aria': 'Δρ. Νετσακόφσκι — αρχική',
    'brand.sub': 'Οδοντιατρείο · Μπίτολα',
    'nav.aria': 'Κύριο μενού', 'nav.services': 'Υπηρεσίες', 'nav.team': 'Ομάδα', 'nav.tech': 'Τεχνολογία',
    'nav.reviews': 'Κριτικές', 'nav.contact': 'Επικοινωνία', 'nav.book': 'Κλείστε ραντεβού',
    'lang.aria': 'Γλώσσα', 'menu.label': 'Μενού',
    'hero.eyebrow': 'Οικογενειακό οδοντιατρείο από το 1993',
    'hero.title1': 'Τριάντα τρία χρόνια', 'hero.title2': 'φροντίδας για το χαμόγελό σας.',
    'hero.lead': 'Προσθετική, εμφυτεύματα, αισθητική οδοντιατρική και θεραπεία με laser στο κέντρο της Μπίτολα — με ψηφιακή πανοραμική ακτινογραφία και τα αυστηρότερα πρωτόκολλα αποστείρωσης.',
    'hero.stat1': 'Χρόνια εμπειρίας', 'hero.stat2': 'Βαθμολογία στο Google', 'hero.stat3': 'Οδοντιατρικές υπηρεσίες',
    'hero.starsAria': '4,9 στα 5 αστέρια',
    'hero.proof': '<strong>4,9</strong> στο Google από <strong>31</strong> κριτικές',
    'quick.badge': 'Ηλεκτρονικό ραντεβού', 'quick.title': 'Κλείστε ραντεβού',
    'quick.text': 'Η εξέταση διαρκεί <strong>30 λεπτά</strong>. Επιλέξτε ημέρα και ώρα, αφήστε όνομα και τηλέφωνο — θα σας καλέσουμε για επιβεβαίωση.',
    'quick.p1': '30 λεπτά, Δευτέρα έως Παρασκευή', 'quick.p2': 'Χρειάζονται μόνο όνομα και τηλέφωνο',
    'quick.p3': 'Μιλάμε αγγλικά, ελληνικά και γερμανικά',
    'quick.cta': 'Επιλέξτε ώρα', 'quick.call': 'ή καλέστε στο 075 306 509',
    'band.aria': 'Το οδοντιατρείο σε αριθμούς',
    'band.1': 'Έτος ίδρυσης', 'band.2': 'Βαθμολογία στο Google', 'band.3': 'Κριτικές ασθενών', 'band.4': 'Γιατροί στην ομάδα',
    'band.foot': 'Ιδρύθηκε από τον Δρ. Κύριλ Νετσακόφσκι. Υποψήφιο για το βραβείο TOP-100 Achievements 2020 του Achievements Forum, Ηνωμένο Βασίλειο, στην κατηγορία υγείας.',
    'sv.eyebrow': 'Τι κάνουμε', 'sv.title': 'Πλήρης οδοντιατρική φροντίδα', 'sv.title2': 'σε έναν χώρο.',
    'sv.lead': 'Επιλέξτε κατηγορία, ή κλείστε ραντεβού και θα αποφασίσουμε μαζί τι χρειάζεστε.',
    'sv.cats': 'Κατηγορίες υπηρεσιών', 'sv.empty': 'Δεν υπάρχουν υπηρεσίες σε αυτή την κατηγορία.',
    'cat.all': 'Όλες', 'cat.general': 'Γενική', 'cat.prosthetics': 'Προσθετική', 'cat.aesthetic': 'Αισθητική',
    'cat.children': 'Παιδική', 'cat.perio': 'Περιοδοντολογία & laser', 'cat.xray': 'Ακτινογραφία',
    's.book': 'Κλείστε ραντεβού',
    's.plombi': 'Σφραγίσματα', 's.plombi.d': 'Αισθητικά νανο-σύνθετα, μικροϋβριδικά και υαλοϊονομερή σφραγίσματα.',
    's.lekuvanje': 'Θεραπεία δοντιών', 's.lekuvanje.d': 'Αντιμετώπιση τερηδόνας και πάσχοντων δοντιών, με διατήρηση του υγιούς ιστού.',
    's.endodoncija': 'Απονεύρωση', 's.endodoncija.d': 'Ενδοδοντική θεραπεία των ριζικών σωλήνων.',
    's.ekstrakcii': 'Εξαγωγές', 's.ekstrakcii.d': 'Εξαγωγές και βασική στοματική χειρουργική με τοπική αναισθησία.',
    's.kamenec': 'Αφαίρεση πέτρας', 's.kamenec.d': 'Αφαίρεση οδοντικής πέτρας με υπερήχους.',
    's.polirawe': 'Στίλβωση', 's.polirawe.d': 'Αφαίρεση μαλακών επικαθίσεων με στίλβωση.',
    's.fluor': 'Προστασία με φθόριο', 's.fluor.d': 'Προστασία των δοντιών από την τερηδόνα με σκευάσματα φθορίου.',
    's.metalkeramika': 'Μεταλλοκεραμικές στεφάνες και γέφυρες', 's.metalkeramika.d': 'Πορσελάνινες εργασίες σε μεταλλική βάση.',
    's.bezmetalni': 'Ολοκεραμικές εργασίες', 's.bezmetalni.d': 'Στεφάνες, γέφυρες, ένθετα, επένθετα και όψεις για την υψηλότερη αισθητική.',
    's.blagorodni': 'Εργασίες με ευγενή κράματα', 's.blagorodni.d': 'Μεταλλοκεραμική σε βάση χρυσού και λευκόχρυσου.',
    's.implanti': 'Εμφυτεύματα', 's.implanti.d': 'Σχεδιασμός και προσθετική αποκατάσταση. Πιστοποίηση για Straumann, BioHorizons και Impla Schütz Dental.',
    's.metalkompozit': 'Μεταλλοσύνθετες εργασίες', 's.metalkompozit.d': 'Χυτές επενδεδυμένες κλασικές στεφάνες και γέφυρες.',
    's.akrilatni': 'Ακρυλικές οδοντοστοιχίες', 's.akrilatni.d': 'Κλασικές μερικές και ολικές οδοντοστοιχίες.',
    's.skeletirani': 'Σκελετωτές οδοντοστοιχίες', 's.skeletirani.d': 'Οδοντοστοιχίες με μεταλλικό σκελετό και συνδέσμους ακριβείας.',
    's.nadogradbi': 'Χυτοί άξονες', 's.nadogradbi.d': 'Αποκατάσταση πολύ κατεστραμμένων δοντιών πριν από στεφάνη.',
    's.fiberglas': 'Άξονες υαλονημάτων', 's.fiberglas.d': 'Αποκατάσταση δοντιών με άξονες υαλονημάτων.',
    's.viniri': 'Όψεις και laminates', 's.viniri.d': 'Από πορσελάνη ή σύνθετη ρητίνη, για δόντια με αλλοιωμένο χρώμα, σχήμα ή θέση.',
    's.belenje': 'Λεύκανση δοντιών', 's.belenje.d': 'Λεύκανση υπό την επίβλεψη οδοντιάτρου.',
    's.dijastema': 'Κλείσιμο διαστήματος', 's.dijastema.d': 'Αντιμετώπιση του κενού ανάμεσα στα μπροστινά δόντια.',
    's.fileri': 'Υαλουρονικά fillers', 's.fileri.d': 'Αισθητική προσώπου με Cytosial και Apriline, από εκπαιδευμένο γιατρό.',
    's.mlecniplombi': 'Σφραγίσματα νεογιλών δοντιών', 's.mlecniplombi.d': 'Νεογιλά και νεαρά μόνιμα δόντια.',
    's.mlecnilek': 'Θεραπεία νεογιλών δοντιών', 's.mlecnilek.d': 'Αντιμετώπιση νεογιλών και νεαρών μόνιμων δοντιών.',
    's.prevencija': 'Πρόληψη με φθόριο', 's.prevencija.d': 'Σχεδιασμός και παρακολούθηση της πρόληψης της τερηδόνας.',
    's.zalevanje': 'Σφράγιση οπών και σχισμών', 's.zalevanje.d': 'Προστασία των αυλάκων στα δόντια των παιδιών.',
    's.gingivitis': 'Θεραπεία ουλίτιδας', 's.gingivitis.d': 'Συντηρητική θεραπεία της φλεγμονής των ούλων.',
    's.parodontopatija': 'Θεραπεία περιοδοντίτιδας', 's.parodontopatija.d': 'Συντηρητική θεραπεία και υποβοήθηση με laser.',
    's.labr': 'Μείωση βακτηρίων με laser (LABR)', 's.labr.d': 'Laser Assisted Bacterial Reduction στη θεραπεία της περιοδοντίτιδας.',
    's.alveolitis': 'Θεραπεία φατνιίτιδας', 's.alveolitis.d': 'Θεραπεία με laser για επιπλοκές μετά από εξαγωγή.',
    's.periapikalni': 'Περιακρορριζικές βλάβες', 's.periapikalni.d': 'Θεραπεία με laser για φλεγμονές πάνω από τη ρίζα του δοντιού.',
    's.laserhirurgija': 'Χειρουργική με laser', 's.laserhirurgija.d': 'Με το Sirona Sirolaser Blue.',
    's.lllt': 'Θεραπεία με laser (LLLT)', 's.lllt.d': 'Με δύο laser — 904 nm και 658 nm.',
    's.panoramsko': 'Ψηφιακή πανοραμική ακτινογραφία', 's.panoramsko.d': 'Με το KaVo OP 3D — δόντια, γνάθοι, ιγμόρεια και κροταφογναθική άρθρωση, με την ελάχιστη δόση.',
    's.periapikalnisnimki': 'Ψηφιακές περιακρορριζικές ακτινογραφίες', 's.periapikalnisnimki.d': 'Λήψεις μεμονωμένων δοντιών κατά τη διάρκεια της θεραπείας.',
    'team.eyebrow': 'Ποιος σας περιμένει', 'team.title': 'Οι γιατροί', 'team.title2': 'και η ομάδα.',
    'team.photoAlt': 'Η ομάδα του οδοντιατρείου Δρ. Νετσακόφσκι στο ιατρείο, 2025',
    'team.photoCap': 'Η ομάδα του ιατρείου, 2025.',
    'team.founder': 'Ιδρυτής', 'team.doctor': 'Γιατρός',
    'team.p1': 'Δρ. Κύριλ Νετσακόφσκι', 'team.p1t': 'Ειδικός στην οδοντιατρική προσθετική',
    'team.p1b': 'Γεννήθηκε το 1948 στο Τσαπάρι. Αποφοίτησε από την Οδοντιατρική Σχολή των Σκοπίων το 1974 και ειδικεύτηκε στην προσθετική το 1986. Έως το 1993 εργάστηκε στο Ιατρικό Κέντρο «Δρ. Τρίφουν Πάνοφσκι» στη Μπίτολα· το 1993 ίδρυσε αυτό το ιατρείο, όπου εργάστηκε μέχρι τη συνταξιοδότησή του το 2021.',
    'team.p2': 'Δρ. Αλεξάνταρ Νετσακόφσκι', 'team.p2t': 'Ειδικός στην οδοντιατρική προσθετική',
    'team.p2b': 'Γεννήθηκε το 1977 στη Μπίτολα, αποφοίτησε στα Σκόπια το 2002 και ειδικεύτηκε στην προσθετική το 2008–2011. Μέλος της Ευρωπαϊκής Εταιρείας Αισθητικής Οδοντιατρικής (ESCD) από το 2017. Πιστοποιημένος για τα συστήματα εμφυτευμάτων Impla Schütz Dental, Straumann και BioHorizons. Το 2020–2021 παρακολούθησε πρακτική εκπαίδευση στην Ουάσιγκτον των ΗΠΑ.',
    'team.lang': 'Αγγλικά · Ελληνικά · Γερμανικά',
    'team.p3': 'Δρ. Έβα Αναστάσοβα', 'team.p3t': 'Οδοντίατρος',
    'team.p3b': 'Γεννήθηκε το 1990 στη Μπίτολα, αποφοίτησε στα Σκόπια το 2014. Από το 2014 προσέφερε εθελοντικά στην επείγουσα οδοντιατρική υπηρεσία της Μπίτολα και από το 2016 εργάζεται στο ιατρείο. Εκπαιδευμένη στα υαλουρονικά fillers από τις Cytosial και Apriline.',
    'team.p4': 'Δρ. Χριστίνα Στόιτσεσκα', 'team.p4t': 'Οδοντίατρος',
    'team.p4b': 'Γεννήθηκε το 1995 στη Μπίτολα. Αποφοίτησε από την Οδοντιατρική Σχολή του Πανεπιστημίου «Γκότσε Ντέλτσεφ» στο Στιπ το 2020. Εργάστηκε δύο χρόνια ως ασκούμενη σε ιατρεία γενικής οδοντιατρικής, ορθοδοντικής και στοματικής χειρουργικής. Μέλος της ομάδας από το 2023.',
    'team.p5': 'Δρ. Έλενα Βρτκόφσκα', 'team.p5t': 'Οδοντίατρος',
    'team.p5b': 'Γεννήθηκε το 1992 στον Πρίλεπ, αποφοίτησε στα Σκόπια το 2019. Εργάστηκε ως ασκούμενη στο Πανεπιστημιακό Οδοντιατρικό Κέντρο «Άγιος Παντελεήμων» στα Σκόπια. Μέλος της ομάδας από το 2023.',
    'team.edu': 'Όλη η ομάδα παρακολουθεί τακτικά διαλέξεις, σεμινάρια και συνέδρια — της Οδοντιατρικής Εταιρείας Μακεδονίας, του Συνδέσμου Εμφυτευματολογίας και της ESCD.',
    'tech.eyebrow': 'Εξοπλισμός και ασφάλεια', 'tech.title': 'Τίποτα δεν αφήνεται', 'tech.title2': 'στην τύχη.',
    'tech.lead': 'Η υγιεινή, η απολύμανση και η αποστείρωση των εργαλείων και του εξοπλισμού έχουν την ίδια σημασία για την υγεία των ασθενών και της ομάδας.',
    'tech.f1': 'Πανοραμική ακτινογραφία KaVo OP 3D',
    'tech.f1d': 'Σε χρήση από τις 23 Σεπτεμβρίου 2021. Διαθέτει προγράμματα για κάθε περίπτωση, όπως λήψεις σε παιδιά με την ελάχιστη δόση και περιορισμένο πεδίο.',
    'tech.f2': 'Αυτόκαυστο MELAG κατηγορίας B',
    'tech.f2d': 'Πληροί τα αυστηρότερα κριτήρια αποστείρωσης και τις οδηγίες EN 0630 και EN 867-5.',
    'tech.f3': 'Τρία laser',
    'tech.f3d': 'Δύο θεραπευτικά laser (904 nm και 658 nm) και το Sirona Sirolaser Blue για χειρουργική με laser και LABR.',
    'tech.f4': 'Υλικά μίας χρήσης',
    'tech.f4d': 'Για κάθε ασθενή — γάντια, μάσκες, ποτήρια, αναρροφητήρες, σύριγγες και βελόνες. Οι επιφάνειες απολυμαίνονται τακτικά και τα εργαλεία συσκευάζονται ξεχωριστά πριν την αποστείρωση.',
    'tech.shotAlt': 'Το μηχάνημα KaVo OP 3D για ψηφιακή πανοραμική ακτινογραφία',
    'tech.shotCap': 'KaVo OP 3D — ψηφιακή πανοραμική απεικόνιση δοντιών, γνάθων, ιγμορείων και κροταφογναθικής άρθρωσης.',
    'tech.shot2Alt': 'Λάμπα πολυμερισμού Ivoclar στο ιατρείο',
    'tech.shot2Cap': 'Λάμπα πολυμερισμού Ivoclar — για τον πολυμερισμό των αισθητικών σύνθετων εμφράξεων.',
    'rev.eyebrow': 'Τι λένε οι ασθενείς', 'rev.title': '4,9 στα 5', 'rev.title2': 'στο Google.',
    'rev.link': 'Διαβάστε τις κριτικές στο Google', 'rev.fine': 'Βαθμολογία 4,9 από 31 κριτικές στο Google, Οκτώβριος 2026.',
    'c.eyebrow': 'Πού βρισκόμαστε', 'c.title': 'Στο κέντρο', 'c.title2': 'της Μπίτολα.',
    'c.mapBtn': 'Εμφάνιση χάρτη',
    'c.addr': 'Οδός Φίλιππος Β΄ ο Μακεδών 54-1/1, 7000 Μπίτολα',
    'c.addrNote': 'Πρώην οδός Ίβαν Μιλουτίνοβιτς. Ακριβώς δίπλα στο πολυκατάστημα «Γιάβορ», στο πέρασμα προς τη δημοτική αγορά, κοντά στον «Ερυθρό Σταυρό».',
    'c.directions': 'Οδηγίες στο Google Maps',
    'c.hoursTitle': 'Ωράριο', 'c.rotaTitle': 'Πρόγραμμα ανά γιατρό',
    'c.rotaNote': 'Το πρόγραμμα εναλλάσσεται ανά εβδομάδα. Ρωτήστε κατά την κράτηση ποιος γιατρός θα σας δει.',
    'c.rota1': '1η και 3η εβδομάδα 12:00–19:00 · 2η και 4η εβδομάδα 09:00–16:00',
    'c.rota2': '1η και 3η εβδομάδα 09:00–16:00 · 2η και 4η εβδομάδα 12:00–19:00',
    'c.rota3': '1η και 3η εβδομάδα 09:00–16:00 · 2η και 4η εβδομάδα 12:00–19:00',
    'c.rota4': '1η και 3η εβδομάδα 16:00–20:00 · 2η και 4η εβδομάδα 08:00–12:00',
    'c.urgent': 'Σε επείγουσα ανάγκη μπορούμε να σας δούμε οποιαδήποτε στιγμή.',
    'c.callTitle': 'Τηλέφωνο', 'c.forBooking': 'για ραντεβού', 'c.viber': 'Viber · 070 395 362',
    'c.mailTitle': 'E-mail και δίκτυα', 'c.pay': 'Πληρωμή με μετρητά, Visa και Mastercard.',
    'f.title': 'Εξέταση 30 λεπτών,', 'f.title2': 'όποτε σας βολεύει.',
    'f.lead': 'Αφήστε όνομα και τηλέφωνο — θα σας καλέσουμε για να επιβεβαιώσουμε το ραντεβού.',
    'f.book': 'Κλείστε ραντεβού',
    'footer.aria': 'Υποσέλιδο', 'footer.legal': 'Το περιεχόμενο του ιστότοπου είναι ενημερωτικό και δεν αντικαθιστά την οδοντιατρική εξέταση.',
    'mbar.call': 'Κλήση', 'mbar.book': 'Κλείστε ραντεβού',
    'bk.kicker': 'Εξέταση · 30 λεπτά', 'bk.close': 'Κλείσιμο',
    'bk.s1': 'Ώρα', 'bk.s2': 'Στοιχεία', 'bk.s3': 'Επιβεβαίωση',
    'bk.prevMonth': 'Προηγούμενος μήνας', 'bk.nextMonth': 'Επόμενος μήνας', 'bk.pickDayAria': 'Επιλέξτε ημέρα',
    'bk.name': 'Ονοματεπώνυμο', 'bk.req': 'υποχρεωτικό', 'bk.phone': 'Τηλέφωνο', 'bk.email': 'E-mail',
    'bk.optional': 'προαιρετικό', 'bk.note': 'Λόγος επίσκεψης',
    'bk.notePh': 'Για παράδειγμα: πόνος στο κάτω αριστερό δόντι',
    'bk.first': 'Είναι η πρώτη μου επίσκεψη σε εσάς',
    'bk.hint': 'Αυτό είναι αίτημα, όχι επιβεβαίωση. Θα σας καλέσουμε για να επιβεβαιώσουμε το ραντεβού.',
    'bk.sendSms': 'Αποστολή με SMS', 'bk.sendViber': 'Αποστολή στο Viber', 'bk.sendMail': 'Αποστολή με e-mail',
    'bk.ics': 'Προσθήκη στο ημερολόγιο', 'bk.call': 'Καλέστε μας', 'bk.editBack': '← Πίσω — αλλαγή αιτήματος',
    'bk.back': 'Πίσω'
  };

  var DICT = { en: EN, el: EL };

  /* strings built in code rather than present in the markup */
  var TEXT = {
    mk: {
      'meta.title': 'Д-р Нечаковски — стоматолошка ординација во Битола од 1993',
      'status.open': 'Отворено сега · до {t}',
      'status.today': 'Отвораме денес во {t}',
      'status.tomorrow': 'Отвораме утре во {t}',
      'status.monday': 'Отвораме во понеделник во {t}',
      'map.title': 'Мапа со локацијата на ординацијата',
      'sv.all': 'Прикажи ги сите услуги', 'sv.less': 'Прикажи помалку',
      'hours.weekdays': 'Понеделник – петок', 'hours.weekend': 'Сабота – недела', 'hours.closed': 'Затворено',
      'bk.t1': 'Изберете ден и час', 'bk.t2': 'Вашите податоци', 'bk.t3': 'Потврдете го барањето',
      'bk.tDone': 'Барањето е подготвено',
      'bk.continue': 'Продолжи', 'bk.review': 'Прегледај',
      'bk.pickDay': 'Изберете ден од календарот.',
      'bk.noSlots': 'Нема слободни термини тој ден.',
      'bk.morning': 'Претпладне', 'bk.afternoon': 'Попладне',
      'bk.errName': 'Внесете го вашето име и презиме.',
      'bk.errPhone': 'Внесете валиден телефонски број.',
      'bk.errEmail': 'Проверете ја е-поштата или оставете го полето празно.',
      'bk.sWhen': 'Термин', 'bk.sName': 'Име', 'bk.sPhone': 'Телефон', 'bk.sEmail': 'Е-пошта',
      'bk.sNote': 'Причина', 'bk.sFirst': 'Прва посета', 'bk.sWhat': 'Услуга', 'bk.yes': 'Да',
      'bk.what': 'Преглед (30 мин.)',
      'bk.msgTitle': 'Барање за термин — преглед 30 минути',
      'bk.doneSms': 'Отворивме порака со сите податоци. Испратете ја и ќе ви се јавиме за да го потврдиме терминот.',
      'bk.doneViber': 'Барањето е копирано. Залепете го во Viber и испратете го — ќе ви се јавиме за да го потврдиме терминот.',
      'bk.doneEmail': 'Отворивме е-порака со сите податоци. Испратете ја и ќе ви се јавиме за да го потврдиме терминот.',
      'bk.icsTitle': 'Стоматолошки преглед — Д-р Нечаковски',
      'bk.icsPlace': 'ул. Филип Втори Македонски 54-1/1, Битола',
      'bk.icsNote': 'Побаран термин. Ординацијата ќе се јави за потврда. Тел. 075 306 509.'
    },
    en: {
      'meta.title': 'Dr. Nechakovski — dental practice in Bitola since 1993',
      'status.open': 'Open now · until {t}',
      'status.today': 'We open today at {t}',
      'status.tomorrow': 'We open tomorrow at {t}',
      'status.monday': 'We open on Monday at {t}',
      'map.title': 'Map showing the location of the practice',
      'sv.all': 'Show all services', 'sv.less': 'Show fewer',
      'hours.weekdays': 'Monday – Friday', 'hours.weekend': 'Saturday – Sunday', 'hours.closed': 'Closed',
      'bk.t1': 'Choose a day and a time', 'bk.t2': 'Your details', 'bk.t3': 'Confirm your request',
      'bk.tDone': 'Your request is ready',
      'bk.continue': 'Continue', 'bk.review': 'Review',
      'bk.pickDay': 'Pick a day from the calendar.',
      'bk.noSlots': 'No times left on that day.',
      'bk.morning': 'Morning', 'bk.afternoon': 'Afternoon',
      'bk.errName': 'Please enter your full name.',
      'bk.errPhone': 'Please enter a valid phone number.',
      'bk.errEmail': 'Please check the e-mail address or leave the field empty.',
      'bk.sWhen': 'Appointment', 'bk.sName': 'Name', 'bk.sPhone': 'Phone', 'bk.sEmail': 'E-mail',
      'bk.sNote': 'Reason', 'bk.sFirst': 'First visit', 'bk.sWhat': 'Service', 'bk.yes': 'Yes',
      'bk.what': 'Check-up (30 min)',
      'bk.msgTitle': 'Appointment request — 30-minute check-up',
      'bk.doneSms': 'We have opened a message with all the details. Send it and we will call you to confirm the appointment.',
      'bk.doneViber': 'The request has been copied. Paste it into Viber and send it — we will call you to confirm the appointment.',
      'bk.doneEmail': 'We have opened an e-mail with all the details. Send it and we will call you to confirm the appointment.',
      'bk.icsTitle': 'Dental check-up — Dr. Nechakovski',
      'bk.icsPlace': '54-1/1 Filip Vtori Makedonski St, Bitola',
      'bk.icsNote': 'Requested appointment. The practice will call to confirm. Tel. +389 75 306 509.'
    },
    el: {
      'meta.title': 'Δρ. Νετσακόφσκι — οδοντιατρείο στη Μπίτολα από το 1993',
      'status.open': 'Ανοιχτά τώρα · έως {t}',
      'status.today': 'Ανοίγουμε σήμερα στις {t}',
      'status.tomorrow': 'Ανοίγουμε αύριο στις {t}',
      'status.monday': 'Ανοίγουμε τη Δευτέρα στις {t}',
      'map.title': 'Χάρτης με την τοποθεσία του ιατρείου',
      'sv.all': 'Δείτε όλες τις υπηρεσίες', 'sv.less': 'Δείτε λιγότερες',
      'hours.weekdays': 'Δευτέρα – Παρασκευή', 'hours.weekend': 'Σάββατο – Κυριακή', 'hours.closed': 'Κλειστά',
      'bk.t1': 'Επιλέξτε ημέρα και ώρα', 'bk.t2': 'Τα στοιχεία σας', 'bk.t3': 'Επιβεβαιώστε το αίτημα',
      'bk.tDone': 'Το αίτημά σας είναι έτοιμο',
      'bk.continue': 'Συνέχεια', 'bk.review': 'Έλεγχος',
      'bk.pickDay': 'Επιλέξτε ημέρα από το ημερολόγιο.',
      'bk.noSlots': 'Δεν υπάρχουν διαθέσιμες ώρες εκείνη την ημέρα.',
      'bk.morning': 'Πρωί', 'bk.afternoon': 'Απόγευμα',
      'bk.errName': 'Συμπληρώστε το ονοματεπώνυμό σας.',
      'bk.errPhone': 'Συμπληρώστε έγκυρο αριθμό τηλεφώνου.',
      'bk.errEmail': 'Ελέγξτε το e-mail ή αφήστε το πεδίο κενό.',
      'bk.sWhen': 'Ραντεβού', 'bk.sName': 'Όνομα', 'bk.sPhone': 'Τηλέφωνο', 'bk.sEmail': 'E-mail',
      'bk.sNote': 'Λόγος', 'bk.sFirst': 'Πρώτη επίσκεψη', 'bk.sWhat': 'Υπηρεσία', 'bk.yes': 'Ναι',
      'bk.what': 'Εξέταση (30 λεπτά)',
      'bk.msgTitle': 'Αίτημα ραντεβού — εξέταση 30 λεπτών',
      'bk.doneSms': 'Ανοίξαμε μήνυμα με όλα τα στοιχεία. Στείλτε το και θα σας καλέσουμε για επιβεβαίωση.',
      'bk.doneViber': 'Το αίτημα αντιγράφηκε. Επικολλήστε το στο Viber και στείλτε το — θα σας καλέσουμε για επιβεβαίωση.',
      'bk.doneEmail': 'Ανοίξαμε e-mail με όλα τα στοιχεία. Στείλτε το και θα σας καλέσουμε για επιβεβαίωση.',
      'bk.icsTitle': 'Οδοντιατρική εξέταση — Δρ. Νετσακόφσκι',
      'bk.icsPlace': 'Οδός Φίλιππος Β΄ ο Μακεδών 54-1/1, Μπίτολα',
      'bk.icsNote': 'Αιτούμενο ραντεβού. Το ιατρείο θα τηλεφωνήσει για επιβεβαίωση. Τηλ. +389 75 306 509.'
    }
  };

  // Chrome's Intl has no Macedonian, so dates are spelled out by hand in all three languages
  var MONTHS = {
    mk: ['јануари', 'февруари', 'март', 'април', 'мај', 'јуни', 'јули', 'август', 'септември', 'октомври', 'ноември', 'декември'],
    en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    el: ['Ιανουαρίου', 'Φεβρουαρίου', 'Μαρτίου', 'Απριλίου', 'Μαΐου', 'Ιουνίου', 'Ιουλίου', 'Αυγούστου', 'Σεπτεμβρίου', 'Οκτωβρίου', 'Νοεμβρίου', 'Δεκεμβρίου']
  };
  var MONTHS_SHORT = {
    mk: ['јан', 'фев', 'мар', 'апр', 'мај', 'јун', 'јул', 'авг', 'сеп', 'окт', 'ное', 'дек'],
    en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    el: ['Ιαν', 'Φεβ', 'Μαρ', 'Απρ', 'Μαΐ', 'Ιουν', 'Ιουλ', 'Αυγ', 'Σεπ', 'Οκτ', 'Νοε', 'Δεκ']
  };
  var DAYS = { // Monday first
    mk: ['понеделник', 'вторник', 'среда', 'четврток', 'петок', 'сабота', 'недела'],
    en: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    el: ['Δευτέρα', 'Τρίτη', 'Τετάρτη', 'Πέμπτη', 'Παρασκευή', 'Σάββατο', 'Κυριακή']
  };
  var DAYS_SHORT = {
    mk: ['пон', 'вто', 'сре', 'чет', 'пет', 'саб', 'нед'],
    en: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    el: ['Δευ', 'Τρί', 'Τετ', 'Πέμ', 'Παρ', 'Σάβ', 'Κυρ']
  };

  /* ===================== i18n engine ===================== */

  var lang = 'mk';
  var t = function (key) { return (TEXT[lang] && TEXT[lang][key]) || TEXT.mk[key] || key; };
  var originals = new Map();

  function captureOriginals() {
    $$('[data-i18n]').forEach(function (node) { originals.set(node, { html: node.innerHTML, attrs: {} }); });
    $$('[data-i18n-attr]').forEach(function (node) {
      var entry = originals.get(node) || { attrs: {} };
      if (!entry.attrs) entry.attrs = {};
      node.dataset.i18nAttr.split('|').forEach(function (pair) {
        var attr = pair.split(':')[0];
        entry.attrs[attr] = node.getAttribute(attr);
      });
      originals.set(node, entry);
    });
  }

  function applyLanguage(next) {
    lang = ['mk', 'en', 'el'].indexOf(next) > -1 ? next : 'mk';
    var dict = DICT[lang];                       // undefined for mk — the markup is the source
    document.documentElement.lang = lang;
    document.title = t('meta.title');

    $$('[data-i18n]').forEach(function (node) {
      var key = node.dataset.i18n;
      var entry = originals.get(node);
      node.innerHTML = dict && dict[key] !== undefined ? dict[key] : (entry ? entry.html : node.innerHTML);
    });
    $$('[data-i18n-attr]').forEach(function (node) {
      var entry = originals.get(node);
      node.dataset.i18nAttr.split('|').forEach(function (pair) {
        var bits = pair.split(':');
        var attr = bits[0];
        var key = bits[1];
        var value = dict && dict[key] !== undefined ? dict[key] : (entry && entry.attrs ? entry.attrs[attr] : null);
        if (value != null) node.setAttribute(attr, value);
      });
    });

    $$('[data-lang]').forEach(function (btn) {
      btn.setAttribute('aria-pressed', String(btn.dataset.lang === lang));
    });
    $$('[data-num]').forEach(function (node) {
      if (node.dataset.counted !== 'pending') showNumber(node, Number(node.dataset.num));
    });
    renderHours();
    renderServices();
    updateStatus();
    if (dialog && dialog.open) renderBooking();
    try { localStorage.setItem('nd-lang', lang); } catch (e) { /* storage blocked */ }
  }

  /* ===================== numbers ===================== */

  function showNumber(node, value) {
    var decimals = Number(node.dataset.decimals || 0);
    var text = value.toFixed(decimals);
    if (lang !== 'en') text = text.replace('.', ',');   // MK and EL use the decimal comma
    node.textContent = text + (node.dataset.suffix || '');
  }

  function countUp(node) {
    var target = Number(node.dataset.num);
    node.dataset.counted = 'done';
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { showNumber(node, target); return; }
    var start = null;
    var span = 900;
    function frame(now) {
      if (start === null) start = now;
      var p = Math.min((now - start) / span, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      showNumber(node, target * eased);
      if (p < 1) requestAnimationFrame(frame); else showNumber(node, target);
    }
    requestAnimationFrame(frame);
  }

  /* ===================== dates, pinned to Europe/Skopje ===================== */

  function skopje(date) {
    var parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/Skopje', year: 'numeric', month: '2-digit', day: '2-digit',
      weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
    }).formatToParts(date || new Date());
    var get = function (type) { var p = parts.find(function (x) { return x.type === type; }); return p ? p.value : ''; };
    return {
      y: Number(get('year')), m: Number(get('month')), d: Number(get('day')),
      dow: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].indexOf(get('weekday')), // 0 = Monday
      minutes: Number(get('hour')) * 60 + Number(get('minute'))
    };
  }

  var pad = function (n) { return n < 10 ? '0' + n : String(n); };
  var dateKey = function (y, m, d) { return y + '-' + pad(m) + '-' + pad(d); };
  var parseKey = function (key) { return key.split('-').map(Number); };
  var utc = function (y, m, d) { return Date.UTC(y, m - 1, d); };
  var weekday = function (y, m, d) { return (new Date(utc(y, m, d)).getUTCDay() + 6) % 7; }; // 0 = Monday
  function addDays(y, m, d, n) {
    var dt = new Date(utc(y, m, d) + n * 86400000);
    return [dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate()];
  }
  var daysInMonth = function (y, m) { return new Date(utc(y, m + 1, 0)).getUTCDate(); };
  var clock = function (mins) { return pad(Math.floor(mins / 60)) + ':' + pad(mins % 60); };
  function longDate(key) {
    var p = parseKey(key);
    return DAYS[lang][weekday(p[0], p[1], p[2])] + ', ' + p[2] + ' ' + MONTHS[lang][p[1] - 1] + ' ' + p[0];
  }
  function shortDate(key) {
    var p = parseKey(key);
    return DAYS_SHORT[lang][weekday(p[0], p[1], p[2])] + ', ' + p[2] + ' ' + MONTHS_SHORT[lang][p[1] - 1];
  }

  /* ===================== opening hours ===================== */

  function renderHours() {
    // derived from OPEN so the table, the status line and the slot grid cannot drift apart
    var box = $('[data-hours]');
    if (!box) return;
    var span = OPEN.map(function (s) { return clock(s[0]) + '–' + clock(s[1]); }).join(', ');
    var rows = [
      { days: '1-5', label: t('hours.weekdays'), value: span },
      { days: '6-0', label: t('hours.weekend'), value: t('hours.closed') }
    ];
    box.replaceChildren.apply(box, rows.map(function (row) {
      var wrap = el('div');
      wrap.dataset.days = row.days;
      wrap.append(el('dt', '', row.label), el('dd', '', row.value));
      return wrap;
    }));
  }

  function updateStatus() {
    var now = skopje();
    var weekdayOpen = now.dow >= 0 && now.dow <= 4;
    $$('[data-days]').forEach(function (cell) {
      cell.classList.toggle('is-today', cell.dataset.days === (weekdayOpen ? '1-5' : '6-0'));
    });
    var text = '';
    var open = false;
    if (weekdayOpen) {
      var slot = OPEN.find(function (s) { return now.minutes >= s[0] && now.minutes < s[1]; });
      var later = OPEN.find(function (s) { return now.minutes < s[0]; });
      if (slot) { open = true; text = t('status.open').replace('{t}', clock(slot[1])); }
      else if (later) text = t('status.today').replace('{t}', clock(later[0]));
    }
    // after Friday evening or at the weekend the next opening is Monday morning
    if (!text) text = t(now.dow === 4 || now.dow === 5 ? 'status.monday' : 'status.tomorrow').replace('{t}', clock(OPEN[0][0]));
    $$('[data-status]').forEach(function (node) {
      node.textContent = text;
      node.classList.toggle('is-open', open);
    });
  }

  /* ===================== slots ===================== */

  function slotTimes() {
    var out = [];
    OPEN.forEach(function (s) {
      for (var m = s[0]; m + SLOT_MINUTES <= s[1]; m += SLOT_MINUTES) {
        out.push({ group: m < SPLIT_AT ? 0 : 1, minutes: m, time: clock(m) });
      }
    });
    return out;
  }
  function slotsFor(key) {
    var now = skopje();
    var all = slotTimes();
    if (key !== dateKey(now.y, now.m, now.d)) return all;
    return all.filter(function (s) { return s.minutes >= now.minutes + LEAD_MINUTES; }); // today: at least an hour from now
  }
  function bookable(y, m, d) {
    var now = skopje();
    var key = dateKey(y, m, d);
    var today = dateKey(now.y, now.m, now.d);
    var far = addDays(now.y, now.m, now.d, BOOK_DAYS_AHEAD);
    var last = dateKey(far[0], far[1], far[2]);
    if (key < today || key > last || weekday(y, m, d) > 4) return false;
    return slotsFor(key).length > 0;
  }
  function firstBookable() {
    var now = skopje();
    for (var i = 0; i <= BOOK_DAYS_AHEAD; i++) {
      var p = addDays(now.y, now.m, now.d, i);
      if (bookable(p[0], p[1], p[2])) return dateKey(p[0], p[1], p[2]);
    }
    return null;
  }

  /* ===================== decorative arcs ===================== */

  function seeded(seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) >>> 0;
      var x = Math.imul(a ^ (a >>> 15), 1 | a);
      x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
      return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
    };
  }

  function drawArcs(svg) {
    var W = 1000;
    var H = Number(svg.dataset.h || 700);
    var rand = seeded(Number(svg.dataset.seed || 1));
    var rings = Number(svg.dataset.rings || 16);
    var cx = W * Number(svg.dataset.cx || 0.5);
    var cy = H * Number(svg.dataset.cy || 0.5);
    var max = Math.max(W, H) * 0.92;
    var d = '';
    for (var i = 0; i < rings; i++) {
      var r = max * (0.12 + (i / rings) * 0.88);
      // each ring is an open arc with its own gap, so the set reads as drawn rather than printed
      var start = rand() * Math.PI * 2;
      var sweep = Math.PI * (0.9 + rand() * 1.0);
      var x1 = cx + r * Math.cos(start);
      var y1 = cy + r * Math.sin(start) * 0.78;
      var x2 = cx + r * Math.cos(start + sweep);
      var y2 = cy + r * Math.sin(start + sweep) * 0.78;
      d += 'M' + x1.toFixed(1) + ' ' + y1.toFixed(1) +
           'A' + r.toFixed(1) + ' ' + (r * 0.78).toFixed(1) + ' 0 ' + (sweep > Math.PI ? 1 : 0) + ' 1 ' +
           x2.toFixed(1) + ' ' + y2.toFixed(1);
    }
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
    svg.setAttribute('focusable', 'false');
    var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', d);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', 'currentColor');
    path.setAttribute('stroke-width', '1');
    svg.replaceChildren(path);
  }

  /* ===================== header, menu, filters ===================== */

  var header = $('[data-header]');

  function closeMenu() {
    if (!header) return;
    header.classList.remove('is-open');
    var btn = $('[data-menu]');
    if (btn) btn.setAttribute('aria-expanded', 'false');
  }

  function setupHeader() {
    var burger = $('[data-menu]');
    if (burger) {
      burger.addEventListener('click', function () {
        var open = header.classList.toggle('is-open');
        burger.setAttribute('aria-expanded', String(open));
      });
    }
    $$('#nav-links a').forEach(function (a) { a.addEventListener('click', closeMenu); });
  }

  /* All 33 services at once buried the rest of the page, so the grid shows the
     first few of whatever is selected and the button opens the rest. The tab
     counts still describe the full category, not what is on screen. */
  var SERVICES_SHOWN = 6;
  var svFilter = 'all';
  var svExpanded = false;

  function renderServices() {
    var cards = $$('.service');
    if (!cards.length) return;
    var empty = $('[data-services-empty]');
    var more = $('[data-services-more]');
    var matched = 0;

    var filter = svFilter || 'all';   // applyLanguage can run before the var above is assigned
    cards.forEach(function (card) {
      var match = filter === 'all' || card.dataset.cat === filter;
      if (match) matched++;
      card.hidden = !match || (!svExpanded && matched > SERVICES_SHOWN);
    });

    if (empty) empty.hidden = matched > 0;
    if (more) {
      more.hidden = matched <= SERVICES_SHOWN;
      more.textContent = svExpanded ? t('sv.less') : t('sv.all') + ' (' + matched + ')';
      more.setAttribute('aria-expanded', String(svExpanded));
    }
  }

  function setupFilters() {
    var tabs = $$('[data-tabs] .tab');
    var more = $('[data-services-more]');

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        svFilter = tab.dataset.filter;
        svExpanded = false;
        tabs.forEach(function (other) { other.setAttribute('aria-pressed', String(other === tab)); });
        renderServices();
      });
    });

    if (more) {
      more.addEventListener('click', function () {
        svExpanded = !svExpanded;
        renderServices();
        // collapsing from the foot of a 33-card list would strand the viewport below the grid
        if (!svExpanded) {
          var tabsRow = $('[data-tabs]');
          if (tabsRow) tabsRow.scrollIntoView({ block: 'center' });
        }
      });
    }

    renderServices();
  }

  function setupMap() {
    var btn = $('[data-map-load]');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var box = $('[data-map]');
      var frame = document.createElement('iframe');
      frame.src = MAP_EMBED;
      frame.title = t('map.title');
      frame.loading = 'lazy';
      frame.referrerPolicy = 'no-referrer-when-downgrade';
      frame.allowFullscreen = true;
      box.append(frame);
      btn.remove();
    });
  }

  /* ===================== booking ===================== */

  var dialog = $('[data-bk]');
  var bkForm = dialog ? $('[data-pane="2"]', dialog) : null;
  var bkBody = dialog ? $('[data-bk-body]', dialog) : null;
  var state = { step: 1, date: null, time: null, note: '', viewY: 0, viewM: 0, opener: null };
  var TITLES = { 1: 'bk.t1', 2: 'bk.t2', 3: 'bk.t3', done: 'bk.tDone' };

  function details() {
    if (!bkForm) return { name: '', phone: '', email: '', note: '', first: false };
    return {
      name: bkForm.elements.fullname.value.trim(),
      phone: bkForm.elements.phone.value.trim(),
      email: bkForm.elements.email.value.trim(),
      note: bkForm.elements.note.value.trim(),
      first: bkForm.elements.first.checked
    };
  }

  var emailOk = function (v) { return v === '' || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); };

  function detailsOk() {
    var d = details();
    return d.name.length >= 2 && d.phone.replace(/\D/g, '').length >= 8 && emailOk(d.email);
  }

  function validateDetails() {
    var d = details();
    var okName = d.name.length >= 2;
    var okPhone = d.phone.replace(/\D/g, '').length >= 8;
    var okMail = emailOk(d.email);
    bkForm.elements.fullname.setAttribute('aria-invalid', String(!okName));
    bkForm.elements.phone.setAttribute('aria-invalid', String(!okPhone));
    bkForm.elements.email.setAttribute('aria-invalid', String(!okMail));
    var error = $('[data-bk-error]', dialog);
    if (okName && okPhone && okMail) { error.hidden = true; return true; }
    var field = !okName ? 'fullname' : (!okPhone ? 'phone' : 'email');
    error.textContent = t(!okName ? 'bk.errName' : (!okPhone ? 'bk.errPhone' : 'bk.errEmail'));
    error.hidden = false;
    bkForm.elements[field].focus();
    return false;
  }

  // the furthest step the visitor may jump to with what they have filled in so far
  function maxStep() {
    if (!(state.date && state.time)) return 1;
    return detailsOk() ? 3 : 2;
  }

  function summaryRows() {
    var d = details();
    var rows = [
      [t('bk.sWhat'), t('bk.what')],
      [t('bk.sWhen'), longDate(state.date) + ' · ' + state.time],
      [t('bk.sName'), d.name],
      [t('bk.sPhone'), d.phone]
    ];
    if (d.email) rows.push([t('bk.sEmail'), d.email]);
    if (d.first) rows.push([t('bk.sFirst'), t('bk.yes')]);
    if (d.note) rows.push([t('bk.sNote'), d.note]);
    return rows;
  }

  function renderSummary(target) {
    var box = $(target, dialog);
    if (!box) return;
    box.replaceChildren.apply(box, summaryRows().map(function (row) {
      var wrap = el('div');
      wrap.append(el('dt', '', row[0]), el('dd', '', row[1]));
      return wrap;
    }));
  }

  function renderCalendar() {
    var grid = $('[data-cal-grid]', dialog);
    var dow = $('[data-cal-dow]', dialog);
    if (!grid) return;
    var now = skopje();
    if (!state.viewY) { state.viewY = now.y; state.viewM = now.m; }
    var y = state.viewY;
    var m = state.viewM;

    $('[data-cal-month]', dialog).textContent = MONTHS[lang][m - 1] + ' ' + y;
    dow.replaceChildren.apply(dow, DAYS_SHORT[lang].map(function (d) { return el('span', '', d); }));

    var lead = weekday(y, m, 1);
    var nodes = [];
    for (var i = 0; i < lead; i++) nodes.push(el('span', 'cal__pad'));
    for (var d = 1; d <= daysInMonth(y, m); d++) {
      (function (day) {
        var key = dateKey(y, m, day);
        var btn = el('button', 'cal__day', String(day));
        btn.type = 'button';
        btn.disabled = !bookable(y, m, day);
        btn.setAttribute('aria-pressed', String(state.date === key));
        btn.addEventListener('click', function () {
          state.date = key;
          state.time = null;
          renderCalendar();
          renderSlots();
          updateFoot();
        });
        nodes.push(btn);
      })(d);
    }
    grid.replaceChildren.apply(grid, nodes);

    var far = addDays(now.y, now.m, now.d, BOOK_DAYS_AHEAD);
    $('[data-cal-prev]', dialog).disabled = y < now.y || (y === now.y && m <= now.m);
    $('[data-cal-next]', dialog).disabled = y > far[0] || (y === far[0] && m >= far[1]);
  }

  function renderSlots() {
    var box = $('[data-slots]', dialog);
    if (!box) return;
    if (!state.date) { box.replaceChildren(el('p', 'slots__empty', t('bk.pickDay'))); return; }
    var available = slotsFor(state.date);
    if (!available.length) { box.replaceChildren(el('p', 'slots__empty', t('bk.noSlots'))); return; }
    var nodes = [el('p', 'slots__title', longDate(state.date))];
    [['bk.morning', 'i-sun'], ['bk.afternoon', 'i-moon']].forEach(function (pair, group) {
      var times = available.filter(function (s) { return s.group === group; });
      if (!times.length) return;
      var wrap = el('div', 'slots__group');
      var label = el('p', 'slots__label');
      label.append(icon(pair[1]), el('span', '', t(pair[0])));
      var grid = el('div', 'slots__grid');
      times.forEach(function (s) {
        var btn = el('button', 'slot', s.time);
        btn.type = 'button';
        btn.setAttribute('aria-pressed', String(state.time === s.time));
        btn.addEventListener('click', function () { state.time = s.time; renderSlots(); updateFoot(); });
        grid.append(btn);
      });
      wrap.append(label, grid);
      nodes.push(wrap);
    });
    box.replaceChildren.apply(box, nodes);
  }

  function renderSteps() {
    var items = $$('[data-bk-steps] li', dialog);
    var current = state.step === 'done' ? 4 : state.step;
    var reachable = state.step === 'done' ? 3 : maxStep();
    items.forEach(function (li, i) {
      var n = i + 1;
      li.classList.toggle('is-current', n === current);
      li.classList.toggle('is-done', n < current);
      $('button', li).disabled = n > reachable;
    });
  }

  function updateFoot() {
    var step = state.step;
    renderSteps();
    var foot = $('[data-bk-foot]', dialog);
    foot.hidden = step === 'done';
    var back = $('[data-bk-foot] [data-bk-back]', dialog);
    var next = $('[data-bk-next]', dialog);
    back.style.visibility = step === 1 ? 'hidden' : 'visible';
    next.hidden = step === 3;
    $('[data-bk-next-label]', dialog).textContent = t(step === 2 ? 'bk.review' : 'bk.continue');
    next.disabled = step === 1 && !(state.date && state.time);
    var bits = [state.date && shortDate(state.date), state.time].filter(Boolean);
    $('[data-bk-pick]', dialog).textContent = bits.join(' · ');
  }

  function renderBooking() {
    $('[data-bk-title]', dialog).textContent = t(TITLES[state.step]);
    $$('[data-pane]', dialog).forEach(function (pane) {
      pane.hidden = String(pane.dataset.pane) !== String(state.step);
    });
    if (state.step === 1) { renderCalendar(); renderSlots(); }
    if (state.step === 3) renderSummary('[data-bk-summary]');
    if (state.step === 'done') renderSummary('[data-bk-summary2]');
    updateFoot();
  }

  function go(step) {
    state.step = step;
    renderBooking();
    bkBody.scrollTop = 0;
    $('[data-bk-title]', dialog).focus({ preventScroll: true });
  }

  function goBack() {
    if (state.step === 'done') go(3);
    else if (state.step > 1) go(state.step - 1);
  }

  // The phone / browser back button steps back inside the window instead of leaving the page:
  // one history entry is added while the window is open and re-added after each back press.
  var historyArmed = false;
  var ignoreNextPop = false;
  function armHistory() {
    try { history.pushState({ ndBooking: true }, ''); historyArmed = true; }
    catch (e) { historyArmed = false; }
  }

  function openBooking(opener) {
    closeMenu();
    if (state.step === 'done') { state.date = null; state.time = null; }
    state.opener = opener || null;
    state.step = 1;
    if (!state.date) state.date = firstBookable();
    var p = state.date ? parseKey(state.date) : null;
    if (p) { state.viewY = p[0]; state.viewM = p[1]; }
    renderBooking();
    if (typeof dialog.showModal === 'function') dialog.showModal(); else dialog.setAttribute('open', '');
    document.documentElement.classList.add('bk-open');
    if (!historyArmed) armHistory();
    bkBody.scrollTop = 0;
    $('[data-bk-title]', dialog).focus({ preventScroll: true });
  }

  function closeBooking() {
    if (typeof dialog.close === 'function') dialog.close(); else { dialog.removeAttribute('open'); onClose(); }
  }

  function onClose() {
    document.documentElement.classList.remove('bk-open');
    // closed with the X, Escape or the backdrop: drop the history entry the window added
    if (historyArmed) { historyArmed = false; ignoreNextPop = true; history.back(); }
    if (state.opener && document.contains(state.opener)) state.opener.focus({ preventScroll: true });
  }

  function messageBody() {
    return [t('bk.msgTitle')].concat(summaryRows().map(function (r) { return r[0] + ': ' + r[1]; })).join('\n');
  }

  function setupBooking() {
    if (!dialog) return;

    // every "book" button on the page opens the same window: one appointment
    // type, a 30-minute check-up. The service cards carry a data-book value but
    // it is deliberately ignored — nothing pre-fills the reason any more.
    document.addEventListener('click', function (e) {
      var trigger = e.target.closest('[data-book]');
      if (!trigger || dialog.contains(trigger)) return;
      e.preventDefault();
      openBooking(trigger);
    });

    $('[data-bk-close]', dialog).addEventListener('click', closeBooking);
    dialog.addEventListener('click', function (e) { if (e.target === dialog) closeBooking(); });
    dialog.addEventListener('close', onClose);

    $$('[data-bk-back]', dialog).forEach(function (btn) { btn.addEventListener('click', goBack); });

    $('[data-bk-next]', dialog).addEventListener('click', function () {
      if (state.step === 2 && !validateDetails()) return;
      go(state.step + 1);
    });

    $$('[data-go]', dialog).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var n = Number(btn.dataset.go);
        if (n === 3 && state.step === 2 && !validateDetails()) return;
        if (n <= (state.step === 'done' ? 3 : maxStep())) go(n);
      });
    });

    $('[data-cal-prev]', dialog).addEventListener('click', function () {
      state.viewM--; if (state.viewM < 1) { state.viewM = 12; state.viewY--; }
      renderCalendar();
    });
    $('[data-cal-next]', dialog).addEventListener('click', function () {
      state.viewM++; if (state.viewM > 12) { state.viewM = 1; state.viewY++; }
      renderCalendar();
    });

    bkForm.addEventListener('submit', function (e) {
      e.preventDefault();
      if (validateDetails()) go(3);
    });

    $$('[data-bk-send]', dialog).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var via = btn.dataset.bkSend;
        var d = details();
        var body = messageBody();
        var href;
        if (via === 'email') {
          href = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent(t('bk.msgTitle') + ' — ' + d.name) +
                 '&body=' + encodeURIComponent(body);
        } else if (via === 'viber') {
          // a viber:// link cannot carry a body, so the request goes to the clipboard to be pasted
          try { if (navigator.clipboard) navigator.clipboard.writeText(body); } catch (e) { /* denied */ }
          href = 'viber://chat/?number=' + encodeURIComponent(VIBER);
        } else {
          // "?&body=" is understood by both iOS and Android messaging apps
          href = 'sms:' + PHONE + '?&body=' + encodeURIComponent(body);
        }
        $('[data-bk-done]', dialog).textContent = t('bk.done' + via.charAt(0).toUpperCase() + via.slice(1));
        go('done');
        window.location.href = href;
      });
    });

    $('[data-bk-ics]', dialog).addEventListener('click', function () {
      var p = parseKey(state.date);
      var hm = state.time.split(':').map(Number);
      var end = hm[0] * 60 + hm[1] + SLOT_MINUTES;
      var stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
      var esc = function (s) { return s.replace(/[\\;,]/g, function (c) { return '\\' + c; }).replace(/\n/g, '\\n'); };
      var ics = [
        'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Nechakovski Dental//Booking//MK', 'CALSCALE:GREGORIAN',
        'BEGIN:VEVENT', 'UID:' + Date.now() + '@nechakovski-dental', 'DTSTAMP:' + stamp,
        'DTSTART:' + p[0] + pad(p[1]) + pad(p[2]) + 'T' + pad(hm[0]) + pad(hm[1]) + '00',
        'DTEND:' + p[0] + pad(p[1]) + pad(p[2]) + 'T' + pad(Math.floor(end / 60)) + pad(end % 60) + '00',
        'SUMMARY:' + esc(t('bk.icsTitle')),
        'LOCATION:' + esc(t('bk.icsPlace')),
        'DESCRIPTION:' + esc(t('bk.icsNote')),
        'END:VEVENT', 'END:VCALENDAR'
      ].join('\r\n');
      var url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
      var a = el('a');
      a.href = url;
      a.download = 'nechakovski-termin.ics';
      document.body.append(a);
      a.click();
      a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
    });

    window.addEventListener('popstate', function () {
      if (ignoreNextPop) { ignoreNextPop = false; return; }
      if (!dialog.open || !historyArmed) return;
      historyArmed = false;
      if (state.step === 1) { closeBooking(); return; }
      goBack();
      armHistory();
    });
  }

  /* ===================== observers ===================== */

  function observeOnce(targets, callback, options) {
    if (!('IntersectionObserver' in window)) { targets.forEach(callback); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { callback(entry.target); io.unobserve(entry.target); }
      });
    }, options);
    targets.forEach(function (target) { io.observe(target); });
  }

  function setupObservers() {
    observeOnce($$('.reveal'), function (node) { node.classList.add('is-in'); }, { rootMargin: '0px 0px -6% 0px', threshold: 0.08 });
    $$('[data-num]').forEach(function (node) { node.dataset.counted = 'pending'; showNumber(node, 0); });
    observeOnce($$('[data-num]'), countUp, { threshold: 0.6 });

    if (!('IntersectionObserver' in window)) return;

    var top = $('[data-top]');
    if (top) new IntersectionObserver(function (entries) {
      header.classList.toggle('is-scrolled', !entries[0].isIntersecting);
    }).observe(top);

    // current section in the nav: whichever section crosses the middle of the screen
    var links = $$('#nav-links a');
    var navIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (a) {
          if (a.hash === '#' + entry.target.id) a.setAttribute('aria-current', 'true');
          else a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    links.map(function (a) { return document.getElementById(a.hash.slice(1)); })
      .filter(Boolean).forEach(function (section) { navIO.observe(section); });

    // phone bar: hidden while the booking card or the final band is on screen
    var mbar = $('[data-mbar]');
    var quick = $('[data-quick]');
    var final = $('[data-final]');
    if (mbar && quick && final) {
      var seen = { quick: true, final: false };
      var sync = function () { mbar.classList.toggle('is-visible', !seen.quick && !seen.final); };
      new IntersectionObserver(function (e) { seen.quick = e[0].isIntersecting; sync(); }).observe(quick);
      new IntersectionObserver(function (e) { seen.final = e[0].isIntersecting; sync(); }).observe(final);
    }
  }

  /* ===================== boot ===================== */

  captureOriginals();
  $$('[data-arcs]').forEach(drawArcs);
  $$('[data-year]').forEach(function (node) { node.textContent = String(new Date().getFullYear()); });
  $$('[data-since]').forEach(function (node) {
    var years = new Date().getFullYear() - Number(node.dataset.since);
    node.dataset.num = String(years);
    node.textContent = String(years);
  });

  var initial = 'mk';
  try {
    initial = new URLSearchParams(location.search).get('lang') || localStorage.getItem('nd-lang') || 'mk';
  } catch (e) { /* storage blocked */ }

  setupHeader();
  setupFilters();
  setupMap();
  setupBooking();
  applyLanguage(initial);
  $$('[data-lang]').forEach(function (btn) {
    btn.addEventListener('click', function () { if (btn.dataset.lang !== lang) applyLanguage(btn.dataset.lang); });
  });
  setupObservers();
  setInterval(updateStatus, 60 * 1000);

  window.__nd = true;
})();
