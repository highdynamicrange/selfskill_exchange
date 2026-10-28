import { recommendation, safeUrl, createOrder, transitionOrder, ORDER_LABELS } from './domain.js';
/* =========================================================
   换个技能 · Skill Swap Club
   纯前端演示：数据保存在 localStorage，仅用于原型展示
   ========================================================= */

const STORAGE_KEY = 'skill-swap-club:v2';
const LEGACY_KEY = 'skill-swap-club:v1';
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
  currentUser: 'learner',
  accounts: { learner: { profile: { name: '学习者', teach: '摄影', learn: '吉他', bio: '' }, saved: [], requests: [] }, 'teacher-seed-1': { profile: { name: '周野', teach: '吉他', learn: '摄影', bio: '吉他老师 · 演示身份' }, saved: [], requests: [] } },
  orders: [],
  orderTab: 'buyer',
  profile: { name: '学习者', teach: '摄影', learn: '吉他', bio: '' },
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
  return state.published.concat(SEED_SKILLS).map(enrichSkill);
}

const COURSE_CONTENT = {
  'seed-1': { price: 19900, outcome: '独立弹唱一首完整歌曲，获得一份个人练习计划与录音反馈。', syllabus: '第 1 课 · 调音、持琴与节奏基础（45 分钟）\n第 2 课 · 四个常用和弦与转换练习（45 分钟）\n第 3 课 · 分解与扫弦，连接主歌副歌（45 分钟）\n第 4 课 · 完整弹唱与一对一反馈（45 分钟）', trial: '20 分钟认识你的吉他：检查持琴姿势，练习一个 Em 和弦，确认学习目标。', portfolio: '成果示例：从零开始完成一段 60 秒弹唱；课后交付和弦表与练习打卡模板。' },
  'seed-2': { price: 29900, outcome: '完成一组 6 张自然光人像，掌握取景、测光与基础选片。', syllabus: '第 1 课 · 认识曝光与自然光\n第 2 课 · 构图与人物引导\n第 3 课 · 实拍练习与选片\n第 4 课 · 作品点评与整理', trial: '20 分钟作品诊断：带来 3 张照片，一起找到光线与构图的改进点。', portfolio: '成果示例：窗边自然光人像系列，包含拍摄思路、参数与前后对比。' },
  'seed-3': { price: 25900, outcome: '用 Python 完成一个可重复运行的 Excel 自动汇总脚本。', syllabus: '第 1 课 · 环境配置与 Python 基础\n第 2 课 · pandas 数据读写与清洗\n第 3 课 · 多表合并与统计\n第 4 课 · 自动化脚本交付与代码评审', trial: '20 分钟需求拆解：一起分析一份重复报表，并演示读取 Excel 的基本流程。', portfolio: '成果示例：多份月报一键汇总；交付源代码、依赖清单和运行说明。' }
};
function enrichSkill(skill) {
  const sample = skill.id.startsWith('seed-');
  return { ownerId: sample ? 'teacher-' + skill.id : 'learner', offering: 'both', price: 15900, trialPrice: 0,
    duration: '4 课时 · 每次 45 分钟', level: '零基础友好', cover: '', video: '', material: '', portfolioUrl: '',
    outcome: `完成一份${skill.teaches}练习作品，并获得一次针对性反馈。`,
    syllabus: `第 1 课 · 认识${skill.teaches}与学习目标\n第 2 课 · 基础方法与示范\n第 3 课 · 独立练习与指导\n第 4 课 · 成果展示与复盘`,
    trial: `20 分钟了解${skill.teaches}的基础方法与学习计划，确认是否适合。`,
    portfolio: sample ? '演示成果说明：完成入门练习，并获得老师的具体反馈。' : '',
    ...COURSE_CONTENT[skill.id], ...skill };
}
function money(cents) { return '¥' + (cents / 100).toLocaleString('zh-CN', { maximumFractionDigits: 2 }); }
function coverMarkup(skill) {
  const url = safeUrl(skill.cover, true);
  return `<div class="course-cover tone-${CATEGORIES.indexOf(skill.category) % 5}">${url ? `<img src="${esc(url)}" alt="${esc(skill.title)}的封面" loading="lazy" referrerpolicy="no-referrer"><span class="cover-fallback">${esc(skill.teaches)}</span>` : `<span class="cover-kicker">THE JOY OF LEARNING</span><span class="cover-glyph">${esc(skill.avatar || '✳')}</span><strong>${esc(skill.teaches)}</strong><span class="cover-decoration">✳</span>`}<span class="cover-category">${esc(skill.category)}</span></div>`;
}

function lookupSkill(id) {
  return allSkills().find((skill) => skill.id === id) || null;
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      if (data.accounts && data.accounts[data.currentUser]) {
        state.accounts = data.accounts;
        state.currentUser = data.currentUser;
        state.orders = Array.isArray(data.orders) ? data.orders : [];
        state.published = Array.isArray(data.published) ? data.published : [];
        Object.assign(state, state.accounts[state.currentUser]);
      }
    } else {
      const old = JSON.parse(localStorage.getItem(LEGACY_KEY) || 'null');
      if (old) {
        state.profile = old.profile || state.profile;
        state.saved = old.saved || [];
        state.requests = old.requests || [];
        state.published = (old.published || []).map(s => ({ ...s, ownerId: 'learner' }));
      }
    }
  } catch { toast('本机数据无法读取，已使用演示内容'); }
}
function persist() {
  state.accounts[state.currentUser] = { profile: state.profile, saved: state.saved, requests: state.requests };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ currentUser: state.currentUser, accounts: state.accounts, published: state.published, orders: state.orders }));
    return true;
  } catch {
    toast('保存失败：浏览器存储空间不足，请使用更小的图片；当前变更刷新后会丢失');
    return false;
  }
}
function matchScore(skill) { return recommendation(skill, state.profile).score; }
function openAccount() {
  openModal(`<h2>我的空间</h2><p class="lead">本机演示身份，不是真实登录。切换身份可体验学员购买与老师交付，数据不会同步给其他访客。</p>
    <div class="account-summary"><strong>${esc(state.profile?.name || '我')}</strong><p>我能教：${esc(state.profile?.teach || '待填写')}</p><p>我想学：${esc(state.profile?.learn || '待填写')}</p></div>
    <div class="modal-actions"><button class="button secondary" data-action="profile">编辑技能档案</button></div>
    <h3>切换演示身份</h3><div class="account-list">${Object.entries(state.accounts).map(([id, a]) => `<button class="button secondary" data-account="${esc(id)}">${esc(a.profile.name)}${id === state.currentUser ? ' · 当前' : ''}</button>`).join('')}</div>
    <form id="account-form" class="modal-form"><div class="field"><label for="account-name">新建本机演示身份</label><input id="account-name" name="name" required maxlength="20" placeholder="输入昵称"></div><button class="button primary">创建并切换</button></form>`);
}
function switchAccount(id) {
  if (!state.accounts[id]) return;
  persist();
  state.currentUser = id;
  Object.assign(state, state.accounts[id]);
  persist(); closeModal(); refresh(); toast('已切换到 ' + state.profile.name);
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
      const interestDiff = matchScore(b) - matchScore(a);
      if (interestDiff) return interestDiff;
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
      <button class="cover-button" data-detail="${esc(skill.id)}" aria-label="查看${esc(skill.title)}详情">${coverMarkup(skill)}</button>
      <div class="card-top">
        <span class="skill-avatar" aria-hidden="true">${esc(skill.avatar || '✳')}</span>
        <div class="card-heading">
          <h3 class="card-title"><button class="title-button" data-detail="${esc(skill.id)}">${esc(skill.title)}</button></h3>
          <p class="card-owner">${esc(skill.name || '匿名')} · ${esc(skill.city || '线上')}${opts.mine ? ' · 我发布的' : ''}</p>
        </div>
        ${topButton}
      </div>
      <p class="card-desc">${esc(skill.desc)}</p>
      <p class="course-outcome">学完能做到 · ${esc(skill.outcome)}</p>
      <div class="card-tags">
        <span class="tag teach">能教 · ${esc(skill.teaches)}</span>
        <span class="tag learn">${skill.offering === "paid" ? "付费课程" : "可互换 · " + esc(skill.learns)}</span>
      </div>
      <div class="card-foot">
        <span class="card-meta">${esc(skill.mode)} · ${esc(skill.time)}</span>
        ${score != null ? `<span class="match-badge">${esc(recommendation(skill, state.profile).reason)}</span>` : ''}
        <strong class="course-price">${skill.offering === "swap" ? "技能互换" : money(skill.price)}<small>${skill.offering === "swap" ? "" : " / 整套课程"}</small></strong><button type="button" class="button secondary small" data-detail="${esc(skill.id)}">查看课程 ↗</button>
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
      <span class="request-status">本机演示邀请</span>
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
  orders: { eyebrow: 'MY LEARNING JOURNEY', title: '每一次学习，都有迹可循', description: '购买记录、课程交付与验收进度，在这里一起管理。', note: '本机模拟交易 · 不发生真实扣款' },
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
  $('#hero').hidden = state.view !== 'discover';
  $('.value-strip').hidden = state.view !== 'discover';
  document.querySelectorAll('[data-nav]').forEach((link) => {
    link.classList.toggle('active', link.dataset.nav === state.view);
  });

  const marketControls = document.getElementById('market-controls');
  if (marketControls) marketControls.hidden = ['exchanges', 'orders'].includes(state.view);

  renderCategories();
  renderExchangeTabs();
  updateViewMeta();

  const profileBox = document.getElementById('matching-profile');
  if (profileBox) {
    profileBox.hidden = state.view !== 'matches';
    if (state.view === 'matches') profileBox.innerHTML = matchCardMarkup();
  }

  document.getElementById('order-controls')?.remove();
  const grid = document.getElementById('card-grid');
  const empty = document.getElementById('empty-state');
  const emptyDescription = document.getElementById('empty-description');
  const countEl = $('#results-count');
  if (!grid) return;

  if (state.view === 'orders') { renderOrders(); return; }
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
    if (countEl) countEl.textContent = `共 ${state.published.filter(s => s.ownerId === state.currentUser).length} 条我的发布`;
    if (state.published.filter(s => s.ownerId === state.currentUser).length === 0) {
      isEmpty = true;
      if (emptyDescription) emptyDescription.textContent = '还没有发布技能。写下你擅长的事，让需要的人找到你。';
    } else {
      const list = state.published.filter(s => s.ownerId === state.currentUser).map(enrichSkill).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
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
  history.replaceState(null, '', '#' + view);
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
  const heading = body.querySelector('h2');
  if (heading) heading.id = 'modal-title';
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

function openPublish(skillId) {
  const editing = skillId ? lookupSkill(skillId) : null;
  if (editing && editing.ownerId !== state.currentUser) return;
  const profile = state.profile || {};
  openModal(`
    <h2>分享我的拿手好戏</h2>
    <p class="lead">不用是专家，愿意分享就很好。写下来，让对的人找到你。</p>
    <form class="modal-form" id="publish-form">
      <input type="hidden" name="editing" value="${esc(editing?.id || '')}">
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
          <textarea id="p-desc" name="desc" maxlength="1200" placeholder="介绍一下你的经验、教学方式，以及你想换到什么。"></textarea>
          <span class="field-hint">最多 1200 字，真诚比专业更打动人。</span>
        </div>
        <div class="field full"><label for="p-cover">封面图片链接（可选）</label><input id="p-cover" name="cover" type="url" placeholder="https://…"><span class="field-hint">也可以上传 JPG / PNG / WebP，最大 600 KB。未设置时使用分类封面。</span><input type="file" name="coverFile" accept="image/jpeg,image/png,image/webp" aria-label="上传课程封面"></div>
        <div class="field"><label for="p-offering">学习方式</label><select id="p-offering" name="offering"><option value="both">技能互换 / 付费均可</option><option value="swap">仅技能互换</option><option value="paid">仅付费课程</option></select></div>
        <div class="field"><label for="p-price">整套课程价格（元）</label><input id="p-price" name="price" type="number" min="0" max="99999" step="0.01" required value="199"></div>
        <div class="field"><label for="p-trialPrice">试讲价格（元，0 为免费）</label><input id="p-trialPrice" name="trialPrice" type="number" min="0" max="99999" step="0.01" required value="0"></div>
        <div class="field"><label for="p-duration">课时安排</label><input id="p-duration" name="duration" maxlength="80" value="4 课时 · 每次 45 分钟" required></div>
        <div class="field full"><label for="p-outcome">学完能做到什么 / 验收标准</label><textarea id="p-outcome" name="outcome" required maxlength="500" placeholder="例如：独立弹唱一首完整歌曲，提交录音并获得老师点评。"></textarea></div>
        <div class="field full"><label for="p-syllabus">课程设计（每行一课）</label><textarea id="p-syllabus" name="syllabus" required maxlength="2000" placeholder="第 1 课 · 基础知识与示范&#10;第 2 课 · 独立练习与指导"></textarea></div>
        <div class="field full"><label for="p-trial">试讲方案</label><textarea id="p-trial" name="trial" required maxlength="800" placeholder="时长、试讲内容、需要提前准备什么"></textarea></div>
        <div class="field full"><label for="p-portfolio">成果展示说明</label><textarea id="p-portfolio" name="portfolio" maxlength="1000" placeholder="描述代表作品或学员能完成的成果，不填写虚构成绩。"></textarea></div>
        <div class="field full"><label for="p-portfolioUrl">成果作品链接（可选）</label><input id="p-portfolioUrl" name="portfolioUrl" type="url" placeholder="https://…"></div>
        <div class="field full"><label for="p-video">试讲视频链接（可选）</label><input id="p-video" name="video" type="url" placeholder="HTTPS MP4 直链或视频平台页面"></div>
        <div class="field full"><label for="p-material">教案 / 讲义链接（可选）</label><input id="p-material" name="material" type="url" placeholder="PDF 或公开文档链接"></div>
      </div>
      <p class="prototype-note">发布内容仅保存在当前浏览器。示例课程与价格用于体验，不代表真实在售服务。</p>
      <div class="modal-actions">
        <button type="button" class="button secondary" data-action="close">取消</button>
        <button type="submit" class="button primary">${editing ? '保存修改' : '发布技能'}</button>
      </div>
    </form>
  `);
  if (editing) {
    const form = $('#publish-form');
    for (const [key, value] of Object.entries(editing)) {
      const el = form.elements.namedItem(key);
      if (el && el.type !== 'file') el.value = ['price', 'trialPrice'].includes(key) ? value / 100 : (key === 'cover' && String(value).startsWith('data:') ? '' : value);
    }
    $('#modal-title').textContent = '编辑我的课程';
  }
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
          <input id="f-teach" name="teach" maxlength="100" placeholder="例如：Python / 吉他" value="${esc(profile.teach || '')}">
        </div>
        <div class="field">
          <label for="f-learn">我想学</label>
          <input id="f-learn" name="learn" maxlength="100" placeholder="例如：摄影 / 英语口语" value="${esc(profile.learn || '')}">
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

function resourceLink(url, label) {
  const href = safeUrl(url);
  return href ? `<a class="resource-link" href="${esc(href)}" target="_blank" rel="noopener noreferrer">${esc(label)} ↗</a>` : '';
}
function openDetail(skillId) {
  const skill = lookupSkill(skillId);
  if (!skill) return;
  const mine = skill.ownerId === state.currentUser;
  const video = safeUrl(skill.video);
  openModal(`<div class="detail-cover">${coverMarkup(skill)}</div><div class="detail-top"><div><span class="eyebrow muted">${esc(skill.category)} / ${esc(skill.level)}</span><h2>${esc(skill.title)}</h2><p class="detail-owner">${esc(skill.name)} · ${esc(skill.city)} · ${esc(skill.mode)}</p></div></div>
    <p class="lead">${esc(skill.desc)}</p><div class="course-facts"><span>${esc(skill.duration)}</span><span>${esc(skill.time)}</span><span>${esc(recommendation(skill, state.profile).reason)}</span></div>
    <section class="detail-section"><h3>你将收获什么</h3><p>${esc(skill.outcome)}</p></section>
    <section class="detail-section"><h3>课程怎么安排</h3><ol class="lesson-list">${skill.syllabus.split('\n').filter(Boolean).map(l => `<li>${esc(l)}</li>`).join('')}</ol>${resourceLink(skill.material, '查看完整教案 / 讲义')}</section>
    <section class="detail-section"><h3>先试一小步 · ${money(skill.trialPrice)} 试讲</h3><p>${esc(skill.trial)}</p>${video && /\.mp4(?:[?#]|$)/i.test(video) ? `<video controls preload="none" src="${esc(video)}" aria-label="试讲视频"></video>` : ''}${resourceLink(video, '打开试讲视频')}${!video ? '<p class="field-hint">尚未上传试讲视频，可先查看文字方案。</p>' : ''}</section>
    <section class="detail-section"><h3>成果展示</h3><p>${esc(skill.portfolio || '发布者暂未添加成果说明。')}</p>${resourceLink(skill.portfolioUrl, '查看成果作品')}</section>
    <section class="purchase-panel"><div><span>${skill.offering === 'swap' ? '技能互换' : '整套课程'}</span><strong>${skill.offering === 'swap' ? '以技能交换' : money(skill.price)}</strong><small>想学：${esc(skill.learns)}</small></div><div class="purchase-actions">${mine ? `<button class="button primary" data-edit="${esc(skill.id)}">编辑课程</button>` : `<button class="button secondary" data-save="${esc(skill.id)}">${state.saved.includes(skill.id) ? '★ 已收藏' : '☆ 收藏课程'}</button>${skill.offering !== 'paid' ? `<button class="button secondary" data-invite="${esc(skill.id)}">技能互换</button>` : ''}${skill.offering !== 'swap' ? `<button class="button secondary" data-buy="${esc(skill.id)}" data-kind="trial">预约试讲</button><button class="button primary" data-buy="${esc(skill.id)}" data-kind="course">购买课程</button>` : ''}`}</div></section>
    <p class="prototype-note">原型演示：示例讲师、成果与价格用于体验。订单及付款仅在本机模拟，不实际收费。</p>`);
}

/* ---------- 本机模拟订单 ---------- */
function orderMarkup(order) {
  const role = order.buyerId === state.currentUser ? 'buyer' : 'seller';
  return `<article class="order-card"><div class="order-header"><span>${new Date(order.createdAt).toLocaleDateString('zh-CN')} · ${order.kind === 'trial' ? '试讲预约' : '整套课程'}</span><span class="order-status status-${esc(order.status)}">${ORDER_LABELS[order.status]}</span></div><h3>${esc(order.title)}</h3><p>${role === 'buyer' ? '授课老师：' + esc(order.sellerName) : '购买学员：' + esc(order.buyerName)} · ${esc(order.snapshot.mode)}</p><div class="order-footer"><strong>${money(order.amount)} <small>模拟金额</small></strong><button class="button secondary small" data-order="${esc(order.id)}">${order.status === 'pending' && role === 'buyer' ? '去模拟付款' : order.status === 'delivered' && role === 'buyer' ? '查看交付并验收' : '查看订单'}</button></div></article>`;
}
function renderOrders() {
  const grid = $('#card-grid');
  const controls = document.createElement('div');
  controls.id = 'order-controls'; controls.className = 'categories exchange-tabs';
  controls.innerHTML = `<button class="category ${state.orderTab === 'buyer' ? 'active' : ''}" data-order-tab="buyer">我买的课程</button><button class="category ${state.orderTab === 'seller' ? 'active' : ''}" data-order-tab="seller">我教的课程</button><button class="category" data-action="account">切换演示身份 ↗</button>`;
  grid.before(controls);
  const list = state.orders.filter(o => (state.orderTab === 'buyer' ? o.buyerId : o.sellerId) === state.currentUser);
  $('#results-count').textContent = `${state.profile.name} · ${list.length} 笔订单`;
  grid.innerHTML = list.map(orderMarkup).join('');
  $('#empty-state').hidden = list.length > 0;
  $('#empty-description').textContent = state.orderTab === 'buyer' ? '选择感兴趣的课程，从一次免费试讲开始。' : '尚无学员购买你的课程。切换演示身份后可以体验完整流程。';
}
function openCheckout(id, kind) {
  const skill = lookupSkill(id);
  if (!skill || skill.ownerId === state.currentUser || skill.offering === 'swap') return;
  const trial = kind === 'trial';
  openModal(`<h2>确认${trial ? '试讲预约' : '课程订单'}</h2><p class="lead">${esc(skill.title)}</p><dl class="detail-list"><div><dt>购买身份</dt><dd>${esc(state.profile.name)}</dd></div><div><dt>授课老师</dt><dd>${esc(skill.name)}</dd></div><div><dt>内容</dt><dd>${esc(trial ? skill.trial : skill.duration)}</dd></div><div><dt>应付金额</dt><dd>${money(trial ? skill.trialPrice : skill.price)}</dd></div></dl><p class="prototype-note">这是演示订单，不会实际扣款。提交后可模拟付款；付款后由老师交付，学员确认验收后订单完成。未交付前可模拟退款，交付后可要求补充。</p><form id="checkout-form" class="modal-form"><input type="hidden" name="skillId" value="${esc(id)}"><input type="hidden" name="kind" value="${esc(kind)}"><label class="check-label"><input type="checkbox" required> 我已了解课程内容、价格和演示交易规则</label><button class="button primary">创建演示订单</button></form>`);
}
function openOrder(id) {
  const order = state.orders.find(o => o.id === id);
  if (!order || ![order.buyerId, order.sellerId].includes(state.currentUser)) return;
  const buyer = state.currentUser === order.buyerId;
  let actions = '';
  const button = (action, label, primary = false) => `<button class="button ${primary ? 'primary' : 'secondary'}" data-order-action="${action}" data-order-id="${esc(id)}">${label}</button>`;
  if (buyer && order.status === 'pending') actions = button('pay', `模拟付款 ${money(order.amount)}`, true) + button('cancel', '取消订单');
  if (buyer && order.status === 'paid') actions = button('refund', '申请模拟退款');
  if (!buyer && order.status === 'paid') actions = button('deliver', '提交课程交付', true);
  if (buyer && order.status === 'delivered') actions = button('accept', '确认验收', true) + button('revise', '要求补充交付');
  const actionLabels = { create: '创建订单', pay: '模拟付款成功', cancel: '取消订单', deliver: '老师提交交付', accept: '学员验收完成 / 模拟结算', refund: '模拟原路退款', revise: '要求补充交付' };
  openModal(`<h2>订单详情</h2><p class="lead">${esc(order.title)}</p><span class="order-status status-${esc(order.status)}">${ORDER_LABELS[order.status]}</span><dl class="detail-list"><div><dt>订单编号</dt><dd class="order-id">${esc(order.id)}</dd></div><div><dt>学员 / 老师</dt><dd>${esc(order.buyerName)} / ${esc(order.sellerName)}</dd></div><div><dt>购买类型</dt><dd>${order.kind === 'trial' ? '试讲' : '整套课程'}</dd></div><div><dt>订单金额</dt><dd>${money(order.amount)}（模拟）</dd></div><div><dt>支付方式</dt><dd>演示支付 · 无真实扣款</dd></div></dl><section class="detail-section"><h3>购买时的课程约定</h3><p>${esc(order.kind === 'trial' ? order.snapshot.trial : order.snapshot.syllabus)}</p><h4>验收内容</h4><p>${esc(order.kind === 'trial' ? order.snapshot.trial : order.snapshot.outcome)}</p></section>${order.delivery ? `<section class="detail-section"><h3>老师交付内容</h3><p>${esc(order.delivery)}</p></section>` : ''}<section class="detail-section"><h3>订单记录</h3><ol class="timeline">${order.history.map(h => `<li><strong>${actionLabels[h.action]}</strong><small>${new Date(h.at).toLocaleString('zh-CN')}</small>${h.note ? `<p>${esc(h.note)}</p>` : ''}</li>`).join('')}</ol></section><div class="modal-actions">${actions}</div><p class="prototype-note">${order.status === 'paid' && buyer ? '下一步：在「我的空间」切换到老师身份，进入「订单中心 → 我教的课程」提交交付。' : '所有记录仅保存在此浏览器，不能作为真实付款或交易凭证。'}</p>`);
}
function openOrderAction(id, action) {
  const order = state.orders.find(o => o.id === id);
  if (!order) return;
  const titles = { pay: '确认模拟付款', cancel: '取消这笔订单', deliver: '提交课程交付', accept: '确认验收并模拟结算', refund: '确认模拟退款', revise: '要求补充交付' };
  if (!titles[action]) return;
  const note = ['deliver', 'revise'].includes(action);
  openModal(`<h2>${titles[action]}</h2><p class="lead">${esc(order.title)} · ${money(order.amount)}</p><p class="prototype-note">${action === 'accept' ? '确认已完成约定课程并收到成果反馈。验收后订单完成；此处仅演示结算，不转移资金。' : action === 'pay' ? '点击确认仅更改本机订单状态，不连接支付渠道，不产生真实扣款。' : action === 'refund' ? '演示规则：未交付的已付款订单可直接全额模拟退款。不会发生真实资金流动。' : '本次操作会记录在订单历史中。'}</p><form id="order-action-form" class="modal-form"><input type="hidden" name="orderId" value="${esc(id)}"><input type="hidden" name="action" value="${action}">${note ? `<div class="field"><label for="order-note">${action === 'deliver' ? '交付内容与成果反馈（可附作品网址）' : '需要补充的内容'}</label><textarea id="order-note" name="note" required maxlength="2000"></textarea></div>` : ''}<div class="modal-actions"><button type="button" class="button secondary" data-order="${esc(id)}">返回订单</button><button class="button primary">确认${action === 'pay' ? '模拟付款' : action === 'refund' ? '模拟退款' : ''}</button></div></form>`);
}

/* ---------- 交互处理 ---------- */

function handleAction(action) {
  if (action === 'publish') openPublish();
  else if (action === 'profile') openProfile();
  else if (action === 'account') openAccount();
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
  const orderTab = event.target.closest('[data-order-tab]');
  if (orderTab) { state.orderTab = orderTab.dataset.orderTab; refresh(); return; }
  const orderAction = event.target.closest('[data-order-action]');
  if (orderAction) { openOrderAction(orderAction.dataset.orderId, orderAction.dataset.orderAction); return; }
  const orderLink = event.target.closest('[data-order]');
  if (orderLink) { openOrder(orderLink.dataset.order); return; }
  const buy = event.target.closest('[data-buy]');
  if (buy) { openCheckout(buy.dataset.buy, buy.dataset.kind); return; }
  const detail = event.target.closest('[data-detail]');
  if (detail) { openDetail(detail.dataset.detail); return; }
  const edit = event.target.closest('[data-edit]');
  if (edit) { openPublish(edit.dataset.edit); return; }
  const account = event.target.closest('[data-account]');
  if (account) { switchAccount(account.dataset.account); return; }
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
    if (['exchanges', 'orders'].includes(state.view)) {
      state.view = 'discover';
      state.exchangeTab = 'requests';
    }
    refresh();
    return;
  }
});

document.addEventListener('submit', async (event) => {
  const form = event.target;
  if (!(form instanceof HTMLFormElement)) return;

  if (form.id === 'checkout-form') {
    event.preventDefault();
    const data = new FormData(form);
    const skill = lookupSkill(String(data.get('skillId')));
    if (!skill || skill.offering === 'swap') return;
    const kind = String(data.get('kind'));
    const existing = state.orders.find(o => o.buyerId === state.currentUser && o.skillId === skill.id && o.kind === kind && ['pending', 'paid', 'delivered'].includes(o.status));
    if (existing) { openOrder(existing.id); toast('已有进行中的订单，已为你打开'); return; }
    try {
      const order = createOrder(skill, { id: state.currentUser, name: state.profile.name }, kind);
      if (!state.accounts[skill.ownerId]) state.accounts[skill.ownerId] = { profile: { name: skill.name, teach: skill.teaches, learn: skill.learns, bio: '演示老师' }, saved: [], requests: [] };
      state.orders.unshift(order);
      if (!persist()) { state.orders.shift(); return; }
      state.orderTab = 'buyer'; setView('orders'); openOrder(order.id);
    } catch (err) { toast(err.message); }
    return;
  }
  if (form.id === 'order-action-form') {
    event.preventDefault();
    const data = new FormData(form);
    const index = state.orders.findIndex(o => o.id === data.get('orderId'));
    if (index < 0) return;
    const old = state.orders[index];
    try {
      state.orders[index] = transitionOrder(old, String(data.get('action')), state.currentUser, String(data.get('note') || ''));
      if (!persist()) { state.orders[index] = old; return; }
      refresh(); openOrder(old.id); toast('演示订单已更新');
    } catch (err) { toast(err.message); }
    return;
  }
  if (form.id === 'account-form') {
    event.preventDefault();
    const name = String(new FormData(form).get('name')).trim();
    if (!name) return;
    const id = crypto.randomUUID();
    state.accounts[id] = { profile: { name, teach: '', learn: '', bio: '' }, saved: [], requests: [] };
    switchAccount(id); return;
  }

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
    const editing = data.get('editing') ? lookupSkill(String(data.get('editing'))) : null;
    if (editing && editing.ownerId !== state.currentUser) return;
    let cover = String(data.get('cover') || '').trim() || editing?.cover || '';
    const file = data.get('coverFile');
    if (file && file.size) {
      if (file.size > 600 * 1024 || !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) { toast('请选择 600 KB 以内的 JPG / PNG / WebP 图片'); return; }
      try { cover = await new Promise((resolve, reject) => { const r = new FileReader(); r.onload = () => resolve(r.result); r.onerror = reject; r.readAsDataURL(file); }); }
      catch { toast('图片读取失败，请重试'); return; }
    }
    const media = { cover, video: String(data.get('video') || ''), material: String(data.get('material') || ''), portfolioUrl: String(data.get('portfolioUrl') || '') };
    if (Object.entries(media).some(([k, v]) => v && !safeUrl(v, k === 'cover'))) { toast('素材链接必须是 HTTP 或 HTTPS 地址'); return; }
    const advanced = Object.fromEntries(['duration', 'outcome', 'syllabus', 'trial', 'portfolio', 'offering'].map(k => [k, String(data.get(k) || '').trim()]));
    if (!advanced.outcome || !advanced.syllabus || !advanced.trial || !advanced.duration) { toast('请填写课程安排、试讲与验收标准'); return; }
    const price = Math.round(Number(data.get('price')) * 100);
    const trialPrice = Math.round(Number(data.get('trialPrice')) * 100);
    if (![price, trialPrice].every(v => Number.isInteger(v) && v >= 0 && v <= 9999900)) { toast('价格超出有效范围'); return; }
    const skill = {
      ...advanced, ...media, price, trialPrice,
      id: `mine-${crypto.randomUUID()}`,
      ownerId: state.currentUser,
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
    const previous = state.published.slice();
    if (editing) { skill.id = editing.id; skill.createdAt = editing.createdAt; state.published = state.published.map(s => s.id === editing.id ? skill : s); }
    else state.published.unshift(skill);
    if (!state.profile) state.profile = { name: skill.name, teach: teaches, learn: learns, bio: '' };
    if (!persist()) { state.published = previous; return; }
    closeModal();
    setView('exchanges', { tab: 'published' });
    toast(editing ? '课程修改已保存' : '发布成功，已加入「我的发布」');
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
    toast('演示邀请已保存到本机，未发送给真实用户');
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

document.addEventListener('error', event => { if (event.target instanceof HTMLImageElement) event.target.hidden = true; }, true);

/* ---------- 启动 ---------- */

loadState();
if (['discover', 'matches', 'exchanges', 'orders'].includes(location.hash.slice(1))) state.view = location.hash.slice(1);
render();
updateBadges();
