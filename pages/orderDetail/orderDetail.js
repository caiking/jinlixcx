
var app = getApp()

Page({
  data: {
    orderInfo: {},
    orderStatus: {
      '0' : '待付款',
      '1' : '待发货',
      '2' : '待收货',
      '3' : '待评价',
      '4' : '退款审核中',
      '5' : '退款中',
      '6' : '已完成',
      '7' : '已关闭'
    },
    appointmentTime: '',
    addressList: [],
    selectAddressId: '',
    addressDialogHidden: true,
    goodsAdditionalInfo: {},
    hasAdditionalInfo: false,
    customFields: [],
    isFromBack: false
  },
  onLoad: function(options){
    var orderId = options.detail;

    this.getOrderDetail(orderId);
  },
  onShow: function(){
    if(this.data.isFromBack){
      this.getOrderDetail(this.data.orderInfo.order_id, 1);
    } else {
      this.setData({
        isFromBack: true
      })
    }
  },
  getOrderDetail: function(orderId, isFromAddrSelect){
    var that = this;
    app.getOrderDetail({
      data: {
        order_id: orderId
      },
      success: function(res){
              var form_data = res.data[0].form_data,
	        hasAdditionalInfo = false, 
		address_id = ''; 
       form_data.totalPay = form_data.total_price + form_data.express_fee; 
       if(!isFromAddrSelect){
          for (var i = 0; i < form_data.goods_info.length; i++) {
	       var deliveryId = form_data.goods_info[i].delivery_id;
	       if(deliveryId && deliveryId != '0'){
	          that.getGoodsCustomField(i, deliveryId);
		   hasAdditionalInfo = true;
	       } 
          } 
	} 
	if(form_data.address_info){  
	    address_id = form_data.address_info.address_id;
	} 
	that.setData({
	orderInfo: form_data,
	    selectAddressId: address_id,
	    hasAdditionalInfo: hasAdditionalInfo,
	    appointmentTime: res.data[0].appointment_time
	 })
	}
    })
  },
  getGoodsCustomField: function(goodsIndex, deliveryId){
    var that = this;

    app.sendRequest({
      url: '/index.php?r=pc/AppShop/GetDelivery',
      data: {
        app_id: app.getAppId(),
        delivery_id: deliveryId
      },
      success: function(res){
        var deliveryInfo = res.data.delivery_info,
            goodsId = that.data.orderInfo.goods_info[goodsIndex].goods_id,
            data = {},
            fields = [];
        data['goodsAdditionalInfo.'+goodsId+''] = deliveryInfo;
        for (var i = 0; i < deliveryInfo.length; i++) {
          var info = {};
          info.type = deliveryInfo[i].type;
          info.title = deliveryInfo[i].name;
          fields.push(info);
        }
        data['customFields['+ goodsIndex +']'] = fields;
        that.setData(data);
      }
    })
  },
  customFieldInput: function(e){
    var dataset = e.currentTarget.dataset,
        goodsIndex = dataset.goodsIndex,
        fieldIndex = dataset.fieldIndex,
        value = e.detail.value,
        data = {};

    data['customFields['+ goodsIndex +']['+ fieldIndex +'].value'] = value;
    this.setData(data);
  },
  uploadCustomFieldImage: function(e){
    var that = this,
        dataset = e.currentTarget.dataset,
        goodsIndex = dataset.goodsIndex,
        fieldIndex = dataset.fieldIndex,
        data = {};

    app.chooseImage(function(paths){
      data['customFields['+ goodsIndex +']['+ fieldIndex +'].value'] = paths;
      that.setData(data);
    }, 9);
  },
  deleteCustomFieldImage: function(e){
    var dataset = e.currentTarget.dataset,
        goodsIndex = dataset.goodsIndex,
        fieldIndex = dataset.fieldIndex,
        imageArray = this.data.customFields[goodsIndex][fieldIndex].value,
        imageIndex = dataset.imageIndex,
        data = {};

    imageArray.splice(imageIndex, 1);
    data['customFields['+ goodsIndex +']['+ fieldIndex +'].value'] = imageArray;
    this.setData(data);
  },
  sendDeliveryInfo: function(){
    var additional_info = {},
        goodsInfo = this.data.orderInfo.goods_info;

    for (var i = 0; i < goodsInfo.length; i++) {
      additional_info[goodsInfo[i].goods_id] = this.data.customFields[i];
    }
    app.sendRequest({
      url: '/index.php?r=AppShop/SetAdditional',
      method: 'POST',
      data: {
        order_id: this.data.orderInfo.order_id,
        additional_info: additional_info
      },
      success: function(res){

      }
    });
  },
  cancelOrder: function(e){
    var orderId = this.data.orderInfo.order_id,
        that = this;

    app.showModal({
      content: '是否取消订单？',
      showCancel: true,
      confirmText: '是',
      cancelText: '否',
      confirm: function(){
        app.sendRequest({
          url: '/index.php?r=AppShop/cancelOrder',
          data: {
            order_id: orderId
          },
          success: function(res){
            var data = {};

            data['orderInfo.status'] = 7;
            that.setData(data);
          }
        })
      }
    })
  },
  payOrder: function(e){
    var address_info = this.data.orderInfo.address_info,
        orderId;

    if(!address_info){
      app.showModal({
        content: '请选择邮寄地址'
      })
      return;
    }

    if(this.data.hasAdditionalInfo){
      this.sendDeliveryInfo();
    }

    orderId = this.data.orderInfo.order_id;
    app.sendRequest({
      url: '/index.php?r=AppShop/GetWxWebappPaymentCode',
      data: {
        order_id: orderId
      },
      success: function(res){
        app.wxPay(res.data);
      }
    })
  },
  applyDrawback: function(){
    var orderId = this.data.orderInfo.order_id,
        that = this;

    app.showModal({
      content: '确定要申请退款？',
      showCancel: true,
      confirmText: '确定',
      cancelText: '取消',
      confirm: function(){
        app.sendRequest({
          url: '/index.php?r=AppShop/applyRefund',
          data: {
            order_id: orderId
          },
          success: function(res){
            var data = {};

            data['orderInfo.status'] = 4;
            that.setData(data);
          }
        })
      }
    })
  },
  recevieDrawback: function(){
    var orderId = this.data.orderInfo.order_id,
        that = this;

    app.showModal({
      content: '确定已收到退款？',
      showCancel: true,
      confirmText: '确定',
      cancelText: '取消',
      confirm: function(){
        app.sendRequest({
          url: '/index.php?r=AppShop/comfirmRefund',
          data: {
            order_id: orderId
          },
          success: function(res){
            var data = {};

            data['orderInfo.status'] = 7;
            that.setData(data);
          }
        })
      }
    })
  },
  checkLogistics: function(){
    var orderId = this.data.orderInfo.order_id;
    app.turnToPage('../logisticsPage/logisticsPage?detail='+orderId);
  },
  sureReceipt: function(){
    var orderId = this.data.orderInfo.order_id,
        that = this;

    app.showModal({
      content: '确定已收到货物？',
      showCancel: true,
      confirmText: '确定',
      cancelText: '取消',
      confirm: function(){
        app.sendRequest({
          url: '/index.php?r=AppShop/comfirmOrder',
          data: {
            order_id: orderId
          },
          success: function(res){
            var data = {};

            data['orderInfo.status'] = 3;
            that.setData(data);
          }
        })
      }
    })
  },
  makeComment: function(){
    var orderId = this.data.orderInfo.order_id;
    app.turnToPage('../makeComment/makeComment?detail='+orderId);
  },
  addAddress: function(){
    var orderId = this.data.orderInfo.order_id;
    app.turnToPage('../addAddress/addAddress?oid='+orderId);
  },
  selectAddress: function(e){
    var index = e.currentTarget.dataset.index,
        orderId = this.data.orderInfo.order_id,
        newAddress = this.data.addressList[index],
        that = this;

    app.sendRequest({
      url: '/index.php?r=AppShop/setAddress',
      data: {
        order_id: orderId,
        address_id: newAddress.id
      },
      success: function(res){
        that.setData({
          'orderInfo.address_info': newAddress.address_info
        });
        that.hideAddressList();
      }
    });
  },
  editAddress: function(e){
    var index = e.currentTarget.dataset.index,
        addressId = this.data.addressList[index].id,
        orderId = this.data.orderInfo.order_id;

    app.turnToPage('../addAddress/addAddress?id='+addressId+'&oid='+orderId);
  },
  showAddressList: function(){
    var addressId = this.data.selectAddressId,
        orderId = this.data.orderInfo.order_id;

    app.turnToPage('../myAddress/myAddress?id='+addressId+'&oid='+orderId);
  },
  showAddAddress: function(){
    var orderId = this.data.orderInfo.order_id;

    app.turnToPage('../addAddress/addAddress?oid='+orderId);
  },
  hideAddressList: function(){
    this.setData({
      addressDialogHidden: true
    })
  },
  deleteAddress: function(e){
    var index = e.currentTarget.dataset.index,
        id = this.data.addressList[index].id,
        that = this;

    app.showModal({
      content: '确定要删除地址？',
      showCancel: true,
      confirmText: '确定',
      cancelText: '取消',
      confirm: function(){
        app.sendRequest({
          url: '/index.php?r=AppShop/delAddress',
          data: {
            address_id: id
          },
          success: function(res){
            var list = that.data.addressList,
                data = {};

            list.splice(index, 1);
            data.addressList = list;
            if(id == that.data.orderInfo.address_info.id){
              data['orderInfo.address_info'] = null;
            }
            that.setData(data);
          }
        })
      }
    })
  },
  previewImage: function(e){
    app.previewImage(e.currentTarget.dataset.src);
  }
})
