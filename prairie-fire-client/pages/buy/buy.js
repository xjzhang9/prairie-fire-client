const app = getApp();
Page({
  data: {
    data_list_loding_status: 1,
    buy_submit_disabled_status: false,
    data_list_loding_msg: '',
    params: null,
    goods_list: [],
    address: {
      name:"张效见",
      tel:"15155157296",
      province_name:"安徽省",
      city_name:"合肥市",
      county_name:"蜀山区",
      address:"石笋路禹州华侨城二期"
    },
    address_id: 0,
    total_price: 0,
    user_note_value: '',
    is_first: 1,
    extension_data: [],
    common_order_is_booking: 0,
  },
  onLoad(params) {
    if ((params.data || null) == null || app.get_length(JSON.parse(params.data)) == 0) {
      wx.alert({
        title: '温馨提示',
        content: '订单信息有误',
        buttonText: '确认',
        success: () => {
          wx.navigateBack();
        },
      });
    } else {
      this.setData({
        params: JSON.parse(params.data)
      });

      // 删除地址缓存
      wx.removeStorageSync(app.data.cache_buy_user_address_select_key);
    }
  },

  onShow() {
    wx.setNavigationBarTitle({
      title: app.data.common_pages_title.buy
    });
    this.init();
    this.setData({
      is_first: 0
    });
  },

  // 获取数据列表
  init() {
    // 本地缓存地址
    if (this.data.is_first == 0) {
      var cache_address = wx.getStorageSync(app.data.cache_buy_user_address_select_key);
      if ((cache_address || null) != null) {
        this.setData({
          address: cache_address,
          address_id: cache_address.id
        });
      } else {
        this.setData({
          address: null,
          address_id: 0
        });
      }
    }

    // 加载loding
    wx.showLoading({
      title: '加载中...'
    });
    this.setData({
      data_list_loding_status: 1
    });

    var data = this.data.params;
    data['address_id'] = this.data.address_id;
    wx.hideLoading();
    if (data.data.data.length == 0) {
      this.setData({
        data_list_loding_status: 0
      });
    } else {
      this.setData({
        goods_list:data.data.data,
        total_price: data.data.total_price,
        extension_data: data.extension_data || [],
        data_list_loding_status: 3,
        common_order_is_booking: data.common_order_is_booking || 0,
      });

      // // 地址
      // if (this.data.address == null || this.data.address_id == 0) {
      //   if ((data.base.address || null) != null) {
      //     this.setData({
      //       address: data.base.address,
      //       address_id: data.base.address.id,
      //     });

      //     wx.setStorage({
      //       key: app.data.cache_buy_user_address_select_key,
      //       data: data.base.address,
      //     });
      //   }
      // }
    }
  },

  // 用户留言事件
  bind_user_note_event(e) {
    this.setData({
      user_note_value: e.detail.value
    });
  },

  // 提交订单
  buy_submit_event(e) {
    var params = this.data.params;
    // 表单数据
    var temp_data_list = params.data.data;
   var goodList = [];
    for (var i in temp_data_list) {
      var goods = {};
      goods.goodsId = temp_data_list[i]['goodsId'];
      goods.num = temp_data_list[i]['num'];
      goodList.push(goods);
    }

    var data = {};
    data.saleOrderDetailDTOS = goodList;
    data.businessId = temp_data_list[0]['businessId'];
    data.mobile = temp_data_list[0]['mobile'];
    // data['address_id'] = this.data.address_id;
    data['user_note'] = this.data.user_note_value;
    var timestamp = Date.parse(new Date());
    var outOrderId = timestamp + temp_data_list[0]['mobile'];
    data.outOrderId = outOrderId;

    // 数据验证
    // var validation = [{
    //   fields: 'address_id',
    //   msg: '请选择地址'
    // }];
    // if (app.fields_check(data, validation)) {
      // 加载loding
      wx.showLoading({
        title: '提交中...'
      });
      this.setData({
        buy_submit_disabled_status: true
      });

      wx.request({
        url: "http://122.112.184.150:7002/prairie/order/create",
        method: "POST",
        data: data,
        dataType: "json",
        success: res => {
          wx.hideLoading();
          if (res.data.success == true) {
            wx.redirectTo({
              url: '/pages/user-order/user-order?status='+'已提交'
            });
          } else {
            app.showToast(res.data.msg);
            this.setData({
              buy_submit_disabled_status: false
            });
          }
        },
        fail: () => {
          wx.hideLoading();
          this.setData({
            buy_submit_disabled_status: false
          });

          app.showToast("服务器请求出错");
        }
      });
    // }
  },
});