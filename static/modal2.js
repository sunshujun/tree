define(function(require, exports, module) {
    var $ = require("../sea-module/jquery/jquery.js");

    function createModal(option) {
        var defaults = {
            ele: "", //模态框元素结构
            type: "edit",
            title: "内容添加",
            data: [{
                title: "节点名称",
                id: 'nodeName'
            }, {
                title: "节点内容",
                id: "nodeContent"
            },{
                title: "节点ID",
                id: "nodeId"
            }]
        };
        var opts = $.extend(true, defaults, option);

        var _createModal = {
            _init: function() {
                $.extend(true, this, opts);
                this.ele = this._renderModal().addClass("hide");
                this._bindEvent();
            },
            _renderModal: function() {
                var oDiv = $("<div></div>");
                var modal = oDiv.clone().addClass("tmodal");
                var content = oDiv.clone().addClass("tmodal-content");
                var header = oDiv.clone().addClass("tmodal-header");
                var body = oDiv.clone().addClass("tmodal-body");
                var footer = oDiv.clone().addClass("tmodal-footer").html("<button class='confirm'>确认</button> <button data-dismissed='modal'>取消</button>");
                var close = $("<button class='close' data-dismissed='modal'>x</button>")
                header.append($("<h4></h4>").text(this.title), close);
                var groups = this.data.map(function(item) {
                    var group = oDiv.clone().addClass("tform-group");
                    var label = $("<label for='" + item.id + "'></label>").text(item.title + ":");
                    var input = $("<input class='tform-control' type='text' id='" + item.id + "' name='" + item.id + "'>");
                    return group.append(label, input);
                })
                body.append(groups);
                content.append(header, body, footer);
                return modal.append(content);
            },
            /**
             * 获取编辑之后的内容，返回数据为数组,依次为节点名，节点内容，节点Id
             * */
            getContent: function() {
                var datas = this.data.map(function(item) {
                    return $("#" + item.id).val() || "";
                }) 
                return datas; 
            },
            /**
             * 为模态框确定按钮绑定相应事件
             * */
            confirmEvent: function(type, fn) {
                if (typeof fn === "function") {
                    $(this.ele).find(".confirm").on(type, fn)
                }
            },

            /**
             * 为模态框绑定相应事件
             * */
            _bindEvent: function() {
                //为属性为data-dismissed='modal'的元素添加关闭模态框事件
                $(this.ele).find("[data-dismissed='modal']").on("click", function() {
                    $(".tmodal").addClass("hide");
                })
            }
        }
        _createModal._init();
        return _createModal;
    }
    return createModal;
})
