function $$(x) {return document.getElementById(x);};
$newtab=$$('newtab');
$result=$$('result-body');

rules=JSON.parse(localStorage['rules']);

function esc(s) {
  return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}
function esc_attr(s) { // http://stackoverflow.com/questions/7753448/how-do-i-escape-quotes-in-html-attribute-values
    preserveCR='&#13;';
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
      rules[i][0]=$$('box-r0-'+i).value;
      rules[i][1]=$$('box-r1-'+i).value;
      rules[i][2]=$$('box-r2-'+i).value;
      save();
    });
    $$('del-btn-'+i).addEventListener('click',function(){
      rules.splice(i,1);
      save();
    });
}

function save() {
  localStorage['rules']=JSON.stringify(rules);
  chrome.extension.getBackgroundPage().rules=rules;
  location.reload();
}

for(var i=0;i<rules.length;i++) {
  var row=document.createElement('tr');
  row.id='result-'+i;
  row.innerHTML=
    '<td>'+esc(rules[i][0])+'</td>'+
    '<td><pre>'+esc(rules[i][1])+'</pre></td>'+
    '<td><pre>'+esc(rules[i][2])+'</pre></td>'+
    '<td>'+
      '<button type="button" id="edit-btn-'+i+'">Edit</button>'+
      '<button type="button" id="del-btn-'+i+'">Delete</button>'+
    '</td>';
  
  $result.appendChild(row);
  (function(i){
    $$('edit-btn-'+i).addEventListener('click',function(){
      mk_editable(i);
    });
    $$('del-btn-'+i).addEventListener('click',function(){
      rules.splice(i,1);
      save();
    });
  })(i);
};

$newtab.checked=localStorage['newtab']==='1';
$newtab.addEventListener('change',function(){
  localStorage['newtab']=$newtab.checked?'1':'0';
  location.reload();
});
$$('create').addEventListener('click',function(){
  rules.push(['name','^$','http://$1']);
  save();
});