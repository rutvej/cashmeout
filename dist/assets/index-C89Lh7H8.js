(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=[{id:`ORFOOD`,name:`Orion Foods Co.`,sector:`consumer`,price:124,trendBias:.002,volatility:.04,dividendYieldPct:.02,history:[120,122,124]},{id:`LUXBEV`,name:`Luxe Beverages`,sector:`consumer`,price:86,trendBias:.001,volatility:.06,dividendYieldPct:.015,history:[88,85,86]},{id:`NXTECH`,name:`NexGen Technologies`,sector:`tech`,price:340,trendBias:.004,volatility:.09,dividendYieldPct:0,history:[320,335,340]},{id:`CLDNET`,name:`CloudNet Solutions`,sector:`tech`,price:210,trendBias:.003,volatility:.08,dividendYieldPct:0,history:[200,205,210]},{id:`SOLPWR`,name:`SolarPower India`,sector:`energy`,price:175,trendBias:.002,volatility:.07,dividendYieldPct:.025,history:[170,172,175]},{id:`GRNFUEL`,name:`GreenFuel Corp.`,sector:`energy`,price:92,trendBias:.001,volatility:.08,dividendYieldPct:.01,history:[90,91,92]},{id:`STBANK`,name:`Sterling Bank Ltd.`,sector:`finance`,price:540,trendBias:.001,volatility:.03,dividendYieldPct:.03,history:[530,538,540]},{id:`INSFIN`,name:`InsureFirst Finance`,sector:`finance`,price:158,trendBias:.002,volatility:.05,dividendYieldPct:.02,history:[154,156,158]}],t=[{id:`prop-01`,name:`1BHK Sector 18`,location:`Sector 18`,price:65e3,rentYieldPct:5,appreciationPct:2.5,owner:null,riskProfile:{legalStatus:`clear`,issueChancePct:5,issueCost:1e4}},{id:`prop-02`,name:`Studio Old Town`,location:`Old Town`,price:5e4,rentYieldPct:5.5,appreciationPct:2,owner:null,riskProfile:{legalStatus:`clear`,issueChancePct:5,issueCost:8e3}},{id:`prop-03`,name:`2BHK Greenfield`,location:`Greenfield`,price:25e4,rentYieldPct:4.2,appreciationPct:3,owner:null,riskProfile:{legalStatus:`clear`,issueChancePct:5,issueCost:2e4}},{id:`prop-04`,name:`Plot Old Highway`,location:`Old Highway`,price:35e3,rentYieldPct:6.5,appreciationPct:4,owner:null,riskProfile:{legalStatus:`minor-dispute`,issueChancePct:25,issueCost:25e3}},{id:`prop-05`,name:`3BHK MG Road`,location:`MG Road`,price:5e5,rentYieldPct:3.5,appreciationPct:4,owner:null,riskProfile:{legalStatus:`clear`,issueChancePct:5,issueCost:4e4}},{id:`prop-06`,name:`Penthouse Skyline`,location:`Skyline Towers`,price:12e5,rentYieldPct:3,appreciationPct:5,owner:null,riskProfile:{legalStatus:`clear`,issueChancePct:5,issueCost:75e3}},{id:`prop-07`,name:`Villa Palm Estate`,location:`Palm Estate`,price:2e6,rentYieldPct:2.5,appreciationPct:6,owner:null,riskProfile:{legalStatus:`clear`,issueChancePct:5,issueCost:1e5}}],n=[{id:`food-cart`,name:`Food Cart`,capacity:3,startupCost:5e3,baseRevenuePerCycle:3e3,slotUpkeepPerCycle:500,revenueCycleDays:30,slots:[{id:`fc-1`,owner:`npc-1`},{id:`fc-2`,owner:null},{id:`fc-3`,owner:null}]},{id:`tutoring`,name:`Tutoring Center`,capacity:3,startupCost:8e3,baseRevenuePerCycle:4500,slotUpkeepPerCycle:800,revenueCycleDays:30,slots:[{id:`tc-1`,owner:null},{id:`tc-2`,owner:null},{id:`tc-3`,owner:null}]},{id:`retail-shop`,name:`Retail Shop`,capacity:4,startupCost:15e3,baseRevenuePerCycle:8e3,slotUpkeepPerCycle:1500,revenueCycleDays:30,slots:[{id:`rs-1`,owner:`npc-4`},{id:`rs-2`,owner:null},{id:`rs-3`,owner:null},{id:`rs-4`,owner:null}]},{id:`delivery`,name:`Delivery Service`,capacity:3,startupCost:12e3,baseRevenuePerCycle:6e3,slotUpkeepPerCycle:1200,revenueCycleDays:30,slots:[{id:`ds-1`,owner:null},{id:`ds-2`,owner:null},{id:`ds-3`,owner:null}]},{id:`tech-startup`,name:`Tech Startup`,capacity:2,startupCost:5e4,baseRevenuePerCycle:25e3,slotUpkeepPerCycle:5e3,revenueCycleDays:30,slots:[{id:`ts-1`,owner:null},{id:`ts-2`,owner:null}]},{id:`banking`,name:`Banking & Micro-Lending`,capacity:2,startupCost:5e5,baseRevenuePerCycle:45e3,slotUpkeepPerCycle:12e3,revenueCycleDays:30,specialMechanic:`lending`,slots:[{id:`bk-1`,owner:null},{id:`bk-2`,owner:null}]}],r=[{id:`npc-1`,name:`Aarav Sharma`,archetype:`serial-entrepreneur`,money:18e3,portfolio:{},properties:[],businesses:[{sectorId:`food-cart`,slotId:`fc-1`}],loans:[],decisionLog:[]},{id:`npc-2`,name:`Priya Mehta`,archetype:`aggressive-investor`,money:25e3,portfolio:{NXTECH:{shares:30,avgCost:330}},properties:[],businesses:[],loans:[],decisionLog:[]},{id:`npc-3`,name:`Vikram Verma`,archetype:`cautious-saver`,money:45e3,portfolio:{},properties:[],businesses:[],loans:[],decisionLog:[]},{id:`npc-4`,name:`Ananya Iyer`,archetype:`serial-entrepreneur`,money:22e3,portfolio:{},properties:[],businesses:[{sectorId:`retail-shop`,slotId:`rs-1`}],loans:[],decisionLog:[]},{id:`npc-5`,name:`Rohan Gupta`,archetype:`landlord`,money:75e3,portfolio:{},properties:[],businesses:[],loans:[],decisionLog:[]},{id:`npc-6`,name:`Sneha Patel`,archetype:`aggressive-investor`,money:3e4,portfolio:{STBANK:{shares:25,avgCost:535}},properties:[],businesses:[],loans:[],decisionLog:[]},{id:`npc-7`,name:`Kabir Das`,archetype:`cautious-saver`,money:35e3,portfolio:{},properties:[],businesses:[],loans:[],decisionLog:[]},{id:`npc-8`,name:`Neha Joshi`,archetype:`landlord`,money:8e4,portfolio:{},properties:[],businesses:[],loans:[],decisionLog:[]}];function i(i=42){return{schemaVersion:1,gameSeed:i,inflationMultiplier:1,inflationRate:.06,player:{id:`player`,name:`Player`,money:15e3,savingsBalance:5e3,currentDay:1,job:{id:`junior-analyst`,title:`Junior Analyst`,salaryPerCycle:2800,payCycleDays:15,stressPerDay:.8,timeSlotsCost:2},housing:{type:`rent`,amountPerCycle:800,cycleDays:30,lastPaidDay:1},health:{physical:85,mental:80,energy:75},consequenceMeters:{cheapFoodDays:0,noExerciseDays:0,highStressDays:0,lowEnergyDays:0,noRestDays:0,unhealthyDays:0},timeAllocation:{job:2,commute:1,exercise:1,cooking:0,sideHustle:0,education:0,rest:1,free:1},lifestyle:{foodTier:`street`,transportMode:`walk`},loans:[],fixedDeposits:[],sips:[],insurance:{health:{tier:`none`,premiumPerMonth:0,coveragePct:0},vehicle:{active:!1,premiumPerMonth:0},property:{active:!1,premiumPerMonth:0},life:{active:!1,premiumPerMonth:0}},taxes:{lastPaidDay:1,cycleDays:360,incomeThisCycle:0,capitalGainsThisCycle:0,dividendIncomeThisCycle:0},portfolio:{},goldHoldings:{grams:0,avgCostPerGram:0},properties:[],businesses:[],lifestyleAssets:[],family:{married:!1,marriedOnDay:null,spouseIncome:0,children:0,childBornOnDays:[]},stats:{stress:15,happiness:70},eventLog:[{day:1,text:`Welcome to Cashflow! Balance your money, time, and health.`,type:`event`}],achievements:[],educationProgress:{},lastActiveTimestamp:Date.now()},npcs:r,market:{tickers:e,goldPricePerGram:6500,goldHistory:[6420,6460,6500],cycleBias:0,properties:t,businessSectors:n}}}var a=`cashflow_state_save_v2`;function o(){try{let e=localStorage.getItem(a);if(!e){let e=i();return s(e),e}let t=JSON.parse(e);if(!t.schemaVersion||t.schemaVersion<1){let e=i();return s(e),e}return t}catch(e){console.error(`Failed to parse save file, creating new game`,e);let t=i();return s(t),t}}function s(e){try{e.player.lastActiveTimestamp=Date.now(),localStorage.setItem(a,JSON.stringify(e))}catch(e){console.error(`Save failed`,e)}}function c(e){s(e);let t=new Blob([JSON.stringify(e,null,2)],{type:`application/json`}),n=URL.createObjectURL(t),r=document.createElement(`a`);r.href=n,r.download=`cashflow-save-day${e.player.currentDay}-${Date.now()}.json`,r.click(),URL.revokeObjectURL(n)}function l(){localStorage.removeItem(a);let e=i();return s(e),e}var u=class{state;constructor(e){this.state=e||123456789}next(){this.state|=0,this.state=this.state+1831565813|0;let e=Math.imul(this.state^this.state>>>15,1|this.state);return e=e+Math.imul(e^e>>>7,61|e)^e,((e^e>>>14)>>>0)/4294967296}range(e,t){return e+this.next()*(t-e)}intRange(e,t){return Math.floor(this.range(e,t+1))}},d=12e4;function f(e,t=Date.now()){return!e||e>t?0:Math.floor((t-e)/d)}function p(e){return e<=0?{mode:`none`,days:0}:e<=45?{mode:`fast-sim`,days:e}:{mode:`aggregate`,days:e}}function m(e,t){let n=[],r=e.player,i=Math.floor(t/r.job.payCycleDays),a=i*r.job.salaryPerCycle;r.money+=a,r.taxes.incomeThisCycle+=a;let o=Math.floor(t/r.housing.cycleDays)*r.housing.amountPerCycle;r.money-=o;let s=150*e.inflationMultiplier,c=Math.round(s*t);r.money=Math.max(0,r.money-c);let l=Math.round(r.savingsBalance*(.035/360)*t);return r.savingsBalance+=l,e.inflationMultiplier*=(1+e.inflationRate/360)**t,r.currentDay+=t,r.lastActiveTimestamp=Date.now(),n.push(`Simulated ${t} days in aggregate mode.`),n.push(`Earned ₹${a.toLocaleString(`en-IN`)} in salary over ${i} cycles.`),n.push(`Paid ₹${o.toLocaleString(`en-IN`)} in rent and approx ₹${c.toLocaleString(`en-IN`)} in living expenses.`),n.push(`Savings earned ₹${l.toLocaleString(`en-IN`)} in interest.`),n}var h={street:{id:`street`,name:`Street Food`,costPerDay:50,physicalDelta:-1.2,mentalDelta:-.2,requiresCookingSlot:!1,requiresCookingEquipment:!1,description:`Cheap & fast (₹50/day), but hurts health over time.`},basic:{id:`basic`,name:`Basic Home Cooking`,costPerDay:90,physicalDelta:.2,mentalDelta:.1,requiresCookingSlot:!0,requiresCookingEquipment:!1,description:`Balanced & economical (₹90/day). Needs 1 cooking slot.`},"home-cooked":{id:`home-cooked`,name:`Nutritious Meal Prep`,costPerDay:140,physicalDelta:1.2,mentalDelta:.6,requiresCookingSlot:!0,requiresCookingEquipment:!0,description:`High nutrition (₹140/day). Needs cooking slot + equipment.`},restaurant:{id:`restaurant`,name:`Healthy Meal Delivery`,costPerDay:280,physicalDelta:.8,mentalDelta:.8,requiresCookingSlot:!1,requiresCookingEquipment:!1,description:`Premium dining (₹280/day). Saves time, good health.`}},g={walk:{id:`walk`,name:`Walk / Public Transit`,dailyCost:20,commuteSlotsNeeded:1,stressPerDay:1.5,description:`Takes 1 time slot, high daily commute fatigue.`},bicycle:{id:`bicycle`,name:`Bicycle`,dailyCost:0,commuteSlotsNeeded:1,stressPerDay:.4,description:`Zero fuel, good cardio, low stress commute.`},scooter:{id:`scooter`,name:`Motor Scooter`,dailyCost:40,commuteSlotsNeeded:0,stressPerDay:.5,description:`Eliminates commute slot entirely! Saves 1 slot daily.`},car:{id:`car`,name:`Personal Car`,dailyCost:150,commuteSlotsNeeded:0,stressPerDay:-.5,description:`Eliminates commute slot, high comfort & happiness boost.`}},_=[{id:`bicycle`,name:`Commuter Bicycle`,price:5e3,depreciationPerYear:.05,monthlyUpkeep:0,description:`Enables Bicycle transport mode.`},{id:`scooter`,name:`City Scooter (125cc)`,price:75e3,depreciationPerYear:.12,monthlyUpkeep:600,description:`Enables Scooter transport mode (frees commute slot).`},{id:`car`,name:`Sedan Car`,price:55e4,depreciationPerYear:.15,monthlyUpkeep:3500,description:`Enables Car transport mode (+comfort, status, time saving).`},{id:`laptop`,name:`Workstation Laptop`,price:6e4,depreciationPerYear:.25,monthlyUpkeep:0,description:`Enables high-paying freelance tech side hustles (2x income).`},{id:`cooking-equipment`,name:`Gourmet Kitchen Set`,price:12e3,depreciationPerYear:.05,monthlyUpkeep:0,description:`Unlocks Nutritious Meal Prep food tier.`},{id:`gym-membership`,name:`Annual Gym Pass`,price:18e3,depreciationPerYear:1,monthlyUpkeep:0,description:`Doubles physical health gains from exercise time slots.`}],v=[{id:`financial-modeling`,name:`Financial Modeling & Valuation`,fee:15e3,slotsRequired:20,description:`Unlocks Senior Analyst & Investment roles.`},{id:`fullstack-dev`,name:`Full-Stack Software Engineering`,fee:35e3,slotsRequired:35,description:`Unlocks Tech Lead positions & high side hustle yield.`},{id:`executive-mba`,name:`Executive MBA`,fee:12e4,slotsRequired:60,description:`Required for Executive Director & VP jobs.`}],y=[{id:`junior-analyst`,title:`Junior Analyst`,salaryPerCycle:2800,payCycleDays:15,stressPerDay:.8,timeSlotsCost:2},{id:`content-writer`,title:`Content Specialist`,salaryPerCycle:2400,payCycleDays:15,stressPerDay:.5,timeSlotsCost:2},{id:`senior-analyst`,title:`Senior Financial Analyst`,salaryPerCycle:6500,payCycleDays:15,stressPerDay:1.6,timeSlotsCost:2,requiredCourse:`financial-modeling`},{id:`software-engineer`,title:`Software Engineer`,salaryPerCycle:8e3,payCycleDays:15,stressPerDay:1.8,timeSlotsCost:2,requiredCourse:`fullstack-dev`},{id:`director-ops`,title:`Director of Operations`,salaryPerCycle:19e3,payCycleDays:15,stressPerDay:2.8,timeSlotsCost:3,requiredCourse:`executive-mba`,requiredMinNetWorth:5e5}];function b(e){let t=e.player,n=t.money+t.savingsBalance;for(let[r,i]of Object.entries(t.portfolio)){let t=e.market.tickers.find(e=>e.id===r);t&&(n+=i.shares*t.price)}n+=t.goldHoldings.grams*e.market.goldPricePerGram;for(let r of t.properties){let t=e.market.properties.find(e=>e.id===r.id);t&&(n+=t.price)}for(let e of t.lifestyleAssets)n+=e.currentValue;for(let e of t.loans)n-=e.principalRemaining;return Math.round(n)}function x(e){let t=e.player,n=h[t.lifestyle.foodTier],r=g[t.lifestyle.transportMode],i=n.costPerDay+r.dailyCost+60+30,a=Math.round(i*e.inflationMultiplier);return t.money-=a,a}function S(e,t){let n=e.player;if(x(e),t%n.job.payCycleDays===0){let e=n.stats.stress>80?.85:n.stats.stress>60?.95:1,r=Math.round(n.job.salaryPerCycle*e);n.money+=r,n.taxes.incomeThisCycle+=r,n.eventLog.unshift({day:t,text:`Payday: Received ₹${r.toLocaleString(`en-IN`)} ${e<1?`(reduced by stress)`:``}`,type:`income`})}if(n.family.married&&t%n.job.payCycleDays===0&&(n.money+=n.family.spouseIncome,n.taxes.incomeThisCycle+=n.family.spouseIncome),n.housing.type===`rent`&&t-n.housing.lastPaidDay>=n.housing.cycleDays){let r=Math.round(n.housing.amountPerCycle*e.inflationMultiplier);n.money-=r,n.housing.lastPaidDay=t,n.eventLog.unshift({day:t,text:`Rent deduction: Paid ₹${r.toLocaleString(`en-IN`)}`,type:`expense`})}for(let e of n.loans)if(t-e.lastPaidDay>=e.cycleDays){if(n.money>=e.emiAmount){n.money-=e.emiAmount;let r=e.principalRemaining*(e.interestRate/12),i=Math.max(0,e.emiAmount-r);e.principalRemaining=Math.max(0,e.principalRemaining-i),e.lastPaidDay=t}else e.missedPayments++,e.principalRemaining=Math.round(e.principalRemaining*(1+(e.interestRate+.04)/12)),n.stats.stress=Math.min(100,n.stats.stress+12),n.health.mental=Math.max(0,n.health.mental-8),n.eventLog.unshift({day:t,text:`⚠️ Missed EMI on ${e.name}! Penal interest compounded to ₹${e.principalRemaining.toLocaleString(`en-IN`)}`,type:`expense`})}if(n.loans=n.loans.filter(e=>e.principalRemaining>0),t-n.taxes.lastPaidDay>=n.taxes.cycleDays){let e=C(n.taxes.incomeThisCycle+n.taxes.capitalGainsThisCycle+n.taxes.dividendIncomeThisCycle);n.money-=e,n.taxes.lastPaidDay=t,n.taxes.incomeThisCycle=0,n.taxes.capitalGainsThisCycle=0,n.taxes.dividendIncomeThisCycle=0,e>0&&n.eventLog.unshift({day:t,text:`Annual Tax Assessment: Deducted ₹${e.toLocaleString(`en-IN`)}`,type:`expense`})}let r=n.savingsBalance*(.035/360);if(n.savingsBalance+=r,t%30==0){let e=n.insurance,r=e.health.premiumPerMonth+e.vehicle.premiumPerMonth+e.property.premiumPerMonth+e.life.premiumPerMonth;r>0&&(n.money-=r,n.eventLog.unshift({day:t,text:`Insurance policy premiums paid: ₹${r.toLocaleString(`en-IN`)}`,type:`expense`}))}t%30==0&&(e.inflationMultiplier*=1+e.inflationRate/12)}function C(e){return e<=25e4?0:Math.round(e<=5e5?(e-25e4)*.05:e<=1e6?12500+(e-5e5)*.2:112500+(e-1e6)*.3)}function w(e,t){let n=e.player,r=h[n.lifestyle.foodTier],i=g[n.lifestyle.transportMode],a=r.physicalDelta,o=n.lifestyleAssets.some(e=>e.id===`gym-membership`);n.timeAllocation.exercise>0?a+=n.timeAllocation.exercise*(o?2.5:1.4):a-=.4;let s=n.job.stressPerDay+i.stressPerDay;n.timeAllocation.rest>0&&(s-=n.timeAllocation.rest*2),n.timeAllocation.free>0&&(s-=n.timeAllocation.free*1.5),s+=n.timeAllocation.sideHustle*1.5,n.stats.stress=Math.max(0,Math.min(100,n.stats.stress+s));let c=(s<0?1:-.8)+n.timeAllocation.free*.5;n.health.mental=Math.max(0,Math.min(100,n.health.mental+c));let l=-.5;n.timeAllocation.rest>0&&(l+=n.timeAllocation.rest*3.5),n.timeAllocation.sideHustle>0&&(l-=n.timeAllocation.sideHustle*2),n.timeAllocation.job>2&&(l-=2),n.health.energy=Math.max(0,Math.min(100,n.health.energy+l)),n.health.physical=Math.max(0,Math.min(100,n.health.physical+a)),n.lifestyle.foodTier===`street`?n.consequenceMeters.cheapFoodDays++:n.consequenceMeters.cheapFoodDays=Math.max(0,n.consequenceMeters.cheapFoodDays-1),n.timeAllocation.exercise===0?n.consequenceMeters.noExerciseDays++:n.consequenceMeters.noExerciseDays=Math.max(0,n.consequenceMeters.noExerciseDays-2),n.stats.stress>70?n.consequenceMeters.highStressDays++:n.consequenceMeters.highStressDays=Math.max(0,n.consequenceMeters.highStressDays-1),n.health.energy<25?n.consequenceMeters.lowEnergyDays++:n.consequenceMeters.lowEnergyDays=0,n.health.physical<30?n.consequenceMeters.unhealthyDays++:n.consequenceMeters.unhealthyDays=0;let u={triggered:!1};return n.consequenceMeters.cheapFoodDays>=20?(n.consequenceMeters.cheapFoodDays=0,u=T(e,t,`Acute Gastroenteritis (Street Food Streak)`,3500,-18)):n.consequenceMeters.noExerciseDays>=35?(n.consequenceMeters.noExerciseDays=0,u=T(e,t,`Severe Lumbar Spasm (Sedentary Strain)`,5500,-15)):n.consequenceMeters.highStressDays>=25?(n.consequenceMeters.highStressDays=0,u=T(e,t,`Chronic Anxiety & Panic Episode`,7e3,-25)):n.consequenceMeters.lowEnergyDays>=15?(n.consequenceMeters.lowEnergyDays=0,u=T(e,t,`Adrenal Burnout & Exhaustion`,4e3,-15)):n.consequenceMeters.unhealthyDays>=18&&(n.consequenceMeters.unhealthyDays=0,u=T(e,t,`Emergency Hospitalization (Immune Crash)`,25e3,-35)),u}function T(e,t,n,r,i){let a=e.player,o=a.insurance.health.coveragePct,s=Math.round(r*(1-o));a.money=Math.max(0,a.money-s),a.health.physical=Math.max(0,a.health.physical+i),a.stats.stress=Math.min(100,a.stats.stress+15);let c=o>0?`Health insurance covered ${(o*100).toFixed(0)}%! Out-of-pocket: ₹${s.toLocaleString(`en-IN`)}`:`No health insurance: paid full ₹${r.toLocaleString(`en-IN`)}!`;return a.eventLog.unshift({day:t,text:`🩺 Medical Emergency: ${n}. ${c}`,type:`event`}),{triggered:!0,name:n,medicalBill:r,outOfPocketCost:s,description:c}}function E(e,t,n){let r=e.market;r.cycleBias=.005*Math.sin(2*Math.PI*t/180);for(let i of r.tickers){let a=n.range(-i.volatility,i.volatility),o=i.trendBias+r.cycleBias+a,s=Math.max(2,Math.round(i.price*(1+o)*100)/100);if(i.price=s,i.history.push(s),i.history.length>60&&i.history.shift(),t%90==0&&i.dividendYieldPct>0){let n=Math.round(i.price*i.dividendYieldPct/4*100)/100;i.dividendPerShare=n;let r=e.player.portfolio[i.id];if(r&&r.shares>0){let a=Math.round(r.shares*n);e.player.money+=a,e.player.taxes.dividendIncomeThisCycle+=a,e.player.eventLog.unshift({day:t,text:`Dividend Payout: Received ₹${a.toLocaleString(`en-IN`)} from ${r.shares} shares of ${i.name}`,type:`income`})}}}let i=n.range(-.015,.015),a=-r.cycleBias*.8,o=Math.max(1e3,Math.round(r.goldPricePerGram*(1.0005+a+i)));r.goldPricePerGram=o,r.goldHistory.push(o),r.goldHistory.length>60&&r.goldHistory.shift();for(let n of e.player.sips)if(n.active&&t-n.lastInvestedDay>=n.cycleDays){let i=r.tickers.find(e=>e.id===n.tickerId);if(i&&e.player.money>=n.amountPerCycle){let r=Math.floor(n.amountPerCycle/i.price);if(r>0){let a=r*i.price;e.player.money-=a;let o=e.player.portfolio[i.id]||{shares:0,avgCost:0},s=o.shares+r,c=o.shares*o.avgCost+a;o.shares=s,o.avgCost=Math.round(c/s*100)/100,e.player.portfolio[i.id]=o,n.lastInvestedDay=t,e.player.eventLog.unshift({day:t,text:`SIP Auto-Invest: Bought ${r} shs of ${i.name} for ₹${Math.round(a).toLocaleString(`en-IN`)}`,type:`investment`})}}}for(let n of r.properties){let r=n.appreciationPct/100/360;if(n.price=Math.round(n.price*(1+r)),t%30==0&&n.owner){let r=Math.round(n.price*(n.rentYieldPct/100/12));if(n.owner===`player`)e.player.money+=r,e.player.taxes.incomeThisCycle+=r,e.player.eventLog.unshift({day:t,text:`Rental Income: Collected ₹${r.toLocaleString(`en-IN`)} from ${n.name}`,type:`income`});else{let t=e.npcs.find(e=>e.id===n.owner);t&&(t.money+=r)}}}for(let n of r.businessSectors)if(t%n.revenueCycleDays===0){let r=n.slots.filter(e=>e.owner!==null);if(r.length>0){let i=n.baseRevenuePerCycle/r.length**.7,a=Math.round(i-n.slotUpkeepPerCycle);for(let i of r)if(i.owner===`player`)e.player.money+=a,a>0&&(e.player.taxes.incomeThisCycle+=a),e.player.eventLog.unshift({day:t,text:`Business Yield (${n.name}): ${a>=0?`+`:``}₹${a.toLocaleString(`en-IN`)} net profit`,type:a>=0?`income`:`expense`});else{let t=e.npcs.find(e=>e.id===i.owner);t&&(t.money+=a)}}}}function D(e,t,n){for(let r of e.npcs)O(r,e,t,n)}function O(e,t,n,r){if(n%3!=e.name.length%3)return;let i=r.next();switch(e.archetype){case`aggressive-investor`:if(e.money>5e3&&i<.65){let r=[...t.market.tickers].sort((e,t)=>{let n=(e.history[e.history.length-1]||e.price)-(e.history[0]||e.price);return(t.history[t.history.length-1]||t.price)-(t.history[0]||t.price)-n})[0];if(r){let t=Math.min(e.money*.7,12e3),i=Math.floor(t/r.price);if(i>0){e.money-=i*r.price;let t=e.portfolio[r.id]||{shares:0,avgCost:r.price};t.shares+=i,e.portfolio[r.id]=t,k(e,n,`Bought`,`${i} shares of ${r.name} at ₹${r.price}`)}}}else if(i>.85){let i=Object.keys(e.portfolio);if(i.length>0){let a=i[r.intRange(0,i.length-1)],o=e.portfolio[a],s=t.market.tickers.find(e=>e.id===a);if(o&&s&&o.shares>0){let t=Math.max(1,Math.floor(o.shares*.5));e.money+=t*s.price,o.shares-=t,o.shares<=0&&delete e.portfolio[a],k(e,n,`Sold`,`${t} shares of ${s.name} for cash`)}}}break;case`serial-entrepreneur`:if(e.money>6e3&&i<.5)for(let r of t.market.businessSectors){if(r.specialMechanic===`lending`)continue;let t=r.slots.find(e=>e.owner===null);if(t&&e.money>=r.startupCost){e.money-=r.startupCost,t.owner=e.id,e.businesses.push({sectorId:r.id,slotId:t.id}),k(e,n,`Started Business`,`Claimed slot in ${r.name} for ₹${r.startupCost.toLocaleString(`en-IN`)}`);break}}break;case`landlord`:if(i<.4){let r=t.market.properties.filter(e=>e.owner===null);for(let t of r)if(e.money>=t.price*.4){t.owner=e.id,e.properties.push(t.id),e.money=Math.max(0,e.money-t.price*.5),k(e,n,`Acquired Property`,`Bought ${t.name} in ${t.location}`);break}}break;case`cautious-saver`:if(e.money>1e4&&i<.4){let r=Math.floor(e.money*.3/t.market.goldPricePerGram);if(r>0){let i=r*t.market.goldPricePerGram;e.money-=i,k(e,n,`Bought Gold`,`Secured ${r}g of 24K gold as safe reserve`)}}}}function k(e,t,n,r){e.decisionLog.unshift({day:t,action:n,detail:r}),e.decisionLog.length>20&&e.decisionLog.pop()}var A=class{state;rng;lastFrameTime=0;accumulatedMs=0;isRunning=!1;onRenderCallback;onDayTickCallback;constructor(e,t,n){this.state=e,this.rng=new u(e.gameSeed+e.player.currentDay),this.onDayTickCallback=t,this.onRenderCallback=n}start(){this.isRunning||(this.isRunning=!0,this.lastFrameTime=performance.now(),requestAnimationFrame(e=>this.frame(e)))}stop(){this.isRunning=!1}simulateSingleDay(){let e=this.state.player.currentDay+1;this.state.player.currentDay=e,this.state.player.lastActiveTimestamp=Date.now();let t=this.state.player;if(t.timeAllocation.sideHustle>0){let e=t.lifestyleAssets.some(e=>e.id===`laptop`),n=t.timeAllocation.sideHustle*(e?500:250);t.money+=n,t.taxes.incomeThisCycle+=n}w(this.state,e),S(this.state,e),E(this.state,e,this.rng),D(this.state,e,this.rng),this.checkAchievements(),this.onDayTickCallback(e)}frame(e){if(!this.isRunning)return;let t=e-this.lastFrameTime;for(this.lastFrameTime=e,this.accumulatedMs+=t;this.accumulatedMs>=d;)this.accumulatedMs-=d,this.simulateSingleDay();this.onRenderCallback(),requestAnimationFrame(e=>this.frame(e))}checkAchievements(){let e=this.state.player,t=(t,n)=>{e.achievements.includes(t)||(e.achievements.push(t),e.eventLog.unshift({day:e.currentDay,text:`🏆 Achievement Unlocked: ${n}!`,type:`achievement`}))};e.money>=1e5&&t(`first-lakh`,`Lakhpati (₹1 Lakh liquid cash)`),e.properties.length>=1&&t(`first-property`,`Property Owner`),e.businesses.length>=1&&t(`entrepreneur`,`Business Mogul`),e.health.physical>=95&&e.health.mental>=95&&t(`peak-health`,`Peak Performance (95+ Health)`),e.consequenceMeters.cheapFoodDays>=18&&t(`gut-of-steel`,`Living on the Edge (18+ Street Food Days)`)}};function j(e){let t=e<0,n=Math.abs(e),r=``;return r=n>=1e7?`₹${(n/1e7).toFixed(2)} Cr`:n>=1e5?`₹${(n/1e5).toFixed(2)} L`:`₹${Math.round(n).toLocaleString(`en-IN`)}`,t?`-${r}`:r}function M(e){return`${e>=0?`+`:``}${(e*100).toFixed(1)}%`}function N(e,t){let n=e.player,r=b(e),i=document.createElement(`div`);i.className=`screen-content`,i.style.display=`flex`,i.style.flexDirection=`column`,i.style.gap=`14px`;let a=document.createElement(`div`);a.className=`card`,a.innerHTML=`
    <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Estimated Net Worth</div>
    <div style="font-size: 1.8rem; font-weight: 800; color: #38bdf8;">${j(r)}</div>
    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-top: 6px;">
      <div style="background: #0b0f19; padding: 8px; border-radius: 8px; border: 1px solid #1a2336;">
        <div style="font-size: 0.65rem; color: var(--text-muted);">Liquid Wallet</div>
        <div style="font-weight: 700; color: var(--accent-green); font-size: 1rem;">${j(n.money)}</div>
      </div>
      <div style="background: #0b0f19; padding: 8px; border-radius: 8px; border: 1px solid #1a2336;">
        <div style="font-size: 0.65rem; color: var(--text-muted);">Bank Savings (3.5%)</div>
        <div style="font-weight: 700; color: #38bdf8; font-size: 1rem;">${j(n.savingsBalance)}</div>
      </div>
    </div>
  `,i.appendChild(a);let o=document.createElement(`div`);o.className=`card`,o.innerHTML=`
    <div class="card-title">
      <span>Daily Schedule (6 Time Slots)</span>
      <button class="btn btn-primary" id="btn-reallocate-time" style="font-size: 0.7rem; padding: 4px 8px;">Reallocate</button>
    </div>
    <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 4px;">How your 24 hours are divided today:</div>
    <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 4px; text-align: center;">
      ${P(n.timeAllocation)}
    </div>
  `,i.appendChild(o);let s=document.createElement(`div`);s.className=`card`;let c=h[n.lifestyle.foodTier];s.innerHTML=`
    <div class="card-title">
      <span>Active Occupation & Diet</span>
    </div>
    <div style="display: flex; justify-content: space-between; align-items: center; background: #0b0f19; padding: 10px; border-radius: 8px;">
      <div>
        <div style="font-weight: 700; font-size: 0.9rem;">${n.job.title}</div>
        <div style="font-size: 0.75rem; color: var(--text-muted);">Salary: ${j(n.job.salaryPerCycle)} / ${n.job.payCycleDays} days</div>
      </div>
      <span class="badge badge-green">Level 1</span>
    </div>
    <div style="display: flex; justify-content: space-between; align-items: center; background: #0b0f19; padding: 10px; border-radius: 8px;">
      <div>
        <div style="font-weight: 700; font-size: 0.9rem;">Diet: ${c.name}</div>
        <div style="font-size: 0.75rem; color: var(--text-muted);">Cost: ${j(c.costPerDay)}/day • ${c.physicalDelta>=0?`+`:``}${c.physicalDelta} health/day</div>
      </div>
      <button class="btn" id="btn-change-diet" style="font-size: 0.7rem; padding: 4px 8px;">Change</button>
    </div>
  `,i.appendChild(s);let l=document.createElement(`div`);l.className=`ad-slot-placeholder`,l.innerText=`— Sponsored Partner Ad Slot —`,i.appendChild(l);let u=document.createElement(`div`);return u.className=`card`,u.innerHTML=`
    <div class="card-title">
      <span>Life & Financial Journal</span>
      <span style="font-size: 0.7rem; color: var(--text-muted);">Live stream</span>
    </div>
    <div style="display: flex; flex-direction: column; gap: 8px; max-height: 220px; overflow-y: auto;">
      ${n.eventLog.slice(0,10).map(e=>`
        <div style="font-size: 0.75rem; padding: 6px 8px; background: #0b0f19; border-left: 3px solid ${F(e.type)}; border-radius: 4px;">
          <span style="color: var(--text-muted); font-size: 0.65rem; margin-right: 6px;">Day ${e.day}</span>
          <span>${e.text}</span>
        </div>
      `).join(``)}
    </div>
  `,i.appendChild(u),o.querySelector(`#btn-reallocate-time`)?.addEventListener(`click`,()=>{t(`open-time-modal`)}),s.querySelector(`#btn-change-diet`)?.addEventListener(`click`,()=>{t(`open-diet-modal`)}),i}function P(e){let t=[];for(let n=0;n<e.job;n++)t.push({name:`Job`,color:`#0284c7`,icon:`💼`});for(let n=0;n<e.commute;n++)t.push({name:`Commute`,color:`#64748b`,icon:`🚗`});for(let n=0;n<e.exercise;n++)t.push({name:`Workout`,color:`#22c55e`,icon:`🏋️`});for(let n=0;n<e.cooking;n++)t.push({name:`Cook`,color:`#f97316`,icon:`🍳`});for(let n=0;n<e.sideHustle;n++)t.push({name:`Hustle`,color:`#eab308`,icon:`💻`});for(let n=0;n<e.education;n++)t.push({name:`Study`,color:`#a855f7`,icon:`📚`});for(let n=0;n<e.rest;n++)t.push({name:`Rest`,color:`#ec4899`,icon:`😴`});for(let n=0;n<e.free;n++)t.push({name:`Free`,color:`#475569`,icon:`☕`});return t.slice(0,6).map(e=>`
    <div style="background: ${e.color}22; border: 1px solid ${e.color}66; border-radius: 6px; padding: 6px 2px;">
      <div style="font-size: 0.9rem;">${e.icon}</div>
      <div style="font-size: 0.6rem; color: ${e.color}; font-weight: 700; margin-top: 2px;">${e.name}</div>
    </div>
  `).join(``)}function F(e){switch(e){case`income`:return`#22c55e`;case`expense`:return`#ef4444`;case`investment`:return`#38bdf8`;case`achievement`:return`#fbbf24`;default:return`#94a3b8`}}function I(e,t,n=!0){let r=e.getContext(`2d`);if(!r||t.length<2)return;let i=e.width,a=e.height;r.clearRect(0,0,i,a);let o=Math.min(...t),s=Math.max(...t),c=s-o===0?1:s-o,l=t.map((e,n)=>({x:4+n/(t.length-1)*(i-8),y:a-4-(e-o)/c*(a-8)})),u=r.createLinearGradient(0,0,0,a),d=n?`#22c55e`:`#ef4444`,f=n?`rgba(34, 197, 94, 0.15)`:`rgba(239, 68, 68, 0.15)`;u.addColorStop(0,f),u.addColorStop(1,`rgba(0, 0, 0, 0)`),r.beginPath(),r.moveTo(l[0].x,l[0].y);for(let e=1;e<l.length;e++)r.lineTo(l[e].x,l[e].y);r.strokeStyle=d,r.lineWidth=2,r.stroke(),r.lineTo(l[l.length-1].x,a),r.lineTo(l[0].x,a),r.closePath(),r.fillStyle=u,r.fill()}function L(e,t){let n=document.createElement(`div`);n.className=`screen-content`,n.style.display=`flex`,n.style.flexDirection=`column`,n.style.gap=`14px`;let r=document.createElement(`div`);r.className=`card`;let i=e.player.goldHoldings.grams;r.innerHTML=`
    <div class="card-title">
      <span>✨ 24K Physical Gold</span>
      <span class="badge badge-gold">Safe Haven Asset</span>
    </div>
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <div>
        <div style="font-size: 1.4rem; font-weight: 800; color: #fbbf24;">${j(e.market.goldPricePerGram)} <span style="font-size: 0.75rem; color: var(--text-muted);">/ gram</span></div>
        <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">Your holdings: <strong>${i}g</strong> (Value: ${j(i*e.market.goldPricePerGram)})</div>
      </div>
      <div style="display: flex; gap: 6px;">
        <button class="btn btn-primary" id="btn-buy-gold" style="font-size: 0.75rem;">Buy</button>
        <button class="btn" id="btn-sell-gold" style="font-size: 0.75rem;" ${i<=0?`disabled`:``}>Sell</button>
      </div>
    </div>
  `,n.appendChild(r);let a=document.createElement(`div`);a.className=`card`,a.innerHTML=`
    <div class="card-title">
      <span>Stock Exchange (BSE / NSE Live)</span>
      <span style="font-size: 0.7rem; color: var(--text-muted);">Macro cycle: ${e.market.cycleBias>=0?`🟢 Bullish`:`🔴 Bearish`}</span>
    </div>
    <div style="font-size: 0.75rem; color: var(--text-muted);">Equities pay quarterly dividends. Tap ticker to trade or setup SIP:</div>
    <div id="ticker-list-container" style="display: flex; flex-direction: column; gap: 8px; margin-top: 6px;"></div>
  `,n.appendChild(a);let o=a.querySelector(`#ticker-list-container`);return e.market.tickers.forEach(n=>{let r=document.createElement(`div`);r.style.display=`flex`,r.style.alignItems=`center`,r.style.justifyContent=`space-between`,r.style.background=`#0b0f19`,r.style.padding=`10px 12px`,r.style.borderRadius=`8px`,r.style.border=`1px solid #1a2336`,r.style.cursor=`pointer`;let i=e.player.portfolio[n.id],a=i?i.shares:0,s=n.history[0]||n.price,c=(n.price-s)/s,l=c>=0;r.innerHTML=`
      <div style="flex: 1.2;">
        <div style="font-weight: 700; font-size: 0.85rem;">${n.name}</div>
        <div style="font-size: 0.65rem; color: var(--text-muted);">${n.sector.toUpperCase()} • Div: ${(n.dividendYieldPct*100).toFixed(1)}%</div>
        ${a>0?`<div style="font-size: 0.65rem; color: var(--accent-blue); margin-top: 2px;">Holding: ${a} shares</div>`:``}
      </div>
      <div style="flex: 1; display: flex; justify-content: center;">
        <canvas id="sparkline-${n.id}" width="90" height="32"></canvas>
      </div>
      <div style="flex: 1; text-align: right;">
        <div style="font-weight: 800; font-size: 0.9rem;">${j(n.price)}</div>
        <div style="font-size: 0.7rem; font-weight: 700; color: ${l?`var(--accent-green)`:`var(--accent-red)`};">${M(c)}</div>
      </div>
    `,r.addEventListener(`click`,()=>{t(`trade-stock`,{tickerId:n.id})}),o.appendChild(r),setTimeout(()=>{let e=r.querySelector(`#sparkline-${n.id}`);e&&I(e,n.history,l)},0)}),r.querySelector(`#btn-buy-gold`)?.addEventListener(`click`,()=>t(`trade-gold`,{action:`buy`})),r.querySelector(`#btn-sell-gold`)?.addEventListener(`click`,()=>t(`trade-gold`,{action:`sell`})),n}function R(e,t){let n=document.createElement(`div`);n.className=`screen-content`,n.style.display=`flex`,n.style.flexDirection=`column`,n.style.gap=`14px`;let r=document.createElement(`div`);r.className=`card`,r.innerHTML=`
    <div class="card-title">
      <span>Real Estate Marketplace</span>
      <span class="badge badge-green">Appreciating Assets</span>
    </div>
    <div style="font-size: 0.75rem; color: var(--text-muted);">Acquire land or apartments for monthly rental yield and capital appreciation:</div>
    <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 6px;">
      ${e.market.properties.map(t=>{let n=t.owner===`player`,r=t.owner&&t.owner!==`player`,i=r?e.npcs.find(e=>e.id===t.owner):null;return`
          <div style="background: #0b0f19; padding: 10px 12px; border-radius: 8px; border: 1px solid #1a2336; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-weight: 700; font-size: 0.85rem;">${t.name} <span style="font-size: 0.7rem; color: var(--text-muted);">(${t.location})</span></div>
              <div style="font-size: 0.7rem; color: var(--text-muted); margin-top: 2px;">
                Valuation: ${j(t.price)} • Yield: ${t.rentYieldPct}% (~${j(Math.round(t.price*(t.rentYieldPct/100/12)))}/mo)
              </div>
              <div style="font-size: 0.65rem; color: ${t.riskProfile.legalStatus===`clear`?`var(--accent-green)`:`var(--accent-gold)`};">
                Legal status: ${t.riskProfile.legalStatus.toUpperCase()} (${t.riskProfile.issueChancePct}% dispute risk)
              </div>
            </div>
            <div>
              ${n?`<span class="badge badge-green">Owned by You</span>`:r?`<span class="badge badge-gold">Owned: ${i?.name||`NPC`}</span>`:`<button class="btn btn-primary btn-buy-prop" data-id="${t.id}" style="font-size: 0.75rem;">Buy</button>`}
            </div>
          </div>
        `}).join(``)}
    </div>
  `,n.appendChild(r);let i=document.createElement(`div`);return i.className=`card`,i.innerHTML=`
    <div class="card-title">
      <span>Tools, Vehicles & Lifestyle Assets</span>
      <span class="badge badge-gold">Time-Saving Tools</span>
    </div>
    <div style="font-size: 0.75rem; color: var(--text-muted);">These depreciate over time, but unlock critical time-slots, side hustles, or health boosts:</div>
    <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 6px;">
      ${_.map(t=>{let n=e.player.lifestyleAssets.find(e=>e.id===t.id);return`
          <div style="background: #0b0f19; padding: 10px 12px; border-radius: 8px; border: 1px solid #1a2336; display: flex; justify-content: space-between; align-items: center;">
            <div style="max-width: 70%;">
              <div style="font-weight: 700; font-size: 0.85rem;">${t.name}</div>
              <div style="font-size: 0.7rem; color: var(--text-muted); margin-top: 2px;">${t.description}</div>
              <div style="font-size: 0.65rem; color: #94a3b8; margin-top: 2px;">
                Price: ${j(t.price)} • Deprec: ${(t.depreciationPerYear*100).toFixed(0)}%/yr • Upkeep: ${j(t.monthlyUpkeep)}/mo
              </div>
            </div>
            <div>
              ${n?`<span class="badge badge-green">In Garage</span>`:`<button class="btn btn-primary btn-buy-asset" data-id="${t.id}" style="font-size: 0.75rem;">Acquire</button>`}
            </div>
          </div>
        `}).join(``)}
    </div>
  `,n.appendChild(i),r.querySelectorAll(`.btn-buy-prop`).forEach(e=>{e.addEventListener(`click`,e=>{t(`buy-property`,{propertyId:e.currentTarget.getAttribute(`data-id`)})})}),i.querySelectorAll(`.btn-buy-asset`).forEach(e=>{e.addEventListener(`click`,e=>{t(`buy-lifestyle-asset`,{assetId:e.currentTarget.getAttribute(`data-id`)})})}),n}function z(e,t){let n=document.createElement(`div`);n.className=`screen-content`,n.style.display=`flex`,n.style.flexDirection=`column`,n.style.gap=`14px`;let r=document.createElement(`div`);return r.className=`card`,r.innerHTML=`
    <div class="card-title">
      <span>Enterprise & Commerce Sectors</span>
      <span class="badge badge-gold">Fixed Slots Scarcity</span>
    </div>
    <div style="font-size: 0.75rem; color: var(--text-muted);">
      Each sector has limited operator licenses. If you don't claim an open slot, ambitious NPCs will.
      More competitors in the same sector dilute individual profit margins.
    </div>
  `,n.appendChild(r),e.market.businessSectors.forEach(r=>{let i=document.createElement(`div`);i.className=`card`;let a=r.slots.filter(e=>e.owner!==null).length,o=r.slots.some(e=>e.owner===`player`),s=r.slots.filter(e=>e.owner===null);i.innerHTML=`
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <div style="font-weight: 700; font-size: 0.95rem;">${r.name}</div>
          <div style="font-size: 0.7rem; color: var(--text-muted);">
            Cost: ${j(r.startupCost)} • Base Rev: ${j(r.baseRevenuePerCycle)} / 30d • Upkeep: ${j(r.slotUpkeepPerCycle)}/mo
          </div>
        </div>
        <span class="badge ${a>=r.capacity?`badge-red`:`badge-green`}">
          ${a}/${r.capacity} Slots
        </span>
      </div>

      <!-- Slots Visual -->
      <div style="display: grid; grid-template-columns: repeat(${r.capacity}, 1fr); gap: 6px; margin: 6px 0;">
        ${r.slots.map(t=>t.owner?t.owner===`player`?`
              <div style="background: rgba(34, 197, 94, 0.2); border: 1px solid var(--accent-green); padding: 6px; border-radius: 6px; text-align: center; font-size: 0.65rem; color: #4ade80; font-weight: 700;">
                ⭐ Your Business
              </div>
            `:`
            <div style="background: #0b0f19; border: 1px solid #1a2336; padding: 6px; border-radius: 6px; text-align: center; font-size: 0.65rem; color: var(--text-muted);">
              ${e.npcs.find(e=>e.id===t.owner)?.name.split(` `)[0]||`Competitor`}
            </div>
          `:`
              <div style="border: 1px dashed #334155; padding: 6px; border-radius: 6px; text-align: center; font-size: 0.65rem; color: var(--text-muted);">
                Vacant Slot
              </div>
            `).join(``)}
      </div>

      <div style="display: flex; justify-content: flex-end;">
        ${!o&&s.length>0?`<button class="btn btn-primary btn-claim-slot" data-sector="${r.id}" style="font-size: 0.75rem;">Launch Business (${j(r.startupCost)})</button>`:o?`<span style="font-size: 0.75rem; color: var(--accent-green); font-weight: 700;">Active Operator</span>`:`<span style="font-size: 0.75rem; color: var(--text-muted);">Sector Full</span>`}
      </div>
    `,i.querySelector(`.btn-claim-slot`)?.addEventListener(`click`,()=>{t(`claim-business-slot`,{sectorId:r.id})}),n.appendChild(i)}),n}var B=[{tier:`none`,name:`No Coverage`,premium:0,coveragePct:0},{tier:`basic`,name:`Basic Silver`,premium:500,coveragePct:.5},{tier:`standard`,name:`Standard Gold`,premium:1200,coveragePct:.8},{tier:`premium`,name:`Premium Platinum`,premium:2500,coveragePct:.95}];function V(e,t){let n=e.player,r=document.createElement(`div`);r.className=`screen-content`,r.style.display=`flex`,r.style.flexDirection=`column`,r.style.gap=`14px`;let i=document.createElement(`div`);i.className=`card`,i.innerHTML=`
    <div class="card-title">
      <span>Savings & Term Deposits</span>
      <span class="badge badge-green">3.5% APY Daily</span>
    </div>
    <div style="display: flex; justify-content: space-between; align-items: center; background: #0b0f19; padding: 12px; border-radius: 8px;">
      <div>
        <div style="font-size: 0.7rem; color: var(--text-muted);">Current Savings Balance</div>
        <div style="font-size: 1.3rem; font-weight: 800; color: #38bdf8;">${j(n.savingsBalance)}</div>
      </div>
      <div style="display: flex; gap: 6px;">
        <button class="btn btn-primary" id="btn-deposit-savings" style="font-size: 0.75rem;">Deposit</button>
        <button class="btn" id="btn-withdraw-savings" style="font-size: 0.75rem;" ${n.savingsBalance<=0?`disabled`:``}>Withdraw</button>
      </div>
    </div>
  `,r.appendChild(i);let a=document.createElement(`div`);a.className=`card`,a.innerHTML=`
    <div class="card-title">
      <span>Credit & Loan Facilities</span>
      <button class="btn btn-primary" id="btn-apply-loan" style="font-size: 0.75rem; padding: 4px 8px;">Apply Loan</button>
    </div>
    <div style="font-size: 0.75rem; color: var(--text-muted);">
      Missing EMI payments triggers compounding penalties and severe mental stress:
    </div>
    <div style="display: flex; flex-direction: column; gap: 6px; margin-top: 4px;">
      ${n.loans.length===0?`<div style="font-size: 0.8rem; color: var(--text-muted); padding: 8px; text-align: center; background: #0b0f19; border-radius: 6px;">No outstanding liabilities. Excellent credit rating!</div>`:n.loans.map(e=>`
          <div style="background: #0b0f19; padding: 8px 10px; border-radius: 6px; border: 1px solid #1a2336; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-weight: 700; font-size: 0.85rem;">${e.name}</div>
              <div style="font-size: 0.65rem; color: var(--text-muted);">Balance: ${j(e.principalRemaining)} • EMI: ${j(e.emiAmount)} / 30d • ${(e.interestRate*100).toFixed(0)}% APR</div>
            </div>
            ${e.missedPayments>0?`<span class="badge badge-red">${e.missedPayments} Missed</span>`:`<span class="badge badge-green">On Schedule</span>`}
          </div>
        `).join(``)}
    </div>
  `,r.appendChild(a);let o=document.createElement(`div`);o.className=`card`;let s=n.insurance.health.tier;return o.innerHTML=`
    <div class="card-title">
      <span>Insurance Protection Desk</span>
      <span class="badge badge-gold">Emergency Hedge</span>
    </div>
    <div style="font-size: 0.75rem; color: var(--text-muted);">
      Without health insurance, lifestyle illnesses will wipe out your wallet. Choose your policy:
    </div>
    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin-top: 6px;">
      ${B.map(e=>`
        <div style="background: #0b0f19; border: 1px solid ${s===e.tier?`var(--accent-green)`:`#1a2336`}; padding: 8px; border-radius: 6px;">
          <div style="font-weight: 700; font-size: 0.8rem;">${e.name}</div>
          <div style="font-size: 0.65rem; color: var(--text-muted); margin-top: 2px;">
            ${e.coveragePct>0?`Covers ${(e.coveragePct*100).toFixed(0)}% of medical bills`:`Zero coverage`}
          </div>
          <div style="font-weight: 700; font-size: 0.8rem; color: #38bdf8; margin: 4px 0;">
            ${e.premium>0?`${j(e.premium)}/mo`:`Free`}
          </div>
          <button class="btn ${s===e.tier?`btn-success`:``} btn-select-ins" data-tier="${e.tier}" style="font-size: 0.65rem; width: 100%;">
            ${s===e.tier?`Active Policy`:`Select`}
          </button>
        </div>
      `).join(``)}
    </div>
  `,r.appendChild(o),i.querySelector(`#btn-deposit-savings`)?.addEventListener(`click`,()=>t(`deposit-savings`)),i.querySelector(`#btn-withdraw-savings`)?.addEventListener(`click`,()=>t(`withdraw-savings`)),a.querySelector(`#btn-apply-loan`)?.addEventListener(`click`,()=>t(`open-loan-modal`)),o.querySelectorAll(`.btn-select-ins`).forEach(e=>{e.addEventListener(`click`,e=>{t(`select-insurance-tier`,{tier:e.currentTarget.getAttribute(`data-tier`)})})}),r}function H(e,t){let n=e.player,r=document.createElement(`div`);r.className=`screen-content`,r.style.display=`flex`,r.style.flexDirection=`column`,r.style.gap=`14px`;let i=document.createElement(`div`);i.className=`card`,i.innerHTML=`
    <div class="card-title">
      <span>Hidden Consequence Risk Trackers</span>
      <span class="badge badge-gold">Cause & Effect</span>
    </div>
    <div style="font-size: 0.75rem; color: var(--text-muted);">
      Personal health events are not random! They build up when you compromise on food, rest, or exercise:
    </div>
    <div style="display: flex; flex-direction: column; gap: 6px; margin-top: 6px;">
      ${U(`Street Food Strain`,n.consequenceMeters.cheapFoodDays,20,`At 20d: Gastroenteritis bill`)}
      ${U(`Sedentary Inactivity`,n.consequenceMeters.noExerciseDays,35,`At 35d: Chronic spinal pain`)}
      ${U(`Stress Fatigue`,n.consequenceMeters.highStressDays,25,`At 25d: Panic & counseling`)}
      ${U(`Energy Depletion`,n.consequenceMeters.lowEnergyDays,15,`At 15d: Adrenal burnout`)}
    </div>
  `,r.appendChild(i);let a=document.createElement(`div`);a.className=`card`,a.innerHTML=`
    <div class="card-title">
      <span>Career Market & Education</span>
    </div>
    <div style="font-size: 0.75rem; color: var(--text-muted);">Available Jobs:</div>
    <div style="display: flex; flex-direction: column; gap: 6px; margin: 4px 0 8px 0;">
      ${y.map(e=>{let t=n.job.id===e.id,r=!e.requiredCourse||(n.educationProgress[e.requiredCourse]||0)>=100,i=!e.requiredMinNetWorth||n.money>=e.requiredMinNetWorth,a=r&&i;return`
          <div style="background: #0b0f19; padding: 8px 10px; border-radius: 6px; border: 1px solid #1a2336; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-weight: 700; font-size: 0.85rem;">${e.title} ${t?`<span style="color: var(--accent-green);">(Active)</span>`:``}</div>
              <div style="font-size: 0.65rem; color: var(--text-muted);">
                Salary: ${j(e.salaryPerCycle)} / 15d • Takes ${e.timeSlotsCost} slots • Req: ${e.requiredCourse?v.find(t=>t.id===e.requiredCourse)?.name:`None`}
              </div>
            </div>
            <div>
              ${t?`<span class="badge badge-green">Current</span>`:a?`<button class="btn btn-primary btn-switch-job" data-id="${e.id}" style="font-size: 0.7rem;">Switch</button>`:`<span class="badge" style="background:#334155; color:#94a3b8;">Locked</span>`}
            </div>
          </div>
        `}).join(``)}
    </div>

    <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px;">Certifications & Degrees:</div>
    <div style="display: flex; flex-direction: column; gap: 6px; margin-top: 4px;">
      ${v.map(e=>{let t=n.educationProgress[e.id]||0,r=t>=100;return`
          <div style="background: #0b0f19; padding: 8px 10px; border-radius: 6px; border: 1px solid #1a2336; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-weight: 700; font-size: 0.85rem;">${e.name}</div>
              <div style="font-size: 0.65rem; color: var(--text-muted);">${e.description} (Fee: ${j(e.fee)})</div>
              <div style="font-size: 0.65rem; color: #38bdf8; margin-top: 2px;">Progress: ${t}%</div>
            </div>
            <div>
              ${r?`<span class="badge badge-green">Completed</span>`:`<button class="btn btn-primary btn-enroll-course" data-id="${e.id}" style="font-size: 0.7rem;">Enroll (${j(e.fee)})</button>`}
            </div>
          </div>
        `}).join(``)}
    </div>
  `,r.appendChild(a);let o=document.createElement(`div`);o.className=`card`,o.innerHTML=`
    <div class="card-title">
      <span>Fellow Residents & Competitors</span>
      <span class="badge badge-green">Living Economy</span>
    </div>
    <div style="display: flex; flex-direction: column; gap: 6px;">
      ${e.npcs.map(e=>`
        <div style="background: #0b0f19; padding: 8px 10px; border-radius: 6px; border: 1px solid #1a2336; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-weight: 700; font-size: 0.85rem;">${e.name}</div>
            <div style="font-size: 0.65rem; color: var(--text-muted); text-transform: capitalize;">${e.archetype.replace(`-`,` `)} • Net Cash: ${j(e.money)}</div>
            ${e.decisionLog[0]?`<div style="font-size: 0.65rem; color: #94a3b8; margin-top: 2px;">Latest: ${e.decisionLog[0].action} ${e.decisionLog[0].detail}</div>`:``}
          </div>
        </div>
      `).join(``)}
    </div>
  `,r.appendChild(o);let s=document.createElement(`div`);return s.className=`card`,s.innerHTML=`
    <div class="card-title">
      <span>Game Save & Data Management</span>
    </div>
    <div style="font-size: 0.75rem; color: var(--text-muted);">
      Your game auto-saves to your device browser. You can export or reset your simulation:
    </div>
    <div style="display: flex; gap: 8px; margin-top: 6px;">
      <button class="btn btn-primary" id="btn-export-save" style="flex: 1; font-size: 0.75rem;">Export JSON Save</button>
      <button class="btn btn-danger" id="btn-reset-game" style="flex: 1; font-size: 0.75rem;">Hard Reset Game</button>
    </div>
  `,r.appendChild(s),s.querySelector(`#btn-export-save`)?.addEventListener(`click`,()=>{c(e)}),s.querySelector(`#btn-reset-game`)?.addEventListener(`click`,()=>{confirm(`Are you sure you want to reset your life simulation? All progress will be wiped.`)&&(l(),location.reload())}),a.querySelectorAll(`.btn-switch-job`).forEach(e=>{e.addEventListener(`click`,e=>{t(`switch-job`,{jobId:e.currentTarget.getAttribute(`data-id`)})})}),a.querySelectorAll(`.btn-enroll-course`).forEach(e=>{e.addEventListener(`click`,e=>{t(`enroll-course`,{courseId:e.currentTarget.getAttribute(`data-id`)})})}),r}function U(e,t,n,r){let i=Math.min(100,Math.round(t/n*100)),a=i>=70;return`
    <div style="background: #0b0f19; padding: 6px 10px; border-radius: 6px; border: 1px solid #1a2336;">
      <div style="display: flex; justify-content: space-between; font-size: 0.75rem;">
        <span style="font-weight: 600;">${e}</span>
        <span style="color: ${a?`var(--accent-red)`:`var(--text-muted)`}; font-weight: 700;">${t} / ${n} days (${i}%)</span>
      </div>
      <div class="meter-track" style="margin: 4px 0;">
        <div class="meter-fill" style="width: ${i}%; background: ${a?`var(--accent-red)`:`var(--accent-gold)`};"></div>
      </div>
      <div style="font-size: 0.65rem; color: #64748b;">${r}</div>
    </div>
  `}function W(e,t,n){let r=document.createElement(`div`);r.className=`modal-backdrop`;let i={...e.player.timeAllocation},a=document.createElement(`div`);a.className=`modal-sheet`,a.innerHTML=`
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <h3 style="font-size: 1.1rem;">Divide 6 Time Slots</h3>
      <span id="slot-counter" class="badge badge-green" style="font-size: 0.8rem;">6 / 6 Allocated</span>
    </div>
    <div style="font-size: 0.75rem; color: var(--text-muted);">
      Every hour counts. Balance work, exercise, study, and rest. Job takes fixed ${i.job} slots.
    </div>
    <div id="alloc-rows" style="display: flex; flex-direction: column; gap: 8px;">
      ${G(`Commute`,i.commute,`commute`)}
      ${G(`Exercise / Workout`,i.exercise,`exercise`)}
      ${G(`Home Cooking`,i.cooking,`cooking`)}
      ${G(`Freelance Side Hustle`,i.sideHustle,`sideHustle`)}
      ${G(`Education & Study`,i.education,`education`)}
      ${G(`Deep Rest & Sleep`,i.rest,`rest`)}
      ${G(`Free Time & Leisure`,i.free,`free`)}
    </div>
    <div style="display: flex; gap: 8px; margin-top: 10px;">
      <button class="btn" id="btn-cancel-time" style="flex: 1;">Cancel</button>
      <button class="btn btn-primary" id="btn-save-time" style="flex: 1;">Confirm Schedule</button>
    </div>
  `,r.appendChild(a);function o(){let e=i.job+i.commute+i.exercise+i.cooking+i.sideHustle+i.education+i.rest+i.free,t=a.querySelector(`#slot-counter`);t.innerText=`${e} / 6 Allocated`,t.className=`badge ${e===6?`badge-green`:`badge-red`}`}return a.querySelectorAll(`.btn-slot-adj`).forEach(e=>{e.addEventListener(`click`,e=>{let t=e.currentTarget.getAttribute(`data-key`),n=parseInt(e.currentTarget.getAttribute(`data-delta`)||`0`,10),r=i[t];if(r+n>=0){i[t]=r+n;let e=a.querySelector(`#val-${t}`);e&&(e.innerText=String(i[t])),o()}})}),a.querySelector(`#btn-cancel-time`)?.addEventListener(`click`,t),a.querySelector(`#btn-save-time`)?.addEventListener(`click`,()=>{let e=i.job+i.commute+i.exercise+i.cooking+i.sideHustle+i.education+i.rest+i.free;if(e!==6){alert(`Must allocate exactly 6 time slots! Currently have ${e}.`);return}n(i),t()}),r}function G(e,t,n){return`
    <div style="display: flex; justify-content: space-between; align-items: center; background: #0b0f19; padding: 6px 10px; border-radius: 6px;">
      <span style="font-size: 0.8rem; font-weight: 600;">${e}</span>
      <div style="display: flex; align-items: center; gap: 8px;">
        <button class="btn btn-slot-adj" data-key="${n}" data-delta="-1" style="padding: 2px 8px; font-size: 0.8rem;">-</button>
        <span id="val-${n}" style="font-weight: 700; min-width: 16px; text-align: center;">${t}</span>
        <button class="btn btn-slot-adj" data-key="${n}" data-delta="1" style="padding: 2px 8px; font-size: 0.8rem;">+</button>
      </div>
    </div>
  `}function K(e,t,n){let r=document.createElement(`div`);r.className=`modal-backdrop`;let i=document.createElement(`div`);return i.className=`modal-sheet`,i.innerHTML=`
    <h3 style="font-size: 1.1rem;">Choose Daily Diet Quality</h3>
    <div style="font-size: 0.75rem; color: var(--text-muted);">
      Cheap food saves cash but triggers severe gastroenteritis bills. Healthy cooking requires equipment and time.
    </div>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      ${Object.values(h).map(t=>{let n=e.player.lifestyle.foodTier===t.id,r=e.player.lifestyleAssets.some(e=>e.id===`cooking-equipment`),i=!t.requiresCookingEquipment||r;return`
          <div style="background: #0b0f19; border: 1px solid ${n?`var(--accent-green)`:`#1a2336`}; padding: 10px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-weight: 700; font-size: 0.85rem;">${t.name}</div>
              <div style="font-size: 0.7rem; color: var(--text-muted);">${t.description}</div>
              ${t.requiresCookingEquipment&&!r?`<div style="font-size: 0.65rem; color: var(--accent-red); margin-top: 2px;">⚠️ Requires Gourmet Kitchen Set from Assets tab</div>`:``}
            </div>
            <button class="btn ${n?`btn-success`:`btn-primary`} btn-pick-diet" data-id="${t.id}" style="font-size: 0.75rem;" ${i?``:`disabled`}>
              ${n?`Active`:`Choose`}
            </button>
          </div>
        `}).join(``)}
    </div>
    <button class="btn" id="btn-close-diet" style="margin-top: 10px;">Close</button>
  `,r.appendChild(i),i.querySelectorAll(`.btn-pick-diet`).forEach(e=>{e.addEventListener(`click`,e=>{n(e.currentTarget.getAttribute(`data-id`)),t()})}),i.querySelector(`#btn-close-diet`)?.addEventListener(`click`,t),r}function q(e,t,n,r){let i=e.market.tickers.find(e=>e.id===t),a=e.player.portfolio[t]||{shares:0,avgCost:0},o=document.createElement(`div`);o.className=`modal-backdrop`;let s=document.createElement(`div`);s.className=`modal-sheet`,s.innerHTML=`
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <h3 style="font-size: 1.1rem;">${i.name} (${i.id})</h3>
      <span class="badge badge-green">${j(i.price)}</span>
    </div>
    <div style="font-size: 0.75rem; color: var(--text-muted);">
      Your holding: <strong>${a.shares} shares</strong> (Avg: ${j(a.avgCost)}) • Liquid cash: ${j(e.player.money)}
    </div>

    <div style="display: flex; flex-direction: column; gap: 8px;">
      <label style="font-size: 0.75rem; font-weight: 600;">Shares to Trade:</label>
      <input type="number" id="trade-shares-input" value="10" min="1" max="10000" style="background: #0b0f19; border: 1px solid #1a2336; padding: 8px; color: white; border-radius: 6px; font-size: 1rem;" />
      <div id="trade-cost-preview" style="font-size: 0.75rem; color: #38bdf8;">Estimated Cost: ${j(10*i.price)}</div>
    </div>

    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin-top: 6px;">
      <button class="btn btn-primary" id="btn-exec-buy">Buy Shares</button>
      <button class="btn btn-danger" id="btn-exec-sell" ${a.shares<=0?`disabled`:``}>Sell Shares</button>
    </div>

    <hr style="border-color: #1a2336; margin: 4px 0;" />

    <div style="display: flex; justify-content: space-between; align-items: center;">
      <div>
        <div style="font-weight: 700; font-size: 0.85rem;">Systematic Investment Plan (SIP)</div>
        <div style="font-size: 0.65rem; color: var(--text-muted);">Auto-invest ₹1,000 every 15 days into this stock</div>
      </div>
      <button class="btn btn-primary" id="btn-toggle-sip" style="font-size: 0.75rem;">Enable SIP</button>
    </div>

    <button class="btn" id="btn-close-trade" style="margin-top: 6px;">Done</button>
  `,o.appendChild(s);let c=s.querySelector(`#trade-shares-input`),l=s.querySelector(`#trade-cost-preview`);return c?.addEventListener(`input`,()=>{let e=parseInt(c.value||`0`,10);l.innerText=`Estimated Cost: ${j(e*i.price)}`}),s.querySelector(`#btn-exec-buy`)?.addEventListener(`click`,()=>{let t=parseInt(c.value||`0`,10);if(!(t<=0)){if(e.player.money<t*i.price){alert(`Insufficient liquid cash!`);return}r(`buy`,t),n()}}),s.querySelector(`#btn-exec-sell`)?.addEventListener(`click`,()=>{let e=parseInt(c.value||`0`,10);if(!(e<=0)){if(a.shares<e){alert(`Cannot sell more shares than you hold!`);return}r(`sell`,e),n()}}),s.querySelector(`#btn-toggle-sip`)?.addEventListener(`click`,()=>{r(`sip`,1e3),n()}),s.querySelector(`#btn-close-trade`)?.addEventListener(`click`,n),o}var J=class{state;currentTab=`dashboard`;gameLoop;appEl;constructor(){this.appEl=document.getElementById(`app`),this.state=o(),this.handleOfflineCatchup(),this.gameLoop=new A(this.state,e=>this.onDayTick(e),()=>this.onRender()),this.renderAppShell(),this.renderActiveTab(),this.gameLoop.start()}handleOfflineCatchup(){let e=f(this.state.player.lastActiveTimestamp);if(e>0){let t=p(e);if(t.mode===`fast-sim`){for(let e=0;e<t.days;e++)this.gameLoop?.simulateSingleDay();alert(`Welcome back! Fast-simulated ${t.days} days of your absence.`)}else if(t.mode===`aggregate`){let e=m(this.state,t.days);alert(`Offline Progression Report:\n\n${e.join(`
`)}`)}s(this.state)}}renderAppShell(){this.appEl.innerHTML=`
      <header class="top-nav">
        <div class="top-nav-row">
          <div>
            <div style="font-size: 0.65rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Available Cash</div>
            <div class="cash-display" id="top-cash">₹0</div>
          </div>
          <div class="day-badge" id="top-day">Day 1</div>
        </div>
        <div class="health-meters-row">
          <div class="meter-box">
            <div class="label"><span>Physical</span><span id="txt-physical">85%</span></div>
            <div class="meter-track"><div class="meter-fill physical" id="bar-physical" style="width: 85%;"></div></div>
          </div>
          <div class="meter-box">
            <div class="label"><span>Mental</span><span id="txt-mental">80%</span></div>
            <div class="meter-track"><div class="meter-fill mental" id="bar-mental" style="width: 80%;"></div></div>
          </div>
          <div class="meter-box">
            <div class="label"><span>Energy</span><span id="txt-energy">75%</span></div>
            <div class="meter-track"><div class="meter-fill energy" id="bar-energy" style="width: 75%;"></div></div>
          </div>
        </div>
      </header>

      <main class="screen-container" id="screen-container"></main>

      <nav class="bottom-nav">
        <button class="nav-tab active" data-tab="dashboard">
          <span class="icon">🏠</span><span>Home</span>
        </button>
        <button class="nav-tab" data-tab="market">
          <span class="icon">📈</span><span>Market</span>
        </button>
        <button class="nav-tab" data-tab="assets">
          <span class="icon">🏢</span><span>Assets</span>
        </button>
        <button class="nav-tab" data-tab="business">
          <span class="icon">💼</span><span>Biz</span>
        </button>
        <button class="nav-tab" data-tab="bank">
          <span class="icon">🏦</span><span>Bank</span>
        </button>
        <button class="nav-tab" data-tab="life">
          <span class="icon">❤️</span><span>Life</span>
        </button>
      </nav>
      <div id="modal-container"></div>
    `,this.appEl.querySelectorAll(`.nav-tab`).forEach(e=>{e.addEventListener(`click`,e=>{let t=e.currentTarget.getAttribute(`data-tab`);this.setTab(t)})})}setTab(e){this.currentTab=e,this.appEl.querySelectorAll(`.nav-tab`).forEach(t=>{t.getAttribute(`data-tab`)===e?t.classList.add(`active`):t.classList.remove(`active`)}),this.renderActiveTab()}renderActiveTab(){let e=document.getElementById(`screen-container`);e.innerHTML=``;let t=(e,t)=>this.handleAction(e,t);switch(this.currentTab){case`dashboard`:e.appendChild(N(this.state,t));break;case`market`:e.appendChild(L(this.state,t));break;case`assets`:e.appendChild(R(this.state,t));break;case`business`:e.appendChild(z(this.state,t));break;case`bank`:e.appendChild(V(this.state,t));break;case`life`:e.appendChild(H(this.state,t))}}onDayTick(e){s(this.state),this.updateHeader(),this.renderActiveTab()}onRender(){this.updateHeader()}updateHeader(){let e=this.state.player,t=document.getElementById(`top-cash`),n=document.getElementById(`top-day`);t&&(t.innerText=j(e.money)),n&&(n.innerText=`Day ${e.currentDay}`);let r=(e,t,n)=>{let r=document.getElementById(e),i=document.getElementById(t),a=Math.round(Math.max(0,Math.min(100,n)));r&&(r.style.width=`${a}%`),i&&(i.innerText=`${a}%`)};r(`bar-physical`,`txt-physical`,e.health.physical),r(`bar-mental`,`txt-mental`,e.health.mental),r(`bar-energy`,`txt-energy`,e.health.energy)}handleAction(e,t){let n=document.getElementById(`modal-container`);switch(e){case`open-time-modal`:n.appendChild(W(this.state,()=>{n.innerHTML=``},e=>{this.state.player.timeAllocation=e,s(this.state),this.renderActiveTab()}));break;case`open-diet-modal`:n.appendChild(K(this.state,()=>{n.innerHTML=``},e=>{this.state.player.lifestyle.foodTier=e,s(this.state),this.renderActiveTab()}));break;case`trade-stock`:n.appendChild(q(this.state,t.tickerId,()=>{n.innerHTML=``},(e,n)=>{let r=this.state.market.tickers.find(e=>e.id===t.tickerId);if(e===`buy`){let e=n*r.price;this.state.player.money-=e;let t=this.state.player.portfolio[r.id]||{shares:0,avgCost:r.price},i=t.shares+n;t.avgCost=Math.round((t.shares*t.avgCost+e)/i*100)/100,t.shares=i,this.state.player.portfolio[r.id]=t,this.state.player.eventLog.unshift({day:this.state.player.currentDay,text:`Bought ${n} shares of ${r.name}`,type:`investment`})}else if(e===`sell`){let e=n*r.price;this.state.player.money+=e;let t=this.state.player.portfolio[r.id];t&&(t.shares-=n,t.shares<=0&&delete this.state.player.portfolio[r.id]),this.state.player.eventLog.unshift({day:this.state.player.currentDay,text:`Sold ${n} shares of ${r.name} for ${j(e)}`,type:`investment`})}else e===`sip`&&(this.state.player.sips.push({id:`sip-${Date.now()}`,tickerId:r.id,amountPerCycle:1e3,cycleDays:15,lastInvestedDay:this.state.player.currentDay,active:!0}),alert(`SIP created! ₹1,000 will be auto-invested into ${r.name} every 15 days.`));s(this.state),this.renderActiveTab()}));break;case`trade-gold`:if(t.action===`buy`){let e=prompt(`How many grams of 24K gold to purchase?`,`1`),t=parseInt(e||`0`,10);if(t>0){let e=t*this.state.market.goldPricePerGram;this.state.player.money>=e?(this.state.player.money-=e,this.state.player.goldHoldings.grams+=t,s(this.state),this.renderActiveTab()):alert(`Insufficient cash for gold purchase.`)}}else{let e=prompt(`How many grams of gold to sell? (You hold ${this.state.player.goldHoldings.grams}g)`,`1`),t=parseInt(e||`0`,10);if(t>0&&t<=this.state.player.goldHoldings.grams){let e=t*this.state.market.goldPricePerGram;this.state.player.money+=e,this.state.player.goldHoldings.grams-=t,s(this.state),this.renderActiveTab()}}break;case`buy-property`:let e=this.state.market.properties.find(e=>e.id===t.propertyId);e&&this.state.player.money>=e.price?confirm(`Acquire ${e.name} for ${j(e.price)}?`)&&(this.state.player.money-=e.price,e.owner=`player`,this.state.player.properties.push({id:e.id,purchasePrice:e.price,riskStatus:e.riskProfile.legalStatus,mortgage:null}),this.state.player.eventLog.unshift({day:this.state.player.currentDay,text:`Acquired property: ${e.name}`,type:`investment`}),s(this.state),this.renderActiveTab()):alert(`Insufficient funds to buy property outright!`);break;case`buy-lifestyle-asset`:let r=_.find(e=>e.id===t.assetId);r&&this.state.player.money>=r.price?confirm(`Purchase ${r.name} for ${j(r.price)}?`)&&(this.state.player.money-=r.price,this.state.player.lifestyleAssets.push({id:r.id,purchasePrice:r.price,currentValue:r.price,purchasedOnDay:this.state.player.currentDay,monthlyMaintenance:r.monthlyUpkeep}),r.id===`scooter`&&(this.state.player.lifestyle.transportMode=`scooter`),r.id===`car`&&(this.state.player.lifestyle.transportMode=`car`),r.id===`bicycle`&&(this.state.player.lifestyle.transportMode=`bicycle`),this.state.player.eventLog.unshift({day:this.state.player.currentDay,text:`Acquired asset: ${r.name}`,type:`investment`}),s(this.state),this.renderActiveTab()):alert(`Insufficient cash for this asset.`);break;case`claim-business-slot`:let i=this.state.market.businessSectors.find(e=>e.id===t.sectorId);if(i&&this.state.player.money>=i.startupCost){let e=i.slots.find(e=>e.owner===null);e&&confirm(`Launch venture in ${i.name} for ${j(i.startupCost)}?`)&&(this.state.player.money-=i.startupCost,e.owner=`player`,this.state.player.businesses.push({sectorId:i.id,slotId:e.id,startedDay:this.state.player.currentDay,cashInvested:i.startupCost}),this.state.player.eventLog.unshift({day:this.state.player.currentDay,text:`Started business in ${i.name}!`,type:`investment`}),s(this.state),this.renderActiveTab())}else alert(`Insufficient capital for starting this venture.`);break;case`deposit-savings`:let a=prompt(`Amount to deposit to savings (Cash: ${j(this.state.player.money)}):`,`1000`),o=parseInt(a||`0`,10);o>0&&this.state.player.money>=o&&(this.state.player.money-=o,this.state.player.savingsBalance+=o,s(this.state),this.renderActiveTab());break;case`withdraw-savings`:let c=prompt(`Amount to withdraw from savings (Balance: ${j(this.state.player.savingsBalance)}):`,`1000`),l=parseInt(c||`0`,10);l>0&&this.state.player.savingsBalance>=l&&(this.state.player.savingsBalance-=l,this.state.player.money+=l,s(this.state),this.renderActiveTab());break;case`open-loan-modal`:let u=prompt(`Enter requested loan amount (Max ₹1,00,000 at 12% APR):`,`25000`),d=parseInt(u||`0`,10);if(d>0&&d<=1e5){let e=Math.round(d/12+d*.01);this.state.player.money+=d,this.state.player.loans.push({id:`loan-${Date.now()}`,name:`Personal Credit ₹${d.toLocaleString(`en-IN`)}`,type:`personal`,principalRemaining:d,interestRate:.12,emiAmount:e,cycleDays:30,lastPaidDay:this.state.player.currentDay,missedPayments:0}),alert(`Approved! Added ${j(d)} to wallet. EMI: ${j(e)} / 30 days.`),s(this.state),this.renderActiveTab()}break;case`select-insurance-tier`:let f=t.tier;f===`none`?this.state.player.insurance.health={tier:`none`,premiumPerMonth:0,coveragePct:0}:f===`basic`?this.state.player.insurance.health={tier:`basic`,premiumPerMonth:500,coveragePct:.5}:f===`standard`?this.state.player.insurance.health={tier:`standard`,premiumPerMonth:1200,coveragePct:.8}:f===`premium`&&(this.state.player.insurance.health={tier:`premium`,premiumPerMonth:2500,coveragePct:.95}),s(this.state),this.renderActiveTab();break;case`switch-job`:let p=y.find(e=>e.id===t.jobId);p&&(this.state.player.job={id:p.id,title:p.title,salaryPerCycle:p.salaryPerCycle,payCycleDays:p.payCycleDays,stressPerDay:p.stressPerDay,timeSlotsCost:p.timeSlotsCost},this.state.player.eventLog.unshift({day:this.state.player.currentDay,text:`Started new job: ${p.title}`,type:`income`}),s(this.state),this.renderActiveTab());break;case`enroll-course`:let m=v.find(e=>e.id===t.courseId);m&&this.state.player.money>=m.fee?(this.state.player.money-=m.fee,this.state.player.educationProgress[m.id]=100,this.state.player.eventLog.unshift({day:this.state.player.currentDay,text:`Earned certification in ${m.name}`,type:`achievement`}),s(this.state),this.renderActiveTab()):alert(`Insufficient funds for enrollment fee.`)}}};window.addEventListener(`DOMContentLoaded`,()=>{new J});