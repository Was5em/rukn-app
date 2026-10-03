let SECTIONS = [];
let Profiles = {};
let currentProfileId = null;
let Stats = {};
try {
    const p = localStorage.getItem("rukn_profiles");
    if (p) Profiles = JSON.parse(p);
    const st = localStorage.getItem("rukn_stats");
    if (st) Stats = JSON.parse(st);
} catch (e) {}
if(Object.keys(Profiles).length === 0 && localStorage.getItem("rukn")) {
    try {
        const oldS = JSON.parse(localStorage.getItem("rukn"));
        Profiles['default'] = { name: "بطل ركن الصغار", avatar: "👦", stars: oldS.stars||0, done: oldS.done||{}, streak: 1, lastLogin: new Date().toISOString().split('T')[0], badges: [], soundEnabled: true, screenTimeLimit: 30, screenTimeUsed: 0 };
        Stats['default'] = JSON.parse(localStorage.getItem("rukn_stats")||'{}');
        localStorage.removeItem("rukn");
    } catch(e){}
}
const save = () => {
    try {
        localStorage.setItem("rukn_profiles", JSON.stringify(Profiles));
        localStorage.setItem("rukn_stats", JSON.stringify(Stats));
    } catch (e) {}
};
const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx;
function initAudio() {
    if (!audioCtx) audioCtx = new AudioContext();
    if (audioCtx.state === 'suspended') audioCtx.resume();
}
function playTone(freq, type, duration, vol=0.1) {
    if(!audioCtx) return;
    const p = Profiles[currentProfileId];
    if(p && p.soundEnabled === false) return; 
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(vol, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
}
function triggerHaptic(type) {
    if ('vibrate' in navigator) {
        try {
            if (type === 'tap') navigator.vibrate(30);
            else if (type === 'success') navigator.vibrate([40, 60, 40]);
            else if (type === 'error') navigator.vibrate([80, 50, 80]);
        } catch (e) {}
    }
}
window.showMascotSpeech = (text, duration = 3000) => {
    const existing = document.querySelector('.mascot-bubble');
    if (existing) existing.remove();
    const bubble = document.createElement('div');
    bubble.className = 'mascot-bubble';
    bubble.textContent = text;
    document.body.appendChild(bubble);
    const mascot = document.getElementById('mascot');
    if (mascot) {
        mascot.classList.remove('pop-anim');
        void mascot.offsetWidth;
        mascot.classList.add('pop-anim');
    }
    setTimeout(() => {
        if (bubble.parentElement) bubble.remove();
    }, duration);
};
window.spawnFloatingStar = (targetEl) => {
    const rect = targetEl ? targetEl.getBoundingClientRect() : { left: window.innerWidth / 2, top: window.innerHeight / 2 };
    const star = document.createElement('div');
    star.className = 'floating-star';
    star.textContent = '⭐';
    star.style.left = (rect.left + rect.width / 2 - 16) + 'px';
    star.style.top = (rect.top - 20) + 'px';
    document.body.appendChild(star);
    setTimeout(() => star.remove(), 1200);
};
const sfx = {
    pop: () => { triggerHaptic('tap'); initAudio(); playTone(400, 'sine', 0.1, 0.2); },
    success: () => { 
        triggerHaptic('success');
        initAudio(); 
        playTone(523.25, 'sine', 0.1, 0.15); 
        setTimeout(() => playTone(659.25, 'sine', 0.2, 0.15), 100); 
        setTimeout(() => playTone(783.99, 'sine', 0.4, 0.2), 200); 
    },
    error: () => { 
        triggerHaptic('error');
        initAudio(); 
        playTone(200, 'sawtooth', 0.2, 0.1); 
        setTimeout(() => playTone(150, 'sawtooth', 0.3, 0.1), 150); 
    },
    fanfare: () => {
        triggerHaptic('success');
        initAudio();
        playTone(523.25, 'triangle', 0.2, 0.2);
        setTimeout(() => playTone(659.25, 'triangle', 0.2, 0.2), 200);
        setTimeout(() => playTone(783.99, 'triangle', 0.4, 0.2), 400);
        setTimeout(() => playTone(1046.50, 'triangle', 0.6, 0.2), 600);
    }
};
window.toggleSound = () => {
    const p = Profiles[currentProfileId];
    p.soundEnabled = p.soundEnabled === false ? true : false;
    save();
    document.getElementById('soundBtn').innerText = p.soundEnabled !== false ? '🔊' : '🔇';
    if(p.soundEnabled !== false) sfx.pop();
};
window.showConfetti = () => {
    const container = document.createElement('div');
    container.className = 'confetti-container';
    const colors = ['#F2B233','#E86A5A','#2E9E5B','#0F6B6B','#5CC7C0','#FF69B4'];
    for(let i = 0; i < 50; i++) {
        const c = document.createElement('div');
        c.className = 'confetti';
        c.style.left = Math.random() * 100 + '%';
        c.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        c.style.animationDelay = Math.random() * 2 + 's';
        c.style.animationDuration = (2 + Math.random() * 2) + 's';
        c.style.width = (6 + Math.random() * 8) + 'px';
        c.style.height = (6 + Math.random() * 8) + 'px';
        container.appendChild(c);
    }
    document.body.appendChild(container);
    setTimeout(() => container.remove(), 4000);
};
window.toggleTheme = () => {
    sfx.pop();
    const root = document.documentElement;
    const current = root.getAttribute('data-theme');
    if(current === 'dark') { root.removeAttribute('data-theme'); localStorage.setItem('rukn_theme','light'); }
    else { root.setAttribute('data-theme','dark'); localStorage.setItem('rukn_theme','dark'); }
};
(function(){const t=localStorage.getItem('rukn_theme');if(t==='dark')document.documentElement.setAttribute('data-theme','dark')})();
window.showLeaderboard = () => {
    sfx.pop();
    const sorted = Object.entries(Profiles).sort((a,b) => b[1].stars - a[1].stars);
    const ranks = ['🥇','🥈','🥉'];
    let html = hdr(true) + `<div class="box" style="margin-bottom:100px;"><h2>🏆 لوحة المتصدرين</h2><div class="leaderboard">`;
    sorted.forEach(([id, p], idx) => {
        html += `<div class="leader-row ${idx===0?'gold':''}">
            <span class="leader-rank">${ranks[idx]||idx+1}</span>
            <span style="font-size:30px;">${p.avatar}</span>
            <span class="leader-name">${p.name}</span>
            <span class="leader-stars">⭐ ${p.stars}</span>
        </div>`;
    });
    html += `</div></div>`;
    app.innerHTML = html;
};
window.exportData = () => {
    sfx.pop();
    const data = { profiles: Profiles, stats: Stats, version: 2 };
    const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'rukn_backup_' + new Date().toISOString().split('T')[0] + '.json';
    a.click();
};
window.importData = () => {
    sfx.pop();
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if(!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const data = JSON.parse(ev.target.result);
                if(data.profiles) { Profiles = data.profiles; }
                if(data.stats) { Stats = data.stats; }
                save();
                alert('تم استيراد البيانات بنجاح! ✅');
                location.reload();
            } catch(err) { alert('ملف غير صالح!'); }
        };
        reader.readAsText(file);
    };
    input.click();
};
const ALL_AVATARS = ['👦','👧','🐱','🦁','🐯','🐼'];
const LOCKED_AVATARS = [
    {av:'🦄', need:10, label:'10 نجوم'},
    {av:'🐉', need:25, label:'25 نجمة'},
    {av:'👑', need:50, label:'50 نجمة'},
    {av:'🦅', need:75, label:'75 نجمة'},
    {av:'🌟', need:100, label:'100 نجمة'}
];
function getUnlockedAvatars(stars) {
    return [...ALL_AVATARS, ...LOCKED_AVATARS.filter(a => stars >= a.need).map(a => a.av)];
}
setInterval(() => {
    if(!currentProfileId || document.getElementById('app').style.display !== 'block') return;
    const p = Profiles[currentProfileId];
    if(p.screenTimeLimit === 0) return; 
    p.screenTimeUsed = (p.screenTimeUsed || 0) + (1/60); 
    if(Math.floor((p.screenTimeUsed*60)) % 30 === 0) save(); 
    if(p.screenTimeUsed >= p.screenTimeLimit) {
        showLockScreen();
    }
}, 1000);
window.showLockScreen = () => {
    document.getElementById('app').style.display = 'none';
    document.getElementById('mascot').style.display = 'none';
    const l = document.createElement('div');
    l.className = 'lock-screen';
    l.innerHTML = `
        <div class="lock-icon">⏰</div>
        <h2>انتهى وقت اللعب اليوم!</h2>
        <p>لقد لعبت وتطورت كثيراً اليوم، حان وقت الراحة.</p>
        <button class="go" onclick="this.parentElement.remove(); showProfilesList();">تبديل الحساب</button>
    `;
    document.body.appendChild(l);
};
const recordStat = (question, isCorrect) => {
    if(!currentProfileId) return;
    if(!Stats[currentProfileId]) Stats[currentProfileId] = {};
    const st = Stats[currentProfileId];
    if(!st[question]) st[question] = { attempts: 0, corrects: 0, wrongs: 0 };
    st[question].attempts++;
    if(isCorrect) st[question].corrects++;
    else st[question].wrongs++;
    save();
};
const app = document.getElementById("app");
const pScreen = document.getElementById("profiles-screen");
const mascot = document.getElementById("mascot");
const stopAllAudio = () => {
    try {
        if(window._currentAudio) {
            window._currentAudio.pause();
            window._currentAudio.currentTime = 0;
            window._currentAudio = null;
        }
        if('speechSynthesis' in window) {
            speechSynthesis.cancel();
        }
        document.querySelectorAll('.listen-icon').forEach(ic => ic.textContent = '🔊');
    } catch(e) {}
};

const say = (t, audioFile) => {
    try {
        const p = Profiles[currentProfileId];
        if(p && p.soundEnabled === false) return; 
        stopAllAudio();
        const a = new Audio(`audio/${audioFile}`);
        window._currentAudio = a;
        a.play().catch(e => {
            console.log(`Missing human audio: audio/${audioFile}. Playing robot voice instead.`);
            stopAllAudio();
            const u = new SpeechSynthesisUtterance(t);
            u.lang = "ar-SA";
            u.rate = 0.8;
            speechSynthesis.speak(u);
        });
    } catch (e) {}
};
const shuf = a => {
    let b = a.slice();
    for (let i = b.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [b[i], b[j]] = [b[j], b[i]];
    }
    return b;
};
async function init() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => { navigator.serviceWorker.register('./sw.js'); });
    }
    try {
        const res = await fetch('data.json');
        SECTIONS = await res.json();
        setTimeout(() => {
            const splash = document.getElementById('splash');
            if(splash) {
                splash.style.opacity = '0';
                setTimeout(() => {
                    splash.style.display = 'none';
                    checkProfiles();
                }, 500);
            } else checkProfiles();
        }, 1500);
    } catch(e) {
        console.error(e);
        document.getElementById('splash').style.display = 'none';
        app.style.display = 'block';
        app.innerHTML = "<p style='text-align:center;'>خطأ في تحميل البيانات.</p>";
    }
}
function checkProfiles() {
    if(Object.keys(Profiles).length === 0) {
        showNewProfileForm();
    } else {
        showProfilesList();
    }
}
window.showProfilesList = () => {
    sfx.pop();
    app.style.display = 'none';
    mascot.style.display = 'none';
    pScreen.style.display = 'block';
    let html = `<h2>من سيلعب اليوم؟</h2>`;
    Object.entries(Profiles).forEach(([id, p]) => {
        html += `<div class="profile-card" onclick="login('${id}')">
            <span class="profile-avatar">${p.avatar}</span>
            <span class="profile-title">${p.name}</span>
            <span class="stars">⭐ ${p.stars}</span>
        </div>`;
    });
    html += `<button class="add-profile" onclick="showNewProfileForm()">+ إضافة بطل جديد</button>`;
    pScreen.innerHTML = html;
};
window.showNewProfileForm = () => {
    sfx.pop();
    app.style.display = 'none';
    mascot.style.display = 'none';
    pScreen.style.display = 'block';
    const totalStars = Object.values(Profiles).reduce((sum,p) => sum + (p.stars||0), 0);
    const unlocked = getUnlockedAvatars(totalStars);
    let avatarHtml = ALL_AVATARS.map(a => `<button class="w" onclick="selectAv(this, '${a}')">${a}</button>`).join('');
    LOCKED_AVATARS.forEach(la => {
        if(totalStars >= la.need) {
            avatarHtml += `<button class="w" onclick="selectAv(this, '${la.av}')">${la.av}</button>`;
        } else {
            avatarHtml += `<button class="w avatar-locked" disabled title="يحتاج ${la.label}">🔒${la.av}</button>`;
        }
    });
    pScreen.innerHTML = `
        <h2>بطل جديد!</h2>
        <p>ما اسمك؟</p>
        <input type="text" id="pName" class="profile-input" placeholder="اسم البطل">
        <div class="row" style="margin-bottom:15px;" id="pAvatars">
            ${avatarHtml}
        </div>
        <button class="go" onclick="createProfile()">ابدأ اللعب</button>
        ${Object.keys(Profiles).length > 0 ? '<br><button class="back" onclick="showProfilesList()" style="margin-top:10px;">إلغاء</button>' : ''}
    `;
    window.selectedAvatar = '👦';
};
window.selectAv = (btn, av) => {
    sfx.pop();
    document.querySelectorAll('#pAvatars .w').forEach(b => b.style.opacity = '0.5');
    btn.style.opacity = '1';
    window.selectedAvatar = av;
};
window.createProfile = () => {
    sfx.pop();
    const name = document.getElementById('pName').value.trim();
    if(!name) return alert('يرجى كتابة الاسم');
    const id = 'p_' + Date.now();
    Profiles[id] = { name, avatar: window.selectedAvatar, stars: 0, done: {}, streak: 0, lastLogin: null, badges: [], soundEnabled: true, screenTimeLimit: 30, screenTimeUsed: 0 };
    save();
    login(id);
};
window.login = (id) => {
    sfx.pop();
    currentProfileId = id;
    const p = Profiles[id];
    if(p.screenTimeLimit === undefined) p.screenTimeLimit = 30;
    if(p.screenTimeUsed === undefined) p.screenTimeUsed = 0;
    const today = new Date().toISOString().split('T')[0];
    if(p.lastLogin !== today) {
        if(p.lastLogin) {
            const last = new Date(p.lastLogin);
            const now = new Date(today);
            const diffDays = Math.round(Math.abs((now - last) / (1000 * 60 * 60 * 24)));
            if(diffDays === 1) p.streak++;
            else p.streak = 1;
        } else {
            p.streak = 1;
        }
        p.lastLogin = today;
        p.screenTimeUsed = 0; 
        save();
    }
    if (p.screenTimeLimit > 0 && p.screenTimeUsed >= p.screenTimeLimit) {
        showLockScreen();
        return;
    }
    pScreen.style.display = 'none';
    app.style.display = 'block';
    mascot.style.display = 'block';
    home();
};
const hdr = (back, showParents = true) => {
    const p = Profiles[currentProfileId];
    const themeIcon = document.documentElement.getAttribute('data-theme') === 'dark' ? '☀️' : '🌙';
    return `
  <header>
    ${back ? `<button class="back" id="bk" onclick="sfx.pop(); home()">→ الرئيسية</button>` : `<h1 style="font-size:20px;">${p.avatar} ${p.name}</h1>`}
    <div class="header-stats">
        ${p.streak > 0 && !back ? `<span class="streak" title="سلسلة أيام متتالية">🔥 ${p.streak}</span>` : ''}
        ${!back ? `<button class="parents-btn" id="soundBtn" onclick="toggleSound()" title="تشغيل/إيقاف الصوت">${p.soundEnabled !== false ? '🔊' : '🔇'}</button>` : ''}
        ${!back ? `<button class="parents-btn" onclick="toggleTheme()" title="تغيير المظهر">${themeIcon}</button>` : ''}
        ${showParents && !back ? '<button class="parents-btn" onclick="parentsDashboard()">لوحة الأهل</button>' : ''}
        ${!back && Object.keys(Profiles).length > 1 ? '<button class="parents-btn" onclick="showLeaderboard()">🏆</button>' : ''}
        ${!back ? '<button class="parents-btn" onclick="showProfilesList()">تغيير</button>' : ''}
        <span class="stars">⭐ ${p.stars}</span>
    </div>
  </header>`;
};
function checkBadges(p) {
    let newBadge = false;
    if(!p.badges) p.badges = [];
    Object.keys(p.done).forEach(secId => {
        if(secId === 'smart_review') return;
        if(p.done[secId].length >= 3 && !p.badges.includes(secId)) {
            p.badges.push(secId);
            newBadge = true;
        }
    });
    if(newBadge) {
        sfx.fanfare();
        save();
    }
}
function renderBadges() {
    const p = Profiles[currentProfileId];
    const allBadges = [
        {id:'dua', e:'📿', title:'حافظ الأدعية'},
        {id:'story', e:'📖', title:'بطل القصص'},
        {id:'good', e:'🤝', title:'صاحب الأخلاق'},
        {id:'wudu_salah', e:'🕌', title:'المصلي الصغير'},
        {id:'alphabet', e:'🔤', title:'عاشق الحروف'},
        {id:'names', e:'✨', title:'العارف بالله'}
    ];
    let html = `<div class="badges-container"><small style="width:100%;text-align:center;font-weight:bold;display:block;">شاراتي (أوسمة الإنجاز):</small><br>`;
    allBadges.forEach(b => {
        const earned = (p.badges||[]).includes(b.id) ? 'earned' : '';
        html += `<span class="badge ${earned}" title="${b.title}">${b.e}</span>`;
    });
    html += `</div>`;
    return html;
}
function generateSmartReview() {
    const st = Stats[currentProfileId] || {};
    let reviewQuestions = [];
    SECTIONS.forEach(sec => {
        if(!sec.r) return;
        sec.r.forEach((r, idx) => {
            if(st[r.p] && st[r.p].wrongs > 0) {
                reviewQuestions.push({...r, originalSec: sec.id, originalIdx: idx});
            }
        });
    });
    if(reviewQuestions.length === 0) return null;
    reviewQuestions.sort((a,b) => st[b.p].wrongs - st[a.p].wrongs);
    reviewQuestions = reviewQuestions.slice(0, 5); 
    return { id: "smart_review", t: "المراجعة الذكية", e: "🧠", r: reviewQuestions };
}
window.home = () => {
  stopAllAudio();
  const p = Profiles[currentProfileId];
  checkBadges(p);
  const dailySec = SECTIONS.find(s => s.id === 'daily');
  let dailyHtml = '';
  if(dailySec && dailySec.r.length > 0) {
      const dayIdx = new Date().getDate() % dailySec.r.length;
      const dua = dailySec.r[dayIdx];
      dailyHtml = `<div class="box" style="margin-bottom:14px;border-color:var(--gold);background:rgba(242,178,51,0.08);">
          <small style="color:var(--gold);font-weight:bold;">🌟 ذكر اليوم</small>
          <p style="font-size:22px;margin:8px 0;">${dua.p}</p>
          ${dua.ref ? `<small style="opacity:0.6;">(${dua.ref})</small>` : ''}
      </div>`;
  }
  const smartSec = generateSmartReview();
  const displaySections = smartSec ? [smartSec, ...SECTIONS.filter(s => s.id !== 'daily')] : SECTIONS.filter(s => s.id !== 'daily');
  app.innerHTML = hdr(false) + renderBadges() + dailyHtml + `<div class="menu" style="position:relative; z-index:2;">` + displaySections.map(s => {
    const n = s.r.filter(r => r.k !== "story" && r.k !== "listen" && r.k !== "daily").length;
    let d = 0;
    if(s.id === 'smart_review') d = 0;
    else d = (p.done[s.id] || []).length;
    const style = s.id === 'smart_review' ? 'border-color:var(--teal);background:rgba(15,107,107,0.1)' : '';
    const smallText = s.id === 'smart_review' ? 'أسئلة تحتاج تدريب' : `${d} من ${n}`;
    return `<button class="tile" data-id="${s.id}" style="${style}"><span class="e">${s.e}</span>${s.t}<small>${smallText}</small><div class="bar"><i style="width:${n>0 && s.id!=='smart_review' ? (d / n * 100) : 0}%"></i></div></button>`;
  }).join("") + `</div>
  <button class="go" onclick="sfx.pop(); startChallenge()" style="width:100%;margin-top:14px;background:var(--coral);">🏆 وضع التحدي (مؤقت زمني)</button>
  <button class="go" onclick="sfx.pop(); startMemoryGame()" style="width:100%;margin-top:8px;background:var(--gold);color:#3b2a00;">🧠 لعبة الذاكرة</button>
  <button class="go" onclick="sfx.pop(); showFavorites()" style="width:100%;margin-top:8px;background:var(--teal);">⭐ المفضلة</button>
  <button class="go" onclick="sfx.pop(); showRewardShop()" style="width:100%;margin-top:8px;background:linear-gradient(135deg,var(--coral),var(--gold));">🎁 متجر المكافآت</button>
  <a href="privacy.html" class="about-link">عن التطبيق وسياسة الخصوصية</a>
  <br><br><br>`;
  app.querySelectorAll(".tile").forEach(b => b.onclick = () => { 
      sfx.pop(); 
      play(displaySections.find(s => s.id === b.dataset.id), 0); 
  });
};
window.parentsDashboard = () => {
    sfx.pop();
    const savedPin = localStorage.getItem('rukn_parent_pin');
    if(savedPin) {
        const entered = prompt('أدخل الرمز السري للأهل:');
        if(entered !== savedPin) { alert('الرمز غير صحيح!'); return; }
    } else {
        const newPin = prompt('مرحباً! قم بإنشاء رمز سري (4 أرقام) للوحة الأهل:');
        if(!newPin || newPin.length < 4) { alert('يرجى إدخال 4 أرقام على الأقل'); return; }
        localStorage.setItem('rukn_parent_pin', newPin);
    }
    const p = Profiles[currentProfileId];
    const st = Stats[currentProfileId] || {};
    app.innerHTML = hdr(true, false) + `
        <div class="box" style="margin-bottom:100px;">
            <h2>لوحة الأهل المتقدمة</h2>
            <div style="background:var(--bg); padding:12px; border-radius:12px; margin-bottom:15px; border:2px dashed var(--line); text-align:right;">
                <h3 style="margin-top:0; color:var(--teal);">⏱️ وقت الشاشة اليومي</h3>
                <p style="margin:5px 0;">تم استهلاك: <b>${Math.floor(p.screenTimeUsed)}</b> دقيقة من أصل <b>${p.screenTimeLimit === 0 ? 'مفتوح' : p.screenTimeLimit}</b> دقيقة.</p>
                <div style="display:flex; align-items:center; margin-top:10px;">
                    <label style="flex-grow:1; font-size:16px;">الحد اليومي (بالدقائق): </label>
                    <input type="number" id="limitInput" class="setting-input" value="${p.screenTimeLimit}" min="0" max="180">
                    <button class="parents-btn" onclick="updateScreenTime()">حفظ</button>
                </div>
                <small style="opacity:0.7; display:block; margin-top:5px;">(اجعل الحد 0 لإلغاء القفل الزمني)</small>
            </div>
            <h3 style="text-align:right; color:var(--teal);">📊 تحليل الأداء</h3>
            <table class="stats-table">
                <thead><tr><th style="width:50%">الدرس</th><th>نجاح</th><th>أخطاء</th></tr></thead>
                <tbody>
                    ${Object.entries(st).map(([q, s]) => {
                        const total = s.corrects + s.wrongs;
                        const pct = Math.round((s.corrects / total) * 100) || 0;
                        const color = pct >= 80 ? 'var(--ok)' : (pct >= 50 ? 'var(--gold)' : 'var(--coral)');
                        return `<tr>
                            <td style="font-size:14px; text-align:right;">${q}</td>
                            <td>
                                <div class="bar" style="height:8px; margin:0; border-radius:4px;"><i style="width:${pct}%; background:${color}; border-radius:4px;"></i></div>
                                <small>${pct}%</small>
                            </td>
                            <td style="color:var(--coral); font-weight:bold;">${s.wrongs}</td>
                        </tr>`;
                    }).join('')}
                    ${Object.keys(st).length === 0 ? '<tr><td colspan="3" style="text-align:center;">لم يتم تسجيل بيانات بعد.</td></tr>' : ''}
                </tbody>
            </table>
            <br>
            <h3 style="text-align:right; color:var(--teal);">⚙️ إعدادات إضافية</h3>
            <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin-bottom:10px;">
                <button class="parents-btn" onclick="changeFontSize(16)">خط صغير</button>
                <button class="parents-btn" onclick="changeFontSize(20)">خط عادي</button>
                <button class="parents-btn" onclick="changeFontSize(24)">خط كبير</button>
            </div>
            <button class="go" onclick="requestReminder()" style="background:var(--teal);width:100%;">🔔 تفعيل تذكيرات الأذكار</button>
            <button class="go" onclick="shareScore()" style="background:var(--ok);width:100%;">📱 مشاركة الإنجاز على واتساب</button>
            <br>
            <button class="go" onclick="exportData()" style="background:var(--teal);">📥 تصدير البيانات</button>
            <button class="go" onclick="importData()" style="background:var(--teal);">📤 استيراد بيانات</button>
            <br>
            <button class="go" id="resetBtn" style="background:var(--coral)">مسح البيانات للطفل الحالي</button>
        </div>
    `;
    document.getElementById("resetBtn").onclick = () => {
        sfx.pop();
        if(confirm('متأكد من مسح بيانات الأداء؟')) {
            p.stars = 0; p.done = {}; p.badges = []; p.screenTimeUsed = 0;
            Stats[currentProfileId] = {};
            save();
            parentsDashboard();
        }
    };
};
window.updateScreenTime = () => {
    sfx.pop();
    const val = parseInt(document.getElementById('limitInput').value);
    if(val >= 0 && val <= 300) {
        Profiles[currentProfileId].screenTimeLimit = val;
        save();
        alert('تم حفظ الحد اليومي بنجاح!');
        parentsDashboard();
    } else {
        alert('يرجى إدخال رقم صحيح');
    }
};
function finish(sec, i, key) {
  const p = Profiles[currentProfileId];
  if(sec.id !== 'smart_review') {
      const d = p.done[sec.id] || (p.done[sec.id] = []);
      if (!d.includes(key)) {
        d.push(key);
        p.stars++;
        const starsEl = document.querySelector('.stars');
        if(starsEl) {
            starsEl.classList.remove('pop-anim');
            void starsEl.offsetWidth; 
            starsEl.classList.add('pop-anim');
            starsEl.innerHTML = `⭐ ${p.stars}`;
            spawnFloatingStar(starsEl);
        }
        showMascotSpeech('رائع يا بطل! 🌟');
        save();
      }
  }
  setTimeout(() => play(sec, i + 1), 900);
}
window.play = (sec, i) => {
  app.classList.remove('page-enter');
  void app.offsetWidth;
  app.classList.add('page-enter');
  if (sec.r && sec.r[0] && sec.r[0].k === 'listen') {
    app.innerHTML = hdr(true);
    const box = document.createElement("div");
    box.className = "box";
    box.style.marginBottom = "100px";
    let html = `<div class="big">${sec.e}</div><h2>${sec.t}</h2>`;
    sec.r.forEach((r, idx) => {
        html += `<div class="profile-card listen-item" data-idx="${idx}" style="margin:8px 0; background:var(--bg); cursor:pointer;">
            <span class="profile-avatar">${r.e}</span>
            <span class="profile-title">${r.p}</span>
            <span class="listen-icon" style="font-size:28px;">🔊</span>
        </div>`;
    });
    box.innerHTML = html;
    box.querySelectorAll('.listen-item').forEach(item => {
        item.onclick = () => {
            const r = sec.r[parseInt(item.dataset.idx)];
            const audioSrc = `audio/${r.a}`;
            
            if (window._currentAudio && window._currentAudio.datasetSrc === audioSrc) {
                if (window._currentAudio.paused) {
                    window._currentAudio.play();
                    item.querySelector('.listen-icon').textContent = '⏸️';
                } else {
                    window._currentAudio.pause();
                    item.querySelector('.listen-icon').textContent = '▶️';
                }
                return;
            }

            sfx.pop();
            stopAllAudio();

            item.querySelector('.listen-icon').textContent = '⏳';
            const a = new Audio(audioSrc);
            a.datasetSrc = audioSrc;
            window._currentAudio = a;

            a.oncanplaythrough = () => {
                if (window._currentAudio === a && !a.paused) {
                    item.querySelector('.listen-icon').textContent = '⏸️';
                }
            };
            a.onplay = () => {
                item.querySelector('.listen-icon').textContent = '⏸️';
            };
            a.onpause = () => {
                if (window._currentAudio === a) {
                    item.querySelector('.listen-icon').textContent = '▶️';
                }
            };
            a.onended = () => {
                item.querySelector('.listen-icon').textContent = '🔊';
                if (window._currentAudio === a) window._currentAudio = null;
            };
            a.onerror = () => {
                item.querySelector('.listen-icon').textContent = '🔊';
                if (window._currentAudio === a) window._currentAudio = null;
            };
            a.play().catch(e => {
                item.querySelector('.listen-icon').textContent = '🔊';
            });
        };
    });
    app.appendChild(box);
    return;
  }
  if (i >= sec.r.length) {
    sfx.fanfare();
    showConfetti();
    showMascotSpeech('مبارك يا بطل! أنهيت هذا القسم بنجاح 🎉');
    app.innerHTML = hdr(true) + `<div class="box" style="margin-bottom:100px;"><div class="big">🎉</div><h2>أحسنت يا بطل!</h2><p>أنهيت قسم ${sec.t}</p><button class="go" onclick="sfx.pop(); play(SECTIONS.find(s=>s.id==='${sec.id}') || sec, 0)">العب مرة أخرى</button></div>`;
    return;
  }
  const r = sec.r[i];
  app.innerHTML = hdr(true);
  const box = document.createElement("div");
  box.className = "box";
  box.style.marginBottom = "100px";
  app.appendChild(box);
  if (r.k === "story") {
    box.innerHTML = `<div class="big">${r.e}</div><p style="font-size:22px;line-height:1.8;">${r.x}</p><button class="go" id="lst">🔊 اسمع القصة</button> <button class="go" onclick="sfx.pop(); play(SECTIONS.find(s=>s.id==='${sec.id}') || sec, ${i+1})">التالي ➔</button>`;
    box.querySelector("#lst").onclick = () => { sfx.pop(); say(r.x, `${sec.id}_${i}.mp3`); };
  } else if (r.k === "choice") {
    const isFav = JSON.parse(localStorage.getItem('rukn_favorites') || '[]').includes(r.p);
    box.innerHTML = `<button class="parents-btn" style="position:absolute;top:12px;left:12px;" onclick="toggleFavorite('${r.p.replace(/'/g,"\\'")}')" title="إضافة للمفضلة">${isFav?'⭐ بالمفضلة':'☆ إضافه للمفضلة'}</button>
        <div class="big">${r.e || "❓"}</div><p style="font-size:22px;font-weight:bold;">${r.p}</p>
        ${r.ref ? `<small style="display:block;opacity:0.6;margin-bottom:8px;">(${r.ref})</small>` : ''}
        <div id="os"></div><div class="msg" id="m"></div>`;
    const os = box.querySelector("#os");
    let locked = false;
    shuf(r.o.map((t, n) => ({ t, n }))).forEach(o => {
      const b = document.createElement("button");
      b.className = "opt";
      b.textContent = o.t;
      b.onclick = () => {
        if (locked) return;
        if (o.n === r.c) {
          locked = true;
          sfx.success();
          spawnFloatingStar(b);
          showMascotSpeech('إجابة ممتازة يا بطل! 🌟');
          b.classList.add("good");
          box.querySelector("#m").textContent = r.f + " ⭐";
          recordStat(r.p, true);
          finish(sec, i, r.originalIdx !== undefined ? r.originalIdx : i);
        } else {
          sfx.error();
          showMascotSpeech('حاول مرة أخرى! أنت تستطيع 💪');
          b.classList.add("bad", "shake");
          box.querySelector("#m").textContent = "حاول مرة أخرى 💪";
          box.querySelector("#m").style.color = "var(--coral)";
          recordStat(r.p, false);
          setTimeout(() => { b.classList.remove("bad", "shake"); }, 500);
        }
      };
      os.appendChild(b);
    });
  } else {
    const words = r.a.split(r.sep || " ");
    const isFav = JSON.parse(localStorage.getItem('rukn_favorites') || '[]').includes(r.p);
    box.innerHTML = `<button class="parents-btn" style="position:absolute;top:12px;left:12px;" onclick="toggleFavorite('${r.p.replace(/'/g,"\\'")}')" title="إضافة للمفضلة">${isFav?'⭐ بالمفضلة':'☆ إضافه للمفضلة'}</button>
        <div class="big">${r.e}</div><p style="font-size:22px;font-weight:bold;">${r.p}</p>
        ${r.ref ? `<small style="display:block;opacity:0.6;margin-bottom:8px;">(${r.ref})</small>` : ''}
        <div class="row ans" id="an"></div><div class="row" id="pl"></div><div class="msg" id="m"></div><button class="go" id="lst">🔊 اسمع</button>`;
    const an = box.querySelector("#an"), pl = box.querySelector("#pl");
    let next = 0;
    let mistakes = 0;
    box.querySelector("#lst").onclick = () => { sfx.pop(); say(words.join(" "), `${sec.id}_${i}.mp3`); };
    shuf(words.map((t, n) => ({ t, n }))).forEach(o => {
      const b = document.createElement("button");
      b.className = "w";
      b.textContent = o.t;
      b.onclick = () => {
        if (o.n === next) {
          sfx.pop();
          an.appendChild(b);
          b.disabled = true;
          next++;
          if (next === words.length) {
            say(words.join(" "), `${sec.id}_${i}.mp3`);
            sfx.success();
            spawnFloatingStar(b);
            showMascotSpeech('ترتيب صحيح 100%! 👏');
            box.querySelector("#m").textContent = "ما شاء الله! ⭐";
            box.querySelector("#m").style.color = "var(--ok)";
            recordStat(r.p, mistakes === 0);
            finish(sec, i, r.originalIdx !== undefined ? r.originalIdx : i);
          }
        } else {
          sfx.error();
          mistakes++;
          recordStat(r.p, false);
          b.classList.add("shake");
          box.querySelector("#m").textContent = "حاول مرة أخرى 💪";
          box.querySelector("#m").style.color = "var(--coral)";
          setTimeout(() => { b.classList.remove("shake"); }, 300);
        }
      };
      pl.appendChild(b);
    });
  }
};
window.startChallenge = () => {
    sfx.pop();
    let allQ = [];
    SECTIONS.forEach(sec => {
        if(!sec.r) return;
        sec.r.forEach(r => { if(r.k === 'choice') allQ.push({...r}); });
    });
    if(allQ.length < 5) { alert('لا يوجد أسئلة كافية للتحدي'); return; }
    const questions = shuf(allQ).slice(0, 10);
    let score = 0, qIdx = 0;
    function showQ() {
        if(qIdx >= questions.length) {
            sfx.fanfare();
            showConfetti();
            const p = Profiles[currentProfileId];
            p.stars += score;
            save();
            app.innerHTML = hdr(true) + `<div class="box" style="margin-bottom:100px;">
                <div class="big">🏆</div>
                <h2>انتهى التحدي!</h2>
                <p style="font-size:28px;">حصلت على <b>${score}</b> من <b>${questions.length}</b></p>
                <p>${score >= 8 ? 'ما شاء الله! أنت بطل حقيقي! 🌟' : score >= 5 ? 'أحسنت! حاول مرة أخرى للحصول على درجة أعلى 💪' : 'لا بأس! التكرار يصنع المعجزات 🔄'}</p>
                <button class="go" onclick="sfx.pop(); startChallenge()">حاول مرة أخرى</button>
            </div>`;
            return;
        }
        const r = questions[qIdx];
        app.innerHTML = hdr(true, false);
        const box = document.createElement('div');
        box.className = 'box';
        box.style.marginBottom = '100px';
        box.innerHTML = `<span class="challenge-badge">سؤال ${qIdx+1} من ${questions.length}</span>
            <div class="big">${r.e||'❓'}</div><p>${r.p}</p>
            <div class="timer-bar"><i id="tbar" style="width:100%"></i></div>
            <div class="timer-text" id="ttxt">⏰ 10</div>
            <div id="os"></div><div class="msg" id="m"></div>`;
        app.appendChild(box);
        let timeLeft = 10;
        let locked = false;
        const timer = setInterval(() => {
            timeLeft -= 0.1;
            const pct = Math.max(0, (timeLeft/10)*100);
            const tbar = document.getElementById('tbar');
            const ttxt = document.getElementById('ttxt');
            if(tbar) tbar.style.width = pct + '%';
            if(tbar && pct < 30) tbar.style.background = 'var(--coral)';
            if(ttxt) ttxt.textContent = '⏰ ' + Math.ceil(timeLeft);
            if(timeLeft <= 0) {
                clearInterval(timer);
                if(!locked) { locked = true; sfx.error(); box.querySelector('#m').textContent = 'انتهى الوقت! ⏰'; box.querySelector('#m').style.color = 'var(--coral)'; setTimeout(()=>{qIdx++;showQ()},1200); }
            }
        }, 100);
        const os = box.querySelector('#os');
        shuf(r.o.map((t,n)=>({t,n}))).forEach(o => {
            const b = document.createElement('button');
            b.className = 'opt';
            b.textContent = o.t;
            b.onclick = () => {
                if(locked) return;
                locked = true;
                clearInterval(timer);
                if(o.n === r.c) { sfx.success(); b.classList.add('good'); box.querySelector('#m').textContent = '✅ صحيح! +1'; score++; }
                else { sfx.error(); b.classList.add('bad'); box.querySelector('#m').textContent = '❌ خطأ!'; box.querySelector('#m').style.color = 'var(--coral)'; }
                setTimeout(()=>{qIdx++;showQ()},1200);
            };
            os.appendChild(b);
        });
    }
    showQ();
};
window.startMemoryGame = () => {
    sfx.pop();
    const emojis = ['🕌','🌙','⭐','📖','🤲','💧','🕋','🌴'];
    const cards = shuf([...emojis, ...emojis]);
    let flipped = [], matched = 0, moves = 0, locked = false;
    app.innerHTML = hdr(true, false);
    const box = document.createElement('div');
    box.className = 'box';
    box.style.marginBottom = '100px';
    box.innerHTML = `<h2>🧠 لعبة الذاكرة</h2><p>اقلب البطاقات وجد الأزواج المتشابهة!</p>
        <div id="moves" style="font-weight:bold;">المحاولات: 0</div>
        <div id="mgrid" style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:12px;"></div>`;
    app.appendChild(box);
    const grid = box.querySelector('#mgrid');
    cards.forEach((emoji, idx) => {
        const card = document.createElement('button');
        card.style.cssText = 'height:70px;font-size:32px;border-radius:12px;border:3px solid var(--line);background:var(--teal);color:var(--teal);cursor:pointer;transition:0.3s;';
        card.dataset.idx = idx;
        card.dataset.emoji = emoji;
        card.textContent = '❓';
        card.onclick = () => {
            if(locked || flipped.includes(card) || card.dataset.matched) return;
            sfx.pop();
            card.textContent = emoji;
            card.style.background = 'var(--card)';
            card.style.color = 'var(--ink)';
            flipped.push(card);
            if(flipped.length === 2) {
                moves++;
                box.querySelector('#moves').textContent = 'المحاولات: ' + moves;
                locked = true;
                if(flipped[0].dataset.emoji === flipped[1].dataset.emoji) {
                    sfx.success();
                    flipped[0].dataset.matched = '1';
                    flipped[1].dataset.matched = '1';
                    flipped[0].style.borderColor = 'var(--ok)';
                    flipped[1].style.borderColor = 'var(--ok)';
                    matched++;
                    flipped = [];
                    locked = false;
                    if(matched === emojis.length) {
                        sfx.fanfare(); showConfetti();
                        const p = Profiles[currentProfileId];
                        const bonus = moves <= 16 ? 3 : moves <= 24 ? 2 : 1;
                        p.stars += bonus; save();
                        setTimeout(() => {
                            box.innerHTML += `<div style="margin-top:12px;"><h2>🎉 أحسنت!</h2><p>أنهيت اللعبة في ${moves} محاولة وحصلت على ${bonus} نجوم!</p><button class="go" onclick="startMemoryGame()">العب مرة أخرى</button></div>`;
                        }, 500);
                    }
                } else {
                    sfx.error();
                    setTimeout(() => {
                        flipped.forEach(c => { c.textContent = '❓'; c.style.background = 'var(--teal)'; c.style.color = 'var(--teal)'; });
                        flipped = [];
                        locked = false;
                    }, 800);
                }
            }
        };
        grid.appendChild(card);
    });
};
window.toggleFavorite = (text) => {
    sfx.pop();
    let favs = JSON.parse(localStorage.getItem('rukn_favorites') || '[]');
    if(favs.includes(text)) favs = favs.filter(f => f !== text);
    else favs.push(text);
    localStorage.setItem('rukn_favorites', JSON.stringify(favs));
};
window.showFavorites = () => {
    sfx.pop();
    const favs = JSON.parse(localStorage.getItem('rukn_favorites') || '[]');
    app.innerHTML = hdr(true);
    const box = document.createElement('div');
    box.className = 'box';
    box.style.marginBottom = '100px';
    if(favs.length === 0) {
        box.innerHTML = `<div class="big">⭐</div><h2>المفضلة فارغة</h2><p>اضغط على ⭐ بجانب أي دعاء لإضافته هنا</p>`;
    } else {
        let html = `<div class="big">⭐</div><h2>المفضلة (${favs.length})</h2>`;
        favs.forEach(f => {
            html += `<div class="profile-card" style="margin:8px 0;background:var(--bg);">
                <span style="flex-grow:1;text-align:right;font-size:18px;">${f}</span>
                <button class="parents-btn" onclick="toggleFavorite('${f.replace(/'/g,"\\'")}'); showFavorites();">❌</button>
            </div>`;
        });
        box.innerHTML = html;
    }
    app.appendChild(box);
};
const SHOP_THEMES = [
    {id:'theme_ocean', name:'🌊 ثيم المحيط', cost:15, colors:{'--bg':'#E3F2FD','--card':'#BBDEFB','--teal':'#1565C0','--line':'#90CAF9'}},
    {id:'theme_forest', name:'🌲 ثيم الغابة', cost:20, colors:{'--bg':'#E8F5E9','--card':'#C8E6C9','--teal':'#2E7D32','--line':'#A5D6A7'}},
    {id:'theme_sunset', name:'🌅 ثيم الغروب', cost:25, colors:{'--bg':'#FFF3E0','--card':'#FFE0B2','--teal':'#E65100','--line':'#FFCC80'}},
    {id:'theme_space', name:'🚀 ثيم الفضاء', cost:30, colors:{'--bg':'#1a1a2e','--card':'#16213e','--ink':'#e0e0ff','--teal':'#9D4EDD','--line':'#2d3561'}},
    {id:'theme_ramadan', name:'🌙 ثيم رمضان', cost:20, colors:{'--bg':'#1B2838','--card':'#233044','--ink':'#FFEECB','--teal':'#D4AF37','--gold':'#FFD700','--line':'#3A4A5C'}}
];
window.showRewardShop = () => {
    sfx.pop();
    const p = Profiles[currentProfileId];
    const owned = JSON.parse(localStorage.getItem('rukn_owned_themes') || '[]');
    app.innerHTML = hdr(true);
    const box = document.createElement('div');
    box.className = 'box';
    box.style.marginBottom = '100px';
    let html = `<div class="big">🎁</div><h2>متجر المكافآت</h2><p>اصرف نجومك على ثيمات جديدة!</p><p>رصيدك: ⭐ ${p.stars}</p>`;
    html += `<div class="profile-card" style="margin:8px 0;background:var(--bg);cursor:pointer;" onclick="sfx.pop(); resetThemeColors(); home();">
        <span class="profile-avatar">🔄</span><span class="profile-title">الثيم الأصلي</span><span class="parents-btn">مجاني</span>
    </div>`;
    SHOP_THEMES.forEach(t => {
        const isOwned = owned.includes(t.id);
        const canBuy = p.stars >= t.cost;
        html += `<div class="profile-card" style="margin:8px 0;background:var(--bg);">
            <span class="profile-title">${t.name}</span>
            ${isOwned ? `<button class="parents-btn" onclick="sfx.pop(); applyTheme('${t.id}')">تفعيل</button>` 
            : `<button class="parents-btn" onclick="sfx.pop(); buyTheme('${t.id}',${t.cost})" ${canBuy?'':'disabled style="opacity:0.5"'}>${t.cost} ⭐</button>`}
        </div>`;
    });
    box.innerHTML = html;
    app.appendChild(box);
};
window.buyTheme = (id, cost) => {
    const p = Profiles[currentProfileId];
    if(p.stars < cost) { alert('نجوم غير كافية!'); return; }
    if(confirm(`هل تريد شراء هذا الثيم مقابل ${cost} نجمة؟`)) {
        p.stars -= cost; save();
        let owned = JSON.parse(localStorage.getItem('rukn_owned_themes') || '[]');
        owned.push(id); localStorage.setItem('rukn_owned_themes', JSON.stringify(owned));
        sfx.fanfare(); showConfetti();
        applyTheme(id);
        showRewardShop();
    }
};
window.applyTheme = (id) => {
    const theme = SHOP_THEMES.find(t => t.id === id);
    if(!theme) return;
    Object.entries(theme.colors).forEach(([k,v]) => document.documentElement.style.setProperty(k, v));
    localStorage.setItem('rukn_active_theme', id);
};
window.resetThemeColors = () => {
    ['--bg','--card','--ink','--teal','--gold','--coral','--ok','--line'].forEach(k => document.documentElement.style.removeProperty(k));
    localStorage.removeItem('rukn_active_theme');
};
(function(){ const t = localStorage.getItem('rukn_active_theme'); if(t) { const th = SHOP_THEMES.find(s=>s.id===t); if(th) Object.entries(th.colors).forEach(([k,v]) => document.documentElement.style.setProperty(k, v)); } })();
window.shareScore = () => {
    sfx.pop();
    const p = Profiles[currentProfileId];
    const text = `🌟 أنا ${p.name} جمعت ${p.stars} نجمة في تطبيق ركن الصغار! العب وتعلّم معي! 🤲📖`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
};
window.changeFontSize = (size) => {
    sfx.pop();
    const scale = size / 20;
    document.documentElement.style.setProperty('--font-scale', scale);
    document.body.style.fontSize = size + 'px';
    localStorage.setItem('rukn_font_size', size);
};
(function(){ 
    const fs = localStorage.getItem('rukn_font_size'); 
    if(fs) {
        document.body.style.fontSize = fs + 'px';
        document.documentElement.style.setProperty('--font-scale', fs / 20);
    }
})();
window.requestReminder = () => {
    if(!('Notification' in window)) { alert('متصفحك لا يدعم الإشعارات'); return; }
    Notification.requestPermission().then(perm => {
        if(perm === 'granted') {
            alert('تم تفعيل التذكيرات! ستصلك تذكيرات بالأذكار ✅');
            localStorage.setItem('rukn_notif', 'true');
        }
    });
};
(function(){
    if(localStorage.getItem('rukn_notif') === 'true' && 'Notification' in window && Notification.permission === 'granted') {
        const lastNotif = localStorage.getItem('rukn_notif_date');
        const today = new Date().toISOString().split('T')[0];
        if(lastNotif !== today) {
            localStorage.setItem('rukn_notif_date', today);
            setTimeout(() => {
                new Notification('ركن الصغار 🌟', { body: 'لا تنسَ أذكار الصباح والمساء! هيا نتعلم اليوم 📖', icon: 'icon_192.png' });
            }, 3000);
        }
    }
})();
init();