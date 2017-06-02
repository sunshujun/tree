define(function(require, exports, module) {
    var $ = require("../sea-module/jquery/jquery.js");
    var appendModal = null;
    /**
     * 添加树结构
     *
     * @param {Array} node为传入的数据 
     * @param {Array} id id为需要在哪个dom中插入tree的id值 
     * @param {json} setting  该值为对树的一些规范设置 
     * @return {Object} 返回树结构
     */
    function appendTree(node, id, setting) {
        setting = setting || {};

        /**
         * 父节点点击事件，点击图标收缩下级树结构
         */
        function shrinkTree() {
            $(this).toggleClass("icon-triangle-close").toggleClass("icon-triangle-open");
            $(this).siblings("a:first").find("span").toggleClass("icon-folder-close").toggleClass("icon-folder-open");
            $(this).siblings("ul:first").slideToggle(setting.time ? setting.time : "");
        }

        /**
         * 节点点击事件，改变背景样式
         */
        var oldSelected = $(".tree a:first");

        function toggleSelected() {
            oldSelected.removeClass("cur-selected");
            $(this).addClass("cur-selected");
            oldSelected = $(this);
        }


        /**
         * 双击编辑叶子节点
         */
        function editLeaf(_this) {
            var oA = $(_this);
            var oSpan = oA.find("span").clone(true);
            oInput = $("<input type='text' value=" + oA.text() + ">");

            function changeCon() {
                oA.text(oInput.val()).prepend(oSpan);
                oInput.remove();
            }
            oInput.blur(changeCon)
            oInput.keydown(function(event) {
                var ev = event || window.event;
                ev.keyCode === 13 ? changeCon() : "";
            })
            oA.append(oInput);
            oInput.focus();
        }

        /**
         * 右击叶子节点,弹出增删选项
         */
        function rightClick(event) {
            _this = this;
            evevt = event || window.event;
            event.preventDefault();
            event.returnValue = false;
            panel.css({ "display": "block", "top": event.clientY + "px", "left": event.clientX + "px" });
            $("body").one("click", function() {
                panel.css("display", "none");
            })
        }

        /**
         * 删除节点
         *@param {object} obj为点击的a标签
         */
        function removeNode(obj) {
            if (confirm("确定删除节点:" + $(obj).text())) {
                $(obj).parent().remove();
            }
        }
        /**
         * 增加节点
         *@param {object} obj为点击的a标签
         */
        function addNode(obj) {
            modal.removeClass("hide");
            modal.find(".confirm").one("click", function() {
                modal.addClass("hide");
                var data = modal.getValue();
                if ($(obj).next().is("ul")) { //判断点击的该节点是否有子节点
                    var oSpan = $("<span></span>").addClass("icon icon-file");
                    var oSpan2 = setting.isChecked ? addCheckbox() : "";
                    var oA = $("<a></a>").on("click", toggleSelected).text(data[0]).prepend(oSpan2, oSpan).attr("data", data[1]);
                    setting.isEdit ? oA.on("dblclick", editLeaf) : "";
                    setting.rightClick ? oA.on("contextmenu", rightClick) : "";
                    $(obj).next().append($("<li></li>").append(oA));
                } else {
                    var oSpan1 = $("<span></span>").addClass("icon icon-triangle-open").on('click', shrinkTree);
                    $(obj).before(oSpan1);
                    $(obj).find("span").removeClass("icon-file").addClass("icon-folder-open");
                    var oSpan2 = $("<span></span>").addClass("icon icon-file");
                    var oSpan3 = setting.isChecked ? addCheckbox() : "";
                    var oA = $("<a></a>").on("click", toggleSelected).text(data[0]).prepend(oSpan3, oSpan2).attr("data", data[1]);
                    setting.isEdit ? oA.on("dblclick", editLeaf) : "";
                    setting.rightClick ? oA.on("contextmenu", rightClick) : "";
                    var oLi = $("<li></li>").append(oA);
                    $(obj).after($("<ul></ul>").append(oLi));
                }
            })
        }

        /**
         * 创建树结构复选框，并添加处理事件
         */
        function addCheckbox() {
            var oSpan = $("<span></span>").addClass("icon icon-checkbox-no");
            oSpan.on("click", function() {
                var oUl = $(this).next().next();

                if ($(this).hasClass("icon-checkbox-selected-part")) {
                    $(this).removeClass("icon-checkbox-selected-part").addClass("icon-checkbox-no");
                } else {
                    $(this).toggleClass('icon-checkbox-no icon-checkbox-selected-full ').removeClass("icon-checkbox-selected-part");
                }

                if (oUl.is("ul")) {
                    if ($(this).hasClass("icon-checkbox-selected-full")) {
                        oUl.find(".icon-checkbox-no,.icon-checkbox-selected-part").addClass('icon-checkbox-selected-full').
                        removeClass("icon-checkbox-selected-part icon-checkbox-no");
                    } else {
                        oUl.find(".icon-checkbox-selected-full,.icon-checkbox-selected-part").addClass('icon-checkbox-no').
                        removeClass("icon-checkbox-selected-full icon-checkbox-selected-part");
                    }
                }

                var oUls = $(this).parentsUntil(".tree").filter("ul");
                for (var i = 0; i < oUls.length; i++) {
                    if ($(oUls[i]).find(".icon-checkbox-no").length) {
                        if ($(oUls[i]).find(".icon-checkbox-no").length === $(oUls[i]).find("[class*='icon-checkbox']").length) {
                            $(oUls[i]).parent().find("span:eq(1)").addClass("icon-checkbox-no").
                            removeClass("icon-checkbox-selected-full", "icon-checkbox-selected-part");
                        } else {
                            $(oUls[i]).parent().find("span:eq(1)").addClass("icon-checkbox-selected-part").
                            removeClass("icon-checkbox-selected-full icon-checkbox-no");
                        }
                    } else {
                        $(oUls[i]).parent().find("span:eq(1)").addClass("icon-checkbox-selected-full").
                        removeClass("icon-checkbox-selected-part icon-checkbox-no");
                    }
                }
            })
            return oSpan;
        }

        function getResult(key) {
            var arrs = $(".tree a");
            var newArr = arrs.filter(function(index, item) {
                var content = $(item).text();
                return content.search(key) !== -1
            })
            return newArr;
        }

        /**
         * 创建树结构搜索框，并添加处理事件
         */
        function createSearch() {
            var oSearch = $("<div class='tree-search'></div>");
            var oImg = $("<img src='assets/imgs/search.png'>");
            var oInput = $("<input type='text' placeholder='请输入节点名称'>");
            var oldArr = []; 
            oInput.keyup(function(event) { 
                var ev = event || window.event;
                if (ev.keyCode === 13) { 
                    var newArr = oInput.val()?getResult(oInput.val()):[]; 
                    newArr.lenght===0?oInput.val('抱歉，搜索到0条结果'):
                                                    oInput.val("搜索到"+newArr.length+"条结果")
                    for (var i = 0; i < oldArr.length; i++) {
                        $(oldArr[i]).removeClass("searched")
                    }
                    for (var i = 0; i < newArr.length; i++) {
                        $(newArr[i]).addClass("searched")
                    }
                    oldArr = newArr;
                }
            }); 
            return oSearch.append(oInput, oImg);
        }
        /**
         * 使用递归遍历数组，创建树结构
         *
         * @param {Array} node为传入的数据
         * @return {Object} 返回树结构
         */
        var level = 0; 
        function createTree(node) {
            var oUl = $("<ul></ul>");
            oUl.id = level++;
            var arr = node.map(function(item, index) {
                if (item.children) {
                    var oSpan = $("<span></span>").addClass("icon icon-triangle-close");
                    oSpan.on('click', shrinkTree);
                    var oSpan2 = setting.isChecked ? addCheckbox() : "";
                    var oUl1 = createTree(item.children);
                    if (item.open || !(oUl.id)) {
                        oSpan.removeClass("icon-triangle-close").addClass("icon-triangle-open");
                        var oA = $("<a></a>").html("<span class='icon icon-folder-open'></span>" + item.name);
                    } else {
                        oUl1.slideUp();
                        var oA = $("<a></a>").html("<span class='icon icon-folder-close'></span>" + item.name);
                    }
                    setting.rightClick ? oA.on("contextmenu", rightClick) : "";
                    return $("<li></li>").append(oSpan, oSpan2, oA, oUl1.attr("id", oUl.id + "" + index));
                } else {
                    var oSpan = $("<span></span>").addClass("icon icon-file");
                    var oSpan2 = setting.isChecked ? addCheckbox() : "";
                    var oA = $("<a></a>").on("click", toggleSelected).text(item.name).prepend(oSpan);
                    setting.isEdit ? oA.on("dblclick", editLeaf) : "";
                    setting.rightClick ? oA.on("contextmenu", rightClick) : "";
                    item.data ? oA.attr("data", item.data) : "";
                    item.bindEvent ? oA.on("click", function() {
                        item.bindEvent($(this).text(), $(this).attr("data"));
                    }) : "";
                    return $("<li></li>").append(oSpan2, oA);
                }
            })
            oUl.append(arr);
            return oUl;
        };
        var tree = createTree(node).addClass("tree");
        $(id).append(tree);
        setting.isSearch ? $(id).prepend(createSearch()) : "";

        //如果需要添加数据功能，引入modal模板并执行该function
        var modal = null;
        if (setting.rightClick) {
            if (setting.rightClick.isAdd) {
                appendModal = require("./modal.js");
                modal = appendModal("添加内容", [{
                    title: "节点名称",
                    id: 'nodeName'
                }, {
                    title: "节点内容",
                    id: "nodeContent"
                }])
            };
        }

        //如果需要右键点击功能，创建一个面板panel
        var panel = null;
        var _this = null;
        if (setting.rightClick) {
            panel = $("<ul class='hide'></ul>").attr("id", "tree-panel")
            if (setting.rightClick.isAdd) {
                var oLi1 = $("<li class='add-node'></li>").html("<button>添加子节点</button>").on("click", function() {
                    addNode(_this);
                });
                panel.append(oLi1);
            }
            if (setting.rightClick.isRemove) {
                var oLi2 = $("<li class='remove-node'></li>").html("<button>删除该节点</button>").on("click", function() {
                    removeNode(_this);
                });
                panel.append(oLi2);
            }
            if (setting.rightClick.isEdit) {
                var oLi3 = $("<li class='edit-node'></li>").html("<button>编辑该节点</button>").on("click", function() {
                    editLeaf(_this);
                });
                panel.append(oLi3);
            }
            $("body").append(panel);
        }


    }

    module.exports = appendTree;
})
