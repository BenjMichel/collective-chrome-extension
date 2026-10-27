(() => {
  const SEEN_KEY = 'seenJobs'; // { [jobId]: timestamp }

  let seen = {};
  let currentJobId = null;

  const jobIdFromHref = (href) => {
    try {
      return new URL(href, location.origin).searchParams.get('jobId');
    } catch {
      return null;
    }
  };

  const save = () => chrome.storage.local.set({ [SEEN_KEY]: seen });

  const setText = (el, text) => {
    if (el.textContent !== text) el.textContent = text;
  };

  const markSeen = (id) => {
    if (!id || seen[id]) return;
    seen[id] = Date.now();
    save();
    render();
  };

  const unmarkSeen = (id) => {
    delete seen[id];
    save();
    render();
  };

  // --- Panneau flottant -----------------------------------------------------

  const panel = document.createElement('div');
  panel.className = 'cst-panel';
  const countLabel = document.createElement('span');
  const resetBtn = document.createElement('button');
  resetBtn.textContent = 'Réinitialiser';
  panel.append(countLabel, resetBtn);

  resetBtn.addEventListener('click', () => {
    seen = {};
    save();
    render();
  });

  // --- Rendu ----------------------------------------------------------------

  const renderCard = (line) => {
    const link = line.querySelector('a[href*="jobId="]');
    const id = link && jobIdFromHref(link.getAttribute('href'));
    const card = line.firstElementChild;
    if (!id || !card) return;

    line.classList.toggle('cst-seen', Boolean(seen[id]));

    let actions = card.querySelector(':scope > .cst-actions');
    if (!actions) {
      actions = document.createElement('div');
      actions.className = 'cst-actions';
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'cst-card-btn';
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const jobId = actions.dataset.jobId;
        if (seen[jobId]) unmarkSeen(jobId);
        else markSeen(jobId);
      });
      actions.appendChild(btn);
      card.appendChild(actions);
    }
    actions.dataset.jobId = id;
    setText(actions.firstElementChild, seen[id] ? 'Marquer non vue' : 'Marquer vue');
  };

  const render = () => {
    const lines = document.querySelectorAll('.job-line');
    lines.forEach(renderCard);

    // Le script tourne sur tout le domaine (SPA) : panneau seulement sur la liste.
    if (!lines.length) {
      panel.remove();
      return;
    }

    const n = Object.keys(seen).length;
    setText(countLabel, `${n} offre${n > 1 ? 's' : ''} vue${n > 1 ? 's' : ''}`);
    if (!panel.isConnected) document.body.appendChild(panel);
  };

  // --- Détection des offres ouvertes ----------------------------------------

  const checkUrl = () => {
    const id = location.pathname.startsWith('/talent/jobs')
      ? new URLSearchParams(location.search).get('jobId')
      : null;
    if (id === currentJobId) return;
    currentJobId = id;
    markSeen(id);
  };

  // Les clics sur "Voir l'offre" ouvrent un nouvel onglet : on marque tout de suite.
  document.addEventListener(
    'click',
    (e) => {
      const link = e.target.closest?.('.job-line a[href*="jobId="]');
      if (link) markSeen(jobIdFromHref(link.getAttribute('href')));
    },
    true
  );

  // --- Synchronisation ------------------------------------------------------

  let scheduled = false;
  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      checkUrl();
      render();
    });
  };

  // SPA + liste virtualisée : les cartes sont recyclées en permanence.
  // render() ne touche au DOM que si nécessaire, donc pas de boucle infinie.
  new MutationObserver(schedule).observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['data-index', 'href'],
  });

  // Synchronise les autres onglets ouverts.
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local' || !changes[SEEN_KEY]) return;
    seen = changes[SEEN_KEY].newValue || {};
    render();
  });

  chrome.storage.local.get(SEEN_KEY, (data) => {
    seen = data[SEEN_KEY] || {};
    checkUrl();
    render();
  });
})();
