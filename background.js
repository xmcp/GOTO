localStorage['rules']=localStorage['rules']||JSON.stringify([
  ['bilibili','^av(\\d+)$','http://bilibili.com/video/av$1'],
  ['lydsy','^bz(\\d+)$','http://www.lydsy.com/JudgeOnline/problem.php?id=$1']
]);
localStorage['newtab']=localStorage['newtab']||'0';

rules=JSON.parse(localStorage['rules']);

function esc(unsafe) {
  return unsafe.replace(/[<>&'"]/g, function(c) {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
    }
  });
}

function open_tab(url) {
  if(localStorage['newtab']==='1')
    chrome.tabs.create({
      url: url,
      active: true,
    });
  else
    chrome.tabs.query(
      {active: true, currentWindow: true},
      function(tabs) {
        chrome.tabs.update(tabs[0].id, {url: url});
      }
    );
}

chrome.omnibox.onInputChanged.addListener(function(text,suggest){
  var sug=[];
  rules.forEach(function(rule) {
    var re=RegExp(rule[1]);
    if(re.test(text))
      sug.push({
        content: '>>> '+text.replace(re,rule[2]),
        description: '<dim>'+esc(text)+'</dim> <match>'+esc('<'+rule[0]+'>')+'</match> <url>'+esc(text.replace(re,rule[2]))+'</url>'
      });
  });
  if(sug.length) {
    chrome.omnibox.setDefaultSuggestion({description:sug.splice(0,1)[0].description});
    suggest(sug);
  } else {
    chrome.omnibox.setDefaultSuggestion({description:'<dim>'+esc(text)+'</dim> &lt;无匹配&gt;'});
  }
});

chrome.omnibox.onInputEntered.addListener(function(text){
  if(text.indexOf('>>> ')==0)
    open_tab(text.substr(4,text.length));
  else {
    for(var i=0;i<rules.length;i++) {
      var re=RegExp(rules[i][1]);
      if(re.test(text)) {
        open_tab(text.replace(re,rules[i][2]));
        return;
      }
    }
    alert('输入未匹配任何规则');
  }
});
