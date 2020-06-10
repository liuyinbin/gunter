<template>
    <div class="task-drag-circle"
         :class="{active: dragInfo.mouseDown && dragInfo.taskId == current_data.gunter_id}"
         ref="drag_circle"
         :style="{transform: `translate3d(${left+'px'},-2px,0)`,opacity: current_data.is_hover ? 1 : 0}"
         @mousedown="dragDown"
         @mouseup="doc_up"
         @mouseleave="out_op"
         @mouseenter="enter">
        <span></span>
    </div>
</template>

<script>
    import { mapState,mapMutations } from 'vuex';
    import autoScroll from './auto-scroll';
    import commitEmit from './commit.js';
    export default {
        name: "gante-drag-circle",
        mixins:[autoScroll],
        props:{
            current_data: Object,
        },
        computed:{
            ...mapState([
               'dragInfo',
                'currentInfo'
            ]),
            left(){
                let _left = this.current_data.left ? this.current_data.left : 0,
                    _width = this.current_data.width ? this.current_data.width : 0;
                return _left + _width + 20
            }
        },
        data(){
            return{

            }
        },
        methods:{
            ...mapMutations([
                'SET_DASHLINE',
                'SET_DRAG_INFO',
                'SET_CURRENT_INFO'
            ]),
            // 按下拖动的圆点
            dragDown(e){
                if(this.current_data){
                    let _ganteview = document.getElementsByClassName('ganteview')[0],
                        c_x = Number(this.current_data.left) + Number(this.current_data.width) + 22,
                        c_y = e.target.getBoundingClientRect().top - _ganteview.getBoundingClientRect().top + 4,
                        scrollLeft = _ganteview.scrollLeft,
                        scrollTop = _ganteview.scrollTop

                    this.SET_DRAG_INFO({
                        data:{
                            mouseDown: true,
                            taskId: this.current_data.gunter_id,
                            right: Number(this.current_data.left) + Number(this.current_data.width),
                            offsetTop: this.$refs.drag_circle ? this.$refs.drag_circle.getBoundingClientRect().top : 0,
                            startData: {x: scrollLeft >0 ? e.target.getBoundingClientRect().left + scrollLeft : e.target.getBoundingClientRect().left,y: scrollTop > 0 ? e.target.getBoundingClientRect().top+ scrollTop : e.target.getBoundingClientRect().top}
                        },
                        mode: 2
                    })
                    this.SET_DASHLINE({
                        data:{
                            showLine: true,
                            left: c_x ,
                            top: c_y,
                            width: 0
                        },
                        mode: 2
                    });
                    document.addEventListener('mousemove',this.doc_move,{passive:false})
                    document.addEventListener('mouseup',this.doc_up,{passive:false});
                    e.preventDefault();
                }
            },
            doc_move(e){
                if(this.dragInfo.mouseDown){
                    let _ganteview = document.getElementsByClassName('ganteview')[0];
                    let _currentX = (e.clientX + _ganteview.scrollLeft)  - this.dragInfo.startData.x ,_currentY = (e.clientY + _ganteview.scrollTop)  - this.dragInfo.startData.y;
                    this.SET_DASHLINE({
                        data:{
                            width: Math.sqrt(Math.pow(Math.abs(_currentX),2)+Math.pow(Math.abs(_currentY),2)),
                            scale: Math.atan2((_currentY),_currentX)/0.017453292
                        },
                        mode: 2
                    });
                    this.autoScroll(e,_ganteview);
                }
            },
            doc_up(e){
                if(this.dragInfo.mouseDown){
                    if(this.currentInfo.taskId && this.currentInfo.before_id){
                        commitEmit.$emit('onBeforeDataChange',this.currentInfo.taskId, this.currentInfo.before_id,2)
                    }
                    this.SET_DRAG_INFO({
                        data:{},
                        mode: 1
                    })
                    this.SET_DASHLINE({
                        data:{},
                        mode: 1
                    });
                    this.SET_CURRENT_INFO({})
                    document.removeEventListener('mousemove',this.doc_move,false)
                    document.removeEventListener('mouseup',this.doc_up,false);
                    clearInterval(this.scrollFn);
                }
            },
            // 拖动时进入到当前元素上
            enter(e){
                if(!this.dragInfo.mouseDown) return;
                if(!this.dragInfo.startData) return;
                if(this.dragInfo.taskId == this.current_data.gunter_id) return;
                this.SET_CURRENT_INFO({ taskId: this.current_data.gunter_id,before_id: this.dragInfo.taskId})
            },
            out_op(){
                this.SET_CURRENT_INFO({})
            }
        }
    }
</script>

<style scoped lang="less">
    /*右边拖动的圆点*/
    .task-drag-circle {
        width: 10px;
        height: 10px;
        cursor: pointer;
        position: relative;
        transition: opacity .2s ease;
        span{
            position: absolute;
            width: 6px;
            height: 6px;
            border-radius: 3px;
            background: #7eabe8;
            transition: transform .1s ease;
        }
        &:hover span{
            transform: scale(1.3);
            background:#3396fb;
        }
        &.active{
            opacity: 1!important;

        }
    }
</style>
