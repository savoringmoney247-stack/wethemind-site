/* Amazon links. Put each Associates tracking ID in TAGS once the accounts exist; until then the links are plain Amazon searches. */
(function(){
var TAGS={com:"",uk:"",in:""};
var HOST={com:"www.amazon.com",uk:"www.amazon.co.uk",in:"www.amazon.in"};
document.querySelectorAll("a.buy[data-q]").forEach(function(a){
var r=a.getAttribute("data-r")||"com";
var u="https://"+HOST[r]+"/s?k="+encodeURIComponent(a.getAttribute("data-q"));
if(TAGS[r])u+="&tag="+encodeURIComponent(TAGS[r]);
a.href=u;
});
})();
