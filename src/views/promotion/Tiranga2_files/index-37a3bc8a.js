import{_ as L,G as le,g as U,b0 as ee,dA as re,dB as he,o as Z,u as be,S as ce,a as ye,dC as we,dD as ke,dE as Se,dF as Ce,b3 as $e,bj as Ae,b4 as Le,b5 as Ie,K as ue,h as se,dG as oe,r as de,i as De}from"./page-activity-d3ba61d1.js";import{$ as B,P as te,Q as J,a3 as E,o as d,j as w,a5 as Q,a6 as Te,l as n,a7 as k,a2 as y,a1 as _,aa as ve,H as c,A as O,N as _e,aq as me,r as m,a4 as pe,ab as A,ag as Ee,ah as Be,q as Pe,_ as xe,J as F,G as W,af as C,a8 as T,a9 as Ne,K as Re,aD as Fe,aC as ne,b5 as Ve,b6 as Ge,X as He,ad as K,a0 as Me,B as Oe,b7 as je,al as j,k as Ue,b2 as Ke,b8 as ze,b9 as Ye,ba as qe,bb as Xe,bc as We,bd as Je,be as Qe,bf as Ze,bg as et,bh as tt,bi as at,bj as st,bk as ot,bl as nt,bm as it,bn as lt,bo as rt,bp as ct,bq as ut,br as dt,bs as vt,bt as _t,bu as mt,bv as pt,bw as ft,bx as gt,by as ht,bz as bt,bA as yt,bB as wt,bC as kt,bD as St,bE as Ct,bF as $t,bG as At,bH as Lt,bI as It,bJ as Dt,bK as Tt,bL as Et,bM as Bt}from"./modules-6b0d6df4.js";import"./native/index-7b2487e5.js";import"./en-93cdab10.js";import"./rus-ecb14220.js";import"./vi-40bd560a.js";import"./id-24cc3835.js";import"./hd-c5b1d7e8.js";import"./tha-330057b2.js";import"./md-02b1fc1c.js";import"./bra-1f3ea623.js";import"./my-80d37f62.js";import"./bdt-d8f19d0c.js";import"./zh-3589f8b3.js";import"./pak-9f46abf2.js";import"./ar-64903102.js";(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))o(s);new MutationObserver(s=>{for(const i of s)if(i.type==="childList")for(const r of i.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&o(r)}).observe(document,{childList:!0,subtree:!0});function a(s){const i={};return s.integrity&&(i.integrity=s.integrity),s.referrerPolicy&&(i.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?i.credentials="include":s.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function o(s){if(s.ep)return;s.ep=!0;const i=a(s);fetch(s.href,i)}})();const Pt={class:"tabbar__container"},xt=["onClick"],Nt={key:0,class:"promotionBg"},Rt=B({__name:"index",setup(t){const e=te(),a=J();async function o(i){await e.push({name:i})}const s=[{name:"home"},{name:"activity"},{name:"promotion"},{name:"wallet"},{name:"main"}];return(i,r)=>{const l=E("svg-icon");return d(),w("div",Pt,[(d(),w(Q,null,Te(s,(u,p)=>n("div",{class:ve(["tabbar__container-item",{active:u.name===c(a).name}]),key:u+""+p,onClick:f=>o(u.name)},[k(l,{name:u.name},null,8,["name"]),u.name==="promotion"?(d(),w("div",Nt)):y("v-if",!0),n("span",null,_(i.$t(u.name)),1)],10,xt)),64))])}}});const Ft=L(Rt,[["__scopeId","data-v-6ab3f23e"],["__file","/var/lib/jenkins/workspace/web-印度-Tiranga-webnew/src/components/TabBar/index.vue"]]);function Vt(){const t=le(),e=()=>{document.visibilityState==="visible"?t.setvisibility():t.setvisibility(0)};O(()=>{document.addEventListener("visibilitychange",e)}),_e(()=>{document.removeEventListener("visibilitychange",e)})}const Gt=B({__name:"Customer",setup(t){me(v=>({"f6a705e1-currentFontFamily":N.value}));const e=m(!1),a=m({x:0,y:0}),o=m(0),s=m(0),i=m(0),r=m(0),l=m(0),u=m(0),p=m();let f,V,P,x;const G=te();function H(){M(f,V,P,x)||G.push({name:"CustomerService"})}O(()=>{p.value=document.getElementById("customerId")});function b(v){e.value=!0;var g;v.touches?g=v.touches[0]:g=v,a.value.x=g.clientX,a.value.y=g.clientY,o.value=p.value.offsetLeft,s.value=p.value.offsetTop,f=v.clientX,V=v.clientY}function $(v){if(e.value){var g,I=document.getElementById("customerId"),R=I.clientWidth,z=I.clientHeight,Y=document.documentElement.clientHeight,h=document.documentElement.clientWidth;v.touches?g=v.touches[0]:g=v,i.value=g.clientX-a.value.x,r.value=g.clientY-a.value.y,l.value=o.value+i.value,u.value=s.value+r.value,l.value<=0&&(l.value=0),u.value<=0&&(u.value=0),l.value>=h-R&&(l.value=h-R),u.value>=Y-z&&(u.value=Y-z),p.value.style.left=l.value+"px",p.value.style.top=u.value+"px",document.addEventListener("touchmove",function(){v.preventDefault()},!1)}v.stopPropagation(),v.preventDefault()}function S(v){e.value=!1,P=v.clientX,x=v.clientY}function M(v,g,I,R){return!(Math.sqrt((v-I)*(v-I)+(g-R)*(g-R))<=1)}const N=m("bahnschrift");return(v,g)=>{const I=pe("lazy");return d(),w("div",{class:"customer",onClick:H,onMousedown:b,onTouchstart:b,onMousemove:$,onTouchmove:$,onMouseup:S,id:"customerId"},[A(n("img",null,null,512),[[I,c(U)("home","icon_sevice")]])],32)}}});const Ht=L(Gt,[["__file","/var/lib/jenkins/workspace/web-印度-Tiranga-webnew/src/components/common/Customer.vue"]]),Mt="/assets/png/logo-72b611f7.png";const Ot={},fe=t=>(Ee("data-v-5eb72be7"),t=t(),Be(),t),jt={class:"start-page"},Ut=fe(()=>n("div",{class:"dice"},null,-1)),Kt=fe(()=>n("img",{class:"logo",src:Mt},null,-1));function zt(t,e){return d(),w("div",jt,[n("div",null,[Ut,n("p",null,_(t.$t("fairAndSafe")),1),Kt])])}const Yt=L(Ot,[["render",zt],["__scopeId","data-v-5eb72be7"],["__file","/var/lib/jenkins/workspace/web-印度-Tiranga-webnew/entrance/tiranga/StartPage.vue"]]),qt={class:"header"},Xt={class:"title"},Wt={class:"tip"},Jt={class:"container"},Qt={class:"footer"},Zt=B({__name:"dialog",setup(t){const e=te(),a=J(),o=m(!1),{closeFirstSave:s}=ee(),{ActiveSotre:i,getFirstRechargeList:r}=re(),l=Pe(new Date).format("YYYY-MM-DD"),u=xe("firstSave",null),p=F(()=>u.value==l),f=()=>{p.value?(u.value="",localStorage.removeItem("firstSave")):u.value=l},V=()=>{o.value=!1,s()},P=["activity","home","main","wallet","promotion"];W(()=>a.name,b=>{P.includes(a.name)&&x()});const x=()=>{u.value!=l&&r().then(b=>{if(!b.length){o.value=!1,s();return}const $=b.find(S=>S.isFinshed);$&&(i.value.isShowFirstSaveDialog=!1),$||(o.value=!0)})},G=()=>{o.value=!1,s(!0),e.push({name:"FirstRecharge"})},H=()=>{o.value=!1,s(!0),e.push({name:"Recharge"})};return O(()=>{P.includes(a.name)&&x()}),(b,$)=>{const S=E("svg-icon"),M=E("van-dialog");return d(),C(M,{show:o.value,"onUpdate:show":$[0]||($[0]=N=>o.value=N),className:"firstSaveDialog"},{title:T(()=>[n("div",qt,[n("div",Xt,_(b.$t("firstDialogH")),1),n("div",Wt,_(b.$t("firstDialogTip")),1)])]),footer:T(()=>[n("div",Qt,[n("div",{class:ve(["active",{a:p.value}]),onClick:f},[k(S,{name:"active"}),Ne(_(b.$t("noTipToday")),1)],2),n("div",{class:"btn",onClick:G},_(b.$t("activity")),1)])]),default:T(()=>[n("div",Jt,[k(he,{list:c(i).FirstRechargeList,onGorecharge:H},null,8,["list"])]),n("div",{class:"close",onClick:V})]),_:1},8,["show"])}}});const ea=L(Zt,[["__scopeId","data-v-9cd12fb2"],["__file","/var/lib/jenkins/workspace/web-印度-Tiranga-webnew/src/components/Activity/FirstRecharge/dialog.vue"]]),ta={class:"dialog-window"},aa={class:"dialog-wrapper"},sa={class:"dialog-title"},oa={class:"dialog-content"},na={class:"dialog-window"},ia={class:"dialog-wrapper"},la={class:"dialog-title"},ra={class:"dialog-tips"},ca={class:"dialog-content"},ua={class:"dialog-tips",style:{"margin-bottom":"0"}},da={class:"dialog-window"},va={class:"dialog-wrapper"},_a={class:"dialog-tips",style:{"margin-top":"10px"}},ma={class:"dialog-title",style:{"margin-top":"0"}},pa={class:"dialog-tips"},fa={class:"dialog-content"},ga=B({__name:"AllPageDialog",setup(t){J();const{ActiveSotre:e}=re(),{store:a,closeInvite:o,showFirstSave:s,onReturnAwards:i}=ee();return(r,l)=>{const u=E("van-dialog"),p=pe("lazy");return d(),w(Q,null,[c(s)?(d(),C(ea,{key:0})):y("v-if",!0),k(u,{show:c(e).showReceiveDialog,"onUpdate:show":l[1]||(l[1]=f=>c(e).showReceiveDialog=f),"show-confirm-button":!1,className:"noOverHidden"},{default:T(()=>[n("div",ta,[n("div",aa,[A(n("img",null,null,512),[[p,c(U)("public","succeed")]]),n("div",sa,_(r.$t("awardsReceived")),1),n("div",oa,[A(n("img",null,null,512),[[p,c(U)("activity/DailyTask","amountIcon")]]),n("span",null,_(c(Z)(c(e).receiveAmount)),1)]),n("div",{class:"dialog-btn",onClick:l[0]||(l[0]=f=>c(e).showReceiveDialog=!1)},_(r.$t("confirm")),1)])])]),_:1},8,["show"]),k(u,{show:c(a).invite,"onUpdate:show":l[3]||(l[3]=f=>c(a).invite=f),"show-confirm-button":!1,className:"noOverHidden"},{default:T(()=>[n("div",na,[n("div",ia,[A(n("img",null,null,512),[[p,c(U)("public","succeed")]]),n("div",la,_(r.$t("inviteTips")),1),n("p",ra,_(r.$t("inviteAmount")),1),n("div",ca,[n("span",ua,_(r.$t("commissionAmount")),1),n("span",null,_(c(Z)(c(a).rebateAmount)),1)]),n("div",{class:"dialog-btn",onClick:l[2]||(l[2]=f=>c(o)())},_(r.$t("receive")),1)])])]),_:1},8,["show"]),k(u,{show:c(a).oldUser,"onUpdate:show":l[5]||(l[5]=f=>c(a).oldUser=f),"show-confirm-button":!1,"close-on-click-overlay":!0,className:"noOverHidden"},{default:T(()=>[n("div",da,[n("div",va,[A(n("img",null,null,512),[[p,c(U)("public","succeed")]]),n("p",_a,_(r.$t("oldPromptTip")),1),n("div",ma,_(r.$t("oldPrompt")),1),n("p",pa,_(r.$t("oldPromptGift")),1),n("div",fa,[n("span",null,_(c(Z)(c(a).returnAwards)),1)]),n("div",{class:"dialog-btn",onClick:l[4]||(l[4]=f=>c(i)())},_(r.$t("receive")),1)])])]),_:1},8,["show"])],64)}}});const ha=L(ga,[["__scopeId","data-v-3d4fafbb"],["__file","/var/lib/jenkins/workspace/web-印度-Tiranga-webnew/src/components/common/AllPageDialog.vue"]]),ba=B({__name:"App",setup(t){me(h=>({"f13b4d11-currentFontFamily":N.value}));const{openAll:e}=ee(),a=Ae(),o=m(!1),s=m(!1),i=J(),r=be(),l=ce(),{locale:u}=Re(),p=le(),f=m(!1),V=F(()=>i.meta.tabBar),P="damanHome",x=F(()=>["electronic","blackGoldHome"].includes(P)?!1:!["/wallet/Withdraw/C2cDetail","/wallet/RechargeHistory/RechargeUpiDetail","/wallet/Withdraw/Upi","/wallet/Withdraw/AddUpi","/wallet/Withdraw/c2cCancelWithdrawal/index.vue","/wallet/otherPay?type=C2C","/home/game"].includes(i.path)),G=m(0),H=m(Math.floor(Math.random()*1e4)),b=F(()=>i.name+H.value),$=()=>{a.on("changeKeepAliveKey",()=>{H.value=Math.floor(Math.random()*1e4)})};sessionStorage.getItem("isload")?o.value=!1:(s.value=!0,sessionStorage.setItem("isload",s.value.toString()),o.value=!0),l.getHomeSetting(),W(()=>l.getAreacode,h=>{h&&r.setNumberType(h.substring(1))}),W(()=>l.getDL,h=>{u.value=h,p.updateLanguage(h),Le(h),Ie(ue.global.t)}),setTimeout(()=>{o.value=!1},2e3);const S=m(!1),M=ye();M.$subscribe((h,D)=>{S.value=D.isLoading,M.setLoading(S.value)});const N=m("bahnschrift");let v=we(),g=l.getLanguage,I=ke(v,g);const R=async h=>{const D=[{title:"vi",fontStyle:"bahnschrift"},{title:"else",fontStyle:"'Roboto', 'Inter', sans-serif"}],q=D.findIndex(X=>X.title==I);q>=0?N.value=D[q].fontStyle:N.value=D[D.length-1].fontStyle},z=()=>{a.on("keyChange",()=>{G.value++}),a.on("changeIsGame",()=>{f.value=!f.value,S.value=!S.value})},Y=()=>{a.off("keyChange"),a.off("changeKeepAliveKey"),a.off("changeIsGame")};return r.setNumberType(l.getAreacode.substring(1)),R(),O(()=>{Se()&&Ce(),e(),Y(),z(),$(),localStorage.getItem("language")&&$e(localStorage.getItem("language"))}),Vt(),(h,D)=>{const q=E("LoadingView");return d(),w(Q,null,[k(q,{loading:S.value,type:"loading",isGame:f.value},{default:T(()=>[(d(),C(c(Ve),{key:G.value},{default:T(({Component:X})=>[(d(),C(Fe,{max:1},[c(i).meta.keepAlive?(d(),C(ne(X),{key:b.value})):y("v-if",!0)],1024)),c(i).meta.keepAlive?y("v-if",!0):(d(),C(ne(X),{key:0}))]),_:1})),y("online custom service"),x.value?(d(),C(Ht,{key:0})):(d(),C(c(Ge),{key:1,license:"15861567"})),V.value?(d(),C(Ft,{key:2})):y("v-if",!0)]),_:1},8,["loading","isGame"]),o.value?(d(),C(Yt,{key:0})):y("v-if",!0),k(ha)],64)}}});const ya=L(ba,[["__file","/var/lib/jenkins/workspace/web-印度-Tiranga-webnew/entrance/tiranga/App.vue"]]);const wa={mounted(t,e){if(typeof e.value[0]!="function"||typeof e.value[1]!="number")throw new Error("v-debounce: value must be an array that includes a function and a number");let a=null;const o=e.value[0],s=e.value[1];t.__handleClick__=function(){a&&clearTimeout(a),a=setTimeout(()=>{o()},s||500)},t.addEventListener("click",t.__handleClick__)},beforeUnmount(t){t.removeEventListener("click",t.__handleClick__)}},ka={mounted(t,e){if(typeof e.value[0]!="function"||typeof e.value[1]!="number")throw new Error("v-throttle: value must be an array that includes a function and a number");let a=null;const o=e.value[0],s=e.value[1];t.__handleClick__=function(){a&&clearTimeout(a),t.disabled||(t.disabled=!0,o(),a=setTimeout(()=>{t.disabled=!1},s||500))},t.addEventListener("click",t.__handleClick__)},beforeUnmount(t){t.removeEventListener("click",t.__handleClick__)}},Sa={mounted(t,e){t.addEventListener("input",a=>{const s=t.value.replace(/\D+/g,"");t.value=s,e.value=s})}},Ca=t=>({beforeMount:(e,a)=>{e.classList.add("ar-lazyload");const{value:o}=a;e.dataset.origin=o,t.observe(e)},updated(e,a){e.dataset.origin=a.value,t.observe(e)},unmounted(e,a){t.unobserve(e)},mounted(e,a){t.observe(e)}}),$a={mounted(t,e){let a=0;const o=e.value&&e.value.wait?e.value.wait:3e3,s=i=>{const r=Date.now();r-a>=o&&(a=r,e.value&&e.value.handler&&e.value.handler(i))};t.addEventListener("click",s),t._throttleClickCleanup=()=>{t.removeEventListener("click",s)}},unmounted(t){t._throttleClickCleanup&&t._throttleClickCleanup(),delete t._throttleClickCleanup}},Aa={mounted(t,e){const{value:a}=e;let o=He("permission",null);o.value===null||!a||(o&&(o=JSON.parse(o.value)),o&&o[a]===!1&&(t.style.display="none"))}},ie={debounce:wa,throttle:ka,onlyNum:Sa,throttleClick:$a,haspermission:Aa},La={install:function(t){Object.keys(ie).forEach(a=>{t.directive(a,ie[a])});const e=new IntersectionObserver(a=>{a.forEach(o=>{if(o.isIntersecting){const s=o.target;s.src=s.dataset.origin||se("images","avatar"),s.onerror=()=>{e.unobserve(s);let i=s.dataset.img||se("images","avatar");if(!i||i!=null&&i.includes("undefined")){s.onerror=null;return}s.src=i,s.style.objectFit="contain"},s.classList.remove("ar-lazyload"),e.unobserve(s)}})},{rootMargin:"0px 0px -50px 0px"});t.directive("lazy",Ca(e))}},Ia={class:"navbar-fixed"},Da={class:"navbar__content"},Ta={class:"navbar__content-center"},Ea={class:"navbar__content-title"},Ba=B({__name:"NavBar",props:{title:{type:String,default:""},placeholder:{type:Boolean,default:!0},leftArrow:{type:Boolean,default:!1},backgroundColor:{type:String,default:"#f7f8ff"},classN:{type:String,default:""},headLogo:{type:Boolean,default:!1},headerUrl:{type:String,default:""}},emits:["click-left","click-right"],setup(t,{emit:e}){const a=m(),o=ce(),s=F(()=>o.getHeadLogo),i=()=>{e("click-left")},r=()=>{e("click-right")};return O(()=>{}),(l,u)=>{const p=E("van-icon");return d(),w("div",{class:"navbar",ref_key:"navbar",ref:a},[n("div",Ia,[n("div",Da,[n("div",{class:"navbar__content-left",onClick:i},[K(l.$slots,"left",{},()=>[t.leftArrow?(d(),C(p,{key:0,name:"arrow-left"})):y("v-if",!0)],!0)]),n("div",Ta,[t.headLogo?(d(),w("div",{key:0,class:"headLogo",style:Me({backgroundImage:"url("+(t.headerUrl||s.value)+")"})},null,4)):y("v-if",!0),K(l.$slots,"center",{},()=>[n("div",Ea,_(t.title),1)],!0)]),n("div",{class:"navbar__content-right",onClick:r},[K(l.$slots,"right",{},void 0,!0)])])])],512)}}});const Pa=L(Ba,[["__scopeId","data-v-12a80a3e"],["__file","/var/lib/jenkins/workspace/web-印度-Tiranga-webnew/src/components/common/NavBar.vue"]]),xa={class:"ar-loading-view"},Na={class:"loading-wrapper"},Ra={class:"com__box"},Fa=Ue('<div class="loading" data-v-647954c7><div class="shape shape-1" data-v-647954c7></div><div class="shape shape-2" data-v-647954c7></div><div class="shape shape-3" data-v-647954c7></div><div class="shape shape-4" data-v-647954c7></div></div>',1),Va={class:"skeleton-wrapper"},Ga=B({__name:"LoadingView",props:{loading:{type:Boolean,required:!0},type:{type:String,required:!0},isGame:{type:Boolean,required:!0}},setup(t){const e=t,a=m();let o=null;return O(async()=>{await Oe(),o=je.loadAnimation({container:a.value,renderer:"svg",loop:!0,autoplay:!0,path:"/data.json"})}),W(()=>e.loading,()=>{e.type==="loading"&&!e.isGame&&(e.loading?o&&o.play():o&&o.stop())}),_e(()=>{o&&o.destroy(),o=null}),(s,i)=>{const r=E("VanSkeleton");return d(),w(Q,null,[A(n("div",xa,[K(s.$slots,"template",{},()=>[A(n("div",Na,[y(" <VanLoading /> "),A(n("div",{ref_key:"element",ref:a,class:"loading-animat"},null,512),[[j,!s.isGame]]),A(n("div",Ra,[y(" loading "),Fa,y(" 说明：组件名 ")],512),[[j,s.isGame]]),y(' <div class="animation"></div> ')],512),[[j,s.type==="loading"]]),A(n("div",Va,[k(r,{row:10}),k(r,{title:"",avatar:"",row:5}),k(r,{title:"",row:5})],512),[[j,s.type==="skeleton"]])],!0)],512),[[j,s.loading]]),K(s.$slots,"default",{},void 0,!0)],64)}}});const Ha=L(Ga,[["__scopeId","data-v-647954c7"],["__file","/var/lib/jenkins/workspace/web-印度-Tiranga-webnew/src/components/common/LoadingView.vue"]]);const Ma=["xlink:href"],Oa={__name:"svgIcons",props:{name:{type:String,required:!0},color:{type:String,default:""}},setup(t){const e=t,a=F(()=>`#icon-${e.name}`),o=F(()=>e.name?`svg-icon icon-${e.name}`:"svg-icon");return(s,i)=>(d(),w("svg",Ke({class:o.value},s.$attrs,{style:{color:t.color}}),[n("use",{"xlink:href":a.value},null,8,Ma)],16))}},ja=L(Oa,[["__file","/var/lib/jenkins/workspace/web-印度-Tiranga-webnew/src/components/common/svgIcons.vue"]]),Ua={class:"ar-searchbar__selector"},Ka={class:"ar-searchbar__selector-default"},za=B({__name:"ArSelect",props:{selectName:{type:String,default:""}},emits:["click-select"],setup(t,{emit:e}){const a=()=>{e("click-select")};return(o,s)=>{const i=E("van-icon");return d(),w("div",Ua,[n("div",{onClick:a},[n("span",Ka,_(t.selectName),1),k(i,{name:"arrow-down"})])])}}});const Ya=L(za,[["__scopeId","data-v-fa757a88"],["__file","/var/lib/jenkins/workspace/web-印度-Tiranga-webnew/src/components/common/ArSelect.vue"]]),qa=t=>{t.component("NavBar",Pa),t.component("LoadingView",Ha),t.component("ArSelect",Ya),t.component("svg-icon",ja),t.use(ze).use(Ye).use(qe).use(Xe).use(We).use(Je).use(Qe).use(Ze).use(et).use(tt).use(at).use(st).use(ot).use(nt).use(it).use(lt).use(rt).use(ct).use(ut).use(dt).use(vt).use(_t).use(mt).use(pt).use(ft).use(gt).use(ht).use(bt).use(yt).use(wt).use(kt).use(St).use(Ct).use($t).use(At).use(Lt).use(It).use(ue).use(La).use(Dt);let e=t.config.globalProperties,a={};a.TopHeight=38,Object.keys(oe.refiter).forEach(o=>{a[o]=oe.refiter[o]}),e.$u=a};de.addRoute({path:"/",name:"home",component:()=>De(()=>import("./page-home-5d70e52b.js").then(t=>t.X),["assets/js/page-home-5d70e52b.js","assets/js/modules-6b0d6df4.js","assets/css/modules-b642e9bc.css","assets/js/page-activity-d3ba61d1.js","assets/js/native/index-7b2487e5.js","assets/js/en-93cdab10.js","assets/js/rus-ecb14220.js","assets/js/vi-40bd560a.js","assets/js/id-24cc3835.js","assets/js/hd-c5b1d7e8.js","assets/js/tha-330057b2.js","assets/js/md-02b1fc1c.js","assets/js/bra-1f3ea623.js","assets/js/my-80d37f62.js","assets/js/bdt-d8f19d0c.js","assets/js/zh-3589f8b3.js","assets/js/pak-9f46abf2.js","assets/js/ar-64903102.js","assets/css/page-activity-4fe5c6bf.css","assets/css/page-home-522c97b9.css"]),meta:{title:"home",tabBar:!0,keepAlive:!1}});const ae=Tt(ya),ge=Et();qa(ae);ge.use(Bt);ae.use(de).use(ge);ae.mount("#app");
