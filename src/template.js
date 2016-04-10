const tpl = require('tpl'),
  cache = {};

module.exports = {
  load(id, tmpl) {
    let l = arguments.length;
    return new Promise(function(resolve, reject) {
      if (l == 1) {
        if (tmpl = cache[id]) {
          resolve(tmpl, id);
        } else {
          fetch(id).then(function(resp) {
            return resp.text();
          }).then(function(tmpl) {
            tmpl = cache[id] = new tpl(tmpl);
            reject(tmpl, id);
          }).catch(function() {
            reject('load remote template failed:' + id);
          });
        }
      } else if (typeof tmpl == 'string') {
        resolve((cache[id] = new tpl(tmpl)), id);
      } else if (tmpl instanceof tpl) {
        resolve((cache[id] = tmpl), id);
      } else {
        reject('invalid template:' + tmpl);
      }
    });
  }
}

tpl.ready(function() {
  let tmpls = tpl.query('script[type="text/tpl"]', true), tmpl, id;
  for (let i = 0, l = tmpls.length; i < l; i++) {
    tmpl = tmpls[i];
    id = tpl.attr(tmpl, 'id');
    if (id)
      cache[id] = new tpl(tpl.html(tmpl));
    console.debug('loaded script template:' + id, tmpl);
  }
});
