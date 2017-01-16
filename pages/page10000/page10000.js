var appInstance = getApp();
var WxParse     = require('../../components/wxParse/wxParse.js');
var util        = require('../../utils/util.js');

var pageData    = {
  data: {"carousel1":{"type":"carousel","style":"height:986.71875rpx;margin-left:auto;margin-right:auto;margin-top:0;opacity:1;","content":[{"customFeature":{"action":"inner-link","page-link":"page10001"},"pic":"http:\/\/img.weiye.me\/zcimgdir\/album\/file_581c44c4716ee.jpg","content":"","parentCompid":"carousel1","style":"","itemType":null,"itemParentType":"carousel","itemIndex":0,"eventParams":"{\"inner_page_link\":\"\\\/pages\\\/page10001\\\/page10001\",\"is_redirect\":0}","eventHandler":"tapInnerLinkHandler"},{"customFeature":{"action":"inner-link","page-link":"page10001"},"pic":"http:\/\/img.weiye.me\/zcimgdir\/album\/file_581c44caa2860.jpg","content":"","parentCompid":"carousel1","style":"","itemType":null,"itemParentType":"carousel","itemIndex":1,"eventParams":"{\"inner_page_link\":\"\\\/pages\\\/page10001\\\/page10001\",\"is_redirect\":0}","eventHandler":"tapInnerLinkHandler"},{"customFeature":{"action":"inner-link","page-link":"page10001"},"pic":"http:\/\/img.weiye.me\/zcimgdir\/album\/file_56cfc0cf750aa.jpg","content":"","parentCompid":"carousel1","style":"","itemType":null,"itemParentType":"carousel","itemIndex":2,"eventParams":"{\"inner_page_link\":\"\\\/pages\\\/page10001\\\/page10001\",\"is_redirect\":0}","eventHandler":"tapInnerLinkHandler"}],"customFeature":{"autoplay":true,"interval":2},"animations":[],"page_form":"","compId":"carousel1"}},
  app_title: '我的应用',
  app_description: '我的应用',
  page_router: 'page10000',
    page_form: 'none',
      list_compids_params: [],
      goods_compids_params: [],
      relobj_auto: [],
      bbsCompIds: [],
      dynamicVesselComps: [],
      tapInnerLinkHandler: function(event) {
  var param = event.currentTarget.dataset.eventParams;
  if (param) {
    param = JSON.parse(param);
    var url = param.inner_page_link;
    if (url) {
      var tabBarPagePathArr = JSON.parse(appInstance.globalData.tabBarPagePathArr);
      if (tabBarPagePathArr.indexOf(url) != -1) {
        appInstance.switchToTab(url);
      } else {
        if(param.is_redirect == 1){
          appInstance.turnToPage(url, true);
        }
        appInstance.turnToPage(url);
      }
    }
  }
},
    onLoad: function (e) {
    appInstance.setPageUserInfo();
    if(e.detail){
      this.dataId = e.detail;
    }
    if(!appInstance.getSessionKey()){
      appInstance.sendSessionKey();
      // appInstance.sendSessionKey(this.dataInitial);
    } else {
      appInstance.dataInitial();
      // this.dataInitial();
    }
  },
  onShareAppMessage: function(){
    var pageRouter = this.page_router;
    return {
      title: this.app_title || '即速应用',
      desc: this.app_description || '即速应用，拖拽生成app，无需编辑代码，一键打包微信小程序',
      path: '/pages/'+pageRouter+'/'+pageRouter
    }
  },

  onShow: function(){
    var that = this;
    setTimeout(function(){
      appInstance.setPageUserInfo();
    });
  },

  pageScrollFunc: function (e) {
    let compid  = e.target.dataset.compid;
    let curpage = parseInt(e.target.dataset.curpage) + 1;

    appInstance.pageScrollFunc(compid, curpage);

  },
  goodsScrollFunc: function (e) {
    let compid  = e.target.dataset.compid;
    let curpage = parseInt(e.target.dataset.curpage) + 1;

    appInstance.goodsScrollFunc(compid, curpage);

  },
  changeCount: function (e) {
    let dataset = e.currentTarget.dataset;
    appInstance.changeCount(dataset);

  },
  inputChange: function (e) {
    let dataset = e.currentTarget.dataset;
    let value = e.detail.value;

    appInstance.inputChange(dataset, value);
  },
  bindDateChange: function(e) {
    let dataset = e.currentTarget.dataset;
    let value   = e.detail.value;

    appInstance.bindDateChange(dataset, value);

  },
  bindTimeChange: function(e) {
    let dataset = e.currentTarget.dataset;
    let value   = e.detail.value;

    appInstance.bindTimeChange(dataset, value);

  },
  bindSelectChange: function(e) {
    let dataset = e.currentTarget.dataset;
    let value = e.detail.value;

    appInstance.bindSelectChange(dataset, value);

  },
  bindScoreChange: function(e){
    let dataset = e.currentTarget.dataset;

    appInstance.bindScoreChange(dataset);

  },
  submitForm: function (e) {
    let dataset = e.currentTarget.dataset;

    appInstance.submitForm(dataset);

  },
  udpateVideoSrc: function (e) {
    let dataset = e.currentTarget.dataset;

    appInstance.udpateVideoSrc(dataset);
  },
  tapMapDetail: function (event) {
    appInstance.turnToPage("../mapDetail/mapDetail?eventParams=" + event.currentTarget.dataset.eventParams);
  },
  uploadFormImg: function (e) {
    let dataset = e.currentTarget.dataset;

    appInstance.uploadFormImg(dataset);

  },
  listVesselTurnToPage: function (e) {
    let dataset = e.currentTarget.dataset;

    appInstance.listVesselTurnToPage(dataset);

  },
  UserCenterTurnToPage: function (e) {
    let router = e.currentTarget.dataset.router;
    appInstance.turnToPage('../' + router + '/' + router +'?from=userCenterEle');
  },
  turnToGoodsDetail: function (e) {
    let id = e.currentTarget.dataset.id;
    let contact = e.currentTarget.dataset.contact;
    appInstance.turnToPage('../goodsDetail/goodsDetail?detail=' + id +'&contact=' + contact);
  },
  sortListFunc: function (e) {
    let dataset = e.currentTarget.dataset;

    appInstance.sortListFunc(dataset);

  },
  bbsInputComment: function(e){
    var dataset = e.target.dataset,
        comment = e.detail.value;

    appInstance.bbsInputComment(dataset, comment);

  },
  bbsInputReply: function(e){
    var dataset = e.target.dataset,
        comment = e.detail.value;

    appInstance.bbsInputReply(dataset, comment);

  },
  uploadBbsCommentImage: function(e){
    var dataset = e.currentTarget.dataset;

    appInstance.uploadBbsCommentImage(dataset);

  },
  uploadBbsReplyImage: function(e){
    var dataset = e.currentTarget.dataset;

    appInstance.uploadBbsReplyImage(dataset);

  },
  deleteCommentImage: function(e){
    var dataset = e.currentTarget.dataset;

    appInstance.deleteCommentImage(dataset);

  },
  deleteReplyImage: function(e){
    var dataset = e.currentTarget.dataset;

    appInstance.deleteReplyImage(dataset);

  },
  bbsPublishComment: function(e){
    var dataset = e.currentTarget.dataset;

    appInstance.bbsPublishComment(dataset);
 
  },
  clickBbsReplyBtn: function(e){
    var dataset = e.currentTarget.dataset;

    appInstance.clickBbsReplyBtn(dataset);

  },
  bbsPublishReply: function(e){
    var dataset = e.currentTarget.dataset;

    appInstance.bbsPublishReply(dataset);

  },
  keywordList:{},
  bindSearchTextChange : function(e){
    this.keywordList[e.currentTarget.dataset.compid] = e.detail.value;
  },
  searchList:function(e){
    let dataset = e.currentTarget.dataset;

    appInstance.searchList(dataset);

  }
  

  
  
};
Page(pageData);
