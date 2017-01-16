var appInstance = getApp();
var WxParse     = require('../../components/wxParse/wxParse.js');
var util        = require('../../utils/util.js');

var pageData    = {
  data: {"classify1":{"type":"classify","style":"font-size:30.46875rpx;height:82.03125rpx;line-height:82.03125rpx;opacity:1;background-color:#ddd;color:rgb(136, 136, 136);;margin-top:0;margin-left:auto;","content":[{"customFeature":{"action":"inner-link","page-link":"page10001"},"text":"分类1","content":"","parentCompid":"classify1","style":"","itemType":null,"itemParentType":"classify","itemIndex":0,"eventParams":"{\"inner_page_link\":\"\\\/pages\\\/page10001\\\/page10001\",\"is_redirect\":1}","eventHandler":"tapInnerLinkHandler"},{"customFeature":{"action":"inner-link","page-link":"page10001"},"text":"分类2","content":"","parentCompid":"classify1","style":"","itemType":null,"itemParentType":"classify","itemIndex":1,"eventParams":"{\"inner_page_link\":\"\\\/pages\\\/page10001\\\/page10001\",\"is_redirect\":1}","eventHandler":"tapInnerLinkHandler"},{"customFeature":{"action":"inner-link","page-link":"page10001"},"text":"分类3","content":"","parentCompid":"classify1","style":"","itemType":null,"itemParentType":"classify","itemIndex":2,"eventParams":"{\"inner_page_link\":\"\\\/pages\\\/page10001\\\/page10001\",\"is_redirect\":1}","eventHandler":"tapInnerLinkHandler"},{"customFeature":{"action":"inner-link","page-link":"page10001"},"text":"分类4","content":"","parentCompid":"classify1","style":"","itemType":null,"itemParentType":"classify","itemIndex":3,"eventParams":"{\"inner_page_link\":\"\\\/pages\\\/page10001\\\/page10001\",\"is_redirect\":1}","eventHandler":"tapInnerLinkHandler"}],"customFeature":{"mode":"0","selected":"0","selectedColor":"#f8978d"},"animations":[],"page_form":"","compId":"classify1"},"goods_list2":{"type":"goods-list","style":"opacity:1;color:rgb(102, 102, 102);font-size:32.8125rpx;height:auto;margin-left:auto;","content":"","customFeature":{"lineBackgroundColor":"","lineBackgroundImage":"","margin":"0","lineHeight":60,"imgWidth":60,"imgHeight":60,"vesselAutoheight":1,"height":"300px","form":"goods","mode":0,"name":"商品列表","ifUseContact":true,"id":"list-464864851907"},"animations":[],"page_form":"","compId":"goods_list2","parentCompid":"goods_list2","list_style":"height:140.625rpx;margin-left:auto;","img_style":"width:140.625rpx;height:140.625rpx;margin-left:auto;","title_width":{"width":"250px"},"param":"{\"id\":\"list-464864851907\",\"form\":\"goods\",\"goods_type\":0,\"page\":1,\"app_id\":\"Bv1m51k1km\",\"is_count\":0}"}},
  app_title: '我的应用',
  app_description: '我的应用',
  page_router: 'page10001',
    page_form: 'none',
      list_compids_params: [],
      goods_compids_params: [{"compid":"goods_list2","param":{"id":"list-464864851907","form":"goods","goods_type":0,"page":1,"app_id":"Bv1m51k1km","is_count":0}}],
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
