// Uber Eats rating overview (cookie, browserless) -> POST /api/ipad/uber-reviews. Env: UBER_COOKIE, WORKER_KEY, APP. Run twice daily from uber_sales_cron.js.
const BASE=process.env.APP||'https://mstand-queue.onrender.com',STORE='b995d00f-e3a8-46de-99f2-72891a95b816';
(async()=>{const r=await fetch('https://merchants.ubereats.com/manager/api/getFeedbackOverviewDataV2?localeCode=en',{method:'POST',redirect:'manual',signal:AbortSignal.timeout(30000),
  headers:{cookie:process.env.UBER_COOKIE||'','content-type':'application/json','x-csrf-token':'x',origin:'https://merchants.ubereats.com','user-agent':'Mozilla/5.0 Chrome/130.0'},
  body:JSON.stringify({restaurantUuids:[STORE],userTimezoneOffset:-540,fetchFeedbackSummary:false})});
 const j=await r.json();const R=j&&j.data&&j.data.RESTAURANT;if(!R)throw new Error('no data '+r.status);
 const uber={avg:Math.round(R.avgRating*100)/100,ratings:R.ratings,count:R.ratingsCount,stars:R.starRatingsCount,comments:R.commentsCount,menuDown:((j.data.MENU_ITEMS||{}).ratings||{})['1']||0};
 if(process.argv.includes('--dry'))return console.log(JSON.stringify(uber));
 const p=await fetch(BASE+'/api/ipad/uber-reviews',{method:'POST',headers:{'content-type':'application/json','x-worker-key':process.env.WORKER_KEY||''},body:JSON.stringify({uber})});console.log(p.status,JSON.stringify(uber))})().catch(e=>{console.error(e.message);process.exit(1)});
