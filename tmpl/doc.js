const dat = require('dat'),
  _ = require('lodash'),
  $ = require('jquery'),
  rivets = require('rivets');
let Doc = {},
  Compontents = {<% for (var i = 0; i < modules.length; i++) { %>
    <%= modules[i].name %> : {
        demos : {<% var demoNames = Object.keys(modules[i].demos);
            demoNames.forEach(function(demoName, idx){ %>
            <%=demoName%> : {
                compontent : require('<%=modules[i].demos[demoName].path%>'),
                code : '<%=modules[i].demos[demoName].content.replace(/[\r\n]/g, '\\n').replace(/\t/g, '  ')%>'
            }<%= (idx < demoNames.length - 1) ? "," : "" %><%})%>
        },
        readmes : {<% var readmeNames = Object.keys(modules[i].readmes);
            readmeNames.forEach(function(readmeName, idx){ %>
            <%=readmeName%> : '<%=modules[i].readmes[readmeName].replace(/\n/g, '\\n').replace(/\t/g, '  ')%>'<%= idx < readmeNames.length - 1 ? "," : "" %><%})%>
        }
    }<%= i < modules.length - 1 ? "," : "" %><% } %>
  };

Doc.Compontents = Compontents;
dat.Doc = Doc;
$(document).ready(function(){
  let data =  {auction: {
    product:{
      name:'test'
    },
    timeLeft: 80
  }},
  view = rivets.bind($(require('template/a.html.js')),data)
  window.view = view;
  window.data = data;
  function setTime(){
    data.auction.timeLeft++;
    setTimeout(setTime, 1000);
  }
  setTime();
  $(document.body).append(view.els)
  console.log(view);
});
module.exports = dat;
