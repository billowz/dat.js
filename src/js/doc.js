/*@MODULE_GENERATOR@*/
const dat = require('dat'),
  _ = require('lodash'),
  $ = require('jquery'),
  rivets = require('rivets');
let Doc = {},
  Compontents = {
    Animate : {
        demos : {
            Demo : {
                compontent : require('./animate/doc/demo'),
                code : ''
            }
        },
        readmes : {
        }
    }
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
