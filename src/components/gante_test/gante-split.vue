<template>
	<div @mousedown="down"  ref="split_liu" :style="{left:Number(left)?left+'px':left}" class="gante-split-liu">
		<div class="gante-split-column">
			<div></div>
			<div></div>
			<div></div>
		</div>
		<div v-show="show_split" :style="{left:split_resize_left+'px'}" class="gante-split-liu-resize"></div>
	</div>
</template>
<script>
	export default{
		data(){
			return{
				show_split:false,
				split_resize_left:0,
				mouseDown:false
			}
		},
		props:['left'],
		mounted(){

		},
		methods:{
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
			doc_move(e){
				if(this.mouseDown){
					var _body = document.getElementsByTagName('body')[0]
					this.split_resize_left = e.clientX - this.getPos(this.$refs.split_liu).x +3
					_body.style.cursor = 'e-resize'
				}
			},
			doc_up(){
				if(this.mouseDown){
					var _body = document.getElementsByTagName('body')[0]
					this.$parent.tabe_width = this.split_resize_left + document.getElementsByClassName('gante-table-box')[0].offsetWidth
					document.getElementsByClassName('gante-gc-box')[0].style.width = document.getElementsByClassName('gante-box')[0].offsetWidth - this.$parent.tabe_width+'px'
					this.show_split = false
					this.split_resize_left = 0
					this.mouseDown = false
					_body.classList.remove('unselecttable')
					_body.style.cursor = null
					document.removeEventListener('mousemove',this.doc_move,false)
					document.removeEventListener('mouseup',this.doc_up,false)
				}
			},
			down(){
				this.mouseDown = true
				this.show_split = true
				document.getElementsByTagName('body')[0].className += 'unselecttable'
				document.addEventListener('mousemove',this.doc_move,false)
				document.addEventListener('mouseup',this.doc_up,false)
			}
		}
	}
</script>
<style>
	.gante-split-liu{
		width: 5px;
		background: #ebeef5;
		height: 100%;
		position: absolute;
		border-left: 1px solid #ccc;
		border-right: 1px solid #ccc;
		box-shadow: 0 0 5px #cccccc;
		cursor: e-resize;
		z-index:5;
		transition: background .1s ease;
	}
	.gante-split-liu:hover{
		background:#dfe7fb ;
	}
	.gante-split-column{
		position: absolute;
		top:50%;
		width: 100%;
		height:50px;
		margin-top: -25px;
		left: 0;
	}
	.gante-split-column div{
		width: 3px;
		height: 3px;
		border-radius: 50%;
		background: #00b0ff;
		margin: 3px auto;
	}
	.gante-split-liu-resize{
		position: absolute;
		top:0;
		width: 5px;
		background: #ccc;
		height: 100%;
	}
</style>
