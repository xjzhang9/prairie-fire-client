const app = getApp();
Page({
  data: {
    result: {
      dataList: [],
    },
    totalNum: 0,
    totalPageNum: 0,
    pageSize: 5,
    pageIndex: 1,
    data_list_loding_status: 1,
    data_bottom_line_status: false,
    input_keyword_value: '',
    load_status: 0,
    status_flag:-1,
    nav_status_list: [{
        name: "全部",
        value: "-1"
      },
      {
        name: "已提交",
        value: "1"
      },
      {
        name: "已开票",
        value: "2"
      },
      {
        name: "已发货",
        value: "3"
      },
      {
        name: "已送达",
        value: "4"
      },
      {
        name: "已取消",
        value: "5,6"
      },
    ],
    status_list: [
      {
        name: "全部",
        value: "-1"
      },
    {
        name: "INITIAL",
      value: "1"
    },
    {
      name: "ERP_TICKET",
      value: "2"
    },
    {
      name: "SHIPPED",
      value: "3"
    },
    {
      name: "DELIVERED",
      value: "4"
    },
    {
      name: "CANCEL",
      value: "5,6"
    },
    ],
    nav_status_index: 0,
  },

  onLoad(params) {
    var status = getApp().globalData.order_status;
    // 是否指定状态
    var nav_status_index = 0;
    if ((status || null) != null) {
      for (var i in this.data.nav_status_list) {
        if (this.data.nav_status_list[i]['value'] == status) {
          nav_status_index = i;
          break;
        }
      }
    }
    getApp().globalData.order_status = "-1";

    this.setData({
      nav_status_index: nav_status_index,
    });
    this.init();
  },

  onShow() {
    wx.setNavigationBarTitle({
      title: app.data.common_pages_title.user_order
    });
  },

  init() {
    // var user = app.get_user_cache_info(this, "init");
    // // 用户未绑定用户则转到登录页面
    // if (app.user_is_need_login(user)) {
    //   wx.redirectTo({
    //     url: "/pages/login/login?event_callback=init"
    //   });
    //   return false;
    // } else {
    // 获取数据
    this.get_data_list(1);
    // }
  },

  // 输入框事件
  input_event(e) {
    this.setData({
      input_keyword_value: e.detail.value
    });
  },

  // 获取数据
  get_data_list(is_mandatory) {
    // 分页是否还有数据
    if ((is_mandatory || 0) == 0) {
      if (this.data.data_bottom_line_status == true) {
        return false;
      }
    }

    // 加载loding
    wx.showLoading({
      title: "加载中..."
    });
    this.setData({
      data_list_loding_status: 1
    });

    // 参数
    var order_status = ((this.data.status_list[this.data.nav_status_index] || null) == null) ? "全部" : this.data.status_list[this.data.nav_status_index]['name'];
    var url = "http://122.112.184.150:7002/prairie/order/list?mobile=" + "15155157296" + "&pageIndex=" + this.data.pageIndex + "&pageSize=" + this.data.pageSize;

    if (order_status != "全部") {
      url = url + "&billState=" + order_status +  "&pageIndex=" + this.data.pageIndex;
    } else {
      url = url +  "&pageIndex=" + this.data.pageIndex;
    }
    // 获取数据
    wx.request({
      url: url,
      method: "GET",
      success: res => {
        console.log("===index===" + JSON.stringify(res.data));
        wx.hideLoading();
        wx.stopPullDownRefresh();
        if (res.data.success == true) {
          if (res.data.result.totalNum > 0) {
            if (this.data.pageIndex <= 1) {
              var temp_data_list = res.data.result.dataList;
            } else {
              var temp_data_list = this.data.result.dataList;
              var temp_data = res.data.result.dataList;
              for (var i in temp_data) {
                temp_data_list.push(temp_data[i]);
              }
            }
            this.setData({
              result: {
                dataList: temp_data_list,
              },
              totalNum: res.data.result.totalNum,
              totalPageNum: res.data.result.totalPageNum,
              data_list_loding_status: 3,
              pageIndex: res.data.result.pageIndex + 1
            });

            // 是否还有数据
            if (this.data.pageIndex > 1 && this.data.pageIndex > this.data.totalPageNum) {
              this.setData({ data_bottom_line_status: true });
            } else {
              this.setData({ data_bottom_line_status: false });
            }
          } else {
            this.setData({
              data_list_loding_status: 0,
              result: {
                dataList: [],
              },
              data_bottom_line_status: true
            });
          }
        } else {
          this.setData({
            data_list_loding_status: 0
          });

          app.showToast(res.data.msg);
        }
      },
      fail: () => {
        wx.hideLoading();
        wx.stopPullDownRefresh();

        this.setData({
          data_list_loding_status: 2,
          data_bottom_line_status: true
        });
        app.showToast("服务器请求出错");
      }
    });
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.setData({
      pageIndex: 1
    });
    this.get_data_list(1);
  },

  // 滚动加载
  scroll_lower(e) {
    this.get_data_list();
  },

  // 取消
  cancel_event(e) {
    wx.showModal({
      title: "温馨提示",
      content: "取消后不可恢复，确定继续吗?",
      confirmText: "确认",
      cancelText: "不了",
      success: result => {
        if (result.confirm) {
          // 参数
          var billCode = e.currentTarget.dataset.value;
          var index = e.currentTarget.dataset.index;

          // 加载loding
          wx.showLoading({
            title: "处理中..."
          });

          wx.request({
            url: "http://122.112.184.150:7002/prairie/order/cancel?billCode=" + billCode,
            method: "POST",
            data: { "business": "12", "mobile": "15155157296", "billCode": billCode },
            dataType: "json",
            success: res => {
              wx.hideLoading();
              if (res.data.success == true) {
                var temp_data_list = this.data.result.dataList;
                temp_data_list[index]['billStateDesc'] = '已取消';
                if (this.data.nav_status_index != -1) {
                  temp_data_list.splice(index, 1);
                }
                this.setData({
                  result: {
                    dataList: temp_data_list,
                  }
                });
                app.showToast("订单已取消", "success");
              } else {
                app.showToast(res.data.msg);
              }
            },
            fail: () => {
              wx.hideLoading();
              app.showToast("服务器请求出错");
            }
          });
        }
      }
    });
  },

  // // 取消
  // rush_event(e) {
  //   app.showToast("取消成功", "success");
  // },

  // 导航事件
  nav_event(e) {
    this.setData({
      nav_status_index: e.currentTarget.dataset.index || 0,
      pageIndex: 1,
    });
    this.get_data_list(1);
  },
});