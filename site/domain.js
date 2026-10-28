// Pure domain rules shared by the prototype UI and its tests.
export const ORDER_LABELS = { pending: '待付款', paid: '学习中', delivered: '待验收', completed: '已完成', cancelled: '已取消', refunded: '已退款' };
export function safeUrl(value, image = false) {
  const input = String(value || '').trim();
  if (image && /^data:image\/(png|jpeg|webp);base64,[a-z0-9+/=]+$/i.test(input)) return input;
  try { const url = new URL(input); return ['https:', 'http:'].includes(url.protocol) ? url.href : ''; } catch { return ''; }
}
export function recommendation(skill, profile) {
  const tokens = s => String(s || '').toLowerCase().split(/[,，、/;；\s]+/).filter(Boolean);
  const hits = (a, b) => tokens(a).some(x => tokens(b).some(y => x === y || x.includes(y) || y.includes(x)));
  const wants = hits(profile?.learn, `${skill.teaches} ${skill.category}`);
  const offers = hits(profile?.teach, skill.learns);
  return { score: (wants ? 70 : 0) + (offers ? 30 : 0), reason: wants && offers ? '双向技能互补' : wants ? '符合我想学的' : offers ? '对方想学你擅长的' : '发现新兴趣' };
}
export function transitionOrder(order, action, actor, payload = '', now = Date.now()) {
  const buyer = actor === order.buyerId;
  const seller = actor === order.sellerId;
  let next;
  if (action === 'pay' && buyer && order.status === 'pending') next = 'paid';
  if (action === 'cancel' && buyer && order.status === 'pending') next = 'cancelled';
  if (action === 'deliver' && seller && order.status === 'paid' && payload.trim()) next = 'delivered';
  if (action === 'accept' && buyer && order.status === 'delivered') next = 'completed';
  if (action === 'refund' && buyer && order.status === 'paid') next = 'refunded';
  if (action === 'revise' && buyer && order.status === 'delivered' && payload.trim()) next = 'paid';
  if (!next) throw new Error('当前身份或订单状态不能执行此操作');
  return { ...order, status: next, ...(action === 'deliver' ? { delivery: payload.trim() } : {}), history: [...order.history, { action, status: next, actor, note: payload.trim(), at: now }] };
}
export function createOrder(skill, buyer, kind, now = Date.now()) {
  if (!buyer || buyer.id === skill.ownerId) throw new Error('不能购买自己发布的技能');
  if (!['course', 'trial'].includes(kind)) throw new Error('无效的订单类型');
  const amount = kind === 'trial' ? skill.trialPrice : skill.price;
  if (!Number.isInteger(amount) || amount < 0) throw new Error('课程价格无效');
  return { id: crypto.randomUUID(), skillId: skill.id, buyerId: buyer.id, buyerName: buyer.name, sellerId: skill.ownerId, sellerName: skill.name, title: skill.title, kind, amount, status: 'pending', createdAt: now, snapshot: { syllabus: skill.syllabus, outcome: skill.outcome, trial: skill.trial, mode: skill.mode, time: skill.time }, history: [{ action: 'create', status: 'pending', actor: buyer.id, note: '', at: now }] };
}
