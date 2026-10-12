var dwitiCfg = {
  databaseURL: "https://dwiti-logistics-default-rtdb.firebaseio.com/",
  storageBucket: "dwiti-logistics-default-rtdb.appspot.com"
};

var db = null;
var currentSessionUser = null;
var curTracking = "DWITI-101";
var payStatus = "Pending";
var bookingData = null;
var toastTimer = null;
var companyBookingsCache = {};
var rawBookingsList = [];
var activePartyModalType = "consignee";
var notifResetTimer = null;
var DEFAULT_NOTIF_TEXT = "WELCOME TO DWITI LOGISTICS";

var faqDatabase = [
  {
    en: "What are your pickup and delivery timings?",
    hi: "Aapka pickup aur delivery ka timing kya hai?",
    mr: "तुमची पिकअप आणि डिलिव्हरीची वेळ काय आहे?",
    answer: {
      en: "Morning pickup happens between 09:00 AM to 10:00 AM, and same-day delivery in Navi Mumbai takes place between 02:00 PM to 04:00 PM.",
      hi: "Morning pickup 09:00 AM se 10:00 AM ke beech hota hai aur same day 02:00 PM se 04:00 PM ke beech Navi Mumbai me delivery hoti hai.",
      mr: "सकाळी 09:00 ते 10:00 वाजेपर्यंत पिकअप होते आणि त्याच दिवशी दुपारी 02:00 ते 04:00 वाजेपर्यंत नवी मुंबईत डिलिव्हरी होते."
    }
  },
  {
    en: "Do you provide Loading and Unloading (Hamali) services?",
    hi: "Kya aap Loading aur Unloading (Hamali) service provide karte hain?",
    mr: "तुम्ही लोडिंग आणि अनलोडिंग (हमाली) सेवा पुरवता का?",
    answer: {
      en: "No, we do not provide loading and unloading services to ensure super-fast express delivery on the same day. Loading and unloading are the customer's (sender/receiver) responsibility.",
      hi: "Nahi, hum loading aur unloading ki service provide nahi karte hain taaki aapki consignment same day super-fast express delivery ho sake. Loading aur unloading ki zimmedari customer ki hogi.",
      mr: "नाही, त्याच दिवशी सुपर-फास्ट एक्सप्रेस डिलिव्हरी सुनिश्चित करण्यासाठी आम्ही लोडिंग आणि अनलोडिंग सेवा पुरवत नाही. लोडिंग आणि अनलोडिंगची जबाबदारी ग्राहकाची (प्रेषक/प्राप्तकर्ता) असेल."
    }
  },
  {
    en: "How much waiting time is allowed at pickup and drop locations?",
    hi: "Pickup aur Drop location par kitna waiting time milta hai?",
    mr: "पिकअप आणि ड्रॉप लोकेशनवर किती वेटिंग टाईम मिळतो?",
    answer: {
      en: "To keep vehicles on schedule, both sender and receiver get 15-20 minutes of free waiting time. Extra waiting charges may apply beyond this.",
      hi: "Vehicles ko schedule par rakhne ke liye Sender aur Receiver dono ko 15-20 minutes ka free waiting time milta hai. Uske baad extra delay ke liye waiting charges apply ho sakte hain.",
      mr: "वेळेनुसार गाड्या चालवण्यासाठी, प्रेषक आणि प्राप्तकर्ता दोघांनाही 15-20 मिनिटे मोफत वेटिंग टाईम मिळतो. यानंतर अतिरिक्त वेळेसाठी वेटिंग चार्जेस लागू होऊ शकतात."
    }
  },
  {
    en: "How should goods and documents be prepared at the time of pickup?",
    hi: "Pickup ke samay goods aur documents kaise ready rakhne hain?",
    mr: "पिकअपच्या वेळी माल आणि कागदपत्रे कशी तयार ठेवावीत?",
    answer: {
      en: "Goods must be fully packed and ready by 09:00 AM. Print 3x LR (Lorry Receipt) from the portal and attach the original Invoice and E-Way Bill (if applicable).",
      hi: "Morning 09:00 AM tak aapke goods fully packed aur ready hone chahiye. Portal se 3x Print LR nikal kar uske saath original Invoice aur E-Way Bill compulsory attach rakhein.",
      mr: "सकाळी 09:00 वाजेपर्यंत तुमचे सामान पूर्णपणे पॅक आणि तयार असावे. पोर्टलवरून 3x प्रिंट एलआर (लॉरी पावती) काढा आणि मूळ बीजक आणि ई-वे बिल (लागू असल्यास) सोबत ठेवा."
    }
  },
  {
    en: "When and where will I get the driver's contact number?",
    hi: "Mujhe Driver ka contact number kab aur kaha milega?",
    mr: "मला ड्रायव्हरचा संपर्क क्रमांक कधी आणि कुठे मिळेल?",
    answer: {
      en: "Once a vehicle/driver is assigned, the Tracker Tab updates automatically and the 'Call Driver' button becomes enabled for direct calling.",
      hi: "Jaise hi aapki booking ke liye vehicle/driver assign ho jayega, Tracker Tab par Live Status update ho jayega aur 'Call Driver' button enable ho jayega.",
      mr: "तुमच्या बुकिंगसाठी वाहन/ड्रायव्हर नेमणूक झाल्यावर, ट्रॅकर टॅबवर लाईव्ह स्टेटस अपडेट होईल आणि थेट कॉल करण्यासाठी 'Call Driver' बटण सुरू होईल."
    }
  },
  {
    en: "What are the maximum weight and volume size limits allowed?",
    hi: "Maximum kitna weight aur volume size allowed hai?",
    mr: "कमाल वजन आणि व्हॉल्युम साईझ मर्यादा किती परवानगी आहे?",
    answer: {
      en: "Slab 1 (10-50 kg): Max 06 cu.ft. Slab 2 (51-100 kg): Max 12 cu.ft. Exceeding these may incur extra charges.",
      hi: "Slab 1 (10-50 kg): Max 06 cu.ft volume. Slab 2 (51-100 kg): Max 12 cu.ft volume. Isse zyada weight ya size hone par extra charge lag sakta hai.",
      mr: "स्लॅब 1 (10-50 किलो): कमाल 06 cu.ft. स्लॅब 2 (51-100 किलो): कमाल 12 cu.ft. यापेक्षा जास्त वजन किंवा आकार असल्यास अतिरिक्त शुल्क लागू शकते."
    }
  },
  {
    en: "Is an E-Way Bill mandatory?",
    hi: "Kya E-Way Bill hona zaroori hai?",
    mr: "ई-वे बिल असणे बंधनकारक आहे का?",
    answer: {
      en: "If invoice value exceeds ₹49,999, entering a 12-digit E-Way Bill Number is compulsory. It's optional for lower amounts.",
      hi: "Agar invoice ki total value ₹49,999 se zyada hai, toh 12-digit E-Way Bill Number enter karna compulsory hai. Kam value ke liye optional hai.",
      mr: "इनव्हॉइसचे मूल्य ₹49,999 पेक्षा जास्त असल्यास, 12 अंकी ई-वे बिल नंबर टाकणे बंधनकारक आहे. कमी मूल्यासाठी हे पर्यायी आहे."
    }
  },
  {
    en: "Can I check my parcel's live status?",
    hi: "Kya main live tracking se apne parcel ka status dekh sakta hu?",
    mr: "मी माझ्या पार्सलची लाईव्ह स्टेटस तपासू शकतो का?",
    answer: {
      en: "Yes! Go to the Tracker Tab, select your LR Token (e.g., DWITI-101) to view live status, driver info, and download POD photos upon delivery.",
      hi: "Haan! Portal ke Tracker Tab par jaakar apna LR Token select karke live status, driver details aur delivery complete hone par POD Photo download kar sakte hain.",
      mr: "होय! ट्रॅकर टॅबवर जा, तुमचे एलआर टोकन निवडून लाईव्ह स्टेटस, ड्रायव्हरची माहिती पाहू शकता आणि डिलिव्हरी झाल्यावर पीओडी फोटो डाउनलोड करू शकता."
    }
  },
  {
    en: "When and how should I make freight payments?",
    hi: "Freight Invoice ka payment kab aur kaise karna hoga?",
    mr: "फ्रेट इनव्हॉइसचे पेमेंट कधी आणि कसे करावे लागेल?",
    answer: {
      en: "You can pay via Online UPI/QR (instant on portal), Cash at Pickup (by Consignor), or Cash on Delivery / COD (by Consignee).",
      hi: "Aap 3 tareeqon se payment kar sakte hain: Online UPI / QR Code, Cash at Pickup (Sender dwara), ya Cash on Delivery / COD (Receiver dwara).",
      mr: "तुम्ही 3 मार्गांनी पेमेंट करू शकता: ऑनलाईन यूपीआय / क्यूआर कोड, कॅश ॲट पिकअप (प्रेषकाद्वारे), किंवा कॅश ऑन डिलिव्हरी / COD (प्राप्तकर्त्याद्वारे)."
    }
  },
  {
    en: "What is the compensation policy if a parcel is damaged or lost?",
    hi: "Agar parcel damage ya loss ho jaye toh kya policy hai?",
    mr: "पार्सल खराब झाल्यास किंवा हरवल्यास नुकसान भरपाई धोरण काय आहे?",
    answer: {
      en: "All shipments are booked at Owner's Risk. Transit damage compensation is 5x of booking freight value or max ₹2,000/- (whichever is less).",
      hi: "Sabhi shipments 'Owner's Risk' par book hote hain. Transit damage compensation booking freight value ka 5x ya max ₹2,000/- tak ho sakta hai.",
      mr: "सर्व शिपमेंट 'मालकाच्या जोखमीवर' बुक केले जातात. ट्रान्झिट डॅमेजसाठी बुकिंग फ्रेट मूल्याच्या 5 पट किंवा कमाल ₹2,000/- (जे कमी असेल) पर्यंत भरपाई मिळू शकते."
    }
  },
  {
    en: "What items are strictly prohibited?",
    hi: "Konsa material / saaman bhejna strict prohibited (banned) hai?",
    mr: "कोणते साहित्य पाठवणे काटेकोरपणे प्रतिबंधित (बॅन) आहे?",
    answer: {
      en: "Illegal drugs, explosives, dangerous chemicals, weapons, cash, gold/jewelry, and hazardous goods are strictly prohibited.",
      hi: "Illegal drugs, explosives, dangerous chemicals, weapons, cash, gold/jewelry, aur hazardous goods strictly prohibited hain.",
      mr: "अवैध औषधे, स्फोटके, धोकादायक रसायने, शस्त्रे, रोख रक्कम, सोने/दागिने आणि घातक वस्तू पाठवण्यास सक्त मनाई आहे."
    }
  },
  {
    en: "How can I contact the Control Room if my issue is not resolved?",
    hi: "Agar mera issue solve na ho toh main Control Room se kaise contact karu?",
    mr: "माझी समस्या सुटली नाही तर मी कंट्रोल रूमशी कसा संपर्क साधू?",
    answer: {
      en: "Go to the Support Tab to raise a 15-Minute Response Ticket, or contact us directly via Call/WhatsApp at +91 8149448985.",
      hi: "Aap Support Tab par jaakar 15-Minute Response Ticket raise kar sakte hain ya direct hume Call / WhatsApp kar sakte hain: +91 8149448985.",
      mr: "15 मिनिटांच्या रिस्पॉन्स तिकीटसाठी सपोर्ट टॅबवर जा किंवा आम्हाला थेट कॉल / व्हॉट्सॲप करा: +91 8149448985."
    }
  },
  {
    en: "What is the cancellation policy?",
    hi: "Agar mujhe booking cancel karni ho toh cancellation policy kya hai?",
    mr: "मला बुकिंग रद्द करायची असल्यास कॅन्सलिंग पॉलिसी काय आहे?",
    answer: {
      en: "You can cancel for free before morning 08:15 AM by calling +91 8149448985. Cancelling later or after vehicle arrival incurs a dry run charge.",
      hi: "Pickup time se pehle, morning 08:15 AM tak aap +91 8149448985 par call karke booking FREE cancel karwa sakte hain. Baad me cancel karne par dry run charge lagega.",
      mr: "सकाळी 08:15 वाजेपूर्वी +91 8149448985 वर कॉल करून तुम्ही तुमची बुकिंग मोफत रद्द करू शकता. उशीरा रद्द केल्यास ड्राय रन चार्ज लागू होईल."
    }
  },
  {
    en: "What precautions should be taken for fragile or glass items?",
    hi: "Fragile (tootne wala saaman) ya Glass items bhejne par kya extra precaution lena hoga?",
    mr: "काचेच्या किंवा नाजूक वस्तू पाठवताना कोणती काळजी घ्यावी?",
    answer: {
      en: "Glass and fragile items must be packed with extra bubble wrap, wooden boxes, or strong corrugated boxes with 'FRAGILE' labels. Sender's responsibility.",
      hi: "Kanch, fragile items, ya liquid containers ko extra bubble wrap ya wooden box me pack karke 'FRAGILE' sticker lagana zaroori hai.",
      mr: "काच आणि नाजूक वस्तू अतिरिक्त बबल्स रॅप, लाकडी खोके किंवा 'FRAGILE' स्टिकर लावून पॅक केल्या पाहिजेत."
    }
  },
  {
    en: "Can I send multiple parcels under a single LR Token?",
    hi: "Kya ek hi LR Token par multi-box / multi-parcel bhej sakte hain?",
    mr: "एकाच एलआर टोकनवर अनेक पार्सल पाठवता येतात का?",
    answer: {
      en: "Yes! You can send multiple cartons under one LR Token (e.g., 5 cartons). Ensure total weight is within 100 kg and mark the Consignee's name/city on each.",
      hi: "Haan! Aap ek hi LR Token me multiple boxes bhej sakte hain. Total weight max 100 kg hona chahiye aur har box par Consignee ka naam likhein.",
      mr: "होय! तुम्ही एकाच एलआर टोकन अंतर्गत अनेक बॉक्स पाठवू शकता. एकूण वजन 100 किलोच्या आत असावे आणि प्रत्येक बॉक्सवर प्राप्तकर्त्याचे नाव लिहा."
    }
  },
  {
    en: "What are the charges if a same-day delivery fails?",
    hi: "Same day delivery fail hone par ya return ka kya charge hoga?",
    mr: "त्याच दिवशी डिलिव्हरी अयशस्वी झाल्यास किंवा रिटर्न झाल्यास काय शुल्क आकारले जाईल?",
    answer: {
      en: "If delivery fails due to recipient unavailability or wrong address, return transport charges are doubled (e.g., ₹500 booking becomes ₹1,500 total).",
      hi: "Agar delivery fail hokar parcel return lana padta hai, toh return handling charge double hoga. Example: ₹500 booking ke liye Total Pay ₹1,500 hoga.",
      mr: "प्राप्तकर्ता उपलब्ध नसल्यामुळे किंवा चुकीच्या पत्त्यामुळे डिलिव्हरी अयशस्वी झाल्यास, रिटर्न ट्रान्सपोर्ट शुल्क दुप्पट आकारले जाईल."
    }
  },
  {
    en: "What compensation applies if DWITI Logistics cancels a booking?",
    hi: "Agar DWITI Logistics ki taraf se booking cancel hoti hai toh kya penalty / fee milegi?",
    mr: "ड्विती लॉजिस्टिक्सने बुकिंग रद्द केल्यास कोणती भरपाई मिळेल?",
    answer: {
      en: "If a booking within our service area is cancelled by DWITI Logistics by 11:00 AM, you will receive a ₹200/- cancellation compensation fee.",
      hi: "Agar DWITI Logistics ki taraf se booking cancel hoti hai, toh cancellation confirmation timing 11:00 AM tak rahegi aur aapko ₹200/- compensation milega.",
      mr: "आमच्या सेवा क्षेत्रातील बुकिंग ड्विती लॉजिस्टिक्सद्वारे रद्द केल्यास, तुम्हाला ₹200/- भरपाई शुल्क दिले जाईल."
    }
  }
];

function getDB() {
  if (!db && typeof firebase !== "undefined") {
    if (!firebase.apps.length) {
      firebase.initializeApp(dwitiCfg);
    }
    db = firebase.database();
  }
  return db;
}

// NORMAL THEME SWITCHER FUNCTION
window.changeAppTheme = function(themeClass) {
  document.body.className = themeClass;
  localStorage.setItem("dwiti_selected_theme", themeClass);
  var sel = document.getElementById("appThemeSelector");
  if (sel) sel.value = themeClass;
};

// AUTO LOAD DEFAULT CONSIGNOR MEMORY FROM LOCALSTORAGE
function loadDefaultConsignorMemory() {
  var savedConsignor = localStorage.getItem("dwiti_default_consignor");
  if (savedConsignor) {
    try {
      var p = JSON.parse(savedConsignor);
      applyPartyToForm("consignor", p);
    } catch (e) {}
  }
}

// DIRECT PHONE CALL HANDLER
window.makeDirectPhoneCall = function(e, phoneNum) {
  if (e) {
    e.stopPropagation();
    if (e.preventDefault) e.preventDefault();
  }
  if (!phoneNum) return;
  try {
    window.open("tel:" + phoneNum, "_top");
  } catch (err) {
    window.location.href = "tel:" + phoneNum;
  }
};

window.pushHeaderNotification = function(text, isFast) {
  var tickerText = document.getElementById("notifTickerText");
  var notifCount = document.getElementById("notifCount");
  
  if (tickerText) {
    tickerText.innerText = text;
    if (isFast) {
      tickerText.classList.add("ticker-fast");
    } else {
      tickerText.classList.remove("ticker-fast");
    }
  }

  if (notifCount) {
    var cur = parseInt(notifCount.innerText, 10) || 0;
    notifCount.innerText = cur + 1;
  }

  if (notifResetTimer) {
    clearTimeout(notifResetTimer);
  }

  notifResetTimer = setTimeout(function() {
    if (tickerText) {
      tickerText.innerText = DEFAULT_NOTIF_TEXT;
      tickerText.classList.remove("ticker-fast");
    }
  }, 3600000);
};

window.toggleSubmitButtonReadiness = function() {
  var chk = document.getElementById("chkConsignmentReady");
  var btn = document.getElementById("submitBtn");
  if (chk && btn) {
    if (chk.checked) {
      btn.disabled = false;
      btn.classList.remove("disabled");
    } else {
      btn.disabled = true;
      btn.classList.add("disabled");
    }
  }
};

function listenLRToken() {
  var database = getDB();
  var tokenEl = document.getElementById("trackingId");

  if (!database) {
    curTracking = "DWITI-101";
    if (tokenEl) tokenEl.innerHTML = '<i class="fa-solid fa-receipt"></i> Active LR Token: <span>DWITI-101</span>';
    return;
  }

  database.ref("bookings").on("value", function (snap) {
    var maxVal = 100;
    if (snap && snap.exists()) {
      snap.forEach(function (child) {
        var b = child.val();
        if (b && b.trackingId) {
          var arr = String(b.trackingId).split("-");
          if (arr.length > 1) {
            var n = parseInt(arr[1], 10);
            if (!isNaN(n) && n > maxVal) {
              maxVal = n;
            }
          }
        }
      });
    }
    curTracking = "DWITI-" + (maxVal + 1);
    if (tokenEl) {
      tokenEl.innerHTML = '<i class="fa-solid fa-receipt"></i> Active LR Token: <span>' + curTracking + "</span>";
    }
  });

  database.ref("admin_notifications").on("value", function(snap) {
    if (snap && snap.exists()) {
      var lastNotif = "";
      snap.forEach(function(child) {
        var val = child.val();
        if (val && val.text) lastNotif = val.text;
      });
      if (lastNotif) {
        window.pushHeaderNotification("🚨 " + lastNotif, true);
      }
    }
  });
}

window.toggleEwayField = function(show) {
  var wrap = document.getElementById("ewayNumberWrap");
  var input = document.getElementById("ewayBillNo");
  if (wrap) wrap.style.display = show ? "flex" : "none";
  if (input) {
    input.required = show;
    if (!show) input.value = "";
  }
};

window.onInvoiceValChange = function(val) {
  var numVal = parseFloat(val) || 0;
  var yesRadio = document.querySelector('input[name="ewayToggle"][value="yes"]');
  var notice = document.getElementById("ewayNotice");

  if (numVal > 49999) {
    if (yesRadio) yesRadio.checked = true;
    window.toggleEwayField(true);
    if (notice) notice.style.display = "inline";
    window.showToast("Invoice > ₹49,999: E-Way Bill Compulsory!", false);
  } else {
    if (notice) notice.style.display = "none";
  }
};

window.openTcModal = function() { var o = document.getElementById("tcModalOverlay"); if (o) o.style.display = "flex"; };
window.closeTcModal = function() { var o = document.getElementById("tcModalOverlay"); if (o) o.style.display = "none"; };
window.agreeTcAndClose = function() {
  document.getElementById("loginAgreeTC").checked = true;
  document.getElementById("regAgreeTC").checked = true;
  window.closeTcModal();
  window.showToast("Terms Accepted!", false);
};

window.showToast = function(m, err) {
  var t = document.getElementById("toastNotification");
  var msg = document.getElementById("toastMsg");
  var ic = document.getElementById("toastIcon");
  if (!t) return;
  msg.innerText = m;
  t.className = "toast-card" + (err ? " toast-error" : "");
  ic.className = err ? "fa-solid fa-circle-exclamation" : "fa-solid fa-circle-check";
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () { t.classList.remove("show"); }, 2800);
};

window.switchAuthTab = function(t) {
  document.getElementById("loginTabBtn").classList.toggle("active", t === "login");
  document.getElementById("signupTabBtn").classList.toggle("active", t === "signup");
  document.getElementById("loginSection").style.display = (t === "login") ? "flex" : "none";
  document.getElementById("signupSection").style.display = (t === "signup") ? "flex" : "none";
};

window.switchMainTab = function(tabName) {
  ['tabContentHome', 'tabContentBookings', 'tabContentTracker', 'tabContentSupport'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.style.display = "none";
  });

  if (tabName === "home") document.getElementById("tabContentHome").style.display = "block";
  if (tabName === "bookings") document.getElementById("tabContentBookings").style.display = "block";
  if (tabName === "tracker") document.getElementById("tabContentTracker").style.display = "block";
  if (tabName === "support") document.getElementById("tabContentSupport").style.display = "block";

  document.getElementById("navTabHome").classList.toggle("active", tabName === "home");
  document.getElementById("navTabBookings").classList.toggle("active", tabName === "bookings");
  document.getElementById("navTabTracker").classList.toggle("active", tabName === "tracker");
  document.getElementById("navTabSupport").classList.toggle("active", tabName === "support");

  window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.switchFaqLanguage = function(lang) {
  var container = document.getElementById("faqAccordionContainer");
  if (!container) return;
  var html = "";
  faqDatabase.forEach(function(item, idx) {
    var qText = item[lang] || item["hi"];
    var aText = item.answer[lang] || item.answer["hi"];
    html += '<div class="faq-item" id="faqItem_' + idx + '">' +
              '<div class="faq-question-bar" onclick="toggleFaqItem(' + idx + ')">' +
                '<span><strong>Q' + (idx + 1) + '.</strong> ' + qText + '</span>' +
                '<i class="fa-solid fa-chevron-down"></i>' +
              '</div>' +
              '<div class="faq-answer-content"><p>' + aText + '</p></div>' +
            '</div>';
  });
  container.innerHTML = html;
};

window.toggleFaqItem = function(idx) {
  var itemEl = document.getElementById("faqItem_" + idx);
  if (!itemEl) return;
  var isOpen = itemEl.classList.contains("active");
  document.querySelectorAll(".faq-item").forEach(function(el) { el.classList.remove("active")
