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
  document.querySelectorAll(".faq-item").forEach(function(el) { el.classList.remove("active"); });
  if (!isOpen) itemEl.classList.add("active");
};

window.autoGenerateCompanyCode = function() {
  var code = Math.floor(1000 + Math.random() * 9000).toString();
  document.getElementById("regCompanyCode").value = code;
  window.showToast("4-Digit Code Generated: " + code, false);
};

window.initiateSignup = function() {
  var c = (document.getElementById("regCompanyName").value || "").trim();
  var tp = document.getElementById("regCompanyType").value;
  var p = (document.getElementById("regPhone").value || "").trim();
  var code = (document.getElementById("regCompanyCode").value || "").trim();
  var chk = document.getElementById("regAgreeTC");

  if (!c || !tp || p.length !== 10 || !code) return window.showToast("Sabhi details bhariye!", true);
  if (code.length !== 4 || isNaN(code)) return window.showToast("Company Code strictly 4-digit number hona chahiye!", true);
  if (!chk || !chk.checked) return window.showToast("Terms & Conditions par tick karein!", true);

  var u = { companyName: c, companyType: tp, mobile: p, companyCode: code, registeredAt: Date.now() };
  var database = getDB();
  if (database) {
    database.ref("registered_companies/" + p).once("value", function (s) {
      if (s.exists()) return window.showToast("Mobile pehle se registered hai! Sign In karein.", true);
      database.ref("registered_companies/" + p).set(u, function (err) {
        if (err) window.showToast("Error: " + err.message, true);
        else {
          localStorage.setItem("dwiti_user", JSON.stringify(u));
          launchPortal(u);
        }
      });
    });
  } else {
    localStorage.setItem("dwiti_user", JSON.stringify(u));
    launchPortal(u);
  }
};

window.initiateLogin = function() {
  var c = (document.getElementById("loginCompanyName").value || "").trim();
  var p = (document.getElementById("loginPhone").value || "").trim();
  var code = (document.getElementById("loginCompanyCode").value || "").trim();
  var chk = document.getElementById("loginAgreeTC");

  if (!c || p.length !== 10 || !code) return window.showToast("Company Name, Mobile aur Code dalein!", true);
  if (code.length !== 4) return window.showToast("Company Code 4-digit ka hi hona chahiye!", true);
  if (!chk || !chk.checked) return window.showToast("Terms & Conditions par tick karein!", true);

  var database = getDB();
  if (database) {
    database.ref("registered_companies/" + p).once("value", function (s) {
      if (!s.exists()) {
        window.showToast("Account nahi mila! Pehle Sign Up karein.", true);
        window.switchAuthTab("signup");
        document.getElementById("regCompanyName").value = c;
        document.getElementById("regPhone").value = p;
        return;
      }
      var u = s.val();
      if (u.companyCode && u.companyCode !== code) return window.showToast("Galat 4-digit Code / PIN!", true);
      var logged = { companyName: u.companyName || c, mobile: p, companyType: u.companyType || "" };
      localStorage.setItem("dwiti_user", JSON.stringify(logged));
      launchPortal(logged);
    });
  } else {
    var fb = { companyName: c, mobile: p };
    localStorage.setItem("dwiti_user", JSON.stringify(fb));
    launchPortal(fb);
  }
};

function launchPortal(u) {
  currentSessionUser = u;
  document.getElementById("authWrapper").style.display = "none";
  document.getElementById("appWrapper").style.display = "block";
  document.getElementById("currentUserDisplay").innerText = u.companyName;
  var nameInput = document.getElementById("ticketFullName");
  if (nameInput) nameInput.value = u.companyName;
  loadCompanyBookings(u.mobile);
  listenLRToken();
  window.switchFaqLanguage("hi");
  loadDefaultConsignorMemory();

  var savedTheme = localStorage.getItem("dwiti_selected_theme") || "theme-navy";
  window.changeAppTheme(savedTheme);
}

window.logout = function() { localStorage.removeItem("dwiti_user"); location.reload(); };

window.directCallLatikesh = function(e) {
  if (e && e.preventDefault) e.preventDefault();
  try { window.open("tel:8149448985", "_top"); } catch (err) { window.location.href = "tel:8149448985"; }
};

window.directWhatsappLatikesh = function(e) {
  if (e && e.preventDefault) e.preventDefault();
  window.open("https://wa.me/918149448985?text=Hello%20Latikesh%2C%20I%20need%20help%20with%20DWITI%20Logistics%20Booking.", "_blank");
};

window.callAssignedDriver = function() {
  if (!bookingData) return;
  var st = (bookingData.trackingStatus || "Booking Confirmed").toLowerCase();
  if (st.indexOf("driver assign") === -1 && st.indexOf("pickup complete") === -1 && st.indexOf("delivered") === -1) {
    return window.showToast("Driver assign hone ke baad hi call option enable hoga!", true);
  }
  window.open("tel:" + (bookingData.driverPhone || "8149448985"), "_top");
};

window.handleSupportTicketSubmit = function(e) {
  e.preventDefault();
  var fullName = document.getElementById("ticketFullName").value.trim();
  var lrToken = document.getElementById("ticketLrSelect").value;
  var category = document.getElementById("ticketCategory").value;
  var desc = document.getElementById("ticketDescription").value.trim();

  if (!fullName || !lrToken || !category || !desc) return window.showToast("Sabhi fields bhariye!", true);

  var msg = "*DWITI Support Ticket (Response in 15 Min)*%0A*Name:* " + fullName + "%0A*LR Token:* " + lrToken + "%0A*Category:* " + category + "%0A*Issue Details:* " + desc;
  window.open("https://wa.me/918149448985?text=" + msg, "_blank");
  window.showToast("Ticket Created! Dispatcher will contact in 15 mins.", false);
  document.getElementById("supportTicketForm").reset();
  if (currentSessionUser) document.getElementById("ticketFullName").value = currentSessionUser.companyName;
};

window.openAddPartyModal = function(type) {
  if (!currentSessionUser || !currentSessionUser.mobile) return window.showToast("Pehle Login karein!", true);
  activePartyModalType = type;
  document.getElementById("addPartyForm").reset();
  document.getElementById("addPartyModalTitleText").innerText = (type === "consignor") ? "Add Consignor Party" : "Add Consignee Party";
  document.getElementById("popDistanceGroup").style.display = (type === "consignor") ? "none" : "block";
  document.getElementById("addPartyModalOverlay").style.display = "flex";
};

window.closeAddPartyModal = function() { document.getElementById("addPartyModalOverlay").style.display = "none"; };

window.handlePartySaveSubmit = function(e) {
  e.preventDefault();
  if (!currentSessionUser || !currentSessionUser.mobile) return window.showToast("Pehle Login karein!", true);

  var name = document.getElementById("popPartyName").value.trim();
  var phone = document.getElementById("popPartyPhone").value.trim();
  var gst = document.getElementById("popPartyGst").value.trim();
  var city = document.getElementById("popPartyCity").value.trim();
  var dist = document.getElementById("popPartyDistance").value.trim();
  var map = document.getElementById("popPartyMap").value.trim();
  var address = document.getElementById("popPartyAddress").value.trim();

  if (!name || !phone || !city || !map || !address) return window.showToast("Map link aur sabhi required fields bhariye!", true);

  var partyObj = { name: name, phone: phone, gst: gst || "N/A", city: city, map: map, address: address, distance: dist || "0", savedAt: Date.now() };
  var database = getDB();
  var refPath = (activePartyModalType === "consignor") ? "consignor_parties" : "consignee_parties";

  if (database) {
    database.ref("companies/" + currentSessionUser.mobile + "/" + refPath + "/" + phone).set(partyObj, function(err) {
      if (err) window.showToast("Error: " + err.message, true);
      else {
        window.showToast(activePartyModalType.toUpperCase() + " Party Saved Successfully!", false);
        window.closeAddPartyModal();
        applyPartyToForm(activePartyModalType, partyObj);
      }
    });
  }
};

window.openPartyModal = function(type) {
  if (!currentSessionUser || !currentSessionUser.mobile) return window.showToast("Pehle Login karein!", true);
  activePartyModalType = type;
  document.getElementById("partyModalTitleText").innerText = (type === "consignor") ? "Consignor Parties List" : "Consignee Parties List";
  var cnt = document.getElementById("partyModalContent");
  cnt.innerHTML = '<div style="text-align:center;padding:20px;">Loading parties...</div>';
  document.getElementById("partyModalOverlay").style.display = "flex";

  var database = getDB();
  if (database) {
    var refPath = (type === "consignor") ? "consignor_parties" : "consignee_parties";
    database.ref("companies/" + currentSessionUser.mobile + "/" + refPath).once("value", function (snap) {
      if (!snap.exists()) {
        cnt.innerHTML = '<div style="text-align:center;padding:20px;color:#94a3b8;">Koi saved party nahi mili. Pehle Add karein.</div>';
        return;
      }
      var h = "";
      snap.forEach(function (ch) {
        var p = ch.val(), k = ch.key;
        h += '<div class="party-item-card" onclick="selectPartyItem(\'' + type + '\',\'' + k + '\')">' +
             '<div class="party-details"><h4>' + p.name + '</h4><p>📞 ' + p.phone + ' | 📍 ' + p.city + (p.distance ? (' | 🛣 ' + p.distance + ' km') : '') + '</p></div>' +
             '<div class="party-action-btns-wrap">' +
                '<button type="button" class="btn-call-party-action" onclick="makeDirectPhoneCall(event, \'' + p.phone + '\')"><i class="fa-solid fa-phone"></i> Call</button>' +
                '<button type="button" class="btn-del-party" onclick="deletePartyItem(event,\'' + type + '\',\'' + k + '\')"><i class="fa-solid fa-trash-can"></i></button>' +
             '</div></div>';
      });
      cnt.innerHTML = h;
    });
  }
};

window.closePartyModal = function() { document.getElementById("partyModalOverlay").style.display = "none"; };

window.selectPartyItem = function(type, k) {
  var database = getDB();
  if (!database || !currentSessionUser) return;
  var refPath = (type === "consignor") ? "consignor_parties" : "consignee_parties";
  database.ref("companies/" + currentSessionUser.mobile + "/" + refPath + "/" + k).once("value", function (s) {
    if (s.exists()) {
      applyPartyToForm(type, s.val());
      window.closePartyModal();
      window.showToast("Party Loaded!", false);
    }
  });
};

function applyPartyToForm(type, p) {
  if (type === "consignor") {
    localStorage.setItem("dwiti_default_consignor", JSON.stringify(p));

    document.getElementById("senderName").value = p.name || "";
    document.getElementById("senderPhone").value = p.phone || "";
    document.getElementById("senderCity").value = p.city || "";
    document.getElementById("senderGst").value = p.gst || "N/A";
    document.getElementById("senderMap").value = p.map || "";
    document.getElementById("senderAddress").value = p.address || "";
    document.getElementById("dispSenderName").innerText = p.name;
    document.getElementById("dispSenderDetails").innerHTML = '<i class="fa-solid fa-phone"></i> ' + p.phone + ' | <i class="fa-solid fa-location-dot"></i> ' + p.city + ' - ' + p.address;
    document.getElementById("dispSenderGst").innerText = "GST: " + (p.gst || "N/A");
    var mapLink = document.getElementById("dispSenderMap");
    if (p.map) { mapLink.href = p.map; mapLink.style.display = "inline"; }
    document.getElementById("consignorCardDisplay").style.display = "block";
  } else {
    document.getElementById("receiverNameOnly").value = p.name || "";
    document.getElementById("receiverPhone").value = p.phone || "";
    document.getElementById("receiverCity").value = p.city || "";
    document.getElementById("distance").value = p.distance || "";
    document.getElementById("receiverGst").value = p.gst || "N/A";
    document.getElementById("receiverMap").value = p.map || "";
    document.getElementById("receiverAddressOnly").value = p.address || "";
    document.getElementById("dispReceiverName").innerText = p.name;
    document.getElementById("dispReceiverDetails").innerHTML = '<i class="fa-solid fa-phone"></i> ' + p.phone + ' | <i class="fa-solid fa-location-dot"></i> ' + p.city + ' - ' + p.address;
    document.getElementById("dispReceiverDist").innerText = "Distance: " + (p.distance || "0") + " km";
    document.getElementById("dispReceiverGst").innerText = "GST: " + (p.gst || "N/A");
    var mapLinkRec = document.getElementById("dispReceiverMap");
    if (p.map) { mapLinkRec.href = p.map; mapLinkRec.style.display = "inline"; }
    document.getElementById("consigneeCardDisplay").style.display = "block";
    window.calculateRate();
  }
}

window.deletePartyItem = function(e, type, k) {
  e.stopPropagation();
  var database = getDB();
  if (database && currentSessionUser) {
    var refPath = (type === "consignor") ? "consignor_parties" : "consignee_parties";
    database.ref("companies/" + currentSessionUser.mobile + "/" + refPath + "/" + k).remove(function() {
      window.openPartyModal(type);
      window.showToast("Party Deleted!", false);
    });
  }
};

window.calculateRate = function() {
  var d = parseFloat(document.getElementById("distance").value) || 0;
  var w = parseFloat(document.getElementById("weight").value) || 0;
  var b = 0;
  if (d >= 10 && d <= 20) b = 600;
  else if (d >= 21 && d <= 30) b = 700;
  else if (d >= 31 && d <= 40) b = 800;
  else if (d >= 41 && d <= 50) b = 850;
  else if (d > 50) b = 900;
  else if (d > 0) b = 500;
  var ext = (w >= 51 && w <= 100) ? 100 : 0;
  var tot = b + ext;
  document.getElementById("totalPrice").innerText = "₹" + tot;
  document.getElementById("breakdownText").innerText = "Base: ₹" + b + " + Surcharge: ₹" + ext + " = Total: ₹" + tot;
};

window.togglePaymentDetails = function() {
  var m = document.getElementById("paymentMethod").value;
  document.getElementById("onlineDetails").style.display = m.indexOf("Online") !== -1 ? "block" : "none";
};

window.openPaymentGateway = function() {
  var a = document.getElementById("totalPrice").innerText.replace("₹", "");
  if (!a || a === "0") return window.showToast("Consignee distance & weight enter karein!", true);
  window.open("upi://pay?pa=latikesh1116-2@okhdfcbank&pn=DWITI%20LOGISTICS&am=" + a + "&cu=INR", "_blank");
  if (confirm("Online payment complete ho gaya hai?")) {
    payStatus = "Paid Online";
    var st = document.getElementById("payStatus");
    st.innerText = "Payment Status: Verified ✅";
    st.className = "pay-badge paid";
  }
};

window.bookAndSend = function() {
  if (!document.getElementById("chkConsignmentReady").checked) return window.showToast("Pehle 09:00 AM readiness declaration box par tick karein!", true);

  var sn = document.getElementById("senderName").value.trim();
  var sp = document.getElementById("senderPhone").value.trim();
  var sc = document.getElementById("senderCity").value.trim();
  var sgst = document.getElementById("senderGst").value.trim();
  var smap = document.getElementById("senderMap").value.trim();
  var sa = document.getElementById("senderAddress").value.trim();

  var rn = document.getElementById("receiverNameOnly").value.trim();
  var rp = document.getElementById("receiverPhone").value.trim();
  var rc = document.getElementById("receiverCity").value.trim();
  var rgst = document.getElementById("receiverGst").value.trim();
  var rmap = document.getElementById("receiverMap").value.trim();
  var ra = document.getElementById("receiverAddressOnly").value.trim();

  var ds = document.getElementById("distance").value.trim();
  var wt = document.getElementById("weight").value.trim();
  var numArt = document.getElementById("numArticles").value.trim();
  var packType = document.getElementById("packagingType").value;
  var invNo = document.getElementById("invoiceNo").value.trim();
  var invVal = document.getElementById("invoiceVal").value.trim();
  var gt = document.getElementById("goodsType").value.trim();
  var pm = document.getElementById("paymentMethod").value;
  var pr = document.getElementById("totalPrice").innerText;

  var ewayReq = document.querySelector('input[name="ewayToggle"]:checked').value;
  var ewayNo = document.getElementById("ewayBillNo").value.trim();

  if (!sn || !sp || !smap || !rn || !rp || !rmap || !ds || !wt || !numArt || !packType || !gt || !pm) return window.showToast("Consignor aur Consignee map link aur saare details select/add karein!", true);
  if (ewayReq === "yes" && !ewayNo) return window.showToast("E-Way Bill Number enter karein!", true);

  var userMobile = currentSessionUser ? currentSessionUser.mobile : sp;
  var currentTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  var currentDateStr = new Date().toLocaleDateString();

  bookingData = {
    companyMobile: userMobile,
    trackingId: curTracking,
    date: currentDateStr,
    time: currentTimeStr,
    bookingTime: currentDateStr + " " + currentTimeStr,
    senderName: sn, senderPhone: sp, senderCity: sc, senderGst: sgst, senderMap: smap, senderAddress: sa,
    receiverName: rn, receiverPhone: rp, receiverCity: rc, receiverGst: rgst, receiverMap: rmap, receiverAddress: ra,
    distance: ds, weight: wt, numArticles: numArt, packagingType: packType, invoiceNo: invNo, invoiceVal: invVal,
    goodsType: gt, ewayBillRequired: ewayReq, ewayBillNo: ewayNo || "N/A", totalPrice: pr, paymentMethod: pm,
    paymentStatus: pm.indexOf("Online") !== -1 ? payStatus : pm, trackingStatus: "Booking Confirmed", timestamp: Date.now()
  };

  var btn = document.getElementById("submitBtn");
  btn.disabled = true;
  btn.innerText = "Saving Consignment...";

  var database = getDB();
  database.ref("bookings").push().set(bookingData)
    .then(function () {
      document.getElementById("bookingForm").style.display = "none";
      document.getElementById("successModal").style.display = "block";
      document.getElementById("successText").innerText = "Booking " + curTracking + " Registered Successfully!";
      window.showToast("Booking Registered!", false);
      btn.disabled = false;
      btn.innerText = "Confirm Consignment";
      loadCompanyBookings(userMobile);
      updateLiveTrackingBubble(bookingData);
      window.pushHeaderNotification("📦 New Booking Confirmed! Token: " + curTracking + " to " + rn, true);
    })
    .catch(function (err) {
      btn.disabled = false;
      btn.innerText = "Confirm Consignment";
      window.showToast("Error: " + err.message, true);
    });
};

window.onTrackingLrChange = function(lr) { if (companyBookingsCache[lr]) updateLiveTrackingBubble(companyBookingsCache[lr]); };

window.updateLiveTrackingBubble = function(b) {
  if (!b) return;
  bookingData = b;
  var selector = document.getElementById("trackingLrSelector");
  if (selector && selector.value !== b.trackingId) selector.value = b.trackingId;

  document.getElementById("trkReceiverName").innerText = b.receiverName + " (" + (b.receiverCity || "Navi Mumbai") + ")";
  var statusText = b.trackingStatus || "Booking Confirmed";
  document.getElementById("trkStatusBadge").innerText = statusText;

  ['vStep1', 'vStep2', 'vStep3', 'vStep4'].forEach(function(id) { document.getElementById(id).classList.remove("active"); });
  ['vLine1', 'vLine2', 'vLine3'].forEach(function(id) { document.getElementById(id).classList.remove("active"); });

  document.getElementById("vTime1").innerText = b.bookingTime || (b.date + " " + b.time) || "-";
  document.getElementById("vTime2").innerText = b.driverAssignTime || "-";
  document.getElementById("vTime3").innerText = b.pickupTime || "-";
  document.getElementById("vTime4").innerText = b.deliveryTime || "-";

  var statusNorm = statusText.toLowerCase();
  document.getElementById("vStep1").classList.add("active");
  var canCallDriver = false;

  if (statusNorm.indexOf("driver assign") !== -1) {
    document.getElementById("vStep2").classList.add("active");
    document.getElementById("vLine1").classList.add("active");
    canCallDriver = true;
  } else if (statusNorm.indexOf("pickup complete") !== -1) {
    document.getElementById("vStep2").classList.add("active");
    document.getElementById("vStep3").classList.add("active");
    document.getElementById("vLine1").classList.add("active");
    document.getElementById("vLine2").classList.add("active");
    canCallDriver = true;
    window.pushHeaderNotification("🚚 Pickup Completed for " + b.trackingId + " (" + b.receiverName + ")", true);
  } else if (statusNorm.indexOf("delivered") !== -1) {
    document.getElementById("vStep2").classList.add("active");
    document.getElementById("vStep3").classList.add("active");
    document.getElementById("vStep4").classList.add("active");
    document.getElementById("vLine1").classList.add("active");
    document.getElementById("vLine2").classList.add("active");
    document.getElementById("vLine3").classList.add("active");
    canCallDriver = true;
    window.pushHeaderNotification("🎉 Shipment " + b.trackingId + " DELIVERED to " + b.receiverName + "!", true);
  }

  var btnCall = document.getElementById("btnCallDriver");
  var textCall = document.getElementById("callDriverText");
  if (canCallDriver) {
    btnCall.disabled = false;
    btnCall.classList.remove("disabled");
    textCall.innerText = "Call Driver (" + (b.driverPhone || "Assigned") + ")";
  } else {
    btnCall.disabled = true;
    btnCall.classList.add("disabled");
    textCall.innerText = "Call Driver (Assign Pending)";
  }

  var proofBox = document.getElementById("trackingProofContainer");
  var proofHtml = "";
  if (b.pickupImg) {
    proofHtml += '<div class="proof-img-item"><a href="' + b.pickupImg + '" target="_blank"><img src="' + b.pickupImg + '"/></a><div><span style="font-size:10px;font-weight:700;color:#fff;">Pickup Photo</span><a href="' + b.pickupImg + '" download target="_blank" class="btn-proof-download"><i class="fa-solid fa-download"></i> Download</a></div></div>';
  }
  if (b.deliveryImg) {
    proofHtml += '<div class="proof-img-item"><a href="' + b.deliveryImg + '" target="_blank"><img src="' + b.deliveryImg + '"/></a><div><span style="font-size:10px;font-weight:700;color:#fff;">Delivery Photo</span><a href="' + b.deliveryImg + '" download target="_blank" class="btn-proof-download"><i class="fa-solid fa-download"></i> Download</a></div></div>';
  }
  if (proofHtml !== "") { proofBox.style.display = "flex"; proofBox.innerHTML = proofHtml; } else { proofBox.style.display = "none"; }
};

window.filterBookingsList = function() {
  var query = (document.getElementById("bookingSearchInput").value || "").toLowerCase().trim();
  var filterStatus = document.getElementById("bookingStatusFilter").value;
  var cnt = document.getElementById("companyBookingsList");

  if (!rawBookingsList.length) return;
  var filtered = rawBookingsList.filter(function(b) {
    var bStatus = b.trackingStatus || "Booking Confirmed";
    var statusMatch = (filterStatus === "ALL") || (bStatus.toLowerCase().indexOf(filterStatus.toLowerCase()) !== -1);
    var searchMatch = !query || (b.trackingId && b.trackingId.toLowerCase().indexOf(query) !== -1) || (b.receiverName && b.receiverName.toLowerCase().indexOf(query) !== -1) || (b.receiverCity && b.receiverCity.toLowerCase().indexOf(query) !== -1);
    return statusMatch && searchMatch;
  });

  if (!filtered.length) { cnt.innerHTML = '<div style="text-align:center;color:#94a3b8;padding:15px;">Koi booking match nahi hui.</div>'; return; }

  var h = "";
  filtered.forEach(function (b) {
    var curStatus = b.trackingStatus || 'Booking Confirmed';
    h += '<div class="booking-item-box">' +
      '<div class="booking-item-top"><span class="lr-badge"><i class="fa-solid fa-receipt"></i> ' + (b.trackingId || "LR") + '</span><span style="font-size:11px; font-weight:700; color:var(--text-muted);"><i class="fa-regular fa-clock"></i> ' + (b.date || '') + '</span></div>' +
      '<div class="booking-item-middle"><strong>To:</strong> ' + b.receiverName + ' (' + (b.receiverCity || "Navi Mumbai") + ' - ' + (b.distance || '0') + 'km)</div>' +
      '<div class="booking-item-bottom"><span>' + (b.goodsType || "Goods") + ' (' + (b.numArticles || 1) + ' ' + (b.packagingType || "Pkgs") + ') • ' + b.weight + 'kg</span><strong>' + b.totalPrice + ' (' + b.paymentMethod + ')</strong></div>' +
      '<div style="display:flex; gap:6px; align-items:center; margin-top:6px;">' +
        '<button type="button" class="btn btn-print-lr" style="flex:1; padding:6px 8px; font-size:11px;" onclick=\'printLRDoc(companyBookingsCache["' + b.trackingId + '"])\'><i class="fa-solid fa-print"></i> Print LR</button>' +
        '<div class="booking-card-green-status"><i class="fa-solid fa-circle-check"></i> ' + curStatus + '</div>' +
        '<button type="button" class="btn btn-upi" style="flex:1; padding:6px 8px; font-size:11px;" onclick=\'updateLiveTrackingBubble(companyBookingsCache["' + b.trackingId + '"]); switchMainTab("tracker");\'><i class="fa-solid fa-satellite-dish"></i> Track</button>' +
      '</div></div>';
  });
  cnt.innerHTML = h;
};

function loadCompanyBookings(mob) {
  var cnt = document.getElementById("companyBookingsList");
  var selector = document.getElementById("trackingLrSelector");
  var ticketSelect = document.getElementById("ticketLrSelect");
  var database = getDB();
  if (!database || !cnt || !mob) return;

  database.ref("bookings").on("value", function (s) {
    if (!s.exists()) {
      cnt.innerHTML = '<div style="text-align:center;color:#94a3b8;padding:15px;">Koi booking nahi mili.</div>';
      if (selector) selector.innerHTML = '<option value="">No LR Tokens Found</option>';
      if (ticketSelect) ticketSelect.innerHTML = '<option value="">No LR Available</option>';
      return;
    }
    rawBookingsList = [];
    companyBookingsCache = {};

    s.forEach(function (c) {
      var b = c.val();
      if (b && (b.companyMobile === mob || b.senderPhone === mob)) {
        rawBookingsList.push(b);
        companyBookingsCache[b.trackingId] = b;
      }
    });

    if (!rawBookingsList.length) {
      cnt.innerHTML = '<div style="text-align:center;color:#94a3b8;padding:15px;">Is company ki koi booking nahi hai.</div>';
      return;
    }

    rawBookingsList.reverse();
    if (selector) {
      var selHtml = "";
      rawBookingsList.forEach(function(b) { selHtml += '<option value="' + b.trackingId + '">' + b.trackingId + ' (' + (b.receiverCity || 'Destination') + ')</option>'; });
      selector.innerHTML = selHtml;
    }
    if (ticketSelect) {
      var ticketHtml = '<option value="">-- Select Relevant LR Token --</option>';
      rawBookingsList.forEach(function(b) { ticketHtml += '<option value="' + b.trackingId + '">' + b.trackingId + ' - To: ' + b.receiverName + '</option>'; });
      ticketSelect.innerHTML = ticketHtml;
    }

    if (!bookingData || !companyBookingsCache[bookingData.trackingId]) updateLiveTrackingBubble(rawBookingsList[0]);
    else updateLiveTrackingBubble(companyBookingsCache[bookingData.trackingId]);
    filterBookingsList();
  });
}

window.printLRDoc = function(bData) {
  var b = bData || bookingData;
  if (!b) return window.showToast("Booking details nahi mili!", true);

  var printContainer = document.getElementById("printArea");
  var copyTypes = ["1. CONSIGNOR COPY", "2. POD COPY", "3. CONSIGNEE COPY"];
  var fullHtml = '<div class="a4-page-grid">';

  copyTypes.forEach(function(copyName) {
    fullHtml += '<div class="lr-copy-card"><div class="lr-header"><div class="lr-title-center"><img src="https://i.postimg.cc/CL8jFGXK/IMG-20261012-WA0015-2.jpg" class="print-brand-logo"><p>SAME DAY EXPRESS DELIVERY KALHER TO NAVI MUMBAI</p><span><strong>Contact:</strong> 8149448985 | Kalher, Bhiwandi</span></div><div class="lr-meta"><span class="lr-type-badge">' + copyName + '</span><div class="lr-no"><strong>LR:</strong> ' + b.trackingId + '</div><div class="lr-date"><strong>Date:</strong> ' + b.date + ' ' + b.time + '</div></div></div>' +
      '<div class="lr-body-grid"><div class="lr-box"><h4>CONSIGNOR (SENDER)</h4><strong>' + b.senderName + '</strong><br>Ph: ' + b.senderPhone + ' | GST: ' + (b.senderGst || 'N/A') + '<br>Addr: ' + (b.senderAddress || 'Kalher Hub') + '</div><div class="lr-box"><h4>CONSIGNEE (RECEIVER)</h4><strong>' + b.receiverName + '</strong><br>Ph: ' + b.receiverPhone + ' | GST: ' + (b.receiverGst || 'N/A') + '<br>City/Addr: ' + b.receiverCity + ' (' + (b.distance || '0') + ' km) - ' + (b.receiverAddress || 'Destination Area') + '</div></div>' +
      '<table class="lr-table"><thead><tr><th>Articles / Pack</th><th>Goods Description</th><th>Weight</th><th>E-Way Bill No</th></tr></thead><tbody><tr><td><strong>' + b.numArticles + '</strong> (' + b.packagingType + ')</td><td>' + b.goodsType + '</td><td><strong>' + b.weight + ' kg</strong></td><td>' + (b.ewayBillNo || 'N/A') + '</td></tr></tbody><thead><tr><th>Invoice Val</th><th>Freight Amt</th><th>Goods Type</th><th>Payment Type</th></tr></thead><tbody><tr><td>₹' + (b.invoiceVal || '0') + '</td><td><strong style="font-size:10.5px;">' + b.totalPrice + '</strong></td><td>' + b.goodsType + '</td><td><strong>' + b.paymentMethod + '</strong></td></tr></tbody></table>' +
      '<div class="lr-footer"><div>*Subject to Bhiwandi Jurisdiction. Booked at owner\'s risk.</div><div class="lr-sign-box">Consignor / Driver Sign</div><div class="lr-sign-box">For DWITI LOGISTICS</div></div></div>';
  });

  fullHtml += '</div>';
  printContainer.innerHTML = fullHtml;
  var originalTitle = document.title;
  document.title = (b.trackingId || "DWITI-LR").replace(/[^a-zA-Z0-9_-]/g, "_");
  window.print();
  setTimeout(function() { document.title = originalTitle; }, 1000);
};

window.resetFormForNewBooking = function() {
  document.getElementById("successModal").style.display = "none";
  document.getElementById("bookingForm").style.display = "flex";
  document.getElementById("consigneeCardDisplay").style.display = "none";
  document.getElementById("weight").value = "";
  document.getElementById("numArticles").value = "";
  document.getElementById("packagingType").value = "";
  document.getElementById("invoiceNo").value = "";
  document.getElementById("invoiceVal").value = "";
  document.getElementById("goodsType").value = "";
  document.getElementById("ewayBillNo").value = "";
  document.getElementById("chkConsignmentReady").checked = false;
  window.toggleSubmitButtonReadiness();
  window.toggleEwayField(false);
  document.getElementById("totalPrice").innerText = "₹0";
  listenLRToken();
  loadDefaultConsignorMemory();
};

window.sendWhatsApp = function() {
  if (!bookingData) return;
  var m = "*New Booking - DWITI LOGISTICS*%0A*LR:* " + bookingData.trackingId + "%0A*From:* " + bookingData.senderName + "%0A*To:* " + bookingData.receiverName + "%0A*Distance:* " + bookingData.distance + " km%0A*Articles:* " + bookingData.numArticles + " (" + bookingData.packagingType + ")%0A*E-Way Bill:* " + (bookingData.ewayBillNo || "N/A") + "%0A*Total:* " + bookingData.totalPrice;
  window.open("https://wa.me/918149448985?text=" + m, "_blank");
};

window.addEventListener("load", function () {
  getDB();
  listenLRToken();
  window.switchFaqLanguage("hi");
  var tickerText = document.getElementById("notifTickerText");
  if (tickerText) tickerText.innerText = DEFAULT_NOTIF_TEXT;
  var s = localStorage.getItem("dwiti_user");
  if (s) {
    try {
      currentSessionUser = JSON.parse(s);
      launchPortal(currentSessionUser);
    } catch (e) {}
  }
  var savedTheme = localStorage.getItem("dwiti_selected_theme") || "theme-navy";
  window.changeAppTheme(savedTheme);
});
