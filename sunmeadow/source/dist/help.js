import {wordbook} from './wordbook.js?v=10';
// English is visible first. Click a marked word for its meaning in this game.
const tooltip=document.getElementById('translation-tooltip'),text=document.getElementById('translation-text'),button=document.getElementById('word-help');
const words={bridge:'bridge：连接两边，让你能跨过河或空隙的通道。这里是“桥”。',bridges:'bridges：不止一座桥。',board:'board：一块平而长的木料。这里用它拼桥。',boards:'boards：多块木板。',river:'river：沿着河道流动的水，也就是河流。',home:'home：你生活、回去休息的地方，也就是家。',across:'across：从一边到另一边。across the river 就是“到河对岸”。',wide:'wide：从这一边到另一边有多宽。',metre:'metre：长度单位“米”。1 metre = 100 centimetres。',metres:'metres：米，长度单位。',centimetre:'centimetre：长度单位“厘米”。100 centimetres = 1 metre。',centimetres:'centimetres：厘米，长度单位。',choose:'choose：有几个可能时，挑出你要的那个。',exactly:'exactly：刚好符合这个数量，不能多也不能少。exactly two 就是恰好两个。',defeat:'defeat：让对手输了。这里是打败怪物。',beat:'beat：在对抗中赢过对方。这里是打败怪物。',collect:'collect：把找到的东西收起来，积攒到一起。',collected:'collected：已经把东西收好了。',find:'find：原来不知道在哪里，后来找到了。',learn:'learn：从不会到会，获得新的知识或能力。',train:'train：通过练习，让自己更会、更强。',attack:'attack：主动向对手发起打击。',attacks:'attacks：攻击动作或多次攻击。',guard:'guard：负责守着、保护某样东西的人或角色。',guardian:'guardian：守护某个地方或物品的角色。',strong:'strong：有力量，能承受或造成较大的影响。',long:'long：从一端到另一端延伸得较远。这里指木板更长。',longer:'longer：与另一块相比，长度更多。',short:'short：从一端到另一端的长度较少。',charging:'charging：正在积累能量，准备释放。这里是“蓄电”。',charge:'charge：先把能量积攒起来。这里指蓄电。',release:'release：把原来存着、控制着的东西放出去。这里是释放电能。',thunderbolt:'Thunderbolt：一道强烈的闪电；这里是技能“十万伏特”。',electricity:'electricity：能形成电流、让设备工作或产生放电的电能。',claw:'claw：动物的尖爪。这里是用爪子攻击。',dodge:'dodge：及时移动，让攻击没有打中你。',distance:'distance：两个地方或物体之间隔了多远。',recharges:'recharges：再次积攒能量，恢复到可以使用的状态。',ready:'ready：已经准备好，可以开始。',companion:'companion：跟你一起行动、陪伴你的伙伴。',explore:'explore：走进去看看，发现还不知道的地方或东西。',sunset:'sunset：太阳落下去的时候。',gone:'gone：原来有，现在已经不在这里了。',build:'build：把材料组合起来，做出某样东西。',waiting:'waiting：暂时不行动，等某个人或某件事出现。',little:'little：小小的，常带一点亲近的感觉。'};
let armed=false;window.wordHelpActive=false;
function englishPart(value){const first=value.search(/[\u3400-\u9fff]/);if(first<0)return value;return value.slice(0,first).replace(/[\s·|:：—–-]+$/,'').trim();}
function excluded(el){return el.closest('script,style,#translation-tooltip,#word-help,.word-hint');}
function markWords(node){
 const parent=node.parentElement;if(!parent||parent.closest('input,textarea'))return;
 const value=node.data,pattern=/[A-Za-zÀ-ÖØ-öø-ÿ]+(?:['’][A-Za-zÀ-ÖØ-öø-ÿ]+)?/g;
 let last=0,match;const frag=document.createDocumentFragment();
 while((match=pattern.exec(value))){
  frag.append(document.createTextNode(value.slice(last,match.index)));
  const span=document.createElement('span');span.className='word-hint';span.dataset.word=match[0];span.textContent=match[0];
  if(!parent.closest('button,a,summary,label')){span.tabIndex=0;span.setAttribute('role','button');span.setAttribute('aria-label','Hear and learn '+match[0]);}
  frag.append(span);last=match.index+match[0].length;
 }
 if(last){frag.append(document.createTextNode(value.slice(last)));node.replaceWith(frag);}
}
function cleanNode(node){if(node.nodeType===3){const parent=node.parentElement;if(!parent||excluded(parent))return;const value=node.data;if(/[\u3400-\u9fff]/.test(value)){const clean=englishPart(value);let destination=parent;if(!clean){if(parent.classList.contains('cn'))destination=parent.previousElementSibling||parent.parentElement;else if(['SPAN','SMALL'].includes(parent.tagName))destination=parent.parentElement;if(parent.childNodes.length===1||parent.classList.contains('cn')||['SPAN','SMALL'].includes(parent.tagName))parent.classList.add('hint-only');}destination.dataset.translation=value;node.data=clean;}if(node.data)markWords(node);}else if(node.nodeType===1){if(excluded(node))return;for(const attr of ['placeholder','aria-label']){const v=node.getAttribute(attr);if(v&&/[\u3400-\u9fff]/.test(v)){node.dataset.translation=v;node.setAttribute(attr,englishPart(v));}}for(const child of [...node.childNodes])cleanNode(child);}}
cleanNode(document.body);
new MutationObserver(records=>{for(const r of records){if(r.type==='characterData')cleanNode(r.target);else for(const node of r.addedNodes)cleanNode(node);}}).observe(document.body,{subtree:true,childList:true,characterData:true});
const title=document.getElementById('translation-word'),chinese=document.getElementById('translation-chinese'),zhButton=document.getElementById('show-chinese'),audioStatus=document.getElementById('word-audio-status');
let activeWord='',activeMeaning='',speechId=0,lookupId=0;const extraWords=new Map();
function entryFor(value){const key=value.toLowerCase().replace(/’/g,"'");return wordbook[key]||extraWords.get(key)||wordbook[key.replace(/'s$/,'')]||null;}
function speak(value,slow=false){
 const id=++speechId;audioStatus.textContent='';
 if(!('speechSynthesis' in window)){audioStatus.textContent='This browser cannot read aloud.';return;}
 speechSynthesis.cancel();const utterance=new SpeechSynthesisUtterance(value);utterance.lang='en-US';utterance.rate=slow?.55:.8;
 const voices=speechSynthesis.getVoices();utterance.voice=voices.find(v=>/^en-US/i.test(v.lang))||voices.find(v=>/^en/i.test(v.lang))||null;
 utterance.onerror=e=>{if(id===speechId&&!['canceled','interrupted'].includes(e.error))audioStatus.textContent='Audio could not play. Try Listen again.';};
 speechSynthesis.speak(utterance);
}
function disarm(){armed=false;document.body.classList.remove('help-armed');button.setAttribute('aria-pressed','false');button.textContent='Word help';window.wordHelpActive=!tooltip.hidden;}
function placePopup(anchor){const rect=anchor.getBoundingClientRect?anchor.getBoundingClientRect():anchor,width=Math.min(350,innerWidth-24);tooltip.style.width=width+'px';const height=tooltip.getBoundingClientRect().height;let left=rect.right+12;if(left+width>innerWidth-12)left=Math.max(12,rect.left-width-12);const top=Math.max(12,Math.min(rect.top,innerHeight-height-12));tooltip.style.left=left+'px';tooltip.style.top=top+'px';}
async function lookupExtra(value,id){
 const source=document.getElementById('dictionary-source');
 try{
  const response=await fetch('https://api.dictionaryapi.dev/api/v2/entries/en/'+encodeURIComponent(value.toLowerCase()),{signal:AbortSignal.timeout(6000)});
  if(!response.ok)throw new Error('No entry');const data=await response.json();
  const record=Array.isArray(data)?data[0]:null;const meaning=record?.meanings?.flatMap(m=>m.definitions||[]).find(d=>typeof d.definition==='string'&&d.definition.length<1000)?.definition;
  if(!meaning)throw new Error('No definition');const entry={en:meaning,dictionary:true};extraWords.set(value.toLowerCase(),entry);
  if(id!==lookupId||tooltip.hidden)return;
  activeMeaning=meaning;text.textContent=meaning;markWords(text.firstChild);source.hidden=false;
 }catch{if(id!==lookupId||tooltip.hidden)return;activeMeaning='No meaning found. You can still listen to this word.';text.textContent=activeMeaning;markWords(text.firstChild);}
}
function showWord(value,anchor){
 const anchorRect=anchor.getBoundingClientRect();
 const id=++lookupId,entry=entryFor(value);document.getElementById('dictionary-source').hidden=!entry?.dictionary;activeWord=value;activeMeaning=entry?.en||'Looking up this word…';
 title.textContent=value;text.textContent=activeMeaning;markWords(text.firstChild);
 const core=words[value.toLowerCase()];chinese.textContent=core||entry?.zh||'';chinese.hidden=true;
 zhButton.hidden=!chinese.textContent;zhButton.textContent='中文';document.getElementById('word-audio-controls').hidden=false;
 document.getElementById('meaning-listen').hidden=false;tooltip.hidden=false;disarm();placePopup(anchorRect);speak(value);if(!entry)lookupExtra(value,id);
}
function showMeaning(value,anchor){++lookupId;document.getElementById('dictionary-source').hidden=true;document.getElementById('meaning-listen').hidden=true;activeWord='';title.textContent='Line help';text.textContent=value;chinese.hidden=true;zhButton.hidden=true;document.getElementById('word-audio-controls').hidden=true;audioStatus.textContent='';tooltip.hidden=false;disarm();placePopup(anchor);}
function closePopup(){++lookupId;tooltip.hidden=true;disarm();window.wordHelpActive=false;++speechId;if('speechSynthesis' in window)speechSynthesis.cancel();}
button.addEventListener('click',()=>{armed=!armed;tooltip.hidden=true;document.body.classList.toggle('help-armed',armed);button.setAttribute('aria-pressed',String(armed));window.wordHelpActive=armed;button.textContent=armed?'Tap any word':'Word help';});
document.addEventListener('click',e=>{
 if(e.target.closest('#word-help'))return;
 const word=e.target.closest('.word-hint');
 if(word){
  // Game buttons and links keep their normal action unless Word help is on.
  if(word.closest('button,a,summary,label')&&!armed)return;
  e.preventDefault();e.stopImmediatePropagation();showWord(word.dataset.word,word);return;
 }
 if(e.target.closest('#translation-tooltip'))return;
 if(armed&&e.target.closest('button,a,summary,label')){e.preventDefault();e.stopImmediatePropagation();return;}
 if(!armed)return;const target=e.target.closest('[data-translation]');if(!target)return;
 e.preventDefault();e.stopImmediatePropagation();showMeaning(target.dataset.translation,target);
},true);
document.addEventListener('keydown',e=>{
 if(e.key==='Escape'){closePopup();return;}
 if((e.key==='Enter'||e.key===' ')&&e.target.classList?.contains('word-hint')){e.preventDefault();e.stopImmediatePropagation();showWord(e.target.dataset.word,e.target);}
},true);
document.getElementById('word-listen').onclick=()=>speak(activeWord);
document.getElementById('word-slow').onclick=()=>speak(activeWord,true);
document.getElementById('meaning-listen').onclick=()=>speak(activeMeaning);
zhButton.onclick=()=>{chinese.hidden=!chinese.hidden;zhButton.textContent=chinese.hidden?'中文':'Hide 中文';};
document.getElementById('close-translation').onclick=closePopup;
