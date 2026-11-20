!function(){var a="G-P2NRMK4P7E";if(-1===a.indexOf("XXXX")){var e=document.createElement("script");e.async=!0,e.src="https://www.googletagmanager.com/gtag/js?id="+a,document.head.appendChild(e),window.dataLayer=window.dataLayer||[],window.gtag=n,n("js",new Date),n("config",a)}function n(){dataLayer.push(arguments)}}();
/* lead tracking: marks the clicks that matter so they can be set as Key events in GA4 */
document.addEventListener("click",function(e){try{var l=e.target.closest&&e.target.closest("a");if(!l||!window.gtag)return;var h=l.getAttribute("href")||"";
if(/wa\.me|api\.whatsapp\.com/.test(h))gtag("event","generate_lead",{method:"whatsapp",link_url:h,page_path:location.pathname});
else if(/#book-demo/.test(h))gtag("event","book_free_class_click",{page_path:location.pathname});
else if(/^mailto:/.test(h))gtag("event","generate_lead",{method:"email",page_path:location.pathname});
else if(/\/pay\/?(\?|#|$)/.test(h))gtag("event","begin_checkout_click",{page_path:location.pathname})}catch(_){}},true);
