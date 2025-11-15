/* Shared utilities for BrainSort games (score, leaderboard, prefs, theme) */
(function(window){
  const KEY_PREFS = 'brainSortPrefs';
  const KEY_LEADER = 'brainSortLeaderboard';
  const KEY_ACH = 'brainSortAchievements';

  function savePrefsObj(prefs){
    try{ localStorage.setItem(KEY_PREFS, JSON.stringify(prefs)); }catch(e){}
  }
  function loadPrefsObj(){
    try{ const raw = localStorage.getItem(KEY_PREFS); return raw ? JSON.parse(raw) : null; }catch(e){ return null; }
  }

  function calculateScore(timeSeconds, numElements, difficulty){
    let diffMultiplier = difficulty === 50 ? 1 : difficulty === 100 ? 2 : 3;
    let elementMultiplier = 1 + (numElements - 5) / 5;
    let speedMultiplier = 10 / Math.max(timeSeconds, 0.1);
    return Math.round(100 * diffMultiplier * elementMultiplier * speedMultiplier);
  }

  function saveScore(scoreObj){
    try{
      let leaderboard = JSON.parse(localStorage.getItem(KEY_LEADER) || '[]');
      leaderboard.push(scoreObj);
      leaderboard.sort((a,b)=>b.score - a.score);
      leaderboard = leaderboard.slice(0,10);
      localStorage.setItem(KEY_LEADER, JSON.stringify(leaderboard));
    }catch(e){}
  }

  function getLeaderboard(){
    try{ return JSON.parse(localStorage.getItem(KEY_LEADER) || '[]'); }catch(e){ return []; }
  }

  function updateAchievements(time, difficulty){
    try{
      const raw = localStorage.getItem(KEY_ACH) || '{}';
      const ach = JSON.parse(raw);
      if(!ach.firstPerfect) ach.firstPerfect = true;
      ach.fiveUnder10 = ach.fiveUnder10 ? ach.fiveUnder10 + (time <= 10 ? 1 : 0) : (time <= 10 ? 1 : 0);
      if(difficulty === 999) ach.maxDifficulty = true;
      localStorage.setItem(KEY_ACH, JSON.stringify(ach));
    }catch(e){}
  }

  function getAchievements(){
    try{ return JSON.parse(localStorage.getItem(KEY_ACH) || '{}'); }catch(e){ return {}; }
  }

  function showLeaderboard(listElementId, containerId){
    const leaderboard = getLeaderboard();
    const list = document.getElementById(listElementId);
    if(!list) return;
    list.innerHTML = '';
    leaderboard.forEach((entry)=>{
      const li = document.createElement('li');
      li.textContent = `${entry.name} - ${entry.score} pts (${entry.time}s, ${entry.elements} éléments, ${entry.difficulty === 50 ? 'Facile' : entry.difficulty === 100 ? 'Moyen' : 'Difficile'})`;
      list.appendChild(li);
    });
    if(containerId){ const container = document.getElementById(containerId); if(container) container.classList.remove('hidden'); }
  }

  function showAchievements(listElementId, containerId){
    const ach = getAchievements();
    const list = document.getElementById(listElementId);
    if(!list) return;
    list.innerHTML = '';
    if(ach.firstPerfect) list.innerHTML += '<li>🏅 First perfect round</li>';
    if(ach.fiveUnder10 >= 5) list.innerHTML += '<li>⏱ 5 rounds under 10s</li>';
    if(ach.maxDifficulty) list.innerHTML += '<li>🔥 Max difficulty completed</li>';
    if(containerId){ const container = document.getElementById(containerId); if(container) container.classList.remove('hidden'); }
  }

  function applyTheme(mode, opts){
    try{
      const body = opts && opts.bodySelector ? document.querySelector(opts.bodySelector) : document.body;
      const panels = opts && opts.panelsSelector ? document.querySelectorAll(opts.panelsSelector) : document.querySelectorAll('#settings, #challengeTimeContainer, #result-card, #leaderboard, #achievements');
      body.style.backgroundImage = '';
      panels.forEach(p => { if(p) { p.style.backgroundImage = ''; } });
      if(mode === 'light'){
        body.style.backgroundColor = '#f9fafb'; body.style.color = '#1f2937';
        panels.forEach(p => { if(p){ p.style.backgroundColor = '#ffffff'; p.style.color = '#1f2937'; } });
      } else if(mode === 'dark'){
        body.style.backgroundColor = '#0f172a'; body.style.color = '#f8fafc';
        panels.forEach(p => { if(p){ p.style.backgroundColor = '#111827'; p.style.color = '#f8fafc'; } });
      } else {
        const r = Math.floor(Math.random()*200) + 20;
        const g = Math.floor(Math.random()*200) + 20;
        const b = Math.floor(Math.random()*200) + 20;
        const bg = `rgb(${r},${g},${b})`;
        const brightness = (r*299 + g*587 + b*114)/1000;
        const textColor = brightness > 128 ? 'black' : 'white';
        body.style.backgroundColor = bg; body.style.color = textColor;
        panels.forEach(p=>{ if(p){ p.style.backgroundColor = `rgba(${r},${g},${b},0.12)`; p.style.color = textColor; } });
      }
    }catch(e){}
  }

  window.brainSort = {
    savePrefsObj,
    loadPrefsObj,
    calculateScore,
    saveScore,
    getLeaderboard,
    updateAchievements,
    getAchievements,
    showLeaderboard,
    showAchievements,
    showNextBadge: function(nextBadgeId, nextNumberElId, val){
      try{
        const nextBadge = document.getElementById(nextBadgeId);
        const nextNumberEl = document.getElementById(nextNumberElId);
        if(!nextBadge || !nextNumberEl) return;
        nextNumberEl.textContent = String(val);
        nextBadge.classList.remove('hidden');
      }catch(e){}
    },
    hideNextBadge: function(nextBadgeId){
      try{ const nextBadge = document.getElementById(nextBadgeId); if(!nextBadge) return; nextBadge.classList.add('hidden'); }catch(e){}
    },
    highlightExpected: function(buttonSelector, expectedIndex, sortedArray, opts){
      try{
        const btns = document.querySelectorAll(buttonSelector || '.number');
        btns.forEach(b=>{
          b.classList.remove('ring-4','ring-yellow-400','animate-pulse');
        });
        if(typeof expectedIndex === 'number' && expectedIndex >=0 && Array.isArray(sortedArray) && expectedIndex < sortedArray.length){
          const target = String(sortedArray[expectedIndex]);
          btns.forEach(b=>{
            const txt = b.textContent.trim();
            if(txt === target){ b.classList.add('ring-4','ring-yellow-400','animate-pulse'); }
          });
        }
      }catch(e){}
    },
    /* Apply common prefs to page controls (safe — checks element existence) */
    applyCommonPrefsToPage: function(prefs){
      try{
        if(!prefs) return;
        // helper toggle
        const helperToggle = document.getElementById('helperToggle'); if(helperToggle && typeof prefs.helperEnabled !== 'undefined') helperToggle.checked = !!prefs.helperEnabled;
        // odd/even
        const oddEvenToggle = document.getElementById('oddEvenToggle'); if(oddEvenToggle && typeof prefs.oddEvenMode !== 'undefined') oddEvenToggle.checked = !!prefs.oddEvenMode;
        const invertPairsToggle = document.getElementById('invertPairsToggle'); if(invertPairsToggle && typeof prefs.invertPairs !== 'undefined') invertPairsToggle.checked = !!prefs.invertPairs;
        const orderToggle = document.getElementById('orderToggle'); if(orderToggle && typeof prefs.ascendingOrder !== 'undefined') { orderToggle.checked = !!prefs.ascendingOrder; const orderLabel = document.getElementById('orderLabel'); if(orderLabel) orderLabel.textContent = prefs.ascendingOrder ? 'Ascendant' : 'Descendant'; }
        // oddEven radio states
        const oddEvenModeOdds = document.getElementById('oddEvenMode_oddsThenEvens'); const oddEvenModeAlt = document.getElementById('oddEvenMode_alternate');
        if(oddEvenModeOdds && oddEvenModeAlt && typeof prefs.oddEvenModeType !== 'undefined'){
          oddEvenModeOdds.checked = prefs.oddEvenModeType === 'oddsThenEvens';
          oddEvenModeAlt.checked = prefs.oddEvenModeType === 'alternate';
        }
        const oddEvenStartOdd = document.getElementById('oddEvenStart_odd'); const oddEvenStartEven = document.getElementById('oddEvenStart_even');
        if(oddEvenStartOdd && oddEvenStartEven && typeof prefs.oddEvenStart !== 'undefined'){
          oddEvenStartOdd.checked = prefs.oddEvenStart === 'odd'; oddEvenStartEven.checked = prefs.oddEvenStart === 'even';
        }
        // theme selection visual (if theme-card exists)
        if(typeof prefs.selectedTheme === 'string'){
          document.querySelectorAll('.theme-card').forEach(c=>c.classList.remove('ring-4','ring-blue-500'));
          const themeCard = Array.from(document.querySelectorAll('.theme-card')).find(c => c.textContent.trim().toLowerCase() === prefs.selectedTheme);
          if(themeCard) themeCard.classList.add('ring-4','ring-blue-500');
        }
      }catch(e){}
    },
    /* Collect common prefs from page (reads common controls) */
    collectCommonPrefsFromPage: function(){
      try{
        const prefs = {};
        const helperToggle = document.getElementById('helperToggle'); if(helperToggle) prefs.helperEnabled = !!helperToggle.checked;
        const oddEvenToggle = document.getElementById('oddEvenToggle'); if(oddEvenToggle) prefs.oddEvenMode = !!oddEvenToggle.checked;
        const invertPairsToggle = document.getElementById('invertPairsToggle'); if(invertPairsToggle) prefs.invertPairs = !!invertPairsToggle.checked;
        const orderToggle = document.getElementById('orderToggle'); if(orderToggle) prefs.ascendingOrder = !!orderToggle.checked;
        const oddEvenModeOdds = document.getElementById('oddEvenMode_oddsThenEvens'); const oddEvenModeAlt = document.getElementById('oddEvenMode_alternate');
        if(oddEvenModeOdds || oddEvenModeAlt) prefs.oddEvenModeType = (oddEvenModeAlt && oddEvenModeAlt.checked) ? 'alternate' : 'oddsThenEvens';
        const oddEvenStartOdd = document.getElementById('oddEvenStart_odd'); const oddEvenStartEven = document.getElementById('oddEvenStart_even');
        if(oddEvenStartOdd || oddEvenStartEven) prefs.oddEvenStart = (oddEvenStartEven && oddEvenStartEven.checked) ? 'even' : 'odd';
        // selectedTheme
        const themeCard = Array.from(document.querySelectorAll('.theme-card')).find(c => c.classList.contains('ring-4') || c.classList.contains('ring-blue-500'));
        if(themeCard) prefs.selectedTheme = themeCard.textContent.trim().toLowerCase();
        // difficulty and selected number (if present)
        const selectedNumBtn = Array.from(document.querySelectorAll('.option-btn')).find(b=>b.classList.contains('ring-2')||b.classList.contains('ring-blue-500'));
        if(selectedNumBtn) prefs.selectedNum = selectedNumBtn.textContent.trim();
        const diffBtn = Array.from(document.querySelectorAll('.difficulty-btn')).find(b=>b.classList.contains('ring-2')||b.classList.contains('ring-blue-500'));
        if(diffBtn){ const t=diffBtn.textContent.trim(); prefs.selectedDiff = t==='Facile'?50:t==='Moyen'?100:999; }
        return prefs;
      }catch(e){ return {}; }
    },
    applyTheme
  };
})(window);
