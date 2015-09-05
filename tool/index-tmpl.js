<%if(!path){%>
/**!
 * Dat.js
 *
 *
 * @copyright 2015 tao.zeng
 * @license MIT
 */<%}else{%>
/**!
 * Dat.js Module:<%=path%>
 */<%}%>

module.exports = {<%for(var i=0; i<modules.length; i++){%>
  <%=modules[i].name%>: require('<%=modules[i].reqpath%>')<%=i<modules.length-1?',':''%><%}%>
};
