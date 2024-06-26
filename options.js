function $$(x) {return document.getElementById(x);};
$newtab = $$('newtab');
$result = $$('result-body');

function esc(s) {
  return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}
function esc_attr(s) { // http://stackoverflow.com/questions/7753448/how-do-i-escape-quotes-in-html-attribute-values
    preserveCR = '&#13;';
    return ('' + s)
        .replace(/&/g, '&amp;')
        .replace(/'/g, '&apos;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\r\n/g, preserveCR)
        .replace(/[\r\n]/g, preserveCR);
        ;
}

chrome.storage.sync.get(['rules', 'newtab'], function({rules, newtab}) {
    function mk_editable(i) {
        $$('result-'+i).innerHTML=
            '<td><input id="box-r0-'+i+'" value="'+esc(rules[i][0])+'"></td>'+
            '<td><input id="box-r1-'+i+'" value="'+esc(rules[i][1])+'"></td>'+
            '<td><input id="box-r2-'+i+'" value="'+esc(rules[i][2])+'"></td>'+
            '<td>'+
                '<button type="button" id="save-btn-'+i+'">Save</button>'+
                '<button type="button" id="del-btn-'+i+'">Delete</button>'+
            '</td>';
        $$('save-btn-'+i).addEventListener('click',function(){
            rules[i][0] = $$('box-r0-'+i).value;
            rules[i][1] = $$('box-r1-'+i).value;
            rules[i][2] = $$('box-r2-'+i).value;
            save();
        });
        $$('del-btn-'+i).addEventListener('click',function(){
            rules.splice(i,1);
            save();
        });
    }

    function save() {
        chrome.storage.sync.set({
            rules: rules,
            newtab: newtab,
        });
        location.reload();
    }

    for(let i = 0; i<rules.length; i++) {
        var row = document.createElement('tr');
        row.id = 'result-'+i;
        row.innerHTML=
            '<td>'+esc(rules[i][0])+'</td>'+
            '<td><pre>'+esc(rules[i][1])+'</pre></td>'+
            '<td><pre>'+esc(rules[i][2])+'</pre></td>'+
            '<td>'+
                '<button type="button" id="edit-btn-'+i+'">Edit</button>'+
                '<button type="button" id="del-btn-'+i+'">Delete</button>'+
            '</td>';
        
        $result.appendChild(row);
        $$('edit-btn-'+i).addEventListener('click',function(){
            mk_editable(i);
        });
        $$('del-btn-'+i).addEventListener('click',function(){
            rules.splice(i, 1);
            save();
        });
    };

    $newtab.checked = newtab;
    $newtab.addEventListener('change',function(){
      newtab = $newtab.checked;
      save();
    });
    $$('create').addEventListener('click',function(){
      rules.push(['name','^$','http://$1']);
      save();
    });
});