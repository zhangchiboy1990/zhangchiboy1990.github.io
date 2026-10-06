// Half-centimetre lengths give varied values while remaining readable for Grade 3.
export function dropLength(kind,random=Math.random){const roll=Math.max(0,Math.min(.999999,random()));return kind==='guard'?80+Math.floor(roll*40)*.5:20.5+Math.floor(roll*39)*.5;}
export function bridgeResult(lengths,guardBeaten=true){const sum=Math.round(lengths.reduce((a,b)=>a+b,0)*10)/10;if(lengths.length!==2)return{ok:false,reason:'count',sum};if(!guardBeaten)return{ok:false,reason:'guard',sum};return{ok:sum>=100,reason:sum>=100?'ready':'short',sum};}
export function damageFor(kind,skill,level,power=0,element='neutral'){if(skill==='thunder'){if(level<2)return 0;const multiplier={water:1.5,grass:.75,stone:.75,neutral:1}[element]??1;return Math.round((80+power*12)*multiplier);}if(kind==='guard')return level>=2?4+power*3:0;return 12+power*3;}
export function maxHealth(vitality=0){return 100+vitality*20;}
export function boardColor(length){return length>=80?'#367a8d':length>=30?'#a66c38':'#d4a564';}
