define(function(require, exports, module) {

    var $ = require("./../sea-module/jquery/jquery.js")
    var createModal = require("./modal2.js");

    function createTree(options) {
        var defaults = {
            element: "", //添加Tree结构的元素
            time: 200, //设置展开收缩时间 
            isEdit: true, //是否开启编辑功能
            isAdd: true, //是否开启添加节点功能
            isRemove: true, //是否开启删除节点功能
            isChecked: true, //是否开启复选框 
            datas: [{ //树形节点数据
                idName: "treeDemo_1",
                pIdName: "",
                nodeName: "父节点一",
                data: "demo1"
            }, {
                idName: "treeDemo_2",
                pIdName: "",
                nodeName: "父节点二",
                data: "demo2"
            }, {
                idName: "treeDemo_3",
                pIdName: "",
                nodeName: "父节点三",
                data: "demo3"
            }, {
                idName: "treeDemo_11",
                pIdName: "treeDemo_1",
                nodeName: "子节点一",
                data: ""
            }, {
                idName: "treeDemo_12",
                pIdName: "treeDemo_1",
                nodeName: "子节点二",
                data: ""
            }, {
                idName: "treeDemo_13",
                pIdName: "treeDemo_1",
                nodeName: "子节点二",
                data: ""
            }],
            newDatas: [], //存储转换格式之后的数据
            panel: null,
            modal: null
        };
        var opts = $.extend(true, defaults, options)

        var _cerateTree = {
            _init: function(opts) {
                $.extend(true, this, opts);
                this._getRootId();
                this._transformData(this.newDatas);
                var $ul = this._renderTreeDom(this.newDatas);
                $(this.element).append($ul.addClass("tree"));
                this._addDom();
                this._bindEvent();
            },
            /**
             * 初始化dom结构
             * */
            _renderTreeDom: function(node) {
                var _this = this;
                var oUl = $("<ul></ul>");
                var arr = node.map(function(item, index) {
                    if (item.children) {
                        var oSpan = $("<span></span>").addClass("icon icon-triangle-close");
                        var oA = $("<a data=" + item.data + "></a>").html("<span class='icon icon-folder-close'></span>" + item.nodeName);
                        var oUl1 = _this._renderTreeDom(item.children);
                        return $("<li id=" + item.idName + " class='parent'></li>").append(oSpan, oA, oUl1.slideUp());
                    } else {
                        var oSpan = $("<span></span>").addClass("icon icon-file");
                        var oA = $("<a data=" + item.data + "></a>").text(item.nodeName).prepend(oSpan);
                        return $("<li id=" + item.idName + "></li>").append(oA);
                    }
                })
                arr.forEach(function(item) {
                    oUl.append(item);
                })
                return oUl;
            },
            /**
             * 获取根节点数组
             * */
            _getRootId: function() {
                this.newDatas = this.datas.filter(function(item, index) {
                    return item.pIdName === "" || !item.pIdName
                });
            },
            /**
             * 将数据转化为所需的数据格式
             * */
            _transformData: function(arr) {
                var _this = this
                arr.map(function(item1, index) {
                    var arr1 = _this.datas.filter(function(item2, index) {
                        return item2.pIdName === item1.idName
                    });
                    if (arr1.length) {
                        _this._transformData(arr1)
                    } else {
                        return;
                    }
                    return item1.children = arr1;
                })
            },
            /**
             * 根据设置，添加modal,panel
             * */
            _addDom: function() {
                if (this.isAdd || this.isRemve || this.isEdit) {
                    this.panel = $("<ul class='hide'></ul>").attr("id", "tree-panel")
                    if (this.isAdd) {
                        var oLi1 = $("<li class='add-node'></li>").html("<button>添加子节点</button>")
                        this.panel.append(oLi1);
                    }
                    if (this.isRemove) {
                        var oLi2 = $("<li class='remove-node'></li>").html("<button>删除该节点</button>")
                        this.panel.append(oLi2);
                    }
                    if (this.isEdit) {
                        var oLi3 = $("<li class='edit-node'></li>").html("<button>编辑该节点</button>")
                        this.panel.append(oLi3);
                    }
                    $("body").append(this.panel);
                };
                if (this.isAdd) {
                    this.modal = createModal({
                        title: "添加节点内容",
                        data: [{
                            title: "节点名称",
                            id: 'nodeName'
                        }, {
                            title: "节点内容",
                            id: "nodeContent"
                        }]
                    })
                    $("body").append(this.modal.ele);
                }
            },
            /**
             * 绑定事件
             * */
            _bindEvent: function() {
                var _this = this;
                //为收缩图标绑定收缩事件 
                $(_this.element).find(".parent span:first").on("click", function() {
                    $(this).toggleClass("icon-triangle-close").toggleClass("icon-triangle-open");
                    $(this).siblings("a:first").find("span").toggleClass("icon-folder-close").toggleClass("icon-folder-open");
                    $(this).siblings("ul:first").slideToggle(_this.time);
                });

                //节点点击事件，改变背景样式
                var oldSelected = $(_this.element).find("a:first");
                $(_this.element).find("li>a").on("click", function() {
                    oldSelected.removeClass("cur-selected");
                    $(this).addClass("cur-selected");
                    oldSelected = $(this);
                });
                //右击节点,弹出panel，进行选择操作
                var rightClickNode = null;
                if (this.panel || this.modal) {
                    $(_this.element).find("li>a").on("contextmenu", function(event) {
                        rightClickNode = this;
                        evevt = event || window.event;
                        event.preventDefault();
                        event.returnValue = false;
                        _this.panel.css({ "display": "block", "top": event.clientY + "px", "left": event.clientX + "px" });
                        $("body").one("click", function() {
                            _this.panel.css("display", "none");
                        })
                    })
                };
                // 编辑叶子节点事件
                if (_this.isEdit) {
                    $(_this.panel).find(".edit-node").on("click", function() {
                        var $oa = $(rightClickNode);
                        var oSpan = $oa.find("span")[0];
                        var oldValue = $oa.text();
                        var value = "";
                        oInput = $("<input type='text' value=" + oldValue + ">");

                        function changeCon() {
                            value = oInput.val();
                            $oa.text(value).prepend(oSpan);
                            oInput.remove();
                            if (value !== oldValue) {
                                _this.datas.forEach(function(item, index) {
                                    if (item.nodeName === oldValue) {
                                        _this.datas[index].nodeName = value;
                                    }
                                })
                            }
                            console.log(_this.datas)
                        }
                        oInput.blur(changeCon);
                        oInput.keydown(function(event) {
                            var ev = event || window.event;
                            ev.keyCode === 13 ? changeCon() : "";
                        })
                        $oa.append(oInput);
                        oInput.focus();
                    })
                };

                //开启删除功能，为其添加右击删除功能
                if (_this.isRemove) {
                    $(_this.panel).find(".remove-node").on("click", function() {
                        if (confirm("确定删除节点:" + $(rightClickNode).text())) {
                            $(rightClickNode).parent().remove();
                        }
                    })
                };

                //显示添加节点模态框
                if (_this.isAdd) {
                    $(_this.panel).find(".add-node").on("click", function() {
                        $(_this.modal.ele).removeClass("hide");
                    })
                }

                //为模态框确认按钮添加事件
                if (_this.modal) {
                    var modal = _this.modal;
                    modal.confirmEvent("click", function() {
                        $(modal.ele).addClass("hide");
                        var data=modal.getContent();
                        var json={nodeName:data[0],data:data[1],idName:data[2]};
                        if ($(rightClickNode).next().is("ul")) { //判断点击的该节点是否有子节点
                            var oSpan = $("<span></span>").addClass("icon icon-file"); 
                            var oA = $("<a></a>").text(data[0]).prepend(oSpan).attr("data", data[1]);
                            $(rightClickNode).next().append($("<li></li>").append(oA));
                        } else {
                            var oSpan1 = $("<span></span>").addClass("icon icon-triangle-open");
                            $(rightClickNode).before(oSpan1);
                            $(rightClickNode).find("span").removeClass("icon-file").addClass("icon-folder-open");
                            var oSpan2 = $("<span></span>").addClass("icon icon-file"); 
                            var oA = $("<a></a>").text(data[0]).prepend(oSpan2).attr("data", data[1]);
                            var oLi = $("<li class='parent'></li>").append(oA);
                            $(rightClickNode).after($("<ul></ul>").append(oLi));
                        }
                        json.pIdName=$(rightClickNode).parent().attr("id");  
                    })
                }

            }
        };

        _cerateTree._init(opts);
        return _cerateTree;
    }
    return createTree;
})
