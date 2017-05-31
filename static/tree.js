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

        //如果需要添加数据功能，引入modal模板，并该function
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
        var oldSelected = $(".tree a:first")

        function toggleSelected() {
            oldSelected.removeClass("cur-selected");
            $(this).addClass("cur-selected");
            oldSelected = $(this);
        }

        /**
         * 改变节点数据，并保存到sessionStroage中
         * 
         * @param {Array} id id为该叶子节点 
         * @param {string} value  需要改变的值  
         */
        function changeNode(id, value) {

        }

        /**
         * 双击编辑叶子节点
         */
        function editLeaf() {
            var oA = $(this);
            var oSpan = oA.find("span")[0];
            oInput = $("<input type='text' value=" + $(this).text() + ">");

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
        var oldModel = null;

        function rightClick(event) {
            var _this = this;
            oldModel ? oldModel.remove() : "";
            evevt = event || window.event;
            event.preventDefault();
            event.returnValue = false;
            var oUl = $("<ul></ul>").attr("id", "tree-panel").css({ "top": event.clientY + "px", "left": event.clientX + "px" })
            if (setting.rightClick.isAdd) {
                var oLi1 = $("<li></li>").attr("class", "add-node").html("<button>添加子节点</button>").on("click", function() {
                    addNode(_this);
                });

                oUl.append(oLi1);
            }
            if (setting.rightClick.isRemove) {
                var oLi2 = $("<li></li>").attr("class", "remove-node").html("<button>删除该节点</button>").on("click", function() {
                    removeNode(_this);
                });

                oUl.append(oLi2);
            }
            oldModel = oUl;
            $("body").append(oUl).one("click", function() { oUl.remove() });
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
                if ($(obj).next().is("ul")) {
                    var oSpan = $("<span></span>").addClass("icon icon-file");
                    var oA = $("<a></a>").on("click", toggleSelected).text(data[0]).prepend(oSpan).attr("data", data[1]);
                    setting.isEdit ? oA.on("dblclick", editLeaf) : "";
                    setting.rightClick ? oA.on("contextmenu", rightClick) : "";
                    $(obj).next().append($("<li></li>").append(oA));
                } else {
                    var oSpan1 = $("<span></span>").addClass("icon icon-triangle-open").on('click', shrinkTree);
                    $(obj).before(oSpan1);
                    $(obj).find("span").removeClass("icon-file").addClass("icon-folder-open")
                    var oSpan2 = $("<span></span>").addClass("icon icon-file");
                    var oA = $("<a></a>").on("click", toggleSelected).text(data[0]).prepend(oSpan2).attr("data", data[1]);
                    setting.isEdit ? oA.on("dblclick", editLeaf) : "";
                    setting.rightClick ? oA.on("contextmenu", rightClick) : "";
                    var oLi = $("<li></li>").append(oA);
                    $(obj).after($("<ul></ul>").append(oLi));
                }
            })
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
                    var oUl1 = createTree(item.children);
                    if(item.open || !(oUl.id)){
                          oSpan.removeClass("icon-triangle-close").addClass("icon-triangle-open");
                          var oA = $("<a></a>").html("<span class='icon icon-folder-open'></span>" + item.name);
                    }else{ 
                         oUl1.slideUp();
                         var oA = $("<a></a>").html("<span class='icon icon-folder-close'></span>" + item.name);
                    }
                    setting.rightClick ? oA.on("contextmenu", rightClick) : "";
                    return $("<li></li>").append(oSpan, oA, oUl1.attr("id", oUl.id + "" + index));
                } else {
                    var oSpan = $("<span></span>").addClass("icon icon-file");
                    var oA = $("<a></a>").on("click", toggleSelected).text(item.name).prepend(oSpan);
                    setting.isEdit ? oA.on("dblclick", editLeaf) : "";
                    setting.rightClick ? oA.on("contextmenu", rightClick) : "";
                    item.data ? oA.attr("data", item.data) : "";
                    return $("<li></li>").append(oA);
                }
            }) 
            oUl.append(arr); 
            return oUl;
        };

        var tree = createTree(node).addClass("tree"); 
        $(id).append(tree);
    }

    module.exports = appendTree;
})
