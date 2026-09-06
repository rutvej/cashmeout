var B=Object.defineProperty;var H=(s,t,e)=>t in s?B(s,t,{enumerable:!0,configurable:!0,writable:!0,value:e}):s[t]=e;var C=(s,t,e)=>H(s,typeof t!="symbol"?t+"":t,e);(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))a(i);new MutationObserver(i=>{for(const n of i)if(n.type==="childList")for(const l of n.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&a(l)}).observe(document,{childList:!0,subtree:!0});function e(i){const n={};return i.integrity&&(n.integrity=i.integrity),i.referrerPolicy&&(n.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?n.credentials="include":i.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function a(i){if(i.ep)return;i.ep=!0;const n=e(i);fetch(i.href,n)}})();const j=[{id:"ORFOOD",name:"Orion Foods Co.",sector:"consumer",price:124,trendBias:.002,volatility:.04,dividendYieldPct:.02,history:[120,122,124]},{id:"LUXBEV",name:"Luxe Beverages",sector:"consumer",price:86,trendBias:.001,volatility:.06,dividendYieldPct:.015,history:[88,85,86]},{id:"NXTECH",name:"NexGen Technologies",sector:"tech",price:340,trendBias:.004,volatility:.09,dividendYieldPct:0,history:[320,335,340]},{id:"CLDNET",name:"CloudNet Solutions",sector:"tech",price:210,trendBias:.003,volatility:.08,dividendYieldPct:0,history:[200,205,210]},{id:"SOLPWR",name:"SolarPower India",sector:"energy",price:175,trendBias:.002,volatility:.07,dividendYieldPct:.025,history:[170,172,175]},{id:"GRNFUEL",name:"GreenFuel Corp.",sector:"energy",price:92,trendBias:.001,volatility:.08,dividendYieldPct:.01,history:[90,91,92]},{id:"STBANK",name:"Sterling Bank Ltd.",sector:"finance",price:540,trendBias:.001,volatility:.03,dividendYieldPct:.03,history:[530,538,540]},{id:"INSFIN",name:"InsureFirst Finance",sector:"finance",price:158,trendBias:.002,volatility:.05,dividendYieldPct:.02,history:[154,156,158]}],O=[{id:"prop-01",name:"1BHK Sector 18",location:"Sector 18",price:65e3,rentYieldPct:5,appreciationPct:2.5,owner:null,riskProfile:{legalStatus:"clear",issueChancePct:5,issueCost:1e4}},{id:"prop-02",name:"Studio Old Town",location:"Old Town",price:5e4,rentYieldPct:5.5,appreciationPct:2,owner:null,riskProfile:{legalStatus:"clear",issueChancePct:5,issueCost:8e3}},{id:"prop-03",name:"2BHK Greenfield",location:"Greenfield",price:25e4,rentYieldPct:4.2,appreciationPct:3,owner:null,riskProfile:{legalStatus:"clear",issueChancePct:5,issueCost:2e4}},{id:"prop-04",name:"Plot Old Highway",location:"Old Highway",price:35e3,rentYieldPct:6.5,appreciationPct:4,owner:null,riskProfile:{legalStatus:"minor-dispute",issueChancePct:25,issueCost:25e3}},{id:"prop-05",name:"3BHK MG Road",location:"MG Road",price:5e5,rentYieldPct:3.5,appreciationPct:4,owner:null,riskProfile:{legalStatus:"clear",issueChancePct:5,issueCost:4e4}},{id:"prop-06",name:"Penthouse Skyline",location:"Skyline Towers",price:12e5,rentYieldPct:3,appreciationPct:5,owner:null,riskProfile:{legalStatus:"clear",issueChancePct:5,issueCost:75e3}},{id:"prop-07",name:"Villa Palm Estate",location:"Palm Estate",price:2e6,rentYieldPct:2.5,appreciationPct:6,owner:null,riskProfile:{legalStatus:"clear",issueChancePct:5,issueCost:1e5}}],F=[{id:"food-cart",name:"Food Cart",capacity:3,startupCost:5e3,baseRevenuePerCycle:3e3,slotUpkeepPerCycle:500,revenueCycleDays:30,slots:[{id:"fc-1",owner:"npc-1"},{id:"fc-2",owner:null},{id:"fc-3",owner:null}]},{id:"tutoring",name:"Tutoring Center",capacity:3,startupCost:8e3,baseRevenuePerCycle:4500,slotUpkeepPerCycle:800,revenueCycleDays:30,slots:[{id:"tc-1",owner:null},{id:"tc-2",owner:null},{id:"tc-3",owner:null}]},{id:"retail-shop",name:"Retail Shop",capacity:4,startupCost:15e3,baseRevenuePerCycle:8e3,slotUpkeepPerCycle:1500,revenueCycleDays:30,slots:[{id:"rs-1",owner:"npc-4"},{id:"rs-2",owner:null},{id:"rs-3",owner:null},{id:"rs-4",owner:null}]},{id:"delivery",name:"Delivery Service",capacity:3,startupCost:12e3,baseRevenuePerCycle:6e3,slotUpkeepPerCycle:1200,revenueCycleDays:30,slots:[{id:"ds-1",owner:null},{id:"ds-2",owner:null},{id:"ds-3",owner:null}]},{id:"tech-startup",name:"Tech Startup",capacity:2,startupCost:5e4,baseRevenuePerCycle:25e3,slotUpkeepPerCycle:5e3,revenueCycleDays:30,slots:[{id:"ts-1",owner:null},{id:"ts-2",owner:null}]},{id:"banking",name:"Banking & Micro-Lending",capacity:2,startupCost:5e5,baseRevenuePerCycle:45e3,slotUpkeepPerCycle:12e3,revenueCycleDays:30,specialMechanic:"lending",slots:[{id:"bk-1",owner:null},{id:"bk-2",owner:null}]}],G=[{id:"npc-1",name:"Aarav Sharma",archetype:"serial-entrepreneur",money:18e3,portfolio:{},properties:[],businesses:[{sectorId:"food-cart",slotId:"fc-1"}],loans:[],decisionLog:[]},{id:"npc-2",name:"Priya Mehta",archetype:"aggressive-investor",money:25e3,portfolio:{NXTECH:{shares:30,avgCost:330}},properties:[],businesses:[],loans:[],decisionLog:[]},{id:"npc-3",name:"Vikram Verma",archetype:"cautious-saver",money:45e3,portfolio:{},properties:[],businesses:[],loans:[],decisionLog:[]},{id:"npc-4",name:"Ananya Iyer",archetype:"serial-entrepreneur",money:22e3,portfolio:{},properties:[],businesses:[{sectorId:"retail-shop",slotId:"rs-1"}],loans:[],decisionLog:[]},{id:"npc-5",name:"Rohan Gupta",archetype:"landlord",money:75e3,portfolio:{},properties:[],businesses:[],loans:[],decisionLog:[]},{id:"npc-6",name:"Sneha Patel",archetype:"aggressive-investor",money:3e4,portfolio:{STBANK:{shares:25,avgCost:535}},properties:[],businesses:[],loans:[],decisionLog:[]},{id:"npc-7",name:"Kabir Das",archetype:"cautious-saver",money:35e3,portfolio:{},properties:[],businesses:[],loans:[],decisionLog:[]},{id:"npc-8",name:"Neha Joshi",archetype:"landlord",money:8e4,portfolio:{},properties:[],businesses:[],loans:[],decisionLog:[]}];function D(s=42){return{schemaVersion:1,gameSeed:s,inflationMultiplier:1,inflationRate:.06,player:{id:"player",name:"Player",money:15e3,savingsBalance:5e3,currentDay:1,job:{id:"junior-analyst",title:"Junior Analyst",salaryPerCycle:2800,payCycleDays:15,stressPerDay:.8,timeSlotsCost:2},housing:{type:"rent",amountPerCycle:800,cycleDays:30,lastPaidDay:1},health:{physical:85,mental:80,energy:75},consequenceMeters:{cheapFoodDays:0,noExerciseDays:0,highStressDays:0,lowEnergyDays:0,noRestDays:0,unhealthyDays:0},timeAllocation:{job:2,commute:1,exercise:1,cooking:0,sideHustle:0,education:0,rest:1,free:1},lifestyle:{foodTier:"street",transportMode:"walk"},loans:[],fixedDeposits:[],sips:[],insurance:{health:{tier:"none",premiumPerMonth:0,coveragePct:0},vehicle:{active:!1,premiumPerMonth:0},property:{active:!1,premiumPerMonth:0},life:{active:!1,premiumPerMonth:0}},taxes:{lastPaidDay:1,cycleDays:360,incomeThisCycle:0,capitalGainsThisCycle:0,dividendIncomeThisCycle:0},portfolio:{},goldHoldings:{grams:0,avgCostPerGram:0},properties:[],businesses:[],lifestyleAssets:[],family:{married:!1,marriedOnDay:null,spouseIncome:0,children:0,childBornOnDays:[]},stats:{stress:15,happiness:70},eventLog:[{day:1,text:"Welcome to Cashflow! Balance your money, time, and health.",type:"event"}],achievements:[],educationProgress:{},lastActiveTimestamp:Date.now()},npcs:G,market:{tickers:j,goldPricePerGram:6500,goldHistory:[6420,6460,6500],cycleBias:0,properties:O,businessSectors:F}}}const T="cashflow_state_save_v2";function Y(){try{const s=localStorage.getItem(T);if(!s){const e=D();return v(e),e}const t=JSON.parse(s);if(!t.schemaVersion||t.schemaVersion<1){const e=D();return v(e),e}return t}catch(s){console.error("Failed to parse save file, creating new game",s);const t=D();return v(t),t}}function v(s){try{s.player.lastActiveTimestamp=Date.now(),localStorage.setItem(T,JSON.stringify(s))}catch(t){console.error("Save failed",t)}}function U(s){v(s);const t=new Blob([JSON.stringify(s,null,2)],{type:"application/json"}),e=URL.createObjectURL(t),a=document.createElement("a");a.href=e,a.download=`cashflow-save-day${s.player.currentDay}-${Date.now()}.json`,a.click(),URL.revokeObjectURL(e)}function _(){localStorage.removeItem(T);const s=D();return v(s),s}class W{constructor(t){C(this,"state");this.state=t||123456789}next(){this.state|=0,this.state=this.state+1831565813|0;let t=Math.imul(this.state^this.state>>>15,1|this.state);return t=t+Math.imul(t^t>>>7,61|t)^t,((t^t>>>14)>>>0)/4294967296}range(t,e){return t+this.next()*(e-t)}intRange(t,e){return Math.floor(this.range(t,e+1))}}const L=2*60*1e3,V=45;function K(s,t=Date.now()){return!s||s>t?0:Math.floor((t-s)/L)}function J(s){return s<=0?{mode:"none",days:0}:s<=V?{mode:"fast-sim",days:s}:{mode:"aggregate",days:s}}function X(s,t){const e=[],a=s.player,i=Math.floor(t/a.job.payCycleDays),n=i*a.job.salaryPerCycle;a.money+=n,a.taxes.incomeThisCycle+=n;const r=Math.floor(t/a.housing.cycleDays)*a.housing.amountPerCycle;a.money-=r;const d=150*s.inflationMultiplier,c=Math.round(d*t);a.money=Math.max(0,a.money-c);const o=Math.round(a.savingsBalance*(.035/360)*t);return a.savingsBalance+=o,s.inflationMultiplier*=Math.pow(1+s.inflationRate/360,t),a.currentDay+=t,a.lastActiveTimestamp=Date.now(),e.push(`Simulated ${t} days in aggregate mode.`),e.push(`Earned ₹${n.toLocaleString("en-IN")} in salary over ${i} cycles.`),e.push(`Paid ₹${r.toLocaleString("en-IN")} in rent and approx ₹${c.toLocaleString("en-IN")} in living expenses.`),e.push(`Savings earned ₹${o.toLocaleString("en-IN")} in interest.`),e}const E={street:{id:"street",name:"Street Food",costPerDay:50,physicalDelta:-1.2,mentalDelta:-.2,requiresCookingSlot:!1,requiresCookingEquipment:!1,description:"Cheap & fast (₹50/day), but hurts health over time."},basic:{id:"basic",name:"Basic Home Cooking",costPerDay:90,physicalDelta:.2,mentalDelta:.1,requiresCookingSlot:!0,requiresCookingEquipment:!1,description:"Balanced & economical (₹90/day). Needs 1 cooking slot."},"home-cooked":{id:"home-cooked",name:"Nutritious Meal Prep",costPerDay:140,physicalDelta:1.2,mentalDelta:.6,requiresCookingSlot:!0,requiresCookingEquipment:!0,description:"High nutrition (₹140/day). Needs cooking slot + equipment."},restaurant:{id:"restaurant",name:"Healthy Meal Delivery",costPerDay:280,physicalDelta:.8,mentalDelta:.8,requiresCookingSlot:!1,requiresCookingEquipment:!1,description:"Premium dining (₹280/day). Saves time, good health."}},z={walk:{id:"walk",name:"Walk / Public Transit",dailyCost:20,commuteSlotsNeeded:1,stressPerDay:1.5,description:"Takes 1 time slot, high daily commute fatigue."},bicycle:{id:"bicycle",name:"Bicycle",dailyCost:0,commuteSlotsNeeded:1,stressPerDay:.4,description:"Zero fuel, good cardio, low stress commute."},scooter:{id:"scooter",name:"Motor Scooter",dailyCost:40,commuteSlotsNeeded:0,stressPerDay:.5,description:"Eliminates commute slot entirely! Saves 1 slot daily."},car:{id:"car",name:"Personal Car",dailyCost:150,commuteSlotsNeeded:0,stressPerDay:-.5,description:"Eliminates commute slot, high comfort & happiness boost."}},N=[{id:"bicycle",name:"Commuter Bicycle",price:5e3,depreciationPerYear:.05,monthlyUpkeep:0,description:"Enables Bicycle transport mode."},{id:"scooter",name:"City Scooter (125cc)",price:75e3,depreciationPerYear:.12,monthlyUpkeep:600,description:"Enables Scooter transport mode (frees commute slot)."},{id:"car",name:"Sedan Car",price:55e4,depreciationPerYear:.15,monthlyUpkeep:3500,description:"Enables Car transport mode (+comfort, status, time saving)."},{id:"laptop",name:"Workstation Laptop",price:6e4,depreciationPerYear:.25,monthlyUpkeep:0,description:"Enables high-paying freelance tech side hustles (2x income)."},{id:"cooking-equipment",name:"Gourmet Kitchen Set",price:12e3,depreciationPerYear:.05,monthlyUpkeep:0,description:"Unlocks Nutritious Meal Prep food tier."},{id:"gym-membership",name:"Annual Gym Pass",price:18e3,depreciationPerYear:1,monthlyUpkeep:0,description:"Doubles physical health gains from exercise time slots."}],A=[{id:"financial-modeling",name:"Financial Modeling & Valuation",fee:15e3,slotsRequired:20,description:"Unlocks Senior Analyst & Investment roles."},{id:"fullstack-dev",name:"Full-Stack Software Engineering",fee:35e3,slotsRequired:35,description:"Unlocks Tech Lead positions & high side hustle yield."},{id:"executive-mba",name:"Executive MBA",fee:12e4,slotsRequired:60,description:"Required for Executive Director & VP jobs."}],R=[{id:"junior-analyst",title:"Junior Analyst",salaryPerCycle:2800,payCycleDays:15,stressPerDay:.8,timeSlotsCost:2},{id:"content-writer",title:"Content Specialist",salaryPerCycle:2400,payCycleDays:15,stressPerDay:.5,timeSlotsCost:2},{id:"senior-analyst",title:"Senior Financial Analyst",salaryPerCycle:6500,payCycleDays:15,stressPerDay:1.6,timeSlotsCost:2,requiredCourse:"financial-modeling"},{id:"software-engineer",title:"Software Engineer",salaryPerCycle:8e3,payCycleDays:15,stressPerDay:1.8,timeSlotsCost:2,requiredCourse:"fullstack-dev"},{id:"director-ops",title:"Director of Operations",salaryPerCycle:19e3,payCycleDays:15,stressPerDay:2.8,timeSlotsCost:3,requiredCourse:"executive-mba",requiredMinNetWorth:5e5}];function Z(s){const t=s.player;let e=t.money+t.savingsBalance;for(const[a,i]of Object.entries(t.portfolio)){const n=s.market.tickers.find(l=>l.id===a);n&&(e+=i.shares*n.price)}e+=t.goldHoldings.grams*s.market.goldPricePerGram;for(const a of t.properties){const i=s.market.properties.find(n=>n.id===a.id);i&&(e+=i.price)}for(const a of t.lifestyleAssets)e+=a.currentValue;for(const a of t.loans)e-=a.principalRemaining;return Math.round(e)}function Q(s){const t=s.player,e=E[t.lifestyle.foodTier],a=z[t.lifestyle.transportMode],l=e.costPerDay+a.dailyCost+60+30,r=Math.round(l*s.inflationMultiplier);return t.money-=r,r}function ee(s,t){const e=s.player;if(Q(s),t%e.job.payCycleDays===0){const i=e.stats.stress>80?.85:e.stats.stress>60?.95:1,n=Math.round(e.job.salaryPerCycle*i);e.money+=n,e.taxes.incomeThisCycle+=n,e.eventLog.unshift({day:t,text:`Payday: Received ₹${n.toLocaleString("en-IN")} ${i<1?"(reduced by stress)":""}`,type:"income"})}if(e.family.married&&t%e.job.payCycleDays===0&&(e.money+=e.family.spouseIncome,e.taxes.incomeThisCycle+=e.family.spouseIncome),e.housing.type==="rent"&&t-e.housing.lastPaidDay>=e.housing.cycleDays){const i=Math.round(e.housing.amountPerCycle*s.inflationMultiplier);e.money-=i,e.housing.lastPaidDay=t,e.eventLog.unshift({day:t,text:`Rent deduction: Paid ₹${i.toLocaleString("en-IN")}`,type:"expense"})}for(const i of e.loans)if(t-i.lastPaidDay>=i.cycleDays)if(e.money>=i.emiAmount){e.money-=i.emiAmount;const n=i.principalRemaining*(i.interestRate/12),l=Math.max(0,i.emiAmount-n);i.principalRemaining=Math.max(0,i.principalRemaining-l),i.lastPaidDay=t}else i.missedPayments++,i.principalRemaining=Math.round(i.principalRemaining*(1+(i.interestRate+.04)/12)),e.stats.stress=Math.min(100,e.stats.stress+12),e.health.mental=Math.max(0,e.health.mental-8),e.eventLog.unshift({day:t,text:`⚠️ Missed EMI on ${i.name}! Penal interest compounded to ₹${i.principalRemaining.toLocaleString("en-IN")}`,type:"expense"});if(e.loans=e.loans.filter(i=>i.principalRemaining>0),t-e.taxes.lastPaidDay>=e.taxes.cycleDays){const i=e.taxes.incomeThisCycle+e.taxes.capitalGainsThisCycle+e.taxes.dividendIncomeThisCycle,n=te(i);e.money-=n,e.taxes.lastPaidDay=t,e.taxes.incomeThisCycle=0,e.taxes.capitalGainsThisCycle=0,e.taxes.dividendIncomeThisCycle=0,n>0&&e.eventLog.unshift({day:t,text:`Annual Tax Assessment: Deducted ₹${n.toLocaleString("en-IN")}`,type:"expense"})}const a=e.savingsBalance*(.035/360);if(e.savingsBalance+=a,t%30===0){const i=e.insurance,n=i.health.premiumPerMonth+i.vehicle.premiumPerMonth+i.property.premiumPerMonth+i.life.premiumPerMonth;n>0&&(e.money-=n,e.eventLog.unshift({day:t,text:`Insurance policy premiums paid: ₹${n.toLocaleString("en-IN")}`,type:"expense"}))}t%30===0&&(s.inflationMultiplier*=1+s.inflationRate/12)}function te(s){return s<=25e4?0:s<=5e5?Math.round((s-25e4)*.05):s<=1e6?Math.round(12500+(s-5e5)*.2):Math.round(112500+(s-1e6)*.3)}function se(s,t){const e=s.player,a=E[e.lifestyle.foodTier],i=z[e.lifestyle.transportMode];let n=a.physicalDelta;const l=e.lifestyleAssets.some(p=>p.id==="gym-membership");e.timeAllocation.exercise>0?n+=e.timeAllocation.exercise*(l?2.5:1.4):n-=.4;let r=e.job.stressPerDay+i.stressPerDay;e.timeAllocation.rest>0&&(r-=e.timeAllocation.rest*2),e.timeAllocation.free>0&&(r-=e.timeAllocation.free*1.5),r+=e.timeAllocation.sideHustle*1.5,e.stats.stress=Math.max(0,Math.min(100,e.stats.stress+r));const d=(r<0?1:-.8)+e.timeAllocation.free*.5;e.health.mental=Math.max(0,Math.min(100,e.health.mental+d));let c=-.5;e.timeAllocation.rest>0&&(c+=e.timeAllocation.rest*3.5),e.timeAllocation.sideHustle>0&&(c-=e.timeAllocation.sideHustle*2),e.timeAllocation.job>2&&(c-=2),e.health.energy=Math.max(0,Math.min(100,e.health.energy+c)),e.health.physical=Math.max(0,Math.min(100,e.health.physical+n)),e.lifestyle.foodTier==="street"?e.consequenceMeters.cheapFoodDays++:e.consequenceMeters.cheapFoodDays=Math.max(0,e.consequenceMeters.cheapFoodDays-1),e.timeAllocation.exercise===0?e.consequenceMeters.noExerciseDays++:e.consequenceMeters.noExerciseDays=Math.max(0,e.consequenceMeters.noExerciseDays-2),e.stats.stress>70?e.consequenceMeters.highStressDays++:e.consequenceMeters.highStressDays=Math.max(0,e.consequenceMeters.highStressDays-1),e.health.energy<25?e.consequenceMeters.lowEnergyDays++:e.consequenceMeters.lowEnergyDays=0,e.health.physical<30?e.consequenceMeters.unhealthyDays++:e.consequenceMeters.unhealthyDays=0;let o={triggered:!1};return e.consequenceMeters.cheapFoodDays>=20?(e.consequenceMeters.cheapFoodDays=0,o=$(s,t,"Acute Gastroenteritis (Street Food Streak)",3500,-18)):e.consequenceMeters.noExerciseDays>=35?(e.consequenceMeters.noExerciseDays=0,o=$(s,t,"Severe Lumbar Spasm (Sedentary Strain)",5500,-15)):e.consequenceMeters.highStressDays>=25?(e.consequenceMeters.highStressDays=0,o=$(s,t,"Chronic Anxiety & Panic Episode",7e3,-25)):e.consequenceMeters.lowEnergyDays>=15?(e.consequenceMeters.lowEnergyDays=0,o=$(s,t,"Adrenal Burnout & Exhaustion",4e3,-15)):e.consequenceMeters.unhealthyDays>=18&&(e.consequenceMeters.unhealthyDays=0,o=$(s,t,"Emergency Hospitalization (Immune Crash)",25e3,-35)),o}function $(s,t,e,a,i){const n=s.player,l=n.insurance.health.coveragePct,r=Math.round(a*(1-l));n.money=Math.max(0,n.money-r),n.health.physical=Math.max(0,n.health.physical+i),n.stats.stress=Math.min(100,n.stats.stress+15);const d=l>0?`Health insurance covered ${(l*100).toFixed(0)}%! Out-of-pocket: ₹${r.toLocaleString("en-IN")}`:`No health insurance: paid full ₹${a.toLocaleString("en-IN")}!`;return n.eventLog.unshift({day:t,text:`🩺 Medical Emergency: ${e}. ${d}`,type:"event"}),{triggered:!0,name:e,medicalBill:a,outOfPocketCost:r,description:d}}function ie(s,t,e){const a=s.market;a.cycleBias=.005*Math.sin(2*Math.PI*t/180);for(const r of a.tickers){const d=e.range(-r.volatility,r.volatility),c=r.trendBias+a.cycleBias+d,o=Math.max(2,Math.round(r.price*(1+c)*100)/100);if(r.price=o,r.history.push(o),r.history.length>60&&r.history.shift(),t%90===0&&r.dividendYieldPct>0){const p=Math.round(r.price*r.dividendYieldPct/4*100)/100;r.dividendPerShare=p;const u=s.player.portfolio[r.id];if(u&&u.shares>0){const f=Math.round(u.shares*p);s.player.money+=f,s.player.taxes.dividendIncomeThisCycle+=f,s.player.eventLog.unshift({day:t,text:`Dividend Payout: Received ₹${f.toLocaleString("en-IN")} from ${u.shares} shares of ${r.name}`,type:"income"})}}}const i=e.range(-.015,.015),n=-a.cycleBias*.8,l=Math.max(1e3,Math.round(a.goldPricePerGram*(1+5e-4+n+i)));a.goldPricePerGram=l,a.goldHistory.push(l),a.goldHistory.length>60&&a.goldHistory.shift();for(const r of s.player.sips)if(r.active&&t-r.lastInvestedDay>=r.cycleDays){const d=a.tickers.find(c=>c.id===r.tickerId);if(d&&s.player.money>=r.amountPerCycle){const c=Math.floor(r.amountPerCycle/d.price);if(c>0){const o=c*d.price;s.player.money-=o;const p=s.player.portfolio[d.id]||{shares:0,avgCost:0},u=p.shares+c,f=p.shares*p.avgCost+o;p.shares=u,p.avgCost=Math.round(f/u*100)/100,s.player.portfolio[d.id]=p,r.lastInvestedDay=t,s.player.eventLog.unshift({day:t,text:`SIP Auto-Invest: Bought ${c} shs of ${d.name} for ₹${Math.round(o).toLocaleString("en-IN")}`,type:"investment"})}}}for(const r of a.properties){const d=r.appreciationPct/100/360;if(r.price=Math.round(r.price*(1+d)),t%30===0&&r.owner){const c=Math.round(r.price*(r.rentYieldPct/100/12));if(r.owner==="player")s.player.money+=c,s.player.taxes.incomeThisCycle+=c,s.player.eventLog.unshift({day:t,text:`Rental Income: Collected ₹${c.toLocaleString("en-IN")} from ${r.name}`,type:"income"});else{const o=s.npcs.find(p=>p.id===r.owner);o&&(o.money+=c)}}}for(const r of a.businessSectors)if(t%r.revenueCycleDays===0){const d=r.slots.filter(c=>c.owner!==null);if(d.length>0){const c=r.baseRevenuePerCycle/Math.pow(d.length,.7),o=Math.round(c-r.slotUpkeepPerCycle);for(const p of d)if(p.owner==="player")s.player.money+=o,o>0&&(s.player.taxes.incomeThisCycle+=o),s.player.eventLog.unshift({day:t,text:`Business Yield (${r.name}): ${o>=0?"+":""}₹${o.toLocaleString("en-IN")} net profit`,type:o>=0?"income":"expense"});else{const u=s.npcs.find(f=>f.id===p.owner);u&&(u.money+=o)}}}}function ne(s,t,e){for(const a of s.npcs)ae(a,s,t,e)}function ae(s,t,e,a){if(e%3!==s.name.length%3)return;const i=a.next();switch(s.archetype){case"aggressive-investor":{if(s.money>5e3&&i<.65){const l=[...t.market.tickers].sort((r,d)=>{const c=(r.history[r.history.length-1]||r.price)-(r.history[0]||r.price);return(d.history[d.history.length-1]||d.price)-(d.history[0]||d.price)-c})[0];if(l){const r=Math.min(s.money*.7,12e3),d=Math.floor(r/l.price);if(d>0){s.money-=d*l.price;const c=s.portfolio[l.id]||{shares:0,avgCost:l.price};c.shares+=d,s.portfolio[l.id]=c,w(s,e,"Bought",`${d} shares of ${l.name} at ₹${l.price}`)}}}else if(i>.85){const n=Object.keys(s.portfolio);if(n.length>0){const l=n[a.intRange(0,n.length-1)],r=s.portfolio[l],d=t.market.tickers.find(c=>c.id===l);if(r&&d&&r.shares>0){const c=Math.max(1,Math.floor(r.shares*.5));s.money+=c*d.price,r.shares-=c,r.shares<=0&&delete s.portfolio[l],w(s,e,"Sold",`${c} shares of ${d.name} for cash`)}}}break}case"serial-entrepreneur":{if(s.money>6e3&&i<.5)for(const n of t.market.businessSectors){if(n.specialMechanic==="lending")continue;const l=n.slots.find(r=>r.owner===null);if(l&&s.money>=n.startupCost){s.money-=n.startupCost,l.owner=s.id,s.businesses.push({sectorId:n.id,slotId:l.id}),w(s,e,"Started Business",`Claimed slot in ${n.name} for ₹${n.startupCost.toLocaleString("en-IN")}`);break}}break}case"landlord":{if(i<.4){const n=t.market.properties.filter(l=>l.owner===null);for(const l of n)if(s.money>=l.price*.4){l.owner=s.id,s.properties.push(l.id),s.money=Math.max(0,s.money-l.price*.5),w(s,e,"Acquired Property",`Bought ${l.name} in ${l.location}`);break}}break}case"cautious-saver":{if(s.money>1e4&&i<.4){const n=Math.floor(s.money*.3/t.market.goldPricePerGram);if(n>0){const l=n*t.market.goldPricePerGram;s.money-=l,w(s,e,"Bought Gold",`Secured ${n}g of 24K gold as safe reserve`)}}break}}}function w(s,t,e,a){s.decisionLog.unshift({day:t,action:e,detail:a}),s.decisionLog.length>20&&s.decisionLog.pop()}class re{constructor(t,e,a){C(this,"state");C(this,"rng");C(this,"lastFrameTime",0);C(this,"accumulatedMs",0);C(this,"isRunning",!1);C(this,"onRenderCallback");C(this,"onDayTickCallback");this.state=t,this.rng=new W(t.gameSeed+t.player.currentDay),this.onDayTickCallback=e,this.onRenderCallback=a}start(){this.isRunning||(this.isRunning=!0,this.lastFrameTime=performance.now(),requestAnimationFrame(t=>this.frame(t)))}stop(){this.isRunning=!1}simulateSingleDay(){const t=this.state.player.currentDay+1;this.state.player.currentDay=t,this.state.player.lastActiveTimestamp=Date.now();const e=this.state.player;if(e.timeAllocation.sideHustle>0){const a=e.lifestyleAssets.some(n=>n.id==="laptop"),i=e.timeAllocation.sideHustle*(a?500:250);e.money+=i,e.taxes.incomeThisCycle+=i}se(this.state,t),ee(this.state,t),ie(this.state,t,this.rng),ne(this.state,t,this.rng),this.checkAchievements(),this.onDayTickCallback(t)}frame(t){if(!this.isRunning)return;const e=t-this.lastFrameTime;for(this.lastFrameTime=t,this.accumulatedMs+=e;this.accumulatedMs>=L;)this.accumulatedMs-=L,this.simulateSingleDay();this.onRenderCallback(),requestAnimationFrame(a=>this.frame(a))}checkAchievements(){const t=this.state.player,e=(a,i)=>{t.achievements.includes(a)||(t.achievements.push(a),t.eventLog.unshift({day:t.currentDay,text:`🏆 Achievement Unlocked: ${i}!`,type:"achievement"}))};t.money>=1e5&&e("first-lakh","Lakhpati (₹1 Lakh liquid cash)"),t.properties.length>=1&&e("first-property","Property Owner"),t.businesses.length>=1&&e("entrepreneur","Business Mogul"),t.health.physical>=95&&t.health.mental>=95&&e("peak-health","Peak Performance (95+ Health)"),t.consequenceMeters.cheapFoodDays>=18&&e("gut-of-steel","Living on the Edge (18+ Street Food Days)")}}function m(s){const t=s<0,e=Math.abs(s);let a="";return e>=1e7?a=`₹${(e/1e7).toFixed(2)} Cr`:e>=1e5?a=`₹${(e/1e5).toFixed(2)} L`:a=`₹${Math.round(e).toLocaleString("en-IN")}`,t?`-${a}`:a}function oe(s){return`${s>=0?"+":""}${(s*100).toFixed(1)}%`}function le(s,t){var p,u;const e=s.player,a=Z(s),i=document.createElement("div");i.className="screen-content",i.style.display="flex",i.style.flexDirection="column",i.style.gap="14px";const n=document.createElement("div");n.className="card",n.innerHTML=`
    <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Estimated Net Worth</div>
    <div style="font-size: 1.8rem; font-weight: 800; color: #38bdf8;">${m(a)}</div>
    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-top: 6px;">
      <div style="background: #0b0f19; padding: 8px; border-radius: 8px; border: 1px solid #1a2336;">
        <div style="font-size: 0.65rem; color: var(--text-muted);">Liquid Wallet</div>
        <div style="font-weight: 700; color: var(--accent-green); font-size: 1rem;">${m(e.money)}</div>
      </div>
      <div style="background: #0b0f19; padding: 8px; border-radius: 8px; border: 1px solid #1a2336;">
        <div style="font-size: 0.65rem; color: var(--text-muted);">Bank Savings (3.5%)</div>
        <div style="font-weight: 700; color: #38bdf8; font-size: 1rem;">${m(e.savingsBalance)}</div>
      </div>
    </div>
  `,i.appendChild(n);const l=document.createElement("div");l.className="card",l.innerHTML=`
    <div class="card-title">
      <span>Daily Schedule (6 Time Slots)</span>
      <button class="btn btn-primary" id="btn-reallocate-time" style="font-size: 0.7rem; padding: 4px 8px;">Reallocate</button>
    </div>
    <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 4px;">How your 24 hours are divided today:</div>
    <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 4px; text-align: center;">
      ${ce(e.timeAllocation)}
    </div>
  `,i.appendChild(l);const r=document.createElement("div");r.className="card";const d=E[e.lifestyle.foodTier];r.innerHTML=`
    <div class="card-title">
      <span>Active Occupation & Diet</span>
    </div>
    <div style="display: flex; justify-content: space-between; align-items: center; background: #0b0f19; padding: 10px; border-radius: 8px;">
      <div>
        <div style="font-weight: 700; font-size: 0.9rem;">${e.job.title}</div>
        <div style="font-size: 0.75rem; color: var(--text-muted);">Salary: ${m(e.job.salaryPerCycle)} / ${e.job.payCycleDays} days</div>
      </div>
      <span class="badge badge-green">Level 1</span>
    </div>
    <div style="display: flex; justify-content: space-between; align-items: center; background: #0b0f19; padding: 10px; border-radius: 8px;">
      <div>
        <div style="font-weight: 700; font-size: 0.9rem;">Diet: ${d.name}</div>
        <div style="font-size: 0.75rem; color: var(--text-muted);">Cost: ${m(d.costPerDay)}/day • ${d.physicalDelta>=0?"+":""}${d.physicalDelta} health/day</div>
      </div>
      <button class="btn" id="btn-change-diet" style="font-size: 0.7rem; padding: 4px 8px;">Change</button>
    </div>
  `,i.appendChild(r);const c=document.createElement("div");c.className="ad-slot-placeholder",c.innerText="— Sponsored Partner Ad Slot —",i.appendChild(c);const o=document.createElement("div");return o.className="card",o.innerHTML=`
    <div class="card-title">
      <span>Life & Financial Journal</span>
      <span style="font-size: 0.7rem; color: var(--text-muted);">Live stream</span>
    </div>
    <div style="display: flex; flex-direction: column; gap: 8px; max-height: 220px; overflow-y: auto;">
      ${e.eventLog.slice(0,10).map(f=>`
        <div style="font-size: 0.75rem; padding: 6px 8px; background: #0b0f19; border-left: 3px solid ${de(f.type)}; border-radius: 4px;">
          <span style="color: var(--text-muted); font-size: 0.65rem; margin-right: 6px;">Day ${f.day}</span>
          <span>${f.text}</span>
        </div>
      `).join("")}
    </div>
  `,i.appendChild(o),(p=l.querySelector("#btn-reallocate-time"))==null||p.addEventListener("click",()=>{t("open-time-modal")}),(u=r.querySelector("#btn-change-diet"))==null||u.addEventListener("click",()=>{t("open-diet-modal")}),i}function ce(s){const t=[];for(let e=0;e<s.job;e++)t.push({name:"Job",color:"#0284c7",icon:"💼"});for(let e=0;e<s.commute;e++)t.push({name:"Commute",color:"#64748b",icon:"🚗"});for(let e=0;e<s.exercise;e++)t.push({name:"Workout",color:"#22c55e",icon:"🏋️"});for(let e=0;e<s.cooking;e++)t.push({name:"Cook",color:"#f97316",icon:"🍳"});for(let e=0;e<s.sideHustle;e++)t.push({name:"Hustle",color:"#eab308",icon:"💻"});for(let e=0;e<s.education;e++)t.push({name:"Study",color:"#a855f7",icon:"📚"});for(let e=0;e<s.rest;e++)t.push({name:"Rest",color:"#ec4899",icon:"😴"});for(let e=0;e<s.free;e++)t.push({name:"Free",color:"#475569",icon:"☕"});return t.slice(0,6).map(e=>`
    <div style="background: ${e.color}22; border: 1px solid ${e.color}66; border-radius: 6px; padding: 6px 2px;">
      <div style="font-size: 0.9rem;">${e.icon}</div>
      <div style="font-size: 0.6rem; color: ${e.color}; font-weight: 700; margin-top: 2px;">${e.name}</div>
    </div>
  `).join("")}function de(s){switch(s){case"income":return"#22c55e";case"expense":return"#ef4444";case"investment":return"#38bdf8";case"achievement":return"#fbbf24";default:return"#94a3b8"}}function pe(s,t,e=!0){const a=s.getContext("2d");if(!a||t.length<2)return;const i=s.width,n=s.height;a.clearRect(0,0,i,n);const l=Math.min(...t),r=Math.max(...t),d=r-l===0?1:r-l,c=4,o=t.map((y,x)=>{const h=c+x/(t.length-1)*(i-c*2),g=n-c-(y-l)/d*(n-c*2);return{x:h,y:g}}),p=a.createLinearGradient(0,0,0,n),u=e?"#22c55e":"#ef4444",f=e?"rgba(34, 197, 94, 0.15)":"rgba(239, 68, 68, 0.15)";p.addColorStop(0,f),p.addColorStop(1,"rgba(0, 0, 0, 0)"),a.beginPath(),a.moveTo(o[0].x,o[0].y);for(let y=1;y<o.length;y++)a.lineTo(o[y].x,o[y].y);a.strokeStyle=u,a.lineWidth=2,a.stroke(),a.lineTo(o[o.length-1].x,n),a.lineTo(o[0].x,n),a.closePath(),a.fillStyle=p,a.fill()}function ue(s,t){var r,d;const e=document.createElement("div");e.className="screen-content",e.style.display="flex",e.style.flexDirection="column",e.style.gap="14px";const a=document.createElement("div");a.className="card";const i=s.player.goldHoldings.grams;a.innerHTML=`
    <div class="card-title">
      <span>✨ 24K Physical Gold</span>
      <span class="badge badge-gold">Safe Haven Asset</span>
    </div>
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <div>
        <div style="font-size: 1.4rem; font-weight: 800; color: #fbbf24;">${m(s.market.goldPricePerGram)} <span style="font-size: 0.75rem; color: var(--text-muted);">/ gram</span></div>
        <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">Your holdings: <strong>${i}g</strong> (Value: ${m(i*s.market.goldPricePerGram)})</div>
      </div>
      <div style="display: flex; gap: 6px;">
        <button class="btn btn-primary" id="btn-buy-gold" style="font-size: 0.75rem;">Buy</button>
        <button class="btn" id="btn-sell-gold" style="font-size: 0.75rem;" ${i<=0?"disabled":""}>Sell</button>
      </div>
    </div>
  `,e.appendChild(a);const n=document.createElement("div");n.className="card",n.innerHTML=`
    <div class="card-title">
      <span>Stock Exchange (BSE / NSE Live)</span>
      <span style="font-size: 0.7rem; color: var(--text-muted);">Macro cycle: ${s.market.cycleBias>=0?"🟢 Bullish":"🔴 Bearish"}</span>
    </div>
    <div style="font-size: 0.75rem; color: var(--text-muted);">Equities pay quarterly dividends. Tap ticker to trade or setup SIP:</div>
    <div id="ticker-list-container" style="display: flex; flex-direction: column; gap: 8px; margin-top: 6px;"></div>
  `,e.appendChild(n);const l=n.querySelector("#ticker-list-container");return s.market.tickers.forEach(c=>{const o=document.createElement("div");o.style.display="flex",o.style.alignItems="center",o.style.justifyContent="space-between",o.style.background="#0b0f19",o.style.padding="10px 12px",o.style.borderRadius="8px",o.style.border="1px solid #1a2336",o.style.cursor="pointer";const p=s.player.portfolio[c.id],u=p?p.shares:0,f=c.history[0]||c.price,y=(c.price-f)/f,x=y>=0;o.innerHTML=`
      <div style="flex: 1.2;">
        <div style="font-weight: 700; font-size: 0.85rem;">${c.name}</div>
        <div style="font-size: 0.65rem; color: var(--text-muted);">${c.sector.toUpperCase()} • Div: ${(c.dividendYieldPct*100).toFixed(1)}%</div>
        ${u>0?`<div style="font-size: 0.65rem; color: var(--accent-blue); margin-top: 2px;">Holding: ${u} shares</div>`:""}
      </div>
      <div style="flex: 1; display: flex; justify-content: center;">
        <canvas id="sparkline-${c.id}" width="90" height="32"></canvas>
      </div>
      <div style="flex: 1; text-align: right;">
        <div style="font-weight: 800; font-size: 0.9rem;">${m(c.price)}</div>
        <div style="font-size: 0.7rem; font-weight: 700; color: ${x?"var(--accent-green)":"var(--accent-red)"};">${oe(y)}</div>
      </div>
    `,o.addEventListener("click",()=>{t("trade-stock",{tickerId:c.id})}),l.appendChild(o),setTimeout(()=>{const h=o.querySelector(`#sparkline-${c.id}`);h&&pe(h,c.history,x)},0)}),(r=a.querySelector("#btn-buy-gold"))==null||r.addEventListener("click",()=>t("trade-gold",{action:"buy"})),(d=a.querySelector("#btn-sell-gold"))==null||d.addEventListener("click",()=>t("trade-gold",{action:"sell"})),e}function me(s,t){const e=document.createElement("div");e.className="screen-content",e.style.display="flex",e.style.flexDirection="column",e.style.gap="14px";const a=document.createElement("div");a.className="card",a.innerHTML=`
    <div class="card-title">
      <span>Real Estate Marketplace</span>
      <span class="badge badge-green">Appreciating Assets</span>
    </div>
    <div style="font-size: 0.75rem; color: var(--text-muted);">Acquire land or apartments for monthly rental yield and capital appreciation:</div>
    <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 6px;">
      ${s.market.properties.map(n=>{const l=n.owner==="player",r=n.owner&&n.owner!=="player",d=r?s.npcs.find(c=>c.id===n.owner):null;return`
          <div style="background: #0b0f19; padding: 10px 12px; border-radius: 8px; border: 1px solid #1a2336; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-weight: 700; font-size: 0.85rem;">${n.name} <span style="font-size: 0.7rem; color: var(--text-muted);">(${n.location})</span></div>
              <div style="font-size: 0.7rem; color: var(--text-muted); margin-top: 2px;">
                Valuation: ${m(n.price)} • Yield: ${n.rentYieldPct}% (~${m(Math.round(n.price*(n.rentYieldPct/100/12)))}/mo)
              </div>
              <div style="font-size: 0.65rem; color: ${n.riskProfile.legalStatus==="clear"?"var(--accent-green)":"var(--accent-gold)"};">
                Legal status: ${n.riskProfile.legalStatus.toUpperCase()} (${n.riskProfile.issueChancePct}% dispute risk)
              </div>
            </div>
            <div>
              ${l?'<span class="badge badge-green">Owned by You</span>':r?`<span class="badge badge-gold">Owned: ${(d==null?void 0:d.name)||"NPC"}</span>`:`<button class="btn btn-primary btn-buy-prop" data-id="${n.id}" style="font-size: 0.75rem;">Buy</button>`}
            </div>
          </div>
        `}).join("")}
    </div>
  `,e.appendChild(a);const i=document.createElement("div");return i.className="card",i.innerHTML=`
    <div class="card-title">
      <span>Tools, Vehicles & Lifestyle Assets</span>
      <span class="badge badge-gold">Time-Saving Tools</span>
    </div>
    <div style="font-size: 0.75rem; color: var(--text-muted);">These depreciate over time, but unlock critical time-slots, side hustles, or health boosts:</div>
    <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 6px;">
      ${N.map(n=>{const l=s.player.lifestyleAssets.find(r=>r.id===n.id);return`
          <div style="background: #0b0f19; padding: 10px 12px; border-radius: 8px; border: 1px solid #1a2336; display: flex; justify-content: space-between; align-items: center;">
            <div style="max-width: 70%;">
              <div style="font-weight: 700; font-size: 0.85rem;">${n.name}</div>
              <div style="font-size: 0.7rem; color: var(--text-muted); margin-top: 2px;">${n.description}</div>
              <div style="font-size: 0.65rem; color: #94a3b8; margin-top: 2px;">
                Price: ${m(n.price)} • Deprec: ${(n.depreciationPerYear*100).toFixed(0)}%/yr • Upkeep: ${m(n.monthlyUpkeep)}/mo
              </div>
            </div>
            <div>
              ${l?'<span class="badge badge-green">In Garage</span>':`<button class="btn btn-primary btn-buy-asset" data-id="${n.id}" style="font-size: 0.75rem;">Acquire</button>`}
            </div>
          </div>
        `}).join("")}
    </div>
  `,e.appendChild(i),a.querySelectorAll(".btn-buy-prop").forEach(n=>{n.addEventListener("click",l=>{const r=l.currentTarget.getAttribute("data-id");t("buy-property",{propertyId:r})})}),i.querySelectorAll(".btn-buy-asset").forEach(n=>{n.addEventListener("click",l=>{const r=l.currentTarget.getAttribute("data-id");t("buy-lifestyle-asset",{assetId:r})})}),e}function ye(s,t){const e=document.createElement("div");e.className="screen-content",e.style.display="flex",e.style.flexDirection="column",e.style.gap="14px";const a=document.createElement("div");return a.className="card",a.innerHTML=`
    <div class="card-title">
      <span>Enterprise & Commerce Sectors</span>
      <span class="badge badge-gold">Fixed Slots Scarcity</span>
    </div>
    <div style="font-size: 0.75rem; color: var(--text-muted);">
      Each sector has limited operator licenses. If you don't claim an open slot, ambitious NPCs will.
      More competitors in the same sector dilute individual profit margins.
    </div>
  `,e.appendChild(a),s.market.businessSectors.forEach(i=>{var c;const n=document.createElement("div");n.className="card";const l=i.slots.filter(o=>o.owner!==null).length,r=i.slots.some(o=>o.owner==="player"),d=i.slots.filter(o=>o.owner===null);n.innerHTML=`
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <div style="font-weight: 700; font-size: 0.95rem;">${i.name}</div>
          <div style="font-size: 0.7rem; color: var(--text-muted);">
            Cost: ${m(i.startupCost)} • Base Rev: ${m(i.baseRevenuePerCycle)} / 30d • Upkeep: ${m(i.slotUpkeepPerCycle)}/mo
          </div>
        </div>
        <span class="badge ${l>=i.capacity?"badge-red":"badge-green"}">
          ${l}/${i.capacity} Slots
        </span>
      </div>

      <!-- Slots Visual -->
      <div style="display: grid; grid-template-columns: repeat(${i.capacity}, 1fr); gap: 6px; margin: 6px 0;">
        ${i.slots.map(o=>{if(!o.owner)return`
              <div style="border: 1px dashed #334155; padding: 6px; border-radius: 6px; text-align: center; font-size: 0.65rem; color: var(--text-muted);">
                Vacant Slot
              </div>
            `;if(o.owner==="player")return`
              <div style="background: rgba(34, 197, 94, 0.2); border: 1px solid var(--accent-green); padding: 6px; border-radius: 6px; text-align: center; font-size: 0.65rem; color: #4ade80; font-weight: 700;">
                ⭐ Your Business
              </div>
            `;const p=s.npcs.find(u=>u.id===o.owner);return`
            <div style="background: #0b0f19; border: 1px solid #1a2336; padding: 6px; border-radius: 6px; text-align: center; font-size: 0.65rem; color: var(--text-muted);">
              ${(p==null?void 0:p.name.split(" ")[0])||"Competitor"}
            </div>
          `}).join("")}
      </div>

      <div style="display: flex; justify-content: flex-end;">
        ${!r&&d.length>0?`<button class="btn btn-primary btn-claim-slot" data-sector="${i.id}" style="font-size: 0.75rem;">Launch Business (${m(i.startupCost)})</button>`:r?'<span style="font-size: 0.75rem; color: var(--accent-green); font-weight: 700;">Active Operator</span>':'<span style="font-size: 0.75rem; color: var(--text-muted);">Sector Full</span>'}
      </div>
    `,(c=n.querySelector(".btn-claim-slot"))==null||c.addEventListener("click",()=>{t("claim-business-slot",{sectorId:i.id})}),e.appendChild(n)}),e}const he=[{tier:"none",name:"No Coverage",premium:0,coveragePct:0},{tier:"basic",name:"Basic Silver",premium:500,coveragePct:.5},{tier:"standard",name:"Standard Gold",premium:1200,coveragePct:.8},{tier:"premium",name:"Premium Platinum",premium:2500,coveragePct:.95}];function fe(s,t){var d,c,o;const e=s.player,a=document.createElement("div");a.className="screen-content",a.style.display="flex",a.style.flexDirection="column",a.style.gap="14px";const i=document.createElement("div");i.className="card",i.innerHTML=`
    <div class="card-title">
      <span>Savings & Term Deposits</span>
      <span class="badge badge-green">3.5% APY Daily</span>
    </div>
    <div style="display: flex; justify-content: space-between; align-items: center; background: #0b0f19; padding: 12px; border-radius: 8px;">
      <div>
        <div style="font-size: 0.7rem; color: var(--text-muted);">Current Savings Balance</div>
        <div style="font-size: 1.3rem; font-weight: 800; color: #38bdf8;">${m(e.savingsBalance)}</div>
      </div>
      <div style="display: flex; gap: 6px;">
        <button class="btn btn-primary" id="btn-deposit-savings" style="font-size: 0.75rem;">Deposit</button>
        <button class="btn" id="btn-withdraw-savings" style="font-size: 0.75rem;" ${e.savingsBalance<=0?"disabled":""}>Withdraw</button>
      </div>
    </div>
  `,a.appendChild(i);const n=document.createElement("div");n.className="card",n.innerHTML=`
    <div class="card-title">
      <span>Credit & Loan Facilities</span>
      <button class="btn btn-primary" id="btn-apply-loan" style="font-size: 0.75rem; padding: 4px 8px;">Apply Loan</button>
    </div>
    <div style="font-size: 0.75rem; color: var(--text-muted);">
      Missing EMI payments triggers compounding penalties and severe mental stress:
    </div>
    <div style="display: flex; flex-direction: column; gap: 6px; margin-top: 4px;">
      ${e.loans.length===0?'<div style="font-size: 0.8rem; color: var(--text-muted); padding: 8px; text-align: center; background: #0b0f19; border-radius: 6px;">No outstanding liabilities. Excellent credit rating!</div>':e.loans.map(p=>`
          <div style="background: #0b0f19; padding: 8px 10px; border-radius: 6px; border: 1px solid #1a2336; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-weight: 700; font-size: 0.85rem;">${p.name}</div>
              <div style="font-size: 0.65rem; color: var(--text-muted);">Balance: ${m(p.principalRemaining)} • EMI: ${m(p.emiAmount)} / 30d • ${(p.interestRate*100).toFixed(0)}% APR</div>
            </div>
            ${p.missedPayments>0?`<span class="badge badge-red">${p.missedPayments} Missed</span>`:'<span class="badge badge-green">On Schedule</span>'}
          </div>
        `).join("")}
    </div>
  `,a.appendChild(n);const l=document.createElement("div");l.className="card";const r=e.insurance.health.tier;return l.innerHTML=`
    <div class="card-title">
      <span>Insurance Protection Desk</span>
      <span class="badge badge-gold">Emergency Hedge</span>
    </div>
    <div style="font-size: 0.75rem; color: var(--text-muted);">
      Without health insurance, lifestyle illnesses will wipe out your wallet. Choose your policy:
    </div>
    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin-top: 6px;">
      ${he.map(p=>`
        <div style="background: #0b0f19; border: 1px solid ${r===p.tier?"var(--accent-green)":"#1a2336"}; padding: 8px; border-radius: 6px;">
          <div style="font-weight: 700; font-size: 0.8rem;">${p.name}</div>
          <div style="font-size: 0.65rem; color: var(--text-muted); margin-top: 2px;">
            ${p.coveragePct>0?`Covers ${(p.coveragePct*100).toFixed(0)}% of medical bills`:"Zero coverage"}
          </div>
          <div style="font-weight: 700; font-size: 0.8rem; color: #38bdf8; margin: 4px 0;">
            ${p.premium>0?`${m(p.premium)}/mo`:"Free"}
          </div>
          <button class="btn ${r===p.tier?"btn-success":""} btn-select-ins" data-tier="${p.tier}" style="font-size: 0.65rem; width: 100%;">
            ${r===p.tier?"Active Policy":"Select"}
          </button>
        </div>
      `).join("")}
    </div>
  `,a.appendChild(l),(d=i.querySelector("#btn-deposit-savings"))==null||d.addEventListener("click",()=>t("deposit-savings")),(c=i.querySelector("#btn-withdraw-savings"))==null||c.addEventListener("click",()=>t("withdraw-savings")),(o=n.querySelector("#btn-apply-loan"))==null||o.addEventListener("click",()=>t("open-loan-modal")),l.querySelectorAll(".btn-select-ins").forEach(p=>{p.addEventListener("click",u=>{const f=u.currentTarget.getAttribute("data-tier");t("select-insurance-tier",{tier:f})})}),a}function ve(s,t){var d,c;const e=s.player,a=document.createElement("div");a.className="screen-content",a.style.display="flex",a.style.flexDirection="column",a.style.gap="14px";const i=document.createElement("div");i.className="card",i.innerHTML=`
    <div class="card-title">
      <span>Hidden Consequence Risk Trackers</span>
      <span class="badge badge-gold">Cause & Effect</span>
    </div>
    <div style="font-size: 0.75rem; color: var(--text-muted);">
      Personal health events are not random! They build up when you compromise on food, rest, or exercise:
    </div>
    <div style="display: flex; flex-direction: column; gap: 6px; margin-top: 6px;">
      ${M("Street Food Strain",e.consequenceMeters.cheapFoodDays,20,"At 20d: Gastroenteritis bill")}
      ${M("Sedentary Inactivity",e.consequenceMeters.noExerciseDays,35,"At 35d: Chronic spinal pain")}
      ${M("Stress Fatigue",e.consequenceMeters.highStressDays,25,"At 25d: Panic & counseling")}
      ${M("Energy Depletion",e.consequenceMeters.lowEnergyDays,15,"At 15d: Adrenal burnout")}
    </div>
  `,a.appendChild(i);const n=document.createElement("div");n.className="card",n.innerHTML=`
    <div class="card-title">
      <span>Career Market & Education</span>
    </div>
    <div style="font-size: 0.75rem; color: var(--text-muted);">Available Jobs:</div>
    <div style="display: flex; flex-direction: column; gap: 6px; margin: 4px 0 8px 0;">
      ${R.map(o=>{var x;const p=e.job.id===o.id,u=!o.requiredCourse||(e.educationProgress[o.requiredCourse]||0)>=100,f=!o.requiredMinNetWorth||e.money>=o.requiredMinNetWorth,y=u&&f;return`
          <div style="background: #0b0f19; padding: 8px 10px; border-radius: 6px; border: 1px solid #1a2336; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-weight: 700; font-size: 0.85rem;">${o.title} ${p?'<span style="color: var(--accent-green);">(Active)</span>':""}</div>
              <div style="font-size: 0.65rem; color: var(--text-muted);">
                Salary: ${m(o.salaryPerCycle)} / 15d • Takes ${o.timeSlotsCost} slots • Req: ${o.requiredCourse?(x=A.find(h=>h.id===o.requiredCourse))==null?void 0:x.name:"None"}
              </div>
            </div>
            <div>
              ${p?'<span class="badge badge-green">Current</span>':y?`<button class="btn btn-primary btn-switch-job" data-id="${o.id}" style="font-size: 0.7rem;">Switch</button>`:'<span class="badge" style="background:#334155; color:#94a3b8;">Locked</span>'}
            </div>
          </div>
        `}).join("")}
    </div>

    <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px;">Certifications & Degrees:</div>
    <div style="display: flex; flex-direction: column; gap: 6px; margin-top: 4px;">
      ${A.map(o=>{const p=e.educationProgress[o.id]||0,u=p>=100;return`
          <div style="background: #0b0f19; padding: 8px 10px; border-radius: 6px; border: 1px solid #1a2336; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-weight: 700; font-size: 0.85rem;">${o.name}</div>
              <div style="font-size: 0.65rem; color: var(--text-muted);">${o.description} (Fee: ${m(o.fee)})</div>
              <div style="font-size: 0.65rem; color: #38bdf8; margin-top: 2px;">Progress: ${p}%</div>
            </div>
            <div>
              ${u?'<span class="badge badge-green">Completed</span>':`<button class="btn btn-primary btn-enroll-course" data-id="${o.id}" style="font-size: 0.7rem;">Enroll (${m(o.fee)})</button>`}
            </div>
          </div>
        `}).join("")}
    </div>
  `,a.appendChild(n);const l=document.createElement("div");l.className="card",l.innerHTML=`
    <div class="card-title">
      <span>Fellow Residents & Competitors</span>
      <span class="badge badge-green">Living Economy</span>
    </div>
    <div style="display: flex; flex-direction: column; gap: 6px;">
      ${s.npcs.map(o=>`
        <div style="background: #0b0f19; padding: 8px 10px; border-radius: 6px; border: 1px solid #1a2336; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-weight: 700; font-size: 0.85rem;">${o.name}</div>
            <div style="font-size: 0.65rem; color: var(--text-muted); text-transform: capitalize;">${o.archetype.replace("-"," ")} • Net Cash: ${m(o.money)}</div>
            ${o.decisionLog[0]?`<div style="font-size: 0.65rem; color: #94a3b8; margin-top: 2px;">Latest: ${o.decisionLog[0].action} ${o.decisionLog[0].detail}</div>`:""}
          </div>
        </div>
      `).join("")}
    </div>
  `,a.appendChild(l);const r=document.createElement("div");return r.className="card",r.innerHTML=`
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
  `,a.appendChild(r),(d=r.querySelector("#btn-export-save"))==null||d.addEventListener("click",()=>{U(s)}),(c=r.querySelector("#btn-reset-game"))==null||c.addEventListener("click",()=>{confirm("Are you sure you want to reset your life simulation? All progress will be wiped.")&&(_(),location.reload())}),n.querySelectorAll(".btn-switch-job").forEach(o=>{o.addEventListener("click",p=>{const u=p.currentTarget.getAttribute("data-id");t("switch-job",{jobId:u})})}),n.querySelectorAll(".btn-enroll-course").forEach(o=>{o.addEventListener("click",p=>{const u=p.currentTarget.getAttribute("data-id");t("enroll-course",{courseId:u})})}),a}function M(s,t,e,a){const i=Math.min(100,Math.round(t/e*100)),n=i>=70;return`
    <div style="background: #0b0f19; padding: 6px 10px; border-radius: 6px; border: 1px solid #1a2336;">
      <div style="display: flex; justify-content: space-between; font-size: 0.75rem;">
        <span style="font-weight: 600;">${s}</span>
        <span style="color: ${n?"var(--accent-red)":"var(--text-muted)"}; font-weight: 700;">${t} / ${e} days (${i}%)</span>
      </div>
      <div class="meter-track" style="margin: 4px 0;">
        <div class="meter-fill" style="width: ${i}%; background: ${n?"var(--accent-red)":"var(--accent-gold)"};"></div>
      </div>
      <div style="font-size: 0.65rem; color: #64748b;">${a}</div>
    </div>
  `}function ge(s,t,e){var r,d;const a=document.createElement("div");a.className="modal-backdrop";const i={...s.player.timeAllocation},n=document.createElement("div");n.className="modal-sheet",n.innerHTML=`
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <h3 style="font-size: 1.1rem;">Divide 6 Time Slots</h3>
      <span id="slot-counter" class="badge badge-green" style="font-size: 0.8rem;">6 / 6 Allocated</span>
    </div>
    <div style="font-size: 0.75rem; color: var(--text-muted);">
      Every hour counts. Balance work, exercise, study, and rest. Job takes fixed ${i.job} slots.
    </div>
    <div id="alloc-rows" style="display: flex; flex-direction: column; gap: 8px;">
      ${P("Commute",i.commute,"commute")}
      ${P("Exercise / Workout",i.exercise,"exercise")}
      ${P("Home Cooking",i.cooking,"cooking")}
      ${P("Freelance Side Hustle",i.sideHustle,"sideHustle")}
      ${P("Education & Study",i.education,"education")}
      ${P("Deep Rest & Sleep",i.rest,"rest")}
      ${P("Free Time & Leisure",i.free,"free")}
    </div>
    <div style="display: flex; gap: 8px; margin-top: 10px;">
      <button class="btn" id="btn-cancel-time" style="flex: 1;">Cancel</button>
      <button class="btn btn-primary" id="btn-save-time" style="flex: 1;">Confirm Schedule</button>
    </div>
  `,a.appendChild(n);function l(){const c=i.job+i.commute+i.exercise+i.cooking+i.sideHustle+i.education+i.rest+i.free,o=n.querySelector("#slot-counter");o.innerText=`${c} / 6 Allocated`,o.className=`badge ${c===6?"badge-green":"badge-red"}`}return n.querySelectorAll(".btn-slot-adj").forEach(c=>{c.addEventListener("click",o=>{const p=o.currentTarget.getAttribute("data-key"),u=parseInt(o.currentTarget.getAttribute("data-delta")||"0",10),f=i[p];if(f+u>=0){i[p]=f+u;const y=n.querySelector(`#val-${p}`);y&&(y.innerText=String(i[p])),l()}})}),(r=n.querySelector("#btn-cancel-time"))==null||r.addEventListener("click",t),(d=n.querySelector("#btn-save-time"))==null||d.addEventListener("click",()=>{const c=i.job+i.commute+i.exercise+i.cooking+i.sideHustle+i.education+i.rest+i.free;if(c!==6){alert(`Must allocate exactly 6 time slots! Currently have ${c}.`);return}e(i),t()}),a}function P(s,t,e){return`
    <div style="display: flex; justify-content: space-between; align-items: center; background: #0b0f19; padding: 6px 10px; border-radius: 6px;">
      <span style="font-size: 0.8rem; font-weight: 600;">${s}</span>
      <div style="display: flex; align-items: center; gap: 8px;">
        <button class="btn btn-slot-adj" data-key="${e}" data-delta="-1" style="padding: 2px 8px; font-size: 0.8rem;">-</button>
        <span id="val-${e}" style="font-weight: 700; min-width: 16px; text-align: center;">${t}</span>
        <button class="btn btn-slot-adj" data-key="${e}" data-delta="1" style="padding: 2px 8px; font-size: 0.8rem;">+</button>
      </div>
    </div>
  `}function be(s,t,e){var n;const a=document.createElement("div");a.className="modal-backdrop";const i=document.createElement("div");return i.className="modal-sheet",i.innerHTML=`
    <h3 style="font-size: 1.1rem;">Choose Daily Diet Quality</h3>
    <div style="font-size: 0.75rem; color: var(--text-muted);">
      Cheap food saves cash but triggers severe gastroenteritis bills. Healthy cooking requires equipment and time.
    </div>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      ${Object.values(E).map(l=>{const r=s.player.lifestyle.foodTier===l.id,d=s.player.lifestyleAssets.some(o=>o.id==="cooking-equipment"),c=!l.requiresCookingEquipment||d;return`
          <div style="background: #0b0f19; border: 1px solid ${r?"var(--accent-green)":"#1a2336"}; padding: 10px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-weight: 700; font-size: 0.85rem;">${l.name}</div>
              <div style="font-size: 0.7rem; color: var(--text-muted);">${l.description}</div>
              ${l.requiresCookingEquipment&&!d?'<div style="font-size: 0.65rem; color: var(--accent-red); margin-top: 2px;">⚠️ Requires Gourmet Kitchen Set from Assets tab</div>':""}
            </div>
            <button class="btn ${r?"btn-success":"btn-primary"} btn-pick-diet" data-id="${l.id}" style="font-size: 0.75rem;" ${c?"":"disabled"}>
              ${r?"Active":"Choose"}
            </button>
          </div>
        `}).join("")}
    </div>
    <button class="btn" id="btn-close-diet" style="margin-top: 10px;">Close</button>
  `,a.appendChild(i),i.querySelectorAll(".btn-pick-diet").forEach(l=>{l.addEventListener("click",r=>{const d=r.currentTarget.getAttribute("data-id");e(d),t()})}),(n=i.querySelector("#btn-close-diet"))==null||n.addEventListener("click",t),a}function xe(s,t,e,a){var o,p,u,f;const i=s.market.tickers.find(y=>y.id===t),n=s.player.portfolio[t]||{shares:0,avgCost:0},l=document.createElement("div");l.className="modal-backdrop";const r=document.createElement("div");r.className="modal-sheet",r.innerHTML=`
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <h3 style="font-size: 1.1rem;">${i.name} (${i.id})</h3>
      <span class="badge badge-green">${m(i.price)}</span>
    </div>
    <div style="font-size: 0.75rem; color: var(--text-muted);">
      Your holding: <strong>${n.shares} shares</strong> (Avg: ${m(n.avgCost)}) • Liquid cash: ${m(s.player.money)}
    </div>

    <div style="display: flex; flex-direction: column; gap: 8px;">
      <label style="font-size: 0.75rem; font-weight: 600;">Shares to Trade:</label>
      <input type="number" id="trade-shares-input" value="10" min="1" max="10000" style="background: #0b0f19; border: 1px solid #1a2336; padding: 8px; color: white; border-radius: 6px; font-size: 1rem;" />
      <div id="trade-cost-preview" style="font-size: 0.75rem; color: #38bdf8;">Estimated Cost: ${m(10*i.price)}</div>
    </div>

    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin-top: 6px;">
      <button class="btn btn-primary" id="btn-exec-buy">Buy Shares</button>
      <button class="btn btn-danger" id="btn-exec-sell" ${n.shares<=0?"disabled":""}>Sell Shares</button>
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
  `,l.appendChild(r);const d=r.querySelector("#trade-shares-input"),c=r.querySelector("#trade-cost-preview");return d==null||d.addEventListener("input",()=>{const y=parseInt(d.value||"0",10);c.innerText=`Estimated Cost: ${m(y*i.price)}`}),(o=r.querySelector("#btn-exec-buy"))==null||o.addEventListener("click",()=>{const y=parseInt(d.value||"0",10);if(!(y<=0)){if(s.player.money<y*i.price){alert("Insufficient liquid cash!");return}a("buy",y),e()}}),(p=r.querySelector("#btn-exec-sell"))==null||p.addEventListener("click",()=>{const y=parseInt(d.value||"0",10);if(!(y<=0)){if(n.shares<y){alert("Cannot sell more shares than you hold!");return}a("sell",y),e()}}),(u=r.querySelector("#btn-toggle-sip"))==null||u.addEventListener("click",()=>{a("sip",1e3),e()}),(f=r.querySelector("#btn-close-trade"))==null||f.addEventListener("click",e),l}class Ce{constructor(){C(this,"state");C(this,"currentTab","dashboard");C(this,"gameLoop");C(this,"appEl");this.appEl=document.getElementById("app"),this.state=Y(),this.gameLoop=new re(this.state,t=>this.onDayTick(t),()=>this.onRender()),this.renderAppShell(),this.renderActiveTab(),this.gameLoop.start(),setTimeout(()=>{this.handleOfflineCatchup()},200)}handleOfflineCatchup(){var e;const t=K(this.state.player.lastActiveTimestamp);if(t>0){const a=J(t);if(a.mode==="fast-sim"){for(let i=0;i<a.days;i++)(e=this.gameLoop)==null||e.simulateSingleDay();alert(`Welcome back! Fast-simulated ${a.days} days of your absence.`)}else if(a.mode==="aggregate"){const i=X(this.state,a.days);alert(`Offline Progression Report:

${i.join(`
`)}`)}v(this.state)}}renderAppShell(){this.appEl.innerHTML=`
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
    `,this.appEl.querySelectorAll(".nav-tab").forEach(t=>{t.addEventListener("click",e=>{const a=e.currentTarget.getAttribute("data-tab");this.setTab(a)})})}setTab(t){this.currentTab=t,this.appEl.querySelectorAll(".nav-tab").forEach(e=>{e.getAttribute("data-tab")===t?e.classList.add("active"):e.classList.remove("active")}),this.renderActiveTab()}renderActiveTab(){const t=document.getElementById("screen-container");t.innerHTML="";const e=(a,i)=>this.handleAction(a,i);switch(this.currentTab){case"dashboard":t.appendChild(le(this.state,e));break;case"market":t.appendChild(ue(this.state,e));break;case"assets":t.appendChild(me(this.state,e));break;case"business":t.appendChild(ye(this.state,e));break;case"bank":t.appendChild(fe(this.state,e));break;case"life":t.appendChild(ve(this.state,e));break}}onDayTick(t){v(this.state),this.updateHeader(),this.renderActiveTab()}onRender(){this.updateHeader()}updateHeader(){const t=this.state.player,e=document.getElementById("top-cash"),a=document.getElementById("top-day");e&&(e.innerText=m(t.money)),a&&(a.innerText=`Day ${t.currentDay}`);const i=(n,l,r)=>{const d=document.getElementById(n),c=document.getElementById(l),o=Math.round(Math.max(0,Math.min(100,r)));d&&(d.style.width=`${o}%`),c&&(c.innerText=`${o}%`)};i("bar-physical","txt-physical",t.health.physical),i("bar-mental","txt-mental",t.health.mental),i("bar-energy","txt-energy",t.health.energy)}handleAction(t,e){const a=document.getElementById("modal-container");switch(t){case"open-time-modal":a.appendChild(ge(this.state,()=>{a.innerHTML=""},h=>{this.state.player.timeAllocation=h,v(this.state),this.renderActiveTab()}));break;case"open-diet-modal":a.appendChild(be(this.state,()=>{a.innerHTML=""},h=>{this.state.player.lifestyle.foodTier=h,v(this.state),this.renderActiveTab()}));break;case"trade-stock":a.appendChild(xe(this.state,e.tickerId,()=>{a.innerHTML=""},(h,g)=>{const b=this.state.market.tickers.find(S=>S.id===e.tickerId);if(h==="buy"){const S=g*b.price;this.state.player.money-=S;const k=this.state.player.portfolio[b.id]||{shares:0,avgCost:b.price},I=k.shares+g;k.avgCost=Math.round((k.shares*k.avgCost+S)/I*100)/100,k.shares=I,this.state.player.portfolio[b.id]=k,this.state.player.eventLog.unshift({day:this.state.player.currentDay,text:`Bought ${g} shares of ${b.name}`,type:"investment"})}else if(h==="sell"){const S=g*b.price;this.state.player.money+=S;const k=this.state.player.portfolio[b.id];k&&(k.shares-=g,k.shares<=0&&delete this.state.player.portfolio[b.id]),this.state.player.eventLog.unshift({day:this.state.player.currentDay,text:`Sold ${g} shares of ${b.name} for ${m(S)}`,type:"investment"})}else h==="sip"&&(this.state.player.sips.push({id:`sip-${Date.now()}`,tickerId:b.id,amountPerCycle:1e3,cycleDays:15,lastInvestedDay:this.state.player.currentDay,active:!0}),alert(`SIP created! ₹1,000 will be auto-invested into ${b.name} every 15 days.`));v(this.state),this.renderActiveTab()}));break;case"trade-gold":if(e.action==="buy"){const h=prompt("How many grams of 24K gold to purchase?","1"),g=parseInt(h||"0",10);if(g>0){const b=g*this.state.market.goldPricePerGram;this.state.player.money>=b?(this.state.player.money-=b,this.state.player.goldHoldings.grams+=g,v(this.state),this.renderActiveTab()):alert("Insufficient cash for gold purchase.")}}else{const h=prompt(`How many grams of gold to sell? (You hold ${this.state.player.goldHoldings.grams}g)`,"1"),g=parseInt(h||"0",10);if(g>0&&g<=this.state.player.goldHoldings.grams){const b=g*this.state.market.goldPricePerGram;this.state.player.money+=b,this.state.player.goldHoldings.grams-=g,v(this.state),this.renderActiveTab()}}break;case"buy-property":const i=this.state.market.properties.find(h=>h.id===e.propertyId);i&&this.state.player.money>=i.price?confirm(`Acquire ${i.name} for ${m(i.price)}?`)&&(this.state.player.money-=i.price,i.owner="player",this.state.player.properties.push({id:i.id,purchasePrice:i.price,riskStatus:i.riskProfile.legalStatus,mortgage:null}),this.state.player.eventLog.unshift({day:this.state.player.currentDay,text:`Acquired property: ${i.name}`,type:"investment"}),v(this.state),this.renderActiveTab()):alert("Insufficient funds to buy property outright!");break;case"buy-lifestyle-asset":const n=N.find(h=>h.id===e.assetId);n&&this.state.player.money>=n.price?confirm(`Purchase ${n.name} for ${m(n.price)}?`)&&(this.state.player.money-=n.price,this.state.player.lifestyleAssets.push({id:n.id,purchasePrice:n.price,currentValue:n.price,purchasedOnDay:this.state.player.currentDay,monthlyMaintenance:n.monthlyUpkeep}),n.id==="scooter"&&(this.state.player.lifestyle.transportMode="scooter"),n.id==="car"&&(this.state.player.lifestyle.transportMode="car"),n.id==="bicycle"&&(this.state.player.lifestyle.transportMode="bicycle"),this.state.player.eventLog.unshift({day:this.state.player.currentDay,text:`Acquired asset: ${n.name}`,type:"investment"}),v(this.state),this.renderActiveTab()):alert("Insufficient cash for this asset.");break;case"claim-business-slot":const l=this.state.market.businessSectors.find(h=>h.id===e.sectorId);if(l&&this.state.player.money>=l.startupCost){const h=l.slots.find(g=>g.owner===null);h&&confirm(`Launch venture in ${l.name} for ${m(l.startupCost)}?`)&&(this.state.player.money-=l.startupCost,h.owner="player",this.state.player.businesses.push({sectorId:l.id,slotId:h.id,startedDay:this.state.player.currentDay,cashInvested:l.startupCost}),this.state.player.eventLog.unshift({day:this.state.player.currentDay,text:`Started business in ${l.name}!`,type:"investment"}),v(this.state),this.renderActiveTab())}else alert("Insufficient capital for starting this venture.");break;case"deposit-savings":const r=prompt(`Amount to deposit to savings (Cash: ${m(this.state.player.money)}):`,"1000"),d=parseInt(r||"0",10);d>0&&this.state.player.money>=d&&(this.state.player.money-=d,this.state.player.savingsBalance+=d,v(this.state),this.renderActiveTab());break;case"withdraw-savings":const c=prompt(`Amount to withdraw from savings (Balance: ${m(this.state.player.savingsBalance)}):`,"1000"),o=parseInt(c||"0",10);o>0&&this.state.player.savingsBalance>=o&&(this.state.player.savingsBalance-=o,this.state.player.money+=o,v(this.state),this.renderActiveTab());break;case"open-loan-modal":const p=prompt("Enter requested loan amount (Max ₹1,00,000 at 12% APR):","25000"),u=parseInt(p||"0",10);if(u>0&&u<=1e5){const h=Math.round(u/12+u*.01);this.state.player.money+=u,this.state.player.loans.push({id:`loan-${Date.now()}`,name:`Personal Credit ₹${u.toLocaleString("en-IN")}`,type:"personal",principalRemaining:u,interestRate:.12,emiAmount:h,cycleDays:30,lastPaidDay:this.state.player.currentDay,missedPayments:0}),alert(`Approved! Added ${m(u)} to wallet. EMI: ${m(h)} / 30 days.`),v(this.state),this.renderActiveTab()}break;case"select-insurance-tier":const f=e.tier;f==="none"?this.state.player.insurance.health={tier:"none",premiumPerMonth:0,coveragePct:0}:f==="basic"?this.state.player.insurance.health={tier:"basic",premiumPerMonth:500,coveragePct:.5}:f==="standard"?this.state.player.insurance.health={tier:"standard",premiumPerMonth:1200,coveragePct:.8}:f==="premium"&&(this.state.player.insurance.health={tier:"premium",premiumPerMonth:2500,coveragePct:.95}),v(this.state),this.renderActiveTab();break;case"switch-job":const y=R.find(h=>h.id===e.jobId);y&&(this.state.player.job={id:y.id,title:y.title,salaryPerCycle:y.salaryPerCycle,payCycleDays:y.payCycleDays,stressPerDay:y.stressPerDay,timeSlotsCost:y.timeSlotsCost},this.state.player.eventLog.unshift({day:this.state.player.currentDay,text:`Started new job: ${y.title}`,type:"income"}),v(this.state),this.renderActiveTab());break;case"enroll-course":const x=A.find(h=>h.id===e.courseId);x&&this.state.player.money>=x.fee?(this.state.player.money-=x.fee,this.state.player.educationProgress[x.id]=100,this.state.player.eventLog.unshift({day:this.state.player.currentDay,text:`Earned certification in ${x.name}`,type:"achievement"}),v(this.state),this.renderActiveTab()):alert("Insufficient funds for enrollment fee.");break}}}function q(){try{new Ce}catch(s){console.error("App initialization error:",s);const t=document.getElementById("app");t&&(t.innerHTML=`<div style="color:#ef4444;padding:24px;font-family:sans-serif;">
        <h3>Error starting game:</h3>
        <pre>${String(s instanceof Error?s.stack||s.message:s)}</pre>
        <button onclick="localStorage.clear();location.reload();" style="padding:8px 16px;background:#1e293b;color:white;border:1px solid #334155;border-radius:6px;cursor:pointer;margin-top:12px;">Reset Save Data & Reload</button>
      </div>`)}}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",q):q();
