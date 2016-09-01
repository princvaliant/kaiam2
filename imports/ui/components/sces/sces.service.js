'use strict';

/**
 * @ngdoc function
 * @name ScesService
 * @module kaiamSces
 * @kind function
 *
 *
 */

angular.module('kaiamSces')
  .service('ScesService', ['$translate', '$q', '$cookies',
    function($translate, $q, $cookies) {
      let service = {
        // Retrieves list of domains that user is allowed to create
        createList: function(user) {
          let ret = [];
          _.each(ScesSettings.domains, (o) => {
            if (_.intersection(user.profile.roles, o._start.roles).length > 0) {
              ret.push(o.type);
            }
          });
          return ret;
        },
        // Retrieve all domains for dropdown filter
        domainFilters: function() {
          return _.keys(ScesSettings.columns);
        },
        readFileAsync: function(file) {
          let deferred = $q.defer();
          let fileReader = new FileReader();
          fileReader.readAsText(file);
          fileReader.onload = function(e) {
            deferred.resolve(e.target.result);
          };
          return deferred.promise;
        },

        tosteps: function(bprun) {
          if (!bprun) {
            return [];
          }
          let step = bprun.state.step;
          return bpDef[step].next;
        },

        canEdit: function(user, bprun) {
          let ret = false;
          if (bpDef[bprun.state.step].state !== undefined) {
            if (_.intersection(user.profile.roles, bpDef[bprun.state.step].roles.e).length > 0) {
              ret = true;
            }
          }
          return ret;
        },


        states: function(user) {
          let ret = [''];
          for (let i in bpDef) {
            if (bpDef[i].state !== undefined) {
              if (_.intersection(user.profile.roles, bpDef[i].roles.v).length > 0) {
                ret.push(bpDef[i].state);
              }
            }
          }
          return ret;
        },

        getTableProps: function(domain) {
          let tb = {};
          tb.page = parseInt($cookies.get(domain + 'Page') || '1');
          tb.limit = parseInt($cookies.get(domain + 'Limit') || '10');
          tb.sort = $cookies.getObject(domain + 'Sort') || {
            'state.when': -1
          };
          tb.qsort = Object.keys(tb.sort)[0];
          if (tb.sort[tb.qsort] === -1) {
            tb.qsort = '-' + tb.qsort;
          }
          return tb;
        },

        printBarcode: function(win, doc, code, pnum, qty) {
          let printContents = doc.getElementById(code).innerHTML;
          let popupWin = win.open('', '_blank', 'width=130,height=250');
          popupWin.document.open();
          popupWin.document.write('<html><head></head><body style="margin-left:0pt;' +
            'padding-left: 14pt !important;' +
            'margin-top: 34pt !important;' +
            'height: 240px !important;' +
            'width: 130px !important;' +
            '"><div style="-ms-transform: rotate(90deg);' +
            '-webkit-transform: rotate(90deg);' +
            'transform: rotate(90deg);font-size:14px;font-weight:700;font-family:Tahoma;white-space:nowrap;">' +
            '<div style="float:left;width:230px !important;height:100px !important;margin:0;padding-left:10px !important;">' +
            printContents + '</div><div> ' +
            pnum + '<br/>Qty: ' + qty + '</div></div></body></html>' +
            '<script type="text/javascript">window.print();setTimeout(function(){window.close();}, 1000);</script>');
        }
      };

      return service;
    }
  ]);
