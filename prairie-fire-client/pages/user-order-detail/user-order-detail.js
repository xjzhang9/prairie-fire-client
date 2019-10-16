const app = getApp();
Page({
  data: {
    address: {
      name: "张效见",
      tel: "15155157296",
      province_name: "安徽省",
      city_name: "合肥市",
      county_name: "蜀山区",
      address: "石笋路禹州华侨城二期"
    },
    address_id: 0,
    total_price: 0,
    user_note_value: '',
    is_first: 1,
    extension_data: [],
    common_order_is_booking: 0,
    detail: null,
    detail_list: [],
    data_list_loding_status: 1,
    data_list_loding_msg: '',
    data_bottom_line_status: false,
    params: null,
  },

  onLoad(params) {
    this.setData({params: params});
    this.init();
  },

  onShow() {
    wx.setNavigationBarTitle({title: app.data.common_pages_title.user_order_detail});
  },

  init() {
    var self = this;
    wx.showLoading({title: "加载中..." });
    this.setData({
      data_list_loding_status: 1
    });

    wx.request({
      url: "http://122.112.184.150:7002/prairie/order/getOrderDetail?billCode=" + this.data.params.id,
      method: "GET",
      success: res => {
        wx.hideLoading();
        wx.stopPullDownRefresh();
        if (res.data.success == true) {
          var data = res.data.result;
          console.log("===index===" + JSON.stringify(res.data));
          self.setData({
            detail: data,
            detail_list:[
              { name: "订单号", value: data.billCode || ''},
              { name: "状态", value: data.billState || ''},
              { name: "总价", value: data.taxAmount || ''},
              {name: "支付方式", value: '线下支付'},
              {name: "用户留言", value: data.user_note || ''},
              { name: "创建时间", value: data.createTime || ''},
              { name: "修改时间", value: data.latModifyTime || ''},
              { name: "开票时间", value: data.delivery_time || '' },
              {name: "发货时间", value: data.delivery_time || ''},
              {name: "送达时间", value: data.collect_time || ''},
              {name: "取消时间", value: data.close_time || ''},
            ],
            data_list_loding_status: 3,
            data_bottom_line_status: true,
            data_list_loding_msg: '',
          });
        } else {
          self.setData({
            data_list_loding_status: 2,
            data_bottom_line_status: false,
            data_list_loding_msg: res.data.msg,
          });
          app.showToast(res.data.msg);
        }
      },
      fail: () => {
        wx.hideLoading();
        wx.stopPullDownRefresh();
        self.setData({
          data_list_loding_status: 2,
          data_bottom_line_status: false,
          data_list_loding_msg: '服务器请求出错',
        });

        app.showToast("服务器请求出错");
      }
    });
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.init();
  },

});
