/* =========================================================
   换个技能 · Skill Swap Club
   纯前端演示：数据保存在 localStorage，仅用于原型展示
   ========================================================= */

const STORAGE_KEY = 'skill-swap-club:v1';
const MODE_ONLINE = '线上交流';
const MODE_OFFLINE = '线下见面';
const CATEGORIES = ['音乐', '摄影', '编程', '语言', '手作', '运动', '设计', '生活', '学业'];

const AVATARS = ['🎸', '📷', '💻', '🗣️', '🧶', '🏃', '🎨', '🍳', '📐', '✍️', '🪴', '🎹'];

const DAY = 24 * 60 * 60 * 1000;
const now = Date.now();

const SEED_SKILLS = [
  {
    id: 'seed-1', avatar: '🎸', name: '周野', city: '上海',
    title: '吉他入门 · 从零到第一首歌',
    teaches: '吉他', learns: '摄影', category: '音乐',
    mode: MODE_ONLINE, time: '周六下午', featured: true, createdAt: now - 2 * DAY,
    desc: '会弹 8 年的民谣吉他，教过 3 个零基础朋友。想用和弦与节奏，换你镜头里的光影。'
  },
  {
    id: 'seed-2', avatar: '📷', name: '林深', city: '杭州',
    title: '胶片摄影 · 拍出有呼吸感的人像',
    teaches: '摄影', learns: '吉他', category: '摄影',
    mode: MODE_OFFLINE, time: '周末上午', featured: true, createdAt: now - 1 * DAY,
    desc: '拍过 200+ 卷胶片，擅长自然光人像。愿意带你扫街、冲洗、选片，想换一门乐器入门。'
  },
  {
    id: 'seed-3', avatar: '💻', name: '陈一', city: '北京',
    title: 'Python 数据分析 · 从 Excel 到自动化',
    teaches: 'Python', learns: '英语口语', category: '编程',
    mode: MODE_ONLINE, time: '工作日晚间', featured: true, createdAt: now - 3 * DAY,
    desc: '后端工程师，能用 pandas 把重复报表变成一行命令。想找一位愿意陪练口语的搭子。'
  },
  {
    id: 'seed-4', avatar: '🗣️', name: '许知', city: '广州',
    title: '英语口语陪练 · 雅思 7.5 的日常表达',
    teaches: '英语口语', learns: 'Python', category: '语言',
    mode: MODE_ONLINE, time: '每天 30 分钟', featured: false, createdAt: now - 5 * DAY,
    desc: '在英国生活过两年，可以陪聊、纠音、改简历。想学一点能用在工作的 Python。'
  },
  {
    id: 'seed-5', avatar: '🧶', name: '阿禾', city: '成都',
    title: '钩针编织 · 一个下午织出小包',
    teaches: '钩针', learns: '摄影', category: '手作',
    mode: MODE_OFFLINE, time: '周日下午', featured: false, createdAt: now - 6 * DAY,
    desc: '手作店主，材料我全包。想学怎么把人像拍得自然，最好能一起逛市集边拍边聊。'
  },
  {
    id: 'seed-6', avatar: '🏃', name: 'Kiki', city: '深圳',
    title: '跑步入门 · 从 3 公里到半马',
    teaches: '跑步', learns: '瑜伽', category: '运动',
    mode: MODE_OFFLINE, time: '清晨或傍晚', featured: false, createdAt: now - 8 * DAY,
    desc: '跑过 6 场半马，能帮你排训练计划、纠正跑姿。想换一套能放松肩颈的瑜伽序列。'
  },
  {
    id: 'seed-7', avatar: '🎨', name: '木木', city: '南京',
    title: '水彩小景 · 把旅行画进手账',
    teaches: '水彩', learns: '吉他', category: '设计',
    mode: MODE_ONLINE, time: '周三晚上', featured: true, createdAt: now - 4 * DAY,
    desc: '自由插画师，教过 20 多位零基础学员。想用画笔换你教我弹一首完整的歌。'
  },
  {
    id: 'seed-8', avatar: '🍳', name: '老白', city: '上海',
    title: '家常菜 · 三菜一汤的周末仪式感',
    teaches: '烹饪', learns: '摄影', category: '生活',
    mode: MODE_OFFLINE, time: '周末中午', featured: false, createdAt: now - 9 * DAY,
    desc: '做了十年饭，擅长用普通食材做出惊喜。想学怎么给食物拍出好看的照片。'
  },
  {
    id: 'seed-9', avatar: '📐', name: '赵清', city: '武汉',
    title: '高数/线代答疑 · 考研数学陪跑',
    teaches: '数学', learns: '英语口语', category: '学业',
    mode: MODE_ONLINE, time: '周二、周四晚', featured: false, createdAt: now - 11 * DAY,
    desc: '数学系研究生，讲题喜欢从直觉出发。想练口语，准备明年交换项目。'
  },
  {
    id: 'seed-10', avatar: '✍️', name: '言午', city: '西安',
    title: '写作练习 · 把想法写成清楚的一段话',
    teaches: '写作', learns: '水彩', category: '学业',
    mode: MODE_ONLINE, time: '周日晚', featured: false, createdAt: now - 13 * DAY,
    desc: '做了 5 年内容编辑，能陪你改稿、拆结构。想学水彩，给文章配自己的小插图。'
  }
];

const state = {
  profile: null,
  published: [],
  saved: [],
  requests: [],
  view: 'discover',
  exchangeTab: 'requests',
  filters: { q: '', mode: 'all', category: '全部', sort: 'recommended' }
};

/* ---------- 工具 ---------- */

function esc(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function hashStr(text) {
  let hash = 0;
  const value = String(text);
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) % 9973;
  }
  return hash;
}

function overlap(source, target) {
  if (!source || !target) return false;
  const haystack = String(source).toLowerCase();
  return String(target)
    .toLowerCase()
    .split(/[\/,，、;；\s]+/)
    .filter(Boolean)
    .some((piece) => haystack.includes(piece));
}

function $(selector, scope) {
  return (scope || document).querySelector(selector);
}

function allSkills() {
  return state.published.concat(SEED_SKILLS);
}

function lookupSkill(id) {
  return allSkills().find((skill) => skill.id === id) || null;
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    if (data && typeof data === 'object') {
      if (data.profile && typeof data.profile === 'object') state.profile = data.profile;
      if (Array.isArray(data.published)) state.published = data.published;
      if (Array.isArray(data.saved)) state.saved = data.saved.filter((id) => typeof id === 'string');
      if (Array.isArray(data.requests)) state.requests = data.requests;
    }
  } catch (error) {
    /* 忽略隐私模式下的存储异常 */
  }
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      profile: state.profile,
      published: state.published,
      saved: state.saved,
      requests: state.requests
    }));
  } catch (error) {
    /* 忽略存储失败 */
  }
}

/* ---------- 匹配度 ---------- */

function matchScore(skill) {
  if (!state.profile || (!state.profile.teach && !state.profile.learn)) return null;
  const teach = state.profile.teach || '';
  const learn = state.profile.learn || '';
  let score = 55 + (hashStr(skill.id) % 18);
  if (overlap(skill.learns, teach)) score += 18;
  if (overlap(skill.teaches, learn)) score += 18;
  if (overlap(skill.category, learn) || overlap(skill.category, teach)) score += 4;
  return Math.min(99, score);
}

/* ---------- 渲染 ---------- */

function categoryList() {
  const used = new Set(allSkills().map((skill) => skill.category).filter(Boolean));
  return ['全部'].concat(CATEGORIES.filter((category) => used.has(category)));
}

function filteredSkills() {
  const { q, mode, category } = state.filters;
  const keyword = q.trim().toLowerCase();
  let list = allSkills().filter((skill) => {
    if (category !== '全部' && skill.category !== category) return false;
    if (mode !== 'all' && skill.mode !== mode) return false;
    if (!keyword) return true;
    const haystack = [skill.title, skill.desc, skill.teaches, skill.learns, skill.name, skill.city, skill.category]
      .join(' ')
      .toLowerCase();
    return haystack.includes(keyword);
  });
  if (state.filters.sort === 'newest') {
    list = list.slice().sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  } else {
    list = list.slice().sort((a, b) => {
      const featuredDiff = Number(Boolean(b.featured)) - Number(Boolean(a.featured));
      if (featuredDiff !== 0) return featuredDiff;
      return (b.createdAt || 0) - (a.createdAt || 0);
    });
  }
  return list;
}

function renderCategories() {
  const box = $('#categories');
  if (!box) return;
  box.innerHTML = categoryList()
    .map((category) => `<button type="button" class="category${category === state.filters.category ? ' active' : ''}" data-category="${esc(category)}">${esc(category)}</button>`)
    .join('');
}

function renderExchangeTabs() {
  const tabs = document.getElementById('exchange-tabs');
  if (!tabs) return;
  tabs.hidden = state.view !== 'exchanges';
  tabs.querySelectorAll('[data-exchange-tab]').forEach((button) => {
    button.classList.toggle('active', button.dataset.exchangeTab === state.exchangeTab);
  });
}

function cardMarkup(skill, options) {
  const opts = options || {};
  const saved = state.saved.includes(skill.id);
  const score = opts.score != null ? opts.score : matchScore(skill);
  const topButton = opts.mine
    ? `<button type="button" class="icon-button save-btn" data-delete="${esc(skill.id)}" aria-label="删除这条发布" title="删除">×</button>`
    : `<button type="button" class="icon-button save-btn" data-save="${esc(skill.id)}" aria-label="${saved ? '取消收藏' : '收藏技能'}" aria-pressed="${saved}">${saved ? '★' : '☆'}</button>`;
  return `<article class="skill-card" data-id="${esc(skill.id)}">
      <div class="card-top">
        <span class="skill-avatar" aria-hidden="true">${esc(skill.avatar || '✳')}</span>
        <div class="card-heading">
          <h3 class="card-title">${esc(skill.title)}</h3>
          <p class="card-owner">${esc(skill.name || '匿名')} · ${esc(skill.city || '线上')}${opts.mine ? ' · 我发布的' : ''}</p>
        </div>
        ${topButton}
      </div>
      <p class="card-desc">${esc(skill.desc)}</p>
      <div class="card-tags">
        <span class="tag teach">能教 · ${esc(skill.teaches)}</span>
        <span class="tag learn">想换 · ${esc(skill.learns)}</span>
      </div>
      <div class="card-foot">
        <span class="card-meta">${esc(skill.mode)} · ${esc(skill.time)}</span>
        ${score != null ? `<span class="match-badge">匹配 ${score}%</span>` : ''}
        <button type="button" class="button secondary small" data-invite="${esc(skill.id)}">发起交换 ↗</button>
      </div>
    </article>`;
}

function requestMarkup(request) {
  const skill = lookupSkill(request.skillId);
  return `<div class="request-item">
      <span class="skill-avatar" aria-hidden="true">${esc((skill && skill.avatar) || '✳')}</span>
      <div class="request-main">
        <strong>${esc(request.title)}</strong>
        <p>我 → ${esc(request.owner)} · ${esc(request.mode)} · ${esc(request.message || '想和你换一次技能')}</p>
      </div>
      <span class="request-status">等待回应</span>
      <button type="button" class="icon-button" data-cancel-request="${esc(request.id)}" aria-label="撤回这条邀请" title="撤回">×</button>
    </div>`;
}

function matchCardMarkup() {
  if (!state.profile || (!state.profile.teach && !state.profile.learn && !state.profile.name)) {
    return `<div class="match-card">
        <div class="match-avatar">?</div>
        <div class="match-info">
          <strong>先告诉我：你会什么，又想学什么？</strong>
          <p>补全技能档案后，这里会按匹配度为你排序。</p>
        </div>
        <button type="button" class="button secondary small" data-action="profile">补全技能档案</button>
      </div>`;
  }
  const profile = state.profile;
  return `<div class="match-card">
      <div class="match-avatar">${esc((profile.name || '我').slice(0, 1))}</div>
      <div class="match-info">
        <strong>${esc(profile.name || '我的技能档案')}</strong>
        <p>能教 ${esc(profile.teach || '待补充')} · 想学 ${esc(profile.learn || '待补充')}</p>
      </div>
      <div class="match-tags">
        <span class="tag teach">能教 · ${esc(profile.teach || '—')}</span>
        <span class="tag learn">想学 · ${esc(profile.learn || '—')}</span>
      </div>
      <button type="button" class="button secondary small" data-action="profile">编辑档案</button>
    </div>`;
}

const VIEW_TEXT = {
  discover: {
    eyebrow: 'THE SKILL MARKET',
    title: '发现你的下一份热爱',
    description: '总有一种你想学的，也总有人需要你擅长的。',
    note: '一份擅长，开启一段新的连接'
  },
  matches: {
    eyebrow: 'MADE FOR YOU',
    title: '为你找到合拍的搭子',
    description: '根据你的技能档案，把最可能交换成功的人排在前面。',
    note: '按匹配度排序，先看最合拍的人'
  },
  exchanges: {
    eyebrow: 'MY EXCHANGES',
    title: '我的交换',
    description: '发出的邀请、分享的技能和收藏的灵感，都收在这里。',
    note: '交换邀请会保存在此浏览器'
  }
};

function updateViewMeta() {
  const meta = VIEW_TEXT[state.view] || VIEW_TEXT.discover;
  const eyebrow = $('#section-eyebrow');
  const title = $('#section-title');
  const description = $('#section-description');
  const note = $('#results-note');
  if (eyebrow) eyebrow.textContent = meta.eyebrow;
  if (title) title.innerHTML = `${esc(meta.title)}<span>↗</span>`;
  if (description) description.textContent = meta.description;
  if (note) note.textContent = meta.note;
}

function render() {
  document.querySelectorAll('[data-nav]').forEach((link) => {
    link.classList.toggle('active', link.dataset.nav === state.view);
  });

  const marketControls = document.getElementById('market-controls');
  if (marketControls) marketControls.hidden = state.view === 'exchanges';

  renderCategories();
  renderExchangeTabs();
  updateViewMeta();

  const profileBox = document.getElementById('matching-profile');
  if (profileBox) {
    profileBox.hidden = state.view !== 'matches';
    if (state.view === 'matches') profileBox.innerHTML = matchCardMarkup();
  }

  const grid = document.getElementById('card-grid');
  const empty = document.getElementById('empty-state');
  const emptyDescription = document.getElementById('empty-description');
  const countEl = $('#results-count');
  if (!grid) return;

  if (state.view === 'exchanges') {
    renderExchangeView();
    return;
  }

  let list = filteredSkills();
  let scores = null;
  if (state.view === 'matches') {
    scores = new Map(list.map((skill) => [skill.id, matchScore(skill)]));
    list = list.slice().sort((a, b) => (scores.get(b.id) || 0) - (scores.get(a.id) || 0));
  }

  grid.innerHTML = list.map((skill) => cardMarkup(skill, {
    score: scores ? scores.get(skill.id) : undefined
  })).join('');

  if (countEl) countEl.textContent = `共 ${list.length} 条技能交换`;
  const isEmpty = list.length === 0;
  if (empty) empty.hidden = !isEmpty;
  if (isEmpty && emptyDescription) {
    emptyDescription.textContent = state.view === 'matches'
      ? '暂时没有匹配到合适的技能，换个关键词，或者去发现全部技能看看。'
      : '没有找到符合条件的技能，试试换个关键词，或放宽筛选条件。';
  }
}

function renderExchangeView() {
  const grid = document.getElementById('card-grid');
  const empty = document.getElementById('empty-state');
  const emptyDescription = document.getElementById('empty-description');
  const countEl = $('#results-count');
  if (!grid) return;

  grid.innerHTML = '';
  let isEmpty = false;

  if (state.exchangeTab === 'requests') {
    if (countEl) countEl.textContent = `共 ${state.requests.length} 条交换邀请`;
    if (state.requests.length === 0) {
      isEmpty = true;
      if (emptyDescription) emptyDescription.textContent = '你还没有发出交换邀请。去发现页找一位合拍的搭子，发出第一份邀请吧。';
    } else {
      grid.innerHTML = `<div style="grid-column:1/-1">${state.requests.map(requestMarkup).join('')}</div>`;
    }
  } else if (state.exchangeTab === 'published') {
    if (countEl) countEl.textContent = `共 ${state.published.length} 条我的发布`;
    if (state.published.length === 0) {
      isEmpty = true;
      if (emptyDescription) emptyDescription.textContent = '还没有发布技能。写下你擅长的事，让需要的人找到你。';
    } else {
      const list = state.published.slice().sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      grid.innerHTML = list.map((skill) => cardMarkup(skill, { mine: true })).join('');
    }
  } else {
    const savedSkills = state.saved.map((id) => lookupSkill(id)).filter(Boolean);
    if (countEl) countEl.textContent = `共 ${savedSkills.length} 条收藏`;
    if (savedSkills.length === 0) {
      isEmpty = true;
      if (emptyDescription) emptyDescription.textContent = '还没有收藏。遇到心动的技能时，点一下卡片右上角的星标。';
    } else {
      grid.innerHTML = savedSkills.map((skill) => cardMarkup(skill)).join('');
    }
  }

  if (empty) empty.hidden = !isEmpty;
}

function updateBadges() {
  const count = document.getElementById('exchange-count');
  const pending = state.requests.length;
  if (count) {
    count.textContent = String(pending);
    count.hidden = pending === 0;
  }
  const avatar = document.querySelector('.profile-avatar');
  if (avatar) {
    const name = (state.profile && state.profile.name) || '我';
    avatar.textContent = name.slice(0, 1);
    avatar.title = name;
  }
}

/* ---------- 视图切换 ---------- */

function setView(view, options) {
  state.view = view;
  if (options && options.tab) state.exchangeTab = options.tab;
  render();
  updateBadges();
  const workspace = document.getElementById('workspace');
  if (workspace) workspace.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function refresh() {
  render();
  updateBadges();
}

/* ---------- 弹窗 ---------- */

function openModal(html) {
  const modal = document.getElementById('modal');
  const body = document.getElementById('modal-body');
  if (!modal || !body) return;
  body.innerHTML = html;
  if (!modal.open) modal.showModal();
  document.body.classList.add('modal-open');
}

function closeModal() {
  const modal = document.getElementById('modal');
  document.body.classList.remove('modal-open');
  if (modal && modal.open) modal.close();
}

function categoryOptions(selected) {
  return CATEGORIES
    .map((category) => `<option value="${esc(category)}"${category === selected ? ' selected' : ''}>${esc(category)}</option>`)
    .join('');
}

function openPublish() {
  const profile = state.profile || {};
  openModal(`
    <h2>分享我的拿手好戏</h2>
    <p class="lead">不用是专家，愿意分享就很好。写下来，让对的人找到你。</p>
    <form class="modal-form" id="publish-form">
      <div class="form-grid">
        <div class="field full">
          <label for="p-title">技能标题</label>
          <input id="p-title" name="title" required maxlength="40" placeholder="例如：吉他入门 · 从零到第一首歌">
        </div>
        <div class="field">
          <label for="p-teach">我能教</label>
          <input id="p-teach" name="teaches" required maxlength="16" placeholder="例如：吉他" value="${esc(profile.teach || '')}">
        </div>
        <div class="field">
          <label for="p-learn">我想学</label>
          <input id="p-learn" name="learns" required maxlength="16" placeholder="例如：摄影" value="${esc(profile.learn || '')}">
        </div>
        <div class="field">
          <label for="p-category">技能类别</label>
          <select id="p-category" name="category">${categoryOptions('')}</select>
        </div>
        <div class="field">
          <label for="p-mode">交换方式</label>
          <select id="p-mode" name="mode">
            <option value="${MODE_ONLINE}">${MODE_ONLINE}</option>
            <option value="${MODE_OFFLINE}">${MODE_OFFLINE}</option>
          </select>
        </div>
        <div class="field">
          <label for="p-name">怎么称呼你</label>
          <input id="p-name" name="name" maxlength="12" placeholder="昵称" value="${esc(profile.name || '')}">
        </div>
        <div class="field">
          <label for="p-city">所在城市</label>
          <input id="p-city" name="city" maxlength="12" placeholder="例如：上海">
        </div>
        <div class="field full">
          <label for="p-time">方便的时间</label>
          <input id="p-time" name="time" maxlength="20" placeholder="例如：周末下午 / 工作日晚间">
        </div>
        <div class="field full">
          <label for="p-desc">补充说明</label>
          <textarea id="p-desc" name="desc" maxlength="160" placeholder="介绍一下你的经验、教学方式，以及你想换到什么。"></textarea>
          <span class="field-hint">最多 160 字，真诚比专业更打动人。</span>
        </div>
      </div>
      <div class="modal-actions">
        <button type="button" class="button secondary" data-action="close">取消</button>
        <button type="submit" class="button primary">发布技能</button>
      </div>
    </form>
  `);
}

function openProfile() {
  const profile = state.profile || {};
  openModal(`
    <h2>我的技能档案</h2>
    <p class="lead">告诉我们你擅长什么、想学什么，匹配会更准。</p>
    <form class="modal-form" id="profile-form">
      <div class="form-grid">
        <div class="field full">
          <label for="f-name">昵称</label>
          <input id="f-name" name="name" maxlength="12" placeholder="怎么称呼你" value="${esc(profile.name || '')}">
        </div>
        <div class="field">
          <label for="f-teach">我能教</label>
          <input id="f-teach" name="teach" maxlength="16" placeholder="例如：Python / 吉他" value="${esc(profile.teach || '')}">
        </div>
        <div class="field">
          <label for="f-learn">我想学</label>
          <input id="f-learn" name="learn" maxlength="16" placeholder="例如：摄影 / 英语口语" value="${esc(profile.learn || '')}">
        </div>
        <div class="field full">
          <label for="f-bio">一句话介绍</label>
          <textarea id="f-bio" name="bio" maxlength="80" placeholder="例如：工作三年，周末想学点新东西。">${esc(profile.bio || '')}</textarea>
        </div>
      </div>
      <div class="modal-actions">
        <button type="button" class="button secondary" data-action="close">取消</button>
        <button type="submit" class="button primary">保存档案</button>
      </div>
    </form>
  `);
}

function openHow() {
  openModal(`
    <h2>如何交换</h2>
    <p class="lead">交换没有标准答案，但通常从这三步开始。</p>
    <div class="detail-list">
      <div><dt>01 · 亮出技能</dt><dd>写下能教的、想学的</dd></div>
      <div><dt>02 · 发出邀请</dt><dd>说明想换什么、怎么换</dd></div>
      <div><dt>03 · 约好第一次</dt><dd>先聊 20 分钟，再决定节奏</dd></div>
    </div>
    <p class="lead">小提示：先小额交换一次（比如一次 30 分钟交流），合适再继续。这里的收藏和邀请只保存在你的浏览器里。</p>
    <div class="modal-actions">
      <button type="button" class="button primary" data-action="close">开始找搭子</button>
    </div>
  `);
}

function openInvite(skillId) {
  const skill = lookupSkill(skillId);
  if (!skill) return;
  openModal(`
    <h2>发起交换邀请</h2>
    <p class="lead">向 ${esc(skill.name)} 发起一次「${esc(skill.teaches)} ⇄ ${esc(skill.learns)}」的交换。</p>
    <form class="modal-form" id="invite-form">
      <input type="hidden" name="skillId" value="${esc(skill.id)}">
      <div class="field full">
        <label for="i-message">说点什么</label>
        <textarea id="i-message" name="message" maxlength="120" placeholder="例如：我会摄影，想学吉他，周末下午方便，可以先线上聊聊吗？">你好，看到你的「${esc(skill.title)}」，我正好想学${esc(skill.teaches)}，我可以教你${esc(skill.learns)}，方便约一次交流吗？</textarea>
      </div>
      <div class="modal-actions">
        <button type="button" class="button secondary" data-action="close">取消</button>
        <button type="submit" class="button primary">发送邀请</button>
      </div>
    </form>
  `);
}

function openDetail(skillId) {
  const skill = lookupSkill(skillId);
  if (!skill) return;
  const saved = state.saved.includes(skill.id);
  const score = matchScore(skill);
  openModal(`
    <div class="detail-top">
      <span class="skill-avatar" aria-hidden="true">${esc(skill.avatar || '✳')}</span>
      <div>
        <h2>${esc(skill.title)}</h2>
        <p class="detail-owner">${esc(skill.name)} · ${esc(skill.city || '线上')}${score != null ? ` · 与你匹配 ${score}%` : ''}</p>
      </div>
    </div>
    <p class="lead">${esc(skill.desc)}</p>
    <dl class="detail-list">
      <div><dt>能教</dt><dd>${esc(skill.teaches)}</dd></div>
      <div><dt>想换</dt><dd>${esc(skill.learns)}</dd></div>
      <div><dt>交换方式</dt><dd>${esc(skill.mode)}</dd></div>
      <div><dt>方便时间</dt><dd>${esc(skill.time)}</dd></div>
      <div><dt>技能类别</dt><dd>${esc(skill.category || '其他')}</dd></div>
    </dl>
    <div class="modal-actions">
      <button type="button" class="button secondary" data-action="close">关闭</button>
      <button type="button" class="button secondary" data-save="${esc(skill.id)}">${saved ? '★ 已收藏' : '☆ 收藏'}</button>
      <button type="button" class="button primary" data-invite="${esc(skill.id)}">发起交换 ↗</button>
    </div>
  `);
}

/* ---------- 交互处理 ---------- */

function handleAction(action) {
  if (action === 'publish') openPublish();
  else if (action === 'profile') openProfile();
  else if (action === 'how') openHow();
  else if (action === 'close') closeModal();
  else if (action === 'explore') setView('discover');
}

function toast(message) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => el.classList.remove('show'), 2400);
}

document.addEventListener('click', (event) => {
  const navLink = event.target.closest('[data-nav]');
  if (navLink) {
    event.preventDefault();
    const view = navLink.dataset.nav;
    setView(view, view === 'exchanges' ? { tab: 'requests' } : undefined);
    return;
  }

  const actionEl = event.target.closest('[data-action]');
  if (actionEl) {
    event.preventDefault();
    handleAction(actionEl.dataset.action);
    return;
  }

  const saveEl = event.target.closest('[data-save]');
  if (saveEl) {
    event.preventDefault();
    const id = saveEl.dataset.save;
    const index = state.saved.indexOf(id);
    if (index === -1) {
      state.saved.push(id);
      toast('已收藏，去「我的交换」里查看');
    } else {
      state.saved.splice(index, 1);
      toast('已取消收藏');
    }
    persist();
    refresh();
    if (document.getElementById('modal').open && document.getElementById('modal-body').querySelector('.detail-top')) {
      openDetail(id);
    }
    return;
  }

  const inviteEl = event.target.closest('[data-invite]');
  if (inviteEl) {
    event.preventDefault();
    openInvite(inviteEl.dataset.invite);
    return;
  }

  const deleteEl = event.target.closest('[data-delete]');
  if (deleteEl) {
    event.preventDefault();
    const id = deleteEl.dataset.delete;
    state.published = state.published.filter((skill) => skill.id !== id);
    persist();
    refresh();
    toast('已删除这条发布');
    return;
  }

  const cancelEl = event.target.closest('[data-cancel-request]');
  if (cancelEl) {
    event.preventDefault();
    const id = cancelEl.dataset.cancelRequest;
    state.requests = state.requests.filter((request) => request.id !== id);
    persist();
    refresh();
    toast('已撤回邀请');
    return;
  }

  const categoryEl = event.target.closest('[data-category]');
  if (categoryEl) {
    state.filters.category = categoryEl.dataset.category;
    if (state.view !== 'discover' && state.view !== 'matches') state.view = 'discover';
    refresh();
    return;
  }

  const tabEl = event.target.closest('[data-exchange-tab]');
  if (tabEl) {
    state.exchangeTab = tabEl.dataset.exchangeTab;
    refresh();
    return;
  }

  const card = event.target.closest('.skill-card');
  if (card && !event.target.closest('button, a, input, select')) {
    openDetail(card.dataset.id);
    return;
  }

  const emptyAction = event.target.closest('#empty-action');
  if (emptyAction) {
    state.filters = { q: '', mode: 'all', category: '全部', sort: 'recommended' };
    const search = document.getElementById('search');
    const mode = document.getElementById('mode');
    if (search) search.value = '';
    if (mode) mode.value = 'all';
    if (state.view === 'exchanges') {
      state.view = 'discover';
      state.exchangeTab = 'requests';
    }
    refresh();
    return;
  }
});

document.addEventListener('submit', (event) => {
  const form = event.target;
  if (!(form instanceof HTMLFormElement)) return;

  if (form.id === 'publish-form') {
    event.preventDefault();
    const data = new FormData(form);
    const title = String(data.get('title') || '').trim();
    const teaches = String(data.get('teaches') || '').trim();
    const learns = String(data.get('learns') || '').trim();
    if (!title || !teaches || !learns) {
      toast('标题、能教、想学都要填写哦');
      return;
    }
    const skill = {
      id: `mine-${Date.now()}`,
      avatar: AVATARS[hashStr(title) % AVATARS.length],
      name: String(data.get('name') || '').trim() || (state.profile && state.profile.name) || '我',
      city: String(data.get('city') || '').trim() || '线上',
      title,
      teaches,
      learns,
      category: String(data.get('category') || '生活'),
      mode: String(data.get('mode') || MODE_ONLINE),
      time: String(data.get('time') || '').trim() || '时间待商量',
      desc: String(data.get('desc') || '').trim() || `${teaches} 换 ${learns}，期待遇见合拍的你。`,
      featured: false,
      createdAt: Date.now()
    };
    state.published.unshift(skill);
    if (!state.profile) state.profile = { name: skill.name, teach: teaches, learn: learns, bio: '' };
    persist();
    closeModal();
    setView('exchanges', { tab: 'published' });
    toast('发布成功，已加入「我的发布」');
    return;
  }

  if (form.id === 'profile-form') {
    event.preventDefault();
    const data = new FormData(form);
    state.profile = {
      name: String(data.get('name') || '').trim() || '我',
      teach: String(data.get('teach') || '').trim(),
      learn: String(data.get('learn') || '').trim(),
      bio: String(data.get('bio') || '').trim()
    };
    persist();
    closeModal();
    refresh();
    toast('档案已保存，匹配会更准');
    return;
  }

  if (form.id === 'invite-form') {
    event.preventDefault();
    const data = new FormData(form);
    const skill = lookupSkill(String(data.get('skillId') || ''));
    if (!skill) return;
    state.requests.unshift({
      id: `req-${Date.now()}`,
      skillId: skill.id,
      title: skill.title,
      owner: skill.name,
      mode: skill.mode,
      message: String(data.get('message') || '').trim(),
      at: Date.now()
    });
    persist();
    closeModal();
    refresh();
    setView('exchanges', { tab: 'requests' });
    toast('邀请已发送，等待对方回应');
  }
});

document.addEventListener('input', (event) => {
  if (event.target.id === 'search') {
    state.filters.q = event.target.value;
    if (state.view !== 'discover' && state.view !== 'matches') state.view = 'discover';
    refresh();
  }
});

document.addEventListener('change', (event) => {
  if (event.target.id === 'mode') {
    state.filters.mode = event.target.value;
    refresh();
  }
  if (event.target.id === 'sort') {
    state.filters.sort = event.target.value;
    refresh();
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    const modal = document.getElementById('modal');
    if (modal && modal.open) closeModal();
  }
});

(function initModal() {
  const modal = document.getElementById('modal');
  if (!modal) return;
  modal.addEventListener('close', () => document.body.classList.remove('modal-open'));
  modal.addEventListener('click', (event) => {
    if (event.target === modal) closeModal();
  });
})();

/* ---------- 启动 ---------- */

loadState();
render();
updateBadges();
