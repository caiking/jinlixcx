var WxParse     = require('components/wxParse/wxParse.js');
var util = require('utils/util.js');

App({
  onLaunch: function () {
    var userInfo;
    if(userInfo = wx.getStorageSync('userInfo')){
      this.globalData.userInfo = userInfo;
    }
  },
  getAppData: function(){
    wx.request({
      url: '/index.php?r=AppData/detail',
      data: {
        app_id: this.globalData.appId
      },
      header: {
        'content-type': 'application/json'
      },
      success: function(res) {
        if (res.status !== 0) { return; }
        var that = this,
            info = res.data;

        this.globalData.formData = info.form_data;
      }
    });
  },

  sendRequest: function(param, customSiteUrl){
    var that = this,
        data = param.data || {},
        header = param.header,
        requestUrl;

    data._app_id = this.getAppId();
    data.app_id = this.getAppId();
    if(!this.globalData.notBindXcxAppId){
      data.session_key = this.getSessionKey();
    }

    if(customSiteUrl) {
      requestUrl = customSiteUrl + param.url;
    } else {
      requestUrl = this.globalData.siteBaseUrl + param.url;
    }

    if(param.method){
      if(param.method.toLowerCase() == 'post'){
        data = this.modifyPostParam(data);
        header = header || {
          'content-type': 'application/x-www-form-urlencoded;'
        }
      }
      param.method = param.method.toUpperCase();
    }

    this.showToast({
      title: '请求中...',
      icon: 'loading'
    });
    wx.request({
      url: requestUrl,
      data: data,
      method: param.method || 'GET',
      header: header || {
        'content-type': 'application/json'
      },
      success: function(res) {
        if(res.statusCode && res.statusCode != 200){
          that.hideToast();
          that.showModal({
            content: ''+res.errMsg
          });
          return;
        }
        if(res.data.status){
          if(res.data.status == 401){
            that.login();
            return;
          }
          if(res.data.status != 0){
            that.hideToast();
            that.showModal({
              content: ''+res.data.data
            });
            return;
          }
        }
        typeof param.success == 'function' && param.success(res.data);
      },
      fail: function(res){
        that.showModal({
          content: '请求失败 '+res.errMsg
        })
        typeof param.fail == 'function' && param.fail(res.data);
      },
      complete: function(res){
        typeof param.complete == 'function' && param.complete(res.data);
      }
    });
  },
  turnToPage: function(url, isRedirect){
    if(!isRedirect){
      wx.navigateTo({
        url: url
      });
    } else {
      wx.redirectTo({
        url: url
      });
    }
  },
  switchToTab: function(url){
    wx.switchTab({
      url: url
    });
  },
  turnBack: function(){
    wx.navigateBack();
  },
  setPageTitle: function(title){
    wx.setNavigationBarTitle({
      title: title
    });
  },
  showToast: function(param){
    wx.showToast({
      title: param.title,
      icon: param.icon,
      duration: param.duration || 1500,
      success: function(res){
        console.log('success');
        typeof param.success == 'function' && param.success(res);
      },
      fail: function(res){
        typeof param.fail == 'function' && param.fail(res);
      },
      complete: function(res){
        typeof param.complete == 'function' && param.complete(res);
      }
    })
  },
  hideToast: function(){
    wx.hideToast();
  },
  showModal: function(param){
    wx.showModal({
      title: param.title || '提示',
      content: param.content,
      showCancel: param.showCancel || false,
      cancelText: param.cancelText || '取消',
      cancelColor: param.cancelColor || '#000000',
      confirmText: param.confirmText || '确定',
      confirmColor: param.confirmColor || '#3CC51F',
      success: function(res) {
        if (res.confirm) {
          typeof param.confirm == 'function' && param.confirm(res);
        } else {
          typeof param.cancel == 'function' && param.cancel(res);
        }
      },
      fail: function(res){
        typeof param.fail == 'function' && param.fail(res);
      },
      complete: function(res){
        typeof param.complete == 'function' && param.complete(res);
      }
    })
  },
  chooseVideo: function(callback, maxDuration){
    wx.chooseVideo({
      sourceType: ['album', 'camera'],
      maxDuration: maxDuration || 60,
      camera: ['front', 'back'],
      success: function (res) {
        typeof callback == 'function' && callback(res.tempFilePaths[0]);
      }
    })
  },
  chooseImage: function(callback, count){
    var that = this;
    wx.chooseImage({
      count: count || 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        var tempFilePaths = res.tempFilePaths,
            imageUrls = [];

        for (var i = 0; i < tempFilePaths.length; i++) {
          wx.uploadFile({
            url : that.globalData.siteBaseUrl+ '/index.php?r=AppData/uploadImg',
            filePath: tempFilePaths[i],
            name: 'img_data',
            success: function(res){
              var data = JSON.parse(res.data);
              if(data.status == 0){
                imageUrls.push(data.data);
                if(imageUrls.length == tempFilePaths.length){
                  typeof callback == 'function' && callback(imageUrls);
                }
              } else {
                that.showModal({
                  content: data.data
                })
              }
            },
            fail: function(res){
              console.log(res.errMsg);
            }
          })
        }

      }
    })
  },
  previewImage: function(previewUrl, previewUrlsArray){
    wx.previewImage({
      current: previewUrl,
      urls: previewUrlsArray
    })
  },
  playVoice: function(filePath){
    wx.playVoice({
      filePath: filePath
    });
  },
  pauseVoice: function(){
    wx.pauseVoice();
  },
  wxPay: function(param){
    wx.requestPayment({
      'timeStamp': param.timeStamp,
      'nonceStr': param.nonceStr,
      'package': param.package,
      'signType': 'MD5',
      'paySign': param.paySign,
      success: function(res){
      },
      fail: function(res){
      }
    })
  },
  makePhoneCall: function(number, callback){
    if(number.currentTarget){
      var dataset = number.currentTarget.dataset;

      number = dataset.number;
    }
    wx.makePhoneCall({
      phoneNumber: number,
      success: callback
    })
  },
  login: function(){
    var that = this;

    wx.login({
      success: function(res){
        if (res.code) {
          that.sendCode(res.code);
        } else {
          console.log('获取用户登录态失败！' + res.errMsg)
        }
      },
      fail: function(res){
        console.log('login fail: '+res.errMsg);
      }
    })
  },
  sendCode: function(code){
    var that = this;
    this.sendRequest({
      url: '/index.php?r=AppUser/onLogin',
      data: {
        code: code
      },
      success: function(res){
        if(res.is_login == 2) {
          that.globalData.notBindXcxAppId = true;
        }
        that.setSessionKey(res.data);
        that.requestUserInfo(res.is_login);
        // typeof afterLoginCallback == 'function' && afterLoginCallback();
        that.dataInitial();
      },
      fail: function(res){
        console.log('sendCode fail');
      },
      complete: function(res){

      }
    })
  },
  sendSessionKey: function(){
    var that = this;
    try {
      var key = wx.getStorageSync('session_key');
    } catch(e) {

    }

    if (!key) {
      console.log("check login key=====");
      // this.login(afterLoginCallback);
      this.login();

    } else {
      this.globalData.sessionKey = key;
      this.sendRequest({
        url: '/index.php?r=AppUser/onLogin',
        success: function(res){
          if(!res.is_login){
            // that.login(afterLoginCallback);
            that.login();
            return;
          } else if(res.is_login == 2) {
            that.globalData.notBindXcxAppId = true;
          }
          that.requestUserInfo(res.is_login);
          that.dataInitial();
          // typeof afterLoginCallback == 'function' && afterLoginCallback();
        },
        fail: function(res){
          console.log('sendSessionKey fail');
        }
      });
    }
  },
  requestUserInfo: function(is_login){
    if(is_login==1){
      this.requestUserXcxInfo();
    } else {
      this.requestUserWxInfo();
    }
  },
  requestUserXcxInfo: function(){
    var that = this;
    this.sendRequest({
      url: '/index.php?r=AppData/getXcxUserInfo',
      success: function(res){
        if(res.status == 0){
          if(res.data){
            that.setUserInfoStorage(res.data);
          }
        }
      },
      fail: function(res){
        console.log('requestUserXcxInfo fail');
      }
    })
  },
  requestUserWxInfo: function(){
    var that = this;
    wx.getUserInfo({
      success: function(res){
        that.sendUserInfo(res.userInfo);
      },
      fail: function(res){
        console.log('requestUserWxInfo fail');
      }
    })
  },
  sendUserInfo: function(userInfo){
    var that = this;
    this.sendRequest({
      url: '/index.php?r=AppUser/LoginUser',
      method: 'post',
      data: {
        nickname: userInfo['nickName'],
        gender: userInfo['gender'],
        city: userInfo['city'],
        province: userInfo['province'],
        country: userInfo['country'],
        avatarUrl: userInfo['avatarUrl']
      },
      success: function(res){
        if(res.status == 0){
          that.setUserInfoStorage(res.data.user_info);
        }
      },
      fail: function(res){
        console.log('requestUserXcxInfo fail');
      }
    })
  },

  dataInitial: function(){
    var _this = this,
        pageInstance = this.getCurrentPage(),
        newdata = {};

    if (!!pageInstance.dataId && !!pageInstance.page_form) {
      var dataid = parseInt(pageInstance.dataId);
      var param = {};

      param.data_id = dataid;
      param.form = pageInstance.page_form;
      _this.sendRequest({
        url: '/index.php?r=AppData/getFormData',
        data: param,
        method: 'post',
        success: function (res) {
          if (res.status == 0) {
            newdata = {};
            newdata['detail_data'] = res.data[0].form_data;

            for (let i in newdata['detail_data']) {
              if (i == 'category') {
                continue;
              }

              let description = newdata['detail_data'][i];
              if (!description) {
                continue;
              }
              // let matchResult = typeof description == 'string' && description.match(/<(\S*?)[^>]*>.*?<\/\1>|<.*?\/>/g);
              /^http:\/\/img/g.test(description) || (newdata['detail_data'][i] = _this.getWxParseResult(description));
            }
            pageInstance.setData(newdata);

            if (!!pageInstance.dynamicVesselComps) { 
              for (let i in pageInstance.dynamicVesselComps) {
                let vessel_param = pageInstance.dynamicVesselComps[i].param;
                let compid = pageInstance.dynamicVesselComps[i].compid;
                if (!!newdata.detail_data[vessel_param.param_segment]) {
                  vessel_param.idx = vessel_param.search_segment;
                  vessel_param.idx_value = newdata.detail_data[vessel_param.param_segment];
                  _this.sendRequest({
                    url: '/index.php?r=AppData/getFormDataList&idx_arr[idx]=' + vessel_param.idx + "&idx_arr[idx_value]=" + vessel_param.idx_value,
                    data: {
                      app_id: vessel_param.app_id,
                      form: vessel_param.form,
                      page: 1
                    },
                    method: 'post',
                    success: function(res) {
                      if (res.status == 0) {
                        let newDynamicData = {};
                        newDynamicData['dynamic_vessel_data_' + compid] = res.data[0];
                        pageInstance.setData(newDynamicData);
                      } else {
                      }
                    },
                    fail: function() {
                      console.log("[fail info]dynamic-vessel data request  failed");
                    }
                  });
                }
              }
            }
          }
        }
      })
    }

    if (!!pageInstance.list_compids_params) {
      for (let i in pageInstance.list_compids_params) {
        let compid = pageInstance.list_compids_params[i].compid;
        let param = pageInstance.list_compids_params[i].param;
        let url = '/index.php?r=AppData/getFormDataList';
        _this.sendRequest({
          url: url,
          data: param,
          method: 'post',
          success: function (res) {
            if (res.status == 0) {
              newdata = {};

              for (let j in res.data) {
                for (let k in res.data[j].form_data) {
                  if (k == 'category') {
                    continue;
                  }

                  let description = res.data[j].form_data[k];

                  if (!description) {
                    continue;
                  }

                  // let matchResult = typeof description == 'string' && description.match(/<(\S*?)[^>]*>.*?<\/\1>|<.*?\/>/g);
                  /^http:\/\/img/g.test(description) || (res.data[j].form_data[k] = _this.getWxParseResult(description));
                }
              }

              newdata[compid + '.list_data'] = res.data;
              newdata[compid + '.is_more'] = res.is_more;
              newdata[compid + '.curpage'] = 1;

              pageInstance.setData(newdata);
            } 
          }
        });
      }
    }

    if (!!pageInstance.goods_compids_params) {
      for (let i in pageInstance.goods_compids_params) {
        let compid = pageInstance.goods_compids_params[i].compid;
        let param = pageInstance.goods_compids_params[i].param;

        if(param.form === 'takeout'){
          param.idx_arr = {
            idx: 'category',
            idx_value: pageInstance.data[compid].content[0].source
          }
        }
        _this.sendRequest({
          url: '/index.php?r=AppShop/GetGoodsList',
          data: param,
          method: 'post',
          success: function (res) {
            if (res.status == 0) {
              newdata = {};
              newdata[compid + '.goods_data'] = res.data;

              if(param.form === 'takeout'){
                var waimaiList = res.data,
                    waimaiDetail = [];

                for (var i = 0; i < waimaiList.length; i++) {
                  var detail = {
                    count: 0,
                    price: +waimaiList[i].form_data.price
                  };
                  waimaiDetail.push(detail);
                  waimaiList[i].form_data.description = _this.getWxParseResult(waimaiList[i].form_data.description);
                }

                newdata[compid + '.waimaiDetail'] = waimaiDetail;
                newdata[compid + '.waimaiTotalNum'] = _this.getWaimaiTotalNum();
                newdata[compid + '.waimaiTotalPrice'] = _this.getWaimaiTotalPrice();
              } else {
                newdata[compid + '.is_more'] = res.is_more;
                newdata[compid + '.curpage'] = 1;
              }

              pageInstance.setData(newdata);
            }
          }
        });
      }
    }


    if (!!pageInstance.relobj_auto) {
      for (let i in pageInstance.relobj_auto) {
        let objrel = pageInstance.relobj_auto[i].obj_rel;
        let AutoAddCount = pageInstance.relobj_auto[i].auto_add_count;
        let compid = pageInstance.relobj_auto[i].compid;
        let hasCounted = pageInstance.relobj_auto[i].has_counted;   // 默认是 0，没有计算过
        let parentcompid = pageInstance.relobj_auto[i].parentcompid;

        if (parentcompid != '' && parentcompid != null) {
          if (compid.search('data.') !== -1) {
            compid = compid.substr(5);
          }
          compid = parentcompid + '.' + compid;
        }

        _this.sendRequest({
          url: '/index.php?r=AppData/getCount',
          data: {
            obj_rel: objrel
          },
          success: function (res) {
            if (res.status == 0) {
              if (AutoAddCount == 1) {
                if (hasCounted == 0) {
                  _this.sendRequest({
                    url: '/index.php?r=AppData/addCount',
                    data: {
                      obj_rel: objrel
                    },
                    success: function (newres) {
                      if (newres.status == 0) {
                        newdata = {};
                        newdata[compid + '.count_data.count_num'] = parseInt(newres.data.count_num);
                        newdata[compid + '.count_data.has_count'] = parseInt(newres.data.has_count);
                        pageInstance.setData(newdata);
                      }
                    },
                    fail: function () {
                    }
                  });
                }
              } else {
                newdata = {};
                newdata[compid + '.count_data.count_num'] = parseInt(res.data.count_num);
                newdata[compid + '.count_data.has_count'] = parseInt(res.data.has_count);
                pageInstance.setData(newdata);
              }
            }
          }
        });
      }
    }

    if(pageInstance.bbsCompIds.length){
      var bbsData = pageInstance.data[pageInstance.bbsCompIds];
      _this.sendRequest({
        url: '/index.php?r=AppData/getFormDataList',
        method: 'post',
        data: {
          form: 'bbs',
          is_count: bbsData.customFeature.ifLike ? 1 : 0,
          page: 1,
          idx_arr: {
            idx: 'rel_obj',
            idx_value: bbsData.customFeature.ifBindPage && bbsData.customFeature.ifBindPage !== 'false' ? pageInstance.page_router : _this.getAppId(),
          }
        },
        success: function(res){
          var data = {};

          data[pageInstance.bbsCompIds+'.content'] = res;
          data[pageInstance.bbsCompIds+'.comment'] = {};
          pageInstance.setData(data);
        }
      })
    }
  },
  pageScrollFunc: function(compid, curpage){
    var currentPage = this.getCurrentPage();
    var newdata = {};
    var param = {};
    var _this = this;

    if (currentPage.list_compids_params) {
      for (let index in currentPage.list_compids_params) {
        if (currentPage.list_compids_params[index].compid === compid) {
          param = currentPage.list_compids_params[index].param;
          break;
        }
      }
    }

    param.page = curpage;

    if (!!currentPage.data[compid].is_more) {
      _this.sendRequest({
        url: '/index.php?r=AppData/getFormDataList',
        data: param,
        method: 'post',
        success: function (res) {
          if (res != undefined && res.status == 0) {
            newdata = {};

            for (let j in res.data) {
              for (let k in res.data[j].form_data[k]) {
                if (k == 'category') {
                  continue;
                }

                let description = res.data[j].form_data[k];

                if (!description) {
                  continue;
                }

                // let matchResult = typeof description == 'string' && description.match(/<(\S*?)[^>]*>.*?<\/\1>|<.*?\/>/g);
                /^http:\/\/img/g.test(description) || (res.data[j].form_data[k] = _this.getWxParseResult(description));
              }
            }

            newdata[compid + '.list_data'] = currentPage.data[compid].list_data.concat(res.data);
            newdata[compid + '.is_more'] = res.is_more;
            newdata[compid + '.curpage'] = res.current_page;

            currentPage.setData(newdata);
          }
        }
      })
    }
  },
  goodsScrollFunc: function(compid, curpage){
    var pageInstance = this.getCurrentPage(),
        newdata = {},
        param = {};

    if (pageInstance.goods_compids_params) {
      for (let index in pageInstance.goods_compids_params) {
        if (pageInstance.goods_compids_params[index].compid === compid) {
          param = pageInstance.goods_compids_params[index].param;
          break;
        }
      }
    }

    param.page = curpage;

    if (!!pageInstance.data[compid].is_more) {
      this.sendRequest({
        url: '/index.php?r=AppShop/GetGoodsList',
        data: param,
        method: 'post',
        success: function (res) {
          if (res.status == 0) {
            newdata = {};
            newdata[compid + '.goods_data'] = pageInstance.data[compid].goods_data.concat(res.data);
            newdata[compid + '.is_more'] = res.is_more;
            newdata[compid + '.curpage'] = res.current_page;

            pageInstance.setData(newdata);
          }
        }
      })
    }
  },
  changeCount: function(dataset){
    var pageInstance = this.getCurrentPage(),
        newdata = {},
        counted = dataset.counted,
        compid = dataset.compid,
        objrel = dataset.objrel,
        form = dataset.form,
        dataIndex = dataset.index,
        parentcompid = dataset.parentcompid,
        url;

    if(counted == 1){
      url = '/index.php?r=AppData/delCount';
    } else {
      url = '/index.php?r=AppData/addCount';
    }

    this.sendRequest({
      url: url,
      data: { obj_rel: objrel },
      success: function(res){
        newdata = {};

        if (!!form) {
        // 动态列表里
          newdata[parentcompid + '.list_data[' + dataIndex + '].count_num'] = counted == 1
            ? parseInt(pageInstance.data[parentcompid].list_data[dataIndex].count_num) - 1
            : parseInt(res.data.count_num);
          newdata[parentcompid + '.list_data[' + dataIndex + '].has_count'] = counted == 1
            ? 0 : parseInt(res.data.has_count);

        } else if (parentcompid.indexOf('bbs') === 0){
        // 评论组件里
          newdata[parentcompid + '.content.data[' + dataIndex + '].count_num'] = counted == 1
            ? parseInt(pageInstance.data[parentcompid].content.data[dataIndex].count_num) - 1
            : parseInt(res.data.count_num);
          newdata[parentcompid + '.content.data[' + dataIndex + '].has_count'] = counted == 1
            ? 0 : parseInt(res.data.has_count);

        } else {
        // 未放入容器
          if (parentcompid != '' && parentcompid != null) {
            if (compid.search('data.') !== -1) {
              compid = compid.substr(5);
            }
            compid = parentcompid + '.' + compid;
          }
          newdata[compid + '.count_data.count_num'] = parseInt(res.data.count_num);
          newdata[compid + '.count_data.has_count'] = parseInt(res.data.has_count);
          pageInstance.setData(newdata);
        }

        pageInstance.setData(newdata);
      }
    })
  },
  inputChange: function (dataset, value) {
    let pageInstance = this.getCurrentPage();
    let datakey = dataset.datakey;
    let segment = dataset.segment;

    if (!segment) {
      this.showModal({
        content: '组件未绑定字段 请在电脑编辑页绑定后使用'
      });
      return;
    }
    var newdata = {};
    newdata[datakey] = value;
    pageInstance.setData(newdata);
  },
  bindDateChange: function(dataset, value) {
    let pageInstance = this.getCurrentPage();
    let datakey      = dataset.datakey;
    let compid       = dataset.compid;
    let formcompid   = dataset.formcompid;
    let segment      = dataset.segment;
    let newdata      = {};

    compid = formcompid + compid.substr(4);

    if (!segment) {
      this.showModal({
        content: '组件未绑定字段 请在电脑编辑页绑定后使用'
      });
      return;
    }

    let obj = pageInstance.data[formcompid]['form_data'];
    if (util.isPlainObject(obj)) {
      obj = pageInstance.data[formcompid]['form_data'] = {};
    }
    obj = obj[segment];

    if (!!obj) {
      let date = obj.substr(0, 10);
      let time = obj.substr(11);

      if (obj.length == 16) {
        newdata[datakey] = value + ' ' + time;
      } else if (obj.length == 10) {  
        newdata[datakey] = value;
      } else if (obj.length == 5) {  
        newdata[datakey] = value + ' ' + obj;
      } else if (obj.length == 0) {
        newdata[datakey] = value;
      }
    } else {
      newdata[datakey] = value;
    }
    newdata[compid + '.date'] = value;
    pageInstance.setData(newdata);
  },
  bindTimeChange: function(dataset, value){
    let pageInstance = this.getCurrentPage();
    let datakey      = dataset.datakey;
    let compid       = dataset.compid;
    let formcompid   = dataset.formcompid;
    let segment      = dataset.segment;
    let newdata      = {};

    compid = formcompid + compid.substr(4);

    if (!segment) {
      this.showModal({
        content: '组件未绑定字段 请在电脑编辑页绑定后使用'
      });
      return;
    }

    let obj = pageInstance.data[formcompid]['form_data'];
    if (util.isPlainObject(obj)) {
      obj = pageInstance.data[formcompid]['form_data'] = {};
    }
    obj = obj[segment];

    if (!!obj) {
      let date = obj.substr(0, 10);
      let time = obj.substr(11);

      if (obj.length == 16) {
        newdata[datakey] = date + ' ' + value;
      } else if (obj.length == 10) {  // 只设置了 date
        newdata[datakey] = obj + ' ' + value;
      } else if (obj.length == 5) {   // 只设置了 time
        newdata[datakey] = value;
      } else if (obj.length == 0) {
        newdata[datakey] = value;
      }
    } else {
      newdata[datakey] = value;
    }
    newdata[compid + '.time'] = value;
    pageInstance.setData(newdata);
  },
  bindSelectChange: function(dataset, value) {
    let pageInstance = this.getCurrentPage();
    let datakey = dataset.datakey;
    let segment = dataset.segment;

    if (!segment) {
      this.showModal({
        content: '组件未绑定字段 请在电脑编辑页绑定后使用'
      });
      return;
    }
    var newdata = {};
    newdata[datakey] = value;
    pageInstance.setData(newdata);
  },
  bindScoreChange: function(dataset){
    let pageInstance = this.getCurrentPage();
    let datakey      = dataset.datakey;
    let value        = dataset.score;
    let compid       = dataset.compid;
    let formcompid   = dataset.formcompid;
    let segment      = dataset.segment;

    compid = formcompid + compid.substr(4);

    if (!segment) {
      this.showModal({
        content: '组件未绑定字段 请在电脑编辑页绑定后使用'
      });
      return;
    }
    var newdata = {};
    newdata[datakey] = value;
    newdata[compid + '.editScore'] = value;
    pageInstance.setData(newdata);
  },
  submitForm: function(dataset){
    let pageInstance = this.getCurrentPage();
    let _this = this;
    let compid = dataset.compid;
    let form = dataset.form;
    let form_data = pageInstance.data[compid].form_data;
    let field_info = pageInstance.data[compid].field_info;

    if (!util.isPlainObject(form_data)) {
      for (let i in field_info) {
        let field = field_info[i].field;
        if ((!form_data[field] || form_data[field].length == 0) && field_info[i].required == 1) { // 提示错误
          _this.showModal({
            content: field_info[i].title + '没有填写'
          });
          return;
        }
      }

      _this.sendRequest({
        url: '/index.php?r=AppData/addData',
        data: {
          form: form,
          form_data: form_data
        },
        header: {'content-type': 'application/x-www-form-urlencoded;'},
        method: 'POST',
        success: function (res) {
          if (res.status == 0) {
            var newdata = {};
            newdata[compid + '.form_data'] = {};
            pageInstance.setData(newdata);
            _this.showToast({
              title: '提交成功',
              icon: 'success'
            });
          }
        }
      })
    } else {
      _this.showModal({
        content: '这个表单什么都没填写哦！！！'
      });
    }
  },
  udpateVideoSrc: function (dataset) {
    let pageInstance = this.getCurrentPage();
    let compid = dataset.compid;

    this.chooseVideo(function(filePath){
      var newdata = {};
      newdata[compid + '.src'] = filePath;
      pageInstance.setData(newdata);
    }, maxDuration);
  },
  uploadFormImg: function (dataset) {
    let pageInstance = this.getCurrentPage();
    let compid     = dataset.compid;
    let formcompid = dataset.formcompid;
    let datakey    = dataset.datakey;
    let segment    = dataset.segment;

    compid = formcompid + compid.substr(4);

    if (!segment) {
      this.showModal({
        content: '组件未绑定字段 请在电脑编辑页绑定后使用'
      })
      console.log('segment empty 请绑定数据对象字段');
      return;
    }
    this.chooseImage(function (res) {
      let img_src = res[0];
      let newdata = {};
      newdata[datakey] = img_src;
      newdata[compid + '.display_upload'] = false;
      newdata[compid + '.content'] = img_src;
      pageInstance.setData(newdata);
    });
  },
  listVesselTurnToPage: function (dataset) {
    let pageInstance = this.getCurrentPage();
    let data_id = dataset.dataid;
    let router = dataset.router;
    let page_form = pageInstance.page_form;

    if (router == -1 || router == '-1') {
      return;
    }
    if (page_form != '') {
      this.turnToPage('../' + router + '/' + router + '?detail=' + data_id);
    }
  },
  sortListFunc: function (dataset) {
    let pageInstance  = this.getCurrentPage();
    let listid        = dataset.listid;
    let sortkey       = dataset.sortkey;
    let sortdirection = dataset.sortdirection;
    let idx           = dataset.idx;
    let sortcompid    = dataset.compid;
    let _this         = this;

    let targetList = '';
    let index      = '';
    let is_goods   = 1;

    let willSaveSortDirection = 0;

    if (sortdirection == 0) {
      willSaveSortDirection = 1;
    }

    if (pageInstance.list_compids_params) {
      for (index in pageInstance.list_compids_params) {
        if (pageInstance.list_compids_params[index].param.id === listid) {
          if (idx != 0) {
            pageInstance.list_compids_params[index].param.sort_key       = sortkey;
            pageInstance.list_compids_params[index].param.sort_direction = sortdirection;
          } else {
            pageInstance.list_compids_params[index].param.sort_key       = '';
            pageInstance.list_compids_params[index].param.sort_direction = 0;
          }

          pageInstance.list_compids_params[index].param.page = 1;
          targetList = pageInstance.list_compids_params[index];
          is_goods = 0;
          break;
        }
      }
    }

    if (is_goods == 1 && pageInstance.goods_compids_params) {
      for (index in pageInstance.goods_compids_params) {
        if (pageInstance.goods_compids_params[index].param.id === listid) {
          if (idx != 0) {
            pageInstance.goods_compids_params[index].param.sort_key       = sortkey;
            pageInstance.goods_compids_params[index].param.sort_direction = sortdirection;
          } else {
            pageInstance.goods_compids_params[index].param.sort_key       = '';
            pageInstance.goods_compids_params[index].param.sort_direction = 0;
          }

          pageInstance.goods_compids_params[index].param.page = 1;
          targetList = pageInstance.goods_compids_params[index];
          break;
        }
      }
    }

    if (!!targetList) {

      let compid  = targetList['compid'];

      let url = '/index.php?r=AppData/getFormDataList';
      if (is_goods == 1) {
        url = '/index.php?r=AppShop/GetGoodsList';
      }

      _this.sendRequest({
        url: url,
        data: targetList.param,
        method: 'post',
        success: function (res) {
          if (res.status == 0) {
            let newdata = {};

            if (is_goods == 0) {
              for (let j in res.data) {
                for (let k in res.data[j].form_data) {
                  if (k == 'category') {
                    continue;
                  }

                  let description = res.data[j].form_data[k];

                  if (!description) {
                    continue;
                  }

                  // let matchResult = typeof description == 'string' && description.match(/<(\S*?)[^>]*>.*?<\/\1>|<.*?\/>/g);
                  /^http:\/\/img/g.test(description) || (res.data[j].form_data[k] = _this.getWxParseResult(description));
                }
              }
            }
            if (is_goods == 1) {
              pageInstance.goods_compids_params[index].param.sort_direction = willSaveSortDirection;
            } else {
              pageInstance.list_compids_params[index].param.sort_direction = willSaveSortDirection;
            }

            newdata[compid + '.selected']  = idx;

            if (is_goods == 1) {
              newdata[compid + '.goods_data'] = res.data;
            } else {
              newdata[compid + '.list_data'] = res.data;
            }

            newdata[compid + '.is_more']   = res.is_more;
            newdata[compid + '.curpage']   = 1;

            newdata[sortcompid + '.customFeature.selected'] = idx;

            if (idx != 0 && sortdirection == 1) {
              newdata[sortcompid + '.content[' + idx + '].customFeature.sort_direction'] = 0;
            } else if (idx != 0) {
              newdata[sortcompid + '.content[' + idx + '].customFeature.sort_direction'] = 1;
            } else if (idx == 0) {
              newdata[sortcompid + '.content[' + idx + '].customFeature.sort_direction'] = 0;
            }

            pageInstance.setData(newdata);
          }
        }
      });
    }
  },
  bbsInputComment: function(dataset, comment){
    var pageInstance = this.getCurrentPage(),
        compid = dataset.compid,
        data = {};

    data[compid+'.comment.text'] = comment;
    pageInstance.setData(data);
  },
  bbsInputReply: function(dataset, comment){
    var pageInstance = this.getCurrentPage(),
        compid = dataset.compid,
        index = dataset.index,
        data = {};

    data[compid+'.content.data['+index+'].replyText'] = comment;
    pageInstance.setData(data);
  },
  uploadBbsCommentImage: function(dataset){
    var pageInstance = this.getCurrentPage(),
        compid = dataset.compid,
        data = {};

    this.chooseImage(function(res){
      data[compid+'.comment.img'] = res[0];
      pageInstance.setData(data);
    });
  },
  uploadBbsReplyImage: function(dataset){
    var pageInstance = this.getCurrentPage(),
        compid = dataset.compid,
        index = dataset.index,
        data = {};

    this.chooseImage(function(res){
      data[compid+'.content.data['+index+'].replyImg'] = res[0];
      pageInstance.setData(data);
    });
  },
  deleteCommentImage: function(dataset){
    var pageInstance = this.getCurrentPage(),
        compid = dataset.compid,
        data = {};

    data[compid+'.comment.img'] = '';
    pageInstance.setData(data);
  },
  deleteReplyImage: function(dataset){
    var pageInstance = this.getCurrentPage(),
        compid = dataset.compid,
        index = dataset.index,
        data = {};

    data[compid+'.content.data['+index+'].replyImg'] = '';
    pageInstance.setData(data);
  },
  bbsPublishComment: function(dataset){
    var pageInstance  = this.getCurrentPage(),
        compid = dataset.compid,
        bbsData = pageInstance.data[compid],
        comment = bbsData.comment,
        param;

    if(!comment.text || !comment.text.trim()){
      this.showModal({
        content: '请输入评论内容'
      })
      return;
    }

    delete comment.showReply;
    comment.addTime = util.formatTime();

    param = {};
    param.nickname = pageInstance.data.userInfo.nickname;
    param.cover_thumb = pageInstance.data.userInfo.cover_thumb;
    param.user_token = pageInstance.data.userInfo.user_token;
    param.page_url = pageInstance.page_router;
    param.content = comment;
    param.rel_obj = bbsData.customFeature.ifBindPage && bbsData.customFeature.ifBindPage !== 'false' ? pageInstance.page_router : this.getAppId();

    this.sendRequest({
      url: '/index.php?r=AppData/addData',
      method: 'post',
      data: {
        form: 'bbs',
        form_data: param
      },
      success: function(res){
        var commentList = pageInstance.data[compid].content.data || [],
            newdata = {};

        param.id = res.data;
        newdata[compid+'.content.data'] = [{
          form_data: param,
          count_num: 0
        }].concat(commentList);
        newdata[compid+'.content.count'] = +pageInstance.data[compid].content.count + 1;
        newdata[compid+'.comment'] = {};

        pageInstance.setData(newdata);
      }
    })
  },
  clickBbsReplyBtn: function(dataset){
    var pageInstance = this.getCurrentPage(),
        compid = dataset.compid,
        index = dataset.index,
        data = {};

    data[compid+'.content.data['+index+'].showReply'] = !pageInstance.data[compid].content.data[index].showReply;
    pageInstance.setData(data);
  },
  bbsPublishReply: function(dataset){
    var pageInstance = this.getCurrentPage(),
        compid = dataset.compid,
        index = dataset.index,
        bbsData = pageInstance.data[compid],
        form_data = bbsData.content.data[index].form_data,
        comment = {},
        param;

    comment.text = bbsData.content.data[index].replyText;
    comment.img = bbsData.content.data[index].replyImg;
    if(!comment.text || !comment.text.trim()){
      this.showModal({
        content: '请输入回复内容'
      })
      return;
    }

    comment.addTime = util.formatTime();
    comment.reply = {
      nickname: form_data.nickname,
      text: form_data.content.text,
      img: form_data.content.img,
      user_token: form_data.user_token,
      reply: form_data.content.reply
    };

    param = {};
    param.nickname = pageInstance.data.userInfo.nickname;
    param.cover_thumb = pageInstance.data.userInfo.cover_thumb;
    param.user_token = pageInstance.data.userInfo.user_token;
    param.page_url = pageInstance.page_router;
    param.content = comment;
    param.rel_obj = bbsData.customFeature.ifBindPage && bbsData.customFeature.ifBindPage !== 'false' ? pageInstance.page_router : this.getAppId();

    this.sendRequest({
      url: '/index.php?r=AppData/addData',
      method: 'post',
      data: {
        form: 'bbs',
        form_data: param,
      },
      success: function(res){
        var commentList = pageInstance.data[compid].content.data || [],
            newdata = {};

        param.id = res.data;
        if(commentList.length){
          delete commentList[index].replyText;
          delete commentList[index].showReply;
        }
        newdata[compid+'.content.data'] = [{
          form_data: param,
          count_num: 0
        }].concat(commentList);
        newdata[compid+'.content.count'] = +pageInstance.data[compid].content.count + 1;
        newdata[compid+'.comment'] = {};

        pageInstance.setData(newdata);
      }
    })
  },
  searchList:function(dataset){
    let pageInstance = this.getCurrentPage();
    let that = this;
    let compid = dataset.compid;
    let listid = dataset.listid;
    let listType = dataset.listtype;
    let form = dataset.form;
    let keyword = pageInstance.keywordList[compid];

    let targetList = '';
    let index      = '';

    if(listType === 'list-vessel'){
      for (index in pageInstance.list_compids_params) {
        if (pageInstance.list_compids_params[index].param.id === listid) {
          pageInstance.list_compids_params[index].param.page = 1;
          targetList = pageInstance.list_compids_params[index];
          break;
        }
      }
    }

    if(listType === 'goods-list'){
      for (index in pageInstance.goods_compids_params) {
        if (pageInstance.goods_compids_params[index].param.id === listid) {
          pageInstance.goods_compids_params[index].param.page = 1;
          targetList = pageInstance.goods_compids_params[index];
          break;
        }
      }
    }

    let url = '/index.php?r=appData/search';
    let param ={"search":{"data":[{"_allkey":keyword,"form": form}],"app_id":targetList.param.app_id}};

    this.sendRequest({
      url: url,
      data: param,
      success: function (res) {
        if(res.data.length == 0){
          setTimeout(function(){
            that.showToast({
              title: '没有找到与'+keyword+'相关的内容',
              duration: 2000
            });
          },0)
          return;
        }
        if (res.status == 0) {
          let newdata = {};
          if (listType === "goods-list") {
            newdata[targetList.compid + '.goods_data'] = res.data;
          } else {
            newdata[targetList.compid + '.list_data'] = res.data;
          }

          newdata[targetList.compid + '.is_more']   = res.is_more;
          newdata[targetList.compid + '.curpage']   = 1;

          pageInstance.setData(newdata);
        }
      },
      fail: function (err) {
        console.log(err);
      }
    })
  },

  // 获取"详情页"数据
  getDynamicPageData: function(param){
    param.url = '/index.php?r=AppData/getFormData';
    this.sendRequest(param);
  },
  getDynamicListData: function(param){
    param.url = '/index.php?r=AppData/getFormDataList';
    this.sendRequest(param);
  },
  getAssessList: function(param){
    param.url = '/index.php?r=AppShop/GetAssessList';
    this.sendRequest(param);
  },
  getOrderDetail: function(param){
    param.url = '/index.php?r=AppShop/getOrder';
    this.sendRequest(param);
  },
  modifyPostParam: function(obj) {
    let query = '',
        name, value, fullSubName, subName, subValue, innerObj, i;

    for(name in obj) {
      value = obj[name];

      if(value instanceof Array) {
        for(i=0; i < value.length; ++i) {
          subValue = value[i];
          fullSubName = name + '[' + i + ']';
          innerObj = {};
          innerObj[fullSubName] = subValue;
          query += this.modifyPostParam(innerObj) + '&';
        }
      }
      else if(value instanceof Object) {
        for(subName in value) {
          subValue = value[subName];
          fullSubName = name + '[' + subName + ']';
          innerObj = {};
          innerObj[fullSubName] = subValue;
          query += this.modifyPostParam(innerObj) + '&';
        }
      }
      else if(value !== undefined && value !== null)
        query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
    }

    return query.length ? query.substr(0, query.length - 1) : query;
  },
  getHomepageRouter: function(){
    return this.globalData.homepageRouter;
  },
  getAppId: function(){
    return this.globalData.appId;
  },
  getDefaultPhoto: function(){
    return this.globalData.defaultPhoto;
  },
  getSessionKey: function(){
    return this.globalData.sessionKey;
  },
  setSessionKey: function(session_key){
    this.globalData.sessionKey = session_key;
    wx.setStorage({
      key: 'session_key',
      data: session_key
    })
  },
  getUserInfo: function(){
    return this.globalData.userInfo;
  },
  setUserInfoStorage: function(info){
    for(var key in info){
      this.globalData.userInfo[key] = info[key];
    }
    wx.setStorage({
      key: 'userInfo',
      data: this.globalData.userInfo
    })
  },
  setPageUserInfo: function(){
    var currentPage = this.getCurrentPage(),
        newdata = {};

    newdata['userInfo'] = this.getUserInfo();
    currentPage.setData(newdata);
  },
  getCurrentPage: function(){
    var pages = getCurrentPages();
    return pages[pages.length - 1];
  },
  getWaimaiTotalNum: function(){
    return this.globalData.waimaiTotalNum;
  },
  setWaimaiTotalNum: function(num){
    this.globalData.waimaiTotalNum = num;
  },
  getWaimaiTotalPrice: function(){
    return this.globalData.waimaiTotalPrice;
  },
  setWaimaiTotalPrice: function(price){
    this.globalData.waimaiTotalPrice = price;
  },
  getWaimaiCartIds: function(){
    return this.globalData.waimaiCartIds;
  },
  setWaimaiCartId: function(goodsId, cartId){
    if(cartId && cartId != 0){
      this.globalData.waimaiCartIds[goodsId] = cartId;
    } else {
      delete this.globalData.waimaiCartIds[goodsId];
    }
  },
  getWxParseOldPattern: function(){
    return this.globalData.wxParseOldPattern;
  },
  getWxParseResult: function(data){
    var page = this.getCurrentPage();
    return WxParse.wxParse(this.getWxParseOldPattern(),'html', data, page);
  },
  globalData:{
    appId: 'Bv1m51k1km',
        tabBarPagePathArr: '["\/pages\/page10000\/page10000","\/pages\/page10001\/page10001","\/pages\/page10003\/page10003"]',
        homepageRouter: null,
    formData: null,
    userInfo: {},
    sessionKey: '',
    notBindXcxAppId: false,
    wxParseOldPattern: '_listVesselRichText_',
    cdnUrl: 'http://1251027630.cdn.myqcloud.com/1251027630',
    defaultPhoto: 'http://1251027630.cdn.myqcloud.com/1251027630/zhichi_frontend/static/webapp/images/default_photo.png',
    siteBaseUrl:'https://www.weiye.me'
  }
})

