const app = getApp();
Page({
  data: {
    success: false,
    msg: null,
    code: null,
    data_list_loding_status: 1,
    data_bottom_line_status: false,
    result: {
      dataList: [],
    },
    totalNum: 0,
    totalPageNum: 0,
    pageSize: 0,
    pageIndex: 1,
    goodsName: null,
    is_show_popup_form: false,
    popup_form_loading_status: false,
  },

  onLoad(params) {
    this.setData({ goodsName: params.keywords});
    this.init();
  },

  onShow() {
    wx.setNavigationBarTitle({title:     app.data.common_pages_title.goods_search})
  },

  // 初始化
  init() {
    // 获取数据
    this.get_data_list();
  },

  // 获取数据列表
  get_data_list(is_mandatory) {
    // 分页是否还有数据
    if ((is_mandatory || 0) == 0) {
      if (this.data.data_bottom_line_status == true) {
        return false;
      }
    }

    // 加载loding
    wx.showLoading({title: "加载中..." });
    this.setData({
      data_list_loding_status: 1
    });

    // 参数
    var params = this.data.goodsName;

    // 获取数据
    wx.request({
      url: "http://122.112.184.150:7002/prairie/goods/search?goodsName=" + params + "&pageIndex=" + this.data.pageIndex,
      method: "GET",
      // data: post_data,
      // dataType: "json",
      // header: { 'content-type': 'application/x-www-form-urlencoded' },
      success: res => {
        wx.hideLoading();
        wx.stopPullDownRefresh();
        console.log("===data===" + JSON.stringify(res.data));
        this.setData({ load_status: 1 });

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
              pageSize: res.data.result.pageSize,
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
            });
            if (this.data.pageIndex <= 1) {
              this.setData({
                result: {
                  dataList: [],
                },
                data_bottom_line_status: false,
              });
            }
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
          load_status: 1,
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
});
