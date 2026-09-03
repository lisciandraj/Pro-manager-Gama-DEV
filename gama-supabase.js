/* GAMA — Supabase central data layer */
(function(){
  'use strict';
  const SUPABASE_URL='https://mknsaibrewksgomuslev.supabase.co';
  const SUPABASE_PUBLISHABLE_KEY='sb_publishable_4l0vZw61u5EbLkzmrqrf6Q_phOL1Be9';
  let client=null,channels=[];
  const emit=(name,detail)=>window.dispatchEvent(new CustomEvent(name,{detail:detail||{}}));
  function loadSDK(){if(window.supabase?.createClient)return Promise.resolve(window.supabase);if(window.__gamaSupabaseSDK)return window.__gamaSupabaseSDK;window.__gamaSupabaseSDK=new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';s.async=true;s.onload=()=>window.supabase?.createClient?resolve(window.supabase):reject(Error('Supabase JS unavailable'));s.onerror=()=>reject(Error('Unable to load Supabase JS'));document.head.appendChild(s)});return window.__gamaSupabaseSDK}
  async function init(){if(client)return client;const sb=await loadSDK();client=sb.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});client.auth.onAuthStateChange((event,session)=>emit('gama:auth-change',{event,session}));emit('gama:cloud-status',{ready:true,configured:true,url:SUPABASE_URL});return client}
  async function db(){return init()}
  async function getSession(){return (await db()).auth.getSession()}
  async function getUser(){return (await db()).auth.getUser()}
  async function signIn(email,password){return (await db()).auth.signInWithPassword({email,password})}
  async function signOut(){const c=await db();try{return await c.auth.signOut({scope:'local'})}finally{try{localStorage.removeItem('gama_session_v1');sessionStorage.removeItem('gama_session_v1')}catch(_){}channels.forEach(ch=>{try{c.removeChannel(ch)}catch(_){}});channels=[]}}
  async function getProfile(){const c=await db(),u=(await c.auth.getUser()).data?.user;if(!u)return {data:null,error:null};return c.from('profiles').select('*').eq('id',u.id).maybeSingle()}
  async function list(table,options={}){let q=(await db()).from(table).select(options.select||'*');if(options.order)q=q.order(options.order,{ascending:options.ascending!==false});if(options.limit)q=q.limit(options.limit);Object.entries(options.eq||{}).forEach(([k,v])=>q=q.eq(k,v));return q}
  async function insert(table,row){return (await db()).from(table).insert(row).select().single()}
  async function update(table,id,row){return (await db()).from(table).update(row).eq('id',id).select().single()}
  async function remove(table,id){return (await db()).from(table).delete().eq('id',id)}
  async function subscribe(table,callback){const c=await db();const channel=c.channel('gama-'+table+'-'+Date.now()).on('postgres_changes',{event:'*',schema:'public',table},payload=>{emit('gama:data-change',{table,payload});callback?.(payload)}).subscribe();channels.push(channel);return channel}
  function unsubscribeAll(){if(!client)return;channels.forEach(ch=>{try{client.removeChannel(ch)}catch(_){}});channels=[]}
  window.GamaCloud={url:SUPABASE_URL,init,db,getSession,getUser,signIn,signOut,getProfile,list,insert,update,remove,subscribe,unsubscribeAll,tables:{profiles:'profiles',products:'products',suppliers:'suppliers',customers:'customers',stockMovements:'stock_movements',invoices:'invoices',invoiceLines:'invoice_lines',commercialMatrix:'commercial_matrix',customerRequests:'customer_requests',customerRequestLines:'customer_request_lines'}};
  window.GamaCloudReady=init().then(async()=>{
    const modules=['gama-cloud-auth.js?v=21','gama-cloud-products.js?v=19','gama-cloud-users.js?v=18','gama-purchases-supplier-bridge.js?v=6','gama-invoice-archive.js?v=3','gama-client-catalog.js?v=7','gama-customer-requests.js?v=4'];
    for(const src of modules){const base=src.split('?')[0];if(document.querySelector('script[src^="'+base+'"]'))continue;await new Promise(resolve=>{const s=document.createElement('script');s.src=src;s.async=false;s.onload=resolve;s.onerror=()=>{console.warn('[GAMA] Module unavailable:',src);resolve()};document.head.appendChild(s)})}
    emit('gama:auth-ready');
    if(!document.querySelector('script[src^="gama-central-sync.js"]')){const cs=document.createElement('script');cs.src='gama-central-sync.js?v=2';cs.async=true;cs.onload=()=>emit('gama:data-ready');cs.onerror=()=>console.warn('[GAMA] Central sync unavailable');document.head.appendChild(cs)}else emit('gama:data-ready');
    return window.GamaCloud;
  }).catch(e=>{console.error('[GAMA] Cloud initialization failed',e);emit('gama:cloud-status',{ready:false,error:e})});
})();
