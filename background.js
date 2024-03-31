let rules = [];
let newtab = false;

function load_config() {
    chrome.storage.sync.get(['rules', 'newtab'], function(r) {
        console.log('load_config', r);
        rules = r['rules'] || [];
        newtab = r['newtab'] || false;
    });
}
load_config();
chrome.storage.onChanged.addListener(load_config);

chrome.runtime.onInstalled.addListener(function(details) {
    if (details.reason==='install') {
        chrome.storage.sync.set({
            rules: [
                ['bilibili','^av(\\d+)$','http://bilibili.com/video/av$1'],
            ],
            newtab: false,
        });
    }
});

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
    if(newtab)
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

chrome.omnibox.onInputChanged.addListener(function(text, suggest){
    let sug = [];
    rules.forEach(function([name, reg, rep]) {
        let re = RegExp(reg);
        if(re.test(text))
            sug.push({
                content: '>>> '+text.replace(re, rep),
                description: '<dim>'+esc(text)+'</dim> <match>'+esc('<'+name+'>')+'</match> <url>'+esc(text.replace(re, rep))+'</url>'
            });
    });
    if(sug.length) {
        chrome.omnibox.setDefaultSuggestion({description:sug.splice(0, 1)[0].description});
        suggest(sug);
    } else {
        chrome.omnibox.setDefaultSuggestion({description:'<dim>'+esc(text)+'</dim> &lt;无匹配&gt;'});
    }
});

chrome.omnibox.onInputEntered.addListener(function(text){
    if(text.indexOf('>>> ')==0)
        open_tab(text.substr(4, text.length));
    else {
        for(let [name, reg, rep] of rules) {
            let re = RegExp(reg);
            if(re.test(text)) {
                open_tab(text.replace(re, rep));
                return;
            }
        }
        //alert('输入未匹配任何规则');
    }
});
