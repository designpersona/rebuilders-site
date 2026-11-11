// 채팅 의도 분류 테스트: node scripts/test-chat-intent.mjs
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ctx = { globalThis: null };
ctx.globalThis = ctx;
vm.createContext(ctx);
vm.runInContext(readFileSync(join(root, 'chat-intent.js'), 'utf8'), ctx);
const { classifyChat, isQuestion, isInstructionOnly, parseEditIntent, parseClarifyReply, extractFoodHint } = ctx.RebuildersChatIntent;

let failed = 0;
function check(name, cond, info) { console.log(`${cond ? 'PASS' : 'FAIL'} ${name}${cond ? '' : ' — ' + JSON.stringify(info)}`); if (!cond) failed++; }

let r = classifyChat('이거 몇 kcal야?');
check('이거 몇 kcal야? → 질문', r.type === 'question' && r.topic === 'kcal', r);
check('질문은 기록이 아님', isQuestion('이거 몇 kcal야?') && isInstructionOnly('바나나 먹어도 돼?'), true);
check('물음표 없는 몇 kcal이야', isQuestion('바나나 몇 kcal이야'), isQuestion('바나나 몇 kcal이야'));
check('먹어도 돼?', isQuestion('이거 먹어도 돼?'), true);
check('일반 음식 문장은 질문이 아님', !isQuestion('아침 바나나') && classifyChat('아침 바나나').type === 'food', classifyChat('아침 바나나'));
check('주스는 200ml야 는 질문이 아님', !isQuestion('주스는 200ml야'), true);

r = parseEditIntent('아까 너트 99kcal로 바꿔줘');
check('아까 너트 99kcal로 바꿔줘 → set-kcal 99, hint 너트', r?.action === 'set-kcal' && r.kcal === 99 && r.foodHint.includes('너트'), r);
r = parseEditIntent('99kcal로 적어줘');
check('99kcal로 적어줘 → set-kcal', r?.action === 'set-kcal' && r.kcal === 99, r);
r = parseEditIntent('그거 하나로 합쳐줘');
check('그거 하나로 합쳐줘 → merge', r?.action === 'merge', r);
r = parseEditIntent('두 개 따로 기록해줘');
check('두 개 따로 기록해줘 → split', r?.action === 'split', r);
r = parseEditIntent('주스는 200ml야');
check('주스는 200ml야 → set-amount 200ml, hint 주스', r?.action === 'set-amount' && r.amount?.value === 200 && r.amount?.unit === 'ml' && r.foodHint === '주스', r);
r = parseEditIntent('방금 거 지워줘');
check('방금 거 지워줘 → delete', r?.action === 'delete', r);
r = parseEditIntent('점심으로 옮겨줘');
check('점심으로 옮겨줘 → move lunch', r?.action === 'move' && r.mealId === 'lunch', r);
check('음식 문장은 edit가 아님', !parseEditIntent('점심 이삭 햄치즈') && !isInstructionOnly('점심 이삭 햄치즈'), parseEditIntent('점심 이삭 햄치즈'));

check('한 제품이에요 → one', parseClarifyReply('한 제품이에요') === 'one', parseClarifyReply('한 제품이에요'));
check('두 개예요 → two', parseClarifyReply('두 개예요') === 'two', parseClarifyReply('두 개예요'));
check('clarify 상태에서 한 제품', classifyChat('한 제품', { pendingClarify: true }).type === 'clarify-reply' && classifyChat('한 제품', { pendingClarify: true }).choice === 'one');
check('hint strips instruction words', extractFoodHint('아까 너트 99kcal로 바꿔줘') === '너트', extractFoodHint('아까 너트 99kcal로 바꿔줘'));

console.log(failed ? `\n${failed}개 실패` : '\n모두 통과');
process.exit(failed ? 1 : 0);
