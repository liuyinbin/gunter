<!--表格最外层-->
<template>
	<div ref="gante_table" @mousewheel.passive="gun" @DOMMouseScroll.passive="gun" class="gante-table">
		<div class="gante-thead">
			<div class="gante-th" :data-key="key" v-show="th.show != false"  @mousedown="th_down" @mousemove="th_move" @mouseout="th_out" :key="index" v-for="(th,key,index) in th_data">
				<div class="cell" :style="{width:th.width ? th.width+'px' : '80px',textAlign: th.is_op ? 'center' : 'left'}">
                    {{th.value}}
                    <span v-if="th.sort_type || th.sort_type == null" :class="{ascend:th.sort_type == 'asc',descend:th.sort_type == 'desc'}" class="caret-wrapper">
                        <i @click.stop="sortCaret(1,key)" class="sort-caret ascending"></i>
                        <i @click.stop="sortCaret(2,key)" class="sort-caret descending"></i>
                    </span>
                </div>
			</div>
		</div>
		<div class="gante-tbody">
			<gante-tr :all_data="data" :data="data" :th_data="th_data"></gante-tr>
            <loading :showLoading="showLoading">没有更多了</loading>
		</div>
		<div v-show="show_proxy" :style="{left:proxy_left+'px'}" id="gante-table__column-resize-proxy"></div>
	</div>
</template>
<script>
	import ganteTr from '../gante_test/gante-table-tr.vue'
    import loading from  '@/components/common/loading'
	export default{
		data(){
			return{
				oldx:0, //记录鼠标按下的位置
				old_width:0,  //记录鼠标按下的初始宽度
				tTD:{
					current_index:null,
					mouseDown:false
				},
				proxy_left:0,
				show_proxy:false,
			}
		},
		props:{
			th_data:Object,
			data:Array,
            showLoading:Boolean,
		},
		methods:{
		    //排序
            sortCaret(mode,key){
                let cla = 'asc',assign_key = key
                if(mode == 2){
                    cla = 'desc'
                }
                for(let i in this.th_data){
                    if(this.th_data[i].sort_type || this.th_data[i].sort_type == null){
                        if(i == key){
                            //如果再次点击之前的排序，就取消排序
                            if(this.th_data[i].sort_type == cla){
                                this.$set(this.th_data[i], 'sort_type' , null)
                                assign_key = ''
                            }else{
                                if(this.th_data[i].time_mode){
                                    assign_key = this.th_data[i].time_mode == 1 ? 'start_time' : 'end_time'
                                }
                                this.$set(this.th_data[i], 'sort_type' , cla)
                            }
                        }else{
                            this.$set(this.th_data[i], 'sort_type' , null)
                        }
                    }
                }
                this.$emit('sort',assign_key,cla)
            },
			//      获取元素距离浏览器的距离
			getPos(ele){
				var p=ele.offsetParent;
				var left=ele.offsetLeft;
				var top=ele.offsetTop
				while(p){
					if(window.navigator.userAgent.indexOf("MSIE 8")>-1){
						left+=p.offsetLeft;
						top+=p.offsetTop;
					}else{
						left+=p.offsetLeft+p.clientLeft;
						top+=p.offsetTop+p.clientTop;
					}
					p=p.offsetParent;
				}
				var obj={};
				obj.x=left;
				obj.y=top;
				return obj;
			},
//      监听表格的鼠标滚轴事件,从而让甘特图上下滚动
			gun(e){
				let speed = -200
                let  scrollTop = document.getElementsByClassName('ganteview')[0].scrollTop,
                    ganteview = document.getElementsByClassName('ganteview')[0]
                if(e.wheelDelta && e.wheelDelta < 0){//兼容IE,Opera,Chrome
                    speed = 200
                }else if(e.detail > 0){
                    speed = 200
                }
                this.mark = false
                this.autoScroll(scrollTop,scrollTop + speed ,4,(value)=>{
                    ganteview.scrollTop = value
                })
			},
            /**
             *
             * @param start 起始位置
             * @param end 目标位置
             * @param rate 缓动速率
             * @param callback 变化的位置回调，支持两个参数，value和isEnding，表示当前的位置值（数值）以及是否动画结束了（布尔值）；
             */
            autoScroll(start, end, rate, callback) {
                if (start == end || typeof start != 'number') {
                    return;
                }
                end = end || 0;
                rate = rate || 2;
                var step = function () {
                    start = start + (end - start) / rate;
                    if (Math.abs(start - end) <= 1) {
                        callback(end, true);
                        return;
                    }
                    callback(start, false);
                    if(!window.requestAnimationFrame){
                        setTimeout(step, 17);
                    }else{
                        requestAnimationFrame(step);
                    }
                };
                step();
            },
            // 让表头可以拉动,改变宽度
			doc_move(e){
				var _body = document.getElementsByTagName('body')[0]
				if(this.tTD.mouseDown){
					var gante_left = this.getPos(this.$refs.gante_table).x,cel = e.clientX,gante_table_box = document.getElementsByClassName('gante-table-box')[0]
					if(gante_table_box.scrollLeft){
						cel = cel + gante_table_box.scrollLeft
					}
					let _left = cel - gante_left+3
                    // 最小的宽度只能是30
					if(_left - 30<= this.oldx + 3 -this.th_data[this.tTD.current_index].width){
                        _left = this.oldx + 3 -this.th_data[this.tTD.current_index].width + 30
                    }
					this.proxy_left = _left
					_body.style.cursor = 'col-resize'
				}
			},
            // 表头鼠标按下
			th_down(e){
                if(e.target.tagName === 'SPAN' ||e.target.tagName === 'I'){
                    return;
                }
				var table_width = this.getPos(this.$refs.gante_table).x,target=e.target,client_x = e.clientX,gante_table_box = document.getElementsByClassName('gante-table-box')[0]
				if(target.classList.contains('cell')){
					target = target.parentNode
				}
				if(gante_table_box.scrollLeft){
					client_x = client_x + gante_table_box.scrollLeft
				}
				this.oldx = client_x - table_width
				if(client_x > this.getPos(target).x + target.offsetWidth - 10){
					this.old_width = target.offsetWidth
					this.show_proxy = true
					this.tTD.current_index = target.dataset.key //记录拖动的是哪个th
					this.proxy_left = this.oldx+3 //必须要加上3像素,不然拖动会有问题
					this.tTD.mouseDown = true
                    // 给document绑定事件
					document.addEventListener('mousemove',this.doc_move,{passive:false})
					document.addEventListener('mouseup',this.doc_up,{passive:false})
				}
			},
			doc_up(){
				document.getElementsByTagName('body')[0].style.cursor = null
				if(this.tTD.mouseDown && this.oldx && this.tTD.current_index){
                    // 设置拖动后的宽度
					this.th_data[this.tTD.current_index].width = this.old_width+(this.proxy_left - this.oldx)
                    // 获取到左边表格所有td加起来的宽度
                    let str = 0,_width = document.getElementsByClassName('gante-table-box')[0].offsetWidth;
                    for(let key in this.th_data){
                        if(this.th_data[key].show != false){
                            str += this.th_data[key].width ? Number(this.th_data[key].width) + 1 : 81;
                        }
                    }
                    if(str < _width){
                        this.$parent.tabe_width = (str + 2) <= 480 ? 480 : (str + 2) + 'px';
                    }

                    // 初始化所有的值
					this.tTD.mouseDown = false
					this.show_proxy = false
					this.oldx = 0
					this.old_width = 0
					this.tTD.current_index = null
					// 给document移除绑定事件
					document.removeEventListener('mousemove',this.doc_move,false)
					document.removeEventListener('mouseup',this.doc_up,false)
				}
			},
//      给表格头部加上鼠标悬浮可以拉动效果
			th_move(e){
                if(e.target.tagName === 'SPAN' ||e.target.tagName === 'I'){
                    return;
                }

				var target = e.target,_body = document.getElementsByTagName('body')[0],client_x = e.clientX,gante_table_box = document.getElementsByClassName('gante-table-box')[0]
				if(target.classList.contains('cell')){
					target = e.target.parentNode
				}
				if(gante_table_box.scrollLeft){
					client_x = client_x + gante_table_box.scrollLeft
				}
				if(client_x > this.getPos(target).x + target.offsetWidth - 10 ){
					_body.style.cursor = 'col-resize'
				}else{
					_body.style.cursor = null
				}
			},
			th_out(){
				document.getElementsByTagName('body')[0].style.cursor = null
			}
		},
		components:{
			ganteTr,loading
		}
	}

</script>
<style lang="less" type="text/less">
	.gante-table{
		font-size: 14px;
		display: table;
		table-layout: fixed;
		word-break: break-all;
		position: relative;
        color: #666;
        width: 100%;
	}
	.gante-thead{
		position: absolute;
		top:0;
		left:0;
		width: 100%;
		z-index:2;

	}
	.gante-tbody{
		position: relative;
		padding-top:40px;
	}
	.gante-th{
		display: table-cell;
		white-space: nowrap;
		overflow: hidden;
		-webkit-user-select: none;
		-moz-user-select: none;
		-ms-user-select: none;
		user-select: none;
		text-align: left;
        background: #fff;
        box-sizing: border-box;
	}
	/*.gante-tr{*/
		/*display: table-row;*/
	/*}*/
	.gante-td{
		display: table-cell;
		position: relative;
	}
	.gante-th,.gante-td{
		word-break:keep-all;
		/*padding: 12px 0;*/
		min-width: 0;
		-webkit-box-sizing: border-box;
		box-sizing: border-box;
		-o-text-overflow: ellipsis;
		text-overflow: ellipsis;
		vertical-align: middle;
		white-space: nowrap;
		border-bottom: 1px solid #ebeef5;
		border-right: 1px solid #ebeef5;
		line-height: 40px;
	}
    .gante-th .cell ,.gante-td .cell{
		position: relative;
		word-wrap: normal;
		overflow: hidden;
		text-overflow: ellipsis;
		vertical-align: middle;
		width: 100%;
		box-sizing: border-box;
		padding: 0 10px;
		/*min-height: 16px;*/
		height:40px;
		line-height: 40px;
	}
    .gante-th .cell{
        border-top: 1px solid #ebeef5;
    }
    .cell .caret-wrapper{
        display: inline-flex;
        flex-direction: column;
        align-items: center;
        height: 34px;
        width: 24px;
        vertical-align: middle;
        cursor: pointer;
        overflow: initial;
        position: relative;
    }
    .sort-caret {
        width: 0;
        height: 0;
        border: 5px solid transparent;
        position: absolute;
        left: 7px;
    }
    .ascend .sort-caret.ascending{
        border-bottom-color:#3396fb;
    }
    .descend .sort-caret.descending{
        border-top-color:#3396fb;
    }
    .sort-caret.ascending {
        border-bottom-color: #c0c4cc;
        top: 5px;
    }
    .sort-caret.descending {
        border-top-color: #c0c4cc;
        bottom: 7px;
    }
	#gante-table__column-resize-proxy{
		position: absolute;
		top:0;
		left: 0;
		border-left: 1px solid #ebeef5;
		width: 0;
		bottom: 0;
		z-index:5;
	}

</style>
