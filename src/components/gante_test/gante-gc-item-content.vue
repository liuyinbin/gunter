<!--图表每个条块-->
<template>
    <div
        @mousemove.passive="showToast"
        @mouseleave="hideToast"
        @mousedown="dragDown($event,'drag')"
        :style="{
                    cursor: DragObject.mouseDown ? 'grabbing' : 'grab',
                    width:current_data.width?current_data.width+'px':0,
                    transform: `translate3d(${current_data.left?current_data.left+'px':0},10px,0)`,
                    transition: !DragObject.mouseDown ? 'width .5s linear, opacity .2s ease' : 'null',
                    background:current_data.bg_color?current_data.bg_color:'#00b0ff',
                    borderColor: current_data.bg_color ? `${current_data.bg_color} ${current_data.bg_color} transparent`: '#00b0ff #00b0ff transparent'}"
        class="ganteview-item" :class="{'has-child': current_data.children}">
        <span v-show="current_data.show_drag" @mousedown.stop="dragDown($event,'left')"  data-drag="true" class="left-drag-line"></span>
        <span v-show="current_data.show_drag" @mousedown.stop="dragDown($event,'right')" data-drag="true" class="right-drag-line"></span>
        <div  v-show="current_data.show_drag" data-drag="true" class="ganter_drag_hover"></div>
    </div>
</template>

<script>
    import myPublic from '../../../utils/public';
    import emitter from './commit'
    export default {
        name: "gante-gc-item-content",
        data(){
            return{
                requestId: '',
                canShow: false,// 是否可以显示toast ,为了防止触发了mouseout事件后立马触发showToast事件
                DragObject:{
                    startX: 0, // 开始的位置
                    mouseDown: false,// 是否按下了鼠标
                    scale: 0, // 刻度
                    mode: 1, // 默认以小时为单位 1:小时 2 ：天
                    start_width: 0,// 记录开始的宽度
                    start_left: 0,// 记录开始的宽度
                    start_time: null, // 记录开始拖动时的时间
                    end_time:null,  // 记录开始拖动时的时间
                    startAttr: null,// 开始时间的属性名
                    endAttr: null,// 结束时间的属性名
                    move_type: null, // 拖动的方式 left: 拖动左边时间 right: 拖动右边时间  drag： 拖动整体
                }
            }
        },
        props:{
            current_data: Object,
            th_data: Object,
            time_1px:Number, // 1px代表的时间
            time_mode:[Number,String],
            start_time: {}, //开始时间
            end_time: {},
        },
        methods:{
            showToast(e) {
                this.canShow = true;
                let animation = () => {
                    this.setMouseMode()
                    let  x = e.clientX + 15, y = e.clientY + 15
                    if(this.current_data && this.canShow){
                        if (this.current_data.params) {
                            let toast = document.createElement('div'), add_toast = true
                            toast.setAttribute('class', 'gante-toast-liu')
                            if (document.getElementsByClassName('gante-toast-liu')[0]) {
                                toast = document.getElementsByClassName('gante-toast-liu')[0];
                                toast.style.display = 'block';
                                add_toast = false;
                            }
                            let list = '';
                            for (let i in this.th_data) {
                                if (this.current_data.params[i] != undefined && (this.th_data[i].showToast || this.th_data[i].time_mode == 1 || this.th_data[i].time_mode == 2)) {
                                    list += `<p>${this.th_data[i].value}：${this.current_data.params[i]}</p>`;
                                }
                            }
                            if(toast.innerHTML != list || list == ''){
                                toast.innerHTML = list
                            }
                            //判断是否到了页面底部
                            if (toast.clientHeight + y > window.innerHeight) {
                                //鼠标的位置在toast的中间
                                if (e.clientY >= window.innerHeight - toast.clientHeight) {
                                    y = e.clientY - 10 - toast.clientHeight
                                } else {
                                    y = window.innerHeight - toast.clientHeight
                                }
                            }
                            if (toast.clientWidth + x > window.innerWidth) {
                                x = window.innerWidth - toast.clientWidth
                            }
                            toast.style.left = x + 'px'
                            toast.style.top = y + 'px'
                            if (add_toast) {
                                document.getElementsByTagName('body')[0].appendChild(toast)
                            }
                        }
                    }
                }
                this.requestId = requestAnimationFrame(animation)
            },
            // 设置鼠标样式
            setMouseMode(){
                if(!this.canShow){
                    return;
                }
                this.$set(this.current_data,'show_drag',true)
            },
            // 隐藏toast
            hideToast() {
                // 如果在拖动的情况下就不隐藏
                if(this.DragObject.mouseDown){
                    return;
                }
                this.canShow = false;
                this.$set(this.current_data,'show_drag',false)
                cancelAnimationFrame(this.requestId)
                if (document.getElementsByClassName('gante-toast-liu') && document.getElementsByClassName('gante-toast-liu').length > 0) {
                    document.getElementsByClassName('gante-toast-liu')[0].style.display = 'none';
                }
            },
            // 点击了准备拖动
            dragDown(e,type){
                if(this.current_data){
                    if(this.current_data.params){
                        console.log('this.current_data.params==',this.current_data.params)
                        this.DragObject.mouseDown = true;
                        this.DragObject.startX = e.clientX;
                        this.DragObject.move_type = type;
                        this.DragObject.start_width = this.current_data.width;
                        this.DragObject.start_left = this.current_data.left;
                        for (let i in this.th_data) {
                            if (this.current_data.params[i] != undefined) {
                                if(this.th_data[i].time_mode == 1){
                                    this.DragObject.startAttr = i;
                                    this.DragObject.start_time = this.current_data.params[i]
                                }
                                if(this.th_data[i].time_mode == 2){
                                    this.DragObject.endAttr = i;
                                    this.DragObject.end_time = this.current_data.params[i]
                                }
                            }
                        }
                        console.log(this.DragObject)
                        if(this.time_mode == 1 || this.time_mode == 2){
                            this.DragObject.scale = 1000*60*60/this.time_1px; // 以小时为单位
                            this.DragObject.mode = 1;
                        }else{
                            this.DragObject.scale = 1000*60*60*24/this.time_1px // 以天为单位
                            this.DragObject.mode = 2;
                        }
                        document.body.classList.add('unselecttable');
                        if(type == 'drag'){
                            document.body.style.cursor = 'grabbing';
                        }else {
                            document.body.style.cursor = 'e-resize';
                        }

                        document.addEventListener('mousemove',this.doc_move,{passive:false})
                        document.addEventListener('mouseup',this.doc_up,{passive:false})
                    }
                }
            },
            // 拖动时间
            doc_move(e){
                if(this.DragObject.mouseDown){
                    this.hideToast();
                    let move_mode_width = 0, // 宽度基值
                        move_mode_left = 0; // left基值
                    if(this.DragObject.move_type == 'left'){
                        document.body.style.cursor = 'e-resize';
                        if(e.clientX > this.DragObject.startX){
                            move_mode_width = -1;
                            move_mode_left = 1
                        }else if(e.clientX < this.DragObject.startX){
                            move_mode_width = 1;
                            move_mode_left = -1
                        }
                    }else if(this.DragObject.move_type == 'right'){
                        document.body.style.cursor = 'e-resize';
                        if(e.clientX > this.DragObject.startX){
                            move_mode_width = 1;
                        }else if(e.clientX < this.DragObject.startX){
                            move_mode_width = -1;
                        }
                    }else if(this.DragObject.move_type == 'drag'){
                        document.body.style.cursor = 'grabbing';
                        if(e.clientX > this.DragObject.startX){
                            move_mode_left = 1
                            move_mode_width = 1
                        }else if(e.clientX < this.DragObject.startX){
                            move_mode_left = -1
                            move_mode_width = -1
                        }
                    }
                    let moveX = Math.abs(e.clientX - this.DragObject.startX), // 移动的距离
                        move_unit = move_mode_width * (Math.ceil(moveX/this.DragObject.scale)), // 移动的时间
                        time_mode = 60*60*1000 // 时间类型
                    let start_time = this.DragObject.start_time,
                        end_time = this.DragObject.end_time

                    if(this.DragObject.mode == 2){
                        time_mode = 60*60*1000*24
                    }
                    if(this.DragObject.move_type == 'left'){
                        start_time = myPublic.dateFormat.format((new Date(myPublic.dateFormat.dateReplace(start_time)).getTime() - move_unit*time_mode),'YYYY-MM-DD HH:mm')
                    }else if(this.DragObject.move_type == 'right'){
                        end_time = myPublic.dateFormat.format((new Date(myPublic.dateFormat.dateReplace(end_time)).getTime() + move_unit*time_mode),'YYYY-MM-DD HH:mm')
                    }else{
                        console.log(start_time)
                        start_time = myPublic.dateFormat.format((new Date(myPublic.dateFormat.dateReplace(start_time)).getTime() + move_unit*time_mode),'YYYY-MM-DD HH:mm')
                        end_time = myPublic.dateFormat.format((new Date(myPublic.dateFormat.dateReplace(end_time)).getTime() + move_unit*time_mode),'YYYY-MM-DD HH:mm')
                    }
                    let move_width = this.DragObject.start_width + (moveX * move_mode_width), // 当前item的宽度
                        move_left = this.DragObject.start_left + (moveX * move_mode_left); // 当前item的left
                    //整体拖动时宽度是不变的
                    if(this.DragObject.move_type == 'drag'){
                        move_width = this.DragObject.start_width
                    }
                    // 设置最小宽度为10
                    if(move_width <= 10 && this.DragObject.move_type != 'drag'){
                        move_width = 10;
                        move_left = this.DragObject.start_left + ((this.DragObject.start_width - 10) * move_mode_left);
                        if(this.DragObject.move_type == 'left'){
                            start_time = myPublic.dateFormat.format((new Date(myPublic.dateFormat.dateReplace(end_time)).getTime() - (time_mode*(Math.ceil(10/this.DragObject.scale)))),'YYYY-MM-DD HH:mm')
                        }else if(this.DragObject.move_type == 'right'){
                            end_time = myPublic.dateFormat.format((new Date(myPublic.dateFormat.dateReplace(start_time)).getTime() + (time_mode*(Math.ceil(10/this.DragObject.scale)))),'YYYY-MM-DD HH:mm')
                        }
                    }
                    // 为了实时触发视图更新
                    delete(this.current_data.width);
                    delete(this.current_data.left);
                    this.$set(this.current_data,'width',move_width);
                    this.$set(this.current_data,'left',move_left);
                    this.$set(this.current_data.params,this.DragObject.startAttr,start_time);
                    this.$set(this.current_data.params,this.DragObject.endAttr,end_time);
                    this.$set(this.current_data,'start_time',new Date(myPublic.dateFormat.dateReplace(start_time)).getTime());
                    this.$set(this.current_data,'end_time',new Date(myPublic.dateFormat.dateReplace(end_time)).getTime());
                    // 触发toast时间更新
                    let toast = null;
                    if (document.getElementsByClassName('gante-toast-liu')[0]) {
                        toast = document.getElementsByClassName('gante-toast-liu')[0]
                        toast.style.display = 'block';
                        let list = ''
                        for (let i in this.th_data) {
                            if (this.current_data.params[i] != undefined && (this.th_data[i].showToast || this.th_data[i].time_mode == 1 || this.th_data[i].time_mode == 2)) {
                                list += `<p>${this.th_data[i].value}：${this.current_data.params[i]}</p>`
                            }
                        }
                        if(toast.innerHTML != list || list == ''){
                            toast.innerHTML = list
                        }
                    }
                }
            },
            // 取消拖动时间
            doc_up(e){
                if(this.current_data.start_time < this.start_time || this.current_data.end_time > this.end_time){

                    if(this.current_data.start_time < this.start_time){

                        emitter.$emit('triggerInit',this.current_data.start_time, this.end_time)
                    }
                    if(this.current_data.end_time > this.end_time){
                        emitter.$emit('triggerInit',this.start_time, this.current_data.end_time)
                    }
                }
                document.removeEventListener('mousemove',this.doc_move,false);
                document.removeEventListener('mouseup',this.doc_up,false);
                document.body.classList.remove('unselecttable');
                document.body.style.cursor = null;
                if(this.DragObject.startX != e.clientX){
                    emitter.$emit('onDragChangeTime',
                        {
                            gunter_id: this.current_data.gunter_id,
                            start_time: this.DragObject.start_time,
                            end_time: this.DragObject.end_time,
                            width: this.DragObject.start_width,
                            left: this.DragObject.start_left,
                            startAttr: this.DragObject.startAttr,
                            endAttr: this.DragObject.endAttr,
                        },
                        {start:this.current_data.params[this.DragObject.startAttr],end:this.current_data.params[this.DragObject.endAttr],gunter_id: this.current_data.gunter_id});
                }
                this.DragObject = {
                    startX: 0, // 开始的位置
                    mouseDown: false,// 是否按下了鼠标
                    scale: 0, // 刻度
                    mode: 1, // 默认以小时为单位 1:小时 2 ：天
                    start_width: 0,// 记录开始的宽度
                    start_left: 0,// 记录开始的宽度
                    start_time: null, // 记录开始拖动时的时间
                    end_time:null,  // 记录开始拖动时的时间
                    startAttr: null,// 开始时间的属性名
                    endAttr: null,// 结束时间的属性名
                    move_type: null,
                };
                this.hideToast();
            }
        }
    }
</script>

<style scoped lang="less">
    .ganteview-item {
        height: 20px;
        border-radius: 3px;
        background: #00b0ff;
        cursor: grab;
        width: 0;
        /*transition: width .5s linear, opacity .2s ease;*/
        opacity: 0.5;
        .left-drag-line,.right-drag-line{
            position: absolute;
            left: -15px;
            height: 26px;
            width: 15px;
            top: 2px;
            margin-top: -5px;
            cursor: e-resize;
            &:hover:after{
                border-color: #3396fb;
            }
            &:after{
                position: absolute;
                content: '';
                left: 6px;
                top:8px;
                width: 2px;
                height: 10px;
                border-left: 1px solid rgba(0,0,0,0.5);
                border-right: 1px solid rgba(0,0,0,0.5);
            }
        }
        /* 左边显示的时间 */
        .time-tip-left{
            position: absolute;
            left: -85px;
            width: 67px;
            height: 15px;
            line-height: 15px;
            padding: 3px 4px;
            border-radius: 3px;
            background: #333;
            color: #fff;
            font-size: 12px;
        }
        .right-drag-line{
            right: -15px;
            left: auto;
        }
        .ganter_drag_hover{
            position: absolute;
            left: -15px;
            height: 26px;
            width: ~'calc(100% + 30px)';
            top: -3px;
            z-index: -1;
            box-shadow: 1px 1px 3px 1px rgba(0,0,0,0.2);
            border-radius: 3px;
        }
        &:hover{
            .left-drag-line,.right-drag-line,.ganter_drag_hover{
                display: block;
            }
        }
    }

    .ganteview-item:hover {
        opacity: 1;
    }

    .ganteview-item.has-child {
        height: 15px;
        background: none!important;
        border-style: solid;
        border-width: 10px 5px 10px;
        border-top-left-radius: 2px;
        border-top-right-radius: 2px;
        box-sizing: border-box;
        .left-drag-line,.right-drag-line{
            left: -17px;
            top: -10px;
            &:after{
                left: 4px;
            }
        }
        .right-drag-line{
            right: -17px;
            left: auto;
            &:after{
                left: 6px;
            }
        }
        .ganter_drag_hover{
            top: -15px;
            width: calc(100% + 34px);
            left: -17px;
        }
        .time-tip-left{
            top: -12px;
        }
    }
</style>
