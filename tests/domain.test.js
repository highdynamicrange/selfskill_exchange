import test from 'node:test';
import assert from 'node:assert/strict';
import { recommendation, safeUrl, transitionOrder, createOrder } from '../site/domain.js';
const skill = { id: 'guitar', ownerId: 'teacher', title: '吉他', teaches: '吉他', learns: '摄影', category: '音乐', price: 19900, trialPrice: 0 };
const buyer = { id: 'learner', name: '学习者' };
test('recommendations reflect actual interests, never random scores', () => {
  assert.equal(recommendation(skill, { learn: '吉他', teach: '摄影' }).score, 100);
  assert.equal(recommendation(skill, { learn: 'Python' }).score, 0);
  assert.equal(recommendation(skill, null).score, 0);
});
test('URLs reject script execution and non-image data URLs', () => {
  assert.equal(safeUrl('javascript:alert(1)'), '');
  assert.equal(safeUrl('data:text/html,test', true), '');
  assert.equal(safeUrl('https://example.com/a.png'), 'https://example.com/a.png');
});
test('buyer pays, seller delivers, buyer accepts, terminal orders cannot change', () => {
  let o = createOrder(skill, buyer, 'course', 1);
  assert.equal(o.amount, 19900);
  assert.throws(() => transitionOrder(o, 'pay', 'teacher'));
  assert.throws(() => transitionOrder(o, 'accept', 'learner'));
  o = transitionOrder(o, 'pay', 'learner');
  assert.throws(() => transitionOrder(o, 'pay', 'learner'));
  assert.throws(() => transitionOrder(o, 'deliver', 'learner', 'done'));
  assert.throws(() => transitionOrder(o, 'deliver', 'teacher', ' '));
  o = transitionOrder(o, 'deliver', 'teacher', '作品反馈');
  assert.throws(() => transitionOrder(o, 'accept', 'teacher'));
  o = transitionOrder(o, 'accept', 'learner');
  assert.equal(o.status, 'completed');
  assert.equal(o.history.length, 4);
  assert.throws(() => transitionOrder(o, 'refund', 'learner'));
});
test('cancellation, refund, revision and immutable order snapshots', () => {
  const o = createOrder(skill, buyer, 'trial');
  assert.equal(o.amount, 0);
  assert.throws(() => createOrder(skill, { id: 'teacher' }, 'course'));
  assert.equal(transitionOrder(o, 'cancel', 'learner').status, 'cancelled');
  const paid = transitionOrder(o, 'pay', 'learner');
  assert.equal(transitionOrder(paid, 'refund', 'learner').status, 'refunded');
  const delivered = transitionOrder(paid, 'deliver', 'teacher', '作业');
  assert.equal(transitionOrder(delivered, 'revise', 'learner', '请补充反馈').status, 'paid');
  assert.equal(o.status, 'pending');
});
