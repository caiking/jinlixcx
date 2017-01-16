
var app = getApp()
var util = require('../../utils/util.js')
var WxParse = require('../../components/wxParse/wxParse.js');

Page({
  data: {
    goodsId: '',
    goodsInfo: {},
    modelStrs: {},
    selectModelInfo: {
      models: [],
      stock: '',
      price: '',
      buyCount: 1
    },
    commentNums: [],
    commentExample: '',
    defaultPhoto: '',
    allStock: '',
    addToShoppingCartHidden: true,
    ifAddToShoppingCart: true
  },
  onLoad: function(options){
    var goodsId = options.detail,
        contact = options.contact,
        that = this,
        defaultPhoto = app.getDefaultPhoto();

    this.setData({
      goodsId: goodsId,
      contact: contact,
      defaultPhoto: defaultPhoto
    })
    app.setPageTitle('商品详情')
    app.sendRequest({
      url: '/index.php?r=AppShop/getGoods',
      data: {
        data_id: goodsId
      },
      success: that.modifyGoodsDetail
    })
  },
  goToMyOrder: function(){
    app.turnToPage('../myOrder/myOrder', true);
  },
  goToShoppingCart: function(){
    app.turnToPage('../shoppingCart/shoppingCart');
  },
  goToHomepage: function(){
    var router = app.getHomepageRouter();
    app.turnToPage('../'+router+'/'+router);
  },
  goToCommentPage: function(){
    app.turnToPage('../goodsComment/goodsComment?detail='+this.data.goodsId);
  },
  goodsCoverOnload: function(e){
    var _this = this,
        originalWidth = e.detail.width,
        originalHeight = e.detail.height;

    //获取图片的原始长宽
    var windowWidth = 0;
    var imageWidth = 0, imageHeight = 0;

    wx.getSystemInfo({
      success: function (res) {
        windowWidth = res.windowWidth;
        imageWidth = windowWidth;
        imageHeight = imageWidth * originalHeight / originalWidth;
        _this.setData({
          goodsCoverWidth: imageWidth,
          goodsCoverHeight: imageHeight
        })
      }
    })
  },
  modifyGoodsDetail: function(res){
    var pages = getCurrentPages(),
        _this = pages[pages.length - 1],
        goods = res.data[0].form_data,
        description = goods.description,
        goodsModel = [],
        selectModels = [],
        modelStrs = {},
        price = 0,
        allStock = 0,
        selectStock, selectPrice, selectModelId, matchResult,
        i, j;

    WxParse.wxParse('wxParseDescription', 'html', description, _this, 10);

    if(goods.model_items.length){
      var items = goods.model_items;
      for (i = 0, j = items.length; i < j; i++) {
        price = Number(items[i].price);
        goods.highPrice = goods.highPrice > price ? goods.highPrice : price;
        goods.lowPrice = goods.lowPrice < price ? goods.lowPrice : price;
        allStock += Number(items[i].stock);
        if(i == 0){
          selectPrice = price;
          selectStock = items[0].stock;
          selectModelId = items[0].id;
        }
      }
    } else {
      selectPrice = goods.price;
      selectStock = goods.stock;
    }
    for(var key in goods.model){
      if(key){
        var model = goods.model[key];
        goodsModel.push(model);
        modelStrs[key] = model.subModelName.join('、');
        selectModels.push(model.subModelId[0]);
      }
    }
    goods.model = goodsModel;
    _this.setData({
      goodsInfo: goods,
      modelStrs: modelStrs,
      'selectModelInfo.models': selectModels,
      'selectModelInfo.stock': selectStock,
      'selectModelInfo.price': selectPrice,
      'selectModelInfo.modelId': selectModelId,
      allStock: allStock
    })
    _this.getAssessList();
  },
  getAssessList: function(){
    var that = this;
    app.getAssessList({
      method: 'post',
      header: {
        'content-type': 'application/x-www-form-urlencoded;'
      },
      data: {
        goods_id: that.data.goodsId,
        idx_arr: {
          idx: 'level',
          idx_value: 0
        },
        page: 1,
        page_size: 10
      },
      success: function(res){
        var commentExample = res.data[0];
        if(commentExample){
          commentExample.add_time = util.formatTime(new Date(commentExample.add_time * 1000));
        }
        that.setData({
          commentNums: res.num,
          commentExample: commentExample
        })
      }
    });
  },
  showBuyDirectly: function(){
    this.setData({
      addToShoppingCartHidden: false,
      ifAddToShoppingCart: false
    })
  },
  showAddToShoppingCart: function(){
    this.setData({
      addToShoppingCartHidden: false,
      ifAddToShoppingCart: true
    })
  },
  hiddeAddToShoppingCart: function(){
    this.setData({
      addToShoppingCartHidden: true
    })
  },
  selectSubModel: function(e){
    var dataset = e.target.dataset,
        modelIndex = dataset.modelIndex,
        submodelIndex = dataset.submodelIndex,
        data = {};

    data['selectModelInfo.models['+modelIndex+']'] = this.data.goodsInfo.model[modelIndex].subModelId[submodelIndex];
    this.setData(data);
    this.resetSelectCountPrice();
  },
  resetSelectCountPrice: function(){
    var selectModelIds = this.data.selectModelInfo.models.join(','),
        modelItems = this.data.goodsInfo.model_items,
        data = {};

    for (var i = modelItems.length - 1; i >= 0; i--) {
      if(modelItems[i].model == selectModelIds){
        data['selectModelInfo.stock'] = modelItems[i].stock;
        data['selectModelInfo.price'] = modelItems[i].price;
        data['selectModelInfo.modelId'] = modelItems[i].id;
        break;
      }
    }
    this.setData(data);
  },
  clickMinusButton: function(e){
    var count = this.data.selectModelInfo.buyCount;

    if(count <= 1){
      return;
    }
    this.setData({
      'selectModelInfo.buyCount': count - 1
    });
  },
  clickPlusButton: function(e){
    var selectModelInfo = this.data.selectModelInfo,
        count = selectModelInfo.buyCount,
        stock = selectModelInfo.stock;

    if(count >= stock) {
      return;
    }
    this.setData({
      'selectModelInfo.buyCount': count + 1
    });
  },
  sureAddToShoppingCart: function(){
    var that = this,
        param = {
                  goods_id: this.data.goodsId,
                  model_id: this.data.selectModelInfo.modelId,
                  num: this.data.selectModelInfo.buyCount
                };

    app.sendRequest({
      url: '/index.php?r=AppShop/addCart',
      data: param,
      success: function(res){
        app.showToast({
          title: '添加成功',
          icon: 'success',
          duration: 1500
        });

        setTimeout(function(){
          app.hideToast();
          setTimeout(function(){
            that.hiddeAddToShoppingCart();
          }, 500);
        }, 1500);
      }
    })
  },
  buyDirectlyNextStep: function(){
    var that = this,
        param = {
                  goods_id: this.data.goodsId,
                  model_id: this.data.selectModelInfo.modelId,
                  num: this.data.selectModelInfo.buyCount
                };

    app.sendRequest({
      url: '/index.php?r=AppShop/addOrder',
      data: param,
      success: function(res){
        that.hiddeAddToShoppingCart();
        app.turnToPage('../orderDetail/orderDetail?detail='+res.data);
      }
    })
  },
  makeAppointment: function(){
    app.turnToPage('../makeAppointment/makeAppointment?detail='+this.data.goodsId);
  }
})
