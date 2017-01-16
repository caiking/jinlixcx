
var app = getApp()

Page({
  data: {
    orderLists: [],
    pages: 1,
    types: [undefined, 0, 1, 2, 3],  
    noMore: false,
    currentTabIndex: 0,
    currentGoodsType: '',   
    goodsTypeList: [],
    isFromBack: false
  },
  onLoad: function(options){
    this.getOrderList(0);
  },
  getOrderList: function(tabIndex, scrollLoad){
    var that = this,
        data = {
          page: that.data.pages,
          page_size: 50,
        },
        type;

    if( this.data.goodsTypeList.length <= 1 ){
      type = this.data.types[tabIndex];

      if(type != undefined){
        data.idx_arr = {
          idx: 'status',
          idx_value: type
        }
      }
    }
    this.data.currentGoodsType && (data.goods_type = this.data.currentGoodsType)

    app.sendRequest({
      url: '/index.php?r=AppShop/orderList',
      method: 'post',
      data: data,
      success: function(res){
        var data = {},
            orders = res.data;

        for (var i = orders.length - 1; i >= 0; i--) {
          var formData = orders[i].form_data;

          formData.totalPay = +formData.total_price + +formData.express_fee;
          orders[i] = formData;
        }

        if(scrollLoad){
          orders = that.data.orderLists.concat(orders);
        }
        data['orderLists'] = orders;
        data['pages'] = that.data.pages + 1;
        data['noMore'] = res.is_more == 0 ? true : false;
        data['goodsTypeList'] = res.goods_type_list;
        data['currentGoodsType'] = res.current_goods_type;
        that.setData(data);
      }
    })
  },
  clickOrderTab: function(e){
    var dataset = e.target.dataset,
        index = dataset.index,
        data = {};

    data.currentTabIndex = index;
    data['pages'] = 1;
    data['orderLists'] = [];
    data['noMore'] = false;
    if(dataset.goodsType){
      data.currentGoodsType = dataset.goodsType;
    }

    this.setData(data);
    this.getOrderList(index);
  },
  goToOrderDetail: function(e){
    var orderId = e.currentTarget.dataset.id;
    app.turnToPage('../orderDetail/orderDetail?detail='+orderId);
  },
  cancelOrder: function(e){
    var orderId = e.target.dataset.id,
        that = this;

    app.showModal({
      content: '确定要取消订单？',
      showCancel: true,
      cancelText: '否',
      confirmText: '确定',
      confirm: function(){
        app.sendRequest({
          url: '/index.php?r=AppShop/cancelOrder',
          data: {
            order_id: orderId
          },
          success: function(res){
            var index = that.data.currentTabIndex,
                data = {};

            data['pages'] = 1;
            that.setData(data);
            that.getOrderList(index);
          }
        })
      }
    })
  },
  payOrder: function(e){
    var orderId = e.target.dataset.id;
    app.turnToPage('../orderDetail/orderDetail?detail='+orderId);
  },
  applyDrawback: function(e){
    var orderId = e.target.dataset.id,
        that = this;

    app.showModal({
      content: '确定要申请退款？',
      showCancel: true,
      cancelText: '取消',
      confirmText: '确定',
      confirm: function(){
        app.sendRequest({
          url: '/index.php?r=AppShop/applyRefund',
          data: {
            order_id: orderId
          },
          success: function(res){
            var index = that.data.currentTabIndex,
                data = {};

            data['pages'] = 1;
            that.setData(data);
            that.getOrderList(index);
          }
        })
      }
    })
  },
  checkLogistics: function(e){
    var orderId = e.target.dataset.id;
    app.turnToPage('../logisticsPage/logisticsPage?detail='+orderId);
  },
  sureReceipt: function(e){
    var orderId = e.target.dataset.id,
        that = this;

    app.showModal({
      content: '确定已收到货物？',
      showCancel: true,
      cancelText: '取消',
      confirmText: '确定',
      confirm: function(){
        app.sendRequest({
          url: '/index.php?r=AppShop/comfirmOrder',
          data: {
            order_id: orderId
          },
          success: function(res){
            var index = that.data.currentTabIndex,
                data = {};

            data['pages'] = 1;
            that.setData(data);
            that.getOrderList(index);
          }
        })
      }
    })
  },
  makeComment: function(e){
    var orderId = e.target.dataset.id;
    app.turnToPage('../makeComment/makeComment?detail='+orderId);
  },
  scrollToListBottom: function(){
    var currentTabIndex = this.data.currentTabIndex;
    if(this.data.noMore){
      return;
    }
    this.getOrderList(currentTabIndex, true);
  }
})
