/* EcoConsciente — interações sem bibliotecas externas */
document.addEventListener('DOMContentLoaded', () => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  // Barra de leitura: indica quanto da página já foi percorrido.
  const readingProgressBar = $('#readingProgressBar');
  const siteHeader = $('.site-header');
  let scrollTicking = false;
  const updateReadingProgress = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
    if (readingProgressBar) readingProgressBar.style.transform = `scaleX(${progress})`;
    siteHeader?.classList.toggle('is-scrolled', window.scrollY > 12);
    scrollTicking = false;
  };
  window.addEventListener('scroll', () => {
    if (!scrollTicking) {
      scrollTicking = true;
      window.requestAnimationFrame(updateReadingProgress);
    }
  }, { passive: true });
  updateReadingProgress();

  // Menu responsivo
  const menuToggle = $('#menuToggle');
  const mainNav = $('#mainNav');
  if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', () => {
      const open = mainNav.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', String(open));
      menuToggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    });
    $$('a', mainNav).forEach(link => link.addEventListener('click', () => {
      mainNav.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.setAttribute('aria-label', 'Abrir menu');
    }));
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && mainNav.classList.contains('open')) {
        mainNav.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.setAttribute('aria-label', 'Abrir menu');
        menuToggle.focus();
      }
    });
  }

  // Marca no menu a seção que está em evidência.
  const navLinks = $$('#mainNav a[href^="#"]');
  const navSections = navLinks.map(link => $(link.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window && navSections.length) {
    const activeSectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        navLinks.forEach(link => {
          if (link.getAttribute('href') === `#${entry.target.id}`) {
            link.setAttribute('aria-current', 'location');
          } else {
            link.removeAttribute('aria-current');
          }
        });
      });
    }, { rootMargin: '-22% 0px -65% 0px', threshold: 0 });
    navSections.forEach(section => activeSectionObserver.observe(section));
  }

  // Revelações progressivas: cada elemento anima apenas na primeira entrada.
  const revealTargets = $$('.section-head, .intro-band, .pillar-card, .feature-row, .topic-grid article, .gallery-photo, .ods-panel, .recycle-tool, .myth-list details, .data-intro, .data-card, .data-caveat, .challenge-item, .progress-card, .calculator, .estimate-note, .quiz-card, .quiz-aside, .source-list a, .closing-band');
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -35px 0px' });
    revealTargets.forEach((el, index) => {
      el.classList.add('reveal');
      const siblings = el.parentElement ? [...el.parentElement.children].filter(node => node.matches('.pillar-card, .topic-grid article, .data-card, .challenge-item, .source-list a')) : [];
      if (siblings.length > 1) el.style.setProperty('--reveal-delay', `${Math.min(siblings.indexOf(el), 4) * 75}ms`);
      revealObserver.observe(el);
    });
  }

  // Fotografias: revelação suave quando entram no campo de visão.
  // A classe é adicionada apenas com JavaScript, portanto as imagens continuam
  // visíveis normalmente caso o script não seja executado.
  const photoTargets = $$('main img:not(.hero-media img), .hero-media img');
  if ('IntersectionObserver' in window && photoTargets.length) {
    const photoObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('photo-visible');
        photoObserver.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -24px 0px' });
    photoTargets.forEach(img => {
      img.classList.add('photo-reveal');
      photoObserver.observe(img);
    });
  }

  // Movimento parallax mínimo na fotografia principal, sem afetar o layout.
  const heroMedia = $('.hero-media');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (heroMedia && !reduceMotion && window.matchMedia('(min-width: 761px)').matches) {
    let parallaxTicking = false;
    window.addEventListener('scroll', () => {
      if (parallaxTicking) return;
      parallaxTicking = true;
      requestAnimationFrame(() => {
        const rect = heroMedia.getBoundingClientRect();
        const offset = Math.max(-10, Math.min(10, (rect.top - window.innerHeight / 2) * -0.018));
        heroMedia.style.setProperty('--hero-parallax', `${offset}px`);
        parallaxTicking = false;
      });
    }, { passive: true });
  }

  // Botão voltar ao topo
  const backTop = $('#backTop');
  const updateBackTop = () => backTop?.classList.toggle('visible', window.scrollY > 500);
  window.addEventListener('scroll', updateBackTop, { passive: true });
  updateBackTop();
  backTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  // Guia interativo de materiais
  const materials = {
    plastico: {
      category: 'MATERIAL · PLÁSTICO', title: 'Plástico',
      intro: 'Embalagens, garrafas e frascos podem ser recicláveis quando o sistema local os recebe.',
      how: 'Esvazie a embalagem, retire o excesso de restos de alimentos e, se possível, dê uma enxaguada rápida. Deixe secar.',
      care: 'Não misture com resíduos orgânicos. Tampas, rótulos e plásticos flexíveis podem ter regras diferentes na coleta local.',
      example: 'Exemplos: garrafas PET, frascos de produtos de limpeza e potes plásticos aceitos pelo serviço local.'
    },
    papel: {
      category: 'MATERIAL · PAPEL', title: 'Papel',
      intro: 'Papel e papelão limpos e secos costumam ser aceitos na coleta seletiva.',
      how: 'Separe folhas, caixas e jornais. Dobre caixas para ocupar menos espaço e mantenha tudo protegido da chuva.',
      care: 'Papel engordurado, papel higiênico usado, guardanapos sujos e papel carbono geralmente não vão para a reciclagem comum.',
      example: 'Exemplos: folhas de caderno, caixas de papelão, jornais e embalagens de papel limpas.'
    },
    vidro: {
      category: 'MATERIAL · VIDRO', title: 'Vidro',
      intro: 'Garrafas e potes de vidro podem ser reciclados, mas precisam ser manuseados com atenção.',
      how: 'Esvazie os recipientes e retire restos de alimentos. Não é necessário quebrar o vidro; mantenha as peças inteiras quando possível.',
      care: 'Vidros quebrados devem ser embalados de forma segura e identificados para evitar acidentes. Espelhos, lâmpadas, cerâmicas e vidros especiais podem ter descarte diferente.',
      example: 'Exemplos: garrafas de bebidas e potes de conserva, conforme as regras da coleta local.'
    },
    metal: {
      category: 'MATERIAL · METAL', title: 'Metal',
      intro: 'Latas e embalagens metálicas são materiais com potencial de reciclagem.',
      how: 'Esvazie latas e embalagens. Se possível, retire o excesso de resíduos e amasse apenas quando isso for seguro e aceito pelo serviço.',
      care: 'Objetos cortantes precisam ser protegidos para não machucar quem faz a coleta. Aerossóis e embalagens pressurizadas exigem orientação específica.',
      example: 'Exemplos: latas de alumínio, latas de aço e tampas metálicas.'
    },
    organico: {
      category: 'RESÍDUO · ORGÂNICO', title: 'Resíduos orgânicos',
      intro: 'Restos de frutas, verduras e outros resíduos de origem biológica podem ser destinados à compostagem quando houver estrutura adequada.',
      how: 'Separe restos vegetais e cascas. Na compostagem doméstica, siga as orientações do método utilizado e equilibre materiais úmidos e secos.',
      care: 'Carnes, laticínios, óleos e alimentos cozidos podem exigir manejo específico. Não descarte resíduos orgânicos em qualquer terreno ou bueiro.',
      example: 'Exemplos: cascas de frutas, borra de café, folhas secas e restos vegetais adequados à composteira.'
    }
  };
  $$('.material-button').forEach(button => button.addEventListener('click', () => {
    const item = materials[button.dataset.material];
    if (!item) return;
    $$('.material-button').forEach(btn => {
      const active = btn === button;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-pressed', String(active));
    });
    const materialDetail = $('.material-detail');
    materialDetail?.classList.remove('material-changing');
    void materialDetail?.offsetWidth;
    materialDetail?.classList.add('material-changing');
    $('#materialCategory').textContent = item.category;
    $('#materialTitle').textContent = item.title;
    $('#materialIntro').textContent = item.intro;
    $('#materialHow').textContent = item.how;
    $('#materialCare').textContent = item.care;
    $('#materialExample').textContent = item.example;
    materialDetail?.setAttribute('aria-live', 'polite');
  }));

  // Desafio de sete dias: grava somente o estado dos checkboxes neste navegador
  const challengeChecks = $$('input[data-day]');
  const challengeStorageKey = 'ecoconsciente-desafio-v1';
  const progressCount = $('#progressCount');
  const progressBar = $('#challengeProgressBar');
  const progressTrack = $('#challengeProgress');
  const progressMessage = $('#progressMessage');
  let previousCompleted = null;
  function updateChallengeProgress() {
    const completed = challengeChecks.filter(input => input.checked).length;
    if (progressCount) {
      progressCount.textContent = completed;
      progressCount.classList.remove('count-pop');
      void progressCount.offsetWidth;
      progressCount.classList.add('count-pop');
    }
    if (completed === 7 && previousCompleted !== 7) {
      $('.progress-card')?.classList.remove('completion-celebrate');
      void $('.progress-card')?.offsetWidth;
      $('.progress-card')?.classList.add('completion-celebrate');
    }
    previousCompleted = completed;
    challengeChecks.forEach(input => input.closest('.challenge-item')?.classList.toggle('is-complete', input.checked));
    if (progressBar) progressBar.style.width = `${completed / 7 * 100}%`;
    if (progressTrack) progressTrack.setAttribute('aria-valuenow', String(completed));
    $('.progress-card')?.classList.toggle('is-finished', completed === 7);
    $('.challenge-layout')?.classList.toggle('challenge-finished', completed === 7);
    if (progressMessage) {
      progressMessage.classList.remove('progress-message-pop');
      void progressMessage.offsetWidth;
      progressMessage.classList.add('progress-message-pop');
      progressMessage.textContent = completed === 7
        ? 'Você concluiu os sete desafios. Que tal manter os hábitos que fizeram sentido?'
        : completed >= 4
          ? 'Muito bom! Você já concluiu mais da metade do desafio.'
          : completed > 0
            ? 'Bom começo. Continue no seu ritmo e marque os próximos dias.'
            : 'Um passo de cada vez. Marque o primeiro desafio quando concluir.';
    }
    try { localStorage.setItem(challengeStorageKey, JSON.stringify(challengeChecks.map(input => input.checked))); } catch (_) {}
  }
  try {
    const saved = JSON.parse(localStorage.getItem(challengeStorageKey) || 'null');
    if (Array.isArray(saved)) challengeChecks.forEach((input, i) => { input.checked = Boolean(saved[i]); });
  } catch (_) {}
  challengeChecks.forEach(input => input.addEventListener('change', updateChallengeProgress));
  updateChallengeProgress();
  $('#resetChallenges')?.addEventListener('click', () => {
    challengeChecks.forEach(input => { input.checked = false; });
    updateChallengeProgress();
  });

  // Calculadora educativa: 20 g aproximados por garrafa PET de 500 ml
  const bottlesInput = $('#bottlesPerWeek');
  const foodInput = $('#foodPerWeek');
  const formatKg = value => `${value.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} kg`;
  const numberAnimations = new WeakMap();
  function animateValue(element, target, formatter) {
    if (!element) return;
    const previousFrame = numberAnimations.get(element);
    if (previousFrame) cancelAnimationFrame(previousFrame);
    const current = Number(element.dataset.numericValue || 0);
    const start = performance.now();
    const duration = reduceMotion ? 0 : 360;
    const frame = now => {
      const ratio = duration === 0 ? 1 : Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - ratio, 3);
      element.textContent = formatter(current + (target - current) * eased);
      if (ratio < 1) numberAnimations.set(element, requestAnimationFrame(frame));
      else { element.dataset.numericValue = String(target); numberAnimations.delete(element); }
    };
    numberAnimations.set(element, requestAnimationFrame(frame));
  }
  function updateCalculator() {
    const bottles = Number(bottlesInput?.value || 0);
    const food = Number(foodInput?.value || 0);
    const annualBottles = bottles * 52;
    const annualPlasticKg = annualBottles * 0.02;
    const annualFoodKg = food * 52;
    $('#bottlesValue').textContent = `${bottles} por semana`;
    $('#foodValue').textContent = `${food.toLocaleString('pt-BR')} kg por semana`;
    animateValue($('#annualBottles'), annualBottles, value => Math.round(value).toLocaleString('pt-BR'));
    animateValue($('#annualPlastic'), annualPlasticKg, value => formatKg(value));
    animateValue($('#annualFood'), annualFoodKg, value => formatKg(value));
    const setMeter = (selector, value, max) => {
      const meter = $(selector);
      if (meter) meter.style.width = `${Math.max(0, Math.min(100, value / max * 100))}%`;
    };
    setMeter('#bottlesMeter', annualBottles, 1040);
    setMeter('#plasticMeter', annualPlasticKg, 20.8);
    setMeter('#foodMeter', annualFoodKg, 260);
  }
  bottlesInput?.addEventListener('input', updateCalculator);
  foodInput?.addEventListener('input', updateCalculator);
  updateCalculator();

  // Quiz com feedback explicativo por pergunta
  const questions = [
    { q: 'Qual atitude ajuda a evitar desperdício de alimentos?', a: ['Comprar mais do que será consumido', 'Planejar refeições e armazenar bem os alimentos', 'Jogar fora alimentos perto da validade sem verificar'], c: 1, e: 'Planejar compras e refeições ajuda a adquirir apenas o necessário e aproveitar melhor os alimentos.' },
    { q: 'O que significa coleta seletiva?', a: ['Separar resíduos por tipo de material', 'Queimar o lixo em casa', 'Misturar todos os resíduos no mesmo saco'], c: 0, e: 'A separação por tipo facilita a triagem e pode encaminhar materiais para reciclagem, conforme a estrutura local.' },
    { q: 'Qual é uma forma simples de economizar água?', a: ['Deixar a torneira aberta', 'Lavar calçadas com mangueira sempre', 'Fechar a torneira enquanto escova os dentes'], c: 2, e: 'Fechar a torneira durante atividades em que a água não é necessária evita desperdício.' },
    { q: 'Antes de comprar algo novo, vale primeiro...', a: ['Verificar se realmente precisa', 'Comprar por impulso', 'Escolher o produto com mais embalagem'], c: 0, e: 'Pensar na necessidade, durabilidade e possibilidade de conserto ajuda a reduzir compras desnecessárias.' },
    { q: 'Qual é a proposta principal da ODS 12?', a: ['Aumentar o consumo de produtos descartáveis', 'Assegurar padrões sustentáveis de consumo e produção', 'Substituir todas as atividades industriais'], c: 1, e: 'A ODS 12 faz parte da Agenda 2030 e trata de padrões sustentáveis de produção e consumo.' },
    { q: 'O que deve ser feito com pilhas e baterias usadas?', a: ['Colocar junto com papel e plástico', 'Jogar em rios ou terrenos', 'Levar a pontos de coleta específicos'], c: 2, e: 'Pilhas e baterias podem conter substâncias que exigem manejo próprio. Procure pontos de entrega ou logística reversa.' },
    { q: 'Qual opção representa reutilização?', a: ['Usar um pote de vidro limpo para guardar alimentos', 'Descartar um objeto que ainda funciona', 'Comprar outro item sem necessidade'], c: 0, e: 'Reutilizar é dar novo uso a um produto ou embalagem, prolongando sua vida útil.' },
    { q: 'Quem tem responsabilidade pela sustentabilidade?', a: ['Somente os consumidores', 'Pessoas, empresas, governos e comunidades', 'Somente as escolas'], c: 1, e: 'As escolhas individuais importam, mas políticas públicas, produção responsável e participação coletiva também são fundamentais.' }
  ];
  let currentQuestion = 0;
  let score = 0;
  let answered = false;
  let quizCard = $('#quizCard');

  function drawQuiz() {
    quizCard.innerHTML = `<div class="quiz-meta"><span id="quizCounter"></span><span id="quizScore"></span></div><div class="quiz-track"><span id="quizBar"></span></div><h3 id="quizQuestion"></h3><div class="quiz-answers" id="quizAnswers"></div><div class="quiz-feedback" id="quizFeedback" aria-live="polite"></div><button class="button button-dark" id="quizNext" type="button" disabled>Próxima pergunta →</button>`;
    const question = $('#quizQuestion', quizCard);
    const answers = $('#quizAnswers', quizCard);
    const feedback = $('#quizFeedback', quizCard);
    const counter = $('#quizCounter', quizCard);
    const bar = $('#quizBar', quizCard);
    const scoreLabel = $('#quizScore', quizCard);
    const next = $('#quizNext', quizCard);

    function render() {
      quizCard.classList.remove('quiz-enter', 'quiz-result-enter', 'quiz-answer-correct', 'quiz-answer-wrong');
      void quizCard.offsetWidth;
      quizCard.classList.add('quiz-enter');
      const item = questions[currentQuestion];
      answered = false;
      counter.textContent = `PERGUNTA ${currentQuestion + 1} DE ${questions.length}`;
      scoreLabel.textContent = `${score} acertos`;
      bar.style.width = `${(currentQuestion + 1) / questions.length * 100}%`;
      question.textContent = item.q;
      feedback.textContent = '';
      answers.innerHTML = '';
      item.a.forEach((answer, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'quiz-answer';
        button.textContent = answer;
        button.addEventListener('click', () => {
          if (answered) return;
          answered = true;
          $$('.quiz-answer', answers).forEach((choice, i) => {
            choice.disabled = true;
            if (i === item.c) choice.classList.add('correct');
          });
          quizCard.classList.toggle('quiz-answer-correct', index === item.c);
          quizCard.classList.toggle('quiz-answer-wrong', index !== item.c);
          feedback.classList.remove('feedback-enter');
          void feedback.offsetWidth;
          feedback.classList.add('feedback-enter');
          if (index === item.c) {
            score++;
            feedback.innerHTML = `<strong>Resposta correta.</strong> ${item.e}`;
          } else {
            button.classList.add('incorrect');
            feedback.innerHTML = `<strong>Não foi dessa vez.</strong> ${item.e}`;
          }
          scoreLabel.textContent = `${score} acertos`;
          next.disabled = false;
        });
        answers.appendChild(button);
      });
      next.disabled = true;
      next.textContent = currentQuestion === questions.length - 1 ? 'Ver resultado →' : 'Próxima pergunta →';
    }

    function showResult() {
      const rate = score / questions.length;
      const heading = rate === 1 ? 'Mandou muito bem!' : rate >= .625 ? 'Bom trabalho!' : 'Continue aprendendo!';
      const message = rate === 1
        ? 'Você acertou todas. Continue compartilhando informações e atitudes responsáveis.'
        : rate >= .625
          ? 'Você já reconhece várias práticas sustentáveis. Revise as explicações para aprofundar.'
          : 'O quiz é uma oportunidade de aprender. Leia as explicações e tente novamente quando quiser.';
      quizCard.classList.remove('quiz-enter', 'quiz-answer-correct', 'quiz-answer-wrong');
      quizCard.innerHTML = `<div class="quiz-result-final"><span class="eyebrow">RESULTADO DO QUIZ</span><h3>${heading}</h3><p class="quiz-result-score">${score} de ${questions.length} acertos</p><p>${message}</p><button class="button button-dark" id="quizAgain" type="button">Refazer quiz ↻</button></div>`;
      quizCard.classList.add('quiz-result-enter');
      $('#quizAgain', quizCard).addEventListener('click', () => {
        currentQuestion = 0;
        score = 0;
        drawQuiz();
      });
    }

    next.addEventListener('click', () => {
      if (!answered) return;
      if (currentQuestion < questions.length - 1) {
        currentQuestion++;
        render();
      } else {
        showResult();
      }
    });
    render();
  }

  $('#quizRestart')?.addEventListener('click', () => {
    currentQuestion = 0;
    score = 0;
    drawQuiz();
  });
  if (quizCard) drawQuiz();
});
